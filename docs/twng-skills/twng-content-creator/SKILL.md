---
name: twng-content-creator
description: Create content for TWNG platform including articles, guides, interviews, and educational content about guitars, collecting, and luthiers. Use when writing blog posts, guides, or any editorial content for TWNG.
---

# TWNG Content Creator

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Current Season**: !`month=$(date '+%-m'); if [ $month -ge 3 ] && [ $month -le 5 ]; then echo "🌸 Spring"; elif [ $month -ge 6 ] && [ $month -le 8 ]; then echo "☀️ Summer"; elif [ $month -ge 9 ] && [ $month -le 11 ]; then echo "🍂 Fall"; else echo "❄️ Winter"; fi`

---

## Content Types for TWNG

### 1. Guitar Stories (סיפורי גיטרות)
Personal narratives about specific guitars and their journeys.

**Structure:**
- Hook: Why this guitar is special
- History: Who owned it, what happened to it
- Technical details: Specs, modifications, repairs
- Current status: Where is it now
- Emotional takeaway: What makes this story matter

**Example Topics:**
- "הגיטרה ששרדה שריפה ועדיין מנגנת"
- "איך Les Paul משנות ה-50 הגיע לחנות בתל אביב"
- "הFender שליוותה 3 דורות של משפחה אחת"

### 2. Collector Guides (מדריכים לאספנים)
Educational content for collectors of all levels.

**Structure:**
- Problem/Question introduction
- Background context
- Step-by-step guide or explanation
- Expert tips
- Common mistakes to avoid
- Call to action (document your guitar on TWNG)

**Example Topics:**
- "איך לזהות גיטרה מזויפת"
- "מדריך למתחילים: איך לבנות אוסף גיטרות"
- "10 דברים שצריך לבדוק לפני שקונים גיטרה וינטג'"
- "איך לשמור על ערך הגיטרה שלך"

### 3. Luthier Spotlights (פרופילי לות'יירס)
Interviews and profiles of guitar technicians and craftsmen.

**Structure:**
- Introduction: Who they are, where they work
- Background: How they got into the craft
- Philosophy: Their approach to guitar repair/building
- Notable work: Interesting projects they've done
- Tips for guitar owners
- How to reach them

**Interview Questions Template:**
1. מתי התחלת לעבוד על גיטרות?
2. מה הפרויקט הכי מיוחד שעבדת עליו?
3. מה הטעות הנפוצה שבעלי גיטרות עושים?
4. איזו עצה היית נותן לאספן מתחיל?
5. מה אתה אוהב הכי הרבה בעבודה שלך?

### 4. Technical Guides (מדריכים טכניים)
Deep dives into guitar specifications, models, and technical knowledge.

**Structure:**
- Introduction to the topic
- Historical context
- Technical explanation (accessible language)
- Visual aids/diagrams when possible
- Practical implications for owners
- Further reading/resources

**Example Topics:**
- "מה המספר הסידורי של הגיטרה אומר עליה"
- "סוגי עצים לגיטרות: מדריך מקיף"
- "היסטוריה קצרה של Fender Stratocaster"
- "איך לקרוא ספקים של גיטרה"

### 5. Industry News (חדשות התעשייה)
Updates about the guitar world relevant to collectors and enthusiasts.

**Structure:**
- News hook
- Context and background
- Impact on collectors/players
- TWNG angle (how this relates to documentation)

**Example Topics:**
- "Gibson מכריזה על סדרת רפליקות חדשה"
- "מכירת גיטרות אייקוניות: סיכום 2025"
- "טרנדים בשוק הגיטרות הוינטג'"

## Writing Guidelines

### Language
- **Primary**: Hebrew (עברית)
- **Secondary**: English (for international content)
- Mix is OK for technical terms (e.g., "pickup", "fretboard")

### Tone
- Educational but not condescending
- Passionate but not fanboy-ish
- Technical but accessible
- Story-driven

