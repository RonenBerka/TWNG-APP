# TWNG — נקודות פתוחות לדיון

**פגישה עם:** דורון
**תאריך:** מחר
**מטרה:** סגירת החלטות אסטרטגיות לקראת השקה

---

## 1. 🔐 מודל פרטיות — ההחלטה הכי חשובה

### הרקע
החלטנו על "Private First" אבל עלו שאלות לגבי מה קורה כשמשתמש כן רוצה לשתף.

### שלוש האפשרויות

| מודל | תיאור | יתרון מרכזי | חיסרון מרכזי |
|------|-------|-------------|--------------|
| **A: Private First** | הכל פרטי, שיתוף אופציונלי | פשטות | אין ויראליות |
| **B: Social First** | הכל ציבורי, הסתרה אופציונלית | ויראליות | Privacy concerns |
| **C: User Choice** | המשתמש בוחר ב-onboarding | גמישות | מורכבות |

### ההמלצה שלי
**C — User Choice עם נטייה ל-Private**

```
"How would you like to use TWNG?"

○ Keep my collection private (recommended)
○ Share with the community
```

### שאלות לדיון
- [ ] האם מסכימים על User Choice?
- [ ] האם "(recommended)" על Private נכון?
- [ ] מה קורה אם 80% בוחרים Public — נשנה default?
- [ ] האם לאפשר שינוי ב-Settings אחר כך?

---

## 2. 🎯 Positioning & Messaging

### מה סגרנו
- **Tagline:** "Every Guitar Has a Story"
- **Sub:** "Finally, a place to keep them."
- **מילת מפתח:** "Keep" (לא "Document")

### שאלות לדיון
- [ ] האם הכיוון הזה עובד גם אם נלך על Social?
- [ ] האם צריך tagline שונה למודל User Choice?
  - הצעה: "Keep yours — or share it with the world."
- [ ] האם שמרנו על הפשטות או יצא מסובך?

---

## 3. 💰 תמחור

### המודל המוצע

| Tier | מחיר | גיטרות | תמונות | Magic Add |
|------|------|--------|--------|-----------|
| **Free** | $0 | 20 | 5/guitar | 5/חודש |
| **Pro** | $5/חודש | Unlimited | 20/guitar | Unlimited |
| **Collector** | $12/חודש (עתיד) | Unlimited | Unlimited | API + Analytics |

### שאלות לדיון
- [ ] האם 20 גיטרות ב-Free זה יותר מדי/פחות מדי?
- [ ] האם $5 זה נכון? יש שמציעים $3 או $7.
- [ ] האם להשיק עם Free בלבד (בלי Pro)?
- [ ] מתי להוסיף את Collector?

---

## 4. ⚡ Magic Add — הפיצ'ר המרכזי

### מה זה עושה
צילום גיטרה → זיהוי אוטומטי → מילוי פרטים

### שאלות לדיון
- [ ] האם Magic Add מוכן לבטא?
- [ ] מה ה-accuracy הצפוי? מה מינימלי מקובל?
- [ ] מה קורה כשלא מזהה? UX של fallback?
- [ ] האם להגביל ב-Free (5/חודש) או לתת חופשי בבטא?

---

## 5. 🚀 תוכנית השקה

### Timeline מוצע

| שלב | תאריך | מטרה |
|-----|-------|------|
| Beta | שבועיים | 30-50 טסטרים |
| Soft Launch | +2 שבועות | פתוח לכולם, בלי שיווק |
| Public Launch | +4 שבועות | קמפיין מלא |

### שאלות לדיון
- [ ] האם ה-timeline ריאלי?
- [ ] מאיפה מביאים 30-50 בטא טסטרים?
  - רשת אישית
  - פורומים (The Gear Page, TDPRI)
  - Instagram
- [ ] מה הקריטריונים ל-"מוכן להשקה"?
- [ ] האם יש תאריך יעד קשיח?

---

## 6. 📣 שיווק — מה מוכן

### חומרים שהוכנו
- [x] Landing Page v2
- [x] Email Templates (7)
- [x] Instagram Image Prompts (27)
- [x] Ad Campaign (6 Ad Sets)
- [x] Social Media Content
- [x] FAQ

