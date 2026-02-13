# TWNG Platform — QA Report

**Date:** 2026-02-13
**URL:** https://shiny-muffin-21f968.netlify.app
**Tester:** Claude (automated via Playwright MCP)
**Branch:** `feature/messaging-redesign`

---

## Summary

### Session 4 — Unauthenticated (2026-02-13)
| Status  | Count |
|---------|-------|
| PASS    | 32    |
| PARTIAL | 8     |
| FAIL    | 4     |
| SKIP    | 7     |
| **Total** | **51** |

### Session 5 — Authenticated + Bug Fixes (2026-02-13)
| Status  | Count |
|---------|-------|
| PASS    | 13    |
| PARTIAL | 1     |
| **Total** | **14** |

### Bug Fixes Applied
| Bug | Status |
|-----|--------|
| `/messaging` 404 | ✅ FIXED |
| `/luthiers` 404 | ✅ FIXED |
| UserProfile ReferenceError | ✅ FIXED |
| Footer `/collection` → `/collections` | ✅ FIXED |

---

## Test Results

### 1. Homepage & Navigation

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| H-01 | Homepage loads | PASS | `01-homepage.png` | Hero, stats, instruments, articles, testimonial, CTA, footer all render |
| H-02 | Navbar links (Explore, Collections, Articles, Forum) | PASS | — | All 4 nav links navigate correctly |
| H-03 | Exceptional Instruments section | PASS | `01b-homepage-footer.png` | 7 instruments loaded from DB with images, titles, owners |
| H-04 | Fresh Arrivals section | PASS | `01b-homepage-footer.png` | 8 recently added instruments with real data |
| H-05 | Stories & Guides section | PASS | `01b-homepage-footer.png` | 3 articles loaded from DB |
| H-06 | Stats counters | PASS | `01-homepage.png` | 23+ instruments, 12+ collectors, 11+ makes, 45 luthiers |
| H-07 | Footer renders once | PASS | `01b-homepage-footer.png` | Single footer, all sections present |
| H-08 | No console errors on homepage | PASS | — | 0 errors, 0 warnings |

### 2. Authentication

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| A-01 | Sign in page loads | PASS | `06-auth-signin.png` | Email/password form + Google OAuth |
| A-02 | Create account page | PASS | `07-auth-signup.png` | Full Name, Email, Password, strength meter, TOS checkbox |
| A-03 | Password reset flow | PASS | `08-auth-reset.png` | Email input, Send Reset Link button, Back to Sign In |
| A-04 | Invalid login error handling | PASS | `09-auth-error.png` | Shows "Invalid login credentials" in red banner |
| A-05 | Sign up with new user (no real email) | SKIP | — | Requires email verification; cannot test without real email |
| A-06 | Login / logout flow | SKIP | — | Requires valid credentials |
| A-07 | Session persistence | SKIP | — | Requires logged-in session |
| A-08 | Protected routes redirect to /auth | PASS | — | /notifications, /instrument/new, /collection, /messages all redirect to /auth |

### 3. Instruments

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| I-01 | Explore page loads | PASS | `02-explore.png` | 20 instruments, grid layout, "Showing 1-20 of 23 results" |
| I-02 | Explore filters (Make, Year, Type, Condition) | PASS | `02-explore.png` | All filter categories render with options |
| I-03 | Explore search bar | PASS | `02-explore.png` | Search input present and functional |
| I-04 | Explore sort (Newest/Oldest) | PASS | — | Dropdown with Newest/Oldest options |
| I-05 | Explore grid/list view toggle | PASS | — | Both view buttons present |
| I-06 | Explore pagination (Load More) | PASS | — | "Load More" button, "Showing 1-20 of 23 results" |
| I-07 | Instrument detail page | PASS | `10-instrument-detail.png`, `10b-instrument-detail-full.png` | Photo, tags, title, owner link, Love/Share, Story, Specs, Timeline |
| I-08 | Instrument detail — specs display | PASS | `10b-instrument-detail-full.png` | 8 spec fields from JSONB rendered correctly |
| I-09 | Instrument detail — owner link navigates | PASS | — | `/user/david_cohen` link works |
| I-10 | Add instrument (Magic Add) | SKIP | — | Requires auth (redirects to /auth) |
| I-11 | Edit instrument | SKIP | — | Requires auth + ownership |
| I-12 | Delete/archive instrument | SKIP | — | Requires auth + ownership |
| I-13 | Broken image on "Test Verification Guitar" | FAIL | `02-explore.png` | Alt text showing instead of image on Explore page |
| I-14 | "Test Verification Guitar" shows year "0" | FAIL | — | Fender · 0 — invalid year data in DB |
| I-15 | Timeline shows raw event types | PARTIAL | `10b-instrument-detail-full.png` | Shows "system_introduced", "system_ownership_transfer" — not user-friendly labels |

