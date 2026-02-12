# TWNG Migration Plan — Option B: Gemini API

**Our Frontend + Lovable Backend (as-is)**
**February 2026 — Step-by-Step Work Plan**

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Prerequisites](#2-prerequisites)
3. [Phase 0: New Supabase Project (Day 1)](#3-phase-0-new-supabase-project-day-1)
4. [Phase 1: Database Migration (Day 1–2)](#4-phase-1-database-migration-day-1-2)
5. [Phase 2: Edge Functions (Day 2–3)](#5-phase-2-edge-functions-day-2-3)
6. [Phase 3: Frontend Data Layer Rewrite (Day 3–8)](#6-phase-3-frontend-data-layer-rewrite-day-3-8)
7. [Phase 4: Auth & Security (Day 8–9)](#7-phase-4-auth--security-day-8-9)
8. [Phase 5: Feature Gap — New Pages (Day 9–18)](#8-phase-5-feature-gap--new-pages-day-9-18)
9. [Phase 6: Shared Components to Build](#9-phase-6-shared-components-to-build)
10. [Phase 7: Testing & QA (Day 18–21)](#10-phase-7-testing--qa-day-18-21)
11. [Risk Register](#11-risk-register)
12. [Assets Dropped vs. Kept](#12-assets-dropped-vs-kept)
13. [Complete File Change Map](#13-complete-file-change-map)

---

## 1. Overview & Goals

**Goal:** Run our existing frontend (Vite 7 + React 19 + JavaScript) against the Lovable Supabase backend, with all 8 Lovable Edge Functions using Gemini 2.5 Flash.

**What this means:**
- We run Lovable's 109 migrations on our **existing Supabase project** (`iqrmwetprpwjgzynrjay`), replacing the current schema
- We deploy Lovable's 8 Edge Functions as-is
- We **rewrite our 19 src/lib/supabase/ service files** to match Lovable's 50-table schema
- We **build 23 new pages** that exist in Lovable but not in our frontend
- We keep our design system, component library, and UI/UX
- We **drop** the Claude-specific extraction pipeline (extract-content, extract-post, analyze-guitar, transcribe-audio)

**Timeline estimate: 3–3.5 weeks (21–25 working days)**

---

## 2. Prerequisites

### Already in place
- [x] Access to the Lovable repo (origin): `https://github.com/doron1/thenewtwng-58` (private, Ronen has access)
- [x] Working repo (fork): `https://github.com/RonenBerka/NEWTWNG`
- [x] Supabase account + existing project (ref: `iqrmwetprpwjgzynrjay`)
- [x] Resend.com API key (already configured in our send-email Edge Function)
- [x] Node.js 18+ and npm
- [x] Git access to both repos
- [x] Netlify deployment (Site ID: `d44bf75d-badd-4d8e-82b7-c0a755ee922f`)

### Need to obtain
- [ ] Google Cloud account + Gemini API key (from [Google AI Studio](https://aistudio.google.com/apikey))
- [ ] remove.bg API key (from [remove.bg/api](https://www.remove.bg/api))
- [ ] Supabase CLI installed locally (`npm install -g supabase`) — for deploying Edge Functions and running migrations from Terminal

---

## 3. Phase 0: Prepare Existing Supabase Project (Day 1)

We are overwriting the existing project (`iqrmwetprpwjgzynrjay`). This means all current tables and data will be replaced.

### Step 0.1: Backup Current Data (Safety Net)

Before overwriting, export anything worth keeping from the current project:

```bash
# From Supabase Dashboard → SQL Editor, run:
# Export guitar_catalog (419 models) — our valuable asset
COPY guitar_catalog TO '/tmp/guitar_catalog.csv' WITH CSV HEADER;
```

Alternatively, download via Dashboard → Table Editor → guitar_catalog → Export as CSV.

> **Important:** The current data is mostly test data. The only asset worth preserving is the `guitar_catalog` table (419 models). Everything else will be recreated by Lovable's migrations.

### Step 0.2: Clean Database via SQL

There is no "Reset database" button — only "Delete Project". Instead, we drop all existing tables, functions, and enums via SQL Editor.

In Supabase Dashboard → SQL Editor, run:

```sql
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    -- Drop all functions
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args
              FROM pg_proc INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
              WHERE nspname = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;
    -- Drop all custom types/enums
    FOR r IN (SELECT typname FROM pg_type
              WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
              AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;
```

This gives us a clean public schema on the same project — same URL, same API keys, same Edge Functions endpoint.

### Step 0.3: Verify Existing Credentials

These should already be in our `.env` file — confirm they still work after reset:

```
VITE_SUPABASE_URL=https://iqrmwetprpwjgzynrjay.supabase.co
VITE_SUPABASE_ANON_KEY=[anon key from Settings > API — unchanged after reset]
```

### Step 0.4: Link Supabase CLI

```bash
supabase login
supabase link --project-ref iqrmwetprpwjgzynrjay
```

---

## 4. Phase 1: Database Migration (Day 1–2)

### Step 1.1: Clone Working Repo Locally

```bash
git clone https://github.com/RonenBerka/NEWTWNG.git
cd NEWTWNG
```

> This is a fork of the original Lovable repo (`doron1/thenewtwng-58`). All work happens here.

### Step 1.2: Run All 109 Migrations

```bash
supabase db push
```

This applies all migrations in `supabase/migrations/` in order. It creates:

**50 tables** (verified from types.ts):

| # | Table | Purpose |
|---|-------|---------|
| 1 | `users` | User profiles (username, avatar_url, first_name, last_name, bio, location, privacy_settings JSONB, notification_settings JSONB) |
| 2 | `instruments` | Guitar/instrument records (make, model, year, specs JSONB, custom_fields JSONB, instrument_type enum, main_image_url, additional_images[], moderation_status) |
| 3 | `instrument_sensitive_details` | Serial numbers, grace period locks |
| 4 | `instrument_attributes_history` | Field-level change history (old_value, new_value, change_type, grace_period_ends_at, is_locked) |
| 5 | `instrument_ownership_history` | Ownership chain (owner_id, acquired_date, relinquished_date, is_current_owner) |
| 6 | `instrument_type_specs` | Type-specific spec field configuration |
| 7 | `instrument_types` | Instrument type definitions (electric_guitar, acoustic_guitar, bass, etc.) |
| 8 | `instrument_tags` | M2M: instruments ↔ tags |
| 9 | `owner_created_content` | OCC items (content_type, content, media_url, visible_publicly, visible_to_owners) |
| 10 | `ownership_transfers` | Transfer flow (from_owner_id, to_owner_id, status, rejection_reason) |
| 11 | `timeline_events` | Timeline with tier system (system_generated, user_reported_fact, story_based, verified_luthier) |
| 12 | `luthier_events` | Luthier-specific service events |
| 13 | `collections` | User collections (name, description, cover_image_url, is_public) |
| 14 | `collection_items` | M2M: collections ↔ instruments |
| 15 | `collection_categories` | Collection categorization |
| 16 | `collection_category_assignments` | M2M: collections ↔ categories |
| 17 | `collection_tags` | M2M: collections ↔ tags |
| 18 | `articles` | Blog/editorial content (title, slug, content, excerpt, cover_image_url, is_published, view_count) |
| 19 | `article_tags` | M2M: articles ↔ tags |
| 20 | `article_collections` | M2M: articles ↔ collections |
| 21 | `article_users` | M2M: articles ↔ users |
| 22 | `comments` | Polymorphic comments (target_type, target_id, parent_comment_id for threading) |
| 23 | `tags` | Tag taxonomy (name, slug, description, usage_count) |
| 24 | `forum_categories` | Forum categories (name, slug, icon, display_order) |
| 25 | `forum_threads` | Forum threads (title, slug, is_pinned, is_locked, reply_count, view_count) |
| 26 | `forum_posts` | Forum replies (content, is_solution, like_count, image_url, deletion_type enum) |
| 27 | `post_likes` | M2M: users ↔ forum posts |
| 28 | `messages` | Direct messages (sender_id, recipient_id, content, is_read) |
| 29 | `notifications` | System notifications (type, title, message, data JSONB, read boolean) |
| 30 | `user_follows` | Follow graph (follower_id, following_id) |
| 31 | `user_blocks` | Block/mute system (blocker_id, blocked_id, block_type enum: block/mute) |
| 32 | `user_badges` | Achievement badges (badge_type, badge_name, badge_description, badge_icon) |
| 33 | `user_activity` | Activity log (activity_type, target_type, target_id, activity_data JSONB) |
| 34 | `user_favorites` | Favorites (favorite_type, favorite_id) |
| 35 | `user_roles` | RBAC (user_id, role: admin/moderator/user) |
| 36 | `user_sensitive_details` | Address, phone, payment_info JSONB |
| 37 | `user_privacy_settings` | Per-user privacy defaults for OCC |
| 38 | `homepage_blocks` | Customizable homepage sections |
| 39 | `system_settings` | App configuration (key-value JSONB) |
| 40 | `database_backups` | Backup metadata |
| 41 | `external_service_usage` | API usage tracking |
| 42 | `ai_identification_results` | AI identification logs |
| 43 | `ai_performance_log` | AI accuracy tracking |
| 44 | `verified_identifications` | Verified AI results |
| 45 | `serial_number_registry` | Serial number database |
| 46 | `spec_fields` | Dynamic spec field definitions |
| 47 | `spec_field_options` | Dropdown options for spec fields |
| 48 | `spec_field_aliases` | Field name normalization |
| 49 | `spec_templates` | Pre-filled spec templates per make/model |
| 50 | `saved_searches` | User saved search filters |

**4 Enums:**
- `app_role`: admin, moderator, user
- `block_type`: block, mute
- `deletion_type`: user, moderator, admin
- `instrument_type`: electric_guitar, acoustic_guitar, classical_guitar, bass_guitar, electric_bass, acoustic_bass, mandolin, banjo, ukulele, other
- `timeline_event_type`: system_introduced, system_ownership_transfer, user_manufacture_date, user_acquisition_date, user_modification, story, luthier_event
- `timeline_tier`: system_generated, user_reported_fact, story_based, verified_luthier

**1 View:**
- `public_user_display` (id, username, avatar_url, bio, is_verified, is_luthier)

### Step 1.3: Verify Migration Success

```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected: 50 tables. If any are missing, check migration logs.

### Step 1.4: Add Guitar Catalog Table (Our Asset)

Create a new migration file:

```bash
supabase migration new add_guitar_catalog
```

Populate with our guitar_catalog schema and 419 model records. This table powers brand/model autocomplete and is a valuable data asset regardless of AI provider.

The migration should create:
```sql
CREATE TABLE guitar_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  year_range TEXT,
  body_style TEXT,
  instrument_type TEXT,
  body_material TEXT,
  neck_joint TEXT,
  neck_profile TEXT,
  fretboard_material TEXT,
  fretboard_radius TEXT,
  pickup_config TEXT,
  bridge_type TEXT,
  tuners TEXT,
  finish_options JSONB,
  specifications JSONB,
  tags JSONB,
  category TEXT,
  production_status TEXT,
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_catalog_brand ON guitar_catalog(brand);
CREATE INDEX idx_catalog_brand_model ON guitar_catalog(brand, model);
```

Then insert all 419 records from our existing data.

```bash
supabase db push
```

### Step 1.5: Enable Realtime

In Supabase Dashboard → Database → Replication:

Enable realtime for:
- [x] `notifications`
- [x] `messages`
- [x] `user_follows`
- [x] `forum_threads` (for live thread activity updates)
- [x] `forum_posts` (for live reply notifications)

### Step 1.6: Create Storage Buckets

In Supabase Dashboard → Storage:
- Create bucket: `instrument-images` (public)
- Create bucket: `article-images` (public)

---

## 5. Phase 2: Edge Functions (Day 2–3)

### Step 2.1: Set Environment Secrets

```bash
# Gemini API key (from Google AI Studio)
supabase secrets set GEMINI_API_KEY=your_gemini_key

# remove.bg API key
supabase secrets set REMOVE_BG_API_KEY=your_removebg_key

# Resend API key (for contact email)
supabase secrets set RESEND_API_KEY=your_resend_key
```

### Step 2.2: Deploy All 8 Lovable Edge Functions

From the NEWTWNG repo directory:

```bash
supabase functions deploy magic-add-identify
supabase functions deploy generate-instrument-specs
supabase functions deploy guitar-price-evaluation
supabase functions deploy remove-background
supabase functions deploy create-backup
supabase functions deploy restore-backup
supabase functions deploy send-contact-email
supabase functions deploy submit-identification-feedback
```

### Step 2.3: Deploy Our send-email Function (Adapted)

Copy our `send-email` Edge Function but update table references:
- `guitars` → `instruments`
- Any user column changes

```bash
supabase functions deploy send-email
```

Set email provider secrets:
```bash
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set SENDGRID_API_KEY=your_key
supabase secrets set MAILGUN_API_KEY=your_key
supabase secrets set MAILGUN_DOMAIN=your_domain
```

### Step 2.4: Test Each Edge Function

```bash
# Test magic-add-identify
curl -X POST https://iqrmwetprpwjgzynrjay.supabase.co/functions/v1/magic-add-identify \
  -H "Authorization: Bearer [ANON_KEY from .env]" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/guitar.jpg", "description": "Fender Stratocaster"}'

# Test generate-instrument-specs
curl -X POST https://iqrmwetprpwjgzynrjay.supabase.co/functions/v1/generate-instrument-specs \
  -H "Authorization: Bearer [ANON_KEY from .env]" \
  -H "Content-Type: application/json" \
  -d '{"make": "Fender", "model": "Stratocaster", "year": 1965}'

# Test guitar-price-evaluation
curl -X POST https://iqrmwetprpwjgzynrjay.supabase.co/functions/v1/guitar-price-evaluation \
  -H "Authorization: Bearer [ANON_KEY from .env]" \
  -H "Content-Type: application/json" \
  -d '{"make": "Gibson", "model": "Les Paul Standard", "year": 1959, "condition": "excellent"}'

# Test remove-background
curl -X POST https://iqrmwetprpwjgzynrjay.supabase.co/functions/v1/remove-background \
  -H "Authorization: Bearer [ANON_KEY from .env]" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/photo.jpg"}'

# Test send-contact-email
curl -X POST https://iqrmwetprpwjgzynrjay.supabase.co/functions/v1/send-contact-email \
  -H "Authorization: Bearer [ANON_KEY from .env]" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@test.com", "message": "Hello"}'
```

### Edge Function Summary

| Function | Source | AI Provider | External API | Status |
|----------|--------|-------------|-------------|--------|
| `magic-add-identify` | Lovable | Gemini 2.5 Flash | — | Deploy as-is |
| `generate-instrument-specs` | Lovable | Gemini 2.5 Flash | — | Deploy as-is |
| `guitar-price-evaluation` | Lovable | Gemini 2.5 Flash | — | Deploy as-is |
| `remove-background` | Lovable | — | remove.bg | Deploy as-is |
| `create-backup` | Lovable | — | — | Deploy as-is |
| `restore-backup` | Lovable | — | — | Deploy as-is |
| `send-contact-email` | Lovable | — | Resend | Deploy as-is |
| `submit-identification-feedback` | Lovable | — | — | Deploy as-is |
| `send-email` | Ours (adapted) | — | Resend/SendGrid/Mailgun | Adapt table names |
| ~~`extract-content`~~ | ~~Ours~~ | ~~Claude~~ | — | **DROPPED** |
| ~~`extract-post`~~ | ~~Ours~~ | ~~Claude~~ | — | **DROPPED** |
| ~~`analyze-guitar`~~ | ~~Ours~~ | ~~Claude~~ | — | **DROPPED** |
| ~~`transcribe-audio`~~ | ~~Ours~~ | ~~Claude~~ | — | **DROPPED** |
| ~~`verify-guitar`~~ | ~~Ours~~ | ~~Claude~~ | — | **DROPPED** (replaced by magic-add-identify) |

---

## 6. Phase 3: Frontend Data Layer Rewrite (Day 3–8)

**This is the biggest task.** Every Supabase query in our frontend must be updated to match Lovable's schema.

### Step 3.0: Environment Variables

Same project, same credentials — no `.env` changes needed:
```
VITE_SUPABASE_URL=https://iqrmwetprpwjgzynrjay.supabase.co
VITE_SUPABASE_ANON_KEY=[existing anon key — unchanged]
```

### Step 3.1: Install React Query

```bash
npm install @tanstack/react-query
```

Add QueryClientProvider to App.jsx:
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

// Wrap app:
<QueryClientProvider client={queryClient}>
  {/* existing app */}
</QueryClientProvider>
```

### Step 3.2: Rewrite Service Files — Complete Mapping

Below is every service file that needs changes, with exact table/column mappings.

---

#### 3.2.1 `src/lib/supabase/client.js`

**Change:** Update env var name

```diff
- const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
+ const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // same name, new value
```

No code change needed — just update `.env` with new credentials.

---

#### 3.2.2 `src/lib/supabase/guitars.js` → Rename to `instruments.js`

**This is the most complex rewrite.** Every query changes.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `guitars` (table) | `instruments` (table) | Full rename |
| `brand` | `make` | Rename |
| `model` | `model` | Same |
| `year` | `year` | Same |
| `serial_number` | → `instrument_sensitive_details.serial_number` | Separate table |
| `owner_id` | `current_owner_id` | Rename |
| `uploader_id` | `uploader_id` | Same |
| `state` | `moderation_status` | Rename + different values |
| `deleted_at` | `archived_at` + `is_archived` | Different pattern |
| `is_claimable` | Not present | Drop |
| `condition` | `specs.condition` (JSONB) | Moved to specs |
| `specifications` (JSONB) | `specs` (JSONB) | Rename |
| `body_style` | `specs.body_type` (JSONB) | Moved to specs |
| `neck_profile` | `specs.neck_profile` (JSONB) | Moved to specs |
| `fretboard_material` | `specs.fretboard_material` (JSONB) | Moved to specs |
| `pickup_config` | `specs.pickup_configuration` (JSONB) | Moved to specs |
| `bridge_type` | `specs.bridge_type` (JSONB) | Moved to specs |
| `instrument_type` | `instrument_type` (enum) | Now an enum, not free text |
| `search_vector` | Not auto-generated | Need manual search logic |
| Not present | `main_image_url` | New: primary image on instruments table |
| Not present | `additional_images[]` | New: image array on instruments table |
| Not present | `custom_fields` (JSONB) | New: flexible user-defined fields |
| Not present | `description` | New: text description |
| Not present | `is_featured` | New: featured flag |
| Not present | `grace_period_ends_at` | New: edit grace period |

**Key changes in logic:**

```javascript
// OLD: getGuitars with filters
const { data } = await supabase.from('guitars').select('*').eq('brand', brand);

// NEW: getInstruments with filters
const { data } = await supabase.from('instruments').select('*').eq('make', brand);
```

```javascript
// OLD: get guitar with serial number
const { data } = await supabase.from('guitars').select('*, serial_number');

// NEW: serial number is in separate table
const { data } = await supabase.from('instruments').select(`
  *,
  instrument_sensitive_details(serial_number)
`);
```

```javascript
// OLD: specs are individual columns
const guitar = { body_style: 'Stratocaster', neck_profile: 'C-shape' };

// NEW: specs are JSONB
const instrument = { specs: { body_type: 'Stratocaster', neck_profile: 'C-shape' } };
```

**Functions to rewrite:**

| Function | Changes |
|----------|---------|
| `getGuitar(id)` → `getInstrument(id)` | Table: instruments, join instrument_sensitive_details, join users on current_owner_id |
| `getGuitars(filters)` → `getInstruments(filters)` | Table: instruments, brand→make, filter on specs JSONB |
| `getGuitarPrimaryImage()` → `getInstrumentImage()` | Use `main_image_url` from instruments table directly |
| `getBrands()` → `getMakes()` | `instruments.make` instead of `guitars.brand` |
| `createGuitar()` → `createInstrument()` | Flatten specs into JSONB, set instrument_type enum |
| `updateGuitar()` → `updateInstrument()` | JSONB merge for specs updates |
| `deleteGuitar()` → `archiveInstrument()` | Set `is_archived=true, archived_at=now()` instead of `deleted_at` |

---

#### 3.2.3 `src/lib/supabase/occ.js` — Minor Changes

Lovable also has `owner_created_content` table with similar schema.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `ie_id` | `instrument_id` | Rename |
| `content_data` (JSONB) | `content` (text) + `media_url` (text) | Split: text → content, URL → media_url |
| `visible_to_future_owners` | `visible_to_owners` | Rename |
| `position` | Not present | Drop |
| `admin_hidden` | Not present | Drop (use moderation_status on instrument) |
| Not present | `title` | New field |
| Not present | `is_published` | New field |

---

#### 3.2.4 `src/lib/supabase/claims.js` — **DROP ENTIRELY**

Lovable does not have a `guitar_claims` table. The claim/ownership verification workflow is different — Lovable uses `ownership_transfers` + `instrument_ownership_history` instead.

**Action:** Remove ClaimGuitar page and all claim-related code. Replace with Lovable's ownership transfer flow.

---

#### 3.2.5 `src/lib/supabase/transfers.js` — Adapt

Both have `ownership_transfers` but with different schemas.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `ie_id` | `instrument_id` | Rename |
| `from_user_id` | `from_owner_id` | Rename |
| `to_user_id` | `to_owner_id` | Rename |
| `transfer_type` | Not present | Drop (all transfers are same type) |
| `accept_deadline` | Not present | Drop |
| `cancel_deadline` | Not present | Drop |
| `privacy_overrides` (JSONB) | Not present in Lovable | Drop (privacy handled differently) |
| `cancellation_reason` | `rejection_reason` | Rename |
| Not present | `transfer_date` | New: required field |
| Not present | `accepted_at` | New: acceptance timestamp |
| Not present | `completed_at` | New: completion timestamp |
| Not present | `rejected_at` | New: rejection timestamp |

---

#### 3.2.6 `src/lib/supabase/discussions.js` → Rename to `forum.js`

Our forum uses `discussion_posts` + `discussion_categories`. Lovable uses `forum_threads` + `forum_posts` + `forum_categories`.

**This is a full rewrite — different data model:**

| Our Concept | Lovable Concept |
|------------|----------------|
| `discussion_categories` | `forum_categories` (similar, add slug, icon, display_order) |
| `discussion_posts` (parent_id=null → thread) | `forum_threads` (dedicated table for threads) |
| `discussion_posts` (parent_id=UUID → reply) | `forum_posts` (dedicated table for replies) |
| `upvote_count` on post | `like_count` on post + `post_likes` M2M table |
| `is_hidden` | `deleted_at` + `deletion_type` enum |
| Not present | `is_pinned` on threads |
| Not present | `is_locked` on threads |
| Not present | `is_solution` on posts |
| Not present | `view_count` on threads |
| Not present | `image_url` on posts |

**Functions to rewrite:**

| Old Function | New Function | Notes |
|-------------|-------------|-------|
| `getCategories()` | `getForumCategories()` | Same logic, new table name |
| `getThreads()` | `getForumThreads()` | Now from `forum_threads` table directly |
| `getThread(id)` | `getForumThread(id)` | Join with users on author_id |
| `getThreadReplies(id)` | `getForumPosts(threadId)` | From `forum_posts` where thread_id=X |
| `createThread()` | `createForumThread()` | Insert to `forum_threads`, not `discussion_posts` |
| `createReply()` | `createForumPost()` | Insert to `forum_posts` |
| `upvoteThread()` | `likePost()` | Insert to `post_likes` M2M + increment `like_count` |
| `searchThreads()` | `searchForumThreads()` | Text search on `forum_threads.title` |

---

#### 3.2.7 `src/lib/supabase/comments.js` — Rewrite

Our `guitar_comments` table → Lovable's polymorphic `comments` table.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `guitar_id` | `target_id` + `target_type='instrument'` | Polymorphic |
| `user_id` | `user_id` | Same |
| `text` | `content` | Rename |
| `comment_likes` table | Not present (no comment likes in Lovable) | Drop |
| Not present | `parent_comment_id` | New: threaded replies |
| Not present | `is_edited` | New: edit tracking |
| Not present | `target_type` | New: 'instrument', 'article', 'collection' |

---

#### 3.2.8 `src/lib/supabase/messaging.js` — Adapt

Both have `messages` table with similar schema.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `sender_id` | `sender_id` | Same |
| `recipient_id` | `recipient_id` | Same |
| `content` | `content` | Same |
| `thread_id` | Not present | Drop — Lovable uses sender/recipient pairs |
| `read_at` | `is_read` (boolean) | Change from timestamp to boolean |

**Adaptation:** Remove `thread_id` logic. Group conversations by unique sender/recipient pairs instead.

---

#### 3.2.9 `src/lib/supabase/notifications.js` — Adapt

Both have `notifications` table.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `title` | `title` | Same |
| `body` | `message` | Rename |
| `data` (JSONB) | `data` (JSONB) | Same |
| `is_read` | `read` | Rename |

Minor renames only.

---

#### 3.2.10 `src/lib/supabase/follows.js` — Adapt

Our `follows` table → Lovable's `user_follows` table.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `follower_id` | `follower_id` | Same |
| `followed_id` | `following_id` | Rename |

Plus add support for `user_blocks` table (new feature).

---

#### 3.2.11 `src/lib/supabase/timeline.js` — Adapt

Both have `timeline_events` with similar schema.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `guitar_id` | `instrument_id` | Rename |
| `event_type` (text) | `event_type` (enum: `timeline_event_type`) | Now an enum |
| `tier` (integer 0/1/2) | `tier` (enum: `timeline_tier`) | Now an enum |
| `media_urls` (JSONB) | `event_data` (JSONB) | Restructured |
| Not present | `source_ia_history_id` | New: links to attribute changes |
| Not present | `source_luthier_event_id` | New: links to luthier events |
| Not present | `source_occ_id` | New: links to OCC |
| Not present | `source_ownership_history_id` | New: links to ownership changes |
| Not present | `visible_publicly` | New: privacy flag |
| Not present | `visible_to_owners` | New: privacy flag |

---

#### 3.2.12 `src/lib/supabase/guitarCatalog.js` — Keep As-Is

This queries our `guitar_catalog` table which we added in Step 1.4. **No changes needed** — the autocomplete functions work the same way.

---

#### 3.2.13 `src/lib/supabase/iaChangeRequests.js` — Adapt

Our `ia_change_requests` → Lovable's `instrument_attributes_history`.

| Our Column | Lovable Column | Notes |
|-----------|---------------|-------|
| `guitar_id` | `instrument_id` | Rename |
| `field_name` | `field_name` | Same |
| `old_value` | `old_value` | Same |
| `new_value` | `new_value` | Same |
| `status` (pending/locked/admin_override) | `change_type` + `is_locked` + `grace_period_ends_at` | Different pattern |
| `requested_by` | `changed_by_user_id` | Rename |

---

#### 3.2.14 `src/lib/supabase/homepage.js` — Rewrite

Lovable uses `homepage_blocks` table for configurable homepage. We use `system_config` with JSON blocks.

**Rewrite to use Lovable's `homepage_blocks` table directly.**

---

#### 3.2.15 `src/lib/supabase/admin.js` — Heavy Rewrite

Many table name changes:

| Our Query | Lovable Equivalent |
|----------|-------------------|
| `from('guitars')` | `from('instruments')` |
| `from('luthier_profiles')` | `from('users').eq('is_luthier', true)` (no separate luthier table) |
| `from('audit_log')` | Not present in Lovable (drop or use `user_activity`) |
| `from('duplicate_matches')` | Not present (drop) |
| `from('privacy_requests')` | Not present (drop — Lovable uses user_privacy_settings) |
| `from('system_config')` | `from('system_settings')` |
| `from('articles')` | `from('articles')` (same) |
| `from('collections')` | `from('collections')` (same) |

---

#### 3.2.16 `src/lib/supabase/marketing-admin.js` — **DROP ENTIRELY**

The 20+ marketing tables (outreach_queue, founding_members, influencer_pipeline, automation_config, content_calendar, social_posts, email_sequences, ad_campaigns, etc.) do not exist in Lovable's schema.

**Action:** Remove the entire Marketing Admin module. These can be rebuilt later on Lovable's schema if needed, or managed through external tools (Make.com).

---

#### 3.2.17 `src/lib/serialDecoder.js` — Keep As-Is

Pure JavaScript regex logic. No Supabase dependency. **No changes needed.**

---

#### 3.2.18 `src/lib/emailService.js` — Adapt

URL stays the same (same Supabase project). No change needed:
```javascript
const EDGE_FN_URL = 'https://iqrmwetprpwjgzynrjay.supabase.co/functions/v1/send-email';
```

---

#### 3.2.19 `src/lib/kpiService.js` — Adapt

Change all table references:
```diff
- from('guitars')
+ from('instruments')
- from('follows')
+ from('user_follows')
```

---

### Step 3.3: New Service Files to Create

These don't exist in our codebase but are needed for Lovable's features:

| New File | Purpose | Lovable Hook Reference |
|----------|---------|----------------------|
| `src/lib/supabase/collections.js` | Collection CRUD | `useCollections.tsx` |
| `src/lib/supabase/articles.js` | Article management | `useArticles.tsx` |
| `src/lib/supabase/userBadges.js` | Badge display | `useUserBadges.tsx` |
| `src/lib/supabase/userBlocks.js` | Block/mute management | `useUserBlocks.tsx` |
| `src/lib/supabase/userFavorites.js` | Favorites CRUD | `useFavorites.tsx` |
| `src/lib/supabase/activityFeed.js` | Activity feed | `useActivityFeed.tsx` |
| `src/lib/supabase/advancedSearch.js` | Advanced search | `useAdvancedSearch.tsx` |
| `src/lib/supabase/globalSearch.js` | Cross-entity search | `useGlobalSearch.tsx` |
| `src/lib/supabase/roles.js` | Role management | `useRole.tsx` |
| `src/lib/supabase/tags.js` | Tag management | `useTags.tsx` |
| `src/lib/supabase/systemSettings.js` | System config | `useSystemSettings.tsx` |
| `src/lib/supabase/homepageBlocks.js` | Homepage config | `useHomepageBlocks.tsx` |
| `src/lib/supabase/specFields.js` | Dynamic spec field definitions + options | `spec_fields`, `spec_field_options`, `spec_field_aliases` |
| `src/lib/supabase/specTemplates.js` | Pre-filled spec templates per make/model | `spec_templates` |
| `src/lib/supabase/savedSearches.js` | Save/load search filter sets | `saved_searches` |
| `src/lib/supabase/instrumentOwnership.js` | Ownership chain history | `instrument_ownership_history` |
| `src/lib/supabase/luthierEvents.js` | Luthier service events | `luthier_events` |
| `src/lib/supabase/aiIdentification.js` | AI identification results + performance log | `ai_identification_results`, `ai_performance_log`, `verified_identifications` |
| `src/lib/supabase/userPrivacy.js` | Per-user privacy settings + sensitive details | `user_privacy_settings`, `user_sensitive_details` |
| `src/lib/supabase/externalServiceUsage.js` | API usage tracking | `external_service_usage` |

### Step 3.4: Table Coverage Check

All 50 Lovable tables are mapped to either an existing rewritten service file or a new one:

| Table | Handled In |
|-------|-----------|
| `users` | `instruments.js` (joins), `AuthContext.jsx` |
| `instruments` | `instruments.js` (rewrite of guitars.js) |
| `instrument_sensitive_details` | `instruments.js` (joined) |
| `instrument_attributes_history` | `iaChangeRequests.js` (adapted) |
| `instrument_ownership_history` | `instrumentOwnership.js` (new) |
| `instrument_type_specs` | `specFields.js` (new) |
| `instrument_types` | `specFields.js` (new) |
| `instrument_tags` | `tags.js` (new) |
| `owner_created_content` | `occ.js` (adapted) |
| `ownership_transfers` | `transfers.js` (adapted) |
| `timeline_events` | `timeline.js` (adapted) |
| `luthier_events` | `luthierEvents.js` (new) |
| `collections` | `collections.js` (new) |
| `collection_items` | `collections.js` (new) |
| `collection_categories` | `collections.js` (new) |
| `collection_category_assignments` | `collections.js` (new) |
| `collection_tags` | `collections.js` (new) |
| `articles` | `articles.js` (new) |
| `article_tags` | `articles.js` (new) |
| `article_collections` | `articles.js` (new) |
| `article_users` | `articles.js` (new) |
| `comments` | `comments.js` (rewritten) |
| `tags` | `tags.js` (new) |
| `forum_categories` | `forum.js` (rewrite of discussions.js) |
| `forum_threads` | `forum.js` |
| `forum_posts` | `forum.js` |
| `post_likes` | `forum.js` |
| `messages` | `messaging.js` (adapted) |
| `notifications` | `notifications.js` (adapted) |
| `user_follows` | `follows.js` (adapted) |
| `user_blocks` | `userBlocks.js` (new) |
| `user_badges` | `userBadges.js` (new) |
| `user_activity` | `activityFeed.js` (new) |
| `user_favorites` | `userFavorites.js` (new) |
| `user_roles` | `roles.js` (new) |
| `user_sensitive_details` | `userPrivacy.js` (new) |
| `user_privacy_settings` | `userPrivacy.js` (new) |
| `homepage_blocks` | `homepageBlocks.js` (new) |
| `system_settings` | `systemSettings.js` (new) |
| `database_backups` | `admin.js` (rewritten) |
| `external_service_usage` | `externalServiceUsage.js` (new) |
| `ai_identification_results` | `aiIdentification.js` (new) |
| `ai_performance_log` | `aiIdentification.js` (new) |
| `verified_identifications` | `aiIdentification.js` (new) |
| `serial_number_registry` | `instruments.js` (lookup) |
| `spec_fields` | `specFields.js` (new) |
| `spec_field_options` | `specFields.js` (new) |
| `spec_field_aliases` | `specFields.js` (new) |
| `spec_templates` | `specTemplates.js` (new) |
| `saved_searches` | `savedSearches.js` (new) |

---

## 7. Phase 4: Auth & Security (Day 8–9)

### Step 4.1: Adapt AuthContext.jsx

Changes needed:
- User profile now fetches from `users` table with new columns: `first_name`, `last_name`, `bio`, `location`, `privacy_settings`, `notification_settings`
- Add `is_verified` and `is_luthier` flags to user context
- After login, also fetch `user_roles` to determine admin/moderator access

```javascript
// After auth.getUser(), fetch extended profile:
const { data: profile } = await supabase
  .from('users')
  .select('*, user_roles(role)')
  .eq('id', user.id)
  .single();
```

### Step 4.2: Create useRole Hook

```javascript
// src/hooks/useRole.js
export function useRole() {
  const { user } = useAuth();
  const role = user?.user_roles?.[0]?.role || 'user';
  return {
    role,
    isAdmin: role === 'admin',
    isModerator: role === 'moderator' || role === 'admin',
    isUser: true,
  };
}
```

### Step 4.3: Update Route Guards

Update `AdminRoute.jsx` to use the new role system:
```javascript
// Check user_roles table instead of hardcoded user IDs
const { isAdmin } = useRole();
if (!isAdmin) return <Navigate to="/" />;
```

### Step 4.4: Add Blocked User Check

Create utility to check if current user is blocked:
```javascript
// src/lib/supabase/userBlocks.js
export async function isBlockedBy(userId, targetUserId) {
  const { data } = await supabase
    .from('user_blocks')
    .select('id')
    .eq('blocker_id', targetUserId)
    .eq('blocked_id', userId)
    .single();
  return !!data;
}
```

Use this before showing profiles, sending messages, etc.

---

## 8. Phase 5: Feature Gap — New Pages (Day 9–18)

Using Lovable's 36 routes as the baseline. Organized by priority.

### Existing Pages That Need Adaptation (No New Pages Needed)

These routes exist in our frontend and need schema/column adaptations but NOT new page builds:

| Route | Our Page | Adaptation Needed |
|-------|----------|-------------------|
| `/` | Homepage | Update data fetching to use `homepage_blocks`, `instruments` |
| `/auth` | Auth | Add first_name, last_name fields to signup. Add role fetch post-login. |
| `/upload` | AddGuitar → rename to AddInstrument | Adapt form to `instruments` schema, JSONB specs, instrument_type enum. Integrate `magic-add-identify`. |
| `/explore` | Explore/Browse | Change `guitars` → `instruments`, `brand` → `make`. Add AdvancedSearchSidebar. |
| `/explore-test` | Not needed | Low priority — Lovable uses this for testing. Skip or replicate later. |
| `/guitar/:id` | GuitarDetail → InstrumentDetail | Adapt to `instruments` schema, JSONB specs, new timeline structure. |
| `/guitar/:id/edit` | EditGuitar → EditInstrument | Adapt form to `instruments` JSONB specs, instrument_type enum. |
| `/admin` | Admin | Heavy adaptation: new table names, expanded capabilities (see Priority 7). |
| `/profile` | Profile | Add: bio, first_name, last_name display. Badges section. Activity feed. |
| `/profile/edit` | ProfileEdit | Add: first_name, last_name, bio, location, privacy_settings form fields. Fetch from `user_privacy_settings` table. |
| `/user/:userId` | UserProfile/PublicProfile | Add: follow/block buttons, badges, public instruments, activity. |
| `/my-instruments` | MyCollection → MyInstruments | Change `guitars` → `instruments`. Add archive/restore toggle. |

### Priority 1: Core Social (Day 9–11) — 3 days

These features make TWNG a community platform.

#### 5.1 Messages Page (`/messages`)

**Lovable reference:** `src/pages/Messages.tsx`
**Backend:** `messages` table (realtime enabled)

Build:
- [ ] Conversation list sidebar (group by sender/recipient pairs)
- [ ] Message thread view (chronological messages)
- [ ] Message compose input with send button
- [ ] Realtime subscription for new messages
- [ ] Unread count badge in navbar
- [ ] Mark-as-read on thread open
- [ ] Empty state for no conversations

**Estimated: 1.5 days**

#### 5.2 Notification Dropdown (header component)

**Lovable reference:** `src/components/ui/notification-dropdown.tsx`
**Backend:** `notifications` table (realtime enabled)

Build:
- [ ] Bell icon in navbar with unread count badge
- [ ] Dropdown showing recent notifications
- [ ] Mark as read on click
- [ ] "Mark all as read" button
- [ ] Link to related content (instrument, thread, user)

**Estimated: 0.5 days**

#### 5.3 Follow/Block Buttons + Public Profile Enhancement

**Lovable reference:** `src/components/ui/follow-button.tsx`, `src/components/ui/block-button.tsx`
**Backend:** `user_follows`, `user_blocks` tables

Build:
- [ ] FollowButton component (toggle follow/unfollow)
- [ ] BlockButton component (block/mute options)
- [ ] Update `/user/:username` page with follower/following counts
- [ ] Show user badges on profile
- [ ] Activity feed section on profile

**Estimated: 1 day**

---

### Priority 2: Collections (Day 11–13) — 2 days

#### 5.4 Collections Browse (`/collections`)

**Lovable reference:** `src/pages/Collections.tsx`
**Backend:** `collections`, `collection_items` tables

Build:
- [ ] Grid of public collections with cover images
- [ ] Collection card component (name, description, item count, owner)
- [ ] Filter by category
- [ ] Search collections

#### 5.5 Collection Detail (`/collections/:id`)

**Lovable reference:** `src/pages/CollectionDetail.tsx`

Build:
- [ ] Collection header (name, description, cover image, owner info)
- [ ] Grid of instruments in collection
- [ ] Favorite button
- [ ] Share button

#### 5.6 Collection Create/Edit (`/collections/new`, `/collections/:id/edit`)

**Lovable reference:** `src/pages/CollectionCreate.tsx`, `src/pages/CollectionEdit.tsx`

Build:
- [ ] Form: name, description, cover image upload, is_public toggle
- [ ] Instrument picker (search and add instruments)
- [ ] Remove instruments from collection
- [ ] Collection category assignment

#### 5.7 My Collections (`/my-collections`)

**Lovable reference:** `src/pages/MyCollections.tsx`

Build:
- [ ] List of user's own collections
- [ ] Create new collection button
- [ ] Edit/delete actions per collection

#### 5.8 My Favorites (`/my-favorites`)

**Lovable reference:** `src/pages/MyFavorites.tsx`
**Backend:** `user_favorites` table

Build:
- [ ] Grid of favorited instruments and collections
- [ ] Unfavorite button
- [ ] Filter by type (instruments vs collections)

**Estimated total for Collections: 2 days**

---

### Priority 3: Forum (Day 13–15) — 2 days

#### 5.9 Forum Home (`/forum`)

**Lovable reference:** `src/pages/Forum.tsx`
**Backend:** `forum_categories`, `forum_threads` tables

Build:
- [ ] Category list with icons and descriptions
- [ ] Recent/popular threads list
- [ ] Pinned threads section
- [ ] Thread count per category
- [ ] "New Thread" button

#### 5.10 Forum Category (`/forum/category/:slug`)

**Lovable reference:** `src/pages/ForumCategory.tsx`

Build:
- [ ] Category header (name, description)
- [ ] Threads list (title, author, reply count, view count, last activity)
- [ ] Pagination
- [ ] Sort: newest / most replies / most views

#### 5.11 New Thread (`/forum/new`)

**Lovable reference:** `src/pages/ForumNewThread.tsx`

Build:
- [ ] Form: title, category dropdown, content (rich text)
- [ ] Submit creates entry in `forum_threads`

#### 5.12 Thread Detail (`/forum/thread/:id`)

**Lovable reference:** `src/pages/ForumThread.tsx`

Build:
- [ ] Thread title and content
- [ ] Reply list (chronological)
- [ ] Reply form
- [ ] Like button per post
- [ ] "Mark as solution" (for thread author)
- [ ] Pin/lock indicators
- [ ] View count increment on load

**Estimated total for Forum: 2 days**

---

### Priority 4: Content (Day 15–16) — 1.5 days

#### 5.13 Articles List (`/articles`)

**Lovable reference:** `src/pages/Articles.tsx`
**Backend:** `articles`, `article_tags` tables

Build:
- [ ] Article cards grid (title, excerpt, cover image, author, date)
- [ ] Tag filter
- [ ] Search articles

#### 5.14 Article Detail (`/articles/:slug`)

**Lovable reference:** `src/pages/Article.tsx`

Build:
- [ ] Full article content
- [ ] Author info
- [ ] Tags
- [ ] Related articles
- [ ] Comments section (using polymorphic `comments` table with target_type='article')

#### 5.15 Tags Page (`/tags`)

**Lovable reference:** `src/pages/Tags.tsx`
**Backend:** `tags` table

Build:
- [ ] Tag cloud or list with usage counts
- [ ] Click tag → filtered instrument/article list

**Estimated total for Content: 1.5 days**

---

### Priority 5: Search Enhancement (Day 16–17) — 1 day

#### 5.16 Advanced Search Sidebar

**Lovable reference:** `src/hooks/useAdvancedSearch.tsx`

Build 20+ filter panel for Explore page:
- [ ] Make (brand) — text autocomplete
- [ ] Model — text autocomplete (filtered by make)
- [ ] Year range — min/max sliders
- [ ] Price range — min/max inputs
- [ ] Condition — dropdown
- [ ] Instrument type — dropdown (enum values)
- [ ] Body type — dropdown
- [ ] Electronics — dropdown
- [ ] Pickup configuration — dropdown
- [ ] For sale — toggle
- [ ] Featured — toggle
- [ ] Recently added — toggle
- [ ] Location — text input
- [ ] Tags — multi-select
- [ ] String count — dropdown
- [ ] Fret count — dropdown
- [ ] Tuning pegs — dropdown
- [ ] Saved searches — save/load filter sets

#### 5.17 Global Search Bar

**Lovable reference:** `src/hooks/useGlobalSearch.tsx`

Build:
- [ ] Search across instruments, articles, collections, users, forum threads
- [ ] Categorized results dropdown
- [ ] Recent searches

**Estimated total for Search: 1 day**

---

### Priority 6: Static Pages + Tools (Day 17–18) — 1.5 days

#### 5.18 Static Pages

| Page | Route | Content |
|------|-------|---------|
| About | `/about` | Platform mission and story |
| FAQ | `/faq` | Accordion Q&A |
| Terms | `/terms` | Terms of service |
| Vision | `/vision` | Platform roadmap |
| Guidelines | `/guidelines` | Community guidelines |
| Contact | `/contact` | Contact form → `send-contact-email` Edge Function |

**Estimated: 0.5 day** (simple static content)

#### 5.19 AI Tool Pages

| Page | Route | Edge Function |
|------|-------|---------------|
| Price Evaluator | `/test/price-evaluator` | `guitar-price-evaluation` |
| Background Removal | `/test/background-removal` | `remove-background` |

Build:
- [ ] Price Evaluator: form (make, model, year, condition) → call Edge Function → display price analysis
- [ ] BG Removal: image upload → call Edge Function → display before/after

**Estimated: 1 day**

---

### Priority 7: Admin Expansion (Ongoing)

Expand existing admin pages to match Lovable's admin capabilities:
- [ ] User management (user list, role assignment, ban/unban)
- [ ] Content moderation (articles, forum posts, instruments)
- [ ] System settings editor (from `system_settings` table)
- [ ] Homepage block editor (from `homepage_blocks` table)
- [ ] Database backup/restore UI (using `create-backup`/`restore-backup` Edge Functions)

**Estimated: 2 days (can be done incrementally)**

---

## 9. Phase 6: Shared Components to Build

| Component | File | Purpose | Backend |
|-----------|------|---------|---------|
| `FollowButton` | `src/components/ui/FollowButton.jsx` | Toggle follow/unfollow | `user_follows` |
| `BlockButton` | `src/components/ui/BlockButton.jsx` | Block/mute user with dropdown | `user_blocks` |
| `FavoriteButton` | `src/components/ui/FavoriteButton.jsx` | Toggle favorite | `user_favorites` |
| `BadgeDisplay` | `src/components/ui/BadgeDisplay.jsx` | Show user badges | `user_badges` |
| `ActivityFeed` | `src/components/ActivityFeed.jsx` | Activity timeline | `user_activity` |
| `NotificationDropdown` | `src/components/ui/NotificationDropdown.jsx` | Bell icon + dropdown | `notifications` (realtime) |
| `MessageDropdown` | `src/components/ui/MessageDropdown.jsx` | Message indicator in nav | `messages` (realtime) |
| `GlobalSearchBar` | `src/components/GlobalSearchBar.jsx` | Cross-entity search | Multiple tables |
| `AdvancedSearchSidebar` | `src/components/AdvancedSearchSidebar.jsx` | 20+ filter panel | `instruments` |
| `ForumThreadCard` | `src/components/Forum/ForumThreadCard.jsx` | Thread preview card | `forum_threads` |
| `ArticleCard` | `src/components/ArticleCard.jsx` | Article preview card | `articles` |
| `CollectionCard` | `src/components/CollectionCard.jsx` | Collection preview card | `collections` |
| `ImageBgRemoval` | `src/components/ImageBgRemoval.jsx` | Upload + BG removal | `remove-background` Edge Fn |
| `PriceEvaluator` | `src/components/PriceEvaluator.jsx` | Price evaluation form | `guitar-price-evaluation` Edge Fn |
| `RoleGuard` | `src/components/RoleGuard.jsx` | Role-based route protection | `user_roles` |
| `InstrumentTypeSelect` | `src/components/ui/InstrumentTypeSelect.jsx` | Enum-based instrument type picker | `instrument_type` enum |

---

## 10. Phase 7: Testing & QA (Day 18–21)

### Step 7.1: Data Layer Tests

For each rewritten service file, test:
- [ ] CRUD operations work against new schema
- [ ] RLS policies allow/deny correctly per role
- [ ] Realtime subscriptions fire on messages, notifications, follows
- [ ] JSONB spec fields read/write correctly
- [ ] Edge Functions respond correctly
- [ ] Serial decoder still works (no backend dependency)
- [ ] Guitar catalog autocomplete works

### Step 7.2: Page-by-Page Walkthrough

Test every route in the app:

| Route | Test | Pass? |
|-------|------|-------|
| `/` | Homepage loads, featured instruments show | |
| `/auth` | Login/signup works | |
| `/upload` | Add instrument form submits to `instruments` table | |
| `/explore` | Browse with filters works against new schema | |
| `/guitar/:id` | Instrument detail shows specs from JSONB | |
| `/guitar/:id/edit` | Edit saves to JSONB specs | |
| `/profile` | Profile shows new fields (bio, badges, etc.) | |
| `/user/:userId` | Public profile with follow/block buttons | |
| `/my-instruments` | My instruments list loads | |
| `/collections` | Collections grid loads | |
| `/collections/:id` | Collection detail with instruments | |
| `/messages` | Realtime messaging works | |
| `/forum` | Forum categories + threads load | |
| `/forum/thread/:id` | Thread with replies, like button | |
| `/articles` | Articles list loads | |
| `/articles/:slug` | Article detail with comments | |
| `/admin` | Admin dashboard with new data | |
| `/contact` | Contact form sends email via Edge Function | |
| `/test/price-evaluator` | AI price evaluation returns results | |
| `/test/background-removal` | BG removal works | |

### Step 7.3: Mobile Responsiveness

Test all new pages on mobile viewport (375px width).

### Step 7.4: Edge Cases

- [ ] Blocked user cannot see blocker's instruments
- [ ] Archived instruments don't appear in browse
- [ ] Private collections not visible to non-owners
- [ ] Forum locked threads reject new replies
- [ ] Grace period prevents edits after expiry

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| JSONB specs break existing forms | High | High | Build spec field adapter layer that maps flat fields ↔ JSONB |
| 109 migrations have conflicts | Low | High | Use fresh Supabase project (no merge) |
| Gemini API rate limits | Medium | Medium | Implement retry logic with exponential backoff |
| Missing RLS policies for new features | Medium | High | Test every CRUD operation as different roles (anon, user, admin) |
| Realtime subscription memory leaks | Medium | Medium | Cleanup subscriptions in useEffect return |
| Marketing admin data loss | Low | Low | Marketing tables were test data; rebuild on new schema if needed |
| Serial decoder incompatible with Lovable schema | Low | Low | Decoder is pure frontend JS, no backend dependency |

---

## 12. Assets Dropped vs. Kept

### DROPPED (Claude-specific)

| Asset | Reason |
|-------|--------|
| `extract-content` Edge Function | Claude API dependency, 2-phase pipeline |
| `extract-post` Edge Function | Claude API dependency |
| `analyze-guitar` Edge Function | Claude API dependency, replaced by `magic-add-identify` |
| `transcribe-audio` Edge Function | Claude API dependency, no Lovable equivalent |
| `verify-guitar` Edge Function | Claude API dependency, serial verification now via `serial_number_registry` table |
| `ContentExtractor.jsx` component | Frontend for dropped extraction pipeline |
| `seed_guitars` table | Output of dropped extraction pipeline |
| `marketing-admin.js` (20+ tables) | Not in Lovable schema, rebuild later if needed |
| `claims.js` + ClaimGuitar page | Lovable uses different ownership model |

### KEPT (Valuable regardless of AI)

| Asset | Reason |
|-------|--------|
| `guitar_catalog` table (419 models) | Valuable autocomplete data, added as new migration |
| `serialDecoder.js` | Pure JS regex, no AI dependency |
| `emailService.js` + `send-email` Edge Function | Multi-provider email, adapted to new schema |
| `kpiService.js` | Dashboard metrics, adapted to new table names |
| Design system (CSS, components, layout) | Our frontend stays unchanged visually |

---

## 13. Complete File Change Map

### Files to REWRITE (major changes)

| File | Action | Estimated Time |
|------|--------|---------------|
| `src/lib/supabase/guitars.js` → `instruments.js` | Full rewrite: table name, column mapping, JSONB specs | 4–6 hours |
| `src/lib/supabase/discussions.js` → `forum.js` | Full rewrite: different data model | 3–4 hours |
| `src/lib/supabase/admin.js` | Heavy rewrite: many table name changes | 3–4 hours |
| `src/lib/supabase/homepage.js` | Rewrite: use `homepage_blocks` table | 2–3 hours |
| `src/lib/supabase/comments.js` | Rewrite: polymorphic comments model | 2 hours |

### Files to ADAPT (minor changes)

| File | Action | Estimated Time |
|------|--------|---------------|
| `src/lib/supabase/occ.js` | Rename columns: ie_id→instrument_id, content_data→content | 1 hour |
| `src/lib/supabase/transfers.js` | Rename columns, remove claim-related fields | 1–2 hours |
| `src/lib/supabase/messaging.js` | Remove thread_id, change read_at→is_read | 1 hour |
| `src/lib/supabase/notifications.js` | Rename: body→message, is_read→read | 30 min |
| `src/lib/supabase/follows.js` | Rename: follows→user_follows, followed_id→following_id | 30 min |
| `src/lib/supabase/timeline.js` | Rename: guitar_id→instrument_id, enum types | 1 hour |
| `src/lib/supabase/iaChangeRequests.js` | Adapt to `instrument_attributes_history` | 1 hour |
| `src/lib/supabase/kpiService.js` | Update table references | 30 min |
| `src/lib/supabase/emailService.js` | Update Edge Function URL | 10 min |

### Files to KEEP AS-IS

| File | Reason |
|------|--------|
| `src/lib/supabase/client.js` | Just update .env values |
| `src/lib/supabase/guitarCatalog.js` | Queries our catalog table (unchanged) |
| `src/lib/serialDecoder.js` | Pure JS, no backend |

### Files to DELETE

| File | Reason |
|------|--------|
| `src/lib/supabase/marketing-admin.js` | Tables don't exist in Lovable |
| `src/lib/supabase/claims.js` | Claims system doesn't exist in Lovable |
| `src/components/ContentExtractor.jsx` | Claude pipeline frontend, dropped |

### Files to CREATE (new)

| File | Purpose | Estimated Time |
|------|---------|---------------|
| `src/lib/supabase/collections.js` | Collections CRUD | 2 hours |
| `src/lib/supabase/articles.js` | Articles management | 2 hours |
| `src/lib/supabase/userBadges.js` | Badge queries | 1 hour |
| `src/lib/supabase/userBlocks.js` | Block/mute management | 1 hour |
| `src/lib/supabase/userFavorites.js` | Favorites CRUD | 1 hour |
| `src/lib/supabase/activityFeed.js` | Activity feed | 1 hour |
| `src/lib/supabase/advancedSearch.js` | 20+ filter search | 2 hours |
| `src/lib/supabase/globalSearch.js` | Cross-entity search | 2 hours |
| `src/lib/supabase/roles.js` | Role management | 1 hour |
| `src/lib/supabase/tags.js` | Tag management | 1 hour |
| `src/lib/supabase/systemSettings.js` | System config | 1 hour |
| `src/lib/supabase/homepageBlocks.js` | Homepage blocks | 1 hour |

---

## Timeline Summary

| Phase | Days | What |
|-------|------|------|
| Phase 0: New Supabase Project | 0.5 | Create project, record credentials |
| Phase 1: Database Migration | 0.5 | Run 109 migrations + add catalog |
| Phase 2: Edge Functions | 1 | Deploy 9 functions, set secrets, test |
| Phase 3: Data Layer Rewrite | 5 | Rewrite/adapt all 19 service files + create 12 new ones |
| Phase 4: Auth & Security | 1 | Auth context, roles, blocked user checks |
| Phase 5: Feature Gap Pages | 8 | Build 22 new pages |
| Phase 6: Shared Components | (included in Phase 5) | 16 new components |
| Phase 7: Testing & QA | 3 | Page-by-page, mobile, edge cases |
| **Total** | **~19–21 days** | **~3–3.5 weeks** |
