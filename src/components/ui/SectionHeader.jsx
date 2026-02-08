import { T } from '../../theme/tokens';

export default function SectionHeader({ eyebrow, title, description, align = "center" }) {
  return (
    <div style={{
      marginBottom: "48px",
      maxWidth: align === "center" ? "42rem" : "auto",
      marginLeft: align === "center" ? "auto" : "0",
      marginRight: align === "center" ? "auto" : "0",
      textAlign: align === "center" ? "center" : "left",
    }}>
      {eyebrow && (
        <p style={{
          color: T.warm, fontSize: "12px", fontWeight: "500",
          textTransform: "uppercase", marginBottom: "12px",
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em",
        }}>{eyebrow}</p>
      )}
      <h2 style={{
        fontWeight: "700", marginBottom: "16px", lineHeight: "1.2",
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(28px, 4vw, 40px)", color: T.txt,
      }}>{title}</h2>
      {description && (
        <p style={{ color: "#9CA3AF", fontSize: "16px", lineHeight: "1.625" }}>{description}</p>
      )}
    </div>
  );
}
