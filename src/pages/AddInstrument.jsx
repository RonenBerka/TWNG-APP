import { useState, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, X, Check, ChevronDown, Camera, Sparkles,
  Calendar, AlertTriangle, Loader
} from "lucide-react";
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { createInstrument } from '../lib/supabase/instruments';
import { searchGuitarCatalog } from '../lib/supabase/guitarCatalog';
import { supabase } from '../lib/supabase/client';

// ============================================================
// CONSTANTS
// ============================================================
const STEPS = [
  { num: 1, label: "Photos", required: true },
  { num: 2, label: "Basic Info", required: true },
  { num: 3, label: "Specs", required: false },
  { num: 4, label: "Story", required: false },
  { num: 5, label: "Review", required: true },
];

const INSTRUMENT_TYPES = ["Guitar", "Bass", "Violin", "Keyboard", "Drums", "Woodwind", "Brass", "Other"];

// ============================================================
// Badge Component
// ============================================================
function Badge({ children, variant = "default" }) {
  const variants = {
    default: { background: `${T.warm}33`, color: T.warm, border: `1px solid ${T.borderAcc}` },
    outline: { background: "transparent", color: T.txt2, border: `1px solid ${T.border}` },
    active: { background: T.warm, color: T.bgDeep, border: `1px solid ${T.warm}` },
  };
  const style = variants[variant] || variants.default;
  return (
    <span style={{
      ...style,
      padding: "4px 12px",
      borderRadius: "9999px",
      fontSize: "11px",
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 500,
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

// ============================================================
// Form Field Component
// ============================================================
function FormField({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 600,
        color: T.txt,
        marginBottom: "6px",
      }}>
        {label} {required && <span style={{ color: T.warm }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{
          fontSize: "12px",
          color: T.txtM,
          marginTop: "4px",
          margin: "4px 0 0",
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Photo Upload Component
// ============================================================
function PhotoUpload({ photos, onPhotosChange }) {
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <FormField label="Photos" required hint="Upload 1+ photos of your instrument">
        <div style={{
          border: `2px dashed ${T.border}`,
          borderRadius: "8px",
          padding: "32px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" style={{ cursor: "pointer", display: "block" }}>
            <Camera size={32} style={{ color: T.warm, margin: "0 auto 12px" }} />
            <p style={{ color: T.txt, fontWeight: 600, marginBottom: "4px" }}>
              Click to upload or drag and drop
            </p>
            <p style={{ color: T.txtM, fontSize: "12px" }}>
              PNG, JPG up to 10MB
            </p>
          </label>
        </div>
      </FormField>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginTop: "16px",
        }}>
          {photos.map((photo, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
                backgroundColor: T.bgCard,
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={photo.preview}
                alt={`Preview ${idx}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => removePhoto(idx)}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#EF4444",
                  border: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================
export default function AddInstrument() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    instrument_type: "Guitar",
    condition: "Excellent",
    description: "",
    specs: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to add an instrument");
      return;
    }

    if (!formData.make || !formData.model) {
      setError("Make and model are required");
      return;
    }

    setLoading(true);
    try {
      // Upload photos if any
      let mainImageUrl = null;
      if (photos.length > 0) {
        const photoFile = photos[0].file;
        const filename = `${user.id}/${Date.now()}-${photoFile.name}`;
        const { data, error: uploadErr } = await supabase.storage
          .from('instrument-images')
          .upload(filename, photoFile);

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from('instrument-images')
          .getPublicUrl(data.path);
        mainImageUrl = urlData.publicUrl;
      }

      // Create instrument
      const instrumentData = {
        ...formData,
        uploader_id: user.id,
        current_owner_id: user.id,
        main_image_url: mainImageUrl,
        moderation_status: 'pending',
      };

      const result = await createInstrument(instrumentData);

      // Navigate to new instrument
      navigate(`/instrument/${result.id}`);
    } catch (err) {
      console.error('Failed to create instrument:', err);
      setError(err.message || 'Failed to create instrument');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) return photos.length > 0;
    if (currentStep === 2) return formData.make && formData.model && formData.year;
    return true;
  };

  const canProceed = isStepValid();

  return (
    <div style={{ backgroundColor: T.bgDeep, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        padding: "24px",
        borderBottom: `1px solid ${T.border}`,
        backgroundColor: T.bgCard,
      }}>
        <div style={{
          maxWidth: "80rem",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link to="/explore" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: T.txt2,
            textDecoration: "none",
            fontSize: "14px",
          }}>
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 700,
            color: T.txt,
            margin: 0,
          }}>
            Add Instrument
          </h1>
          <div style={{ width: "40px" }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        padding: "48px 24px",
        maxWidth: "80rem",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        {/* Steps */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "48px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {STEPS.map((step) => (
            <button
              key={step.num}
              onClick={() => currentStep <= step.num && setCurrentStep(step.num)}
              disabled={currentStep > step.num && !isStepValid()}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: currentStep === step.num ? T.warm : T.bgCard,
                color: currentStep === step.num ? T.bgDeep : T.txt,
                fontWeight: 600,
                fontSize: "12px",
                cursor: currentStep <= step.num ? "pointer" : "not-allowed",
                opacity: currentStep > step.num ? 0.5 : 1,
                transition: "all 0.2s",
              }}
            >
              {step.num}. {step.label}
              {step.required && <span style={{ color: T.warm }}>*</span>}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: "16px",
            marginBottom: "24px",
            backgroundColor: "#7F1D1D20",
            border: "1px solid #7F1D1D40",
            borderRadius: "8px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}>
            <AlertTriangle size={20} style={{ color: "#F87171", flexShrink: 0 }} />
            <p style={{ color: "#F87171", margin: 0, fontSize: "14px" }}>
              {error}
            </p>
          </div>
        )}

        {/* Step 1: Photos */}
        {currentStep === 1 && (
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "24px",
            }}>
              Upload Photos
            </h2>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "24px",
            }}>
              Basic Information
            </h2>

            <FormField label="Make" required>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                placeholder="e.g., Fender, Gibson, Martin"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="Model" required>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., Stratocaster, Les Paul, D-28"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="Year" required>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                min="1800"
                max={new Date().getFullYear()}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="Instrument Type">
              <select
                value={formData.instrument_type}
                onChange={(e) => handleInputChange('instrument_type', e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              >
                {INSTRUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Condition">
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              >
                <option value="Mint">Mint</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </FormField>
          </div>
        )}

        {/* Step 3: Specs */}
        {currentStep === 3 && (
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "24px",
            }}>
              Specifications
            </h2>

            <FormField label="Body Material" hint="e.g., Mahogany, Spruce, Ash">
              <input
                type="text"
                value={formData.specs.body_material || ''}
                onChange={(e) => handleSpecsChange('body_material', e.target.value)}
                placeholder="e.g., Mahogany"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="Finish">
              <input
                type="text"
                value={formData.specs.finish || ''}
                onChange={(e) => handleSpecsChange('finish', e.target.value)}
                placeholder="e.g., Gloss Lacquer, Natural Oil"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="Scale Length">
              <input
                type="text"
                value={formData.specs.scale_length || ''}
                onChange={(e) => handleSpecsChange('scale_length', e.target.value)}
                placeholder="e.g., 25.5 inches"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="Pickups">
              <input
                type="text"
                value={formData.specs.pickups || ''}
                onChange={(e) => handleSpecsChange('pickups', e.target.value)}
                placeholder="e.g., Humbucker, Single Coil"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Story */}
        {currentStep === 4 && (
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "24px",
            }}>
              The Story
            </h2>

            <FormField label="Description" hint="Tell the story of this instrument">
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="How did you get this instrument? What makes it special? Any interesting history?"
                rows={8}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  backgroundColor: T.bgCard,
                  color: T.txt,
                  fontSize: "13px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </FormField>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div style={{ maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 700,
              color: T.txt,
              marginBottom: "24px",
            }}>
              Review
            </h2>

            <div style={{
              padding: "24px",
              backgroundColor: T.bgCard,
              borderRadius: "8px",
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: T.txtM, margin: "0 0 4px", textTransform: "uppercase" }}>
                    Make
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
                    {formData.make}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: T.txtM, margin: "0 0 4px", textTransform: "uppercase" }}>
                    Model
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
                    {formData.model}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: T.txtM, margin: "0 0 4px", textTransform: "uppercase" }}>
                    Year
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
                    {formData.year}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: T.txtM, margin: "0 0 4px", textTransform: "uppercase" }}>
                    Type
                  </p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
                    {formData.instrument_type}
                  </p>
                </div>
              </div>
            </div>

            <p style={{
              fontSize: "12px",
              color: T.txtM,
              marginTop: "16px",
              lineHeight: "1.625",
            }}>
              Your instrument will be submitted for review and appear on the site once approved by our moderation team.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "space-between",
          marginTop: "48px",
          maxWidth: "42rem",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: `1px solid ${T.border}`,
              backgroundColor: T.bgCard,
              color: T.txt,
              fontWeight: 600,
              fontSize: "14px",
              cursor: currentStep === 1 ? "not-allowed" : "pointer",
              opacity: currentStep === 1 ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: canProceed ? T.warm : T.border,
                color: T.bgDeep,
                fontWeight: 600,
                fontSize: "14px",
                cursor: canProceed ? "pointer" : "not-allowed",
                opacity: canProceed ? 1 : 0.5,
                transition: "all 0.2s",
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: loading ? T.border : T.warm,
                color: T.bgDeep,
                fontWeight: 600,
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Submit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
