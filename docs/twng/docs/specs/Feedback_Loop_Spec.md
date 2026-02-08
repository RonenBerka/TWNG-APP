# TWNG — Feedback Loop Specification

> **Feature:** AI Identification Feedback & Learning System
> **Version:** 1.0
> **Status:** Draft

---

## Overview

### Problem
Magic Add (AI guitar identification) will make mistakes. Without a feedback mechanism:
- Same mistakes repeat forever
- No way to improve accuracy over time
- User trust decreases with bad identifications

### Solution
Build a feedback loop where:
1. Users verify or correct AI identifications
2. Verified data is stored in a database
3. Future identifications check verified data first
4. System gets smarter with every correction

### Success Metrics
| Metric | Baseline | Target (6mo) |
|--------|----------|--------------|
| AI accuracy (first guess) | ~70% | 85% |
| User correction rate | Unknown | <15% |
| Verified guitars in DB | 0 | 10,000+ |
| Serial number match rate | 0% | 30% |

---

## User Flows

### Flow 1: Verification (AI was correct)

```
┌─────────────────────────────────────────────┐
│                                             │
│   Magic Add Result                          │
│   ─────────────────                         │
│                                             │
│   🎸 Fender Stratocaster                    │
│   Year: 1965                                │
│   Country: USA                              │
│   Serial: L55832                            │
│                                             │
│   ┌─────────────┐  ┌─────────────┐         │
│   │ ✓ Correct   │  │ ✏️ Edit     │         │
│   └─────────────┘  └─────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

**User clicks "Correct":**
- Guitar saved to collection
- Identification marked as `verified: true`
- Confidence score recorded
- Added to Verified DB

**Data captured:**
```json
{
  "guitar_id": "uuid",
  "identification": {
    "brand": "Fender",
    "model": "Stratocaster",
    "year": 1965,
    "country": "USA",
    "serial": "L55832"
  },
  "verification": {
    "status": "confirmed",
    "source": "user",
    "ai_confidence": 0.92,
    "timestamp": "2026-02-03T..."
  },
  "image_hash": "abc123..."
}
```

---

### Flow 2: Correction (AI was wrong)

```
┌─────────────────────────────────────────────┐
│                                             │
│   Magic Add Result                          │
│   ─────────────────                         │
│                                             │
│   🎸 Gibson Les Paul Standard               │
│   Year: 2018                                │
│   Country: USA                              │
│                                             │
│   ┌─────────────┐  ┌─────────────┐         │
│   │ ✓ Correct   │  │ ✏️ Edit     │         │
│   └─────────────┘  └─────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

**User clicks "Edit":**

