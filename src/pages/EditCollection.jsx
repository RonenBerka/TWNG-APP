import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Image,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import {
  getCollection,
  updateCollection,
  removeInstrumentFromCollection,
  addInstrumentToCollection,
} from "../lib/supabase/collections";

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
          {
            id: "inst-4",
            make: "PRS",
            model: "Custom 24",
            year: 2000,
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
                    backgroundColor: T.bgElev,
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

/* ─── Instrument Item Row ──────────────────────────────────────────── */
function InstrumentItem({ instrument, onRemove, isRemoving }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        borderRadius: "10px",
        backgroundColor: T.bgCard,
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "8px",
          backgroundColor: T.bgElev,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "28px",
          overflow: "hidden",
        }}
      >
        {instrument.image_url ? (
          <img
            src={instrument.image_url}
            alt={instrument.model}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
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
          {instrument.make} {instrument.model}
        </p>
        <p
          style={{
            fontSize: "12px",
            color: T.txtM,
          }}
        >
          {instrument.year}
        </p>
      </div>
      <button
        onClick={() => onRemove(instrument.id)}
        disabled={isRemoving}
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          backgroundColor: T.error,
          border: "none",
          color: "#fff",
          cursor: isRemoving ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: "13px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          opacity: isRemoving ? 0.6 : 1,
          transition: "all 0.2s",
        }}
      >
        <Trash2 size={14} /> Remove
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function EditCollection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    coverImageUrl: null,
  });
  const [instruments, setInstruments] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  const isOwner = collection && user && collection.user_id === user.id;

  // Fetch collection
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCollection(id);
        if (!data) {
          setError("Collection not found");
        } else if (data.user_id !== user?.id) {
          setError("You don't have permission to edit this collection");
        } else {
          setCollection(data);
          setFormData({
            name: data.name,
            description: data.description || "",
            isPublic: data.is_public,
            coverImageUrl: data.cover_image_url,
          });
          setInstruments(
            data.collection_items?.map((item) => item.instruments) || []
          );
        }
      } catch (err) {
        console.error("Failed to fetch collection:", err);
        setError("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCollection();
    } else {
      navigate("/auth");
    }
  }, [id, user?.id, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleAddInstrument = (instrument) => {
    if (!instruments.find((i) => i.id === instrument.id)) {
      setInstruments([...instruments, instrument]);
      // TODO: Actually add to collection via API
      // await addInstrumentToCollection(id, instrument.id);
    }
  };

  const handleRemoveInstrument = async (instrumentId) => {
    try {
      setRemovingId(instrumentId);
      // TODO: Call removeInstrumentFromCollection
      // await removeInstrumentFromCollection(id, instrumentId);
      setInstruments((prev) =>
        prev.filter((inst) => inst.id !== instrumentId)
      );
    } catch (err) {
      console.error("Failed to remove instrument:", err);
    } finally {
      setRemovingId(null);
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

      await updateCollection(id, {
        name: formData.name,
        description: formData.description || null,
        cover_image_url: formData.coverImageUrl,
        is_public: formData.isPublic,
      });

      navigate(`/collections/${id}`);
    } catch (err) {
      console.error("Failed to update collection:", err);
      setError("Failed to update collection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: T.bgDeep,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          <p style={{ color: T.txtM }}>Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !isOwner) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
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
              marginBottom: "32px",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div
            style={{
              padding: "40px 24px",
              borderRadius: "12px",
              backgroundColor: T.bgCard,
              border: `1px solid ${T.error}`,
              textAlign: "center",
            }}
          >
            <p style={{ color: T.error, fontWeight: 600, fontSize: "16px" }}>
              {error || "You don't have permission to edit this collection"}
            </p>
          </div>
        </div>
      </div>
    );
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
            Edit Collection
          </h1>
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

          {/* ── Current Instruments Section ──────────────────────────── */}
          <div style={{ marginTop: "40px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: T.txt,
                fontFamily: "'Playfair Display', serif",
                marginBottom: "16px",
              }}
            >
              Current Instruments ({instruments.length})
            </h2>

            {instruments.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "32px",
                }}
              >
                {instruments.map((inst) => (
                  <InstrumentItem
                    key={inst.id}
                    instrument={inst}
                    onRemove={handleRemoveInstrument}
                    isRemoving={removingId === inst.id}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "24px",
                  borderRadius: "10px",
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  textAlign: "center",
                  marginBottom: "32px",
                }}
              >
                <p
                  style={{
                    color: T.txtM,
                    fontSize: "14px",
                  }}
                >
                  No instruments in this collection yet
                </p>
              </div>
            )}

            {/* Add Instruments Button */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "10px",
                backgroundColor: T.warm,
                color: T.bgDeep,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <Plus size={16} /> Add More Instruments
            </button>
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
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
        selectedIds={new Set(instruments.map((i) => i.id))}
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
