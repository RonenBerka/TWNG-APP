import { supabase } from './client.js';

/**
 * User badges service — for managing user badges and achievements.
 *
 * Provides functions to retrieve badges earned by users and award new badges.
 */

/**
 * Get all badges earned by a specific user.
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of badge objects
 */
export async function getUserBadges(userId) {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error.message);
    throw error;
  }
}

/**
 * Award a new badge to a user.
 * @param {string} userId - The user to award the badge to
 * @param {Object} badgeData - Badge information
 * @param {string} badgeData.badge_type - Badge type/identifier (e.g., 'collector', 'expert')
 * @param {string} badgeData.badge_name - Human-readable badge name
 * @param {string} badgeData.badge_description - Badge description
 * @param {string} badgeData.badge_icon - URL to badge icon
 * @returns {Promise<Object>} Created badge record
 */
export async function awardBadge(userId, badgeData) {
  try {
    // Check if user already has this badge type
    // READ — badge may not exist yet
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_type', badgeData.badge_type)
      .maybeSingle();

    // Don't award duplicate badges
    if (existing) {
      console.warn(`User ${userId} already has badge type ${badgeData.badge_type}`);
      return existing;
    }

    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_type: badgeData.badge_type,
        badge_name: badgeData.badge_name,
        badge_description: badgeData.badge_description || null,
        badge_icon: badgeData.badge_icon || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error awarding badge:', error.message);
    throw error;
  }
}

/**
 * Get all badge definitions (if badge_definitions table exists).
 * This provides a reference list of all available badge types.
 * @returns {Promise<Array>} Array of badge definition objects
 */
export async function getBadgeDefinitions() {
  try {
    // Attempt to query badge_definitions table if it exists
    const { data, error } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('name', { ascending: true });

    // If table doesn't exist, return empty array
    if (error && error.code === 'PGRST116') {
      console.warn('badge_definitions table does not exist');
      return [];
    }

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badge definitions:', error.message);
    return [];
  }
}
