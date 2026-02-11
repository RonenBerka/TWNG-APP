import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to derive role information from the auth context.
 *
 * Provides a comprehensive set of role checks and role data derived from
 * the user_roles table joined to the user profile.
 *
 * @returns {Object} Role information object containing:
 *   - roles: Array of role strings from user_roles table
 *   - primaryRole: First role in the array (or 'user' if none)
 *   - isAdmin: Boolean, true if user has admin or super_admin role
 *   - isModerator: Boolean, true if user has moderator role
 *   - isStaff: Boolean, true if user has any staff-level role
 *   - isLuthier: Boolean, true if user has is_luthier flag
 *   - isVerified: Boolean, true if user is verified
 *   - hasRole(roleName): Function to check if user has a specific role
 */
export function useRole() {
  const { profile } = useAuth();

  // Memoize computed role values to prevent re-renders
  const roleData = useMemo(() => {
    const roles = profile?.roles || [];
    const isAdmin = roles.includes('admin') || roles.includes('super_admin');
    const isModerator = roles.includes('moderator');
    const isStaff = roles.some(role =>
      ['admin', 'super_admin', 'moderator', 'support', 'auditor'].includes(role)
    );
    const isLuthier = profile?.is_luthier || false;
    const isVerified = profile?.is_verified || false;
    const primaryRole = roles.length > 0 ? roles[0] : 'user';

    const hasRole = (roleName) => roles.includes(roleName);

    return {
      roles,
      primaryRole,
      isAdmin,
      isModerator,
      isStaff,
      isLuthier,
      isVerified,
      hasRole,
    };
  }, [profile?.roles, profile?.is_luthier, profile?.is_verified]);

  return roleData;
}

export default useRole;
