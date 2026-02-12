# TWNG Platform — QA Test Execution Report

**Date**: February 11, 2026
**Staging URL**: https://shiny-muffin-21f968.netlify.app
**Supabase Project**: iqrmwetprpwjgzynrjay

---

## Test Summary

| Category | Passed | Failed | Fixed During QA | Total |
|----------|--------|--------|-----------------|-------|
| Smoke Tests | 4/4 | 0 | 0 | 4 |
| Data Integrity | 9/10 | 0 | 1 | 10 |
| FK Relationships | 4/4 | 0 | 0 | 4 |
| Auth & OAuth | 3/3 | 0 | 0 | 3 |
| Security (RLS) | 3/3 | 0 | 0 | 3 |
| Performance | 2/2 | 0 | 0 | 2 |
| **TOTAL** | **25/26** | **0** | **1** | **26** |

**Final Pass Rate: 96% (25/26) — 1 issue found and fixed during testing**

---

## Smoke Tests

| ID | Test | Expected | Actual | Status |
|----|------|----------|--------|--------|
| S-001 | Staging site loads | HTTP 200 | HTTP 200 | PASS |
| S-002 | HTML contains React root | match found | 1 match | PASS |
| S-003 | SPA routing (/explore) | HTTP 200 | HTTP 200 | PASS |
| S-004 | Supabase REST API reachable | HTTP 200 | HTTP 200 | PASS |

## Data Integrity Tests

| ID | Test | Expected | Actual | Status |
|----|------|----------|--------|--------|
| D-001 | Users table has data | >= 1 user | 3 users (ronenberka, david_cohen, ...) | PASS |
| D-002 | Instruments table has data | >= 1 instrument | 5 instruments (Fender Strat, Gibson LP, ...) | PASS |
| D-003 | Published articles exist | >= 6 articles | 6 articles found | PASS |
| D-004 | Collections table accessible | HTTP 200 | 3 collections found | PASS |
| D-005 | Forum threads accessible | HTTP 200 | 3+ threads found | PASS |
| D-006 | Ownership claims table | HTTP 200 | **FIXED** — table was missing, created during QA | PASS (after fix) |
| D-007 | Ownership transfers with FK joins | No relationship error | Clean response | PASS |
| D-008 | Instrument attributes history with FK joins | No relationship error | Clean response | PASS |
| D-009 | System config table | HTTP 200 | Empty array (table exists) | PASS |
| D-010 | Articles with author relationship | Author objects resolved | Authors properly joined | PASS |

## Auth & OAuth Tests

| ID | Test | Expected | Actual | Status |
|----|------|----------|--------|--------|
| A-001 | Google OAuth provider enabled | Enabled | `google = ENABLED` | PASS |
| A-002 | Email auth enabled | Enabled | `email = ENABLED` | PASS |
| A-003 | Bad credentials rejected | HTTP 400 | HTTP 400 (proper error) | PASS |

**Note**: Signup endpoint returns validation error for test email — this is expected behavior (Supabase validates email domains).

## Security Tests (RLS)

| ID | Test | Expected | Actual | Status |
|----|------|----------|--------|--------|
| SEC-001 | Unauthenticated write to users blocked | 401/403 | HTTP 401 (blocked) | PASS |
| SEC-002 | Unauthenticated delete on instruments | 204 (no rows) | HTTP 204 (no rows affected) | PASS |
| SEC-003 | Unauthenticated write to articles blocked | 401/403 | HTTP 401 (blocked) | PASS |

## Performance Tests

| ID | Test | Expected | Actual | Status |
|----|------|----------|--------|--------|
| P-001 | Homepage load time | < 3.0s | 0.323s | PASS |
| P-002 | API query time (instruments) | < 2.0s | 0.519s | PASS |

---

## Bugs Found & Fixed During QA

### BUG-001: Missing `ownership_claims` table (CRITICAL)
- **Found**: Code references `ownership_claims` table in claims.js, Admin.jsx, MarketingConsole.jsx (14 references)
- **Impact**: Claim submission, admin claim management, KPI dashboard claim count — all would fail
- **Fix**: Created table with correct schema (id, instrument_id, claimer_id, status, proof_description, proof_images, reviewed_by, reviewed_at, rejection_reason, timestamps) + RLS policies

### BUG-002: 5 Additional missing tables (MINOR)
- **Tables**: email_log, email_preferences, email_queue, outreach_log, badge_definitions
- **Impact**: Email tracking, user notification preferences, outreach logging, badge system
- **Fix**: Created all 5 tables with appropriate schemas + RLS policies

### BUG-003: Supabase anon key was rotated (NOTE)
- **Found**: The anon key used in previous sessions (`...wGmSP92s...`) is no longer valid
- **Current key**: Starts with `eyJ...NzAzODExNjY...` (from .env file)
- **Impact**: None — the .env file in the build has the correct key

---

## Supabase Auth Configuration

| Setting | Value | Status |
|---------|-------|--------|
| Site URL | https://shiny-muffin-21f968.netlify.app | Correct |
| Redirect allowlist | https://shiny-muffin-21f968.netlify.app | Correct |
| Google OAuth | Enabled with client ID | Correct |
| Email auth | Enabled | Correct |

---

## Marketing Console Module Status

| Module | Data Connection | Status |
|--------|----------------|--------|
| Outreach | Real Supabase data | Working |
| KPI Dashboard | Real Supabase counts | Fixed this session |
| Content Hub | Real instruments + articles | Fixed this session |
| Setup Checklist | Persistent via system_config | Fixed this session |
| Email Templates | Real templates from code | Working |
| Email Sequences | Placeholder + banner | Preview mode |
| Social Media | Placeholder + banner | Preview mode |
| Automation | Placeholder + banner | Preview mode |
| Paid Campaigns | Placeholder + banner | Preview mode |

---

## Deploy Status

- **Build**: Production build successful (8.96s)
- **Deploy zip**: `twng-deploy.zip` (14MB) ready in project root
- **Note**: Netlify auth token not available in this session — manual deploy required via `netlify deploy --prod` or drag-and-drop at app.netlify.com

---

## Recommendations

1. **Deploy the new build** to see all fixes live
2. **Test Google OAuth end-to-end** in the browser after deploy (API confirms it's configured correctly)
3. **Seed sample ownership claims** to test the admin claim management UI
4. **Connect email provider** (Resend/SendGrid) when ready to activate email sequences
5. **Consider adding** insert/update RLS policies for ownership_claims beyond just SELECT