### 4. Collections

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| C-01 | Collections list page | PASS | `03-collections.png` | 5 collections with search, category filter, sort |
| C-02 | Collection detail page | PASS | `19-collection-detail.png` | Shows name, description, items, cover image, favorites/share |
| C-03 | Collection items load | PASS | `19-collection-detail.png` | "Vintage Fender Collection" shows 2 items with images |
| C-04 | Collections show "0 items" on list page | PARTIAL | `03-collections.png` | All collections show "0 items" on the list page, but detail page shows correct count (2) — mismatch |
| C-05 | Collection owner shows truncated UUID | PARTIAL | `03-collections.png` | Shows "a1b2c3d4" instead of display name |
| C-06 | Create/edit/delete collection | SKIP | — | Requires auth |

### 5. User Profile

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| U-01 | View other user's profile | PASS | `18-user-profile-david.png` | Avatar, name, badge, bio, location, join date, stats, tabs |
| U-02 | User profile — Guitars tab | PASS | `18-user-profile-david.png` | Shows 2 guitars with images and like counts |
| U-03 | User profile — tabs present | PASS | — | Guitars (2), Collections (1), Activity (0), Loved (0) |
| U-04 | Console error on user profile | PARTIAL | — | `ReferenceError: Cannot access 'v' before initialization` — page still renders but JS error present |
| U-05 | Edit own profile | SKIP | — | Requires auth |
| U-06 | Settings page | SKIP | — | Requires auth |

### 6. Articles

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| AR-01 | Articles list page | PASS | `04-articles.png` | Featured article, category tabs, search, sort, article grid |
| AR-02 | Article detail page | PASS | `11-article-detail.png` | Hero image, reading progress bar, content, blockquote, tags, author bio, related articles, comments |
| AR-03 | Article category filters | PASS | — | All, Guides, Deep Dives, Interviews, Reviews, News |
| AR-04 | Article comments section | PASS | — | 3 comments rendered with author names and dates |

### 7. Forum

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| F-01 | Forum home loads | PASS | `05-forum.png` | Categories, search, thread list, sorting tabs |
| F-02 | Forum categories (9 total) | PASS | `05-forum.png` | All 9 categories with thread counts |
| F-03 | Forum thread list | PASS | `05-forum.png` | 11 threads with avatars, timestamps, reply/view counts |
| F-04 | "1 threads" grammar | PARTIAL | `05-forum.png` | Should be "1 thread" (singular) |
| F-05 | Sign in to create thread prompt | PASS | `05-forum.png` | "Sign in to create a new thread" with link |
| F-06 | Create/reply to thread | SKIP | — | Requires auth |

### 8. Messaging

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| M-01 | /messages route (auth-protected) | PASS | — | Correctly redirects to /auth when not logged in |
| M-02 | /messaging route is 404 | FAIL | — | Route doesn't exist; the correct route is /messages |
| M-03 | Send/receive messages | SKIP | — | Requires auth |

### 9. Search

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| S-01 | Global search opens | PASS | `12-search-results.png` | Search overlay with input field |
| S-02 | Search returns instruments | PASS | `12-search-results.png` | "Gibson" query returns 5 instrument results |
| S-03 | Search returns articles | PASS | `12-search-results.png` | "Gibson" query returns 5 article results |
| S-04 | Search result → correct page | PASS | — | Clicking "Gibson ES-335" navigated to correct instrument detail |
| S-05 | Explore page search | PASS | `02-explore.png` | Search bar on Explore page functional |

### 10. Admin Panel

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| AD-01 | Admin panel access | SKIP | — | Requires auth + admin role |

### 11. Notifications

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| N-01 | /notifications redirects to auth | PASS | — | Correctly requires authentication |
| N-02 | Notification badge, click → destination | SKIP | — | Requires auth |

### 12. Cross-cutting

