/**
 * Comments service layer — handles polymorphic comments for multiple entities.
 * Updated for Lovable schema migration:
 * - guitar_comments → comments table (polymorphic)
 * - guitar_id → target_id + target_type (article, instrument, collection)
 * - Supports parent_comment_id for threaded replies
 * - Removed comment_likes (doesn't exist in new schema)
 */

import { supabase } from './client';

// ─────────────────────────────────────────────────────
// GET COMMENTS
// ─────────────────────────────────────────────────────

/**
 * Get all comments for a target (instrument, article, or collection)
 * @param {string} targetType - 'instrument', 'article', or 'collection'
 * @param {string} targetId - UUID of the target entity
 * @param {Object} options - { parentOnly, limit, offset }
 */
export async function getComments(targetType, targetId, options = {}) {
  const { parentOnly = true, limit = 50, offset = 0 } = options;

  try {
    let query = supabase
      .from('comments')
      .select('*, author:user_id (id, username, avatar_url, is_verified)')
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (parentOnly) {
      query = query.is('parent_comment_id', null);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      comments: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.error('getComments error:', err);
    return { comments: [], total: 0 };
  }
}

/**
 * Get a single comment with all its replies
 * @param {string} commentId - UUID of the parent comment
 */
export async function getCommentThread(commentId) {
  try {
    // Get parent comment
    const { data: parent, error: parentErr } = await supabase
      .from('comments')
      .select('*, author:user_id (id, username, avatar_url, is_verified)')
      .eq('id', commentId)
      .single();

    if (parentErr && parentErr.code !== 'PGRST116') throw parentErr;
    if (!parent) return null;

    // Get all replies
    const { data: replies, error: repliesErr } = await supabase
      .from('comments')
      .select('*, author:user_id (id, username, avatar_url, is_verified)')
      .eq('parent_comment_id', commentId)
      .order('created_at', { ascending: true });

    if (repliesErr) throw repliesErr;

    return {
      ...parent,
      replies: replies || [],
    };
  } catch (err) {
    console.error('getCommentThread error:', err);
    return null;
  }
}

/**
 * Get reply count for a comment
 */
export async function getReplyCount(commentId) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('parent_comment_id', commentId);

    if (error) return 0;
    return count || 0;
  } catch (err) {
    console.error('getReplyCount error:', err);
    return 0;
  }
}

/**
 * Get total comment count for a target
 */
export async function getCommentCount(targetType, targetId) {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .is('parent_comment_id', null); // Only count top-level comments

    if (error) return 0;
    return count || 0;
  } catch (err) {
    console.error('getCommentCount error:', err);
    return 0;
  }
}

// ─────────────────────────────────────────────────────
// CREATE COMMENTS
// ─────────────────────────────────────────────────────

/**
 * Create a new comment
 * @param {Object} commentData - { user_id, target_type, target_id, content, parent_comment_id? }
 */
export async function createComment(commentData) {
  const {
    user_id,
    target_type,
    target_id,
    content,
    parent_comment_id = null,
  } = commentData;

  try {
    // Validate target_type
    const validTypes = ['article', 'instrument', 'collection'];
    if (!validTypes.includes(target_type)) {
      throw new Error(`Invalid target_type: ${target_type}`);
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id,
        target_type,
        target_id,
        content,
        parent_comment_id,
        is_edited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*, author:user_id (id, username, avatar_url, is_verified)')
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createComment error:', err);
    return null;
  }
}

/**
 * Create a reply to a comment
 * @param {Object} replyData - { user_id, target_type, target_id, content, parent_comment_id }
 */
export async function createReply(replyData) {
  const {
    user_id,
    target_type,
    target_id,
    content,
    parent_comment_id,
  } = replyData;

  if (!parent_comment_id) {
    throw new Error('parent_comment_id is required for replies');
  }

  return createComment({
    user_id,
    target_type,
    target_id,
    content,
    parent_comment_id,
  });
}

// ─────────────────────────────────────────────────────
// UPDATE COMMENTS
// ─────────────────────────────────────────────────────

/**
 * Update a comment
 * @param {string} commentId - UUID of the comment
 * @param {Object} updates - { content, is_edited }
 */
export async function updateComment(commentId, updates) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({
        ...updates,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select('*, author:user_id (id, username, avatar_url, is_verified)')
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateComment error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────
// DELETE COMMENTS
// ─────────────────────────────────────────────────────

/**
 * Delete a comment (soft delete via update, or hard delete)
 * @param {string} commentId - UUID of the comment
 * @param {boolean} hardDelete - If true, permanently delete; if false, just mark as deleted
 */
export async function deleteComment(commentId, hardDelete = false) {
  try {
    if (hardDelete) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } else {
      // Soft delete: update content to "[deleted]"
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: '[deleted]',
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return true;
    }
  } catch (err) {
    console.error('deleteComment error:', err);
    return false;
  }
}

/**
 * Delete all replies to a comment
 * @param {string} commentId - UUID of the parent comment
 * @param {boolean} hardDelete - Hard or soft delete
 */
export async function deleteCommentReplies(commentId, hardDelete = false) {
  try {
    const { data: replies, error: fetchErr } = await supabase
      .from('comments')
      .select('id')
      .eq('parent_comment_id', commentId);

    if (fetchErr) throw fetchErr;

    if (!replies || replies.length === 0) return true;

    // Delete all replies
    for (const reply of replies) {
      await deleteComment(reply.id, hardDelete);
    }

    return true;
  } catch (err) {
    console.error('deleteCommentReplies error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// LEGACY COMPATIBILITY (for migration from guitar_comments)
// ─────────────────────────────────────────────────────

/**
 * Legacy: Get comments for an instrument (old guitar_comments API)
 * @deprecated Use getComments('instrument', instrumentId) instead
 */
export async function getInstrumentComments(instrumentId) {
  return getComments('instrument', instrumentId, { parentOnly: true });
}

/**
 * Legacy: Get comments for an article
 * @deprecated Use getComments('article', articleId) instead
 */
export async function getArticleComments(articleId) {
  return getComments('article', articleId, { parentOnly: true });
}

/**
 * Legacy: Add a comment (maps to old guitar_comments addComment)
 * @deprecated Use createComment() instead
 */
export async function addComment(targetType, targetId, userId, text) {
  return createComment({
    user_id: userId,
    target_type: targetType,
    target_id: targetId,
    content: text,
  });
}

/**
 * Legacy: Get comment count for an instrument
 * @deprecated Use getCommentCount('instrument', instrumentId) instead
 */
export async function getCommentCountForInstrument(instrumentId) {
  return getCommentCount('instrument', instrumentId);
}

/**
 * Legacy: Get comment count for an article
 * @deprecated Use getCommentCount('article', articleId) instead
 */
export async function getCommentCountForArticle(articleId) {
  return getCommentCount('article', articleId);
}
