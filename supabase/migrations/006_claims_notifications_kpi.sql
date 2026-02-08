-- ============================================================
-- Migration 006: Claims, Notifications & KPI Dashboard
-- Adds guitar claim system for ownership verification,
-- notification framework, and KPI dashboard for analytics.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ADD is_claimable COLUMN TO guitars TABLE
-- ────────────────────────────────────────────────────────────

ALTER TABLE guitars ADD COLUMN IF NOT EXISTS is_claimable BOOLEAN DEFAULT FALSE;

-- ────────────────────────────────────────────────────────────
-- 2. GUITAR_CLAIMS TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE guitar_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    guitar_id UUID NOT NULL REFERENCES guitars(id) ON DELETE CASCADE,
    claimer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Claim status workflow
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, under_review, approved, rejected, withdrawn

    -- Verification evidence
    verification_type VARCHAR(30),
    -- instagram_match, serial_photo, receipt, luthier_vouch, other
    verification_data JSONB DEFAULT '{}',
    -- { instagram_handle, serial_photo_url, receipt_url, notes, ... }

    -- Claim details
    claim_reason TEXT,
    -- User's explanation: "This is my guitar, here's my proof"
    rejection_reason TEXT,
    -- Admin fills this if status = 'rejected'

    -- Admin review metadata
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. GUITAR_CLAIMS INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX idx_guitar_claims_guitar
    ON guitar_claims (guitar_id);

CREATE INDEX idx_guitar_claims_claimer
    ON guitar_claims (claimer_id);

CREATE INDEX idx_guitar_claims_status
    ON guitar_claims (status);

CREATE INDEX idx_guitar_claims_created
    ON guitar_claims (created_at DESC);

-- Ensure one pending claim per user per guitar
CREATE UNIQUE INDEX idx_guitar_claims_unique_pending
    ON guitar_claims (guitar_id, claimer_id)
    WHERE status = 'pending';

-- ────────────────────────────────────────────────────────────
-- 4. GUITAR_CLAIMS AUTO-UPDATE TRIGGER
-- ────────────────────────────────────────────────────────────

CREATE TRIGGER guitar_claims_updated_at
    BEFORE UPDATE ON guitar_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 5. GUITAR_CLAIMS ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

ALTER TABLE guitar_claims ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT their own claims
CREATE POLICY "guitar_claims_select_own"
    ON guitar_claims FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND claimer_id = auth.uid()
    );

-- Admins can SELECT all claims
CREATE POLICY "guitar_claims_select_admin"
    ON guitar_claims FOR SELECT
    USING (
        (auth.jwt() ->> 'app_metadata') ->> 'role' IN ('admin', 'super_admin')
    );

-- Authenticated users can INSERT (submit claim)
CREATE POLICY "guitar_claims_insert_auth"
    ON guitar_claims FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND claimer_id = auth.uid()
    );

-- Admins can UPDATE (approve/reject)
CREATE POLICY "guitar_claims_update_admin"
    ON guitar_claims FOR UPDATE
    USING (
        (auth.jwt() ->> 'app_metadata') ->> 'role' IN ('admin', 'super_admin')
    );

-- Users can UPDATE their own pending claims (withdraw only)
CREATE POLICY "guitar_claims_update_own_pending"
    ON guitar_claims FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND claimer_id = auth.uid()
        AND status = 'pending'
    )
    WITH CHECK (
        status = 'withdrawn'
    );

