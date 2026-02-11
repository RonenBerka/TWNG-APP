import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase/client';

const ADMIN_ROLES = ['admin'];
const STAFF_ROLES = ['admin', 'moderator'];

export const ROLES = ['user', 'moderator', 'support', 'auditor', 'admin', 'super_admin'];

const AuthContext = createContext(null);

/**
 * Build a minimal profile from the JWT/session — no DB call needed.
 * With the new schema, we initialize with an empty roles array.
 * Roles will be populated from the user_roles table when the full profile loads.
 */
function profileFromSession(sessionUser) {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    roles: [], // Will be populated from user_roles table
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
    // New schema fields (populated on DB fetch)
    first_name: null,
    last_name: null,
    location: null,
    is_luthier: false,
    privacy_settings: null,
    notification_settings: null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileLoadedRef = useRef(false);

  // Roles are read from profile.roles array (from user_roles table)
  // which is populated by the DB fetch when it succeeds.
  const isAdmin = useMemo(
    () => profile?.roles?.some(role => ADMIN_ROLES.includes(role)) || false,
    [profile?.roles]
  );
  const isStaff = useMemo(
    () => profile?.roles?.some(role => STAFF_ROLES.includes(role)) || false,
    [profile?.roles]
  );
  const hasRole = useCallback(
    (roleName) => profile?.roles?.includes(roleName) || false,
    [profile?.roles]
  );

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

          // Build profile from JWT immediately — email, display_name
          // Roles will be populated from user_roles table on DB fetch.
          const jwtProfile = profileFromSession(session.user);
          setProfile((prev) => {
            // If we already have a full DB profile, keep its roles
            // (they're enriched from the user_roles table)
            if (prev && profileLoadedRef.current) {
              return { ...prev, ...jwtProfile, roles: prev.roles };
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
          // Step 1: Try the join query first (users + user_roles)
          const { data, error } = await supabase
            .from('users')
            .select('*, user_roles(role)')
            .eq('id', user.id)
            .single();

          if (cancelled) return;

          if (error) {
            if (error.message?.includes('AbortError') || error.name === 'AbortError') {
              // Wait and retry — StrictMode AbortError
              await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
              continue;
            }

            // Non-retryable error on join — try fallback approach
            console.warn('Profile join fetch failed, attempting fallback:', error.message);

            // Step 2: Try fetching user without the join
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (cancelled) return;

            if (userError) {
              // Step 3: User doesn't exist in users table — create a basic record
              if (userError.code === 'PGRST116') {
                console.warn('User not found in users table, upserting basic record...');

                const { data: newUser, error: upsertError } = await supabase
                  .from('users')
                  .upsert({
                    id: user.id,
                    email: user.email,
                    display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
                    username: user.email?.split('@')[0] + '_' + Date.now().toString(36),
                  }, { onConflict: 'id' })
                  .select()
                  .single();

                if (cancelled) return;

                if (upsertError) {
                  console.warn('User upsert failed:', upsertError.message);
                  return;
                }

                // Successfully created user, now fetch roles
                const { data: roleData } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', user.id);

                if (cancelled) return;

                const roles = (roleData || []).map(r => r.role);
                const enrichedProfile = {
                  ...newUser,
                  roles,
                };
                profileLoadedRef.current = true;
                setProfile(enrichedProfile);
                return;
              }

              console.warn('User fetch failed:', userError.message);
              return;
            }

            // User exists but join failed — separately fetch roles
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id);

            if (cancelled) return;

            const roles = (roleData || []).map(r => r.role);
            const enrichedProfile = {
              ...userData,
              roles,
            };

            // If username is null, generate from email and update DB
            if (!enrichedProfile.username && user.email) {
              const generatedUsername = user.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_');
              enrichedProfile.username = generatedUsername;
              supabase
                .from('users')
                .update({ username: generatedUsername })
                .eq('id', user.id)
                .then(() => {})
                .catch(() => {});
            }

            profileLoadedRef.current = true;
            setProfile(enrichedProfile);
            return;
          }

          if (data && !cancelled) {
            // Transform user_roles relation into a flat roles array
            const roles = data.user_roles?.map(ur => ur.role) || [];
            const enrichedProfile = {
              ...data,
              roles, // Replace user_roles relation with flat array
              user_roles: undefined, // Remove the relation object
            };

            // If username is null, generate from email and update DB
            if (!enrichedProfile.username && user.email) {
              const generatedUsername = user.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_');
              enrichedProfile.username = generatedUsername;
              // Non-blocking DB update
              supabase
                .from('users')
                .update({ username: generatedUsername })
                .eq('id', user.id)
                .then(() => {})
                .catch(() => {});
            }

            profileLoadedRef.current = true;
            setProfile(enrichedProfile);
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

    // Trigger welcome email sequence (non-blocking)
    if (data?.user?.id) {
      import('../lib/email/emailService').then(({ triggerWelcomeSequence }) => {
        triggerWelcomeSequence(data.user.id, email, displayName || email.split('@')[0]).catch((e) =>
          console.warn('Welcome email failed (non-critical):', e.message)
        );
      }).catch(() => { /* email module not critical */ });
    }

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
        roles: ["user"], // New schema: roles array
        bio: "Heritage enthusiast. Kalamazoo or bust.",
        created_at: "2024-06-15",
        first_name: "Alex",
        last_name: "Rivera",
        location: "Kalamazoo, MI",
        is_luthier: false,
        privacy_settings: null,
        notification_settings: null,
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
    roles: profile?.roles || [],
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
