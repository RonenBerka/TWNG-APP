import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  X,
  Heart,
  Sliders,
  Check,
  Loader2,
  Database,
} from "lucide-react";
import { T } from "../theme/tokens";
import { getInstruments } from "../lib/supabase/instruments";
import { useAuth } from "../context/AuthContext";
import { addFavorite, removeFavorite, isFavorited } from "../lib/supabase/userFavorites";
import { instrumentPath } from "../lib/routes";

/* ─── Makes (manufacturers) pulled from the actual data ────────────────────────── */
const MAKES = [
  "Fender", "Gibson", "Gretsch", "Heritage", "Martin",
  "Nash Guitars", "PRS", "Rickenbacker", "Suhr", "Taylor",
  "Brian May", "Cordoba", "Epiphone", "Ibanez", "Yamaha",
];

const INSTRUMENT_TYPES = ["Solid Body", "Semi-Hollow", "Hollow", "Classical", "Acoustic", "Bass"];
const CONDITIONS = ["All", "Mint", "Excellent", "Very Good", "Good", "Relic'd", "Artisan Aged"];

/* ─── Inline-styled FilterSection ────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "16px 0", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em",
          color: T.txtM,
        }}>{title}</span>
        {open
          ? <ChevronUp size={16} color={T.txtM} />
          : <ChevronDown size={16} color={T.txtM} />}
      </button>
      {open && <div style={{ paddingBottom: "16px" }}>{children}</div>}
    </div>
  );
}

/* ─── Checkbox row ───────────────────────────────────────────────── */
function CheckboxRow({ label, checked, onChange }) {
  return (
    <label
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        cursor: "pointer", padding: "4px 0",
      }}
    >
      <div style={{
        width: "18px", height: "18px", borderRadius: "4px",
        border: `2px solid ${checked ? T.warm : T.txtM}`,
        backgroundColor: checked ? T.warm : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", flexShrink: 0,
      }}>
        {checked && <Check size={12} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: "14px", color: T.txt2 }}>{label}</span>
    </label>
  );
}

