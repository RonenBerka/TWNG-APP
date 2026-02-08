# TWNG — Onboarding Flow v2

*Updated for "Private First" Messaging*

**Core Message:** Every Guitar Has a Story. Finally, a place to keep them.

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
│ (Encouraged)    │
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

**הערה:** הורדנו את Profile Setup מהתהליך — פחות חיכוך, יותר מהיר להתחיל.

---

## Screen 1: Signup

### Headline:
> Start Your Collection

### Subheadline:
> Free forever. Private by default.

### Form Fields:
- **Email:** placeholder "your@email.com"
- **Password:** placeholder "Create a password"
- **First Name:** placeholder "Your first name"

### CTA Button:
> Start Free

### Below CTA:
> Already have an account? [Sign in]

### Trust Line (small):
> ✓ Your collection stays private
> ✓ Free forever — no credit card

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
> Everything you add here is **private by default**.
> Only you can see your collection — until you decide otherwise.

### What You Can Do:
> 🎸 **Keep** your guitars' stories safe
> 📸 **Magic Add** — snap a photo, we fill in the specs
> 🔒 **Private** — share only if you want to

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
> Front, back, headstock — whatever you've got

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

---

### Privacy Note (visible):
> 🔒 Only you can see this guitar unless you choose to share it.

### CTA:
> Add to My Collection

### Skip:
> [Skip for now →]

---

## Screen 5: Success

### Visual:
Subtle celebration — no confetti, just warmth

### Headline:
> Done. Your [Guitar Name] is saved.

### Body:
> It's in your collection now. Safe. Private. Yours.

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
> You can edit details, add photos, or tell its story anytime.

---

## Screen 6: My Collection (Empty State)

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
│         Everything stays private.       │
│                                         │
└─────────────────────────────────────────┘
```

---

## Screen 7: My Collection (With Guitars)

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
│  │ 🔒      │  │ 🔒      │              │
│  └─────────┘  └─────────┘              │
│                                         │
│  3 guitars · All private                │
│                                         │
└─────────────────────────────────────────┘
```

### First-Time Tooltip:
> Your collection is private. Only you can see it.
> Want to share something? You can change visibility anytime.
> [Got it]

---

## Tooltips / First-Time Hints

### On First Visit to Collection:
> **Everything here is private.**
> Only you can see your guitars unless you choose to share them.
> [Got it]

### On Guitar Detail Page:
> **Tip:** Add the story. How did you get it? What does it mean?
> [Add story] [Later]

### On Visibility Toggle:
> **Private** — Only you can see this
> **Public** — Anyone on TWNG can find it
> **Link only** — Only people you share the link with

---

## Empty States

### No Guitars Yet:
> **Your collection is waiting.**
> Add your first guitar — it takes 60 seconds.
> [+ Add Guitar]

### No Story Yet (on guitar page):
> **Every guitar has a story.**
> What's this one's?
> [+ Add story]

### No Photos Yet:
> **Add some photos.**
> Front, back, headstock, the scratches — they all matter.
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
> "Story updated."

### Delete:
> "Remove this guitar from your collection?"
> "This can't be undone."
> [Remove] [Keep it]

---

## Progressive Disclosure

### After 3 Guitars:
> **Tip:** You can organize your collection — Favorites, Vintage, For Sale...
> [Show me how]

### After 5 Guitars:
> **You're building something.**
> 5 guitars and counting. Want to share any of them?
> [Maybe later] [Show me how]

### After First Public Guitar:
> **Nice.** Your [guitar] is now visible on TWNG.
> Other collectors might find it.

---

## Key Messaging Changes from v1

| Element | Before | After |
|---------|--------|-------|
| Signup headline | "Join TWNG" | "Start Your Collection" |
| CTA | "Create Account" | "Start Free" |
| Welcome | "joined a community" | "created a home for your guitars" |
| Default | Not emphasized | "Private by default" |
| Features | Document, Share, Discover | Keep, Magic Add, Private |
| Success | "Explore the Community" | "Go to My Collection" |
| Empty state | "See how others document" | "Your guitars will appear here" |
| Tone | Community-focused | Personal, private, yours |

---

## Design Notes

### Tone:
- Warm but not pushy
- Never pressure to share
- Celebrate privacy as a feature
- "Yours" is the key word

### Visual:
- Clean, minimal
- Warm amber/gold accents
- Guitar imagery — intimate, personal
- Lock icon (🔒) for private items

### Mobile-First:
- Large buttons
- Camera integration for Magic Add
- Voice recording for stories
- Swipe to navigate collection

### Trust Signals:
- "Free forever" visible early
- "Private by default" repeated
- No credit card required
- No pressure messaging
