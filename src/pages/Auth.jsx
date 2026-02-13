import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  Guitar,
  Camera,
  Heart,
  Users,
  ChevronRight,
  Eye,
  EyeOff,
  Star,
  Plus,
} from "lucide-react";
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import { ROUTES } from '../lib/routes';

// ============================================================
// SVG LOGO (Self-contained, no base64)
// ============================================================
function TWNGLogo() {
  return (
    <svg
      width="120"
      height="70"
      viewBox="0 0 188.724 109.697"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M147.124,75.2l-23.89-25h-6.58l-9.95,24.04-8.73-24.04h-1.3l-9.12,24.04-9.37-24.04h-24.46v5.1h8.27v29.96h5.43v-29.96h6.91l11.96,29.96h2.5l8.43-22.29,8.09,22.29h2.5l13.08-31.14v31.14h5.43v-24.27l23.26,24.27h2.97v-35.06h-5.43v25ZM173.844,67.44v5.1h8.97c-.25,2.53-1.44,4.71-3.56,6.52-2.13,1.8-4.53,2.7-7.2,2.7-3.14,0-6.05-1.2-8.74-3.61-2.87-2.59-4.31-5.9-4.31-9.9s1.29-7.11,3.87-9.69c2.58-2.62,5.77-3.94,9.57-3.94,4.24,0,7.84,1.96,10.79,5.89l3.87-3.7c-2.25-2.58-4.54-4.44-6.87-5.59-2.44-1.15-5.06-1.72-7.87-1.72-5.23,0-9.68,1.83-13.33,5.48-3.65,3.63-5.47,8.06-5.47,13.28s1.79,9.49,5.38,13.14c3.59,3.63,7.9,5.45,12.93,5.45s9.4-1.88,12.74-5.64c1.48-1.68,2.52-3.48,3.15-5.41.64-2.08.96-4.47.96-7.18v-1.19h-14.86l-.02.01Z"
          fill="#6b4f36"
        />
        <path
          d="M42.624,66.89c-.17-.09-.34-.17-.52-.26,3.26-2.16,4.87-6.53,3.8-10.29-1.07-3.76-4.73-6.63-8.64-6.76-1.67-.05-3.43.39-4.62,1.57-1.19,1.18-1.62,3.18-.71,4.58.89,1.37,2.97,1.78,4.31.84,1.34-.93,1.68-3.02.71-4.33,2.13-.05,4.24,1.27,5.11,3.22s.45,4.4-1.01,5.95c-2.26,2.39-5.99,2.26-9.26,2.66-5.52.67-10.86,3.5-14.04,8.06s-3.93,10.86-1.41,15.81c2.53,4.95,8.47,8.08,13.89,6.85s9.51-7.07,8.33-12.51c-.44-2.02-1.61-3.97-3.45-4.93s-4.36-.67-5.65.95c-1.29,1.62-.76,4.47,1.17,5.21s4.34-1.53,3.45-3.4c2.2,1.34,3.24,4.22,2.68,6.73-.55,2.52-2.53,4.6-4.91,5.59-4.6,1.9-10.39-.48-12.71-4.89s-1.19-10.22,2.28-13.79c3.48-3.57,8.95-4.87,13.8-3.71,7.15,1.71,13,8.67,12.86,16.02-.31,16.36-15.83,22.42-27.83,18.77-8.27-2.52-14.34-10.18-14.72-20.14-.33-8.77,3.22-15.87,9.27-21.85-13.73-14.22,6.3-21.86,13.63-19.35l.03-1.86.61-32.57c.33-.12.88-.36,1.19-.36,1.9,0,.27,2.34,2.45,2.61,1.36.16,2.23-1.2,2.28-2.12.05-1.52-.98-2.66-2.93-2.66-.7,0-1.89.36-2.95.84l.09-4.89c.34-.13.79-.31,1.06-.31,1.9,0,.27,2.34,2.45,2.61,1.36.16,2.23-1.2,2.28-2.12.05-1.52-.98-2.66-2.93-2.66-.67,0-1.8.33-2.82.79v-.79h-5.38l.74,38.63c-10.72,0-22.76,10.97-15.5,21.18.51.85,1.27,1.71,1.56,2.55.1,1.87-1.74,3.4-3.01,4.78-6.68,7.23-9.81,18.21-6.02,27.3,9.96,23.78,51.19,18.78,52.03-8.18.26-7.83-4.1-15.77-11.05-19.35l.01-.02Z"
          fill="#6b4f36"
        />
      </g>
    </svg>
  );
}

