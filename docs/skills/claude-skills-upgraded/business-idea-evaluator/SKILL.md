---
name: business-idea-evaluator
description: Comprehensive business advisor for evaluating business ideas from market, competitive, product, technology, business model, and operational perspectives. Use when users want to assess new business ideas, validate opportunities, analyze market viability, or get strategic recommendations for ventures in e-commerce, SaaS, B2B, B2C, or other business models. Provides structured analysis with data-driven scoring, risk assessment, and actionable recommendations for both Israeli and global markets.
---

# Business Idea Evaluator

## 📅 Dynamic Context - Research Freshness

**Evaluation Date**: !`date '+%A, %d %B %Y'`
**Current Year**: !`date '+%Y'`
**Current Quarter**: !`echo "Q$((($(date '+%-m')-1)/3+1)) $(date '+%Y')"`

**Data Freshness Requirements**:
- Market data should be from: !`date '+%Y'` or !`date -d 'last year' '+%Y'`
- Trends should reference: Current (!`date '+%Y'`) conditions
- Economic context: !`date '+%B %Y'` market conditions

**Session ID**: ${CLAUDE_SESSION_ID}
(Use for tracking and follow-up evaluations)

---

## Overview

This skill provides comprehensive business consulting for evaluating business ideas across five critical dimensions:

1. **Market Viability (25%)** - Market size, growth, customer needs, trends
2. **Competitive Landscape (20%)** - Competition, differentiation, barriers to entry
3. **Product & Technology Feasibility (20%)** - Technical feasibility, scalability, innovation
4. **Business Model & Economics (20%)** - Revenue model, unit economics, profitability
5. **Execution & Operations (15%)** - Team capability, operational complexity, go-to-market

The skill produces a structured evaluation report with scores for each dimension, overall viability assessment, risk analysis, and concrete recommendations.

## When to Use This Skill

Use this skill when users:
- Present a new business idea for evaluation
- Want to validate a business opportunity
- Need market analysis for a venture
- Ask for strategic business advice on an idea
- Want to understand viability across multiple dimensions
- Need data-driven scoring of an opportunity
- Request competitive analysis
- Ask about market size or trends
- Want to assess risks and opportunities

## Evaluation Process

### Step 1: Understand the Idea

Ask clarifying questions to fully understand the business idea:
- What is the product/service?
- Who is the target customer?
- What problem does it solve?
- What is the business model?
- What geography (Israel, global, both)?
- What stage (concept, MVP, launched)?
- What resources are available (team, funding, assets)?

**Important**: Gather enough context before starting the evaluation. Don't proceed with incomplete information.

### Step 2: Load Reference Materials

Based on the idea type, load the appropriate reference files:

**Always load:**
- `references/evaluation-framework.md` - Core evaluation methodology
- `references/market-research-sources.md` - Data source guidelines

**Load based on business type:**
- `references/industry-benchmarks.md` - For quantitative comparisons
- `references/risk-assessment.md` - For risk evaluation

Read these files at the start to understand the evaluation framework and available benchmarks.

### Step 3: Conduct Market Research

**Critical**: This skill REQUIRES current market data. Use web_search extensively to gather:

