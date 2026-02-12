-- Migration 010: Guitar reference catalog for autocomplete
-- Matches the seed CSV structure exactly

CREATE TABLE guitar_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT,                              -- first year of production
    year_range TEXT,                        -- e.g. "1952-present", "1958-1960"
    serial_number_pattern TEXT,             -- e.g. "NO16xxxxxx"
    body_style TEXT,                        -- Solid Body, Semi-Hollow, Offset, T-Style, etc.
    instrument_type TEXT DEFAULT 'electric',-- electric, acoustic, bass, classical
    body_material TEXT,                     -- Alder, Mahogany, Ash, etc.
    neck_joint TEXT,                        -- bolt-on, set-neck, neck-through
    neck_profile TEXT,                      -- C, D, V, slim taper, medium C, etc.
    fretboard_material TEXT,               -- Rosewood, Ebony, Maple, etc.
    fretboard_radius TEXT,                 -- 9.5", 12", compound, etc.
    pickup_config TEXT,                    -- HH, HSS, SSS, SS, P90, etc.
    bridge_type TEXT,                      -- Tune-o-matic, tremolo, fixed, wraparound, etc.
    tuners TEXT,                           -- Gotoh, Grover, Kluson, etc.
    finish_options JSONB,                  -- JSON array of color options
    specifications JSONB,                  -- Full specs JSON (scale_length, num_frets, etc.)
    dedup_fingerprint TEXT,                -- For dedup: "brand|model|year"
    tags JSONB,                            -- JSON array: ["boutique","handmade"]
    category TEXT,                         -- "Boutique Guitar", "Classic Electric", etc.
    production_status TEXT DEFAULT 'current', -- current, discontinued, limited
    source TEXT DEFAULT 'seed_database',
    source_urls JSONB,                     -- JSON array of reference URLs
    confidence NUMERIC(3,2),               -- 0.00 to 1.00
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicates
    CONSTRAINT uq_catalog_brand_model UNIQUE (brand, model)
);

-- Indexes for fast autocomplete queries
CREATE INDEX idx_catalog_brand ON guitar_catalog(brand);
CREATE INDEX idx_catalog_brand_model ON guitar_catalog(brand, model);
CREATE INDEX idx_catalog_instrument_type ON guitar_catalog(instrument_type);
CREATE INDEX idx_catalog_body_style ON guitar_catalog(body_style);
CREATE INDEX idx_catalog_dedup ON guitar_catalog(dedup_fingerprint);

-- Full text search for flexible matching
CREATE INDEX idx_catalog_fts ON guitar_catalog
    USING GIN (to_tsvector('english',
        COALESCE(brand,'') || ' ' ||
        COALESCE(model,'') || ' ' ||
        COALESCE(body_style,'') || ' ' ||
        COALESCE(category,'')
    ));

-- RLS: everyone can read, only admins can write
ALTER TABLE guitar_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read catalog"
    ON guitar_catalog FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage catalog"
    ON guitar_catalog FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );
