import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Lock,
  Globe,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getUserCollections,
  deleteCollection,
} from "../lib/supabase/collections";
import { ROUTES, collectionPath, collectionEditPath } from "../lib/routes";

/* ─── Collection Card Component ────────────────────────────────────── */
function CollectionCard({ collection, onDelete, isDeleting }) {
  const [hovered, setHovered] = useState(false);
  const itemCount = collection.collection_items?.length || 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: T.bgCard,
        border: `1px solid ${hovered ? T.borderAcc : T.border}`,
        transition: "all 0.3s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Cover Image */}
      <Link
        to={collectionPath(collection.id)}
        style={{
          position: "relative",
          aspectRatio: "4/3",
          overflow: "hidden",
          backgroundColor: T.bgElev,
          textDecoration: "none",
        }}
      >
        {collection.cover_image_url ? (
          <img
            src={collection.cover_image_url}
            alt={collection.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              opacity: 0.3,
            }}
          >
            🎸
          </div>
        )}

        {/* Visibility Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            backgroundColor: "rgba(12,10,9,0.8)",
            backdropFilter: "blur(8px)",
            color: T.warm,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {collection.is_public ? (
            <>
              <Globe size={10} /> Public
            </>
          ) : (
            <>
              <Lock size={10} /> Private
            </>
          )}
        </div>
      </Link>

      {/* Collection Info */}
      <Link
        to={collectionPath(collection.id)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          textDecoration: "none",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: T.txt,
            fontFamily: "'Playfair Display', serif",
            marginBottom: "4px",
            lineHeight: 1.2,
          }}
        >
          {collection.name}
        </h3>

        {collection.description && (
          <p
            style={{
              fontSize: "13px",
              color: T.txtM,
              marginBottom: "12px",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {collection.description}
          </p>
        )}

        {/* Footer stats */}
        <div
          style={{
            fontSize: "13px",
            color: T.txt2,
            paddingTop: "12px",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </div>
      </Link>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <Link
          to={collectionEditPath(collection.id)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: T.warm,
            color: T.bgDeep,
            textDecoration: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
        >
          <Edit size={14} /> Edit
        </Link>
        <button
          onClick={() => onDelete(collection.id)}
          disabled={isDeleting}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: T.error,
            color: "#fff",
            border: "none",
            cursor: isDeleting ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
            opacity: isDeleting ? 0.6 : 1,
          }}
        >
          {isDeleting ? (
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Trash2 size={14} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function MyCollections() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH);
    }
  }, [user, navigate]);

  // Fetch user's collections
  useEffect(() => {
    const fetchCollections = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getUserCollections(user.id, { limit: 100 });
        setCollections(data || []);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
        setError("Failed to load your collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [user?.id]);

  const handleDelete = async (collectionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this collection? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(collectionId);
      await deleteCollection(collectionId);
      setCollections((prev) =>
        prev.filter((col) => col.id !== collectionId)
      );
    } catch (err) {
      console.error("Failed to delete collection:", err);
      alert("Failed to delete collection");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 700,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              My Collections
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: T.txt2,
              }}
            >
              Manage your custom instrument collections
            </p>
          </div>

          {/* Create Button */}
          <Link
            to={ROUTES.COLLECTIONS_NEW}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              backgroundColor: T.warm,
              color: T.bgDeep,
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} /> Create Collection
          </Link>
        </div>

        {/* ── Loading State ────────────────────────────────────────── */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Loader2
                size={32}
                color={T.warm}
                style={{
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: T.txtM }}>Loading your collections...</p>
            </div>
          </div>
        )}

        {/* ── Error State ──────────────────────────────────────────── */}
        {error && !loading && (
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.error}`,
              textAlign: "center",
            }}
          >
            <p style={{ color: T.error, fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {/* ── Collections Grid ──────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {collections.length > 0 ? (
              <div>
                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "32px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "20px 24px",
                      borderRadius: "12px",
                      backgroundColor: T.bgCard,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ fontSize: "24px", color: T.warm }}>
                      📚
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          color: T.txt,
                          lineHeight: 1,
                        }}
                      >
                        {collections.length}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: T.txtM,
                          marginTop: "2px",
                        }}
                      >
                        Total Collections
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "20px 24px",
                      borderRadius: "12px",
                      backgroundColor: T.bgCard,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ fontSize: "24px", color: T.warm }}>
                      🌐
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          color: T.txt,
                          lineHeight: 1,
                        }}
                      >
                        {
                          collections.filter(
                            (col) => col.is_public
                          ).length
                        }
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: T.txtM,
                          marginTop: "2px",
                        }}
                      >
                        Public
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "20px 24px",
                      borderRadius: "12px",
                      backgroundColor: T.bgCard,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ fontSize: "24px", color: T.warm }}>
                      🎸
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: "28px",
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          color: T.txt,
                          lineHeight: 1,
                        }}
                      >
                        {collections.reduce(
                          (sum, col) =>
                            sum +
                            (col.collection_items?.length || 0),
                          0
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: T.txtM,
                          marginTop: "2px",
                        }}
                      >
                        Total Items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collections Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {collections.map((collection, idx) => (
                    <div
                      key={collection.id}
                      style={{
                        animation: `fadeIn 0.4s ease-out ${
                          idx * 0.05
                        }s both`,
                      }}
                    >
                      <CollectionCard
                        collection={collection}
                        onDelete={handleDelete}
                        isDeleting={deletingId === collection.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "80px 20px",
                  textAlign: "center",
                  borderRadius: "12px",
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                }}
              >
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: "8px",
                  }}
                >
                  No collections yet
                </p>
                <p
                  style={{
                    color: T.txt2,
                    marginBottom: "24px",
                  }}
                >
                  Start creating collections to organize your favorite
                  instruments
                </p>
                <Link
                  to={ROUTES.COLLECTIONS_NEW}
                  style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    backgroundColor: T.warm,
                    color: T.bgDeep,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Create Your First Collection
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
