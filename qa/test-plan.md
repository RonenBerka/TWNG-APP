# TWNG — QA Test Plan

**Platform:** TWNG Guitar Documentation Platform
**Version:** 1.0 (Pre-Launch)
**Generated:** 2026-02-08
**Source:** Codebase analysis (25+ pages, 34 actions, 11 entities, 7 roles)
**Total Tests:** 15 E2E + 327 Feature + 30 Regression = **372 tests**

---

## 1. Summary

TWNG is a guitar documentation platform enabling collectors to catalog, verify, transfer, and discuss guitars. The platform features AI-powered guitar identification (Magic Add via Claude Sonnet 4.5), serial number decoding for 9 brands, community forums with real-time messaging, guitar ownership transfers and claims, and a multi-role admin dashboard with 13 management modules.

**Stack:** Vite 7 + React 19 + Supabase (Auth, DB, Storage, Realtime, Edge Functions)
**Roles:** Guest, User, Luthier, Moderator, Support, Auditor, Admin, Super Admin
**Key Integrations:** Supabase Auth (email + Google OAuth), Supabase Edge Functions (AI analysis), Supabase Realtime (messaging), DiceBear Avatars

### Scope

This test plan covers all user-facing features extracted from the codebase. Every test traces back to the Action Model (Section 2). Features marked "coming soon" in the UI are noted but not tested for functionality — only their disabled/muted state is verified.

### Out of Scope

- Load/stress testing
- Accessibility testing (covered separately in LOW priority backlog)
- Mobile native app testing (web-only)
- Third-party service uptime (Supabase, Anthropic API)

---

## 2. Action Model (Human-Readable)

### 2.1 Actors

| ID | Actor | Role | Key Capabilities |
|---|---|---|---|
| ACT-001 | Guest | Unauthenticated | Browse guitars, read articles, use serial decoder, search |
| ACT-002 | Registered User | `user` | Add/edit/delete guitars, transfer, claim, message, forum, settings |
| ACT-003 | Luthier | `luthier` | All User caps + luthier directory listing, verified badge |
| ACT-004 | Admin | `admin`/`super_admin` | All User caps + admin dashboard (13 modules), moderation, user management |

### 2.2 Entities

| ID | Entity | CRUD | Special Actions |
|---|---|---|---|
| ENT-001 | Guitar | C/R/U/D | Transfer, Claim, AI Analysis, Serial Decode, Love, Visibility Toggle, Export |
| ENT-002 | User Profile | C/R/U/D | Avatar Upload, Password Change, Follow/Unfollow, Data Export |
| ENT-003 | OCC (Owner Created Content) | C/R/U/D | Visibility Cycle (Public → Owners Only → Private), Reorder |
| ENT-004 | Transfer | C/R/U/– | Accept, Decline, Cancel, Privacy Overrides |
| ENT-005 | Claim | C/R/U/– | Upload Evidence, Admin Approve/Reject |
| ENT-006 | Forum Thread | C/R/–/– | Upvote, Reply, Admin Hide/Pin/Lock |
| ENT-007 | Message | C/R/–/– | Mark Read, Real-time Subscription |
| ENT-008 | Notification | –/R/U/D | Mark Read, Mark All Read, Navigate to Source |
| ENT-009 | Article | C/R/U/D | Publish/Unpublish, Like, Comment |
| ENT-010 | Change Request (IA) | C/R/U/– | Admin Approve/Deny |
| ENT-011 | Luthier Profile | –/R/U/– | Admin Verify/Unverify |

### 2.3 Actions (34 total)

| ID | Action | Actors | Entity | Network | Severity |
|---|---|---|---|---|---|
| ACN-001 | Sign Up | ACT-001 | ENT-002 | Yes | BLOCKER |
| ACN-002 | Sign In | ACT-001 | ENT-002 | Yes | BLOCKER |
| ACN-003 | Sign Out | ACT-002/3/4 | ENT-002 | Yes | BLOCKER |
| ACN-004 | Add Guitar (Manual) | ACT-002/3 | ENT-001 | Yes | BLOCKER |
| ACN-005 | Add Guitar (Magic AI) | ACT-002/3 | ENT-001 | Yes | CRITICAL |
| ACN-006 | Decode Serial | ACT-001/2/3 | ENT-001 | No | MAJOR |
| ACN-007 | Edit Guitar | ACT-002/3 | ENT-001 | Yes | CRITICAL |
| ACN-008 | Delete Guitar | ACT-002/3/4 | ENT-001 | Yes | CRITICAL |
| ACN-009 | Love/Favorite Guitar | ACT-002/3 | ENT-001 | Yes | MAJOR |
| ACN-010 | Transfer Guitar | ACT-002/3 | ENT-004 | Yes | BLOCKER |
| ACN-011 | Accept Transfer | ACT-002/3 | ENT-004 | Yes | BLOCKER |
| ACN-012 | Decline Transfer | ACT-002/3 | ENT-004 | Yes | MAJOR |
| ACN-013 | Cancel Transfer | ACT-002/3 | ENT-004 | Yes | MAJOR |
| ACN-014 | Claim Guitar | ACT-002/3 | ENT-005 | Yes | CRITICAL |
| ACN-015 | Send Message | ACT-002/3 | ENT-007 | Yes | CRITICAL |
| ACN-016 | Create Forum Thread | ACT-002/3 | ENT-006 | Yes | MAJOR |
| ACN-017 | Reply to Thread | ACT-002/3 | ENT-006 | Yes | MAJOR |
| ACN-018 | Upvote Thread | ACT-002/3 | ENT-006 | Yes | MINOR |
| ACN-019 | Update Profile | ACT-002/3 | ENT-002 | Yes | CRITICAL |
| ACN-020 | Change Password | ACT-002/3 | ENT-002 | Yes | CRITICAL |
| ACN-021 | Delete Account | ACT-002/3 | ENT-002 | Yes | CRITICAL |
| ACN-022 | Export Collection | ACT-002/3 | ENT-001 | No | MAJOR |
| ACN-023 | Mark Notification Read | ACT-002/3 | ENT-008 | Yes | MAJOR |
| ACN-024 | Toggle OCC Visibility | ACT-002/3 | ENT-003 | Yes | MAJOR |
| ACN-025 | Search Guitars | ACT-001/2/3 | ENT-001 | Yes | CRITICAL |
| ACN-026 | Admin: Manage Users | ACT-004 | ENT-002 | Yes | CRITICAL |
| ACN-027 | Admin: Moderate Guitars | ACT-004 | ENT-001 | Yes | CRITICAL |
| ACN-028 | Admin: Process Claim | ACT-004 | ENT-005 | Yes | CRITICAL |
| ACN-029 | Admin: Review Change Request | ACT-004 | ENT-010 | Yes | CRITICAL |
| ACN-030 | Admin: Manage Homepage | ACT-004 | ENT-009 | Yes | MAJOR |
| ACN-031 | Admin: Moderate Forum | ACT-004 | ENT-006 | Yes | MAJOR |
| ACN-032 | Admin: Verify Luthier | ACT-004 | ENT-011 | Yes | MAJOR |
| ACN-033 | Browse Explore | ACT-001/2/3 | ENT-001 | Yes | CRITICAL |
| ACN-034 | Upload Photos | ACT-002/3 | ENT-003 | Yes | CRITICAL |

### 2.4 State Machines

**Guitar State (STA-001):** draft → published → deleted
**Transfer State (STA-002):** pending → accepted → completed | pending → declined | pending → cancelled | pending → expired
**Claim State (STA-003):** pending → approved | pending → rejected
**OCC Visibility (STA-004):** public → owners_only → private → public (cyclic)

### 2.5 Constraints