/* ─── Year Range Slider (dual range) ─────────────────────────────── */
function YearRangeSlider({ min, max, onChange }) {
  const ABS_MIN = 1900;
  const ABS_MAX = 2026;

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), max - 1);
    onChange(v, max);
  };
  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), min + 1);
    onChange(min, v);
  };

  const leftPct  = ((min - ABS_MIN) / (ABS_MAX - ABS_MIN)) * 100;
  const rightPct = ((max - ABS_MIN) / (ABS_MAX - ABS_MIN)) * 100;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: T.warm }}>{min}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: T.warm }}>{max}</span>
      </div>
      <div style={{ position: "relative", height: "20px" }}>
        {/* Track background */}
        <div style={{
          position: "absolute", top: "8px", left: 0, right: 0, height: "4px",
          backgroundColor: T.border, borderRadius: "2px",
        }} />
        {/* Active track */}
        <div style={{
          position: "absolute", top: "8px", height: "4px",
          left: `${leftPct}%`, right: `${100 - rightPct}%`,
          backgroundColor: T.warm, borderRadius: "2px",
        }} />
        {/* Min slider */}
        <input
          type="range"
          min={ABS_MIN} max={ABS_MAX} value={min}
          onChange={handleMinChange}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "20px",
            WebkitAppearance: "none", appearance: "none",
            background: "transparent", pointerEvents: "none", zIndex: 3,
          }}
          className="year-slider"
        />
        {/* Max slider */}
        <input
          type="range"
          min={ABS_MIN} max={ABS_MAX} value={max}
          onChange={handleMaxChange}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "20px",
            WebkitAppearance: "none", appearance: "none",
            background: "transparent", pointerEvents: "none", zIndex: 4,
          }}
          className="year-slider"
        />
      </div>
      <style>{`
        .year-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${T.warm}; border: 2px solid ${T.bgDeep};
          cursor: pointer; pointer-events: all;
          box-shadow: 0 0 4px rgba(0,0,0,0.4);
        }
        .year-slider::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: ${T.warm}; border: 2px solid ${T.bgDeep};
          cursor: pointer; pointer-events: all;
          box-shadow: 0 0 4px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}

/* ─── Instrument Card (matches original design) ──────────────────────── */
function ExploreInstrumentCard({ instrument, view }) {
  const { user } = useAuth();
  const [loved, setLoved] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (user && instrument?.id) {
      isFavorited(user.id, instrument.id, 'instrument')
        .then(setLoved)
        .catch(() => {});
    }
  }, [user, instrument?.id]);

  const handleLoveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const wasLoved = loved;
    setLoved(!wasLoved); // Instant visual feedback
    try {
      if (wasLoved) {
        await removeFavorite(user.id, instrument.id, 'instrument');
      } else {
        await addFavorite(user.id, instrument.id, 'instrument');
      }
    } catch (err) {
      setLoved(wasLoved); // Revert on error
      console.error('Failed to toggle favorite:', err);
    }
  };

  if (view === "list") {
    return (
      <Link
        to={instrumentPath(instrument.id)}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex", gap: "16px", padding: "16px",
            backgroundColor: T.bgCard, borderRadius: "12px",
            border: `1px solid ${hovered ? T.borderAcc : T.border}`,
            transition: "all 0.2s", cursor: "pointer",
          }}
        >
          <img
            src={instrument.main_image_url}
            alt={instrument.model}
            style={{
              width: "100px", height: "100px", objectFit: "cover",
              borderRadius: "8px", backgroundColor: T.bgElev,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{
                padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                border: `1px solid ${T.warm}`, color: T.warm,
              }}>
                {instrument.make} · {instrument.year}
              </span>
              {instrument.verified && (
                <span style={{
                  fontSize: "11px", color: "#22c55e",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>◇ Verified</span>
              )}
            </div>
            <h4 style={{
              fontSize: "16px", fontWeight: 600, color: T.txt,
              fontFamily: "'Playfair Display', serif", margin: "4px 0",
            }}>{instrument.model}</h4>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
              <span style={{
                padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                backgroundColor: T.bgElev, color: T.txt2, border: `1px solid ${T.border}`,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{instrument.custom_fields?.instrument_type}</span>
              <span style={{
                padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                backgroundColor: T.bgElev, color: T.txt2, border: `1px solid ${T.border}`,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{instrument.custom_fields?.condition}</span>
            </div>
          </div>
          <button
            onClick={handleLoveToggle}
            style={{
              alignSelf: "center", padding: "8px", background: "none",
              border: "none", cursor: "pointer",
            }}
          >
            <Heart
              size={20}
              color={loved ? "#ef4444" : T.txtM}
              fill={loved ? "#ef4444" : "none"}
            />
          </button>
        </div>
      </Link>
    );
  }

  /* ── Grid Card ─────────────────────────────────────────────────── */
  return (
    <Link
      to={instrumentPath(instrument.id)}
      style={{ textDecoration: "none", display: "block" }}
    >
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
        {/* Image area */}
        <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", backgroundColor: T.bgElev }}>
          <img
            src={instrument.main_image_url}
            alt={instrument.model}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Make · Year badge */}
          <div style={{
            position: "absolute", top: "14px", left: "14px",
            padding: "5px 12px", borderRadius: "8px", fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.3)", color: "#FAFAF9",
            backgroundColor: "rgba(12,10,9,0.6)", backdropFilter: "blur(8px)",
          }}>
            {instrument.make} · {instrument.year}
          </div>

          {/* Heart button */}
          <button
            onClick={handleLoveToggle}
            style={{
              position: "absolute", top: "14px", right: "14px",
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: "rgba(12,10,9,0.5)", backdropFilter: "blur(8px)",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <Heart
              size={18}
              color={loved ? "#ef4444" : "#fff"}
              fill={loved ? "#ef4444" : "none"}
            />
          </button>

          {/* Verified badge */}
          {instrument.verified && (
            <div style={{
              position: "absolute", bottom: "14px", right: "14px",
              padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              color: "#22c55e", backgroundColor: "rgba(12,10,9,0.6)",
              backdropFilter: "blur(8px)",
            }}>
              ◇ Verified
            </div>
          )}
        </div>

        {/* Card info */}
        <div style={{ padding: "16px" }}>
          <h4 style={{
            fontSize: "16px", fontWeight: 600, color: T.txt,
            fontFamily: "'Playfair Display', serif", marginBottom: "10px",
          }}>{instrument.model}</h4>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
              backgroundColor: T.bgElev, color: T.txt2, border: `1px solid ${T.border}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{instrument.custom_fields?.instrument_type}</span>
            <span style={{
              padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
              backgroundColor: T.bgElev, color: T.txt2, border: `1px solid ${T.border}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{instrument.custom_fields?.condition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPLORE PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Explore() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Updated: brand → make (new schema)
  const [selectedMakes, setSelectedMakes] = useState(() => {
    const makeParam = new URLSearchParams(window.location.search).get("make");
    return makeParam ? [decodeURIComponent(makeParam)] : [];
  });
  const [selectedInstrumentTypes, setSelectedInstrumentTypes] = useState(() => {
    const typeParam = new URLSearchParams(window.location.search).get("type");
    return typeParam ? [decodeURIComponent(typeParam)] : [];
  });
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [yearMin, setYearMin] = useState(() => {
    const v = new URLSearchParams(window.location.search).get("yearMin");
    return v ? parseInt(v, 10) : 1900;
  });
  const [yearMax, setYearMax] = useState(() => {
    const v = new URLSearchParams(window.location.search).get("yearMax");
    return v ? parseInt(v, 10) : 2026;
  });
  const [forSale, setForSale] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch instruments from Supabase (updated from guitars)
  const [allInstruments, setAllInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchInstruments = async () => {
      setLoading(true);
      try {
        // getInstruments from instruments service
        const data = await getInstruments({
          search: debouncedSearch || undefined,
          sortOrder: sort === "oldest" ? "asc" : "desc",
          yearMin: yearMin > 1900 ? yearMin : undefined,
          yearMax: yearMax < 2026 ? yearMax : undefined,
        });
        setAllInstruments(data?.instruments || []);
        setTotal(data?.total || 0);
        setUsingMockData(false);
      } catch (err) {
        console.error("Failed to fetch instruments:", err);
        setError(err.message);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInstruments();
  }, [debouncedSearch, sort, yearMin, yearMax]);

  // Client-side filter for make, instrument_type, condition
  const filtered = useMemo(() => {
    return allInstruments.filter(i => {
      if (selectedMakes.length > 0 && !selectedMakes.includes(i.make)) return false;
      if (selectedInstrumentTypes.length > 0 && !selectedInstrumentTypes.includes(i.custom_fields?.instrument_type)) return false;
      if (selectedCondition !== "All" && i.custom_fields?.condition !== selectedCondition) return false;
      return true;
    });
  }, [allInstruments, selectedMakes, selectedInstrumentTypes, selectedCondition]);

  const resetFilters = () => {
    setSelectedMakes([]);
    setSelectedInstrumentTypes([]);
    setSelectedCondition("All");
    setSearchQuery("");
    setDebouncedSearch("");
    setYearMin(1900);
    setYearMax(2026);
  };

  const toggleMake = (make) => {
    setSelectedMakes(prev =>
      prev.includes(make) ? prev.filter(b => b !== make) : [...prev, make]
    );
  };

  const toggleInstrumentType = (type) => {
    setSelectedInstrumentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const showDesktopSidebar = showFilters && !isMobile;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: T.bgDeep }}>

      {/* ── Search Bar ─────────────────────────────────────────── */}
      <div style={{
        borderBottom: `1px solid ${T.border}`, padding: "16px 24px",
      }}>
        <div style={{
          maxWidth: "80rem", margin: "0 auto",
          display: "flex", gap: "12px", alignItems: "center",
        }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px", borderRadius: "12px",
            backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
          }}>
            <Search size={18} color={T.txtM} />
            <input
              type="text"
              placeholder="Search instruments by make, model, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: T.txt, fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
              >
                <X size={16} color={T.txtM} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 20px", borderRadius: "12px",
              backgroundColor: "transparent",
              border: `1px solid ${showFilters ? T.warm : T.border}`,
              color: showFilters ? T.warm : T.txt2,
              cursor: "pointer", fontSize: "14px", fontWeight: 500,
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            <Sliders size={16} />
            <span className="filter-btn-label">{showFilters ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout (sidebar + grid) ───────────────────────── */}
      <div style={{
        maxWidth: "80rem", margin: "0 auto", padding: "0 24px",
        display: "flex", gap: "32px",
      }}>

        {/* ── Desktop Filter Sidebar ─────────────────────────────── */}
        {showDesktopSidebar && (
          <aside style={{
            width: "260px", minWidth: "260px", paddingTop: "24px",
            paddingBottom: "40px", borderRight: `1px solid ${T.border}`,
            paddingRight: "24px",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "16px",
            }}>
              <h3 style={{
                fontSize: "18px", fontWeight: 700, color: T.txt,
                fontFamily: "'Playfair Display', serif",
              }}>Filters</h3>
              <button
                onClick={resetFilters}
                style={{
                  background: "none", border: "none", color: T.txtM,
                  fontSize: "13px", cursor: "pointer",
                }}
              >Reset</button>
            </div>

            {/* Make */}
            <FilterSection title="Make">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {MAKES.map(make => (
                  <CheckboxRow
                    key={make}
                    label={make}
                    checked={selectedMakes.includes(make)}
                    onChange={() => toggleMake(make)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Year Range */}
            <FilterSection title="Year Range">
              <YearRangeSlider min={yearMin} max={yearMax} onChange={(lo, hi) => { setYearMin(lo); setYearMax(hi); }} />
            </FilterSection>

            {/* Instrument Type */}
            <FilterSection title="Instrument Type">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {INSTRUMENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleInstrumentType(type)}
                    style={{
                      padding: "5px 12px", borderRadius: "8px", fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      backgroundColor: selectedInstrumentTypes.includes(type) ? T.warm : T.bgElev,
                      color: selectedInstrumentTypes.includes(type) ? T.bgDeep : T.txt2,
                      border: `1px solid ${selectedInstrumentTypes.includes(type) ? T.warm : T.border}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >{type}</button>
                ))}
              </div>
            </FilterSection>

            {/* Condition */}
            <FilterSection title="Condition">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {CONDITIONS.map(cond => (
                  <label
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      cursor: "pointer", padding: "3px 0",
                    }}
                  >
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: `2px solid ${selectedCondition === cond ? T.warm : T.txtM}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s", flexShrink: 0,
                    }}>
                      {selectedCondition === cond && (
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          backgroundColor: T.warm,
                        }} />
                      )}
                    </div>
                    <span style={{ fontSize: "14px", color: T.txt2 }}>{cond}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </aside>
        )}

        {/* ── Results Area ───────────────────────────────────────── */}
        <div style={{ flex: 1, paddingTop: "24px", paddingBottom: "64px", minWidth: 0 }}>

          {/* Mock data indicator */}
          {usingMockData && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 14px", borderRadius: "8px", marginBottom: "16px",
              backgroundColor: T.bgElev, border: `1px solid ${T.border}`,
              fontSize: "12px", color: T.txtM,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <Database size={14} />
              Demo data — connect Supabase to see real guitars
            </div>
          )}

          {/* Results header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "24px", flexWrap: "wrap", gap: "12px",
          }}>
            <p style={{ fontSize: "14px", color: T.txt2 }}>
              {loading ? "Loading..." : `${filtered.length} instruments found`}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  padding: "8px 32px 8px 14px", borderRadius: "8px",
                  backgroundColor: T.bgCard, border: `1px solid ${T.border}`,
                  color: T.txt, cursor: "pointer", fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>

              <button
                onClick={() => setView("grid")}
                style={{
                  padding: "8px", borderRadius: "8px",
                  backgroundColor: view === "grid" ? T.warm : T.bgCard,
                  color: view === "grid" ? T.bgDeep : T.txt2,
                  border: `1px solid ${view === "grid" ? T.warm : T.border}`,
                  cursor: "pointer", display: "flex", transition: "all 0.2s",
                }}
              ><Grid size={18} /></button>
              <button
                onClick={() => setView("list")}
                style={{
                  padding: "8px", borderRadius: "8px",
                  backgroundColor: view === "list" ? T.warm : T.bgCard,
                  color: view === "list" ? T.bgDeep : T.txt2,
                  border: `1px solid ${view === "list" ? T.warm : T.border}`,
                  cursor: "pointer", display: "flex", transition: "all 0.2s",
                }}
              ><List size={18} /></button>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
            }}>
              <Loader2 size={32} color={T.warm} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: "14px", color: T.txt2 }}>Loading guitars...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <p style={{ fontSize: "20px", fontWeight: 600, color: T.txt, marginBottom: "8px" }}>
                No instruments match your filters
              </p>
              <p style={{ color: T.txt2, marginBottom: "24px" }}>
                Try removing some filters or search for something else
              </p>
              <button
                onClick={resetFilters}
                style={{
                  padding: "10px 24px", borderRadius: "8px",
                  backgroundColor: T.warm, color: T.bgDeep,
                  border: "none", fontWeight: 600, cursor: "pointer",
                }}
              >Clear Filters</button>
            </div>
          ) : view === "grid" ? (
            /* ── Grid View ─────────────────────────────────────── */
            <div style={{
              display: "grid",
              gridTemplateColumns: showDesktopSidebar
                ? "repeat(auto-fill, minmax(clamp(200px, 40vw, 260px), 1fr))"
                : "repeat(auto-fill, minmax(clamp(200px, 40vw, 300px), 1fr))",
              gap: "20px",
            }}>
              {filtered.map((instrument, idx) => (
                <div
                  key={instrument.id}
                  style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.04}s both` }}
                >
                  <ExploreInstrumentCard instrument={instrument} view="grid" />
                </div>
              ))}
            </div>
          ) : (
            /* ── List View ─────────────────────────────────────── */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((instrument, idx) => (
                <div
                  key={instrument.id}
                  style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.04}s both` }}
                >
                  <ExploreInstrumentCard instrument={instrument} view="list" />
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {filtered.length > 0 && (
            <div style={{ marginTop: "48px", textAlign: "center" }}>
              <button style={{
                padding: "12px 32px", borderRadius: "8px",
                border: `2px solid ${T.border}`, backgroundColor: "transparent",
                color: T.txt2, fontSize: "14px", cursor: "pointer",
                transition: "all 0.2s", fontWeight: 500,
              }}>
                Load More
              </button>
              <p style={{ fontSize: "12px", color: T.txtM, marginTop: "12px",
                fontFamily: "'JetBrains Mono', monospace" }}>
                Showing 1–{filtered.length} of {total > 0 ? total.toLocaleString() : filtered.length} results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter overlay ─────────────────────────────── */}
      {isMobile && showFilters && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowFilters(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              maxHeight: "80vh", overflowY: "auto",
              backgroundColor: T.bgCard, borderRadius: "20px 20px 0 0",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "16px",
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: T.txt }}>Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={24} color={T.txt2} />
              </button>
            </div>

            <FilterSection title="Make">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {MAKES.map(make => (
                  <CheckboxRow
                    key={make}
                    label={make}
                    checked={selectedMakes.includes(make)}
                    onChange={() => toggleMake(make)}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Instrument Type">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {INSTRUMENT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleInstrumentType(type)}
                    style={{
                      padding: "5px 12px", borderRadius: "8px", fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      backgroundColor: selectedInstrumentTypes.includes(type) ? T.warm : T.bgElev,
                      color: selectedInstrumentTypes.includes(type) ? T.bgDeep : T.txt2,
                      border: `1px solid ${selectedInstrumentTypes.includes(type) ? T.warm : T.border}`,
                      cursor: "pointer",
                    }}
                  >{type}</button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Condition">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {CONDITIONS.map(cond => (
                  <label
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      cursor: "pointer", padding: "3px 0",
                    }}
                  >
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: `2px solid ${selectedCondition === cond ? T.warm : T.txtM}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {selectedCondition === cond && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: T.warm }} />
                      )}
                    </div>
                    <span style={{ fontSize: "14px", color: T.txt2 }}>{cond}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <div style={{
              display: "flex", gap: "12px", marginTop: "24px",
              borderTop: `1px solid ${T.border}`, paddingTop: "20px",
            }}>
              <button
                onClick={resetFilters}
                style={{
                  flex: 1, padding: "12px", borderRadius: "8px",
                  backgroundColor: T.bgElev, color: T.txt2,
                  border: `1px solid ${T.border}`, cursor: "pointer",
                }}
              >Clear All</button>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "8px",
                  backgroundColor: T.warm, color: T.bgDeep,
                  border: "none", fontWeight: 600, cursor: "pointer",
                }}
              >Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Responsive CSS ────────────────────────────────────── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .filter-btn-label { display: none; }
        }
        select option {
          background-color: ${T.bgCard};
          color: ${T.txt};
        }
      `}</style>
    </div>
  );
}
