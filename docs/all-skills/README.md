# Ronen's Claude Code Skills Collection

**Total Skills: 35**
**Last Updated: February 2026**

---

## 🚀 Quick Installation

Copy all skills to Claude Code's skills directory:

```bash
cp -r ~/Dropbox/Mac\ \(2\)/Downloads/cowork/all-skills/* ~/.claude/skills/
```

---

## 📋 Skills by Category

### 🎯 Master Skills (Start Here)
| Skill | Description |
|-------|-------------|
| `marketing-master` | Central marketing hub - routes to all marketing skills |
| `elements-marketing` | Complete toolkit for Elements by Tal Man |
| `twng-all-in-one` | Complete toolkit for TWNG platform |

### 📈 Marketing & Strategy
| Skill | Description |
|-------|-------------|
| `content-strategy` | Content planning, SEO, editorial calendars |
| `brand-voice-manager` | Voice guidelines, style, tone adaptation |
| `campaign-planning` | Campaign briefs, budgets, timelines |
| `competitive-intel` | Competitor research, battle cards, positioning |
| `content-calendar-social` | Social media content planning |

### ✍️ Copywriting & Content
| Skill | Description |
|-------|-------------|
| `hebrew-luxury-copywriting` | Hebrew copy for luxury/jewelry |
| `satirical-hebrew-writing` | Israeli satirical content |
| `outreach-drafts` | Email, LinkedIn, follow-up templates |

### 📢 Advertising
| Skill | Description |
|-------|-------------|
| `ads-account-management` | Meta & Google Ads management |
| `meta-ads-jewelry-ecommerce` | Meta ads for jewelry e-commerce |
| `landing-page-optimizer` | Landing page conversion optimization |

### 🛒 E-commerce
| Skill | Description |
|-------|-------------|
| `shopify-jewelry-optimization` | Shopify store optimization |
| `ecommerce-conversion-optimizer` | Conversion rate optimization |
| `email-marketing-retention` | Email & retention strategies |

### 📸 Photography & Visual
| Skill | Description |
|-------|-------------|
| `jewelry-photography-guide` | Jewelry product photography |
| `jewelry-model-photography` | Adding jewelry to model photos |
| `animation-prompt-generator` | AI animation prompts |

### 💼 Business
| Skill | Description |
|-------|-------------|
| `business-idea-evaluator` | Business idea assessment |

### ⚙️ Productivity
| Skill | Description |
|-------|-------------|
| `task-management` | Task prioritization, project tracking |
| `daily-workflows` | Daily, weekly, monthly routines |

### 🎸 TWNG (Guitar Platform)
| Skill | Description |
|-------|-------------|
| `twng-brand-voice` | TWNG brand messaging |
| `twng-content-creator` | Guitar articles & guides |
| `twng-product-specs` | PRDs & feature specs |
| `twng-marketing-launch` | Launch campaigns |
| `twng-luthier-outreach` | Luthier communications |
| `twng-guitar-knowledge` | Guitar terminology & brands |
| `twng-community-management` | Community moderation |

### 💻 Development (from Claude Code Docs)
| Skill | Description |
|-------|-------------|
| `explain-code` | Code explanation with diagrams |
| `pr-summary` | GitHub PR summaries |
| `codebase-visualizer` | Interactive codebase visualization |
| `fix-issue` | Fix GitHub issues by number |
| `deep-research` | Deep research with subagents |

---

## ⚡ Dynamic Context

All skills include **Dynamic Context Injection** that provides:
- Current date, day of week, time
- Seasonal marketing context
- Hebrew calendar/holidays (where relevant)
- Day-specific workflow suggestions
- Quarter/week context

---

## 🔗 Skill Dependencies

```
marketing-master
├── content-strategy
├── brand-voice-manager
├── campaign-planning
├── competitive-intel
├── outreach-drafts
├── task-management
└── daily-workflows

elements-marketing
├── All jewelry/e-commerce skills
├── ads-account-management
├── meta-ads-jewelry-ecommerce
├── shopify-jewelry-optimization
├── email-marketing-retention
└── hebrew-luxury-copywriting

twng-all-in-one
├── twng-brand-voice
├── twng-content-creator
├── twng-product-specs
├── twng-marketing-launch
├── twng-luthier-outreach
├── twng-guitar-knowledge
└── twng-community-management
```

---

## 📖 Usage Examples

### Start Your Day
```
Use @marketing-master for daily startup checklist
```

### Plan a Campaign
```
Use @campaign-planning for campaign brief
Then @competitive-intel for positioning
Then @content-strategy for content plan
```

### Work on Elements
```
Use @elements-marketing for all Elements by Tal Man work
```

### Work on TWNG
```
Use @twng-all-in-one for all TWNG platform work
```

---

## 🔧 Troubleshooting

**Skills not appearing?**
1. Verify files are in `~/.claude/skills/`
2. Each skill needs a `SKILL.md` file
3. Restart Claude Code if needed

**Dynamic Context not working?**
- Requires shell access for `!`command`` syntax
- Works in Claude Code CLI, may not work in all environments

---

## 📝 Notes

- All skills optimized for marketing professional workflow
- Hebrew support in relevant skills
- Integrates with MCP connectors (Klaviyo, Canva, etc.)
- Compatible with Product Management plugin skills
