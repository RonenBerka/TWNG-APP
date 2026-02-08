# TWNG Guitar Post Extractor - Supabase Edge Function

## מה זה?

Edge Function שרצה בשרת של Supabase ושולפת מידע מפוסטים ברשתות החברתיות.

**למה צריך את זה?**
- דפדפן לא יכול לשלוף מאתרים אחרים (CORS)
- Edge Function רצה בשרת → אין CORS → עובד

---

## התקנה

### 1. התקן Supabase CLI

```bash
# Mac
brew install supabase/tap/supabase

# או עם npm
npm install -g supabase
```

### 2. התחבר לפרויקט

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

### 3. העלה את ה-Function

```bash
cd TWNG/supabase-functions
supabase functions deploy extract-post
```

---

## שימוש

### קריאה מהקוד (Frontend)

```typescript
const { data, error } = await supabase.functions.invoke('extract-post', {
  body: {
    url: 'https://www.reddit.com/r/gibson/comments/1qtxv0d/my_road_to_sg/'
  }
})

console.log(data)
// {
//   success: true,
//   post: { author, title, text, images, ... },
//   guitar: { brand: 'Gibson', model: 'SG', year: '61', color: 'Vintage Cherry', ... },
//   outreach: { en: '...', he: '...' },
//   claim_token: 'uuid-xxx-xxx',
//   status: 'unclaimed'
// }
```

### קריאה ישירה (cURL)

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/extract-post' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://www.reddit.com/r/gibson/comments/1qtxv0d/my_road_to_sg/"}'
```

---

## מה ה-Function מחזירה?

```json
{
  "success": true,
  "post": {
    "source": "reddit",
    "source_url": "https://reddit.com/r/gibson/comments/...",
    "author": "Fun_Road_8187",
    "author_url": "https://reddit.com/u/Fun_Road_8187",
    "title": "My road to SG",
    "text": "Finally, i got a SG...",
    "images": ["https://preview.redd.it/...jpg", "..."],
    "subreddit": "gibson",
    "created_at": "2024-..."
  },
  "guitar": {
    "brand": "Gibson",
    "model": "SG",
    "year": "61",
    "color": "Vintage Cherry",
    "serial": null,
    "story": "Finally, i got a SG...",
    "images": ["..."]
  },
  "outreach": {
    "en": "Hey Fun_Road_8187! 👋 ...",
    "he": "היי Fun_Road_8187! 👋 ..."
  },
  "claim_token": "550e8400-e29b-41d4-a716-446655440000",
  "extracted_at": "2024-...",
  "status": "unclaimed"
}
```

---

## Flow מלא ב-TWNG

```
┌─────────────────────────────────────────────────────────┐
│  TWNG Admin Dashboard                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🔗 הדבק URL של פוסט:                              │  │
│  │  [https://reddit.com/r/gibson/...        ] [שלוף] │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Edge Function: extract-post                   │
│  • שולף את הפוסט מרדיט                                  │
│  • מחלץ: מותג, דגם, שנה, צבע                            │
│  • מייצר הודעת פנייה                                    │
│  • מייצר claim_token                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase DB: unclaimed_guitars                         │
│  • brand, model, year, color                            │
│  • story, images                                        │
│  • source_url, source_author                            │
│  • claim_token                                          │
│  • status: 'unclaimed'                                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Admin שולח הודעה למפרסם המקורי                         │
│  עם לינק: twng.com/claim/{claim_token}                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  המפרסם לוחץ על הלינק                                   │
│  • נרשם / מתחבר ל-TWNG                                  │
│  • תובע את הגיטרה                                       │
│  • status: 'claimed'                                    │
└─────────────────────────────────────────────────────────┘
```

---

## טבלת Supabase מומלצת

```sql
CREATE TABLE unclaimed_guitars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Guitar info
  brand TEXT,
  model TEXT,
  year TEXT,
  color TEXT,
  serial TEXT,
  story TEXT,
  images TEXT[],

  -- Source info
  source TEXT, -- 'reddit', 'instagram', 'facebook'
  source_url TEXT,
  source_author TEXT,
  source_author_url TEXT,

  -- Claim system
  claim_token UUID DEFAULT gen_random_uuid() UNIQUE,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'unclaimed', -- 'unclaimed', 'claimed', 'rejected'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for claim token lookups
CREATE INDEX idx_unclaimed_guitars_claim_token ON unclaimed_guitars(claim_token);
```

---

## מקורות נתמכים

| מקור | סטטוס | הערות |
|------|-------|-------|
| Reddit | ✅ עובד | JSON API ציבורי |
| Instagram | ❌ לא נתמך | API סגור, צריך Meta approval |
| Facebook | ❌ לא נתמך | API סגור, צריך Meta approval |

---

## פיתוח לוקלי

```bash
# הרץ את ה-Function לוקלית
supabase functions serve extract-post --no-verify-jwt

# בדוק
curl -X POST 'http://localhost:54321/functions/v1/extract-post' \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://www.reddit.com/r/guitar/..."}'
```

---

## הרחבות עתידיות

1. **Instagram scraping** - דרך Puppeteer/Playwright (מורכב)
2. **AI enrichment** - חיבור ל-Claude API לחילוץ חכם יותר
3. **Image analysis** - זיהוי גיטרה מתמונה
4. **Scheduled search** - חיפוש אוטומטי של פוסטים חדשים
