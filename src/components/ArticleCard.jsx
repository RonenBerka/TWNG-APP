import { T } from '../theme/tokens';
import Badge from './ui/Badge';
import { Link } from 'react-router-dom';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncateText(text, lines) {
  if (!text) return '';
  const lineArray = text.split('\n');
  return lineArray.slice(0, lines).join('\n');
}

export default function ArticleCard({ article }) {
  const {
    id,
    title,
    excerpt,
    cover_image_url,
    author,
    category,
    created_at,
    slug,
  } = article;

  const cardLink = slug ? `/articles/${slug}` : `/articles/${id}`;

  return (
    <Link to={cardLink} style={{ textDecoration: "none", color: "inherit" }}>
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
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {category && (
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
              }}>
                <Badge variant="default">{category}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "16px" }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: T.txt,
            marginBottom: "8px",
            lineHeight: "1.4",
            wordBreak: "break-word",
          }}>
            {title}
          </h3>

          {excerpt && (
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
              {excerpt}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: T.txtM,
            borderTop: `1px solid ${T.border}`,
            paddingTop: "12px",
          }}>
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}>
              {author && (
                <>
                  <span style={{ color: T.txt2 }}>{author}</span>
                  <span>·</span>
                </>
              )}
              {created_at && <span>{formatDate(created_at)}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { default } from './ArticleCard';
