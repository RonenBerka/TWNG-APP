import { Lock, Globe } from 'lucide-react';
import { T } from '../theme/tokens';
import Badge from './ui/Badge';
import { Link } from 'react-router-dom';

export default function CollectionCard({ collection }) {
  const {
    id,
    name,
    description,
    cover_image_url,
    item_count = 0,
    user,
    is_public = true,
  } = collection;

  return (
    <Link to={`/collections/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        backgroundColor: T.bgCard,
        borderRadius: "12px",
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        transition: "all 0.3s",
        cursor: "pointer",
      }}>
        {/* Cover Image */}
        {cover_image_url && (
          <div style={{
            position: "relative",
            aspectRatio: "16/9",
            backgroundColor: T.bgElev,
            overflow: "hidden",
          }}>
            <img
              src={cover_image_url}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div style={{
              position: "absolute",
              top: "12px",
              right: "12px",
            }}>
              {is_public ? (
                <Badge variant="outline">
                  <Globe size={12} style={{ marginRight: "2px" }} />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock size={12} style={{ marginRight: "2px" }} />
                  Private
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "16px" }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: T.txt,
            marginBottom: "8px",
            wordBreak: "break-word",
          }}>
            {name}
          </h3>

          {description && (
            <p style={{
              fontSize: "14px",
              color: T.txt2,
              marginBottom: "12px",
              lineHeight: "1.5",
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {description}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${T.border}`,
            paddingTop: "12px",
            fontSize: "12px",
          }}>
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              color: T.txtM,
            }}>
              {item_count !== undefined && (
                <span style={{ color: T.txt2 }}>
                  {item_count} {item_count === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            {user && (
              <span style={{
                color: T.txtM,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                by {user}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export { default } from './CollectionCard';
