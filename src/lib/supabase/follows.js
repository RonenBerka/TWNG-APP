import { supabase } from './client';
import { sendNotificationEmail } from '../email/emailService';
import { EMAIL_BASE_URL } from '../email/constants';

/**
 * Follows service — for managing user follow relationships and blocks.
 *
 * Schema changes from previous version:
 * - follows table → user_follows
 * - followed_id → following_id
 * - Added: user_blocks table support (block_type: 'block' | 'mute')
 */

// ============================================================================
// FOLLOW OPERATIONS
// ============================================================================

/**
 * Check if one user follows another.
 * Returns true if the follow relationship exists, false otherwise.
 */
export async function isFollowing(followerId, followingId) {
  const { data } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

/**
 * Toggle follow state — unfollow if already following, follow if not.
 * Returns true if now following, false if now unfollowed.
 */
export async function toggleFollow(followerId, followingId) {
  // Check if already following
  const { data: existing } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    // Already following — unfollow
    await supabase.from('user_follows').delete().eq('id', existing.id);
    return false; // unfollowed
  } else {
    // Not following — create the relationship
    await supabase.from('user_follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    // Fire-and-forget: email notification to the followed user
    supabase
      .from('users')
      .select('display_name, username, avatar_url')
      .eq('id', followerId)
      .maybeSingle()
      .then(({ data: followerProfile }) => {
        sendNotificationEmail('newFollower', followingId, {
          followerName: followerProfile?.display_name || followerProfile?.username || 'Someone',
          followerUsername: followerProfile?.username || '',
          profileUrl: `${EMAIL_BASE_URL}/user/${followerProfile?.username || followerId}`,
        }).catch(() => {});
      })
      .catch(() => {});

    return true; // followed
  }
}

/**
 * Get the count of followers for a user.
 */
export async function getFollowerCount(userId) {
  const { count } = await supabase
    .from('user_follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId);
  return count || 0;
}

/**
 * Get the count of users this user is following.
 */
export async function getFollowingCount(userId) {
  const { count } = await supabase
    .from('user_follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId);
  return count || 0;
}

/**
 * Get list of users that a user is following.
 */
export async function getFollowing(userId, limit = 50) {
  const { data, error } = await supabase
    .from('user_follows')
    .select('following_id, user:following_id(id, username, avatar_url)')
    .eq('follower_id', userId)
    .limit(limit);

  if (error) throw error;
  return (data || []).map((row) => row.user);
}

/**
 * Get list of followers for a user.
 */
export async function getFollowers(userId, limit = 50) {
  const { data, error } = await supabase
    .from('user_follows')
    .select('follower_id, user:follower_id(id, username, avatar_url)')
    .eq('following_id', userId)
    .limit(limit);

  if (error) throw error;
  return (data || []).map((row) => row.user);
}

// ============================================================================
// BLOCK OPERATIONS
// ============================================================================

/**
 * Check if one user has blocked another.
 *
 * @param {string} blockerId - User doing the blocking
 * @param {string} blockedId - User being blocked
 * @returns {Promise<Object|null>} Block record if exists, null otherwise
 */
export async function getBlockStatus(blockerId, blockedId) {
  const { data } = await supabase
    .from('user_blocks')
    .select('*')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();
  return data || null;
}

/**
 * Block or mute a user.
 *
 * @param {string} blockerId - User doing the blocking
 * @param {string} blockedId - User being blocked
 * @param {string} blockType - 'block' or 'mute' (default: 'block')
 */
export async function blockUser(blockerId, blockedId, blockType = 'block') {
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
}

/**
 * Unblock a user.
 *
 * @param {string} blockerId - User doing the unblocking
 * @param {string} blockedId - User being unblocked
 */
export async function unblockUser(blockerId, blockedId) {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) throw error;
}

/**
 * Update block type (e.g. change from 'block' to 'mute').
 */
export async function updateBlockType(blockerId, blockedId, blockType) {
  const { data, error } = await supabase
    .from('user_blocks')
    .update({ block_type: blockType })
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get list of users that a user has blocked.
 */
export async function getBlockedUsers(userId, limit = 50) {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocked_id, user:blocked_id(id, username, avatar_url), block_type')
    .eq('blocker_id', userId)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get count of blocked users.
 */
export async function getBlockedCount(userId) {
  const { count, error } = await supabase
    .from('user_blocks')
    .select('id', { count: 'exact', head: true })
    .eq('blocker_id', userId);

  if (error) throw error;
  return count || 0;
}

// ============================================================================
// BARREL FILE COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Follow a user.
 * @param {string} followerId - User doing the following
 * @param {string} followedId - User to follow
 * @returns {Promise<Object>} Created follow record
 */
export async function followUser(followerId, followedId) {
  const { data, error } = await supabase
    .from('user_follows')
    .insert({
      follower_id: followerId,
      following_id: followedId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Unfollow a user.
 * @param {string} followerId - User doing the unfollowing
 * @param {string} followedId - User to unfollow
 */
export async function unfollowUser(followerId, followedId) {
  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followedId);

  if (error) throw error;
}

/**
 * Get follower and following counts for a user.
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object with followers and following counts
 */
export async function getFollowCounts(userId) {
  const followerCount = await getFollowerCount(userId);
  const followingCount = await getFollowingCount(userId);

  return {
    followers: followerCount,
    following: followingCount,
  };
}
