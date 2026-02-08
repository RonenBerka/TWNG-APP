# TWNG — Onboarding Flow v3

> **Updated:** Post-meeting with Doron
> **Key Changes:** User Choice privacy model, Unlimited free uploads

**Core Message:** Every Guitar Has a Story. Finally, a place to keep them. Free.

---

## Flow Overview

```
┌─────────────────┐
│  Signup Screen  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Email Verify    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Welcome Screen  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ First Guitar    │
│ (Add Details)   │
└────────┬────────┘
         ▼
┌─────────────────┐    ← NEW: Visibility Step
│ Choose Visibility│
└────────┬────────┘
         ▼
┌─────────────────┐
│ Success         │
└────────┬────────┘
         ▼
┌─────────────────┐
│ My Collection   │
└─────────────────┘
```

**שינוי מרכזי:** הוספנו שלב של בחירת visibility לפני השמירה.

---

## Screen 1: Signup

### Headline:
> Start Your Collection

### Subheadline:
> Free forever. Unlimited guitars. You choose who sees.

### Form Fields:
- **Email:** placeholder "your@email.com"
- **Password:** placeholder "Create a password"
- **First Name:** placeholder "Your first name"

### CTA Button:
> Get Started

### Below CTA:
> Already have an account? [Sign in]

### Trust Line (small):
> ✓ Unlimited guitars — always free
> ✓ You decide who sees what

### Legal (small text):
> By signing up, you agree to our [Terms] and [Privacy Policy].

### Social Signup:
> Or continue with:
> [Google] [Apple]

---

## Screen 2: Email Verification

### Headline:
> Check your inbox

### Body:
> We sent a link to **[email@example.com]**
>
> Click it to finish setting up.

### Below:
> Didn't get it? [Resend]
> Wrong email? [Change]

### Note (small):
> Link expires in 24 hours.

---

## Screen 3: Welcome Screen

### Visual:
Warm image — guitar in soft light, intimate feeling

### Headline:
> Welcome, [First Name].

### Body:
> You just created a home for your guitars.
>
> Add as many as you want. It's **free forever**.
> You decide what's private and what you share.

### What You Can Do:
> 🎸 **Keep** — specs, photos, stories, unlimited
> 📸 **Magic Add** — snap a photo, we fill in the details
> 🔓 **Your choice** — private, link, or public per guitar

### CTA:
> Add Your First Guitar

