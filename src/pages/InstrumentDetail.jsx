import { useState, useCallback, useEffect } from "react";
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Shield, ChevronDown, ChevronUp, Calendar, Clock, Eye, EyeOff, Users, Flag, AlertTriangle, Check, Loader2 } from "lucide-react";
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { getInstrument, updateInstrument } from '../lib/supabase/instruments';
import { getTimelineEvents } from '../lib/supabase/timeline';
import { getComments } from '../lib/supabase/comments';
import { getOccForInstrument } from '../lib/supabase/occ';
import { addFavorite, removeFavorite, getUserFavorites } from '../lib/supabase/userFavorites';

// ============================================================
// Badge Component
// ============================================================
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

// ============================================================
// Image Gallery Component
// ============================================================
function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            backgroundColor: `${T.bgDeep}dd`,
            color: T.txt,
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {activeIndex + 1} / {images.length}
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
          <img
            src={images[activeIndex]}
            alt="Lightbox"
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
          />
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

// ============================================================
// Instrument Header Component
// ============================================================
function InstrumentHeader({ instrument, loved, onLoveToggle, isOwner }) {
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!isOwner) return;
    setPublishing(true);
    try {
      await updateInstrument(instrument.id, {
        moderation_status: instrument.moderation_status === 'approved' ? 'pending' : 'approved'
      });
    } catch (err) {
      console.error('Failed to update publish status:', err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Make & Year & Type Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <Badge variant="default">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {instrument.make}
          </span>
        </Badge>
        <Badge variant="default">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {instrument.year}
          </span>
        </Badge>
        <Badge variant="default">
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {instrument.instrument_type || 'Instrument'}
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
          {instrument.model}
        </h1>
        {instrument.nickname && (
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              fontStyle: "italic",
              color: T.amber,
              marginTop: "8px",
            }}
          >
            {instrument.nickname}
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
          to={`/user/${instrument.current_owner?.username}`}
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
            {instrument.current_owner?.display_name?.charAt(0) || '?'}
          </div>
          <div>
            <p style={{ color: T.txt, fontWeight: 600, fontSize: "14px", margin: 0 }}>
              {instrument.current_owner?.display_name || 'Unknown'}
            </p>
            <p
              style={{
                color: T.txt2,
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
              }}
            >
              @{instrument.current_owner?.username || 'unknown'}
            </p>
          </div>
        </Link>
        {instrument.moderation_status === 'verified' && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Shield size={14} color="#34D399" />
            <span style={{ color: "#34D399", fontSize: "12px", fontWeight: 600 }}>Verified</span>
          </div>
        )}
      </div>

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
      </div>
    </div>
  );
}

