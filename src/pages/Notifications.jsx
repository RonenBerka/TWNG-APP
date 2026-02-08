import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Bell, BellOff, Check, CheckCheck, Trash2,
  Guitar, ArrowRight, Shield, MessageSquare, Heart, AlertTriangle,
  Loader2, Inbox, Clock, User, FileText
} from 'lucide-react';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications, markAsRead, markAllAsRead, deleteNotification
} from '../lib/supabase/notifications';

// Notification type config
const TYPE_CONFIG = {
  transfer_incoming: { icon: ArrowRight, color: '#3B82F6', label: 'Transfer Request' },
  transfer_accepted: { icon: Check, color: '#34D399', label: 'Transfer Accepted' },
  transfer_declined: { icon: AlertTriangle, color: '#EF4444', label: 'Transfer Declined' },
  transfer_completed: { icon: CheckCheck, color: '#34D399', label: 'Transfer Completed' },
  change_request_approved: { icon: Shield, color: '#34D399', label: 'Change Approved' },
  change_request_denied: { icon: AlertTriangle, color: '#EF4444', label: 'Change Denied' },
  comment: { icon: MessageSquare, color: '#A855F7', label: 'Comment' },
  love: { icon: Heart, color: '#F43F5E', label: 'Love' },
  verification: { icon: Shield, color: '#34D399', label: 'Verification' },
  system: { icon: Bell, color: T.txtM, label: 'System' },
  claim_approved: { icon: Guitar, color: '#34D399', label: 'Claim Approved' },
  claim_denied: { icon: AlertTriangle, color: '#EF4444', label: 'Claim Denied' },
  article: { icon: FileText, color: '#F59E0B', label: 'Article' },
};

function NotificationItem({ notification, onMarkRead, onDelete }) {
  const [acting, setActing] = useState(false);
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const Icon = config.icon;
  const isUnread = !notification.read;
  const timeAgo = getTimeAgo(notification.created_at);

  const handleMarkRead = async (e) => {
    e.stopPropagation();
    setActing(true);
    try { await onMarkRead(notification.id); }
    finally { setActing(false); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setActing(true);
    try { await onDelete(notification.id); }
    finally { setActing(false); }
  };

  // Build link from notification data
  const linkTo = notification.data?.link || null;
  const Wrapper = linkTo ? Link : 'div';
  const wrapperProps = linkTo
    ? { to: linkTo, style: { textDecoration: 'none', color: 'inherit' } }
    : {};

  return (
    <Wrapper {...wrapperProps}>
      <div
        style={{
          display: 'flex', gap: '14px', padding: '16px',
          borderRadius: '12px', backgroundColor: isUnread ? `${config.color}08` : T.bgCard,
          border: `1px solid ${isUnread ? `${config.color}25` : T.border}`,
          cursor: linkTo ? 'pointer' : 'default',
          transition: 'all 150ms',
          opacity: acting ? 0.6 : 1,
        }}
      >
        {/* Icon */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          backgroundColor: `${config.color}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={config.color} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div>
              <span style={{
                fontSize: '11px', fontFamily: "'JetBrains Mono', monospace",
                color: config.color, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {config.label}
              </span>
              {isUnread && (
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: config.color, display: 'inline-block',
                  marginLeft: '6px', verticalAlign: 'middle',
                }} />
              )}
            </div>
            <span style={{
              fontSize: '11px', color: T.txtM,
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {timeAgo}
            </span>
          </div>

          <p style={{
            fontSize: '14px', fontWeight: isUnread ? 600 : 400, color: T.txt,
            margin: '6px 0 0', lineHeight: 1.5,
          }}>
            {notification.title || notification.message || 'Notification'}
          </p>

          {notification.body && (
            <p style={{
              fontSize: '13px', color: T.txt2, margin: '4px 0 0',
              lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {notification.body}
            </p>
          )}

          {/* Actor info */}
          {notification.data?.actor_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <User size={12} color={T.txtM} />
              <span style={{ fontSize: '12px', color: T.txtM }}>
                {notification.data.actor_name}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
          {isUnread && (
            <button
              onClick={handleMarkRead}
              title="Mark as read"
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: `1px solid ${T.border}`, backgroundColor: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Check size={13} color={T.txt2} />
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Delete"
            style={{
              width: '28px', height: '28px', borderRadius: '6px',
              border: `1px solid ${T.border}`, backgroundColor: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={13} color={T.txtM} />
          </button>
        </div>
      </div>
    </Wrapper>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | unread

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('[Notifications] Fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayList = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: '100vh' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Back link */}
        <Link to="/settings" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', color: T.txt2,
          textDecoration: 'none', fontSize: '14px', fontWeight: 500, marginBottom: '32px',
        }}>
          <ArrowLeft size={18} /> Back to settings
        </Link>

        {/* Title + Mark All Read */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '32px',
            fontWeight: 700, color: T.txt, margin: 0,
          }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: `${T.warm}15`, border: `1px solid ${T.warm}40`, color: T.warm,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <p style={{ color: T.txt2, fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px' }}>
          Stay updated on transfers, comments, and more.
        </p>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px', borderRadius: '10px',
          backgroundColor: T.bgCard, border: `1px solid ${T.border}`, marginBottom: '24px',
        }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, border: 'none', cursor: 'pointer',
              backgroundColor: filter === f.key ? T.warm : 'transparent',
              color: filter === f.key ? T.bgDeep : T.txt2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 150ms',
            }}>
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span style={{
                  minWidth: '18px', height: '18px', borderRadius: '9px', fontSize: '10px',
                  fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: filter === f.key ? T.bgDeep : T.warm,
                  color: filter === f.key ? T.warm : T.bgDeep,
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <Loader2 size={28} color={T.warm} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: '16px', borderRadius: '12px', backgroundColor: '#EF444410',
            border: '1px solid #EF444425', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={18} color="#EF4444" />
            <span style={{ fontSize: '13px', color: '#EF4444' }}>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayList.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            padding: '64px 24px', textAlign: 'center',
          }}>
            <BellOff size={40} color={T.txtM} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: T.txt, margin: 0 }}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p style={{ fontSize: '13px', color: T.txtM, margin: 0 }}>
              {filter === 'unread'
                ? "You've read all your notifications."
                : "When something happens, you'll see it here."}
            </p>
          </div>
        )}

        {/* Notification list */}
        {!loading && !error && displayList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayList.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
