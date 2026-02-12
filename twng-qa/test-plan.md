# תוכנית QA בדיקה - TWNG (The Witness NG) - Platform תיעוד גיטרות

---

## 1. סיכום

**היישום**: TWNG - פלטפורמת תיעוד, קהילה, ואימות בעלות גיטרות.

**כתובת**: https://shiny-muffin-21f968.netlify.app

**Stack טכנולוגי**: React + Supabase + Netlify

**תחום בדיקה**:
- Authentication flows (Sign up, Sign in, Google OAuth, Sign out, Password reset)
- Instrument management (CRUD operations, serialization, metadata)
- Ownership verification system (claims, approvals, transfers)
- Community features (Collections, Articles, Forum, Direct Messaging)
- User profiles and favorites management
- Admin console and content moderation
- Data integrity and state transitions

**טווח בדיקה**: פיצ'רים ברמה:
- Unit (Auth validation, Input sanitization)
- Integration (Supabase queries, OAuth flow)
- End-to-End (Full user journeys)
- Regression (Stability before release)

**סביבות בדיקה**:
- Development/Staging: https://shiny-muffin-21f968.netlify.app
- Database: Supabase (PostgreSQL)

---

## 2. Action Model - טבלה מובנית

### 2.1 Actors (משתמשים)

| ID | שם | תיאור | הרשאות |
|----|----|--------|----------|
| ACT-001 | Guest | משתמש לא מאומת | Browse only - קריאת instruments, articles, forum threads |
| ACT-002 | Registered User | משתמש רשום ומחובר | Create/edit/delete own content, claim ownership, messaging |
| ACT-003 | Admin | מנהל מערכת | Approve/reject claims, manage content, moderation, KPI dashboard |

### 2.2 Entities (ישויות)

| ID | שם | שדות עיקריים | מטא-נתונים |
|----|----|----|-----------|
| ENT-001 | Instruments | make, model, year, serial, photos, owner, condition | created_at, updated_at, view_count |
| ENT-002 | Articles | title, content, excerpt, status (draft/published), views, likes | author_id, published_at, category |
| ENT-003 | Collections | name, description, instruments[], public/private flag | owner_id, created_at, share_token |
| ENT-004 | Users/Profiles | username, email, avatar_url, bio, role, verified_badge | email_verified, created_at, last_login |
| ENT-005 | Ownership Claims | instrument_id, claimant_id, status (pending/approved/rejected), proof_url | created_at, reviewed_at, reviewer_id |
| ENT-006 | Ownership Transfers | instrument_id, from_owner_id, to_owner_id, status (pending/accepted/completed/rejected) | initiated_at, accepted_at, completed_at |
| ENT-007 | Forum Threads | title, content, category, pinned flag, locked flag, reply_count | author_id, created_at, last_reply_at |
| ENT-008 | Forum Posts/Replies | thread_id, content, author_id | created_at, edited_at, like_count |
| ENT-009 | Messages | from_id, to_id, content, read flag | created_at, read_at |
| ENT-010 | User Favorites | user_id, instrument_id | created_at |
| ENT-011 | Attribute History | instrument_id, field_name, old_value, new_value, changed_by | changed_at, status (pending/approved) |

### 2.3 Key Actions (פעולות עיקריות)

| ID | שם | קטגוריה | Actor | ישויות משפיעות | State Transition |
|----|----|----|-------|----------------|-----------------|
| ACN-001 | Sign up | Authentication | ACT-001 | ENT-004 | - → Registered |
| ACN-002 | Sign in | Authentication | ACT-001 | ENT-004 | Guest → Logged in |
| ACN-003 | Sign in with Google | Authentication | ACT-001 | ENT-004 | Guest → Logged in (OAuth) |
| ACN-004 | Sign out | Authentication | ACT-002 | ENT-004 | Logged in → Guest |
| ACN-005 | Reset password | Authentication | ACT-001 | ENT-004 | - |
| ACN-006 | Add instrument | Inventory | ACT-002 | ENT-001 | - → Created |
| ACN-007 | View instrument | Inventory | ACT-001 | ENT-001 | - |
| ACN-008 | Edit instrument | Inventory | ACT-002 | ENT-001, ENT-011 | Published → Modified |
| ACN-009 | Delete instrument | Inventory | ACT-002 | ENT-001 | Published → Soft deleted |
| ACN-010 | Search/filter instruments | Discovery | ACT-001 | ENT-001 | - |
| ACN-011 | Decode serial number | Discovery | ACT-001 | ENT-001 | - |
| ACN-012 | Claim ownership | Ownership | ACT-002 | ENT-005 | - → Pending |
| ACN-013 | Admin approve/reject claim | Ownership | ACT-003 | ENT-005 | Pending → Approved/Rejected |
| ACN-014 | Initiate transfer | Ownership | ACT-002 | ENT-006 | - → Pending |
| ACN-015 | Accept/reject transfer | Ownership | ACT-002 | ENT-006 | Pending → Accepted/Rejected |
| ACN-016 | Complete transfer | Ownership | ACT-003 | ENT-006 | Accepted → Completed |
| ACN-017 | Create collection | Collections | ACT-002 | ENT-003 | - → Created |
| ACN-018 | Add instrument to collection | Collections | ACT-002 | ENT-003 | - |
| ACN-019 | Edit/delete collection | Collections | ACT-002 | ENT-003 | Published → Modified/Deleted |
| ACN-020 | Write article | Content | ACT-002 | ENT-002 | - → Draft |
| ACN-021 | Publish/draft article | Content | ACT-002 | ENT-002 | Draft → Published / Published → Draft |
| ACN-022 | Like article | Content | ACT-002 | ENT-002 | - |
| ACN-023 | Create forum thread | Community | ACT-002 | ENT-007 | - → Created |
| ACN-024 | Reply to thread | Community | ACT-002 | ENT-008 | - |
| ACN-025 | Pin/lock thread | Community | ACT-003 | ENT-007 | - |
| ACN-026 | Send message | Messaging | ACT-002 | ENT-009 | - |
| ACN-027 | Add/remove favorite | Bookmarks | ACT-002 | ENT-010 | - |
| ACN-028 | Edit profile | Profile | ACT-002 | ENT-004 | - |
| ACN-029 | Admin: manage users/content | Admin | ACT-003 | ENT-004, ENT-002, ENT-006 | - |
| ACN-030 | Admin: view KPI dashboard | Admin | ACT-003 | All entities | - |

---

## 3. תרחישי E2E (End-to-End)

### E2E-001: New User Registration → Add First Instrument → Claim Ownership

**Severity**: CRITICAL | **Actor**: ACT-001 (Guest)

**Given**:
- User is on TWNG homepage as guest
- Email "newuser@example.com" does not exist in system
- Database is in clean state

**When**:
1. User clicks "Sign Up"
2. Enters email "newuser@example.com", password "SecurePass123!"
3. Clicks "Create Account"
4. Verifies email (if required)
5. Redirects to dashboard
6. User clicks "Add Instrument"
7. Enters: make="Fender", model="Stratocaster", year=1965, serial="S123456"
8. Uploads instrument photo
9. Clicks "Save Instrument"
10. Clicks "Claim Ownership" on instrument detail
11. Uploads ownership proof (photo/document)
12. Clicks "Submit Claim"

**Then**:
- User account created with role="user"
- User logged in automatically
- Instrument appears in user's inventory with owner_id set
- Instrument added to personal collection
- Ownership claim created with status="pending"
- Email notification sent to admin for review
- User sees "Claim pending approval" message

**Traces**: ACN-001, ACN-006, ACN-007, ACN-012, ENT-001, ENT-004, ENT-005

---

### E2E-002: Google OAuth Sign-up → Browse Explore → Add Instrument

**Severity**: HIGH | **Actor**: ACT-001 (Guest)

**Given**:
- User has valid Google account
- TWNG has Google OAuth configured (redirect_uri correct)
- User is on TWNG homepage

