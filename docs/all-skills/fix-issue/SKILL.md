---
name: fix-issue
description: Fix a GitHub issue by number. Use when asked to fix, resolve, or work on a specific GitHub issue. Invoke with /fix-issue [issue-number].
argument-hint: "[issue-number]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Read, Edit, Write, Grep, Glob
---

# Fix GitHub Issue Workflow

Fix GitHub issue **#$ARGUMENTS** following this structured approach:

## Phase 1: Understand the Issue

1. **Fetch issue details:**
```bash
gh issue view $ARGUMENTS --json title,body,labels,comments,state
```

2. **Identify:**
   - What exactly needs to change
   - Acceptance criteria (explicit or implied)
   - Related files or components mentioned
   - Any linked PRs or issues

## Phase 2: Locate Relevant Code

1. **Search for related files:**
   - Use Grep to find keywords from the issue
   - Use Glob to find files by pattern
   - Check test files for expected behavior

2. **Understand context:**
   - Read surrounding code
   - Check recent changes to related files
   - Identify dependencies and side effects

## Phase 3: Implement the Fix

1. **Make minimal, focused changes:**
   - Fix only what the issue describes
   - Avoid unrelated refactoring
   - Follow existing code style

2. **Add or update tests:**
   - Write tests that would have caught the bug
   - Ensure existing tests still pass

## Phase 4: Verify and Document

1. **Run tests:**
```bash
# Adjust based on project
npm test  # or pytest, go test, etc.
```

2. **Create commit with issue reference:**
```bash
git add -A
git commit -m "Fix #$ARGUMENTS: [brief description]

[Detailed explanation of what was changed and why]"
```

## Output

After completing, summarize:
- What was the root cause
- What changes were made
- How it was verified
- Any follow-up items
