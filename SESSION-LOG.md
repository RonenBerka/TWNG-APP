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
- [ ] **BLOCKER**: Run SQL in Supabase Dashboard to fix `homepage_blocks_type_check` constraint (add missing enum values or drop constraint)
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
