import { supabase } from './client';

/**
 * Notifications service — for managing user notifications.
 *
 * Provides functions to fetch, count, mark as read, and delete notifications
 * for the current authenticated user. Notifications are ordered by creation time
 * and support batch operations for marking multiple notifications as read.
 */

/**
 * Fetch all notifications for the current user, ordered by created_at descending.
 */
export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Count unread notifications for the current user.
 */
export async function getUnreadCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false);

  if (error) throw error;
  return count;
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark all unread notifications as read for the current user.
 */
export async function markAllAsRead() {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('read', false)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Delete a notification by ID.
 */
export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}
