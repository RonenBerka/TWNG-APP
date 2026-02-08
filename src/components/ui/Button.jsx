import { T } from '../../theme/tokens';

export default function Button({ children, variant = "primary", size = "md", onClick, style: customStyle, ...props }) {
  const sizes = {
    sm: { padding: "6px 12px", fontSize: "13px" },
    md: { padding: "10px 20px", fontSize: "14px" },
    lg: { padding: "14px 32px", fontSize: "16px" },
  };

  const variantStyles = {
    primary: {
      backgroundColor: T.warm, color: T.bgDeep,
      border: "none", fontWeight: "600",
    },
    secondary: {
      backgroundColor: "transparent", color: T.txt2,
      border: `1px solid ${T.border}`, fontWeight: "500",
    },
    ghost: {
      backgroundColor: "transparent", color: T.txt2,
      border: "none", fontWeight: "500",
    },
    danger: {
      backgroundColor: "#DC2626", color: "#fff",
      border: "none", fontWeight: "600",
    },
  };

  const s = sizes[size] || sizes.md;
  const v = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: "8px", borderRadius: "8px", cursor: "pointer",
        transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
        ...s, ...v, ...customStyle,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