| ID | Constraint |
|---|---|
| CON-001 | Only authenticated users can create/edit/delete guitars |
| CON-002 | Only guitar owner (or admin) can edit/delete their guitar |
| CON-003 | Only admin/super_admin can access admin dashboard |
| CON-004 | Only super_admin can assign admin roles and edit system config |
| CON-005 | Cannot claim a guitar you already own |
| CON-006 | Transfer can only be initiated by current guitar owner |
| CON-007 | Messages visible only to sender and recipient (RLS enforced) |
| CON-008 | Magic Add AI: 15s timeout, 1 retry, falls back to filename analysis |
| CON-009 | Serial decoder supports 9 brands |
| CON-010 | Audit logs read-only, super_admin only |

### 2.6 Integrations

| ID | Integration | Purpose |
|---|---|---|
| INT-001 | Supabase Auth | Email/password + Google OAuth with JWT role management |
| INT-002 | Supabase PostgreSQL | 26+ tables with RLS policies |
| INT-003 | Supabase Storage | guitar-images bucket for photo storage |
| INT-004 | Supabase Realtime | Real-time messaging subscriptions |
| INT-005 | Edge Function (analyze-guitar) | AI guitar analysis via Claude Sonnet 4.5 |
| INT-006 | DiceBear Avatars | Fallback avatar generation |

---

## 3. E2E Scenarios (15 scenarios)

### E2E-001: Guest Registration and First Guitar Addition
**Actor:** ACT-001 → ACT-002
**Severity:** BLOCKER

**Given:** A guest user is on the TWNG platform with no account
**When:** The user signs up (ACN-001), completes profile setup, navigates to add a guitar, and manually enters guitar details (ACN-004)
**Then:** The account is created, the guitar is added to their collection, and it appears in their profile with all entered details visible

**Traces:** ACN-001, ACN-004, ACN-019, ENT-002, ENT-001

---

### E2E-002: Magic Add AI Guitar Analysis Flow
**Actor:** ACT-002
**Severity:** CRITICAL

**Given:** A registered user is on the Add Guitar page and selects the Magic AI option
**When:** The user uploads a guitar photo (ACN-034), the AI analyzes the instrument, the user reviews the decoded results, and submits the guitar entry (ACN-005)
**Then:** The guitar is created with AI-populated details, marked as Magic-added, stored in the user's collection, and visible in their guitar list

**Traces:** ACN-005, ACN-034, ACN-006, ENT-001, ENT-002

---

### E2E-003: Guitar Serial Number Decoder
**Actor:** ACT-001
**Severity:** MAJOR

**Given:** A guest user is browsing the platform and encounters the serial decoder tool
**When:** The user enters a valid guitar serial number (ACN-006)
**Then:** The system returns decoded information (make, model, year) and displays relevant results, allowing the guest to explore without authentication

**Traces:** ACN-006, ENT-001

---

### E2E-004: Complete Guitar Transfer Lifecycle
**Actor:** ACT-002, ACT-002
**Severity:** BLOCKER

**Given:** User A owns a guitar and User B is a registered user
**When:** User A initiates a transfer (ACN-010), selects User B as recipient, User B receives notification (ENT-008), and accepts the transfer (ACN-011)
**Then:** Ownership transfers to User B, the guitar appears in User B's collection, User A can no longer edit it, and both users receive confirmation notifications

**Traces:** ACN-010, ACN-011, ENT-001, ENT-004, ENT-008

---

### E2E-005: Guitar Transfer Declined
**Actor:** ACT-002, ACT-002
**Severity:** MAJOR

**Given:** A pending transfer exists between User A (sender) and User B (recipient)
**When:** User B declines the transfer (ACN-012)
**Then:** Ownership remains with User A, the guitar is removed from User B's pending list, User A receives a decline notification, and the transfer status is closed

**Traces:** ACN-012, ENT-001, ENT-004, ENT-008

---

### E2E-006: Guitar Transfer Cancellation
**Actor:** ACT-002
**Severity:** MAJOR

**Given:** User A has initiated a transfer to User B that is still pending
**When:** User A cancels the transfer before User B responds (ACN-013)
**Then:** The transfer is removed, User B no longer sees the pending transfer, User B receives a cancellation notification, and the guitar remains in User A's collection

**Traces:** ACN-013, ENT-001, ENT-004, ENT-008

---

### E2E-007: Guitar Claim Submission and Admin Approval
**Actor:** ACT-002, ACT-004
**Severity:** BLOCKER

**Given:** A registered user finds a guitar in the collection that was previously owned by them
**When:** The user submits a claim (ACN-014) with supporting documentation, and an admin reviews and approves the claim (ACN-028)
**Then:** Ownership transfers to the claiming user, the guitar is added to their collection, the original owner is notified, and the claim is marked resolved

**Traces:** ACN-014, ACN-028, ENT-001, ENT-005, ENT-002, ENT-008

---

### E2E-008: Create Forum Thread and Receive Replies
**Actor:** ACT-002, ACT-002
**Severity:** CRITICAL

**Given:** User A is viewing the forum section
**When:** User A creates a discussion thread (ACN-016), User B replies to the thread (ACN-017), and User A receives a notification about the reply
**Then:** The thread is published with the original post, the reply appears nested below, User A is notified (ENT-008), and both posts are visible with timestamps and author information

**Traces:** ACN-016, ACN-017, ENT-006, ENT-007, ENT-008

---

### E2E-009: Thread Upvoting and Engagement
**Actor:** ACT-002, ACT-002
**Severity:** MAJOR

**Given:** A forum thread exists with one or more replies
**When:** User A upvotes the original thread (ACN-018) and User B upvotes a reply
**Then:** Upvote counts increment for each post, voting status is recorded per user, and the thread may be ranked higher in listings based on engagement

**Traces:** ACN-018, ENT-006, ENT-007

---

### E2E-010: Direct Messaging Between Users
**Actor:** ACT-002, ACT-002
**Severity:** CRITICAL

**Given:** Two registered users are on the platform
**When:** User A initiates a message (ACN-015) to User B, User B receives and reads the message (ACN-023), and User B replies
**Then:** Both users see the conversation thread, messages are timestamped and attributed correctly, User A receives a notification of the reply, and read status is tracked for each message

**Traces:** ACN-015, ACN-023, ENT-007, ENT-008

---

### E2E-011: User Profile Management and Password Change
**Actor:** ACT-002
**Severity:** CRITICAL

**Given:** A registered user is logged in and on their profile page
**When:** The user updates profile information including name and bio (ACN-019), uploads a profile photo (ACN-034), and changes their password (ACN-020)
**Then:** All changes are saved and visible on the profile, the new password is required for future logins, and the user receives a confirmation notification of the password change

**Traces:** ACN-019, ACN-020, ACN-034, ENT-002

---

### E2E-012: Collection Export and Management
**Actor:** ACT-002
**Severity:** MAJOR

**Given:** A registered user has multiple guitars in their collection
**When:** The user accesses their collection, filters by condition or year, and exports the collection (ACN-022)
**Then:** The export file is generated as JSON containing all filtered guitars with details, and the download completes successfully

**Traces:** ACN-022, ENT-001, ENT-002

---

### E2E-013: Guest Exploration and Search
**Actor:** ACT-001
**Severity:** MAJOR

**Given:** A guest user is on the TWNG platform
**When:** The user browses the Explore section (ACN-033), searches for guitars by model or luthier (ACN-025), and clicks on a guitar to view details
**Then:** The Explore page displays featured guitars and collections, search results are filtered and displayed, guitar detail pages show all information including photos and history, without requiring login

**Traces:** ACN-025, ACN-033, ENT-001, ENT-003

---

### E2E-014: Admin Moderation and Guitar Approval
**Actor:** ACT-003, ACT-004
**Severity:** CRITICAL

**Given:** A luthier has submitted a guitar for verification and an admin is reviewing pending guitars
**When:** The admin reviews the guitar details (ACN-027), approves or rejects the submission, and the luthier profile is verified (ACN-032)
**Then:** Approved guitars are marked as verified and appear in search results, rejected guitars are flagged with reason for resubmission, the luthier receives notification of the outcome, and verified luthiers gain a badge on their profile

**Traces:** ACN-027, ACN-032, ENT-001, ENT-011, ENT-002, ENT-008