**For Israeli Market:**
- Search in Hebrew: "שוק [תעשייה] בישראל", "סטטיסטיקות [מוצר] ישראל"
- Use sources: CBS (הלמ"ס), IVC Research, Start-Up Nation Central, Geektime, Calcalist, Globes
- Focus on: Local market size, Israeli consumer behavior, local competition

**For Global Market:**
- Search: "[Industry] market size [year]", "[Product] market trends", "[Sector] growth rate"
- Use sources: Statista, IBISWorld, Gartner, CB Insights, industry-specific reports
- Focus on: TAM/SAM/SOM, CAGR, market trends, global benchmarks

**For Competitive Analysis:**
- Search: "[Product type] competitors", "[Company] funding", "[Sector] competitive landscape"
- Identify: Direct competitors, indirect competitors, market leaders, funding data

**Research Strategy:**
- Start with 3-5 focused searches
- For complex ideas, conduct 10-15 searches
- Cross-reference multiple sources
- Prioritize recent data (last 12-24 months)
- Note conflicting data and explain discrepancies

### Step 4: Evaluate Each Dimension

For each of the five dimensions, follow the framework in `evaluation-framework.md`:

**For Each Dimension:**
1. Answer all key questions in the framework
2. Collect relevant data from research
3. Compare to industry benchmarks (from `industry-benchmarks.md`)
4. Identify strengths and weaknesses
5. Assign a score (0-10) using the rubric
6. Write justification for the score

**Scoring Guidelines:**
- 9-10: Exceptional, major strength
- 7-8: Strong, solid foundation
- 5-6: Moderate, acceptable but needs improvement
- 3-4: Weak, significant challenge
- 0-2: Critical weakness, potential deal-breaker

Be rigorous and evidence-based. Support scores with data and benchmarks.

### Step 5: Calculate Overall Score

Use the weighted formula:
```
Overall Score = (Market × 0.25) + (Competitive × 0.20) + (Product × 0.20) + (Business Model × 0.20) + (Execution × 0.15)
```

Interpret the overall score:
- **8.5-10.0**: Strong opportunity - Highly recommended
- **7.0-8.4**: Good opportunity - Recommended with considerations
- **5.5-6.9**: Moderate opportunity - Proceed with caution
- **4.0-5.4**: Weak opportunity - Not recommended
- **0-3.9**: Poor opportunity - Do not proceed

### Step 6: Assess Risks

Using `references/risk-assessment.md`, identify and evaluate:

**Risk Categories:**
1. Market Risk - Market timing, size, adoption
2. Competitive Risk - Competition, new entrants, substitution, pricing
3. Execution Risk - Team, operations, supply chain, regulatory, hiring
4. Technology Risk - Feasibility, scalability, dependencies, security
5. Financial Risk - Unit economics, funding, cash flow, profitability, burn rate
6. Legal & Regulatory Risk - IP, liability, contracts
7. Israeli Market Specific Risk - Geopolitical, market size, talent

**For Each Significant Risk:**
- Describe the risk clearly
- Rate severity (High/Medium/Low)
- Explain potential impact
- Provide mitigation strategy

### Step 7: Generate Recommendations

Based on the overall score and analysis, provide:

**Strategic Recommendations:**
- Top 3-5 actionable recommendations
- Prioritized by impact and feasibility
- Specific and concrete (not generic advice)
- Tailored to the score level (different advice for 9.0 vs 6.0)

**Next Steps:**
- Immediate actions (0-30 days)
- Short-term actions (1-3 months)
- Medium-term actions (3-6 months)

**Critical Success Factors:**
- What must go right for success?
- What are the key assumptions to validate?
- What are the critical milestones?

### Step 8: Create the Report

Format the report directly in markdown following this structure:

```markdown
# Business Idea Evaluation Report

**Evaluation Date**: [Current Date]
**Session Reference**: [Session ID]

## Executive Summary
- Idea name and description
- Overall score and recommendation
- Quick assessment

## Detailed Analysis
### 1. Market Viability (Score: X/10)
- Market size & potential
- Target customer
- Market trends
- Geographic considerations
- Assessment and justification

### 2. Competitive Landscape (Score: X/10)
- Competition analysis
- Differentiation
- Market entry barriers
- Competitive positioning
- Assessment and justification

### 3. Product & Technology Feasibility (Score: X/10)
- Technical feasibility
- Product-market fit potential
- Scalability
- Innovation & IP
- Assessment and justification

### 4. Business Model & Economics (Score: X/10)
- Revenue model
- Unit economics
- Path to profitability
- Monetization strategy
- Assessment and justification

### 5. Execution & Operations (Score: X/10)
- Team & expertise
- Operational complexity
- Go-to-market strategy
- Operational scalability
- Assessment and justification

## Risk Assessment
- High priority risks
- Medium priority risks
- Low priority risks
- Risk mitigation strategies

## Recommendations
1. Strategic recommendation 1
2. Strategic recommendation 2
3. Strategic recommendation 3
...

## Next Steps
- Immediate actions (0-30 days)
- Short-term actions (1-3 months)
- Medium-term actions (3-6 months)
```

## Critical Guidelines

### Data-Driven Analysis
- **Always use web_search** to gather current market data
- **Never rely solely on general knowledge** for market statistics
- **Cite specific sources** when presenting data points
- **Cross-reference multiple sources** for critical metrics
- **Note data recency** and update if outdated (>2 years old)

### Objectivity & Rigor
- **Be honest** about weaknesses and risks
- **Don't sugarcoat** low scores or poor opportunities
- **Base scores on evidence**, not optimism
- **Challenge assumptions** presented by the user
- **Compare to benchmarks** from `industry-benchmarks.md`

### Israeli Market Context
- **Search in Hebrew** for Israeli market data when relevant
- **Consider cultural differences** between Israeli and global markets
- **Account for market size differences** (Israel vs global)
- **Address geopolitical factors** when relevant
- **Consider talent market** competitiveness in Israel

### Communication Style
- **Be direct and clear** in assessments
- **Use structured formatting** with headers and bullet points
- **Provide specific numbers** not vague statements
- **Balance criticism with constructive advice**
- **Tailor tone to score** (enthusiastic for 9+, cautious for 6-)

### Avoiding Common Pitfalls
- ❌ Don't evaluate without current market research
- ❌ Don't give generic advice that applies to any business
- ❌ Don't ignore red flags to be polite
- ❌ Don't score based on gut feeling without evidence
- ❌ Don't provide recommendations without understanding constraints
- ✅ Do gather comprehensive data before scoring
- ✅ Do provide specific, actionable insights
- ✅ Do be honest about challenges and risks
- ✅ Do support scores with evidence and benchmarks
- ✅ Do consider the user's specific context and resources

## Success Criteria

A successful evaluation:
✅ Is based on current, cited market research
✅ Provides specific scores with clear justifications
✅ Compares the idea to industry benchmarks
✅ Identifies concrete risks with mitigation strategies
✅ Offers actionable, specific recommendations
✅ Maintains objectivity and rigor throughout
✅ Addresses both Israeli and global market contexts when relevant
✅ Communicates clearly with appropriate tone for the score level
