# Claude Code Skills - Installation Guide

## הסקילס שנוצרו

| סקיל | תיאור | שימוש |
|------|-------|-------|
| `explain-code` | הסבר קוד עם דיאגרמות ואנלוגיות | `/explain-code` או שאלה על קוד |
| `pr-summary` | סיכום Pull Requests מ-GitHub | `/pr-summary` |
| `codebase-visualizer` | ויזואליזציה אינטראקטיבית של מבנה פרויקט | `/codebase-visualizer` |
| `fix-issue` | תיקון GitHub issues לפי מספר | `/fix-issue 123` |
| `deep-research` | מחקר מעמיק עם subagent | `/deep-research [topic]` |

## התקנה

### אפשרות 1: התקנה ידנית (מומלץ)

העתק את תיקיות הסקילס לתיקיית הסקילס האישית שלך:

```bash
# צור את התיקייה אם לא קיימת
mkdir -p ~/.claude/skills

# העתק את כל הסקילס
cp -r explain-code ~/.claude/skills/
cp -r pr-summary ~/.claude/skills/
cp -r codebase-visualizer ~/.claude/skills/
cp -r fix-issue ~/.claude/skills/
cp -r deep-research ~/.claude/skills/

# הפוך את הסקריפט להרצה
chmod +x ~/.claude/skills/codebase-visualizer/scripts/visualize.py
```

### אפשרות 2: התקנה לפרויקט ספציפי

אם רוצה את הסקילס רק לפרויקט מסוים:

```bash
# בתיקיית הפרויקט
mkdir -p .claude/skills

# העתק את הסקילס הרצויים
cp -r /path/to/explain-code .claude/skills/
# וכו'
```

## בדיקה

לאחר ההתקנה, פתח Claude Code ובדוק:

```
What skills are available?
```

או הפעל ישירות:
```
/explain-code
```

## דרישות

- **gh CLI**: נדרש עבור `pr-summary` ו-`fix-issue`
  ```bash
  # macOS
  brew install gh

  # Ubuntu/Debian
  sudo apt install gh

  # אימות
  gh auth login
  ```

- **Python 3**: נדרש עבור `codebase-visualizer`
  ```bash
  python3 --version
  ```

## Dynamic Context Injection

קרא את הקובץ `DYNAMIC_CONTEXT_INJECTION_GUIDE.md` ללמוד איך להוסיף הזרקת מידע דינמי לסקילס שלך.

## מבנה הקבצים

```
claude-skills/
├── INSTALLATION_README.md (הקובץ הזה)
├── DYNAMIC_CONTEXT_INJECTION_GUIDE.md
├── explain-code/
│   └── SKILL.md
├── pr-summary/
│   └── SKILL.md
├── codebase-visualizer/
│   ├── SKILL.md
│   └── scripts/
│       └── visualize.py
├── fix-issue/
│   └── SKILL.md
└── deep-research/
    └── SKILL.md
```

## התאמה אישית

כל SKILL.md ניתן לעריכה. שנה את:
- `description` - כדי לשפר את הטריגרים
- `allowed-tools` - להרשאות כלים
- `context: fork` - להרצה בסביבה מבודדת
- התוכן עצמו - להנחיות מותאמות אישית
