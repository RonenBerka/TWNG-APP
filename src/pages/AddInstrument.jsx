import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, X, Check, Camera, Sparkles,
  AlertTriangle, Loader, Image, Edit3, ChevronDown,
  ChevronRight, Mic, Plus, Eye
} from "lucide-react";
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { createInstrument } from '../lib/supabase/instruments';
import { supabase } from '../lib/supabase/client';

// ============================================================
// CONSTANTS
// ============================================================
const STEPS = ['capture', 'processing', 'results', 'edit', 'story', 'success'];

const INSTRUMENT_TYPES = [
  "Electric Guitar", "Acoustic Guitar", "Classical Guitar",
  "Bass", "12-String", "Semi-Hollow", "Hollow Body", "Other"
];

const PICKUP_CONFIGS = ["SSS", "HSS", "HSH", "HH", "SS", "H", "P90", "P90×2", "Other"];

const BODY_TYPES = [
  "Solid Body", "Semi-Hollow", "Hollow Body",
  "Acoustic", "Classical", "Bass", "12-String"
];

const PROCESSING_MESSAGES = [
  "Uploading...",
  "Analyzing...",
  "Identifying your guitar...",
  "Reading headstock...",
  "Matching specifications...",
  "Almost there...",
];

// ============================================================
// ConfidenceBar Component
// ============================================================
function ConfidenceBar({ value, size = "normal" }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 70 ? "#4CAF50" : pct >= 40 ? "#FFC107" : "#FF5252";
  const height = size === "small" ? "4px" : "8px";
  const fontSize = size === "small" ? "11px" : "13px";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
      <div style={{
        flex: 1, height, borderRadius: "999px",
        backgroundColor: `${T.border}`,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          backgroundColor: color, borderRadius: "999px",
          transition: "width 1s ease-out",
        }} />
      </div>
      <span style={{
        fontSize, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        color, minWidth: "38px", textAlign: "right",
      }}>
        {pct}%
      </span>
    </div>
  );
}

// ============================================================
// FormField Component
// ============================================================
function FormField({ label, required, hint, children, confidence }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <label style={{
          fontSize: "13px", fontWeight: 600, color: T.txt,
        }}>
          {label} {required && <span style={{ color: T.warm }}>*</span>}
        </label>
        {confidence !== undefined && (
          <div style={{ width: "80px" }}>
            <ConfidenceBar value={confidence} size="small" />
          </div>
        )}
      </div>
      {children}
      {hint && (
        <p style={{ fontSize: "12px", color: T.txtM, margin: "4px 0 0" }}>{hint}</p>
      )}
    </div>
  );
}

// ============================================================
// Input style helper
// ============================================================
const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  border: `1px solid ${T.border}`, backgroundColor: T.bgCard,
  color: T.txt, fontSize: "13px", boxSizing: "border-box",
  fontFamily: "inherit",
};

