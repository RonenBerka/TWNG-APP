/**
 * Admin service layer — Supabase queries for all admin console sections.
 * RLS policies already grant admin/super_admin access to these tables,
 * so we can query directly with the authenticated client.
 */

import { supabase } from './client';

// ─────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [usersRes, guitarsRes, collectionsRes, articlesRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('guitars').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('collections').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalGuitars: guitarsRes.count ?? 0,
    totalCollections: collectionsRes.count ?? 0,
    totalArticles: articlesRes.count ?? 0,
  };
}

export async function getRecentActivity(limit = 15) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ─────────────────────────────────────────────────────
// INSTRUMENTS (guitars)
// ─────────────────────────────────────────────────────

export async function getAdminGuitars({
  search = '',
  state = '',
  brand = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('guitars')
    .select('*, owner:users!owner_id (id, email, display_name, username)', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%`);
  }
  if (state) {
    query = query.eq('state', state);
  }
  if (brand) {
    query = query.ilike('brand', brand);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { guitars: data || [], total: count || 0 };
}

export async function updateGuitarState(guitarId, newState) {
  const { data, error } = await supabase
    .from('guitars')
    .update({ state: newState })
    .eq('id', guitarId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function adminDeleteGuitar(guitarId) {
  const { data, error } = await supabase
    .from('guitars')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', guitarId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────

export async function getAuditLogs({
  category = '',
  search = '',
  startDate = '',
  page = 1,
  perPage = 25,
} = {}) {
  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (category) {
    query = query.ilike('action', `${category}.%`);
  }
  if (search) {
    query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`);
  }
  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { logs: data || [], total: count || 0 };
}

// ─────────────────────────────────────────────────────
// LUTHIERS
// ─────────────────────────────────────────────────────

export async function getAdminLuthiers({
  search = '',
  verified = null,
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('luthier_profiles')
    .select('*, user:users!user_id (id, email, display_name, username, status, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    query = query.ilike('business_name', `%${search}%`);
  }
  if (verified === true) {
    query = query.eq('is_verified_luthier', true);
  } else if (verified === false) {
    query = query.eq('is_verified_luthier', false);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { luthiers: data || [], total: count || 0 };
}

export async function verifyLuthier(userId, verifiedBy) {
  const { data, error } = await supabase
    .from('luthier_profiles')
    .update({
      is_verified_luthier: true,
      verified_at: new Date().toISOString(),
      verified_by: verifiedBy,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// SYSTEM CONFIGURATION
// ─────────────────────────────────────────────────────

export async function getSystemConfig() {
  const { data, error } = await supabase
    .from('system_config')
    .select('*')
    .order('key');

  if (error) throw error;

  // Convert array to key-value map for easy access
  const configMap = {};
  (data || []).forEach(row => {
    configMap[row.key] = row;
  });
  return configMap;
}

export async function updateSystemConfig(key, value, userId) {
  const { data, error } = await supabase
    .from('system_config')
    .update({
      value: typeof value === 'object' ? value : JSON.stringify(value),
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)
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
    .select('*, author:users!author_id (id, email, display_name, username)', { count: 'exact' })
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

export async function getAdminDiscussions({
  hidden = null,
  search = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('discussion_posts')
    .select('*, author:users!author_id (id, email, display_name, username), category:discussion_categories!category_id (id, name, slug)', { count: 'exact' })
    .is('parent_id', null) // top-level posts only
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (hidden === true) {
    query = query.eq('is_hidden', true);
  } else if (hidden === false) {
    query = query.eq('is_hidden', false);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { posts: data || [], total: count || 0 };
}

export async function toggleDiscussionHidden(postId, isHidden, reason = '') {
  const { data, error } = await supabase
    .from('discussion_posts')
    .update({
      is_hidden: isHidden,
      hidden_reason: isHidden ? reason : null,
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// PRIVACY REQUESTS
// ─────────────────────────────────────────────────────

export async function getPrivacyRequests({
  status = '',
  requestType = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('privacy_requests')
    .select('*, user:users!user_id (id, email, display_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (requestType) {
    query = query.eq('request_type', requestType);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { requests: data || [], total: count || 0 };
}

export async function updatePrivacyRequest(requestId, newStatus, handledBy) {
  const updates = {
    status: newStatus,
    handled_by: handledBy,
  };
  if (newStatus === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('privacy_requests')
    .update(updates)
    .eq('id', requestId)
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
  transferType = '',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('ownership_transfers')
    .select(`
      *,
      guitar:guitars!ie_id (id, brand, model, serial_number),
      from_user:users!from_user_id (id, email, display_name),
      to_user:users!to_user_id (id, email, display_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (transferType) {
    query = query.eq('transfer_type', transferType);
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
// DUPLICATE MATCHES
// ─────────────────────────────────────────────────────

export async function getDuplicateMatches({
  status = 'pending',
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('duplicate_matches')
    .select(`
      *,
      guitar_a:guitars!guitar_id_a (id, brand, model, serial_number, owner:users!owner_id (display_name)),
      guitar_b:guitars!guitar_id_b (id, brand, model, serial_number, owner:users!owner_id (display_name))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { matches: data || [], total: count || 0 };
}

export async function resolveDuplicate(matchId, newStatus, resolvedBy) {
  const { data, error } = await supabase
    .from('duplicate_matches')
    .update({
      status: newStatus,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────
// HOMEPAGE BLOCKS
// Uses system_config with key='homepage_blocks'
// ─────────────────────────────────────────────────────

export async function getHomepageBlocks() {
  const { data, error } = await supabase
    .from('system_config')
    .select('*')
    .eq('key', 'homepage_blocks')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data?.value?.blocks || [];
}

export async function saveHomepageBlocks(blocks, userId) {
  const { data, error } = await supabase
    .from('system_config')
    .upsert({
      key: 'homepage_blocks',
      value: { blocks },
      description: 'Homepage content blocks configuration',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
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