### שאלות לדיון
- [ ] האם לבדוק את ה-copy עם עוד אנשים?
- [ ] מי מייצר את התמונות? (AI / צלם / סטוק)
- [ ] תקציב פרסום ראשוני?
- [ ] מי מנהל את הסושיאל?

---

## 7. 🔧 טכני / Backend

### החלטות שתלויות במודל פרטיות

| אם Private First | אם Social First | אם User Choice |
|-----------------|-----------------|----------------|
| אין Feed | צריך Feed | Feed אופציונלי |
| אין Search | Search ציבורי | Search על ציבוריים |
| CDN פשוט | CDN מורכב | CDN מורכב |
| GDPR פשוט | GDPR מורכב | GDPR בינוני |

### שאלות לדיון
- [ ] מה מצב הפיתוח? מה חסר?
- [ ] האם יש bottlenecks טכניים?
- [ ] מי אחראי על DevOps?
- [ ] hosting? costs?

---

## 8. 🤝 חלוקת תפקידים

### שאלות לדיון
- [ ] מי אחראי על מה?
  - Product
  - Dev
  - Marketing
  - Content
  - Support
- [ ] כמה שעות בשבוע כל אחד משקיע?
- [ ] האם צריך עזרה חיצונית? (פרילנסר, agency)

---

## 9. 📊 מדדי הצלחה

