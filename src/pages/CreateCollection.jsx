import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Image,
  Eye,
  EyeOff,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import { createCollection, addInstrumentToCollection } from "../lib/supabase/collections";
import { ROUTES, collectionPath } from "../lib/routes";

/* ─── Instrument Search Modal ──────────────────────────────────────── */
function InstrumentPickerModal({ isOpen, onClose, onAdd, selectedIds }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setInstruments([]);
      return;
    }

    const searchInstruments = async () => {
      try {
        setLoading(true);
        // Mock search - in production would query from supabase
        const mockInstruments = [
          {
            id: "inst-1",
            make: "Fender",
            model: "Stratocaster",
            year: 1965,
            image_url: null,
          },
          {
            id: "inst-2",
            make: "Gibson",
            model: "Les Paul",
            year: 1959,
            image_url: null,
          },
          {
            id: "inst-3",
            make: "Martin",
            model: "D-28",
            year: 1945,
            image_url: null,
          },
        ];
        setInstruments(
          mockInstruments.filter(
            (inst) =>
              inst.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
              inst.model.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchInstruments, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: T.bgCard,
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          padding: "32px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: T.txt,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Add Instruments
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: T.txtM,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search instruments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: T.bgElev,
            border: `1px solid ${T.border}`,
            color: T.txt,
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: "16px",
            outline: "none",
          }}
        />

        {/* Results */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            marginBottom: "16px",
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
              }}
            >
              <Loader2
                size={24}
                color={T.warm}
                style={{ margin: "0 auto", animation: "spin 1s linear infinite" }}
              />
            </div>
          ) : instruments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {instruments.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    onAdd(inst);
                    setSearchQuery("");
                  }}
                  disabled={selectedIds.has(inst.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: selectedIds.has(inst.id)
                      ? T.bgElev
                      : T.bgElev,
                    border: `1px solid ${
                      selectedIds.has(inst.id) ? T.warm : T.border
                    }`,
                    color: T.txt,
                    cursor: selectedIds.has(inst.id) ? "not-allowed" : "pointer",
                    textAlign: "left",
                    opacity: selectedIds.has(inst.id) ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      backgroundColor: T.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "20px",
                    }}
                  >
                    {inst.image_url ? (
                      <img
                        src={inst.image_url}
                        alt={inst.model}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      "🎸"
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: T.txt,
                      }}
                    >
                      {inst.make} {inst.model}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: T.txtM,
                      }}
                    >
                      {inst.year}
                    </p>
                  </div>
                  {selectedIds.has(inst.id) && (
                    <span style={{ fontSize: "12px", color: T.warm }}>
                      Added
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                color: T.txtM,
              }}
            >
              No instruments found
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                color: T.txtM,
              }}
            >
              Start typing to search
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: T.bgElev,
            border: `1px solid ${T.border}`,
            color: T.txt,
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          Done
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Selected Instrument Chip ──────────────────────────────────────── */
function InstrumentChip({ instrument, onRemove }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        borderRadius: "8px",
        backgroundColor: T.bgElev,
        border: `1px solid ${T.border}`,
      }}
    >
      <span
        style={{
          fontSize: "13px",
          color: T.txt,
          fontWeight: 500,
        }}
      >
        {instrument.make} {instrument.model}
      </span>
      <button
        onClick={() => onRemove(instrument.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 4px",
          color: T.txtM,
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function CreateCollection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    coverImageUrl: null,
  });
  const [selectedInstruments, setSelectedInstruments] = useState(new Map());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH);
    }
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddInstrument = (instrument) => {
    setSelectedInstruments((prev) => {
      const newMap = new Map(prev);
      newMap.set(instrument.id, instrument);
      return newMap;
    });
  };

  const handleRemoveInstrument = (instrumentId) => {
    setSelectedInstruments((prev) => {
      const newMap = new Map(prev);
      newMap.delete(instrumentId);
      return newMap;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          coverImageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Collection name is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const newCollection = await createCollection(user.id, {
        name: formData.name,
        description: formData.description || null,
        cover_image_url: formData.coverImageUrl,
        is_public: formData.isPublic,
      });

      // Add instruments to collection once created
      for (const [instrumentId] of selectedInstruments) {
        await addInstrumentToCollection(newCollection.id, instrumentId);
      }

      navigate(collectionPath(newCollection.id));
    } catch (err) {
      console.error("Failed to create collection:", err);
      setError("Failed to create collection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "10px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              color: T.txt,
              cursor: "pointer",
              marginBottom: "24px",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "8px",
            }}
          >
            Create Collection
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: T.txt2,
            }}
          >
            Start curating your custom collection of instruments
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
            }}
          >
            {/* Left Column - Form Fields */}
            <div>
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${T.error}`,
                    color: T.error,
                    marginBottom: "24px",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Name */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: "8px",
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleInputChange("name", e.target.value)
                  }
                  placeholder="e.g., Vintage Fenders"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    color: T.txt,
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = T.warm)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = T.border)
                  }
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: "8px",
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Tell us about this collection..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                    color: T.txt,
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "vertical",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = T.warm)
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = T.border)
                  }
                />
              </div>

              {/* Visibility Toggle */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    backgroundColor: T.bgCard,
                    border: `1px solid ${T.border}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      handleInputChange("isPublic", e.target.checked)
                    }
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: T.txt,
                    }}
                  >
                    {formData.isPublic ? (
                      <>
                        <Eye size={14} /> Public Collection
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} /> Private Collection
                      </>
                    )}
                  </span>
                </label>
                <p
                  style={{
                    fontSize: "12px",
                    color: T.txtM,
                    marginTop: "8px",
                    marginLeft: "16px",
                  }}
                >
                  {formData.isPublic
                    ? "Anyone can view this collection"
                    : "Only you can view this collection"}
                </p>
              </div>
            </div>

            {/* Right Column - Cover Image */}
            <div>
              {/* Cover Image */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: "8px",
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Cover Image
                </label>
                <div
                  style={{
                    position: "relative",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: T.bgCard,
                    border: `2px dashed ${T.border}`,
                    aspectRatio: "4/5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {formData.coverImageUrl ? (
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: T.txtM,
                      }}
                    >
                      <Image size={32} style={{ margin: "0 auto 12px" }} />
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        Click to upload
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Instruments Section ──────────────────────────────────── */}
          <div style={{ marginTop: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: T.txt,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Add Instruments
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: T.warm,
                  color: T.bgDeep,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                <Plus size={16} /> Add Instruments
              </button>
            </div>

            {selectedInstruments.size > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {Array.from(selectedInstruments.values()).map((inst) => (
                  <InstrumentChip
                    key={inst.id}
                    instrument={inst}
                    onRemove={handleRemoveInstrument}
                  />
                ))}
              </div>
            ) : (
              <p style={{ color: T.txtM, fontSize: "14px" }}>
                No instruments added yet. Add some to get started!
              </p>
            )}
          </div>

          {/* ── Submit Button ────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                flex: 1,
                padding: "14px 24px",
                borderRadius: "10px",
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                color: T.txt,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "16px",
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: "14px 24px",
                borderRadius: "10px",
                backgroundColor: T.warm,
                border: "none",
                color: T.bgDeep,
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "16px",
                transition: "all 0.2s",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Creating...
                </span>
              ) : (
                "Create Collection"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Instrument Picker Modal ──────────────────────────────────── */}
      <InstrumentPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddInstrument}
        selectedIds={new Set(selectedInstruments.keys())}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
