import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Loader2, AlertTriangle, Camera, X, Trash2,
  ChevronDown,
} from "lucide-react";
import { T } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import { getInstrument, updateInstrument } from "../lib/supabase/instruments";
import { supabase } from "../lib/supabase/client";

const INSTRUMENT_TYPES = [
  "Electric Guitar", "Acoustic Guitar", "Classical Guitar",
  "Bass", "12-String", "Semi-Hollow", "Hollow Body", "Other",
];
const PICKUP_CONFIGS = ["SSS", "HSS", "HSH", "HH", "SS", "H", "P90", "P90×2", "Other"];
const BODY_TYPES = [
  "Solid Body", "Semi-Hollow", "Hollow Body",
  "Acoustic", "Classical", "Bass", "12-String",
];

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  border: `1px solid ${T.border}`, backgroundColor: T.bgCard,
  color: T.txt, fontSize: "13px", boxSizing: "border-box",
  fontFamily: "inherit",
};

function FormField({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: T.txt, marginBottom: "6px" }}>
        {label} {required && <span style={{ color: T.warm }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: "12px", color: T.txtM, margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function SectionHeader({ title, style: extraStyle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", marginTop: "8px", ...extraStyle }}>
      <h3 style={{
        fontFamily: "'Playfair Display', serif", fontSize: "18px",
        fontWeight: 700, color: T.txt, margin: 0, whiteSpace: "nowrap",
      }}>
        {title}
      </h3>
      <div style={{ flex: 1, height: "1px", backgroundColor: T.border }} />
    </div>
  );
}

export default function EditInstrument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [instrument, setInstrument] = useState(null);

  const [formData, setFormData] = useState({
    make: "", model: "", year: "",
    instrument_type: "", condition: "Excellent",
    bodyType: "", finish: "", color: "",
    pickupConfig: "", country: "",
    description: "",
    specs: {},
  });
  const [newPhoto, setNewPhoto] = useState(null);

  // Load instrument data
  useEffect(() => {
    const loadInstrument = async () => {
      try {
        setLoading(true);
        const data = await getInstrument(id);
        if (!data) {
          setError("Instrument not found");
          return;
        }
        if (user && data.current_owner_id !== user.id) {
          setError("You can only edit instruments you own");
          return;
        }
        setInstrument(data);
        setFormData({
          make: data.make || "",
          model: data.model || "",
          year: data.year ? String(data.year) : "",
          instrument_type: data.custom_fields?.instrument_type || "",
          condition: data.custom_fields?.condition || "Excellent",
          bodyType: data.custom_fields?.instrument_type || "",
          finish: data.specs?.finish || "",
          color: data.specs?.color || "",
          pickupConfig: data.specs?.pickup_config || "",
          country: data.custom_fields?.country || "",
          description: data.description || "",
          specs: data.specs || {},
        });
      } catch (err) {
        console.error("Failed to load instrument:", err);
        setError(err.message || "Failed to load instrument");
      } finally {
        setLoading(false);
      }
    };
    if (user) loadInstrument();
  }, [id, user]);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateSpec = (field, value) => setFormData(prev => ({
    ...prev, specs: { ...prev.specs, [field]: value },
  }));

  const handlePhotoChange = useCallback((files) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewPhoto({ file, preview: URL.createObjectURL(file) });
    }
  }, []);

  const handleSubmit = async () => {
    if (!user) { setError("You must be logged in"); return; }
    if (!formData.make || !formData.model) { setError("Make and model are required"); return; }

    setSaving(true);
    setError(null);

    try {
      let mainImageUrl = instrument.main_image_url;

      // Upload new photo if changed
      if (newPhoto) {
        const filename = `${user.id}/${Date.now()}-${newPhoto.file.name}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("instrument-images")
          .upload(filename, newPhoto.file);
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("instrument-images")
          .getPublicUrl(uploadData.path);
        mainImageUrl = urlData.publicUrl;
      }

      const updates = {
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        description: formData.description,
        main_image_url: mainImageUrl,
        specs: {
          ...formData.specs,
          finish: formData.finish || undefined,
          color: formData.color || undefined,
        },
        custom_fields: {
          ...(instrument.custom_fields || {}),
          instrument_type: formData.instrument_type || formData.bodyType || undefined,
          condition: formData.condition || undefined,
          country: formData.country || undefined,
        },
      };

      await updateInstrument(id, updates);
      setSuccess(true);
      setTimeout(() => navigate(`/instrument/${id}`), 1500);
    } catch (err) {
      console.error("Failed to update instrument:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} style={{ color: T.warm, animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error (no instrument or not owner)
  if (error && !instrument) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <AlertTriangle size={48} style={{ color: T.warm, opacity: 0.6 }} />
        <p style={{ color: T.txt, fontSize: "18px", fontWeight: 600 }}>{error}</p>
        <Link to="/explore" style={{ color: T.warm, textDecoration: "none", fontSize: "14px" }}>Back to Explore</Link>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          backgroundColor: "#4CAF5020", border: "2px solid #4CAF50",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Save size={28} style={{ color: "#4CAF50" }} />
        </div>
        <p style={{ color: T.txt, fontSize: "20px", fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>Changes saved!</p>
        <p style={{ color: T.txt2, fontSize: "14px" }}>Redirecting back to your instrument...</p>
      </div>
    );
  }

  const currentImage = newPhoto?.preview || instrument?.main_image_url;

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "24px", borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgCard }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            to={`/instrument/${id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: T.txt2, textDecoration: "none", fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: T.txt, margin: 0 }}>
            Edit Instrument
          </h1>
          <div style={{ width: "60px" }} />
        </div>
      </div>

      <div style={{ padding: "32px 24px", maxWidth: "42rem", margin: "0 auto" }}>
        {/* Error banner */}
        {error && (
          <div style={{
            padding: "14px 16px", marginBottom: "24px", borderRadius: "8px",
            backgroundColor: "#7F1D1D20", border: "1px solid #7F1D1D40",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <AlertTriangle size={18} style={{ color: "#F87171", flexShrink: 0 }} />
            <p style={{ color: "#F87171", margin: 0, fontSize: "13px" }}>{error}</p>
          </div>
        )}

        {/* Current Photo */}
        <div style={{ marginBottom: "24px" }}>
          <FormField label="Photo">
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              {currentImage && (
                <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                  <img src={currentImage} alt="Instrument" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {newPhoto && (
                    <button onClick={() => setNewPhoto(null)} style={{
                      position: "absolute", top: "4px", right: "4px", width: "24px", height: "24px",
                      borderRadius: "50%", backgroundColor: "#EF4444", border: "none", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
                    }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${T.border}`, borderRadius: "12px", padding: "24px",
                  textAlign: "center", cursor: "pointer", flex: 1,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file" accept="image/*"
                  onChange={(e) => handlePhotoChange(e.target.files)}
                  style={{ display: "none" }}
                />
                <Camera size={24} style={{ color: T.warm, marginBottom: "8px" }} />
                <p style={{ color: T.txt, fontWeight: 600, fontSize: "13px", margin: "0 0 4px" }}>
                  {currentImage ? "Replace photo" : "Upload photo"}
                </p>
                <p style={{ color: T.txtM, fontSize: "11px", margin: 0 }}>PNG, JPG up to 10MB</p>
              </div>
            </div>
          </FormField>
        </div>

        {/* Basic Info */}
        <SectionHeader title="Basic Info" />

        <FormField label="Make" required>
          <input type="text" value={formData.make} onChange={(e) => updateField("make", e.target.value)} placeholder="e.g., Fender" style={inputStyle} />
        </FormField>
        <FormField label="Model" required>
          <input type="text" value={formData.model} onChange={(e) => updateField("model", e.target.value)} placeholder="e.g., Stratocaster" style={inputStyle} />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Year">
            <input type="text" value={formData.year} onChange={(e) => updateField("year", e.target.value)} placeholder="e.g., 2020" style={inputStyle} />
          </FormField>
          <FormField label="Color">
            <input type="text" value={formData.color} onChange={(e) => updateField("color", e.target.value)} placeholder="e.g., Sunburst" style={inputStyle} />
          </FormField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Body Type">
            <select value={formData.bodyType} onChange={(e) => updateField("bodyType", e.target.value)} style={inputStyle}>
              <option value="">Select...</option>
              {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Pickup Config">
            <select value={formData.pickupConfig} onChange={(e) => updateField("pickupConfig", e.target.value)} style={inputStyle}>
              <option value="">Select...</option>
              {PICKUP_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Country">
            <input type="text" value={formData.country} onChange={(e) => updateField("country", e.target.value)} placeholder="e.g., USA" style={inputStyle} />
          </FormField>
          <FormField label="Finish">
            <input type="text" value={formData.finish} onChange={(e) => updateField("finish", e.target.value)} placeholder="e.g., Gloss Nitro" style={inputStyle} />
          </FormField>
        </div>

        <FormField label="Condition">
          <select value={formData.condition} onChange={(e) => updateField("condition", e.target.value)} style={inputStyle}>
            <option value="Mint">Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </FormField>

        {/* Specifications */}
        <SectionHeader title="Specifications" style={{ marginTop: "16px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Body Wood">
            <input type="text" value={formData.specs.body_material || ""} onChange={(e) => updateSpec("body_material", e.target.value)} placeholder="e.g., Alder" style={inputStyle} />
          </FormField>
          <FormField label="Neck Wood">
            <input type="text" value={formData.specs.neck_material || ""} onChange={(e) => updateSpec("neck_material", e.target.value)} placeholder="e.g., Maple" style={inputStyle} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Fretboard">
            <input type="text" value={formData.specs.fretboard_material || ""} onChange={(e) => updateSpec("fretboard_material", e.target.value)} placeholder="e.g., Rosewood" style={inputStyle} />
          </FormField>
          <FormField label="Scale Length">
            <input type="text" value={formData.specs.scale_length || ""} onChange={(e) => updateSpec("scale_length", e.target.value)} placeholder='e.g., 25.5"' style={inputStyle} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Frets">
            <input type="text" value={formData.specs.frets || ""} onChange={(e) => updateSpec("frets", e.target.value)} placeholder="e.g., 22" style={inputStyle} />
          </FormField>
          <FormField label="Bridge">
            <input type="text" value={formData.specs.bridge || ""} onChange={(e) => updateSpec("bridge", e.target.value)} placeholder="e.g., Vintage Tremolo" style={inputStyle} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Pickups">
            <input type="text" value={formData.specs.pickups || ""} onChange={(e) => updateSpec("pickups", e.target.value)} placeholder="e.g., Lollar Specials" style={inputStyle} />
          </FormField>
          <FormField label="Tuners">
            <input type="text" value={formData.specs.tuners || ""} onChange={(e) => updateSpec("tuners", e.target.value)} placeholder="e.g., Gotoh Vintage" style={inputStyle} />
          </FormField>
        </div>

        {/* Story */}
        <SectionHeader title="Story" style={{ marginTop: "16px" }} />
        <FormField label="Description" hint="What's the story behind this instrument?">
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="How did you get it? What does it mean to you?"
            rows={5}
            style={{ ...inputStyle, fontSize: "14px", lineHeight: 1.6, minHeight: "120px", resize: "vertical" }}
          />
        </FormField>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: "100%", marginTop: "24px", padding: "16px",
            borderRadius: "12px", border: "none",
            backgroundColor: saving ? T.border : T.warm, color: T.bgDeep,
            fontWeight: 700, fontSize: "16px",
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            opacity: saving ? 0.6 : 1,
            transition: "all 0.2s",
          }}
        >
          {saving ? (
            <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
          ) : (
            <><Save size={20} /> Save Changes</>
          )}
        </button>

        <Link
          to={`/instrument/${id}`}
          style={{
            display: "block", textAlign: "center", marginTop: "16px",
            color: T.txtM, fontSize: "13px", textDecoration: "none",
          }}
        >
          Cancel
        </Link>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
