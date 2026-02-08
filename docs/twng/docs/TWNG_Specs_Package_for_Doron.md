# TWNG — Complete Specs Package

> **Prepared for:** Doron
> **Date:** February 2026
> **Status:** Ready for Development

---

## 📋 Summary

This package contains all product specifications and design documents needed to build TWNG.

---

## 🗂️ Document Index

### Core Decisions

| Document | Description | Link |
|----------|-------------|------|
| **Meeting Decisions** | Privacy (User Choice) + Free Unlimited | `docs/Meeting_Decisions_Summary.md` |
| **FAQ v3** | Updated with new model | `docs/TWNG_FAQ_v3.md` |
| **Pricing Model v2** | Free forever + future services | `docs/TWNG_Pricing_Model_v2.md` |
| **Onboarding Flow v3** | +Visibility selection step | `docs/TWNG_Onboarding_Flow_v3.md` |

---

### Product Specs

| Document | Priority | Description |
|----------|----------|-------------|
| **Magic Add Flow** | P0 | AI guitar identification - full flow | `docs/specs/Magic_Add_Flow_Spec.md` |
| **Visibility Selector** | P0 | User Choice privacy controls | `docs/specs/Visibility_Selector_Spec.md` |
| **Feedback Loop** | P0 | How users improve AI accuracy | `docs/specs/Feedback_Loop_Spec.md` |
| **Serial Decoder** | P1 | Serial number lookup & decoding | `docs/specs/Serial_Number_Decoder_Spec.md` |
| **Voice-to-Story** | P2 | Voice recording for stories | `docs/specs/Voice_to_Story_Spec.md` |

---

### Development Guides

| Document | Description |
|----------|-------------|
| **Feedback Loop Dev Guide** | Database schema, APIs, TypeScript code | `docs/specs/Feedback_Loop_Dev_Guide.md` |

---

### Design Documents

| Document | Description |
|----------|-------------|
| **Design System** | Colors, typography, components | `docs/design/TWNG_Design_System.md` |
| **UI Screens** | All screens in ASCII wireframes | `docs/design/TWNG_UI_Screens.md` |

---

### Marketing (Updated)

| Document | Description |
|----------|-------------|
| **Landing Page v3** | "Your guitars. Your way." messaging | `marketing/TWNG_Landing_Page_v3.md` |

---

## 🎯 Key Decisions Recap

### 1. Privacy Model: User Choice
- Three levels: 🔒 Private / 🔗 Link / 🌐 Public
- Per guitar control
- Private is default
- User chooses at save time (+1 step in flow)

### 2. Pricing: Free Forever
- Unlimited guitar uploads
- Unlimited photos
- All features free
- Future: Premium services (not limits)

### 3. Feedback Loop
- Users verify/correct AI identifications
- Trust score system
- Auto-flag extreme corrections
- Opt-in image sharing for RAG

### 4. Language: English Only
- All product UI in English
- No Hebrew in the app/website
- Hebrew only for: Ronen's pre-launch outreach (emails, social media)
- Launch market: Israel (for convenience), but product is global/English

---

## 📊 Implementation Priority

### Phase 1: MVP (Months 1-2)
| Feature | Spec |
|---------|------|
| Magic Add (basic) | `Magic_Add_Flow_Spec.md` |
| Visibility Selector | `Visibility_Selector_Spec.md` |
| Basic Feedback | `Feedback_Loop_Spec.md` (Phase 1 only) |

### Phase 2: Enhancement (Months 3-4)
| Feature | Spec |
|---------|------|
| Serial Decoder | `Serial_Number_Decoder_Spec.md` |
| Trust Score | `Feedback_Loop_Dev_Guide.md` |
| Voice-to-Story | `Voice_to_Story_Spec.md` |

### Phase 3: Growth (Months 5+)
| Feature | Spec |
|---------|------|
| RAG Integration | `Feedback_Loop_Spec.md` (Phase 4) |
| Analytics Dashboard | `Feedback_Loop_Dev_Guide.md` |

---

## 🔧 Technical Stack (Suggested)

| Layer | Technology |
|-------|------------|
| Frontend | React / Next.js |
| UI Components | shadcn/ui + Tailwind |
| Backend | Node.js / TypeScript |
| Database | PostgreSQL |
| AI | Claude API (identification) |
| Speech | OpenAI Whisper |
| Storage | S3 / Cloudflare R2 |
| Auth | Supabase / Auth.js |

---

## 📁 Full File List

```
/TWNG/docs/
├── Meeting_Decisions_Summary.md
├── TWNG_FAQ_v3.md
├── TWNG_Pricing_Model_v2.md
├── TWNG_Onboarding_Flow_v3.md
├── TWNG_Specs_Package_for_Doron.md  ← You are here
│
├── specs/
│   ├── Magic_Add_Flow_Spec.md
│   ├── Visibility_Selector_Spec.md
│   ├── Feedback_Loop_Spec.md
│   ├── Feedback_Loop_Dev_Guide.md
│   ├── Serial_Number_Decoder_Spec.md
│   └── Voice_to_Story_Spec.md
│
└── design/
    ├── TWNG_Design_System.md
    └── TWNG_UI_Screens.md

/TWNG/marketing/
└── TWNG_Landing_Page_v3.md
```

---

## ✅ Next Steps

1. **Review specs** — Ensure alignment with vision
2. **Prioritize features** — Confirm Phase 1 scope
3. **Design mockups** — Convert ASCII to Figma
4. **Development kickoff** — Start with Magic Add + Visibility

---

## 📞 Questions?

All specs are designed to be complete but flexible. If anything needs clarification or adjustment, flag it before development begins.

---

*"Every Guitar Has a Story. Let's build the place to keep them."*
