import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Guitar,
  Users,
  BookOpen,
  MessageSquare,
  Clock,
  X,
  ArrowRight,
  Shield,
  MapPin,
  Star,
} from "lucide-react";
import { T } from "../theme/tokens";
import { supabase } from "../lib/supabase/client";

// Result Card Component
function ResultCard({ item, onAction }) {
  if (item.type === "guitar") {
    const ownerName = item.current_owner?.display_name || item.current_owner?.username || "Unknown";
    const isVerified = item.current_owner?.is_verified || false;

    return (
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "12px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
          alignItems: "flex-start",
        }}
      >
        <img
          src={item.main_image_url || "/images/placeholder.webp"}
          alt={item.model}
          style={{
            width: "100px",
            height: "80px",
            borderRadius: "6px",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, margin: 0 }}>
              {item.make} {item.model}
            </h3>
            {isVerified && (
              <Shield size={16} color={T.warm} style={{ flexShrink: 0 }} />
            )}
          </div>
          <p style={{ fontSize: "13px", color: T.txt2, margin: "4px 0", display: "flex", gap: "12px" }}>
            <span>{item.year}</span>
            <span>Owner: {ownerName}</span>
          </p>
        </div>
        <Link
          to={`/instrument/${item.id}`}
          style={{
            background: "none",
            border: "none",
            color: T.warm,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          View <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  if (item.type === "user") {
    return (
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "12px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
          alignItems: "center",
        }}
      >
        <img
          src={item.avatar_url || "/images/placeholder.webp"}
          alt={item.display_name || item.username}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, margin: "0 0 2px 0" }}>
            {item.display_name || item.username}
          </h3>
          <p style={{ fontSize: "13px", color: T.txt2, margin: "0 0 4px 0" }}>
            @{item.username}
          </p>
          <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: T.txtM }}>
            {item.location && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={12} />
                {item.location}
              </span>
            )}
            {item.is_luthier && (
              <span style={{ color: T.warm, fontWeight: 600 }}>Luthier</span>
            )}
          </div>
        </div>
        <Link
          to={`/user/${item.username}`}
          style={{
            padding: "8px 16px",
            backgroundColor: T.warm,
            color: T.bgDeep,
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          View Profile
        </Link>
      </div>
    );
  }

  if (item.type === "brand") {
    return (
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "12px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "6px",
            objectFit: "cover",
            flexShrink: 0,
            backgroundColor: T.bgElev,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: 600,
            color: T.warm,
          }}
        >
          {item.make.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, margin: "0 0 2px 0" }}>
            {item.make}
          </h3>
          <p style={{ fontSize: "13px", color: T.txt2, margin: "0 0 4px 0" }}>
            {item.count} {item.count === 1 ? "guitar" : "guitars"} on TWNG
          </p>
        </div>
        <Link
          to={`/explore?make=${encodeURIComponent(item.make)}`}
          style={{
            background: "none",
            border: "none",
            color: T.warm,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          View Brand <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  if (item.type === "article") {
    return (
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "12px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
        }}
      >
        <img
          src={item.featured_image_url || "/images/placeholder.webp"}
          alt={item.title}
          style={{
            width: "120px",
            height: "80px",
            borderRadius: "6px",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, margin: "0 0 6px 0" }}>
            {item.title}
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: T.txt2,
              margin: "0 0 8px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.excerpt}
          </p>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {item.category && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 8px",
                    backgroundColor: T.bgElev,
                    color: T.warm,
                    borderRadius: "4px",
                    border: `1px solid ${T.borderAcc}`,
                  }}
                >
                  {item.category}
                </span>
              )}
            </div>
            <Link
              to={`/articles/${item.id}`}
              style={{
                background: "none",
                border: "none",
                color: T.warm,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
              }}
            >
              Read <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === "forumPost") {
    const authorName = item.author?.display_name || item.author?.username || "Unknown";

    return (
      <div
        style={{
          padding: "12px",
          backgroundColor: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, margin: "0 0 6px 0" }}>
          {item.title}
        </h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover",
                backgroundColor: T.bgElev,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 600,
                color: T.warm,
              }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "12px", color: T.txt, margin: 0, fontWeight: 500 }}>
                {authorName}
              </p>
            </div>
          </div>
          <Link
            to={`/forum/thread/${item.id}`}
            style={{
              background: "none",
              border: "none",
              color: T.warm,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
            }}
          >
            View <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }
}

