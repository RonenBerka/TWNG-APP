import { supabase } from './client';

/**
 * Ownership transfer service — CRUD for ownership_transfers table.
 *
 * Status flow: pending → accepted/rejected → completed
 *
 * Schema changes from previous version:
 * - ie_id → instrument_id
 * - from_user_id → from_owner_id
 * - to_user_id → to_owner_id
 * - Removed: transfer_type, accept_deadline, cancel_deadline, privacy_overrides columns
 * - Renamed: cancellation_reason → rejection_reason
 * - Added: transfer_date, accepted_at, completed_at, rejected_at fields
 */

/**
 * Initiate a transfer to another owner.
 *
 * @param {Object} params - Transfer parameters
 * @param {string} params.instrumentId - Instrument UUID
 * @param {string} params.fromOwnerId - Current owner UUID (optional, can be null for new registrations)
 * @param {string} params.toOwnerId - Target owner UUID
 * @param {string} params.transferDate - Date of transfer (default: today)
 * @param {string} params.transferNotes - Optional notes about the transfer
 */
export async function initiateTransfer({
  instrumentId,
  fromOwnerId = null,
  toOwnerId,
  transferDate = new Date().toISOString().split('T')[0],
  transferNotes = null,
}) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .insert({
      instrument_id: instrumentId,
      from_owner_id: fromOwnerId,
      to_owner_id: toOwnerId,
      transfer_date: transferDate,
      transfer_notes: transferNotes,
      status: 'pending',
    })
    .select(`
      *,
      instrument:instrument_id ( id, make, model, year, serial_number ),
      to_owner:to_owner_id ( id, username )
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept a pending transfer.
 */
export async function acceptTransfer(transferId) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', transferId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject a pending transfer.
 *
 * @param {string} transferId - Transfer UUID
 * @param {string} reason - Optional rejection reason
 */
export async function rejectTransfer(transferId, reason = null) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
    })
    .eq('id', transferId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a transfer as cancelled (before completion).
 *
 * @param {string} transferId - Transfer UUID
 * @param {string} reason - Optional cancellation reason
 */
export async function cancelTransfer(transferId, reason = null) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .update({
      status: 'cancelled',
      rejection_reason: reason,
    })
    .eq('id', transferId)
    .in('status', ['pending', 'accepted'])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Complete a transfer — marks it as completed and updates instrument ownership.
 * This should typically be called by a database trigger or admin function.
 */
export async function completeTransfer(transferId) {
  // Get the transfer details
  const { data: transfer, error: fetchErr } = await supabase
    .from('ownership_transfers')
    .select('*')
    .eq('id', transferId)
    .single();

  if (fetchErr) throw fetchErr;

  // Update instrument ownership
  if (transfer.to_owner_id) {
    const { error: instrumentErr } = await supabase
      .from('instruments')
      .update({ current_owner_id: transfer.to_owner_id })
      .eq('id', transfer.instrument_id);

    if (instrumentErr) throw instrumentErr;
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

  // Outgoing transfers (user as from_owner_id)
  const { data: outgoing, error: outErr } = await supabase
    .from('ownership_transfers')
    .select(`
      *,
      instrument:instrument_id ( id, make, model, year ),
      to_owner:to_owner_id ( id, username )
    `)
    .eq('from_owner_id', user.id)
    .order('created_at', { ascending: false });

  if (outErr) throw outErr;

  // Incoming transfers (user as to_owner_id)
  const { data: incoming, error: inErr } = await supabase
    .from('ownership_transfers')
    .select(`
      *,
      instrument:instrument_id ( id, make, model, year ),
      from_owner:from_owner_id ( id, username )
    `)
    .eq('to_owner_id', user.id)
    .order('created_at', { ascending: false });

  if (inErr) throw inErr;

  return { outgoing: outgoing || [], incoming: incoming || [] };
}

/**
 * Get a single transfer by ID.
 */
export async function getTransfer(transferId) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .select(`
      *,
      instrument:instrument_id ( id, make, model, year ),
      from_owner:from_owner_id ( id, username ),
      to_owner:to_owner_id ( id, username )
    `)
    .eq('id', transferId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Search for a TWNG user by username (for recipient picker).
 */
export async function searchUsers(query) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url')
    .ilike('username', `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Legacy alias for rejectTransfer.
 * Decline a pending transfer.
 */
export async function declineTransfer(transferId, reason = null) {
  return rejectTransfer(transferId, reason);
}

/**
 * Expire overdue transfers (mark as expired if past deadline).
 * This is a placeholder for legacy compatibility.
 */
export async function expireOverdueTransfers() {
  // Legacy stub - no longer used with new schema
  return { success: true, expired: [] };
}

// ============================================================================
// BARREL FILE COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Alias for getTransfer — fetch transfer details by ID.
 */
export async function getTransferDetails(transferId) {
  return getTransfer(transferId);
}

/**
 * Respond to a pending transfer (accept or reject).
 * @param {string} transferId - Transfer UUID
 * @param {string} response - 'accept' or 'reject'
 * @param {string} reason - Optional rejection reason
 */
export async function respondToTransfer(transferId, response, reason = null) {
  if (response === 'accept') {
    return acceptTransfer(transferId);
  } else if (response === 'reject') {
    return rejectTransfer(transferId, reason);
  } else {
    throw new Error(`Invalid response: ${response}. Must be 'accept' or 'reject'.`);
  }
}

/**
 * Fetch transfer history for an instrument.
 * @param {string} instrumentId - Instrument UUID
 * @returns {Promise<Array>} Array of past transfers for the instrument
 */
export async function getTransferHistory(instrumentId) {
  const { data, error } = await supabase
    .from('ownership_transfers')
    .select(`
      *,
      from_owner:from_owner_id ( id, username ),
      to_owner:to_owner_id ( id, username )
    `)
    .eq('instrument_id', instrumentId)
    .in('status', ['completed', 'rejected', 'cancelled'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
