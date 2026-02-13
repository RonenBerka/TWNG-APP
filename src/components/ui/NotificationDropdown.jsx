import { useState, useEffect, useRef } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../theme/tokens';
import { ROUTES } from '../../lib/routes';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAsRead, getUnreadCount } from '../../lib/supabase/notifications';
import { supabase } from '../../lib/supabase/client';

/**
 * NotificationDropdown — Bell icon with unread badge and dropdown panel
 *
 * Features:
 *   - Shows unread notification count badge
 *   - Dropdown with max 5 recent notifications
 *   - Real-time updates via Supabase subscription
 *   - Click to mark as read
 *   - Link to full /notifications page
 */
export default function NotificationDropdown() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch initial notifications and unread count
  useEffect(() => {
    if (!profile?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [notifs, unread] = await Promise.all([
          getNotifications(profile.id),
          getUnreadCount(profile.id),
        ]);
        setNotifications(notifs);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          // Add new notification to the beginning of the list
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
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

  const handleNotificationClick = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const displayNotifications = notifications.slice(0, 5);
  const hasUnread = unreadCount > 0;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon Button */}
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
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} />

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
              Notifications
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
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
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
            ) : displayNotifications.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: T.txt2,
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                No notifications yet
              </div>
            ) : (
              displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${T.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: notification.read ? 'transparent' : `${T.warm}10`,
                    ':hover': {
                      backgroundColor: `${T.warm}15`,
                    },
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${T.warm}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.read
                      ? 'transparent'
                      : `${T.warm}10`;
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: T.warm,
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: T.txt,
                          fontFamily: "'DM Sans', sans-serif",
                          marginBottom: '2px',
                        }}
                      >
                        {notification.title}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: T.txt2,
                          fontFamily: "'DM Sans', sans-serif",
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notification.message}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: T.txtM,
                          fontFamily: "'DM Sans', sans-serif",
                          marginTop: '4px',
                        }}
                      >
                        {new Date(notification.created_at).toLocaleDateString()}
                      </div>
                    </div>
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
                navigate(ROUTES.NOTIFICATIONS);
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
              View All Notifications
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { NotificationDropdown };
