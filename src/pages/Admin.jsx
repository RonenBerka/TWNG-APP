import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Guitar,
  ArrowLeftRight,
  FileText,
  Shield,
  Settings,
  ScrollText,
  Home,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Ban,
  UserX,
  Edit,
  Trash2,
  Merge,
  Flag,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  ToggleLeft,
  ToggleRight,
  Clock,
  Download,
  RefreshCw,
  Menu,
  LogOut,
  Bell,
  Calendar,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Zap,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase/client";
import { getAdminUsers, updateUserRole } from "../lib/supabase/users";
import {
  getDashboardStats,
  getRecentActivity,
  getAdminGuitars,
  updateGuitarState,
  adminDeleteGuitar,
  getAuditLogs,
  getAdminLuthiers,
  verifyLuthier,
  getSystemConfig,
  updateSystemConfig,
  getAdminArticles,
  updateArticleStatus,
  getAdminDiscussions,
  toggleDiscussionHidden,
  getPrivacyRequests,
  updatePrivacyRequest,
  getAdminTransfers,
  updateTransferStatus,
  getDuplicateMatches,
  getHomepageBlocks,
  saveHomepageBlocks,
} from "../lib/supabase/admin";
import {
  getHomepageSectionConfig,
  saveHomepageSectionConfig,
  saveHomepageTestimonials,
  saveHomepageStats,
} from "../lib/supabase/homepage";
import {
  getAdminClaims,
  approveClaim,
  rejectClaim,
  getClaimStats,
  markGuitarClaimable,
} from "../lib/supabase/claims";
import {
  getPendingChangeRequests,
  approveChangeRequest,
  denyChangeRequest,
} from "../lib/supabase/iaChangeRequests";
import MarketingConsole from "./admin/MarketingConsole";
import ContentExtractor from "./admin/ContentExtractor";

// ─────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────

// ─── UNIFIED DESIGN SYSTEM ──────────────────────────
// All shared components follow the Marketing Console design language:
// - warmAlways (#D97706) for accents regardless of theme
// - 12px border-radius on stat cards, 6px on cards, 8px on buttons
// - 3px top colored border on stat cards
// - 10px uppercase letter-spaced table headers (T.txtM)
// - 20px pill-shaped badges with auto-bg from color+18
// - 8px border-radius on filter tabs (not pills)
// - 18px page titles, 14px section titles

const WARM = "#D97706";

const Spinner = ({ size = 32 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 0",
    }}
  >
    <Loader2 size={size} style={{ color: WARM }} className="animate-spin" />
  </div>
);

const EmptyState = ({ message = "No data found", icon: Icon = Database }) => (
  <div style={{ padding: "48px 0", textAlign: "center" }}>
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: `${WARM}12`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px",
      }}
    >
      <Icon size={22} style={{ color: WARM }} />
    </div>
    <p style={{ color: T.txt2, fontSize: "13px" }}>{message}</p>
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div
    style={{
      backgroundColor: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: "8px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <AlertCircle size={18} style={{ color: "#EF4444" }} />
      <span style={{ color: "#EF4444", fontSize: "13px" }}>{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          color: "#FFFFFF",
          backgroundColor: "#EF4444",
          border: "none",
          borderRadius: "8px",
          padding: "6px 14px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    )}
  </div>
);

const StatCard = ({ label, value, icon: Icon, loading, color }) => {
  const accentColor = color || WARM;
  return (
    <div
      style={{
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "12px",
        borderTop: `3px solid ${accentColor}`,
        padding: "20px",
        flex: 1,
        minWidth: "140px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <p
          style={{
            color: T.txtM,
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        {Icon && (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              backgroundColor: `${accentColor}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={16} color={accentColor} strokeWidth={2} />
          </div>
        )}
      </div>
      {loading ? (
        <Loader2
          size={22}
          style={{ color: accentColor }}
          className="animate-spin"
        />
      ) : (
        <h3
          style={{
            color: T.txt,
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
      )}
    </div>
  );
};

const RoleBadge = ({ role, onClick, clickable = false }) => {
  const colors = {
    "Super Admin": { bg: "#7C2D12", text: "#FDBF60" },
    super_admin: { bg: "#7C2D12", text: "#FDBF60" },
    admin: { bg: "#92400E", text: "#FCD34D" },
    moderator: { bg: "#78350F", text: "#F59E0B" },
    auditor: { bg: "#713F12", text: "#F97316" },
    support: { bg: "#664E00", text: "#FBBF24" },
    luthier: { bg: "#713F12", text: "#F97316" },
    user: { bg: T.bgElev, text: T.txt2 },
  };
  const s = colors[role] || colors["user"];
  const displayRole = role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      style={{
        backgroundColor: s.bg,
        color: s.text,
        cursor: clickable ? "pointer" : "default",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        border: "none",
        letterSpacing: "0.02em",
      }}
      className={clickable ? "hover:opacity-80" : ""}
    >
      {displayRole}
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    active: { color: "#10B981", icon: CheckCircle },
    published: { color: "#10B981", icon: CheckCircle },
    completed: { color: "#10B981", icon: CheckCircle },
    accepted: { color: "#10B981", icon: CheckCircle },
    pending: { color: "#3B82F6", icon: Clock },
    processing: { color: "#3B82F6", icon: Loader2 },
    draft: { color: "#6B7280", icon: FileText },
    review: { color: "#F59E0B", icon: AlertCircle },
    scheduled: { color: "#8B5CF6", icon: Calendar },
    suspended: { color: "#F59E0B", icon: AlertCircle },
    archived: { color: "#6B7280", icon: EyeOff },
    banned: { color: "#EF4444", icon: AlertCircle },
    expired: { color: "#EF4444", icon: Clock },
    cancelled: { color: "#6B7280", icon: X },
    declined: { color: "#EF4444", icon: X },
    hidden: { color: "#EF4444", icon: EyeOff },
    denied: { color: "#EF4444", icon: X },
    pending_transfer: { color: "#F59E0B", icon: ArrowLeftRight },
  };
  const s = map[status] || map["active"];
  const SIcon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 10px",
        borderRadius: "20px",
        backgroundColor: `${s.color}18`,
        color: s.color,
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      <SIcon size={12} />
      {status
        ?.split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}
    </span>
  );
};

// ─── Shared layout helpers ──────────────────────────

const PageHeader = ({ title, subtitle, children }) => (
  <div style={{ marginBottom: "24px" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <h1
          style={{
            color: T.txt,
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: T.txt2, fontSize: "13px" }}>{subtitle}</p>
        )}
      </div>
      {children && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {children}
        </div>
      )}
    </div>
  </div>
);

const SectionTitle = ({ children, icon: Icon, color }) => {
  const accent = color || WARM;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
        marginTop: "8px",
      }}
    >
      {Icon && (
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            backgroundColor: `${accent}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={accent} strokeWidth={2} />
        </div>
      )}
      <h2 style={{ color: T.txt, fontSize: "14px", fontWeight: 700 }}>
        {children}
      </h2>
    </div>
  );
};

const Card = ({ children, style: extraStyle, ...props }) => (
  <div
    style={{
      backgroundColor: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: "6px",
      overflow: "hidden",
      ...extraStyle,
    }}
    {...props}
  >
    {children}
  </div>
);

const TH = ({ children, style: extraStyle }) => (
  <th
    style={{
      padding: "10px 16px",
      textAlign: "left",
      fontSize: "10px",
      fontWeight: 700,
      color: T.txtM,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      borderBottom: `2px solid ${T.border}`,
      ...extraStyle,
    }}
  >
    {children}
  </th>
);

const TD = ({ children, style: extraStyle, mono }) => (
  <td
    style={{
      padding: "12px 16px",
      fontSize: "13px",
      color: T.txt,
      ...(mono
        ? { fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }
        : {}),
      ...extraStyle,
    }}
  >
    {children}
  </td>
);

const TR = ({ children, onClick, style: extraStyle }) => (
  <tr
    onClick={onClick}
    style={{
      borderBottom: `1px solid ${T.border}`,
      cursor: onClick ? "pointer" : "default",
      transition: "background-color 0.1s ease",
      ...extraStyle,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = T.bgElev;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
    }}
  >
    {children}
  </tr>
);

const ActionBtn = ({ onClick, color, icon: Icon, label, disabled, solid }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: solid ? color : `${color}15`,
      color: solid ? "#FFFFFF" : color,
      fontSize: "11px",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s ease",
    }}
  >
    {Icon && <Icon size={12} />}
    {label}
  </button>
);

const FilterPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 16px",
      borderRadius: "8px",
      border: active ? `1px solid ${WARM}` : `1px solid ${T.border}`,
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: active ? WARM : "transparent",
      color: active ? "#FFFFFF" : T.txt,
      transition: "all 0.15s ease",
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = T.bgElev;
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = active ? WARM : "transparent";
    }}
  >
    {children}
  </button>
);

const SearchInput = ({ value, onChange, placeholder }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: T.bgElev,
      border: `1px solid ${T.border}`,
      borderRadius: "8px",
      padding: "8px 12px",
      flex: 1,
      minWidth: "180px",
    }}
  >
    <Search size={16} style={{ color: T.txtM, flexShrink: 0 }} />
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Search..."}
      style={{
        flex: 1,
        background: "none",
        border: "none",
        outline: "none",
        color: T.txt,
        fontSize: "13px",
      }}
    />
  </div>
);

const FilterSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      backgroundColor: T.bgElev,
      color: T.txt,
      border: `1px solid ${T.border}`,
      borderRadius: "20px",
      padding: "6px 14px",
      fontSize: "13px",
      cursor: "pointer",
      outline: "none",
    }}
  >
    {children}
  </select>
);

const PrimaryBtn = ({ onClick, icon: Icon, children, disabled, danger, small }) => {
  const bg = danger ? "#EF4444" : WARM;
  const border = danger ? `1px solid rgba(239,68,68,0.27)` : `1px solid ${bg}`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: small ? "6px 14px" : "10px 20px",
        borderRadius: "8px",
        border: danger ? border : "none",
        backgroundColor: danger ? "transparent" : bg,
        color: danger ? "#EF4444" : "#FFFFFF",
        fontSize: small ? "12px" : "13px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};

const SecondaryBtn = ({ onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "8px",
      border: `1px solid ${T.border}`,
      backgroundColor: "transparent",
      color: T.txt2,
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s ease",
    }}
  >
    {Icon && <Icon size={14} />}
    {children}
  </button>
);

const ToggleSwitch = ({ enabled, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "40px",
      height: "22px",
      borderRadius: "11px",
      border: "none",
      backgroundColor: enabled ? WARM : T.bgElev,
      position: "relative",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      boxShadow: enabled ? "none" : `inset 0 0 0 1px ${T.border}`,
    }}
  >
    <div
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        backgroundColor: "#FFFFFF",
        position: "absolute",
        top: "3px",
        left: enabled ? "21px" : "3px",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}
    />
  </button>
);

const FormInput = ({
  label,
  value,
  onChange,
  type,
  placeholder,
  style: extraStyle,
}) => (
  <div style={{ marginBottom: "12px", ...extraStyle }}>
    {label && (
      <label
        style={{
          display: "block",
          color: T.txt2,
          fontSize: "12px",
          fontWeight: 600,
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
    )}
    <input
      type={type || "text"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        backgroundColor: T.bgElev,
        color: T.txt,
        border: `1px solid ${T.border}`,
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "13px",
        outline: "none",
      }}
    />
  </div>
);

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
};

const formatDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
};

