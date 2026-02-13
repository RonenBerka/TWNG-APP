/**
 * Admin service layer — Supabase queries for all admin console sections.
 * Updated for Lovable schema migration:
 * - guitars → instruments
 * - luthier_profiles → users with is_luthier=true
 * - system_config → system_settings
 * - user roles via user_roles table + has_role() function
 * RLS policies grant admin/super_admin access to these tables.
 */

import { supabase } from './client';

// ─────────────────────────────────────────────────────
// HOMEPAGE BLOCK TYPE MAPPING
// DB (Lovable schema) uses: featured, recently_added, explore_brands
// Frontend uses: featured_instruments, recent_instruments, explore_makes
// ─────────────────────────────────────────────────────
const DB_TO_FRONTEND = {
  featured: 'featured_instruments',
  recently_added: 'recent_instruments',
  explore_brands: 'explore_makes',
};
const FRONTEND_TO_DB = Object.fromEntries(
  Object.entries(DB_TO_FRONTEND).map(([k, v]) => [v, k])
);
export const mapDbTypeToFrontend = (t) => DB_TO_FRONTEND[t] || t;
export const mapFrontendTypeToDb = (t) => FRONTEND_TO_DB[t] || t;

// ─────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [usersRes, instrumentsRes, collectionsRes, articlesRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('instruments').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('collections').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalInstruments: instrumentsRes.count ?? 0,
    totalCollections: collectionsRes.count ?? 0,
    totalArticles: articlesRes.count ?? 0,
  };
}

// ─────────────────────────────────────────────────────
// INSTRUMENTS (formerly guitars)
// ─────────────────────────────────────────────────────

