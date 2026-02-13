-- ============================================================
-- TWNG Database Migration 018: Fix Homepage Blocks Type Constraint
-- Run this in Supabase SQL Editor
-- ============================================================
-- The existing CHECK constraint on homepage_blocks.type only accepts
-- 'hero', 'featured_collection', 'featured_article'.
-- The Admin panel needs to save 8+ block types.
-- This migration drops the constraint; validation is handled in app code.

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = 'homepage_blocks'
    AND con.contype = 'c'
    AND nsp.nspname = 'public';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.homepage_blocks DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No CHECK constraint found on homepage_blocks';
  END IF;
END $$;
