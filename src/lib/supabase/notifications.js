import { supabase } from './client';

/**
 * Notifications service — for managing user notifications.
 *
 * DB schema (notifications table):
 *   id UUID, user_id UUID, type VARCHAR(50), title VARCHAR(255),
 *   message TEXT, data JSONB, read BOOLEAN, created_at TIMESTAMPTZ
 *
 * Schema changes from previous version:
 * - body → message
 * - is_read → read
 */

/**
 * Fetch all notifications for the current user, ordered by created_at descending.
 */
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Count unread notifications for a user.
 */
export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark all unread notifications as read for a user.
 */
export async function markAllAsRead(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
    .select();

  if (error) throw error;
  return data || [];
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

/**
 * Create a new notification.
 *
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - Recipient user UUID
 * @param {string} params.type - Notification type
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {Object} params.data - Optional JSONB data
 */
export async function createNotification({ userId, type, title, message, data = null }) {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return notification;
}
