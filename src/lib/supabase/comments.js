import { supabase } from './client';

// Fetch comments for a guitar
export async function getGuitarComments(guitarId) {
  const { data, error } = await supabase
    .from('guitar_comments')
    .select('*, author:users(id, display_name, username, avatar_url)')
    .eq('guitar_id', guitarId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Add a comment
export async function addComment(guitarId, userId, text) {
  const { data, error } = await supabase
    .from('guitar_comments')
    .insert({ guitar_id: guitarId, user_id: userId, text })
    .select('*, author:users(id, display_name, username, avatar_url)')
    .single();
  if (error) throw error;
  return data;
}

// Like a comment
export async function toggleCommentLike(commentId, userId) {
  // Check if already liked
  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id);
    return false; // unliked
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
    return true; // liked
  }
}

// Get comment count for a guitar
export async function getCommentCount(guitarId) {
  const { count, error } = await supabase
    .from('guitar_comments')
    .select('id', { count: 'exact', head: true })
    .eq('guitar_id', guitarId);
  if (error) return 0;
  return count || 0;
}