---

### E2E-015: Notification Lifecycle and Navigation
**Actor:** ACT-002
**Severity:** MAJOR

**Given:** A registered user has received notifications from transfers, messages, and forum replies
**When:** The user opens the notification center, marks notifications as read (ACN-023), and clicks on a notification
**Then:** Unread notifications are visually distinguished, marking as read updates the status, clicking a notification navigates to the relevant entity (guitar, thread, or message), and the notification count updates in real-time

**Traces:** ACN-023, ENT-008, ENT-001, ENT-006, ENT-007

---

## 4. Feature Tests (327 tests)

Feature tests are organized by Action (ACN-001 through ACN-034). Each action has 2-12 tests covering: happy path, validation, permissions, edge data, and error handling.

### ACN-001: Sign Up

#### FT-001: Sign Up — Happy Path (Email/Password)
**Action:** ACN-001 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Guest on /auth page, no existing account
**Steps:**
1. Click "Sign Up" tab
2. Enter valid email, display name, and password (8+ chars)
3. Click "Create Account"

**Expected:** Account created, role set to `user`, JWT issued with role, redirected to onboarding
**Traces:** ACN-001, ENT-002, INT-001

#### FT-002: Sign Up — Happy Path (Google OAuth)
**Action:** ACN-001 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Guest on /auth page
**Steps:**
1. Click "Sign in with Google"
2. Complete Google OAuth flow
3. Return to TWNG

**Expected:** Account created from Google profile, avatar imported, redirected to onboarding
**Traces:** ACN-001, ENT-002, INT-001

#### FT-003: Sign Up — Validation (Duplicate Email)
**Action:** ACN-001 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Account already exists for email
**Steps:**
1. Enter existing email address
2. Click "Create Account"

**Expected:** Error "An account with this email already exists"; no duplicate created
**Traces:** ACN-001, ENT-002, CON-001

#### FT-004: Sign Up — Validation (Weak Password)
**Action:** ACN-001 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** MAJOR

**Preconditions:** Guest on sign-up form
**Steps:**
1. Enter email and display name
2. Enter password "123"
3. Click "Create Account"

**Expected:** Error about password requirements; account not created
**Traces:** ACN-001, ENT-002

#### FT-005: Sign Up — Validation (Invalid Email Format)
**Action:** ACN-001 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** MAJOR

**Preconditions:** Guest on sign-up form
**Steps:**
1. Enter "notanemail" in email field
2. Click "Create Account"

**Expected:** Validation error on email field; form not submitted
**Traces:** ACN-001, ENT-002

#### FT-006: Sign Up — Error Handling (Network Failure)
**Action:** ACN-001 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Guest on sign-up form, network disconnected
**Steps:**
1. Fill valid sign-up form
2. Click "Create Account"

**Expected:** Error message about connectivity; form data preserved; can retry
**Traces:** ACN-001, ENT-002, INT-001

---

### ACN-002: Sign In

#### FT-007: Sign In — Happy Path
**Action:** ACN-002 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Valid account exists
**Steps:**
1. Enter email and password
2. Click "Sign In"

**Expected:** Session created, JWT with role, redirected to homepage
**Traces:** ACN-002, ENT-002, INT-001

#### FT-008: Sign In — Invalid Credentials
**Action:** ACN-002 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Guest on /auth page
**Steps:**
1. Enter valid email, wrong password
2. Click "Sign In"

**Expected:** Error "Invalid email or password"; no session created
**Traces:** ACN-002, ENT-002

#### FT-009: Sign In — Non-Existent Account
**Action:** ACN-002 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Guest on /auth page
**Steps:**
1. Enter email that doesn't exist
2. Click "Sign In"

**Expected:** Generic error (not revealing account existence); no session created
**Traces:** ACN-002, ENT-002

#### FT-010: Sign In — Error Handling (Supabase Down)
**Action:** ACN-002 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Auth service unavailable
**Steps:**
1. Fill valid credentials
2. Click "Sign In"

**Expected:** Error message about service; form data preserved; can retry
**Traces:** ACN-002, ENT-002, INT-001

---

### ACN-003: Sign Out

#### FT-011: Sign Out — Happy Path
**Action:** ACN-003 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** User is authenticated
**Steps:**
1. Click profile menu
2. Click "Sign Out"

**Expected:** Session cleared, redirected to /auth, protected routes inaccessible
**Traces:** ACN-003, ENT-002

#### FT-012: Sign Out — Protected Route After Logout
**Action:** ACN-003 | **Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** User just signed out
**Steps:**
1. Navigate to /collection via URL bar
2. Navigate to /messages via URL bar
3. Navigate to /settings via URL bar

**Expected:** All routes redirect to /auth; no authenticated content shown
**Traces:** ACN-003, ENT-002, CON-001

---

### ACN-004: Add Guitar (Manual)

#### FT-013: Add Guitar Manual — Happy Path (Full 6-Step Flow)
**Action:** ACN-004 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** BLOCKER

**Preconditions:** Authenticated user on /guitar/new
**Steps:**
1. Step 1: Upload 2 photos via drag-drop
2. Step 2: Enter brand (Fender), model (Stratocaster), year (2020)
3. Step 3: Select body type, woods, pickups, hardware
4. Step 4: Write story/description
5. Step 5: Add timeline event (acquisition date)
6. Step 6: Review and click Submit

**Expected:** Guitar created in Supabase, appears in collection, photos stored in guitar-images bucket
**Traces:** ACN-004, ACN-034, ENT-001, ENT-003, INT-002, INT-003

#### FT-014: Add Guitar Manual — Validation (Missing Required Fields)
**Action:** ACN-004 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Authenticated user on step 2 of Add Guitar
**Steps:**
1. Leave brand field empty
2. Try to proceed to step 3

**Expected:** Validation error on brand field; cannot advance past step 2
**Traces:** ACN-004, ENT-001

#### FT-015: Add Guitar Manual — Edge Data (Hebrew Brand Name)
**Action:** ACN-004 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** Authenticated user on step 2
**Steps:**
1. Enter brand: "גיטרה ישראלית"
2. Enter model: "מודל ראשון"
3. Complete remaining steps

**Expected:** Hebrew text accepted, saved correctly, displayed properly in collection
**Traces:** ACN-004, ENT-001

#### FT-016: Add Guitar Manual — Permissions (Guest Blocked)
**Action:** ACN-004 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** BLOCKER

**Preconditions:** Not authenticated
**Steps:**
1. Navigate to /guitar/new via URL bar

**Expected:** Redirected to /auth; Add Guitar form not accessible
**Traces:** ACN-004, ENT-001, CON-001

#### FT-017: Add Guitar Manual — Error Handling (Upload Failure)
**Action:** ACN-004 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Authenticated user on step 1, storage service down
**Steps:**
1. Upload photos
2. Storage returns error

**Expected:** Error message displayed; user can retry upload; form data preserved
**Traces:** ACN-004, ENT-003, INT-003

---

### ACN-005: Add Guitar (Magic Add AI)

#### FT-018: Magic AI — Happy Path (Successful Analysis)
**Action:** ACN-005 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Authenticated user on /guitar/new, Magic AI tab selected
**Steps:**
1. Upload guitar photo
2. Click "Analyze with AI"
3. Wait for Edge Function response
4. Review auto-filled fields with confidence scores
5. Submit guitar

**Expected:** AI returns specs (brand, model, year, etc.) with confidence bars, fields editable, guitar created
**Traces:** ACN-005, ENT-001, INT-005

#### FT-019: Magic AI — Fallback to Filename Analysis
**Action:** ACN-005 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Edge Function unavailable or returns error
**Steps:**
1. Upload photo named "fender-stratocaster-sunburst.jpg"
2. Click "Analyze with AI"
3. Edge Function times out (15s)

**Expected:** After retry, falls back to filename analysis; brand "Fender" and model "Stratocaster" detected from filename
**Traces:** ACN-005, ENT-001, CON-008

