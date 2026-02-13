import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  ThumbsUp,
  Pin,
  Lock,
  Loader,
  Send,
  Flame,
  CheckCircle
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getForumThread,
  getForumPosts,
  createForumPost,
  togglePostLike,
  markPostAsSolution,
  incrementThreadView
} from "../lib/supabase/forum";
import { ROUTES } from "../lib/routes";

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

// Main Component
export default function ThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Load thread
  useEffect(() => {
    const loadThread = async () => {
      try {
        setIsLoadingThread(true);
        const threadData = await getForumThread(id);
        setThread(threadData);

        // Increment view count
        try {
          await incrementThreadView(id);
        } catch (err) {
          console.error("Error incrementing view count:", err);
        }
      } catch (err) {
        console.error("Error loading thread:", err);
        setError("Failed to load thread. Please try again.");
      } finally {
        setIsLoadingThread(false);
      }
    };
    loadThread();
  }, [id]);

  // Load posts
  useEffect(() => {
    if (!thread) return;

    const loadPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const result = await getForumPosts(id, {
          page,
          limit: 20
        });

        if (page === 1) {
          setPosts(result.posts || []);
        } else {
          setPosts((prev) => [...prev, ...(result.posts || [])]);
        }

        setHasMore(page < result.totalPages);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPosts();
  }, [thread, id, page]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      setError("Please enter a reply");
      return;
    }

    if (!user) {
      setError("You must be logged in to reply");
      return;
    }

    setIsSubmittingReply(true);
    setError(null);

    try {
      const newPost = await createForumPost(id, replyText.trim());
      setPosts([...posts, newPost]);
      setReplyText("");
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      setError("You must be logged in to like posts");
      return;
    }

    try {
      await togglePostLike(postId);
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      // Update post like count in UI
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                like_count: likedPosts.has(postId)
                  ? (post.like_count || 0) - 1
                  : (post.like_count || 0) + 1
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to like post. Please try again.");
    }
  };

  const handleMarkAsSolution = async (postId) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    if (thread?.author_id !== user.id) {
      setError("Only the thread author can mark solutions");
      return;
    }

    try {
      await markPostAsSolution(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, is_solution: true } : post
        )
      );
    } catch (err) {
      console.error("Error marking solution:", err);
      setError(err.message || "Failed to mark as solution. Please try again.");
    }
  };

  if (isLoadingThread) {
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

  if (error && !thread) {
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

  if (!thread) return null;

  const author = thread.author || {};
  const authorName = author.display_name || author.username || "Unknown";
  const authorInitials = getInitials(author.username);

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .thread-wrap { padding: 16px 12px 60px !important; }
          .thread-header h1 { font-size: 20px !important; }
          .original-post { padding: 12px !important; }
          .post-item { padding: 12px !important; }
          .reply-form { padding: 12px !important; }
          textarea { font-size: 13px !important; }
        }
        @media (max-width: 480px) {
          .thread-wrap { padding: 12px 8px 60px !important; }
          .thread-header h1 { font-size: 18px !important; }
          .post-avatar { width: 32px !important; height: 32px !important; }
          textarea { font-size: 12px !important; }
        }
      `}</style>
      <div
        className="thread-wrap"
        style={{ backgroundColor: T.bgDeep, minHeight: "100vh", padding: "24px 24px 80px" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
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
            Back
          </button>

          {/* Thread Header */}
          <div style={{ marginBottom: "20px" }} className="thread-header">
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
              <h1
                style={{
                  color: T.txt,
                  fontFamily: "Playfair Display",
                  fontSize: "clamp(22px, 3vw, 28px)",
                  fontWeight: 700,
                  flex: 1,
                  wordBreak: "break-word"
                }}
              >
                {thread.title}
              </h1>
              {thread.is_pinned && (
                <Pin size={18} style={{ color: T.warm, flexShrink: 0, marginTop: "4px" }} />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: T.txtM }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MessageSquare size={14} />
                {posts.length} replies
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Eye size={14} />
                {thread.view_count || 0} views
              </div>
              {thread.is_locked && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Lock size={14} />
                  Locked
                </div>
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
            className="original-post"
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
                  fontSize: "14px",
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
            <div
              style={{
                marginBottom: "12px",
                color: T.txt2,
                fontSize: "13px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
            >
              {thread.content}
            </div>
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

          {/* Replies Section */}
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: T.txt }}>
              {posts.length} {posts.length === 1 ? "Reply" : "Replies"}
            </h2>

            {isLoadingPosts && page === 1 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                <Loader size={20} style={{ animation: "spin 1s linear infinite", color: T.amber }} />
              </div>
            ) : posts.length === 0 ? (
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
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {posts.map((post) => {
                    const postAuthor = post.author || {};
                    const postAuthorName = postAuthor.display_name || postAuthor.username || "Unknown";
                    const postAuthorInitials = getInitials(postAuthor.username);

                    return (
                      <div
                        key={post.id}
                        style={{
                          padding: "12px",
                          borderRadius: "8px",
                          backgroundColor: post.is_solution ? T.bgCard : T.bgCard,
                          border: post.is_solution ? `2px solid ${T.amber}` : `1px solid ${T.border}`
                        }}
                        className="post-item"
                      >
                        {post.is_solution && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "8px",
                              padding: "6px 8px",
                              borderRadius: "4px",
                              backgroundColor: `${T.amber}20`,
                              color: T.amber,
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle size={12} />
                            Marked as Solution
                          </div>
                        )}

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
                            className="post-avatar"
                          >
                            {postAuthorInitials}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                              <span style={{ fontWeight: 600, fontSize: "12px", color: T.txt }}>
                                {postAuthorName}
                              </span>
                            </div>
                            <p style={{ fontSize: "11px", color: T.txtM }}>
                              {formatRelativeTime(post.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Post Content */}
                        <p
                          style={{
                            fontSize: "12px",
                            marginBottom: "8px",
                            whiteSpace: "pre-wrap",
                            color: T.txt2,
                            lineHeight: 1.5,
                            wordBreak: "break-word"
                          }}
                        >
                          {post.content}
                        </p>

                        {/* Post Actions */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              backgroundColor: likedPosts.has(post.id) ? T.amber : T.bgElev,
                              color: likedPosts.has(post.id) ? T.bgDeep : T.txt2,
                              border: "none"
                            }}
                          >
                            <ThumbsUp size={11} fill={likedPosts.has(post.id) ? T.bgDeep : "none"} />
                            <span>{post.like_count || 0}</span>
                          </button>

                          {/* Mark as Solution Button (only for thread author) */}
                          {user && thread.author_id === user.id && !post.is_solution && (
                            <button
                              onClick={() => handleMarkAsSolution(post.id)}
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
                              <CheckCircle size={11} />
                              <span>Solution</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isLoadingMore}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: isLoadingMore ? "not-allowed" : "pointer",
                      opacity: isLoadingMore ? 0.6 : 1,
                      transition: "all 0.2s",
                      backgroundColor: T.bgCard,
                      color: T.amber,
                      border: `1px solid ${T.border}`,
                      fontSize: "13px"
                    }}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
                        Loading...
                      </>
                    ) : (
                      "Load More Replies"
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Reply Form */}
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`
            }}
            className="reply-form"
          >
            <h3 style={{ fontWeight: 600, marginBottom: "8px", color: T.txt, fontSize: "14px" }}>
              Post Your Reply
            </h3>

            {thread.is_locked && (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: `${T.warm}20`,
                  color: T.warm,
                  fontSize: "12px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Lock size={13} />
                This thread is locked. No new replies can be posted.
              </div>
            )}

            {!user && (
              <p style={{ fontSize: "12px", color: T.txt2, marginBottom: "8px" }}>
                Please log in to post a reply.
              </p>
            )}

            {!thread.is_locked && (
              <form onSubmit={handleSubmitReply} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                    resize: "vertical",
                    color: T.txt,
                    border: `1px solid ${T.border}`,
                    outline: "none",
                    opacity: user ? 1 : 0.5,
                    cursor: user ? "auto" : "not-allowed",
                    fontFamily: "inherit",
                    minHeight: "80px"
                  }}
                  rows="3"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReply || !user}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
