import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Loader,
  X,
  Eye
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getForumCategories,
  createForumThread
} from "../lib/supabase/forum";
import { ROUTES, forumThreadPath } from "../lib/routes";

// Main Component
export default function NewThread() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await getForumCategories();
        setCategories(cats);
        if (!categoryId && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoadingCategories) {
      navigate(ROUTES.AUTH);
    }
  }, [user, isLoadingCategories, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a thread title");
      return;
    }

    if (!content.trim()) {
      setError("Please enter thread content");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newThread = await createForumThread(
        categoryId,
        title.trim(),
        content.trim()
      );
      navigate(forumThreadPath(newThread.id));
    } catch (err) {
      console.error("Error creating thread:", err);
      setError(err.message || "Failed to create thread. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCategories) {
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

  if (!user) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .new-thread-wrap { padding: 16px 12px 60px !important; }
          .new-thread-form { grid-template-columns: 1fr !important; }
          .preview-panel { margin-left: 0 !important; margin-top: 16px !important; }
        }
        @media (max-width: 480px) {
          .new-thread-wrap { padding: 12px 8px 60px !important; }
          .new-thread-header h1 { font-size: 18px !important; }
          textarea { font-size: 13px !important; }
        }
      `}</style>
      <div
        className="new-thread-wrap"
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
            Go Back
          </button>

          {/* Header */}
          <div style={{ marginBottom: "24px" }} className="new-thread-header">
            <h1
              style={{
                color: T.txt,
                fontFamily: "Playfair Display",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 700,
                marginBottom: "8px"
              }}
            >
              Create New Thread
            </h1>
            <p style={{ color: T.txt2, fontSize: "14px" }}>
              Share your thoughts and start a discussion with the community
            </p>
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

          {/* Form Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr",
              gap: "20px"
            }}
            className="new-thread-form"
          >
            {/* Form Panel */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              {/* Category Select */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: T.txt
                  }}
                >
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    color: T.txt,
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer"
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

              {/* Title Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: T.txt
                  }}
                >
                  Thread Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your thread a clear, descriptive title..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    color: T.txt,
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit"
                  }}
                />
                <p style={{ fontSize: "11px", color: T.txtM, marginTop: "4px" }}>
                  {title.length}/100
                </p>
              </div>

              {/* Content Textarea */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: T.txt
                    }}
                  >
                    Thread Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      cursor: "pointer",
                      backgroundColor: showPreview ? T.amber : T.bgCard,
                      color: showPreview ? T.bgDeep : T.txt2,
                      border: `1px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s"
                    }}
                  >
                    <Eye size={12} />
                    {showPreview ? "Hide" : "Show"} Preview
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights... (Markdown supported)"
                  rows="10"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    color: T.txt,
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "300px"
                  }}
                />
                <p style={{ fontSize: "11px", color: T.txtM, marginTop: "4px" }}>
                  {content.length} characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "12px 16px",
                  borderRadius: "6px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  backgroundColor: T.amber,
                  color: T.bgDeep,
                  border: "none",
                  fontSize: "14px"
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Creating Thread...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Thread
                  </>
                )}
              </button>
            </form>

            {/* Preview Panel */}
            {showPreview && (
              <div
                className="preview-panel"
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  height: "fit-content",
                  position: "sticky",
                  top: "20px"
                }}
              >
                <h2 style={{ fontSize: "13px", fontWeight: 600, color: T.txt, marginBottom: "12px" }}>
                  Preview
                </h2>

                {!title && !content ? (
                  <p style={{ fontSize: "12px", color: T.txtM }}>
                    Your preview will appear here as you type...
                  </p>
                ) : (
                  <>
                    {title && (
                      <>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: T.txt,
                            marginBottom: "8px",
                            wordBreak: "break-word"
                          }}
                        >
                          {title}
                        </h3>
                      </>
                    )}
                    {content && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: T.txt2,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          maxHeight: "400px",
                          overflowY: "auto"
                        }}
                      >
                        {content}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div
            style={{
              marginTop: "24px",
              padding: "12px",
              borderRadius: "6px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              fontSize: "12px",
              color: T.txt2
            }}
          >
            <p style={{ marginBottom: "8px", fontWeight: 500 }}>Tips for a great post:</p>
            <ul style={{ marginLeft: "16px", lineHeight: 1.6 }}>
              <li>Use a clear, descriptive title that summarizes your topic</li>
              <li>Provide context and relevant details in your content</li>
              <li>Be respectful and constructive in your discussion</li>
              <li>Search before posting to avoid duplicate threads</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
