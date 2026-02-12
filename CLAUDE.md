# TWNG — The World's Next Guitar

## Project

Guitar documentation platform where collectors catalog and share instruments with personal stories and technical specs.

**Primary Codebase:** `~/Desktop/twng-app/` (this is the source of truth for all frontend code)
**Legacy Repo:** `~/NEWTWNG/` (old — do NOT use for frontend work)
**Live URL:** `https://shiny-muffin-21f968.netlify.app`
**Netlify Site ID:** `d44bf75d-badd-4d8e-82b7-c0a755ee922f`
**Supabase Project Ref:** `iqrmwetprpwjgzynrjay`

## Stack

- **Frontend:** React + Vite + JavaScript (.jsx — NOT TypeScript)
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
- **Database:** 62 tables + 3 views + guitar_catalog (419 seed models)
- **Auth:** Email/password + Google OAuth. Uses `user_roles` table + `has_role()` function.
- **Edge Functions:** 8 Lovable functions (Gemini 2.5 Flash) + send-email
- **Styling:** Inline styles + theme tokens (`src/theme/tokens.js`). Design system is OURS.
- **Layout:** `src/components/layout/Layout.jsx` wraps all pages (Navbar + Footer)
- **Deploy:** Netlify with SPA routing (`_redirects` + `netlify.toml`)

## CRITICAL DESIGN RULE
The frontend design, styling, and visual identity is OURS — as seen on https://shiny-muffin-21f968.netlify.app/
DO NOT adopt, copy, or reference any design, layout, or UI components from Lovable's version.
We adopted ONLY Lovable's Supabase backend (database schema, Edge Functions, RLS policies).
The look and feel, components, pages, CSS, and design system are all OURS and must stay as they are.
If in doubt — the live site at the URL above is the source of truth for design.

## Schema Notes (Critical)

Database uses Lovable's schema:
- Table is `instruments` (NOT `guitars`). Uses `make` (NOT `brand`), `uploader_id` + `current_owner_id`.
- Specs stored as JSONB `specs` field (NOT separate columns).
- Enums: `instrument_type`, `timeline_event_type`, `timeline_tier`, `app_role`, `block_type`.
- `guitar_catalog` table is OURS — 419 pre-seeded models.

## Code Standards

- Clean, readable code. Clarity over cleverness.
- Delete orphaned code immediately — no dead code, unused imports.
- Temporary files go in `tmp/` (gitignored).
- Always create a feature branch. Never commit directly to `main`.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linter
```

## Git Workflow

- Protected branches: `main`, `production`
- Branch naming: `feature/<name>`, `fix/<name>`, `refactor/<name>`
- Commit early and often. 5-15 commits per session. Each describes WHAT and WHY.

## Logging

Session logs go to `logs/session-YYYY-MM-DD.log`. Log every action, error, decision. Never delete logs.

## Browser Automation

Playwright MCP available via `mcp__playwright__*` tools for testing, screenshots, E2E flows.

## Architecture Note

This project uses Lovable's Supabase backend (database schema, Edge Functions, RLS policies).
The frontend (`~/Desktop/twng-app/`) was built separately by Ronen + Claude in Cowork sessions.
The legacy repo (`~/NEWTWNG/`) contains an older Lovable-generated frontend — do NOT use it for frontend work.

## Learned Corrections

- User (Ronen) is male — use masculine Hebrew verb forms
- `ownership_claims` table was missing — created during QA
- 5 additional tables created during QA (email_log, email_preferences, email_queue, outreach_log, badge_definitions)
