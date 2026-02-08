---
name: deep-research
description: Conduct thorough research on a topic using multiple sources and systematic exploration. Use when asked to research, investigate, analyze deeply, or understand something comprehensively. Returns well-sourced findings with citations.
context: fork
agent: Explore
allowed-tools: Grep, Glob, Read, WebSearch, WebFetch
---

# Deep Research Protocol

Research topic: **$ARGUMENTS**

## Research Framework

### Phase 1: Define Scope
Before starting, clarify:
- What specific questions need answering?
- What type of information is needed (facts, opinions, data, trends)?
- What sources are most authoritative for this topic?
- What time frame is relevant (current, historical, future projections)?

### Phase 2: Source Discovery

**For codebase research:**
1. Use Glob to find relevant file patterns
2. Use Grep to search for keywords and concepts
3. Read key files to understand implementation

**For web research:**
1. Search for authoritative sources
2. Look for primary sources (official docs, research papers, official announcements)
3. Cross-reference multiple sources for accuracy
4. Check publication dates for recency

### Phase 3: Information Gathering

For each source:
- Extract key facts and data points
- Note the source's credibility and potential bias
- Record specific quotes or statistics with citations
- Flag contradictory information between sources

### Phase 4: Synthesis

Organize findings into:

```
## Key Findings
1. [Finding with citation]
2. [Finding with citation]

## Supporting Evidence
- Data point A (Source X)
- Data point B (Source Y)

## Contradictions / Debates
- [Where sources disagree]

## Confidence Assessment
- High confidence: [well-supported claims]
- Medium confidence: [some support]
- Low confidence: [limited sources]

## Gaps
- [What couldn't be determined]
```

### Phase 5: Quality Check

Before finalizing:
- [ ] Multiple sources confirm key claims
- [ ] Primary sources used where possible
- [ ] Recent/current information preferred
- [ ] Biases acknowledged
- [ ] Contradictory evidence presented fairly

## Output Requirements

1. **Executive Summary**: 2-3 sentences answering the core question
2. **Detailed Findings**: Organized by theme with citations
3. **Sources**: Full list with links/references
4. **Confidence Level**: Overall assessment of reliability
5. **Recommendations**: Next steps or actions based on findings
