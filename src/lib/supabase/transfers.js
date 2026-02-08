import { supabase } from './client';

/**
 * Ownership transfer service — CRUD for ownership_transfers table.
 *
 * Transfer types:
 *   to_member   — Transfer to another TWNG user (requires acceptance)
 *   outside_twng — Mark guitar as transferred outside the platform
 *   delete      — Archive the guitar (soft delete)
 *
 * Status flow:
 *   to_member:    pending → accepted → completed | declined | cancelled | expired
 *   outside_twng: pending → completed (after cancel deadline) | cancelled
 *   delete:       pending → completed
 */

/**
 * Initiate a transfer.
 */
export async function initiateTransfer({
  guitarId,
  toUserId = null,
  transferType = 'to_member',
  privacyOverrides = {},
  acceptDeadlineDays = 7,
  cancelDeadlineDays = 1,
}) {
  const now = new Date();
  const acceptDeadline = new Date(now);
  acceptDeadline.setDate(acceptDeadline.getDate() + acceptDeadlineDays);
  const cancelDeadline = new Date(now);
  cancelDeadline.setDate(cancelDeadline.getDate() + cancelDeadlineDays);

  const { data, error } = await supabase
    .from('ownership_transfers')
    .insert({
      ie_id: guitarId,
      to_user_id: toUserId,
      transfer_type: transferType,
      privacy_overrides: privacyOverrides,
      status: 'pending',
      accept_deadline: transferType === 'to_member' ? acceptDeadline.toISOString() : null,
      cancel_deadline: transferType === 'outside_twng' ? cancelDeadline.toISOString() : null,
    })
    .select(`
      *,
      guitar:guitars!ie_id ( id, brand, model, year, serial_number ),
      to_user:users!to_user_id ( id, username, display_name )
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept a pending transfer (to_member only).
 */
export async function acceptTransfer(transferId) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({ status: 'accepted' })
    .eq('id', transferId)
    .eq('status', 'pending')
    .eq('transfer_type', 'to_member')
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Decline a pending transfer.
 */
export async function declineTransfer(transferId, reason = null) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'declined',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', transferId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel a transfer (by the sender).
 */
export async function cancelTransfer(transferId, reason = null) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', transferId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete a transfer — updates guitar ownership.
 * In production this would be a DB function; for now, client-side orchestration.
 */
export async function completeTransfer(transferId) {
  // Get the transfer details
  const { data: transfer, error: fetchErr } = await supabase
    .from('ownership_transfers')
    .select('*')
    .eq('id', transferId)
    .single();

  if (fetchErr) throw fetchErr;

  // Update guitar ownership
  if (transfer.to_user_id) {
    const { error: guitarErr } = await supabase
      .from('guitars')
      .update({ owner_id: transfer.to_user_id })
      .eq('id', transfer.ie_id);

    if (guitarErr) throw guitarErr;
  }

  // Mark transfer completed
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', transferId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch transfers for the current user (both incoming and outgoing).
 */
export async function getMyTransfers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Outgoing
  const { data: outgoing, error: outErr } = await supabase
    .from('ownership_transfers')
    .select(`
      *,
      guitar:guitars!ie_id ( id, brand, model, year ),
      to_user:users!to_user_id ( id, username, display_name )
    `)
    .eq('from_user_id', user.id)
    .order('created_at', { ascending: false });

  if (outErr) throw outErr;

  // Incoming
  const { data: incoming, error: inErr } = await supabase
    .from('ownership_transfers')
    .select(`
      *,
      guitar:guitars!ie_id ( id, brand, model, year ),
      from_user:users!from_user_id ( id, username, display_name )
    `)
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false });

  if (inErr) throw inErr;

  return { outgoing: outgoing || [], incoming: incoming || [] };
}

/**
 * Check-on-read: auto-expire transfers past their deadline.
 * Safe to call repeatedly (idempotent) and fails silently if RLS blocks the update.
 */
export async function expireOverdueTransfers() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'expired',
      updated_at: now,
    })
    .eq('status', 'pending')
    .lt('accept_deadline', now)
    .not('accept_deadline', 'is', null)
    .select();

  if (error) {
    console.warn('Failed to expire overdue transfers:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Search for a TWNG user by username or display name (for recipient picker).
 */
export async function searchUsers(query) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data || [];
}
