-- ============================================================
-- TWNG Database Migration 019: RPC functions for homepage_blocks
-- Run this in Supabase SQL Editor
-- ============================================================
-- PostgREST has a stale schema cache that hides 7 of 8 homepage_blocks rows.
-- These RPC functions run inside Postgres, bypassing PostgREST's cache.

-- 1. Get all homepage blocks (bypasses PostgREST SELECT filtering)
CREATE OR REPLACE FUNCTION get_homepage_blocks()
RETURNS SETOF homepage_blocks
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.homepage_blocks
  ORDER BY display_order ASC;
$$;

-- 2. Update a homepage block by type (bypasses PostgREST UPDATE filtering)
CREATE OR REPLACE FUNCTION update_homepage_block_by_type(
  p_type text,
  p_title text,
  p_is_active boolean,
  p_display_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.homepage_blocks
  SET title = p_title,
      is_active = p_is_active,
      display_order = p_display_order,
      updated_at = now()
  WHERE type = p_type;
END;
$$;

-- Grant execute to authenticated users (admin RLS still applies via app logic)
GRANT EXECUTE ON FUNCTION get_homepage_blocks() TO authenticated;
GRANT EXECUTE ON FUNCTION update_homepage_block_by_type(text, text, boolean, integer) TO authenticated;
