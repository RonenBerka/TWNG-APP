-- Create user_favorites table for likes/favorites system
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  favorite_id UUID NOT NULL,
  favorite_type VARCHAR(50) NOT NULL DEFAULT 'instrument',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_favorites_unique UNIQUE (user_id, favorite_id, favorite_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_target ON public.user_favorites(favorite_type, favorite_id);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Anyone can read favorites (to show like counts)
CREATE POLICY "Anyone can view favorites"
  ON public.user_favorites FOR SELECT
  USING (true);

-- Users can insert their own favorites
CREATE POLICY "Users can add own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can remove own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);
