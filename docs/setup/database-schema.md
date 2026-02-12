# TWNG Database Schema

## Table of Contents

1. [Core Tables](#core-tables) — users, guitars (IE), owner_created_content (OCC), collections, user_follows, likes, user_badges
2. [Ownership & Transfers](#ownership--transfers) — ownership_transfers
3. [Content Tables](#content-tables) — articles, article_tags, timeline_events
4. [Community Tables](#community-tables) — discussion_categories, discussion_posts, messages
5. [System Tables](#system-tables) — notifications, audit_log, system_config
6. [Phase 2 Tables](#phase-2-tables) — luthier_profiles, ia_change_requests, privacy_requests, occ_admin_overrides, duplicate_matches
7. [shouldDisplay() Function](#shoulddisplay-function)
8. [RLS Policies](#rls-policies)
9. [Indexes](#indexes)
10. [Full-Text Search](#full-text-search)
11. [Triggers](#triggers)

---

## Core Tables

### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(255),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user',
    -- roles: user, luthier, moderator, admin, super_admin, support, auditor
    is_verified BOOLEAN DEFAULT FALSE,
    is_luthier BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    -- statuses: active, suspended, banned, deletion_pending, deleted
    suspended_at TIMESTAMPTZ,
    suspended_reason TEXT,
    privacy_settings JSONB DEFAULT '{
        "profile_visible": true,
        "collection_visible": true,
        "activity_visible": true
    }',
    privacy_defaults JSONB DEFAULT '{
        "occ_public_defaults": {
            "images": "all",
            "videos": "all",
            "audio": "all",
            "story": true,
            "nickname": true
        },
        "transfer_retention_defaults": {
            "user_id_visible": false,
            "timeline_events": "transfer_anonymized",
            "images": "dont_transfer",
            "videos": "dont_transfer",
            "story": false,
            "notes": "never"
        },
        "do_not_show_in_others_ie": false
    }',
    social_links JSONB DEFAULT '{}',
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);
```

#### Privacy Defaults Explained

`privacy_defaults.occ_public_defaults` — Controls default `visible_publicly` when creating new OCC:
- `images`: "all" | "none" | "select" — which images are publicly visible
- `videos/audio`: same as images
- `story/nickname`: true | false

`privacy_defaults.transfer_retention_defaults` — Controls what happens to OCC during transfers:
- `user_id_visible`: false = anonymize creator ID on transfer
- `timeline_events`: "transfer_anonymized" | "transfer_with_name" | "dont_transfer"
- `images/videos`: "transfer_all" | "transfer_none" | "dont_transfer"
- `story`: true | false
- `notes`: "never" (private notes never transfer)

`privacy_defaults.do_not_show_in_others_ie` — Global "nuclear option": hides ALL user's OCC from instruments they don't currently own. Can be toggled ON at any time. One-way restriction: once content is hidden via per-transaction settings, this cannot make it visible again.

### guitars (Instrument Entity / IE)

```sql
CREATE TABLE guitars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Instrument Attributes (IA) — factual, become immutable after grace period
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    serial_number VARCHAR(100),
    body_style VARCHAR(50), -- solid, hollow, semi-hollow, acoustic, classical
    instrument_type VARCHAR(50) DEFAULT 'electric', -- electric, acoustic, bass, classical, other
    finish VARCHAR(100),
    specifications JSONB DEFAULT '{}',
    -- specs: body_material, neck_material, fretboard, pickups, scale_length, num_frets, bridge, tuners, electronics
    -- IA immutability
    ia_grace_period_ends TIMESTAMPTZ, -- NULL = not yet set (new guitar)
    ia_locked_at TIMESTAMPTZ, -- NULL = still in grace period
    -- Privacy & display
    show_historical_content BOOLEAN DEFAULT TRUE, -- owner toggle: show/hide previous owners' OCC
    state VARCHAR(20) DEFAULT 'published', -- draft, published, archived, pending_transfer
    -- Metadata
    source VARCHAR(50), -- manual, magic_add, automation, import
    source_metadata JSONB DEFAULT '{}',
    version_history JSONB DEFAULT '[]', -- append-only IA edit history
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);
```

**Key change from previous schema:** No `images`, `description`, `privacy_level`, `user_given_name`, `is_for_sale`, or `sale_info` on this table. Images and descriptions are OCC (separate table). Guitar-level privacy is determined by `shouldDisplay()` on each OCC, not by a single enum. Sale info and nicknames are OCC types.

### owner_created_content (OCC)

```sql
CREATE TABLE owner_created_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ie_id UUID NOT NULL REFERENCES guitars(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    content_type VARCHAR(20) NOT NULL,
    -- types: image, video, audio, story, nickname, note, sale_info
    content_data JSONB NOT NULL,
    -- image: {url, thumbnail_url, full_url, alt_text, position}
    -- video: {url, thumbnail_url, duration}
    -- audio: {url, duration}
    -- story: {text}
    -- nickname: {name}
    -- note: {text} (always private)
    -- sale_info: {price, currency, condition, shipping_info, external_links, is_active}
    -- Visibility flags (per IE Spec Sections 4-5)
    visible_publicly BOOLEAN DEFAULT TRUE,
    visible_to_future_owners BOOLEAN DEFAULT FALSE,
    -- Anonymization
    is_anonymized BOOLEAN DEFAULT FALSE, -- creator_id replaced with 'Anonymous' in display
    -- Transfer lock — set during transfer, cannot be made MORE permissive after
    transfer_locked BOOLEAN DEFAULT FALSE,
    -- Admin override
    admin_hidden BOOLEAN DEFAULT FALSE, -- force-hidden by admin (moderation)
    -- Ordering
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Content type "note"** is ALWAYS private — `visible_publicly` and `visible_to_future_owners` are always false and enforced by RLS. Notes never transfer.

**transfer_locked** — Once set to true during a transfer, the `visible_publicly` and `visible_to_future_owners` flags cannot be changed to be MORE permissive (can only become more restrictive). Enforced by trigger.

### collections

```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### collection_items

```sql
CREATE TABLE collection_items (
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    guitar_id UUID REFERENCES guitars(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_id, guitar_id)
);
```

### user_follows

```sql
CREATE TABLE user_follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);
```

### likes

```sql
CREATE TABLE likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- guitar, article, discussion_post
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, entity_type, entity_id)
);
```

### user_badges

```sql
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL, -- pioneer, founding_member, verified_collector, top_contributor, etc.
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    awarded_by UUID REFERENCES users(id) -- NULL for system-awarded
);
```

---

## Ownership & Transfers

### ownership_transfers

```sql
CREATE TABLE ownership_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ie_id UUID NOT NULL REFERENCES guitars(id),
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID REFERENCES users(id), -- NULL for external/outside-TWNG transfers
    transfer_type VARCHAR(20) NOT NULL, -- to_member, outside_twng, delete
    status VARCHAR(20) DEFAULT 'pending',
    -- statuses: pending, accepted, declined, cancelled, expired, completed
    -- Privacy overrides for this specific transaction
    privacy_overrides JSONB DEFAULT '{}',
    -- Structure mirrors privacy_defaults.transfer_retention_defaults
    -- {user_id_visible, timeline_events, images, videos, story}
    -- These override the seller's defaults for THIS transaction only
    -- Once status = 'completed', these are FINAL
    accept_deadline TIMESTAMPTZ, -- for to_member: buyer must accept by this date
    cancel_deadline TIMESTAMPTZ, -- for outside_twng: seller can cancel until this date
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Transfer Flow States

**to_member:**
```
pending → accepted → completed
pending → declined
pending → cancelled (by seller)
pending → expired (deadline passed)
```

**outside_twng:**
```
pending → completed (after cancel_deadline passes)
pending → cancelled (before cancel_deadline)
```

**delete:**
```
pending → completed (IE → archived, current owner's OCC deleted, historical OCC preserved)
```

---

## Content Tables

### timeline_events

```sql
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guitar_id UUID NOT NULL REFERENCES guitars(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    -- types: purchase, repair, modification, ownership_change, verification, custom, system
    tier INTEGER DEFAULT 1,
    -- Tier 0: Immutable (system events, verifications, transfers) — never editable/deletable
    -- Tier 1: Owner-created (repairs, mods, custom) — editable/deletable by creator anytime
    -- Tier 2: Special (ownership start date override) — editable only during grace period
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    media_urls JSONB DEFAULT '[]',
    -- Immutability
    is_locked BOOLEAN DEFAULT FALSE, -- Tier 0: always true. Tier 2: true after grace period
    grace_period_ends TIMESTAMPTZ, -- Tier 2 only
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    -- Visibility (inherits from OCC-like logic for transferred content)
    is_anonymized BOOLEAN DEFAULT FALSE, -- creator shown as 'Anonymous'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### articles

```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft', -- draft, review, published, archived
    category VARCHAR(50), -- brand_history, luthier_interview, model_deep_dive, collector_guide, gear_review, community_story
    guitar_ids UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    seo_title VARCHAR(200),
    seo_description VARCHAR(300),
    source VARCHAR(50), -- manual, automation
    source_metadata JSONB DEFAULT '{}',
    search_vector TSVECTOR,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### article_tags

```sql
CREATE TABLE article_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    article_count INTEGER DEFAULT 0
);
```

---

## Community Tables

### discussion_categories

```sql
CREATE TABLE discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    position INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### discussion_posts

```sql
CREATE TABLE discussion_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES discussion_categories(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
    title VARCHAR(500), -- required for top-level, NULL for replies
    content TEXT NOT NULL,
    upvote_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    hidden_reason TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### messages

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    thread_id UUID NOT NULL, -- computed: deterministic from sorted sender+recipient UUIDs
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## System Tables

### notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    -- types: new_follower, guitar_liked, comment_reply, discussion_reply, message,
    --        article_published, transfer_initiated, transfer_accepted, transfer_declined,
    --        transfer_expired, privacy_request_completed, system
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}', -- {link, entity_id, entity_type, actor_id}
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### audit_log

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(20) DEFAULT 'user', -- user, admin, system
    action VARCHAR(100) NOT NULL,
    -- actions: user.create, user.edit, user.suspend, user.ban, user.delete,
    --          ie.create, ie.edit_ia, ie.change_status, ie.change_owner, ie.merge, ie.delete,
    --          occ.create, occ.edit, occ.delete, occ.visibility_change,
    --          transfer.initiate, transfer.accept, transfer.decline, transfer.cancel, transfer.complete,
    --          privacy.setting_change, privacy.override, privacy.gdpr_request,
    --          admin.login, admin.config_change
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### system_config

```sql
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults
INSERT INTO system_config (key, value, description) VALUES
('transfer_acceptance_days', '7', 'Days buyer has to accept transfer'),
('external_transfer_cancel_days', '1', 'Days to cancel external transfer'),
('transfer_reminder_days', '[1,3,6]', 'Days to send reminder notifications'),
('ia_grace_period_days', '7', 'Days before IA change is locked'),
('ia_require_warning', 'true', 'Show warning dialog for IA changes'),
('default_ie_visibility', '"private"', 'Default visibility for new IEs'),
('default_occ_public', 'true', 'Default visible_publicly for OCC'),
('archived_ie_visibility', '"read_only"', 'How archived IEs are shown: hidden/read_only/claimable'),
('enable_external_transfers', 'true', 'Allow transfers outside TWNG'),
('enable_ie_claims', 'true', 'Allow users to claim orphaned IEs'),
('enable_luthier_verification', 'true', 'Luthier verification system'),
('enable_duplicate_detection', 'true', 'Auto-detect duplicate IEs'),
('enable_do_not_show_global', 'true', 'Global Do Not Show setting');
```

---

## Phase 2 Tables

### luthier_profiles

```sql
CREATE TABLE luthier_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    business_name VARCHAR(255),
    credentials JSONB DEFAULT '[]', -- [{type, issuer, year, document_url}]
    specializations TEXT[],
    location VARCHAR(255),
    is_verified_luthier BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ia_change_requests

```sql
CREATE TABLE ia_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guitar_id UUID NOT NULL REFERENCES guitars(id),
    requested_by UUID NOT NULL REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, locked, admin_override
    grace_period_ends TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### privacy_requests

```sql
CREATE TABLE privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    request_type VARCHAR(30) NOT NULL, -- data_export, erasure, anonymization, restriction
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, denied
    handled_by UUID REFERENCES users(id),
    details JSONB DEFAULT '{}',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### occ_admin_overrides

```sql
CREATE TABLE occ_admin_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occ_id UUID NOT NULL REFERENCES owner_created_content(id),
    override_type VARCHAR(20) NOT NULL, -- force_hide, anonymize_creator, delete
    -- NOTE: force_show is intentionally NOT an option
    applied_by UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### duplicate_matches

```sql
CREATE TABLE duplicate_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guitar_id_a UUID NOT NULL REFERENCES guitars(id),
    guitar_id_b UUID NOT NULL REFERENCES guitars(id),
    match_type VARCHAR(20) DEFAULT 'auto', -- auto, admin_flagged
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed_duplicate, not_duplicate, merged
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## shouldDisplay() Function

The core privacy algorithm from IE Specification Section 8.

```sql
CREATE OR REPLACE FUNCTION should_display_occ(
    p_occ_id UUID,
    p_viewer_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_occ RECORD;
    v_creator RECORD;
    v_ie RECORD;
    v_current_owner_id UUID;
BEGIN
    -- Load OCC
    SELECT * INTO v_occ FROM owner_created_content WHERE id = p_occ_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;

    -- Admin-hidden content is never shown (except to admins, handled in RLS)
    IF v_occ.admin_hidden THEN RETURN FALSE; END IF;

    -- Private notes: only visible to creator
    IF v_occ.content_type = 'note' THEN
        RETURN (p_viewer_id IS NOT NULL AND p_viewer_id = v_occ.creator_id);
    END IF;

    -- Load creator and IE
    SELECT * INTO v_creator FROM users WHERE id = v_occ.creator_id;
    SELECT * INTO v_ie FROM guitars WHERE id = v_occ.ie_id;
    v_current_owner_id := v_ie.owner_id;

    -- Step 1: Creator's global "Do Not Show" opt-out
    IF v_creator.id IS NOT NULL
       AND (v_creator.privacy_defaults->>'do_not_show_in_others_ie')::boolean = true
       AND v_occ.creator_id != v_current_owner_id THEN
        RETURN FALSE;
    END IF;

    -- Step 2: Current owner hides historical content
    IF v_ie.show_historical_content = false
       AND v_occ.creator_id IS DISTINCT FROM v_current_owner_id THEN
        RETURN FALSE;
    END IF;

    -- Step 3: Per-OCC visibility flags relative to viewer
    IF p_viewer_id IS NULL THEN
        -- Guest: must be publicly visible
        RETURN v_occ.visible_publicly;
    ELSIF p_viewer_id = v_occ.creator_id THEN
        -- Creator always sees their own content
        RETURN TRUE;
    ELSIF p_viewer_id = v_current_owner_id THEN
        -- Current owner sees content visible to future owners OR public
        RETURN (v_occ.visible_to_future_owners OR v_occ.visible_publicly);
    ELSE
        -- Other logged-in user: same as public
        RETURN v_occ.visible_publicly;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: get all visible OCC for an IE for a specific viewer
CREATE OR REPLACE FUNCTION get_visible_occ(
    p_ie_id UUID,
    p_viewer_id UUID DEFAULT NULL
) RETURNS SETOF owner_created_content AS $$
    SELECT occ.*
    FROM owner_created_content occ
    WHERE occ.ie_id = p_ie_id
      AND should_display_occ(occ.id, p_viewer_id) = true
    ORDER BY occ.content_type, occ.position, occ.created_at;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## RLS Policies

### Enable RLS on ALL tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guitars ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_created_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
```

### Users

```sql
CREATE POLICY "Public profiles visible" ON users
    FOR SELECT USING (
        deleted_at IS NULL
        AND status = 'active'
        AND (privacy_settings->>'profile_visible')::boolean = true
    );

CREATE POLICY "Users update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin', 'moderator', 'support', 'auditor'))
    );
```

### Guitars (IE)

```sql
CREATE POLICY "Published guitars visible" ON guitars
    FOR SELECT USING (
        deleted_at IS NULL
        AND state = 'published'
    );

CREATE POLICY "Owners see own guitars (any state)" ON guitars
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners manage own guitars" ON guitars
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins view all guitars" ON guitars
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin', 'auditor'))
    );
```

### Owner Created Content (OCC)

```sql
-- OCC visibility is determined by shouldDisplay() function
-- For client-side queries, use get_visible_occ() RPC instead of direct table access

CREATE POLICY "Creators manage own OCC" ON owner_created_content
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "OCC visible via shouldDisplay" ON owner_created_content
    FOR SELECT USING (should_display_occ(id, auth.uid()));

CREATE POLICY "Current IE owner can view OCC" ON owner_created_content
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM guitars WHERE id = ie_id AND owner_id = auth.uid())
        AND should_display_occ(id, auth.uid())
    );

CREATE POLICY "Admins view all OCC" ON owner_created_content
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin'))
    );