export async function getAdminInstruments({
  search = '',
  moderation_status = '',
  make = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('instruments')
    .select('*, current_owner:users!current_owner_id (id, username, avatar_url), uploader:users!uploader_id (id, username)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%`);
  }
  if (moderation_status) {
    query = query.eq('moderation_status', moderation_status);
  }
  if (make) {
    query = query.ilike('make', make);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { instruments: data || [], total: count || 0 };
}

export async function updateInstrumentModerationStatus(instrumentId, newStatus, notes = '') {
  const { data, error } = await supabase
    .from('instruments')
    .update({
      moderation_status: newStatus,
      moderation_notes: notes,
      moderated_at: new Date().toISOString(),
      moderated_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .eq('id', instrumentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function adminDeleteInstrument(instrumentId) {
  const { data, error } = await supabase
    .from('instruments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', instrumentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// LUTHIERS (users with is_luthier = true)
// ─────────────────────────────────────────────────────

export async function getAdminLuthiers({
  search = '',
  verified = null,
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('users')
    .select('id, username, avatar_url, is_verified, is_luthier, created_at', { count: 'exact' })
    .eq('is_luthier', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    query = query.ilike('username', `%${search}%`);
  }

  if (verified === true) {
    query = query.eq('is_verified', true);
  } else if (verified === false) {
    query = query.eq('is_verified', false);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { luthiers: data || [], total: count || 0 };
}

export async function verifyLuthier(userId) {
  const { data, error } = await supabase
    .from('users')
    .update({
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// SYSTEM SETTINGS
// ─────────────────────────────────────────────────────

export async function getSystemSettings(key = null) {
  if (key) {
    // READ by key — setting may not exist
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  }

  // Fetch all settings
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('setting_key');

  if (error) throw error;

  // Convert array to key-value map for easy access
  const settingsMap = {};
  (data || []).forEach(row => {
    settingsMap[row.setting_key] = row;
  });
  return settingsMap;
}

export async function updateSystemSetting(settingKey, settingValue, userId) {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({
      setting_key: settingKey,
      setting_value: typeof settingValue === 'object' ? settingValue : { value: settingValue },
      updated_at: new Date().toISOString(),
      updated_by_user_id: userId,
    }, { onConflict: 'setting_key' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// CONTENT MODERATION
// ─────────────────────────────────────────────────────

export async function getAdminArticles({
  status = '',
  search = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('articles')
    .select('*, author:users!author_id (id, username, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { articles: data || [], total: count || 0 };
}

export async function updateArticleStatus(articleId, newStatus) {
  const updates = { status: newStatus };
  if (newStatus === 'published') {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', articleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAdminForumThreads({
  is_locked = null,
  search = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('forum_threads')
    .select('*, author:users!author_id (id, username, avatar_url), category:forum_categories!category_id (id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (is_locked !== null) {
    query = query.eq('is_locked', is_locked);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { threads: data || [], total: count || 0 };
}

export async function toggleThreadLocked(threadId, isLocked) {
  const { data, error } = await supabase
    .from('forum_threads')
    .update({
      is_locked: isLocked,
    })
    .eq('id', threadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// TRANSFERS
// ─────────────────────────────────────────────────────

export async function getAdminTransfers({
  status = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('ownership_transfers')
    .select(`
      *,
      instrument:instruments!instrument_id (id, make, model, serial_number),
      from_user:users!from_owner_id (id, username, avatar_url),
      to_user:users!to_owner_id (id, username, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { transfers: data || [], total: count || 0 };
}

export async function updateTransferStatus(transferId, newStatus) {
  const updates = { status: newStatus };
  if (newStatus === 'completed') {
    updates.completed_at = new Date().toISOString();
  }
  if (newStatus === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('ownership_transfers')
    .update(updates)
    .eq('id', transferId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// HOMEPAGE BLOCKS
// ─────────────────────────────────────────────────────

export async function getHomepageBlocks() {
  // Use RPC to bypass PostgREST stale schema cache (see migration 019).
  // Falls back to direct table query if the function doesn't exist yet.
  const { data, error } = await supabase.rpc('get_homepage_blocks');

  if (error) {
    // Fallback: RPC function not created yet — use direct query
    if (error.code === '42883') {
      const fallback = await supabase
        .from('homepage_blocks')
        .select('*')
        .order('display_order', { ascending: true });
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map(b => ({ ...b, type: mapDbTypeToFrontend(b.type) }));
    }
    throw error;
  }
  // Map DB enum types → frontend type names
  return (data || []).map(b => ({ ...b, type: mapDbTypeToFrontend(b.type) }));
}

export async function createHomepageBlock(block, userId) {
  const { data, error } = await supabase
    .from('homepage_blocks')
    .insert({
      ...block,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHomepageBlock(blockId, updates, userId) {
  const { data, error } = await supabase
    .from('homepage_blocks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', blockId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHomepageBlock(blockId) {
  const { error } = await supabase
    .from('homepage_blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw error;
  return true;
}

export async function reorderHomepageBlocks(blockOrders) {
  // blockOrders: [{ id, display_order }, ...]
  const updates = blockOrders.map(({ id, display_order }) => ({
    id,
    display_order,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('homepage_blocks')
    .upsert(updates, { onConflict: 'id' });

  if (error) throw error;
  return true;
}

// ─────────────────────────────────────────────────────
// NOTIFICATIONS (for admin header bell)
// ─────────────────────────────────────────────────────

export async function getUnreadNotificationCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

// ─────────────────────────────────────────────────────
// LEGACY ALIASES & STUBS FOR ADMIN.JSX COMPATIBILITY
// ─────────────────────────────────────────────────────

export { getAdminInstruments as getAdminGuitars };
export { updateInstrumentModerationStatus as updateGuitarState };
export { adminDeleteInstrument as adminDeleteGuitar };
export { getSystemSettings as getSystemConfig };
export { updateSystemSetting as updateSystemConfig };
export { getAdminForumThreads as getAdminDiscussions };
export { toggleThreadLocked as toggleDiscussionHidden };
/**
 * Save homepage blocks — updates existing rows by DB type.
 * Uses the `type` column (mapped to DB enum) instead of `id`, because
 * PostgREST may not return all rows on SELECT (stale schema cache),
 * leaving blocks without their DB UUID. UPDATE by type still works
 * because the rows exist and we're not changing the type column.
 * @param {Array} blocks - [{type, title, status, ...}, ...]
 * @param {string} userId - current admin user id (for audit)
 */
export async function saveHomepageBlocks(blocks, userId) {
  try {
    const failures = [];

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b.type) continue;
      const dbType = mapFrontendTypeToDb(b.type);

      // Use RPC to bypass PostgREST stale schema cache (see migration 019)
      const { error } = await supabase.rpc('update_homepage_block_by_type', {
        p_type: dbType,
        p_title: b.title,
        p_is_active: b.status === 'active',
        p_display_order: i + 1,
      });

      if (error) {
        // Fallback: RPC not available, try direct UPDATE
        if (error.code === '42883') {
          const fb = await supabase
            .from('homepage_blocks')
            .update({
              title: b.title,
              is_active: b.status === 'active',
              display_order: i + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('type', dbType);
          if (fb.error) failures.push({ type: b.type, message: fb.error.message });
        } else {
          failures.push({ type: b.type, message: error.message });
        }
      }
    }

    if (failures.length > 0) {
      const detail = failures.map(f => `${f.type}: ${f.message}`).join('; ');
      throw new Error(`Failed to save ${failures.length} block(s): ${detail}`);
    }

    return blocks;
  } catch (err) {
    console.error('saveHomepageBlocks error:', err);
    throw err;
  }
}

export async function getRecentActivity(limit = 20) {
  try {
    // Query recent activity from user_activity_feed (main audit source)
    const [recentInstruments, recentUsers, recentThreads, recentActivityFeed] = await Promise.all([
      supabase
        .from('instruments')
        .select('id, make, model, serial_number, created_at, updated_at')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase
        .from('users')
        .select('id, username, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('forum_threads')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('user_activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    if (recentActivityFeed.error) throw recentActivityFeed.error;

    // Merge all activity streams
    const allActivity = [
      ...(recentActivityFeed.data || []).map(a => ({
        id: a.id,
        type: a.activity_type,
        target_type: a.target_type,
        target_id: a.target_id,
        actor_id: a.actor_id,
        data: a.data,
        created_at: a.created_at,
      })),
      ...(recentInstruments.data || []).map(i => ({
        id: i.id,
        type: 'instrument_updated',
        target_type: 'instrument',
        target_id: i.id,
        label: `${i.make} ${i.model}`,
        created_at: i.updated_at,
      })),
      ...(recentUsers.data || []).map(u => ({
        id: u.id,
        type: 'user_created',
        target_type: 'user',
        target_id: u.id,
        label: u.username,
        created_at: u.created_at,
      })),
      ...(recentThreads.data || []).map(t => ({
        id: t.id,
        type: 'thread_created',
        target_type: 'thread',
        target_id: t.id,
        label: t.title,
        created_at: t.created_at,
      })),
    ];

    // Sort by created_at descending and limit to requested count
    return allActivity
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function getAuditLogs({ page = 1, perPage = 50, action = '', userId = '' } = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Query user_activity_feed table with filters
    let query = supabase
      .from('user_activity_feed')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (action) {
      query = query.eq('activity_type', action);
    }

    if (userId) {
      query = query.eq('actor_id', userId);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []).map(log => ({
        id: log.id,
        action: log.activity_type,
        actor_id: log.actor_id,
        target_type: log.target_type,
        target_id: log.target_id,
        details: log.data,
        created_at: log.created_at,
      })),
      count: count || 0,
      page,
      perPage,
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { data: [], count: 0, page, perPage };
  }
}

export async function getPrivacyRequests() {
  return { data: [], count: 0 };
}

export async function updatePrivacyRequest() {
  return { success: true };
}

export async function getDuplicateMatches() {
  return { data: [], count: 0 };
}

// ─────────────────────────────────────────────────────
// TRANSFER MANAGEMENT
// ─────────────────────────────────────────────────────

/**
 * Expire overdue transfers that are still pending after 7 days.
 * Transfers are marked as 'expired' if they were created more than 7 days ago
 * and are still in 'pending' status.
 *
 * @returns {Promise<{expired: Array, count: number}>} Expired transfer details and count
 */
export async function expireOverdueTransfers() {
  try {
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString();

    // Fetch all pending transfers older than 7 days
    const { data: overdueTransfers, error: fetchError } = await supabase
      .from('ownership_transfers')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', cutoffDate);

    if (fetchError) throw fetchError;

    if (!overdueTransfers || overdueTransfers.length === 0) {
      return { expired: [], count: 0 };
    }

    // Prepare updates for each overdue transfer
    const updates = overdueTransfers.map(transfer => ({
      id: transfer.id,
      status: 'expired',
      updated_at: new Date().toISOString(),
    }));

    // Batch update all overdue transfers
    const { error: updateError } = await supabase
      .from('ownership_transfers')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) throw updateError;

    return { expired: overdueTransfers, count: overdueTransfers.length };
  } catch (error) {
    console.error('Error expiring overdue transfers:', error);
    return { expired: [], count: 0 };
  }
}
