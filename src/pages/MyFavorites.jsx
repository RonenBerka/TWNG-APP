import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getUserFavorites,
  removeFavorite,
} from "../lib/supabase/userFavorites";

const TABS = [
  { id: "instruments", label: "Instruments", icon: "🎸" },
  { id: "collections", label: "Collections", icon: "📚" },
  { id: "articles", label: "Articles", icon: "📰" },
];

/* ─── Instrument Card Component ────────────────────────────────────── */
function InstrumentCard({ instrument, onUnfavorite, isUnfavoriting }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: T.bgCard,
        border: `1px solid ${hovered ? T.borderAcc : T.border}`,
        transition: "all 0.3s",
      }}
    >
      {/* Image */}
      <Link
        to={`/instrument/${instrument.id}`}
        style={{
          position: "relative",
          aspectRatio: "4/5",
          overflow: "hidden",
          backgroundColor: T.bgElev,
          textDecoration: "none",
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

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUnfavorite();
          }}
          disabled={isUnfavoriting}
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(12,10,9,0.7)",
            backdropFilter: "blur(8px)",
            border: "none",
            cursor: isUnfavoriting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            opacity: isUnfavoriting ? 0.6 : 1,
          }}
          aria-label="Remove from favorites"
        >
          <Heart
            size={18}
            color={T.error}
            fill={T.error}
            strokeWidth={0}
          />
        </button>
      </Link>

      {/* Info */}
      <Link
        to={`/instrument/${instrument.id}`}
        style={{
          display: "block",
          padding: "14px",
          textDecoration: "none",
        }}
      >
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
            marginBottom: "4px",
            lineHeight: 1.2,
          }}
        >
          {instrument.model || "Unnamed"}
        </h4>
      </Link>
    </div>
  );
}

/* ─── Collection Card Component ─────────────────────────────────────── */
function CollectionCard({ collection, onUnfavorite, isUnfavoriting }) {
  const [hovered, setHovered] = useState(false);

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
      }}
    >
      {/* Cover Image */}
      <Link
        to={`/collections/${collection.id}`}
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

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUnfavorite();
          }}
          disabled={isUnfavoriting}
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(12,10,9,0.7)",
            backdropFilter: "blur(8px)",
            border: "none",
            cursor: isUnfavoriting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            opacity: isUnfavoriting ? 0.6 : 1,
          }}
          aria-label="Remove from favorites"
        >
          <Heart
            size={18}
            color={T.error}
            fill={T.error}
            strokeWidth={0}
          />
        </button>
      </Link>

      {/* Collection Info */}
      <Link
        to={`/collections/${collection.id}`}
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
              marginBottom: "auto",
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
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          {collection.collection_items?.length || 0} items
        </div>
      </Link>
    </div>
  );
}

