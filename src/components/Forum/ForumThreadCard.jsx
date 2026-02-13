import { MessageCircle, Eye, Lock, Pin } from 'lucide-react';
import { T } from '../../theme/tokens';
import Badge from '../ui/Badge';
import { Link } from 'react-router-dom';
import { forumThreadPath } from '../../lib/routes';

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function ForumThreadCard({ thread }) {
  const {
    id,
    title,
    author,
    created_at,
    reply_count = 0,
    view_count = 0,
    is_pinned = false,
    is_locked = false,
    last_activity,
  } = thread;

  return (
    <Link to={forumThreadPath(id)} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        padding: "16px",
        transition: "all 0.3s",
        cursor: "pointer",
      }}>
        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}>
          {/* Indicators */}
          <div style={{
            display: "flex",
            gap: "6px",
            paddingTop: "2px",
          }}>
            {is_pinned && (
              <Pin size={16} style={{ color: T.warm, flexShrink: 0 }} />
            )}
            {is_locked && (
              <Lock size={16} style={{ color: T.txtM, flexShrink: 0 }} />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              color: T.txt,
              marginBottom: "8px",
              wordBreak: "break-word",
            }}>
              {title}
            </h3>
            <div style={{
              display: "flex",
              gap: "12px",
              fontSize: "12px",
              color: T.txtM,
              marginBottom: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}>
              <span>by <span style={{ color: T.txt2 }}>{author}</span></span>
              <span>·</span>
              <span>{getTimeAgo(created_at)}</span>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex",
              gap: "16px",
              fontSize: "12px",
              color: T.txtM,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <MessageCircle size={14} style={{ color: T.warm }} />
                <span>{reply_count} {reply_count === 1 ? 'reply' : 'replies'}</span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <Eye size={14} style={{ color: T.amber }} />
                <span>{view_count} {view_count === 1 ? 'view' : 'views'}</span>
              </div>
              {last_activity && (
                <>
                  <span>·</span>
                  <span>Last activity {getTimeAgo(last_activity)}</span>
                </>
              )}
            </div>
          </div>

          {/* Status Badges */}
          <div style={{
            display: "flex",
            gap: "6px",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: 0,
          }}>
            {is_pinned && <Badge variant="default">Pinned</Badge>}
            {is_locked && <Badge variant="outline">Locked</Badge>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export { default } from './ForumThreadCard';
