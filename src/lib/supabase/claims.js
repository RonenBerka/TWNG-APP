/**
 * Claims service — adapted for new Lovable schema.
 * Table: ownership_claims (was guitar_claims)
 * Instruments table: instruments (was guitars)
 * Fields: make (was brand), current_owner_id (was owner_id)
 */

import { supabase } from './client';

const CLAIM_SELECT = `
  *,
  instrument:instruments (
    id, make, model, year, serial_number, current_owner_id, is_claimable
  ),
  claimer:users!claimer_id (
    id, username, avatar_url
  ),
  reviewer:users!reviewed_by (
    id, username
  )
`;

/**
 * Get claims for admin management with optional filters.
 */
export async function getAdminClaims({
  status,
  search,
  page = 1,
  perPage = 20,
} = {}) {
  try {
    let query = supabase
      .from('ownership_claims')
      .select(CLAIM_SELECT, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      data: data || [],
      count: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    };
  } catch (error) {
    console.error('Error fetching admin claims:', error);
    return { data: [], count: 0, page, perPage, totalPages: 0, error };
  }
}

/**
 * Approve a claim (admin-only).
 */
export async function approveClaim(claimId, adminId) {
  try {
    const { data: claim, error: fetchError } = await supabase
      .from('ownership_claims')
      .select('id, instrument_id, claimer_id')
      .eq('id', claimId)
      .single();

    if (fetchError || !claim) throw fetchError || new Error('Claim not found');

    const { error: claimError } = await supabase
      .from('ownership_claims')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (claimError) throw claimError;

    const { error: instrumentError } = await supabase
      .from('instruments')
      .update({
        current_owner_id: claim.claimer_id,
        is_claimable: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claim.instrument_id);

    if (instrumentError) throw instrumentError;

    // Notification
    await supabase.from('notifications').insert({
      user_id: claim.claimer_id,
      type: 'claim_approved',
      title: 'Your ownership claim was approved!',
      body: `Your claim has been approved. You are now the registered owner.`,
      data: { claim_id: claimId, instrument_id: claim.instrument_id },
      is_read: false,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error approving claim:', error);
    return { success: false, error };
  }
}

/**
 * Reject a claim (admin-only).
 */
export async function rejectClaim(claimId, adminId, reason) {
  try {
    const { data: claim, error: fetchError } = await supabase
      .from('ownership_claims')
      .select('id, claimer_id, instrument_id')
      .eq('id', claimId)
      .single();

    if (fetchError || !claim) throw fetchError || new Error('Claim not found');

    const { error: claimError } = await supabase
      .from('ownership_claims')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (claimError) throw claimError;

    await supabase.from('notifications').insert({
      user_id: claim.claimer_id,
      type: 'claim_denied',
      title: 'Your ownership claim was not approved',
      body: `Reason: ${reason || 'No reason provided'}`,
      data: { claim_id: claimId, instrument_id: claim.instrument_id, reason },
      is_read: false,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error rejecting claim:', error);
    return { success: false, error };
  }
}

/**
 * Get claim statistics.
 */
export async function getClaimStats() {
  try {
    const statuses = ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'];
    const stats = { total: 0 };

    const { count: total } = await supabase
      .from('ownership_claims')
      .select('id', { count: 'exact', head: true });

    stats.total = total || 0;

    for (const statusVal of statuses) {
      const { count } = await supabase
        .from('ownership_claims')
        .select('id', { count: 'exact', head: true })
        .eq('status', statusVal);
      stats[statusVal] = count || 0;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching claim stats:', error);
    return { total: 0, pending: 0, under_review: 0, approved: 0, rejected: 0, withdrawn: 0 };
  }
}

/**
 * Mark an instrument as claimable (admin-only).
 */
export async function markGuitarClaimable(instrumentId, claimable = true) {
  try {
    const { data, error } = await supabase
      .from('instruments')
      .update({
        is_claimable: claimable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', instrumentId)
      .select('id, is_claimable')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating instrument claimable status:', error);
    return { data: null, error };
  }
}