// ============================================================
// Specifications Component
// ============================================================
function SpecificationsComponent({ specs }) {
  if (!specs || Object.keys(specs).length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "28px",
        fontWeight: 600,
        color: T.txt,
        margin: 0,
      }}>
        Specifications
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
      }}>
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} style={{
            padding: "12px",
            backgroundColor: T.bgCard,
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
          }}>
            <p style={{
              fontSize: "11px",
              color: T.txtM,
              fontFamily: "'JetBrains Mono', monospace",
              margin: "0 0 4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {key.replace(/_/g, ' ')}
            </p>
            <p style={{
              fontSize: "13px",
              color: T.txt,
              fontWeight: 500,
              margin: 0,
            }}>
              {String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Timeline Component
// ============================================================
function TimelineComponent({ events }) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "28px",
        fontWeight: 600,
        color: T.txt,
        margin: 0,
      }}>
        Timeline
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {events.map((event, idx) => (
          <div key={idx} style={{
            padding: "16px",
            backgroundColor: T.bgCard,
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            display: "flex",
            gap: "12px",
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: T.warm,
              color: T.bgDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "12px",
              fontWeight: 600,
            }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: "14px",
                fontWeight: 600,
                color: T.txt,
                margin: "0 0 4px",
              }}>
                {event.event_type || 'Event'}
              </p>
              <p style={{
                fontSize: "12px",
                color: T.txt2,
                margin: "0 0 8px",
                lineHeight: "1.5",
              }}>
                {event.description || ''}
              </p>
              <p style={{
                fontSize: "11px",
                color: T.txtM,
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
              }}>
                {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Date unknown'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Comments Component
// ============================================================
function CommentsComponent({ comments }) {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "28px",
        fontWeight: 600,
        color: T.txt,
        margin: 0,
      }}>
        Comments
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {comments.map((comment) => (
          <div key={comment.id} style={{
            padding: "16px",
            backgroundColor: T.bgCard,
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: T.warm,
                  color: T.bgDeep,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {comment.author?.display_name?.charAt(0) || '?'}
              </div>
              <div>
                <p style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: T.txt,
                  margin: 0,
                }}>
                  {comment.author?.display_name || 'Anonymous'}
                </p>
              </div>
            </div>
            <p style={{
              fontSize: "13px",
              color: T.txt2,
              lineHeight: "1.625",
              margin: 0,
            }}>
              {comment.content || ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main InstrumentDetail Component
// ============================================================
export default function InstrumentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [instrument, setInstrument] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loved, setLoved] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [occ, setOcc] = useState([]);

  const isOwner = user && instrument && user.id === instrument.current_owner_id;

  useEffect(() => {
    const loadInstrumentData = async () => {
      try {
        setLoading(true);

        const instrumentData = await getInstrument(id);
        setInstrument(instrumentData);

        // Gather images
        const imageList = [];
        if (instrumentData.main_image_url) {
          imageList.push(instrumentData.main_image_url);
        }
        setImages(imageList.length > 0 ? imageList : [require('../utils/placeholders').IMG.hero_tele]);

        // Load related data in parallel
        const [timelineData, commentsData, occData, favoritesData] = await Promise.all([
          getTimelineEvents(id).catch(() => []),
          getComments('instrument', id).catch(() => []),
          getOccForInstrument(id).catch(() => []),
          user ? getUserFavorites(user.id).catch(() => []) : Promise.resolve([]),
        ]);

        setTimeline(timelineData);
        setComments(commentsData);
        setOcc(occData);

        if (user && favoritesData.some(fav => fav.instrument_id === id)) {
          setLoved(true);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load instrument:', err);
        setError(err.message || 'Failed to load instrument');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInstrumentData();
    }
  }, [id, user]);

  const handleLoveToggle = async () => {
    if (!user || !instrument) return;

    try {
      if (loved) {
        await removeFavorite(user.id, instrument.id);
      } else {
        await addFavorite(user.id, instrument.id);
      }
      setLoved(!loved);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: T.bgDeep,
      }}>
        <div style={{ textAlign: "center", color: T.txt }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p>Loading instrument...</p>
        </div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: T.bgDeep,
        padding: "24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "42rem" }}>
          <AlertTriangle size={48} style={{ color: T.amber, margin: "0 auto 16px" }} />
          <h1 style={{ color: T.txt, marginBottom: "8px" }}>Instrument Not Found</h1>
          <p style={{ color: T.txt2, marginBottom: "24px" }}>
            {error || 'This instrument could not be found or has been removed.'}
          </p>
          <Link to="/explore" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: T.warm,
            color: T.bgDeep,
            textDecoration: "none",
            fontWeight: 600,
          }}>
            <ArrowLeft size={16} />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      {/* Back Button */}
      <div style={{
        padding: "24px",
        maxWidth: "80rem",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <Link to="/explore" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: T.txt2,
          textDecoration: "none",
          fontSize: "14px",
          marginBottom: "24px",
        }}>
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Main Content */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "48px",
        padding: "24px",
        maxWidth: "80rem",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        {/* Left Column: Images */}
        <div>
          <ImageGallery images={images} />
        </div>

        {/* Right Column: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <InstrumentHeader
            instrument={instrument}
            loved={loved}
            onLoveToggle={handleLoveToggle}
            isOwner={isOwner}
          />
        </div>
      </div>

      {/* Story Section */}
      {instrument.description && (
        <div style={{
          padding: "48px 24px",
          borderTop: `1px solid ${T.border}`,
        }}>
          <div style={{
            maxWidth: "80rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: 600,
              color: T.txt,
              marginBottom: "16px",
            }}>
              The Story
            </h2>
            <p style={{
              color: T.txt2,
              lineHeight: 1.8,
              fontSize: "15px",
            }}>
              {instrument.description}
            </p>
          </div>
        </div>
      )}

      {/* Specifications Section */}
      {instrument.specs && (
        <div style={{
          padding: "48px 24px",
          borderTop: `1px solid ${T.border}`,
        }}>
          <div style={{
            maxWidth: "80rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            <SpecificationsComponent specs={instrument.specs} />
          </div>
        </div>
      )}

      {/* Timeline Section */}
      {timeline.length > 0 && (
        <div style={{
          padding: "48px 24px",
          borderTop: `1px solid ${T.border}`,
        }}>
          <div style={{
            maxWidth: "80rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            <TimelineComponent events={timeline} />
          </div>
        </div>
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <div style={{
          padding: "48px 24px",
          borderTop: `1px solid ${T.border}`,
        }}>
          <div style={{
            maxWidth: "80rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            <CommentsComponent comments={comments} />
          </div>
        </div>
      )}
    </div>
  );
}
