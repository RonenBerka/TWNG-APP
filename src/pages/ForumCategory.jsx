import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Plus,
  Loader,
  Clock,
  Flame,
  Pin
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getForumCategories,
  getForumThreads
} from "../lib/supabase/forum";
import { ROUTES, forumThreadPath } from "../lib/routes";

// Utility: Generate avatar initials from username
function getInitials(username) {
  return (username || "?").substring(0, 2).toUpperCase();
}

// Utility: Format relative time
function formatRelativeTime(timestamp) {
  if (!timestamp) return "just now";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Thread Card Component
function ThreadCard({ thread }) {
  const navigate = useNavigate();
  const author = thread.author || {};
  const authorName = author.display_name || author.username || "Unknown";
  const authorInitials = getInitials(author.username);

  return (
    <div
      onClick={() => navigate(forumThreadPath(thread.id))}
      style={{
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`
      }}
      className="thread-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = T.amber;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.border;
      }}
    >
      <div style={{ display: "flex", gap: "12px" }}>
        {/* Avatar */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "white",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: T.warm
          }}
          className="thread-avatar"
        >
          {authorInitials}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                {thread.is_pinned && <Pin size={13} style={{ color: T.warm, flexShrink: 0 }} />}
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: T.txt,
                    flex: 1,
                    wordBreak: "break-word"
                  }}
                  className="thread-card-title"
                >
                  {thread.title}
                </h3>
                {thread.reply_count > 20 && (
                  <Flame size={13} style={{ color: T.warm, flexShrink: 0 }} />
                )}
              </div>
              <p style={{ fontSize: "11px", marginBottom: "4px", color: T.txtM }}>
                <span style={{ color: T.txt2 }}>{authorName}</span> • {formatRelativeTime(thread.created_at)}
              </p>
            </div>

            {/* Stats */}
            <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: T.txtM }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <MessageSquare size={11} />
                  <span>{thread.reply_count || 0}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <Eye size={11} />
                  <span>{thread.view_count || 0}</span>
                </div>
              </div>
              {thread.last_activity_at && (
                <p style={{ fontSize: "10px", color: T.txtM }}>
                  {formatRelativeTime(thread.last_activity_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function ForumCategory() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch categories and find matching one
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setIsLoadingCategory(true);
        const cats = await getForumCategories();
        const found = cats.find(
          (c) => (c.slug || c.id.toLowerCase()) === slug?.toLowerCase()
        );
        if (!found) {
          setError("Category not found");
        } else {
          setCategory(found);
        }
      } catch (err) {
        console.error("Error loading category:", err);
        setError("Failed to load category");
      } finally {
        setIsLoadingCategory(false);
      }
    };
    loadCategory();
  }, [slug]);

  // Fetch threads for category
  useEffect(() => {
    if (!category) return;

    const loadThreads = async () => {
      try {
        setIsLoadingThreads(true);
        setError(null);
        const result = await getForumThreads(category.id, {
          sortBy,
          page,
          limit: 20
        });
        if (page === 1) {
          setThreads(result.threads || []);
        } else {
          setThreads((prev) => [...prev, ...(result.threads || [])]);
        }
        setHasMore(page < result.totalPages);
      } catch (err) {
        console.error("Error loading threads:", err);
        setError("Failed to load threads. Please try again.");
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreads();
  }, [category, sortBy, page]);

  if (isLoadingCategory) {
    return (
      <div
        style={{
          backgroundColor: T.bgDeep,
          minHeight: "100vh",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Loader size={32} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
      </div>
    );
  }

  if (error && !category) {
    return (
      <div
        style={{
          backgroundColor: T.bgDeep,
          minHeight: "100vh",
          padding: "24px"
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <button
            onClick={() => navigate(ROUTES.FORUM)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "none",
              color: T.amber,
              fontSize: "13px",
              fontWeight: 500
            }}
          >
            <ArrowLeft size={15} />
            Back to Forum
          </button>
          <div
            style={{
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "#7F1D1D",
              color: "#FCA5A5",
              fontSize: "13px"
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .forum-wrap { padding: 16px 12px 60px !important; }
          .forum-header h1 { font-size: 20px !important; }
          .forum-new-thread-btn { padding: 10px 14px !important; font-size: 13px !important; }
          .thread-card { padding: 10px !important; }
          .thread-card-title { font-size: 13px !important; }
        }
        @media (max-width: 480px) {
          .forum-wrap { padding: 12px 8px 60px !important; }
          .forum-header h1 { font-size: 18px !important; }
          .forum-header p { font-size: 12px !important; }
          .forum-new-thread-btn { padding: 8px 12px !important; font-size: 12px !important; }
          .thread-avatar { width: 32px !important; height: 32px !important; }
          .thread-card-title { font-size: 12px !important; }
        }
      `}</style>
      <div
        className="forum-wrap"
        style={{ backgroundColor: T.bgDeep, minHeight: "100vh", padding: "24px 24px 80px" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(ROUTES.FORUM)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "none",
              color: T.amber,
              fontSize: "13px",
              fontWeight: 500,
              transition: "opacity 0.2s"
            }}
          >
            <ArrowLeft size={15} />
            Back to Forum
          </button>

          {/* Category Header */}
          {category && (
            <div style={{ marginBottom: "20px" }}>
              <h1
                style={{
                  color: T.txt,
                  fontFamily: "Playfair Display",
                  fontSize: "clamp(22px, 3vw, 28px)",
                  fontWeight: 700,
                  marginBottom: "8px"
                }}
              >
                {category.name}
              </h1>
              {category.description && (
                <p style={{ color: T.txt2, fontSize: "14px" }}>
                  {category.description}
                </p>
              )}
            </div>
          )}

          {/* New Thread Button */}
          {user && category ? (
            <Link
              to={`/forum/new?category=${category.id}`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  width: "100%",
                  marginBottom: "16px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  backgroundColor: T.amber,
                  color: T.bgDeep,
                  border: "none",
                  fontSize: "14px"
                }}
                className="forum-new-thread-btn"
              >
                <Plus size={16} />
                New Thread in {category.name}
              </button>
            </Link>
          ) : user ? null : (
            <div
              style={{
                width: "100%",
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                textAlign: "center",
                color: T.txt2,
                fontSize: "13px"
              }}
            >
              <Link to={ROUTES.AUTH} style={{ color: T.amber, textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
              {" "}to create a thread
            </div>
          )}

          {/* Sort Options */}
          <div style={{ marginBottom: "16px", display: "flex", gap: "12px", borderBottom: "1px solid " + T.border, paddingBottom: "12px" }}>
            {["newest", "popular", "trending"].map((sort) => (
              <button
                key={sort}
                onClick={() => {
                  setSortBy(sort);
                  setPage(1);
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderBottom: sortBy === sort ? "2px solid " + T.amber : "none",
                  color: sortBy === sort ? T.amber : T.txt2,
                  backgroundColor: "transparent",
                  border: "none",
                  textTransform: "capitalize"
                }}
              >
                {sort}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "#7F1D1D",
                color: "#FCA5A5",
                fontSize: "13px",
                marginBottom: "16px"
              }}
            >
              {error}
            </div>
          )}

          {/* Thread List */}
          {isLoadingThreads && page === 1 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <Loader size={24} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
            </div>
          ) : threads.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                backgroundColor: T.bgCard,
                borderRadius: "8px",
                border: `1px solid ${T.border}`
              }}
            >
              <MessageSquare size={32} style={{ margin: "0 auto 12px", color: T.txtM }} />
              <p style={{ fontSize: "14px", color: T.txt2 }}>
                No threads in this category yet. Be the first!
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoadingThreads}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: isLoadingThreads ? "not-allowed" : "pointer",
                    opacity: isLoadingThreads ? 0.6 : 1,
                    transition: "all 0.2s",
                    backgroundColor: T.bgCard,
                    color: T.amber,
                    border: `1px solid ${T.border}`,
                    fontSize: "14px"
                  }}
                >
                  {isLoadingThreads ? (
                    <>
                      <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Loading...
                    </>
                  ) : (
                    "Load More Threads"
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