```

### Ownership Transfers

```sql
CREATE POLICY "Transfer participants see their transfers" ON ownership_transfers
    FOR SELECT USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

CREATE POLICY "Seller creates transfer" ON ownership_transfers
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Participants update transfer" ON ownership_transfers
    FOR UPDATE USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

CREATE POLICY "Admins manage all transfers" ON ownership_transfers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin'))
    );
```

### Messages

```sql
CREATE POLICY "Users see own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users send own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

### Notifications

```sql
CREATE POLICY "Users see own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);
```

### Audit Log

```sql
CREATE POLICY "Super admins read audit log" ON audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role = 'super_admin')
    );
```

### System Config

```sql
CREATE POLICY "Anyone reads config" ON system_config
    FOR SELECT USING (true);

CREATE POLICY "Super admins edit config" ON system_config
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role = 'super_admin')
    );
```

### User Follows

```sql
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see follows" ON user_follows
    FOR SELECT USING (true);

CREATE POLICY "Users manage own follows" ON user_follows
    FOR ALL USING (auth.uid() = follower_id);
```

### Likes

```sql
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users manage own likes" ON likes
    FOR ALL USING (auth.uid() = user_id);
```

### User Badges

```sql
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see badges" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Admins manage badges" ON user_badges
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin'))
    );
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role) WHERE role != 'user';

-- Guitars (IE)
CREATE INDEX idx_guitars_owner ON guitars(owner_id);
CREATE INDEX idx_guitars_brand_model ON guitars(brand, model);
CREATE INDEX idx_guitars_brand ON guitars(brand);
CREATE INDEX idx_guitars_instrument_type ON guitars(instrument_type);
CREATE INDEX idx_guitars_state ON guitars(state);
CREATE INDEX idx_guitars_search ON guitars USING gin(search_vector);
CREATE INDEX idx_guitars_created ON guitars(created_at DESC);
CREATE INDEX idx_guitars_duplicate_check ON guitars(brand, model, serial_number)
    WHERE serial_number IS NOT NULL AND deleted_at IS NULL;

-- OCC
CREATE INDEX idx_occ_ie ON owner_created_content(ie_id);
CREATE INDEX idx_occ_creator ON owner_created_content(creator_id);
CREATE INDEX idx_occ_ie_type ON owner_created_content(ie_id, content_type);
CREATE INDEX idx_occ_ie_creator ON owner_created_content(ie_id, creator_id);

-- Transfers
CREATE INDEX idx_transfers_ie ON ownership_transfers(ie_id);
CREATE INDEX idx_transfers_from ON ownership_transfers(from_user_id);
CREATE INDEX idx_transfers_to ON ownership_transfers(to_user_id);
CREATE INDEX idx_transfers_status ON ownership_transfers(status) WHERE status = 'pending';

-- Collections
CREATE INDEX idx_collections_owner ON collections(owner_id);

-- Timeline events
CREATE INDEX idx_timeline_guitar ON timeline_events(guitar_id);
CREATE INDEX idx_timeline_date ON timeline_events(guitar_id, event_date);
CREATE INDEX idx_timeline_tier ON timeline_events(guitar_id, tier);

-- Articles
CREATE UNIQUE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_search ON articles USING gin(search_vector);

-- Discussions
CREATE INDEX idx_discussions_category ON discussion_posts(category_id);
CREATE INDEX idx_discussions_parent ON discussion_posts(parent_id);
CREATE INDEX idx_discussions_author ON discussion_posts(author_id);
CREATE INDEX idx_discussions_created ON discussion_posts(created_at DESC);
CREATE INDEX idx_discussions_search ON discussion_posts USING gin(search_vector);

-- Messages
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_messages_recipient_unread ON messages(recipient_id, read_at) WHERE read_at IS NULL;

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- Audit log
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- User follows
CREATE INDEX idx_follows_following ON user_follows(following_id);
CREATE INDEX idx_follows_follower ON user_follows(follower_id);

-- Likes
CREATE INDEX idx_likes_entity ON likes(entity_type, entity_id);
CREATE INDEX idx_likes_user ON likes(user_id);

-- User badges
CREATE INDEX idx_badges_user ON user_badges(user_id);

-- Users search
CREATE INDEX idx_users_search ON users USING gin(search_vector);
CREATE INDEX idx_users_status ON users(status) WHERE status != 'active';
```