-- ────────────────────────────────────────────────────────────
-- 6. RPC: submit_claim
--    Checks guitar exists and is claimable or orphaned.
--    Checks no existing pending claim by same user.
--    Inserts claim and creates admin notification.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_claim(
    p_guitar_id UUID,
    p_verification_type VARCHAR,
    p_verification_data JSONB DEFAULT '{}',
    p_claim_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    guitar_id UUID,
    claimer_id UUID,
    status VARCHAR,
    verification_type VARCHAR,
    claim_reason TEXT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    v_user_id UUID;
    v_guitar_exists BOOLEAN;
    v_is_claimable BOOLEAN;
    v_owner_id UUID;
    v_existing_claim UUID;
    v_claim_id UUID;
BEGIN
    -- Get caller
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: must be authenticated';
    END IF;

    -- Check guitar exists
    SELECT EXISTS(SELECT 1 FROM guitars WHERE id = p_guitar_id AND deleted_at IS NULL)
    INTO v_guitar_exists;
    IF NOT v_guitar_exists THEN
        RAISE EXCEPTION 'Guitar not found';
    END IF;

    -- Get guitar info
    SELECT is_claimable, owner_id
    INTO v_is_claimable, v_owner_id
    FROM guitars
    WHERE id = p_guitar_id AND deleted_at IS NULL;

    -- Check if guitar is claimable or orphaned
    IF NOT v_is_claimable AND v_owner_id IS NOT NULL THEN
        RAISE EXCEPTION 'Guitar is not claimable and has an owner';
    END IF;

    -- Check no existing pending claim from this user for this guitar
    SELECT id INTO v_existing_claim
    FROM guitar_claims
    WHERE guitar_id = p_guitar_id
      AND claimer_id = v_user_id
      AND status = 'pending';

    IF v_existing_claim IS NOT NULL THEN
        RAISE EXCEPTION 'You already have a pending claim for this guitar';
    END IF;

    -- Insert claim
    INSERT INTO guitar_claims (
        guitar_id,
        claimer_id,
        verification_type,
        verification_data,
        claim_reason
    )
    VALUES (
        p_guitar_id,
        v_user_id,
        p_verification_type,
        p_verification_data,
        p_claim_reason
    )
    RETURNING guitar_claims.id INTO v_claim_id;

    -- Create notification for admins
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        action_url
    )
    SELECT
        u.id,
        'claim_submitted',
        'New Guitar Claim',
        'A new claim has been submitted for review',
        'claim',
        v_claim_id,
        '/admin/claims/' || v_claim_id
    FROM users u
    WHERE u.role IN ('admin', 'super_admin')
      AND u.deleted_at IS NULL;

    RETURN QUERY
    SELECT
        gc.id,
        gc.guitar_id,
        gc.claimer_id,
        gc.status,
        gc.verification_type,
        gc.claim_reason,
        gc.created_at
    FROM guitar_claims gc
    WHERE gc.id = v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 7. RPC: approve_claim
--    Only admins can call.
--    Approves claim, transfers guitar ownership, creates notification.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION approve_claim(
    p_claim_id UUID
)
RETURNS TABLE (
    claim_id UUID,
    guitar_id UUID,
    claimer_id UUID,
    status VARCHAR,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ
) AS $$
DECLARE
    v_admin_role TEXT;
    v_claim_record RECORD;
    v_admin_id UUID;
BEGIN
    -- Get caller's role
    v_admin_role := (auth.jwt() ->> 'app_metadata') ->> 'role';
    IF v_admin_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Unauthorized: only admins can approve claims';
    END IF;

    v_admin_id := auth.uid();

    -- Get claim record
    SELECT * INTO v_claim_record
    FROM guitar_claims
    WHERE id = p_claim_id;

    IF v_claim_record IS NULL THEN
        RAISE EXCEPTION 'Claim not found';
    END IF;

    -- Update claim status
    UPDATE guitar_claims
    SET status = 'approved',
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_claim_id;

    -- Transfer guitar ownership
    UPDATE guitars
    SET owner_id = v_claim_record.claimer_id,
        is_claimable = FALSE,
        updated_at = NOW()
    WHERE id = v_claim_record.guitar_id;

    -- Create notification for claimer
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        action_url
    )
    VALUES (
        v_claim_record.claimer_id,
        'claim_approved',
        'Claim Approved',
        'Your guitar claim has been approved! You are now the owner.',
        'claim',
        p_claim_id,
        '/guitars/' || v_claim_record.guitar_id
    );

    -- Audit log
    INSERT INTO audit_log (
        id,
        actor_id,
        actor_type,
        action,
        entity_type,
        entity_id,
        details,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_admin_id,
        'admin',
        'claim.approved',
        'claim',
        p_claim_id,
        jsonb_build_object(
            'guitar_id', v_claim_record.guitar_id,
            'claimer_id', v_claim_record.claimer_id
        ),
        NOW()
    );

    RETURN QUERY
    SELECT
        gc.id,
        gc.guitar_id,
        gc.claimer_id,
        gc.status,
        gc.reviewed_by,
        gc.reviewed_at
    FROM guitar_claims gc
    WHERE gc.id = p_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 8. RPC: reject_claim
