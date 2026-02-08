import { supabase } from './client';

/**
 * Follows service — for managing user follow relationships.
 *
 * Provides functions to check follow status, toggle follows, and fetch counts
 * for follower and following relationships. All operations use the 'follows' table.
 */

/**
 * Check if one user follows another.
 * Returns true if the follow relationship exists, false otherwise.
 */
export async function isFollowing(followerId, followedId) {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .single();
  return !!data;
}

/**
 * Toggle follow state — unfollow if already following, follow if not.
 * Returns true if now following, false if now unfollowed.
 */
export async function toggleFollow(followerId, followedId) {
  // Check if already following
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .single();

  if (existing) {
    // Already following — unfollow
    await supabase.from('follows').delete().eq('id', existing.id);
    return false; // unfollowed
  } else {
    // Not following — create the relationship
    await supabase.from('follows').insert({
      follower_id: followerId,
      followed_id: followedId,
    });
    return true; // followed
  }
}

/**
 * Get the count of followers for a user.
 */
export async function getFollowerCount(userId) {
  const { count } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('followed_id', userId);
  return count || 0;
}

/**
 * Get the count of users this user is following.
 */
export async function getFollowingCount(userId) {
  const { count } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId);
  return count || 0;
}
