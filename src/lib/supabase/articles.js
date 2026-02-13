import { supabase } from './client.js';

/**
 * Articles service — for managing blog articles and their publication.
 *
 * Provides functions to CRUD articles, manage publication state, track views,
 * and fetch articles by various filters.
 */

/**
 * Get all articles with optional filtering.
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @param {boolean} options.publishedOnly - Filter to published articles only
 * @returns {Promise<Array>} Array of article objects
 */
export async function getArticles(options = {}) {
  try {
    const { offset = 0, limit = 20, publishedOnly = true } = options;
    let query = supabase.from('articles').select('*');

    if (publishedOnly) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching articles:', error.message);
    throw error;
  }
}

/**
 * Get a single article by ID.
 * @param {string} articleId - The article ID
 * @returns {Promise<Object>} Article object
 */
export async function getArticle(articleId) {
  try {
    // READ by ID — article may not exist
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching article:', error.message);
    throw error;
  }
}

/**
 * Get an article by its URL slug.
 * @param {string} slug - The article slug
 * @returns {Promise<Object>} Article object
 */
export async function getArticleBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      // READ by slug — article may not exist
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching article by slug:', error.message);
    throw error;
  }
}

/**
 * Create a new article.
 * @param {string} authorId - The author's user ID
 * @param {Object} articleData - Article content
 * @param {string} articleData.title - Article title
 * @param {string} articleData.slug - URL slug (unique)
 * @param {string} articleData.content - Article body content
 * @param {string} articleData.excerpt - Short description
 * @param {string} articleData.cover_image_url - Cover image URL
 * @returns {Promise<Object>} Created article
 */
export async function createArticle(authorId, articleData) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert({
        author_id: authorId,
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        excerpt: articleData.excerpt || null,
        cover_image_url: articleData.cover_image_url || null,
        is_published: false,
        status: 'draft',
        view_count: 0,
        likes_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating article:', error.message);
    throw error;
  }
}

/**
 * Update an existing article.
 * @param {string} articleId - The article ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated article
 */
export async function updateArticle(articleId, updates) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating article:', error.message);
    throw error;
  }
}

/**
 * Delete an article by ID.
 * @param {string} articleId - The article ID to delete
 * @returns {Promise<void>}
 */
export async function deleteArticle(articleId) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting article:', error.message);
    throw error;
  }
}

/**
 * Publish an article (set status to published and timestamp).
 * @param {string} articleId - The article ID
 * @returns {Promise<Object>} Updated article
 */
export async function publishArticle(articleId) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'published',
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error publishing article:', error.message);
    throw error;
  }
}

/**
 * Get articles filtered by category.
 * @param {string} category - The category name/value
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @returns {Promise<Array>} Array of articles in that category
 */
export async function getArticlesByCategory(category, options = {}) {
  try {
    const { offset = 0, limit = 20 } = options;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching articles by category:', error.message);
    throw error;
  }
}

/**
 * Increment the view count for an article.
 * @param {string} articleId - The article ID
 * @returns {Promise<number>} New view count
 */
export async function incrementArticleView(articleId) {
  try {
    // Fetch current view count
    // READ by ID — article may not exist
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', articleId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const newCount = (article.view_count || 0) + 1;

    // Update with new count
    const { data, error: updateError } = await supabase
      .from('articles')
      .update({ view_count: newCount })
      .eq('id', articleId)
      .select('view_count')
      .single();

    if (updateError) throw updateError;
    return data.view_count;
  } catch (error) {
    console.error('Error incrementing article view:', error.message);
    throw error;
  }
}
