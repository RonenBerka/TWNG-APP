-- ============================================================
-- TWNG Database Migration 007: Storage Bucket for Homepage/CMS Images
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the homepage-images bucket (public read, authenticated admin write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homepage-images',
  'homepage-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policies for homepage-images bucket

-- Authenticated users (admins) can upload homepage images
CREATE POLICY "Authenticated users can upload homepage images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homepage-images');

-- Anyone can view homepage images (they're displayed publicly on the site)
CREATE POLICY "Anyone can view homepage images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'homepage-images');

-- Authenticated users can update homepage images
CREATE POLICY "Authenticated users can update homepage images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'homepage-images');

-- Authenticated users can delete homepage images
CREATE POLICY "Authenticated users can delete homepage images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'homepage-images');