// Recent Searches Component
function RecentSearches({ onSearch }) {
  const [recentSearches, setRecentSearches] = React.useState([]);
  const suggestedSearches = ["Gibson Custom Shop", "Budget Electric Guitars", "Semi-Hollow Body", "Rare Vintage"];

  React.useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch (e) {
        console.error("Error parsing recent searches:", e);
      }
    }
  }, []);

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      {recentSearches.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: T.txt, margin: 0 }}>
              Recent Searches
            </h2>
            <button
              onClick={clearRecentSearches}
              style={{
                background: "none",
                border: "none",
                color: T.txt2,
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear recent searches
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => onSearch(term)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "6px",
                  color: T.txt,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Clock size={14} />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: T.txt, margin: "0 0 16px 0" }}>
          Suggested Searches
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {suggestedSearches.map((term, i) => (
            <button
              key={i}
              onClick={() => onSearch(term)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: T.bgElev,
                border: `1px solid ${T.borderAcc}`,
                borderRadius: "6px",
                color: T.warm,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Star size={14} />
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function TWNGSearchResults() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q");

  const [query, setQuery] = useState(queryParam || "");
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState(query);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    guitars: [],
    users: [],
    brands: [],
    articles: [],
    forumPosts: [],
  });

  // Save search to localStorage
  const saveSearchToHistory = (term) => {
    if (term.trim().length < 2) return;
    const stored = localStorage.getItem("recentSearches");
    let history = [];
    try {
      history = JSON.parse(stored) || [];
    } catch (e) {
      history = [];
    }
    history = [term, ...history.filter((t) => t !== term)].slice(0, 10);
    localStorage.setItem("recentSearches", JSON.stringify(history));
  };

  // Fetch search results
  const fetchResults = async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      setResults({ guitars: [], users: [], brands: [], articles: [], forumPosts: [] });
      return;
    }

    setLoading(true);
    saveSearchToHistory(searchTerm);

    try {
      const searchPattern = `%${searchTerm}%`;

      // Search instruments
      const { data: guitars, error: guitarsError } = await supabase
        .from("instruments")
        .select(
          `
          id,
          make,
          model,
          year,
          main_image_url,
          custom_fields,
          current_owner:users!current_owner_id(
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `
        )
        .or(`make.ilike.${searchPattern},model.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(20);

      if (guitarsError) throw guitarsError;

      const guitarsWithType = (guitars || []).map((g) => ({ ...g, type: "guitar" }));

      // Search users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select(
          `
          id,
          username,
          display_name,
          avatar_url,
          location,
          is_verified,
          is_luthier
        `
        )
        .or(`username.ilike.${searchPattern},display_name.ilike.${searchPattern}`)
        .limit(20);

      if (usersError) throw usersError;

      const usersWithType = (users || []).map((u) => ({ ...u, type: "user" }));

      // Search articles
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select(
          `
          id,
          title,
          excerpt,
          featured_image_url,
          category,
          created_at
        `
        )
        .ilike("title", searchPattern)
        .eq("status", "published")
        .limit(20);

      if (articlesError) throw articlesError;

      const articlesWithType = (articles || []).map((a) => ({ ...a, type: "article" }));

      // Search forum threads
      const { data: forumThreads, error: forumError } = await supabase
        .from("forum_threads")
        .select(
          `
          id,
          title,
          created_at,
          author:author_id(
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .ilike("title", searchPattern)
        .limit(20);

      if (forumError) throw forumError;

      const forumWithType = (forumThreads || []).map((f) => ({ ...f, type: "forumPost" }));

      // Get distinct brands with counts
      const { data: allInstruments, error: brandsError } = await supabase
        .from("instruments")
        .select("make");

      if (brandsError) throw brandsError;

      const brandCounts = {};
      (allInstruments || []).forEach((instrument) => {
        if (instrument.make && instrument.make.toLowerCase().includes(searchTerm.toLowerCase())) {
          brandCounts[instrument.make] = (brandCounts[instrument.make] || 0) + 1;
        }
      });

      const brands = Object.entries(brandCounts)
        .map(([make, count]) => ({
          make,
          count,
          type: "brand",
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setResults({
        guitars: guitarsWithType,
        users: usersWithType,
        brands,
        articles: articlesWithType,
        forumPosts: forumWithType,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults({ guitars: [], users: [], brands: [], articles: [], forumPosts: [] });
    } finally {
      setLoading(false);
    }
  };

  // Perform search when query changes
  useEffect(() => {
    fetchResults(query);
  }, [query]);

  const handleSearch = (searchTerm) => {
    setQuery(searchTerm);
    setSearchInput(searchTerm);
    setActiveTab("all");
  };

  // Tab counts
  const tabCounts = {
    all: results.guitars.length + results.users.length + results.brands.length + results.articles.length + results.forumPosts.length,
    guitars: results.guitars.length,
    users: results.users.length,
    brands: results.brands.length,
    articles: results.articles.length,
    forumPosts: results.forumPosts.length,
  };

  // Get results for active tab
  const getTabResults = () => {
    switch (activeTab) {
      case "guitars":
        return results.guitars;
      case "users":
        return results.users;
      case "brands":
        return results.brands;
      case "articles":
        return results.articles;
      case "forumPosts":
        return results.forumPosts;
      default:
        return [
          ...results.guitars.slice(0, 4),
          ...results.users.slice(0, 3),
          ...results.brands,
          ...results.articles.slice(0, 2),
          ...results.forumPosts.slice(0, 2),
        ];
    }
  };

  const tabResults = getTabResults();
  const isAllTab = activeTab === "all";

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh", color: T.txt, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ backgroundColor: T.bgCard, borderBottom: `1px solid ${T.border}`, padding: "20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Search Input */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={20}
                color={T.txt2}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(searchInput)}
                placeholder="Search guitars, users, brands, articles..."
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  backgroundColor: T.bgElev,
                  border: `1px solid ${T.border}`,
                  borderRadius: "8px",
                  color: T.txt,
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Query Info */}
          {query && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p style={{ fontSize: "13px", color: T.txt2, margin: 0 }}>
                Showing results for{" "}
                <span style={{ color: T.txt, fontWeight: 600 }}>"{query}"</span>
              </p>
              <p style={{ fontSize: "13px", color: T.txtM, margin: 0 }}>
                {loading ? "Searching..." : `${tabCounts.all} results`}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: "24px", borderBottom: `1px solid ${T.border}`, marginTop: "12px", overflowX: "auto" }}>
            {[
              { id: "all", label: "All", count: tabCounts.all },
              { id: "guitars", label: "Guitars", count: tabCounts.guitars },
              { id: "users", label: "Users", count: tabCounts.users },
              { id: "brands", label: "Brands", count: tabCounts.brands },
              { id: "articles", label: "Articles", count: tabCounts.articles },
              { id: "forumPosts", label: "Forum Posts", count: tabCounts.forumPosts },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 0",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? `2px solid ${T.warm}` : "2px solid transparent",
                  color: activeTab === tab.id ? T.txt : T.txt2,
                  fontSize: "14px",
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>
        {!query ? (
          <RecentSearches onSearch={handleSearch} />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "14px", color: T.txt2 }}>Searching...</div>
          </div>
        ) : tabResults.length > 0 ? (
          isAllTab ? (
            // All tab: grouped by type
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {[
                { type: "guitars", label: "Guitars", icon: Guitar },
                { type: "users", label: "Users", icon: Users },
                { type: "brands", label: "Brands", icon: null },
                { type: "articles", label: "Articles", icon: BookOpen },
                { type: "forumPosts", label: "Forum Posts", icon: MessageSquare },
              ].map(({ type, label, icon: Icon }) => {
                const items = results[type].slice(0, type === "articles" ? 2 : type === "forumPosts" ? 2 : 4);
                if (items.length === 0) return null;

                return (
                  <div key={type}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {Icon && <Icon size={18} color={T.warm} />}
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: T.txt, margin: 0 }}>
                          {label}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab(type)}
                        style={{
                          background: "none",
                          border: "none",
                          color: T.warm,
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View all
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {items.map((item, i) => (
                        <ResultCard
                          key={`${type}-${i}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Single tab view
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tabResults.map((item, i) => (
                <ResultCard
                  key={i}
                  item={item}
                />
              ))}
            </div>
          )
        ) : (
          // No results
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Search size={48} color={T.txt2} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: T.txt, margin: "0 0 8px 0" }}>
              No results found for "{query}"
            </h2>
            <p style={{ fontSize: "14px", color: T.txt2, margin: "0 0 24px 0" }}>
              Try refining your search or exploring suggestions below
            </p>
            <div style={{ backgroundColor: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: "0 0 12px 0" }}>
                Try:
              </p>
              <ul style={{ fontSize: "13px", color: T.txt2, margin: 0, paddingLeft: "20px" }}>
                <li>Check your spelling</li>
                <li>Try broader search terms</li>
                <li>Search by brand instead of model</li>
              </ul>
              <p style={{ fontSize: "13px", color: T.txt2, margin: "12px 0 0 0" }}>
                Can't find your guitar?{" "}
                <Link
                  to="/instrument/new"
                  style={{
                    background: "none",
                    border: "none",
                    color: T.warm,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Try Magic Add
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