// ============================================================
// FORM INPUT COMPONENT
// ============================================================
function InputField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  showToggle = false,
  showPassword = false,
  onTogglePassword,
  autoComplete,
  focusColor = T.borderAcc,
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      {label && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: T.txt,
            fontWeight: 500,
          }}
        >
          {Icon && <Icon size={16} color={T.txt2} />}
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={showToggle && showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: "12px 14px",
            paddingRight: showToggle ? "44px" : "14px",
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            background: T.bgElev,
            color: T.txt,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            transition: "all 0.2s",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = focusColor;
            e.target.style.boxShadow = `0 0 0 3px ${focusColor}33`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.boxShadow = "none";
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.txt2,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.color = T.txt)}
            onMouseLeave={(e) => (e.target.color = T.txt2)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================
function PasswordStrength({ password }) {
  let strength = 0;
  let label = "Weak";
  let color = "#EF4444";

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++;

  if (strength === 1) {
    label = "Weak";
    color = "#EF4444";
  } else if (strength === 2) {
    label = "Good";
    color = T.amber;
  } else if (strength === 3) {
    label = "Strong";
    color = "#10B981";
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "6px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background:
                i < strength ? color : T.border,
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: "12px",
          color: color,
          fontFamily: "'DM Sans', sans-serif",
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ============================================================
// BUTTON COMPONENT
// ============================================================
function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  icon: Icon,
  style: customStyle = {},
}) {
  const variants = {
    primary: {
      background: T.amber,
      color: T.bgDeep,
      border: `1px solid ${T.amber}`,
    },
    secondary: {
      background: "transparent",
      color: T.txt,
      border: `1px solid ${T.border}`,
    },
  };

  const baseStyle = variants[variant] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 600,
        transition: "all 0.2s",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: disabled ? 0.5 : 1,
        ...baseStyle,
        ...customStyle,
      }}
      onHover={(e) => {
        if (!disabled) {
          e.target.style.transform = "translateY(-2px)";
        }
      }}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

// ============================================================
// BADGE / CHIP COMPONENT
// ============================================================
function Chip({
  label,
  icon: Icon,
  selected = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: "9999px",
        border: `1px solid ${selected ? T.warm : T.border}`,
        background: selected ? T.warm + "22" : "transparent",
        color: selected ? T.warm : T.txt2,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.target.style.borderColor = T.warm;
          e.target.style.color = T.warm;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.target.style.borderColor = T.border;
          e.target.style.color = T.txt2;
        }
      }}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