const getInitials = (name, email) => {
  if (name)
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
};

// ─────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10),
      ]);
      setStats(s);
      setActivity(a);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const actionIcons = {
    user: Users,
    ie: Guitar,
    transfer: ArrowLeftRight,
    privacy: Shield,
    admin: Settings,
    content: FileText,
  };

  const getActionCategory = (action) => {
    if (!action) return "admin";
    const prefix = action.split(".")[0];
    return prefix || "admin";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Platform overview — live data from Supabase."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          label="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Instruments"
          value={stats?.totalGuitars}
          icon={Guitar}
          loading={loading}
        />
        <StatCard
          label="Collections"
          value={stats?.totalCollections}
          icon={Database}
          loading={loading}
        />
        <StatCard
          label="Articles"
          value={stats?.totalArticles}
          icon={FileText}
          loading={loading}
        />
      </div>

      <Card style={{ padding: "20px" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: T.txt }}>
            Recent Activity
          </h2>
          <button
            onClick={load}
            style={{ color: T.txt2 }}
            className="hover:opacity-75"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        {loading ? (
          <Spinner size={24} />
        ) : activity.length === 0 ? (
          <EmptyState message="No audit log entries yet" icon={Activity} />
        ) : (
          <div className="space-y-0">
            {activity.map((item) => {
              const cat = getActionCategory(item.action);
              const Icon = actionIcons[cat] || Activity;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b"
                  style={{ borderColor: T.border }}
                >
                  <div className="pt-1">
                    <Icon size={20} style={{ color: T.warm }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: T.txt }} className="text-sm font-medium">
                      {item.actor_type === "system"
                        ? "System"
                        : item.actor_id?.slice(0, 8) || "Unknown"}
                    </p>
                    <p style={{ color: T.txt2 }} className="text-sm">
                      {item.action}
                    </p>
                    {item.entity_type && (
                      <p style={{ color: T.txtM }} className="text-xs">
                        {item.entity_type} {item.entity_id?.slice(0, 8)}
                      </p>
                    )}
                  </div>
                  <p
                    style={{ color: T.txtM }}
                    className="text-xs whitespace-nowrap"
                  >
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// HOMEPAGE MANAGEMENT
// ─────────────────────────────────────────────────────

// Canonical homepage sections — single source of truth
const CANONICAL_BLOCKS = [
  { id: "1", title: "Hero Section", type: "hero", status: "active" },
  { id: "2", title: "Stats Bar", type: "stats", status: "active" },
  {
    id: "3",
    title: "Featured Instruments",
    type: "featured",
    status: "active",
  },
  {
    id: "4",
    title: "Recently Added",
    type: "recently_added",
    status: "active",
  },
  {
    id: "5",
    title: "Explore by Brand",
    type: "explore_brands",
    status: "active",
  },
  { id: "6", title: "Articles", type: "articles", status: "active" },
  { id: "7", title: "Testimonials", type: "testimonials", status: "active" },
  { id: "8", title: "Call to Action", type: "cta", status: "active" },
];

// ─── Inline editor component for section content ────
// ─── Reusable image upload field ──────────────
const ImageUploadField = ({
  label,
  value,
  onChange,
  placeholder,
  previewHeight = 80,
}) => {
  const [uploadError, setUploadError] = React.useState(null);

  const inputStyle = {
    backgroundColor: T.bgElev,
    color: T.txt,
    borderColor: T.border,
    border: `1px solid ${T.border}`,
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = {
    color: T.txt2,
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "4px",
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
  };
  const fileInputId = `img-upload-${label.replace(/\s/g, "-").toLowerCase()}`;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    // Upload to Supabase Storage (homepage-images bucket)
    try {
      const { supabase } = await import("../lib/supabase/client");
      const ext = file.name.split(".").pop();
      const path = `homepage/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("homepage-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        // Bucket might not exist — fall back to object URL preview
        setUploadError(`Upload failed (bucket may not exist): ${error.message}`);
        // Use a local object URL as temporary preview
        onChange(URL.createObjectURL(file));
        return;
      }
      const { data: urlData } = supabase.storage
        .from("homepage-images")
        .getPublicUrl(data.path);
      onChange(urlData.publicUrl);
    } catch (err) {
      setUploadError(`Upload error: ${err.message || String(err)}`);
      onChange(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {uploadError && (
        <div style={{
          padding: "8px 12px",
          marginBottom: "8px",
          borderRadius: "6px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: `1px solid #ef4444`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "#dc2626",
        }}>
          <AlertCircle size={14} />
          {uploadError}
        </div>
      )}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            style={inputStyle}
            value={value || ""}
            placeholder={placeholder || "Image URL or upload"}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-2">
            <label
              htmlFor={fileInputId}
              style={{
                backgroundColor: T.bgDeep,
                color: T.txt2,
                border: `1px solid ${T.border}`,
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "12px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ArrowUp size={12} /> Upload Image
            </label>
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {value && (
              <span style={{ color: T.txtM, fontSize: "11px" }}>Image set</span>
            )}
          </div>
        </div>
        {value && (
          <div
            style={{
              width: `${previewHeight * 1.5}px`,
              height: `${previewHeight}px`,
              borderRadius: "6px",
              overflow: "hidden",
              border: `1px solid ${T.border}`,
              flexShrink: 0,
            }}
          >
            <img
              src={value}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const SectionContentEditor = ({ type, config, onChange }) => {
  const inputStyle = {
    backgroundColor: T.bgElev,
    color: T.txt,
    borderColor: T.border,
    border: `1px solid ${T.border}`,
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };
  const labelStyle = {
    color: T.txt2,
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "4px",
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
  };
  const sectionLabel = {
    color: T.warm,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
    display: "block",
  };

  // Helper to update a nested config key
  const set = (section, key, val) =>
    onChange({ ...config, [section]: { ...config?.[section], [key]: val } });

  switch (type) {
    case "hero":
      return (
        <div className="space-y-4">
          <span style={sectionLabel}>Copywriting</span>
          <div>
            <label style={labelStyle}>Badge Text</label>
            <input
              style={inputStyle}
              value={config?.hero?.badgeText || ""}
              placeholder="Now in Beta · Join 3,200+ Collectors"
              onChange={(e) => set("hero", "badgeText", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Heading Line 1</label>
              <input
                style={inputStyle}
                value={config?.hero?.heading1 || ""}
                placeholder="Every Guitar"
                onChange={(e) => set("hero", "heading1", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>
                Heading Highlight (gradient text)
              </label>
              <input
                style={inputStyle}
                value={config?.hero?.headingHighlight || ""}
                placeholder="Has a Story"
                onChange={(e) =>
                  set("hero", "headingHighlight", e.target.value)
                }
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Subtitle</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={config?.hero?.subtitle || ""}
              placeholder="Document your collection. Discover rare instruments. Connect with collectors and luthiers worldwide."
              onChange={(e) => set("hero", "subtitle", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Primary Button Text</label>
              <input
                style={inputStyle}
                value={config?.hero?.primaryBtn || ""}
                placeholder="Start Your Collection"
                onChange={(e) => set("hero", "primaryBtn", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Secondary Button Text</label>
              <input
                style={inputStyle}
                value={config?.hero?.secondaryBtn || ""}
                placeholder="Explore Guitars"
                onChange={(e) => set("hero", "secondaryBtn", e.target.value)}
              />
            </div>
          </div>
          <div
            style={{
              borderTop: `1px solid ${T.border}`,
              paddingTop: "12px",
              marginTop: "8px",
            }}
          >
            <span style={sectionLabel}>Image</span>
            <ImageUploadField
              label="Hero Background Image"
              value={config?.hero?.bgImage || ""}
              onChange={(v) => set("hero", "bgImage", v)}
              placeholder="Upload or paste URL for hero background"
              previewHeight={100}
            />
          </div>
        </div>
      );
    case "stats":
      return (
        <div className="space-y-3">
          <span style={sectionLabel}>Stat Values</span>
          <p style={{ color: T.txtM, fontSize: "12px", marginBottom: "8px" }}>
            Leave empty to use live database counts
          </p>
          {[
            "Guitars Documented",
            "Collectors & Musicians",
            "Brands Catalogued",
            "Verified Luthiers",
          ].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span
                style={{
                  color: T.txt2,
                  fontSize: "12px",
                  width: "180px",
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <input
                style={{ ...inputStyle, width: "120px" }}
                value={config?.stats?.[i]?.value || ""}
                placeholder="Auto"
                onChange={(e) => {
                  const stats = [...(config?.stats || [{}, {}, {}, {}])];
                  stats[i] = { ...stats[i], value: e.target.value, label };
                  onChange({ ...config, stats });
                }}
              />
            </div>
          ))}
        </div>
      );
    case "featured":
      return (
        <div className="space-y-3">
          <span style={sectionLabel}>Copywriting</span>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Section Eyebrow</label>
              <input
                style={inputStyle}
                value={config?.featured?.eyebrow || ""}
                placeholder="Featured Collection"
                onChange={(e) => set("featured", "eyebrow", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Section Title</label>
              <input
                style={inputStyle}
                value={config?.featured?.title || ""}
                placeholder="Guitars with Character"
                onChange={(e) => set("featured", "title", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Section Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "50px", resize: "vertical" }}
              value={config?.featured?.description || ""}
              placeholder="Hand-picked instruments with stories worth telling..."
              onChange={(e) => set("featured", "description", e.target.value)}
            />
          </div>
          <div
            style={{ borderTop: `1px solid ${T.border}`, paddingTop: "8px" }}
          >
            <p style={{ color: T.txtM, fontSize: "12px" }}>
              Guitars are pulled from the database automatically (latest
              published, verified first). To feature a specific guitar, mark it
              as "verified" in Instruments.
            </p>
          </div>
        </div>
      );
    case "recently_added":
      return (
        <div className="space-y-3">
          <span style={sectionLabel}>Copywriting</span>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Section Eyebrow</label>
              <input
                style={inputStyle}
                value={config?.recently_added?.eyebrow || ""}
                placeholder="Just Added"
                onChange={(e) =>
                  set("recently_added", "eyebrow", e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Section Title</label>
              <input
                style={inputStyle}
                value={config?.recently_added?.title || ""}
                placeholder="Fresh Arrivals"
                onChange={(e) => set("recently_added", "title", e.target.value)}
              />
            </div>
          </div>
          <p style={{ color: T.txtM, fontSize: "12px" }}>
            Shows the 8 most recently published guitars, pulled live from the
            database.
          </p>
        </div>
      );
    case "explore_brands":
      return (
        <div className="space-y-3">
          <span style={sectionLabel}>Copywriting</span>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Section Eyebrow</label>
              <input
                style={inputStyle}
                value={config?.explore_brands?.eyebrow || ""}
                placeholder="Browse"
                onChange={(e) =>
                  set("explore_brands", "eyebrow", e.target.value)
                }
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Section Title</label>
              <input
                style={inputStyle}
                value={config?.explore_brands?.title || ""}
                placeholder="Explore by Brand"
                onChange={(e) => set("explore_brands", "title", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Section Description</label>
            <input
              style={inputStyle}
              value={config?.explore_brands?.description || ""}
              placeholder="Dive into collections organized by the world's most iconic guitar makers."
              onChange={(e) =>
                set("explore_brands", "description", e.target.value)
              }
            />
          </div>
          <p style={{ color: T.txtM, fontSize: "12px" }}>
            Brand counts are computed live from the database.
          </p>
        </div>
      );
    case "articles":
      return (
        <div className="space-y-3">
          <span style={sectionLabel}>Copywriting</span>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Section Eyebrow</label>
              <input
                style={inputStyle}
                value={config?.articles?.eyebrow || ""}
                placeholder="From the Archive"
                onChange={(e) => set("articles", "eyebrow", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Section Title</label>
              <input
                style={inputStyle}
                value={config?.articles?.title || ""}
                placeholder="Deep Dives & Guides"
                onChange={(e) => set("articles", "title", e.target.value)}
              />
            </div>
          </div>
          <p style={{ color: T.txtM, fontSize: "12px" }}>
            Shows the 3 most recently published articles. Manage articles in the
            Content section.
          </p>
        </div>
      );
    case "testimonials":
      return (
        <div className="space-y-4">
          <span style={sectionLabel}>Copywriting</span>
          <div>
            <label style={labelStyle}>Quote</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={config?.testimonial?.quote || ""}
              placeholder="I've been collecting for thirty years..."
              onChange={(e) =>
                onChange({
                  ...config,
                  testimonial: {
                    ...config?.testimonial,
                    quote: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Author Name</label>
              <input
                style={inputStyle}
                value={config?.testimonial?.author || ""}
                placeholder="Sarah Mitchell"
                onChange={(e) =>
                  onChange({
                    ...config,
                    testimonial: {
                      ...config?.testimonial,
                      author: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Role / Description</label>
              <input
                style={inputStyle}
                value={config?.testimonial?.role || ""}
                placeholder="Collector · 47 guitars documented"
                onChange={(e) =>
                  onChange({
                    ...config,
                    testimonial: {
                      ...config?.testimonial,
                      role: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          <div
            style={{ borderTop: `1px solid ${T.border}`, paddingTop: "12px" }}
          >
            <span style={sectionLabel}>Image</span>
            <ImageUploadField
              label="Author Avatar"
              value={config?.testimonial?.image || ""}
              onChange={(v) =>
                onChange({
                  ...config,
                  testimonial: { ...config?.testimonial, image: v },
                })
              }
              placeholder="Upload or paste URL for avatar"
              previewHeight={60}
            />
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="space-y-4">
          <span style={sectionLabel}>Copywriting</span>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Heading Prefix</label>
              <input
                style={inputStyle}
                value={config?.cta?.headingPrefix || ""}
                placeholder="Ready to Document"
                onChange={(e) => set("cta", "headingPrefix", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Heading Highlight (amber text)</label>
              <input
                style={inputStyle}
                value={config?.cta?.headingHighlight || ""}
                placeholder="Your Collection"
                onChange={(e) => set("cta", "headingHighlight", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Subtitle</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={config?.cta?.subtitle || ""}
              placeholder="Join thousands of collectors preserving guitar history..."
              onChange={(e) => set("cta", "subtitle", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>Primary Button Text</label>
              <input
                style={inputStyle}
                value={config?.cta?.primaryBtn || ""}
                placeholder="Create Free Account"
                onChange={(e) => set("cta", "primaryBtn", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Secondary Button Text</label>
              <input
                style={inputStyle}
                value={config?.cta?.secondaryBtn || ""}
                placeholder="Try Magic Add"
                onChange={(e) => set("cta", "secondaryBtn", e.target.value)}
              />
            </div>
          </div>
          <div
            style={{ borderTop: `1px solid ${T.border}`, paddingTop: "12px" }}
          >
            <span style={sectionLabel}>Image</span>
            <ImageUploadField
              label="CTA Background Image"
              value={config?.cta?.bgImage || ""}
              onChange={(v) => set("cta", "bgImage", v)}
              placeholder="Upload or paste URL for CTA background"
              previewHeight={100}
            />
          </div>
        </div>
      );
    default:
      return (
        <p style={{ color: T.txtM, fontSize: "12px" }}>
          No content settings for this section.
        </p>
      );
  }
};

const HomepageManagementPage = () => {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [sectionConfig, setSectionConfig] = useState({});
  const [configDirty, setConfigDirty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [dbBlocks, config] = await Promise.all([
          getHomepageBlocks(),
          getHomepageSectionConfig(),
        ]);
        // Merge DB data with canonical list
        const dbMap = {};
        (dbBlocks || []).forEach((b) => {
          dbMap[b.type] = b;
        });
        const merged = CANONICAL_BLOCKS.map((canonical) => {
          const existing = dbMap[canonical.type];
          return existing
            ? {
                ...canonical,
                ...existing,
                title: existing.title || canonical.title,
              }
            : { ...canonical };
        });
        const canonTypes = new Set(CANONICAL_BLOCKS.map((b) => b.type));
        const customBlocks = (dbBlocks || []).filter(
          (b) => !canonTypes.has(b.type),
        );
        setBlocks([...merged, ...customBlocks]);
        if (config) setSectionConfig(config);
      } catch {
        setBlocks(CANONICAL_BLOCKS.map((b) => ({ ...b })));
      }
      setLoading(false);
    })();
  }, []);

  const toggleStatus = async (id) => {
    const updated = blocks.map((b) =>
      b.id === id
        ? { ...b, status: b.status === "active" ? "inactive" : "active" }
        : b,
    );
    setBlocks(updated);
    setSaving(true);
    try {
      await saveHomepageBlocks(updated, user?.id);
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  const startEditing = (block) => {
    setEditingBlock(block.id);
    setEditTitle(block.title);
  };

  const saveEdit = async () => {
    if (!editingBlock) return;
    const updated = blocks.map((b) =>
      b.id === editingBlock ? { ...b, title: editTitle.trim() || b.title } : b,
    );
    setBlocks(updated);
    setEditingBlock(null);
    setEditTitle("");
    setSaving(true);
    try {
      await saveHomepageBlocks(updated, user?.id);
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    setEditingBlock(null);
    setEditTitle("");
  };

  const removeBlock = async (id) => {
    const block = blocks.find((b) => b.id === id);
    const canonTypes = new Set(CANONICAL_BLOCKS.map((b) => b.type));
    if (block && canonTypes.has(block.type)) return;
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    setSaving(true);
    try {
      await saveHomepageBlocks(updated, user?.id);
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  const addBlock = () => {
    setBlocks([
      ...blocks,
      {
        id: crypto.randomUUID(),
        title: "New Block",
        type: "custom",
        status: "draft",
      },
    ]);
  };

  const handleConfigChange = (newConfig) => {
    setSectionConfig(newConfig);
    setConfigDirty(true);
  };

  const saveContentConfig = async () => {
    setSaving(true);
    try {
      await saveHomepageSectionConfig(sectionConfig, user?.id);
      // Also save testimonial and stats if they exist in config
      if (sectionConfig.testimonial) {
        await saveHomepageTestimonials([sectionConfig.testimonial], user?.id);
      }
      if (sectionConfig.stats) {
        const validStats = sectionConfig.stats.filter((s) => s.value);
        if (validStats.length > 0) {
          await saveHomepageStats(validStats, user?.id);
        }
      }
      setConfigDirty(false);
    } catch (e) {
      console.error("Save config error:", e);
    }
    setSaving(false);
  };

  const canonicalTypes = new Set(CANONICAL_BLOCKS.map((b) => b.type));
  const editableTypes = new Set([
    "hero",
    "stats",
    "testimonials",
    "cta",
    "featured",
    "recently_added",
    "explore_brands",
    "articles",
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Management"
        subtitle="Toggle sections on/off and edit content. All data-driven sections pull live data from the database."
      >
        {configDirty && (
          <PrimaryBtn onClick={saveContentConfig} icon={Check}>
            Save Content Changes
          </PrimaryBtn>
        )}
        {saving && (
          <span
            style={{ color: WARM }}
            className="text-sm flex items-center gap-2"
          >
            <Loader2 size={14} className="animate-spin" /> Saving…
          </span>
        )}
      </PageHeader>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <Card>
            {blocks.map((block) => (
              <div
                key={block.id}
                style={{ borderColor: T.border }}
                className="border-b last:border-b-0"
              >
                {/* Block row */}
                <div
                  className="flex items-center px-6 py-3 hover:opacity-90"
                  style={{ cursor: "pointer" }}
                >
                  {/* Expand arrow */}
                  <button
                    onClick={() =>
                      setExpandedBlock(
                        expandedBlock === block.id ? null : block.id,
                      )
                    }
                    style={{ color: T.txt2 }}
                    className="mr-3 hover:opacity-75"
                  >
                    {expandedBlock === block.id ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Title */}
                  <div
                    style={{ color: T.txt, flex: 1, minWidth: 0 }}
                    className="text-sm"
                  >
                    {editingBlock === block.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          style={{
                            backgroundColor: T.bgElev,
                            color: T.txt,
                            borderColor: T.border,
                          }}
                          className="border rounded px-2 py-1 text-sm outline-none w-48"
                        />
                        <button onClick={saveEdit} style={{ color: "#22c55e" }}>
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ color: "#ef4444" }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium">{block.title}</span>
                    )}
                  </div>

                  {/* Type badge */}
                  <span
                    style={{
                      color: T.txt2,
                      backgroundColor: T.bgElev,
                      borderColor: T.border,
                    }}
                    className="text-xs px-2 py-1 rounded border mr-3 inline-flex items-center gap-1"
                  >
                    {block.type}
                    {canonicalTypes.has(block.type) && (
                      <Lock size={10} style={{ color: T.txtM, opacity: 0.5 }} />
                    )}
                  </span>

                  {/* Data source indicator */}
                  {editableTypes.has(block.type) && (
                    <span
                      style={{ color: "#22c55e", fontSize: "11px" }}
                      className="mr-3 flex items-center gap-1"
                    >
                      <Zap size={10} /> Live
                    </span>
                  )}

                  {/* Status */}
                  <div className="mr-3">
                    <StatusBadge status={block.status} />
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => toggleStatus(block.id)}
                    style={{ color: T.warm }}
                    className="hover:opacity-75 mr-2"
                    title={
                      block.status === "active"
                        ? "Hide section"
                        : "Show section"
                    }
                  >
                    {block.status === "active" ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => startEditing(block)}
                    style={{ color: T.txt2 }}
                    className="hover:opacity-75 mr-2"
                    title="Edit title"
                  >
                    <Edit size={16} />
                  </button>
                  {!canonicalTypes.has(block.type) && (
                    <button
                      onClick={() => removeBlock(block.id)}
                      style={{ color: "#ef4444" }}
                      className="hover:opacity-75"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Expanded content editor */}
                {expandedBlock === block.id && (
                  <div
                    style={{
                      backgroundColor: T.bgElev,
                      borderColor: T.border,
                      borderTop: `1px solid ${T.border}`,
                    }}
                    className="px-6 py-4"
                  >
                    <SectionContentEditor
                      type={block.type}
                      config={sectionConfig}
                      onChange={handleConfigChange}
                    />
                  </div>
                )}
              </div>
            ))}
          </Card>
          <PrimaryBtn onClick={addBlock} icon={Plus}>
            Add Block
          </PrimaryBtn>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// USER MANAGEMENT (already wired — kept as-is with minor polish)
// ─────────────────────────────────────────────────────

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingRole, setPendingRole] = useState("");
  const [roleChanging, setRoleChanging] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [viewUserData, setViewUserData] = useState(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);

  const handleViewUser = async (user) => {
    if (viewingUserId === user.id) {
      setViewingUserId(null);
      setViewUserData(null);
      return;
    }
    setViewingUserId(user.id);
    setViewUserLoading(true);
    try {
      // Fetch user's guitars
      const { data: guitars } = await supabase
        .from("instrument_entities")
        .select("id, make, model, year, state, created_at")
        .eq("current_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      // Fetch user's claims
      const { data: claims } = await supabase
        .from("ownership_claims")
        .select("id, status, created_at")
        .eq("claimant_id", user.id)
        .limit(5);
      // Fetch user profile details
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setViewUserData({
        profile: profile || {},
        guitars: guitars || [],
        claims: claims || [],
      });
    } catch (e) {
      setViewUserData({ profile: {}, guitars: [], claims: [], error: e.message });
    } finally {
      setViewUserLoading(false);
    }
  };

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await getAdminUsers({ search: userSearch || null });
      setUsers(data || []);
    } catch (e) {
      setUsersError(e.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async () => {
    if (!selectedUser || !pendingRole) return;
    setRoleChanging(true);
    try {
      await updateUserRole(selectedUser.id, pendingRole);
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: pendingRole } : u,
        ),
      );
      setShowRoleModal(false);
      setPendingRole("");
      setSelectedUser(null);
    } catch (e) {
      alert("Failed to update role: " + e.message);
    } finally {
      setRoleChanging(false);
    }
  };

  const roleOptions = [
    "user",
    "luthier",
    "moderator",
    "support",
    "auditor",
    "admin",
    "super_admin",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage user accounts, roles, and permissions"
      />

      <SearchInput
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        placeholder="Search by email, username, or ID..."
      />

      {usersLoading && <Spinner />}
      {usersError && <ErrorBanner message={usersError} onRetry={loadUsers} />}

      {!usersLoading && !usersError && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <TH>User</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Guitars</TH>
                  <TH>Joined</TH>
                  <TH style={{ textAlign: "right" }}>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <React.Fragment key={u.id}>
                  <TR>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: WARM, color: "#FFFFFF" }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        >
                          {getInitials(u.display_name, u.email)}
                        </div>
                        <span>{u.display_name || u.username || "Unknown"}</span>
                      </div>
                    </TD>
                    <TD>{u.email}</TD>
                    <TD>
                      <RoleBadge
                        role={u.role}
                        clickable
                        onClick={() => {
                          setSelectedUser(u);
                          setPendingRole(u.role);
                          setShowRoleModal(true);
                        }}
                      />
                    </TD>
                    <TD>{u.guitar_count || 0}</TD>
                    <TD>{formatDate(u.created_at)}</TD>
                    <TD style={{ textAlign: "right" }}>
                      <ActionBtn
                        onClick={() => handleViewUser(u)}
                        color={viewingUserId === u.id ? "#3B82F6" : WARM}
                        icon={viewingUserId === u.id ? X : Eye}
                        label={viewingUserId === u.id ? "Close" : "View"}
                      />
                    </TD>
                  </TR>
                  {viewingUserId === u.id && (
                    <tr>
                      <td colSpan={6} style={{ padding: "0" }}>
                        <div style={{
                          backgroundColor: T.bgElev,
                          borderTop: `2px solid ${WARM}`,
                          padding: "20px 24px",
                        }}>
                          {viewUserLoading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}><Spinner size={24} /></div>
                          ) : viewUserData ? (
                            <>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <span style={{ color: WARM, fontWeight: 600, fontSize: "14px" }}>User Profile</span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  {u.username && (
                                    <button onClick={() => window.open(`/user/${u.username}`, "_blank")} style={{
                                      padding: "4px 12px", borderRadius: "6px", border: `1px solid ${T.border}`,
                                      backgroundColor: "transparent", color: T.txt, fontSize: "12px", cursor: "pointer",
                                    }}>Open Public Profile ↗</button>
                                  )}
                                  <button onClick={() => { setViewingUserId(null); setViewUserData(null); }} style={{
                                    padding: "4px 10px", borderRadius: "6px", border: "none",
                                    backgroundColor: "rgba(255,255,255,0.05)", color: T.txt2, fontSize: "12px", cursor: "pointer",
                                  }}>✕</button>
                                </div>
                              </div>
                              {/* User info grid */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                                {[
                                  ["Display Name", viewUserData.profile.display_name || u.display_name || "—"],
                                  ["Username", viewUserData.profile.username || u.username || "—"],
                                  ["Email", u.email],
                                  ["Role", u.role],
                                  ["Location", viewUserData.profile.location || "—"],
                                  ["Bio", viewUserData.profile.bio || "—"],
                                  ["Joined", formatDate(u.created_at)],
                                  ["Last Sign In", formatDate(viewUserData.profile.last_sign_in_at || u.last_sign_in_at)],
                                  ["User ID", u.id],
                                ].map(([label, value]) => (
                                  <div key={label}>
                                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "2px" }}>{label}</div>
                                    <div style={{ fontSize: "13px", color: T.txt, wordBreak: "break-all" }}>{value || "—"}</div>
                                  </div>
                                ))}
                              </div>
                              {/* Guitars section */}
                              <div style={{ marginBottom: "12px" }}>
                                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "6px" }}>
                                  Guitars ({viewUserData.guitars.length}{viewUserData.guitars.length === 10 ? "+" : ""})
                                </div>
                                {viewUserData.guitars.length === 0 ? (
                                  <div style={{ color: T.txt2, fontSize: "12px" }}>No guitars registered</div>
                                ) : (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {viewUserData.guitars.map((g) => (
                                      <span key={g.id} style={{
                                        padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
                                        backgroundColor: `${WARM}18`, color: WARM, fontWeight: 500,
                                        cursor: "pointer",
                                      }} onClick={() => window.open(`/guitar/${g.id}`, "_blank")}>
                                        {g.make} {g.model} {g.year ? `(${g.year})` : ""}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Claims section */}
                              {viewUserData.claims.length > 0 && (
                                <div>
                                  <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "6px" }}>
                                    Recent Claims ({viewUserData.claims.length})
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {viewUserData.claims.map((c) => (
                                      <span key={c.id} style={{
                                        padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
                                        backgroundColor: c.status === "approved" ? "rgba(16,185,129,0.15)" : c.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                                        color: c.status === "approved" ? "#10B981" : c.status === "rejected" ? "#EF4444" : "#EAB308",
                                        fontWeight: 500,
                                      }}>
                                        {c.status} — {formatDate(c.created_at)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {viewUserData.error && (
                                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "8px" }}>Error loading details: {viewUserData.error}</div>
                              )}
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div style={{ padding: "48px" }}>
              <EmptyState message="No users found" icon={Users} />
            </div>
          )}
        </Card>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() =>
            !roleChanging &&
            (setShowRoleModal(false), setPendingRole(""), setSelectedUser(null))
          }
        >
          <div
            style={{
              backgroundColor: T.bgCard,
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
              border: `1px solid ${T.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: T.txt,
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              Change User Role
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{ color: T.txt2, fontSize: "12px", marginBottom: "4px" }}
              >
                User
              </p>
              <p style={{ color: T.txt, fontWeight: 500 }}>
                {selectedUser.email}
              </p>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  color: T.txt2,
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                New Role
              </label>
              <select
                value={pendingRole}
                onChange={(e) => setPendingRole(e.target.value)}
                disabled={roleChanging}
                style={{
                  backgroundColor: T.bgElev,
                  color: T.txt,
                  borderColor: T.border,
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  fontSize: "13px",
                  outline: "none",
                  cursor: roleChanging ? "not-allowed" : "pointer",
                }}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <PrimaryBtn onClick={handleRoleChange} disabled={roleChanging}>
                {roleChanging ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Updating…
                  </span>
                ) : (
                  "Confirm"
                )}
              </PrimaryBtn>
              <SecondaryBtn
                onClick={() => {
                  setShowRoleModal(false);
                  setPendingRole("");
                  setSelectedUser(null);
                }}
                disabled={roleChanging}
              >
                Cancel
              </SecondaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// INSTRUMENT MANAGEMENT
// ─────────────────────────────────────────────────────

// Verification result panel component
const VerificationPanel = ({ result, onClose }) => {
  if (!result) return null;
  const scoreColor =
    result.score >= 0.8 ? "#10B981" : result.score >= 0.5 ? T.warm : "#EF4444";
  const scoreLabel =
    result.score >= 0.8 ? "High" : result.score >= 0.5 ? "Medium" : "Low";

  return (
    <Card style={{ padding: "16px", marginTop: "12px" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `conic-gradient(${scoreColor} ${result.score * 100}%, ${T.border} 0%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: T.bgElev,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                fontWeight: 700,
                color: scoreColor,
              }}
            >
              {Math.round(result.score * 100)}%
            </div>
          </div>
          <div>
            <h3 style={{ color: T.txt }} className="font-semibold text-sm">
              Verification: {result.verified ? "Passed" : "Issues Found"}
            </h3>
            <p style={{ color: scoreColor }} className="text-xs font-medium">
              {scoreLabel} confidence
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ color: T.txtM }}
          className="hover:opacity-75"
        >
          <X size={18} />
        </button>
      </div>

      {/* Individual checks */}
      <div className="space-y-2 mb-4">
        {(result.checks || []).map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2"
            style={{ borderBottom: `1px solid ${T.border}22` }}
          >
            {c.passed ? (
              <CheckCircle
                size={16}
                style={{ color: "#10B981", flexShrink: 0 }}
              />
            ) : (
              <AlertCircle
                size={16}
                style={{ color: "#EF4444", flexShrink: 0 }}
              />
            )}
            <div className="flex-1">
              <p style={{ color: T.txt }} className="text-xs font-semibold">
                {(c.check || "").replace(/_/g, " ")}
              </p>
              <p style={{ color: T.txt2 }} className="text-xs">
                {c.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {result.notes && (
        <div
          style={{ backgroundColor: T.bgCard, borderColor: T.border }}
          className="border rounded-lg p-3 mb-3"
        >
          <p style={{ color: T.txt2 }} className="text-xs leading-relaxed">
            {result.notes}
          </p>
        </div>
      )}

      {/* Suggested corrections */}
      {result.suggestedCorrections &&
        Object.keys(result.suggestedCorrections).length > 0 && (
          <div
            style={{
              backgroundColor: T.warm + "10",
              borderColor: T.warm + "40",
            }}
            className="border rounded-lg p-3"
          >
            <p style={{ color: T.warm }} className="text-xs font-semibold mb-2">
              Suggested Corrections
            </p>
            {Object.entries(result.suggestedCorrections).map(
              ([field, value]) => (
                <p key={field} style={{ color: T.txt2 }} className="text-xs">
                  <span className="font-mono" style={{ color: T.warm }}>
                    {field}
                  </span>
                  : {String(value)}
                </p>
              ),
            )}
          </div>
        )}
    </Card>
  );
};

const InstrumentManagementPage = () => {
  const [guitars, setGuitars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [verifying, setVerifying] = useState(null); // guitar ID being verified
  const [verifyResult, setVerifyResult] = useState(null); // { guitarId, ...result }
  const [viewingGuitar, setViewingGuitar] = useState(null); // guitar ID for detail view
  const [editingGuitar, setEditingGuitar] = useState(null); // guitar ID for inline edit
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminGuitars({ search, moderation_status: stateFilter });
      setGuitars(res.instruments || res.guitars || []);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, stateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Fetch guitar photos (OCC images) for verification
  const getGuitarPhotoUrls = async (guitarId) => {
    const { data } = await supabase
      .from("owner_created_content")
      .select("content_data")
      .eq("ie_id", guitarId)
      .eq("content_type", "image")
      .eq("visible_publicly", true)
      .order("position", { ascending: true })
      .limit(5);
    return (data || []).map((d) => d.content_data?.url).filter(Boolean);
  };

  const handleVerify = async (guitar) => {
    setVerifying(guitar.id);
    setVerifyResult(null);
    try {
      const photoUrls = await getGuitarPhotoUrls(guitar.id);

      // Use fetch directly to avoid Supabase JS client adding apikey header
      // which can fail CORS preflight on some Edge Function configurations
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/verify-guitar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            guitarId: guitar.id,
            brand: guitar.make,
            model: guitar.model,
            year: guitar.year,
            serialNumber: guitar.serial_number,
            bodyStyle: guitar.body_style,
            finish: guitar.finish,
            specifications: guitar.specifications,
            photoUrls,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Edge Function returned ${response.status}`);
      }
      const data = await response.json();
      if (data?.error) throw new Error(data.error);

      setVerifyResult({ guitarId: guitar.id, ...data });
    } catch (e) {
      setVerifyResult({
        guitarId: guitar.id,
        verified: false,
        score: 0,
        checks: [],
        notes: `Verification unavailable: ${e.message}. Make sure the verify-guitar Edge Function is deployed and ANTHROPIC_API_KEY is set.`,
        suggestedCorrections: {},
      });
    } finally {
      setVerifying(null);
    }
  };

  const handleView = (guitar) => {
    setEditingGuitar(null);
    setViewingGuitar(viewingGuitar === guitar.id ? null : guitar.id);
  };

  const handleEdit = (guitar) => {
    setViewingGuitar(null);
    if (editingGuitar === guitar.id) {
      setEditingGuitar(null);
      return;
    }
    setEditingGuitar(guitar.id);
    setEditForm({
      make: guitar.make || "",
      model: guitar.model || "",
      year: guitar.year || "",
      serial_number: guitar.serial_number || "",
      body_style: guitar.body_style || "",
      finish: guitar.finish || "",
      state: guitar.state || "draft",
    });
  };

  const handleEditSave = async (guitarId) => {
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from("instrument_entities")
        .update({
          make: editForm.make,
          model: editForm.model,
          year: editForm.year ? parseInt(editForm.year) : null,
          serial_number: editForm.serial_number || null,
          body_style: editForm.body_style || null,
          finish: editForm.finish || null,
          state: editForm.state,
          updated_at: new Date().toISOString(),
        })
        .eq("id", guitarId);
      if (err) throw err;
      setEditingGuitar(null);
      load();
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStateChange = async (guitarId, newState) => {
    try {
      await updateGuitarState(guitarId, newState);
      load();
    } catch (e) {
      alert("State update failed: " + e.message);
    }
  };

  const handleDelete = async (guitar) => {
    if (!window.confirm(`Delete "${guitar.make} ${guitar.model}"? This cannot be undone.`)) return;
    try {
      await adminDeleteGuitar(guitar.id);
      load();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instrument Entity Management"
        subtitle={`${total} instruments in database`}
      />

      <div className="flex gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by make, model, serial…"
        />
        <FilterSelect
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="">All States</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="pending_transfer">Pending Transfer</option>
        </FilterSelect>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : guitars.length === 0 ? (
        <EmptyState message="No instruments found" icon={Guitar} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <TH>Make / Model</TH>
                  <TH>Serial</TH>
                  <TH>Year</TH>
                  <TH>Owner</TH>
                  <TH>State</TH>
                  <TH>Added</TH>
                  <TH style={{ textAlign: "right" }}>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {guitars.map((g) => (
                  <React.Fragment key={g.id}>
                    <TR>
                      <TD>
                        {g.make} {g.model}
                      </TD>
                      <TD mono>{g.serial_number || "—"}</TD>
                      <TD>{g.year || "—"}</TD>
                      <TD>{g.owner?.display_name || g.owner?.email || "—"}</TD>
                      <TD>
                        <StatusBadge status={g.state} />
                      </TD>
                      <TD>{formatDate(g.created_at)}</TD>
                      <TD style={{ textAlign: "right" }}>
                        <div className="flex justify-end gap-2 items-center">
                          <ActionBtn
                            onClick={() => handleVerify(g)}
                            disabled={verifying === g.id}
                            color="#10B981"
                            icon={verifying === g.id ? Loader2 : Shield}
                            label={
                              verifying === g.id ? "Verifying..." : "Verify"
                            }
                          />
                          <ActionBtn
                            onClick={() => handleView(g)}
                            color={viewingGuitar === g.id ? "#3B82F6" : WARM}
                            icon={Eye}
                            label={viewingGuitar === g.id ? "Close" : "View"}
                          />
                          <ActionBtn
                            onClick={() => handleEdit(g)}
                            color={editingGuitar === g.id ? "#3B82F6" : T.txt2}
                            icon={Edit}
                            label={editingGuitar === g.id ? "Cancel" : "Edit"}
                          />
                          <ActionBtn
                            onClick={() => handleDelete(g)}
                            color="#EF4444"
                            icon={Trash2}
                            label="Delete"
                          />
                        </div>
                      </TD>
                    </TR>
                    {/* Verification result panel — shown inline below the row */}
                    {verifyResult && verifyResult.guitarId === g.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: "12px 16px" }}>
                          <VerificationPanel
                            result={verifyResult}
                            onClose={() => setVerifyResult(null)}
                          />
                        </td>
                      </tr>
                    )}
                    {/* View detail panel */}
                    {viewingGuitar === g.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: "0" }}>
                          <div style={{
                            backgroundColor: T.bgElev,
                            borderTop: `2px solid ${WARM}`,
                            padding: "20px 24px",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                              <span style={{ color: WARM, fontWeight: 600, fontSize: "14px" }}>Instrument Details</span>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => window.open(`/guitar/${g.id}`, "_blank")} style={{
                                  padding: "4px 12px", borderRadius: "6px", border: `1px solid ${T.border}`,
                                  backgroundColor: "transparent", color: T.txt, fontSize: "12px", cursor: "pointer",
                                }}>Open Public Page ↗</button>
                                <button onClick={() => setViewingGuitar(null)} style={{
                                  padding: "4px 10px", borderRadius: "6px", border: "none",
                                  backgroundColor: "rgba(255,255,255,0.05)", color: T.txt2, fontSize: "12px", cursor: "pointer",
                                }}>✕</button>
                              </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                              {[
                                ["Make", g.make],
                                ["Model", g.model],
                                ["Year", g.year || "—"],
                                ["Serial Number", g.serial_number || "—"],
                                ["Body Style", g.body_style || "—"],
                                ["Finish", g.finish || "—"],
                                ["State", g.state],
                                ["Owner", g.owner?.display_name || g.owner?.email || "—"],
                                ["Created", formatDate(g.created_at)],
                                ["Updated", formatDate(g.updated_at)],
                                ["Country of Origin", g.country_of_origin || "—"],
                                ["ID", g.id],
                              ].map(([label, value]) => (
                                <div key={label}>
                                  <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "2px" }}>{label}</div>
                                  <div style={{ fontSize: "13px", color: T.txt, wordBreak: "break-all" }}>{value}</div>
                                </div>
                              ))}
                            </div>
                            {g.specifications && Object.keys(g.specifications).length > 0 && (
                              <div style={{ marginTop: "16px" }}>
                                <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "6px" }}>Specifications</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                                  {Object.entries(g.specifications).map(([k, v]) => (
                                    <div key={k} style={{ fontSize: "12px" }}>
                                      <span style={{ color: T.txt2 }}>{k}: </span>
                                      <span style={{ color: T.txt }}>{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Edit inline panel */}
                    {editingGuitar === g.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: "0" }}>
                          <div style={{
                            backgroundColor: T.bgElev,
                            borderTop: "2px solid #3B82F6",
                            padding: "20px 24px",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                              <span style={{ color: "#3B82F6", fontWeight: 600, fontSize: "14px" }}>Edit Instrument</span>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleEditSave(g.id)} disabled={saving} style={{
                                  padding: "5px 16px", borderRadius: "6px", border: "none",
                                  backgroundColor: "#10B981", color: "#fff", fontSize: "12px", fontWeight: 600,
                                  cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1,
                                }}>{saving ? "Saving..." : "Save Changes"}</button>
                                <button onClick={() => setEditingGuitar(null)} style={{
                                  padding: "5px 12px", borderRadius: "6px", border: `1px solid ${T.border}`,
                                  backgroundColor: "transparent", color: T.txt2, fontSize: "12px", cursor: "pointer",
                                }}>Cancel</button>
                              </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                              {[
                                ["Make", "make", "text"],
                                ["Model", "model", "text"],
                                ["Year", "year", "number"],
                                ["Serial Number", "serial_number", "text"],
                                ["Body Style", "body_style", "text"],
                                ["Finish", "finish", "text"],
                              ].map(([label, field, type]) => (
                                <div key={field}>
                                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "4px", display: "block" }}>{label}</label>
                                  <input
                                    type={type}
                                    value={editForm[field] || ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                                    style={{
                                      width: "100%", padding: "6px 10px", borderRadius: "6px",
                                      border: `1px solid ${T.border}`, backgroundColor: T.bgCard,
                                      color: T.txt, fontSize: "13px", outline: "none",
                                    }}
                                  />
                                </div>
                              ))}
                              <div>
                                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.txtM, marginBottom: "4px", display: "block" }}>State</label>
                                <select
                                  value={editForm.state || "draft"}
                                  onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                                  style={{
                                    width: "100%", padding: "6px 10px", borderRadius: "6px",
                                    border: `1px solid ${T.border}`, backgroundColor: T.bgCard,
                                    color: T.txt, fontSize: "13px", outline: "none",
                                  }}
                                >
                                  <option value="draft">Draft</option>
                                  <option value="published">Published</option>
                                  <option value="archived">Archived</option>
                                  <option value="pending_transfer">Pending Transfer</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// TRANSFER MANAGEMENT
// ─────────────────────────────────────────────────────

const TransferManagementPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminTransfers({
        status: statusFilter,
        transferType: typeFilter,
      });
      setTransfers(res.transfers);
      setTotal(res.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTransferStatus(id, newStatus);
      load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Transfer Management" subtitle={`${total} transfers`} />

      <div className="flex gap-3">
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
          <option value="declined">Declined</option>
        </FilterSelect>
        <FilterSelect
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="to_member">To Member</option>
          <option value="outside_twng">Outside TWNG</option>
          <option value="delete">Delete</option>
        </FilterSelect>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : transfers.length === 0 ? (
        <EmptyState message="No transfers found" icon={ArrowLeftRight} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <TH>Type</TH>
                  <TH>From → To</TH>
                  <TH>Instrument</TH>
                  <TH>Status</TH>
                  <TH>Date</TH>
                  <TH style={{ textAlign: "right" }}>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <TR key={t.id}>
                    <TD>
                      <span
                        style={{
                          backgroundColor: WARM,
                          color: "#FFFFFF",
                          padding: "2px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {t.transfer_type?.replace("_", " ")}
                      </span>
                    </TD>
                    <TD>
                      {t.from_user?.display_name || t.from_user?.email || "?"} →{" "}
                      {t.to_user?.display_name ||
                        t.to_user?.email ||
                        "External"}
                    </TD>
                    <TD>
                      {t.guitar
                        ? `${t.guitar.make} ${t.guitar.model}`
                        : t.ie_id?.slice(0, 8)}
                    </TD>
                    <TD>
                      <StatusBadge status={t.status} />
                    </TD>
                    <TD>{formatDate(t.created_at)}</TD>
                    <TD style={{ textAlign: "right" }}>
                      {t.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <ActionBtn
                            onClick={() =>
                              handleStatusChange(t.id, "completed")
                            }
                            color="#10B981"
                            icon={Check}
                            label="Approve"
                          />
                          <ActionBtn
                            onClick={() =>
                              handleStatusChange(t.id, "cancelled")
                            }
                            color="#EF4444"
                            icon={X}
                            label="Reject"
                          />
                        </div>
                      )}
                    </TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// CONTENT MODERATION
// ─────────────────────────────────────────────────────

const ContentModerationPage = () => {
  const [activeTab, setActiveTab] = useState("articles");
  const [articles, setArticles] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [artRes, discRes] = await Promise.all([
        getAdminArticles(),
        getAdminDiscussions(),
      ]);
      setArticles(artRes.articles);
      setDiscussions(discRes.posts);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleArticleStatus = async (id, status) => {
    try {
      await updateArticleStatus(id, status);
      load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleToggleHidden = async (id, hidden) => {
    try {
      await toggleDiscussionHidden(id, hidden, "Admin moderation");
      load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const tabs = [
    { id: "articles", label: `Articles (${articles.length})` },
    { id: "discussions", label: `Discussions (${discussions.length})` },
  ];

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ color: T.txt }} className="text-3xl font-bold mb-2">
            Content Moderation
          </h1>
          <p style={{ color: T.txt2 }} className="text-sm">
            Review and moderate user-generated content
          </p>
        </div>
        <button
          onClick={() => window.open("/admin/articles/new", "_blank")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "8px", border: "none",
            backgroundColor: WARM, color: "#fff", fontSize: "13px",
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}
          className="hover:opacity-90"
        >
          <Plus size={16} /> Write Article
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? 600 : 500,
              backgroundColor:
                activeTab === tab.id ? "rgba(217,119,6,0.15)" : "transparent",
              color: activeTab === tab.id ? "#D97706" : T.txt2,
              transition: "all 0.15s ease",
            }}
            className="hover:opacity-75"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : (
        <>
          {activeTab === "articles" &&
            (articles.length === 0 ? (
              <EmptyState message="No articles yet" icon={FileText} />
            ) : (
              <div
                style={{ backgroundColor: T.bgCard, borderColor: T.border }}
                className="border rounded-lg overflow-hidden"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: T.bgElev,
                        borderColor: T.border,
                      }}
                      className="border-b"
                    >
                      <th
                        style={{ color: T.txt }}
                        className="px-6 py-3 text-left font-semibold"
                      >
                        Title
                      </th>
                      <th
                        style={{ color: T.txt }}
                        className="px-6 py-3 text-left font-semibold"
                      >
                        Author
                      </th>
                      <th
                        style={{ color: T.txt }}
                        className="px-6 py-3 text-left font-semibold"
                      >
                        Status
                      </th>
                      <th
                        style={{ color: T.txt }}
                        className="px-6 py-3 text-left font-semibold"
                      >
                        Date
                      </th>
                      <th
                        style={{ color: T.txt }}
                        className="px-6 py-3 text-right font-semibold"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr
                        key={a.id}
                        style={{ borderColor: T.border }}
                        className="border-b hover:opacity-75"
                      >
                        <td style={{ color: T.txt }} className="px-6 py-3">
                          {a.title}
                        </td>
                        <td
                          style={{ color: T.txt2 }}
                          className="px-6 py-3 text-sm"
                        >
                          {a.author?.display_name || a.author?.email || "—"}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={a.status} />
                        </td>
                        <td
                          style={{ color: T.txt2 }}
                          className="px-6 py-3 text-sm"
                        >
                          {formatDate(a.published_at || a.created_at)}
                        </td>
                        <td className="px-6 py-3 text-right flex justify-end gap-2">
                          {a.status === "draft" && (
                            <button
                              onClick={() =>
                                handleArticleStatus(a.id, "published")
                              }
                              style={{ color: "#10B981" }}
                              className="hover:opacity-75 text-xs"
                            >
                              Publish
                            </button>
                          )}
                          {a.status === "published" && (
                            <button
                              onClick={() =>
                                handleArticleStatus(a.id, "archived")
                              }
                              style={{ color: T.txt2 }}
                              className="hover:opacity-75 text-xs"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/admin/articles/edit/${a.id}`, "_blank")}
                            style={{ color: WARM }}
                            className="hover:opacity-75 text-xs font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

          {activeTab === "discussions" &&
            (discussions.length === 0 ? (
              <EmptyState message="No discussion posts yet" icon={FileText} />
            ) : (
              <div className="space-y-3">
                {discussions.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      backgroundColor: T.bgCard,
                      borderColor: d.is_hidden ? "#EF4444" : T.border,
                    }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span
                          style={{ color: T.txt }}
                          className="font-medium text-sm"
                        >
                          {d.title || "Reply"}
                        </span>
                        <span
                          style={{ color: T.txt2 }}
                          className="text-xs ml-2"
                        >
                          by{" "}
                          {d.author?.display_name ||
                            d.author?.email ||
                            "Unknown"}
                        </span>
                      </div>
                      {d.is_hidden && (
                        <span
                          style={{ backgroundColor: "#EF4444", color: "#fff" }}
                          className="px-2 py-1 rounded text-xs"
                        >
                          Hidden
                        </span>
                      )}
                    </div>
                    <p
                      style={{ color: T.txt2 }}
                      className="text-sm mb-3 line-clamp-2"
                    >
                      {d.content}
                    </p>
                    <div className="flex gap-3 items-center">
                      <span style={{ color: T.txtM }} className="text-xs">
                        {timeAgo(d.created_at)}
                      </span>
                      <span style={{ color: T.txtM }} className="text-xs">
                        {d.reply_count || 0} replies
                      </span>
                      <button
                        onClick={() => handleToggleHidden(d.id, !d.is_hidden)}
                        style={{ color: d.is_hidden ? "#10B981" : "#EF4444" }}
                        className="text-xs font-medium hover:opacity-75 ml-auto"
                      >
                        {d.is_hidden ? "Unhide" : "Hide"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// LUTHIER MANAGEMENT
// ─────────────────────────────────────────────────────

const LuthierManagementPage = () => {
  const { user } = useAuth();
  const [luthiers, setLuthiers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminLuthiers();
      setLuthiers(res.luthiers);
      setTotal(res.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = async (userId) => {
    try {
      await verifyLuthier(userId, user?.id);
      load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const pendingCount = luthiers.filter((l) => !l.is_verified_luthier).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: T.txt }} className="text-3xl font-bold mb-2">
          Luthier Management
        </h1>
        <p style={{ color: T.txt2 }} className="text-sm">
          {total} luthier profiles, {pendingCount} pending verification
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : luthiers.length === 0 ? (
        <EmptyState
          message="No luthier profiles registered yet"
          icon={Shield}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <TH>Business Name</TH>
                  <TH>Owner</TH>
                  <TH>Specializations</TH>
                  <TH>Status</TH>
                  <TH>Verified At</TH>
                  <TH style={{ textAlign: "right" }}>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {luthiers.map((l) => (
                  <TR key={l.user_id}>
                    <TD>{l.business_name || "—"}</TD>
                    <TD>{l.user?.display_name || l.user?.email || "—"}</TD>
                    <TD>{l.specializations?.join(", ") || "—"}</TD>
                    <TD>
                      <StatusBadge
                        status={l.is_verified_luthier ? "active" : "pending"}
                      />
                    </TD>
                    <TD>{l.verified_at ? formatDate(l.verified_at) : "—"}</TD>
                    <TD style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-2">
                        {!l.is_verified_luthier && (
                          <ActionBtn
                            onClick={() => handleVerify(l.user_id)}
                            color="#10B981"
                            icon={Check}
                            label="Verify"
                          />
                        )}
                        <ActionBtn
                          onClick={() => {}}
                          color={WARM}
                          icon={Eye}
                          label="View"
                        />
                      </div>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// PRIVACY CONTROLS
// ─────────────────────────────────────────────────────

const PrivacyControlsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPrivacyRequests({ status: statusFilter });
      setRequests(res.requests);
      setTotal(res.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdate = async (id, status) => {
    try {
      await updatePrivacyRequest(id, status, user?.id);
      load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const typeColors = {
    data_export: "#3B82F6",
    erasure: "#EF4444",
    anonymization: "#F59E0B",
    restriction: "#8B5CF6",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: T.txt }} className="text-3xl font-bold mb-2">
          Privacy Controls
        </h1>
        <p style={{ color: T.txt2 }} className="text-sm">
          {total} privacy requests
        </p>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: T.bgElev,
            color: T.txt,
            border: "1px solid " + T.border,
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "13px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState message="No privacy requests" icon={Shield} />
      ) : (
        <div
          style={{ backgroundColor: T.bgCard, borderColor: T.border }}
          className="border rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{ backgroundColor: T.bgElev, borderColor: T.border }}
                  className="border-b"
                >
                  <th
                    style={{ color: T.txt }}
                    className="px-6 py-3 text-left font-semibold"
                  >
                    Type
                  </th>
                  <th
                    style={{ color: T.txt }}
                    className="px-6 py-3 text-left font-semibold"
                  >
                    User
                  </th>
                  <th
                    style={{ color: T.txt }}
                    className="px-6 py-3 text-left font-semibold"
                  >
                    Status
                  </th>
                  <th
                    style={{ color: T.txt }}
                    className="px-6 py-3 text-left font-semibold"
                  >
                    Date
                  </th>
                  <th
                    style={{ color: T.txt }}
                    className="px-6 py-3 text-right font-semibold"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderColor: T.border }}
                    className="border-b hover:opacity-75"
                  >
                    <td className="px-6 py-3">
                      <span
                        style={{
                          backgroundColor: typeColors[r.request_type] || T.warm,
                          color: "#fff",
                        }}
                        className="px-2 py-1 rounded text-xs font-medium"
                      >
                        {r.request_type?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ color: T.txt2 }} className="px-6 py-3 text-sm">
                      {r.user?.display_name || r.user?.email || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ color: T.txt2 }} className="px-6 py-3 text-sm">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdate(r.id, "processing")}
                            style={{ color: "#3B82F6" }}
                            className="text-xs font-medium hover:opacity-75"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => handleUpdate(r.id, "denied")}
                            style={{ color: "#EF4444" }}
                            className="text-xs font-medium hover:opacity-75"
                          >
                            Deny
                          </button>
                        </>
                      )}
                      {r.status === "processing" && (
                        <button
                          onClick={() => handleUpdate(r.id, "completed")}
                          style={{ color: "#10B981" }}
                          className="text-xs font-medium hover:opacity-75"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SYSTEM CONFIGURATION
// ─────────────────────────────────────────────────────

const ConfigurationPage = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await getSystemConfig();
      setConfig(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getVal = (key, fallback = "") => {
    const v = config[key]?.value;
    if (v === null || v === undefined) return fallback;
    if (typeof v === "object") return v;
    return v;
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      await updateSystemConfig(key, value, user?.id);
      setConfig((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
    } catch (e) {
      alert("Save failed: " + e.message);
    }
    setSaving(false);
  };

  const configItems = [
    {
      key: "transfer_acceptance_days",
      label: "Transfer Acceptance Period (days)",
      type: "number",
      fallback: 7,
    },
    {
      key: "external_transfer_cancel_days",
      label: "External Transfer Cancel Period (days)",
      type: "number",
      fallback: 3,
    },
    {
      key: "transfer_reminder_days",
      label: "Transfer Reminder (days before)",
      type: "number",
      fallback: 2,
    },
    {
      key: "ia_grace_period_days",
      label: "IA Grace Period (days)",
      type: "number",
      fallback: 7,
    },
  ];

  const toggleItems = [
    {
      key: "enable_external_transfers",
      label: "External Transfers",
      desc: "Allow transfers outside the platform",
    },
    {
      key: "enable_ie_claims",
      label: "Claims System",
      desc: "Enable guitar ownership claims",
    },
    {
      key: "ia_require_warning",
      label: "IA Edit Warning",
      desc: "Require confirmation for IA changes",
    },
    {
      key: "enable_luthier_verification",
      label: "Luthier Verification",
      desc: "Require luthier profile verification",
    },
    {
      key: "enable_duplicate_detection",
      label: "Duplicate Detection",
      desc: "Automatic duplicate detection",
    },
    {
      key: "enable_do_not_show_global",
      label: "Do Not Show (Global)",
      desc: "Allow users to hide all their OCC globally",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration"
        subtitle="Configure platform behavior — persisted in system_config table"
      >
        {saving && (
          <span
            style={{ color: WARM }}
            className="text-sm flex items-center gap-2"
          >
            <Loader2 size={14} className="animate-spin" /> Saving…
          </span>
        )}
      </PageHeader>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div>
            <h2 style={{ color: T.txt }} className="text-lg font-semibold mb-4">
              Transfer & IE Settings
            </h2>
            <div
              style={{ backgroundColor: T.bgCard, borderColor: T.border }}
              className="border rounded-lg p-4 space-y-4"
            >
              {configItems.map((item) => (
                <div key={item.key}>
                  <label
                    style={{ color: T.txt }}
                    className="text-sm font-medium block mb-2"
                  >
                    {item.label}
                  </label>
                  <input
                    type="number"
                    value={getVal(item.key, item.fallback)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || item.fallback;
                      setConfig((prev) => ({
                        ...prev,
                        [item.key]: { ...prev[item.key], value: val },
                      }));
                    }}
                    onBlur={(e) =>
                      handleSave(
                        item.key,
                        parseInt(e.target.value) || item.fallback,
                      )
                    }
                    style={{
                      backgroundColor: T.bgElev,
                      color: T.txt,
                      borderColor: T.border,
                    }}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ color: T.txt }} className="text-lg font-semibold mb-4">
              Feature Toggles
            </h2>
            <div
              style={{
                backgroundColor: T.bgCard,
                borderColor: T.border,
                "--tw-divide-color": T.border,
              }}
              className="border rounded-lg divide-y"
            >
              {toggleItems.map((item) => {
                const enabled = !!getVal(item.key, false);
                return (
                  <div
                    key={item.key}
                    className="p-4 flex items-center justify-between"
                    style={{ borderColor: T.border }}
                  >
                    <div className="flex-1">
                      <p
                        style={{ color: T.txt }}
                        className="font-medium text-sm"
                      >
                        {item.label}
                      </p>
                      <p style={{ color: T.txt2 }} className="text-xs mt-1">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSave(item.key, !enabled)}
                      className="ml-4"
                    >
                      {enabled ? (
                        <ToggleRight size={24} style={{ color: T.warm }} />
                      ) : (
                        <ToggleLeft size={24} style={{ color: T.txtM }} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 style={{ color: T.txt }} className="text-lg font-semibold mb-4">
              Privacy Defaults
            </h2>
            <div
              style={{ backgroundColor: T.bgCard, borderColor: T.border }}
              className="border rounded-lg p-4 space-y-3"
            >
              <div
                className="flex items-center justify-between pb-3 border-b"
                style={{ borderColor: T.border }}
              >
                <label style={{ color: T.txt }} className="text-sm">
                  Default IE Visibility
                </label>
                <select
                  value={getVal("default_ie_visibility", "public")}
                  onChange={(e) =>
                    handleSave("default_ie_visibility", e.target.value)
                  }
                  style={{
                    backgroundColor: T.bgElev,
                    color: T.txt,
                    borderColor: T.border,
                  }}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div
                className="flex items-center justify-between pb-3 border-b"
                style={{ borderColor: T.border }}
              >
                <label style={{ color: T.txt }} className="text-sm">
                  Default OCC Public
                </label>
                <button
                  onClick={() =>
                    handleSave(
                      "default_occ_public",
                      !getVal("default_occ_public", true),
                    )
                  }
                >
                  {getVal("default_occ_public", true) ? (
                    <ToggleRight size={24} style={{ color: T.warm }} />
                  ) : (
                    <ToggleLeft size={24} style={{ color: T.txtM }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────────────

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditLogs({ category, search });
      setLogs(res.logs);
      setTotal(res.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle={`${total} log entries`} />

      <div className="flex gap-3 flex-wrap">
        <FilterSelect
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="user">User</option>
          <option value="ie">Instrument</option>
          <option value="occ">OCC</option>
          <option value="transfer">Transfer</option>
          <option value="privacy">Privacy</option>
          <option value="admin">Admin</option>
        </FilterSelect>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions…"
        />
        <button
          onClick={load}
          style={{ color: T.txt2 }}
          className="hover:opacity-75 px-2"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <EmptyState message="No audit log entries" icon={ScrollText} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <TH>Timestamp</TH>
                  <TH>Actor</TH>
                  <TH>Action</TH>
                  <TH>Entity</TH>
                  <TH>Details</TH>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <TR key={log.id}>
                    <TD mono>{formatDateTime(log.created_at)}</TD>
                    <TD>
                      {log.actor_type === "system"
                        ? "System"
                        : log.actor_id?.slice(0, 8) || "—"}
                    </TD>
                    <TD>{log.action}</TD>
                    <TD>
                      {log.entity_type && (
                        <span
                          style={{
                            backgroundColor: T.bgElev,
                            color: T.txt2,
                            padding: "2px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {log.entity_type}
                        </span>
                      )}
                    </TD>
                    <TD>
                      {log.details
                        ? JSON.stringify(log.details).slice(0, 80)
                        : "—"}
                    </TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// CLAIMS MANAGEMENT
// ─────────────────────────────────────────────────────

const ClaimsManagementPage = () => {
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const { profile } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === "all" ? null : filter;
      const claimsData = await getAdminClaims({ status, perPage: 50 });
      const statsData = await getClaimStats();
      setClaims(claimsData.data || []);
      setStats(statsData);
    } catch (e) {
      console.error("Error loading claims:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApproveClaim = async (claimId) => {
    setActionLoading(claimId);
    try {
      const { success, error: err } = await approveClaim(claimId, profile.id);
      if (!success) throw err || new Error("Approval failed");
      await load();
    } catch (e) {
      console.error("Error approving claim:", e);
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setActionLoading(claimId);
    try {
      const { success, error: err } = await rejectClaim(
        claimId,
        profile.id,
        rejectionReason,
      );
      if (!success) throw err || new Error("Rejection failed");
      setRejectingId(null);
      setRejectionReason("");
      await load();
    } catch (e) {
      console.error("Error rejecting claim:", e);
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getVerificationTypeLabel = (type) => {
    const map = {
      instagram_match: "Instagram Match",
      serial_photo: "Serial Photo",
      receipt: "Receipt",
      luthier_vouch: "Luthier Vouch",
      other: "Other Evidence",
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims Management"
        subtitle="Review and manage guitar ownership claims"
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Claims"
            value={stats.total}
            icon={Flag}
            loading={false}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            loading={false}
          />
          <StatCard
            label="Under Review"
            value={stats.under_review}
            icon={Activity}
            loading={false}
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle}
            loading={false}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={X}
            loading={false}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "pending",
          "under_review",
          "approved",
          "rejected",
          "withdrawn",
        ].map((status) => (
          <FilterPill
            key={status}
            active={filter === status}
            onClick={() => {
              setFilter(status);
              setExpandedId(null);
            }}
          >
            {status === "all"
              ? "All"
              : status
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
          </FilterPill>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Claims Table */}
      {loading ? (
        <Spinner />
      ) : claims.length === 0 ? (
        <EmptyState message="No claims found" icon={Flag} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <TR>
                  <TH>Guitar</TH>
                  <TH>Claimer</TH>
                  <TH>Verification</TH>
                  <TH>Status</TH>
                  <TH>Date</TH>
                  <TH>Actions</TH>
                </TR>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <React.Fragment key={claim.id}>
                    <TR
                      onClick={() =>
                        setExpandedId(expandedId === claim.id ? null : claim.id)
                      }
                    >
                      <TD>
                        {claim.guitar?.make} {claim.guitar?.model}{" "}
                        {claim.guitar?.year && `(${claim.guitar.year})`}
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: WARM,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#FFFFFF",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(
                              claim.claimer?.display_name,
                              claim.claimer?.email,
                            )}
                          </div>
                          <span>{claim.claimer?.username || "Unknown"}</span>
                        </div>
                      </TD>
                      <TD style={{ fontSize: "12px" }}>
                        <StatusBadge
                          status={
                            claim.verification_type?.replace(/_/g, " ") ||
                            "Unknown"
                          }
                        />
                      </TD>
                      <TD>
                        <StatusBadge status={claim.status} />
                      </TD>
                      <TD style={{ fontSize: "12px" }}>
                        {timeAgo(claim.created_at)}
                      </TD>
                      <TD>
                        {claim.status === "pending" && (
                          <div className="flex gap-2">
                            <ActionBtn
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveClaim(claim.id);
                              }}
                              disabled={actionLoading === claim.id}
                              color="#10B981"
                              icon={Check}
                              label={
                                actionLoading === claim.id
                                  ? "Approving..."
                                  : "Approve"
                              }
                            />
                            <ActionBtn
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectingId(claim.id);
                              }}
                              color="#EF4444"
                              icon={X}
                              label="Reject"
                            />
                          </div>
                        )}
                      </TD>
                    </TR>

                    {/* Expanded Row */}
                    {expandedId === claim.id && (
                      <TR>
                        <TD colSpan="6" style={{ padding: "20px" }}>
                          <Card style={{ padding: "16px" }}>
                            <div className="space-y-4">
                              <div>
                                <p
                                  style={{
                                    color: T.txt2,
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    marginBottom: "6px",
                                  }}
                                >
                                  Claim Reason
                                </p>
                                <p style={{ color: T.txt, fontSize: "14px" }}>
                                  {claim.claim_reason || "—"}
                                </p>
                              </div>

                              <div>
                                <p
                                  style={{
                                    color: T.txt2,
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    marginBottom: "6px",
                                  }}
                                >
                                  Verification Data
                                </p>
                                <div
                                  style={{
                                    backgroundColor: T.bgDeep,
                                    padding: "10px",
                                    borderRadius: "8px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: "12px",
                                    color: T.txt2,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {JSON.stringify(
                                    claim.verification_data,
                                    null,
                                    2,
                                  )}
                                </div>
                              </div>

                              {claim.status === "rejected" &&
                                claim.rejection_reason && (
                                  <div>
                                    <p
                                      style={{
                                        color: T.txt2,
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      Rejection Reason
                                    </p>
                                    <p
                                      style={{
                                        color: "#EF4444",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {claim.rejection_reason}
                                    </p>
                                  </div>
                                )}

                              {rejectingId === claim.id && (
                                <div>
                                  <FormInput
                                    label="Rejection Reason"
                                    value={rejectionReason}
                                    onChange={(e) =>
                                      setRejectionReason(e.target.value)
                                    }
                                  />
                                  <textarea
                                    value={rejectionReason}
                                    onChange={(e) =>
                                      setRejectionReason(e.target.value)
                                    }
                                    placeholder="Why are you rejecting this claim?"
                                    style={{
                                      backgroundColor: T.bgElev,
                                      color: T.txt,
                                      borderColor: T.border,
                                      border: `1px solid ${T.border}`,
                                      borderRadius: "8px",
                                      padding: "10px 12px",
                                      fontSize: "14px",
                                      width: "100%",
                                      minHeight: "80px",
                                      outline: "none",
                                      fontFamily: "inherit",
                                      resize: "vertical",
                                    }}
                                  />
                                  <div className="flex gap-2 mt-3">
                                    <ActionBtn
                                      onClick={() =>
                                        handleRejectClaim(claim.id)
                                      }
                                      disabled={actionLoading === claim.id}
                                      color="#EF4444"
                                      icon={X}
                                      label={
                                        actionLoading === claim.id
                                          ? "Rejecting..."
                                          : "Confirm Rejection"
                                      }
                                    />
                                    <SecondaryBtn
                                      onClick={() => {
                                        setRejectingId(null);
                                        setRejectionReason("");
                                      }}
                                    >
                                      Cancel
                                    </SecondaryBtn>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        </TD>
                      </TR>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// CHANGE REQUESTS
// ─────────────────────────────────────────────────────

const ChangeRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingChangeRequests();
      setRequests(data || []);
    } catch (e) {
      console.error("Error loading change requests:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    try {
      await approveChangeRequest(requestId);
      await load();
    } catch (e) {
      console.error("Error approving request:", e);
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (requestId) => {
    setActionLoading(requestId);
    try {
      await denyChangeRequest(requestId);
      await load();
    } catch (e) {
      console.error("Error denying request:", e);
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Requests"
        subtitle="Review and manage specification change requests"
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState message="No pending change requests" icon={FileText} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <TR>
                  <TH>Guitar</TH>
                  <TH>Field</TH>
                  <TH>Current Value</TH>
                  <TH>Requested Value</TH>
                  <TH>Submitted By</TH>
                  <TH>Date</TH>
                  <TH>Actions</TH>
                </TR>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <TR key={request.id}>
                    <TD>
                      {request.guitar?.make} {request.guitar?.model}
                      {request.guitar?.year && ` (${request.guitar.year})`}
                    </TD>
                    <TD style={{ fontSize: "12px" }}>
                      <span
                        style={{
                          backgroundColor: "#8B5CF612",
                          color: "#8B5CF6",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontWeight: 500,
                        }}
                      >
                        {request.field_name}
                      </span>
                    </TD>
                    <TD style={{ fontSize: "12px", color: T.txt2 }}>
                      {request.old_value || "—"}
                    </TD>
                    <TD style={{ fontSize: "12px", fontWeight: 500 }}>
                      {request.new_value || "—"}
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: WARM,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(
                            request.requester?.display_name,
                            request.requester?.username,
                          )}
                        </div>
                        <span>{request.requester?.display_name || request.requester?.username || "Unknown"}</span>
                      </div>
                    </TD>
                    <TD style={{ fontSize: "12px" }}>
                      {formatDate(request.created_at)}
                    </TD>
                    <TD>
                      <div className="flex gap-2">
                        <ActionBtn
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id}
                          color="#10B981"
                          icon={CheckCircle}
                          label={
                            actionLoading === request.id
                              ? "Approving..."
                              : "Approve"
                          }
                        />
                        <ActionBtn
                          onClick={() => handleDeny(request.id)}
                          disabled={actionLoading === request.id}
                          color="#EF4444"
                          icon={X}
                          label={
                            actionLoading === request.id ? "Denying..." : "Deny"
                          }
                        />
                      </div>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// KPI DASHBOARD
// ─────────────────────────────────────────────────────

const KPIDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [claimStats, setClaimStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashStats, claimData] = await Promise.all([
        getDashboardStats(),
        getClaimStats(),
      ]);
      setStats(dashStats);
      setClaimStats(claimData);
    } catch (e) {
      console.error("Error loading KPI stats:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Dashboard"
        subtitle="Key performance indicators and metrics"
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {/* Top Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          label="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          loading={false}
        />
        <StatCard
          label="Total Guitars"
          value={stats?.totalGuitars}
          icon={Guitar}
          loading={false}
        />
        <StatCard
          label="Active Claims"
          value={claimStats?.pending || 0}
          icon={Flag}
          loading={false}
        />
        <StatCard
          label="Approved Claims"
          value={claimStats?.approved || 0}
          icon={CheckCircle}
          loading={false}
        />
      </div>

      {/* North Star Metric */}
      <Card style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ color: T.txt2, fontSize: "14px", marginBottom: "12px" }}>
          NORTH STAR METRIC
        </p>
        <h2
          style={{
            color: WARM,
            fontSize: "48px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          {Math.floor((stats?.totalGuitars || 0) / 4)}
        </h2>
        <p style={{ color: T.txt2, fontSize: "15px" }}>
          Guitars Documented Per Week (estimated)
        </p>
      </Card>

      {/* Conversion Funnel */}
      <Card style={{ padding: "20px" }}>
        <SectionTitle>Claim Conversion Funnel</SectionTitle>
        <div className="space-y-3" style={{ marginTop: "20px" }}>
          {[
            {
              label: "Total Claims",
              value: claimStats?.total || 0,
              color: "#3B82F6",
            },
            {
              label: "Pending Review",
              value: claimStats?.pending || 0,
              color: "#F59E0B",
            },
            {
              label: "Approved",
              value: claimStats?.approved || 0,
              color: "#10B981",
            },
          ].map((item, idx) => {
            const total = claimStats?.total || 1;
            const percentage =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: T.txt2, fontSize: "14px" }}>
                    {item.label}
                  </span>
                  <span style={{ color: T.txt, fontWeight: 600 }}>
                    {item.value} ({percentage}%)
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: T.bgElev,
                    borderRadius: "8px",
                    height: "8px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: item.color,
                      height: "100%",
                      width: `${percentage}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// MAIN ADMIN COMPONENT
// ─────────────────────────────────────────────────────

export default function TWNGAdmin() {
  const { profile } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { isDark } = useTheme();
  const warmAlways = "#D97706";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: warmAlways,
    },
    { id: "homepage", label: "Homepage", icon: Home, color: "#22C55E" },
    { id: "users", label: "Users", icon: Users, color: "#7C3AED" },
    { id: "instruments", label: "Instruments", icon: Guitar, color: "#EA580C" },
    { id: "claims", label: "Claims", icon: Flag, color: "#EF4444" },
    { id: "requests", label: "Change Requests", icon: FileText, color: "#8B5CF6" },
    {
      id: "transfers",
      label: "Transfers",
      icon: ArrowLeftRight,
      color: "#06B6D4",
    },
    { id: "content", label: "Content", icon: FileText, color: "#0D9488" },
    { id: "extractor", label: "Content Extractor", icon: Search, color: "#F97316" },
    { id: "luthiers", label: "Luthiers", icon: Shield, color: "#DB2777" },
    { id: "config", label: "Configuration", icon: Settings, color: "#64748B" },
    {
      id: "marketing",
      label: "Marketing",
      icon: TrendingUp,
      color: warmAlways,
    },
  ];

  const sidebarBg = isDark ? "#151311" : "#FAFAF8";
  const contentBg = isDark ? T.bgDeep : "#F5F3F0";
  const moduleHoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const moduleActiveBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "homepage":
        return <HomepageManagementPage />;
      case "users":
        return <UserManagementPage />;
      case "instruments":
        return <InstrumentManagementPage />;
      case "claims":
        return <ClaimsManagementPage />;
      case "requests":
        return <ChangeRequestsPage />;
      case "transfers":
        return <TransferManagementPage />;
      case "content":
        return <ContentModerationPage />;
      case "extractor":
        return <ContentExtractor />;
      case "luthiers":
        return <LuthierManagementPage />;
      case "config":
        return <ConfigurationPage />;
      case "marketing":
        return <MarketingConsole />;
      default:
        return <DashboardPage />;
    }
  };

  const displayRole =
    profile?.role
      ?.split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Admin";

  return (
    <div
      style={{ backgroundColor: T.bgDeep, color: T.txt }}
      className="min-h-screen flex"
    >
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
          className="admin-mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${T.border}`,
          width: sidebarOpen ? "230px" : "68px",
          zIndex: 41,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.3s ease",
        }}
        className={`admin-sidebar ${mobileSidebarOpen ? "admin-sidebar-open" : ""}`}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: sidebarOpen ? "20px 16px 12px" : "20px 10px 12px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {sidebarOpen && (
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: warmAlways,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "2px",
                  }}
                >
                  TWNG Admin
                </div>
                <div style={{ fontSize: "11px", color: T.txtM }}>
                  {menuItems.length} modules
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                if (mobileSidebarOpen) setMobileSidebarOpen(false);
              }}
              style={{
                color: T.txt2,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: sidebarOpen ? "10px 12px" : "10px 0",
                  backgroundColor: isActive ? moduleActiveBg : "transparent",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  gap: sidebarOpen ? "10px" : "0",
                  color: isActive ? T.txt : T.txt2,
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.15s ease",
                  marginBottom: "2px",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor = moduleHoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: "3px",
                      backgroundColor: item.color,
                      borderRadius: "0 3px 3px 0",
                    }}
                  />
                )}
                {/* Icon container */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    backgroundColor: isActive
                      ? `${item.color}18`
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon
                    size={15}
                    color={isActive ? item.color : T.txtM}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>
                {sidebarOpen && (
                  <span style={{ flex: 1, textAlign: "left", lineHeight: 1.3 }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer — user info */}
        {sidebarOpen && (
          <div
            style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: warmAlways,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {getInitials(profile?.display_name, profile?.email)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: T.txt,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {profile?.display_name || "Admin"}
                </div>
                <div style={{ fontSize: "10px", color: T.txtM }}>
                  {displayRole}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: isDark
              ? "rgba(28,25,23,0.85)"
              : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${T.border}`,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className="admin-mobile-menu-btn"
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: T.txt2,
                cursor: "pointer",
                padding: "4px",
              }}
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb with active module icon */}
            {(() => {
              const activeItem = menuItems.find((m) => m.id === activePage);
              const ActiveIcon = activeItem?.icon || LayoutDashboard;
              return (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      backgroundColor: `${activeItem?.color || warmAlways}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActiveIcon
                      size={14}
                      color={activeItem?.color || warmAlways}
                      strokeWidth={2}
                    />
                  </div>
                  <span
                    style={{ fontSize: "14px", fontWeight: 600, color: T.txt }}
                  >
                    {activeItem?.label || "Dashboard"}
                  </span>
                </div>
              );
            })()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setActivePage(activePage)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                color: T.txt2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                color: T.txt2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Bell size={16} />
            </button>
          </div>
        </div>

        {/* Page Content — 20px side padding rule */}
        <div
          style={{
            backgroundColor: contentBg,
            flex: 1,
            overflow: "auto",
            padding: "20px",
          }}
        >
          {renderPage()}
        </div>
      </div>

      {/* Admin responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            transform: translateX(-100%) !important;
            width: 260px !important;
          }
          .admin-sidebar.admin-sidebar-open {
            transform: translateX(0) !important;
          }
          .admin-mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
