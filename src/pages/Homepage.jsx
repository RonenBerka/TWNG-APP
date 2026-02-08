import { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  ChevronRight,
  Heart,
  ArrowRight,
  Guitar,
  Users,
  Building2,
  Shield,
  BookOpen,
  Clock,
  Eye,
  Quote,
  MessageSquare,
  Instagram,
  Twitter,
  Youtube,
  Sparkles,
} from "lucide-react";
import { IMG } from '../utils/placeholders';
import { T } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { getHomepageBlocks } from '../lib/supabase/admin';
import {
  getFeaturedGuitars,
  getRecentlyAdded,
  getTopBrands,
  getHomepageArticles,
  getHomepageTestimonials,
  getHomepageStats,
  getHomepageSectionConfig,
} from '../lib/supabase/homepage';

// ============================================================
// Image resolver — picks the best available image for a guitar
// ============================================================
function getGuitarImage(guitar) {
  // 1. OCC image uploaded by owner
  const occ = guitar?.occ?.find(o => o.content_type === 'image' && o.visible_publicly);
  if (occ?.content_data?.url) return occ.content_data.url;
  // 2. Local placeholder by brand
  const brandKey = guitar?.brand?.toLowerCase()?.replace(/\s+/g, '_');
  const brandMap = {
    heritage: IMG.heritage_lp, nash: IMG.nash_sunburst, fender: IMG.tele_relic,
    suhr: IMG.suhr_green, 'brian may': IMG.brian_may, gibson: IMG.heritage_lp,
    yamaha: IMG.yamaha_classical, cordoba: IMG.classical, gretsch: IMG.gretsch_white,
    rickenbacker: IMG.heritage_semi, prs: IMG.suhr_green, martin: IMG.classical,
  };
  if (brandMap[brandKey]) return brandMap[brandKey];
  // 3. Fallback
  return IMG.hero_tele;
}

// ============================================================
// Normalize Supabase guitar data → shape GuitarCard expects
// ============================================================
function normalizeGuitar(g) {
  if (!g) return null;
  return {
    id: g.id,
    brand: g.brand || '',
    model: g.model || '',
    year: g.year || 0,
    nickname: g.nickname || '',
    story: g.story || g.description || '',
    tags: Array.isArray(g.tags) ? g.tags : [],
    owner: typeof g.owner === 'string' ? g.owner
      : g.owner?.username ? `@${g.owner.username}`
      : g.owner?.display_name || 'Unknown',
    image: typeof g.image === 'string' ? g.image : getGuitarImage(g),
    verified: g.state === 'verified' || g.verified === true,
  };
}

// ============================================================
// Fallback Data (used when DB is unavailable or empty)
// ============================================================
const FALLBACK_FEATURED = [
  {
    id: 1,
    brand: "Heritage",
    model: "H-150 Standard",
    year: 2022,
    nickname: '"Honey Burst"',
    story:
      "Hand-built in Kalamazoo, Michigan — the original Gibson factory. This H-150 carries the DNA of the legendary Les Paul Standard.",
    tags: ["Kalamazoo", "PAF-style", "Flame Top"],
    owner: "@kalamazoo_kid",
    image: IMG.heritage_lp,
    verified: true,
  },
  {
    id: 2,
    brand: "Nash",
    model: "S-57 Heavy Relic",
    year: 2021,
    nickname: '"Road Warrior"',
    story:
      "Bill Nash's masterful aging on this '57 Strat reissue. Three-tone sunburst with maple neck, played-in feel from day one.",
    tags: ["Relic", "Sunburst", "SSS"],
    owner: "@relic_hunter",
    image: IMG.nash_sunburst,
    verified: true,
  },
  {
    id: 3,
    brand: "Fender",
    model: "Telecaster Heavy Relic",
    year: 2019,
    nickname: '"Butterscotch Brawler"',
    story:
      "Custom Shop-level relic work on a butterscotch blonde Tele. Black pickguard, maple neck, raw and uncompromising tone.",
    tags: ["Relic", "Blonde", "Custom"],
    owner: "@tele_faithful",
    image: IMG.tele_relic,
    verified: false,
  },
  {
    id: 4,
    brand: "Heritage",
    model: "H-535 Semi-Hollow",
    year: 2023,
    nickname: '"Cherry Bomb"',
    story:
      "Translucent cherry finish over flame maple on this semi-hollow. The Kalamazoo alternative to the ES-335.",
    tags: ["Semi-Hollow", "Cherry", "Jazz"],
    owner: "@hollowbody_hub",
    image: IMG.heritage_semi,
    verified: true,
  },
  {
    id: 5,
    brand: "Suhr",
    model: "Classic S Antique",
    year: 2022,
    nickname: '"Surf\'s Up"',
    story:
      "John Suhr's take on the perfect Strat. Surf Green with SSCII noise canceling and a satin neck profile.",
    tags: ["Modern S-type", "SSS", "Boutique"],
    owner: "@suhr_fanatic",
    image: IMG.suhr_green,
    verified: false,
  },
  {
    id: 6,
    brand: "Brian May",
    model: "BMG Special",
    year: 2020,
    nickname: '"Red Special"',
    story:
      "Based on the guitar Brian May built with his father. Three Burns Tri-Sonic pickups with out-of-phase switching.",
    tags: ["Signature", "Tri-Sonic", "Unique"],
    owner: "@queen_tone",
    image: IMG.brian_may,
    verified: true,
  },
  {
    id: 7,
    brand: "Nash",
    model: "S-63 Daphne Blue",
    year: 2023,
    nickname: '"California Dream"',
    story:
      "Light relic Daphne Blue finish with a rosewood board. The quintessential surf-era Stratocaster reimagined.",
    tags: ["Relic", "Daphne Blue", "Rosewood"],
    owner: "@surfguitar",
    image: IMG.blue_strat,
    verified: false,
  },
  {
    id: 8,
    brand: "Fender",
    model: "Squier Mini Strat",
    year: 2024,
    nickname: '"First Love"',
    story:
      "Every collection starts somewhere. This Torino Red Mini Strat was the first guitar for a collector who now owns 47.",
    tags: ["Beginner", "Short Scale", "Red"],
    owner: "@day_one",
    image: IMG.red_strat,
    verified: false,
  },
];

