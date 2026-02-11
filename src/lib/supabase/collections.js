import { supabase } from './client.js';

/**
 * Collections service — for managing user collections and their instruments.
 *
 * Provides functions to CRUD collections, manage collection visibility, and
 * manage the M2M relationship between collections and instruments.
 */

/**
 * Get all collections (paginated and filtered).
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @param {boolean} options.publicOnly - Filter to public collections only
 * @returns {Promise<Array>} Array of collection objects
 */
export async function getCollections(options = {}) {
  try {
    const { offset = 0, limit = 20, publicOnly = true } = options;
    let query = supabase.from('collections').select('*');

    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw error;
  }
}

/**
 * Get all collections for a specific user.
 * @param {string} userId - The user's ID
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of user's collections
 */
export async function getUserCollections(userId, options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user collections:', error.message);
    throw error;
  }
}

/**
 * Get a single collection by ID with related instruments.
 * @param {string} collectionId - The collection ID
 * @returns {Promise<Object>} Collection object with instruments
 */
export async function getCollection(collectionId) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        collection_items(
          id,
          instrument_id,
          added_at,
          notes,
          instruments(*)
        )
      `)
      .eq('id', collectionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching collection:', error.message);
    throw error;
  }
}

/**
 * Create a new collection for a user.
 * @param {string} userId - The owner's user ID
 * @param {Object} collectionData - Collection details
 * @param {string} collectionData.name - Collection name
 * @param {string} collectionData.description - Collection description
 * @param {string} collectionData.cover_image_url - Cover image URL
 * @param {boolean} collectionData.is_public - Whether collection is public
 * @returns {Promise<Object>} Created collection
 */
export async function createCollection(userId, collectionData) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: userId,
        name: collectionData.name,
        description: collectionData.description || null,
        cover_image_url: collectionData.cover_image_url || null,
        is_public: collectionData.is_public !== undefined ? collectionData.is_public : true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating collection:', error.message);
    throw error;
  }
}

/**
 * Update an existing collection.
 * @param {string} collectionId - The collection ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated collection
 */
export async function updateCollection(collectionId, updates) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating collection:', error.message);
    throw error;
  }
}

/**
 * Delete a collection by ID.
 * @param {string} collectionId - The collection ID to delete
 * @returns {Promise<void>}
 */
export async function deleteCollection(collectionId) {
  try {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting collection:', error.message);
    throw error;
  }
}

/**
 * Add an instrument to a collection (create collection_items entry).
 * @param {string} collectionId - The collection ID
 * @param {string} instrumentId - The instrument ID
 * @param {Object} itemData - Additional item data
 * @param {string} itemData.notes - Notes about the item
 * @returns {Promise<Object>} Created collection item
 */
export async function addInstrumentToCollection(collectionId, instrumentId, itemData = {}) {
  try {
    const { data, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        instrument_id: instrumentId,
        notes: itemData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding instrument to collection:', error.message);
    throw error;
  }
}

/**
 * Remove an instrument from a collection.
 * @param {string} collectionId - The collection ID
 * @param {string} instrumentId - The instrument ID to remove
 * @returns {Promise<void>}
 */
export async function removeInstrumentFromCollection(collectionId, instrumentId) {
  try {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('instrument_id', instrumentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing instrument from collection:', error.message);
    throw error;
  }
}

/**
 * Get all instruments in a collection.
 * @param {string} collectionId - The collection ID
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of instruments with collection item metadata
 */
export async function getCollectionInstruments(collectionId, options = {}) {
  try {
    const { offset = 0, limit = 50 } = options;
    const { data, error } = await supabase
      .from('collection_items')
      .select(`
        id,
        added_at,
        notes,
        instruments(*)
      `)
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching collection instruments:', error.message);
    throw error;
  }
}
