-- ============================================================
-- Migration 003: Admin System
-- Role-to-JWT sync, admin RPC functions, bootstrap
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ROLE → JWT SYNC TRIGGERS
--    Keeps auth.users.raw_app_meta_data.role in sync with
--    users.role so RLS policies using auth.jwt() work.
-- ────────────────────────────────────────────────────────────

-- 1a. Sync on UPDATE (role changes)
CREATE OR REPLACE FUNCTION sync_role_to_auth_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    UPDATE auth.users
    SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_role_change
  AFTER UPDATE OF role ON users
  FOR EACH ROW EXECUTE FUNCTION sync_role_to_auth_metadata();

-- 1b. Sync on INSERT (new signups)
CREATE OR REPLACE FUNCTION sync_role_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', COALESCE(NEW.role, 'user'))
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_sync_role
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION sync_role_on_insert();

-- ────────────────────────────────────────────────────────────
-- 2. RPC: admin_update_user_role
--    Only admins can call. Enforces role hierarchy.
--    Automatically syncs to JWT via the trigger above.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_update_user_role(
  p_target_user_id UUID,
  p_new_role VARCHAR
)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  username VARCHAR,
  display_name VARCHAR,
  role VARCHAR,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_actor_role TEXT;
  v_old_role TEXT;
BEGIN
  -- Get caller's role from JWT
  v_actor_role := COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    'user'
  );

  -- Only admin or super_admin can change roles
  IF v_actor_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: only admins can change user roles';
  END IF;

  -- Only super_admin can assign admin-tier roles
  IF p_new_role IN ('super_admin', 'admin') AND v_actor_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can assign admin or super_admin roles';
  END IF;

  -- Validate role value
  IF p_new_role NOT IN ('user', 'luthier', 'moderator', 'admin', 'super_admin', 'support', 'auditor') THEN
    RAISE EXCEPTION 'Invalid role: %', p_new_role;
  END IF;

  -- Get current role for audit
  SELECT u.role INTO v_old_role FROM users u WHERE u.id = p_target_user_id AND u.deleted_at IS NULL;
  IF v_old_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Skip if no change
  IF v_old_role = p_new_role THEN
    RETURN QUERY
      SELECT u.id, u.email, u.username, u.display_name, u.role, u.updated_at
      FROM users u WHERE u.id = p_target_user_id;
    RETURN;
  END IF;

  -- Update role (trigger syncs to auth.users)
  UPDATE users
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_target_user_id;

  -- Audit log
  INSERT INTO audit_log (id, actor_id, actor_type, action, entity_type, entity_id, details, created_at)
  VALUES (
    gen_random_uuid(),
    auth.uid(),
    'admin',
    'user.role_change',
    'user',
    p_target_user_id,
    jsonb_build_object('old_role', v_old_role, 'new_role', p_new_role),
    NOW()
  );

  RETURN QUERY
    SELECT u.id, u.email, u.username, u.display_name, u.role, u.updated_at
    FROM users u WHERE u.id = p_target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 3. RPC: admin_get_users
--    Paginated user list for the admin panel.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_get_users(
  p_search_term VARCHAR DEFAULT NULL,
  p_role_filter VARCHAR DEFAULT NULL,
  p_status_filter VARCHAR DEFAULT NULL,
  p_page INT DEFAULT 1,
  p_per_page INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  role VARCHAR,
  status VARCHAR,
  is_verified BOOLEAN,
  created_at TIMESTAMPTZ,
  guitar_count BIGINT
) AS $$
DECLARE
  v_actor_role TEXT;
  v_offset INT;
BEGIN
  -- Get caller's role from JWT
  v_actor_role := COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    'user'
  );

  -- Only staff can list users
  IF v_actor_role NOT IN ('super_admin', 'admin', 'moderator', 'support', 'auditor') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_offset := (p_page - 1) * p_per_page;

  RETURN QUERY
    SELECT
      u.id,
      u.email,
      u.username,
      u.display_name,
      u.avatar_url,
      u.role,
      u.status,
      u.is_verified,
      u.created_at,
      COUNT(g.id) AS guitar_count
    FROM users u
    LEFT JOIN guitars g ON g.owner_id = u.id AND g.deleted_at IS NULL
    WHERE u.deleted_at IS NULL
      AND (p_search_term IS NULL OR p_search_term = ''
           OR u.email ILIKE '%' || p_search_term || '%'
           OR u.username ILIKE '%' || p_search_term || '%'
           OR u.display_name ILIKE '%' || p_search_term || '%')
      AND (p_role_filter IS NULL OR p_role_filter = '' OR u.role = p_role_filter)
      AND (p_status_filter IS NULL OR p_status_filter = '' OR u.status = p_status_filter)
    GROUP BY u.id, u.email, u.username, u.display_name, u.avatar_url,
             u.role, u.status, u.is_verified, u.created_at
    ORDER BY u.created_at DESC
    LIMIT p_per_page OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 4. RPC: admin_get_user_count
--    Total count for pagination
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_get_user_count(
  p_search_term VARCHAR DEFAULT NULL,
  p_role_filter VARCHAR DEFAULT NULL,
  p_status_filter VARCHAR DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_actor_role TEXT;
  v_count BIGINT;
BEGIN
  v_actor_role := COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    'user'
  );

  IF v_actor_role NOT IN ('super_admin', 'admin', 'moderator', 'support', 'auditor') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM users u
  WHERE u.deleted_at IS NULL
    AND (p_search_term IS NULL OR p_search_term = ''
         OR u.email ILIKE '%' || p_search_term || '%'
         OR u.username ILIKE '%' || p_search_term || '%'
         OR u.display_name ILIKE '%' || p_search_term || '%')
    AND (p_role_filter IS NULL OR p_role_filter = '' OR u.role = p_role_filter)
    AND (p_status_filter IS NULL OR p_status_filter = '' OR u.status = p_status_filter);

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 5. BOOTSTRAP: promote_to_admin
--    One-time function to create the first super_admin.
--    Fails if any admin already exists (prevents abuse).
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION promote_to_admin(p_email VARCHAR)
RETURNS TABLE (
  out_user_id UUID,
  out_email VARCHAR,
  out_role VARCHAR
) AS $$
DECLARE
  v_admin_count INT;
  v_user_id UUID;
BEGIN
  -- Check if any admin already exists
  SELECT COUNT(*) INTO v_admin_count
  FROM users u
  WHERE u.role IN ('super_admin', 'admin') AND u.deleted_at IS NULL;

  IF v_admin_count > 0 THEN
    RAISE EXCEPTION 'An admin already exists. Use admin_update_user_role() instead.';
  END IF;

  -- Find user
  SELECT u.id INTO v_user_id
  FROM users u
  WHERE u.email = p_email AND u.deleted_at IS NULL;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', p_email;
  END IF;

  -- Promote (trigger syncs to auth.users)
  UPDATE users SET role = 'super_admin', updated_at = NOW()
  WHERE id = v_user_id;

  -- Audit log (system bootstrap)
  INSERT INTO audit_log (id, actor_id, actor_type, action, entity_type, entity_id, details, created_at)
  VALUES (
    gen_random_uuid(),
    NULL,
    'system',
    'bootstrap.promote_to_super_admin',
    'user',
    v_user_id,
    jsonb_build_object('email', p_email),
    NOW()
  );

  RETURN QUERY
    SELECT u.id, u.email, u.role
    FROM users u WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 6. INDEX for role lookups
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