---

## Full-Text Search

### Search vector triggers

```sql
-- Guitars search (IA fields only — OCC content not included in guitar search)
CREATE OR REPLACE FUNCTION guitars_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        coalesce(NEW.brand, '') || ' ' ||
        coalesce(NEW.model, '') || ' ' ||
        coalesce(NEW.finish, '') || ' ' ||
        coalesce(NEW.body_style, '')
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER guitars_search_trigger
    BEFORE INSERT OR UPDATE ON guitars
    FOR EACH ROW EXECUTE FUNCTION guitars_search_update();

-- Users search
CREATE OR REPLACE FUNCTION users_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        coalesce(NEW.username, '') || ' ' ||
        coalesce(NEW.display_name, '') || ' ' ||
        coalesce(NEW.bio, '')
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_search_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION users_search_update();

-- Articles search
CREATE OR REPLACE FUNCTION articles_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        coalesce(NEW.title, '') || ' ' ||
        coalesce(NEW.excerpt, '') || ' ' ||
        coalesce(NEW.content, '')
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION articles_search_update();

-- Discussion posts search
CREATE OR REPLACE FUNCTION discussions_search_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        coalesce(NEW.title, '') || ' ' ||
        coalesce(NEW.content, '')
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER discussions_search_trigger
    BEFORE INSERT OR UPDATE ON discussion_posts
    FOR EACH ROW EXECUTE FUNCTION discussions_search_update();
```