// ============================================================
// Main Component
// ============================================================
export default function AddInstrument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // -- Core state --
  const [step, setStep] = useState('capture');
  const [photos, setPhotos] = useState([]);       // [{file, preview}]
  const [analysis, setAnalysis] = useState(null);  // AI result
  const [formData, setFormData] = useState({
    make: "", model: "", year: "",
    instrument_type: "", condition: "Excellent",
    bodyType: "", finish: "", color: "",
    pickupConfig: "", country: "",
    description: "",
    specs: {},
  });
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingMsg, setProcessingMsg] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // -- Processing message cycling --
  useEffect(() => {
    if (step !== 'processing') return;
    const interval = setInterval(() => {
      setProcessingMsg(prev => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  // ============================================================
  // Photo handling
  // ============================================================
  const addPhotos = useCallback((files) => {
    const newPhotos = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 5 - photos.length)
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    if (newPhotos.length > 0) setPhotos(prev => [...prev, ...newPhotos]);
  }, [photos.length]);

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag-and-drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addPhotos(e.dataTransfer.files);
  };

  // ============================================================
  // AI Analysis — calls analyze-guitar Edge Function
  // ============================================================
  const analyzePhotos = async () => {
    setStep('processing');
    setProcessingMsg(0);
    setError(null);

    try {
      // Convert photos to base64
      const photoBase64 = await Promise.all(
        photos.slice(0, 5).map(photo => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photo.file);
        }))
      );

      // Call the Edge Function
      const { data, error: fnError } = await supabase.functions.invoke('analyze-guitar', {
        body: { photoBase64 },
      });

      // Extract real error from function response
      if (fnError) {
        let msg = fnError.message || 'Analysis failed';
        try {
          // supabase-js wraps non-2xx in FunctionsHttpError — extract body
          if (fnError.context) {
            const body = await fnError.context.json();
            if (body?.error) msg = body.error;
          }
        } catch { /* ignore parse errors */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);

      setAnalysis(data);

      // Map AI results → form data
      setFormData({
        make: data.brand?.value || "",
        model: data.model?.value || "",
        year: data.year?.value || "",
        instrument_type: data.bodyType?.value || "",
        condition: "Excellent",
        bodyType: data.bodyType?.value || "",
        finish: data.finish?.value || "",
        color: data.color?.value || "",
        pickupConfig: data.pickupConfig?.value || "",
        country: data.country?.value || "",
        description: "",
        specs: {
          body_material: data.bodyWood?.value || "",
          top_material: data.topWood?.value || "",
          neck_material: data.neckWood?.value || "",
          fretboard_material: data.fretboardWood?.value || "",
          neck_profile: data.neckProfile?.value || "",
          scale_length: data.scaleLength?.value || "",
          frets: data.frets?.value || "",
          pickups: data.pickups?.value || "",
          pickup_config: data.pickupConfig?.value || "",
          bridge: data.bridge?.value || "",
          bridge_type: data.bridgeType?.value || "",
          tuners: data.tuners?.value || "",
          nut_material: data.nutMaterial?.value || "",
          hardware_finish: data.hardwareFinish?.value || "",
          controls: data.controls?.value || "",
        },
      });

      // Minimum delay for satisfaction
      await new Promise(r => setTimeout(r, 1500));
      setStep('results');
    } catch (err) {
      console.error('Magic Add analysis failed:', err);
      setError(err.message || 'Failed to analyze photo');
      setStep('capture');
    }
  };

  // ============================================================
  // Submit — upload photo & create instrument
  // ============================================================
  const handleSubmit = async () => {
    if (!user) { setError("You must be logged in"); return; }
    if (!formData.make || !formData.model) { setError("Make and model are required"); return; }

    setLoading(true);
    setError(null);

    try {
      // Upload main photo
      let mainImageUrl = null;
      if (photos.length > 0) {
        const photoFile = photos[0].file;
        const filename = `${user.id}/${Date.now()}-${photoFile.name}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('instrument-images')
          .upload(filename, photoFile);
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('instrument-images')
          .getPublicUrl(uploadData.path);
        mainImageUrl = urlData.publicUrl;
      }

      // Build instrument data — only columns that exist on the table
      const instrumentData = {
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        description: story || formData.description || "",
        specs: {
          ...formData.specs,
          finish: formData.finish || undefined,
          color: formData.color || undefined,
        },
        custom_fields: {
          instrument_type: formData.instrument_type || formData.bodyType || undefined,
          condition: formData.condition || undefined,
          country: formData.country || undefined,
          ai_confidence: analysis?.confidence || undefined,
          source: 'magic_add',
        },
        uploader_id: user.id,
        current_owner_id: user.id,
        main_image_url: mainImageUrl,
        moderation_status: 'pending',
      };

      const result = await createInstrument(instrumentData);
      setStep('success');

      // Delayed navigation
      setTimeout(() => navigate(`/instrument/${result.id}`), 3000);
    } catch (err) {
      console.error('Failed to create instrument:', err);
      setError(err.message || 'Failed to save instrument');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Field updater helpers
  // ============================================================
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateSpec = (field, value) => setFormData(prev => ({
    ...prev, specs: { ...prev.specs, [field]: value },
  }));

  // ============================================================
  // RENDER — Capture Screen
  // ============================================================
  if (step === 'capture') {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{
          padding: "24px", borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgCard,
        }}>
          <div style={{
            maxWidth: "42rem", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Link to="/explore" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              color: T.txt2, textDecoration: "none", fontSize: "14px",
            }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={20} style={{ color: T.warm }} />
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "24px",
                fontWeight: 700, color: T.txt, margin: 0,
              }}>
                Magic Add
              </h1>
            </div>
            <div style={{ width: "60px" }} />
          </div>
        </div>

        <div style={{ padding: "48px 24px", maxWidth: "42rem", margin: "0 auto" }}>
          {/* Error */}
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

          {/* Subtitle */}
          <p style={{
            textAlign: "center", color: T.txt2, fontSize: "15px",
            marginBottom: "32px", lineHeight: 1.6,
          }}>
            Snap a photo and let AI identify your guitar automatically
          </p>

          {/* Drop zone */}
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? T.warm : T.border}`,
              borderRadius: "16px", padding: "48px 24px",
              textAlign: "center", cursor: "pointer",
              backgroundColor: dragOver ? `${T.warm}10` : "transparent",
              transition: "all 0.2s",
            }}
          >
            <input
              ref={fileInputRef}
              type="file" multiple accept="image/*"
              onChange={(e) => addPhotos(e.target.files)}
              style={{ display: "none" }}
            />
            <Camera size={40} style={{ color: T.warm, marginBottom: "16px" }} />
            <p style={{ color: T.txt, fontWeight: 600, fontSize: "16px", marginBottom: "8px" }}>
              Take Photo or Choose from Gallery
            </p>
            <p style={{ color: T.txtM, fontSize: "13px", margin: 0 }}>
              Center your guitar in the frame &middot; PNG, JPG up to 10MB
            </p>
          </div>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px", marginTop: "24px",
            }}>
              {photos.map((photo, idx) => (
                <div key={idx} style={{
                  position: "relative", paddingBottom: "100%",
                  backgroundColor: T.bgCard, borderRadius: "10px", overflow: "hidden",
                }}>
                  <img src={photo.preview} alt={`Preview ${idx + 1}`} style={{
                    position: "absolute", top: 0, left: 0,
                    width: "100%", height: "100%", objectFit: "cover",
                  }} />
                  <button onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} style={{
                    position: "absolute", top: "6px", right: "6px",
                    width: "24px", height: "24px", borderRadius: "50%",
                    backgroundColor: "#EF4444", border: "none", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0,
                  }}>
                    <X size={14} />
                  </button>
                  {idx === 0 && (
                    <span style={{
                      position: "absolute", bottom: "6px", left: "6px",
                      padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                      backgroundColor: T.warm, color: T.bgDeep, fontWeight: 700,
                    }}>MAIN</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Analyze button */}
          {photos.length > 0 && (
            <button
              onClick={analyzePhotos}
              style={{
                width: "100%", marginTop: "32px", padding: "16px",
                borderRadius: "12px", border: "none",
                backgroundColor: T.warm, color: T.bgDeep,
                fontWeight: 700, fontSize: "16px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                transition: "all 0.2s",
              }}
            >
              <Sparkles size={20} />
              Identify My Guitar
            </button>
          )}

          {/* Skip AI link */}
          <button
            onClick={() => setStep('edit')}
            style={{
              display: "block", margin: "20px auto 0", padding: "8px",
              background: "none", border: "none", cursor: "pointer",
              color: T.txtM, fontSize: "13px", textDecoration: "underline",
            }}
          >
            Skip AI — add manually
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — Processing Screen
  // ============================================================
  if (step === 'processing') {
    return (
      <div style={{
        backgroundColor: T.bgDeep, minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        {/* Photo preview (dimmed) */}
        {photos[0] && (
          <div style={{
            width: "200px", height: "200px", borderRadius: "16px",
            overflow: "hidden", marginBottom: "32px", opacity: 0.4,
            filter: "blur(2px)",
          }}>
            <img src={photos[0].preview} alt="Analyzing" style={{
              width: "100%", height: "100%", objectFit: "cover",
            }} />
          </div>
        )}

        {/* Animated loader */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <Sparkles size={48} style={{
            color: T.warm,
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </div>

        {/* Processing message */}
        <p style={{
          color: T.txt, fontSize: "18px", fontWeight: 600,
          marginBottom: "8px", textAlign: "center",
          fontFamily: "'Playfair Display', serif",
        }}>
          {PROCESSING_MESSAGES[processingMsg]}
        </p>
        <p style={{ color: T.txtM, fontSize: "13px", textAlign: "center" }}>
          This usually takes a few seconds
        </p>

        {/* CSS animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  // ============================================================
  // RENDER — Results Screen
  // ============================================================
  if (step === 'results') {
    const conf = analysis?.confidence || 0;

    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
        <div style={{ padding: "24px", maxWidth: "42rem", margin: "0 auto" }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", marginBottom: "32px", paddingTop: "24px",
          }}>
            <Sparkles size={22} style={{ color: T.warm }} />
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "24px",
              fontWeight: 700, color: T.txt, margin: 0,
            }}>
              We found your guitar!
            </h2>
          </div>

          {/* Photo */}
          {photos[0] && (
            <div style={{
              borderRadius: "16px", overflow: "hidden", marginBottom: "24px",
              maxHeight: "360px",
            }}>
              <img src={photos[0].preview} alt="Your guitar" style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
            </div>
          )}

          {/* Identification card */}
          <div style={{
            padding: "24px", backgroundColor: T.bgCard, borderRadius: "16px",
            border: `1px solid ${T.border}`,
          }}>
            {/* Brand + Model */}
            <p style={{
              fontSize: "13px", color: T.txtM, margin: "0 0 4px",
              fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}>
              {formData.make}
            </p>
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "28px",
              fontWeight: 700, color: T.txt, margin: "0 0 20px",
            }}>
              {formData.model}
            </h3>

            {/* Details grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "14px", marginBottom: "20px",
            }}>
              {formData.year && (
                <DetailItem label="Year" value={formData.year} />
              )}
              {formData.color && (
                <DetailItem label="Color" value={formData.color} />
              )}
              {formData.pickupConfig && (
                <DetailItem label="Pickups" value={formData.pickupConfig} />
              )}
              {formData.country && (
                <DetailItem label="Made in" value={formData.country} />
              )}
              {formData.bodyType && (
                <DetailItem label="Type" value={formData.bodyType} />
              )}
              {formData.finish && (
                <DetailItem label="Finish" value={formData.finish} />
              )}
            </div>

            {/* Confidence bar */}
            <div style={{ paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
              <p style={{
                fontSize: "12px", color: T.txtM, margin: "0 0 8px",
                textTransform: "uppercase", letterSpacing: "1px",
              }}>
                Confidence
              </p>
              <ConfidenceBar value={conf} />
            </div>

            {/* AI notes */}
            {analysis?.notes && (
              <p style={{
                fontSize: "12px", color: T.txt2, marginTop: "12px",
                lineHeight: 1.5, fontStyle: "italic",
              }}>
                {analysis.notes}
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={() => setStep('story')}
            style={{
              width: "100%", marginTop: "24px", padding: "16px",
              borderRadius: "12px", border: "none",
              backgroundColor: T.warm, color: T.bgDeep,
              fontWeight: 700, fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}
          >
            <Check size={20} />
            Looks right!
          </button>

          <button
            onClick={() => setStep('edit')}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              margin: "16px auto 0", padding: "10px",
              background: "none", border: "none",
              cursor: "pointer", color: T.txt2, fontSize: "14px",
            }}
          >
            <Edit3 size={14} />
            Something wrong? Edit
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — Edit Screen
  // ============================================================
  if (step === 'edit') {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{
          padding: "24px", borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgCard,
        }}>
          <div style={{
            maxWidth: "42rem", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <button onClick={() => analysis ? setStep('results') : setStep('capture')} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              color: T.txt2, background: "none", border: "none",
              cursor: "pointer", fontSize: "14px",
            }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "22px",
              fontWeight: 700, color: T.txt, margin: 0,
            }}>
              {analysis ? "Edit Details" : "Add Instrument"}
            </h1>
            <div style={{ width: "60px" }} />
          </div>
        </div>

        <div style={{ padding: "32px 24px", maxWidth: "42rem", margin: "0 auto" }}>
          {/* Error */}
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

          {/* Photo upload (only if coming from manual add) */}
          {photos.length === 0 && (
            <div style={{ marginBottom: "24px" }}>
              <FormField label="Photos" required hint="Upload at least one photo">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${T.border}`, borderRadius: "8px",
                    padding: "24px", textAlign: "center", cursor: "pointer",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file" multiple accept="image/*"
                    onChange={(e) => addPhotos(e.target.files)}
                    style={{ display: "none" }}
                  />
                  <Camera size={28} style={{ color: T.warm, marginBottom: "8px" }} />
                  <p style={{ color: T.txt, fontWeight: 600, fontSize: "14px", margin: "0 0 4px" }}>
                    Click to upload
                  </p>
                  <p style={{ color: T.txtM, fontSize: "12px", margin: 0 }}>PNG, JPG up to 10MB</p>
                </div>
              </FormField>
            </div>
          )}

          {/* Mini photo strip */}
          {photos.length > 0 && (
            <div style={{
              display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto",
            }}>
              {photos.map((p, i) => (
                <img key={i} src={p.preview} alt="" style={{
                  width: "56px", height: "56px", borderRadius: "8px",
                  objectFit: "cover", border: `2px solid ${i === 0 ? T.warm : T.border}`,
                }} />
              ))}
            </div>
          )}

          {/* Section: Basic Info */}
          <SectionHeader title="Basic Info" />

          <FormField label="Make" required confidence={analysis?.brand?.confidence}>
            <input type="text" value={formData.make} onChange={(e) => updateField('make', e.target.value)}
              placeholder="e.g., Fender, Gibson, Nash" style={inputStyle} />
          </FormField>

          <FormField label="Model" required confidence={analysis?.model?.confidence}>
            <input type="text" value={formData.model} onChange={(e) => updateField('model', e.target.value)}
              placeholder="e.g., Stratocaster, Les Paul" style={inputStyle} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Year" confidence={analysis?.year?.confidence}>
              <input type="text" value={formData.year} onChange={(e) => updateField('year', e.target.value)}
                placeholder="e.g., 2020" style={inputStyle} />
            </FormField>
            <FormField label="Color" confidence={analysis?.color?.confidence}>
              <input type="text" value={formData.color} onChange={(e) => updateField('color', e.target.value)}
                placeholder="e.g., Sunburst" style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Body Type" confidence={analysis?.bodyType?.confidence}>
              <select value={formData.bodyType} onChange={(e) => updateField('bodyType', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Pickup Config" confidence={analysis?.pickupConfig?.confidence}>
              <select value={formData.pickupConfig} onChange={(e) => updateField('pickupConfig', e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                {PICKUP_CONFIGS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Country" confidence={analysis?.country?.confidence}>
              <input type="text" value={formData.country} onChange={(e) => updateField('country', e.target.value)}
                placeholder="e.g., USA, Japan" style={inputStyle} />
            </FormField>
            <FormField label="Finish" confidence={analysis?.finish?.confidence}>
              <input type="text" value={formData.finish} onChange={(e) => updateField('finish', e.target.value)}
                placeholder="e.g., Gloss Nitro" style={inputStyle} />
            </FormField>
          </div>

          <FormField label="Condition">
            <select value={formData.condition} onChange={(e) => updateField('condition', e.target.value)} style={inputStyle}>
              <option value="Mint">Mint</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </FormField>

          {/* Section: Specifications */}
          <SectionHeader title="Specifications" style={{ marginTop: "16px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Body Wood" confidence={analysis?.bodyWood?.confidence}>
              <input type="text" value={formData.specs.body_material || ''} onChange={(e) => updateSpec('body_material', e.target.value)}
                placeholder="e.g., Alder, Mahogany" style={inputStyle} />
            </FormField>
            <FormField label="Neck Wood" confidence={analysis?.neckWood?.confidence}>
              <input type="text" value={formData.specs.neck_material || ''} onChange={(e) => updateSpec('neck_material', e.target.value)}
                placeholder="e.g., Maple" style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Fretboard" confidence={analysis?.fretboardWood?.confidence}>
              <input type="text" value={formData.specs.fretboard_material || ''} onChange={(e) => updateSpec('fretboard_material', e.target.value)}
                placeholder="e.g., Rosewood, Maple" style={inputStyle} />
            </FormField>
            <FormField label="Scale Length" confidence={analysis?.scaleLength?.confidence}>
              <input type="text" value={formData.specs.scale_length || ''} onChange={(e) => updateSpec('scale_length', e.target.value)}
                placeholder='e.g., 25.5"' style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Frets" confidence={analysis?.frets?.confidence}>
              <input type="text" value={formData.specs.frets || ''} onChange={(e) => updateSpec('frets', e.target.value)}
                placeholder="e.g., 22" style={inputStyle} />
            </FormField>
            <FormField label="Bridge" confidence={analysis?.bridge?.confidence}>
              <input type="text" value={formData.specs.bridge || ''} onChange={(e) => updateSpec('bridge', e.target.value)}
                placeholder="e.g., Vintage Tremolo" style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="Pickups" confidence={analysis?.pickups?.confidence}>
              <input type="text" value={formData.specs.pickups || ''} onChange={(e) => updateSpec('pickups', e.target.value)}
                placeholder="e.g., Lollar Specials" style={inputStyle} />
            </FormField>
            <FormField label="Tuners" confidence={analysis?.tuners?.confidence}>
              <input type="text" value={formData.specs.tuners || ''} onChange={(e) => updateSpec('tuners', e.target.value)}
                placeholder="e.g., Gotoh Vintage" style={inputStyle} />
            </FormField>
          </div>

          {/* Save button */}
          <button
            onClick={() => {
              if (!formData.make || !formData.model) {
                setError("Make and model are required");
                return;
              }
              setError(null);
              setStep('story');
            }}
            style={{
              width: "100%", marginTop: "32px", padding: "16px",
              borderRadius: "12px", border: "none",
              backgroundColor: T.warm, color: T.bgDeep,
              fontWeight: 700, fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}
          >
            <ChevronRight size={20} />
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — Story Screen
  // ============================================================
  if (step === 'story') {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
        <div style={{ padding: "48px 24px", maxWidth: "42rem", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "28px",
            fontWeight: 700, color: T.txt, marginBottom: "8px", textAlign: "center",
          }}>
            Now for the best part...
          </h2>
          <p style={{
            color: T.txt2, fontSize: "15px", textAlign: "center",
            marginBottom: "32px", lineHeight: 1.6,
          }}>
            What's the story behind this guitar?
          </p>

          {/* Mini preview */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "16px", backgroundColor: T.bgCard, borderRadius: "12px",
            border: `1px solid ${T.border}`, marginBottom: "24px",
          }}>
            {photos[0] && (
              <img src={photos[0].preview} alt="" style={{
                width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover",
              }} />
            )}
            <div>
              <p style={{ color: T.txtM, fontSize: "12px", margin: "0 0 2px", textTransform: "uppercase" }}>
                {formData.make}
              </p>
              <p style={{ color: T.txt, fontSize: "16px", fontWeight: 600, margin: 0 }}>
                {formData.model} {formData.year && `(${formData.year})`}
              </p>
            </div>
          </div>

          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="How did you get it? What does it mean to you? Any memorable gigs, sessions, or moments?"
            rows={7}
            style={{
              ...inputStyle,
              fontSize: "14px", lineHeight: 1.6,
              minHeight: "160px", resize: "vertical",
            }}
          />

          {/* Error */}
          {error && (
            <div style={{
              padding: "14px 16px", marginTop: "16px", borderRadius: "8px",
              backgroundColor: "#7F1D1D20", border: "1px solid #7F1D1D40",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <AlertTriangle size={18} style={{ color: "#F87171", flexShrink: 0 }} />
              <p style={{ color: "#F87171", margin: 0, fontSize: "13px" }}>{error}</p>
            </div>
          )}

          {/* Save to collection */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", marginTop: "24px", padding: "16px",
              borderRadius: "12px", border: "none",
              backgroundColor: loading ? T.border : T.warm, color: T.bgDeep,
              fontWeight: 700, fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <><Loader size={20} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
            ) : (
              <><Check size={20} /> Save to Collection</>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: "block", margin: "16px auto 0", padding: "10px",
              background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer",
              color: T.txtM, fontSize: "13px",
            }}
          >
            Skip for now
          </button>

          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — Success Screen
  // ============================================================
  if (step === 'success') {
    return (
      <div style={{
        backgroundColor: T.bgDeep, minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "24px",
      }}>
        {/* Check animation */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          backgroundColor: "#4CAF5020", border: "2px solid #4CAF50",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "24px",
          animation: "scaleIn 0.4s ease-out",
        }}>
          <Check size={36} style={{ color: "#4CAF50" }} />
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "28px",
          fontWeight: 700, color: T.txt, marginBottom: "8px", textAlign: "center",
        }}>
          Added to your collection!
        </h2>

        <p style={{ color: T.txt2, fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
          Your instrument is pending review and will be live soon.
        </p>

        {/* Mini card */}
        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          padding: "16px 20px", backgroundColor: T.bgCard, borderRadius: "12px",
          border: `1px solid ${T.border}`, marginBottom: "32px",
        }}>
          {photos[0] && (
            <img src={photos[0].preview} alt="" style={{
              width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover",
            }} />
          )}
          <div>
            <p style={{ color: T.txtM, fontSize: "11px", margin: "0 0 2px", textTransform: "uppercase" }}>
              {formData.make}
            </p>
            <p style={{ color: T.txt, fontSize: "16px", fontWeight: 600, margin: 0 }}>
              {formData.model}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate('/my-collection')} style={{
            padding: "12px 24px", borderRadius: "10px", border: "none",
            backgroundColor: T.warm, color: T.bgDeep,
            fontWeight: 600, fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Eye size={16} /> View Collection
          </button>
          <button onClick={() => {
            setStep('capture'); setPhotos([]); setAnalysis(null);
            setFormData({ make: "", model: "", year: "", instrument_type: "", condition: "Excellent",
              bodyType: "", finish: "", color: "", pickupConfig: "", country: "",
              description: "", specs: {} });
            setStory(""); setError(null);
          }} style={{
            padding: "12px 24px", borderRadius: "10px",
            border: `1px solid ${T.border}`, backgroundColor: T.bgCard,
            color: T.txt, fontWeight: 600, fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Plus size={16} /> Add Another
          </button>
        </div>

        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

// ============================================================
// Helper Components
// ============================================================
function DetailItem({ label, value }) {
  return (
    <div>
      <p style={{
        fontSize: "11px", color: T.txtM, margin: "0 0 3px",
        textTransform: "uppercase", letterSpacing: "0.5px",
      }}>
        {label}
      </p>
      <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, style: extraStyle }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      marginBottom: "20px", marginTop: "8px", ...extraStyle,
    }}>
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
