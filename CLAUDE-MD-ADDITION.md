## SESSION LOGGING RULE — CRITICAL

After every completed task (bug fix, feature, deploy, investigation), IMMEDIATELY append 
a summary to ~/Desktop/twng-app/SESSION-LOG.md. Do NOT wait for end of session.

Format:
```
### [Task Name]
- ✅/❌ What was done
- Files: [changed files]
- ⚠️ Issues encountered
```

Read SESSION-LOG.md at the start of every session to understand recent history.

## WORKFLOW RULES

1. NEVER deploy directly to production without running `npm run build` first
2. NEVER use git worktrees — use feature branches instead
3. For any feature work: `git checkout -b feature/[name]` → work → build → merge to main → deploy
4. After every deploy, verify the live site loads
5. If the site goes down, immediately redeploy from main: `git checkout main && npm run build && npx netlify deploy --prod --dir=dist`
