-- Create seed_guitars table for TWNG platform
-- This table stores guitars extracted from articles, social media posts, and videos
-- These are system-owned entries with NO real owner
-- When a user signs in and "claims" a guitar, data migrates to the main guitars table

CREATE TABLE IF NOT EXISTS seed_guitars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  year_range TEXT,
  serial_number_pattern TEXT,
  body_style TEXT,
  instrument_type TEXT DEFAULT 'electric',
  category TEXT,
  production_status TEXT DEFAULT 'current',
  finish_options JSONB,
  specifications JSONB,
  dedup_fingerprint TEXT,
  tags JSONB,
  source TEXT DEFAULT 'content_extraction',
  source_urls JSONB,
  confidence TEXT,
  story TEXT,
  claimed BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_seed_guitars_brand ON seed_guitars(brand);
CREATE INDEX IF NOT EXISTS idx_seed_guitars_brand_model ON seed_guitars(brand, model);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seed_guitars_dedup_fingerprint ON seed_guitars(dedup_fingerprint);
CREATE INDEX IF NOT EXISTS idx_seed_guitars_instrument_type ON seed_guitars(instrument_type);
CREATE INDEX IF NOT EXISTS idx_seed_guitars_claimed ON seed_guitars(claimed);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_seed_guitars_fts ON seed_guitars USING GIN (
  to_tsvector('english', brand || ' ' || model || ' ' || COALESCE(category, '') || ' ' || COALESCE(story, ''))
);

-- Enable RLS
ALTER TABLE seed_guitars ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Anyone can SELECT (public catalog of unclaimed guitars)
CREATE POLICY "seed_guitars_select_public" ON seed_guitars
  FOR SELECT
  USING (true);

-- RLS Policy 2: Only admins can INSERT
CREATE POLICY "seed_guitars_insert_admin_only" ON seed_guitars
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policy 3: Only admins can UPDATE all fields
CREATE POLICY "seed_guitars_update_admin_only" ON seed_guitars
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policy 4: Authenticated users can claim unclaimed guitars
CREATE POLICY "seed_guitars_claim" ON seed_guitars
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND claimed = false)
  WITH CHECK (
    claimed = true
    AND claimed_by = auth.uid()
    AND claimed_at IS NOT NULL
  );

-- RLS Policy 5: Only admins can DELETE
CREATE POLICY "seed_guitars_delete_admin_only" ON seed_guitars
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE seed_guitars IS 'Stores guitars extracted from articles, social media posts, and videos for TWNG platform. These are system-owned entries with no real owner. When a user claims a guitar, data migrates to the main guitars table.';
COMMENT ON COLUMN seed_guitars.id IS 'Unique identifier for the seed guitar entry';
COMMENT ON COLUMN seed_guitars.brand IS 'Guitar brand/manufacturer';
COMMENT ON COLUMN seed_guitars.model IS 'Guitar model name';
COMMENT ON COLUMN seed_guitars.year IS 'Specific year of manufacture if known';
COMMENT ON COLUMN seed_guitars.year_range IS 'Year range if specific year unknown (e.g., "2019-present")';
COMMENT ON COLUMN seed_guitars.serial_number_pattern IS 'Pattern or example of serial numbers for this model';
COMMENT ON COLUMN seed_guitars.body_style IS 'Body style: solid, semi-hollow, hollow, acoustic, classical';
COMMENT ON COLUMN seed_guitars.instrument_type IS 'Type of instrument: electric, acoustic, classical, bass';
COMMENT ON COLUMN seed_guitars.category IS 'Model family/category (e.g., "Les Paul", "SG", "Stratocaster")';
COMMENT ON COLUMN seed_guitars.production_status IS 'Current production status: current, discontinued, limited_edition, custom_shop';
COMMENT ON COLUMN seed_guitars.finish_options IS 'JSON array of available finish colors/options';
COMMENT ON COLUMN seed_guitars.specifications IS 'Full specifications object including _confidence, _spec_sources, _images, _famous_owner, _nickname, _notable_events, _ownership_history, _modification_history';
COMMENT ON COLUMN seed_guitars.dedup_fingerprint IS 'Deduplication fingerprint in format: "brand|model|year_or_range" (lowercase)';
COMMENT ON COLUMN seed_guitars.tags IS 'JSON array of tags from taxonomy';
COMMENT ON COLUMN seed_guitars.source IS 'Data source: content_extraction, manual_entry, etc.';
COMMENT ON COLUMN seed_guitars.source_urls IS 'JSON array of source URLs where this guitar was documented';
COMMENT ON COLUMN seed_guitars.confidence IS 'Confidence level: high, medium, low';
COMMENT ON COLUMN seed_guitars.story IS 'Narrative story about the guitar (150-500 words)';
COMMENT ON COLUMN seed_guitars.claimed IS 'Whether this guitar has been claimed by a user';
COMMENT ON COLUMN seed_guitars.claimed_by IS 'User ID of the user who claimed this guitar';
COMMENT ON COLUMN seed_guitars.claimed_at IS 'Timestamp when this guitar was claimed';
COMMENT ON COLUMN seed_guitars.created_at IS 'When this seed entry was created';
