import { supabase } from './client.js';

/**
 * Roles service — for managing user roles and permissions.
 *
 * Provides functions to query user roles, grant/revoke roles,
 * and check role-based access.
 */

/**
 * Get all roles for a specific user.
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of role objects
 */
export async function getUserRoles(userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error.message);
    throw error;
  }
}

/**
 * Check if a user has a specific role.
 * @param {string} userId - The user's ID
 * @param {string} role - The role to check for (e.g., 'admin', 'moderator', 'user')
 * @returns {Promise<boolean>} True if user has the role
 */
export async function hasRole(userId, role) {
  try {
    const { data } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    return !!data;
  } catch (error) {
    // Not found is not an error condition
    if (error.code === 'PGRST116') {
      return false;
    }
    console.error('Error checking user role:', error.message);
    throw error;
  }
}

/**
 * Grant a role to a user.
 * @param {string} userId - The user to grant the role to
 * @param {string} role - The role to grant (e.g., 'admin', 'moderator')
 * @param {string} grantedBy - The user ID granting the role
 * @returns {Promise<Object>} Created role record
 */
export async function grantRole(userId, role, grantedBy) {
  try {
    // Check if user already has this role
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    if (existing) {
      console.warn(`User ${userId} already has role ${role}`);
      return existing;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        granted_by: grantedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error granting role:', error.message);
    throw error;
  }
}

/**
 * Revoke a role from a user.
 * @param {string} userId - The user to revoke the role from
 * @param {string} role - The role to revoke
 * @returns {Promise<void>}
 */
export async function revokeRole(userId, role) {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw error;
  } catch (error) {
    console.error('Error revoking role:', error.message);
    throw error;
  }
}

/**
 * Get all users with admin role.
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of admin user records with role info
 */
export async function getAdmins(options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users(id, username, avatar_url, email)
      `)
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admins:', error.message);
    throw error;
  }
}

/**
 * Get all users with moderator role.
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of moderator user records with role info
 */
export async function getModerators(options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users(id, username, avatar_url, email)
      `)
      .eq('role', 'moderator')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching moderators:', error.message);
    throw error;
  }
}

// ============================================================================
// BARREL FILE COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Assign a role to a user.
 * @param {string} userId - User ID to assign role to
 * @param {string} role - Role to assign (e.g., 'admin', 'moderator')
 * @returns {Promise<Object>} Created role record
 */
export async function assignRole(userId, role) {
  console.warn(`assignRole called for userId: ${userId}, role: ${role}`);
  try {
    // Check if user already has this role
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    if (existing) {
      return existing;
    }

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
  } catch (error) {
    console.error('Error assigning role:', error.message);
    throw error;
  }
}

/**
 * Remove a role from a user.
 * @param {string} userId - User ID to remove role from
 * @param {string} role - Role to remove
 * @returns {Promise<void>}
 */
export async function removeRole(userId, role) {
  console.warn(`removeRole called for userId: ${userId}, role: ${role}`);
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing role:', error.message);
    throw error;
  }
}

/**
 * Get all available roles in the system.
 * @returns {Promise<Array>} Array of available role names
 */
export async function getAllRoles() {
  console.warn('getAllRoles called - returning hardcoded role list');
  // Return standard roles available in the system
  return ['user', 'moderator', 'admin', 'luthier', 'verified'];
}

/**
 * Get all users with a specific role.
 * @param {string} role - Role to filter by
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of user records with the specified role
 */
export async function getUsersByRole(role, options = {}) {
  console.warn(`getUsersByRole called for role: ${role}`);
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        created_at,
        users(id, username, avatar_url, email)
      `)
      .eq('role', role)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users by role:', error.message);
    throw error;
  }
}
