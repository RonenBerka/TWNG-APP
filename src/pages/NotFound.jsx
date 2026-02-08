import { Link } from 'react-router-dom';
import { T } from '../theme/tokens';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 24px", textAlign: "center",
      backgroundColor: T.bgDeep,
    }}>
      <p style={{
        fontSize: "120px", fontWeight: "700", lineHeight: "1",
        fontFamily: "'Playfair Display', serif",
        background: `linear-gradient(135deg, ${T.warm}, ${T.amber})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>404</p>
      <h1 style={{
        fontSize: "24px", fontWeight: "600", color: T.txt,
        marginTop: "16px", marginBottom: "12px",
      }}>Page Not Found</h1>
      <p style={{
        fontSize: "16px", color: T.txt2, maxWidth: "400px",
        lineHeight: "1.6", marginBottom: "32px",
      }}>
        This guitar must have been moved to a different collection. Let's get you back on track.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "12px 24px", borderRadius: "8px",
          backgroundColor: T.warm, color: T.bgDeep,
          fontWeight: "600", fontSize: "14px",
          textDecoration: "none", border: "none",
        }}>
          <Home size={16} /> Home
        </Link>
        <Link to="/explore" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "12px 24px", borderRadius: "8px",
          border: `1px solid ${T.border}`, color: T.txt2,
          fontWeight: "500", fontSize: "14px",
          textDecoration: "none", backgroundColor: "transparent",
        }}>
          <ArrowLeft size={16} /> Explore
        </Link>
      </div>
    </div>
  );
}
