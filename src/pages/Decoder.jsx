import { useState } from 'react';
import { Search, ChevronDown, CheckCircle, AlertTriangle, HelpCircle, Info, ChevronRight } from 'lucide-react';
import { T } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { decodeSerial, getSupportedBrands, getDecoderInfo } from '../lib/serialDecoder';

function SerialDecoder() {
  const [serial, setSerial] = useState('');
  const [brandHint, setBrandHint] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAlt, setSelectedAlt] = useState(0);

  const supportedBrands = getSupportedBrands();

  const handleDecode = async () => {
    if (!serial.trim()) {
      return;
    }

    setLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      const decoderResult = decodeSerial(serial, brandHint || null);
      setResult(decoderResult);
      setSelectedAlt(0);
      setLoading(false);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleDecode();
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return '#10B981'; // green
      case 'medium':
        return T.amber;
      case 'low':
        return '#EF4444'; // red
      default:
        return T.txtM;
    }
  };

  const getConfidenceBgColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return '#065F4620';
      case 'medium':
        return '#92400E20';
      case 'low':
        return '#7F1D1D20';
      default:
        return T.border;
    }
  };

  const displayResult = result && result.alternatives && selectedAlt < result.alternatives.length ? result.alternatives[selectedAlt] : result;

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
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        `}
      </style>

      {/* Hero Section */}
      <div
        style={{
          textAlign: 'center',
          padding: '80px 24px 64px',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            fontWeight: 500,
            color: T.warm,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px',
          }}
        >
          Decode Your Guitar
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            color: T.txt,
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          Serial Number Decoder
        </h1>
        <p
          style={{
            fontSize: '17px',
            color: T.txt2,
            lineHeight: 1.6,
          }}
        >
          Find the year, factory, and production details from your guitar's serial number.
          Supports Fender, Gibson, PRS, Martin, Taylor, Ibanez, and more.
        </p>
      </div>

      {/* Input Section */}
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '0 24px 48px',
        }}
      >
        {/* Brand Dropdown */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: T.txt,
              marginBottom: '8px',
            }}
          >
            Brand
            <span style={{ color: T.txtM, fontWeight: 400, marginLeft: '4px' }}>
              (optional — helps accuracy)
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={brandHint}
              onChange={(e) => setBrandHint(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 14px',
                borderRadius: '12px',
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                color: brandHint ? T.txt : T.txtM,
                fontSize: '15px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = T.borderAcc)}
              onBlur={(e) => (e.target.style.borderColor = T.border)}
            >
              <option value="">Select brand...</option>
              {supportedBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: T.txtM,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Serial Input */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: T.txt,
              marginBottom: '8px',
            }}
          >
            Serial Number
            <span style={{ color: T.warm, marginLeft: '2px' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., US21034567 or 92318970"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '16px 18px',
              borderRadius: '12px',
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              color: T.txt,
              fontSize: '16px',
              outline: 'none',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = T.borderAcc)}
            onBlur={(e) => (e.target.style.borderColor = T.border)}
          />
          <p
            style={{
              fontSize: '13px',
              color: T.txtM,
              marginTop: '6px',
            }}
          >
            Found on the headstock or back of the guitar
          </p>
        </div>

        {/* Decode Button */}
        <button
          onClick={handleDecode}
          disabled={!serial.trim() || loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: '12px',
            background: serial.trim() && !loading ? T.warm : T.border,
            color: serial.trim() && !loading ? T.bgDeep : T.txtM,
            border: 'none',
            fontSize: '15px',
            fontWeight: 600,
            cursor: serial.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (serial.trim() && !loading) {
              e.target.style.background = '#C2410C';
            }
          }}
          onMouseLeave={(e) => {
            if (serial.trim() && !loading) {
              e.target.style.background = T.warm;
            }
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: `2px solid ${T.bgDeep}20`,
                  borderTopColor: T.bgDeep,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Decoding...
            </>
          ) : (
            <>
              <Search size={16} />
              Decode Serial
            </>
          )}
        </button>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>

      {/* Results Section */}
      {result && (
        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            padding: '0 24px 80px',
          }}
        >
          {result.success ? (
            <>
              {/* Success Result */}
              <div
                style={{
                  borderRadius: '16px',
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  overflow: 'hidden',
                  marginBottom: '24px',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle
                    size={20}
                    style={{ color: '#10B981', flexShrink: 0 }}
                  />
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '18px',
                      fontWeight: 600,
                      color: T.txt,
                    }}
                  >
                    Serial Decoded
                  </h2>
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      background: getConfidenceBgColor(displayResult.confidence),
                      color: getConfidenceColor(displayResult.confidence),
                      fontSize: '12px',
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: 'capitalize',
                    }}
                  >
                    {displayResult.confidence} confidence
                  </span>
                </div>

                {/* Decoded Data */}
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '20px',
                      marginBottom: '24px',
                    }}
                  >
                    {displayResult.decoded.brand && (
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: T.txtM,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px',
                          }}
                        >
                          Brand
                        </p>
                        <p
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: T.txt,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {displayResult.decoded.brand}
                        </p>
                      </div>
                    )}

                    {(displayResult.decoded.year || displayResult.decoded.yearRange) && (
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: T.txtM,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px',
                          }}
                        >
                          Year
                        </p>
                        <p
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: T.txt,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {displayResult.decoded.year || displayResult.decoded.yearRange}
                        </p>
                      </div>
                    )}

                    {displayResult.decoded.factory && (
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: T.txtM,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px',
                          }}
                        >
                          Factory
                        </p>
                        <p
                          style={{
                            fontSize: '14px',
                            color: T.txt2,
                          }}
                        >
                          {displayResult.decoded.factory}
                        </p>
                      </div>
                    )}

                    {displayResult.decoded.country && (
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: T.txtM,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px',
                          }}
                        >
                          Country
                        </p>
                        <p
                          style={{
                            fontSize: '14px',
                            color: T.txt2,
                          }}
                        >
                          {displayResult.decoded.country}
                        </p>
                      </div>
                    )}

                    {displayResult.decoded.series && (
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: T.txtM,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px',
                          }}
                        >
                          Series
                        </p>
                        <p
                          style={{
                            fontSize: '14px',
                            color: T.txt2,
                          }}
                        >
                          {displayResult.decoded.series}
                        </p>
                      </div>
                    )}

                    {displayResult.decoded.productionNumber && (
                      <div>
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: T.txtM,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px',
                          }}
                        >
                          Prod. Number
                        </p>
                        <p
                          style={{
                            fontSize: '14px',
                            color: T.txt2,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {displayResult.decoded.productionNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  <div
                    style={{
                      borderTop: `1px solid ${T.border}`,
                      paddingTop: '20px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '14px',
                        color: T.txt2,
                        lineHeight: 1.6,
                      }}
                    >
                      {displayResult.explanation}
                    </p>
                  </div>

                  {/* Tips */}
                  {displayResult.tips && displayResult.tips.length > 0 && (
                    <div
                      style={{
                        marginTop: '20px',
                        padding: '16px',
                        borderRadius: '10px',
                        background: T.bgElev,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: T.warm,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Info size={14} />
                        Tips
                      </p>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: '20px',
                          fontSize: '13px',
                          color: T.txt2,
                          lineHeight: 1.6,
                        }}
                      >
                        {displayResult.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Results */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: T.txt,
                      marginBottom: '12px',
                    }}
                  >
                    Other possible matches
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {result.alternatives.map((alt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedAlt(idx + 1)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          background: selectedAlt === idx + 1 ? T.bgElev : 'transparent',
                          border: `1px solid ${selectedAlt === idx + 1 ? T.borderAcc : T.border}`,
                          color: T.txt2,
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = T.bgElev;
                          e.target.style.borderColor = T.borderAcc;
                        }}
                        onMouseLeave={(e) => {
                          if (selectedAlt !== idx + 1) {
                            e.target.style.background = 'transparent';
                            e.target.style.borderColor = T.border;
                          }
                        }}
                      >
                        <span>
                          {alt.decoded.brand}
                          {alt.decoded.year && ` • ${alt.decoded.year}`}
                          {alt.decoded.yearRange && ` • ${alt.decoded.yearRange}`}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: T.txtM,
                            textTransform: 'capitalize',
                          }}
                        >
                          {alt.confidence}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* No Match Result */}
              <div
                style={{
                  borderRadius: '16px',
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  padding: '32px 24px',
                  textAlign: 'center',
                  marginBottom: '32px',
                }}
              >
                <AlertTriangle
                  size={40}
                  style={{
                    color: T.txtM,
                    marginBottom: '16px',
                  }}
                />
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '20px',
                    fontWeight: 600,
                    color: T.txt,
                    marginBottom: '8px',
                  }}
                >
                  Serial Not Recognized
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: T.txt2,
                    marginBottom: '24px',
                    lineHeight: 1.6,
                  }}
                >
                  {result.explanation}
                </p>

                {/* Suggestions */}
                {result.tips && result.tips.length > 0 && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: T.bgElev,
                      border: `1px solid ${T.border}`,
                      textAlign: 'left',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: T.warm,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <HelpCircle size={14} />
                      What to try
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '13px',
                        color: T.txt2,
                        lineHeight: 1.6,
                      }}
                    >
                      {result.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Educational Section */}
      {!result && (
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '48px 24px 80px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Where to Find Section */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '16px',
              }}
            >
              Where to Find Serial Numbers
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Electric Guitars
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.7,
                }}
              >
                <li>Headstock (most common)</li>
                <li>Neck plate / heel</li>
                <li>Body cavity (some brands)</li>
                <li>Bridge mounting plate</li>
              </ul>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Acoustic Guitars
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.7,
                }}
              >
                <li>Inside sound hole</li>
                <li>Label on inside back</li>
                <li>Headstock</li>
                <li>Certificate of authenticity</li>
              </ul>
            </div>
          </div>

          {/* Tips Section */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '16px',
              }}
            >
              Decoding Tips
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  marginBottom: '8px',
                }}
              >
                Be Precise
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}
              >
                Enter the serial exactly as printed. No spaces or modifications. Many serials are case-sensitive.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  marginBottom: '8px',
                }}
              >
                Brand Helps
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}
              >
                Selecting a brand improves accuracy, especially for guitars with ambiguous serial formats.
              </p>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  marginBottom: '8px',
                }}
              >
                Vintage Guitars
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}
              >
                For pre-1980 guitars, consider professional authentication alongside decoder results.
              </p>
            </div>
          </div>

          {/* Pot Codes Section */}
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '16px',
              }}
            >
              Additional Data
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                Pot Codes (Preamplifier)
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                For electric guitars, potentiometer codes inside the body can indicate manufacture date independently:
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '13px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}
              >
                <li>Format: Letter + 2-3 digits</li>
                <li>Example: A221347 = week 22, year 1947</li>
                <li>Often more accurate than serial for vintage</li>
              </ul>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.warm,
                  marginBottom: '8px',
                }}
              >
                Cross-Reference
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}
              >
                When buying or selling, verify with the manufacturer directly. Fakes exist — especially for vintage and high-value instruments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SerialDecoder;
