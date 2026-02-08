---
name: twng-all-in-one
description: Complete TWNG platform toolkit combining brand voice, content creation, product specs, marketing, luthier outreach, guitar knowledge, and community management with live context.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
---

# TWNG - Complete Platform Toolkit

## 📅 Dynamic Context - Live Data

### Current Time & Date
**Today**: !`date '+%A, %d %B %Y'`
**Time**: !`date '+%H:%M'`
**Week Number**: !`date '+%V of %Y'`
**ISO Date**: !`date '+%Y-%m-%d'`

### Document Versioning
**Version Stamp**: !`date '+%Y.%m.%d'`-01
**Session ID**: !`echo $RANDOM$RANDOM | md5sum | head -c 8`

### Development Context
**Current Git Branch**: !`git branch --show-current 2>/dev/null || echo "Not in git repo"`
**Last Commit**: !`git log -1 --oneline 2>/dev/null || echo "N/A"`
**Uncommitted Changes**: !`git status --porcelain 2>/dev/null | wc -l | xargs` files

### Season & Timing
**Current Season**: !`month=$(date '+%-m'); if [ $month -ge 3 ] && [ $month -le 5 ]; then echo "🌸 Spring"; elif [ $month -ge 6 ] && [ $month -le 8 ]; then echo "☀️ Summer"; elif [ $month -ge 9 ] && [ $month -le 11 ]; then echo "🍂 Fall"; else echo "❄️ Winter"; fi`

### Guitar Industry Context
!`month=$(date '+%-m'); if [ $month -eq 1 ]; then echo "📅 NAMM Season - Industry news & new releases"; elif [ $month -ge 11 ] && [ $month -le 12 ]; then echo "🎁 Holiday Season - Gift guides, collector activity high"; elif [ $month -ge 6 ] && [ $month -le 8 ]; then echo "🎸 Summer - Festival season, travel guitars"; else echo "📊 Regular season"; fi`

### Content Calendar Context
**Day of Week**: !`date '+%A'`
**Week of Month**: !`echo "Week $(( ($(date '+%d') - 1) / 7 + 1 ))"`
**Days Until Month End**: !`echo $(( $(date -d "$(date '+%Y-%m-01') +1 month -1 day" '+%d') - $(date '+%d') ))`

---

## 🎸 TWNG Platform Overview

**Mission**: Every guitar has a past. Make sure it has a future.
**Hebrew**: לכל גיטרה יש עבר. וודאו שיש לה גם עתיד.

### What TWNG Is
- Social network for guitarists and collectors
- Living archive for guitar documentation
- Platform connecting collectors, players, and professionals
- Verification system through luthiers

### What TWNG Is NOT
- ❌ Not a marketplace (not Reverb)
- ❌ Not a regular forum
- ❌ Not a dry product catalog

---

## 🎯 Brand Voice Quick Reference (from twng-brand-voice)

### Voice Characteristics
1. **Passionate but Professional** - Real love for guitars, serious about it
2. **Personal but Universal** - "We" and "our", community feel
3. **Heritage-Focused** - Stories, history, legacy
4. **Authentic & Trustworthy** - Verification, documentation

### Tone by Context
| Context | Tone |
|---------|------|
| UI Copy | Short, clear, friendly |
| Marketing | Emotional, story-driven |
| Luthier Comms | Professional, respectful |
| Social Media | Casual, engaging, uses 🎸 |

### Key Phrases
- "כל גיטרה מספרת סיפור"
- "תעד את המסע של הגיטרה שלך"
- "הגיטרה שלך ראויה לסיפור"

---

## ✍️ Content Types (from twng-content-creator)

### 1. Guitar Stories (סיפורי גיטרות)
Personal narratives about specific guitars
- 800-1500 words
- Emotional hook + history + specs + takeaway

### 2. Collector Guides (מדריכים)
Educational content
- 1000-2000 words
- Problem → Solution → Tips → CTA

### 3. Luthier Spotlights
Interviews and profiles
- 600-1000 words
- Background + philosophy + notable work + tips

### 4. Technical Guides
Deep dives on specs, models, history
- 1200-2500 words
- Historical context + technical explanation

---

## 📋 Product Specs Templates (from twng-product-specs)

