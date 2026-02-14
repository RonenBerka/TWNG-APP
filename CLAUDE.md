# TWNG — The World's Next Guitar

## Project

Guitar documentation platform. Collectors catalog and share instruments with stories and specs.

**Codebase:** `~/Desktop/twng-app/`
**Live URL:** `https://shiny-muffin-21f968.netlify.app`
**Netlify Site ID:** `d44bf75d-badd-4d8e-82b7-c0a755ee922f`
**Supabase Ref:** `iqrmwetprpwjgzynrjay`

## Stack

- **Frontend:** React + Vite + JSX (NOT TypeScript)
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions)
- **Styling:** Inline styles + theme tokens (`src/theme/tokens.js`)
- **Layout:** `src/components/layout/Layout.jsx` wraps all pages
- **Deploy:** Netlify SPA (`_redirects` + `netlify.toml`)

## Supabase Access

CLI is NOT linked. For DB changes, use the **Dashboard SQL Editor** directly.
**Dashboard:** https://supabase.com/dashboard/project/iqrmwetprpwjgzynrjay

## Critical Design Rule

The frontend design is OURS — as seen on the live URL.
We adopted ONLY Lovable's Supabase backend (schema, Edge Functions, RLS).
DO NOT copy or reference Lovable's frontend design.

## Schema Notes

- Table: `instruments` (NOT `guitars`). Uses `make` (NOT `brand`).
- Specs: JSONB `specs` field (NOT separate columns).
- Enums: `instrument_type`, `timeline_event_type`, `timeline_tier`, `app_role`, `block_type`.
- `guitar_catalog` — 419 pre-seeded models (ours).

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # Linter
```

## Workflow Rules

1. NEVER deploy without `npm run build` first
2. NEVER use git worktrees — feature branches only
3. Flow: `git checkout -b feature/[name]` → work → build → merge to main → deploy
4. After every deploy, verify the live site loads
5. Emergency redeploy: `git checkout main && npm run build && npx netlify deploy --prod --dir=dist`
6. Branch naming: `feature/<name>`, `fix/<name>`, `refactor/<name>`
7. Never commit directly to `main`

## Code Standards

- Clarity over cleverness. Delete dead code immediately.
- Temporary files in `tmp/` (gitignored).
- Ronen is male — use masculine Hebrew verb forms.

## Session Logging — CRITICAL

After every completed task, IMMEDIATELY append to `SESSION-LOG.md`:
```
### [Task Name]
- ✅/❌ What was done
- Files: [changed files]
- ⚠️ Issues encountered
```
Read `SESSION-LOG.md` at session start.

## PRE-DEPLOY REGRESSION CHECKLIST — MANDATORY

Before ANY deploy, verify ALL of these pass. Do NOT skip.

### Data Display
- [ ] Explore page shows instruments (not 0)
- [ ] Instrument detail shows full name (brand + model + year), not UUID
- [ ] Collections show correct item count (not 0)
- [ ] Collection owner shows display_name, not UUID
- [ ] User Profile shows display_name, follower/following counts
- [ ] Admin panel loads and shows instrument/user counts
- [ ] Homepage "Explore by Make" shows brand data (not empty)

### Navigation
- [ ] Footer: all links resolve (no 404s)
- [ ] Search: results link to correct routes
- [ ] Username links go to correct profile URL (not 404)
- [ ] All nav items work when logged in and logged out

### API Layer
- [ ] No console 406 errors on any page
- [ ] Homepage blocks load from Supabase

### Build
- [ ] npm run build completes with 0 errors