### North Star Metric מוצע
**Guitars Documented** (כמה גיטרות נוספו בסה"כ)

### KPIs משניים
- Signups
- Activation (הוסיף גיטרה ראשונה)
- Retention (חזר אחרי 7 ימים)
- Guitars per User

### שאלות לדיון
- [ ] האם מסכימים על North Star?
- [ ] מה היעדים לבטא? ל-30 יום ראשונים?
- [ ] איך מודדים? (Mixpanel? GA? משהו אחר?)

---

## 10. 💸 תקציב והשקעה

### שאלות לדיון
- [ ] מה התקציב הכולל לפני revenue?
- [ ] כמה מוכנים להשקיע בפרסום?
- [ ] האם מחפשים השקעה חיצונית?
- [ ] מה ה-runway?

---

## 11. 🛡️ משפטי / IP

### שאלות לדיון
- [ ] Terms of Service — מי כותב?
- [ ] Privacy Policy — במיוחד אם Social
- [ ] DMCA / Copyright — אם משתמשים מעלים תמונות
- [ ] רישום חברה? איפה?
- [ ] הסכם שותפות?

---

## 12. 🇮🇱 Reach Out לקהל הישראלי — לפני השקה

### הסטרטגיה
בניית באזז וקהילה ישראלית לפני ההשקה הרשמית.

### ערוצים מתוכננים

| ערוץ | פעולה | תזמון |
|------|-------|-------|
| **Instagram** | Coming Soon posts + תוכן לגיטריסטים | מיידי |
| **Facebook Groups** | גיטריסטים בישראל, גיטרות למכירה, קבוצות נישה | שבוע לפני Beta |
| **Talkbacks/Forums** | BPM, מקלות ישראל, קבוצות ציוד | שבוע לפני Beta |
| **WhatsApp** | רשימת חברים גיטריסטים | הזמנה אישית |
| **לותרים/טכנאים** | שיתוף פעולה מוקדם | מיידי |

### מסרים מרכזיים לשוק הישראלי
- **עברית לטינית:** "Every Guitar Has a Story" עובד גם בעברית?
- **נקודת כאב:** "איפה כל התמונות של הגיטרות שמכרתי?"
- **NGD:** לקשר לתרבות ה-New Guitar Day בקבוצות

### תוכן מוכן
- [x] Coming Soon post לאינסטגרם
- [x] 27 פרומפטים לתמונות
- [x] 6 סטים של מודעות (כולל "זה שמכר גיטרה" ו-NGD)
- [ ] תוכן בעברית
- [ ] Post לקבוצות פייסבוק

### שאלות לדיון
- [ ] האם להתחיל בהיברידי (עברית/אנגלית) או רק אנגלית?
- [ ] מי יש לנו קשר אליו בקהילת הגיטריסטים הישראלית?
- [ ] האם לפנות ללותרים ישראלים כבר עכשיו? (שותפים מוקדמים)
- [ ] האם צריך influencer ישראלי? תקציב?

---

## 13. 🛫 היערכות להשקה — Checklist

### מוצר — מה צריך להיות מוכן

| פיצ'ר | סטטוס | חובה ל-Beta? |
|-------|-------|-------------|
| Sign Up / Login | ? | ✅ כן |
| Magic Add (צילום → זיהוי) | ? | ✅ כן |
| הוספת גיטרה ידנית | ? | ✅ כן |
| Guitar Profile Page | ? | ✅ כן |
| Story (הוספת סיפור) | ? | ✅ כן |
| Collection View | ? | ✅ כן |
| Edit Guitar | ? | ✅ כן |
| Delete Guitar | ? | ✅ כן |
| Privacy Settings | ? | ⚠️ תלוי במודל |
| Share / Public Profile | ? | ❌ לא חובה |
| Feed / Discover | ? | ❌ לא חובה |
| Pro Tier / Payments | ? | ❌ לא חובה |

### שיווק — מה מוכן

| פריט | סטטוס |
|------|-------|
| Landing Page | ✅ V2 מוכן |
| Coming Soon Instagram | ✅ מוכן |
| Email Templates | ✅ 7 מוכנים |
| Ad Creatives (copy) | ✅ 6 סטים |
| Ad Images | ❌ צריך לייצר |
| Facebook Group Posts | ❌ צריך לכתוב |
| Press Kit | ❌ צריך |

### טכני — תשתיות

| פריט | סטטוס | הערות |
|------|-------|-------|
| Domain | ? | twng.app? twng.io? |
| Hosting | ? | |
| Database | ? | |
| Image Storage (CDN) | ? | |
| Analytics | ? | Mixpanel? PostHog? |
| Error Tracking | ? | Sentry? |
| Email Service | ? | Resend? SendGrid? |

### משפטי — מינימום

| פריט | סטטוס |
|------|-------|
| Terms of Service | ❌ |
| Privacy Policy | ❌ |
| Cookie Policy | ❌ |

### Beta Launch Checklist

```
שבוע לפני Beta:
[ ] כל הפיצ'רים החובה עובדים
[ ] נבדק על mobile + desktop
[ ] Analytics מותקן
[ ] Error tracking מותקן
[ ] 30-50 אנשים מאושרים לבטא
[ ] Email הזמנה לבטא מוכן
[ ] Feedback form מוכן

יום ההשקה:
[ ] Final QA
[ ] Backup database
[ ] Send invites
[ ] Monitor errors
[ ] Be available for support
```

### שאלות לדיון
- [ ] מה הסטטוס האמיתי של כל פיצ'ר?
- [ ] מה ה-blockers הכי גדולים?
- [ ] האם אפשר להשיק Beta בעוד שבועיים?
- [ ] מי אחראי על כל חלק ב-checklist?

---

## סיכום — החלטות נדרשות

| # | נושא | החלטה נדרשת |
|---|------|-------------|
| 1 | Privacy Model | A / B / C |
| 2 | Tagline Final | אישור או שינוי |
| 3 | Free Tier | 20 גיטרות או אחר |
| 4 | Pro Price | $5 או אחר |
| 5 | Beta Testers | מקור ומספר |
| 6 | Launch Date | תאריך יעד |
| 7 | Ad Budget | סכום ראשוני |
| 8 | Roles | חלוקה ברורה |
| 9 | Success Metrics | יעדים מספריים |
| 10 | Legal | מי מטפל |
| 11 | שפה לישראל | עברית / אנגלית / היברידי |
| 12 | Beta Readiness | Go / No-Go + תאריך |
| 13 | Luthier Outreach | כן / לא + רשימה |

---

## הערות לפגישה

```
⏱️ זמן מומלץ: 60-90 דקות
📝 להביא: מחשב לראות את החומרים
🎯 מטרה: לצאת עם 10 החלטות סגורות
```

---

*מסמך זה הוכן על ידי רונן, 2026*
