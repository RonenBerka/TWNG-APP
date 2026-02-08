import { useState } from "react";
import { Link } from "react-router-dom";
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

// Mock Data
const MOCK_RESULTS = {
  guitars: [
    {
      id: "g1",
      type: "guitar",
      brand: "Gibson",
      model: "Les Paul Custom",
      year: 1959,
      owner: "GuitarCollector",
      verified: true,
      tags: ["Vintage", "Sunburst"],
      image: "/images/guitars/shopping-1.webp",
    },
    {
      id: "g2",
      type: "guitar",
      brand: "Fender",
      model: "Les Paul Copy",
      year: 1976,
      owner: "VintageSeeker",
      verified: false,
      tags: ["Classic", "Mahogany"],
      image: "/images/guitars/nash-s57-1.jpg",
    },
    {
      id: "g3",
      type: "guitar",
      brand: "Epiphone",
      model: "Les Paul Standard",
      year: 2015,
      owner: "ModernPlayer",
      verified: true,
      tags: ["Affordable", "Reliable"],
      image: "/images/guitars/shopping.webp",
    },
    {
      id: "g4",
      type: "guitar",
      brand: "Gibson",
      model: "Les Paul Tribute",
      year: 2020,
      owner: "JazzEnthusiast",
      verified: false,
      tags: ["Modern", "Professional"],
      image: "/images/guitars/shopping-2.webp",
    },
    {
      id: "g5",
      type: "guitar",
      brand: "Heritage",
      model: "H-575",
      year: 2018,
      owner: "BluesPlayer",
      verified: true,
      tags: ["Handcrafted", "Premium"],
      image: "/images/guitars/download.webp",
    },
  ],
  users: [
    {
      id: "u1",
      type: "user",
      displayName: "Guitar Collector",
      username: "@guitarcollector",
      location: "Nashville, TN",
      guitarCount: 47,
      badges: ["Founding Member", "Pioneer"],
      avatar: "/images/guitars/images-1.jpg",
    },
    {
      id: "u2",
      type: "user",
      displayName: "Vintage Seeker",
      username: "@vintageseeker",
      location: "Los Angeles, CA",
      guitarCount: 23,
      badges: ["Verified Dealer"],
      avatar: "/images/guitars/images.jpg",
    },
    {
      id: "u3",
      type: "user",
      displayName: "Modern Player",
      username: "@modernplayer",
      location: "Portland, OR",
      guitarCount: 8,
      badges: [],
      avatar: "/images/guitars/images-4.jpg",
    },
    {
      id: "u4",
      type: "user",
      displayName: "Jazz Enthusiast",
      username: "@jazzfan88",
      location: "New York, NY",
      guitarCount: 15,
      badges: ["Music Educator"],
      avatar: "/images/guitars/images-2.jpg",
    },
    {
      id: "u5",
      type: "user",
      displayName: "Blues Player",
      username: "@bluesplayer",
      location: "Memphis, TN",
      guitarCount: 12,
      badges: ["Founding Member"],
      avatar: "/images/artists/download-1.jpg",
    },
    {
      id: "u6",
      type: "user",
      displayName: "Tech Musician",
      username: "@techmusician",
      location: "San Francisco, CA",
      guitarCount: 6,
      badges: [],
      avatar: "/images/artists/download.jpg",
    },
    {
      id: "u7",
      type: "user",
      displayName: "Acoustic Maven",
      username: "@acousticmaven",
      location: "Boulder, CO",
      guitarCount: 9,
      badges: ["Verified Dealer"],
      avatar: "/images/guitars/shopping-3.webp",
    },
    {
      id: "u8",
      type: "user",
      displayName: "Rock Historian",
      username: "@rockhistorian",
      location: "Chicago, IL",
      guitarCount: 19,
      badges: ["Pioneer"],
      avatar: "/images/guitars/shopping-1.webp",
    },
  ],
  brands: [
    {
      id: "b1",
      type: "brand",
      name: "Gibson",
      guitarCount: 234,
      foundedYear: 1902,
      country: "USA",
      logo: "/images/guitars/nash-s57-1.jpg",
    },
    {
      id: "b2",
      type: "brand",
      name: "Fender",
      guitarCount: 189,
      foundedYear: 1946,
      country: "USA",
      logo: "/images/guitars/shopping.webp",
    },
    {
      id: "b3",
      type: "brand",
      name: "Epiphone",
      guitarCount: 156,
      foundedYear: 1923,
      country: "USA",
      logo: "/images/guitars/shopping-2.webp",
    },
  ],
  articles: [
    {
      id: "a1",
      type: "article",
      title: "The Evolution of Les Paul: From 1952 to Today",
      excerpt: "Explore the rich history and design evolution of one of the world's most iconic electric guitars.",
      thumbnail: "/images/guitars/download.webp",
      badge: "History",
      readTime: "8 min",
    },
    {
      id: "a2",
      type: "article",
      title: "Gibson vs Epiphone: Which Les Paul Should You Choose?",
      excerpt: "A comprehensive comparison of these two popular Les Paul models for beginners and professionals alike.",
      thumbnail: "/images/guitars/images-1.jpg",
      badge: "Comparison",
      readTime: "12 min",
    },
    {
      id: "a3",
      type: "article",
      title: "Vintage Les Paul Buying Guide: What to Look For",
      excerpt: "Tips and tricks for identifying authentic vintage Les Pauls and avoiding common pitfalls when purchasing.",
      thumbnail: "/images/guitars/images.jpg",
      badge: "Guide",
      readTime: "6 min",
    },
    {
      id: "a4",
      type: "article",
      title: "Maintenance Tips for Your Les Paul Collection",
      excerpt: "Learn proper care and maintenance techniques to keep your prized guitars in pristine condition.",
      thumbnail: "/images/guitars/images-4.jpg",
      badge: "Maintenance",
      readTime: "10 min",
    },
    {
      id: "a5",
      type: "article",
      title: "Les Paul Custom vs Standard: Technical Deep Dive",
      excerpt: "Understanding the technical differences, specifications, and what each model offers musicians.",
      thumbnail: "/images/guitars/images-2.jpg",
      badge: "Technical",
      readTime: "15 min",
    },
    {
      id: "a6",
      type: "article",
      title: "Why Les Pauls Are Essential in Blues Music",
      excerpt: "Discover the relationship between Les Paul guitars and the development of modern blues guitar playing.",
      thumbnail: "/images/artists/download-1.jpg",
      badge: "Music History",
      readTime: "7 min",
    },
    {
      id: "a7",
      type: "article",
      title: "Getting the Best Tone from Your Les Paul Amplifier Setup",
      excerpt: "Expert advice on amplifier selection and settings to maximize your Les Paul's sonic potential.",
      thumbnail: "/images/artists/download.jpg",
      badge: "Gear",
      readTime: "9 min",
    },
    {
      id: "a8",
      type: "article",
      title: "Authentication Guide: Spotting Counterfeit Les Pauls",
      excerpt: "Learn the key identifying features and red flags that distinguish authentic guitars from fakes.",
      thumbnail: "/images/guitars/shopping-3.webp",
      badge: "Buying Guide",
      readTime: "11 min",
    },
    {
      id: "a9",
      type: "article",
      title: "Collector's Corner: Rarest Les Paul Editions",
      excerpt: "Exploring the most sought-after and valuable Les Paul models from Gibson's prestigious archives.",
      thumbnail: "/images/guitars/shopping-1.webp",
      badge: "Collecting",
      readTime: "14 min",
    },
  ],
  forumPosts: [
    {
      id: "f1",
      type: "forumPost",
      title: "Is my 1985 Les Paul Custom worth getting appraised?",
      excerpt: "Thinking about having my vintage custom appraised but want to know if it's worth the investment...",
      author: "VintageOwner",
      avatar: "/images/guitars/nash-s57-1.jpg",
      replyCount: 12,
    },
    {
      id: "f2",
      type: "forumPost",
      title: "Best budget Les Paul for a beginner?",
      excerpt: "Looking to get into guitar playing and interested in Les Pauls. What's the best affordable option...",
      author: "NewbieGuitarist",
      avatar: "/images/guitars/shopping.webp",
      replyCount: 28,
    },
    {
      id: "f3",
      type: "forumPost",
      title: "New Gibson Custom Shop order just arrived!",
      excerpt: "Just received my dream guitar! Sharing photos and first impressions of the new Custom Shop model...",
      author: "HappyCollector",
      avatar: "/images/guitars/shopping-2.webp",
      replyCount: 34,
    },
    {
      id: "f4",
      type: "forumPost",
      title: "Anyone else have trouble with frets on newer Gibsons?",
      excerpt: "I've had some quality control issues with my recent purchase. Are others experiencing similar problems...",
      author: "ConcernedOwner",
      avatar: "/images/guitars/download.webp",
      replyCount: 7,
    },
  ],
};