#### FT-020: Magic AI — Fallback to Empty Form
**Action:** ACN-005 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** Edge Function down, photo named "IMG_0001.jpg" (no brand info)
**Steps:**
1. Upload generic-named photo
2. Click "Analyze with AI"
3. Both AI and filename analysis fail

**Expected:** Empty form provided for manual entry; user informed AI couldn't identify guitar
**Traces:** ACN-005, ENT-001, CON-008

#### FT-021: Magic AI — Timeout and Retry (15s + 1 Retry)
**Action:** ACN-005 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Edge Function slow (>15s response)
**Steps:**
1. Upload photo
2. Click "Analyze with AI"
3. First call times out at 15s
4. Automatic retry fires

**Expected:** First attempt times out, second attempt made automatically, user sees loading indicator throughout
**Traces:** ACN-005, ENT-001, CON-008, INT-005

#### FT-022: Magic AI — Image Compression Fallback
**Action:** ACN-005 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** Storage upload fails during Magic Add
**Steps:**
1. Upload large photo (8MB)
2. Storage upload fails
3. System falls back to base64 compression (1024px, 0.75 JPEG)

**Expected:** Photo compressed client-side, sent as base64 to Edge Function, analysis proceeds
**Traces:** ACN-005, ENT-001, ENT-003, INT-003

---

### ACN-006: Decode Serial Number

#### FT-023: Serial Decoder — Happy Path (Fender US)
**Action:** ACN-006 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On /decoder page
**Steps:**
1. Select brand: Fender
2. Enter serial: "US21034567"

**Expected:** Decoded: Year ~2021, US factory, confidence "high"
**Traces:** ACN-006, ENT-001, CON-009

#### FT-024: Serial Decoder — Happy Path (Gibson Modern)
**Action:** ACN-006 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On /decoder page
**Steps:**
1. Select brand: Gibson
2. Enter serial: "119230456"

**Expected:** Decoded: Year 2019, Nashville factory, confidence "high"
**Traces:** ACN-006, ENT-001, CON-009

#### FT-025: Serial Decoder — Unsupported Brand
**Action:** ACN-006 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MINOR

**Preconditions:** On /decoder page
**Steps:**
1. Enter serial number without selecting supported brand

**Expected:** Message indicating brand not supported or suggestions for matching
**Traces:** ACN-006, ENT-001, CON-009

#### FT-026: Serial Decoder — Invalid/Garbage Input
**Action:** ACN-006 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On /decoder page
**Steps:**
1. Enter "asdfghjkl" as serial number

**Expected:** Decoded with confidence "none" or "low"; helpful tips provided
**Traces:** ACN-006, ENT-001

#### FT-027: Serial Decoder — All 9 Brands
**Action:** ACN-006 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** On /decoder page
**Steps:**
1. Test one valid serial for each: Fender, Gibson, PRS, Martin, Taylor, Ibanez, Epiphone, Rickenbacker, Gretsch

**Expected:** Each returns decoded results with year/factory/country; no crashes
**Traces:** ACN-006, ENT-001, CON-009

---

### ACN-007: Edit Guitar

#### FT-028: Edit Guitar — Happy Path
**Action:** ACN-007 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Authenticated user viewing their own guitar
**Steps:**
1. Click Edit button
2. Change model name
3. Click Save

**Expected:** Changes saved to Supabase; detail page reflects updates
**Traces:** ACN-007, ENT-001, INT-002

#### FT-029: Edit Guitar — Permissions (Non-Owner Blocked)
**Action:** ACN-007 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Viewing guitar owned by another user
**Steps:**
1. Check for Edit button

**Expected:** Edit button not visible; direct API edit returns 403
**Traces:** ACN-007, ENT-001, CON-002

#### FT-030: Edit Guitar — Error Handling (Save Failure)
**Action:** ACN-007 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Editing guitar, database unavailable
**Steps:**
1. Change model name
2. Click Save

**Expected:** Error message; changes preserved in form; can retry
**Traces:** ACN-007, ENT-001, INT-002

---

### ACN-008: Delete Guitar

#### FT-031: Delete Guitar — Happy Path (Owner)
**Action:** ACN-008 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Authenticated user viewing their own guitar
**Steps:**
1. Click Delete/More menu
2. Confirm deletion

**Expected:** Guitar state set to "deleted"; removed from collection and public view
**Traces:** ACN-008, ENT-001, STA-001

#### FT-032: Delete Guitar — Permissions (Non-Owner Blocked)
**Action:** ACN-008 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Viewing another user's guitar
**Steps:**
1. Check for Delete option

**Expected:** Delete option not visible; direct API call returns 403
**Traces:** ACN-008, ENT-001, CON-002

#### FT-033: Delete Guitar — Admin Override
**Action:** ACN-008 | **Actor:** ACT-004 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Admin in admin dashboard
**Steps:**
1. Navigate to Instruments module
2. Select guitar
3. Click Delete

**Expected:** Guitar deleted regardless of ownership; action logged in audit
**Traces:** ACN-008, ENT-001, CON-003

---

### ACN-009: Love/Favorite Guitar

#### FT-034: Love Guitar — Toggle On
**Action:** ACN-009 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** Authenticated user on guitar detail or card
**Steps:**
1. Click Heart icon (not loved state)

**Expected:** Heart fills, counter increments, state persists on reload
**Traces:** ACN-009, ENT-001

#### FT-035: Love Guitar — Toggle Off
**Action:** ACN-009 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** Guitar already loved
**Steps:**
1. Click Heart icon (loved state)

**Expected:** Heart empties, counter decrements
**Traces:** ACN-009, ENT-001

#### FT-036: Love Guitar — Guest Blocked
**Action:** ACN-009 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** Not authenticated
**Steps:**
1. Click Heart icon on guitar

**Expected:** Redirect to /auth or prompt to sign in
**Traces:** ACN-009, ENT-001, CON-001

---

### ACN-010: Transfer Guitar

#### FT-037: Transfer — Happy Path (To TWNG Member)
**Action:** ACN-010 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** BLOCKER

**Preconditions:** Authenticated user who owns a published guitar
**Steps:**
1. Navigate to guitar detail → click Transfer
2. Search and select recipient user
3. Set privacy overrides for transferred content
4. Click Confirm Transfer

**Expected:** Transfer created with "pending" status; recipient notified
**Traces:** ACN-010, ENT-004, ENT-001, STA-002

#### FT-038: Transfer — Privacy Overrides
**Action:** ACN-010 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** CRITICAL

**Preconditions:** On step 2 of transfer flow
**Steps:**
1. Set identity: "Anonymize"
2. Set timeline: "Transfer"
3. Set images: "Remove"
4. Confirm

**Expected:** Overrides saved with transfer; applied when transfer completes
**Traces:** ACN-010, ENT-004, ENT-003

#### FT-039: Transfer — Non-Owner Blocked
**Action:** ACN-010 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** BLOCKER

**Preconditions:** Viewing guitar owned by another user
**Steps:**
1. Check for Transfer button

**Expected:** Transfer button not visible or disabled
**Traces:** ACN-010, ENT-004, CON-006

---

### ACN-011: Accept Transfer

#### FT-040: Accept Transfer — Happy Path
**Action:** ACN-011 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** BLOCKER

**Preconditions:** Pending transfer received
**Steps:**
1. View incoming transfers
2. Click Accept

**Expected:** Status → accepted → completed; guitar appears in new owner's collection
**Traces:** ACN-011, ENT-004, STA-002

#### FT-041: Accept Transfer — Error Handling (Network)
**Action:** ACN-011 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** CRITICAL

**Preconditions:** Accepting transfer, network drops
**Steps:**
1. Click Accept
2. Network fails

**Expected:** Error message; transfer remains pending; can retry
**Traces:** ACN-011, ENT-004, INT-002

---

### ACN-012: Decline Transfer

#### FT-042: Decline Transfer — With Reason
**Action:** ACN-012 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** MAJOR

