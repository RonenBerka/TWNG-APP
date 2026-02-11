import { supabase } from './client';

/**
 * Forum service — uses the forum_* tables (created by migration 012).
 *
 * Tables:
 * - forum_categories (with RLS: SELECT open to all)
 * - forum_threads   (with RLS: SELECT open to all)
 * - forum_posts     (with RLS: SELECT open to all)
 * - post_likes      (with RLS: SELECT open to all)
 *
 * NOTE: The older discussion_categories / discussion_posts tables exist but
 *       discussion_posts has RLS enabled with NO SELECT policy, making it
 *       unreadable. Migration 012 copied data into forum_* tables with
 *       proper RLS policies.
 */

/**
 * Fetch all forum categories, ordered by display_order.
 */
export async function getForumCategories() {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch forum threads with optional filtering, sorting, and pagination.
 */
export async function getForumThreads(
  categoryId,
  {
    sortBy = 'newest',
    searchQuery,
    page = 1,
    limit = 20,
  } = {}
) {
  let query = supabase
    .from('forum_threads')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      ),
      category:category_id (
        id, name, slug
      )
    `,
      { count: 'exact' }
    );

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }

  switch (sortBy) {
    case 'popular':
      query = query.order('reply_count', { ascending: false });
      break;
    case 'trending':
      query = query.order('view_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

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
 * Fetch a single forum thread by ID.
 */
export async function getForumThread(threadId) {
  const { data, error } = await supabase
    .from('forum_threads')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      ),
      category:category_id (
        id, name, slug
      )
    `
    )
    .eq('id', threadId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch posts (replies) for a given thread.
 */
export async function getForumPosts(
  threadId,
  {
    page = 1,
    limit = 50,
  } = {}
) {
  let query = supabase
    .from('forum_posts')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('thread_id', threadId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    posts: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Create a new forum thread.
 */
export async function createForumThread(categoryId, title, content) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('User not authenticated');

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      category_id: categoryId,
      author_id: user.id,
      title,
      slug,
      content,
      view_count: 0,
      reply_count: 0,
      is_pinned: false,
      is_locked: false,
      last_activity_at: new Date().toISOString(),
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
 * Create a reply in a forum thread.
 */
export async function createForumPost(threadId, content, parentPostId = null) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      thread_id: threadId,
      author_id: user.id,
      parent_post_id: parentPostId,
      content,
      is_solution: false,
      like_count: 0,
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

  // Update reply count and last_activity_at on the thread
  await supabase
    .from('forum_threads')
    .update({
      reply_count: supabase.rpc ? undefined : undefined, // handled below
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId);

  // Increment reply_count manually
  const { data: thread } = await supabase
    .from('forum_threads')
    .select('reply_count')
    .eq('id', threadId)
    .single();

  if (thread) {
    await supabase
      .from('forum_threads')
      .update({ reply_count: (thread.reply_count || 0) + 1 })
      .eq('id', threadId);
  }

  return data;
}

/**
 * Toggle a like on a forum post.
 */
export async function togglePostLike(postId) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('User not authenticated');

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase
      .from('post_likes')
      .delete()
      .eq('id', existing.id);

    // Decrement like_count
    const { data: post } = await supabase
      .from('forum_posts')
      .select('like_count')
      .eq('id', postId)
      .single();

    const newCount = Math.max(0, (post?.like_count || 1) - 1);
    await supabase
      .from('forum_posts')
      .update({ like_count: newCount })
      .eq('id', postId);

    return { liked: false, likeCount: newCount };
  } else {
    // Like
    await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id });

    // Increment like_count
    const { data: post } = await supabase
      .from('forum_posts')
      .select('like_count')
      .eq('id', postId)
      .single();

    const newCount = (post?.like_count || 0) + 1;
    await supabase
      .from('forum_posts')
      .update({ like_count: newCount })
      .eq('id', postId);

    return { liked: true, likeCount: newCount };
  }
}

/**
 * Mark a post as the solution for a thread.
 */
export async function markPostAsSolution(postId) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ is_solution: true })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Search forum threads by title.
 */
export async function searchForumThreads(
  query,
  {
    page = 1,
    limit = 20,
  } = {}
) {
  if (!query || query.trim().length === 0) {
    return { threads: [], total: 0, page, limit, totalPages: 0 };
  }

  let queryBuilder = supabase
    .from('forum_threads')
    .select(
      `
      *,
      author:author_id (
        id, username, display_name, avatar_url
      ),
      category:category_id (
        id, name, slug
      )
    `,
      { count: 'exact' }
    )
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false });

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

/**
 * Increment the view count for a forum thread.
 */
export async function incrementThreadView(threadId) {
  const { data: current } = await supabase
    .from('forum_threads')
    .select('view_count')
    .eq('id', threadId)
    .single();

  const { data, error } = await supabase
    .from('forum_threads')
    .update({ view_count: (current?.view_count || 0) + 1 })
    .eq('id', threadId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