// ============================================================
// SIGN IN PAGE
// ============================================================
function SignInPage({ onSwitch, onAuth, error, submitting }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: T.bgDeep,
      }}
    >
      <div
        className="auth-container"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          borderRadius: "12px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <TWNGLogo />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: T.txt,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: T.txt2,
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Sign in to your collection
        </p>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#EF44441A",
              border: `1px solid #EF4444`,
              marginBottom: "20px",
              color: "#EF4444",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={() => onAuth("google")}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            background: T.bgElev,
            color: T.txt,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            cursor: submitting ? "not-allowed" : "pointer",
            marginBottom: "20px",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: submitting ? 0.5 : 1,
          }}
          onHover={(e) => {
            e.target.style.background = T.bgCard;
            e.target.style.borderColor = T.borderAcc;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none" }}>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: T.border }} />
          <span style={{ color: T.txtM, fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: T.border }} />
        </div>

        {/* Email Field */}
        <InputField
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="your@email.com"
          autoComplete="email"
        />

        {/* Password Field */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <label style={{ fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: T.txt, fontWeight: 500 }}>
            Password
          </label>
          <button
            onClick={() => onSwitch("forgot")}
            style={{
              background: "none",
              border: "none",
              color: T.amber,
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Forgot?
          </button>
        </div>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "12px 14px",
              paddingRight: "44px",
              borderRadius: "8px",
              border: `1px solid ${T.border}`,
              background: T.bgElev,
              color: T.txt,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              transition: "all 0.2s",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = T.borderAcc;
              e.target.style.boxShadow = `0 0 0 3px ${T.borderAcc}33`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = T.border;
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.txt2,
              transition: "color 0.2s",
            }}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={() => onAuth("signin", { email, password })}
          icon={ArrowRight}
          disabled={submitting}
        >
          Sign In
        </Button>

        {/* Switch to Sign Up */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: T.txt2,
          }}
        >
          New to TWNG?{" "}
          <button
            onClick={() => onSwitch("signup")}
            style={{
              background: "none",
              border: "none",
              color: T.amber,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SIGN UP PAGE
// ============================================================
function SignUpPage({ onSwitch, onAuth, error, submitting }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: T.bgDeep,
      }}
    >
      <div
        className="auth-container"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          borderRadius: "12px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <TWNGLogo />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: T.txt,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: T.txt2,
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Start documenting your guitar collection
        </p>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#EF44441A",
              border: `1px solid #EF4444`,
              marginBottom: "20px",
              color: "#EF4444",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={() => onAuth("google")}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            border: `1px solid ${T.border}`,
            background: T.bgElev,
            color: T.txt,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            cursor: submitting ? "not-allowed" : "pointer",
            marginBottom: "20px",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: submitting ? 0.5 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ fill: "none" }}>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: T.border }} />
          <span style={{ color: T.txtM, fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: T.border }} />
        </div>

        {/* Full Name Field */}
        <InputField
          label="Full Name"
          icon={User}
          type="text"
          value={fullName}
          onChange={setFullName}
          placeholder="John Doe"
          autoComplete="name"
        />

        {/* Email Field */}
        <InputField
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="your@email.com"
          autoComplete="email"
        />

        {/* Password Field */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              color: T.txt,
              fontWeight: 500,
            }}
          >
            <Lock size={16} color={T.txt2} />
            Password
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "12px 14px",
                paddingRight: "44px",
                borderRadius: "8px",
                border: `1px solid ${T.border}`,
                background: T.bgElev,
                color: T.txt,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                transition: "all 0.2s",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = T.borderAcc;
                e.target.style.boxShadow = `0 0 0 3px ${T.borderAcc}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.txt2,
                transition: "color 0.2s",
              }}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Terms Agreement */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "20px",
            fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif",
            color: T.txt2,
            lineHeight: "1.6",
          }}
        >
          <input
            type="checkbox"
            style={{
              marginTop: "3px",
              cursor: "pointer",
              borderRadius: "4px",
              width: "16px",
              height: "16px",
              border: `1px solid ${T.border}`,
            }}
          />
          <span>
            I agree to TWNG's{" "}
            <button
              style={{
                background: "none",
                border: "none",
                color: T.amber,
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "underline",
              }}
            >
              Terms of Service
            </button>
            {" "}and{" "}
            <button
              style={{
                background: "none",
                border: "none",
                color: T.amber,
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "underline",
              }}
            >
              Privacy Policy
            </button>
          </span>
        </label>

        {/* Create Account Button */}
        <Button
          onClick={() => onAuth("signup", { email, password, displayName: fullName })}
          icon={ArrowRight}
          disabled={submitting}
        >
          Create Account
        </Button>

        {/* Switch to Sign In */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: T.txt2,
          }}
        >
          Already have an account?{" "}
          <button
            onClick={() => onSwitch("signin")}
            style={{
              background: "none",
              border: "none",
              color: T.amber,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// FORGOT PASSWORD PAGE
// ============================================================
function ForgotPasswordPage({ onSwitch, onAuth, error, submitting }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    try {
      await onAuth("reset", { email });
      setSent(true);
    } catch (err) {
      // Error is handled by parent
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: T.bgDeep,
      }}
    >
      <div
        className="auth-container"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          borderRadius: "12px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <TWNGLogo />
        </div>

        {!sent ? (
          <>
            {/* Heading */}
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              Reset password
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: T.txt2,
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              Enter your email address and we'll send you a reset link
            </p>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#EF44441A",
                  border: `1px solid #EF4444`,
                  marginBottom: "20px",
                  color: "#EF4444",
                  fontSize: "13px",
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* Email Field */}
            <InputField
              label="Email"
              icon={Mail}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
              autoComplete="email"
            />

            {/* Send Reset Link Button */}
            <Button
              onClick={handleSendReset}
              disabled={submitting || !email}
              icon={ArrowRight}
            >
              Send Reset Link
            </Button>

            {/* Back to Sign In */}
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                color: T.txt2,
              }}
            >
              <button
                onClick={() => onSwitch("signin")}
                style={{
                  background: "none",
                  border: "none",
                  color: T.amber,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Back to Sign In
              </button>
            </p>
          </>
        ) : (
          <>
            {/* Success State */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: T.warm + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: T.warm,
                  }}
                >
                  <Check size={32} />
                </div>
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  color: T.txt,
                  marginBottom: "8px",
                }}
              >
                Check your email
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: T.txt2,
                  marginBottom: "28px",
                  lineHeight: "1.6",
                }}
              >
                We've sent a reset link to <strong>{email}</strong>. Click the link in the email to create a new password.
              </p>
              <button
                onClick={() => onSwitch("signin")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${T.amber}`,
                  background: T.amber,
                  color: T.bgDeep,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// RESET PASSWORD PAGE
// ============================================================
function ResetPasswordPage({ onAuth, error, submitting }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleResetPassword = async () => {
    if (!passwordsMatch) return;
    try {
      await onAuth("updatePassword", { password });
      setSuccess(true);
    } catch (err) {
      // Error is handled by parent
    }
  };

  if (success) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "20px",
          background: T.bgDeep,
        }}
      >
        <div
          className="auth-container"
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "40px",
            borderRadius: "12px",
            background: T.bgCard,
            border: `1px solid ${T.border}`,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: T.warm + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.warm,
                }}
              >
                <Check size={32} />
              </div>
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              Password reset
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: T.txt2,
                marginBottom: "28px",
              }}
            >
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => window.location.href = '/auth'}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${T.amber}`,
                background: T.amber,
                color: T.bgDeep,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: T.bgDeep,
      }}
    >
      <div
        className="auth-container"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          borderRadius: "12px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <TWNGLogo />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            fontWeight: 600,
            color: T.txt,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Create new password
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: T.txt2,
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Set a new password for your account
        </p>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#EF44441A",
              border: `1px solid #EF4444`,
              marginBottom: "20px",
              color: "#EF4444",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Password Field */}
        <InputField
          label="New Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          showToggle={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
        />

        {/* Password Strength Indicator */}
        {password && <PasswordStrength password={password} />}

        {/* Confirm Password Field */}
        <InputField
          label="Confirm Password"
          icon={Lock}
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          showToggle={true}
          showPassword={showConfirm}
          onTogglePassword={() => setShowConfirm(!showConfirm)}
          autoComplete="new-password"
        />

        {/* Password Match Error */}
        {confirmPassword && !passwordsMatch && (
          <div
            style={{
              marginBottom: "20px",
              padding: "8px 12px",
              borderRadius: "6px",
              background: "#FEE2E2",
              color: "#EF4444",
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Passwords don't match
          </div>
        )}

        {/* Reset Button */}
        <Button
          onClick={handleResetPassword}
          disabled={submitting || !passwordsMatch}
          icon={ArrowRight}
        >
          Reset Password
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING PAGE
// ============================================================
function OnboardingPage({ onAuth }) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  const interests = [
    "Gibson",
    "Fender",
    "Martin",
    "Vintage",
    "Electric",
    "Acoustic",
    "Bass",
    "7-String",
    "Jazz",
    "Metal",
    "Classical",
    "Custom",
  ];

  const suggestedUsers = [
    { id: 1, name: "Alex Chen", avatar: "AC", collections: 12 },
    { id: 2, name: "Morgan Lee", avatar: "ML", collections: 8 },
    { id: 3, name: "Jordan Smith", avatar: "JS", collections: 15 },
    { id: 4, name: "Casey Johnson", avatar: "CJ", collections: 10 },
  ];

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleFollowing = (userId) => {
    setFollowingUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const canNext = () => {
    if (step === 1) return displayName.trim().length > 0;
    if (step === 2) return selectedInterests.length > 0;
    return true;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        background: T.bgDeep,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "40px",
          borderRadius: "12px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Progress Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "32px",
            gap: "8px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                background: i <= step ? T.warm : T.border,
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        {/* Step 1: Profile Setup */}
        {step === 1 && (
          <>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              Setup your profile
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: T.txt2,
                marginBottom: "28px",
              }}
            >
              Step 1 of 4
            </p>

            {/* Avatar Upload */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "32px",
              }}
            >
              <button
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: `2px dashed ${T.borderAcc}`,
                  background: T.bgElev,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.txt2,
                  transition: "all 0.2s",
                }}
                onHover={(e) => {
                  e.target.style.borderColor = T.warm;
                  e.target.style.color = T.warm;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = T.borderAcc;
                  e.target.style.color = T.txt2;
                }}
              >
                <Camera size={32} />
              </button>
            </div>

            {/* Display Name */}
            <InputField
              label="Display Name"
              icon={User}
              type="text"
              value={displayName}
              onChange={setDisplayName}
              placeholder="What should we call you?"
            />

            {/* Bio */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  color: T.txt,
                  fontWeight: 500,
                }}
              >
                Bio (optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${T.border}`,
                  background: T.bgElev,
                  color: T.txt,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  resize: "vertical",
                  minHeight: "80px",
                  transition: "all 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = T.borderAcc;
                  e.target.style.boxShadow = `0 0 0 3px ${T.borderAcc}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = T.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              What interests you?
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: T.txt2,
                marginBottom: "28px",
              }}
            >
              Step 2 of 4 — Select at least one
            </p>

            <div
              className="auth-interests-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {interests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  selected={selectedInterests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                />
              ))}
            </div>
          </>
        )}

        {/* Step 3: First Guitar */}
        {step === 3 && (
          <>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              Add your first guitar
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: T.txt2,
                marginBottom: "28px",
              }}
            >
              Step 3 of 4 — You can always add more later
            </p>

            <div
              style={{
                padding: "40px 20px",
                borderRadius: "12px",
                border: `2px dashed ${T.borderAcc}`,
                background: T.bgElev,
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              <Guitar size={48} color={T.txt2} style={{ marginBottom: "12px", marginLeft: "auto", marginRight: "auto" }} />
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: T.txt,
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Ready to add your first guitar?
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: T.txt2,
                  margin: 0,
                }}
              >
                or use our AI Magic Add to auto-detect
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button style={{ flex: 1 }} icon={Plus}>
                Add Guitar
              </Button>
              <Button variant="secondary" style={{ flex: 1 }}>
                Magic Add
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Follow Suggestions */}
        {step === 4 && (
          <>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: T.txt,
                marginBottom: "8px",
              }}
            >
              Follow collectors
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: T.txt2,
                marginBottom: "28px",
              }}
            >
              Step 4 of 4 — Find people with similar taste
            </p>

            <div style={{ marginBottom: "28px" }}>
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    padding: "12px",
                    borderRadius: "8px",
                    background: T.bgElev,
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: T.warm,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: T.bgDeep,
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: T.txt,
                        }}
                      >
                        {user.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: T.txt2,
                        }}
                      >
                        {user.collections} guitars
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollowing(user.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      border: `1px solid ${followingUsers.has(user.id) ? T.warm : T.border}`,
                      background: followingUsers.has(user.id) ? T.warm + "22" : "transparent",
                      color: followingUsers.has(user.id) ? T.warm : T.txt2,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {followingUsers.has(user.id) ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "12px" }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.txt,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${T.amber}`,
                background: canNext() ? T.amber : T.bgElev,
                color: canNext() ? T.bgDeep : T.txtM,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: canNext() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: canNext() ? 1 : 0.5,
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => onAuth("complete")}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${T.amber}`,
                background: T.amber,
                color: T.bgDeep,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Check size={16} />
              Complete Setup
            </button>
          )}
        </div>

        {/* Skip Link */}
        {step < 4 && (
          <button
            onClick={() => setStep(4)}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "8px",
              background: "none",
              border: "none",
              color: T.txt2,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Skip to summary
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN AUTH COMPONENT
// ============================================================
export default function TWNGAuth() {
  const [currentPage, setCurrentPage] = useState("signin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, loginWithGoogle, isAuthenticated, loading, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Check for reset mode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    if (mode === 'reset') {
      // Check if we have a recovery token (Supabase adds this after redirecting)
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('recovery'))) {
        setCurrentPage('reset');
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSwitch = (page) => {
    setCurrentPage(page);
    setError("");
  };

  const handleAuth = async (type, data = {}) => {
    setError("");
    setSubmitting(true);

    try {
      if (type === "google") {
        await loginWithGoogle();
      } else if (type === "signin") {
        await login({ email: data.email, password: data.password });
      } else if (type === "signup") {
        await signup({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
        });
        setCurrentPage("onboarding");
      } else if (type === "reset") {
        await resetPassword(data.email);
        // Page will show success state
      } else if (type === "updatePassword") {
        const { error } = await supabase.auth.updateUser({ password: data.password });
        if (error) throw error;
        // Page will show success state
      } else if (type === "complete") {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            background-color: ${T.bgDeep};
          }

          @media (max-width: 480px) {
            .auth-container { padding: 24px !important; }
            .auth-interests-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      {currentPage === "signin" && (
        <SignInPage
          onSwitch={handleSwitch}
          onAuth={handleAuth}
          error={error}
          submitting={submitting}
        />
      )}
      {currentPage === "signup" && (
        <SignUpPage
          onSwitch={handleSwitch}
          onAuth={handleAuth}
          error={error}
          submitting={submitting}
        />
      )}
      {currentPage === "forgot" && (
        <ForgotPasswordPage
          onSwitch={handleSwitch}
          onAuth={handleAuth}
          error={error}
          submitting={submitting}
        />
      )}
      {currentPage === "reset" && (
        <ResetPasswordPage
          onAuth={handleAuth}
          error={error}
          submitting={submitting}
        />
      )}
      {currentPage === "onboarding" && <OnboardingPage onAuth={handleAuth} />}
    </div>
  );
}