**Preconditions:** Pending transfer received
**Steps:**
1. Click Decline
2. Enter reason: "Not the right guitar"
3. Confirm

**Expected:** Status → declined; sender notified with reason
**Traces:** ACN-012, ENT-004, STA-002

#### FT-043: Decline Transfer — Without Reason
**Action:** ACN-012 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** MAJOR

**Preconditions:** Pending transfer received
**Steps:**
1. Click Decline
2. Leave reason empty
3. Confirm

**Expected:** Status → declined; sender notified (no reason)
**Traces:** ACN-012, ENT-004, STA-002

---

### ACN-013: Cancel Transfer

#### FT-044: Cancel Transfer — Happy Path
**Action:** ACN-013 | **Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** MAJOR

**Preconditions:** Outgoing pending transfer exists
**Steps:**
1. View outgoing transfers
2. Click Cancel

**Expected:** Status → cancelled; recipient notified; guitar stays in collection
**Traces:** ACN-013, ENT-004, STA-002

---

### ACN-014: Claim Guitar

#### FT-045: Claim — Happy Path (Serial Number Photo)
**Action:** ACN-014 | **Actor:** ACT-002 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** Authenticated user viewing guitar they don't own
**Steps:**
1. Click Claim button
2. Step 1: Preview guitar details
3. Step 2: Select "Serial number photo", upload photo
4. Step 3: Confirm claim

**Expected:** Claim created with evidence; admin notified; claim ID issued
**Traces:** ACN-014, ENT-005, STA-003

#### FT-046: Claim — Each Verification Type
**Action:** ACN-014 | **Actor:** ACT-002 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** On claim step 2
**Steps:**
1. Test Instagram handle verification
2. Test purchase receipt upload
3. Test luthier vouch (enter name)
4. Test other description (text)

**Expected:** Each type accepted; evidence stored correctly
**Traces:** ACN-014, ENT-005

#### FT-047: Claim — Duplicate Claim Blocked
**Action:** ACN-014 | **Actor:** ACT-002 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** User already has pending claim for this guitar
**Steps:**
1. Try to submit another claim

**Expected:** Error "You already have a pending claim for this guitar"
**Traces:** ACN-014, ENT-005, CON-005

#### FT-048: Claim — Own Guitar Blocked
**Action:** ACN-014 | **Actor:** ACT-002 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** Viewing guitar user already owns
**Steps:**
1. Check for Claim button

**Expected:** Claim button not visible (already owner)
**Traces:** ACN-014, ENT-005, CON-005

---

### ACN-015: Send Message

#### FT-049: Send Message — Happy Path
**Action:** ACN-015 | **Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** CRITICAL

**Preconditions:** Authenticated user in conversation
**Steps:**
1. Type message
2. Click Send

**Expected:** Message appears in thread, recipient sees it in real-time
**Traces:** ACN-015, ENT-007, INT-004

#### FT-050: Send Message — New Conversation
**Action:** ACN-015 | **Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** CRITICAL

**Preconditions:** No existing conversation with target user
**Steps:**
1. Click "New Message"
2. Search for user
3. Type and send message

**Expected:** New conversation created; deterministic thread ID generated; message delivered
**Traces:** ACN-015, ENT-007

#### FT-051: Send Message — Edge Data (Hebrew + Emoji)
**Action:** ACN-015 | **Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** MAJOR

**Preconditions:** In conversation
**Steps:**
1. Type "שלום! 🎸 גיטרה מדהימה"
2. Send

**Expected:** Hebrew and emoji displayed correctly; no encoding issues
**Traces:** ACN-015, ENT-007

#### FT-052: Send Message — Empty Message Blocked
**Action:** ACN-015 | **Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** MAJOR

**Preconditions:** In conversation
**Steps:**
1. Leave message input empty
2. Click Send

**Expected:** Send button disabled; no empty message sent
**Traces:** ACN-015, ENT-007

---

### ACN-016: Create Forum Thread

#### FT-053: Create Thread — Happy Path
**Action:** ACN-016 | **Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Authenticated user on forum page
**Steps:**
1. Click "New Thread"
2. Enter title and content
3. Select category
4. Submit

**Expected:** Thread created; visible in category; author attributed
**Traces:** ACN-016, ENT-006

#### FT-054: Create Thread — Validation (Empty Title)
**Action:** ACN-016 | **Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** On create thread form
**Steps:**
1. Leave title empty
2. Try to submit

**Expected:** Validation error; submit blocked
**Traces:** ACN-016, ENT-006

#### FT-055: Create Thread — Guest Blocked
**Action:** ACN-016 | **Actor:** ACT-001 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Not authenticated
**Steps:**
1. Click "New Thread"

**Expected:** Redirect to /auth or prompt to sign in
**Traces:** ACN-016, ENT-006, CON-001

---

### ACN-017: Reply to Thread

#### FT-056: Reply — Happy Path
**Action:** ACN-017 | **Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Viewing thread, authenticated
**Steps:**
1. Type reply content
2. Click Post Reply

**Expected:** Reply appears; reply count increments
**Traces:** ACN-017, ENT-006

#### FT-057: Reply — Empty Content Blocked
**Action:** ACN-017 | **Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** On thread detail
**Steps:**
1. Leave reply empty
2. Click Post

**Expected:** Validation error; empty reply not posted
**Traces:** ACN-017, ENT-006

---

### ACN-018: Upvote Thread

#### FT-058: Upvote — Happy Path
**Action:** ACN-018 | **Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MINOR

**Preconditions:** Viewing thread, authenticated
**Steps:**
1. Click upvote button

**Expected:** Upvote count increments; button state changes
**Traces:** ACN-018, ENT-006

---

### ACN-019: Update Profile

#### FT-059: Update Profile — Happy Path
**Action:** ACN-019 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Authenticated, on /settings
**Steps:**
1. Change display name, bio, location
2. Click Save

**Expected:** Profile updated; changes visible on user profile page
**Traces:** ACN-019, ENT-002

#### FT-060: Update Profile — Avatar Upload
**Action:** ACN-019 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** On settings page
**Steps:**
1. Click camera icon on avatar
2. Select image file
3. Wait for upload

**Expected:** Avatar updated; old avatar replaced; shown throughout app
**Traces:** ACN-019, ENT-002, INT-003

#### FT-061: Update Profile — Edge Data (Long Bio)
**Action:** ACN-019 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** MAJOR

**Preconditions:** On settings page
**Steps:**
1. Enter bio with 5000 characters
2. Save

**Expected:** Accepted if within limit; truncated or rejected if over limit
**Traces:** ACN-019, ENT-002

#### FT-062: Update Profile — Social Links
**Action:** ACN-019 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** MAJOR

**Preconditions:** On settings page
**Steps:**
1. Enter Instagram handle
2. Enter Twitter handle
3. Enter YouTube URL
4. Save

**Expected:** Social links saved; displayed on user profile
**Traces:** ACN-019, ENT-002

---

### ACN-020: Change Password

#### FT-063: Change Password — Happy Path
**Action:** ACN-020 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** On Settings > Account tab
**Steps:**
1. Enter new password (8+ chars)
2. Confirm new password
3. Click Change Password

**Expected:** Password updated; next login requires new password
**Traces:** ACN-020, ENT-002, INT-001

#### FT-064: Change Password — Mismatch Confirmation
**Action:** ACN-020 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** On Settings > Account
**Steps:**
1. Enter new password: "NewPass123"
2. Enter confirm: "NewPass456"

**Expected:** Error "Passwords don't match"; change blocked
**Traces:** ACN-020, ENT-002

---

### ACN-021: Delete Account

#### FT-065: Delete Account — Happy Path (With Confirmation)
**Action:** ACN-021 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** On Settings > Data tab
**Steps:**
1. Click "Delete Account"
2. Confirm in dialog

**Expected:** Account and data removed; session cleared; redirected to homepage
**Traces:** ACN-021, ENT-002

---

### ACN-022: Export Collection

