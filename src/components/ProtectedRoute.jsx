import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T } from '../theme/tokens';

/**
 * Route guard that redirects unauthenticated users to /auth.
 * Shows a loading spinner while the auth session is being checked.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: T.bgDeep,
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          border: `3px solid ${T.border}`,
          borderTopColor: T.warm,
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
