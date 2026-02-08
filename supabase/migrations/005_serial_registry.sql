-- ============================================================
-- Migration 005: Serial Number Registry
-- Stores decoded/verified serial number data for guitars.
-- Supports the Serial Number Decoder feature and future
-- "Claim Your Guitar" verification flow.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. SERIAL REGISTRY TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE serial_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core identification
    serial_number VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(200),

    -- Decoded date info
    year INTEGER,
    year_range VARCHAR(20),
    -- e.g. "1958-1959" when exact year unknown

    -- Factory / origin
    factory VARCHAR(200),
    -- e.g. "Corona, CA, USA", "Ensenada, Mexico"
    country VARCHAR(50),
    -- e.g. "USA", "Japan", "Mexico", "Indonesia", "Korea"

    -- Series / production
    series VARCHAR(150),
    -- e.g. "American Professional", "Vintage Reissue", "Studio"
    production_number VARCHAR(50),
    -- unit number extracted from serial

    -- Decode metadata
    confidence VARCHAR(20) DEFAULT 'medium',
    -- high, medium, low — from decoder engine
    decode_method VARCHAR(30) DEFAULT 'pattern',
    -- pattern (regex), official (mfr API/DB), manual, import

    -- Verification & trust
    verified BOOLEAN DEFAULT FALSE,
    -- TRUE = confirmed by admin, luthier, or official source
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,

    -- Source tracking
    source VARCHAR(30) DEFAULT 'user',
    -- user (decoded on site), official (mfr data), import (bulk), luthier
    contributed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    -- user who first decoded or contributed this entry

    -- Link to guitar entry (optional — connected when guitar is in DB)
    guitar_id UUID REFERENCES guitars(id) ON DELETE SET NULL,

    -- Extra decoded data (brand-specific fields)
    extra_data JSONB DEFAULT '{}',
    -- e.g. { "potCodes": "137-6520", "neckDate": "1965-02" }

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 2. INDEXES
-- ────────────────────────────────────────────────────────────

-- Prevent duplicate serial+brand entries
CREATE UNIQUE INDEX idx_serial_registry_unique
    ON serial_registry (serial_number, brand);

-- Lookups by serial number (most common query)
CREATE INDEX idx_serial_registry_serial
    ON serial_registry (serial_number);

-- Lookups by brand (for brand-specific pages)
CREATE INDEX idx_serial_registry_brand
    ON serial_registry (brand);

-- Lookups by linked guitar
CREATE INDEX idx_serial_registry_guitar
    ON serial_registry (guitar_id)
    WHERE guitar_id IS NOT NULL;

-- Lookups by contributor (user's decode history)
CREATE INDEX idx_serial_registry_contributor
    ON serial_registry (contributed_by)
    WHERE contributed_by IS NOT NULL;

-- Year-based queries (e.g. "all 1959 Les Pauls")
CREATE INDEX idx_serial_registry_year
    ON serial_registry (year)
    WHERE year IS NOT NULL;

-- Full-text search on serial + brand + model
CREATE INDEX idx_serial_registry_search
    ON serial_registry USING GIN (
        to_tsvector('english', serial_number || ' ' || brand || ' ' || COALESCE(model, ''))
    );

-- ────────────────────────────────────────────────────────────
-- 3. AUTO-UPDATE updated_at TRIGGER
-- ────────────────────────────────────────────────────────────

CREATE TRIGGER serial_registry_updated_at
    BEFORE UPDATE ON serial_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
-- NOTE: update_updated_at() should already exist from 001_initial_schema.
-- If not, uncomment below:
-- CREATE OR REPLACE FUNCTION update_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

ALTER TABLE serial_registry ENABLE ROW LEVEL SECURITY;

-- Anyone can READ serial registry (public reference data)
CREATE POLICY "serial_registry_read_all"
    ON serial_registry FOR SELECT
    USING (true);

-- Authenticated users can INSERT (decode + save)
CREATE POLICY "serial_registry_insert_auth"
    ON serial_registry FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can UPDATE their own contributions (before verification)
CREATE POLICY "serial_registry_update_own"
    ON serial_registry FOR UPDATE
    USING (
        contributed_by = auth.uid()
        AND verified = FALSE
    );

-- Admins can UPDATE anything (verification, corrections)
CREATE POLICY "serial_registry_update_admin"
    ON serial_registry FOR UPDATE
    USING (
        (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
    );

-- Admins can DELETE (cleanup bad data)
CREATE POLICY "serial_registry_delete_admin"
    ON serial_registry FOR DELETE
    USING (
        (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
    );

-- ────────────────────────────────────────────────────────────
-- 5. RPC: LOOKUP SERIAL (returns existing entry or NULL)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION lookup_serial(
    p_serial VARCHAR,
    p_brand VARCHAR DEFAULT NULL
)
RETURNS SETOF serial_registry
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM serial_registry
    WHERE serial_number = p_serial
      AND (p_brand IS NULL OR brand = p_brand)
    ORDER BY verified DESC, confidence ASC, created_at ASC
    LIMIT 5;
$$;

-- ────────────────────────────────────────────────────────────
-- 6. RPC: SERIAL STATS (for admin dashboard)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION serial_registry_stats()
RETURNS TABLE (
    total_entries BIGINT,
    verified_entries BIGINT,
    brands_covered BIGINT,
    top_brand VARCHAR,
    avg_confidence TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        COUNT(*) AS total_entries,
        COUNT(*) FILTER (WHERE verified) AS verified_entries,
        COUNT(DISTINCT brand) AS brands_covered,
        (SELECT brand FROM serial_registry GROUP BY brand ORDER BY COUNT(*) DESC LIMIT 1) AS top_brand,
        CASE
            WHEN COUNT(*) = 0 THEN 'n/a'
            ELSE ROUND(
                (COUNT(*) FILTER (WHERE confidence = 'high')::NUMERIC / GREATEST(COUNT(*), 1)) * 100
            )::TEXT || '% high'
        END AS avg_confidence
    FROM serial_registry;
$$;

-- ────────────────────────────────────────────────────────────
-- 7. LINK guitars.serial_number → serial_registry (optional)
-- ────────────────────────────────────────────────────────────
-- When a guitar with a serial number is saved, we can auto-link:

CREATE OR REPLACE FUNCTION link_guitar_serial()
RETURNS TRIGGER AS $$
BEGIN
    -- If this guitar has a serial_number, try to link matching registry entry
    IF NEW.serial_number IS NOT NULL AND NEW.serial_number != '' THEN
        UPDATE serial_registry
        SET guitar_id = NEW.id,
            updated_at = NOW()
        WHERE serial_number = NEW.serial_number
          AND brand = NEW.brand
          AND guitar_id IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_guitar_serial_link
    AFTER INSERT OR UPDATE OF serial_number ON guitars
    FOR EACH ROW
    EXECUTE FUNCTION link_guitar_serial();

-- ────────────────────────────────────────────────────────────
-- DONE
-- ────────────────────────────────────────────────────────────
