import { useState, useEffect, useRef } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../theme/tokens';
import { useAuth } from '../../context/AuthContext';
import { getConversations, getUnreadMessageCount } from '../../lib/supabase/messaging';
import { supabase } from '../../lib/supabase/client';

/**
 * MessageDropdown — MessageSquare icon with unread count and dropdown panel
 *
 * Features:
 *   - Shows unread message count badge
 *   - Dropdown with max 5 recent conversations
 *   - Real-time updates via Supabase subscription
 *   - Shows sender name and last message preview
 *   - Link to full /messages page
 */
export default function MessageDropdown() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch initial conversations and unread count
  useEffect(() => {
    if (!profile?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [convos, unread] = await Promise.all([
          getConversations(),
          getUnreadMessageCount(),
        ]);
        setConversations(convos);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`incoming_messages:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${profile.id}`,
        },
        () => {
          // Refetch conversations on new message
          getConversations()
            .then((convos) => setConversations(convos))
            .catch((error) => console.error('Error refetching conversations:', error));

          // Update unread count
          getUnreadMessageCount()
            .then((count) => setUnreadCount(count))
            .catch((error) => console.error('Error refetching unread count:', error));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const displayConversations = conversations.slice(0, 5);
  const hasUnread = unreadCount > 0;

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '(No message)';
    return message.length > maxLength
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Message Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: `1px solid ${T.border}`,
          backgroundColor: T.bgCard,
          color: T.txt,
          cursor: 'pointer',
          transition: 'all 0.2s',
          padding: '0',
          position: 'relative',
          fontFamily: "'DM Sans', sans-serif",
        }}
        title="Messages"
      >
        <MessageSquare size={18} strokeWidth={2} />

        {/* Unread Badge */}
        {hasUnread && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: T.error,
              color: '#fff',
              borderRadius: '9999px',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: "'DM Sans', sans-serif",
              border: `2px solid ${T.bgDeep}`,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '0',
            backgroundColor: T.bgCard,
            borderRadius: '12px',
            border: `1px solid ${T.border}`,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            minWidth: '360px',
            maxWidth: '400px',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3
              style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: T.txt,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Messages
            </h3>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '12px',
                  color: T.warm,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: '500',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Conversations List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: T.txt2,
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Loading...
              </div>
            ) : displayConversations.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: T.txt2,
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                No messages yet
              </div>
            ) : (
              displayConversations.map((conversation) => (
                <div
                  key={conversation.other_user?.id}
                  onClick={() => navigate(`/messages/${conversation.other_user?.id}`)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${T.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor:
                      conversation.unread_count > 0
                        ? `${T.warm}10`
                        : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${T.warm}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      conversation.unread_count > 0
                        ? `${T.warm}10`
                        : 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {/* Avatar */}
                    {conversation.other_user?.avatar_url ? (
                      <img
                        src={conversation.other_user.avatar_url}
                        alt={conversation.other_user?.username}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: T.border,
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* Conversation Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '2px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: conversation.unread_count > 0 ? '600' : '500',
                            color: T.txt,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {conversation.other_user?.username || 'Unknown User'}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: T.txtM,
                            fontFamily: "'DM Sans', sans-serif",
                            marginLeft: '8px',
                            flexShrink: 0,
                          }}
                        >
                          {formatTime(conversation.last_message_at)}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: T.txt2,
                          fontFamily: "'DM Sans', sans-serif",
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {truncateMessage(conversation.last_message)}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {conversation.unread_count > 0 && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: T.warm,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: `1px solid ${T.border}`,
              backgroundColor: T.bgElev,
            }}
          >
            <button
              onClick={() => {
                navigate('/messages');
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 0',
                border: 'none',
                backgroundColor: 'transparent',
                color: T.warm,
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.amber;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.warm;
              }}
            >
              View All Messages
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { MessageDropdown };
