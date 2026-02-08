/**
 * Admin user management service.
 * Follows the same pattern as guitars.js — Supabase RPC calls
 * wrapped in clean async functions with error handling.
 */

import { supabase } from './client';

/**
 * Fetch paginated user list for the admin panel.
 * Calls the admin_get_users RPC which enforces staff-level access.
 */
export async function getAdminUsers({
  search = null,
  role = null,
  status = null,
  page = 1,
  perPage = 20,
} = {}) {
  const { data, error } = await supabase.rpc('admin_get_users', {
    p_search_term: search || '',
    p_role_filter: role || '',
    p_status_filter: status || '',
    p_page: page,
    p_per_page: perPage,
  });

  if (error) throw error;
  return data || [];
}

/**
 * Get total user count (for pagination).
 */
export async function getAdminUserCount({
  search = null,
  role = null,
  status = null,
} = {}) {
  const { data, error } = await supabase.rpc('admin_get_user_count', {
    p_search_term: search || '',
    p_role_filter: role || '',
    p_status_filter: status || '',
  });

  if (error) throw error;
  return data || 0;
}

/**
 * Change a user's role. Admin-only, with hierarchy enforcement.
 * Calls admin_update_user_role RPC which:
 *   - Validates permissions (only admin/super_admin)
 *   - Enforces hierarchy (only super_admin can assign admin roles)
 *   - Syncs to JWT via database trigger
 *   - Logs to audit_log
 */
export async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase.rpc('admin_update_user_role', {
    p_target_user_id: userId,
    p_new_role: newRole,
  });

  if (error) throw error;
  return data?.[0] || data;
}
