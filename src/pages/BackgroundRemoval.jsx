import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Download, AlertCircle, ArrowLeft, Loader, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROUTES } from '../lib/routes';

function BackgroundRemovalContent() {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef(null);

  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [apiNotConfigured, setApiNotConfigured] = useState(false);

  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a JPEG, PNG, or WebP image');
    }
    if (file.size > maxFileSize) {
      throw new Error('File size must be less than 5MB');
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (file) => {
    setError(null);
    setApiNotConfigured(false);

    try {
      validateFile(file);
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setProcessedImage(null);
    } catch (err) {
      console.error('File selection error:', err);
      setError(err.message || 'Failed to load image');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) {
      setError('Please upload an image first');
      return;
    }

    setError(null);
    setApiNotConfigured(false);
    setLoading(true);

    try {
      // Call Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('remove-background', {
        body: {
          imageBase64: originalImage,
        },
      });

      if (functionError) {
        if (functionError.message && functionError.message.includes('API key')) {
          setApiNotConfigured(true);
          throw new Error('Background removal service is not configured. Please contact support.');
        }
        throw functionError;
      }

      if (!data || !data.imageBase64) {
        throw new Error('Failed to process image');
      }

      setProcessedImage(data.imageBase64);
    } catch (err) {
      console.error('Background removal error:', err);
      setError(err.message || 'Failed to remove background. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'guitar-no-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        background: T.bgDeep,
        minHeight: '100vh',
        color: T.txt,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
        `}
      </style>

      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}
      >
        <Link
          to={ROUTES.HOME}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: T.warm,
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{
          textAlign: 'center',
          padding: '80px 24px 60px',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: `${T.warm}15`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${T.borderAcc}`,
            }}
          >
            <ImageIcon size={28} color={T.warm} />
          </div>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '12px',
            color: T.txt,
          }}
        >
          Background Removal
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: T.txtM,
            lineHeight: 1.6,
            marginBottom: '48px',
          }}
        >
          Remove backgrounds from guitar photos instantly. Perfect for creating clean product photos and listings.
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        {apiNotConfigured && (
          <div
            style={{
              background: '#92400E15',
              border: `1px solid #D97706`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>
                Service Not Configured
              </p>
              <p style={{ fontSize: '12px', color: T.txtM, marginTop: '2px' }}>
                Background removal service requires API configuration. Please contact support to enable this feature.
              </p>
            </div>
          </div>
        )}

        {error && !apiNotConfigured && (
          <div
            style={{
              background: '#7F1D1D15',
              border: `1px solid #EF4444`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>
                Error
              </p>
              <p style={{ fontSize: '12px', color: T.txtM, marginTop: '2px' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Upload Section */}
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '24px',
                color: T.txt,
              }}
            >
              Upload Image
            </h2>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !originalImage && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? T.warm : T.border}`,
                borderRadius: '12px',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragActive ? `${T.warm}11` : 'transparent',
                marginBottom: '16px',
              }}
              onMouseEnter={(e) => !originalImage && (e.currentTarget.style.borderColor = T.warm)}
              onMouseLeave={(e) => !originalImage && (e.currentTarget.style.borderColor = T.border)}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />

              {originalImage ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Check size={32} color="#10B981" />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
                    Image loaded
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOriginalImage(null);
                      setProcessedImage(null);
                      setError(null);
                    }}
                    style={{
                      fontSize: '12px',
                      color: T.warm,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginTop: '4px',
                    }}
                  >
                    Upload different image
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Upload size={32} color={T.txtM} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: T.txt }}>
                      Drag and drop your image
                    </p>
                    <p style={{ fontSize: '12px', color: T.txtM, marginTop: '4px' }}>
                      or click to browse
                    </p>
                  </div>
                  <p style={{ fontSize: '11px', color: T.txtM, marginTop: '8px' }}>
                    JPEG, PNG or WebP • Max 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Remove Background Button */}
            {originalImage && !processedImage && (
              <button
                onClick={handleRemoveBackground}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: loading ? T.txtM : T.warm,
                  color: T.bgDeep,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = '#E08A4C')}
                onMouseLeave={(e) => !loading && (e.target.style.background = T.warm)}
              >
                {loading ? (
                  <>
                    <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} />
                    Remove Background
                  </>
                )}
              </button>
            )}

            <style>
              {`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>

          {/* Preview Section */}
          <div>
            {originalImage || processedImage ? (
              <>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    marginBottom: '24px',
                    color: T.txt,
                  }}
                >
                  {processedImage ? 'Before & After' : 'Preview'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Original Image */}
                  <div>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: T.txtM,
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Original
                    </p>
                    <div
                      style={{
                        background: T.bg,
                        border: `1px solid ${T.border}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={originalImage}
                        alt="Original"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </div>

                  {/* Processed Image */}
                  {processedImage && (
                    <div>
                      <p
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: T.txtM,
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Result
                      </p>
                      <div
                        style={{
                          background: T.bg,
                          border: `1px solid ${T.border}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundImage: `linear-gradient(45deg, ${T.border} 25%, transparent 25%, transparent 75%, ${T.border} 75%, ${T.border}), linear-gradient(45deg, ${T.border} 25%, transparent 25%, transparent 75%, ${T.border} 75%, ${T.border})`,
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 10px 10px',
                        }}
                      >
                        <img
                          src={processedImage}
                          alt="Processed"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: T.warm,
                          color: T.bgDeep,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          marginTop: '16px',
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#E08A4C'}
                        onMouseLeave={(e) => e.target.style.background = T.warm}
                      >
                        <Download size={14} />
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BackgroundRemoval() {
  return (
    <ProtectedRoute>
      <BackgroundRemovalContent />
    </ProtectedRoute>
  );
}
