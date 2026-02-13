import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import { T } from '../theme/tokens';
import { ROUTES } from '../lib/routes';
import { ShieldX, Loader2 } from 'lucide-react';

/**
 * Route guard for admin-only pages.
 * - Loading → spinner
 * - Not authenticated → redirect to /auth
 * - Not staff → "Access Denied" page
 * - Staff → render children
 *
 * Uses the new user_roles table structure to check permissions.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { isStaff } = useRole();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: T.bgDeep,
        }}
      >
        <Loader2
          size={32}
          style={{ color: T.warm, animation: 'spin 1s linear infinite' }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  if (!isStaff) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: T.bgDeep,
          flexDirection: 'column',
          gap: '20px',
          padding: '40px',
        }}
      >
        <ShieldX size={56} style={{ color: T.warm, opacity: 0.6 }} />
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: 600,
            color: T.txt,
            margin: 0,
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            color: T.txt2,
            fontSize: '15px',
            maxWidth: '400px',
            textAlign: 'center',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          You don't have permission to access the admin panel.
          If you believe this is an error, contact a system administrator.
        </p>
      </div>
    );
  }

  return children;
}