**When**:
1. User clicks "Sign up with Google"
2. Google OAuth flow completes
3. User returns to TWNG with access token
4. Email verified automatically (from Google)
5. User navigates to "Explore" page
6. Filters instruments by make="Gibson"
7. Clicks on first instrument
8. Views instrument detail page with owner info
9. Clicks back to list, filters by year range [1970-1980]
10. User clicks "Add Instrument" button
11. Enters: make="Gibson", model="Les Paul", year=1975, serial="S1975001"
12. Saves instrument

**Then**:
- Google OAuth account linked to new TWNG user
- Email auto-verified
- User logged in and redirected to dashboard
- Explore page loads with correct filters applied
- Instrument list filtered correctly
- New instrument created with owner_id = current user
- Instrument visible in user's personal inventory

**Traces**: ACN-003, ACN-007, ACN-010, ACN-006, ENT-001, ENT-004

---

### E2E-003: User Creates Collection → Adds Instruments → Shares Publicly

**Severity**: HIGH | **Actor**: ACT-002 (Registered User)

**Given**:
- User is logged in
- User has 5+ instruments in inventory
- User has no existing public collections

**When**:
1. User navigates to "My Collections"
2. Clicks "Create Collection"
3. Enters: name="Vintage Strats Collection", description="My classic Stratocasters from the 70s-80s"
4. Sets visibility to "Public"
5. Clicks "Create"
6. On collection detail page, clicks "Add Instrument"
7. Selects 3 instruments from dropdown
8. Clicks "Save Collection"
9. Collection URL is shared with friend (external link)
10. Friend (guest) opens the link

**Then**:
- Collection created with owner_id = current user, public=true
- Instruments added to collection (many-to-many relationship)
- Collection detail page displays all 3 instruments with metadata
- Public share link is shareable and works for guests
- Guest can view collection contents but cannot edit
- Collection indexed for search/discovery
- Creator receives notification of view count

**Traces**: ACN-017, ACN-018, ACN-007, ENT-003, ENT-001, ENT-004

---

### E2E-004: Write Article → Publish → View on Homepage

**Severity**: HIGH | **Actor**: ACT-002 (Registered User)

**Given**:
- User is logged in
- User navigates to "Write Article"
- Homepage article section refreshes every 5 minutes

**When**:
1. User enters: title="Decoding Fender Serial Numbers",
2. Writes article content (500+ words, includes markdown formatting)
3. Sets status to "Draft"
4. Clicks "Save Draft"
5. Returns to article, clicks "Preview"
6. Reviews rendered content
7. Clicks "Publish"
8. Article status changes to "published"
9. Homepage refreshes
10. Guest user navigates to homepage

**Then**:
- Article created with author_id = current user, status="draft"
- Draft saved to database
- Preview renders markdown correctly (bold, italics, links, images)
- Article published (status="published", published_at=now)
- Article appears in "Latest Articles" section on homepage
- View counter initialized at 0
- Like counter initialized at 0
- Guest can click article and read full content
- Author name and avatar displayed

**Traces**: ACN-020, ACN-021, ACN-007, ENT-002, ENT-004

---

### E2E-005: Initiate Ownership Transfer → Recipient Accepts → Admin Completes

**Severity**: CRITICAL | **Actor**: ACT-002 (Owner), ACT-002 (Recipient), ACT-003 (Admin)

**Given**:
- User A owns instrument "1965 Fender Strat"
- User B (recipient) is registered in system
- Instrument has status="owned" and owner_id=A

**When**:
1. User A views instrument detail
2. Clicks "Initiate Transfer"
3. Enters recipient username "userB"
4. Enters optional message "I'm selling you this guitar"
5. Clicks "Send Transfer Offer"
6. User A sees "Transfer pending acceptance"
7. User B receives notification (email + in-app)
8. User B clicks notification
9. Views transfer details
10. Clicks "Accept Transfer"
11. Transfer status changes to "accepted"
12. Admin receives notification for final approval
13. Admin views transfer in "Admin Console"
14. Clicks "Approve & Complete Transfer"
15. Transfer marked complete, owner changed to User B

**Then**:
- Transfer record created: status="pending", from_owner_id=A, to_owner_id=B
- Notification sent to User B (email + push)
- Transfer moved to User B's inbox
- Transfer accepted: status="accepted", accepted_at=now
- Notification sent to Admin
- Admin approves: status="completed", completed_at=now, instrument.owner_id=B
- User A can no longer edit instrument (owner_id changed)
- User B can now edit/transfer instrument
- Instrument ownership history logged in audit trail

**Traces**: ACN-014, ACN-015, ACN-016, ACN-013, ENT-006, ENT-001, ENT-004, ENT-011

---

### E2E-006: Admin Reviews Ownership Claim → Approves/Rejects

**Severity**: CRITICAL | **Actor**: ACT-002 (Claimant), ACT-003 (Admin)

**Given**:
- User A submitted ownership claim on instrument "1965 Gibson Les Paul"
- Claim includes proof document/photo
- Claim status="pending"
- Admin user is logged in

**When** (Approval path):
1. Admin navigates to "Admin Console" → "Ownership Claims"
2. Sees pending claim: instrument="1965 Gibson Les Paul", claimant="userA"
3. Views claim details and attached proof
4. Reviews instrument history (previous owner, transfers)
5. Clicks "Approve Claim"
6. Adds note: "Verified against Fender database"
7. Clicks "Confirm"
8. Claim status="approved"
9. Instrument owner_id changed to claimant
10. Email notification sent to claimant

**Then** (Approval):
- Claim status changed from "pending" to "approved"
- reviewed_at=now, reviewer_id=admin_id
- Instrument owner_id = claimant_id
- Ownership claim history logged
- Verified badge added to instrument
- Email sent to claimant: "Your ownership claim was approved"
- Instrument appears in claimant's "Owned Instruments" list

**When** (Rejection path):
1. Admin views different pending claim
2. Clicks "Reject Claim"
3. Adds rejection reason: "Insufficient proof provided"
4. Clicks "Confirm"

**Then** (Rejection):
- Claim status changed to "rejected"
- reviewed_at=now, reviewer_id=admin_id
- Rejection reason stored
- Email sent to claimant with rejection reason
- Instrument remains with previous owner
- Claimant can resubmit claim with additional proof

**Traces**: ACN-013, ACN-012, ENT-005, ENT-001, ENT-004, ENT-011

---

### E2E-007: Forum: Create Thread → Reply → Admin Pins Thread

**Severity**: MEDIUM | **Actor**: ACT-002 (Creator), ACT-002 (Replier), ACT-003 (Admin)

**Given**:
- User is logged in
- Forum category "Repairs & Maintenance" exists
- No threads are pinned in category

**When**:
1. User navigates to Forum → "Repairs & Maintenance"
2. Clicks "Create New Thread"
3. Enters: title="Fender Stratocaster Neck Repair Guide", content="Step-by-step guide to fixing fretboard damage"
4. Sets category="Repairs & Maintenance"
5. Clicks "Create Thread"
6. Thread created with reply_count=0
7. Another user clicks "Reply"
8. Enters reply content and clicks "Post Reply"
9. Thread reply_count incremented
10. Admin user navigates to same forum category
11. Clicks options on thread
12. Selects "Pin Thread"
13. Thread appears at top of category (pinned=true)
14. Admin selects "Lock Thread" option
15. Lock status set (locked=true)

**Then**:
- Thread created with title, content, category, author_id, created_at
- Thread appears in forum category list
- Reply posted with thread_id reference
- reply_count=1, last_reply_at updated
- Thread pinned: appears first in category list, pinned=true
- Locked thread: "This thread is locked. No new replies allowed" message shown
- Users cannot reply to locked thread
- Admin can still edit thread and pin/unpin

**Traces**: ACN-023, ACN-024, ACN-025, ENT-007, ENT-008, ENT-004

---

### E2E-008: Admin Content Moderation Workflow

**Severity**: HIGH | **Actor**: ACT-003 (Admin)

**Given**:
- Multiple articles and forum posts pending review
- Some content flagged as inappropriate
- Admin is logged in

**When**:
1. Admin navigates to "Admin Console" → "Content Moderation"
2. Views flagged articles/posts
3. Clicks on flagged article
4. Reads content and review notes
5. Clicks "Approve" or "Remove Content"
6. If "Remove Content", adds moderation note
7. Navigates to "User Management"
8. Searches for user account
9. Clicks "Suspend Account" with reason
10. Suspension takes effect immediately

