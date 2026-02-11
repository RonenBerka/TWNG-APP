/**
 * User management service.
 * Handles user profile operations, role management, and follow/block relationships.
 *
 * Schema changes:
 * - guitars → instruments
 * - follows → user_follows (with followed_id → following_id)
 * - users.role → user_roles table (supports multiple roles)
 * - Added: is_luthier, is_verified fields
 */

import { supabase } from './client';

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

/**
 * Get a user profile by ID.
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a user profile by username.
 */
export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile information.
 */
export async function updateUserProfile(userId, updates) {
  const updatePayload = {};

  if (updates.username !== undefined) updatePayload.username = updates.username;
  if (updates.avatar_url !== undefined) updatePayload.avatar_url = updates.avatar_url;
  if (updates.bio !== undefined) updatePayload.bio = updates.bio;
  if (updates.is_verified !== undefined) updatePayload.is_verified = updates.is_verified;
  if (updates.is_luthier !== undefined) updatePayload.is_luthier = updates.is_luthier;

  const { data, error } = await supabase
    .from('users')
    .update(updatePayload)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user's last activity timestamp.
 */
export async function updateLastActive(userId) {
  const { data, error } = await supabase
    .from('users')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Search users by username.
 */
export async function searchUsers(query, limit = 20) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, is_verified, is_luthier')
    .ilike('username', `%${query}%`)
    .is('deleted_at', null)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================================================
// USER ROLE OPERATIONS
// ============================================================================

/**
 * Get all roles for a user.
 */
export async function getUserRoles(userId) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((r) => r.role);
}

/**
 * Check if user has a specific role.
 */
export async function hasRole(userId, role) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return !!data;
}

/**
 * Add a role to a user.
 */
export async function addRole(userId, role) {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a role from a user.
 */
export async function removeRole(userId, role) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);

  if (error) throw error;
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

/**
 * Fetch paginated user list for the admin panel.
 */
export async function getAdminUsers({
  search = null,
  role = null,
  status = null,
  page = 1,
  perPage = 20,
} = {}) {
  let query = supabase
    .from('users')
    .select('*, user_roles(role)', { count: 'exact' });

  if (search) {
    query = query.ilike('username', `%${search}%`);
  }

  if (status === 'verified') {
    query = query.eq('is_verified', true);
  } else if (status === 'luthier') {
    query = query.eq('is_luthier', true);
  }

  const from = (page - 1) * perPage;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

/**
 * Get total user count (for pagination).
 */
export async function getAdminUserCount({
  search = null,
  role = null,
  status = null,
} = {}) {
  let query = supabase
    .from('users')
    .select('id', { count: 'exact', head: true });

  if (search) {
    query = query.ilike('username', `%${search}%`);
  }

  if (status === 'verified') {
    query = query.eq('is_verified', true);
  } else if (status === 'luthier') {
    query = query.eq('is_luthier', true);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

/**
 * Verify a user (set is_verified flag).
 */
export async function verifyUser(userId, verified = true) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_verified: verified })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a user as a luthier.
 */
export async function markAsLuthier(userId, isLuthier = true) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_luthier: isLuthier })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft-delete a user account.
 */
export async function deleteUserAccount(userId) {
  const { data, error } = await supabase
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// LEGACY STUBS FOR ADMIN.JSX COMPATIBILITY
// ============================================================================

/**
 * Update a user's role by replacing all roles with a new one.
 */
export async function updateUserRole(userId, newRole) {
  try {
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    if (deleteError) throw deleteError;

    if (newRole && newRole !== 'user') {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      if (insertError) throw insertError;
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error };
  }
}

// ============================================================================
// BARREL FILE COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Alias for getUserProfile — fetch user profile by ID.
 */
export async function getProfile(userId) {
  return getUserProfile(userId);
}

/**
 * Fetch a user's public profile (limited fields).
 */
export async function getPublicProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, bio, is_verified, is_luthier, created_at')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Alias for updateUserProfile — update user profile.
 */
export async function updateProfile(userId, updates) {
  return updateUserProfile(userId, updates);
}
