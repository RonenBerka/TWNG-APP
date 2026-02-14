# TWNG Session Log

## 2026-02-12

### Session 1 — Claude Code Setup + Footer Fix
- ✅ Installed Claude Code CLI
- ✅ Copied setup files (CLAUDE.md, hooks, settings.json) to twng-app
- ✅ Fixed duplicate footer — removed inline Footer from Homepage.jsx
- ✅ Deployed to Netlify
- ✅ Connected twng-app to GitHub (TWNG-APP repo, private)
- Files: Homepage.jsx, .claude/, CLAUDE.md

### Session 2 — Bug Fixes from Feature Test
- ✅ Removed moderation_status='approved' filters (instruments.js, homepage.js, MarketingConsole.jsx)
- ✅ Fixed Explore page — data.data → data.instruments, data.count → data.total
- ✅ Fixed search URL — /instruments/ → /instrument/
- ✅ Fixed Admin dashboard — blank instrument count, "Unknown" activity names
- ✅ Fixed .single() → .maybeSingle() in getInstrument()
- ✅ Connected Homepage "Exceptional Instruments" to live DB
- ✅ Deployed + pushed to GitHub
- Files: instruments.js, homepage.js, Explore.jsx, GlobalSearchBar.jsx, Admin.jsx, MarketingConsole.jsx

### Session 3 — Messaging Redesign
- ✅ Redesigned Messaging.jsx — 3-panel layout matching site theme
- ✅ Added Message button to UserProfile.jsx
- ✅ Added Contact Owner button to InstrumentDetail.jsx
- ✅ Build passed, deployed
- ⚠️ Worktree deploy crashed site — reverted to main, redeployed
- Files: Messaging.jsx, UserProfile.jsx, InstrumentDetail.jsx

## 2026-02-13

