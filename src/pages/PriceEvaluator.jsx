import { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import ProtectedRoute from '../components/ProtectedRoute';

function PriceEvaluatorContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'excellent',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const conditions = [
    { value: 'mint', label: 'Mint (Like New)' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      // Validate form
      if (!formData.make.trim()) {
        throw new Error('Please enter the guitar make');
      }
      if (!formData.model.trim()) {
        throw new Error('Please enter the guitar model');
      }
      if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear()) {
        throw new Error('Please enter a valid year');
      }

      // Call Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('guitar-price-evaluation', {
        body: {
          make: formData.make.trim(),
          model: formData.model.trim(),
          year: formData.year,
          condition: formData.condition,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data) {
        throw new Error('No price data available for this guitar');
      }

      setResult(data);
    } catch (err) {
      console.error('Price evaluator error:', err);
      setError(err.message || 'Failed to evaluate guitar price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          input, select { font-family: inherit; }
          input::placeholder { color: ${T.txtM}; }
          input:focus, select:focus { outline: none; }
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
          to="/"
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
            <DollarSign size={28} color={T.warm} />
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
          Guitar Price Evaluator
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: T.txtM,
            lineHeight: 1.6,
            marginBottom: '48px',
          }}
        >
          Discover the market value of your guitar. Get real-time pricing based on make, model, year, and condition.
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}
      >
        {/* Form */}
        <div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '24px',
              color: T.txt,
            }}
          >
            Evaluate Your Guitar
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Make Field */}
            <div>
              <label
                htmlFor="make"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.txt,
                  marginBottom: '6px',
                }}
              >
                Make *
              </label>
              <input
                id="make"
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Fender, Gibson, Ibanez"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = T.warm}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Model Field */}
            <div>
              <label
                htmlFor="model"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.txt,
                  marginBottom: '6px',
                }}
              >
                Model *
              </label>
              <input
                id="model"
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Stratocaster, Les Paul, RG"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = T.warm}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Year Field */}
            <div>
              <label
                htmlFor="year"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.txt,
                  marginBottom: '6px',
                }}
              >
                Year *
              </label>
              <input
                id="year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                disabled={loading}
                min="1900"
                max={new Date().getFullYear()}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = T.warm}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Condition Field */}
            <div>
              <label
                htmlFor="condition"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: T.txt,
                  marginBottom: '6px',
                }}
              >
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  color: T.txt,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = T.warm}
                onBlur={(e) => e.target.style.borderColor = T.border}
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value} style={{ background: T.bg, color: T.txt }}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
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
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                marginTop: '4px',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#E08A4C')}
              onMouseLeave={(e) => !loading && (e.target.style.background = T.warm)}
            >
              {loading ? (
                <>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Evaluating...
                </>
              ) : (
                <>
                  <TrendingUp size={14} />
                  Get Price Estimate
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
          </form>
        </div>

        {/* Results */}
        <div>
          {error && (
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

          {result && (
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '24px',
                  color: T.txt,
                }}
              >
                Price Estimate
              </h2>

              {/* Main Price Card */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${T.warm}22, ${T.warm}11)`,
                  border: `1px solid ${T.borderAcc}`,
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: T.txtM,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                  }}
                >
                  Average Price
                </p>
                <p
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: T.warm,
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(result.averagePrice || 0)}
                </p>
              </div>

              {/* Price Range */}
              {result.priceRange && (
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
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
                    Price Range
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: T.txtM, marginBottom: '4px' }}>
                        Minimum
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: T.txt }}>
                        {formatCurrency(result.priceRange.min || 0)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', color: T.txtM, marginBottom: '4px' }}>
                        Maximum
                      </p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: T.txt }}>
                        {formatCurrency(result.priceRange.max || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
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
                    Data Sources
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.sources.map((source, idx) => (
                      <div key={idx} style={{ fontSize: '13px', color: T.txt }}>
                        <span style={{ fontWeight: 600 }}>{source.name}</span>
                        <span style={{ color: T.txtM, marginLeft: '8px' }}>
                          {source.count ? `${source.count} listings` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p
                style={{
                  fontSize: '11px',
                  color: T.txtM,
                  marginTop: '20px',
                  lineHeight: 1.6,
                }}
              >
                * Price estimates are based on recent market data and may vary based on specific condition, modifications, and local market conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PriceEvaluator() {
  return (
    <ProtectedRoute>
      <PriceEvaluatorContent />
    </ProtectedRoute>
  );
}