// Result Card Component
function ResultCard({ item, onAction }) {
  if (item.type === "guitar") {
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
          src={item.image}
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
              {item.brand} {item.model}
            </h3>
            {item.verified && (
              <Shield size={16} color={T.warm} style={{ flexShrink: 0 }} />
            )}
          </div>
          <p style={{ fontSize: "13px", color: T.txt2, margin: "4px 0", display: "flex", gap: "12px" }}>
            <span>{item.year}</span>
            <span>Owner: {item.owner}</span>
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
            {item.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: "12px",
                  padding: "3px 8px",
                  backgroundColor: T.bgElev,
                  color: T.txt2,
                  borderRadius: "4px",
                  border: `1px solid ${T.border}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          to={`/guitar/${item.id}`}
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
          src={item.avatar}
          alt={item.displayName}
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
            {item.displayName}
          </h3>
          <p style={{ fontSize: "13px", color: T.txt2, margin: "0 0 4px 0" }}>
            {item.username}
          </p>
          <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: T.txtM }}>
            {item.location && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={12} />
                {item.location}
              </span>
            )}
            <span>{item.guitarCount} guitars</span>
          </div>
          {item.badges.length > 0 && (
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              {item.badges.map((badge, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11px",
                    padding: "3px 8px",
                    backgroundColor: T.bgElev,
                    color: T.warm,
                    borderRadius: "4px",
                    border: `1px solid ${T.borderAcc}`,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onAction?.("view_user", item.id)}
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
          }}
        >
          View Profile
        </button>
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
        <img
          src={item.logo}
          alt={item.name}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "6px",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: T.txt, margin: "0 0 2px 0" }}>
            {item.name}
          </h3>
          <p style={{ fontSize: "13px", color: T.txt2, margin: "0 0 4px 0" }}>
            {item.guitarCount} guitars on TWNG
          </p>
          <p style={{ fontSize: "12px", color: T.txtM, margin: 0 }}>
            Founded {item.foundedYear} • {item.country}
          </p>
        </div>
        <Link
          to={`/explore?brand=${encodeURIComponent(item.name)}`}
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
          src={item.thumbnail}
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
                {item.badge}
              </span>
              <span style={{ fontSize: "12px", color: T.txtM }}>
                {item.readTime} read
              </span>
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
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <img
              src={item.avatar}
              alt={item.author}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <p style={{ fontSize: "12px", color: T.txt, margin: 0, fontWeight: 500 }}>
                {item.author}
              </p>
              <p style={{ fontSize: "11px", color: T.txtM, margin: 0 }}>
                {item.replyCount} {item.replyCount === 1 ? "reply" : "replies"}
              </p>
            </div>
          </div>
          <Link
            to={`/community/${item.id}`}
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
  const recentSearches = ["Les Paul", "Vintage Guitars", "Gibson", "Fender Stratocaster", "Acoustic Guitars"];
  const suggestedSearches = ["Gibson Custom Shop", "Budget Electric Guitars", "Semi-Hollow Body", "Rare Vintage"];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: T.txt, margin: 0 }}>
            Recent Searches
          </h2>
          <button
            onClick={() => localStorage.clear()}
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
  const [query, setQuery] = useState("Les Paul");
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = (searchTerm) => {
    setQuery(searchTerm);
    setSearchInput(searchTerm);
    setActiveTab("all");
  };

  const handleAction = (action, itemId) => {
    console.log(`Action: ${action}, Item ID: ${itemId}`);
  };

  // Tab counts
  const tabCounts = {
    all: Object.values(MOCK_RESULTS).reduce((sum, arr) => sum + arr.length, 0),
    guitars: MOCK_RESULTS.guitars.length,
    users: MOCK_RESULTS.users.length,
    brands: MOCK_RESULTS.brands.length,
    articles: MOCK_RESULTS.articles.length,
    forumPosts: MOCK_RESULTS.forumPosts.length,
  };

  // Get results for active tab
  const getTabResults = () => {
    switch (activeTab) {
      case "guitars":
        return MOCK_RESULTS.guitars;
      case "users":
        return MOCK_RESULTS.users;
      case "brands":
        return MOCK_RESULTS.brands;
      case "articles":
        return MOCK_RESULTS.articles;
      case "forumPosts":
        return MOCK_RESULTS.forumPosts;
      default:
        return [
          ...MOCK_RESULTS.guitars.slice(0, 4),
          ...MOCK_RESULTS.users.slice(0, 3),
          ...MOCK_RESULTS.brands,
          ...MOCK_RESULTS.articles.slice(0, 2),
          ...MOCK_RESULTS.forumPosts.slice(0, 2),
        ];
    }
  };

  const results = getTabResults();
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
                {tabCounts.all} results
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
        ) : results.length > 0 ? (
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
                const items = MOCK_RESULTS[type].slice(0, type === "articles" ? 2 : type === "forumPosts" ? 2 : 4);
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
                          onAction={handleAction}
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
              {results.map((item, i) => (
                <ResultCard
                  key={i}
                  item={item}
                  onAction={handleAction}
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
                <button
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
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
