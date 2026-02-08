import { supabase } from './client';

/**
 * Guitar claims service — CRUD operations and admin management for guitar_claims.
 * Handles claim submission, review, approval/rejection, and related updates.
 */

// Base select for claim queries — includes guitar, claimer, and reviewer info
const CLAIM_SELECT = `
  *,
  guitar:guitars (
    id, brand, model, year, serial_number, owner_id, is_claimable
  ),
  claimer:users!claimer_id (
    id, username, display_name, email, avatar_url
  ),
  reviewer:users!reviewed_by (
    id, username, display_name
  )
`;

// ─── GET CLAIMS (Admin) ────────────────────────────────────
/**
 * Fetch claims with optional filters for admin management.
 * Returns paginated claims with all joined data.
 */
export async function getAdminClaims({
  status,
  search,
  page = 1,
  perPage = 20,
} = {}) {
  try {
    let query = supabase
      .from('guitar_claims')
      .select(CLAIM_SELECT, { count: 'exact' });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Search by guitar brand/model or claimer username
    if (search) {
      query = query.or(
        `guitar->brand.ilike.%${search}%,guitar->model.ilike.%${search}%,claimer->username.ilike.%${search}%`
      );
    }

    // Order by created_at DESC
    query = query.order('created_at', { ascending: false });

    // Pagination
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

// ─── GET SINGLE CLAIM ──────────────────────────────────────
/**
 * Fetch a single claim by ID with all joined data.
 */
export async function getClaim(claimId) {
  try {
    const { data, error } = await supabase
      .from('guitar_claims')
      .select(CLAIM_SELECT)
      .eq('id', claimId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching claim:', error);
    return null;
  }
}

// ─── GET CLAIMS FOR GUITAR ─────────────────────────────────
/**
 * Fetch all claims for a specific guitar, ordered by created_at DESC.
 */
export async function getClaimsForGuitar(guitarId) {
  try {
    const { data, error } = await supabase
      .from('guitar_claims')
      .select(CLAIM_SELECT)
      .eq('guitar_id', guitarId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching claims for guitar:', error);
    return [];
  }
}

// ─── GET MY CLAIMS ─────────────────────────────────────────
/**
 * Fetch all claims submitted by the current user, with guitar data.
 */
export async function getMyClaims(userId) {
  try {
    const { data, error } = await supabase
      .from('guitar_claims')
      .select(CLAIM_SELECT)
      .eq('claimer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user claims:', error);
    return [];
  }
}

// ─── SUBMIT CLAIM ──────────────────────────────────────────
/**
 * Insert a new claim for a guitar.
 * verificationType: 'instagram_match' | 'serial_photo' | 'receipt' | 'luthier_vouch' | 'other'
 * verificationData: { instagram_handle?, serial_photo_url?, receipt_url?, notes? }
 */
export async function submitClaim({
  guitarId,
  claimerId,
  verificationType,
  verificationData = {},
  claimReason,
}) {
  try {
    const { data, error } = await supabase
      .from('guitar_claims')
      .insert({
        guitar_id: guitarId,
        claimer_id: claimerId,
        status: 'pending',
        verification_type: verificationType,
        verification_data: verificationData,
        claim_reason: claimReason,
        created_at: new Date().toISOString(),
      })
      .select(CLAIM_SELECT)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error submitting claim:', error);
    return { data: null, error };
  }
}

// ─── WITHDRAW CLAIM ────────────────────────────────────────
/**
 * Withdraw a claim (update status to 'withdrawn').
 * Only the claimer can withdraw their own claim.
 */
export async function withdrawClaim(claimId, claimerId) {
  try {
    const { data, error } = await supabase
      .from('guitar_claims')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .eq('claimer_id', claimerId)
      .select(CLAIM_SELECT)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error withdrawing claim:', error);
    return { data: null, error };
  }
}

// ─── APPROVE CLAIM (Admin) ─────────────────────────────────
/**
 * Approve a claim (admin-only).
 * 1. Update claim: status='approved', reviewed_by=adminId, reviewed_at=NOW()
 * 2. Update guitar: owner_id=claimer_id, is_claimable=false
 * 3. Create notification for claimer
 * 4. Log to audit_log
 */
export async function approveClaim(claimId, adminId) {
  try {
    // 1. Fetch the claim to get guitar_id and claimer_id
    const claim = await getClaim(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    const { guitar_id: guitarId, claimer_id: claimerId } = claim;

    // 2. Update claim status
    const { error: claimError } = await supabase
      .from('guitar_claims')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (claimError) throw claimError;

    // 3. Update guitar owner
    const { error: guitarError } = await supabase
      .from('guitars')
      .update({
        owner_id: claimerId,
        is_claimable: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guitarId);

    if (guitarError) throw guitarError;

    // 4. Create notification for claimer
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: claimerId,
        type: 'claim_approved',
        title: 'Your guitar claim was approved!',
        message: `Your claim for guitar ID ${guitarId} has been approved. You are now the owner.`,
        related_id: claimId,
        read: false,
        created_at: new Date().toISOString(),
      });

    if (notifError) console.warn('Notification creation failed:', notifError);

    // 5. Log to audit_log
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        action: 'claim_approved',
        admin_id: adminId,
        target_id: claimId,
        target_type: 'guitar_claim',
        details: { guitar_id: guitarId, claimer_id: claimerId },
        created_at: new Date().toISOString(),
      });

    if (auditError) console.warn('Audit log failed:', auditError);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error approving claim:', error);
    return { success: false, error };
  }
}

// ─── REJECT CLAIM (Admin) ──────────────────────────────────
/**
 * Reject a claim (admin-only).
 * 1. Update claim: status='rejected', reviewed_by=adminId, reviewed_at=NOW(), rejection_reason=reason
 * 2. Create notification for claimer
 * 3. Log to audit_log
 */
export async function rejectClaim(claimId, adminId, reason) {
  try {
    // 1. Fetch the claim to get claimer_id
    const claim = await getClaim(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    const { claimer_id: claimerId, guitar_id: guitarId } = claim;

    // 2. Update claim status
    const { error: claimError } = await supabase
      .from('guitar_claims')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    if (claimError) throw claimError;

    // 3. Create notification for claimer
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: claimerId,
        type: 'claim_rejected',
        title: 'Your guitar claim was rejected',
        message: `Your claim for guitar ID ${guitarId} was not approved. Reason: ${reason}`,
        related_id: claimId,
        read: false,
        created_at: new Date().toISOString(),
      });

    if (notifError) console.warn('Notification creation failed:', notifError);

    // 4. Log to audit_log
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        action: 'claim_rejected',
        admin_id: adminId,
        target_id: claimId,
        target_type: 'guitar_claim',
        details: { guitar_id: guitarId, claimer_id: claimerId, reason },
        created_at: new Date().toISOString(),
      });

    if (auditError) console.warn('Audit log failed:', auditError);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error rejecting claim:', error);
    return { success: false, error };
  }
}

