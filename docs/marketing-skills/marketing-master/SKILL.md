---
name: marketing-master
description: Master marketing skill integrating content strategy, brand voice, campaigns, competitive intelligence, outreach, task management, and daily workflows. The central hub for all marketing work.
---

# Marketing Command Center

## 📅 Dynamic Context - Live Dashboard

### Time & Date
**Now**: !`date '+%A, %d %B %Y at %H:%M'`
**Week**: !`date '+Week %V of %Y'`
**Quarter**: !`echo "Q$(( ($(date '+%-m')-1)/3+1 )) $(date '+%Y')"`

### Day Context
!`day=$(date '+%u'); case $day in 1) echo "📋 **MONDAY** - Planning Day | Set priorities, review projects, client check-ins";; 2) echo "⚡ **TUESDAY** - Creation Day | Deep work, content production, strategy";; 3) echo "📧 **WEDNESDAY** - Outreach Day | Prospecting, networking, relationships";; 4) echo "🎯 **THURSDAY** - Execution Day | Deliverables, presentations, client work";; 5) echo "📊 **FRIDAY** - Review Day | Metrics, reports, next week prep";; 6|7) echo "🌴 **WEEKEND** - Recharge | Rest or strategic catch-up";; esac`

### Time Block Suggestion
!`hour=$(date '+%H'); if [ $hour -lt 9 ]; then echo "🌅 Pre-work: Review today's agenda"; elif [ $hour -lt 12 ]; then echo "🧠 Peak Focus: Creative/complex work → Use deep work block"; elif [ $hour -lt 14 ]; then echo "🍽️ Midday: Meetings and calls → Check client comms"; elif [ $hour -lt 17 ]; then echo "📋 Afternoon: Admin, follow-ups → Process emails, update tasks"; else echo "🌙 Evening: Wrap up → Run shutdown routine"; fi`

### Seasonal Marketing Context
!`month=$(date '+%-m'); if [ $month -ge 3 ] && [ $month -le 5 ]; then echo "🌸 **Spring** | Themes: Fresh starts, renewal, outdoor"; elif [ $month -ge 6 ] && [ $month -le 8 ]; then echo "☀️ **Summer** | Themes: Vacation, leisure, outdoor events"; elif [ $month -ge 9 ] && [ $month -le 11 ]; then echo "🍂 **Fall** | Themes: Back to routine, holidays approaching, cozy"; else echo "❄️ **Winter** | Themes: Holidays, gifting, new year planning"; fi`

---

## 🎯 Quick Action Router

| I need to... | Use Skill |
|--------------|-----------|
| Plan content | `@content-strategy` |
| Write in brand voice | `@brand-voice-manager` |
| Plan a campaign | `@campaign-planning` |
| Research competitors | `@competitive-intel` |
| Write outreach | `@outreach-drafts` |
| Organize tasks | `@task-management` |
| Daily/weekly routines | `@daily-workflows` |

### Client-Specific Skills
| Client | Skill |
|--------|-------|
| Elements by Tal Man | `@elements-marketing` |
| TWNG | `@twng-all-in-one` |

---

## 📊 Weekly Dashboard Template

```markdown
# Week [Number] Dashboard

## Status Overview
| Area | Status | Notes |
|------|--------|-------|
| Elements | 🟢/🟡/🔴 | |
| TWNG | 🟢/🟡/🔴 | |
| Pipeline | 🟢/🟡/🔴 | |

## This Week's Priorities
1. 🎯 [Priority 1]
2. ⚡ [Priority 2]
3. ✅ [Priority 3]

## Key Deadlines
| Deadline | Project | Client | Status |
|----------|---------|--------|--------|
| | | | |

## Metrics Snapshot
| Metric | Current | Target | Trend |
|--------|---------|--------|-------|
| Revenue | ₪ | ₪ | ↑/↓/→ |
| Active projects | | | |
| Pipeline value | ₪ | ₪ | |
```

---

## 🔄 Integrated Workflows

### New Campaign Launch Flow
```
1. Strategy → @campaign-planning (brief, objectives)
2. Voice → @brand-voice-manager (messaging, tone)
3. Content → @content-strategy (content plan)
4. Competitive → @competitive-intel (positioning)
5. Outreach → @outreach-drafts (launch comms)
6. Track → @task-management (project management)
```

### New Client Onboarding Flow
```
1. Brief → @campaign-planning (understand needs)
2. Voice → @brand-voice-manager (capture their voice)
3. Competitive → @competitive-intel (market analysis)
4. Strategy → @content-strategy (content roadmap)
5. Tasks → @task-management (project setup)
6. Workflow → @daily-workflows (integrate into routine)
```

### Weekly Planning Flow
```
Monday AM:
1. @daily-workflows → Morning startup
2. @task-management → Set week priorities
3. Review @elements-marketing and @twng-all-in-one for client needs
4. @campaign-planning → Check campaign status
5. @daily-workflows → Time block the week
```

