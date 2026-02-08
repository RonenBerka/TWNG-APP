---
name: task-management
description: Task prioritization, project tracking, and productivity frameworks for marketing work. Use for organizing projects, setting priorities, managing deadlines, and tracking deliverables.
---

# Task Management & Productivity

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Week Number**: !`date '+%V of %Y'`
**Day of Week**: !`date '+%u'` (1=Monday, 7=Sunday)
**Days Left in Week**: !`echo "$(( 7 - $(date '+%u') )) days until weekend"`
**Days Left in Month**: !`echo "$(( $(date -d "$(date '+%Y-%m-01') +1 month -1 day" '+%d') - $(date '+%d') )) days"`

### Week Context
!`day=$(date '+%u'); if [ $day -eq 1 ]; then echo "📋 MONDAY: Planning day - set weekly priorities"; elif [ $day -eq 5 ]; then echo "📊 FRIDAY: Review day - wrap up and plan next week"; elif [ $day -gt 5 ]; then echo "🌴 WEEKEND: Rest or catch up"; else echo "⚡ MID-WEEK: Execution time - focus on deliverables"; fi`

---

## Prioritization Frameworks

### Eisenhower Matrix

```
                    URGENT
                      │
    ┌─────────────────┼─────────────────┐
    │   DO FIRST      │   SCHEDULE      │
    │   (Crises,      │   (Planning,    │
    │   Deadlines)    │   Development)  │
    │                 │                 │
IMPORTANT ───────────┼─────────────────┼─── NOT IMPORTANT
    │                 │                 │
    │   DELEGATE      │   ELIMINATE     │
    │   (Interrupts,  │   (Time         │
    │   Meetings)     │   wasters)      │
    │                 │                 │
    └─────────────────┼─────────────────┘
                  NOT URGENT
```

### ICE Scoring

| Task | Impact (1-10) | Confidence (1-10) | Ease (1-10) | ICE Score |
|------|---------------|-------------------|-------------|-----------|
| [Task] | | | | (I×C×E)/10 |

**Score Interpretation:**
- 70+: Do immediately
- 40-69: Schedule soon
- <40: Backlog or eliminate

### MoSCoW Method

| Category | Meaning | Action |
|----------|---------|--------|
| **M**ust Have | Critical, non-negotiable | Do first |
| **S**hould Have | Important but not critical | Schedule |
| **C**ould Have | Nice to have | If time permits |
| **W**on't Have | Not this time | Remove from list |

---

## Weekly Planning Template

### Monday Planning Session

```markdown
# Week of [Date]

## 🎯 Week Focus
**This week's #1 priority**: [Single most important outcome]

## Must Complete (Non-negotiable)
- [ ] [Critical task 1]
- [ ] [Critical task 2]
- [ ] [Critical task 3]

## Should Complete
- [ ] [Important task 1]
- [ ] [Important task 2]

## Could Complete (Stretch)
- [ ] [Nice to have 1]

## Meetings & Commitments
| Day | Time | Meeting | Prep Needed |
|-----|------|---------|-------------|
| Mon | | | |
| Tue | | | |
| Wed | | | |
| Thu | | | |
| Fri | | | |

## Blockers & Dependencies
- Waiting on: [Person/thing] for [what]
- Blocked by: [Issue]

## Notes
[Any context for the week]
```

### Friday Review Template

```markdown
# Week Review: [Date Range]

## 🏆 Completed
- [x] [What got done]
- [x] [What got done]

## ❌ Didn't Complete
- [ ] [What didn't get done] → [Why] → [Action]
- [ ] [What didn't get done] → [Why] → [Action]

## 📊 Key Metrics
- [Metric 1]: [Result]
- [Metric 2]: [Result]

## 💡 Learnings
- [What worked]
- [What didn't]
- [What to change]

## 📅 Next Week Preview
**Priority 1**: [Most important thing]
```

---

## Daily Task Management

### Daily Startup Ritual

```
1. Review calendar (5 min)
2. Check urgent messages (10 min)
3. Set 3 priorities for today (5 min)
4. Time-block focused work (5 min)
```

### Daily Task Template

```markdown
# [Date]

## Today's Top 3
1. 🎯 [Most important task]
2. ⚡ [Second priority]
3. ✅ [Third priority]

## Time Blocks
| Time | Activity |
|------|----------|
| 09:00-11:00 | Deep work: [Task] |
| 11:00-12:00 | Meetings/Calls |
| 12:00-13:00 | Lunch |
| 13:00-15:00 | Deep work: [Task] |
| 15:00-17:00 | Admin/Email/Slack |

## Quick Tasks (<15 min)
- [ ] [Quick task 1]
- [ ] [Quick task 2]

## Waiting For
- [Person]: [What]
```