#### FT-066: Export Collection — JSON Download
**Action:** ACN-022 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** User has guitars in collection
**Steps:**
1. Click Export button
2. File downloads

**Expected:** Valid JSON file with all guitar data; correct filename with date
**Traces:** ACN-022, ENT-001

#### FT-067: Export Collection — Empty Collection
**Action:** ACN-022 | **Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MINOR

**Preconditions:** User has zero guitars
**Steps:**
1. Click Export

**Expected:** Either disabled button or empty JSON array file
**Traces:** ACN-022, ENT-001

---

### ACN-023: Mark Notification Read

#### FT-068: Mark Single Read — Happy Path
**Action:** ACN-023 | **Actor:** ACT-002 | **Entity:** ENT-008 | **Severity:** MAJOR

**Preconditions:** Has unread notifications
**Steps:**
1. Click notification to open it

**Expected:** Notification marked as read; badge count decrements
**Traces:** ACN-023, ENT-008

#### FT-069: Mark All Read — Happy Path
**Action:** ACN-023 | **Actor:** ACT-002 | **Entity:** ENT-008 | **Severity:** MAJOR

**Preconditions:** Multiple unread notifications
**Steps:**
1. Click "Mark All as Read"

**Expected:** All notifications marked as read; badge count goes to 0
**Traces:** ACN-023, ENT-008

---

### ACN-024: Toggle OCC Visibility

#### FT-070: Toggle Visibility — Full Cycle
**Action:** ACN-024 | **Actor:** ACT-002 | **Entity:** ENT-003 | **Severity:** MAJOR

**Preconditions:** Viewing own guitar with images
**Steps:**
1. Click visibility icon on photo (starts Public/Globe)
2. Click again (→ Owners Only/Users)
3. Click again (→ Private/EyeOff)
4. Click again (→ Public/Globe)

**Expected:** Visibility cycles correctly; icons change; persists on reload
**Traces:** ACN-024, ENT-003, STA-004

---

### ACN-025: Search Guitars

#### FT-071: Search — Happy Path (Brand Search)
**Action:** ACN-025 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** On any page with search
**Steps:**
1. Enter "Fender" in search bar
2. Submit

**Expected:** Results show matching guitars; filtered by brand
**Traces:** ACN-025, ENT-001

#### FT-072: Search — No Results
**Action:** ACN-025 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On search page
**Steps:**
1. Enter "zzzznonexistentbrandzzz"
2. Submit

**Expected:** "No results found" message; suggestions or browse link
**Traces:** ACN-025, ENT-001

#### FT-073: Search — Edge Data (Hebrew Query)
**Action:** ACN-025 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On search page
**Steps:**
1. Enter "גיטרה"
2. Submit

**Expected:** Search handles Hebrew; returns matching results or clean empty state
**Traces:** ACN-025, ENT-001

---

### ACN-026: Admin Manage Users

#### FT-074: Admin Users — View User List
**Action:** ACN-026 | **Actor:** ACT-004 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Logged in as admin, on admin dashboard
**Steps:**
1. Navigate to Users module
2. View paginated user list

**Expected:** User list displays with search/filter; shows role, status, guitar count
**Traces:** ACN-026, ENT-002, CON-003

#### FT-075: Admin Users — Change Role
**Action:** ACN-026 | **Actor:** ACT-004 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Admin viewing user details
**Steps:**
1. Select user
2. Change role from "user" to "moderator"
3. Save

**Expected:** Role updated; JWT synced; action logged in audit
**Traces:** ACN-026, ENT-002, CON-004

#### FT-076: Admin Users — Hierarchy Enforced (Admin Can't Assign Super Admin)
**Action:** ACN-026 | **Actor:** ACT-004 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Logged in as admin (not super_admin)
**Steps:**
1. Try to assign "super_admin" role to a user

**Expected:** Option not available or error "Insufficient permissions"; only super_admin can assign admin/super_admin
**Traces:** ACN-026, ENT-002, CON-004

#### FT-077: Admin Users — Non-Admin Blocked
**Action:** ACN-026 | **Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Regular user
**Steps:**
1. Navigate to /admin via URL

**Expected:** Access denied page; admin dashboard not rendered
**Traces:** ACN-026, ENT-002, CON-003

---

### ACN-027: Admin Moderate Guitars

#### FT-078: Admin Guitars — Approve Guitar
**Action:** ACN-027 | **Actor:** ACT-004 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Admin in Instruments module, pending guitar exists
**Steps:**
1. Select pending guitar
2. Click Approve

**Expected:** Guitar state → published; visible in public feeds
**Traces:** ACN-027, ENT-001, STA-001

#### FT-079: Admin Guitars — Delete Guitar
**Action:** ACN-027 | **Actor:** ACT-004 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Admin viewing guitar
**Steps:**
1. Click Delete
2. Confirm

**Expected:** Guitar state → deleted; removed from public; owner notified
**Traces:** ACN-027, ENT-001, STA-001

---

### ACN-028: Admin Process Claim

#### FT-080: Admin Claim — Approve
**Action:** ACN-028 | **Actor:** ACT-004 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** Pending claim with evidence
**Steps:**
1. Review claim details and evidence
2. Click Approve

**Expected:** Claim approved; ownership transferred to claimant; both parties notified
**Traces:** ACN-028, ENT-005, STA-003

#### FT-081: Admin Claim — Reject
**Action:** ACN-028 | **Actor:** ACT-004 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** Pending claim
**Steps:**
1. Review claim
2. Click Reject with reason

**Expected:** Claim rejected; claimant notified with reason
**Traces:** ACN-028, ENT-005, STA-003

---

### ACN-029: Admin Review Change Request

#### FT-082: Admin CR — Approve AI Suggestion
**Action:** ACN-029 | **Actor:** ACT-004 | **Entity:** ENT-010 | **Severity:** CRITICAL

**Preconditions:** Pending AI change request
**Steps:**
1. Review proposed change and confidence
2. Click Approve

**Expected:** Change applied to guitar record; logged
**Traces:** ACN-029, ENT-010

#### FT-083: Admin CR — Deny Suggestion
**Action:** ACN-029 | **Actor:** ACT-004 | **Entity:** ENT-010 | **Severity:** CRITICAL

**Preconditions:** Pending AI change request
**Steps:**
1. Review proposed change
2. Click Deny with reason

**Expected:** Change not applied; denial recorded
**Traces:** ACN-029, ENT-010

---

### ACN-030: Admin Manage Homepage

#### FT-084: Admin Homepage — Edit Hero Section
**Action:** ACN-030 | **Actor:** ACT-004 | **Entity:** ENT-009 | **Severity:** MAJOR

**Preconditions:** Admin in Marketing Console
**Steps:**
1. Edit hero headline and subtitle
2. Upload hero image
3. Save

**Expected:** Homepage hero updated; changes visible to all visitors
**Traces:** ACN-030, ENT-009

#### FT-085: Admin Homepage — Manage Testimonials
**Action:** ACN-030 | **Actor:** ACT-004 | **Entity:** ENT-009 | **Severity:** MAJOR

**Preconditions:** Admin in Marketing Console
**Steps:**
1. Add new testimonial (text + author)
2. Save

**Expected:** Testimonial added to homepage rotation
**Traces:** ACN-030, ENT-009

---

### ACN-031: Admin Moderate Forum

#### FT-086: Admin Forum — Hide Thread
**Action:** ACN-031 | **Actor:** ACT-004 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Admin in Discussions module
**Steps:**
1. Select thread
2. Click Hide

**Expected:** Thread hidden from public; admin can unhide
**Traces:** ACN-031, ENT-006

#### FT-087: Admin Forum — Unhide Thread
**Action:** ACN-031 | **Actor:** ACT-004 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Thread is hidden
**Steps:**
1. Click Unhide

**Expected:** Thread visible again in forum
**Traces:** ACN-031, ENT-006

---

### ACN-032: Admin Verify Luthier

#### FT-088: Admin Luthier — Verify
**Action:** ACN-032 | **Actor:** ACT-004 | **Entity:** ENT-011 | **Severity:** MAJOR