| ID | Feature | Status | Screenshot | Details |
|----|---------|--------|------------|---------|
| X-01 | Dark mode (default) | PASS | `01-homepage.png` | Dark theme renders correctly |
| X-02 | Light mode toggle | PASS | `13-light-mode.png` | Light theme renders correctly, toggle works |
| X-03 | Mobile responsive (375px) homepage | PASS | `14-mobile-homepage.png` | Hamburger menu, stacked layout, readable text |
| X-04 | Mobile responsive (375px) explore | PASS | `15-mobile-explore.png` | Filter bottom sheet, single-column grid |
| X-05 | Footer appears on every page | PASS | — | Verified on homepage, explore, articles, forum, instrument detail |
| X-06 | 404 page works | PASS | `17-luthiers-404.png` | Custom 404 with Home/Explore links |
| X-07 | Serial Decoder page | PASS | `16-decoder.png` | Brand selector, serial input, decode button, tips |
| X-08 | /luthiers is 404 (footer link broken) | FAIL | `17-luthiers-404.png` | Footer links to /luthiers but page doesn't exist |
| X-09 | /community page | PASS | — | Loads successfully |
| X-10 | /founding-members page | PASS | — | Loads successfully |
| X-11 | /faq page | PASS | — | Loads successfully |
| X-12 | /about page | PASS | — | Loads successfully |
| X-13 | /legal/terms page | PASS | — | Loads successfully |
| X-14 | /legal/privacy page | PASS | — | Loads successfully |
| X-15 | RTL support for Hebrew | PARTIAL | `05-forum.png` | Hebrew text visible in forum threads, but no explicit RTL direction set |
| X-16 | Social media footer links | PARTIAL | — | Instagram, Twitter, YouTube links all point to "#" (placeholder) |
| X-17 | Footer "Collections" link → /collection (singular) | PARTIAL | — | Redirects to auth; navbar uses /collections (plural). Inconsistent. |

---

## Bug List (Prioritized by Severity)

### BLOCKER
_None_

### CRITICAL
| # | Bug | Location | Details | Status |
|---|-----|----------|---------|--------|
| 1 | `/messaging` route is 404 | Router | The messaging page route is `/messages` but some links may reference `/messaging`. Needs route alias or link fix. | ✅ FIXED — Added `<Navigate>` redirect from `/messaging` to `/messages` in App.jsx |
| 2 | `/luthiers` page is 404 (footer link) | Footer.jsx | Footer links to `/luthiers` but no page exists. Either create page or remove link. | ✅ FIXED — Changed footer link to `/community` |
| 3 | Console error on user profile page | UserProfile.jsx | `ReferenceError: Cannot access 'v' before initialization` — JS error caught by ErrorBoundary. Page renders but may have broken functionality. | ✅ FIXED — Renamed `v` → `badgeStyle` and `variants` → `badgeVariants` in Badge component to avoid minification TDZ conflict |

### MAJOR
| # | Bug | Location | Details |
|---|-----|----------|---------|
| 4 | Collections list shows "0 items" for all | Collections page | Collection list page shows 0 items, but detail pages show correct counts. The item count query on the list page is broken. |
| 5 | Collection owner shows truncated UUID | Collections page | Shows "a1b2c3d4" instead of owner's display name. Missing join to profiles table. |
| 6 | "Test Verification Guitar" has broken image | Instruments / Explore | Alt text showing instead of image. Image URL missing or broken in DB. |
| 7 | "Test Verification Guitar" has year "0" | Instruments / DB | `Fender · 0` — year field is 0 or missing. Should be hidden or show "Unknown". |
| 8 | Timeline shows raw event type strings | InstrumentDetail.jsx | Shows "system_introduced", "system_ownership_transfer" instead of user-friendly labels like "Added to TWNG", "Ownership Transfer" |

### MINOR
| # | Bug | Location | Details |
|---|-----|----------|---------|
| 9 | "1 threads" grammar | Forum categories | Should be "1 thread" (singular). Needs pluralization logic. |
| 10 | Social media links are "#" placeholders | Footer.jsx | Instagram, Twitter, YouTube links point to "#". Should be real URLs or removed. |
| 11 | Footer "Collections" link goes to `/collection` (singular) | Footer.jsx | Navbar uses `/collections` (plural, the list page). Footer uses `/collection` (singular, auth-protected personal page). Confusing for users. | ✅ FIXED — Changed footer link to `/collections` |
| 12 | RTL direction not explicitly set | Global / Hebrew content | Hebrew forum threads render but no `dir="rtl"` attribute detected. May cause text alignment issues. |

---

## Recommended Fix Order

1. **Fix `/luthiers` 404** — Either create a placeholder page or update footer link to point elsewhere (e.g., `/community`)
2. **Fix `/messaging` route** — Add route alias for `/messaging` → `/messages`, or update any links pointing to `/messaging`
3. **Fix console error on UserProfile** — Debug `ReferenceError: Cannot access 'v' before initialization`
4. **Fix collections item count** — Query needs to count `collection_instruments` properly on the list page
5. **Fix collection owner display name** — Join to profiles table instead of showing raw UUID prefix
6. **Clean up "Test Verification Guitar"** — Fix or remove test data (broken image, year=0)
7. **Humanize timeline event types** — Map `system_introduced` → "Added to TWNG", etc.
8. **Fix pluralization** — "1 thread" not "1 threads"
9. **Update footer links** — Set real social media URLs or remove placeholders
10. **Align footer `/collection` vs `/collections`** — Use consistent route