/* ─── Article Card Component ──────────────────────────────────────── */
function ArticleCard({ article, onUnfavorite, isUnfavoriting }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: T.bgCard,
        border: `1px solid ${hovered ? T.borderAcc : T.border}`,
        transition: "all 0.3s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <Link
        to={`/article/${article.id}`}
        style={{
          position: "relative",
          aspectRatio: "16/9",
          overflow: "hidden",
          backgroundColor: T.bgElev,
          textDecoration: "none",
        }}
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
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
            📰
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUnfavorite();
          }}
          disabled={isUnfavoriting}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(12,10,9,0.7)",
            backdropFilter: "blur(8px)",
            border: "none",
            cursor: isUnfavoriting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            opacity: isUnfavoriting ? 0.6 : 1,
          }}
          aria-label="Remove from favorites"
        >
          <Heart
            size={18}
            color={T.error}
            fill={T.error}
            strokeWidth={0}
          />
        </button>
      </Link>

      {/* Article Info */}
      <Link
        to={`/article/${article.id}`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          textDecoration: "none",
        }}
      >
        {article.category && (
          <span
            style={{
              fontSize: "11px",
              color: T.warm,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {article.category}
          </span>
        )}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: T.txt,
            fontFamily: "'Playfair Display', serif",
            marginBottom: "auto",
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p
            style={{
              fontSize: "13px",
              color: T.txtM,
              marginTop: "8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {article.excerpt}
          </p>
        )}
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function MyFavorites() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("instruments");
  const [instrumentFavorites, setInstrumentFavorites] = useState([]);
  const [collectionFavorites, setCollectionFavorites] = useState([]);
  const [articleFavorites, setArticleFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all favorite types
        const [instruments, collections, articles] = await Promise.all([
          getUserFavorites(user.id, "instrument", { limit: 100 }),
          getUserFavorites(user.id, "collection", { limit: 100 }),
          getUserFavorites(user.id, "article", { limit: 100 }),
        ]);

        // Mock data for articles since they may not have full data
        setInstrumentFavorites(instruments || []);
        setCollectionFavorites(collections || []);
        setArticleFavorites(articles || []);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setError("Failed to load your favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id]);

  const handleUnfavorite = async (favoriteId, favoriteType) => {
    if (!user?.id) return;

    try {
      setRemovingId(favoriteId);
      await removeFavorite(user.id, favoriteId, favoriteType);

      // Update local state
      if (favoriteType === "instrument") {
        setInstrumentFavorites((prev) =>
          prev.filter((fav) => fav.favorite_id !== favoriteId)
        );
      } else if (favoriteType === "collection") {
        setCollectionFavorites((prev) =>
          prev.filter((fav) => fav.favorite_id !== favoriteId)
        );
      } else if (favoriteType === "article") {
        setArticleFavorites((prev) =>
          prev.filter((fav) => fav.favorite_id !== favoriteId)
        );
      }
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return null;
  }

  const displayInstruments = instrumentFavorites
    .map((fav) => ({
      ...fav.instruments,
      id: fav.favorite_id || fav.instruments?.id,
    }))
    .filter((inst) => inst && inst.id);

  const displayCollections = collectionFavorites
    .map((fav) => ({
      ...fav.collections,
      id: fav.favorite_id || fav.collections?.id,
    }))
    .filter((col) => col && col.id);

  const displayArticles = articleFavorites
    .map((fav) => ({
      ...fav.articles,
      id: fav.favorite_id || fav.articles?.id,
    }))
    .filter((art) => art && art.id);

  const activeContent = {
    instruments: {
      items: displayInstruments,
      empty: "You haven't favorited any instruments yet",
    },
    collections: {
      items: displayCollections,
      empty: "You haven't favorited any collections yet",
    },
    articles: {
      items: displayArticles,
      empty: "You haven't favorited any articles yet",
    },
  }[activeTab];

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
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "8px",
            }}
          >
            My Favorites
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: T.txt2,
            }}
          >
            Curated collection of your favorite instruments, collections, and
            articles
          </p>
        </div>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "40px",
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: "0",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "16px 20px",
                borderBottom: `2px solid ${
                  activeTab === tab.id ? T.warm : "transparent"
                }`,
                backgroundColor: "transparent",
                border: "none",
                color: activeTab === tab.id ? T.txt : T.txt2,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
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
              <p style={{ color: T.txtM }}>Loading your favorites...</p>
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

        {/* ── Content Grid ──────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {activeContent.items.length > 0 ? (
              <div
                style={{
                  display:
                    activeTab === "articles"
                      ? "grid"
                      : "grid",
                  gridTemplateColumns:
                    activeTab === "articles"
                      ? "repeat(auto-fill, minmax(350px, 1fr))"
                      : "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                {activeTab === "instruments" &&
                  displayInstruments.map((inst, idx) => (
                    <div
                      key={inst.id}
                      style={{
                        animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`,
                      }}
                    >
                      <InstrumentCard
                        instrument={inst}
                        isUnfavoriting={removingId === inst.id}
                        onUnfavorite={() =>
                          handleUnfavorite(inst.id, "instrument")
                        }
                      />
                    </div>
                  ))}

                {activeTab === "collections" &&
                  displayCollections.map((col, idx) => (
                    <div
                      key={col.id}
                      style={{
                        animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`,
                      }}
                    >
                      <CollectionCard
                        collection={col}
                        isUnfavoriting={removingId === col.id}
                        onUnfavorite={() =>
                          handleUnfavorite(col.id, "collection")
                        }
                      />
                    </div>
                  ))}

                {activeTab === "articles" &&
                  displayArticles.map((art, idx) => (
                    <div
                      key={art.id}
                      style={{
                        animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`,
                      }}
                    >
                      <ArticleCard
                        article={art}
                        isUnfavoriting={removingId === art.id}
                        onUnfavorite={() =>
                          handleUnfavorite(art.id, "article")
                        }
                      />
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
                    fontSize: "20px",
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: "8px",
                  }}
                >
                  {activeContent.empty}
                </p>
                <p style={{ color: T.txt2, marginBottom: "24px" }}>
                  Start favoriting items to see them here
                </p>
                {activeTab === "instruments" && (
                  <Link
                    to="/explore"
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
                    Browse Instruments
                  </Link>
                )}
                {activeTab === "collections" && (
                  <Link
                    to="/collections"
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
                    Browse Collections
                  </Link>
                )}
                {activeTab === "articles" && (
                  <Link
                    to="/articles"
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
                    Browse Articles
                  </Link>
                )}
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
