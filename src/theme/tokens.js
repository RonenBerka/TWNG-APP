/**
 * Theme tokens for TWNG app.
 *
 * T is a live mutable object. ThemeContext updates it when the theme changes.
 * All 29+ files that import { T } will automatically get the correct values
 * on next render because React re-renders flow through.
 *
 * For guaranteed reactivity, use useTheme().tokens in components.
 */

// Mutable token object — ThemeContext swaps values on theme change
export const T = {
  bgDeep: "#0C0A09",
  bgCard: "#1C1917",
  bgElev: "#1A1816",
  border: "#2E2A27",
  borderAcc: "#78350F",
  txt: "#FAFAF9",
  txt2: "#A8A29E",
  txtM: "#78716C",
  warm: "#D97706",
  amber: "#F59E0B",
  success: "#34D399",
  error: "#EF4444",
  info: "#60A5FA",
};

/**
 * Called by ThemeContext when theme changes.
 * Mutates T in place so every module that imported it sees new values.
 */
export function applyTokens(newTokens) {
  Object.assign(T, newTokens);
}
