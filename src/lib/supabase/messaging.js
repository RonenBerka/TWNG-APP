import { supabase } from './client';

/**
 * Messaging service — for managing direct messages and conversations.
 *
 * Provides functions to fetch conversations, send messages, retrieve message history,
 * mark messages as read, and subscribe to real-time updates. Thread IDs are deterministic
 * based on sorted user UUIDs to ensure consistent thread grouping.
 */

/**
 * Generate a deterministic thread ID from two user UUIDs.
 * Sorts the UUIDs alphabetically and combines them with an underscore.
 *
 * @param {string} userId1 - First user UUID
 * @param {string} userId2 - Second user UUID
 * @returns {string} Deterministic thread ID
 */
export function generateThreadId(userId1, userId2) {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

/**
 * Fetch all conversations for the current user, ordered by last message timestamp.
 * Returns unique conversations with the other user's info, last message, and unread count.
 *
 * @returns {Promise<Array>} Array of conversation objects with:
 *   - other_user: { id, username, display_name, avatar_url }
 *   - last_message: message content
 *   - last_message_at: timestamp
 *   - unread_count: number of unread messages in this thread
 */
export async function getConversations() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    // Fetch all messages where user is sender or recipient
    const { data: allMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, content, read_at, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;
    if (!allMessages || allMessages.length === 0) return [];

    // Group by thread_id and get latest message per thread
    const threadMap = new Map();
    allMessages.forEach((msg) => {
      const senderId = msg.sender_id;
      const recipientId = msg.recipient_id;
      const threadId = generateThreadId(senderId, recipientId);

      if (!threadMap.has(threadId)) {
        // Determine the other user's ID
        const otherUserId = senderId === user.id ? recipientId : senderId;
        threadMap.set(threadId, {
          threadId,
          otherUserId,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages for this thread (where user is recipient)
      if (msg.recipient_id === user.id && msg.read_at === null) {
        threadMap.get(threadId).unreadCount += 1;
      }
    });

    // Collect unique other user IDs
    const otherUserIds = Array.from(threadMap.values()).map((t) => t.otherUserId);

    // Batch fetch other users' profiles
    const { data: otherUsers, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url')
      .in('id', otherUserIds);

    if (usersError) throw usersError;

    const userMap = new Map();
    (otherUsers || []).forEach((u) => {
      userMap.set(u.id, u);
    });

    // Build final conversations array
    const conversations = Array.from(threadMap.values())
      .map((thread) => ({
        thread_id: thread.threadId,
        other_user: userMap.get(thread.otherUserId),
        last_message: thread.lastMessage.content,
        last_message_at: thread.lastMessage.created_at,
        unread_count: thread.unreadCount,
      }))
      .sort(
        (a, b) =>
          new Date(b.last_message_at) - new Date(a.last_message_at)
      );

    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Fetch all messages for a given thread, ordered by created_at ascending.
 * Includes sender information for each message.
 *
 * @param {string} threadId - The thread ID
 * @returns {Promise<Array>} Array of message objects with sender info
 */
export async function getMessages(threadId) {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        recipient_id,
        content,
        read_at,
        created_at,
        sender:sender_id(id, username, display_name, avatar_url)
        `
      )
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;
    return messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Send a new message to a recipient.
 * Automatically determines the sender (current user) and thread ID.
 *
 * @param {Object} params - Message parameters
 * @param {string} params.recipientId - The recipient's user ID
 * @param {string} params.content - The message content
 * @returns {Promise<Object>} The created message object
 */
export async function sendMessage({ recipientId, content }) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const threadId = generateThreadId(user.id, recipientId);

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        thread_id: threadId,
        content,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Mark all messages in a thread as read for the current user.
 * Updates read_at timestamp for messages where user is recipient.
 *
 * @param {string} threadId - The thread ID
 * @returns {Promise<Array>} Updated message objects
 */
export async function markThreadAsRead(threadId) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const { data: messages, error: updateError } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('recipient_id', user.id)
      .is('read_at', null)
      .select();

    if (updateError) throw updateError;
    return messages || [];
  } catch (error) {
    console.error('Error marking thread as read:', error);
    throw error;
  }
}

/**
 * Count unread messages for the current user.
 *
 * @returns {Promise<number>} The number of unread messages
 */
export async function getUnreadMessageCount() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const { count, error: countError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .is('read_at', null);

    if (countError) throw countError;
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    throw error;
  }
}

/**
 * Search messages by content within conversations.
 * Returns unique thread IDs that contain matching messages.
 *
 * @param {string} query - Search query term
 * @returns {Promise<Array>} Array of thread IDs with matching messages
 */
export async function searchConversations(query) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const { data: messages, error: searchError } = await supabase
      .from('messages')
      .select('thread_id')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .ilike('content', `%${query}%`);

    if (searchError) throw searchError;

    // Return unique thread IDs
    const uniqueThreadIds = [...new Set((messages || []).map((m) => m.thread_id))];
    return uniqueThreadIds;
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
}

/**
 * Subscribe to messages in a specific thread via Realtime.
 * Calls the callback function on INSERT events.
 *
 * @param {string} threadId - The thread ID to subscribe to
 * @param {Function} callback - Function to call on new messages: (event) => {}
 * @returns {Object} The subscription channel (call .unsubscribe() to stop)
 */
export function subscribeToMessages(threadId, callback) {
  try {
    const channel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        callback
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    throw error;
  }
}

/**
 * Subscribe to new messages for the current user.
 * Useful for updating the conversation list in real-time.
 * Listens for all INSERT events where recipient is the current user.
 *
 * @param {Function} callback - Function to call on new messages: (event) => {}
 * @returns {Promise<Object>} The subscription channel (call .unsubscribe() to stop)
 */
export async function subscribeToNewConversations(callback) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const channel = supabase
      .channel(`new_messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        callback
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Error subscribing to new conversations:', error);
    throw error;
  }
}
