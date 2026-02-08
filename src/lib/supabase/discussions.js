import { supabase } from './client';

/**
 * Discussions service — for managing forum/discussion features.
 *
 * Provides functions to manage discussion categories, threads, replies, voting,
 * searching, and forum statistics. Supports full-text search via search_vector
 * with ilike fallback, sorting by multiple criteria, and pagination.
 */

/**
 * Fetch all discussion categories, ordered by position.
 * @returns {Promise<Array>} Array of discussion categories
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('discussion_categories')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all top-level discussion threads with optional filtering and sorting.
 * Includes author info from users table and handles pagination.
 *
 * @param {Object} options
 * @param {string} [options.categoryId] - Filter by category ID
 * @param {string} [options.sortBy='newest'] - Sort by: newest, popular (reply count), trending (upvote count)
 * @param {string} [options.searchQuery] - Search threads by title (ilike)
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Items per page
 * @returns {Promise<Object>} Object with threads array, total count, page info
 */
export async function getThreads({
  categoryId,
  sortBy = 'newest',
  searchQuery,
  page = 1,
  limit = 20,
} = {}) {
  let query = supabase
    .from('discussion_posts')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `,
      { count: 'exact' }
    )
    .is('parent_id', null)
    .eq('is_hidden', false);

  // Filter by category if provided
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  // Search by title
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  // Sorting
  switch (sortBy) {
    case 'popular':
      query = query.order('reply_count', { ascending: false });
      break;
    case 'trending':
      query = query.order('upvote_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    threads: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Fetch a single thread by ID with author information.
 *
 * @param {string} threadId - The ID of the thread
 * @returns {Promise<Object>} Thread object with author info
 */
export async function getThread(threadId) {
  const { data, error } = await supabase
    .from('discussion_posts')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `
    )
    .eq('id', threadId)
    .is('parent_id', null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all replies for a given thread, ordered by creation time ascending.
 * Includes author information for each reply.
 *
 * @param {string} threadId - The ID of the parent thread
 * @returns {Promise<Array>} Array of reply objects with author info
 */
export async function getThreadReplies(threadId) {
  const { data, error } = await supabase
    .from('discussion_posts')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `
    )
    .eq('parent_id', threadId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new top-level discussion thread.
 * Uses authenticated user's ID as author_id.
 *
 * @param {Object} threadData
 * @param {string} threadData.title - Thread title (required)
 * @param {string} threadData.content - Thread content (required)
 * @param {string} threadData.categoryId - Category ID (required)
 * @returns {Promise<Object>} Created thread object with author info
 */
export async function createThread({ title, content, categoryId }) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('discussion_posts')
    .insert({
      author_id: user.id,
      category_id: categoryId,
      title,
      content,
      parent_id: null,
    })
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a reply to an existing thread.
 * Increments the reply_count on the parent thread.
 *
 * @param {Object} replyData
 * @param {string} replyData.threadId - Parent thread ID (required)
 * @param {string} replyData.content - Reply content (required)
 * @returns {Promise<Object>} Created reply object with author info
 */
export async function createReply({ threadId, content }) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('User not authenticated');

  // Insert reply
  const { data, error } = await supabase
    .from('discussion_posts')
    .insert({
      author_id: user.id,
      parent_id: threadId,
      content,
    })
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `
    )
    .single();

  if (error) throw error;

  // Increment reply_count on parent thread
  const { error: updateError } = await supabase.rpc(
    'increment_reply_count',
    { post_id: threadId }
  );

  // If RPC doesn't exist, use manual update as fallback
  if (updateError) {
    const { data: parent } = await supabase
      .from('discussion_posts')
      .select('reply_count')
      .eq('id', threadId)
      .single();

    await supabase
      .from('discussion_posts')
      .update({ reply_count: (parent?.reply_count || 0) + 1 })
      .eq('id', threadId);
  }

  return data;
}

/**
 * Increment the upvote count for a thread.
 *
 * @param {string} threadId - The ID of the thread to upvote
 * @returns {Promise<Object>} Updated thread object
 */
export async function upvoteThread(threadId) {
  const { data: current } = await supabase
    .from('discussion_posts')
    .select('upvote_count')
    .eq('id', threadId)
    .single();

  const { data, error } = await supabase
    .from('discussion_posts')
    .update({ upvote_count: (current?.upvote_count || 0) + 1 })
    .eq('id', threadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch forum statistics including thread count, post count, and unique authors.
 *
 * @returns {Promise<Object>} Object with counts: totalThreads, totalPosts, totalAuthors
 */
export async function getForumStats() {
  // Count top-level threads (parent_id IS NULL)
  const { count: threadCount, error: threadError } = await supabase
    .from('discussion_posts')
    .select('id', { count: 'exact', head: true })
    .is('parent_id', null);

  if (threadError) throw threadError;

  // Count all posts (threads + replies)
  const { count: postCount, error: postError } = await supabase
    .from('discussion_posts')
    .select('id', { count: 'exact', head: true });

  if (postError) throw postError;

  // Count unique authors
  const { data: authors, error: authorError } = await supabase
    .from('discussion_posts')
    .select('author_id', { count: 'exact' });

  if (authorError) throw authorError;

  const uniqueAuthors = new Set(authors.map((p) => p.author_id)).size;

  return {
    totalThreads: threadCount || 0,
    totalPosts: postCount || 0,
    totalAuthors: uniqueAuthors,
  };
}

/**
 * Search threads using full-text search on search_vector, with ilike fallback.
 * Returns paginated results ordered by relevance.
 *
 * @param {Object} searchOptions
 * @param {string} searchOptions.query - Search query (required)
 * @param {number} [searchOptions.page=1] - Page number for pagination
 * @param {number} [searchOptions.limit=20] - Items per page
 * @returns {Promise<Object>} Object with threads array and pagination info
 */
export async function searchThreads({
  query,
  page = 1,
  limit = 20,
} = {}) {
  if (!query || query.trim().length === 0) {
    return {
      threads: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  let queryBuilder = supabase
    .from('discussion_posts')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `,
      { count: 'exact' }
    )
    .is('parent_id', null)
    .eq('is_hidden', false);

  // Try full-text search first, fall back to ilike
  try {
    queryBuilder = queryBuilder.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english',
    });
  } catch {
    // If full-text search fails, use ilike fallback
    queryBuilder = queryBuilder.ilike('title', `%${query}%`);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;
  return {
    threads: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}
