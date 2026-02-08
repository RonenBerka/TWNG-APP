# Feedback Loop — Developer Implementation Guide

> **For:** Development Team
> **Feature:** AI Identification Feedback System
> **Reference:** `Feedback_Loop_Spec.md`

---

## TL;DR

Build a system where users verify/correct AI guitar identifications, and the system gets smarter over time.

```
User uploads photo → AI identifies → User confirms/corrects → Save to DB → Better future IDs
```

---

## Database Changes

### New Tables

```sql
-- Verified identifications from users
CREATE TABLE verified_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guitar_id UUID NOT NULL REFERENCES guitars(id) ON DELETE CASCADE,

  -- Identification data
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200) NOT NULL,
  year INTEGER,
  year_range VARCHAR(20),
  country VARCHAR(50),
  serial_number VARCHAR(100),

  -- Verification metadata
  verification_status VARCHAR(20) NOT NULL, -- 'confirmed', 'corrected', 'override'
  verified_by UUID NOT NULL REFERENCES users(id),
  verified_at TIMESTAMP DEFAULT NOW(),

  -- AI tracking
  ai_confidence DECIMAL(3,2),
  ai_was_correct BOOLEAN,
  fields_corrected TEXT[],

  -- Image
  image_hash VARCHAR(64),
  image_shared BOOLEAN DEFAULT false,

  -- Moderation
  needs_review BOOLEAN DEFAULT false,
  flag_reason VARCHAR(100),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vi_serial ON verified_identifications(serial_number);
CREATE INDEX idx_vi_brand_model ON verified_identifications(brand, model);
CREATE INDEX idx_vi_image_hash ON verified_identifications(image_hash);
CREATE INDEX idx_vi_needs_review ON verified_identifications(needs_review) WHERE needs_review = true;


-- Serial number registry (known serials)
CREATE TABLE serial_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  serial_number VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200),
  year INTEGER,
  year_range VARCHAR(20),
  country VARCHAR(50),
  factory VARCHAR(100),

  -- Source
  source VARCHAR(20) NOT NULL, -- 'user', 'import', 'official'
  verified BOOLEAN DEFAULT false,
  contributed_by UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(serial_number, brand)
);

CREATE INDEX idx_sr_serial ON serial_registry(serial_number);
CREATE INDEX idx_sr_brand ON serial_registry(brand);


-- AI performance logging
CREATE TABLE ai_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- AI guess
  ai_brand VARCHAR(100),
  ai_model VARCHAR(200),
  ai_year INTEGER,
  ai_confidence DECIMAL(3,2),

  -- Actual (from user)
  actual_brand VARCHAR(100),
  actual_model VARCHAR(200),
  actual_year INTEGER,

  -- Analysis
  was_correct BOOLEAN,
  error_type VARCHAR(20), -- 'brand', 'model', 'year', 'country', 'complete'
  fields_wrong TEXT[],
  user_note TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_apl_created ON ai_performance_log(created_at);
CREATE INDEX idx_apl_brand ON ai_performance_log(ai_brand);
CREATE INDEX idx_apl_error ON ai_performance_log(error_type);
```

### Alter Existing Tables

```sql
-- Users table
ALTER TABLE users ADD COLUMN trust_score DECIMAL(3,2) DEFAULT 1.00;
ALTER TABLE users ADD COLUMN guitars_helped INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN share_images BOOLEAN DEFAULT false;

-- Guitars table (if not exists)
ALTER TABLE guitars ADD COLUMN verification_status VARCHAR(20); -- 'pending', 'verified'
ALTER TABLE guitars ADD COLUMN image_shared BOOLEAN DEFAULT false;
```

---

## API Endpoints

### 1. Submit Verification

```
POST /api/v1/identifications/verify

Request:
{
  "guitar_id": "uuid",
  "status": "confirmed" | "corrected" | "override",
  "ai_guess": {
    "brand": "Gibson",
    "model": "Les Paul Standard",
    "year": 2018,
    "confidence": 0.78
  },
  "final_identification": {
    "brand": "Gibson",
    "model": "Les Paul Classic",
    "year": 2019,
    "country": "USA",
    "serial_number": "190012345"
  },
  "corrections_note": "It's a Classic, not Standard",
  "share_image": true
}

Response:
{
  "success": true,
  "verification_id": "uuid",
  "user_stats": {
    "guitars_helped": 48,
    "trust_score": 1.2
  },
  "flagged": false
}
```

### 2. Lookup Serial Number

```
GET /api/v1/serial/lookup?serial={serial}&brand={brand}

Response (found):
{
  "found": true,
  "verified": true,
  "identification": {
    "brand": "Fender",
    "model": "Stratocaster",
    "year": 1965,
    "country": "USA",
    "factory": "Fullerton"
  },
  "source": "user",
  "confidence": "high"
}

Response (not found):
{
  "found": false
}
```