### Length Guidelines
| Content Type | Length (words) | Reading Time |
|--------------|----------------|--------------|
| Guitar Story | 800-1500 | 4-7 min |
| Collector Guide | 1000-2000 | 5-10 min |
| Luthier Spotlight | 600-1000 | 3-5 min |
| Technical Guide | 1200-2500 | 6-12 min |
| News Update | 300-600 | 2-3 min |

### SEO Considerations
- Include keywords naturally (גיטרה, אספנות, וינטג', לות'ייר)
- Use descriptive headings (H2, H3)
- Include internal links to TWNG features
- Meta description: 150-160 characters

## Content Templates

### Guitar Story Template
```markdown
# [שם הגיטרה / כותרת מושכת]

**[משפט פתיחה שתופס - שאלה או עובדה מפתיעה]**

## הסיפור מתחיל

[תיאור הרקע - איפה ומתי הגיטרה נוצרה]

## המסע

[מה עבר על הגיטרה - בעלים, אירועים, שינויים]

## הפרטים הטכניים

- **יצרן**:
- **דגם**:
- **שנה**:
- **מספר סידורי**:
- **מאפיינים מיוחדים**:

## למה זה משנה

[מה אפשר ללמוד מהסיפור הזה]

---

*יש לך סיפור על גיטרה? [שתף אותו ב-TWNG](link)*
```

### Collector Guide Template
```markdown
# [כותרת המדריך]

**זמן קריאה**: X דקות

## למי המדריך הזה מיועד

[הגדרת קהל היעד]

## מה תלמדו

- [נקודה 1]
- [נקודה 2]
- [נקודה 3]

## [נושא ראשי 1]

[תוכן]

### טיפ מומחה
> [עצה מקצועית]

## [נושא ראשי 2]

[תוכן]

## טעויות נפוצות

❌ [טעות 1]
❌ [טעות 2]

## סיכום

[נקודות עיקריות]

---

*תעדו את הגיטרות שלכם ב-TWNG ושמרו על ההיסטוריה שלהן.*
```

### Luthier Interview Template
```markdown
# [שם הלות'ייר]: [כותרת/ציטוט מושך]

**מיקום**: [עיר, מדינה]
**התמחות**: [סוג עבודה]
**ותק**: [שנים בתעשייה]

## ההתחלה

[איך נכנס לתחום]

## הפילוסופיה

[גישה לעבודה]

## פרויקט מיוחד

[סיפור על עבודה בולטת]

## עצות לבעלי גיטרות

1. [עצה 1]
2. [עצה 2]
3. [עצה 3]

## איך ליצור קשר

[פרטי קשר / לינק לפרופיל TWNG]

---

*אתה לות'ייר? [הצטרף לרשת המומחים של TWNG](link)*
```

## Content Calendar Themes

### By Season
- **Spring**: Guitar maintenance after winter, vintage market trends
- **Summer**: Travel with guitars, outdoor playing care
- **Fall**: New model releases, collector buying season
- **Winter**: Holiday gift guides, year-end retrospectives

### By Month
- **January**: New year resolutions for collectors, market predictions
- **March**: NAMM recap (if relevant)
- **June**: Summer care guides
- **September**: Back-to-school for musicians
- **November**: Black Friday/collector deals
- **December**: Year's best stories, gift guides

## Quality Checklist

Before publishing, verify:

- [ ] **Accuracy**: All facts verified, specs correct
- [ ] **Brand Voice**: Matches TWNG tone (see twng-brand-voice)
- [ ] **Value**: Reader learns something or feels something
- [ ] **CTA**: Includes relevant call to action
- [ ] **SEO**: Title, headings, meta description optimized
- [ ] **Links**: Internal links to TWNG features
- [ ] **Images**: High-quality, properly credited
- [ ] **Mobile**: Readable on mobile devices
- [ ] **Hebrew**: Proper RTL formatting, no broken characters

## Content Ideas Generator

When stuck, consider:

1. **What question did someone ask recently?**
2. **What's trending in the guitar world?**
3. **What story hasn't been told yet?**
4. **What would I want to read as a collector?**
5. **What can only TWNG tell?** (unique angle)
