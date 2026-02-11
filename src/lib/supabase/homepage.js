/**
 * Homepage service layer — fetches live data for all homepage sections.
 * Updated for Lovable schema migration:
 * - homepage_blocks table (each block is a row, not JSON config)
 * - instruments table (formerly guitars)
 * - featured_content table for associating content with blocks
 * Falls back to null/empty so the homepage can use its local defaults.
 */

import { supabase } from './client';

// ─────────────────────────────────────────────────────
// HOMEPAGE BLOCKS
// ─────────────────────────────────────────────────────

/**
 * Get all active homepage blocks, ordered by display_order
 */
export async function getHomepageBlocks() {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getHomepageBlocks error:', err);
    return [];
  }
}

/**
 * Get a specific homepage block by ID
 */
export async function getHomepageBlock(blockId) {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  } catch (err) {
    console.error('getHomepageBlock error:', err);
    return null;
  }
}

/**
 * Create a new homepage block
 * @param {Object} block - Block data: { type, title, content, display_order, is_active, settings... }
 * @returns {Object} Created block with id
 */
export async function createHomepageBlock(block) {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .insert({
        ...block,
        is_active: block.is_active !== false,
        display_order: block.display_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createHomepageBlock error:', err);
    return null;
  }
}

/**
 * Update a homepage block
 */
export async function updateHomepageBlock(blockId, updates) {
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
  } catch (err) {
    console.error('updateHomepageBlock error:', err);
    return null;
  }
}

/**
 * Delete a homepage block
 */
export async function deleteHomepageBlock(blockId) {
  try {
    const { error } = await supabase
      .from('homepage_blocks')
      .delete()
      .eq('id', blockId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteHomepageBlock error:', err);
    return false;
  }
}

/**
 * Reorder homepage blocks
 * @param {Array} blockOrders - [{ id, display_order }, ...]
 */
export async function reorderHomepageBlocks(blockOrders) {
  try {
    const updates = blockOrders.map(({ id, display_order }) => ({
      id,
      display_order,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('homepage_blocks')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('reorderHomepageBlocks error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// FEATURED CONTENT
// ─────────────────────────────────────────────────────

/**
 * Get featured content for a homepage block
 */
export async function getFeaturedContent(blockId) {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .select('*')
      .eq('homepage_block_id', blockId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getFeaturedContent error:', err);
    return [];
  }
}

/**
 * Add featured content to a homepage block
 * @param {Object} content - { homepage_block_id, content_type, content_id, custom_title, etc. }
 */
export async function addFeaturedContent(content) {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .insert(content)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('addFeaturedContent error:', err);
    return null;
  }
}

/**
 * Update featured content
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
  } catch (err) {
    console.error('updateFeaturedContent error:', err);
    return null;
  }
}

/**
 * Remove featured content
 */
export async function removeFeaturedContent(contentId) {
  try {
    const { error } = await supabase
      .from('featured_content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('removeFeaturedContent error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// FEATURED INSTRUMENTS
// ─────────────────────────────────────────────────────

/**
 * Get featured instruments for homepage
 */
export async function getFeaturedInstruments(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('instruments')
      .select('id, make, model, year, main_image_url, current_owner:users!current_owner_id (id, username, avatar_url)')
      .eq('is_featured', true)
      .eq('moderation_status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getFeaturedInstruments error:', err);
    return [];
  }
}

/**
 * Get recently added instruments
 */
export async function getRecentlyAddedInstruments(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('instruments')
      .select('id, make, model, year, main_image_url, current_owner:users!current_owner_id (id, username, avatar_url)')
      .eq('moderation_status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getRecentlyAddedInstruments error:', err);
    return [];
  }
}

/**
 * Get top instrument makes/brands
 */
export async function getTopInstrumentMakes(limit = 8) {
  try {
    // Fetch all published instruments and count by make
    const { data: instruments, error } = await supabase
      .from('instruments')
      .select('make')
      .eq('moderation_status', 'approved')
      .is('deleted_at', null);

    if (error) throw error;

    // Count makes client-side
    const makes = {};
    (instruments || []).forEach(i => {
      if (i.make) {
        makes[i.make] = (makes[i.make] || 0) + 1;
      }
    });

    return Object.entries(makes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  } catch (err) {
    console.error('getTopInstrumentMakes error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────
// FEATURED ARTICLES
// ─────────────────────────────────────────────────────

/**
 * Get published articles for homepage
 */
export async function getHomepageArticles(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, cover_image_url, published_at, author:users!author_id (id, username, avatar_url)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getHomepageArticles error:', err);
    return [];
  }
}

/**
 * Get featured articles
 */
export async function getFeaturedArticles(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, cover_image_url, published_at, author:users!author_id (id, username, avatar_url)')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error && error.code !== 'PGRST116') throw error;
    return data || [];
  } catch (err) {
    console.error('getFeaturedArticles error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────
// HOMEPAGE STATS
// ─────────────────────────────────────────────────────

/**
 * Get homepage statistics (live counts)
 */
export async function getHomepageStats() {
  try {
    const [instrumentsRes, usersRes, brandsRes] = await Promise.all([
      supabase
        .from('instruments')
        .select('id', { count: 'exact', head: true })
        .eq('moderation_status', 'approved')
        .is('deleted_at', null),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('instruments')
        .select('make')
        .eq('moderation_status', 'approved')
        .is('deleted_at', null),
    ]);

    const uniqueBrands = new Set((brandsRes.data || []).map(i => i.make).filter(Boolean)).size;

    return {
      instruments: instrumentsRes.count ?? 0,
      collectors: usersRes.count ?? 0,
      makes: uniqueBrands,
    };
  } catch (err) {
    console.error('getHomepageStats error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────
// FEATURED COLLECTIONS
// ─────────────────────────────────────────────────────

/**
 * Get public featured collections
 */
export async function getFeaturedCollections(limit = 6) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, description, cover_image_url, user:users!user_id (id, username, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getFeaturedCollections error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────
// LEGACY STUBS FOR ADMIN.JSX COMPATIBILITY
// ─────────────────────────────────────────────────────

export async function getHomepageSectionConfig(sectionType) {
  try {
    const { data, error } = await supabase
      .from('homepage_blocks')
      .select('*')
      .eq('type', sectionType)
      .maybeSingle();
    if (error) throw error;
    return data?.content || {};
  } catch (err) {
    console.error('getHomepageSectionConfig error:', err);
    return {};
  }
}

export async function saveHomepageSectionConfig(sectionType, config) {
  try {
    const { error } = await supabase
      .from('homepage_blocks')
      .upsert({ type: sectionType, content: config, updated_at: new Date().toISOString() }, { onConflict: 'type' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('saveHomepageSectionConfig error:', err);
    return false;
  }
}

export async function saveHomepageTestimonials(testimonials) {
  return saveHomepageSectionConfig('testimonials', { testimonials });
}

export async function saveHomepageStats(stats) {
  return saveHomepageSectionConfig('stats', { stats });
}
