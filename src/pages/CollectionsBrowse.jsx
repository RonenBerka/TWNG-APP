import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Plus,
  Loader2,
  Heart,
  Users,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import { getCollections } from "../lib/supabase/collections";
import { isFavorited } from "../lib/supabase/userFavorites";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Most Items", value: "mostItems" },
  { label: "Most Popular", value: "mostPopular" },
];

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Vintage", value: "vintage" },
  { label: "Modern", value: "modern" },
  { label: "Custom", value: "custom" },
  { label: "Rare Finds", value: "rareFinds" },
];

/* ─── Collection Card Component ────────────────────────────────────── */
function CollectionCard({ collection, onFavoriteToggle, isFav }) {
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
        cursor: "pointer",
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
          {collection.is_public ? "Public" : "Private"}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle();
          }}
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
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          aria-label="Add to favorites"
        >
          <Heart
            size={18}
            color={isFav ? T.error : T.txt2}
            fill={isFav ? T.error : "none"}
            strokeWidth={isFav ? 0 : 2}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: T.txt2,
            marginTop: "auto",
            paddingTop: "12px",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <span>{itemCount} items</span>
          {collection.user_id && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Users size={12} /> {collection.user_id.slice(0, 8)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function CollectionsBrowse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "newest"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  );
  const [favorites, setFavorites] = useState(new Set());
  const { user } = useAuth();

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCollections({
          limit: 50,
          publicOnly: true,
        });
        setCollections(data || []);

        // Fetch favorites if logged in
        if (user?.id) {
          const favList = new Set();
          for (const col of data || []) {
            const isFav = await isFavorited(user.id, col.id, "collection");
            if (isFav) favList.add(col.id);
          }
          setFavorites(favList);
        }
      } catch (err) {
        console.error("Failed to fetch collections:", err);
        setError("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [user?.id]);

  // Apply filters and sorting
  const filtered = useMemo(() => {
    let result = [...collections];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((col) =>
        col.name.toLowerCase().includes(q) ||
        (col.description && col.description.toLowerCase().includes(q))
      );
    }

    // Category filter (mocked for now)
    if (categoryFilter !== "all") {
      // In production, would filter based on actual category field
      // result = result.filter(col => col.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at) - new Date(a.created_at)
        );
      } else if (sortBy === "mostItems") {
        const aCount = a.collection_items?.length || 0;
        const bCount = b.collection_items?.length || 0;
        return bCount - aCount;
      } else if (sortBy === "mostPopular") {
        // Would use actual popularity metrics
        return 0;
      }
      return 0;
    });

    return result;
  }, [collections, searchQuery, categoryFilter, sortBy]);

  const handleFavoriteToggle = (collectionId) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set("q", e.target.value);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", newSort);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (newCategory) => {
    setCategoryFilter(newCategory);
    const newParams = new URLSearchParams(searchParams);
    if (newCategory !== "all") {
      newParams.set("category", newCategory);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Page Header ──────────────────────────────────────────── */}
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
            Collections
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: T.txt2,
              marginBottom: "24px",
            }}
          >
            Browse curated instrument collections from the community
          </p>

          {/* ── Toolbar ──────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              style={{
                flex: "1 1 300px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                borderRadius: "10px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
              }}
            >
              <Search size={16} color={T.txtM} />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: T.txt,
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Category Filter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
              }}
            >
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: T.txt,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
              }}
            >
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: T.txt,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Collection Button (if logged in) */}
            {user && (
              <Link
                to="/collections/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  backgroundColor: T.warm,
                  color: T.bgDeep,
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={16} /> New Collection
              </Link>
            )}
          </div>
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
              <p style={{ color: T.txtM }}>Loading collections...</p>
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

        {/* ── Collections Grid ─────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "24px",
                }}
              >
                {filtered.map((collection, idx) => (
                  <div
                    key={collection.id}
                    style={{
                      animation: `fadeIn 0.4s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <CollectionCard
                      collection={collection}
                      isFav={favorites.has(collection.id)}
                      onFavoriteToggle={() =>
                        handleFavoriteToggle(collection.id)
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: "8px",
                  }}
                >
                  No collections found
                </p>
                <p style={{ color: T.txt2 }}>
                  {searchQuery
                    ? "Try a different search term"
                    : "Be the first to create a collection"}
                </p>
                {user && (
                  <Link
                    to="/collections/new"
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
                    Create Collection
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
        select option {
          background-color: ${T.bgCard};
          color: ${T.txt};
        }
      `}</style>
    </div>
  );
}