### Feature Spec Structure
```
1. Executive Summary
2. Problem Statement
3. Proposed Solution
4. User Stories
5. Acceptance Criteria
6. Metrics & Success Criteria
7. Dependencies & Risks
8. Timeline
```

### User Story Format
```
As a [user type],
I want to [action/goal],
So that [benefit/value].
```

### Key Entities
- **User**: Collector, player, or professional
- **Guitar**: Item with history, specs, media
- **Collection**: User-organized group
- **Timeline Event**: Repair, mod, ownership change
- **Luthier**: Verified professional

---

## 🚀 Marketing & Launch (from twng-marketing-launch)

### Launch Phases
1. **Founding Members** - First 500-1000 users
2. **Soft Launch** - Beta, feedback, iteration
3. **Public Launch** - PR, scale, paid acquisition

### Target Audiences
| Segment | Motivation | Messaging |
|---------|------------|-----------|
| Collectors | Documentation, validation | "Finally, proper documentation" |
| Players | Know their instrument | "Know your guitar's story" |
| Luthiers | Portfolio, visibility | "Your work speaks. Now it stays." |

### Channels
- Instagram: Visual showcase, daily
- Facebook: Community, groups
- YouTube: Education, interviews
- Guitar forums: Value-first engagement

---

## 🔧 Luthier Outreach (from twng-luthier-outreach)

### Value Proposition for Luthiers
1. **Digital Portfolio** - Every guitar you work on documented
2. **Verification Badge** - Professional credibility
3. **Customer Discovery** - Directory listing
4. **Streamlined Documentation** - Add notes to timelines

### Outreach Sequence
1. Day 0: Initial email
2. Day 4: Follow-up
3. Day 10: Final follow-up
4. Day 14: Move to cold list

### Key Objection Handlers
- "No time" → It's automatic, customers do the work
- "Don't need exposure" → It's about legacy, not just customers
- "Cost?" → Free for founding luthiers

---

## 🎸 Guitar Knowledge (from twng-guitar-knowledge)

### Major Brands
- **Fender**: Strat (1954), Tele (1950), Jazzmaster
- **Gibson**: Les Paul (1952), SG (1961), ES-335
- **PRS**: Custom 24, McCarty
- **Ibanez**: RG, JEM series

### Condition Grading
| Grade | Description | Value |
|-------|-------------|-------|
| Mint | Unplayed | 100%+ |
| Excellent | Light wear | 85-95% |
| Very Good | Normal wear | 70-85% |
| Good | Obvious wear | 50-70% |

### Timeline Event Types
- Purchase, Ownership Change
- Repair, Modification, Setup
- Verification, Performance

---

## 👥 Community Management (from twng-community-management)

### Response Templates

**New User Welcome**:
```
ברוך הבא ל-TWNG! 🎸
שמחים שהצטרפת. תתחיל לתעד את הגיטרה הראשונה שלך?
```

**Feature Request**:
```
תודה על ההצעה! 🙏 רשמנו את זה.
ה-feedback שלכם עוזר לנו לבנות את TWNG הנכון.
```

### Moderation Guidelines
✅ Allowed: Guitar docs, stories, discussions, advice
❌ Not Allowed: Direct sales listings, spam, harassment

### Engagement Ideas
- "Guitar of the Week" features
- "First guitar" discussions
- Luthier AMAs
- Before/after restoration reveals

---

## ⚡ Quick Actions

| Need | Use |
|------|-----|
| Write UI copy | Brand voice guidelines |
| Create article | Content templates |
| Spec a feature | Product spec templates |
| Email a luthier | Outreach templates |
| Answer user question | Community templates |
| Guitar info | Knowledge base |
| Plan campaign | Marketing guidelines |

---

## 📁 Related Skills (Import as needed)

- `@~/.claude/skills/twng-brand-voice/SKILL.md`
- `@~/.claude/skills/twng-content-creator/SKILL.md`
- `@~/.claude/skills/twng-product-specs/SKILL.md`
- `@~/.claude/skills/twng-marketing-launch/SKILL.md`
- `@~/.claude/skills/twng-luthier-outreach/SKILL.md`
- `@~/.claude/skills/twng-guitar-knowledge/SKILL.md`
- `@~/.claude/skills/twng-community-management/SKILL.md`

---

## 📂 TWNG Project Files

Reference documents in: `/cowork/twng/`
- MVP specs
- Content requirements
- Brand story
- Wireframes