const FALLBACK_RECENT = [
  {
    id: 9,
    brand: "Yamaha",
    model: "C40",
    year: 2023,
    owner: "@nylon_strings",
    image: IMG.yamaha_classical,
  },
  {
    id: 10,
    brand: "Cordoba",
    model: "C5 Cedar",
    year: 2022,
    owner: "@classical_daily",
    image: IMG.classical,
  },
  {
    id: 11,
    brand: "Heritage",
    model: "H-150 Artisan",
    year: 2024,
    owner: "@vintage_reborn",
    image: IMG.heritage_closeup,
  },
  {
    id: 12,
    brand: "Suhr",
    model: "Classic S",
    year: 2022,
    owner: "@modernplayer",
    image: IMG.suhr_green,
  },
  {
    id: 13,
    brand: "Nash",
    model: "T-52 Relic",
    year: 2021,
    owner: "@tele_faithful",
    image: IMG.tele_relic,
  },
  {
    id: 14,
    brand: "Heritage",
    model: "H-535",
    year: 2023,
    owner: "@jazzcat",
    image: IMG.heritage_semi,
  },
  {
    id: 15,
    brand: "Nash",
    model: "S-57",
    year: 2020,
    owner: "@blues_daily",
    image: IMG.nash_sunburst,
  },
  {
    id: 16,
    brand: "Brian May",
    model: "Special",
    year: 2021,
    owner: "@queen_fan",
    image: IMG.brian_may,
  },
];

const FALLBACK_BRANDS = [
  { name: "Gibson", count: 1247, est: 1902 },
  { name: "Fender", count: 1089, est: 1946 },
  { name: "Martin", count: 876, est: 1833 },
  { name: "Heritage", count: 654, est: 1985 },
  { name: "PRS", count: 432, est: 1985 },
  { name: "Nash", count: 321, est: 2001 },
  { name: "Suhr", count: 298, est: 1997 },
  { name: "Rickenbacker", count: 187, est: 1931 },
];

const FALLBACK_ARTICLES = [
  {
    id: 1,
    type: "Guide",
    title: "How to Date Your Gibson by Serial Number",
    excerpt:
      "A comprehensive guide to Gibson serial number systems across every era, from pre-war ink stamps to modern 8-digit codes.",
    author: "TWNG Editorial",
    readTime: "12 min",
    image: IMG.artist1,
  },
  {
    id: 2,
    type: "Deep Dive",
    title: "The Golden Era: Pre-War Martins",
    excerpt:
      "Why guitars built between 1930-1944 represent the pinnacle of acoustic construction and command extraordinary prices.",
    author: "David Rawlings",
    readTime: "18 min",
    image: IMG.artist2,
  },
  {
    id: 3,
    type: "Interview",
    title: "Stage Guitars: Instruments That Tour",
    excerpt:
      "From arena stages to smoky clubs — how professional musicians choose, maintain, and bond with their touring instruments.",
    author: "TWNG Editorial",
    readTime: "15 min",
    image: IMG.artist6,
  },
];

const FALLBACK_TESTIMONIAL = {
  quote: "I've been collecting for thirty years and never had a proper way to document everything. TWNG finally gives my guitars the archive they deserve.",
  author: "Sarah Mitchell",
  role: "Collector · 47 guitars documented",
  image: null, // uses IMG.artist4 in component
};

const FALLBACK_STATS = [
  { value: "12,400+", label: "Guitars Documented" },
  { value: "3,200+", label: "Collectors & Musicians" },
  { value: "180+", label: "Brands Catalogued" },
  { value: "45", label: "Verified Luthiers" },
];

