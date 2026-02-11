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
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
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
      from_user:users!from_user_id (id, username, avatar_url),
      to_user:users!to_user_id (id, username, avatar_url)
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
  const { data, error } = await supabase
    .from('homepage_blocks')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
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
export { getHomepageBlocks as saveHomepageBlocks }; // stub - save not yet impl

export async function getRecentActivity(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function getAuditLogs({ page = 1, perPage = 50 } = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const { data, error, count } = await supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data: data || [], count: count || 0, page, perPage };
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
