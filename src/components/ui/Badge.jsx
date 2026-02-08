import { T } from '../../theme/tokens';

function getVariants() {
  return {
    default: { bg: `${T.warm}33`, text: T.warm, border: T.borderAcc },
    outline: { bg: "transparent", text: T.txt2, border: T.border },
    verified: { bg: "rgba(5, 150, 105, 0.2)", text: "#10B981", border: "#065F46" },
  };
}

export default function Badge({ children, variant = "default" }) {
  const v = getVariants()[variant] || getVariants().default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "2px 10px", borderRadius: "9999px",
      fontSize: "12px", fontWeight: "500",
      border: `1px solid ${v.border}`,
      whiteSpace: "nowrap", backgroundColor: v.bg, color: v.text,
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em"
    }}>
      {children}
    </span>
  );
}
