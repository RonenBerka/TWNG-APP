import { supabase } from './client.js';

/**
 * User favorites service — for managing user favorites/likes.
 *
 * Provides functions to add/remove favorites and check favorite status.
 * Favorites can be of different types (instrument, collection, etc).
 */

/**
 * Add an item to user's favorites.
 * @param {string} userId - The user's ID
 * @param {string} targetId - The target item ID
 * @param {string} targetType - Type of target ('instrument' or 'collection')
 * @returns {Promise<Object>} Created favorite record
 */
export async function addFavorite(userId, targetId, targetType) {
  try {
    // Validate target type
    const validTypes = ['instrument', 'collection'];
    if (!validTypes.includes(targetType)) {
      throw new Error(`Invalid favorite type: ${targetType}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('favorite_id', targetId)
      .eq('favorite_type', targetType)
      .single();

    if (existing) {
      console.warn(`User ${userId} has already favorited ${targetType} ${targetId}`);
      return existing;
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        favorite_id: targetId,
        favorite_type: targetType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding favorite:', error.message);
    throw error;
  }
}

/**
 * Remove an item from user's favorites.
 * @param {string} userId - The user's ID
 * @param {string} targetId - The target item ID
 * @param {string} targetType - Type of target ('instrument' or 'collection')
 * @returns {Promise<void>}
 */
export async function removeFavorite(userId, targetId, targetType) {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('favorite_id', targetId)
      .eq('favorite_type', targetType);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing favorite:', error.message);
    throw error;
  }
}

/**
 * Get all favorites for a user, optionally filtered by type.
 * @param {string} userId - The user's ID
 * @param {string} targetType - Optional: filter by type ('instrument' or 'collection')
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of favorite records
 */
export async function getUserFavorites(userId, targetType = null, options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;
    let query = supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId);

    if (targetType) {
      query = query.eq('favorite_type', targetType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user favorites:', error.message);
    throw error;
  }
}

/**
 * Get the total number of favorites for a specific item.
 * @param {string} targetId - The target item ID
 * @param {string} targetType - Type of target ('instrument' or 'collection')
 * @returns {Promise<number>} The favorite count
 */
export async function getFavoriteCount(targetId, targetType = 'instrument') {
  try {
    const { count, error } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('favorite_id', targetId)
      .eq('favorite_type', targetType);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting favorite count:', error.message);
    return 0;
  }
}

/**
 * Check if a user has favorited a specific item.
 * @param {string} userId - The user's ID
 * @param {string} targetId - The target item ID
 * @param {string} targetType - Type of target ('instrument' or 'collection')
 * @returns {Promise<boolean>} True if the item is favorited
 */
export async function isFavorited(userId, targetId, targetType) {
  try {
    const { data } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('favorite_id', targetId)
      .eq('favorite_type', targetType)
      .single();

    return !!data;
  } catch (error) {
    // If error is "not found", item is not favorited (not an error condition)
    if (error.code === 'PGRST116') {
      return false;
    }
    console.error('Error checking favorite status:', error.message);
    throw error;
  }
}
