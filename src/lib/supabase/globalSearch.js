import { supabase } from './client.js';

/**
 * Global search service — for searching across multiple entities.
 *
 * Provides cross-entity search across instruments, articles, forum threads,
 * users, and collections with type-specific filtering.
 */

/**
 * Perform a global search across all searchable entities.
 * @param {string} query - Search query string
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results per type
 * @returns {Promise<Object>} Object with results organized by type
 */
export async function globalSearch(query, options = {}) {
  try {
    const { limit = 10 } = options;

    if (!query || query.trim().length < 2) {
      return {
        instruments: [],
        articles: [],
        threads: [],
        users: [],
        collections: [],
      };
    }

    const searchTerm = `%${query}%`;

    // Search instruments
    const { data: instrumentsData, error: instrumentsError } = await supabase
      .from('instruments')
      .select('id, make, model, year, main_image_url, created_at')
      .or(`make.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit);

    // Search articles
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_image_url, published_at')
      .eq('status', 'published')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
      .limit(limit);

    // Search forum threads
    const { data: threadsData, error: threadsError } = await supabase
      .from('forum_threads')
      .select('id, title, slug, category_id, created_at, author_id')
      .ilike('title', searchTerm)
      .limit(limit);

    // Search users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url, is_verified')
      .ilike('username', searchTerm)
      .limit(limit);

    // Search collections
    const { data: collectionsData, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name, description, cover_image_url, is_public, created_at')
      .eq('is_public', true)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(limit);

    // Check for errors
    if (instrumentsError) throw instrumentsError;
    if (articlesError) throw articlesError;
    if (threadsError) throw threadsError;
    if (usersError) throw usersError;
    if (collectionsError) throw collectionsError;

    return {
      instruments: instrumentsData || [],
      articles: articlesData || [],
      threads: threadsData || [],
      users: usersData || [],
      collections: collectionsData || [],
      query,
    };
  } catch (error) {
    console.error('Error performing global search:', error.message);
    throw error;
  }
}

/**
 * Search for specific entity types.
 * @param {string} query - Search query string
 * @param {string} type - Entity type: 'instruments', 'articles', 'threads', 'users', 'collections'
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of matching results
 */
export async function searchByType(query, type, options = {}) {
  try {
    const { offset = 0, limit = 20 } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;

    switch (type) {
      case 'instruments':
        return await searchInstrumentsByQuery(searchTerm, offset, limit);

      case 'articles':
        return await searchArticlesByQuery(searchTerm, offset, limit);

      case 'threads':
        return await searchThreadsByQuery(searchTerm, offset, limit);

      case 'users':
        return await searchUsersByQuery(searchTerm, offset, limit);

      case 'collections':
        return await searchCollectionsByQuery(searchTerm, offset, limit);

      default:
        throw new Error(`Unknown search type: ${type}`);
    }
  } catch (error) {
    console.error(`Error searching ${type}:`, error.message);
    throw error;
  }
}

/**
 * Internal function to search instruments.
 */
async function searchInstrumentsByQuery(term, offset, limit) {
  const { data, error } = await supabase
    .from('instruments')
    .select(`
      id,
      make,
      model,
      year,
      description,
      main_image_url,
      is_featured,
      created_at
    `)
    .or(`make.ilike.${term},model.ilike.${term},description.ilike.${term}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Internal function to search articles.
 */
async function searchArticlesByQuery(term, offset, limit) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      author_id,
      published_at,
      view_count
    `)
    .eq('status', 'published')
    .or(`title.ilike.${term},content.ilike.${term},excerpt.ilike.${term}`)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Internal function to search forum threads.
 */
async function searchThreadsByQuery(term, offset, limit) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(`
      id,
      title,
      slug,
      category_id,
      author_id,
      reply_count,
      created_at
    `)
    .ilike('title', term)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Internal function to search users.
 */
async function searchUsersByQuery(term, offset, limit) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      avatar_url,
      is_verified,
      is_luthier
    `)
    .ilike('username', term)
    .order('username', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Internal function to search collections.
 */
async function searchCollectionsByQuery(term, offset, limit) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id,
      name,
      description,
      cover_image_url,
      user_id,
      is_public,
      created_at
    `)
    .eq('is_public', true)
    .or(`name.ilike.${term},description.ilike.${term}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}
