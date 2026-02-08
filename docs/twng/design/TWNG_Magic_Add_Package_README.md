# TWNG Magic Add - Complete Package

## 📦 What's Included

This package contains everything you need to build the Magic Add feature in Lovable:

| File | Purpose |
|------|---------|
| `TWNG_Magic_Add_Design_Brief.md` | Detailed design specifications, wireframes, copy, and UX flows |
| `TWNG_Lovable_Prompt_MagicAdd.md` | Ready-to-paste prompt for Lovable |
| `twng-mcp-server/` | Custom MCP server for Lovable integration |

---

## 🚀 Quick Start Guide

### Option 1: Simple (Prompt Only)

1. Open Lovable
2. Start a new project
3. Copy the entire content of `TWNG_Lovable_Prompt_MagicAdd.md`
4. Paste into Lovable chat
5. Let Lovable build the feature

### Option 2: With MCP Server (Full Integration)

1. **Set up the MCP server**:
   ```bash
   cd twng-mcp-server
   npm install
   npm run build
   ```

2. **Add to Lovable connectors** (Settings → Connectors → Personal):
   ```json
   {
     "mcpServers": {
       "twng": {
         "command": "node",
         "args": ["/full/path/to/twng-mcp-server/dist/index.js"]
       }
     }
   }
   ```

3. **Start building in Lovable**:
   - Paste the prompt from `TWNG_Lovable_Prompt_MagicAdd.md`
   - Lovable will use the MCP tools automatically when available

---

## 📋 Design Brief Highlights

### User Flow
```
[+] Button → Capture → Processing → Results → Story → Success
                                      ↓
                                   [Edit]
```

### Key Screens

1. **Capture**: Photo/upload with drag & drop
2. **Processing**: Animated guitar silhouette loading
3. **Results**: AI identification with confidence score
4. **Story**: "What's the story?" prompt with voice input
5. **Success**: Celebration + next actions

### Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#D4A574` (warm amber) |
| Background | `#1A1A1A` |
| Surface | `#2C2C2C` |
| Font Heading | Plus Jakarta Sans |
| Font Body | Inter |

---

## 🔧 MCP Server Tools

The MCP server provides these tools to Lovable:

| Tool | What it does |
|------|--------------|
| `twng_identify_guitar` | Core Magic Add - identify guitar from description |
| `twng_search_guitars` | Search guitar database |
| `twng_get_design_tokens` | Get colors, typography, spacing |
| `twng_get_brand_models` | List models for a brand |
| `twng_validate_guitar_data` | Validate user input |
| `twng_generate_story_prompts` | Get story prompts for guitar type |
| `twng_get_ui_copy` | Get screen copy |
| `twng_get_supported_values` | Get dropdown options |

---

## ✅ Checklist

Before starting in Lovable:

- [ ] Read `TWNG_Magic_Add_Design_Brief.md` for full context
- [ ] Decide: prompt-only or MCP integration?
- [ ] If MCP: set up and test the server
- [ ] Have the Lovable prompt ready to paste

---

## 🎯 Success Metrics

When built correctly, Magic Add should:

- Complete flow in under 30 seconds
- Feel magical (the "aha" moment when guitar is identified)
- Be mobile-first but work on desktop
- Match TWNG's warm, personal brand voice

---

## 📝 Notes

- This is a **frontend-only** implementation (no backend)
- Guitar identification is **mocked** unless MCP server is connected
- Images are stored in **state only**, not uploaded
- The MCP server database is **demo data** - extend for production

---

## 🎸 Brand Reminders

- "Keep" not "document"
- Stories > specs
- Private by default
- Every guitar has a story
- Warm, personal, enthusiast-friendly

---

Good luck building! 🚀