---

## Authenticated Test Results (Session 5)

**Date:** 2026-02-13
**Account:** ronenberka@gmail.com (logged in via email/password)

### Auth-Required Features

| ID | Feature | Status | Details |
|----|---------|--------|---------|
| AUTH-01 | Login / session persistence | PASS | Signed in successfully; session persists across page navigation and after deploy |
| AUTH-02 | Authenticated navbar | PASS | Shows Admin, Notifications, Messages, Add Instrument, User menu (avatar "R") |
| AUTH-03 | Magic Add page (photo upload) | PASS | AI photo upload area, "Take Photo or Choose from Gallery", 10MB limit |
| AUTH-04 | Manual instrument form | PASS | Full form: Make, Model, Year, Color, Body Type, Pickup Config, Country, Finish, Condition + Specs (8 fields) |
| AUTH-05 | Messaging page | PASS | 3-panel layout: Chats sidebar with search + "New chat", conversation panel with "Select a conversation" prompt |
| AUTH-06 | Notifications page | PASS | All/Unread filter tabs, shows real notification ("ronenberka sent you a message" — 10h ago), Delete button |
| AUTH-07 | Admin panel | PARTIAL | Route works, AdminRoute guard works — shows "Access Denied" because ronenberka account lacks admin role. Need to assign role in Supabase. |
| AUTH-08 | Settings page (Profile) | PASS | 6 tabs: Profile, Account, Privacy, Notifications, Appearance, Data. Profile shows: Display Name, Username, Bio, Location, Website, Social Links (IG/Twitter/YouTube), Save/Cancel |
| AUTH-09 | Create Collection | PASS | Collection Name, Description, Public/Private toggle, Cover Image upload, "Add Instruments" button, Cancel/Create |
| AUTH-10 | Create Forum Thread | PASS | Category dropdown (9 categories), Title (100 char limit), Content (Markdown + Preview), Create Thread button, posting tips sidebar |
| AUTH-11 | User Profile (authenticated view) | PASS | Follow + Message buttons visible when viewing other users. Profile renders fully with avatar, bio, location, stats, tabs |
| AUTH-12 | `/messaging` redirect | PASS | `/messaging` now correctly redirects to `/messages` (bug fix verified) |
| AUTH-13 | Footer link fixes | PASS | "Luthier Directory" → `/community` (was `/luthiers`), "Collections" → `/collections` (was `/collection`) |
| AUTH-14 | UserProfile console error fix | PASS | `ReferenceError: Cannot access 'v' before initialization` is gone. Remaining errors are Supabase RLS-related (favorites/following 403s), not frontend bugs |

### Features Still Requiring Further Testing

- Edit/delete instrument (needs ownership of an instrument to test edit UI)
- Set instrument privacy toggle
- Admin panel full test (needs admin role assigned in Supabase `user_roles` table)
- Email system (welcome email, notification emails)
- Upload/create new article (requires admin role)
- Edit collection (needs existing collection owned by test user)
- Send actual messages between users (needs second account)

---

## Screenshots Index

| File | Description |
|------|-------------|
| `01-homepage.png` | Homepage hero section |
| `01b-homepage-footer.png` | Homepage full page |
| `02-explore.png` | Explore page with filters |
| `03-collections.png` | Collections list page |
| `04-articles.png` | Articles list page |
| `05-forum.png` | Forum home page |
| `06-auth-signin.png` | Sign in page |
| `07-auth-signup.png` | Create account page |
| `08-auth-reset.png` | Password reset page |
| `09-auth-error.png` | Invalid login error |
| `10-instrument-detail.png` | Instrument detail (Stratocaster) |
| `10b-instrument-detail-full.png` | Instrument detail full page |
| `11-article-detail.png` | Article detail page |
| `12-search-results.png` | Global search results |
| `13-light-mode.png` | Light mode homepage |
| `14-mobile-homepage.png` | Mobile (375px) homepage |
| `15-mobile-explore.png` | Mobile (375px) explore |
| `16-decoder.png` | Serial Number Decoder page |
| `17-luthiers-404.png` | /luthiers 404 page |
| `18-user-profile-david.png` | User profile page (David Cohen) |
| `19-collection-detail.png` | Collection detail page |