### Session 4 — Comprehensive QA Test (Playwright MCP)
- ✅ Ran full QA test of live site via Playwright browser automation
- ✅ Tested 51 features: 32 PASS, 8 PARTIAL, 4 FAIL, 7 SKIP (auth required)
- ✅ Generated QA-REPORT.md with detailed results, screenshots, and bug list
- ✅ 21 screenshots captured in `qa-screenshots/` directory
- ❌ `/luthiers` route is 404 (broken footer link)
- ❌ `/messaging` route is 404 (correct route is `/messages`)
- ❌ Console error on UserProfile.jsx — ReferenceError
- ❌ Collections list shows "0 items" for all collections (count query broken)
- ⚠️ Collection owner names show truncated UUIDs instead of display names
- ⚠️ "Test Verification Guitar" has broken image and year=0
- ⚠️ Timeline shows raw event types (system_introduced, system_ownership_transfer)
- ⚠️ Forum "1 threads" grammar issue
- ⚠️ Social media footer links are "#" placeholders
- Files: QA-REPORT.md, qa-screenshots/*

### Session 5 — Authenticated QA + Critical Bug Fixes
- ✅ Signed in with ronenberka@gmail.com via Playwright
- ✅ Fixed CRITICAL: `/luthiers` 404 → changed footer link to `/community` (Footer.jsx)
- ✅ Fixed CRITICAL: `/messaging` 404 → added `<Navigate>` redirect to `/messages` (App.jsx)
- ✅ Fixed CRITICAL: UserProfile ReferenceError → renamed `v`/`variants` to `badgeStyle`/`badgeVariants` in Badge component (UserProfile.jsx)
- ✅ Fixed MINOR: Footer "Collections" link → changed `/collection` to `/collections` (Footer.jsx)
- ✅ Build passed, deployed to Netlify
- ✅ Tested 14 auth-required features: 13 PASS, 1 PARTIAL
- ✅ Verified: Magic Add page, manual instrument form, Messaging 3-panel layout, Notifications (real data), Settings (6 tabs), Create Collection, Create Forum Thread, User Profile with Follow/Message buttons
- ⚠️ Admin panel shows "Access Denied" — ronenberka account needs admin role in Supabase `user_roles` table
- ⚠️ Console still shows Supabase RLS 403 errors for favorites/following — not frontend bugs, need RLS policy adjustments
- ✅ Updated QA-REPORT.md with authenticated test results + bug fix status
- Files: Footer.jsx, App.jsx, UserProfile.jsx, QA-REPORT.md

### Session 6 — Homepage Block Management + Profile Cleanup + CLAUDE.md
- ✅ Removed stats row (Guitars/Followers/Following counts) from UserProfile.jsx
- ✅ Implemented real `saveHomepageBlocks` in admin.js (delete+insert strategy)
- ✅ Aligned block type names: Admin.jsx CANONICAL_BLOCKS → `featured_instruments`, `recent_instruments`, `explore_makes`
- ✅ Fixed Homepage.jsx column name: `b.block_type` → `b.type`
- ✅ Added bidirectional type mapping layer (DB ↔ frontend) in admin.js
- ✅ Exported `mapDbTypeToFrontend` / `mapFrontendTypeToDb` from barrel
- ✅ Homepage.jsx maps DB types when loading blocks
- ✅ Admin panel confirmed working (no more "Access Denied" — ronenberka has admin role)
- ✅ Admin → Homepage Management shows all 8 blocks with correct types
- ✅ Shortened CLAUDE.md from 111 → 72 lines (removed legacy refs, Hebrew notes, verbose sections)
- ❌ Homepage block toggle SAVE fails — Postgres `homepage_blocks_type_check` constraint rejects most type values
- ⚠️ DB enum `block_type` only accepts: `hero`, `featured_collection`, `featured_article` (discovered via REST API probing)
- ⚠️ Need to run SQL in Supabase Dashboard to either ALTER the enum or DROP the CHECK constraint
- Files: UserProfile.jsx, Admin.jsx, Homepage.jsx, admin.js, homepage.js, index.js (barrel), CLAUDE.md

---

## Pending
- [x] **BLOCKER**: ~~Run SQL in Supabase Dashboard to fix `homepage_blocks_type_check` constraint~~ **RESOLVED** — constraint dropped, 8 rows seeded, RPC functions created (Session 11)
- [ ] Content Pipeline — YouTube extractor built, needs full test run
- [ ] Reddit extractor script
- [ ] Web scraper script
- [ ] Manual input form (FB/IG)
- [ ] Import script — CSV to Supabase
- [x] Site QA — full feature test with screenshots
- [x] Authenticated QA session — test all auth-required features
- [x] Fix CRITICAL bugs from QA report (3/3 fixed)
- [x] Messaging — verify redesign works on live site
- [x] Admin panel access — confirmed working
- [x] Homepage block management UI — built, needs DB constraint fix
- [x] Fix MAJOR bugs: collections count + UUID display (verified via REST API, build passes)
- [ ] Fix remaining MAJOR bugs: test data cleanup, timeline labels
- [ ] Fix MINOR bugs from QA report (pluralization, social links, RTL)
- [x] Fix Supabase RLS 403/406 errors for favorites/following tables

### Session 8 — Social Features Round 2
- ✅ Fixed `.single()` → `.maybeSingle()` in `isFavorited()`, `addFavorite()` check, `isFollowing()`, `toggleFollow()` check, `getBlockStatus()` — eliminates HTTP 406 console errors
- ✅ Fixed follow counts on own profile — `loadFollowData` now runs for all profiles, not just others
- ✅ Added follower/following counts to profile header (inline with "Member since")
- ✅ Enhanced activity feed: now includes instrument additions, collection creations, favorites (with instrument names), and follows (with user names)
- ✅ Build passes (3.26s, no errors)
- ✅ Merged `fix/social-features-round2` → `main` (fast-forward), built, deployed to Netlify
- ✅ Pushed branch to GitHub: `origin/fix/social-features-round2`
- ✅ Live site verified via Playwright:
  - Collections page: all 5 collections show correct item counts + owner display names, 0 console errors
  - Explore page: 20 instruments loaded, 0 console errors
  - Instrument detail (Les Paul Standard 1959): Love button renders, 0 console errors (previously had HTTP 406 errors)
  - `/user/ronenberka` redirects to `/settings` (own-profile redirect — not a bug, existing behavior)
- Files: `userFavorites.js`, `follows.js`, `UserProfile.jsx`

### Session 7 — Collections & Admin Bug Verification
- ✅ Admin role: confirmed `users.role = 'admin'` for ronenberka@gmail.com via REST API (already set from Session 6)
- ✅ Collections "0 items": `getCollections()` query already fixed — added `collection_items(id)` embedded select (was `select('*')` on main)
- ✅ Collection owner UUID: already fixed — `CollectionsBrowse.jsx` uses `collection.owner.display_name` (was `collection.user_id.slice(0,8)` on main)
- ✅ REST API verification: all 5 public collections return correct item counts (2,1,2,2,2) and owner display names
- ✅ Build passes (`npm run build` — 3.96s, no errors)
- ⚠️ Direct PATCH to `users.role` blocked by RLS (anon key); role was already 'admin' so no action needed
- ⚠️ `user_roles` table is empty for ronenberka — doesn't affect frontend (AuthContext reads `users.role` column directly)
- ✅ Merged `fix/collections-admin-bugs` → `main` (fast-forward), built, deployed to Netlify
- ✅ Pushed branch to GitHub: `origin/fix/collections-admin-bugs`
- ✅ Live site verified via Playwright: all 5 collections show correct item counts + owner display names
- ⚠️ 5 console errors: `user_favorites` RLS 403s on collection favorite checks (known RLS issue, not related)
- Files committed: 24 files (all sessions 5-7 changes consolidated)
- Live URL: https://shiny-muffin-21f968.netlify.app/collections

## 2026-02-13

### Session 9 — Structural Refactoring (Route Centralization + .single() Audit)

**Branch:** `refactor/structural-improvements`

#### Step 1: Route Centralization (commit `147618c`)
- ✅ Created `src/lib/routes.js` — centralized ROUTES constants + path builder functions
- ✅ Migrated 42 files to import routes from `src/lib/routes.js` instead of hardcoded strings
- ✅ Build passes, committed as `refactor: centralize all route paths to src/lib/routes.js`
- Files: src/lib/routes.js (new), 42 page/component files updated

#### Step 2: .single() → .maybeSingle() Audit (commit `d8e2268`)
- ✅ Audited all 110 `.single()` calls across 25 files in `src/lib/supabase/`
- ✅ Changed ~33 READ queries to `.maybeSingle()` (where 0 rows is possible)
- ✅ Kept ~77 INSERT/UPDATE/UPSERT calls as `.single()` (guaranteed 1 row)
- ✅ Added decision comments above each changed line (e.g., `// READ by ID — row may not exist`)
- ✅ Cleaned up redundant PGRST116 error handling in 6 files (admin.js, instruments.js, guitarCatalog.js, comments.js, systemSettings.js, homepage.js)
- ✅ Build passes, committed
- Files changed: forum.js, iaChangeRequests.js, users.js, admin.js, transfers.js, articles.js, tags.js, claims.js, collections.js, homepageBlocks.js, userBadges.js, instruments.js, guitarCatalog.js, roles.js, timeline.js, comments.js, systemSettings.js, homepage.js
- Files with no changes needed (all INSERT/UPDATE): notifications.js, activityFeed.js, follows.js, occ.js, userBlocks.js, userFavorites.js, messaging.js

#### Status
- ✅ Merged `refactor/structural-improvements` → `main`, built, deployed to Netlify, pushed to GitHub

### Session 10 — Post-Deploy Regression Checklist

**Checklist Results:**

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | `npm run build` clean | ✅ PASS | 3.45s, 0 errors, 1 warning (dynamic import, benign) |
| 2 | Homepage loads | ✅ PASS | All sections render: hero, stats, featured, fresh arrivals, articles, CTA |
| 3 | `/explore` | ✅ PASS | 20 instruments, filters (make/year/type/condition), 0 console errors |
| 4 | `/collections` | ✅ PASS | 5 collections, correct item counts (2,1,2,2,2), real owner names |
| 5 | `/articles` | ✅ PASS | Featured article + 8 articles, category filters |
| 6 | `/forum` | ✅ PASS | 9 categories, 11 threads, real data |
| 7 | `/about` | ✅ PASS | 0 console errors |
| 8 | `/faq` | ✅ PASS | 0 console errors |
| 9 | `/messaging` → `/messages` redirect | ✅ PASS | Correctly redirects |
| 10 | `/luthiers` route | ⚠️ NOTE | Shows 404 page (no redirect added), but footer link correctly points to `/community` — no user can reach `/luthiers` via UI |
| 11 | Instrument detail (Les Paul 1959) | ✅ PASS | Full specs, story, timeline, Love button, 0 console errors |
| 12 | Dark/light mode toggle | ✅ PASS | Toggles correctly, full re-render |
| 13 | Search (global) | ✅ PASS | "gibson" returns 5 instruments + 5 articles |
| 14 | Console errors across all pages | ✅ PASS | 0 JS errors on homepage, explore, collections, instrument detail, articles, forum, about, faq |

**Summary:** 13/14 PASS, 1 NOTE (cosmetic — `/luthiers` direct URL shows 404 but is unreachable via UI)

**Known pre-existing issues (not regressions):**
- Timeline events show raw strings (`system_introduced`, `system_ownership_transfer`)
- "Test Verification Guitar" shows year=0
- Forum "1 threads" grammar
- Social media footer links are `#` placeholders
- ~~Homepage block toggle save blocked by DB enum constraint (needs Supabase SQL)~~ **FIXED in Session 11**

### Session 11 — Fix Admin Homepage Blocks Management (BLOCKER)

**Problem:** Admin → Homepage → toggling blocks on/off failed silently. Three separate issues:

1. **DB constraint**: `homepage_blocks_type_check` only allowed 3 types (`hero`, `featured_article`, `featured_collection`), but app needs 8. Only 1 row (hero) existed.
2. **Silent error swallowing**: `saveHomepageBlocks()` caught per-row errors with `console.warn` but never threw — caller's `catch` block never fired.
3. **Dead code + parameter swap**: `getHomepageSectionConfig()` called with no argument (sent `type=eq.undefined`), and `saveHomepageSectionConfig(sectionConfig, user?.id)` swapped params (config as sectionType).

**Fixes applied:**

#### DB (run in Supabase SQL Editor)
- ✅ Dropped `homepage_blocks_type_check` constraint (`ALTER TABLE ... DROP CONSTRAINT`)
- ✅ Inserted 7 missing rows (stats, featured, recently_added, explore_brands, articles, testimonials, cta)
- ✅ Created RPC functions `get_homepage_blocks()` and `update_homepage_block_by_type()` (migration 019)

#### Code
- ✅ `admin.js` — `saveHomepageBlocks()`: rewrote to use `supabase.rpc('update_homepage_block_by_type')` with fallback to direct UPDATE by type. Collects failures and throws aggregate error.
- ✅ `admin.js` — `getHomepageBlocks()`: rewrote to use `supabase.rpc('get_homepage_blocks')` with fallback to direct SELECT.
- ✅ `Admin.jsx` — removed dead `getHomepageSectionConfig()` call from initial load
- ✅ `Admin.jsx` — removed broken `saveHomepageSectionConfig(sectionConfig, user?.id)` call (parameter swap)
- ✅ `Admin.jsx` — removed unused imports (`getHomepageSectionConfig`, `saveHomepageSectionConfig`)

#### Verification
- ✅ Toggle "Explore by Brand" → Inactive → persists after full page reload
- ✅ Toggle back to Active → persists after reload
- ✅ All 8 blocks load correctly from DB via RPC
- ✅ No error alerts, no console errors
- ✅ Build passes, deployed to Netlify

- Files: `src/lib/supabase/admin.js`, `src/pages/Admin.jsx`, `supabase/migrations/019_homepage_blocks_rpc.sql`

### Session 12 — Feature Verification + Admin Bug Fixes

**Branch:** `fix/admin-race-condition-and-homepage-blocks`

#### Verification: Advanced Search Filters (Explore page)
- ✅ Year range filter — present (YearRangeSlider, 1900-2026)
- ✅ Instrument type filter — present (6 types: Solid Body, Semi-Hollow, Hollow, Classical, Acoustic, Bass)
- ❌ Body type filter — NOT in UI (DB schema has `body_style` but no filter widget)
- ❌ Pickup config filter — NOT in UI (DB schema has `pickup_config` but no filter widget)
- ℹ️ Also present: Make (15 brands), Condition (7 options), For Sale toggle, Verified Only toggle

#### Verification: Instrument Archive/Restore
- ✅ Archive button on instrument detail page — owner-only, with confirmation dialog
- ✅ Restore button when archived — same button toggles to "Restore"
- ✅ Archived banner on detail page — yellow warning "not visible to the public"
- ✅ API functions fully implemented: `archiveInstrument()`, `restoreInstrument()`
- ⚠️ No dedicated restore UI on profile page — archived instruments appear in profile but restore requires visiting the detail page

#### Fix: Admin "Access Denied" race condition (commit `a1b6143`)
- ✅ Root cause: `AuthContext` set `loading=false` immediately from JWT, but `profile.roles` stayed `[]` until lazy DB fetch (~150ms later). AdminRoute checked `isStaff` before roles populated.
- ✅ Fix: Added `profileLoaded` state to AuthContext (mirrors existing `profileLoadedRef`), exposed in context value. AdminRoute now shows spinner while `isAuthenticated && !profileLoaded`.
- Files: `src/context/AuthContext.jsx`, `src/components/AdminRoute.jsx`

#### Fix: `type=eq.undefined` query in admin homepage blocks (commit `812f012`)
- ✅ Root cause: `getHomepageSectionConfig()` function could be called without argument, sending `.eq('type', undefined)` → `type=eq.undefined` in REST API. The call was removed from Admin.jsx in Session 11, but the function remained as dead code.
- ✅ Fix: Removed `getHomepageSectionConfig` entirely. Made `saveHomepageSectionConfig` module-private. Cleaned up barrel re-exports in index.js.
- Files: `src/lib/supabase/homepage.js`, `src/lib/supabase/index.js`

#### Status
- ✅ Both fixes committed separately on feature branch
- ✅ Build passes (3.48s, 0 errors)
- ⏳ NOT merged or deployed (as instructed)

### Session 13 — Backup Check + Duplicate Detection

**Branch:** `feature/backup-check-and-duplicate-detection`

#### Task 1: Database Backup/Restore Edge Functions
- ❌ Not implemented — no `create-backup` or `restore-backup` Edge Functions exist in `supabase/functions/`
- ℹ️ Existing Edge Functions: `transcribe-audio`, `extract-post`, `extract-content`, `analyze-guitar`, `send-email`, `verify-guitar`
- ℹ️ Skipped — no "Backup Now" button added to Admin panel

#### Task 2: Duplicate Detection on Add Instrument (commit `ee5c12e`)
- ✅ Added `checkDuplicateInstrument()` to `instruments.js` — queries `instruments` table for matching `make`+`model`+`year` (case-insensitive via `ilike`)
- ✅ Runs before advancing to story step (from both `results` and `edit` screens)
- ✅ Shows amber warning banner on story step with link to existing instrument (opens in new tab)
- ✅ Soft warning only — "You can still add yours — duplicates are allowed"
- ✅ Gracefully handles query failures (doesn't block the user)
- ✅ Build passes (3.31s, 0 errors)
- Files: `src/lib/supabase/instruments.js`, `src/pages/AddInstrument.jsx`

#### Status
- ✅ Task 2 committed on feature branch
- ⏳ NOT merged or deployed (as instructed)

### Session 14 — Username Availability Check + Serial Decoder on Instrument Detail

**Branch:** `feature/username-check-serial-decoder`

#### Task 1: Username Availability Check (commit `f75d0cb`)
- ✅ Added `checkUsernameAvailability()` to `users.js` — queries `users` table, excludes own user ID on settings page
- ✅ Added username field to signup form (Auth.jsx) with debounced 500ms availability check
- ✅ Green checkmark when available, red X when taken, "..." while checking
- ✅ Input sanitizes to lowercase alphanumeric + underscores only
- ✅ Settings page (ProfileSettings) — same debounced check, skips if unchanged from saved value
- ✅ AuthContext `signup()` now passes username to Supabase user metadata
- ✅ Visual feedback only — does not block form submission
- ✅ Exported `checkUsernameAvailability` from barrel `index.js`
- Files: `src/lib/supabase/users.js`, `src/lib/supabase/index.js`, `src/pages/Auth.jsx`, `src/pages/Settings.jsx`, `src/context/AuthContext.jsx`

#### Task 2: Serial Decoder on InstrumentDetail (commit `6affb36`)
- ✅ `serialDecoder.js` already exists — full engine for 10 brands (Fender, Gibson, PRS, Martin, Taylor, Ibanez, Epiphone, Rickenbacker, Gretsch, Squier)
- ✅ Added `SerialDecoderPanel` component to InstrumentDetail.jsx (owner-only section)
- ✅ "Decode Serial" button loads serial from `instrument_sensitive_details` table via `getInstrumentSerialNumber()`
- ✅ Decoded info shown in grid: brand, year/range, factory, country, series, production number
- ✅ Confidence indicator (high/medium/low) with color coding
- ✅ Collapsible panel with explanation and tips
- ✅ Graceful error handling (no serial recorded, access denied)
- ✅ Uses `make` field as brand hint for more accurate decoding
- Files: `src/pages/InstrumentDetail.jsx`

#### Status
- ✅ Both tasks committed separately on feature branch
- ✅ Build passes (3.48s, 0 errors)
- ⏳ NOT merged or deployed (as instructed)

### Session 15 — Ownership Transfer Flow

**Branch:** `feature/ownership-transfer-flow`

#### What was built
- ✅ **Transfer button on InstrumentDetail** — owner-only "Transfer" button in header (next to Edit and Archive), uses `ArrowRightLeft` icon
- ✅ **TransferOwnershipModal** — in-page modal with 3 steps:
  1. **Search**: debounced username search (300ms), excludes self, shows avatar + display name + @username
  2. **Confirm**: summary card showing instrument + recipient, warning about the process
  3. **Done**: success screen with link to recipient's Transfers page
- ✅ **Notification on initiate** — creates `transfer_incoming` notification for recipient with link to `/transfers`
- ✅ **Accept = Accept + Complete** — simplified MyTransfers so "Accept" does both `acceptTransfer()` + `completeTransfer()` (updates `instrument.current_owner_id`) in one click
- ✅ **Notifications on Accept/Decline** — sends `transfer_completed` or `transfer_declined` notification back to sender
- ✅ **Status badge fix** — added `rejected` alias in STATUS_STYLES (DB uses `rejected`, UI showed `declined`)
- ✅ Removed separate "Complete Transfer" button (no longer needed since accept auto-completes)

#### Architecture decisions
- Modal instead of separate page — simpler UX, no extra route needed
- Used existing `searchUsers` from transfers.js (returns `id, username, display_name, avatar_url`)
- Used existing `createNotification` for in-app notifications (no email)
- Notification `data.link` points to `/transfers` for incoming, instrument detail for accept/decline

#### Files changed
- `src/pages/InstrumentDetail.jsx` — TransferOwnershipModal component + Transfer button + imports
- `src/pages/MyTransfers.jsx` — combined accept+complete, added notifications, added `rejected` status style

#### Status
- ✅ Committed on feature branch (commit `54d1aba`)
- ✅ Build passes (3.52s, 0 errors)
- ⏳ NOT merged or deployed (as instructed)

### Session 16 — Email Service Infrastructure Audit

**Branch:** `feature/ownership-transfer-flow` (no changes made — audit only)

#### What exists (code)
- ✅ **Edge Function `send-email`** — deployed, ACTIVE, uses Resend API (`supabase/functions/send-email/index.ts`, 115 lines)
- ✅ **Frontend email service** — `src/lib/email/emailService.js` (412 lines) — sends via `supabase.functions.invoke('send-email')`
- ✅ **Email templates** — `src/lib/email/templates.js` (1,034 lines) + `auth-templates.js` (614 lines) — welcome, claim, re-engagement, auth sequences
- ✅ **DB tables exist** — `email_log`, `email_queue`, `email_preferences` (all 3 in public schema)
- ✅ **Welcome sequence wired** — `AuthContext.jsx:258` calls `triggerWelcomeSequence()` on signup (non-blocking, fire-and-forget)
- ✅ **Edge Function also exists:** `send-contact-email` (separate function for contact form)

#### What doesn't work / gaps found
- ❌ **RESEND_API_KEY likely not set** — Edge Function logs show zero invocations of `send-email` ever (only `analyze-guitar` and `verify-guitar` appear in logs)
- ❌ **`twng.com` domain not verified** — Edge Function hardcodes `from: "TWNG <hello@twng.com>"` but Resend requires domain verification via DNS records
- ❌ **email_log table empty** — 0 rows. No email has ever been sent or attempted
- ❌ **email_queue table empty** — 0 rows. Welcome sequence inserts would land here but never have
- ❌ **DB schema mismatch (email_log)** — table has `(id, to_email, subject, template_key, status, error, created_at)` but code INSERTs `(user_id, provider, message_id, tags, sent_at)` — 5 columns don't exist, INSERT fails silently via `.catch(() => {})`
- ❌ **DB schema mismatch (email_queue)** — table has `(id, to_email, subject, html_body, template_key, status, scheduled_for, sent_at, error, created_at)` but code INSERTs `(user_id, html, text_content, send_at, sequence_key, email_key, variables)` — multiple missing columns
- ❌ **No queue processor** — `processEmailQueue()` exists in code but no cron job or Edge Function calls it
- ❌ **Notification emails not wired** — messaging, transfers, notifications only create in-app notifications. No email sent for any event
- ❌ **Settings email prefs disconnected** — toggles in Settings.jsx are local state, not connected to `email_preferences` table

#### Summary: email system is INERT
Code is comprehensive (~2,200 lines) but **nothing works end-to-end**:
1. `RESEND_API_KEY` missing → Edge Function would return 500
2. `twng.com` not verified in Resend → even with key, sends would be rejected
3. DB schemas don't match code → all logging/queuing fails silently
4. No queue processor → even if queue worked, nothing sends scheduled emails
5. No transactional emails wired → new message, transfer request etc. have no email path

#### To make it work (DO NOT BUILD — documenting only)
1. Create Resend account + verify `twng.com` domain (DNS records)
2. Set `RESEND_API_KEY` as Supabase secret
3. Fix `email_log` and `email_queue` table schemas to match code (or vice versa)
4. Create queue processor (pg_cron or scheduled Edge Function)
5. Wire `sendEmail()` into messaging, transfer, and notification flows
6. Connect Settings toggles to `email_preferences` table

- Files: none changed (audit only)

### Session 16b — Email Pipeline Activation

**Branch:** `feature/ownership-transfer-flow`

#### Fixes applied
- ✅ **Edge Function `send-email` updated** — changed hardcoded `from: "TWNG <hello@twng.com>"` to `body.from || "TWNG <onboarding@resend.dev>"` (Resend test sender, no domain verification needed). Redeployed as v11.
- ✅ **Frontend config updated** — `emailService.js` default `from` changed to `onboarding@resend.dev`
- ✅ **RESEND_API_KEY set** — added as Supabase project secret via Dashboard (Settings > Edge Functions > Secrets)
- ✅ **DB schema mismatches fixed** — migration `fix_email_table_schemas`:
  - `email_log`: added `user_id`, `provider`, `message_id`, `tags`, `sent_at`
  - `email_queue`: added `user_id`, `html`, `text_content`, `send_at`, `sequence_key`, `email_key`, `variables`
  - `email_preferences`: added `sequence_emails`, `notification_emails`

#### Test results
- ✅ **Direct Resend API test** — `curl` to `api.resend.com/emails` → success, returned messageId `a39c48cd`
- ✅ **Full pipeline test** — `curl` to Edge Function `send-email` → success, returned messageId `74969609`
- ✅ **Both emails delivered** to ronenberka@gmail.com via `onboarding@resend.dev`

#### Remaining gaps (not fixed — documenting only)
- ⚠️ **Resend test sender limitation** — `onboarding@resend.dev` can only send to the Resend account owner's email. For production, need to verify `twng.com` domain in Resend
- ⚠️ **No queue processor** — scheduled emails (welcome sequence) will queue but never send without a cron/Edge Function worker
- ⚠️ **Notification emails not wired** — messaging, transfers, notifications still only create in-app notifications
- ⚠️ **Settings email prefs disconnected** — UI toggles not connected to `email_preferences` table

- Files: `supabase/functions/send-email/index.ts`, `src/lib/email/emailService.js`

---

## Session 17 — Merge All Branches, Deploy, Full Regression (2026-02-13)

### Branch Merges to Main

Merged 5 branches (4 feature/fix + 1 hotfix) to main:

1. **`fix/admin-race-condition-and-homepage-blocks`** (Session 12)
   - ❌ Build failed: `getHomepageSectionConfig` not exported from `homepage.js`
   - ✅ Fixed: removed dead imports and calls in `Admin.jsx`
   - ✅ Committed fix, merged (fast-forward)

2. **`feature/backup-check-and-duplicate-detection`** (Session 13)
   - ✅ Build passed, merged (3 files changed)

3. **`feature/username-check-serial-decoder`** (Session 14)
   - ✅ Build passed, merged (6 files changed)

4. **`feature/ownership-transfer-flow`** (Session 15/16)
   - ✅ Committed uncommitted changes from Sessions 11/16b (admin.js RPC, emailService sender fix, send-email Edge Function, migration 019)
   - ✅ Build passed, merged (8 files changed)

5. **`fix/founding-members-bookopen-crash`** (Session 17 hotfix)
   - ✅ Fixed `FoundingMembers.jsx` crash: `BookOpen` circular self-reference causing `ReferenceError: Cannot access 'v' before initialization`
   - ✅ Added `BookOpen` to lucide-react imports, removed broken self-referencing const
   - ✅ Build passed, merged (fast-forward)

**Skipped branches:**
- `feature/messaging-redesign` — stale from Session 3, 78-file diff with destructive changes
- `claude/vigorous-matsumoto` — auto-generated, stale

### Deploy & Push
- ✅ `npm run build` — 0 errors (3.58s)
- ✅ `npx netlify deploy --prod --dir=dist` — deployed to https://shiny-muffin-21f968.netlify.app
- ✅ `git push origin main` — pushed (e83bd3c..4178f01)

### Full Playwright Regression Checklist

| Page | Result | Notes |
|------|--------|-------|
| Homepage `/` | ✅ PASS | Hero, stats, 8 featured, fresh arrivals, articles, testimonial, CTA, footer |
| `/explore` | ✅ PASS | 20 instruments, filters work, "Showing 1-20 of 25" |
| `/collections` | ✅ PASS | 5 collections, correct item counts (2,1,2,2,2), real owner names |
| `/articles` | ✅ PASS | Featured article + 8 articles, category filters |
| `/forum` | ✅ PASS | 9 categories, 11 threads |
| `/instrument/...` (Les Paul 1959) | ✅ PASS | Story, specs, timeline, Love button |
| `/about` | ✅ PASS | Full content with founders |
| `/faq` | ✅ PASS | 49 answers, 11 categories |
| `/messaging` → `/messages` | ✅ PASS | Redirect works |
| `/decoder` | ✅ PASS | Page renders |
| `/community` | ✅ PASS | Renders as forum |
| `/founding-members` | ✅ PASS | All sections render after BookOpen fix |
| Dark mode toggle | ✅ PASS | Toggles correctly, persists |
| Global search | ✅ PASS | Returns instruments + articles + forum threads |
| `/legal/terms` | ✅ PASS | 12 sections |
| `/legal/privacy` | ✅ PASS | 10 sections |
| `/legal/cookies` | ✅ PASS | 7 sections |
| `/legal/dmca` | ✅ PASS | Renders correctly |

**Result: 18/18 pages PASS, 0 console errors**

### Files Changed
- `src/pages/Admin.jsx` — removed dead imports (`getHomepageSectionConfig`, `saveHomepageSectionConfig`)
- `src/pages/FoundingMembers.jsx` — added `BookOpen` to lucide-react import, removed circular self-reference
- `src/lib/supabase/admin.js` — RPC rewrite for homepage blocks (from Session 11)
- `src/lib/email/emailService.js` — sender fix (from Session 16b)
- `supabase/functions/send-email/index.ts` — from address fix (from Session 16b)
- `supabase/migrations/019_homepage_blocks_rpc.sql` — new RPC functions (from Session 11)

## 2026-02-14

### Session 18 — Fix Featured Article Card Layout

**Branch:** `fix/featured-article-card`

#### Problem
Featured article card on `/articles` had a large empty gap between the excerpt and the author bar. The `justifyContent: "center"` + `marginTop: "auto"` on the right panel pushed content to center and author bar to the bottom, leaving dead space.

#### Fix (commit `3a34c11`)
- ✅ Removed `justifyContent: "center"` from right panel — content now flows top-down naturally
- ✅ Added content preview — extracts first paragraph from `article.content[]`, truncated to ~200 chars at word boundary
- ✅ Added "Continue..." link in amber (`T.amber`) below content preview
- ✅ Removed `marginTop: "auto"` from author bar — sits directly below "Continue..." with no gap
- ✅ Layout order: badge → title → excerpt (muted) → content preview (regular) → "Continue..." (amber) → author bar

#### Verification
- ✅ Build passes (3.61s, 0 errors)
- ✅ Visual verification on dev server via Playwright — matches desired layout exactly

#### Deploy
- ✅ Merged `fix/featured-article-card` → `main` (fast-forward)
- ✅ `npm run build` — 0 errors (3.84s)
- ✅ Deployed to Netlify (deploy `69903b01`)
- ✅ Pushed branch to GitHub: `origin/fix/featured-article-card`

#### Regression Checklist (Live Site)

| # | Page | Result | Notes |
|---|------|--------|-------|
| 1 | `/articles` (featured card) | ✅ PASS | Content preview + "Continue..." + tight author bar, 0 console errors |
| 2 | `/articles/1` (article detail) | ✅ PASS | Full reader view renders, 0 console errors |
| 3 | Homepage `/` | ✅ PASS | Hero, stats, featured, CTA, footer, 0 console errors |
| 4 | `/explore` | ✅ PASS | 20 instruments, filters, "Showing 1-20 of 25" |
| 5 | `/collections` | ✅ PASS | 5 collections, correct item counts + owner names |
| 6 | `/forum` | ✅ PASS | 0 console errors |
| 7 | `/about` | ✅ PASS | 0 console errors |
| 8 | `/founding-members` | ✅ PASS | 0 console errors |
| 9 | `/faq` | ✅ PASS | 0 console errors |
| 10 | `/decoder` | ✅ PASS | 0 console errors |
| 11 | `/messaging` → `/messages` | ✅ PASS | Redirect works |
| 12 | Instrument detail (Les Paul 1959) | ✅ PASS | Story, specs, timeline render |
| 13 | Dark/light mode toggle | ✅ PASS | Featured card re-renders correctly in both themes |

**Result: 13/13 PASS, 0 regressions**

- Files: `src/pages/Articles.jsx`

### Session 19 — Fix Username/Profile Link 404s

**Branch:** `fix/username-links-404`

#### Problem
Clicking a username in the Messages dropdown (or other profile links) navigated to routes that don't exist, resulting in 404 pages.

#### Root Causes Found
1. **MessageDropdown** navigated to `/messages/${userId}` but no `/messages/:userId` route existed (only `/messages`)
2. **GlobalSearchBar** user results linked to `/profile/${item.id}` — wrong route and wrong identifier (UUID instead of username)
3. **ActivityFeed** "View all activity" linked to `/profile/${userId}/activity` — non-existent route
4. **Messaging.jsx** and **Admin.jsx** had hardcoded `/user/` strings instead of centralized `userPath()`

#### Fixes (commit `03f0d35`)
- ✅ Added `/messages/:userId` route in `App.jsx` pointing to Messaging component
- ✅ `Messaging.jsx` — added `useParams()` to read `userId` from URL and auto-select matching conversation
- ✅ `GlobalSearchBar.jsx` — changed `/profile/${item.id}` → `userPath(item.username)` using centralized route helper
- ✅ `ActivityFeed.jsx` — changed `/profile/${userId}/activity` → `userPath(username)`, added `username` prop
- ✅ `Messaging.jsx` — replaced hardcoded `` `/user/${user.username}` `` → `userPath(user.username)`
- ✅ `Admin.jsx` — replaced hardcoded `` `/user/${u.username}` `` → `userPath(u.username)`

#### Deploy
- ✅ Merged `fix/username-links-404` → `main` (fast-forward)
- ✅ `npm run build` — 0 errors (3.51s)
- ✅ Deployed to Netlify (deploy `69903e77`)
- ✅ Pushed branch + main to GitHub

#### Regression Checklist (Live Site)

| # | Page | Result | Notes |
|---|------|--------|-------|
| 1 | Homepage `/` | ✅ PASS | All sections render, 0 console errors |
| 2 | `/explore` | ✅ PASS | 0 console errors |
| 3 | `/collections` | ✅ PASS | 0 console errors |
| 4 | `/articles` | ✅ PASS | 0 console errors |
| 5 | `/forum` | ✅ PASS | 0 console errors |
| 6 | `/about` | ✅ PASS | 0 console errors |
| 7 | `/faq` | ✅ PASS | 0 console errors |
| 8 | `/founding-members` | ✅ PASS | 0 console errors |
| 9 | `/decoder` | ✅ PASS | 0 console errors |
| 10 | `/messaging` → `/messages` | ✅ PASS | Redirect works |
| 11 | Instrument detail | ✅ PASS | 0 console errors |
| 12 | Dark/light mode toggle | ✅ PASS | Toggles correctly |
| 13 | **Messages dropdown → click conversation** | ✅ PASS | Navigates to `/messages/{userId}`, conversation auto-selected, 0 console errors |
| 14 | **"View full profile" link in Messaging** | ✅ PASS | Points to `/user/doron` (correct route) |

**Result: 14/14 PASS, 0 regressions, specific fix verified**

- Files: `src/App.jsx`, `src/components/GlobalSearchBar.jsx`, `src/components/ActivityFeed.jsx`, `src/pages/Messaging.jsx`, `src/pages/Admin.jsx`

### Session 20 — Fix Empty "Explore by Make" Homepage Block

**Branch:** `fix/explore-by-make`

#### Problem
The "Explore by Make" section on the homepage rendered title + subtitle but zero brand cards. The section was visible but empty.

#### Root Cause
`ExploreByMakeSection` component existed, `getTopInstrumentMakes()` function existed in `homepage.js` and was exported from the barrel — but the homepage `useEffect` never called it. `sectionData.makes` was always `undefined`, so the section rendered with an empty array.

#### Fixes (commit `2eddb7c`)
- ✅ Imported `getTopInstrumentMakes` in Homepage.jsx
- ✅ Added `getTopInstrumentMakes()` to the `Promise.all` in the homepage data fetch (loads in parallel with other data)
- ✅ Added `newData.makes = makesRaw` when data is returned
- ✅ Added early return (`return null`) in `ExploreByMakeSection` when `displayMakes.length === 0` — hides the section entirely if no makes data

#### Audit: All Other Homepage Blocks
| Section | Data wired? | Empty handling |
|---------|------------|----------------|
| hero | ✅ Yes | Fallback data |
| stats | ✅ Yes | `FALLBACK_STATS` |
| featured_instruments | ✅ Yes | `FALLBACK_FEATURED` |
| recent_instruments | ✅ Yes | `FALLBACK_RECENT` |
| explore_makes | ✅ **Now wired** | ✅ **Now hidden if empty** |
| articles | ✅ Yes | `FALLBACK_ARTICLES` |
| testimonials | ✅ N/A (hardcoded) | `FALLBACK_TESTIMONIAL` |
| cta | ✅ N/A (hardcoded) | Inline defaults |

#### Verification
- ✅ Build passes (3.85s, 0 errors)
- ✅ Dev server: "Explore by Make" section shows 8 real brands (Gibson 7, Fender 5, Nash Guitars 3, Martin 2, Rickenbacker 2, PRS 1, Tanaka Custom 1, Taylor 1)
- ✅ Each card links to correct `/explore?make=...` route

#### Status
- ✅ Committed on feature branch
- ⏳ NOT merged or deployed (as instructed)

- Files: `src/pages/Homepage.jsx`

### Session 21 — Fix Hero Section Mobile Display Issues

**Branch:** `fix/hero-mobile-issues`

#### Bug 1: Wasted space above hero on mobile
- ✅ Reduced `paddingTop` from `128px` to `72px` on mobile (<768px)
- ✅ Changed `justify-content` from `center` to `flex-start` — content flows from top
- ✅ Reduced side padding from `48px` to `20px` on mobile
- ✅ Used `100svh` (small viewport height) instead of `100vh` to account for mobile browser chrome
- ✅ Background image now spans full width on mobile (was restricted to 65% right-aligned)

#### Bug 2: Hero background image too dark on mobile
- ✅ **Admin-controllable overlay opacity** — added `settings` JSONB column to `homepage_blocks` table via migration
- ✅ Hero block seeded with `{"hero_overlay_opacity": 0.4}` (default, lighter than previous 0.8)
- ✅ Mobile overlay changed from flat 80% dark color to gradient:
  - Top: ~16% opacity (image clearly visible)
  - Middle: 40% opacity (configurable via DB)
  - Bottom: 70% opacity (text stays readable)
- ✅ Desktop overlay unchanged (separate `.hero-desktop-overlay` class, left-to-right gradient)
- ✅ `object-position: center center` already correct on img element

#### Admin control
- To adjust overlay darkness: update `homepage_blocks` → hero row → `settings` → `hero_overlay_opacity` (0.0–1.0)
- Value of 0.0 = fully transparent overlay (image fully visible)
- Value of 1.0 = fully opaque overlay (image hidden)
- Default 0.4 = good balance of visibility and text readability

#### Verification
- ✅ Build passes (3.60s, 0 errors)
- ✅ Mobile (375×812): badge starts close to navbar, guitar image clearly visible through gradient, text readable
- ✅ Desktop (1440×900): no visual changes, hero looks identical to before
- ✅ 0 console errors

#### Status
- ✅ Committed on feature branch (commit `797b854`)
- ⏳ NOT merged or deployed (as instructed)

- Files: `src/pages/Homepage.jsx`
- DB: `homepage_blocks` table — added `settings` JSONB column, seeded hero overlay opacity