### Secondary:
> [I'll do this later →]

---

## Screen 4: Add First Guitar

### Headline:
> Add your first guitar

### Subheadline:
> It doesn't have to be fancy. Just one that matters.

---

### Two Options:

**Option A: Magic Add (Recommended)**
```
┌─────────────────────────────────────────┐
│                                         │
│   📸 Magic Add                          │
│                                         │
│   Take a photo — we'll identify it      │
│   and fill in the details.              │
│                                         │
│   [Open Camera]                         │
│                                         │
└─────────────────────────────────────────┘
```

**Option B: Add Manually**
```
┌─────────────────────────────────────────┐
│                                         │
│   ✏️ Add Manually                       │
│                                         │
│   Enter the details yourself.           │
│                                         │
│   [Start from scratch]                  │
│                                         │
└─────────────────────────────────────────┘
```

---

### Manual Form (if selected):

**Photo Upload:**
> [+ Add photos]
> As many as you want — front, back, headstock, details

**Brand:**
> placeholder: "Fender, Gibson, Martin..."

**Model:**
> placeholder: "Stratocaster, Les Paul, D-28..."

**Year (optional):**
> placeholder: "1965, 2020, Not sure..."

**Serial Number (optional):**
> placeholder: "Usually on headstock"
> [Where do I find this? →]

**Its Story (optional):**
> placeholder: "How did you get it? What does it mean to you?"
>
> Tip: You can also record this by voice.
> [🎤 Record instead]

### CTA:
> Continue

---

## Screen 5: Choose Visibility (NEW)

> **This is the User Choice step (+1 שלב)**

### Headline:
> Who can see this guitar?

### Subheadline:
> Your guitars. Your way.

---

### Three Options:

```
┌─────────────────────────────────────────┐
│                                         │
│   🔒 Private                            │
│   ─────────────                         │
│   Only you can see it.                  │
│   Perfect for valuable guitars or       │
│   personal documentation.               │
│                                         │
│   [○ Select]                            │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│   🔗 Link sharing                       │
│   ─────────────                         │
│   Anyone with the link can view.        │
│   Great for sharing with friends or     │
│   getting help identifying.             │
│                                         │
│   [○ Select]                            │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│   🌐 Public                             │
│   ─────────────                         │
│   Visible in TWNG community & search.   │
│   Connect with other owners and         │
│   show off your collection.             │
│                                         │
│   [○ Select]                            │
│                                         │
└─────────────────────────────────────────┘
```

### Default:
**Private is pre-selected** (but user can change)

### Note below:
> You can change this anytime. Each guitar can have different visibility.

### CTA:
> Save to My Collection

---

## Screen 6: Success

### Visual:
Subtle celebration — warm, not over the top

### Headline:
> Done. Your [Guitar Name] is saved.

### Body (based on choice):

**If Private:**
> It's in your collection now. Safe and private.

**If Link:**
> It's in your collection. Share the link when you're ready.

**If Public:**
> It's in your collection and visible to the TWNG community.

### What's Next:
```
┌─────────────────────────────────────────┐
│                                         │
│   [+ Add another guitar]                │
│                                         │
│   [Go to My Collection]                 │
│                                         │
└─────────────────────────────────────────┘
```

### Note:
> Add as many guitars as you want. It's always free.

---

## Screen 7: My Collection (Empty State)

### Headline:
> Your collection

### Empty State:
```
┌─────────────────────────────────────────┐
│                                         │
│         Your guitars will appear here.  │
│                                         │
│         [+ Add Your First Guitar]       │
│                                         │
│         Unlimited. Free forever.        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Screen 8: My Collection (With Guitars)

### Layout:
```
┌─────────────────────────────────────────┐
│  My Collection                    [+ Add]│
│─────────────────────────────────────────│
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │ 🎸      │  │ 🎸      │              │
│  │ Strat   │  │ Les Paul│              │
│  │ 1965    │  │ 2019    │              │
│  │ 🔒      │  │ 🌐      │              │
│  └─────────┘  └─────────┘              │
│                                         │
│  5 guitars · 3 private · 2 public       │
│                                         │
└─────────────────────────────────────────┘
```

### First-Time Tooltip:
> Each guitar has its own visibility. 🔒 Private, 🔗 Link, 🌐 Public.
> Change anytime by tapping the icon.
> [Got it]

---

## Visibility Icons

| Icon | Setting | Meaning |
|------|---------|---------|
| 🔒 | Private | Only you can see |
| 🔗 | Link | Anyone with link |
| 🌐 | Public | Visible to everyone |

---

## Visibility Toggle (On Guitar Page)

### Location:
Top of guitar detail page, clearly visible

### Design:
```
┌─────────────────────────────────────────┐
│                                         │
│   Visibility: [🔒 ▼]                    │
│                                         │
│   ┌───────────────────────────────────┐ │
│   │ 🔒 Private       ← Currently set  │ │
│   │ 🔗 Link sharing                   │ │
│   │ 🌐 Public                         │ │
│   └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Confirmation when changing to Public:
> Make this guitar public?
> It will be visible to everyone on TWNG.
> [Make Public] [Keep Private]

---

## Tooltips / First-Time Hints

### On First Visit to Collection:
> **Your collection, your rules.**
> Some guitars private, some public — it's up to you.
> [Got it]

### On Guitar Detail Page:
> **Tip:** Add the story. How did you get it? What does it mean?
> [Add story] [Later]

### On First Public Guitar:
> **Nice.** Your [guitar] is now visible on TWNG.
> Other collectors can discover it.

---

## Key Messaging — User Choice

### Core Messages:

**Tagline:**
> Your guitars. Your way.

**Feature description:**
> You decide who sees each guitar.

**Call to action context:**
> Private or public — your choice.

**Trust building:**
> Only you control visibility.

---

## Empty States

### No Guitars Yet:
> **Your collection is waiting.**
> Add unlimited guitars — it's free forever.
> [+ Add Guitar]

### No Story Yet (on guitar page):
> **Every guitar has a story.**
> What's this one's?
> [+ Add story]

### No Photos Yet:
> **Add some photos.**
> As many as you want — they're all free.
> [+ Add photos]

---

## Error States

### Email Already Exists:
> This email is already registered.
> [Sign in instead]

### Weak Password:
> Password needs at least 8 characters.

### Link Expired:
> This link expired.
> [Send a new one]

### Photo Too Large:
> Image must be under 10MB.
> [Try again]

### Generic:
> Something went wrong. Try again or email hello@twng.com.

---

## Microcopy

### Loading:
> "Getting your collection ready..."
> "Identifying your guitar..."
> "Saving..."

### Confirmations:
> "Saved."
> "Added to your collection."
> "Visibility updated."

### Delete:
> "Remove this guitar from your collection?"
> "This can't be undone."
> [Remove] [Keep it]

---

## Progressive Disclosure

### After 5 Guitars:
> **You're building something.**
> 5 guitars and counting — all free, all yours.

### After First Public Guitar:
> **Nice.** Your [guitar] is now visible to the community.
> You might hear from other owners of the same model.

### After 10 Guitars:
> **Impressive collection.**
> 10 guitars documented. Keep going — there's no limit.

---

## Key Changes from v2

| Element | v2 | v3 |
|---------|----|----|
| Privacy | "Private by default" | "You choose: Private/Link/Public" |
| Signup | "Free forever" | "Free forever. Unlimited guitars." |
| Flow | Direct to save | +1 step: Choose visibility |
| Messaging | Privacy-focused | Choice-focused |
| Limits | (implied 20) | Explicitly unlimited |
| Icons | 🔒 only | 🔒 🔗 🌐 |
| Tone | "Yours, private" | "Yours, your way" |

---

## Design Notes

### Tone:
- Empowering, not restrictive
- "Your choice" as recurring theme
- Never pressure to share OR hide
- Respect both private and public collectors

### Visual:
- Clean, minimal
- Warm amber/gold accents
- Three visibility states clearly distinguished
- Icons consistent throughout

### Mobile-First:
- Large touch targets for visibility selection
- Camera integration for Magic Add
- Voice recording for stories
- Swipe to navigate collection

### Trust Signals:
- "Free forever" visible early
- "Unlimited" mentioned explicitly
- "You decide" repeated
- No credit card required
- No artificial limits

---

> **Note:** TWNG is English-only. Hebrew used only for Ronen's pre-launch outreach.
