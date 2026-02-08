import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Pin,
  Flame,
  MessageSquare,
  Eye,
  Heart,
  ArrowLeft,
  Send,
  Flag,
  Lock,
  ChevronRight,
  ThumbsUp,
  Quote,
  Users,
  TrendingUp,
  Plus,
  Search,
  Share2,
  Loader,
  X
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getCategories,
  getThreads,
  getThread,
  getThreadReplies,
  createThread,
  createReply,
  upvoteThread,
  getForumStats,
  searchThreads
} from "../lib/supabase/discussions";

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
function ThreadCard({ thread, onClick, isLoading }) {
  if (isLoading) {
    return (
      <div
        style={{
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80px"
        }}
      >
        <Loader size={20} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
      </div>
    );
  }

  const author = thread.author || {};
  const authorName = author.display_name || author.username || "Unknown";
  const authorInitials = getInitials(author.username);

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`
      }}
      className="thread-card"
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }} className="thread-card-meta">
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: T.txt
                  }}
                  className="thread-card-title"
                >
                  {thread.title}
                </h3>
                {thread.upvote_count > 20 && (
                  <Flame size={13} style={{ color: T.warm, flexShrink: 0 }} />
                )}
              </div>
              <p style={{ fontSize: "11px", marginBottom: "4px", color: T.txtM }}>
                <span style={{ color: T.txt2 }}>{authorName}</span> • {formatRelativeTime(thread.created_at)}
              </p>
              <p style={{ fontSize: "12px", marginBottom: "6px", color: T.txt2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }} className="thread-card-excerpt">
                {thread.content}
              </p>
            </div>

            {/* Stats */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: T.txtM }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <MessageSquare size={11} />
                  <span>{thread.reply_count || 0}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <Heart size={11} />
                  <span>{thread.upvote_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// New Thread Modal
function NewThreadModal({ isOpen, onClose, categories, onThreadCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newThread = await createThread({
        title: title.trim(),
        content: content.trim(),
        categoryId
      });
      onThreadCreated(newThread);
      setTitle("");
      setContent("");
      setCategoryId("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create thread");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: T.bgCard,
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${T.border}`
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.txt }}>Create New Thread</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: T.txt2
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                backgroundColor: "#7F1D1D",
                color: "#FCA5A5",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: T.txt }}>
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: T.bgElev,
                border: `1px solid ${T.border}`,
                color: T.txt,
                fontSize: "13px"
              }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: T.txt }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title..."
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: T.bgElev,
                border: `1px solid ${T.border}`,
                color: T.txt,
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "6px", color: T.txt }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="6"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                backgroundColor: T.bgElev,
                border: `1px solid ${T.border}`,
                color: T.txt,
                fontSize: "13px",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              backgroundColor: T.amber,
              color: T.bgDeep,
              border: "none",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            {isSubmitting ? (
              <>
                <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={14} />
                Create Thread
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Forum Home View
function ForumHome({
  onThreadClick,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onNewThreadClick
}) {
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalThreads: 0, totalPosts: 0, totalAuthors: 0 });
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await getCategories();
        if (cats.length === 0) {
          // Provide sensible defaults if no categories in DB
          setCategories([
            { id: "general", name: "General" },
            { id: "electric", name: "Electric Guitars" },
            { id: "acoustic", name: "Acoustic" },
            { id: "bass", name: "Bass" },
            { id: "buysell", name: "Buy/Sell/Trade" }
          ]);
        } else {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch forum stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const forumStats = await getForumStats();
        setStats(forumStats);
      } catch (err) {
        console.error("Error loading forum stats:", err);
      }
    };
    loadStats();
  }, []);

  // Fetch threads based on filters
  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoadingThreads(true);
        setError(null);

        let result;
        if (searchQuery.trim()) {
          result = await searchThreads({ query: searchQuery });
        } else {
          const sortMap = {
            "Trending": "trending",
            "Latest": "newest",
            "Most Viewed": "popular",
            "Unanswered": "newest"
          };

          result = await getThreads({
            categoryId: selectedCategory === "All" ? undefined : selectedCategory,
            sortBy: sortMap[selectedSort] || "newest"
          });
        }

        setThreads(result.threads || []);
      } catch (err) {
        console.error("Error loading threads:", err);
        setError("Failed to load threads. Please try again.");
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreads();
  }, [selectedCategory, selectedSort, searchQuery]);

  const displayThreads = threads.length > 0 ? threads : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "20px" }} className="forum-header">
          <h1 style={{ color: T.txt, fontFamily: "Playfair Display", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, marginBottom: "8px" }}>
            Community
          </h1>
          <p style={{ color: T.txt2, fontSize: "14px" }}>Connect, share, and learn with TWNG musicians</p>
        </div>

        {/* New Thread Button */}
        <button
          onClick={onNewThreadClick}
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
          New Thread
        </button>

        {/* Category Tabs */}
        <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }} className="forum-category-tabs">
          <button
            onClick={() => setSelectedCategory("All")}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: selectedCategory === "All" ? T.warm : T.bgCard,
              color: selectedCategory === "All" ? T.bgDeep : T.txt2,
              border: `1px solid ${selectedCategory === "All" ? T.warm : T.border}`
            }}
            className="forum-category-btn"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: selectedCategory === cat.id ? T.warm : T.bgCard,
                color: selectedCategory === cat.id ? T.bgDeep : T.txt2,
                border: `1px solid ${selectedCategory === cat.id ? T.warm : T.border}`
              }}
              className="forum-category-btn"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "12px", borderBottom: "1px solid " + T.border, paddingBottom: "12px" }}>
          {["Trending", "Latest", "Most Viewed"].map((sort) => (
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
                border: "none"
              }}
            >
              {sort}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "16px", position: "relative" }} className="forum-search-bar">
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

        {/* Thread List */}
        {isLoadingThreads && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
            <Loader size={24} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
          </div>
        )}

        {!isLoadingThreads && displayThreads.length === 0 && (
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
            <p style={{ fontSize: "14px", color: T.txt2 }}>No threads found. Be the first to start a discussion!</p>
          </div>
        )}

        {!isLoadingThreads && displayThreads.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {displayThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => onThreadClick(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Thread View with Real Data
function ThreadView({ threadId, onBack }) {
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [error, setError] = useState(null);
  const [likedThreadId, setLikedThreadId] = useState(null);

  // Load thread
  useEffect(() => {
    const loadThread = async () => {
      try {
        setIsLoadingThread(true);
        const threadData = await getThread(threadId);
        setThread(threadData);
      } catch (err) {
        console.error("Error loading thread:", err);
        setError("Failed to load thread. Please try again.");
      } finally {
        setIsLoadingThread(false);
      }
    };
    loadThread();
  }, [threadId]);

  // Load replies
  useEffect(() => {
    const loadReplies = async () => {
      try {
        setIsLoadingReplies(true);
        const repliesData = await getThreadReplies(threadId);
        setReplies(repliesData);
      } catch (err) {
        console.error("Error loading replies:", err);
        setError("Failed to load replies.");
      } finally {
        setIsLoadingReplies(false);
      }
    };
    loadReplies();
  }, [threadId]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!user) {
      setError("You must be logged in to reply");
      return;
    }

    setIsSubmittingReply(true);
    setError(null);

    try {
      const newReply = await createReply({
        threadId,
        content: replyText.trim()
      });

      // Add to local state immediately
      setReplies([...replies, newReply]);
      setReplyText("");
    } catch (err) {
      setError(err.message || "Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLikeThread = async () => {
    if (!user) {
      setError("You must be logged in to like");
      return;
    }
    try {
      await upvoteThread(threadId);
      setLikedThreadId(threadId);
      if (thread) {
        setThread({
          ...thread,
          upvote_count: (thread.upvote_count || 0) + 1
        });
      }
    } catch (err) {
      console.error("Error liking thread:", err);
    }
  };

  if (isLoadingThread) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader size={32} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
      </div>
    );
  }

  if (error && !thread) {
    return (
      <div
        style={{
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#7F1D1D",
          color: "#FCA5A5"
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            backgroundColor: "transparent",
            border: "none",
            color: T.amber,
            fontSize: "13px"
          }}
        >
          <ArrowLeft size={15} />
          Back to Forum
        </button>
        <p>{error}</p>
      </div>
    );
  }

  if (!thread) return null;

  const author = thread.author || {};
  const authorName = author.display_name || author.username || "Unknown";
  const authorInitials = getInitials(author.username);

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "opacity 0.2s",
          backgroundColor: "transparent",
          border: "none",
          color: T.amber,
          fontSize: "13px"
        }}
      >
        <ArrowLeft size={15} />
        Back to Forum
      </button>

      {/* Thread Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
          <h1
            style={{
              color: T.txt,
              fontFamily: "Playfair Display",
              fontSize: "clamp(22px, 3vw, 28px)",
              fontWeight: 700
            }}
          >
            {thread.title}
          </h1>
          {thread.upvote_count > 20 && (
            <Flame size={18} style={{ color: T.warm, flexShrink: 0 }} />
          )}
        </div>
      </div>

      {/* Original Post */}
      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`
        }}
      >
        {/* Author Info */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${T.border}` }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              flexShrink: 0,
              fontSize: "13px",
              backgroundColor: T.warm
            }}
          >
            {authorInitials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 600, color: T.txt, fontSize: "13px" }}>
                {authorName}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: T.txtM }}>
              Posted {formatRelativeTime(thread.created_at)}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <div style={{ marginBottom: "12px", color: T.txt2, fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          <p>{thread.content}</p>
        </div>

        {/* Post Actions */}
        <div style={{ display: "flex", gap: "12px", paddingTop: "12px", borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={handleLikeThread}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: likedThreadId === threadId ? T.warm : T.bgElev,
              color: likedThreadId === threadId ? T.bgDeep : T.txt2,
              border: "none",
              fontSize: "12px"
            }}
          >
            <Heart size={13} fill={likedThreadId === threadId ? T.bgDeep : "none"} />
            <span>{thread.upvote_count || 0}</span>
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: T.bgElev,
              color: T.txt2,
              border: "none",
              fontSize: "12px"
            }}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Replies */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: T.txt }}>
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>

        {isLoadingReplies && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
            <Loader size={20} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
          </div>
        )}

        {!isLoadingReplies && replies.length === 0 && (
          <div
            style={{
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              textAlign: "center",
              color: T.txt2,
              fontSize: "13px"
            }}
          >
            No replies yet. Be the first to respond!
          </div>
        )}

        {!isLoadingReplies && replies.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {replies.map((reply) => {
              const replyAuthor = reply.author || {};
              const replyAuthorName = replyAuthor.display_name || replyAuthor.username || "Unknown";
              const replyAuthorInitials = getInitials(replyAuthor.username);

              return (
                <div
                  key={reply.id}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`
                  }}
                >
                  {/* Author Info */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${T.border}` }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 700,
                        flexShrink: 0,
                        backgroundColor: T.warm
                      }}
                    >
                      {replyAuthorInitials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <span style={{ fontWeight: 600, fontSize: "12px", color: T.txt }}>
                          {replyAuthorName}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: T.txtM }}>
                        {formatRelativeTime(reply.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Reply Content */}
                  <p style={{ fontSize: "12px", marginBottom: "8px", whiteSpace: "pre-wrap", color: T.txt2, lineHeight: 1.5 }}>
                    {reply.content}
                  </p>

                  {/* Reply Actions */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        backgroundColor: T.bgElev,
                        color: T.txt2,
                        border: "none"
                      }}
                    >
                      <ThumbsUp size={11} />
                      <span>{reply.upvote_count || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {error && !isLoadingThread && (
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

      <div
        style={{
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`
        }}
      >
        <h3 style={{ fontWeight: 600, marginBottom: "8px", color: T.txt, fontSize: "14px" }}>
          Post Your Reply
        </h3>
        {!user && (
          <p style={{ fontSize: "12px", color: T.txt2, marginBottom: "8px" }}>
            Please log in to post a reply.
          </p>
        )}
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={user ? "Share your thoughts..." : "Log in to reply"}
          disabled={!user}
          style={{
            width: "100%",
            backgroundColor: T.bgElev,
            borderRadius: "6px",
            padding: "8px 10px",
            fontSize: "12px",
            marginBottom: "8px",
            resize: "vertical",
            color: T.txt,
            border: "1px solid " + T.border,
            outline: "none",
            opacity: user ? 1 : 0.5,
            cursor: user ? "auto" : "not-allowed"
          }}
          rows="4"
        />
        <button
          onClick={handleSubmitReply}
          disabled={isSubmittingReply || !user}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: user && !isSubmittingReply ? "pointer" : "not-allowed",
            opacity: user && !isSubmittingReply ? 1 : 0.6,
            transition: "opacity 0.2s",
            backgroundColor: T.amber,
            color: T.bgDeep,
            border: "none",
            fontSize: "12px"
          }}
        >
          {isSubmittingReply ? (
            <>
              <Loader size={13} style={{ animation: "spin 1s linear infinite" }} />
              Posting...
            </>
          ) : (
            <>
              <Send size={13} />
              Post Reply
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main Component
export default function TWNGForum() {
  const { id: threadIdParam } = useParams();
  const navigate = useNavigate();
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Trending");
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (threadIdParam) {
      setSelectedThreadId(threadIdParam);
    }
  }, [threadIdParam]);

  // Load categories for the modal
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        if (cats.length === 0) {
          setCategories([
            { id: "general", name: "General" },
            { id: "electric", name: "Electric Guitars" },
            { id: "acoustic", name: "Acoustic" },
            { id: "bass", name: "Bass" },
            { id: "buysell", name: "Buy/Sell/Trade" }
          ]);
        } else {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleThreadClick = (threadId) => {
    setSelectedThreadId(threadId);
    navigate(`/community/${threadId}`);
  };

  const handleBack = () => {
    setSelectedThreadId(null);
    navigate("/community");
  };

  const handleNewThreadCreated = (newThread) => {
    // Refresh the forum to show the new thread
    navigate("/community");
  };

  if (selectedThreadId) {
    return (
      <>
        <style>{`
          @media (max-width: 768px) {
            .forum-wrap { padding: 16px 16px 60px !important; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="forum-wrap" style={{ background: T.bgDeep, minHeight: "100vh", padding: "24px 24px 80px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <ThreadView threadId={selectedThreadId} onBack={handleBack} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .forum-wrap { padding: 16px 12px 60px !important; }
          .forum-header h1 { font-size: 20px !important; }
          .forum-new-thread-btn { padding: 10px 14px !important; font-size: 13px !important; }
          .forum-category-tabs { gap: 4px !important; }
          .forum-category-btn { padding: 6px 10px !important; font-size: 12px !important; }
          .forum-search-bar { margin-bottom: 12px !important; }
          .forum-search-input { font-size: 13px !important; }
          .thread-card { padding: 10px !important; }
          .thread-card-title { font-size: 14px !important; }
          .thread-card-meta { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
        }
        @media (max-width: 480px) {
          .forum-wrap { padding: 12px 8px 60px !important; }
          .forum-header { margin-bottom: 12px !important; }
          .forum-header h1 { font-size: 18px !important; }
          .forum-header p { font-size: 12px !important; }
          .forum-new-thread-btn { padding: 8px 12px !important; font-size: 12px !important; }
          .forum-category-tabs { flex-wrap: wrap !important; }
          .forum-category-btn { padding: 5px 8px !important; font-size: 11px !important; }
          .thread-card { padding: 8px !important; gap: 8px !important; }
          .thread-avatar { width: 32px !important; height: 32px !important; min-width: 32px !important; }
          .thread-card-title { font-size: 13px !important; }
          .thread-card-excerpt { font-size: 12px !important; }
          .thread-card-meta { font-size: 11px !important; flex-direction: column !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        className="forum-wrap"
        style={{ backgroundColor: T.bgDeep, minHeight: "100vh", padding: "24px 24px 80px" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <ForumHome
            onThreadClick={handleThreadClick}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
            onNewThreadClick={() => setIsNewThreadModalOpen(true)}
          />
        </div>
      </div>

      <NewThreadModal
        isOpen={isNewThreadModalOpen}
        onClose={() => setIsNewThreadModalOpen(false)}
        categories={categories}
        onThreadCreated={handleNewThreadCreated}
      />
    </>
  );
}
