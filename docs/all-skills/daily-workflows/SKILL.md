---
name: daily-workflows
description: Daily, weekly, and monthly workflow routines for marketing professionals. Use for establishing consistent habits, automating routine tasks, and maintaining work rhythm.
---

# Daily Workflows & Routines

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Time**: !`date '+%H:%M'`
**Day of Week**: !`date '+%A'`
**Week Number**: !`date '+%V'`

### Current Work Phase
!`hour=$(date '+%H'); if [ $hour -lt 9 ]; then echo "🌅 PRE-WORK: Prepare for the day"; elif [ $hour -lt 12 ]; then echo "🧠 MORNING: Peak focus time - deep work"; elif [ $hour -lt 14 ]; then echo "🍽️ MIDDAY: Meetings and lunch"; elif [ $hour -lt 17 ]; then echo "📋 AFTERNOON: Administrative and follow-ups"; else echo "🌙 EVENING: Wrap up or personal time"; fi`

### Day-Specific Focus
!`day=$(date '+%u'); case $day in 1) echo "📋 MONDAY: Planning, weekly priorities, client check-ins";; 2) echo "⚡ TUESDAY: Deep work, content creation";; 3) echo "📧 WEDNESDAY: Outreach, meetings, collaboration";; 4) echo "🎯 THURSDAY: Project execution, deliverables";; 5) echo "📊 FRIDAY: Review, reporting, next week prep";; 6) echo "🧹 SATURDAY: Catch up or rest";; 7) echo "☀️ SUNDAY: Planning, learning, recharge";; esac`

---

## Daily Workflows

### Morning Startup (9:00-9:30)

```markdown
## Morning Checklist

### First 5 Minutes
- [ ] Review calendar for today
- [ ] Check for urgent messages (Slack/Email)
- [ ] Coffee/tea ready ☕

### Next 10 Minutes
- [ ] Identify today's TOP 3 priorities
- [ ] Time-block focus sessions
- [ ] Note any deadlines

### Final 15 Minutes
- [ ] Respond to urgent items only
- [ ] Set status (Slack: "Focus mode until [time]")
- [ ] Close unnecessary tabs/apps

### Today's Priorities
1. 🎯 __________________________________
2. ⚡ __________________________________
3. ✅ __________________________________
```

### Midday Check-in (12:00-12:15)

```markdown
## Midday Review

### Progress Check
- [ ] Priority 1: ___% complete
- [ ] Priority 2: ___% complete
- [ ] Priority 3: ___% complete

### Adjustments Needed
- [ ] Reschedule anything?
- [ ] Need help with anything?
- [ ] New urgent items?

### Afternoon Plan
Focus for next 2 hours: _____________
```

### End of Day Shutdown (17:00-17:30)

```markdown
## Shutdown Routine

### Wrap Up
- [ ] Update task statuses
- [ ] Log time (if tracking)
- [ ] Move incomplete tasks to tomorrow

### Communications
- [ ] Inbox to <20 emails
- [ ] Respond to Slack DMs
- [ ] Send any promised follow-ups

### Tomorrow Prep
- [ ] Review tomorrow's calendar
- [ ] Note tomorrow's top 3 priorities
- [ ] Prep any materials needed

### Mental Closure
- [ ] Write "Shutdown complete" (literally)
- [ ] Close work apps
- [ ] Work brain OFF 🧠
```

---

## Weekly Workflows

### Monday: Planning Day

```markdown
# Monday Planning

## 1. Week Review (15 min)
- [ ] Check calendar for the week
- [ ] Review project statuses
- [ ] Identify deadlines

## 2. Priority Setting (15 min)
**This week's #1 goal**: ________________

Must complete:
- [ ] _____________
- [ ] _____________
- [ ] _____________

## 3. Client Check-ins
| Client | Status | Need This Week |
|--------|--------|----------------|
| Elements | | |
| TWNG | | |
| Other | | |

## 4. Meeting Prep
| Meeting | Day/Time | Prep Needed |
|---------|----------|-------------|
| | | |

## 5. Time Blocks Set
- [ ] Deep work blocks scheduled
- [ ] Meeting clusters created
- [ ] Buffer time added
```

### Wednesday: Outreach Day

```markdown
# Wednesday Outreach

## Outreach Tasks
- [ ] Send __ prospecting emails
- [ ] LinkedIn: __ connection requests
- [ ] Follow up on pending conversations

## Content Distribution
- [ ] Share content on social
- [ ] Engage with industry posts
- [ ] Comment on client posts

## Relationship Maintenance
- [ ] Check in with __ contact
- [ ] Send helpful resource to __
```

### Friday: Review Day