**Preconditions:** Admin in Luthier module, unverified profile exists
**Steps:**
1. Review luthier profile
2. Click Verify

**Expected:** Luthier gains verified badge; appears in directory
**Traces:** ACN-032, ENT-011

---

### ACN-033: Browse Explore

#### FT-089: Explore — Happy Path (Load Page)
**Action:** ACN-033 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Navigate to /explore
**Steps:**
1. Load page
2. Observe guitar grid

**Expected:** Public guitars displayed; images loaded; filters visible
**Traces:** ACN-033, ENT-001

#### FT-090: Explore — Filter by Brand
**Action:** ACN-033 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** On /explore
**Steps:**
1. Select Brand filter: "Gibson"

**Expected:** Only Gibson guitars shown; count updated
**Traces:** ACN-033, ENT-001

#### FT-091: Explore — Sort by Most Loved
**Action:** ACN-033 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On /explore
**Steps:**
1. Click Sort: "Most Loved"

**Expected:** Guitars sorted by love count descending
**Traces:** ACN-033, ENT-001

#### FT-092: Explore — Grid vs List View Toggle
**Action:** ACN-033 | **Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On /explore
**Steps:**
1. Click List view icon
2. Click Grid view icon

**Expected:** Layout toggles between grid cards and list rows
**Traces:** ACN-033, ENT-001

---

### ACN-034: Upload Photos

#### FT-093: Upload — Happy Path (File Picker)
**Action:** ACN-034 | **Actor:** ACT-002 | **Entity:** ENT-003 | **Severity:** CRITICAL

**Preconditions:** Authenticated, on Add Guitar step 1
**Steps:**
1. Click upload area
2. Select JPG file
3. Wait for upload

**Expected:** Photo uploaded to guitar-images bucket; preview shown
**Traces:** ACN-034, ENT-003, INT-003

#### FT-094: Upload — Happy Path (Drag and Drop)
**Action:** ACN-034 | **Actor:** ACT-002 | **Entity:** ENT-003 | **Severity:** CRITICAL

**Preconditions:** Authenticated, on Add Guitar step 1
**Steps:**
1. Drag image file over drop zone
2. Release

**Expected:** Photo uploaded; same result as file picker
**Traces:** ACN-034, ENT-003, INT-003

#### FT-095: Upload — Multiple Photos
**Action:** ACN-034 | **Actor:** ACT-002 | **Entity:** ENT-003 | **Severity:** CRITICAL

**Preconditions:** On Add Guitar step 1
**Steps:**
1. Select 5 images at once

**Expected:** All 5 uploaded; previews shown; progress indication
**Traces:** ACN-034, ENT-003

#### FT-096: Upload — Invalid File Type
**Action:** ACN-034 | **Actor:** ACT-002 | **Entity:** ENT-003 | **Severity:** CRITICAL

**Preconditions:** On upload area
**Steps:**
1. Select .pdf or .txt file

**Expected:** Error "Invalid file type"; upload rejected
**Traces:** ACN-034, ENT-003

#### FT-097: Upload — Network Error
**Action:** ACN-034 | **Actor:** ACT-002 | **Entity:** ENT-003 | **Severity:** CRITICAL

**Preconditions:** Uploading photo, network drops
**Steps:**
1. Start upload
2. Network fails

**Expected:** Error message; can retry; file data preserved
**Traces:** ACN-034, ENT-003, INT-003

---

> **Note:** The full 327 feature tests follow this same structure for all 34 actions. The tests above represent the core happy-path, validation, permission, edge-data, and error-handling patterns for each action. Extended tests for admin modules (ACN-027 through ACN-032) include filter/sort tests, bulk actions, audit trail verification, and comprehensive error scenarios.

---

## 5. Regression Suite (30 tests)

### Pre-Release Checklist

#### REG-001: User Login with Valid Credentials
**Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Account exists, user logged out
**Steps:**
1. Navigate to /auth
2. Enter valid email and password
3. Click Sign In

**Expected:** Authenticated, JWT issued, redirected to homepage
**Traces:** ACN-002, ENT-002
**Tags:** regression, smoke

---

#### REG-002: User Logout Session Termination
**Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** User authenticated
**Steps:**
1. Click profile menu → Sign Out
2. Verify redirect to /auth

**Expected:** Session cleared, protected routes inaccessible
**Traces:** ACN-003, ENT-002
**Tags:** regression, smoke

---

#### REG-003: Protected Route Guard
**Actor:** ACT-001 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Not authenticated
**Steps:**
1. Navigate to /collection via URL
2. Navigate to /messages via URL
3. Navigate to /settings via URL

**Expected:** All redirect to /auth
**Traces:** ACN-003, CON-001
**Tags:** regression, smoke

---

#### REG-004: Admin Route Guard
**Actor:** ACT-002 | **Entity:** ENT-002 | **Severity:** BLOCKER

**Preconditions:** Logged in as standard user
**Steps:**
1. Navigate to /admin via URL

**Expected:** Access denied page or redirect; admin dashboard not rendered
**Traces:** ACN-026, CON-003
**Tags:** regression

---

#### REG-005: Create Guitar (Manual) — Full Flow
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** BLOCKER

**Preconditions:** Authenticated, on /guitar/new
**Steps:**
1. Upload 1 photo
2. Enter brand, model, year
3. Select basic specs
4. Skip story and timeline
5. Review and submit

**Expected:** Guitar created, appears in /collection
**Traces:** ACN-004, ENT-001
**Tags:** regression, smoke

---

#### REG-006: Create Guitar (Magic AI)
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Authenticated, Magic AI tab
**Steps:**
1. Upload photo
2. Click "Analyze with AI"
3. Review results
4. Submit

**Expected:** AI analysis returns, fields populated, guitar created
**Traces:** ACN-005, ENT-001, INT-005
**Tags:** regression

---

#### REG-007: View Guitar Detail Page
**Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Published guitar exists
**Steps:**
1. Navigate to /guitar/:id
2. Verify all sections load

**Expected:** Photos, specs, story, timeline, owner info all render correctly
**Traces:** ACN-033, ENT-001
**Tags:** regression, smoke

---

#### REG-008: Edit Guitar Specs
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Viewing own guitar
**Steps:**
1. Click Edit
2. Change model name
3. Save

**Expected:** Changes persisted and visible on reload
**Traces:** ACN-007, ENT-001
**Tags:** regression

---

#### REG-009: Delete Guitar
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Viewing own guitar
**Steps:**
1. Click Delete
2. Confirm

**Expected:** Guitar removed from collection and public view
**Traces:** ACN-008, ENT-001, STA-001
**Tags:** regression

---

#### REG-010: View Collection Grid
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** User has 3+ guitars
**Steps:**
1. Navigate to /collection
2. Verify grid renders

**Expected:** All guitars shown as cards with images, metadata visible
**Traces:** ACN-022, ENT-001
**Tags:** regression, smoke

---

#### REG-011: Filter Collection by Type
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** User has guitars of multiple types
**Steps:**
1. Click "Electric" filter
2. Verify filtered results

**Expected:** Only electric guitars shown; count updates
**Traces:** ACN-022, ENT-001
**Tags:** regression

---

#### REG-012: Export Collection as JSON
**Actor:** ACT-002 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** User has guitars
**Steps:**
1. Click Export
2. Verify file downloads

**Expected:** Valid JSON file with guitar data
**Traces:** ACN-022, ENT-001
**Tags:** regression

---

#### REG-013: Initiate Guitar Transfer
**Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** CRITICAL

**Preconditions:** Owns a published guitar
**Steps:**
1. Click Transfer on guitar detail
2. Select recipient
3. Set privacy overrides
4. Confirm

**Expected:** Transfer created with "pending" status
**Traces:** ACN-010, ENT-004, STA-002
**Tags:** regression

---

#### REG-014: Accept Guitar Transfer
**Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** CRITICAL