// ─── GET CLAIM STATS ───────────────────────────────────────
/**
 * Returns aggregated claim statistics: { total, pending, approved, rejected, withdrawn }
 */
export async function getClaimStats() {
  try {
    const statuses = ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'];
    const stats = { total: 0 };

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('guitar_claims')
      .select('id', { count: 'exact', head: true });

    if (totalError) throw totalError;
    stats.total = total || 0;

    // Get counts by status
    for (const statusVal of statuses) {
      const { count, error: err } = await supabase
        .from('guitar_claims')
        .select('id', { count: 'exact', head: true })
        .eq('status', statusVal);

      if (!err) {
        stats[statusVal] = count || 0;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error fetching claim stats:', error);
    return {
      total: 0,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0,
    };
  }
}

// ─── GET CLAIMABLE GUITARS ─────────────────────────────────
/**
 * Fetch guitars where is_claimable = true OR owner_id IS NULL.
 * Join with existing claims to show claim count.
 * Filter by search (brand/model) and brand.
 */
export async function getClaimableGuitars({
  search,
  brand,
  page = 1,
  perPage = 20,
} = {}) {
  try {
    let query = supabase
      .from('guitars')
      .select(
        `
        *,
        owner:users!owner_id (
          id, username, display_name, avatar_url
        ),
        claims:guitar_claims (
          id, status
        )
      `,
        { count: 'exact' }
      )
      .or('is_claimable.eq.true,owner_id.is.null')
      .eq('state', 'published')
      .is('deleted_at', null);

    // Filter by brand
    if (brand) {
      query = query.ilike('brand', `%${brand}%`);
    }

    // Search by brand/model
    if (search) {
      query = query.or(
        `brand.ilike.%${search}%,model.ilike.%${search}%`
      );
    }

    // Sort and paginate
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
    console.error('Error fetching claimable guitars:', error);
    return { data: [], count: 0, page, perPage, totalPages: 0, error };
  }
}

// ─── MARK GUITAR CLAIMABLE (Admin) ────────────────────────
/**
 * Update a guitar's is_claimable status (admin-only).
 */
export async function markGuitarClaimable(guitarId, claimable = true) {
  try {
    const { data, error } = await supabase
      .from('guitars')
      .update({
        is_claimable: claimable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guitarId)
      .select('id, is_claimable')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating guitar claimable status:', error);
    return { data: null, error };
  }
}

// ─── CHECK IF USER HAS PENDING CLAIM ──────────────────────
/**
 * Check if a user has a pending or under_review claim for a specific guitar.
 * Returns boolean.
 */
export async function hasPendingClaim(userId, guitarId) {
  try {
    const { count, error } = await supabase
      .from('guitar_claims')
      .select('id', { count: 'exact', head: true })
      .eq('claimer_id', userId)
      .eq('guitar_id', guitarId)
      .in('status', ['pending', 'under_review']);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error) {
    console.error('Error checking pending claim:', error);
    return false;
  }
}