// ============================================================
// Badge Component
// ============================================================
function Badge({ children, variant = "default" }) {
  const variants = {
    default: {
      bg: `${T.warm}33`,
      text: T.warm,
      border: T.borderAcc,
    },
    outline: {
      bg: "transparent",
      text: T.txt2,
      border: T.border,
    },
    verified: {
      bg: "rgba(5, 150, 105, 0.2)",
      text: "#10B981",
      border: "#065F46",
    },
  };

  const v = variants[variant] || variants.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "2px",
        paddingBottom: "2px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "500",
        border: `1px solid ${v.border}`,
        whiteSpace: "nowrap",
        backgroundColor: v.bg,
        color: v.text,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.02em"
      }}
    >
      {children}
    </span>
  );
}

// ============================================================
// Section Header Component
// ============================================================
function SectionHeader({ eyebrow, title, description, align = "center" }) {
  return (
    <div
      style={{
        marginBottom: "48px",
        maxWidth: align === "center" ? "42rem" : "auto",
        marginLeft: align === "center" ? "auto" : "0",
        marginRight: align === "center" ? "auto" : "0",
        textAlign: align === "center" ? "center" : "left",
      }}
    >
      {eyebrow && (
        <p
          style={{
            color: T.warm,
            fontSize: "12px",
            fontWeight: "500",
            textTransform: "uppercase",
            marginBottom: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        style={{
          fontWeight: "700",
          marginBottom: "16px",
          lineHeight: "1.2",
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          color: T.txt,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ color: "#9CA3AF", fontSize: "16px", lineHeight: "1.625" }}>
          {description}
        </p>
      )}
    </div>
  );
}


// ============================================================
// Hero Section
// ============================================================
function HeroSection({ badgeText, miniGuitars, heroConfig, stats }) {
  const hc = heroConfig || {};
  // Build dynamic badge from real stats
  const collectorsCount = stats?.find(s => s.label?.includes('Collector'))?.value;
  const dynamicBadge = collectorsCount ? `Now in Beta · Join ${collectorsCount} Collectors` : null;
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: T.bgDeep
      }}
    >
      {/* Background image — positioned right so guitar is visible */}
      <div style={{
        position: "absolute",
        top: "0",
        right: "0",
        bottom: "0",
        width: "65%",
        zIndex: "0"
      }}>
        <img
          src={hc.bgImage || IMG.hero_tele}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center"
          }}
        />
      </div>

      {/* Desktop gradient overlay */}
      <div
        className="hero-desktop-overlay"
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          zIndex: "10",
          background: `linear-gradient(90deg, ${T.bgDeep} 0%, ${T.bgDeep} 35%, ${T.bgDeep}CC 45%, ${T.bgDeep}60 55%, transparent 70%)`,
        }}
      />

      {/* Mobile overlay */}
      <div
        className="hero-mobile-overlay"
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          zIndex: "10",
          backgroundColor: T.bgDeep + "CC",
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "33.333%",
          zIndex: "10",
          pointerEvents: "none",
          background: `linear-gradient(transparent, ${T.bgDeep})`,
        }}
      />

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: "20",
        display: "flex",
        minHeight: "100vh"
      }}>
        <div style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "48px",
          paddingRight: "48px",
          paddingBottom: "80px",
          paddingTop: "128px",
          minWidth: "0"
        }}>
          <div style={{ maxWidth: "42rem" }}>
            <Badge>{badgeText || dynamicBadge || "Now in Beta · Join the Community"}</Badge>

            <h1
              style={{
                fontWeight: "700",
                marginTop: "24px",
                marginBottom: "24px",
                lineHeight: "1.2",
                letterSpacing: "-0.03em",
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(36px, 5vw, 64px)",
                color: T.txt,
              }}
            >
              {hc.heading1 || "Every Guitar "}{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${T.warm}, ${T.amber})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {hc.headingHighlight || "Has a Story"}
              </span>
            </h1>

            <p
              style={{
                lineHeight: "1.625",
                maxWidth: "28rem",
                marginBottom: "40px",
                fontSize: "clamp(16px, 1.8vw, 20px)",
                color: T.txt2,
              }}
            >
              {hc.subtitle || "Document your collection. Discover rare instruments. Connect with collectors and luthiers worldwide."}
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/guitar/new" style={{ textDecoration: "none" }}>
              <button
                style={{
                  paddingLeft: "32px",
                  paddingRight: "32px",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  backgroundColor: T.warm,
                  color: T.bgDeep,
                  boxShadow: `0 0 40px ${T.warm}40`,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <Sparkles size={18} /> {hc.primaryBtn || "Start Your Collection"}
              </button>
              </Link>
              <Link to="/explore" style={{ textDecoration: "none" }}>
              <button
                style={{
                  paddingLeft: "32px",
                  paddingRight: "32px",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderColor: T.border,
                  color: T.txt,
                  border: `1px solid ${T.border}`,
                  backdropFilter: "blur(4px)",
                  cursor: "pointer"
                }}
              >
                {hc.secondaryBtn || "Explore Guitars"} <ChevronRight size={16} />
              </button>
              </Link>
            </div>

            {/* Mini guitar strip */}
            <div style={{ marginTop: "56px" }}>
              <p
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  fontWeight: "500",
                  marginBottom: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.12em",
                  color: T.txtM,
                }}
              >
                Recently documented
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(miniGuitars || [
                  IMG.heritage_lp,
                  IMG.nash_sunburst,
                  IMG.tele_relic,
                  IMG.suhr_green,
                  IMG.heritage_semi,
                  IMG.brian_may,
                ]).map((src, i) => (
                  <div
                    key={i}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: `2px solid ${T.border}`,
                      opacity: "0.7",
                      transition: "all 0.3s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    border: `2px dashed ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: T.txtM
                  }}
                >
                  +
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop spacer — keeps text on left half */}
        <div className="hero-spacer" style={{
          flexShrink: "0",
          width: "40%"
        }} />
      </div>

      {/* Desktop caption */}
      <div className="hero-caption" style={{
        position: "absolute",
        bottom: "32px",
        right: "32px",
        textAlign: "right",
        zIndex: "30",
      }}>
        <p
          style={{
            fontSize: "14px",
            fontStyle: "italic",
            marginBottom: "4px",
            fontFamily: "'Playfair Display', serif",
            color: T.txt2
          }}
        >
          "Butterscotch Blonde"
        </p>
        <p
          style={{
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            color: T.txtM
          }}
        >
          1952 Fender Telecaster · @vintagetone
        </p>
      </div>

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          width: "500px",
          height: "500px",
          zIndex: "10",
          pointerEvents: "none",
          background: `radial-gradient(circle, ${T.warm}0A 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Hero responsive styles */}
      <style>{`
        .hero-desktop-overlay { display: block; }
        .hero-mobile-overlay  { display: none; }
        .hero-spacer           { display: block; }
        .hero-caption          { display: block; }
        @media (max-width: 768px) {
          .hero-desktop-overlay { display: none !important; }
          .hero-mobile-overlay  { display: block !important; }
          .hero-spacer           { display: none !important; }
          .hero-caption          { display: none !important; }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// Stats Bar
// ============================================================
function StatsBar({ altBg, stats: liveStats }) {
  // Icon map for stats (keyed by label keyword)
  const iconMap = { guitar: <Guitar size={20} />, collector: <Users size={20} />, brand: <Building2 size={20} />, luthier: <Shield size={20} /> };
  const getIcon = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('guitar')) return iconMap.guitar;
    if (l.includes('collector') || l.includes('user') || l.includes('musician')) return iconMap.collector;
    if (l.includes('brand')) return iconMap.brand;
    if (l.includes('luthier')) return iconMap.luthier;
    return iconMap.guitar;
  };
  const stats = (liveStats || FALLBACK_STATS).map(s => ({ ...s, icon: s.icon || getIcon(s.label) }));

  return (
    <section
      style={{
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        backgroundColor: T.bgCard,
      }}
    >
      <div style={{
        maxWidth: "80rem",
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: "24px",
        paddingRight: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "0",
      }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              paddingTop: "32px",
              paddingBottom: "32px",
              textAlign: "center",
              borderRight: i < stats.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: T.warm }}>
              {s.icon}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "4px",
                fontFamily: "'Playfair Display', serif",
                color: T.txt,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#4B5563",
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// Guitar Card
// ============================================================
function GuitarCard({ guitar, compact = false }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  const [loved, setLoved] = useState(false);

  if (compact) {
    return (
      <Link to={`/guitar/${guitar.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          minWidth: "220px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: "0",
          cursor: "pointer",
          transition: "all 0.3s",
          backgroundColor: T.bgCard,
          borderColor: hov ? T.borderAcc : T.border,
          border: `1px solid ${hov ? T.borderAcc : T.border}`,
          transform: hov ? "translateY(-2px)" : "none",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div
          style={{
            height: "160px",
            overflow: "hidden",
            backgroundColor: T.bgElev
          }}
        >
          <img
            src={guitar.image}
            alt={guitar.model}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s",
              transform: hov ? "scale(1.05)" : "scale(1)"
            }}
          />
        </div>
        <div style={{ padding: "14px" }}>
          <p
            style={{
              fontSize: "12px",
              marginBottom: "4px",
              fontFamily: "'JetBrains Mono', monospace",
              color: T.txtM,
            }}
          >
            {guitar.brand} · {guitar.year}
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "4px",
              fontFamily: "'Playfair Display', serif",
              color: T.txt,
            }}
          >
            {guitar.model}
          </p>
          <p style={{ fontSize: "12px", color: T.txtM }}>
            {guitar.owner}
          </p>
        </div>
      </div>
      </Link>
    );
  }

  return (
    <Link to={`/guitar/${guitar.id}`} style={{ textDecoration: "none" }}>
    <div
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s",
        backgroundColor: T.bgCard,
        borderColor: hov ? T.borderAcc : T.border,
        border: `1px solid ${hov ? T.borderAcc : T.border}`,
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 20px 40px ${T.bgDeep}80` : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: "3/4",
          backgroundColor: T.bgElev
        }}
      >
        <img
          src={guitar.image}
          alt={guitar.model}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s",
            transform: hov ? "scale(1.05)" : "scale(1)"
          }}
        />
        {isDark && (
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              height: "50%",
              pointerEvents: "none",
              background: `linear-gradient(transparent, ${T.bgCard})`,
            }}
          />
        )}
        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
          <Badge>
            {guitar.brand} · {guitar.year}
          </Badge>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLoved(!loved);
          }}
          aria-label={loved ? "Remove from favorites" : "Add to favorites"}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loved ? T.warm : T.bgDeep + "80",
            borderColor: loved ? T.warm : T.border,
            border: `1px solid ${loved ? T.warm : T.border}`,
            color: loved ? T.bgDeep : T.txt2,
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
            cursor: "pointer"
          }}
        >
          <Heart size={14} fill={loved ? "currentColor" : "none"} />
        </button>
        {guitar.verified && (
          <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
            <Badge variant="verified">
              <Shield size={10} /> Verified
            </Badge>
          </div>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        <h3
          style={{
            fontWeight: "600",
            marginBottom: "2px",
            lineHeight: "1.375",
            fontFamily: "'Playfair Display', serif",
            fontSize: "17px",
            color: T.txt,
          }}
        >
          {guitar.model}
        </h3>
        {guitar.nickname && (
          <p
            style={{
              fontStyle: "italic",
              fontSize: "14px",
              marginBottom: "8px",
              color: T.amber
            }}
          >
            {guitar.nickname}
          </p>
        )}
        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.625",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            marginBottom: "12px",
            color: T.txt2
          }}
        >
          {guitar.story}
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
          {guitar.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            borderTop: `1px solid ${T.border}`
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: T.txtM,
            }}
          >
            {guitar.owner}
          </span>
          <span
            style={{
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "color 0.2s",
              color: hov ? T.warm : T.txtM
            }}
          >
            View <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
    </Link>
  );
}

