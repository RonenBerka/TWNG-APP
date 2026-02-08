---
name: campaign-planning
description: Plan and execute marketing campaigns including channel selection, content calendars, budget allocation, timeline management, and success metrics. Use for creating comprehensive campaign strategies.
---

# Campaign Planning Framework

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Current Quarter**: !`echo "Q$(( ($(date '+%-m')-1)/3+1 )) $(date '+%Y')"`
**Days Until Month End**: !`echo $(( $(date -d "$(date '+%Y-%m-01') +1 month -1 day" '+%d') - $(date '+%d') ))`
**Planning Horizon**: !`date -d '+30 days' '+%B %d'` - !`date -d '+90 days' '+%B %d, %Y'`

### Upcoming Key Dates
!`echo "Next 60 days key dates:"; date -d '+14 days' '+- %B %d: 2 weeks out'; date -d '+30 days' '+- %B %d: 1 month out'; date -d '+60 days' '+- %B %d: 2 months out'`

---

## Campaign Planning Process

### 1. Campaign Brief Template

```markdown
# Campaign Brief: [Campaign Name]

## Overview
**Campaign Name**:
**Campaign Type**: [Launch/Awareness/Conversion/Retention]
**Date Range**: [Start] - [End]
**Budget**: ₪[Amount]
**Owner**: [Name]

## Objectives
**Primary Goal**: [Specific, measurable goal]
**Secondary Goals**:
- [Goal 2]
- [Goal 3]

## Target Audience
**Primary**: [Demographics, psychographics]
**Secondary**: [Demographics, psychographics]
**Exclusions**: [Who NOT to target]

## Key Messages
**Primary Message**: [One core message]
**Supporting Messages**:
1. [Message 2]
2. [Message 3]

## Channels
| Channel | Role | Budget % |
|---------|------|----------|
| [Channel 1] | [Primary/Support] | X% |
| [Channel 2] | [Primary/Support] | X% |

## Creative Requirements
- [Asset 1]: [Specs]
- [Asset 2]: [Specs]

## Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| [KPI 1] | [Target] | [How measured] |
| [KPI 2] | [Target] | [How measured] |

## Timeline
| Date | Milestone |
|------|-----------|
| [Date] | [Milestone] |

## Approvals Needed
- [ ] [Stakeholder 1]
- [ ] [Stakeholder 2]
```

### 2. Channel Selection Matrix

| Channel | Best For | Cost | Time to Results | Effort |
|---------|----------|------|-----------------|--------|
| **Meta Ads** | Awareness, Conversions | $$$  | Days | Medium |
| **Google Ads** | Intent capture | $$$  | Days | Medium |
| **Email** | Retention, Nurture | $    | Days | Low |
| **Organic Social** | Engagement | $    | Weeks | High |
| **Content/SEO** | Long-term traffic | $$   | Months | High |
| **Influencers** | Awareness, Trust | $$$  | Weeks | Medium |
| **PR** | Credibility | $$   | Weeks | Medium |

### 3. Budget Allocation Framework

#### By Campaign Stage
| Stage | Allocation | Focus |
|-------|------------|-------|
| **Awareness** | 40% | Reach, impressions |
| **Consideration** | 35% | Engagement, clicks |
| **Conversion** | 25% | Sales, signups |

#### By Channel (E-commerce)
| Channel | % of Budget | Notes |
|---------|-------------|-------|
| Meta Ads | 40-50% | Primary driver |
| Google Ads | 20-30% | Capture intent |
| Email | 5-10% | Highest ROI |
| Content | 10-15% | Long-term |
| Other | 5-10% | Testing |

### 4. Campaign Timeline Template

```
T-30 days: Planning & Strategy
├── Define objectives
├── Identify audience
├── Set budget
└── Create brief

T-21 days: Creative Development
├── Write copy
├── Design assets
├── Review & revisions
└── Final approval

T-14 days: Setup & Testing
├── Build campaigns
├── Set up tracking
├── QA all assets
└── Test flows

T-7 days: Soft Launch
├── Limited launch
├── Monitor performance
├── Adjust targeting
└── Fix issues

T-0: Full Launch
├── Scale campaigns
├── Daily monitoring
├── Optimize
└── Report

T+7 to End: Optimization
├── A/B testing
├── Budget reallocation
├── Performance reports
└── Iteration
```

### 5. Campaign Types & Playbooks

#### Product Launch
```
Pre-Launch (2-4 weeks):
- Teaser content
- Email list building
- Influencer seeding
- PR outreach

Launch Week:
- Full campaign activation
- Email blast
- Social push
- PR coverage

Post-Launch (2-4 weeks):
- Retargeting
- User testimonials
- Optimization
```

#### Seasonal/Holiday
```
6-8 weeks before:
- Plan themes
- Create content
- Build audiences

4-6 weeks before:
- Early bird offers
- Warm up audiences
- Test creative

2-4 weeks before:
- Full campaign launch
- Increase budgets
- Daily optimization

During:
- Flash sales
- Urgency messaging
- Customer service ready

After:
- Post-holiday offers
- Clearance
- Retargeting
```

#### Always-On
```
Awareness Layer:
- Brand awareness ads
- Content distribution
- Organic social

Consideration Layer:
- Retargeting
- Email nurture
- Content offers

Conversion Layer:
- Product ads
- Cart abandonment
- Promotional offers

Retention Layer:
- Customer emails
- Loyalty programs
- Cross-sell/upsell
```

### 6. A/B Testing Framework

#### What to Test (Priority Order)
1. **Audiences** - Who you target
2. **Offers** - What you're promoting
3. **Creative** - Visual/copy variations
4. **Landing Pages** - Where traffic goes
5. **Timing** - When ads run

#### Testing Rules
- Test one variable at a time
- Minimum sample size: 1000 impressions
- Run for at least 3-7 days
- 95% statistical significance
- Document all tests

### 7. Reporting Template

```markdown
# Campaign Report: [Name]
**Period**: [Start] - [End]
**Prepared**: [Date]

## Executive Summary
[2-3 sentences on overall performance]

## Performance vs. Goals
| Metric | Goal | Actual | % of Goal |
|--------|------|--------|-----------|
| [Metric] | [Goal] | [Actual] | [%] |

## Channel Performance
| Channel | Spend | Results | CPA | ROAS |
|---------|-------|---------|-----|------|
| [Channel] | ₪X | X | ₪X | X.Xx |

## Top Performers
- [What worked best]
- [Second best]

## Underperformers
- [What didn't work]
- [Why]

## Key Learnings
1. [Learning 1]
2. [Learning 2]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## Integration

- Use with `@elements-marketing` for Elements campaigns
- Use with `@twng-marketing-launch` for TWNG launch
- Use with `@ads-account-management` for ad execution
- Use with `@content-strategy` for content planning
