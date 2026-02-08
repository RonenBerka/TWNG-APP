---
name: content-strategy
description: Comprehensive content strategy framework including content types, channel best practices, SEO fundamentals, editorial calendars, and content performance optimization. Use for planning and executing content across all channels.
---

# Content Strategy Framework

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Current Quarter**: !`echo "Q$(( ($(date '+%-m')-1)/3+1 )) $(date '+%Y')"`
**Week of Year**: !`date '+%V'`
**Content Season**: !`month=$(date '+%-m'); if [ $month -eq 1 ]; then echo "🎯 Planning Season - Set annual content goals"; elif [ $month -ge 2 ] && [ $month -le 3 ]; then echo "🌱 Spring Launch - Fresh content, new initiatives"; elif [ $month -ge 4 ] && [ $month -le 5 ]; then echo "📈 Growth Push - Scale what's working"; elif [ $month -ge 6 ] && [ $month -le 8 ]; then echo "☀️ Summer - Lighter content, engagement focus"; elif [ $month -ge 9 ] && [ $month -le 10 ]; then echo "🍂 Fall Push - Pre-holiday content prep"; else echo "🎁 Holiday Season - Gift guides, year-end content"; fi`

---

## Content Strategy Framework

### 1. Content Pillars

Define 3-5 core themes that all content ladders up to:

| Pillar | Description | Content Ratio |
|--------|-------------|---------------|
| **Educational** | How-tos, guides, tutorials | 40% |
| **Inspirational** | Stories, case studies, success | 25% |
| **Promotional** | Products, offers, CTAs | 20% |
| **Entertaining** | Fun, engaging, shareable | 15% |

### 2. Content Types by Channel

#### Blog/Website
| Type | Length | Frequency | SEO Value |
|------|--------|-----------|-----------|
| How-to guides | 1500-2500 words | 2x/month | High |
| Listicles | 1000-1500 words | 2x/month | Medium |
| Case studies | 1000-2000 words | 1x/month | High |
| News/Updates | 300-500 words | As needed | Low |
| Pillar pages | 3000+ words | Quarterly | Very High |

#### Social Media
| Platform | Post Type | Best Length | Frequency |
|----------|-----------|-------------|-----------|
| Instagram | Image + caption | 150-200 chars | 1x/day |
| Instagram Stories | Video/Image | 15 sec | 3-5x/day |
| Facebook | Link + text | 80-100 chars | 1x/day |
| LinkedIn | Article/Post | 150-300 chars | 3x/week |
| Twitter/X | Text + media | 100-120 chars | 3-5x/day |

#### Email
| Type | Length | Frequency |
|------|--------|-----------|
| Newsletter | 300-500 words | Weekly |
| Promotional | 150-250 words | 2x/month |
| Automated flows | 100-200 words | Triggered |

### 3. SEO Content Framework

#### Keyword Research Process
1. **Seed keywords** - Core terms for your business
2. **Long-tail expansion** - Questions, specific phrases
3. **Competitor analysis** - What they rank for
4. **Search intent mapping** - Informational, transactional, navigational

#### On-Page SEO Checklist
- [ ] Primary keyword in title (first 60 chars)
- [ ] Primary keyword in H1
- [ ] Keywords in first 100 words
- [ ] Keywords in H2/H3 subheadings
- [ ] Image alt text with keywords
- [ ] Internal links (3-5 per article)
- [ ] External links to authoritative sources
- [ ] Meta description (150-160 chars)
- [ ] URL slug optimized

#### Content Structure Template
```markdown
# [Primary Keyword] Title (H1)

[Hook paragraph with keyword]

## What is [Topic]? (H2)
[Definition/overview]

## Why [Topic] Matters (H2)
[Benefits, importance]

## How to [Action] (H2)
### Step 1: [Subtopic] (H3)
### Step 2: [Subtopic] (H3)
### Step 3: [Subtopic] (H3)

## [Topic] Best Practices (H2)
[Tips, recommendations]

## Common Mistakes to Avoid (H2)
[What not to do]

## Conclusion (H2)
[Summary + CTA]
```

### 4. Editorial Calendar Template

#### Monthly Planning
```
Week 1: [Theme]
- Mon: Blog post draft
- Tue: Social content creation
- Wed: Email newsletter
- Thu: Social scheduling
- Fri: Performance review

Week 2: [Theme]
...
```

#### Content Calendar Fields
| Field | Description |
|-------|-------------|
| Date | Publication date |
| Channel | Where it's published |
| Content Type | Blog, social, email, etc. |
| Topic | Subject matter |
| Keyword | Primary SEO keyword |
| Status | Draft, Review, Scheduled, Published |
| Owner | Who's responsible |
| Assets | Images, videos needed |

### 5. Content Performance Metrics

#### By Channel

**Blog/Website**:
- Pageviews, Unique visitors
- Time on page (target: >2 min)
- Bounce rate (target: <60%)
- Scroll depth
- Conversions/goals

**Social Media**:
- Reach, Impressions
- Engagement rate (target: 2-5%)
- Click-through rate
- Shares/saves
- Follower growth

**Email**:
- Open rate (target: 20-30%)
- Click rate (target: 2-5%)
- Conversion rate
- Unsubscribe rate (<0.5%)

### 6. Content Repurposing Matrix

| Original | Repurpose To |
|----------|--------------|
| Blog post | → Social posts (5-10) |
| Blog post | → Email newsletter |
| Blog post | → Infographic |
| Blog post | → Video script |
| Webinar | → Blog post |
| Webinar | → Social clips |
| Podcast | → Blog transcript |
| Case study | → Social proof posts |

### 7. Headline Formulas

**How-To**:
- "How to [Achieve Result] in [Timeframe]"
- "The Complete Guide to [Topic]"
- "[Number] Ways to [Achieve Result]"

**List**:
- "[Number] [Adjective] [Topic] for [Audience]"
- "Top [Number] [Topic] You Need to Know"

**Question**:
- "What is [Topic] and Why Does it Matter?"
- "Are You Making These [Topic] Mistakes?"

**Emotional**:
- "Why [Topic] Will Change Your [Life/Business]"
- "The Secret to [Desirable Outcome]"

### 8. CTA Best Practices

| Goal | CTA Examples |
|------|--------------|
| Read more | "Continue reading", "Learn more" |
| Subscribe | "Join our community", "Get updates" |
| Download | "Get your free guide", "Download now" |
| Purchase | "Shop now", "Add to cart" |
| Contact | "Let's talk", "Get in touch" |

**CTA Rules**:
- Use action verbs
- Create urgency when appropriate
- Make benefit clear
- One primary CTA per piece
- Above the fold placement

---

## Integration with Other Skills

- Use with `@elements-marketing` for Elements by Tal Man content
- Use with `@twng-content-creator` for TWNG articles
- Use with `@campaign-planning` for campaign content
- Use with `@brand-voice-manager` for tone consistency
