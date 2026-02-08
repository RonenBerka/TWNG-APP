---
name: elements-marketing
description: Complete marketing toolkit for Elements by Tal Man jewelry e-commerce. Combines email marketing, copywriting, Shopify optimization, ads management, and conversion optimization with live data context.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
---

# Elements by Tal Man - Marketing Command Center

## 📅 Dynamic Context - Live Data

### Current Time & Date
**Today**: !`date '+%A, %d %B %Y'`
**Time**: !`date '+%H:%M'`
**Week Number**: !`date '+%V'`
**Day of Week**: !`date '+%u'` (1=Monday, 7=Sunday)

### Seasonal Context
**Current Season**: !`month=$(date '+%-m'); if [ $month -ge 3 ] && [ $month -le 5 ]; then echo "🌸 Spring - Fresh starts, new beginnings themes"; elif [ $month -ge 6 ] && [ $month -le 8 ]; then echo "☀️ Summer - Light jewelry, vacation, outdoor themes"; elif [ $month -ge 9 ] && [ $month -le 11 ]; then echo "🍂 Fall - Rich tones, layering, holiday prep"; else echo "❄️ Winter - Gifting, warmth, celebration themes"; fi`

### Israeli Holidays (Next 90 Days)
!`today=$(date '+%m-%d'); year=$(date '+%Y'); echo "Checking upcoming holidays..."; if [ "$today" \< "03-15" ] || [ "$today" \> "03-01" ]; then echo "🕎 Purim season - Gift giving themes"; fi; if [ "$today" \< "04-25" ] && [ "$today" \> "03-20" ]; then echo "🍷 Passover season - Family, tradition themes"; fi; if [ "$today" \< "09-30" ] && [ "$today" \> "08-15" ]; then echo "🍎 Rosh Hashanah season - New year, gifts"; fi; if [ "$today" \< "12-30" ] && [ "$today" \> "11-20" ]; then echo "🕯️ Hanukkah season - 8 days of gifting"; fi; echo "Check Hebrew calendar for exact dates"`

### E-commerce Calendar
**Days until end of month**: !`echo $(( $(date -d "$(date '+%Y-%m-01') +1 month -1 day" '+%d') - $(date '+%d') ))`
**Current Quarter**: !`echo "Q$(( ($(date '+%-m')-1)/3+1 )) $(date '+%Y')"`
**Is it weekend?**: !`[ $(date '+%u') -gt 5 ] && echo "Yes - Lower email open rates expected" || echo "No - Good for campaigns"`

### Marketing Timing Recommendations
!`hour=$(date '+%H'); if [ $hour -ge 9 ] && [ $hour -le 11 ]; then echo "🟢 OPTIMAL: Morning email send window (Israel)"; elif [ $hour -ge 19 ] && [ $hour -le 21 ]; then echo "🟢 OPTIMAL: Evening engagement window"; elif [ $hour -ge 12 ] && [ $hour -le 14 ]; then echo "🟡 MODERATE: Lunch break browsing"; else echo "🔴 OFF-PEAK: Consider scheduling for optimal times"; fi`

---

## 🎯 Brand Overview - Elements by Tal Man

**Business**: Luxury jewelry e-commerce (Israel)
**Target Audience**: Women 25-55, value quality and craftsmanship
**Price Range**: Mid to high-end
**Unique Value**: Handcrafted, Israeli-made, personal touch
**Platform**: Shopify
**Email Platform**: Klaviyo

### Brand Voice Quick Reference
- **Tone**: Elegant but warm, not cold luxury
- **Language**: Hebrew primary, professional but personal
- **Avoid**: Pushy sales language, excessive discounts, cheap messaging
- **Emphasize**: Craftsmanship, story, emotion, gift-giving

---

## 📧 Email Marketing (from email-marketing-retention)

### Quick Campaign Templates