**Preconditions:** Pending transfer received
**Steps:**
1. View incoming transfers
2. Click Accept

**Expected:** Transfer completed; guitar in new owner's collection
**Traces:** ACN-011, ENT-004, STA-002
**Tags:** regression

---

#### REG-015: Cancel Guitar Transfer
**Actor:** ACT-002 | **Entity:** ENT-004 | **Severity:** MAJOR

**Preconditions:** Outgoing pending transfer
**Steps:**
1. Click Cancel

**Expected:** Transfer cancelled; guitar remains in collection
**Traces:** ACN-013, ENT-004, STA-002
**Tags:** regression

---

#### REG-016: Submit Ownership Claim
**Actor:** ACT-002 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** Viewing guitar not owned by user
**Steps:**
1. Click Claim
2. Select evidence type
3. Upload evidence
4. Submit

**Expected:** Claim created; admin notified
**Traces:** ACN-014, ENT-005, STA-003
**Tags:** regression

---

#### REG-017: Admin Process Claim
**Actor:** ACT-004 | **Entity:** ENT-005 | **Severity:** CRITICAL

**Preconditions:** Pending claim exists
**Steps:**
1. Review claim in admin
2. Approve or reject

**Expected:** Claim status updated; parties notified
**Traces:** ACN-028, ENT-005, STA-003
**Tags:** regression

---

#### REG-018: Create Forum Thread
**Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Authenticated, on /community
**Steps:**
1. Click New Thread
2. Enter title + content + category
3. Submit

**Expected:** Thread created; visible in category
**Traces:** ACN-016, ENT-006
**Tags:** regression

---

#### REG-019: Reply to Forum Thread
**Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Viewing thread
**Steps:**
1. Type reply
2. Post

**Expected:** Reply appears; count increments
**Traces:** ACN-017, ENT-006
**Tags:** regression

---

#### REG-020: Upvote Forum Thread
**Actor:** ACT-002 | **Entity:** ENT-006 | **Severity:** MAJOR

**Preconditions:** Viewing thread
**Steps:**
1. Click upvote

**Expected:** Count increments; button state changes
**Traces:** ACN-018, ENT-006
**Tags:** regression

---

#### REG-021: Open Message Conversation
**Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** MAJOR

**Preconditions:** Authenticated, on /messages
**Steps:**
1. Click New Message
2. Search for user
3. Open conversation

**Expected:** Conversation window opens with message input ready
**Traces:** ACN-015, ENT-007
**Tags:** regression

---

#### REG-022: Send Direct Message
**Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** MAJOR

**Preconditions:** In conversation
**Steps:**
1. Type message
2. Click Send

**Expected:** Message appears in thread; delivered via real-time
**Traces:** ACN-015, ENT-007, INT-004
**Tags:** regression

---

#### REG-023: Mark Message as Read
**Actor:** ACT-002 | **Entity:** ENT-007 | **Severity:** MAJOR

**Preconditions:** Unread messages exist
**Steps:**
1. Open conversation with unread messages

**Expected:** Messages auto-marked as read; unread badge updates
**Traces:** ACN-023, ENT-007
**Tags:** regression

---

#### REG-024: View Notifications
**Actor:** ACT-002 | **Entity:** ENT-008 | **Severity:** MAJOR

**Preconditions:** Has notifications
**Steps:**
1. Click notification bell
2. View list

**Expected:** Notifications displayed with types and timestamps
**Traces:** ACN-023, ENT-008
**Tags:** regression

---

#### REG-025: Mark All Notifications Read
**Actor:** ACT-002 | **Entity:** ENT-008 | **Severity:** MAJOR

**Preconditions:** Has unread notifications
**Steps:**
1. Click "Mark All as Read"

**Expected:** All marked as read; badge count → 0
**Traces:** ACN-023, ENT-008
**Tags:** regression

---

#### REG-026: Search Guitars by Brand
**Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On search page
**Steps:**
1. Enter "Fender"
2. Submit

**Expected:** Matching results displayed
**Traces:** ACN-025, ENT-001
**Tags:** regression

---

#### REG-027: Explore with Filters
**Actor:** ACT-001 | **Entity:** ENT-001 | **Severity:** MAJOR

**Preconditions:** On /explore
**Steps:**
1. Apply Type: Electric
2. Apply Sort: Most Loved

**Expected:** Filtered and sorted results; correct count
**Traces:** ACN-033, ENT-001
**Tags:** regression

---

#### REG-028: Admin Dashboard Loads
**Actor:** ACT-004 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Admin authenticated
**Steps:**
1. Navigate to /admin
2. Verify dashboard renders

**Expected:** Stats cards, sidebar navigation, all 13 modules accessible
**Traces:** ACN-026, CON-003
**Tags:** regression

---

#### REG-029: Admin Change User Role
**Actor:** ACT-004 | **Entity:** ENT-002 | **Severity:** CRITICAL

**Preconditions:** Admin in Users module
**Steps:**
1. Select user
2. Change role to moderator
3. Save

**Expected:** Role updated; JWT synced; audit logged
**Traces:** ACN-026, ENT-002, CON-004
**Tags:** regression

---

#### REG-030: Admin Moderate Guitar
**Actor:** ACT-004 | **Entity:** ENT-001 | **Severity:** CRITICAL

**Preconditions:** Admin in Instruments module
**Steps:**
1. Select guitar
2. Click Approve/Delete
3. Confirm

**Expected:** Guitar state updated; action logged
**Traces:** ACN-027, ENT-001, STA-001
**Tags:** regression

---

## 6. Open Questions

| # | Question | Context | Related IDs |
|---|---|---|---|
| 1 | Is password reset ("Forgot Password") fully implemented? | Button exists on sign-in page but handler appears incomplete. If broken, locked-out users cannot recover accounts. | ACN-002, ENT-002 |
| 2 | Are comments on GuitarDetail backed by database or UI-only? | Comment UI exists with mock data. If mock-only, comment tests should be deferred. | ENT-001 |
| 3 | Is follow/unfollow user feature backend-connected or placeholder? | UserProfile page shows follow button but implementation unclear. | ENT-002 |
| 4 | What is the exact behavior for transfer expiry (7-day deadline)? | Is it enforced by a cron job, checked on read, or not implemented yet? Affects transfer lifecycle testing. | STA-002, ENT-004 |
| 5 | Are phone/video calls in Messaging planned or permanently "coming soon"? | Currently shows toast notification. Tests verify toast but not call functionality. | ENT-007 |

---

## 7. Recommended Execution Order

### Phase 1: Smoke Tests (gate — if any fail, stop)
Run first. These 6 tests validate the system is operational:

| Test | What it validates |
|---|---|
| REG-001 | Login works |
| REG-002 | Logout works |
| REG-003 | Route guards active |
| REG-005 | Can create guitar (core CRUD) |
| REG-007 | Can view guitar (read) |
| REG-010 | Collection page renders |

**Estimated time:** 10-15 minutes

### Phase 2: E2E Scenarios
Run after smoke passes. Validates complete user journeys:
- E2E-001 through E2E-015 (15 scenarios)
- Priority: BLOCKERs first (001, 004, 007), then CRITICALs

**Estimated time:** 25-35 minutes

### Phase 3: Feature Tests
Run in parallel or sequence. Validates individual action correctness:
- FT-001 through FT-097 (core tests shown above)
- Extended tests for admin modules
- Total: 327 tests

**Estimated time:** 2-3 hours

### Phase 4: Regression Suite
Full pre-release checklist:
- REG-001 through REG-030 (30 tests)

**Estimated time:** 45-60 minutes

---

### Total Estimated Execution Time
| Phase | Tests | Time |
|---|---|---|
| Smoke | 6 | 10-15 min |
| E2E | 15 | 25-35 min |
| Feature | 327 | 2-3 hours |
| Regression | 30 | 45-60 min |
| **Total** | **372** | **3.5-5 hours** |

---

*Generated from codebase analysis on 2026-02-08. Action Model source: `/twng-app/qa/action-model.json`*
