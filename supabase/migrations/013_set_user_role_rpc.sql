-- ============================================================
-- RPC: set_user_role
-- Allows admins to change another user's role.
-- Uses SECURITY DEFINER to bypass RLS.
-- Deletes old role rows and inserts new one in user_roles,
-- also updates users.role for consistency.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Permission denied: only admins can change roles';
  END IF;

  -- Replace role in user_roles (delete old, insert new)
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  INSERT INTO public.user_roles (user_id, role, updated_at)
  VALUES (target_user_id, new_role::app_role, NOW());

  -- Also update users.role for consistency
  UPDATE public.users
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

-- Grant execute to authenticated users (the function itself checks admin role)
GRANT EXECUTE ON FUNCTION public.set_user_role(UUID, TEXT) TO authenticated;
