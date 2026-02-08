# TWNG System A: Featured Guitar Content
## Make.com Scenario Setup Guide

---

## What This Scenario Does

**Daily automated flow:**
1. Scrapes Instagram for guitar posts from 15 hashtags
2. Filters for posts with 100+ likes and substantial captions
3. Uses Claude to qualify posts (guitar interest + story quality)
4. Generates feature articles for high-scoring posts
5. Creates guitar entries and draft articles in TWNG
6. Logs to Google Sheets for human review
7. Sends Slack notification

**Expected output:** 3-10 featured articles per day, ready for review and outreach.

---

## Files Included

| File | Purpose |
|------|---------|
| `TWNG_System_A_Make_Scenario.json` | Complete scenario with documentation, env vars, setup instructions |
| `TWNG_System_A_Blueprint_Import.json` | Minimal blueprint for direct Make.com import |

---

## Prerequisites

### Accounts Needed
- [ ] **Make.com** - Pro plan ($29/mo) for operations volume
- [ ] **Apify** - Actor subscription ($49/mo)
- [ ] **Anthropic** - Claude API access
- [ ] **Google** - Sheets for tracking
- [ ] **Slack** - For notifications

### TWNG API Endpoints Required
Your TWNG backend needs these endpoints:

```
POST /api/admin/guitars
- Creates guitar entry
- Returns: { id, claim_token }

POST /api/admin/articles
- Creates article draft
- Returns: { id, slug }
```

---

## Setup Steps

### 1. Create Google Sheet

1. Create new Google Spreadsheet
2. Rename first sheet to `Featured Content Queue`
3. Add headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Date | Handle | Original Post URL | Guitar ID | Article ID | Article URL | Title | Score | Guitar | Status | Suggested DM | Followers |

4. Copy Sheet ID from URL: `docs.google.com/spreadsheets/d/[THIS_PART]/edit`

### 2. Set Up Slack

1. Create channel `#twng-content`
2. Install Make.com Slack app to workspace
3. Add app to channel

### 3. Import to Make.com

1. Go to **Scenarios → Create a new scenario**
2. Click the **⋮** menu → **Import Blueprint**
3. Paste contents of `TWNG_System_A_Blueprint_Import.json`
4. Click **Save**

### 4. Connect Services

For each module, click and connect:

| Module | Connection |
|--------|------------|
| Apify (Module 2) | Add Apify API token |
| Claude/OpenAI (Module 5, 8) | Add Anthropic API key* |
| HTTP (Module 10, 11) | No connection needed |
| Google Sheets (Module 12) | Connect Google account |
| Slack (Module 13) | Connect Slack workspace |

*Note: Make.com may not have native Anthropic module. Options:
- Use OpenAI module with Claude model name
- Use HTTP module calling Anthropic API directly
- Use Make's "Claude" app if available

### 5. Configure Variables

Replace these placeholders in the scenario:

| Placeholder | Replace With |
|-------------|--------------|
| `YOUR_TWNG_API_URL` | Your TWNG API base URL (e.g., `https://api.twng.com`) |
| `YOUR_TWNG_API_KEY` | Admin API key for TWNG |
| `YOUR_TWNG_URL` | Frontend URL (e.g., `https://twng.com`) |
| `YOUR_SHEET_ID` | Google Sheet ID from step 1 |

### 6. Test the Scenario

1. Click **Run once**
2. Check each module executes correctly
3. Verify:
   - Posts are being fetched from Apify
   - Claude returns valid JSON
   - Guitar/Article created in TWNG
   - Row added to Google Sheet
   - Slack message received

### 7. Enable Scheduling

1. Click the **clock icon** next to the trigger
2. Set to **Daily at 7:00 AM** (or your preferred time)
3. Toggle scenario **ON**

---

## Module-by-Module Configuration

### Module 2: Apify Instagram Scraper

**Hashtags to scrape** (customize as needed):
```
vintageguitar, guitarcollection, ngd, gibsonlespaul,
fenderstratocaster, gibsoncustom, vintagegibson, vintagefender,
guitargram, geartalk, guitaroftheday, guitarporn,
myguitarcollection, boutiqueguitars
```

**Settings:**
- Results limit: 500 (start with 100 for testing)
- Wait for finish: 600 seconds

### Module 4: Engagement Filter

Conditions (AND):
- `likesCount` >= 100
- `length(caption)` >= 50

Adjust thresholds based on results quality.

### Module 5: Post Qualification (Claude)

**Model:** `claude-sonnet-4-20250514` (or latest Sonnet)
**Max tokens:** 1024
**Temperature:** 0.3 (lower = more consistent)

The prompt evaluates:
- Guitar interest (vintage, rare, famous brand)
- Story quality (personal narrative vs just "NGD")
- Account reachability (follower count)

### Module 7: Feature-Worthy Filter

Only passes posts where:
- `feature_worthy` = true
- `overall_score` >= 7

### Module 8: Article Generation (Claude)

**Model:** `claude-sonnet-4-20250514`
**Max tokens:** 2048
**Temperature:** 0.7 (higher = more creative)

Generates:
- Title (6-10 words)
- Subtitle
- Body (200-350 words)
- Tags
- Category

---

## Troubleshooting

### "No items found" from Apify
- Check hashtags are spelled correctly
- Verify Apify token is valid
- Instagram may have rate-limited; wait and retry

### Claude returns invalid JSON
- Check prompt isn't being truncated
- Verify max_tokens is sufficient (1024 for qualification, 2048 for articles)
- Add "JSON only, no explanation" reminder to prompt

### HTTP module fails
- Verify TWNG API endpoints exist and accept the payload format
- Check API key permissions
- Look at error response body for details

### Google Sheets permission error
- Re-authorize Google connection
- Verify sheet ID is correct
- Check sheet name matches exactly: "Featured Content Queue"

---

## Cost Estimates

| Component | Cost/Run | Monthly (30 runs) |
|-----------|----------|-------------------|
| Apify | $1-2 | $30-60 |
| Claude (qualification) | $0.02/post × 100 = $2 | $60 |
| Claude (articles) | $0.05/article × 10 = $0.50 | $15 |
| Make.com | — | $29 |
| **Total** | **~$5/run** | **~$135-165** |

Start with lower volume (100 posts) while testing.

---

## Human Review Workflow

After scenario runs:

1. Check Slack for notifications
2. Open Google Sheet "Featured Content Queue"
3. For each `pending_review` row:
   - Click Article URL to review
   - Edit if needed in TWNG admin
   - Approve or reject
4. For approved articles:
   - Copy suggested DM from column K
   - Send via Instagram
   - Update status to `sent`
5. Track responses and conversions

---

## Next Steps

After System A is running:
- **Week 2:** Implement System B (Pre-Built Collections)
- **Week 3:** Add System C (Content Distribution)
- **Week 4:** Set up System D (Email Sequences)

---

*Questions? Check the full automation playbook or reach out.*