### End of Day Shutdown

```
1. Update task status
2. Clear inbox to <20 emails
3. Note tomorrow's top 3
4. Calendar review for tomorrow
5. Mental closure - work is done
```

---

## Project Tracking

### Project Brief Template

```markdown
# Project: [Name]

## Overview
**Objective**: [What success looks like]
**Due Date**: [Date]
**Owner**: [Name]
**Stakeholders**: [Names]

## Scope
**In Scope:**
- [Included item 1]
- [Included item 2]

**Out of Scope:**
- [Excluded item 1]

## Milestones
| Milestone | Due Date | Status |
|-----------|----------|--------|
| [Phase 1] | [Date] | ⬜ Not Started |
| [Phase 2] | [Date] | 🟡 In Progress |
| [Phase 3] | [Date] | ✅ Complete |

## Tasks
- [ ] [Task 1] @[Owner] - Due [Date]
- [ ] [Task 2] @[Owner] - Due [Date]

## Dependencies
- [What this project needs from others]

## Risks
- [Potential issue] → [Mitigation]

## Resources
- Budget: [Amount]
- Tools: [List]
- People: [Names]
```

### Project Status Update Template

```markdown
# Status Update: [Project Name]
**Date**: [Date]
**Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

## Progress
**Completed this period:**
- [What got done]

**In progress:**
- [What's being worked on]

## Metrics
- [KPI 1]: [Current] vs [Target]
- [KPI 2]: [Current] vs [Target]

## Issues & Blockers
- [Issue]: [Impact] → [Action needed]

## Next Period
- [What's planned]

## Needs
- [Any asks from stakeholders]
```

---

## Time Management

### Time Blocking Rules

| Block Type | Duration | Purpose | When |
|------------|----------|---------|------|
| Deep Work | 2-3 hours | Creative/complex tasks | Morning |
| Shallow Work | 1 hour | Email, admin | Afternoon |
| Meeting Block | 2-4 hours | All meetings | Mid-day |
| Buffer | 30 min | Overflow, breaks | Between blocks |

### Pomodoro Technique

```
[25 min work] → [5 min break] × 4 → [15-30 min long break]
```

Use for:
- Writing content
- Design work
- Analytical tasks
- Learning

### Energy Management

| Time of Day | Energy Level | Best For |
|-------------|--------------|----------|
| Morning (9-12) | 🔋🔋🔋 High | Creative, complex |
| Early afternoon (13-15) | 🔋🔋 Medium | Meetings, calls |
| Late afternoon (15-17) | 🔋 Low | Admin, email |

---

## Client & Multi-Project Management

### Client Overview Template

```markdown
# Client: [Name]

## Active Projects
| Project | Status | Due | Priority |
|---------|--------|-----|----------|
| [Project 1] | 🟡 | [Date] | High |
| [Project 2] | 🟢 | [Date] | Medium |

## This Week
- [ ] [Deliverable for client]
- [ ] [Task for client]

## Communication
- **Primary contact**: [Name]
- **Preferred channel**: [Email/Slack/Phone]
- **Meeting cadence**: [Weekly/Bi-weekly]

## Notes
- [Important context]
```

### Multi-Client Week View

```markdown
# Week of [Date]

## Monday
| Client | Task | Time Est |
|--------|------|----------|
| Elements | | |
| TWNG | | |
| Client C | | |

## Tuesday
| Client | Task | Time Est |
|--------|------|----------|

[Continue for each day]

## Week Totals
| Client | Hours | Revenue |
|--------|-------|---------|
| Elements | | |
| TWNG | | |
| Client C | | |
| **Total** | | |
```

---

## Productivity Tools Integration

### Recommended Stack

| Purpose | Tool Options |
|---------|--------------|
| Task Management | Asana, Monday, Linear, Notion |
| Time Tracking | Toggl, Clockify, Harvest |
| Calendar | Google Calendar, Cal.com |
| Notes | Notion, Obsidian |
| Communication | Slack, Email |
| Documents | Google Docs, Notion |

### Tool Best Practices

**Task Manager:**
- One source of truth
- Review daily
- Weekly cleanup
- Use due dates sparingly (only real deadlines)

**Calendar:**
- Block focus time
- Buffer between meetings
- Review next day before shutdown

---

## Integration Points

- Use with `@daily-workflows` for routine automation
- Use with `@campaign-planning` for campaign project management
- Use with `@content-strategy` for content calendar management
- Use with Asana/Monday.com connectors when available
