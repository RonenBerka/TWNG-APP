import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase/client';

const ADMIN_ROLES = ['admin', 'super_admin'];
const STAFF_ROLES = ['admin', 'super_admin', 'moderator', 'support', 'auditor'];

const AuthContext = createContext(null);

/**
 * Build a minimal profile from the JWT/session — no DB call needed.
 * The role is synced to auth.users.raw_app_meta_data by our DB trigger,
 * so it's always available in the JWT without hitting the users table.
 */
function profileFromSession(sessionUser) {
  const role = sessionUser.app_metadata?.role || 'user';
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    role,
    display_name:
      sessionUser.user_metadata?.display_name ||
      sessionUser.user_metadata?.full_name ||
      null,
    avatar_url: sessionUser.user_metadata?.avatar_url || null,
    // These will be filled when the full DB profile loads
    username: null,
    bio: null,
    status: 'active',
    is_verified: false,
    created_at: sessionUser.created_at || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileLoadedRef = useRef(false);

  // Role reads from profile.role — which is set from JWT immediately,
  // then enriched by DB fetch when it succeeds.
  const isAdmin = useMemo(() => ADMIN_ROLES.includes(profile?.role), [profile?.role]);
  const isStaff = useMemo(() => STAFF_ROLES.includes(profile?.role), [profile?.role]);
  const hasRole = useCallback((role) => profile?.role === role, [profile?.role]);

  // ────────────────────────────────────────────────────────
  // Auth state listener — single source of truth.
  // Sets user + JWT-based profile SYNCHRONOUSLY, then
  // the lazy profile fetch below enriches with DB data.
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const cancelled = { current: false };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled.current) return;

        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);

          // Build profile from JWT immediately — role, email, display_name
          // This makes isAdmin/isStaff work without any DB fetch.
          const jwtProfile = profileFromSession(session.user);
          setProfile((prev) => {
            // If we already have a full DB profile, merge JWT role
            // (in case role changed via token refresh)
            if (prev && profileLoadedRef.current) {
              return { ...prev, role: jwtProfile.role };
            }
            // Otherwise use JWT profile as initial
            return jwtProfile;
          });

          setLoading(false);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
          profileLoadedRef.current = false;
        }
      }
    );

    return () => {
      cancelled.current = true;
      subscription.unsubscribe();
    };
  }, []);

  // ────────────────────────────────────────────────────────
  // Lazy profile fetch — enriches JWT profile with DB data
  // (username, bio, privacy_settings, etc.)
  // Uses setTimeout to dodge React 18 StrictMode AbortErrors.
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      profileLoadedRef.current = false;
      return;
    }

    // Already loaded full profile for this user
    if (profileLoadedRef.current) return;

    let cancelled = false;
    let timeoutId;

    const fetchFullProfile = async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (cancelled) return;

        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (cancelled) return;

          if (error) {
            if (error.message?.includes('AbortError') || error.name === 'AbortError') {
              // Wait and retry — StrictMode AbortError
              await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
              continue;
            }
            console.warn('Profile fetch error:', error.message);
            return; // Non-retryable error; JWT profile is good enough
          }

          if (data && !cancelled) {
            profileLoadedRef.current = true;
            setProfile(data);
          }
          return;
        } catch (err) {
          if (cancelled) return;
          if (err.name === 'AbortError') {
            await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
            continue;
          }
          console.warn('Profile fetch exception:', err.message);
          return; // JWT profile is good enough
        }
      }
    };

    // Delay to let StrictMode's first render cleanup complete
    timeoutId = setTimeout(fetchFullProfile, 150);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [user?.id]);

  // Sign in with email/password
  const login = useCallback(async ({ email, password }) => {
    profileLoadedRef.current = false;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign up with email/password
  const signup = useCallback(async ({ email, password, displayName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign in with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    profileLoadedRef.current = false;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  // Reset password via email
  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth?mode=reset'
    });
    if (error) throw error;
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }, [user]);

  // Dev toggle (for testing without Supabase credentials)
  const toggleAuth = useCallback(() => {
    if (isAuthenticated) {
      logout();
    } else {
      const mockUser = {
        id: "usr_001",
        email: "alex@example.com",
        app_metadata: { role: "user" },
        user_metadata: { display_name: "Alex Rivera" },
      };
      const mockProfile = {
        id: "usr_001",
        username: "kalamazoo_kid",
        display_name: "Alex Rivera",
        email: "alex@example.com",
        avatar_url: null,
        role: "user",
        bio: "Heritage enthusiast. Kalamazoo or bust.",
        created_at: "2024-06-15",
      };
      setUser(mockUser);
      setProfile(mockProfile);
      setIsAuthenticated(true);
    }
  }, [isAuthenticated, logout]);

  const value = {
    user,
    profile,
    isAuthenticated,
    loading,
    isAdmin,
    isStaff,
    hasRole,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    toggleAuth,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
