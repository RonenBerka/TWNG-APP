import { supabase } from './client.js';

/**
 * Homepage blocks service — for managing homepage content and featured sections.
 *
 * Provides functions to CRUD homepage blocks, manage their display,
 * and retrieve featured content associated with blocks.
 */

/**
 * Get all active homepage blocks in display order.
 * @returns {Promise<Array>} Array of active homepage block objects
 */
export async function getActiveBlocks() {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .select(`
        id,
        type,
        title,
        subtitle,
        content,
        background_image_url,
        cta_text,
        cta_url,
        cta_type,
        small_print_text,
        display_order,
        is_active,
        start_date,
        end_date,
        created_at,
        featured_content(
          id,
          content_type,
          content_id,
          display_order,
          custom_title,
          custom_description,
          custom_image_url
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active blocks:', error.message);
    throw error;
  }
}

/**
 * Get a single homepage block by ID with its featured content.
 * @param {string} blockId - The block ID
 * @returns {Promise<Object>} Homepage block with featured content
 */
export async function getBlock(blockId) {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .select(`
        *,
        featured_content(
          id,
          content_type,
          content_id,
          display_order,
          custom_title,
          custom_description,
          custom_image_url
        )
      `)
      .eq('id', blockId)
      // READ by ID — block may not exist
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching block:', error.message);
    throw error;
  }
}

/**
 * Create a new homepage block.
 * @param {Object} blockData - Block configuration
 * @param {string} blockData.type - Block type ('hero', 'featured_article', etc)
 * @param {string} blockData.title - Block title
 * @param {string} blockData.subtitle - Block subtitle
 * @param {string} blockData.content - Block content
 * @param {string} blockData.background_image_url - Background image URL
 * @param {string} blockData.cta_text - Call-to-action button text
 * @param {string} blockData.cta_url - Call-to-action URL
 * @param {string} blockData.cta_type - CTA type ('signup', 'modal', 'custom')
 * @param {string} blockData.small_print_text - Small print/disclaimer text
 * @param {number} blockData.display_order - Display order position
 * @param {boolean} blockData.is_active - Whether block is active
 * @param {string} blockData.start_date - Start date for display
 * @param {string} blockData.end_date - End date for display
 * @returns {Promise<Object>} Created block
 */
export async function createBlock(blockData) {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .insert({
        type: blockData.type,
        title: blockData.title,
        subtitle: blockData.subtitle || null,
        content: blockData.content || null,
        background_image_url: blockData.background_image_url || null,
        cta_text: blockData.cta_text || null,
        cta_url: blockData.cta_url || null,
        cta_type: blockData.cta_type || null,
        small_print_text: blockData.small_print_text || null,
        display_order: blockData.display_order || 0,
        is_active: blockData.is_active !== undefined ? blockData.is_active : true,
        start_date: blockData.start_date || null,
        end_date: blockData.end_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating block:', error.message);
    throw error;
  }
}

/**
 * Update an existing homepage block.
 * @param {string} blockId - The block ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated block
 */
export async function updateBlock(blockId, updates) {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blockId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating block:', error.message);
    throw error;
  }
}

/**
 * Delete a homepage block.
 * @param {string} blockId - The block ID to delete
 * @returns {Promise<void>}
 */
export async function deleteBlock(blockId) {
  try {
    const { error } = await supabase
      .from('homepage_blocks')
      .delete()
      .eq('id', blockId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting block:', error.message);
    throw error;
  }
}

/**
 * Reorder homepage blocks by updating their display_order values.
 * @param {Array<Object>} blockOrders - Array of {id, display_order} objects
 * @returns {Promise<Array>} Updated blocks
 */
export async function reorderBlocks(blockOrders) {
  try {
    const updates = blockOrders.map(item => ({
      id: item.id,
      display_order: item.display_order,
      updated_at: new Date().toISOString(),
    }));

    // Execute individual updates (upsert pattern)
    const promises = updates.map(update =>
      supabase
        .from('homepage_blocks')
        .update({ display_order: update.display_order, updated_at: update.updated_at })
        .eq('id', update.id)
        .select()
    );

    const results = await Promise.all(promises);

    // Combine all updated blocks
    const updated = results.flatMap(result => result.data || []);
    return updated;
  } catch (error) {
    console.error('Error reordering blocks:', error.message);
    throw error;
  }
}

/**
 * Get featured content for a homepage block.
 * @param {string} blockId - The homepage block ID
 * @returns {Promise<Array>} Array of featured content items
 */
export async function getFeaturedContent(blockId) {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .select(`
        id,
        content_type,
        content_id,
        display_order,
        custom_title,
        custom_description,
        custom_image_url,
        created_at
      `)
      .eq('homepage_block_id', blockId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured content:', error.message);
    throw error;
  }
}

/**
 * Add featured content to a homepage block.
 * @param {string} blockId - The homepage block ID
 * @param {Object} contentData - Featured content details
 * @param {string} contentData.content_type - Type of content ('article', 'collection', 'instrument')
 * @param {string} contentData.content_id - ID of the content
 * @param {number} contentData.display_order - Display order
 * @param {string} contentData.custom_title - Override title
 * @param {string} contentData.custom_description - Override description
 * @param {string} contentData.custom_image_url - Override image URL
 * @returns {Promise<Object>} Created featured content record
 */
export async function addFeaturedContent(blockId, contentData) {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .insert({
        homepage_block_id: blockId,
        content_type: contentData.content_type,
        content_id: contentData.content_id,
        display_order: contentData.display_order || 0,
        custom_title: contentData.custom_title || null,
        custom_description: contentData.custom_description || null,
        custom_image_url: contentData.custom_image_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding featured content:', error.message);
    throw error;
  }
}

/**
 * Remove featured content from a homepage block.
 * @param {string} contentId - The featured_content ID
 * @returns {Promise<void>}
 */
export async function removeFeaturedContent(contentId) {
  try {
    const { error } = await supabase
      .from('featured_content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing featured content:', error.message);
    throw error;
  }
}

/**
 * Update featured content properties.
 * @param {string} contentId - The featured_content ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated featured content
 */
export async function updateFeaturedContent(contentId, updates) {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .update(updates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating featured content:', error.message);
    throw error;
  }
}
