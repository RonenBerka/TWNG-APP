# Testing — the automatic safety net

This project has an automatic testing net. Its job is simple: catch broken
things **before** they reach the live site, without costing you any time. It
runs by itself. Green means safe; red means a real problem.

A guiding rule: **no false alarms.** Every check here only fails on a genuine
regression, never on pre-existing noise. If a check ever cries wolf, we fix the
check — a net you can't trust is worse than no net.

## The four layers

| Layer | What it checks | Command |
|------|----------------|---------|
| 1. Unit tests | The logic core — serial-number decoding and content-visibility rules | `npm test` |
| 2. Pulse | A running site is up and serving the app shell | `npm run smoke` |
| 3. Real browser | The app actually boots and navigates in a real Chromium | `npm run test:e2e` |
| 4. The gate | Runs 1–3 automatically on every push / pull request | GitHub Actions (`.github/workflows/ci.yml`) |

### Layer 1 — Unit tests (`npm test`)

Fast, pure-logic checks (milliseconds). They pin down the two most important
pieces of logic:

- `src/lib/serialDecoder.js` — decoding serials for all 10 brands.
- `src/lib/visibility.js` — who is allowed to see owner-created content.

Add `npm run test:coverage` to see how much of the logic is covered.

### Layer 2 — Pulse (`npm run smoke`)

A two-second check with no browser. Confirms a deployment is being served and
returns the app shell. Point it anywhere:

```bash
npm run smoke                          # checks the live site
npm run smoke -- http://localhost:4173 # checks a local preview
```

Use it right after a deploy to confirm the live site is alive.

### Layer 3 — Real browser (`npm run test:e2e`)

Launches a real Chromium, builds and serves the production bundle with *dummy*
Supabase credentials, and verifies the app mounts and routes (home, `/explore`,
`/decoder`) with **zero crashes**. Because it uses dummy data on purpose, it
only checks the app shell and navigation — never data — so it never false-alarms.

### Layer 4 — The gate (automatic)

`.github/workflows/ci.yml` runs Layers 1 and 3 plus a production build on every
push to `main` and every pull request. It **blocks** on anything that is green
today, so a red check always means a real regression.

Linting runs too, but only for information — the codebase currently has known
legacy lint errors, so failing the gate on them would be a false alarm. Once
those are cleaned up, flip the lint step to blocking (remove `continue-on-error`).

## The one habit that makes this compound

**Every time a bug is found, add a test for it before fixing it.**

That one test means the bug can never silently come back. Do this every time and
the app only gets stronger over time — automatically, without you having to
remember anything. That is the whole point.

## Growing the net later

- **More unit tests** — the adapters in `src/lib/supabase/adapters.js` and other
  pure helpers are the next high-value, low-effort targets.
- **Authenticated flows** (sign up → add guitar → transfer) — these need a
  dedicated test account and a test Supabase project, so they were intentionally
  left out for now rather than faked. When you have a throwaway account, they can
  be added to `e2e/` as real user-journey tests.
