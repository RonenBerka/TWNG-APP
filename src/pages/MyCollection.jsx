import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Grid3X3,
  List,
  Clock,
  Plus,
  Search,
  Heart,
  Shield,
  MoreVertical,
  Download,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { T } from "../theme/tokens";
import { getInstruments } from "../lib/supabase/instruments";
import { useAuth } from "../context/AuthContext";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Electric", value: "electric" },
  { label: "Acoustic", value: "acoustic" },
  { label: "Bass", value: "bass" },
];

/* ─── Instrument Card ──────────────────────────────────────────────── */
function CollectionCard({ instrument, view }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (view === "list") {
    return (
      <Link to={`/instrument/${instrument.id}`} style={{ textDecoration: "none" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex", gap: "16px", padding: "16px",
            backgroundColor: T.bgCard, borderRadius: "12px",
            border: `1px solid ${hovered ? T.borderAcc : T.border}`,
            transition: "all 0.2s", cursor: "pointer", alignItems: "center",
          }}
        >
          <img
            src={instrument.image}
            alt={instrument.model}
            style={{
              width: "80px", height: "80px", objectFit: "cover",
              borderRadius: "8px", backgroundColor: T.bgElev, flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <span style={{
                fontSize: "12px", color: T.warm,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{instrument.make} · {instrument.year}</span>
              {instrument.verified && (
                <Shield size={14} color={T.warm} />
              )}
            </div>
            <p style={{
              fontSize: "15px", fontWeight: 600, color: T.txt,
              fontFamily: "'Playfair Display', serif",
            }}>{instrument.model}</p>
            <p style={{ fontSize: "12px", color: T.txtM, fontStyle: "italic" }}>
              {instrument.nickname}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            <span style={{
              padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
              backgroundColor: T.bgElev, color: T.txt2, border: `1px solid ${T.border}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{instrument.custom_fields?.condition}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
              aria-label="More options"
              style={{
                padding: "8px", borderRadius: "8px", backgroundColor: T.bgElev,
                border: "none", cursor: "pointer", position: "relative",
              }}
            >
              <MoreVertical size={16} color={T.txt2} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Grid Card ───────────────────────────────────────────────── */
  return (
    <Link to={`/instrument/${instrument.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: "16px", overflow: "hidden",
          backgroundColor: T.bgCard,
          border: `1px solid ${hovered ? T.borderAcc : T.border}`,
          transition: "all 0.3s", cursor: "pointer",
        }}
      >
        {/* Image */}
        <div style={{
          position: "relative", aspectRatio: "4/5", overflow: "hidden",
          backgroundColor: T.bgElev,
        }}>
          <img
            src={instrument.image}
            alt={instrument.model}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Year badge */}
          <div style={{
            position: "absolute", top: "14px", left: "14px",
            padding: "5px 12px", borderRadius: "8px", fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
            border: `1px solid ${T.warm}`, color: T.warm,
            backgroundColor: "rgba(12,10,9,0.6)", backdropFilter: "blur(8px)",
          }}>{instrument.year}</div>

          {/* Menu button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="More options"
            style={{
              position: "absolute", top: "14px", right: "14px",
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: "rgba(12,10,9,0.5)", backdropFilter: "blur(8px)",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <MoreVertical size={16} color="#fff" />
          </button>

          {/* Verified badge */}
          {instrument.verified && (
            <div style={{
              position: "absolute", bottom: "14px", right: "14px",
              padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              color: "#22c55e", backgroundColor: "rgba(12,10,9,0.6)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <Shield size={12} /> Verified
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{
              fontSize: "12px", color: T.warm,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{instrument.make} · {instrument.year}</span>
          </div>
          <h4 style={{
            fontSize: "16px", fontWeight: 600, color: T.txt,
            fontFamily: "'Playfair Display', serif", marginBottom: "4px",
          }}>{instrument.model}</h4>
          {instrument.nickname && (
            <p style={{ fontSize: "12px", color: T.txtM, fontStyle: "italic", marginBottom: "8px" }}>
              {instrument.nickname}
            </p>
          )}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {instrument.tags && instrument.tags.slice(0, 2).map(tag => (
              <span key={tag} style={{
                padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                backgroundColor: T.bgElev, color: T.txt2, border: `1px solid ${T.border}`,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Hook to fetch on mount
import { useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE (My Instruments)
   ═══════════════════════════════════════════════════════════════════ */
export default function MyCollection() {
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("Recently Updated");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { user } = useAuth();

  // Fetch instruments owned by the current user
  const [collectionInstruments, setCollectionInstruments] = useState([]);

  useEffect(() => {
    const fetchMyInstruments = async () => {
      try {
        // getInstruments filters by owner_id when called by auth user
        const data = await getInstruments({ ownerId: user?.id });
        setCollectionInstruments(data?.instruments || []);
      } catch (err) {
        console.error("Failed to fetch instruments:", err);
      }
    };
    if (user?.id) fetchMyInstruments();
  }, [user?.id]);

  // Enrich instruments with collection-specific fields
  const enrichedInstruments = useMemo(() =>
    (collectionInstruments || []).map((i, idx) => ({
      ...i,
      nickname: i.nickname || `Instrument #${idx + 1}`,
      dateAdded: i.created_at || `2024-01-${String(15 - idx).padStart(2, "0")}`,
      serial: i.serial_number || `SN-${100000 + (typeof i.id === 'number' ? i.id : idx)}`,
      loves: i.loves || 0, // Engagement metrics fallback to 0 if not available
    })),
  [collectionInstruments]);

  const filtered = enrichedInstruments.filter(i => {
    const q = searchQuery.toLowerCase();
    // Updated: brand → make
    const matchSearch = !q ||
      i.make.toLowerCase().includes(q) ||
      i.model.toLowerCase().includes(q) ||
      (i.nickname && i.nickname.toLowerCase().includes(q));
    const matchFilter =
      selectedFilter === "all" ||
      (selectedFilter === "verified" && i.verified) ||
      (selectedFilter === "electric" && i.custom_fields?.instrument_type === "Solid Body") ||
      (selectedFilter === "acoustic" && (i.custom_fields?.instrument_type === "Classical" || i.custom_fields?.instrument_type === "Acoustic")) ||
      (selectedFilter === "bass" && i.custom_fields?.instrument_type === "Bass");
    return matchSearch && matchFilter;
  });

  const verifiedCount = enrichedInstruments.filter(i => i.verified).length;
  const totalLoves = enrichedInstruments.reduce((s, i) => s + i.loves, 0);

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Profile Header ──────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "20px",
          marginBottom: "32px",
        }}>
          {/* Avatar */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            overflow: "hidden", border: `2px solid ${T.border}`,
            flexShrink: 0, backgroundColor: T.bgCard,
          }}>
            <img
              src={collectionInstruments[0]?.image || ""}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700, color: T.txt, lineHeight: 1.1,
            }}>My Instruments</h1>
            <p style={{ fontSize: "14px", color: T.txt2, marginTop: "4px" }}>
              @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'collector'} · Member since {new Date(user?.created_at).getFullYear() || new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px", marginBottom: "32px",
        }}>
          {[
            { icon: "🎸", value: enrichedInstruments.length, label: "Total Instruments" },
            { icon: "◇", value: verifiedCount, label: "Verified", accent: true },
            { icon: "♡", value: totalLoves.toLocaleString(), label: "Total Loves" },
          ].map((stat, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "20px 24px", borderRadius: "12px",
              backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: "20px", color: T.warm }}>{stat.icon}</span>
              <div>
                <p style={{
                  fontSize: "28px", fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                  color: stat.accent ? T.warm : T.txt, lineHeight: 1,
                }}>{stat.value}</p>
                <p style={{ fontSize: "13px", color: T.txtM, marginTop: "2px" }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          flexWrap: "wrap", marginBottom: "16px",
        }}>
          {/* Search */}
          <div style={{
            flex: "1 1 300px", display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", borderRadius: "10px",
            backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
          }}>
            <Search size={16} color={T.txtM} />
            <input
              type="text"
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: T.txt, fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "10px 32px 10px 14px", borderRadius: "10px",
              backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
              color: T.txt, cursor: "pointer", fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="Recently Updated">Recently Updated</option>
            <option value="Name">Name</option>
            <option value="Brand">Brand</option>
            <option value="Year">Year</option>
          </select>

          {/* View toggles */}
          <div style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "10px", backgroundColor: T.bgCard, border: `1px solid ${T.border}` }}>
            {[
              { id: "grid", icon: <Grid3X3 size={18} />, label: "Grid view" },
              { id: "list", icon: <List size={18} />, label: "List view" },
              { id: "timeline", icon: <Clock size={18} />, label: "Timeline view" },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id === "timeline" ? "grid" : v.id)}
                aria-label={v.label}
                aria-pressed={view === v.id}
                style={{
                  padding: "8px", borderRadius: "8px", display: "flex",
                  backgroundColor: view === v.id ? T.bgElev : "transparent",
                  color: view === v.id ? T.txt : T.txtM,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                }}
              >{v.icon}</button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(enrichedInstruments, null, 2);
              const dataBlob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `my-instruments-${new Date().toISOString().split("T")[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              alert("Instruments exported successfully!");
            }}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "10px",
              backgroundColor: "transparent",
              border: `1px solid ${T.border}`, color: T.txt2,
              cursor: "pointer", fontSize: "14px", fontWeight: 500,
            }}
          >
            <Download size={16} /> Export
          </button>
        </div>

        {/* ── Filter chips ────────────────────────────────────── */}
        {/* (already inline in toolbar area, but we skip to keep clean) */}

        {/* ── Guitar Grid / List ──────────────────────────────── */}
        {view === "timeline" && (
          <div style={{
            padding: "24px", borderRadius: "12px", backgroundColor: T.bgCard,
            border: `1px solid ${T.border}`, marginTop: "24px", textAlign: "center",
            opacity: 0.6,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "12px",
            }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt }}>Coming Soon</p>
            </div>
            <Sparkles size={24} color={T.warm} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "16px", fontWeight: 600, color: T.txt, marginBottom: "4px" }}>
              Timeline View
            </p>
            <p style={{ fontSize: "14px", color: T.txtM }}>
              This view is under development. Using grid view for now.
            </p>
          </div>
        )}
        {view === "grid" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px", marginTop: "24px",
          }}>
            {filtered.map((instrument, idx) => (
              <div key={instrument.id} style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.04}s both` }}>
                <CollectionCard instrument={instrument} view="grid" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
            {filtered.map((instrument, idx) => (
              <div key={instrument.id} style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.04}s both` }}>
                <CollectionCard instrument={instrument} view="list" />
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: "20px", fontWeight: 600, color: T.txt, marginBottom: "8px" }}>No instruments match your search</p>
            <p style={{ color: T.txt2 }}>Try a different search term</p>
          </div>
        )}

        {/* ── Add Instrument CTA ──────────────────────────────────── */}
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <Link
            to="/instrument/new"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 28px", borderRadius: "12px",
              backgroundColor: T.warm, color: T.bgDeep,
              fontWeight: 600, fontSize: "16px", textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <Plus size={18} /> Add Instrument
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        select option {
          background-color: ${T.bgCard};
          color: ${T.txt};
        }
      `}</style>
    </div>
  );
}
