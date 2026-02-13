import { supabase } from './client.js';

/**
 * User blocks service — for managing user blocking functionality.
 *
 * Provides functions to block/unblock users and check block status.
 */

/**
 * Block a user.
 * @param {string} blockerId - The user doing the blocking
 * @param {string} blockedId - The user to block
 * @param {string} blockType - Type of block (default: 'block')
 * @returns {Promise<Object>} Created block record
 */
export async function blockUser(blockerId, blockedId, blockType = 'block') {
  try {
    // Prevent self-blocking
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Check if already blocked
    const { data: existing } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    if (existing) {
      console.warn(`User ${blockedId} is already blocked by user ${blockerId}`);
      return existing;
    }

    const { data, error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        block_type: blockType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error blocking user:', error.message);
    throw error;
  }
}

/**
 * Unblock a user.
 * @param {string} blockerId - The user who blocked
 * @param {string} blockedId - The user to unblock
 * @returns {Promise<void>}
 */
export async function unblockUser(blockerId, blockedId) {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  } catch (error) {
    console.error('Error unblocking user:', error.message);
    throw error;
  }
}

/**
 * Get all users blocked by a specific user.
 * @param {string} blockerId - The blocking user's ID
 * @returns {Promise<Array>} Array of blocked user IDs and block records
 */
export async function getBlockedUsers(blockerId) {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
        id,
        blocked_id,
        block_type,
        created_at,
        users!user_blocks_blocked_id_fkey(id, username, avatar_url)
      `)
      .eq('blocker_id', blockerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching blocked users:', error.message);
    throw error;
  }
}

/**
 * Check if one user has blocked another.
 * @param {string} blockerId - The potentially blocking user
 * @param {string} blockedId - The potentially blocked user
 * @returns {Promise<boolean>} True if blockerId has blocked blockedId
 */
export async function isUserBlocked(blockerId, blockedId) {
  try {
    const { data } = await supabase
      .from('user_blocks')
      .select('id, block_type')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    return data
      ? { blocked: true, blockType: data.block_type }
      : { blocked: false, blockType: null };
  } catch (error) {
    console.error('Error checking block status:', error.message);
    return { blocked: false, blockType: null };
  }
}
