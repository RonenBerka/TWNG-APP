import { supabase } from './client.js';

/**
 * Activity feed service — for managing user activity and timeline events.
 *
 * Provides functions to fetch activity feeds, track user activities,
 * and retrieve global activity streams.
 */

/**
 * Get activity feed for a specific user (activities from people they follow).
 * @param {string} userId - The user's ID
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of activity events
 */
export async function getActivityFeed(userId, options = {}) {
  try {
    const { offset = 0, limit = 20 } = options;

    // Get activities from user_activity_feed
    const { data, error } = await supabase
      .from('user_activity_feed')
      .select(`
        id,
        user_id,
        actor_id,
        activity_type,
        target_type,
        target_id,
        data,
        created_at,
        users!user_activity_feed_actor_id_fkey(id, username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activity feed:', error.message);
    throw error;
  }
}

/**
 * Get all activities performed by a specific user.
 * @param {string} userId - The user's ID
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of activity records
 */
export async function getUserActivity(userId, options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('user_activity_feed')
      .select('*')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error.message);
    throw error;
  }
}

/**
 * Get global activity feed (most recent activities across all users).
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of global activity events
 */
export async function getGlobalActivity(options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('user_activity_feed')
      .select(`
        id,
        user_id,
        actor_id,
        activity_type,
        target_type,
        target_id,
        data,
        created_at,
        users!user_activity_feed_actor_id_fkey(id, username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching global activity:', error.message);
    throw error;
  }
}

/**
 * Create a new activity event.
 * @param {Object} activityData - Activity details
 * @param {string} activityData.user_id - The user receiving the activity notification
 * @param {string} activityData.actor_id - The user performing the action
 * @param {string} activityData.activity_type - Type of activity
 * @param {string} activityData.target_type - Type of target (instrument, collection, etc)
 * @param {string} activityData.target_id - ID of the target
 * @param {Object} activityData.data - Additional metadata as JSON
 * @returns {Promise<Object>} Created activity record
 */
export async function createActivity(activityData) {
  try {
    const { data, error } = await supabase
      .from('user_activity_feed')
      .insert({
        user_id: activityData.user_id,
        actor_id: activityData.actor_id,
        activity_type: activityData.activity_type,
        target_type: activityData.target_type,
        target_id: activityData.target_id,
        data: activityData.data || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating activity:', error.message);
    throw error;
  }
}
