-- ============================================================
-- TWNG Database Migration 004: Storage Bucket for Guitar Images
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the guitar-images bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guitar-images',
  'guitar-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policies for guitar-images bucket

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload guitar images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guitar-images');

-- Anyone (including anon) can view guitar images
CREATE POLICY "Anyone can view guitar images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guitar-images');

-- Users can update their own uploads (path starts with their user id)
CREATE POLICY "Users can update their own guitar image uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guitar-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own guitar image uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guitar-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