### Content Production Flow
```
1. @content-strategy → Pick content from calendar
2. @brand-voice-manager → Apply voice guidelines
3. @competitive-intel → Differentiation check
4. @task-management → Track progress
5. @daily-workflows → Schedule publishing
```

---

## 📁 Skill Integration Map

```
                    ┌─────────────────────┐
                    │  marketing-master   │
                    │   (This Skill)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────┴───────┐    ┌────────┴────────┐    ┌───────┴───────┐
│ STRATEGY      │    │ EXECUTION       │    │ OPERATIONS    │
├───────────────┤    ├─────────────────┤    ├───────────────┤
│ content-      │    │ campaign-       │    │ task-         │
│ strategy      │    │ planning        │    │ management    │
├───────────────┤    ├─────────────────┤    ├───────────────┤
│ brand-voice-  │    │ outreach-       │    │ daily-        │
│ manager       │    │ drafts          │    │ workflows     │
├───────────────┤    └─────────────────┘    └───────────────┘
│ competitive-  │
│ intel         │
└───────────────┘

        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────┴───────┐    ┌────────┴────────┐    ┌───────┴───────┐
│ CLIENTS       │    │ SPECIALIZED     │    │ EXTERNAL      │
├───────────────┤    ├─────────────────┤    ├───────────────┤
│ elements-     │    │ All individual  │    │ Klaviyo       │
│ marketing     │    │ marketing       │    │ connector     │
├───────────────┤    │ skills in       │    ├───────────────┤
│ twng-all-     │    │ ~/.claude/      │    │ Meta Ads      │
│ in-one        │    │ skills/         │    │ connector     │
└───────────────┘    └─────────────────┘    └───────────────┘
```

---

## 📋 Quick Reference Cards

### Content Types by Funnel Stage
| Stage | Content Types | Goal |
|-------|---------------|------|
| **Awareness** | Blog, Social, PR | Traffic |
| **Interest** | Guides, Webinars | Engagement |
| **Consideration** | Case studies, Demos | Conversion |
| **Decision** | Testimonials, Pricing | Sale |
| **Retention** | Tutorials, Community | Loyalty |

### Campaign Budget Split (E-commerce)
| Channel | % | Role |
|---------|---|------|
| Meta Ads | 40-50% | Primary acquisition |
| Google Ads | 20-30% | Intent capture |
| Email | 5-10% | Highest ROI |
| Content | 10-15% | Long-term |
| Testing | 5-10% | Innovation |

### Response Time Standards
| Channel | Target | Maximum |
|---------|--------|---------|
| Urgent email | 1 hour | 4 hours |
| Regular email | 24 hours | 48 hours |
| Slack/Chat | 1 hour | 4 hours |
| Social DM | 4 hours | 24 hours |

---

## 🔧 Common Templates Hub

### Quick Brief
```
**Project**: [Name]
**Client**: [Client]
**Objective**: [Goal]
**Due**: [Date]
**Key message**: [One line]
**Audience**: [Who]
**Deliverables**: [List]
```

### Status Update
```
**Project**: [Name]
**Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked
**Progress**: [%]
**This week**: [What happened]
**Next week**: [What's planned]
**Needs**: [Any asks]
```

### Meeting Notes
```
**Meeting**: [Name]
**Date**: [Date]
**Attendees**: [Names]
**Decisions**:
- [Decision 1]
**Actions**:
- [ ] [Action] - @[Owner] - [Due]
**Next steps**: [Summary]
```

---

## 🚀 Daily Startup Checklist

```markdown
## Today: [Day, Date]

### Morning Setup (5 min)
- [ ] Calendar reviewed
- [ ] Urgent messages checked
- [ ] Top 3 priorities set

### Today's Focus
1. 🎯 ____________________
2. ⚡ ____________________
3. ✅ ____________________

### Client Quick Check
- Elements: ____________
- TWNG: ____________
- Other: ____________

### End of Day
- [ ] Tasks updated
- [ ] Tomorrow's top 3 noted
- [ ] Shutdown complete ✓
```

---

## 📖 Skill Import Commands

When you need specific functionality, import the relevant skill:

```
@content-strategy      → Content planning & SEO
@brand-voice-manager   → Voice & style guidelines
@campaign-planning     → Campaign frameworks
@competitive-intel     → Competitor analysis
@outreach-drafts       → Email & LinkedIn templates
@task-management       → Task prioritization
@daily-workflows       → Routines & habits
@elements-marketing    → Elements by Tal Man
@twng-all-in-one       → TWNG platform
```

---

## 🔗 Connected Tools

When available, these connectors enhance capabilities:
- **Klaviyo** → Email analytics & automation
- **Canva** → Design creation
- **Shopify** → E-commerce data
- **Meta Ads** → Campaign management
- **Asana/Monday** → Task management
- **Notion** → Documentation

---

*This is your marketing command center. Start here, route to specialized skills as needed.*
