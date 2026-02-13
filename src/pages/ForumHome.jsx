import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MessageSquare,
  Users,
  Eye,
  ThumbsUp,
  Pin,
  Plus,
  Search,
  Loader,
  Clock,
  Flame,
  TrendingUp
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getForumCategories,
  getForumThreads,
  searchForumThreads
} from "../lib/supabase/forum";

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

// Category Card Component
function CategoryCard({ category, threadCount }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/forum/category/${category.slug || category.id}`)}
      style={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      className="category-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = T.amber;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, flex: 1 }}>
          {category.name}
        </h3>
      </div>
      {category.description && (
        <p style={{ fontSize: "12px", color: T.txt2, marginBottom: "10px", lineHeight: 1.4 }}>
          {category.description}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: T.txtM }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MessageSquare size={14} />
          <span>{threadCount} threads</span>
        </div>
      </div>
    </div>
  );
}

// Thread Card Component
function ThreadCard({ thread }) {
  const navigate = useNavigate();
  const author = thread.author || {};
  const authorName = author.display_name || author.username || "Unknown";
  const authorInitials = getInitials(author.username);

  return (
    <div
      onClick={() => navigate(`/forum/thread/${thread.id}`)}
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
              <p style={{ fontSize: "12px", marginBottom: "6px", color: T.txt2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }} className="thread-card-excerpt">
                {thread.content || "No content"}
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

// Main Forum Home Component
export default function ForumHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [pinnedThreads, setPinnedThreads] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await getForumCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch threads
  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoadingThreads(true);
        setError(null);

        let result;
        if (searchQuery.trim()) {
          result = await searchForumThreads(searchQuery, { limit: 50 });
        } else {
          result = await getForumThreads(null, {
            sortBy: selectedSort,
            limit: 50
          });
        }

        // Separate pinned and regular threads
        const pinned = (result.threads || []).filter((t) => t.is_pinned);
        const regular = (result.threads || []).filter((t) => !t.is_pinned);

        setPinnedThreads(pinned);
        setRecentThreads(regular);
      } catch (err) {
        console.error("Error loading threads:", err);
        setError("Failed to load threads. Please try again.");
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreads();
  }, [selectedSort, searchQuery]);

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
          .category-card { padding: 12px !important; }
          .category-grid { grid-template-columns: 1fr !important; }
          .thread-card { padding: 10px !important; }
          .thread-card-title { font-size: 13px !important; }
          .thread-card-excerpt { font-size: 11px !important; }
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
          {/* Header */}
          <div style={{ marginBottom: "24px" }} className="forum-header">
            <h1
              style={{
                color: T.txt,
                fontFamily: "Playfair Display",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 700,
                marginBottom: "8px"
              }}
            >
              Forum
            </h1>
            <p style={{ color: T.txt2, fontSize: "14px" }}>
              Connect, share, and learn with TWNG musicians
            </p>
          </div>

          {/* New Thread Button */}
          {user ? (
            <Link
              to="/forum/new"
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  width: "100%",
                  marginBottom: "20px",
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
                New Thread
              </button>
            </Link>
          ) : (
            <div
              style={{
                width: "100%",
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                textAlign: "center",
                color: T.txt2,
                fontSize: "13px"
              }}
            >
              <Link to="/auth" style={{ color: T.amber, textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
              {" "}to create a new thread
            </div>
          )}

          {/* Search Bar */}
          <div style={{ marginBottom: "20px", position: "relative" }} className="forum-search-bar">
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: T.txtM
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threads..."
              style={{
                width: "100%",
                padding: "10px 10px 10px 36px",
                borderRadius: "8px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                color: T.txt,
                fontSize: "13px",
                outline: "none"
              }}
              className="forum-search-input"
            />
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

          {/* Categories Section */}
          {isLoadingCategories ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
              <Loader size={24} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: T.txt, marginBottom: "12px" }}>
                Categories
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "12px",
                  marginBottom: "28px"
                }}
                className="category-grid"
              >
                {categories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    threadCount={cat.thread_count ?? 0}
                  />
                ))}
              </div>
            </>
          )}

          {/* Pinned Threads Section */}
          {!isLoadingThreads && pinnedThreads.length > 0 && (
            <>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: T.txt, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Pin size={16} style={{ color: T.warm }} />
                Pinned Threads
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {pinnedThreads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </>
          )}

          {/* Sort Options */}
          {!searchQuery && (
            <div style={{ marginBottom: "16px", display: "flex", gap: "12px", borderBottom: "1px solid " + T.border, paddingBottom: "12px" }}>
              {["newest", "popular", "trending"].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSelectedSort(sort)}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderBottom: selectedSort === sort ? "2px solid " + T.amber : "none",
                    color: selectedSort === sort ? T.amber : T.txt2,
                    backgroundColor: "transparent",
                    border: "none",
                    textTransform: "capitalize"
                  }}
                >
                  {sort === "trending" ? (
                    <>
                      <TrendingUp size={14} style={{ display: "inline", marginRight: "4px" }} />
                      {sort}
                    </>
                  ) : (
                    sort
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Threads Section */}
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: T.txt, marginBottom: "12px" }}>
            {searchQuery ? "Search Results" : "Recent Threads"}
          </h2>

          {isLoadingThreads && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
              <Loader size={24} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
            </div>
          )}

          {!isLoadingThreads && recentThreads.length === 0 && (
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
                {searchQuery ? "No threads found" : "No threads yet. Be the first to start a discussion!"}
              </p>
            </div>
          )}

          {!isLoadingThreads && recentThreads.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
