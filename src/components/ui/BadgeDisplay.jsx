import { useState } from 'react';
import { T } from '../../theme/tokens';

const sizeMap = {
  sm: { size: 32, gap: 6 },
  md: { size: 48, gap: 8 },
  lg: { size: 64, gap: 10 },
};

export default function BadgeDisplay({ badges = [], size = 'md', max = 6 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { size: badgeSize, gap } = sizeMap[size] || sizeMap.md;

  if (!badges || badges.length === 0) {
    return (
      <div style={{
        display: "flex",
        gap: `${gap}px`,
        alignItems: "center",
      }}>
        <p style={{
          fontSize: "14px",
          color: T.txtM,
          fontStyle: "italic",
        }}>
          No badges earned yet
        </p>
      </div>
    );
  }

  const displayedBadges = badges.slice(0, max);
  const hiddenCount = Math.max(0, badges.length - max);

  return (
    <div style={{
      display: "flex",
      gap: `${gap}px`,
      alignItems: "center",
      flexWrap: "wrap",
    }}>
      {displayedBadges.map((badge, index) => (
        <div
          key={badge.id || index}
          style={{
            position: "relative",
            cursor: "pointer",
            width: badgeSize,
            height: badgeSize,
            flexShrink: 0,
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Badge Icon/Image */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: T.bgElev,
              border: `2px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              backgroundImage: badge.icon_url ? `url(${badge.icon_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!badge.icon_url && (
              <span style={{
                fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px',
                fontWeight: "600",
                color: T.warm,
                textAlign: "center",
              }}>
                {badge.badge_type?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Tooltip */}
          {hoveredIndex === index && (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginBottom: "8px",
                backgroundColor: T.bgDeep,
                border: `1px solid ${T.border}`,
                borderRadius: "8px",
                padding: "8px 12px",
                whiteSpace: "nowrap",
                fontSize: "12px",
                color: T.txt,
                fontWeight: "500",
                zIndex: 1000,
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.5)`,
                pointerEvents: "none",
              }}
            >
              <div style={{ marginBottom: "4px", color: T.warm }}>
                {badge.name}
              </div>
              {badge.description && (
                <div style={{
                  fontSize: "11px",
                  color: T.txtM,
                  whiteSpace: "normal",
                  maxWidth: "150px",
                }}>
                  {badge.description}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* "+N more" indicator */}
      {hiddenCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            backgroundColor: T.bgElev,
            border: `2px solid ${T.border}`,
            fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px',
            fontWeight: "600",
            color: T.warm,
            flexShrink: 0,
          }}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}

export { default } from './BadgeDisplay';