--    Only admins can call.
--    Rejects claim with reason, creates notification for claimer.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reject_claim(
    p_claim_id UUID,
    p_reason TEXT
)
RETURNS TABLE (
    claim_id UUID,
    guitar_id UUID,
    claimer_id UUID,
    status VARCHAR,
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ
) AS $$
DECLARE
    v_admin_role TEXT;
    v_claim_record RECORD;
    v_admin_id UUID;
BEGIN
    -- Get caller's role
    v_admin_role := (auth.jwt() ->> 'app_metadata') ->> 'role';
    IF v_admin_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Unauthorized: only admins can reject claims';
    END IF;

    v_admin_id := auth.uid();

    -- Get claim record
    SELECT * INTO v_claim_record
    FROM guitar_claims
    WHERE id = p_claim_id;

    IF v_claim_record IS NULL THEN
        RAISE EXCEPTION 'Claim not found';
    END IF;

    -- Update claim status
    UPDATE guitar_claims
    SET status = 'rejected',
        rejection_reason = p_reason,
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_claim_id;

    -- Create notification for claimer
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        entity_type,
        entity_id,
        action_url
    )
    VALUES (
        v_claim_record.claimer_id,
        'claim_rejected',
        'Claim Rejected',
        'Your guitar claim was not approved. Reason: ' || COALESCE(p_reason, 'No reason provided'),
        'claim',
        p_claim_id,
        '/claims/' || p_claim_id
    );

    -- Audit log
    INSERT INTO audit_log (
        id,
        actor_id,
        actor_type,
        action,
        entity_type,
        entity_id,
        details,
        created_at
    )
    VALUES (
        gen_random_uuid(),
        v_admin_id,
        'admin',
        'claim.rejected',
        'claim',
        p_claim_id,
        jsonb_build_object(
            'guitar_id', v_claim_record.guitar_id,
            'claimer_id', v_claim_record.claimer_id,
            'reason', p_reason
        ),
        NOW()
    );

    RETURN QUERY
    SELECT
        gc.id,
        gc.guitar_id,
        gc.claimer_id,
        gc.status,
        gc.rejection_reason,
        gc.reviewed_by,
        gc.reviewed_at
    FROM guitar_claims gc
    WHERE gc.id = p_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 9. RPC: get_claim_stats
--    Returns aggregate statistics about claims.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_claim_stats()
RETURNS TABLE (
    total_claims BIGINT,
    pending_claims BIGINT,
    approved_claims BIGINT,
    rejected_claims BIGINT,
    withdrawn_claims BIGINT,
    avg_review_time_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_claims,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_claims,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_claims,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_claims,
        COUNT(*) FILTER (WHERE status = 'withdrawn') AS withdrawn_claims,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600)::NUMERIC,
            2
        ) AS avg_review_time_hours
    FROM guitar_claims
    WHERE reviewed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ────────────────────────────────────────────────────────────
-- 10. KPI_DASHBOARD VIEW
--     Aggregates key business metrics for dashboard.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW kpi_dashboard AS
SELECT
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS total_users,
    (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL) AS users_this_week,
    (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days' AND deleted_at IS NULL) AS users_this_month,
    (SELECT COUNT(*) FROM guitars WHERE deleted_at IS NULL) AS total_guitars,
    (SELECT COUNT(*) FROM guitars WHERE created_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL) AS guitars_this_week,
    (SELECT COUNT(*) FROM guitars WHERE created_at > NOW() - INTERVAL '30 days' AND deleted_at IS NULL) AS guitars_this_month,
    (SELECT COUNT(DISTINCT brand) FROM guitars WHERE deleted_at IS NULL) AS total_brands,
    (SELECT COUNT(*) FROM collections) AS total_collections,
    (SELECT COUNT(*) FROM guitar_claims WHERE status = 'pending') AS pending_claims,
    (SELECT COUNT(*) FROM guitar_claims WHERE status = 'approved') AS approved_claims,
    (SELECT COUNT(*) FROM guitar_claims) AS total_claims,
    (SELECT COUNT(*) FROM notifications WHERE created_at > NOW() - INTERVAL '24 hours') AS notifications_today,
    NOW() AS last_updated;

-- ────────────────────────────────────────────────────────────
-- 11. GRANT PERMISSIONS FOR KPI VIEW
-- ────────────────────────────────────────────────────────────

GRANT SELECT ON kpi_dashboard TO authenticated;

-- ────────────────────────────────────────────────────────────
-- DONE
-- ────────────────────────────────────────────────────────────
