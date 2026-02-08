-- Fix infinite recursion in users RLS policies
-- The "Admins view all users" policy queries the users table to check role,
-- which triggers RLS again, creating infinite recursion.
-- Fix: use auth.jwt() to check role from the JWT token instead.

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins view all users" ON users;

-- Recreate using auth.jwt() which doesn't trigger RLS
CREATE POLICY "Admins view all users" ON users
    FOR SELECT USING (
        (auth.jwt() ->> 'role') IN ('super_admin', 'admin', 'moderator', 'support', 'auditor')
        OR (
            -- Also allow via app_metadata for custom claims
            auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'admin', 'moderator', 'support', 'auditor')
        )
    );

-- Also fix any other policies that might self-reference the users table
-- Check guitars policies for similar issues
DROP POLICY IF EXISTS "Guitar owners manage own" ON guitars;
CREATE POLICY "Guitar owners manage own" ON guitars
    FOR ALL USING (auth.uid() = owner_id);

-- Ensure the public profiles policy is simple and doesn't recurse
DROP POLICY IF EXISTS "Public profiles visible" ON users;
CREATE POLICY "Public profiles visible" ON users
    FOR SELECT USING (
        deleted_at IS NULL
        AND status = 'active'
    );
