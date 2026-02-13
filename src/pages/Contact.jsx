import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { T } from '../theme/tokens';
import { supabase } from '../lib/supabase/client';
import { ROUTES } from '../lib/routes';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Please enter your name');
      }
      if (!formData.email.trim()) {
        throw new Error('Please enter your email');
      }
      if (!formData.subject.trim()) {
        throw new Error('Please enter a subject');
      }
      if (!formData.message.trim()) {
        throw new Error('Please enter your message');
      }

      // Email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Call Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      });

      if (functionError) {
        throw functionError;
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
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
          input, textarea { font-family: inherit; }
          input::placeholder, textarea::placeholder { color: ${T.txtM}; }
          input:focus, textarea:focus { outline: none; }
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
            <Mail size={28} color={T.warm} />
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
          Get in Touch
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: T.txtM,
            lineHeight: 1.6,
            marginBottom: '48px',
          }}
        >
          Have a question or feedback about TWNG? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* Form Container */}
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        {submitted && (
          <div
            style={{
              background: '#065F4615',
              border: `1px solid #10B981`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle size={20} color="#10B981" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
                Message sent successfully!
              </p>
              <p style={{ fontSize: '13px', color: T.txtM, marginTop: '2px' }}>
                Thank you for reaching out. We'll get back to you soon.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#7F1D1D15',
              border: `1px solid #EF4444`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="#EF4444" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
                Error
              </p>
              <p style={{ fontSize: '13px', color: T.txtM, marginTop: '2px' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '8px',
              }}
            >
              Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                color: T.txt,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = T.warm}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '8px',
              }}
            >
              Email *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="your.email@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                color: T.txt,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = T.warm}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
          </div>

          {/* Subject Field */}
          <div>
            <label
              htmlFor="subject"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '8px',
              }}
            >
              Subject *
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={loading}
              placeholder="What is this about?"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                color: T.txt,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = T.warm}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: T.txt,
                marginBottom: '8px',
              }}
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              placeholder="Tell us what's on your mind..."
              rows="6"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                color: T.txt,
                resize: 'vertical',
                minHeight: '160px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = T.warm}
              onBlur={(e) => e.target.style.borderColor = T.border}
            />
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
              padding: '14px 16px',
              fontSize: '14px',
              fontWeight: 600,
              background: loading ? T.txtM : T.warm,
              color: T.bgDeep,
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#E08A4C')}
            onMouseLeave={(e) => !loading && (e.target.style.background = T.warm)}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `2px solid ${T.bgDeep}33`,
                    borderTopColor: T.bgDeep,
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Message
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
    </div>
  );
}
