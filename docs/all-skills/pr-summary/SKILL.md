---
name: pr-summary
description: Summarize GitHub Pull Request changes with context. Use when reviewing PRs, understanding what changed, preparing for code review, or getting a quick overview of PR scope and impact.
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

# Pull Request Summary

## Dynamic Context (loaded automatically)

**PR Diff:**
!`gh pr view --json title,body,state,author,additions,deletions,changedFiles,reviews,comments --jq '.'`

**Changed Files:**
!`gh pr diff --name-only 2>/dev/null || echo "No PR in current branch"`

**PR Comments:**
!`gh pr view --comments 2>/dev/null | head -50 || echo "No comments"`

## Your Task

Analyze and summarize this pull request:

### 1. Overview
- **What**: One-sentence description of the change
- **Why**: The motivation/problem being solved
- **Impact**: Scope (small fix / feature / refactor / breaking change)

### 2. Key Changes
List the most important changes by category:
- **New Features**: What was added
- **Bug Fixes**: What was fixed
- **Refactoring**: Structural changes
- **Dependencies**: Package changes

### 3. Files Analysis
```
📁 Most Impacted Areas:
├── [area 1]: X files changed
├── [area 2]: Y files changed
└── [area 3]: Z files changed
```

### 4. Review Checklist
- [ ] Tests added/updated for changes
- [ ] Documentation updated if needed
- [ ] No obvious security issues
- [ ] Breaking changes documented

### 5. Questions/Concerns
Flag anything that needs clarification or looks problematic.

## Output Format

Keep the summary concise but complete. Use bullet points and visual hierarchy. Highlight risks or areas needing attention with ⚠️.