### 3. Check Image Hash

```
GET /api/v1/identifications/by-hash?hash={image_hash}

Response:
{
  "found": true,
  "identification": { ... },
  "verified": true
}
```

### 4. Get AI Performance Stats (Admin)

```
GET /api/v1/admin/ai-performance?period=30d

Response:
{
  "period": "30d",
  "total_identifications": 1234,
  "total_verified": 892,
  "overall_accuracy": 0.78,
  "accuracy_by_brand": {
    "Fender": { "total": 234, "correct": 199, "accuracy": 0.85 },
    "Gibson": { "total": 189, "correct": 155, "accuracy": 0.82 },
    ...
  },
  "common_errors": [
    { "ai_guess": "Gibson", "actual": "Epiphone", "count": 23 },
    { "ai_guess": "Fender", "actual": "Squier", "count": 18 },
    ...
  ],
  "error_breakdown": {
    "brand": 45,
    "model": 89,
    "year": 67,
    "complete": 12
  }
}
```

### 5. Get Moderation Queue (Admin)

```
GET /api/v1/admin/moderation/queue?limit=50

Response:
{
  "items": [
    {
      "id": "uuid",
      "guitar_id": "uuid",
      "user_id": "uuid",
      "user_trust_score": 0.4,
      "flag_reason": "brand_changed",
      "ai_guess": { "brand": "Fender", ... },
      "user_correction": { "brand": "Tokai", ... },
      "created_at": "2026-02-03T...",
      "image_url": "..."
    },
    ...
  ],
  "total_pending": 12
}
```

### 6. Review Flagged Item (Admin)

```
POST /api/v1/admin/moderation/review

Request:
{
  "verification_id": "uuid",
  "decision": "approve" | "reject",
  "note": "Correct identification, user knows Tokai"
}

Response:
{
  "success": true,
  "user_trust_updated": true,
  "new_trust_score": 0.5
}
```

---

## Core Functions

### Trust Score Management

```typescript
// services/trust-score.ts

const TRUST_SCORE_ADJUSTMENTS = {
  CONFIRMATION: 0.1,      // User confirmed, AI was right
  CORRECTION_CONFIRMED: 0.2,  // User corrected, later verified correct
  CORRECTION_REJECTED: -0.3,  // User corrected, but was wrong
  FLAGGED_APPROVED: 0.1,  // Flagged correction was approved
  FLAGGED_REJECTED: -0.5, // Flagged correction was rejected
};

const MIN_TRUST_SCORE = 0.0;
const MAX_TRUST_SCORE = 2.0;

async function updateTrustScore(
  userId: string,
  adjustment: number
): Promise<number> {
  const user = await db.users.findById(userId);

  let newScore = user.trust_score + adjustment;
  newScore = Math.max(MIN_TRUST_SCORE, Math.min(MAX_TRUST_SCORE, newScore));

  await db.users.update(userId, { trust_score: newScore });

  return newScore;
}

async function resolveConflict(
  correctionA: Correction,
  correctionB: Correction
): Promise<Correction> {
  const userA = await db.users.findById(correctionA.user_id);
  const userB = await db.users.findById(correctionB.user_id);

  if (userA.trust_score > userB.trust_score) {
    return correctionA;
  } else if (userB.trust_score > userA.trust_score) {
    return correctionB;
  } else {
    // Tie: most recent wins
    return correctionA.created_at > correctionB.created_at
      ? correctionA
      : correctionB;
  }
}
```

### Auto-Flag Logic

```typescript
// services/moderation.ts

interface FlagResult {
  shouldFlag: boolean;
  reason: string | null;
}

function checkForFlags(
  aiGuess: Identification,
  userCorrection: Identification,
  userTrustScore: number
): FlagResult {

  // Flag if brand completely different
  if (aiGuess.brand.toLowerCase() !== userCorrection.brand.toLowerCase()) {
    return { shouldFlag: true, reason: 'brand_changed' };
  }

  // Flag if year difference > 20
  if (aiGuess.year && userCorrection.year) {
    const yearDiff = Math.abs(aiGuess.year - userCorrection.year);
    if (yearDiff > 20) {
      return { shouldFlag: true, reason: 'year_extreme_diff' };
    }
  }

  // Flag if country changed from premium to budget
  const premiumCountries = ['USA', 'Japan'];
  const budgetCountries = ['China', 'Indonesia'];
  if (
    premiumCountries.includes(aiGuess.country) &&
    budgetCountries.includes(userCorrection.country)
  ) {
    return { shouldFlag: true, reason: 'country_downgrade' };
  }

  // Flag if user has low trust score
  if (userTrustScore < 0.5) {
    return { shouldFlag: true, reason: 'low_trust_user' };
  }

  return { shouldFlag: false, reason: null };
}
```