---

## Triggers

### updated_at auto-update

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON guitars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON owner_created_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON timeline_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON discussion_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### OCC transfer lock enforcement

Prevents making visibility MORE permissive after transfer lock:

```sql
CREATE OR REPLACE FUNCTION enforce_transfer_lock()
RETURNS trigger AS $$
BEGIN
    IF OLD.transfer_locked = true THEN
        -- Cannot make more permissive
        IF NEW.visible_publicly = true AND OLD.visible_publicly = false THEN
            RAISE EXCEPTION 'Cannot make OCC more publicly visible after transfer lock';
        END IF;
        IF NEW.visible_to_future_owners = true AND OLD.visible_to_future_owners = false THEN
            RAISE EXCEPTION 'Cannot make OCC more visible to future owners after transfer lock';
        END IF;
        -- Cannot unlock
        IF NEW.transfer_locked = false THEN
            RAISE EXCEPTION 'Cannot remove transfer lock';
        END IF;
    END IF;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_occ_transfer_lock
    BEFORE UPDATE ON owner_created_content
    FOR EACH ROW EXECUTE FUNCTION enforce_transfer_lock();
```

### Notes always private enforcement

```sql
CREATE OR REPLACE FUNCTION enforce_notes_private()
RETURNS trigger AS $$
BEGIN
    IF NEW.content_type = 'note' THEN
        NEW.visible_publicly := false;
        NEW.visible_to_future_owners := false;
    END IF;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_notes_private_trigger
    BEFORE INSERT OR UPDATE ON owner_created_content
    FOR EACH ROW EXECUTE FUNCTION enforce_notes_private();
```

### IA grace period auto-set

```sql
CREATE OR REPLACE FUNCTION set_ia_grace_period()
RETURNS trigger AS $$
DECLARE
    grace_days INTEGER;
BEGIN
    -- Get configurable grace period
    SELECT (value::text)::integer INTO grace_days
    FROM system_config WHERE key = 'ia_grace_period_days';
    IF grace_days IS NULL THEN grace_days := 7; END IF;

    -- Set grace period on new guitars
    IF TG_OP = 'INSERT' THEN
        NEW.ia_grace_period_ends := NOW() + (grace_days || ' days')::interval;
    END IF;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_guitar_grace_period
    BEFORE INSERT ON guitars
    FOR EACH ROW EXECUTE FUNCTION set_ia_grace_period();
```
