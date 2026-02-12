# Dynamic Context Injection Guide

הזרקת מידע דינמי לסקילס - טכניקה מתקדמת להעשרת סקילס עם נתונים חיים.

## מה זה Dynamic Context Injection?

הסינטקס `!`command`` מריץ פקודות shell **לפני** שתוכן הסקיל נשלח ל-Claude. הפלט של הפקודה מחליף את ה-placeholder, כך ש-Claude מקבל נתונים אמיתיים ולא את הפקודה עצמה.

## דוגמה בסיסית

```yaml
---
name: git-status
description: Show current git state
---

## Current State
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Last commit: !`git log -1 --oneline`
```

כש-Claude מריץ את הסקיל הזה, הוא מקבל:
```
## Current State
- Branch: main
- Status: M README.md
- Last commit: a1b2c3d Add new feature
```

## שימושים נפוצים

### 1. GitHub Integration
```yaml
## PR Context
- Title: !`gh pr view --json title --jq '.title'`
- Changes: !`gh pr diff --stat`
- Comments: !`gh pr view --comments`
```

### 2. Project Info
```yaml
## Project Details
- Dependencies: !`cat package.json | jq '.dependencies | keys'`
- Scripts: !`cat package.json | jq '.scripts'`
- Node version: !`node --version`
```

### 3. System State
```yaml
## Environment
- Working dir: !`pwd`
- Git remotes: !`git remote -v`
- Recent changes: !`git log --oneline -5`
```

### 4. API Data
```yaml
## API Status
- Health: !`curl -s https://api.example.com/health | jq '.status'`
- Version: !`curl -s https://api.example.com/version`
```

## טיפים חשובים

### Error Handling
השתמש ב-`||` לטיפול בשגיאות:
```yaml
!`gh pr view 2>/dev/null || echo "No PR found"`
```

### Limit Output
הגבל פלט ארוך עם `head`:
```yaml
!`git log --oneline | head -10`
```

### JSON Processing
השתמש ב-`jq` לעיבוד JSON:
```yaml
!`gh api repos/:owner/:repo --jq '.stargazers_count'`
```

### Multiple Commands
שרשר פקודות:
```yaml
!`git fetch && git status`
```

## דוגמה מלאה - Weekly Report Skill

```yaml
---
name: weekly-report
description: Generate weekly development report
context: fork
---

# Weekly Development Report

## Period
!`echo "Week of $(date -d 'last monday' '+%Y-%m-%d')"`

## Commits This Week
!`git log --since="1 week ago" --oneline --author="$(git config user.name)" | head -20`

## Files Changed
!`git diff --stat @{1.week.ago} 2>/dev/null || echo "No changes tracked"`

## PRs Merged
!`gh pr list --state merged --author @me --json title,mergedAt --jq '.[] | "\(.title) - \(.mergedAt)"' 2>/dev/null | head -10 || echo "No PRs merged"`

## Open Issues Assigned
!`gh issue list --assignee @me --json title,number --jq '.[] | "#\(.number): \(.title)"' 2>/dev/null || echo "No issues assigned"`

---
Generate a summary of this week's development activity.
```

## איך להוסיף את זה לסקילס הקיימים שלך

### דוגמה: שיפור ads-account-management

```yaml
---
name: ads-report
description: Generate Meta Ads performance report
---

## Campaign Data (if connected)
!`echo "Current date: $(date '+%Y-%m-%d')"`

## Instructions
1. Review the current campaign performance
2. Identify top and bottom performers
3. Suggest optimizations based on data
```

### דוגמה: שיפור content-calendar-social

```yaml
---
name: content-status
description: Check content calendar status
---

## Current Week
!`date '+Week %V of %Y'`

## Upcoming Dates
!`date -d '+1 week' '+Next week: %Y-%m-%d'`
!`date -d '+1 month' '+Next month: %B %Y'`

Plan content for these upcoming dates...
```

## מגבלות

1. **הפקודות רצות מקומית** - צריך שהכלים יהיו מותקנים (gh, jq, etc.)
2. **Timeout** - פקודות ארוכות עלולות לגרום לבעיות
3. **Security** - היזהר מפקודות שחושפות מידע רגיש
4. **Availability** - בדוק שהשירותים זמינים (APIs, git remotes)

## Best Practices

1. **תמיד הוסף fallback** - `|| echo "default value"`
2. **הגבל פלט** - השתמש ב-`head`, `tail`, `--limit`
3. **טפל ב-errors** - הפנה stderr ל-`/dev/null` או טפל בו
4. **שמור על ניקיון** - סנן רק את המידע הרלוונטי עם `jq` או `grep`
