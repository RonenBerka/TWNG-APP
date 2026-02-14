import { useEffect, useState } from 'react';
import {
  Music,
  Folder,
  FileText,
  MessageCircle,
  Award,
  ChevronRight,
  Loader,
} from 'lucide-react';
import { T } from '../theme/tokens';
import { Link } from 'react-router-dom';
import { userPath } from '../lib/routes';
import { getActivityFeed } from '../services/activityFeed';

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

function getActivityIcon(iconType, size = 16) {
  const iconProps = { size, strokeWidth: 2 };
  const iconMap = {
    guitar: <Music {...iconProps} />,
    folder: <Folder {...iconProps} />,
    'file-text': <FileText {...iconProps} />,
    'message-circle': <MessageCircle {...iconProps} />,
    award: <Award {...iconProps} />,
    activity: <ChevronRight {...iconProps} />,
  };
  return iconMap[iconType] || iconMap.activity;
}

function ActivitySkeleton() {
  return (
    <div style={{
      display: "flex",
      gap: "12px",
      padding: "12px",
      backgroundColor: `${T.bgCard}80`,
      borderRadius: "8px",
      marginBottom: "8px",
    }}>
      <div style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: T.bgElev,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: "12px",
          backgroundColor: T.bgElev,
          borderRadius: "4px",
          marginBottom: "8px",
          width: "70%",
        }} />
        <div style={{
          height: "10px",
          backgroundColor: T.bgElev,
          borderRadius: "4px",
          width: "50%",
        }} />
      </div>
    </div>
  );
}

export default function ActivityFeed({ userId, username, limit = 5 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await getActivityFeed(userId, limit);
        setActivities(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading activity feed:', err);
        setError('Failed to load activity feed');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivity();
    }
  }, [userId, limit]);

  if (loading) {
    return (
      <div style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        padding: "16px",
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: T.txt,
          marginBottom: "12px",
        }}>
          Recent Activity
        </h3>
        <div>
          {[...Array(3)].map((_, i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        padding: "16px",
      }}>
        <p style={{
          fontSize: "14px",
          color: T.txtM,
          fontStyle: "italic",
        }}>
          {error}
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        padding: "16px",
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: T.txt,
          marginBottom: "12px",
        }}>
          Recent Activity
        </h3>
        <p style={{
          fontSize: "14px",
          color: T.txtM,
          fontStyle: "italic",
        }}>
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: T.bgCard,
      borderRadius: "12px",
      border: `1px solid ${T.border}`,
      padding: "16px",
    }}>
      <h3 style={{
        fontSize: "16px",
        fontWeight: "600",
        color: T.txt,
        marginBottom: "12px",
      }}>
        Recent Activity
      </h3>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        {activities.map((activity) => (
          <div
            key={activity.id}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              backgroundColor: `${T.bgElev}40`,
              borderRadius: "8px",
              borderLeft: `3px solid ${T.warm}`,
              transition: "all 0.2s",
            }}
          >
            {/* Icon */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: `${T.warm}20`,
              color: T.warm,
              flexShrink: 0,
            }}>
              {getActivityIcon(activity.icon, 14)}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontSize: "13px",
                fontWeight: "600",
                color: T.txt,
                marginBottom: "2px",
              }}>
                {activity.title}
              </h4>
              <p style={{
                fontSize: "12px",
                color: T.txt2,
                marginBottom: "4px",
              }}>
                {activity.description}
              </p>
              <p style={{
                fontSize: "11px",
                color: T.txtM,
              }}>
                {getTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {activities.length > 0 && (
        <Link
          to={username ? userPath(username) : '#'}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "12px",
            fontSize: "12px",
            fontWeight: "500",
            color: T.warm,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          View all activity
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

export { default } from './ActivityFeed';
