# TWNG — Success Metrics

---

## North Star Metric

### **Guitars Documented**

**Why this metric:**
- Directly measures core value delivered
- Leading indicator of engagement
- Easy to understand
- Hard to game

**Formula:**
```
Total guitars added by all users
```

**Targets:**

| Timeframe | Target |
|-----------|--------|
| Month 1 | 500 |
| Month 3 | 2,500 |
| Month 6 | 10,000 |
| Year 1 | 50,000 |

---

## Primary Metrics

### 1. User Acquisition

| Metric | Definition | Target (Month 3) |
|--------|------------|------------------|
| Signups | New accounts created | 1,500 |
| Signup completion rate | Signups / Signup starts | 85% |
| Cost per acquisition | Marketing spend / Signups | <$2 |

### 2. Activation

| Metric | Definition | Target |
|--------|------------|--------|
| First guitar rate | Users who add ≥1 guitar | 70% |
| Time to first guitar | Median time from signup | <24 hours |
| Magic Add usage | % of guitars added via Magic Add | 50% |

### 3. Engagement

| Metric | Definition | Target |
|--------|------------|--------|
| Guitars per user | Average guitars per active user | 3+ |
| Weekly active users (WAU) | Users active in last 7 days | 30% of signups |
| Monthly active users (MAU) | Users active in last 30 days | 50% of signups |
| Session duration | Average time per session | 5+ minutes |

### 4. Retention

| Metric | Definition | Target |
|--------|------------|--------|
| Day 1 retention | % returning within 24h | 40% |
| Day 7 retention | % returning within 7 days | 25% |
| Day 30 retention | % returning within 30 days | 15% |
| Churn (inactive 60+ days) | % going dormant | <50% |

### 5. Revenue (Post-Launch)

| Metric | Definition | Target (Month 6) |
|--------|------------|------------------|
| Conversion to Pro | Free → Pro upgrade rate | 3-5% |
| Monthly recurring revenue | Pro subscriptions × $5 | $250+ |
| Average revenue per user | Total revenue / Total users | $0.15+ |

---

## Secondary Metrics

### Content & Discovery

| Metric | Definition | Why It Matters |
|--------|------------|----------------|
| Stories added | Guitars with stories written | Engagement depth |
| Photos per guitar | Average photos uploaded | Documentation quality |
| Serial numbers decoded | Uses of decode feature | Feature value |
| Public guitars | Guitars made visible | Community growth |

### Growth

| Metric | Definition | Why It Matters |
|--------|------------|----------------|
| Organic traffic | Visitors from search | SEO success |
| Referral signups | Signups from shared links | Word of mouth |
| Social followers | Instagram/YouTube followers | Brand awareness |
| Outreach response rate | System B message responses | Automation success |

### Product Quality

| Metric | Definition | Why It Matters |
|--------|------------|----------------|
| Magic Add accuracy | Correct identifications | Feature reliability |
| Error rate | Errors / Actions | Product stability |
| Support tickets | Tickets per 100 users | User friction |
| NPS score | Net Promoter Score | User satisfaction |

---

## Metric Definitions

### Active User
```
Performed at least one of:
- Added a guitar
- Edited a guitar
- Viewed collection
- Used Magic Add

Within the specified time period.
```

### Activated User
```
Has added at least 1 guitar to collection.
```

### Engaged User
```
Has added at least 3 guitars
AND visited at least 2x in last 30 days.
```

### Retained User
```
Visited at least once in the specified period
after initial signup.
```

---

## Dashboard Structure

### Daily Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ TWNG Daily Metrics — [Date]                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Signups Today: 45        Guitars Added: 78                 │
│  ▲ +12 vs yesterday       ▲ +23 vs yesterday               │
│                                                             │
│  Activation Rate: 68%     Magic Add Uses: 42                │
│                                                             │
│  Errors: 3                Support Tickets: 1                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Weekly Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ TWNG Weekly Metrics — Week of [Date]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Total Guitars: 2,456     Total Users: 823                  │
│                                                             │
│  New This Week:                                             │
│  - Signups: 187 (▲ 15%)                                    │
│  - Guitars: 412 (▲ 22%)                                    │
│  - Stories: 89                                              │
│                                                             │
│  Engagement:                                                │
│  - WAU: 312 (38%)                                          │
│  - Avg guitars/user: 3.1                                   │
│  - Avg session: 6.2 min                                    │
│                                                             │
│  Retention:                                                 │
│  - D7: 26%                                                 │
│  - D30: 14%                                                │
│                                                             │
│  Funnel:                                                    │
│  - Visits → Signup: 12%                                    │
│  - Signup → First Guitar: 71%                              │
│  - First → Second Guitar: 45%                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Monthly Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ TWNG Monthly Report — [Month]                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NORTH STAR                                                 │
│  Total Guitars Documented: 4,892                            │
│  ▲ +1,823 this month (+59%)                                │
│                                                             │
│  ACQUISITION                                                │
│  New Users: 612                                             │
│  Traffic: 8,400 visits                                      │
│  Conversion: 7.3%                                           │
│                                                             │
│  ACTIVATION                                                 │
│  First Guitar Rate: 72%                                     │
│  Time to First: 18 hours (median)                          │
│                                                             │
│  ENGAGEMENT                                                 │
│  MAU: 489 (60% of total)                                   │
│  Guitars/User: 3.4                                         │
│  Stories Written: 387                                       │
│                                                             │
│  RETENTION                                                  │
│  D30 Retention: 16%                                        │
│  Churn Rate: 42%                                           │
│                                                             │
│  REVENUE                                                    │
│  Pro Conversions: 18                                        │
│  MRR: $90                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Funnel Analysis

