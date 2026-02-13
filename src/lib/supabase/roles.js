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
    // READ by ID — user may not exist
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? [{ id: data.id, role: data.role }] : [];
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
    // READ by ID — user may not exist
    const { data } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    return data && data.role === role;
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
 * @param {string} grantedBy - The user ID granting the role (not used with direct role column)
 * @returns {Promise<Object>} Updated user record
 */
export async function grantRole(userId, role, grantedBy) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
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
 * @param {string} role - The role to revoke (not used, role is reset to 'user')
 * @returns {Promise<void>}
 */
export async function revokeRole(userId, role) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', userId);

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
 * @returns {Promise<Array>} Array of admin user records
 */
export async function getAdmins(options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('users')
      .select('*')
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
 * @returns {Promise<Array>} Array of moderator user records
 */
export async function getModerators(options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('users')
      .select('*')
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
 * @returns {Promise<Object>} Updated user record
 */
export async function assignRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
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
 * @param {string} role - Role to remove (not used, role is reset to 'user')
 * @returns {Promise<void>}
 */
export async function removeRole(userId, role) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', userId);

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
  // Return standard roles available in the system
  return ['user', 'moderator', 'admin', 'luthier'];
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
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('users')
      .select('*')
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