// ============================================================
// Featured Guitars Section
// ============================================================
function FeaturedGuitarsSection({ altBg, guitars: liveGuitars, sectionConfig }) {
  const displayGuitars = liveGuitars || FALLBACK_FEATURED;
  return (
    <section style={{ paddingTop: "96px", paddingBottom: "96px", paddingLeft: "24px", paddingRight: "24px" }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        <SectionHeader
          eyebrow={sectionConfig?.eyebrow || "Featured Collection"}
          title={sectionConfig?.title || "Exceptional Instruments"}
          description={sectionConfig?.description || "Curated guitars that represent the finest examples of craftsmanship, history, and tone."}
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "48px"
        }}>
          {displayGuitars.map((g) => (
            <GuitarCard key={g.id} guitar={g} />
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/explore" style={{ textDecoration: "none" }}>
          <button
            style={{
              paddingLeft: "28px",
              paddingRight: "28px",
              paddingTop: "12px",
              paddingBottom: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              border: `1px solid ${T.border}`,
              backgroundColor: "transparent",
              color: T.txt2,
              cursor: "pointer"
            }}
          >
            View All Guitars <ArrowRight size={14} />
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Recently Added Section
// ============================================================
function RecentlyAddedSection({ altBg, guitars: liveGuitars, sectionConfig }) {
  const displayGuitars = liveGuitars || FALLBACK_RECENT;
  return (
    <section
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        paddingLeft: "24px",
        paddingRight: "24px",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "32px" }}>
        <SectionHeader
          align="left"
          eyebrow={sectionConfig?.eyebrow || "Just Added"}
          title={sectionConfig?.title || "Fresh Arrivals"}
          description={sectionConfig?.description || "The latest guitars documented by the TWNG community."}
        />
      </div>
      <div style={{ overflowX: "auto", marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ display: "flex", gap: "16px", paddingBottom: "16px" }}>
          {displayGuitars.map((g) => (
            <GuitarCard key={g.id} guitar={g} compact />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Explore by Brand Section
// ============================================================
function ExploreByBrandSection({ altBg, brands: liveBrands, sectionConfig }) {
  const displayBrands = liveBrands || FALLBACK_BRANDS;
  const [hov, setHov] = useState(null);

  return (
    <section style={{ paddingTop: "96px", paddingBottom: "96px", paddingLeft: "24px", paddingRight: "24px", backgroundColor: altBg ? T.bgCard : undefined }}>
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        <SectionHeader
          eyebrow={sectionConfig?.eyebrow || "Browse"}
          title={sectionConfig?.title || "Explore by Brand"}
          description={sectionConfig?.description || "Dive into collections organized by the world's most iconic guitar makers."}
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "12px"
        }}>
          {displayBrands.map((b) => (
            <Link
              key={b.name}
              to={`/explore?brand=${encodeURIComponent(b.name)}`}
              style={{
                padding: "20px",
                borderRadius: "8px",
                border: `1px solid ${hov === b.name ? T.borderAcc : T.border}`,
                transition: "all 0.2s",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: hov === b.name ? T.bgCard : "transparent",
                textDecoration: "none",
              }}
              onMouseEnter={() => setHov(b.name)}
              onMouseLeave={() => setHov(null)}
            >
              <div>
                <h3
                  style={{
                    fontWeight: "600",
                    marginBottom: "4px",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "18px",
                    color: T.txt,
                  }}
                >
                  {b.name}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: T.txtM,
                  }}
                >
                  {b.est ? `Est. ${b.est} · ` : ''}{(b.count || 0).toLocaleString()} guitars
                </p>
              </div>
              <ChevronRight
                size={18}
                style={{
                  color: hov === b.name ? T.warm : T.txtM,
                  transition: "all 0.2s",
                  transform: hov === b.name ? "translateX(4px)" : "none",
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Articles Section
// ============================================================
function ArticlesSection({ altBg, articles: liveArticles, sectionConfig }) {
  const displayArticles = (liveArticles || FALLBACK_ARTICLES).map(a => ({
    ...a,
    // Normalize field names from Supabase (read_time → readTime, cover_image_url → image, category → type)
    readTime: a.readTime || a.read_time || '5 min',
    image: a.image || a.cover_image_url || IMG.artist1,
    type: a.type || a.category || 'Article',
  }));
  const { isDark } = useTheme();
  const [hov, setHov] = useState(null);
  const icons = {
    Guide: <BookOpen size={14} />,
    "Deep Dive": <Eye size={14} />,
    Interview: <MessageSquare size={14} />,
  };

  return (
    <section
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "24px",
        paddingRight: "24px",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto" }}>
        <SectionHeader
          eyebrow={sectionConfig?.eyebrow || "Read"}
          title={sectionConfig?.title || "Stories & Guides"}
          description={sectionConfig?.description || "Deep dives into guitar history, collecting wisdom, and conversations with master builders."}
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        }}>
          {displayArticles.map((a) => (
            <Link key={a.id} to={`/articles/${a.id}`} style={{ textDecoration: "none" }}>
            <article
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s",
                border: `1px solid ${hov === a.id ? T.borderAcc : T.border}`,
                backgroundColor: T.bgCard,
                transform: hov === a.id ? "translateY(-2px)" : "none",
              }}
              onMouseEnter={() => setHov(a.id)}
              onMouseLeave={() => setHov(null)}
            >
              <div style={{ height: "192px", overflow: "hidden", position: "relative" }}>
                <img
                  src={a.image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s",
                    transform: hov === a.id ? "scale(1.05)" : "scale(1)"
                  }}
                />
                {isDark && (
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      bottom: "0",
                      background: "linear-gradient(transparent 40%, rgba(12,10,9,0.8))",
                    }}
                  />
                )}
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Badge>{icons[a.type]} {a.type}</Badge>
                  <span
                    style={{
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: T.txtM,
                    }}
                  >
                    <Clock size={10} /> {a.readTime}
                  </span>
                </div>
                <h3
                  style={{
                    fontWeight: "600",
                    lineHeight: "1.375",
                    marginBottom: "8px",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "18px",
                    color: T.txt,
                  }}
                >
                  {a.title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  lineHeight: "1.625",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  color: T.txt2
                }}>
                  {a.excerpt}
                </p>
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${T.border}`
                  }}
                >
                  <span style={{ fontSize: "12px", color: T.txtM }}>
                    {a.author}
                  </span>
                </div>
              </div>
            </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Testimonial Section
// ============================================================
function TestimonialSection({ altBg, testimonial: liveTestimonial }) {
  const t = liveTestimonial || FALLBACK_TESTIMONIAL;
  return (
    <section style={{ paddingTop: "96px", paddingBottom: "96px", paddingLeft: "24px", paddingRight: "24px", backgroundColor: altBg ? T.bgCard : undefined }}>
      <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
        <Quote
          size={48}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "24px",
            opacity: "0.4",
            color: T.borderAcc
          }}
        />
        <blockquote
          style={{
            textAlign: "center",
            lineHeight: "1.625",
            marginBottom: "32px",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(20px, 3vw, 28px)",
            fontStyle: "italic",
            color: T.txt,
          }}
        >
          "{t.quote}"
        </blockquote>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${T.borderAcc}`
            }}
          >
            <img src={t.image || IMG.artist4} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontWeight: "600", fontSize: "14px", marginBottom: "2px", color: T.txt }}>
              {t.author}
            </p>
            <p
              style={{
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                color: T.txtM,
              }}
            >
              {t.role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA Section
// ============================================================
function CTASection({ ctaContent }) {
  const cta = ctaContent || {};
  return (
    <section
      style={{
        paddingTop: "96px",
        paddingBottom: "96px",
        paddingLeft: "24px",
        paddingRight: "24px",
        borderTop: `1px solid ${T.border}`,
        backgroundColor: T.bgDeep,
      }}
    >
      <div style={{
        maxWidth: "48rem",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        minHeight: "384px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <img
          src={cta.bgImage || IMG.hero_collection}
          alt=""
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(12,10,9,0.82)",
            backdropFilter: "blur(4px)"
          }}
        />
        <div style={{ position: "relative", zIndex: "10", textAlign: "center", paddingLeft: "40px", paddingRight: "40px", paddingTop: "64px", paddingBottom: "64px" }}>
          <h2
            style={{
              fontWeight: "700",
              lineHeight: "1.2",
              marginBottom: "16px",
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              color: "#FAFAF9",
            }}
          >
            {cta.headingPrefix || "Ready to Document"}{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #D97706, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {cta.headingHighlight || "Your Collection"}
            </span>
            ?
          </h2>
          <p style={{ fontSize: "16px", lineHeight: "1.625", maxWidth: "28rem", marginLeft: "auto", marginRight: "auto", marginBottom: "32px", color: "rgba(255,255,255,0.7)" }}>
            {cta.subtitle || "Join thousands of collectors preserving guitar history. Free to start, powerful enough for serious archives."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/guitar/new" style={{ textDecoration: "none" }}>
            <button
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "14px",
                paddingBottom: "14px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                transition: "all 0.2s",
                backgroundColor: T.warm,
                color: T.bgDeep,
                boxShadow: "0 0 40px rgba(217,119,6,0.25)",
                border: "none",
                cursor: "pointer"
              }}
            >
              {cta.primaryBtn || "Create Free Account"}
            </button>
            </Link>
            <Link to="/guitar/new" style={{ textDecoration: "none" }}>
            <button
              style={{
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "14px",
                paddingBottom: "14px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
                color: "#FAFAF9",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(80px)",
                cursor: "pointer"
              }}
            >
              <Sparkles size={16} /> {cta.secondaryBtn || "Try Magic Add"}
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  const columns = [
    {
      title: "Platform",
      links: [
        "Explore Guitars",
        "Collections",
        "Magic Add",
        "Luthier Directory",
        "Community Forum",
      ],
    },
    {
      title: "Content",
      links: [
        "Articles",
        "Guides",
        "Interviews",
        "Brand Histories",
        "Newsletter",
      ],
    },
    {
      title: "Company",
      links: ["About TWNG", "Careers", "Press", "Contact", "API (Coming Soon)"],
    },
    {
      title: "Legal",
      links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "DMCA"],
    },
  ];

  return (
    <footer
      style={{
        borderTop: `1px solid ${T.border}`,
        backgroundColor: T.bgCard,
      }}
    >
      <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "24px", paddingRight: "24px", paddingTop: "64px", paddingBottom: "64px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "48px"
        }}>
          <div>
            <img
              src={IMG.logo}
              alt="TWNG"
              style={{
                height: "28px",
                filter: "brightness(0) invert(1)",
                marginBottom: "12px"
              }}
            />
            <p style={{ fontSize: "14px", lineHeight: "1.625", maxWidth: "20rem", color: T.txt2 }}>
              The guitar documentation platform for collectors, musicians, and
              luthiers.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${T.border}`,
                    transition: "all 0.2s",
                    color: T.txtM,
                    textDecoration: "none"
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.1em",
                  color: T.txtM,
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", padding: "0" }}>
                {col.links.map((link) => {
                  // Map footer link text to routes
                  const linkMap = {
                    "Explore Guitars": "/explore",
                    "Collections": "/collection",
                    "Magic Add": "/guitar/new",
                    "Luthier Directory": "/luthiers",
                    "Community Forum": "/community",
                    "Articles": "/articles",
                    "Guides": "/articles",
                    "Interviews": "/articles",
                    "Brand Histories": "/articles",
                    "About TWNG": "/about",
                    "Careers": "/about",
                    "Press": "/about",
                    "Contact": "#",
                    "API (Coming Soon)": "#",
                    "Terms of Service": "/legal/terms",
                    "Privacy Policy": "/legal/privacy",
                    "Cookie Policy": "#",
                    "DMCA": "#",
                    "Newsletter": "/about",
                  };
                  const route = linkMap[link] || "#";
                  return (
                    <li key={link} style={{ marginBottom: "10px" }}>
                      {route.startsWith("/") ? (
                        <Link
                          to={route}
                          style={{
                            fontSize: "14px",
                            transition: "color 0.2s",
                            color: T.txt2,
                            textDecoration: "none"
                          }}
                        >
                          {link}
                        </Link>
                      ) : (
                        <a
                          href={route}
                          style={{
                            fontSize: "14px",
                            transition: "color 0.2s",
                            color: T.txt2,
                            textDecoration: "none"
                          }}
                        >
                          {link}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: T.txtM,
            }}
          >
            © 2026 TWNG. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: T.txtM }}>
            Made with ♥ for guitar lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// Main Component
// ============================================================
// Map block types from admin config to actual components
const SECTION_MAP = {
  hero: HeroSection,
  stats: StatsBar,
  featured: FeaturedGuitarsSection,
  recently_added: RecentlyAddedSection,
  explore_brands: ExploreByBrandSection,
  articles: ArticlesSection,
  testimonials: TestimonialSection,
  cta: CTASection,
};

// Default order if no config is found or on first load
const DEFAULT_SECTIONS = [
  'hero', 'stats', 'featured', 'recently_added',
  'explore_brands', 'articles', 'testimonials', 'cta',
];

// Sections that should use bgCard instead of bgDeep for visual alternation
const ALT_BG_SECTIONS = new Set(['stats', 'explore_brands', 'testimonials']);

export default function TWNGHomepage() {
  const [visibleSections, setVisibleSections] = useState(DEFAULT_SECTIONS);
  const [sectionData, setSectionData] = useState({});
  const { tokens: TH } = useTheme();

  useEffect(() => {
    (async () => {
      // 1. Load section visibility + content config from admin
      try {
        const [blocks, sectionConfig] = await Promise.all([
          getHomepageBlocks(),
          getHomepageSectionConfig(),
        ]);

        if (blocks && blocks.length > 0) {
          const configMap = {};
          blocks.forEach(b => { configMap[b.type] = b.status; });
          const active = DEFAULT_SECTIONS.filter(type => {
            const dbStatus = configMap[type];
            if (!dbStatus) return true;
            return dbStatus === 'active';
          });
          setVisibleSections(active);
        }

        // Store section config for props (badge text, CTA content, etc.)
        if (sectionConfig) {
          setSectionData(prev => ({ ...prev, _config: sectionConfig }));
        }
      } catch (err) {
        console.error('Failed to load homepage config:', err);
      }

      // 2. Fetch all live data in parallel
      try {
        const [
          featuredRaw,
          recentRaw,
          brandsRaw,
          articlesRaw,
          testimonialRaw,
          statsRaw,
        ] = await Promise.all([
          getFeaturedGuitars(),
          getRecentlyAdded(),
          getTopBrands(),
          getHomepageArticles(),
          getHomepageTestimonials(),
          getHomepageStats(),
        ]);

        const newData = {};

        // Normalize guitar data for featured section
        if (featuredRaw && featuredRaw.length > 0) {
          newData.featured = featuredRaw.map(normalizeGuitar).filter(Boolean);
        }

        // Normalize guitar data for recently added section
        if (recentRaw && recentRaw.length > 0) {
          newData.recently_added = recentRaw.map(normalizeGuitar).filter(Boolean);
          // Also extract images for hero mini strip
          newData.miniGuitarImages = recentRaw.slice(0, 6).map(g => getGuitarImage(g));
        }

        // Brand stats
        if (brandsRaw && brandsRaw.length > 0) {
          newData.brands = brandsRaw;
        }

        // Articles
        if (articlesRaw && articlesRaw.length > 0) {
          newData.articles = articlesRaw;
        }

        // Testimonials (single or first from array)
        if (testimonialRaw) {
          newData.testimonial = Array.isArray(testimonialRaw) ? testimonialRaw[0] : testimonialRaw;
        }

        // Stats
        if (statsRaw) {
          // statsRaw could be { guitars, collectors, brands } or an array
          if (Array.isArray(statsRaw)) {
            newData.stats = statsRaw;
          } else {
            // Convert object to display array
            newData.stats = [
              { value: (statsRaw.guitars || 0).toLocaleString() + '+', label: 'Guitars Documented' },
              { value: (statsRaw.collectors || 0).toLocaleString() + '+', label: 'Collectors & Musicians' },
              { value: (statsRaw.brands || 0).toLocaleString() + '+', label: 'Brands Catalogued' },
              { value: statsRaw.luthiers ? String(statsRaw.luthiers) : '45', label: 'Verified Luthiers' },
            ];
          }
        }

        setSectionData(prev => ({ ...prev, ...newData }));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        // Sections will use their fallback data
      }
    })();
  }, []);

  // Build per-section props map
  const config = sectionData._config || {};
  const dataMap = {
    hero: {
      badgeText: config.hero?.badgeText,
      miniGuitars: sectionData.miniGuitarImages,
      heroConfig: config.hero,
      stats: sectionData.stats,
    },
    stats: { stats: sectionData.stats },
    featured: { guitars: sectionData.featured, sectionConfig: config.featured },
    recently_added: { guitars: sectionData.recently_added, sectionConfig: config.recently_added },
    explore_brands: { brands: sectionData.brands, sectionConfig: config.explore_brands },
    articles: { articles: sectionData.articles, sectionConfig: config.articles },
    testimonials: { testimonial: sectionData.testimonial },
    cta: { ctaContent: config.cta },
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: TH.bgDeep,
      color: TH.txt,
      fontFamily: "'DM Sans', sans-serif",
      transition: "background-color 0.3s ease, color 0.3s ease",
    }}>
      {visibleSections.map(type => {
        const Component = SECTION_MAP[type];
        if (!Component) return null;
        return (
          <Component
            key={type}
            altBg={ALT_BG_SECTIONS.has(type)}
            {...(dataMap[type] || {})}
          />
        );
      })}
    </div>
  );
}