**Then**:
- Flagged content reviewed
- Approved content published automatically
- Removed content soft-deleted, hidden from public
- Moderation note stored in audit log
- User suspended: cannot login, post, or comment
- Suspension email sent to user
- Admin dashboard shows moderation metrics (items reviewed, actions taken)

**Traces**: ACN-029, ENT-002, ENT-004, ENT-007, ENT-008

---

### E2E-009: User Search and Filter Instruments

**Severity**: MEDIUM | **Actor**: ACT-001 (Guest) / ACT-002 (Registered)

**Given**:
- Database contains 100+ instruments with various makes, models, years
- Search index is updated
- User is on Explore page

**When**:
1. User enters search term "Gibson Les Paul" in search box
2. Clicks "Search"
3. Results filtered to matching make/model
4. User clicks "Advanced Filter"
5. Sets filters: year_min=1959, year_max=1969, condition=excellent
6. Clicks "Apply Filters"
7. Results refined (intersection of filters)
8. User clicks first result
9. Views instrument detail page
10. Clicks "Add to Favorites"
11. Navigates back to search

**Then**:
- Search returns 10+ results (paginated)
- Each result shows: make, model, year, owner (if public), thumbnail
- Filters applied: results show only 1959-1969 Gibson Les Pauls in excellent condition
- Detail page displays full instrument metadata
- Favorite icon toggled (instrument added to user's favorites)
- Search results sticky (back button preserves filters)
- Result count updated in real-time

**Traces**: ACN-010, ACN-007, ACN-027, ENT-001, ENT-010

---

### E2E-010: Serial Number Decoder Flow

**Severity**: MEDIUM | **Actor**: ACT-001 (Guest)

**Given**:
- Serial number decoder tool is available on app
- Decoder database contains Fender, Gibson, Martin serial data
- User is on homepage

**When**:
1. User clicks "Serial Number Decoder"
2. Selects maker="Fender"
3. Enters serial number "S123456"
4. Clicks "Decode"
5. Decoder returns: model suggestion, approximate year, factory
6. User clicks "Create instrument from this serial"
7. Instrument form prefilled with decoded data
8. User adds photos and clicks "Save"

**Then**:
- Decoder correctly identifies Fender serial format
- Returns: model="Stratocaster" (if match), year=1965 (if match), factory="Fullerton"
- No match found: displays "Serial format recognized, but specific model not found"
- User can create instrument with prefilled decoded data
- Instrument saved with source="serial_decoder"
- Serial verification badge shown on instrument

**Traces**: ACN-011, ACN-006, ENT-001

---

### E2E-011: Direct Messaging Between Users

**Severity**: MEDIUM | **Actor**: ACT-002 (Sender), ACT-002 (Recipient)

**Given**:
- User A and User B are both registered
- User B's profile is public
- Direct messaging feature is enabled

**When**:
1. User A views User B's profile
2. Clicks "Send Message"
3. Message compose form opens
4. User A enters message: "Hi, are you interested in selling your 1965 Strat?"
5. Clicks "Send"
6. Message appears in User A's "Sent" folder
7. User B receives notification (email + in-app)
8. User B clicks notification
9. Opens direct message thread with User A
10. Clicks "Reply"
11. Enters: "Yes, I am. Are you interested?"
12. Clicks "Send"
13. Message thread shows conversation history

**Then**:
- Message created: from_id=A, to_id=B, content=message, read=false
- Message stored in both users' message threads
- Notification sent to User B (email + push)
- User B marks message as read: read_at=now
- Read status reflected in UI (checkmark)
- Conversation thread displays chronologically
- Users can continue messaging
- Message thread persists after logout/login

**Traces**: ACN-026, ENT-009, ENT-004

---

### E2E-012: Password Reset Flow

**Severity**: HIGH | **Actor**: ACT-002 (User)

**Given**:
- User is logged out
- User account exists with email "user@example.com"
- Email delivery is configured

**When**:
1. User clicks "Forgot Password"
2. Enters email "user@example.com"
3. Clicks "Send Reset Link"
4. Email sent with reset link containing token
5. User clicks link in email
6. Reset page loads with token validation
7. User enters new password "NewSecurePass123!"
8. Clicks "Reset Password"
9. Password updated in database
10. User redirected to login page
11. User logs in with new password

**Then**:
- Password reset email sent to user's email address
- Reset link valid for 24 hours
- Token verified server-side
- Password hash updated in database
- Old password no longer valid
- User can login with new password
- Session invalidated (old sessions logged out)
- Confirmation email sent after reset

**Traces**: ACN-005, ACN-002, ENT-004

---

### E2E-013: Admin KPI Dashboard Loads with Real Data

**Severity**: MEDIUM | **Actor**: ACT-003 (Admin)

**Given**:
- Admin is logged in
- Database contains real data (users, instruments, claims, articles)
- Dashboard calculations are up-to-date

**When**:
1. Admin navigates to "Dashboard"
2. Dashboard loads with KPI cards:
   - Total users (count)
   - Active users this month
   - Total instruments registered
   - Pending ownership claims
   - Pending transfers
   - Articles published
   - Forum posts this week
   - User engagement metrics
3. Admin clicks on "Total Instruments" card
4. Drills down to instrument list with creation date filters
5. Exports data to CSV

**Then**:
- Dashboard loads within 2 seconds
- All KPI cards display correct, real-time data
- Data matches database queries
- Drill-down functionality works (clicking card shows detailed view)
- Charts render correctly (user growth, activity trends)
- CSV export includes: instrument_id, make, model, owner, created_at, status
- Data refresh interval: 5-minute cache
- Admin can filter by date range

**Traces**: ACN-030, ENT-001, ENT-002, ENT-004, ENT-005, ENT-006, ENT-007, ENT-008

---

### E2E-014: User Favorites Management

**Severity**: LOW | **Actor**: ACT-002 (Registered User)

**Given**:
- User is logged in
- User has browsed several instruments
- User hasn't added any favorites yet

**When**:
1. User navigates to Explore
2. Views instrument: "1965 Fender Stratocaster"
3. Clicks heart icon "Add to Favorites"
4. Heart icon fills/toggles
5. User continues browsing, adds 5 more instruments to favorites
6. User navigates to "My Favorites" section
7. All 6 instruments displayed in a list
8. User clicks heart on one instrument to remove
9. Instrument removed from favorites list

**Then**:
- Favorite relationship created: user_id=current, instrument_id=instrument
- Favorite appears in "My Favorites" list
- Heart icon shows filled state on instrument detail pages
- "My Favorites" list shows all 6 instruments with metadata
- Removing favorite: relationship deleted, heart icon unfilled
- Favorite count displayed on user profile
- Favorites persist across sessions

**Traces**: ACN-027, ENT-010, ENT-001, ENT-004

---

### E2E-015: Collection Browse and Discovery

**Severity**: LOW | **Actor**: ACT-001 (Guest)

**Given**:
- Multiple public collections exist in database (30+)
- Collections have varying sizes and view counts
- Guest is on homepage

**When**:
1. Guest clicks "Collections" in navigation
2. Collections directory loads, showing featured collections
3. Guest sorts by "Most Popular" (view count)
4. Top collection shows "Vintage Gibson Collection" (5K views)
5. Guest clicks collection
6. Collection detail page loads with all instruments
7. Guest clicks "Follow Collection" (if available)
8. Guest explores instruments within collection
9. Searches collections by keyword: "vintage"
10. Results filtered to matching collections

**Then**:
- Collections directory displays 10 collections per page (paginated)
- Featured collections highlighted
- Sorting works: most popular, newest, oldest
- Collection detail shows: name, description, instrument count, follower count
- Instruments display with thumbnails and make/model/year
- Guest can view but cannot edit collection
- Follow functionality available (requires login to persist)
- Search returns collections matching keyword
- View count incremented on collection access

**Traces**: ACN-007, ACN-010, ENT-003, ENT-001, ACT-001

---

## 4. בדיקות פיצ'ר (Feature Tests)

### 4.1 Authentication Features

#### FT-001: Sign Up - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to https://shiny-muffin-21f968.netlify.app
2. Click "Sign Up"
3. Enter email: "newuser@example.com"
4. Enter password: "SecurePass123!"
5. Enter password confirmation: "SecurePass123!"
6. Click "Create Account"
7. If email verification required, verify email
8. User redirected to dashboard

**Expected Result**:
- User account created in database
- User logged in automatically
- Dashboard displayed
- Email verification notification sent (if required)
- User role set to "user" (not admin)

**Severity**: CRITICAL | **Traceability**: ACN-001, ENT-004

---

#### FT-002: Sign Up - Validation: Weak Password
**Severity**: HIGH | **Type**: Validation | **Regression**: true

**Steps**:
1. Navigate to Sign Up page
2. Enter email: "user@example.com"
3. Enter password: "123" (weak)
4. Enter confirmation: "123"
5. Click "Create Account"

**Expected Result**:
- Error message displayed: "Password must be at least 8 characters, include uppercase, lowercase, and numbers"
- Account not created
- User remains on sign up form

**Severity**: HIGH | **Traceability**: ACN-001

---

#### FT-003: Sign Up - Validation: Invalid Email
**Severity**: HIGH | **Type**: Validation | **Regression**: true

**Steps**:
1. Navigate to Sign Up page
2. Enter email: "invalidemail" (no @)
3. Enter password: "SecurePass123!"
4. Click "Create Account"

**Expected Result**:
- Error message: "Please enter a valid email address"
- Account not created
- Email field highlighted

**Severity**: HIGH | **Traceability**: ACN-001

---

#### FT-004: Sign Up - Validation: Email Already Exists
**Severity**: HIGH | **Type**: Validation | **Regression**: true

**Steps**:
1. Create account with email "existing@example.com"
2. Log out
3. Click "Sign Up"
4. Enter email: "existing@example.com"
5. Enter password: "SecurePass123!"
6. Click "Create Account"

**Expected Result**:
- Error message: "Email already registered. Please use a different email or sign in."
- User redirected to login page
- No duplicate account created

**Severity**: HIGH | **Traceability**: ACN-001

---

#### FT-005: Sign In - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to login page
2. Enter email: "user@example.com"
3. Enter password: "SecurePass123!"
4. Click "Sign In"
5. User redirected to dashboard

**Expected Result**:
- User logged in
- Dashboard displays
- User profile visible in top navigation
- Last login timestamp updated

**Severity**: CRITICAL | **Traceability**: ACN-002, ENT-004

---

#### FT-006: Sign In - Validation: Invalid Credentials
**Severity**: HIGH | **Type**: Validation | **Regression**: true

**Steps**:
1. Navigate to login page
2. Enter email: "user@example.com"
3. Enter password: "WrongPassword123!"
4. Click "Sign In"

**Expected Result**:
- Error message: "Invalid email or password"
- User not logged in
- User remains on login page
- No sensitive information disclosed

**Severity**: HIGH | **Traceability**: ACN-002

---

#### FT-007: Sign In with Google OAuth - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to login page
2. Click "Sign in with Google"
3. Google OAuth dialog opens
4. Select existing Google account or login
5. Approve TWNG permissions
6. Redirected back to TWNG dashboard

**Expected Result**:
- User logged in via OAuth
- Google account linked to TWNG account
- Email auto-verified from Google
- Dashboard displayed
- No password stored for Google account

**Severity**: CRITICAL | **Traceability**: ACN-003, ENT-004

---

#### FT-008: Sign In with Google OAuth - Permission Denied
**Severity**: MEDIUM | **Type**: Error Handling | **Regression**: true

**Steps**:
1. Navigate to login page
2. Click "Sign in with Google"
3. Google OAuth dialog opens
4. Click "Cancel" or deny permissions

**Expected Result**:
- OAuth flow canceled
- User returned to login page
- Error message: "Google sign-in canceled"
- No account created

**Severity**: MEDIUM | **Traceability**: ACN-003

---

#### FT-009: Sign Out
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in and viewing dashboard
2. Click profile dropdown menu
3. Click "Sign Out"
4. User redirected to homepage

**Expected Result**:
- User session invalidated
- User logged out completely
- Session token removed from client
- Cannot access protected routes without re-login
- Homepage displays "Sign Up" / "Sign In" buttons (not profile)

**Severity**: CRITICAL | **Traceability**: ACN-004, ENT-004

---

#### FT-010: Password Reset - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to login page
2. Click "Forgot Password"
3. Enter email: "user@example.com"
4. Click "Send Reset Link"
5. Check email, click reset link
6. Enter new password: "NewSecurePass123!"
7. Confirm password: "NewSecurePass123!"
8. Click "Reset Password"
9. Redirected to login page
10. Login with new password

**Expected Result**:
- Reset email sent to user
- Reset link valid for 24 hours
- Password updated in database
- Old password no longer valid
- Login successful with new password
- Confirmation email sent after reset
- All other sessions logged out

**Severity**: CRITICAL | **Traceability**: ACN-005, ENT-004

---

#### FT-011: Password Reset - Invalid/Expired Token
**Severity**: HIGH | **Type**: Error Handling | **Regression**: true

**Steps**:
1. Click password reset link with invalid token
2. Or wait 24+ hours and click reset link

**Expected Result**:
- Error page: "This reset link is invalid or expired"
- User redirected to request new reset link
- No password change occurs

**Severity**: HIGH | **Traceability**: ACN-005

---

### 4.2 Instrument Management

#### FT-012: Add Instrument - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, navigates to "Add Instrument"
2. Enter make: "Fender"
3. Enter model: "Stratocaster"
4. Enter year: "1965"
5. Enter serial: "S123456"
6. Upload photo (JPG/PNG)
7. Enter condition: "Excellent"
8. Enter description: "Original sunburst finish, all original parts"
9. Click "Save Instrument"

**Expected Result**:
- Instrument created in database
- owner_id set to current user
- Photo uploaded and stored
- Instrument accessible via detail page
- Instrument appears in user's inventory
- Success message: "Instrument added successfully"
- Timestamp: created_at set to current time

**Severity**: CRITICAL | **Traceability**: ACN-006, ENT-001, ENT-004

---

#### FT-013: Add Instrument - Validation: Required Fields
**Severity**: CRITICAL | **Type**: Validation | **Regression**: true

**Steps**:
1. Navigate to "Add Instrument"
2. Leave make field empty
3. Enter model: "Stratocaster"
4. Click "Save Instrument"

**Expected Result**:
- Error message: "Make is required"
- Instrument not saved
- Form remains on add page

**Severity**: CRITICAL | **Traceability**: ACN-006

---

#### FT-014: Add Instrument - Duplicate Serial Number Check
**Severity**: MEDIUM | **Type**: Validation | **Regression**: true

**Steps**:
1. Create instrument with serial "ABC123"
2. Navigate to "Add Instrument"
3. Enter same serial: "ABC123"
4. Enter different make/model
5. Click "Save Instrument"

**Expected Result**:
- Warning message: "Serial number already registered for another instrument"
- Option to link to existing instrument or override
- If override: new instrument created with same serial (for historical variants)
- Audit log records duplicate serial attempt

**Severity**: MEDIUM | **Traceability**: ACN-006, ENT-001, ENT-011

---

#### FT-015: View Instrument Detail
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to instrument detail page
2. Verify all metadata displayed:
   - Make, model, year, serial
   - Photos/gallery
   - Owner information
   - Condition status
   - View count
   - Ownership history (if public)
3. Guest user views same page

**Expected Result**:
- All public information displayed correctly
- Photo gallery renders
- Owner name and profile link visible
- View count incremented (every unique visitor)
- Private information (notes, contacts) hidden from guests
- Page loads within 2 seconds
- Responsive design on mobile

**Severity**: CRITICAL | **Traceability**: ACN-007, ENT-001, ENT-004

---

#### FT-016: Edit Instrument - Owner Only
**Severity**: CRITICAL | **Type**: Permission | **Regression**: true

**Steps**:
1. Owner logged in, views instrument detail
2. Clicks "Edit"
3. Modifies description: "New description"
4. Modifies condition: "Good"
5. Clicks "Save Changes"
6. Change logged in history

**Expected Result**:
- Instrument updated in database
- Change recorded in ENT-011 (Attribute History)
- history.old_value = "Excellent", new_value = "Good"
- Updated timestamp set
- Success message displayed
- Change visible on detail page immediately

**Severity**: CRITICAL | **Traceability**: ACN-008, ENT-001, ENT-011

---

#### FT-017: Edit Instrument - Non-Owner Permission Denied
**Severity**: CRITICAL | **Type**: Permission | **Regression**: true

**Steps**:
1. User B logged in
2. Navigates to User A's instrument detail page
3. Attempts to access /instrument/ID/edit in URL bar

**Expected Result**:
- 403 Forbidden error
- Error message: "You don't have permission to edit this instrument"
- Redirect to instrument detail (read-only view)
- Edit button not visible in UI

**Severity**: CRITICAL | **Traceability**: CON-001

---

#### FT-018: Delete Instrument - Soft Delete
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Owner logged in, views instrument detail
2. Clicks "Delete Instrument"
3. Confirmation dialog: "Are you sure?"
4. Clicks "Yes, Delete"
5. Instrument removed from view

**Expected Result**:
- Instrument soft-deleted (not hard-deleted)
- deleted_at timestamp set
- Instrument hidden from public/user inventory
- Admin can view deleted items
- Owner can restore instrument within 30 days
- Ownership claims/transfers orphaned safely (references maintained)

**Severity**: CRITICAL | **Traceability**: ACN-009, ENT-001

---

#### FT-019: Search Instruments - Text Search
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to Explore page
2. Enter search term: "Gibson"
3. Click "Search"
4. Results paginated (10 per page)

**Expected Result**:
- Search returns all instruments matching "Gibson" (make or model)
- Results include: thumbnail, make, model, year, owner
- Search index responsive (< 500ms)
- Pagination controls visible
- Result count displayed: "15 results"

**Severity**: HIGH | **Traceability**: ACN-010, ENT-001

---

#### FT-020: Filter Instruments - Advanced Filter
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to Explore page
2. Click "Advanced Filter"
3. Set filters:
   - Make: "Fender"
   - Year range: 1960-1970
   - Condition: "Excellent"
4. Click "Apply Filters"

**Expected Result**:
- Results filtered by all criteria (AND logic)
- Only Fender instruments from 1960-1970 in Excellent condition shown
- Filter state persisted in URL
- Reset filters button available
- Filter count shown: "3 filters applied"

**Severity**: HIGH | **Traceability**: ACN-010, ENT-001

---

#### FT-021: Serial Number Decoder - Fender
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. Navigate to "Serial Decoder" tool
2. Select maker: "Fender"
3. Enter serial: "S123456"
4. Click "Decode"

**Expected Result**:
- Decoder identifies Fender format
- Returns: approximate year (1965), factory (Fullerton), model (if match)
- "Decode confidence: High" displayed
- Option to create instrument with decoded data

**Severity**: MEDIUM | **Traceability**: ACN-011, ENT-001

---

#### FT-022: Serial Number Decoder - Unknown Format
**Severity**: MEDIUM | **Type**: Error Handling | **Regression**: true

**Steps**:
1. Navigate to "Serial Decoder" tool
2. Select maker: "Custom Builder"
3. Enter serial: "CUSTOM-XYZ-999"
4. Click "Decode"

**Expected Result**:
- Message: "Serial format not recognized in our database"
- User can still create instrument manually
- Option to suggest format to admin

**Severity**: MEDIUM | **Traceability**: ACN-011

---

### 4.3 Ownership Claims

#### FT-023: Claim Ownership - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. User (not owner) views instrument detail
2. Clicks "Claim Ownership"
3. Claim form opens
4. Uploads proof document (photo/certificate/receipt)
5. Adds note: "My grandfather's guitar, have original receipt"
6. Clicks "Submit Claim"

**Expected Result**:
- Ownership claim created in database
- status = "pending"
- claimant_id = current user
- Proof document stored (secure upload)
- Email notification sent to admin
- User sees: "Claim submitted. Pending admin review"
- Claim appears in admin's review queue

**Severity**: CRITICAL | **Traceability**: ACN-012, ENT-005, ENT-001

---

#### FT-024: Claim Ownership - Validation: Missing Proof
**Severity**: HIGH | **Type**: Validation | **Regression**: true

**Steps**:
1. User clicks "Claim Ownership"
2. Adds note but does not upload proof
3. Clicks "Submit Claim"

**Expected Result**:
- Error message: "Proof document required"
- Claim not submitted
- User must upload proof to proceed

**Severity**: HIGH | **Traceability**: ACN-012

---

#### FT-025: Claim Ownership - Duplicate Claim Prevention
**Severity**: MEDIUM | **Type**: Validation | **Regression**: true

**Steps**:
1. User submits claim on instrument (status = "pending")
2. Same user clicks "Claim Ownership" again on same instrument
3. Attempts to submit another claim

**Expected Result**:
- Message: "You already have a pending claim on this instrument"
- Form disabled or button hidden
- User can withdraw previous claim if needed

**Severity**: MEDIUM | **Traceability**: ACN-012, ENT-005

---

#### FT-026: Admin Approve Ownership Claim
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin navigates to "Admin Console" → "Ownership Claims"
2. Views pending claim with proof
3. Clicks "Approve"
4. Adds reviewer note: "Verified against Fender database"
5. Clicks "Confirm Approval"

**Expected Result**:
- Claim status changed to "approved"
- reviewed_at = current timestamp
- reviewer_id = admin user
- Instrument owner_id changed to claimant_id
- Verified badge added to instrument
- Email notification sent to claimant: "Your ownership claim approved"
- Claim removed from pending queue

**Severity**: CRITICAL | **Traceability**: ACN-013, ENT-005, ENT-001

---

#### FT-027: Admin Reject Ownership Claim
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin views pending claim
2. Clicks "Reject"
3. Adds rejection reason: "Insufficient proof provided"
4. Clicks "Confirm Rejection"

**Expected Result**:
- Claim status changed to "rejected"
- reviewed_at = current timestamp
- Rejection reason stored
- Instrument owner_id unchanged
- Email notification sent to claimant with rejection reason
- Claimant can resubmit claim with additional proof

**Severity**: CRITICAL | **Traceability**: ACN-013, ENT-005

---

### 4.4 Ownership Transfers

#### FT-028: Initiate Transfer - Happy Path
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Owner logged in, views instrument detail
2. Clicks "Initiate Transfer"
3. Enters recipient username: "userB"
4. Adds optional message: "Selling you my guitar"
5. Clicks "Send Transfer Offer"

**Expected Result**:
- Transfer record created: status = "pending"
- from_owner_id = current user
- to_owner_id = userB
- Notification sent to userB (email + in-app)
- Owner sees: "Transfer pending acceptance"
- Transfer appears in userB's inbox

**Severity**: CRITICAL | **Traceability**: ACN-014, ENT-006, ENT-001

---

#### FT-029: Initiate Transfer - Non-Owner Permission Denied
**Severity**: CRITICAL | **Type**: Permission | **Regression**: true

**Steps**:
1. User B (not owner) views instrument
2. Attempts to click "Initiate Transfer"

**Expected Result**:
- Button not visible in UI
- If URL accessed directly: 403 error
- Error message: "Only the owner can initiate a transfer"

**Severity**: CRITICAL | **Traceability**: CON-001

---

#### FT-030: Accept Transfer
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Recipient logged in, views transfer notification
2. Clicks notification → transfer detail page
3. Reads offer and optional message
4. Clicks "Accept Transfer"
5. Confirmation dialog shown

**Expected Result**:
- Transfer status changed to "accepted"
- accepted_at = current timestamp
- Notification sent to original owner: "Transfer accepted"
- Notification sent to admin: "Transfer pending approval"
- Transfer moved to admin approval queue

**Severity**: CRITICAL | **Traceability**: ACN-015, ENT-006

---

#### FT-031: Reject Transfer
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Recipient logged in, views transfer offer
2. Clicks "Reject Transfer"
3. Adds optional reason: "Not interested"
4. Clicks "Confirm"

**Expected Result**:
- Transfer status changed to "rejected"
- Notification sent to owner: "Transfer rejected by recipient"
- Transfer removed from recipient's inbox
- Instrument remains with original owner
- Recipient can receive new transfer offers in future

**Severity**: HIGH | **Traceability**: ACN-015, ENT-006

---

#### FT-032: Admin Complete Transfer
**Severity**: CRITICAL | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin navigates to "Admin Console" → "Pending Transfers"
2. Views accepted transfer
3. Reviews transfer details
4. Clicks "Approve & Complete Transfer"
5. Adds note: "Transfer completed"

**Expected Result**:
- Transfer status changed to "completed"
- completed_at = current timestamp
- Instrument owner_id changed from old owner to new owner
- Both parties notified (email + in-app)
- Transfer removed from pending queue
- New owner can now edit/transfer instrument
- Old owner can no longer edit instrument

**Severity**: CRITICAL | **Traceability**: ACN-016, ACN-013, ENT-006, ENT-001

---

#### FT-033: Transfer - Concurrent Requests Validation
**Severity**: MEDIUM | **Type**: Validation | **Regression**: true

**Steps**:
1. Owner initiates transfer to userB
2. Owner initiates second transfer to userC on same instrument
3. System validates state

**Expected Result**:
- Second transfer rejected or prevented
- Error message: "A transfer is already pending for this instrument"
- Only one pending transfer allowed at a time
- Owner must cancel first transfer before initiating another

**Severity**: MEDIUM | **Traceability**: ACN-014, ENT-006

---

### 4.5 Collections

#### FT-034: Create Collection - Happy Path
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, navigates to "Collections"
2. Clicks "Create New Collection"
3. Enters name: "My Vintage Strats"
4. Enters description: "Collection of 1960s Fender Stratocasters"
5. Sets visibility: "Public"
6. Clicks "Create"

**Expected Result**:
- Collection created with owner_id = current user
- public = true
- Collection accessible via URL
- Collection appears in user's "My Collections"
- Shareable link generated

**Severity**: HIGH | **Traceability**: ACN-017, ENT-003

---

#### FT-035: Add Instrument to Collection
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. View collection detail page
2. Clicks "Add Instrument"
3. Search/select instrument: "1965 Fender Stratocaster"
4. Clicks "Add"

**Expected Result**:
- Instrument added to collection (many-to-many)
- Collection instrument_count incremented
- Instrument appears in collection display
- Can add same instrument to multiple collections

**Severity**: HIGH | **Traceability**: ACN-018, ENT-003, ENT-001

---

#### FT-036: Edit Collection - Owner Only
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Collection owner logged in
2. Clicks "Edit Collection"
3. Modifies description: "Updated description"
4. Changes visibility: "Private"
5. Clicks "Save"

**Expected Result**:
- Collection updated in database
- Privacy setting changed (no longer publicly searchable)
- Shareable link still works for existing recipients
- Success message displayed

**Severity**: HIGH | **Traceability**: ACN-019, ENT-003

---

#### FT-037: Delete Collection
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. Collection owner clicks "Delete Collection"
2. Confirmation dialog: "Delete permanently?"
3. Clicks "Yes"

**Expected Result**:
- Collection soft-deleted
- Instruments remain in database (not deleted)
- Collection no longer visible to public
- Owner can restore within 30 days

**Severity**: MEDIUM | **Traceability**: ACN-019, ENT-003

---

### 4.6 Articles

#### FT-038: Write Article - Happy Path
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, navigates to "Write Article"
2. Enters title: "Fender Stratocaster Serial Numbers: A Complete Guide"
3. Writes content with markdown formatting (headers, bold, lists)
4. Clicks "Save Draft"
5. Article saved

**Expected Result**:
- Article created with author_id = current user
- status = "draft"
- Markdown content stored
- Auto-save every 30 seconds
- User can return to edit draft

**Severity**: HIGH | **Traceability**: ACN-020, ENT-002

---

#### FT-039: Publish Article
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Article author clicks "Preview"
2. Markdown renders correctly
3. Clicks "Publish"
4. Article status changed to "published"

**Expected Result**:
- Article status = "published"
- published_at = current timestamp
- Article appears on homepage "Latest Articles"
- Public URL accessible
- View count initialized at 0
- Like count initialized at 0

**Severity**: HIGH | **Traceability**: ACN-021, ENT-002

---

#### FT-040: Like Article
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. User views published article
2. Clicks "Like" button (heart icon)
3. Like count incremented

**Expected Result**:
- Article like_count incremented
- User's like recorded in database (prevent duplicate likes)
- Like count displayed: "25 likes"
- Heart icon filled (indicating user liked)

**Severity**: MEDIUM | **Traceability**: ACN-022, ENT-002

---

#### FT-041: View Article
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Guest or user views published article
2. Article detail page loads

**Expected Result**:
- Article title, content (markdown rendered), author displayed
- View count incremented (unique visitors tracked)
- Comment section visible (if enabled)
- Share buttons available
- Author profile link visible

**Severity**: HIGH | **Traceability**: ACN-007, ENT-002

---

### 4.7 Forum

#### FT-042: Create Forum Thread - Happy Path
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, navigates to Forum
2. Selects category: "Repairs & Maintenance"
3. Clicks "Create New Thread"
4. Enters title: "Fretboard Restoration Guide"
5. Writes content (markdown supported)
6. Clicks "Create"

**Expected Result**:
- Thread created with author_id = current user
- category_id linked
- reply_count = 0
- Thread appears in category view
- User can edit/delete own thread

**Severity**: HIGH | **Traceability**: ACN-023, ENT-007

---

#### FT-043: Reply to Forum Thread
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, views forum thread
2. Scrolls to "Reply" section
3. Enters reply content
4. Clicks "Post Reply"

**Expected Result**:
- Reply created with thread_id reference
- reply_count incremented on thread
- last_reply_at timestamp updated
- Reply appears in thread (chronological order)
- Author name and avatar displayed

**Severity**: HIGH | **Traceability**: ACN-024, ENT-008

---

#### FT-044: Pin Forum Thread - Admin Only
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin views forum category
2. Clicks options menu on thread
3. Selects "Pin Thread"
4. Thread marked as pinned

**Expected Result**:
- Thread pinned = true
- Thread appears first in category
- "Pinned" badge displayed
- Non-admin users cannot pin threads
- Admin can unpin thread later

**Severity**: MEDIUM | **Traceability**: ACN-025, ENT-007

---

#### FT-045: Lock Forum Thread - Admin Only
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin views forum thread
2. Clicks "Lock Thread"
3. Thread locked = true

**Expected Result**:
- "This thread is locked. No new replies allowed" message shown
- Reply button disabled
- Users cannot post new replies
- Existing replies still visible
- Admin can unlock thread

**Severity**: MEDIUM | **Traceability**: ACN-025, ENT-007

---

### 4.8 Direct Messaging

#### FT-046: Send Direct Message - Happy Path
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. User A logged in, navigates to User B's profile
2. Clicks "Send Message"
3. Message compose form opens
4. Enters message: "Hi, interested in your 1965 Strat?"
5. Clicks "Send"

**Expected Result**:
- Message created: from_id=A, to_id=B
- Message stored in both users' threads
- Notification sent to User B (email + in-app)
- Message appears in User A's "Sent" folder
- Status: "unread" for recipient

**Severity**: MEDIUM | **Traceability**: ACN-026, ENT-009

---

#### FT-047: Read Direct Message
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. User B receives notification
2. Clicks message notification
3. Opens message thread with User A

**Expected Result**:
- Message marked as read: read_at = current timestamp
- Read status reflected in UI (checkmark)
- Conversation history displayed chronologically
- Both messages visible (sent and received)

**Severity**: MEDIUM | **Traceability**: ACN-026, ENT-009

---

### 4.9 User Favorites

#### FT-048: Add Favorite - Happy Path
**Severity**: LOW | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, views instrument
2. Clicks heart icon "Add to Favorites"
3. Heart icon toggles/fills

**Expected Result**:
- Favorite record created: user_id=current, instrument_id=instrument
- Heart icon shows filled state
- Instrument appears in "My Favorites" list

**Severity**: LOW | **Traceability**: ACN-027, ENT-010

---

#### FT-049: Remove Favorite
**Severity**: LOW | **Type**: Functional | **Regression**: true

**Steps**:
1. User clicks filled heart on favorite instrument
2. Heart icon toggles/unfills

**Expected Result**:
- Favorite record deleted
- Heart icon shows unfilled state
- Instrument removed from "My Favorites" list

**Severity**: LOW | **Traceability**: ACN-027, ENT-010

---

#### FT-050: View Favorites List
**Severity**: LOW | **Type**: Functional | **Regression**: true

**Steps**:
1. User navigates to "My Favorites"
2. All favorited instruments displayed

**Expected Result**:
- Favorites list shows all instruments with heart icon
- Can sort by: date added, name, year
- Can remove from favorites
- Empty state message if no favorites

**Severity**: LOW | **Traceability**: ACN-027, ENT-010

---

### 4.10 User Profile

#### FT-051: Edit Profile - Happy Path
**Severity**: MEDIUM | **Type**: Functional | **Regression**: true

**Steps**:
1. User logged in, navigates to "Settings" or profile page
2. Clicks "Edit Profile"
3. Modifies fields: username, bio, avatar
4. Uploads new avatar image
5. Clicks "Save"

**Expected Result**:
- Profile updated in database
- Avatar uploaded and stored
- Changes visible on user's public profile
- Success message: "Profile updated"

**Severity**: MEDIUM | **Traceability**: ACN-028, ENT-004

---

#### FT-052: Edit Profile - Validation: Username Already Taken
**Severity**: MEDIUM | **Type**: Validation | **Regression**: true

**Steps**:
1. User A enters username "guitarenthusiast"
2. User B (different user) attempts to change username to "guitarenthusiast"
3. Clicks "Save"

**Expected Result**:
- Error message: "Username already taken"
- Profile not updated
- User must choose different username

**Severity**: MEDIUM | **Traceability**: ACN-028, ENT-004

---

### 4.11 Admin Console

#### FT-053: Admin Dashboard - KPI Metrics
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin logged in, navigates to "Admin Console" → "Dashboard"
2. Dashboard loads with KPI cards

**Expected Result**:
- Total users card shows correct count
- Total instruments card shows correct count
- Pending claims card shows accurate number
- All metrics load within 2 seconds
- Cards clickable for drill-down

**Severity**: HIGH | **Traceability**: ACN-030, ENT-004, ENT-001, ENT-005

---

#### FT-054: Admin User Management
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin navigates to "Admin Console" → "Users"
2. Searches for user: "userA"
3. Views user details
4. Clicks "Suspend User"
5. Adds suspension reason
6. Clicks "Confirm"

**Expected Result**:
- User suspended: cannot login, post, or comment
- Suspension email sent to user
- User status changed to "suspended"
- Admin can reactivate user later

**Severity**: HIGH | **Traceability**: ACN-029, ENT-004

---

#### FT-055: Admin Content Moderation
**Severity**: HIGH | **Type**: Functional | **Regression**: true

**Steps**:
1. Admin navigates to "Admin Console" → "Content Moderation"
2. Views flagged content
3. Clicks "Review" on flagged post
4. Clicks "Approve" or "Remove"
5. If remove, adds moderation note

**Expected Result**:
- Approved content published immediately
- Removed content soft-deleted, hidden from public
- Moderation note logged in audit trail
- Admin dashboard shows moderation metrics updated

**Severity**: HIGH | **Traceability**: ACN-029, ENT-002, ENT-007, ENT-008

---

## 5. Regression Suite (25 Tests)

Stable pre-release checklist for critical functionality.

### REG-001: User Can Sign Up and Create Account
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-001, ACN-002
- New user signs up with valid email/password
- Account created and user logged in
- Email verified (if required)

### REG-002: User Can Sign In with Email/Password
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-002
- Existing user logs in successfully
- Dashboard accessible after login
- Session persists across page refresh

### REG-003: User Can Sign In with Google OAuth
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-003
- Google OAuth flow completes
- User logged in and email auto-verified
- TWNG account linked to Google account

### REG-004: User Can Sign Out
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-004
- Logged-in user clicks sign out
- Session terminated
- Redirected to homepage
- Cannot access protected pages without re-login

### REG-005: User Can Reset Password
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-005
- User requests password reset
- Email sent with valid link
- Password updated successfully
- Old password no longer works

### REG-006: User Can Add Instrument
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-006, ENT-001
- User adds instrument with required fields (make, model)
- Instrument appears in user's inventory
- Instrument has valid created_at timestamp

### REG-007: User Can View Instrument Detail
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-007, ENT-001
- All instrument metadata displayed
- Photos render correctly
- Owner information visible
- Page loads within 2 seconds

### REG-008: User Can Edit Own Instrument
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-008, ENT-001
- Owner can modify instrument fields
- Changes saved to database
- Changes reflected on detail page immediately

### REG-009: User Cannot Edit Other Users' Instruments
**Regression**: true | **Severity**: CRITICAL | **Traceability**: CON-001
- Non-owner cannot access edit form
- 403 error if URL accessed directly
- Edit button not visible in UI

### REG-010: User Can Delete (Soft) Instrument
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-009, ENT-001
- User deletes instrument
- Soft-deleted (not hard-deleted)
- Instrument hidden from public view
- Can be restored by admin

### REG-011: User Can Search Instruments
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-010, ENT-001
- Search returns relevant results
- Pagination works (10 per page)
- Result count accurate

### REG-012: User Can Claim Ownership
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-012, ENT-005
- User submits claim with proof
- Claim status = "pending"
- Admin notification sent

### REG-013: Admin Can Approve Ownership Claim
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-013, ENT-005
- Admin approves claim
- Instrument owner changed to claimant
- Claimant notified via email

### REG-014: Admin Can Reject Ownership Claim
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-013, ENT-005
- Admin rejects claim with reason
- Instrument owner unchanged
- Claimant notified and can resubmit

### REG-015: User Can Initiate Ownership Transfer
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-014, ENT-006
- Owner initiates transfer
- Transfer status = "pending"
- Recipient notified

### REG-016: Recipient Can Accept Transfer
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-015, ENT-006
- Recipient accepts transfer
- Transfer status = "accepted"
- Admin notified for approval

### REG-017: Admin Can Complete Transfer
**Regression**: true | **Severity**: CRITICAL | **Traceability**: ACN-016, ENT-006
- Admin completes accepted transfer
- Instrument owner changed
- Both parties notified

### REG-018: User Can Create Collection
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-017, ENT-003
- User creates collection with name/description
- Visibility set correctly (public/private)
- Collection accessible by URL

### REG-019: User Can Add Instruments to Collection
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-018, ENT-003, ENT-001
- User adds multiple instruments to collection
- Collection displays all instruments
- Instrument count updated

### REG-020: User Can Publish Article
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-021, ENT-002
- User publishes draft article
- Article appears on homepage
- Public can view published article

### REG-021: User Can Create Forum Thread
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-023, ENT-007
- User creates forum thread
- Thread appears in category
- Thread is searchable

### REG-022: User Can Reply to Forum Thread
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-024, ENT-008
- User posts reply
- Reply appears in thread
- Thread reply_count incremented

### REG-023: User Can Send Direct Message
**Regression**: true | **Severity**: MEDIUM | **Traceability**: ACN-026, ENT-009
- User sends message to another user
- Message received and notification sent
- Message thread shows conversation

### REG-024: User Can Add/Remove Favorites
**Regression**: true | **Severity**: MEDIUM | **Traceability**: ACN-027, ENT-010
- User adds instrument to favorites
- Instrument appears in "My Favorites"
- User can remove from favorites

### REG-025: Admin Dashboard Loads with Real Data
**Regression**: true | **Severity**: HIGH | **Traceability**: ACN-030, ENT-001, ENT-004, ENT-005, ENT-006, ENT-007
- Dashboard loads within 2 seconds
- All KPI metrics display correctly
- Drill-down functionality works

---

## 6. שאלות פתוחות (Open Questions)

### פיצ'רים שלא ברורים:

1. **Email Verification Flow**:
   - האם email verification חובה או אופציונלית?
   - האם למשתמש יש resend email option?
   - טיימאאוט ל-verification link?

2. **Ownership Claim Approval Logic**:
   - מה הקריטריונים להוכחת בעלות? (מסמך רישמי? תמונה?)
   - האם יש escalation process אם admin דחה claim?
   - כמה claims למשתמש בו-זמנית?

3. **Transfer Flow Edge Cases**:
   - מה קורה אם owner deletes instrument תוך pending transfer?
   - האם transfer יכול להיבטל על ידי owner?
   - האם יש time limit on pending transfer?

4. **Search & Filter Performance**:
   - כמה זמן הוא acceptable load time לחיפוש?
   - האם יש pagination limits?
   - כיצד sorted results (by what? date, popularity)?

5. **Article Publishing Moderation**:
   - האם articles חייבות moderation לפני publication?
   - האם יש article categories/tags?
   - מה הtopping criteria לhomepage articles?

6. **Forum Spam Prevention**:
   - האם יש rate limiting על thread/post creation?
   - מה הminimum text length?
   - אם admin locks thread, האם old replies visible?

7. **Direct Messaging Privacy**:
   - האם messages encrypted end-to-end?
   - האם users יכולים להסתיר/block users?
   - Message retention policy?

8. **Admin Audit Trail**:
   - מה בדיוק נרשם באudit trail?
   - עד כמה זמן נשמרים audit logs?
   - האם admin יכול לפתור audit logs?

9. **Concurrent Operations**:
   - מה קורה אם שני admins מאשרים same claim?
   - מה קורה אם owner و recipient מבצעים actions בו-זמנית?

10. **Data Backup & Recovery**:
    - What's the backup frequency?
    - Recovery SLA in case of data loss?
    - GDPR deletion requirements?

11. **Deleted Content Recovery**:
    - 30-day soft delete window mentioned - confirmed?
    - Can soft-deleted content be searched by admin?
    - Permanent deletion process?

12. **Offline Mode**:
    - Should app work offline? (PWA?)
    - Sync behavior on reconnect?

---

## 7. המלצת סדר הרצה (Recommended Execution Order)

### Phase 1: Smoke Tests (Day 1)
Quick validation that the app is deployable.

1. Navigate to homepage
2. Sign up new account
3. Sign in existing account
4. Sign out
5. View an instrument
6. Search instruments

**Success Criteria**: All 6 tests pass, no critical errors.

---

### Phase 2: Authentication & Core Flows (Day 1-2)

**Priority**: CRITICAL | **Estimated Time**: 4 hours

Run all FT-001 through FT-011 (Password reset):
- Sign up validation scenarios
- Sign in scenarios
- Google OAuth flow
- Sign out
- Password reset complete flow

**Success Criteria**: All auth tests pass, users can login/logout.

---

### Phase 3: Instrument Management (Day 2)

**Priority**: CRITICAL | **Estimated Time**: 6 hours

Run FT-012 through FT-022 (Serial decoder):
- Add instrument (happy path + validation)
- View instrument detail
- Edit instrument
- Delete instrument
- Search/filter
- Serial number decoder

**Success Criteria**: Full CRUD operations work, search/filter responsive.

---

### Phase 4: Ownership System (Day 2-3)

**Priority**: CRITICAL | **Estimated Time**: 8 hours

Run FT-023 through FT-033 (Transfers):
- Ownership claims (submit, validation, duplicate prevention)
- Admin approve/reject claims
- Initiate transfer
- Accept/reject transfer
- Admin complete transfer
- Concurrent request validation

**Success Criteria**: Claims and transfers flow correctly, state transitions accurate.

---

### Phase 5: Collections & Content (Day 3)

**Priority**: HIGH | **Estimated Time**: 5 hours

Run FT-034 through FT-041 (Articles):
- Create/edit/delete collections
- Add instruments to collections
- Write articles
- Publish articles
- Like articles
- View articles

**Success Criteria**: Collections shareable, articles render correctly.

---

### Phase 6: Community Features (Day 3-4)

**Priority**: HIGH | **Estimated Time**: 4 hours

Run FT-042 through FT-049 (Favorites):
- Create/reply to forum threads
- Pin/lock threads (admin)
- Send/read direct messages
- Add/remove favorites

**Success Criteria**: Forum threads/replies work, messaging functional.

---

### Phase 7: User & Admin Features (Day 4)

**Priority**: HIGH | **Estimated Time**: 4 hours

Run FT-051 through FT-055 (Admin):
- Edit profile
- Admin dashboard & KPI metrics
- User management
- Content moderation

**Success Criteria**: Admin console operational, all metrics accurate.

---

### Phase 8: End-to-End Scenarios (Day 4-5)

**Priority**: CRITICAL | **Estimated Time**: 6 hours

Run all E2E-001 through E2E-015 (15 full user journeys):
- Each represents a complete user workflow
- Validates integration of multiple features
- Catches edge cases and state issues

**Success Criteria**: All 15 E2E scenarios pass.

---

### Phase 9: Regression Suite (Day 5)

**Priority**: CRITICAL | **Estimated Time**: 4 hours

Run all REG-001 through REG-025 (25 critical tests):
- Pre-release stability checklist
- Ensures no regressions from changes
- Validates data integrity across features

**Success Criteria**: All 25 regression tests pass.

---

### Phase 10: Performance & Security Testing (Day 5-6)

**Priority**: HIGH | **Estimated Time**: 4 hours

- Load testing: Can handle 100+ concurrent users?
- Search performance: < 500ms for queries
- OAuth security: Validate redirect URIs
- SQL injection validation
- XSS prevention in text fields
- CSRF token validation

**Success Criteria**: Performance meets SLAs, no security vulnerabilities found.

---

## 8. Test Data Requirements

### Users for Testing:
```
Admin User:
- Email: admin@twng.dev
- Password: AdminSecure123!
- Role: admin

Test User 1:
- Email: testuser1@twng.dev
- Password: TestPass123!
- Role: user

Test User 2:
- Email: testuser2@twng.dev
- Password: TestPass123!
- Role: user

Test User 3:
- Email: testuser3@twng.dev
- Password: TestPass123!
- Role: user
```

### Sample Instruments:
```
- 1965 Fender Stratocaster (serial: S-123456)
- 1959 Gibson Les Paul (serial: L-987654)
- 1975 Fender Telecaster (serial: T-555555)
- 1980 Martin D-28 (serial: M-111111)
- 1990 PRS Custom (serial: P-999999)
```

---

## 9. Bug Reporting Template

When bugs are found, use this template:

```
BUG-XXX: [Title]

Severity: [CRITICAL / HIGH / MEDIUM / LOW]
Component: [Auth / Instruments / Ownership / Collections / Articles / Forum / Admin / Other]
Test ID: [Related test ID]

Environment:
- Browser: [Chrome/Firefox/Safari/etc + version]
- OS: [Windows/Mac/Linux + version]
- URL: [exact URL]

Preconditions:
- User role: [Guest / User / Admin]
- Database state: [relevant state]

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
- ...

Actual Result:
- ...

Screenshots/Logs:
- [attach if applicable]

Regression Risk: [YES / NO]
```

---

## 10. Test Execution Metrics

### Target Coverage:
- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: 15 full user journeys
- **Feature Tests**: 55+ tests per feature area
- **Regression Tests**: 25 critical tests

### Target Defect Density:
- **Critical**: 0 bugs allowed pre-release
- **High**: < 2 bugs per 1000 lines of code
- **Medium**: < 5 bugs per 1000 lines of code

### Performance Targets:
- Page load time: < 3 seconds (95th percentile)
- API response time: < 500ms (95th percentile)
- Search response time: < 1 second
- Database query time: < 200ms (95th percentile)

### Uptime Target:
- 99.9% availability (4.3 hours downtime/month)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-11
**Created by**: QA Team - TWNG Project
**Status**: Ready for Testing