```markdown
# Friday Review

## Week Review (20 min)

### Wins 🏆
-
-
-

### Didn't Complete ❌
| Task | Why | Action |
|------|-----|--------|
| | | |

### Lessons Learned 💡
-

## Metrics Review
| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| | | | |

## Next Week Prep (15 min)
- [ ] Clear inbox to zero
- [ ] Update project boards
- [ ] Note Monday's first priority

## Client Updates
| Client | Status | Need to Communicate |
|--------|--------|---------------------|
| | | |
```

---

## Monthly Workflows

### 1st of Month: Strategy Review

```markdown
# Monthly Planning: [Month Year]

## Last Month Review

### Revenue/Goals
| Metric | Target | Actual | Variance |
|--------|--------|--------|----------|
| | | | |

### Client Health
| Client | Status | NPS | Notes |
|--------|--------|-----|-------|
| Elements | 🟢/🟡/🔴 | | |
| TWNG | | | |

### Wins
-

### Challenges
-

## This Month Plan

### Goals
1.
2.
3.

### Key Projects
| Project | Client | Due | Priority |
|---------|--------|-----|----------|
| | | | |

### Revenue Target
Target: ₪_________
Pipeline: ₪_________

### Important Dates
| Date | Event | Prep Needed |
|------|-------|-------------|
| | | |
```

### 15th of Month: Mid-Month Check

```markdown
# Mid-Month Check: [Month]

## Progress vs Goals
| Goal | Target | Current | On Track? |
|------|--------|---------|-----------|
| | | | 🟢/🟡/🔴 |

## Adjustments Needed
-

## Second Half Priorities
1.
2.
3.
```

### End of Month: Close & Report

```markdown
# Monthly Close: [Month]

## Final Numbers
| Metric | Target | Actual | % |
|--------|--------|--------|---|
| Revenue | | | |
| New clients | | | |
| Projects delivered | | | |

## Client Reports Sent
- [ ] Elements monthly report
- [ ] TWNG progress update
- [ ] Other client updates

## Admin
- [ ] Invoices sent
- [ ] Expenses logged
- [ ] Time tracked reconciled
```

---

## Recurring Tasks by Day

### Daily (Every Day)
- Morning startup routine
- Check priority dashboard
- Respond to urgent messages
- End of day shutdown

### Monday
- Weekly planning session
- Review all project statuses
- Client check-ins
- Set week priorities

### Tuesday
- Content creation focus
- Deep work block (AM)
- Internal meetings (PM)

### Wednesday
- Outreach day
- Networking/relationship building
- Social media engagement

### Thursday
- Deliverable completion
- Client presentations
- Strategy work

### Friday
- Week review & metrics
- Admin & invoicing
- Next week prep
- Inbox zero

---

## Client-Specific Workflows

### Elements by Tal Man

**Weekly:**
- [ ] Review Shopify analytics
- [ ] Check Klaviyo email performance
- [ ] Monitor Meta ads performance
- [ ] Social media content review

**Monthly:**
- [ ] Performance report
- [ ] Strategy review call
- [ ] Content calendar planning
- [ ] Campaign planning

### TWNG

**Weekly:**
- [ ] Content review
- [ ] Community check-in
- [ ] Feature/launch planning
- [ ] Luthier outreach progress

**Monthly:**
- [ ] Marketing metrics review
- [ ] Community growth analysis
- [ ] Content performance
- [ ] Strategy alignment

---

## Automation Opportunities

### Email Templates to Create
- [ ] Meeting follow-up
- [ ] Project kickoff
- [ ] Weekly update
- [ ] Invoice reminder
- [ ] Thank you note

### Recurring Reminders to Set
- Monday 9 AM: Weekly planning
- Wednesday 9 AM: Outreach focus
- Friday 4 PM: Week review
- 1st of month: Monthly planning
- 15th of month: Mid-month check
- Last Friday: Monthly close

### Tools to Connect
- Calendar → Task manager sync
- Email → CRM logging
- Time tracker → Invoicing
- Social → Scheduler

---

## Focus & Energy Management

### Peak Performance Hours
Based on personal energy:
- **High energy tasks**: [Time] - [Time]
- **Medium energy tasks**: [Time] - [Time]
- **Low energy tasks**: [Time] - [Time]

### Break Schedule
- Every 90 min: 10 min break
- Lunch: 30-60 min minimum
- Afternoon: 15 min walk/stretch

### Distraction Blockers
- Focus mode hours: [Time] - [Time]
- Phone on DND: [Time] - [Time]
- Email check times: [Times only]
- Slack response windows: [Times only]

---

## Integration Points

- Use with `@task-management` for task prioritization
- Use with `@campaign-planning` for campaign workflows
- Use with `@elements-marketing` for Elements-specific routines
- Use with `@twng-all-in-one` for TWNG-specific workflows