### Core Funnel

```
Visit → Signup → Verify → First Guitar → Second Guitar → Retained

Stage               Target    Action if Below
─────────────────────────────────────────────────
Visit → Signup      12%       Improve landing page
Signup → Verify     95%       Fix email delivery
Verify → First      70%       Improve onboarding
First → Second      50%       Better prompts
Second → Retained   40%       Re-engagement emails
```

### Magic Add Funnel

```
Start Magic Add → Photo Taken → Identified → Confirmed → Saved

Stage               Target    Action if Below
─────────────────────────────────────────────────
Start → Photo       90%       UX improvement
Photo → Identified  80%       AI accuracy
Identified → Confirm 85%      Better UI
Confirm → Saved     95%       Bug fix
```

---

## Cohort Analysis

### Track by Signup Week

| Cohort | Week 1 | Week 2 | Week 4 | Week 8 |
|--------|--------|--------|--------|--------|
| Jan 1 | 100% | 45% | 28% | 18% |
| Jan 8 | 100% | 48% | 30% | — |
| Jan 15 | 100% | 52% | — | — |
| Jan 22 | 100% | — | — | — |

**What to look for:**
- Is retention improving over time?
- Which cohorts perform better? (Why?)
- When does drop-off stabilize?

---

## Alerting

### Critical Alerts (Immediate)

| Condition | Action |
|-----------|--------|
| Error rate > 5% | Page on-call |
| Signup broken | Page on-call |
| Database down | Page on-call |

### Warning Alerts (Daily Review)

| Condition | Action |
|-----------|--------|
| Signups down >30% vs last week | Investigate |
| Activation rate <60% | Review onboarding |
| Magic Add accuracy <60% | Review AI |

---

## Success Milestones

### Month 1 — "It Works"
- [ ] 500+ guitars documented
- [ ] 200+ users
- [ ] 70%+ first guitar rate
- [ ] No critical bugs

### Month 3 — "Growth"
- [ ] 2,500+ guitars
- [ ] 1,000+ users
- [ ] 25%+ D7 retention
- [ ] First Pro conversions

### Month 6 — "Traction"
- [ ] 10,000+ guitars
- [ ] 3,000+ users
- [ ] $250+ MRR
- [ ] 1,000+ organic monthly visits

### Year 1 — "Product-Market Fit"
- [ ] 50,000+ guitars
- [ ] 10,000+ users
- [ ] 20%+ D30 retention
- [ ] $2,500+ MRR
- [ ] Positive unit economics

---

## Tools & Implementation

### Analytics Stack

| Purpose | Tool | Cost |
|---------|------|------|
| Product analytics | Mixpanel or Amplitude | Free tier |
| Web analytics | Google Analytics 4 | Free |
| Error tracking | Sentry | Free tier |
| Database queries | Supabase dashboard | Included |
| Dashboards | Notion or Sheets | Free |

### Event Tracking

```javascript
// Key events to track

// Acquisition
track('signup_started')
track('signup_completed')

// Activation
track('guitar_added', { method: 'magic_add' | 'manual' })
track('magic_add_started')
track('magic_add_completed', { accuracy: 'correct' | 'edited' | 'wrong' })

// Engagement
track('story_added')
track('photo_uploaded')
track('serial_decoded')
track('collection_viewed')

// Monetization
track('upgrade_prompt_shown')
track('upgrade_started')
track('upgrade_completed')
```

---

## Review Cadence

| Review | Frequency | Attendees | Focus |
|--------|-----------|-----------|-------|
| Daily standup | Daily | Team | Issues, blockers |
| Weekly metrics | Weekly | Team | Dashboard review |
| Monthly deep-dive | Monthly | Founders | Strategy, pivots |
| Quarterly review | Quarterly | All | Goals, planning |