### Badge Calculation

```typescript
// services/badges.ts

interface Badge {
  name: string;
  tier: number;
  threshold: number;
}

const GUITAR_HELPER_BADGES: Badge[] = [
  { name: 'Guitar Helper', tier: 1, threshold: 10 },
  { name: 'Guitar Expert', tier: 2, threshold: 50 },
  { name: 'Guitar Master', tier: 3, threshold: 100 },
  { name: 'Guitar Legend', tier: 4, threshold: 500 },
];

function getBadge(guitarsHelped: number): Badge | null {
  for (let i = GUITAR_HELPER_BADGES.length - 1; i >= 0; i--) {
    if (guitarsHelped >= GUITAR_HELPER_BADGES[i].threshold) {
      return GUITAR_HELPER_BADGES[i];
    }
  }
  return null;
}

async function incrementGuitarsHelped(userId: string): Promise<void> {
  await db.users.increment(userId, 'guitars_helped', 1);
}
```

### Image Hash Generation

```typescript
// services/image-hash.ts

import { createHash } from 'crypto';
import sharp from 'sharp';

async function generateImageHash(imageBuffer: Buffer): Promise<string> {
  // Resize to standard size for consistent hashing
  const normalized = await sharp(imageBuffer)
    .resize(256, 256, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  return createHash('sha256').update(normalized).digest('hex');
}
```

---

## Identification Flow

```typescript
// services/identification.ts

async function identifyGuitar(
  imageBuffer: Buffer,
  userId: string
): Promise<IdentificationResult> {

  // 1. Generate image hash
  const imageHash = await generateImageHash(imageBuffer);

  // 2. Check if we've seen this exact image before
  const existingByHash = await db.verifiedIdentifications.findByHash(imageHash);
  if (existingByHash && existingByHash.verified) {
    return {
      source: 'cache',
      identification: existingByHash,
      confidence: 1.0
    };
  }

  // 3. Try to extract serial number from image (OCR)
  const serialNumber = await extractSerialFromImage(imageBuffer);

  // 4. Check serial registry
  if (serialNumber) {
    const existingBySerial = await db.serialRegistry.findBySerial(serialNumber);
    if (existingBySerial && existingBySerial.verified) {
      return {
        source: 'serial_match',
        identification: existingBySerial,
        confidence: 0.99,
        serial_matched: true
      };
    }
  }

  // 5. Get similar verified identifications for RAG (Phase 2)
  const similarExamples = await findSimilarVerified(imageBuffer, 3);

  // 6. Call AI with context
  const aiResult = await callAI(imageBuffer, {
    examples: similarExamples,
    serialHint: serialNumber
  });

  return {
    source: 'ai',
    identification: aiResult.identification,
    confidence: aiResult.confidence,
    similar_examples: similarExamples.length
  };
}
```

---

## Frontend Components

### VerificationButtons Component

```tsx
// components/VerificationButtons.tsx

interface Props {
  guitarId: string;
  aiGuess: Identification;
  onConfirm: () => void;
  onEdit: () => void;
}

export function VerificationButtons({ guitarId, aiGuess, onConfirm, onEdit }: Props) {
  return (
    <div className="flex gap-3 mt-4">
      <Button
        variant="primary"
        onClick={onConfirm}
        icon={<CheckIcon />}
      >
        Correct
      </Button>
      <Button
        variant="secondary"
        onClick={onEdit}
        icon={<EditIcon />}
      >
        Edit
      </Button>
    </div>
  );
}
```

### CorrectionForm Component

```tsx
// components/CorrectionForm.tsx

interface Props {
  aiGuess: Identification;
  onSubmit: (correction: Identification, note: string) => void;
  onCancel: () => void;
}

export function CorrectionForm({ aiGuess, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState(aiGuess);
  const [note, setNote] = useState('');

  return (
    <form onSubmit={() => onSubmit(form, note)}>
      <Input
        label="Brand"
        value={form.brand}
        onChange={v => setForm({...form, brand: v})}
      />
      <Input
        label="Model"
        value={form.model}
        onChange={v => setForm({...form, model: v})}
      />
      <Input
        label="Year"
        type="number"
        value={form.year}
        onChange={v => setForm({...form, year: parseInt(v)})}
      />
      <Input
        label="Serial Number"
        value={form.serial_number}
        onChange={v => setForm({...form, serial_number: v})}
      />
      <Textarea
        label="What did we get wrong? (optional)"
        value={note}
        onChange={setNote}
        placeholder="Help us improve..."
      />
      <div className="flex gap-3 mt-4">
        <Button type="submit" variant="primary">
          Save Correction
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### ImageShareOptIn Component

```tsx
// components/ImageShareOptIn.tsx

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ImageShareOptIn({ checked, onChange }: Props) {
  return (
    <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
      <Checkbox checked={checked} onChange={onChange} />
      <div>
        <p className="font-medium">Help improve TWNG</p>
        <p className="text-sm text-gray-600">
          Share this image anonymously to help us identify guitars better for everyone.
        </p>
      </div>
    </label>
  );
}
```

### BadgeDisplay Component

```tsx
// components/BadgeDisplay.tsx

