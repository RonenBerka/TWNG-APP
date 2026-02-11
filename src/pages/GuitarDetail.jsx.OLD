import { useState, useCallback, useEffect } from "react";
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, Share2, Shield, ChevronDown, ChevronUp, Calendar, Clock, Wrench, Star, MessageSquare, Send, X, ZoomIn, ExternalLink, Guitar, Eye, EyeOff, Globe, Users, Hash, User, Loader2, Flag, Edit3, Lock, AlertTriangle, Check, Undo2, Film, Music, FileText, Play, Download } from "lucide-react";
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { useGuitar } from '../hooks/useGuitar';
import { updateGuitar } from '../lib/supabase/guitars';
import { updateOccVisibility } from '../lib/supabase/occ';
import { getTimelineEvents, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from '../lib/supabase/timeline';
import { shouldDisplayOcc, getVisibilityLabel, cycleVisibility } from '../lib/visibility';
import { submitChangeRequest } from '../lib/supabase/iaChangeRequests';
import { getGuitarComments, addComment, toggleCommentLike } from '../lib/supabase/comments';
import { GUITAR_IMAGES } from '../utils/placeholders';

// Badge Component
function Badge({ children, variant = "default" }) {
  const variants = {
    default: {
      backgroundColor: T.bgCard,
      color: T.txt2,
      border: `1px solid ${T.border}`,
    },
    warm: {
      backgroundColor: `${T.warm}20`,
      color: T.warm,
      border: `1px solid ${T.warm}40`,
    },
    success: {
      backgroundColor: "#34D39920",
      color: "#34D399",
      border: "1px solid #34D39940",
    },
  };
  const style = variants[variant] || variants.default;
  return (
    <span
      style={{
        ...style,
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// Visibility Toggle — cycles Public → Owners Only → Private
function VisibilityToggle({ occ, onToggle, disabled }) {
  const label = getVisibilityLabel(occ);
  const iconMap = {
    "Public": { icon: Globe, color: "#34D399" },
    "Owners Only": { icon: Users, color: T.amber },
    "Private": { icon: EyeOff, color: T.txtM },
  };
  const { icon: Icon, color } = iconMap[label] || iconMap["Private"];

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      disabled={disabled}
      title={`Visibility: ${label} — click to cycle`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 150ms",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

// Image Gallery Component — supports per-image visibility toggles
function ImageGallery({ images, imageOccItems, isOwner, onToggleVisibility }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeOcc = imageOccItems?.[activeIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Main Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          backgroundColor: T.bgCard,
          backgroundImage: `url('${images[activeIndex]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "zoom-in",
        }}
        onClick={() => setLightboxOpen(true)}
      >
        {/* Zoom overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 200ms",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          <ZoomIn size={32} color={T.txt} />
        </div>
        {/* Image Counter + Visibility Badge */}
        <div style={{
          position: "absolute", bottom: "16px", right: "16px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          {isOwner && activeOcc && (
            <VisibilityToggle occ={activeOcc} onToggle={() => onToggleVisibility(activeOcc)} />
          )}
          <div style={{
            backgroundColor: `${T.bgDeep}dd`, color: T.txt, borderRadius: "8px",
            padding: "8px 12px", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
          }}>
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            style={{
              flexShrink: 0,
              width: "72px",
              height: "72px",
              backgroundImage: `url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "8px",
              border: activeIndex === idx ? `3px solid ${T.warm}` : `2px solid ${T.border}`,
              opacity: activeIndex === idx ? 1 : 0.6,
              cursor: "pointer",
              transition: "all 200ms",
            }}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.95)",
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              padding: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px",
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} color={T.txt} />
          </button>

          <button
            style={{
              position: "absolute",
              left: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((activeIndex - 1 + images.length) % images.length);
            }}
          >
            <ArrowLeft size={24} color={T.txt} />
          </button>

          <img
            src={images[activeIndex]}
            alt="Lightbox"
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
          />

          <button
            style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "8px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((activeIndex + 1) % images.length);
            }}
          >
            <ArrowRight size={24} color={T.txt} />
          </button>

          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              color: T.txt,
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}

// Guitar Header / Info Sidebar Component
function GuitarHeader({ guitar, loved, onLoveToggle, isOwner, guitarId, guitarState, onTogglePublish, publishing }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Draft Banner — only visible to owner */}
      {isOwner && guitarState === 'draft' && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px",
          borderRadius: "10px", backgroundColor: "#F59E0B12", border: "1px solid #F59E0B30",
        }}>
          <EyeOff size={16} color="#F59E0B" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#F59E0B", margin: 0 }}>
              Draft — Not visible to others
            </p>
            <p style={{ fontSize: "11px", color: T.txtM, margin: "2px 0 0" }}>
              This guitar is only visible to you. Publish it when ready.
            </p>
          </div>
          <button
            onClick={onTogglePublish}
            disabled={publishing}
            style={{
              padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              background: "#F59E0B", border: "1px solid #F59E0B", color: T.bgDeep,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              opacity: publishing ? 0.6 : 1, whiteSpace: "nowrap",
            }}
          >
            {publishing ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Globe size={13} />}
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      )}

      {/* Brand & Year & Body Type Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <Badge variant="default">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {guitar.brand}
          </span>
        </Badge>
        <Badge variant="default">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {guitar.year}
          </span>
        </Badge>
        <Badge variant="default">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {guitar.bodyType}
          </span>
        </Badge>
      </div>

      {/* Model Name & Nickname */}
      <div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 700,
            color: T.txt,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {guitar.model}
        </h1>
        {guitar.nickname && (
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              fontStyle: "italic",
              color: T.amber,
              marginTop: "8px",
            }}
          >
            {guitar.nickname}
          </p>
        )}
      </div>

      {/* Owner Card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: T.bgCard,
          borderRadius: "12px",
          border: `1px solid ${T.border}`,
        }}
      >
        <Link
          to={`/user/${guitar.owner.handle}`}
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "12px" }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: T.warm,
              color: T.bgDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {guitar.owner.avatar}
          </div>
          <div>
            <p style={{ color: T.txt, fontWeight: 600, fontSize: "14px", margin: 0 }}>{guitar.owner.name}</p>
            <p
              style={{
                color: T.txt2,
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
              }}
            >
              @{guitar.owner.handle}
            </p>
          </div>
        </Link>
        {guitar.isVerified && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={14} color="#34D399" />
            <span style={{ color: "#34D399", fontSize: "12px", fontWeight: 600 }}>Verified</span>
          </div>
        )}
      </div>

      {/* Stats Row — Loves & Views */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div
          style={{
            padding: "16px",
            backgroundColor: T.bgCard,
            borderRadius: "12px",
            border: `1px solid ${T.border}`,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
            <Heart size={16} color={T.warm} />
            <span style={{ color: T.txt, fontWeight: 700, fontSize: "20px", fontFamily: "'JetBrains Mono', monospace" }}>
              {guitar.loves}
            </span>
          </div>
          <span style={{ color: T.txtM, fontSize: "12px" }}>Loves</span>
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: T.bgCard,
            borderRadius: "12px",
            border: `1px solid ${T.border}`,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
            <Eye size={16} color={T.txt2} />
            <span style={{ color: T.txt, fontWeight: 700, fontSize: "20px", fontFamily: "'JetBrains Mono', monospace" }}>
              {guitar.views}
            </span>
          </div>
          <span style={{ color: T.txtM, fontSize: "12px" }}>Views</span>
        </div>
      </div>

      {/* Serial Number */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          backgroundColor: T.bgCard,
          borderRadius: "12px",
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Hash size={14} color={T.txtM} />
          <span style={{ color: T.txtM, fontSize: "13px" }}>Serial</span>
        </div>
        <span style={{ color: T.txt, fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
          {guitar.serial}
        </span>
      </div>

      {/* Verification Badge */}
      <VerificationBadge verified={guitar.verified} />

      {/* Claim This Guitar Button (if unclaimed) */}
      {!guitar.owner_id && (
        <Link
          to={`/claim/${guitar.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 200ms",
            backgroundColor: T.warm,
            color: T.bgDeep,
            textDecoration: "none",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Flag size={16} />
          Claim This Guitar
        </Link>
      )}

      {/* Transfer Button (owner only, published guitars) */}
      {isOwner && guitarId && guitarState === 'published' && (
        <Link
          to={`/transfer/${guitarId}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            borderRadius: "10px",
            border: `1px solid ${T.border}`,
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 200ms",
            backgroundColor: T.bgCard,
            color: T.txt2,
            textDecoration: "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.warm; e.currentTarget.style.color = T.warm; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.txt2; }}
        >
          <ArrowRight size={16} />
          Transfer Guitar
        </Link>
      )}

      {/* Unpublish Button (owner only, published guitars) */}
      {isOwner && guitarState === 'published' && (
        <button
          onClick={onTogglePublish}
          disabled={publishing}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
            border: `1px solid ${T.border}`, cursor: "pointer",
            backgroundColor: "transparent", color: T.txtM,
            transition: "all 200ms", opacity: publishing ? 0.6 : 1,
          }}
        >
          <EyeOff size={15} />
          {publishing ? "Unpublishing..." : "Unpublish (Revert to Draft)"}
        </button>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onLoveToggle}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 200ms",
            backgroundColor: loved ? `${T.warm}20` : T.bgCard,
            color: loved ? T.warm : T.txt2,
          }}
        >
          <Heart size={18} fill={loved ? "currentColor" : "none"} />
          {loved ? "Loved" : "Love"}
        </button>
        <button
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            backgroundColor: T.bgCard,
            color: T.txt2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Share2 size={18} />
        </button>
        <button
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            backgroundColor: T.bgCard,
            color: T.txt2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ExternalLink size={18} />
        </button>
      </div>

      {/* Tags */}
      {guitar.tags && guitar.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {guitar.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor: `${T.warm}15`,
                color: T.amber,
                border: `1px solid ${T.warm}30`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Story Section Component — with owner visibility toggle
function StorySection({ story, expanded, onToggle, storyOcc, isOwner, onToggleVisibility }) {
  const isLong = story.length > 200;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: T.txt,
            margin: 0,
          }}
        >
          The Story
        </h2>
        {isOwner && storyOcc && (
          <VisibilityToggle occ={storyOcc} onToggle={() => onToggleVisibility(storyOcc)} />
        )}
      </div>
      <p
        style={{
          color: T.txt2,
          lineHeight: 1.8,
          fontSize: "15px",
          maxHeight: expanded || !isLong ? "none" : "120px",
          overflow: "hidden",
          margin: 0,
        }}
      >
        {story}
      </p>
      {isLong && (
        <button
          onClick={onToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: T.amber,
            fontSize: "14px",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown
            size={16}
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms",
            }}
          />
        </button>
      )}
    </div>
  );
}

// Specifications Table Component — with IA grace period edit enforcement + change requests
// Media Section — renders video, audio, and document OCC items
function MediaSection({ mediaItems, isOwner, onToggleVisibility }) {
  if (!mediaItems || mediaItems.length === 0) return null;

  const typeConfig = {
    video: { icon: Film, color: "#A855F7", label: "Video", bgColor: "#A855F715" },
    audio: { icon: Music, color: "#3B82F6", label: "Audio", bgColor: "#3B82F615" },
    document: { icon: FileText, color: "#F59E0B", label: "Document", bgColor: "#F59E0B15" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontSize: "28px",
        fontWeight: 600, color: T.txt, margin: 0,
      }}>
        Media & Documents
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {mediaItems.map((item) => {
          const config = typeConfig[item.contentType] || typeConfig.document;
          const Icon = config.icon;
          const data = item.contentData || {};

          return (
            <div key={item.id} style={{
              padding: "16px", borderRadius: "12px", backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "12px",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    backgroundColor: config.bgColor, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} color={config.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
                      {data.title || data.name || `${config.label} file`}
                    </p>
                    {data.description && (
                      <p style={{ fontSize: "12px", color: T.txt2, margin: "2px 0 0" }}>
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <VisibilityToggle occ={item} onToggle={() => onToggleVisibility(item)} />
                )}
              </div>

              {/* Content rendering */}
              {item.contentType === 'video' && data.url && (
                <div style={{
                  borderRadius: "10px", overflow: "hidden",
                  backgroundColor: "#000", position: "relative",
                }}>
                  {data.url.includes('youtube.com') || data.url.includes('youtu.be') ? (
                    <iframe
                      src={data.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      style={{ width: "100%", aspectRatio: "16/9", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={data.title || "Video"}
                    />
                  ) : (
                    <video
                      controls
                      preload="metadata"
                      style={{ width: "100%", maxHeight: "400px", display: "block" }}
                      poster={data.thumbnail_url}
                    >
                      <source src={data.url} type={data.mime_type || "video/mp4"} />
                      Your browser does not support video playback.
                    </video>
                  )}
                </div>
              )}

              {item.contentType === 'audio' && data.url && (
                <div style={{
                  padding: "12px 16px", borderRadius: "10px", backgroundColor: T.bgDeep,
                  display: "flex", flexDirection: "column", gap: "8px",
                }}>
                  <audio controls preload="metadata" style={{ width: "100%", height: "40px" }}>
                    <source src={data.url} type={data.mime_type || "audio/mpeg"} />
                    Your browser does not support audio playback.
                  </audio>
                  {data.duration && (
                    <span style={{ fontSize: "11px", color: T.txtM, fontFamily: "'JetBrains Mono', monospace" }}>
                      Duration: {data.duration}
                    </span>
                  )}
                </div>
              )}

              {item.contentType === 'document' && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px",
                  borderRadius: "10px", backgroundColor: T.bgDeep,
                }}>
                  <FileText size={16} color={T.txtM} />
                  <span style={{ fontSize: "13px", color: T.txt, flex: 1 }}>
                    {data.filename || data.name || "Document"}
                    {data.file_size && (
                      <span style={{ color: T.txtM, fontSize: "11px", marginLeft: "8px" }}>
                        ({(data.file_size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </span>
                  {data.url && (
                    <a
                      href={data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                        backgroundColor: `${T.warm}15`, color: T.warm, border: `1px solid ${T.warm}30`,
                        textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
                      }}
                    >
                      <Download size={12} /> View
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpecsTable({ specs, isOwner, guitarId, gracePeriodEnds, iaLockedAt, onSpecsUpdated }) {
  const [openSection, setOpenSection] = useState("body");
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  // IA Change Request state
  const [changeReqField, setChangeReqField] = useState(null);
  const [changeReqValue, setChangeReqValue] = useState('');
  const [changeReqOld, setChangeReqOld] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  // Grace period logic
  const now = new Date();
  const graceEnd = gracePeriodEnds ? new Date(gracePeriodEnds) : null;
  const isLocked = !!iaLockedAt || (graceEnd && now > graceEnd);
  const isInGracePeriod = graceEnd && now <= graceEnd && !iaLockedAt;
  const daysRemaining = isInGracePeriod ? Math.ceil((graceEnd - now) / (1000 * 60 * 60 * 24)) : 0;

  const sections = [
    { id: "body", label: "Body", data: specs.body },
    { id: "neck", label: "Neck & Fretboard", data: specs.neck },
    { id: "electronics", label: "Electronics", data: specs.electronics },
    { id: "hardware", label: "Hardware", data: specs.hardware },
  ];

  // Map display keys back to DB spec field names
  const fieldKeyMap = {
    "Material": "body_material", "Finish": "finish", "Weight": "weight",
    "Neck": "neck_material", "Fretboard": "fretboard", "Scale Length": "scale_length",
    "Pickups": "pickups", "Bridge": "bridge", "Tuners": "tuners",
  };

  const handleStartEdit = () => {
    if (isLocked) return;
    if (!editMode) setShowWarning(true);
    else cancelEdit();
  };

  const confirmEdit = () => {
    setShowWarning(false);
    setEditMode(true);
    // Initialize edit values from current specs
    const vals = {};
    sections.forEach(s => {
      (s.data || []).forEach(item => {
        if (item.value !== "—") vals[item.key] = item.value;
      });
    });
    setEditValues(vals);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditValues({});
  };

  const handleSave = async () => {
    if (!guitarId || saving) return;
    setSaving(true);
    try {
      // Build specifications update from changed values
      const specUpdates = {};
      Object.entries(editValues).forEach(([displayKey, value]) => {
        const dbKey = fieldKeyMap[displayKey];
        if (dbKey) specUpdates[dbKey] = value;
      });

      // Finish is stored at top level, not in specifications JSONB
      const topLevelUpdates = {};
      if (specUpdates.finish) {
        topLevelUpdates.finish = specUpdates.finish;
        delete specUpdates.finish;
      }

      await updateGuitar(guitarId, {
        ...topLevelUpdates,
        specifications: specUpdates,
      });

      setEditMode(false);
      if (onSpecsUpdated) onSpecsUpdated();
    } catch (err) {
      console.error('[SpecsEdit] Save failed:', err.message);
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Header with edit button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: T.txt }}>
          Specifications
        </h2>
        {isOwner && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isLocked && (
              <span style={{ fontSize: "11px", color: T.txtM, display: "flex", alignItems: "center", gap: "4px" }}>
                <Lock size={12} /> Locked
              </span>
            )}
            {isInGracePeriod && !editMode && (
              <span style={{
                fontSize: "11px", color: T.amber, display: "flex", alignItems: "center", gap: "4px",
                background: `${T.amber}15`, padding: "4px 10px", borderRadius: "6px",
              }}>
                <Clock size={12} /> {daysRemaining}d left to edit
              </span>
            )}
            {editMode ? (
              <>
                <button onClick={cancelEdit} style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <Undo2 size={13} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  background: T.warm, border: `1px solid ${T.warm}`, color: T.bgDeep, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px", opacity: saving ? 0.6 : 1,
                }}>
                  {saving ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              !isLocked ? (
                <button onClick={handleStartEdit} style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  background: `${T.warm}15`, border: `1px solid ${T.warm}40`, color: T.warm, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <Edit3 size={13} /> Edit Specs
                </button>
              ) : (
                <button onClick={() => setChangeReqField('_select')} style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  background: `${T.amber}15`, border: `1px solid ${T.amber}40`, color: T.amber, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <AlertTriangle size={13} /> Request Change
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Grace period warning dialog */}
      {showWarning && (
        <div style={{
          background: "#92400E12", border: `1px solid ${T.borderAcc}`, borderRadius: "12px",
          padding: "16px", marginBottom: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <AlertTriangle size={18} color={T.amber} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: "0 0 6px" }}>
                Edit Instrument Specifications
              </p>
              <p style={{ fontSize: "13px", color: T.txt2, lineHeight: 1.6, margin: "0 0 12px" }}>
                Spec changes are subject to a grace period. You have <strong style={{ color: T.amber }}>{daysRemaining} days</strong> remaining
                to make changes. After the grace period ends, specifications become permanently locked to preserve instrument provenance.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setShowWarning(false)} style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                  background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, cursor: "pointer",
                }}>Cancel</button>
                <button onClick={confirmEdit} style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  background: T.warm, border: `1px solid ${T.warm}`, color: T.bgDeep, cursor: "pointer",
                }}>I Understand, Edit Specs</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IA Change Request Form */}
      {changeReqField && (
        <div style={{
          background: `${T.amber}08`, border: `1px solid ${T.amber}30`, borderRadius: "12px",
          padding: "16px", marginBottom: "12px",
        }}>
          {reqSuccess ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Check size={18} color="#34D399" />
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#34D399", margin: 0 }}>
                  Change request submitted
                </p>
                <p style={{ fontSize: "12px", color: T.txt2, margin: "4px 0 0" }}>
                  An admin will review your request. You&rsquo;ll be notified when it&rsquo;s processed.
                </p>
              </div>
              <button onClick={() => { setChangeReqField(null); setReqSuccess(false); }} style={{
                marginLeft: "auto", padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, cursor: "pointer",
              }}>Close</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <AlertTriangle size={18} color={T.amber} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: "0 0 4px" }}>
                    Request Specification Change
                  </p>
                  <p style={{ fontSize: "12px", color: T.txt2, lineHeight: 1.5, margin: 0 }}>
                    Specs are locked. Select the field you want to change and provide the corrected value. An admin will review your request.
                  </p>
                </div>
              </div>

              {/* Field selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: T.txtM, fontWeight: 500 }}>Field to change</label>
                <select
                  value={changeReqField === '_select' ? '' : changeReqField}
                  onChange={e => {
                    const displayKey = e.target.value;
                    setChangeReqField(displayKey);
                    // Find old value from current specs
                    const found = sections.flatMap(s => s.data || []).find(item => item.key === displayKey);
                    setChangeReqOld(found?.value === "—" ? "" : (found?.value || ""));
                    setChangeReqValue('');
                  }}
                  style={{
                    padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                    backgroundColor: T.bgDeep, border: `1px solid ${T.border}`, color: T.txt,
                    outline: "none", cursor: "pointer", appearance: "auto",
                  }}
                >
                  <option value="">Select a field...</option>
                  {Object.keys(fieldKeyMap).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Current and new value */}
              {changeReqField && changeReqField !== '_select' && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: T.txtM, fontWeight: 500 }}>Current value</label>
                    <div style={{
                      padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                      backgroundColor: T.bgDeep, border: `1px solid ${T.border}`, color: T.txtM,
                      fontStyle: changeReqOld ? "normal" : "italic",
                    }}>
                      {changeReqOld || "Not set"}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: T.txtM, fontWeight: 500 }}>New value</label>
                    <input
                      value={changeReqValue}
                      onChange={e => setChangeReqValue(e.target.value)}
                      placeholder="Enter corrected value..."
                      style={{
                        padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
                        backgroundColor: T.bgDeep, border: `1px solid ${T.border}`, color: T.txt,
                        outline: "none",
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = T.amber}
                      onBlur={e => e.currentTarget.style.borderColor = T.border}
                    />
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button onClick={() => { setChangeReqField(null); setChangeReqValue(''); setChangeReqOld(''); }} style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "12px",
                  background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, cursor: "pointer",
                }}>Cancel</button>
                <button
                  onClick={async () => {
                    if (!changeReqValue.trim() || changeReqField === '_select' || !fieldKeyMap[changeReqField]) return;
                    setSubmittingReq(true);
                    try {
                      await submitChangeRequest({
                        guitarId,
                        fieldName: fieldKeyMap[changeReqField],
                        oldValue: changeReqOld || null,
                        newValue: changeReqValue.trim(),
                      });
                      setReqSuccess(true);
                      setChangeReqValue('');
                    } catch (err) {
                      console.error('[ChangeReq] Submit failed:', err.message);
                      alert('Failed to submit request: ' + err.message);
                    } finally {
                      setSubmittingReq(false);
                    }
                  }}
                  disabled={submittingReq || !changeReqValue.trim() || changeReqField === '_select'}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                    background: T.amber, border: `1px solid ${T.amber}`, color: T.bgDeep, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                    opacity: (submittingReq || !changeReqValue.trim() || changeReqField === '_select') ? 0.5 : 1,
                  }}
                >
                  {submittingReq ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
                  {submittingReq ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spec sections */}
      {sections.map((section) => (
        <div
          key={section.id}
          style={{ border: `1px solid ${T.border}`, borderRadius: "10px", overflow: "hidden" }}
        >
          <button
            onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "14px 16px",
              backgroundColor: T.bgCard, border: "none", cursor: "pointer",
            }}
          >
            <span style={{ color: T.txt, fontWeight: 500, fontSize: "15px" }}>{section.label}</span>
            <ChevronDown size={18} color={T.txt2} style={{
              transform: openSection === section.id ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms",
            }} />
          </button>

          {openSection === section.id && section.data && (
            <div style={{ borderTop: `1px solid ${T.border}` }}>
              {section.data.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: idx < section.data.length - 1 ? `1px solid ${T.border}` : "none",
                }}>
                  <span style={{ color: T.txtM, fontSize: "14px" }}>{item.key}</span>
                  {editMode && fieldKeyMap[item.key] ? (
                    <input
                      value={editValues[item.key] || ""}
                      onChange={e => setEditValues(prev => ({ ...prev, [item.key]: e.target.value }))}
                      placeholder={item.value === "—" ? "Enter value..." : item.value}
                      style={{
                        padding: "6px 10px", borderRadius: "6px", fontSize: "14px", fontWeight: 500,
                        background: T.bgDeep, border: `1px solid ${T.borderAcc}`, color: T.txt,
                        outline: "none", textAlign: "right", width: "200px", maxWidth: "50%",
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = T.warm}
                      onBlur={e => e.currentTarget.style.borderColor = T.borderAcc}
                    />
                  ) : (
                    <span style={{ color: T.txt, fontSize: "14px", fontWeight: 500, textAlign: "right" }}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Timeline Component — with edit/delete respecting 3-tier immutability
function Timeline({ events, isOwner, guitarId, onEventsChanged }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', event_type: 'custom' });
  const [saving, setSaving] = useState(false);

  const typeColors = {
    build: "#3B82F6",
    purchase: "#D97706",
    gig: "#A855F7",
    service: "#F97316",
    repair: "#F97316",
    modification: "#A855F7",
    verified: "#34D399",
    verification: "#34D399",
    documented: "#F59E0B",
    custom: T.warm,
    system: "#6B7280",
    ownership_change: "#D97706",
  };

  const eventTypeOptions = [
    { value: 'purchase', label: 'Purchase' },
    { value: 'repair', label: 'Repair / Service' },
    { value: 'modification', label: 'Modification' },
    { value: 'custom', label: 'Custom Event' },
  ];

  const canEdit = (event) => event.tier === 1 && !event.is_locked;
  const canDelete = (event) => event.tier === 1 && !event.is_locked;

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditForm({ title: event.title, description: event.description || '', event_date: event.event_date || '', event_type: event.event_type });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSaveEdit = async () => {
    if (!editingId || saving) return;
    setSaving(true);
    try {
      await updateTimelineEvent(editingId, {
        title: editForm.title,
        description: editForm.description,
        eventDate: editForm.event_date || null,
        eventType: editForm.event_type,
      });
      setEditingId(null);
      if (onEventsChanged) onEventsChanged();
    } catch (err) {
      console.error('[Timeline] Edit failed:', err.message);
      alert('Failed to save: ' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this timeline event?')) return;
    try {
      await deleteTimelineEvent(eventId);
      if (onEventsChanged) onEventsChanged();
    } catch (err) {
      console.error('[Timeline] Delete failed:', err.message);
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || saving) return;
    setSaving(true);
    try {
      await createTimelineEvent({
        guitarId,
        eventType: newEvent.event_type,
        title: newEvent.title,
        description: newEvent.description,
        eventDate: newEvent.event_date || null,
      });
      setAddMode(false);
      setNewEvent({ title: '', description: '', event_date: '', event_type: 'custom' });
      if (onEventsChanged) onEventsChanged();
    } catch (err) {
      console.error('[Timeline] Add failed:', err.message);
      alert('Failed to add event: ' + err.message);
    } finally { setSaving(false); }
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    background: T.bgDeep, border: `1px solid ${T.borderAcc}`, color: T.txt,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: T.txt, margin: 0 }}>
          Timeline
        </h2>
        {isOwner && !addMode && (
          <button onClick={() => setAddMode(true)} style={{
            padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            background: `${T.warm}15`, border: `1px solid ${T.warm}40`, color: T.warm,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
          }}>
            + Add Event
          </button>
        )}
      </div>

      {/* Add Event Form */}
      {addMode && (
        <div style={{
          padding: "16px", borderRadius: "12px", border: `1px solid ${T.borderAcc}`,
          backgroundColor: T.bgCard, display: "flex", flexDirection: "column", gap: "12px",
        }}>
          <select value={newEvent.event_type} onChange={e => setNewEvent(p => ({ ...p, event_type: e.target.value }))}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {eventTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input placeholder="Event title" value={newEvent.title}
            onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
          <input type="date" value={newEvent.event_date}
            onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))} style={inputStyle} />
          <textarea placeholder="Description (optional)" value={newEvent.description}
            onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
            style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => { setAddMode(false); setNewEvent({ title: '', description: '', event_date: '', event_type: 'custom' }); }}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleAddEvent} disabled={!newEvent.title || saving}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: T.warm, border: `1px solid ${T.warm}`, color: T.bgDeep, cursor: "pointer",
                opacity: (!newEvent.title || saving) ? 0.5 : 1 }}>
              {saving ? "Adding..." : "Add Event"}
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative", paddingLeft: "48px", display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "2px", backgroundColor: T.border }} />

        {events.map((event, idx) => {
          const color = typeColors[event.type || event.event_type] || T.warm;
          const isEditing = editingId === event.id;
          const isRealEvent = !!event.id && typeof event.id === 'string' && event.id.includes('-');

          return (
            <div key={event.id || idx} style={{ position: "relative" }}>
              {/* Timeline dot */}
              <div style={{
                position: "absolute", left: "-40px", top: "4px", width: "20px", height: "20px",
                borderRadius: "50%", border: `2px solid ${color}`, backgroundColor: T.bgDeep,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color }} />
              </div>

              {/* Content */}
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <select value={editForm.event_type} onChange={e => setEditForm(p => ({ ...p, event_type: e.target.value }))}
                    style={{ ...inputStyle, cursor: "pointer", maxWidth: "200px" }}>
                    {eventTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                    style={inputStyle} placeholder="Title" />
                  <input type="date" value={editForm.event_date}
                    onChange={e => setEditForm(p => ({ ...p, event_date: e.target.value }))} style={{ ...inputStyle, maxWidth: "200px" }} />
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    style={{ ...inputStyle, minHeight: "50px", resize: "vertical" }} placeholder="Description" />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={cancelEdit} style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                      background: "transparent", border: `1px solid ${T.border}`, color: T.txt2, cursor: "pointer",
                    }}><Undo2 size={12} /> Cancel</button>
                    <button onClick={handleSaveEdit} disabled={saving} style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                      background: T.warm, border: `1px solid ${T.warm}`, color: T.bgDeep, cursor: "pointer",
                      opacity: saving ? 0.5 : 1,
                    }}>{saving ? "Saving..." : "Save"}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <p style={{ color, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, margin: 0 }}>
                      {event.date || event.event_date || "—"}
                    </p>
                    {event.tier === 0 && (
                      <span style={{ fontSize: "10px", color: T.txtM, display: "flex", alignItems: "center", gap: "3px" }}>
                        <Lock size={10} /> System
                      </span>
                    )}
                    {event.is_locked && event.tier !== 0 && (
                      <span style={{ fontSize: "10px", color: T.txtM, display: "flex", alignItems: "center", gap: "3px" }}>
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <p style={{ color: T.txt, fontWeight: 600, fontSize: "15px", margin: 0 }}>
                    {event.title}
                  </p>
                  <p style={{ color: T.txt2, fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                    {event.detail || event.description}
                  </p>

                  {/* Edit/Delete buttons — only for owner, tier 1, not locked, real DB events */}
                  {isOwner && isRealEvent && canEdit(event) && (
                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button onClick={() => startEdit(event)} style={{
                        fontSize: "12px", color: T.amber, background: "none", border: "none",
                        cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        <Edit3 size={12} /> Edit
                      </button>
                      {canDelete(event) && (
                        <button onClick={() => handleDelete(event.id)} style={{
                          fontSize: "12px", color: "#EF4444", background: "none", border: "none",
                          cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px",
                        }}>
                          <X size={12} /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Verification Badge Component
function VerificationBadge({ verified }) {
  if (verified.status) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          borderRadius: "12px",
          backgroundColor: "#34D39915",
          border: "1px solid #34D39930",
        }}
      >
        <Shield size={20} color="#34D399" />
        <div>
          <p style={{ color: "#34D399", fontWeight: 600, fontSize: "14px", margin: 0 }}>
            Verified by {verified.luthier}
          </p>
          <p
            style={{
              color: T.txt2,
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              margin: 0,
            }}
          >
            {verified.date}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: "12px",
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Shield size={16} color={T.txtM} />
        <p style={{ color: T.txtM, fontSize: "14px", margin: 0 }}>Not yet verified</p>
      </div>
      <button
        style={{
          color: T.amber,
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        Request verification
      </button>
    </div>
  );
}

// Comments Section Component — wired to Supabase
function CommentsSection({ guitarId, mockComments }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const [useFallback, setUseFallback] = useState(false);

  // Fetch comments from Supabase on mount
  useEffect(() => {
    const fetchComments = async () => {
      if (!guitarId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedComments = await getGuitarComments(guitarId);
        // Transform Supabase data to display format
        const transformed = fetchedComments.map(c => ({
          id: c.id,
          text: c.text,
          author: c.author?.display_name || "Anonymous",
          handle: `@${c.author?.username || "user"}`,
          avatar: (c.author?.display_name || "U").substring(0, 2).toUpperCase(),
          timestamp: formatTimestamp(c.created_at),
          likes: c.like_count || 0,
          userId: c.user_id,
        }));
        setComments(transformed);
        setUseFallback(false);
      } catch (err) {
        // Graceful fallback if guitar_comments table doesn't exist
        console.warn('[Comments] Fetch failed, using mock data:', err.message);
        setComments(mockComments || []);
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [guitarId, mockComments]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return "just now";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user || !guitarId || sending) return;

    setSending(true);
    try {
      const newCommentData = await addComment(guitarId, user.id, newComment.trim());

      // Add to local state
      const transformed = {
        id: newCommentData.id,
        text: newCommentData.text,
        author: newCommentData.author?.display_name || user.displayName || "You",
        handle: `@${newCommentData.author?.username || user.handle || "user"}`,
        avatar: (user.displayName || "ME").substring(0, 2).toUpperCase(),
        timestamp: "just now",
        likes: 0,
        userId: newCommentData.user_id,
      };

      setComments(prev => [transformed, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error('[Comments] Send failed:', err.message);
      if (!useFallback) {
        alert('Failed to post comment. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) return;

    try {
      const isLiking = !likedComments.has(commentId);
      await toggleCommentLike(commentId, user.id);

      // Update local state
      if (isLiking) {
        setLikedComments(prev => new Set([...prev, commentId]));
      } else {
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }

      // Update comment likes count
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, likes: c.likes + (isLiking ? 1 : -1) }
            : c
        )
      );
    } catch (err) {
      console.error('[Comments] Like toggle failed:', err.message);
    }
  };

  const displayComments = loading && !useFallback ? [] : comments;
  const userAvatar = user
    ? (user.displayName || "ME").substring(0, 2).toUpperCase()
    : "ME";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "28px",
          fontWeight: 600,
          color: T.txt,
          margin: 0,
        }}
      >
        Comments
      </h2>

      {/* Fallback notice */}
      {useFallback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: `${T.amber}15`,
            border: `1px solid ${T.amber}30`,
            fontSize: "12px",
            color: T.txt2,
          }}
        >
          Comments are coming soon. Check back later!
        </div>
      )}

      {/* New Comment Input — only show if user is logged in */}
      {user && !useFallback && (
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: T.warm,
              color: T.bgDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {userAvatar}
          </div>
          <div style={{ flex: 1, display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && newComment.trim() && !sending) {
                  handleSendComment();
                }
              }}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: "10px",
                padding: "10px 16px",
                color: T.txt,
                outline: "none",
                fontSize: "14px",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = T.warm)}
              onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
            />
            <button
              onClick={handleSendComment}
              disabled={!newComment.trim() || sending}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "none",
                cursor: newComment.trim() && !sending ? "pointer" : "not-allowed",
                backgroundColor:
                  newComment.trim() && !sending ? T.warm : T.bgCard,
                color: newComment.trim() && !sending ? T.bgDeep : T.txt2,
                opacity: newComment.trim() && !sending ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 200ms",
              }}
            >
              {sending ? (
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading && !useFallback ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "24px",
              color: T.txtM,
            }}
          >
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "14px" }}>Loading comments...</span>
          </div>
        ) : displayComments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              color: T.txtM,
              fontSize: "14px",
            }}
          >
            No comments yet. Be the first to comment!
          </div>
        ) : (
          displayComments.map((comment, idx) => (
            <div key={comment.id || idx} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: T.warm,
                    color: T.bgDeep,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {comment.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        color: T.txt,
                        fontWeight: 600,
                        fontSize: "14px",
                        margin: 0,
                      }}
                    >
                      {comment.author}
                    </p>
                    <p
                      style={{
                        color: T.txt2,
                        fontSize: "12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        margin: 0,
                      }}
                    >
                      {comment.handle}
                    </p>
                    <p
                      style={{
                        color: T.txtM,
                        fontSize: "12px",
                        margin: 0,
                      }}
                    >
                      {comment.timestamp}
                    </p>
                  </div>
                  <p
                    style={{
                      color: T.txt2,
                      fontSize: "14px",
                      marginTop: "6px",
                      lineHeight: 1.6,
                    }}
                  >
                    {comment.text}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      disabled={!user || useFallback}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: likedComments.has(comment.id) ? T.warm : T.txtM,
                        background: "none",
                        border: "none",
                        cursor: user && !useFallback ? "pointer" : "not-allowed",
                        padding: 0,
                        opacity: user && !useFallback ? 1 : 0.5,
                        transition: "color 200ms",
                      }}
                    >
                      <Heart
                        size={14}
                        fill={likedComments.has(comment.id) ? "currentColor" : "none"}
                      />
                      {comment.likes}
                    </button>
                  </div>
                </div>
              </div>
              {idx < displayComments.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: T.border,
                    marginLeft: "52px",
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Related Guitars Carousel Component
function RelatedGuitarsCarousel({ relatedGuitars }) {
  const scroll = (direction) => {
    const container = document.getElementById("related-carousel");
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: T.txt,
            margin: 0,
          }}
        >
          More from Collection
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => scroll("left")}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: T.bgCard,
              color: T.txt2,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: T.bgCard,
              color: T.txt2,
            }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div
        id="related-carousel"
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "8px",
          scrollBehavior: "smooth",
        }}
      >
        {relatedGuitars.map((g) => (
          <Link
            key={g.id}
            to={`/guitar/${g.id}`}
            style={{
              flexShrink: 0,
              width: "clamp(180px, 50vw, 240px)",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: "12px",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              transition: "opacity 200ms",
            }}
          >
            {/* Image */}
            <div
              style={{
                width: "100%",
                height: "160px",
                backgroundImage: `url('${g.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Content */}
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <p
                style={{
                  color: T.txt2,
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {g.brand} · {g.year}
              </p>
              <p style={{ color: T.txt, fontWeight: 600, fontSize: "14px", margin: 0 }}>
                {g.model}
              </p>
              <p style={{ color: T.txtM, fontSize: "12px", margin: 0 }}>
                {g.owner}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


// ============ MAIN DETAIL PAGE COMPONENT ============

export default function TWNGGuitarDetail() {
  const { id } = useParams();
  const [loved, setLoved] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);

  // Fetch guitar from Supabase (or mock data fallback)
  const { guitar, loading, error } = useGuitar(id);
  const { user } = useAuth();
  const isOwner = !!(user && guitar && guitar.ownerId === user.id);
  const [publishing, setPublishing] = useState(false);
  const [guitarState, setGuitarState] = useState(guitar?.state || 'published');

  // Sync guitarState when guitar data loads/changes
  const currentState = guitar?.state || 'published';
  if (currentState !== guitarState && !publishing) {
    setGuitarState(currentState);
  }

  const handleTogglePublish = async () => {
    if (!guitar?.id || publishing) return;
    const newState = guitarState === 'draft' ? 'published' : 'draft';
    setPublishing(true);
    try {
      await updateGuitar(guitar.id, { state: newState });
      setGuitarState(newState);
    } catch (err) {
      console.error('[State] Toggle failed:', err.message);
      alert('Failed to update state: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  // Toggle visibility handler — must be declared before early returns (Rules of Hooks)
  const handleToggleVisibility = useCallback(async (occItem) => {
    if (!occItem?.id) return;
    const nextVis = cycleVisibility(occItem);
    try {
      await updateOccVisibility(occItem.id, nextVis);
      window.location.reload();
    } catch (err) {
      console.error('[OCC] Visibility update failed:', err.message);
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        backgroundColor: T.bgDeep, gap: "16px",
      }}>
        <Loader2 size={32} color={T.warm} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "14px", color: T.txt2 }}>Loading guitar...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!guitar) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        backgroundColor: T.bgDeep, gap: "16px",
      }}>
        <Guitar size={48} color={T.txtM} />
        <p style={{ fontSize: "18px", fontWeight: 600, color: T.txt }}>Guitar not found</p>
        <Link to="/explore" style={{ color: T.warm, fontSize: "14px" }}>Browse guitars</Link>
      </div>
    );
  }

  const displayGuitar = guitar;

  // ---------- OCC Visibility Filtering ----------
  const viewerContext = {
    viewerId: user?.id || null,
    ownerId: displayGuitar.ownerId || null,
    showHistoricalContent: true, // default — would come from guitar settings
  };

  // Filter raw OCC through visibility algorithm
  const rawOcc = displayGuitar.rawOcc || [];
  const visibleOcc = rawOcc.filter(occ => shouldDisplayOcc(occ, viewerContext));

  // Extract visible image OCC items
  const imageOccItems = visibleOcc
    .filter(o => o.contentType === 'image')
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // Extract story and nickname OCC (visible)
  const storyOcc = visibleOcc.find(o => o.contentType === 'story');
  const nicknameOcc = visibleOcc.find(o => o.contentType === 'nickname');

  // Extract media OCC items (video, audio, document)
  const mediaOccItems = visibleOcc
    .filter(o => ['video', 'audio', 'document'].includes(o.contentType))
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // Override adapter-extracted values with visibility-filtered ones
  const visibleStory = storyOcc?.contentData?.text || displayGuitar.story;
  const visibleNickname = nicknameOcc?.contentData?.name || displayGuitar.nickname;

  // handleToggleVisibility declared above early returns (Rules of Hooks)

  // Build rich gallery images from OCC or fallback
  const galleryFromOcc = imageOccItems
    .map(o => o.contentData?.url || o.contentData?.thumbnail_url)
    .filter(Boolean);

  const galleryImages = galleryFromOcc.length > 0
    ? galleryFromOcc
    : [
        displayGuitar.image,
        GUITAR_IMAGES.heritage_lp,
        GUITAR_IMAGES.nash_sunburst,
        GUITAR_IMAGES.heritage_semi,
        GUITAR_IMAGES.suhr_green,
        GUITAR_IMAGES.tele_relic,
      ].filter((v, i, a) => v && a.indexOf(v) === i);

  // Build proper specs object with key-value pairs for accordion sections
  const rawSpecs = displayGuitar.specs || {};
  const formattedSpecs = {
    body: [
      { key: "Material", value: rawSpecs.body || "—" },
      { key: "Finish", value: rawSpecs.finish || "—" },
      { key: "Weight", value: rawSpecs.weight || "—" },
      { key: "Condition", value: displayGuitar.condition || "—" },
    ],
    neck: [
      { key: "Neck", value: rawSpecs.neck || "—" },
      { key: "Fretboard", value: rawSpecs.fretboard || "—" },
      { key: "Scale Length", value: rawSpecs.scale || "—" },
    ],
    electronics: [
      { key: "Pickups", value: rawSpecs.pickups || "—" },
    ],
    hardware: [
      { key: "Bridge", value: rawSpecs.bridge || "—" },
      { key: "Tuners", value: rawSpecs.tuners || "—" },
    ],
  };

  // Build rich timeline events
  const timeline = [
    {
      type: "build",
      date: `Year ${displayGuitar.year}`,
      title: "Manufactured",
      detail: `${displayGuitar.brand} ${displayGuitar.model} crafted${displayGuitar.brand === "Heritage" ? " in Kalamazoo, Michigan" : ""}.`,
    },
    {
      type: "purchase",
      date: `${displayGuitar.year + 1}`,
      title: "First Owner Acquisition",
      detail: `Purchased by ${displayGuitar.owner?.displayName || "the owner"} and added to their collection.`,
    },
    {
      type: "service",
      date: `${displayGuitar.year + 2}`,
      title: "Professional Setup",
      detail: "Full fret level, crown and polish. Electronics cleaned, intonation set.",
    },
    ...(displayGuitar.verified ? [{
      type: "verified",
      date: "2024",
      title: "Authenticated on TWNG",
      detail: "Verified authentic by expert luthier review including serial number and construction analysis.",
    }] : []),
    {
      type: "documented",
      date: "2025",
      title: "Documented on TWNG",
      detail: "Full documentation with specifications, photographs, and provenance record added to TWNG.",
    },
  ];

  // Mock comments
  const comments = [
    {
      id: 1,
      author: "Sarah Vintage",
      handle: "@sarah_vintage",
      avatar: "SV",
      timestamp: "2 days ago",
      text: `What a specimen! The ${rawSpecs.finish || "finish"} is remarkable. That's the kind of instrument that defines a collection.`,
      likes: 24,
    },
    {
      id: 2,
      author: "Marcus Reed",
      handle: "@marcusReed_guitars",
      avatar: "MR",
      timestamp: "1 week ago",
      text: `Those ${rawSpecs.pickups || "pickups"} must sing. Classic weight too — ${displayGuitar.brand} really knows what they're doing.`,
      likes: 18,
    },
    {
      id: 3,
      author: "Elena Tones",
      handle: "@elenaTones",
      avatar: "ET",
      timestamp: "2 weeks ago",
      text: "Incredible piece. The photography does it justice — you can almost feel the neck profile through the screen.",
      likes: 32,
    },
    {
      id: 4,
      author: "David Hollow",
      handle: "@davidHollow",
      avatar: "DH",
      timestamp: "3 weeks ago",
      text: "This is museum quality. Are you ever considering trading or is this a keeper?",
      likes: 15,
    },
  ];

  // Verification info
  const verified = displayGuitar.verified
    ? { status: true, luthier: "Yaron Naor", date: "March 2024" }
    : { status: false };

  // Related guitars — placeholder until a dedicated query is added
  const relatedGuitars = [];

  // Guitar data for header/sidebar
  const guitarData = {
    brand: displayGuitar.brand,
    year: displayGuitar.year,
    model: displayGuitar.model,
    nickname: visibleNickname,
    bodyType: displayGuitar.bodyType || "Solid Body",
    condition: displayGuitar.condition,
    isVerified: displayGuitar.verified,
    owner: {
      name: displayGuitar.owner?.displayName || "Collection Owner",
      handle: displayGuitar.owner?.handle || "owner",
      avatar: (displayGuitar.owner?.displayName || "CO").substring(0, 2).toUpperCase(),
    },
    loves: 342,
    views: 1247,
    serial: displayGuitar.serialNumber || `${displayGuitar.brand.substring(0, 3).toUpperCase()}-${displayGuitar.year}`,
    verified: verified,
    tags: displayGuitar.tags || [],
  };

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt, minHeight: "100vh" }}>
      <style>{`
        .detail-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 1024px) {
          .detail-layout {
            grid-template-columns: 2fr 1fr;
            gap: 48px;
          }
        }
        @media (max-width: 480px) {
          .detail-layout { gap: 24px !important; }
        }
        .detail-sidebar {
          position: static;
        }
        @media (min-width: 1024px) {
          .detail-sidebar {
            position: sticky;
            top: 48px;
            align-self: start;
          }
        }
      `}</style>

      {/* Container */}
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "32px 24px 64px" }}>
        {/* Back Button */}
        <Link
          to="/collection"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: T.txt2,
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={18} />
          Back to collection
        </Link>

        {/* Two Column Layout */}
        <div className="detail-layout">
          {/* Left Column — Gallery, Story, Specs, Timeline, Comments, Related */}
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            <ImageGallery
              images={galleryImages}
              imageOccItems={imageOccItems}
              isOwner={isOwner}
              onToggleVisibility={handleToggleVisibility}
            />
            {visibleStory && (
              <StorySection
                story={visibleStory}
                expanded={storyExpanded}
                onToggle={() => setStoryExpanded(!storyExpanded)}
                storyOcc={storyOcc}
                isOwner={isOwner}
                onToggleVisibility={handleToggleVisibility}
              />
            )}
            <MediaSection
              mediaItems={mediaOccItems}
              isOwner={isOwner}
              onToggleVisibility={handleToggleVisibility}
            />
            <SpecsTable
              specs={formattedSpecs}
              isOwner={isOwner}
              guitarId={guitar?.id}
              gracePeriodEnds={guitar?.iaGracePeriodEnds}
              iaLockedAt={guitar?.iaLockedAt}
              onSpecsUpdated={() => window.location.reload()}
            />
            <Timeline
              events={timeline}
              isOwner={isOwner}
              guitarId={guitar?.id}
              onEventsChanged={() => window.location.reload()}
            />
            <CommentsSection guitarId={guitar?.id} mockComments={comments} />
            <RelatedGuitarsCarousel relatedGuitars={relatedGuitars} />
          </div>

          {/* Right Column — Sticky Info Sidebar */}
          <div className="detail-sidebar">
            <GuitarHeader
              guitar={guitarData}
              loved={loved}
              onLoveToggle={() => setLoved(!loved)}
              isOwner={isOwner}
              guitarId={guitar?.id}
              guitarState={guitarState}
              onTogglePublish={handleTogglePublish}
              publishing={publishing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
