import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { applyTokens } from '../theme/tokens';

// ── Dark Theme (current default) ──
const darkTokens = {
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

// ── Light Theme (dark-neutral accents — no amber on white) ──
const lightTokens = {
  bgDeep: "#FAF8F7",
  bgCard: "#FFFFFF",
  bgElev: "#F5F1EF",
  border: "#E5E0DC",
  borderAcc: "#A8A29E",
  txt: "#1C1917",
  txt2: "#57534E",
  txtM: "#A8A29E",
  warm: "#292524",
  amber: "#44403C",
  success: "#059669",
  error: "#DC2626",
  info: "#2563EB",
};

const ThemeContext = createContext(null);

// Apply initial tokens based on saved preference (runs once at module load)
function getInitialMode() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('twng-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

// Set initial T values before first render (module load)
applyTokens(getInitialMode() === 'light' ? lightTokens : darkTokens);

function applyCSSVars(active) {
  const root = document.documentElement;
  root.style.setProperty('--twng-bg-deep', active.bgDeep);
  root.style.setProperty('--twng-bg-card', active.bgCard);
  root.style.setProperty('--twng-border', active.border);
  root.style.setProperty('--twng-border-acc', active.borderAcc);
  root.style.setProperty('--twng-txt', active.txt);
  root.style.setProperty('--twng-txt2', active.txt2);
  root.style.setProperty('--twng-txt-m', active.txtM);
  root.style.setProperty('--twng-warm', active.warm);
  document.body.style.background = active.bgDeep;
  document.body.style.color = active.txt;
}

export function ThemeProvider({ children }) {
  // Read from localStorage on every mount (important for key={mode} remount)
  const [mode, setMode] = useState(() => getInitialMode());

  const tokens = mode === 'light' ? lightTokens : darkTokens;
  const isDark = mode === 'dark';

  // Apply tokens synchronously during render so T is correct before paint
  applyTokens(tokens);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Persist BEFORE the re-render so remount reads correct value
      localStorage.setItem('twng-theme', next);
      return next;
    });
  }, []);

  // Update CSS vars and body styles when mode changes
  useEffect(() => {
    const active = mode === 'light' ? lightTokens : darkTokens;
    applyCSSVars(active);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    isDark,
    tokens,
    toggleTheme,
  }), [mode, isDark, tokens, toggleTheme]);

  return (
    <ThemeContext.Provider value={value} key={mode}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { mode: 'dark', isDark: true, tokens: darkTokens, toggleTheme: () => {} };
  }
  return ctx;
}

export { darkTokens, lightTokens };