```
┌─────────────────────────────────────────────┐
│                                             │
│   Edit Identification                       │
│   ─────────────────                         │
│                                             │
│   Brand:  [Gibson          ▼]  ← kept       │
│   Model:  [Les Paul Classic  ]  ← changed   │
│   Year:   [2019              ]  ← changed   │
│   Country:[USA             ▼]  ← kept       │
│   Serial: [190012345         ]  ← added     │
│                                             │
│   What did we get wrong? (optional)         │
│   ┌─────────────────────────────────────┐   │
│   │ It's a Classic, not Standard.       │   │
│   │ The year is 2019 based on serial.   │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │           Save Correction           │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Data captured:**
```json
{
  "guitar_id": "uuid",
  "ai_guess": {
    "brand": "Gibson",
    "model": "Les Paul Standard",
    "year": 2018,
    "confidence": 0.78
  },
  "user_correction": {
    "brand": "Gibson",
    "model": "Les Paul Classic",
    "year": 2019,
    "serial": "190012345"
  },
  "correction_details": {
    "fields_changed": ["model", "year", "serial"],
    "user_note": "It's a Classic, not Standard...",
    "timestamp": "2026-02-03T..."
  },
  "image_hash": "abc123..."
}
```

---

### Flow 3: Complete Override (AI was very wrong)

```
┌─────────────────────────────────────────────┐
│                                             │
│   Magic Add Result                          │
│   ─────────────────                         │
│                                             │
│   🎸 Epiphone Les Paul                      │
│   Year: 2015                                │
│   Country: China                            │
│                                             │
│   ┌─────────────┐  ┌─────────────┐         │
│   │ ✓ Correct   │  │ ✏️ Edit     │         │
│   └─────────────┘  └─────────────┘         │
│                                             │
│   [ This is completely wrong → ]            │
│                                             │
└─────────────────────────────────────────────┘
```

**User clicks "This is completely wrong":**
- Opens manual entry form (blank)
- Records AI failure for analytics
- User enters correct information from scratch

**Data captured:**
```json
{
  "guitar_id": "uuid",
  "ai_guess": {
    "brand": "Epiphone",
    "model": "Les Paul",
    "year": 2015,
    "confidence": 0.65
  },
  "user_correction": {
    "brand": "Tokai",
    "model": "Love Rock",
    "year": 1982,
    "country": "Japan"
  },
  "correction_type": "complete_override",
  "image_hash": "abc123..."
}
```

---

## Database Schema

### Table: `verified_identifications`

```sql
CREATE TABLE verified_identifications (
  id UUID PRIMARY KEY,
  guitar_id UUID REFERENCES guitars(id),

  -- Identification data
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER,
  year_range VARCHAR(20),  -- "1965-1967" for uncertain
  country VARCHAR(50),
  serial_number VARCHAR(100),

  -- Verification metadata
  verification_status ENUM('confirmed', 'corrected', 'override'),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,

  -- AI performance tracking
  ai_confidence DECIMAL(3,2),
  ai_was_correct BOOLEAN,
  fields_corrected TEXT[],  -- ['model', 'year']

  -- Image reference
  image_hash VARCHAR(64),
  primary_image_url TEXT,

  -- Indexes
  INDEX idx_serial (serial_number),
  INDEX idx_brand_model (brand, model),
  INDEX idx_image_hash (image_hash)
);
```

### Table: `ai_performance_log`

```sql
CREATE TABLE ai_performance_log (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),

  -- What AI guessed
  ai_brand VARCHAR(100),
  ai_model VARCHAR(200),
  ai_year INTEGER,
  ai_confidence DECIMAL(3,2),

  -- What was correct
  correct_brand VARCHAR(100),
  correct_model VARCHAR(200),
  correct_year INTEGER,

  -- Analysis
  was_correct BOOLEAN,
  error_type ENUM('brand', 'model', 'year', 'country', 'complete'),
  user_note TEXT,

  -- Context
  image_quality ENUM('good', 'medium', 'poor'),
  guitar_rarity ENUM('common', 'uncommon', 'rare')
);
```

### Table: `serial_number_registry`

```sql
CREATE TABLE serial_number_registry (
  id UUID PRIMARY KEY,

  serial_number VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200),
  year INTEGER,
  year_range VARCHAR(20),
  country VARCHAR(50),
  factory VARCHAR(100),

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  source ENUM('user', 'import', 'official'),

  -- Uniqueness
  UNIQUE(serial_number, brand)
);
```

---

## Identification Flow (with Feedback Loop)

### Before (Current)

```
Image → AI → Result → Save
```

### After (With Feedback Loop)

```
                    ┌──────────────────┐
                    │   User uploads   │
                    │     image        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Extract serial  │
                    │  (if visible)    │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌────────────────┐           ┌────────────────┐
     │ Serial exists  │    NO     │ Check image    │
     │ in registry?   │ ────────► │ hash in DB?    │
     └───────┬────────┘           └───────┬────────┘
             │ YES                        │
             ▼                            │ NO
     ┌────────────────┐                   │
     │ Return verified│                   ▼
     │ identification │          ┌────────────────┐
     └────────────────┘          │  AI Magic Add  │
                                 │  + RAG context │
                                 └───────┬────────┘
                                         │
                                         ▼
                                ┌────────────────┐
                                │ Show result    │
                                │ to user        │
                                └───────┬────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │                             │
                         ▼                             ▼
                ┌────────────────┐           ┌────────────────┐
                │ User confirms  │           │ User corrects  │
                │ ✓ Correct      │           │ ✏️ Edit        │
                └───────┬────────┘           └───────┬────────┘
                        │                            │
                        ▼                            ▼
                ┌────────────────┐           ┌────────────────┐
                │ Save to        │           │ Save to        │
                │ verified DB    │           │ verified DB +  │
                │ (confirmed)    │           │ log correction │
                └────────────────┘           └────────────────┘
```

---

## RAG Integration (Phase 2)

### How it works

When AI identifies a guitar, enhance the prompt with similar verified examples:

```
System: You are identifying a guitar from an image.

Here are 3 similar verified identifications from our database:

Example 1:
- Image: [similar Les Paul image]
- Verified as: Gibson Les Paul Standard 2018, USA
- Key features: Cream binding, 490R/498T pickups

Example 2:
- Image: [similar Les Paul image]
- Verified as: Gibson Les Paul Classic 2019, USA
- Key features: No binding on neck, 490R/490T pickups