interface Props {
  guitarsHelped: number;
}

export function BadgeDisplay({ guitarsHelped }: Props) {
  const badge = getBadge(guitarsHelped);

  if (!badge) return null;

  return (
    <div className="flex items-center gap-2 text-amber-600">
      <GuitarIcon className="w-5 h-5" />
      <div>
        <p className="font-medium">{badge.name}</p>
        <p className="text-xs text-gray-500">
          Helped identify {guitarsHelped} guitars
        </p>
      </div>
    </div>
  );
}
```

---

## Implementation Checklist

### Sprint 1: Basic Feedback (P0)

- [ ] Database: Create `verified_identifications` table
- [ ] Database: Add `trust_score`, `guitars_helped` to users
- [ ] API: `POST /api/v1/identifications/verify`
- [ ] API: `GET /api/v1/identifications/by-hash`
- [ ] Frontend: VerificationButtons component
- [ ] Frontend: CorrectionForm component
- [ ] Backend: Image hash generation
- [ ] Backend: Basic AI performance logging

### Sprint 2: Trust & Moderation (P1)

- [ ] Database: Add moderation fields to verified_identifications
- [ ] Backend: Trust score service
- [ ] Backend: Auto-flag logic
- [ ] API: `GET /api/v1/admin/moderation/queue`
- [ ] API: `POST /api/v1/admin/moderation/review`
- [ ] Frontend: Admin moderation dashboard
- [ ] Backend: Conflict resolution logic

### Sprint 3: Serial Registry (P1)

- [ ] Database: Create `serial_registry` table
- [ ] API: `GET /api/v1/serial/lookup`
- [ ] Backend: Serial lookup in identification flow
- [ ] Backend: OCR for serial extraction (optional)
- [ ] Frontend: Serial match indicator

### Sprint 4: User Engagement (P2)

- [ ] Database: Add `share_images` to users
- [ ] Frontend: ImageShareOptIn component
- [ ] Frontend: BadgeDisplay component
- [ ] Backend: Badge calculation
- [ ] Frontend: User profile badges section
- [ ] Backend: Image sharing pipeline

### Sprint 5: Analytics (P2)

- [ ] API: `GET /api/v1/admin/ai-performance`
- [ ] Frontend: AI performance dashboard
- [ ] Backend: Error pattern analysis
- [ ] Backend: Accuracy by brand reporting

### Phase 2: RAG Integration

- [ ] Backend: Similar image search
- [ ] Backend: RAG prompt enhancement
- [ ] A/B testing framework
- [ ] Performance comparison

---

## Environment Variables

```env
# Feature flags
ENABLE_FEEDBACK_LOOP=true
ENABLE_IMAGE_SHARING=true
ENABLE_SERIAL_LOOKUP=true
ENABLE_RAG=false  # Phase 2

# Thresholds
TRUST_SCORE_FLAG_THRESHOLD=0.5
YEAR_DIFF_FLAG_THRESHOLD=20

# Storage
SHARED_IMAGES_BUCKET=twng-shared-images

# AI
AI_MODEL=claude-3-sonnet
AI_CONFIDENCE_THRESHOLD=0.6
```

---

## Testing Notes

### Unit Tests Needed

- Trust score calculations
- Auto-flag logic
- Badge tier calculation
- Image hash generation
- Conflict resolution

### Integration Tests Needed

- Full verification flow (confirm)
- Full verification flow (correct)
- Serial lookup flow
- Moderation approval/rejection

### Manual Testing

- [ ] Verify correct guitar → saved, trust +0.1
- [ ] Correct wrong identification → logged, trust maintained
- [ ] Extreme correction → flagged
- [ ] Low trust user → all corrections flagged
- [ ] Admin approve flagged → user trust restored
- [ ] Serial match → instant result

---

## Questions for Team

1. Do we need real-time trust score display, or is background calculation OK?
2. Should badges be animated when earned?
3. Admin dashboard: separate app or integrated?
4. OCR for serial: build or use API (Google Vision, AWS Textract)?

---

*Last updated: February 2026*
