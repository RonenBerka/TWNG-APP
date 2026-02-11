import useRole from '../hooks/useRole';

/**
 * RoleGuard Component
 *
 * A wrapper component that conditionally renders content based on user roles.
 * If the user has ANY of the specified roles, children are rendered.
 * Otherwise, the fallback component is rendered (or nothing if not provided).
 *
 * @component
 * @param {Object} props
 * @param {string[]} props.roles - Array of allowed role strings (e.g., ['admin', 'moderator'])
 * @param {React.ReactNode} props.children - Content to show if user has required role
 * @param {React.ReactNode} [props.fallback] - Component to show if access denied (defaults to null)
 *
 * @example
 * // Basic usage - show AdminPanel only to admins
 * <RoleGuard roles={['admin']}>
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // With fallback - show AccessDenied if user doesn't have required roles
 * <RoleGuard roles={['admin', 'moderator']} fallback={<AccessDenied />}>
 *   <ModerationQueue />
 * </RoleGuard>
 *
 * @example
 * // Multiple allowed roles
 * <RoleGuard roles={['admin', 'support', 'auditor']}>
 *   <SupportDashboard />
 * </RoleGuard>
 */
export default function RoleGuard({ roles, children, fallback = null }) {
  const roleData = useRole();

  // Check if user has ANY of the specified roles
  const hasRequiredRole = roles.some(requiredRole =>
    roleData.hasRole(requiredRole)
  );

  // Render children if user has required role, otherwise render fallback
  return hasRequiredRole ? children : fallback;
}