Example 3:
- Image: [similar Les Paul image]
- Verified as: Epiphone Les Paul Standard, China
- Key features: "Gibson" inlay style but Epiphone headstock

Now identify this guitar: [user's image]
```

### Similarity matching

```python
def find_similar_guitars(image, limit=3):
    # Option A: Image embedding similarity
    embedding = get_image_embedding(image)
    similar = vector_db.search(embedding, limit=limit)

    # Option B: Visual feature matching
    features = extract_features(image)  # headstock, body shape, etc.
    similar = db.query(
        brand=features.likely_brand,
        body_type=features.body_type,
        verified=True
    ).limit(limit)

    return similar
```

---

## Analytics Dashboard

### Key Metrics to Track

```
┌─────────────────────────────────────────────────────────┐
│  AI Performance Dashboard                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Overall Accuracy        Error Breakdown                │
│  ┌──────────────┐       ┌──────────────────────────┐   │
│  │              │       │ Brand errors:    5%      │   │
│  │     78%      │       │ Model errors:   12%      │   │
│  │              │       │ Year errors:     8%      │   │
│  │   accurate   │       │ Complete miss:   3%      │   │
│  └──────────────┘       └──────────────────────────┘   │
│                                                         │
│  Accuracy by Brand                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Fender      ████████████████████░░░░  85%        │  │
│  │ Gibson      ███████████████████░░░░░  82%        │  │
│  │ Martin      ████████████████░░░░░░░░  72%        │  │
│  │ PRS         ███████████████████████░  91%        │  │
│  │ Ibanez      ██████████████░░░░░░░░░░  65%        │  │
│  │ Other       ████████░░░░░░░░░░░░░░░░  45%        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Common Mistakes                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Epiphone ↔ Gibson confusion (23 cases)        │  │
│  │ 2. Squier ↔ Fender confusion (18 cases)          │  │
│  │ 3. Year off by 1-2 years (45 cases)              │  │
│  │ 4. Japanese vs USA origin (12 cases)             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Verified DB Growth                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │     ╭──────────────────────╮                     │  │
│  │    ╱                        ╲                    │  │
│  │   ╱                          ────────            │  │
│  │  ╱                                               │  │
│  │ ╱                                                │  │
│  │╱_______________________________________________  │  │
│  │ Jan   Feb   Mar   Apr   May   Jun               │  │
│  │                                    12,450 total │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Skill Document Updates

### Manual update process

Based on analytics, periodically update skill documents:

```markdown
## Common Misidentifications (UPDATE LOG)

### Added 2026-02-15:
- Epiphone vs Gibson: Check headstock shape carefully
  - Gibson: Open-book headstock, "Gibson" in script
  - Epiphone: Similar but "Epiphone" text, often thinner headstock

### Added 2026-02-20:
- Tokai Love Rock often misidentified as Gibson
  - Key difference: "Tokai" on headstock (sometimes small)
  - Serial format: 8-digit starting with year

### Added 2026-03-01:
- Fender MIJ vs MIA identification
  - Check serial prefix: "JV", "SQ", "E", "A" = Japan
  - Check neck pocket stamp if visible
```

---

## Implementation Phases

### Phase 1: Basic Feedback (Launch) ✅

| Task | Priority | Effort |
|------|----------|--------|
| Confirm/Edit buttons on Magic Add result | P0 | 2 days |
| Store verification status in DB | P0 | 1 day |
| Correction form UI | P0 | 2 days |
| Basic logging of AI performance | P1 | 1 day |

**Deliverable:** Users can confirm or correct identifications

---

### Phase 2: Serial Number Matching (Month 2)

| Task | Priority | Effort |
|------|----------|--------|
| Serial number registry table | P0 | 1 day |
| OCR for serial from image | P1 | 3 days |
| Check registry before AI | P0 | 1 day |
| Serial decode integration | P1 | 2 days |

**Deliverable:** Known serials return instant, verified results

---

### Phase 3: Analytics & Insights (Month 3)

| Task | Priority | Effort |
|------|----------|--------|
| AI performance dashboard | P1 | 3 days |
| Error pattern analysis | P1 | 2 days |
| Brand accuracy breakdown | P2 | 1 day |
| Automated alerts for accuracy drops | P2 | 1 day |

**Deliverable:** Visibility into what AI gets wrong

---

### Phase 4: RAG Enhancement (Month 4-6)

| Task | Priority | Effort |
|------|----------|--------|
| Image similarity search | P1 | 5 days |
| RAG prompt integration | P1 | 3 days |
| A/B test RAG vs non-RAG | P1 | 2 days |
| Tune similarity threshold | P2 | 2 days |

**Deliverable:** AI uses verified examples to improve accuracy

---

## API Endpoints

### Submit verification
```
POST /api/identification/verify
{
  "guitar_id": "uuid",
  "status": "confirmed" | "corrected",
  "corrections": {
    "model": "Les Paul Classic",
    "year": 2019
  },
  "note": "Optional user note"
}
```

### Check serial registry
```
GET /api/serial/lookup?serial=L55832&brand=Fender

Response:
{
  "found": true,
  "verified": true,
  "identification": {
    "brand": "Fender",
    "model": "Stratocaster",
    "year": 1965,
    "country": "USA",
    "factory": "Fullerton"
  }
}
```

### Get AI performance stats
```
GET /api/admin/ai-performance?period=30d

Response:
{
  "overall_accuracy": 0.78,
  "by_brand": {
    "Fender": 0.85,
    "Gibson": 0.82,
    ...
  },
  "common_errors": [
    {"from": "Epiphone", "to": "Gibson", "count": 23},
    ...
  ],
  "total_identifications": 1234,
  "total_verified": 892
}
```

---

## Privacy Considerations

### What we store
- Image hash (not the full image, unless user consents)
- Identification data
- Correction data
- No PII linked to corrections

### User consent
```
┌─────────────────────────────────────────────┐
│                                             │
│   Help improve TWNG                         │
│   ─────────────────                         │
│                                             │
│   Your corrections help us identify         │
│   guitars better for everyone.              │
│                                             │
│   ☑️ Share my corrections anonymously       │
│      to improve Magic Add                   │
│                                             │
│   ☐ Keep my corrections private             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Users can confirm AI identification with one click
- [ ] Users can edit/correct identification
- [ ] Corrections are stored in database
- [ ] Basic analytics show correction rate

### Phase 2 Complete When:
- [ ] Serial numbers are matched against registry
- [ ] Known serials skip AI entirely
- [ ] 1,000+ serials in registry

### Phase 3 Complete When:
- [ ] Dashboard shows AI accuracy by brand
- [ ] Top 10 error patterns identified
- [ ] Skill documents updated based on patterns

### Phase 4 Complete When:
- [ ] RAG improves accuracy by 10%+ in A/B test
- [ ] Similar image search working
- [ ] 10,000+ verified identifications in DB

---

## Decisions (Confirmed)

### 1. Image Storage ✅
**Decision:** Opt-in — "Share image to help improve"
- Users choose whether to share their image for training
- Default: Not shared
- If shared: Used for RAG similarity matching
- If not shared: Only hash stored for duplicate detection

### 2. User Incentives ✅
**Decision:** Simple badge — "Helped identify X guitars"
- No complex gamification
- Badge appears on profile
- Counter increments with each verified correction
- Tiers: 10 / 50 / 100 / 500 guitars helped

```
🎸 Guitar Expert
   Helped identify 47 guitars
```

### 3. Conflicting Corrections ✅
**Decision:** Trust score — users with good track record get priority
- New users: trust_score = 1.0
- Correct identifications: +0.1
- Corrections that others confirm: +0.2
- Corrections that get re-corrected: -0.3
- When conflict: Higher trust score wins
- Ties: More recent correction wins

```python
def resolve_conflict(correction_a, correction_b):
    if correction_a.user.trust_score > correction_b.user.trust_score:
        return correction_a
    elif correction_b.user.trust_score > correction_a.user.trust_score:
        return correction_b
    else:
        return most_recent(correction_a, correction_b)
```

### 4. Moderation ✅
**Decision:** Auto-flag extreme changes for review
- Flag if: Brand completely different
- Flag if: Year difference > 20 years
- Flag if: Country changed (USA → China)
- Flag if: User trust_score < 0.5

Flagged corrections:
- Still saved, but marked `needs_review: true`
- Don't affect other identifications until reviewed
- Admin dashboard shows flagged items

```sql
-- Flagged corrections query
SELECT * FROM corrections
WHERE needs_review = true
ORDER BY created_at DESC;
```

---

## Summary: Design Decisions

| Question | Decision |
|----------|----------|
| Image storage | Opt-in sharing |
| User incentives | Simple badge + counter |
| Conflict resolution | Trust score priority |
| Moderation | Auto-flag extreme changes |

---

*"Every correction makes TWNG smarter."*
