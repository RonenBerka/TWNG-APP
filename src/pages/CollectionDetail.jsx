import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Edit,
  Trash2,
  Loader2,
  Lock,
  Globe,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getCollection,
  deleteCollection,
} from "../lib/supabase/collections";
import {
  addFavorite,
  removeFavorite,
  isFavorited,
} from "../lib/supabase/userFavorites";

/* ─── Instrument Card Component ────────────────────────────────────── */
function InstrumentCard({ instrument }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/instrument/${instrument.id}`}
      style={{
        textDecoration: "none",
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: T.bgCard,
          border: `1px solid ${hovered ? T.borderAcc : T.border}`,
          transition: "all 0.3s",
          cursor: "pointer",
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            aspectRatio: "4/5",
            overflow: "hidden",
            backgroundColor: T.bgElev,
          }}
        >
          {instrument.image_url ? (
            <img
              src={instrument.image_url}
              alt={instrument.model}
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
                opacity: 0.2,
              }}
            >
              🎸
            </div>
          )}

          {/* Year Badge */}
          {instrument.year && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                border: `1px solid ${T.warm}`,
                color: T.warm,
                backgroundColor: "rgba(12,10,9,0.7)",
                backdropFilter: "blur(8px)",
              }}
            >
              {instrument.year}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "14px" }}>
          <p
            style={{
              fontSize: "11px",
              color: T.txtM,
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {instrument.make || "Unknown"}
          </p>
          <h4
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: T.txt,
              fontFamily: "'Playfair Display', serif",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            {instrument.model || "Unnamed"}
          </h4>
          {instrument.year && (
            <p
              style={{
                fontSize: "12px",
                color: T.txt2,
              }}
            >
              {instrument.year}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = collection && user && collection.user_id === user.id;

  // Fetch collection
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCollection(id);
        if (!data) {
          setError("Collection not found");
        } else {
          setCollection(data);

          // Check if favorited
          if (user?.id) {
            const favorited = await isFavorited(user.id, id, "collection");
            setIsFav(favorited);
          }
        }
      } catch (err) {
        console.error("Failed to fetch collection:", err);
        setError("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id, user?.id]);

  const handleFavoriteToggle = async () => {
    if (!user?.id) {
      navigate("/auth");
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(user.id, id, "collection");
      } else {
        await addFavorite(user.id, id, "collection");
      }
      setIsFav(!isFav);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;

    try {
      setDeleting(true);
      await deleteCollection(id);
      navigate("/my-collections");
    } catch (err) {
      console.error("Failed to delete collection:", err);
      alert("Failed to delete collection");
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: collection?.name,
          text: collection?.description,
          url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Collection link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: T.bgDeep,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <p style={{ color: T.txtM }}>Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "10px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              color: T.txt,
              cursor: "pointer",
              marginBottom: "32px",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div
            style={{
              padding: "40px 24px",
              borderRadius: "12px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.error}`,
              textAlign: "center",
            }}
          >
            <p style={{ color: T.error, fontWeight: 600, fontSize: "16px" }}>
              {error || "Collection not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const itemCount = collection.collection_items?.length || 0;

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      {/* ── Header with back button ──────────────────────────────────── */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "32px 24px 0",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            backgroundColor: T.bgCard,
            border: `1px solid ${T.border}`,
            color: T.txt,
            cursor: "pointer",
            marginBottom: "32px",
            fontWeight: 500,
            fontSize: "14px",
            transition: "all 0.2s",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* ── Cover Image & Header ──────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 24px 40px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Cover Image */}
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              aspectRatio: "4/5",
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
                  fontSize: "64px",
                  opacity: 0.2,
                }}
              >
                🎸
              </div>
            )}
          </div>

          {/* Collection Info */}
          <div>
            {/* Visibility Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                fontSize: "12px",
                color: T.txt2,
                marginBottom: "16px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              {collection.is_public ? (
                <>
                  <Globe size={12} /> Public
                </>
              ) : (
                <>
                  <Lock size={12} /> Private
                </>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 700,
                color: T.txt,
                marginBottom: "12px",
                lineHeight: 1.1,
              }}
            >
              {collection.name}
            </h1>

            {/* Description */}
            {collection.description && (
              <p
                style={{
                  fontSize: "16px",
                  color: T.txt2,
                  marginBottom: "24px",
                  lineHeight: 1.6,
                }}
              >
                {collection.description}
              </p>
            )}

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "32px",
                paddingBottom: "24px",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: T.warm,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {itemCount}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: T.txtM,
                    marginTop: "4px",
                  }}
                >
                  Items
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    color: T.txtM,
                    marginTop: "4px",
                  }}
                >
                  Created on{" "}
                  {new Date(collection.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <button
                onClick={handleFavoriteToggle}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  backgroundColor: isFav ? T.error : T.bgCard,
                  border: `1px solid ${isFav ? T.error : T.border}`,
                  color: isFav ? "#fff" : T.txt,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
              >
                <Heart
                  size={16}
                  fill={isFav ? "currentColor" : "none"}
                  strokeWidth={isFav ? 0 : 2}
                />
                {isFav ? "Favorited" : "Add to Favorites"}
              </button>

              <button
                onClick={handleShare}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  color: T.txt,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
              >
                <Share2 size={16} /> Share
              </button>

              {isOwner && (
                <>
                  <Link
                    to={`/collections/${id}/edit`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      backgroundColor: T.warm,
                      border: "none",
                      color: T.bgDeep,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <Edit size={16} /> Edit
                  </Link>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 20px",
                      borderRadius: "10px",
                      backgroundColor: T.error,
                      border: "none",
                      color: "#fff",
                      cursor: deleting ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                      transition: "all 0.2s",
                      opacity: deleting ? 0.6 : 1,
                    }}
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} /> Delete
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Collection Items ──────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 700,
            color: T.txt,
            marginBottom: "24px",
          }}
        >
          Items ({itemCount})
        </h2>

        {itemCount > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {collection.collection_items?.map((item, idx) => (
              <div
                key={item.instrument_id}
                style={{
                  animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`,
                }}
              >
                <InstrumentCard instrument={item.instruments} />
              </div>
            ))}
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
                fontSize: "18px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              No items in this collection
            </p>
            <p style={{ color: T.txt2 }}>
              {isOwner
                ? "Start adding instruments to your collection"
                : "Check back later"}
            </p>
            {isOwner && (
              <Link
                to={`/collections/${id}/edit`}
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: T.warm,
                  color: T.bgDeep,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Add Items
              </Link>
            )}
          </div>
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
