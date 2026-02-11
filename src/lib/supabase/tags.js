import { supabase } from './client.js';

/**
 * Tags service — for managing tags and their relationships with instruments.
 *
 * Provides functions to retrieve tags, manage instrument-tag relationships,
 * and track tag usage.
 */

/**
 * Get all tags with optional pagination.
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of tag objects
 */
export async function getTags(options = {}) {
  try {
    const { offset = 0, limit = 100 } = options;

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tags:', error.message);
    throw error;
  }
}

/**
 * Get the most popular tags by usage count.
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of tags to return
 * @returns {Promise<Array>} Array of most-used tags
 */
export async function getPopularTags(options = {}) {
  try {
    const { limit = 20 } = options;

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .gt('usage_count', 0)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching popular tags:', error.message);
    throw error;
  }
}

/**
 * Create a new tag.
 * @param {Object} tagData - Tag information
 * @param {string} tagData.name - Tag display name
 * @param {string} tagData.slug - URL-friendly slug (unique)
 * @param {string} tagData.description - Tag description
 * @returns {Promise<Object>} Created tag object
 */
export async function createTag(tagData) {
  try {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: tagData.name,
        slug: tagData.slug,
        description: tagData.description || null,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating tag:', error.message);
    throw error;
  }
}

/**
 * Add a tag to an instrument (create instrument_tags entry).
 * @param {string} instrumentId - The instrument ID
 * @param {string} tagId - The tag ID
 * @returns {Promise<Object>} Created instrument_tag record
 */
export async function addTagToInstrument(instrumentId, tagId) {
  try {
    // Check if tag-instrument relationship already exists
    const { data: existing } = await supabase
      .from('instrument_tags')
      .select('id')
      .eq('instrument_id', instrumentId)
      .eq('tag_id', tagId)
      .single();

    if (existing) {
      console.warn(`Instrument ${instrumentId} already has tag ${tagId}`);
      return existing;
    }

    // Create relationship
    const { data, error } = await supabase
      .from('instrument_tags')
      .insert({
        instrument_id: instrumentId,
        tag_id: tagId,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment tag usage count
    await incrementTagUsage(tagId);

    return data;
  } catch (error) {
    console.error('Error adding tag to instrument:', error.message);
    throw error;
  }
}

/**
 * Remove a tag from an instrument.
 * @param {string} instrumentId - The instrument ID
 * @param {string} tagId - The tag ID
 * @returns {Promise<void>}
 */
export async function removeTagFromInstrument(instrumentId, tagId) {
  try {
    const { error } = await supabase
      .from('instrument_tags')
      .delete()
      .eq('instrument_id', instrumentId)
      .eq('tag_id', tagId);

    if (error) throw error;

    // Decrement tag usage count
    await decrementTagUsage(tagId);
  } catch (error) {
    console.error('Error removing tag from instrument:', error.message);
    throw error;
  }
}

/**
 * Get all tags for a specific instrument.
 * @param {string} instrumentId - The instrument ID
 * @returns {Promise<Array>} Array of tag objects for the instrument
 */
export async function getInstrumentTags(instrumentId) {
  try {
    const { data, error } = await supabase
      .from('instrument_tags')
      .select(`
        id,
        created_at,
        tags(id, name, slug, description)
      `)
      .eq('instrument_id', instrumentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching instrument tags:', error.message);
    throw error;
  }
}

/**
 * Get all instruments with a specific tag.
 * @param {string} tagId - The tag ID
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of instruments with that tag
 */
export async function getInstrumentsWithTag(tagId, options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;

    const { data, error } = await supabase
      .from('instrument_tags')
      .select(`
        id,
        created_at,
        instruments(id, make, model, year, main_image_url)
      `)
      .eq('tag_id', tagId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching instruments with tag:', error.message);
    throw error;
  }
}

/**
 * Internal helper: increment tag usage count.
 */
async function incrementTagUsage(tagId) {
  try {
    const { data: tag } = await supabase
      .from('tags')
      .select('usage_count')
      .eq('id', tagId)
      .single();

    if (tag) {
      await supabase
        .from('tags')
        .update({ usage_count: (tag.usage_count || 0) + 1 })
        .eq('id', tagId);
    }
  } catch (error) {
    console.warn('Error incrementing tag usage:', error.message);
  }
}

/**
 * Internal helper: decrement tag usage count.
 */
async function decrementTagUsage(tagId) {
  try {
    const { data: tag } = await supabase
      .from('tags')
      .select('usage_count')
      .eq('id', tagId)
      .single();

    if (tag && tag.usage_count > 0) {
      await supabase
        .from('tags')
        .update({ usage_count: tag.usage_count - 1 })
        .eq('id', tagId);
    }
  } catch (error) {
    console.warn('Error decrementing tag usage:', error.message);
  }
}
