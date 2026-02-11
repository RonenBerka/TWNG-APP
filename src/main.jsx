import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'

// ─── Error Boundary ───────────────────────────────────────
// Catches any React render error and displays it on screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px', fontFamily: 'monospace', backgroundColor: '#1a0000',
          color: '#ff6b6b', minHeight: '100vh', whiteSpace: 'pre-wrap',
          wordBreak: 'break-word', fontSize: '14px', lineHeight: '1.6',
        }}>
          <h1 style={{ color: '#ff4444', fontSize: '24px', marginBottom: '16px' }}>
            TWNG — Runtime Error
          </h1>
          <div style={{
            background: '#2a0000', padding: '16px', borderRadius: '8px',
            border: '1px solid #ff4444', marginBottom: '16px',
          }}>
            <strong>Error:</strong> {this.state.error?.message || String(this.state.error)}
          </div>
          {this.state.error?.stack && (
            <div style={{
              background: '#1a1a1a', padding: '16px', borderRadius: '8px',
              border: '1px solid #444', color: '#ccc', fontSize: '12px',
            }}>
              <strong style={{ color: '#ff6b6b' }}>Stack Trace:</strong>
              {'\n'}{this.state.error.stack}
            </div>
          )}
          {this.state.errorInfo?.componentStack && (
            <div style={{
              background: '#1a1a1a', padding: '16px', borderRadius: '8px',
              border: '1px solid #444', color: '#aaa', marginTop: '12px', fontSize: '12px',
            }}>
              <strong style={{ color: '#ff6b6b' }}>Component Stack:</strong>
              {this.state.errorInfo.componentStack}
            </div>
          )}
          <p style={{ marginTop: '24px', color: '#999', fontSize: '13px' }}>
            Copy this error and send it to Ronen for debugging.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Global error handlers ────────────────────────────────
// Catch unhandled JS errors & promise rejections and show them.
const errorBox = document.createElement('div');
errorBox.id = 'global-error-box';
errorBox.style.cssText =
  'display:none;position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
  'background:#2a0000;color:#ff6b6b;font-family:monospace;font-size:12px;' +
  'padding:12px 16px;border-top:2px solid #ff4444;max-height:40vh;overflow:auto;white-space:pre-wrap;';
document.body.appendChild(errorBox);

function showGlobalError(msg) {
  errorBox.style.display = 'block';
  errorBox.textContent += msg + '\n\n';
}

window.onerror = (message, source, line, col, error) => {
  showGlobalError(`[onerror] ${message}\n  at ${source}:${line}:${col}\n  ${error?.stack || ''}`);
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason instanceof Error
    ? `${reason.message}\n${reason.stack}`
    : String(reason);
  showGlobalError(`[unhandledrejection] ${msg}`);
});

// ─── Mount React ──────────────────────────────────────────
try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (err) {
  // If even the initial render call throws synchronously
  document.getElementById('root').innerHTML = `
    <div style="padding:40px;font-family:monospace;color:#ff4444;background:#1a0000;min-height:100vh;">
      <h1>TWNG — Fatal Startup Error</h1>
      <pre style="white-space:pre-wrap;color:#ff6b6b;">${err.message}\n\n${err.stack}</pre>
    </div>
  `;
}
