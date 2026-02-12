import { supabase } from './client';

/**
 * Messaging service — for managing direct messages and conversations.
 *
 * Provides functions to fetch conversations, send messages, retrieve message history,
 * mark messages as read, and subscribe to real-time updates.
 *
 * Schema changes from previous version:
 * - Removed: thread_id column (group by sender/recipient pairs instead)
 * - Changed: read_at (timestamp) → is_read (boolean)
 * - Table name: messages (unchanged)
 */

/**
 * Fetch all conversations for the current user, ordered by last message timestamp.
 * Returns unique conversations with the other user's info, last message, and unread count.
 * Groups by sender/recipient pairs rather than thread_id.
 *
 * @returns {Promise<Array>} Array of conversation objects with:
 *   - other_user: { id, username, avatar_url }
 *   - last_message: message content
 *   - last_message_at: timestamp
 *   - unread_count: number of unread messages in this conversation
 */
export async function getConversations() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    // Fetch all messages where user is sender or recipient, ordered by recency
    const { data: allMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, content, is_read, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;
    if (!allMessages || allMessages.length === 0) return [];

    // Group by sender/recipient pair (not thread_id)
    const conversationMap = new Map();
    allMessages.forEach((msg) => {
      const senderId = msg.sender_id;
      const recipientId = msg.recipient_id;

      // Create a conversation key (sorted pair of IDs for consistency)
      const conversationKey = [senderId, recipientId].sort().join(':');

      if (!conversationMap.has(conversationKey)) {
        // Determine the other user's ID
        const otherUserId = senderId === user.id ? recipientId : senderId;
        conversationMap.set(conversationKey, {
          otherUserId,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages for this conversation (where user is recipient)
      if (msg.recipient_id === user.id && !msg.is_read) {
        conversationMap.get(conversationKey).unreadCount += 1;
      }
    });

    // Collect unique other user IDs
    const otherUserIds = Array.from(conversationMap.values()).map((c) => c.otherUserId);

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
    const conversations = Array.from(conversationMap.values())
      .map((conversation) => ({
        other_user: userMap.get(conversation.otherUserId),
        last_message: conversation.lastMessage.content,
        last_message_at: conversation.lastMessage.created_at,
        unread_count: conversation.unreadCount,
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
 * Fetch all messages between two users, ordered by created_at ascending.
 * Includes sender information for each message.
 *
 * @param {string} userId1 - First user UUID
 * @param {string} userId2 - Second user UUID
 * @returns {Promise<Array>} Array of message objects with sender info
 */
export async function getMessages(userId1, userId2) {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        sender:sender_id(id, username, display_name, avatar_url)
        `
      )
      .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
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
 * Automatically determines the sender (current user).
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

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        is_read: false,
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
 * Mark all messages from a sender as read for the current user.
 * Updates is_read flag for messages where user is recipient.
 *
 * @param {string} senderId - The sender's user ID
 * @returns {Promise<Array>} Updated message objects
 */
export async function markConversationAsRead(senderId) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const { data: messages, error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('recipient_id', user.id)
      .eq('is_read', false)
      .select();

    if (updateError) throw updateError;
    return messages || [];
  } catch (error) {
    console.error('Error marking conversation as read:', error);
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
      .eq('is_read', false);

    if (countError) throw countError;
    return count || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    throw error;
  }
}

/**
 * Search messages by content within conversations.
 * Returns conversation partners of matching messages.
 *
 * @param {string} query - Search query term
 * @returns {Promise<Array>} Array of user IDs with matching messages
 */
export async function searchConversations(query) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const { data: messages, error: searchError } = await supabase
      .from('messages')
      .select('sender_id, recipient_id')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .ilike('content', `%${query}%`);

    if (searchError) throw searchError;

    // Return unique conversation partner IDs
    const partnerIds = new Set();
    (messages || []).forEach((m) => {
      partnerIds.add(m.sender_id === user.id ? m.recipient_id : m.sender_id);
    });
    return Array.from(partnerIds);
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
}

/**
 * Subscribe to messages with a specific user via Realtime.
 * Calls the callback function on INSERT events.
 *
 * @param {string} userId - The conversation partner's user ID
 * @param {Function} callback - Function to call on new messages: (event) => {}
 * @returns {Object} The subscription channel (call .unsubscribe() to stop)
 */
export async function subscribeToConversation(userId, callback) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const channel = supabase
      .channel(`messages:${user.id}:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},recipient_id=eq.${userId}),and(sender_id=eq.${userId},recipient_id=eq.${user.id}))`,
        },
        callback
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Error subscribing to conversation:', error);
    throw error;
  }
}

/**
 * Subscribe to all new incoming messages for the current user.
 * Useful for updating the conversation list in real-time.
 * Listens for all INSERT events where recipient is the current user.
 *
 * @param {Function} callback - Function to call on new messages: (event) => {}
 * @returns {Promise<Object>} The subscription channel (call .unsubscribe() to stop)
 */
export { markConversationAsRead as markThreadAsRead };
export { subscribeToConversation as subscribeToMessages };
export { subscribeToIncomingMessages as subscribeToNewConversations };

/**
 * Generate a thread ID from two user IDs (deterministic ordering).
 */
export function generateThreadId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

export async function subscribeToIncomingMessages(callback) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No authenticated user');

    const channel = supabase
      .channel(`incoming_messages:${user.id}`)
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
    console.error('Error subscribing to incoming messages:', error);
    throw error;
  }
}