**Cart Abandonment Sequence**:
1. **1 hour**: Gentle reminder - "שכחת משהו בעגלה?"
2. **24 hours**: Value reinforcement - show reviews/benefits
3. **48-72 hours**: Offer 10% - "מתנה מיוחדת בשבילך"

**Welcome Series** (5-7 emails over 14 days):
1. Immediate: Welcome + 10% discount
2. Day 2: Brand story
3. Day 4: Product education
4. Day 7: Social proof
5. Day 10: Discount reminder
6. Day 13: Last chance

### Email Benchmarks (Jewelry Industry)
- Open rate target: 20-30%
- Click rate target: 2-5%
- Conversion rate: 0.5-1.5%
- Cart abandonment: 80-82% (normal for jewelry!)

---

## ✍️ Copywriting Guidelines (from hebrew-luxury-copywriting)

### Hebrew Copy Formula
```
1. רגש (Emotion) - Connect to feeling
2. ערך (Value) - What makes it special
3. פעולה (Action) - Clear CTA
```

### Power Words (Hebrew)
- בעבודת יד, ייחודי, נצחי, מושלם
- שלך בלבד, מיוחד, אלגנטי
- מתנה מושלמת, רגע קסום

### Avoid
- "הנחה!", "מבצע!", "חינם!" (too cheap)
- Excessive exclamation marks
- English words when Hebrew exists

---

## 🛍️ Shopify Quick Reference (from shopify-jewelry-optimization)

### Key Metrics to Track
- Conversion rate: Target 0.9-1.3%
- Cart abandonment: <82%
- Page load: <3 seconds
- Mobile traffic: ~70%

### Product Page Must-Haves
- 4-8 high-quality images
- Size guide link (for rings)
- Trust badges
- Reviews
- "Complete the set" suggestions

---

## 📱 Social Media Guidelines (from content-calendar-social)

### Instagram Content Mix
- 40% Product beauty shots
- 25% Behind-the-scenes/story
- 20% Educational/tips
- 15% User-generated content

### Best Posting Times (Israel)
- **Instagram**: 12:00-13:00, 19:00-21:00
- **Facebook**: 13:00-16:00, 19:00-21:00
- **Stories**: Throughout the day

---

## 📊 Ads Management (from ads-account-management)

### Campaign Structure
```
Campaign (Objective)
└── Ad Set (Audience + Budget)
    └── Ads (Creative variations)
```

### Budget Allocation Recommendation
- 60% Prospecting (new customers)
- 30% Retargeting (visitors, cart abandoners)
- 10% Retention (existing customers)

### Key Metrics
- ROAS target: 3-4x
- CPM benchmark: ₪30-60
- CTR target: 1-2%

---

## 🔗 Connected Tools

When Klaviyo connector is active:
- Pull live campaign data
- Check subscriber segments
- Analyze recent performance

When Canva connector is active:
- Create designs for campaigns
- Access brand templates
- Export assets

When Shopify data available:
- Check inventory
- Review recent orders
- Analyze best sellers

---

## ⚡ Quick Actions

| Need | Command/Action |
|------|----------------|
| Write email | Use email templates above + brand voice |
| Create social post | Follow content mix + posting times |
| Optimize product page | Check Shopify guidelines |
| Plan campaign | Consider season + holidays + timing |
| Analyze performance | Check benchmarks above |

---

## 📁 Related Skills (Import as needed)

- `@~/.claude/skills/email-marketing-retention/SKILL.md`
- `@~/.claude/skills/hebrew-luxury-copywriting/SKILL.md`
- `@~/.claude/skills/shopify-jewelry-optimization/SKILL.md`
- `@~/.claude/skills/ads-account-management/SKILL.md`
- `@~/.claude/skills/content-calendar-social/SKILL.md`
- `@~/.claude/skills/landing-page-optimizer/SKILL.md`
- `@~/.claude/skills/ecommerce-conversion-optimizer/SKILL.md`
