# TWNG — Onboarding Flow

*Texts for Registration & First-Time User Experience*

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
│ Profile Setup   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ First Guitar    │
│ (Optional)      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Explore / Home  │
└─────────────────┘
```

---

## Screen 1: Signup

### Headline:
> Join TWNG

### Subheadline:
> Create your free account and start documenting your guitars.

### Form Fields:
- **Email:** placeholder "your@email.com"
- **Password:** placeholder "Create a password"
- **First Name:** placeholder "What should we call you?"

### CTA Button:
> Create Account

### Below CTA:
> Already have an account? [Sign in]

### Legal (small text):
> By signing up, you agree to our [Terms of Service] and [Privacy Policy].

### Social Signup (if applicable):
> Or continue with:
> [Google] [Apple] [Facebook]

---

## Screen 2: Email Verification

### Headline:
> Check your inbox

### Body:
> We sent a confirmation link to **[email@example.com]**
>
> Click the link to verify your email and complete signup.

### Below:
> Didn't get it? [Resend email]
>
> Wrong email? [Change email]

### Note (small):
> The link expires in 24 hours.

---

## Screen 3: Welcome Screen (After Verification)

### Visual:
Warm, inviting image — guitar in soft light, or hands on fretboard

### Headline:
> Welcome to TWNG, [First Name].

### Body:
> You just joined a community of guitar lovers who believe every instrument has a story worth telling.
>
> Here's what you can do:
>
> 🎸 **Document** your guitars — photos, specs, serial numbers, stories
>
> 📖 **Share** with others who get it (or keep it all private)
>
> 🔍 **Discover** collections, stories, and people who love guitars like you do

### CTA:
> Let's Get Started

### Skip Option (small):
> [Skip for now →]

---

## Screen 4: Profile Setup

### Headline:
> Tell us a little about yourself

### Subheadline:
> This helps us personalize your experience. You can always change this later.

---

### Question 1: What do you play?

> Select all that apply:

- [ ] Electric guitar
- [ ] Acoustic guitar
- [ ] Classical guitar
- [ ] Bass guitar
- [ ] Other stringed instruments

---

### Question 2: How would you describe yourself?

> Choose one:

- ○ Casual player — I play for fun
- ○ Serious hobbyist — guitars are a big part of my life
- ○ Professional musician — I play for a living
- ○ Collector — I love the instruments themselves
- ○ All of the above

---

### Question 3: How many guitars do you currently own?

- ○ 1-2
- ○ 3-5
- ○ 6-10
- ○ 11-20
- ○ More than 20

---

### CTA:
> Continue

### Skip Option:
> [Skip this step →]

---

## Screen 5: Add Your First Guitar (Optional but Encouraged)

### Headline:
> Add your first guitar

### Subheadline:
> It doesn't have to be expensive or rare. Just meaningful.
> Start with the one that means the most to you.

---

### Form Fields:

**Photo Upload:**
> [+ Add photos]
> Tip: Include the headstock, body, and any unique details

**Guitar Name / Nickname (optional):**
> placeholder: "e.g., Old Faithful, The Red One"

**Make:**
> placeholder: "e.g., Fender, Gibson, Martin"

**Model:**
> placeholder: "e.g., Stratocaster, Les Paul, D-28"

**Year (optional):**
> placeholder: "e.g., 1965, 2020, Unknown"

**Serial Number (optional):**
> placeholder: "Found on headstock or inside body"

**The Story:**
> placeholder: "How did you get this guitar? What does it mean to you?"

---

### CTA:
> Add to Collection

### Skip Option:
> [I'll do this later →]

---

## Screen 6: Success / Collection Created

### Visual:
Confetti animation or subtle celebration

### Headline:
> Nice. Your first guitar is in.

### Body:
> You just started your TWNG collection.
>
> Add more guitars, explore what others are sharing, or just enjoy knowing your stories are safe.

### CTAs:
> [Add Another Guitar]
> [Explore the Community]
> [Go to My Collection]

---

## Screen 7: Empty State (Collection Page, No Guitars Yet)

### Headline:
> Your collection is empty — for now.

### Body:
> Every collection starts somewhere.
>
> Add your first guitar and start documenting what matters.

### CTA:
> [+ Add Your First Guitar]

### Inspiration Section (below):
> **Need inspiration?**
> See how other members are documenting their collections.
> [Explore Collections →]

---

## Screen 8: Empty State (Feed, No Activity Yet)

### Headline:
> Nothing here yet.

### Body:
> Once you follow other collectors or join conversations, their activity will show up here.

### CTAs:
> [Explore Collections]
> [Browse Forums]
> [Find People to Follow]

---

## Tooltips / First-Time Hints

### On First Visit to Collection Page:
> **Tip:** Your collection is private by default. You control what's visible to others.
> [Got it]

### On First Visit to Forums:
> **Tip:** Introduce yourself! The community loves meeting new members.
> [Go to Introductions →] [Maybe later]

### On Hovering Over "Visibility" Setting:
> **Private:** Only you can see this guitar.
> **Public:** Anyone on TWNG can see it.
> **Unlisted:** Only people with the link can see it.

---

## Error States

### Signup — Email Already Exists:
> This email is already registered. [Sign in instead?]

### Signup — Weak Password:
> Password must be at least 8 characters with one number.

### Verification — Link Expired:
> This link has expired. [Resend verification email]

### Photo Upload — File Too Large:
> Image must be under 10MB. Try a smaller file.

### Generic Error:
> Something went wrong. Please try again or contact us at hello@twng.com.

---

## Microcopy Throughout

### Loading States:
> "Tuning up..." (instead of "Loading")
> "Getting your collection ready..."

### Save Confirmations:
> "Saved." (simple, clean)
> "Guitar added to your collection."

### Delete Confirmations:
> "Are you sure you want to remove this guitar from your collection? This can't be undone."
> [Remove] [Cancel]

### Logout:
> "You've been signed out. See you next time."

---

## Optional: Progressive Disclosure

Instead of one long onboarding, reveal features gradually:

### After Adding 3rd Guitar:
> **Tip:** You can organize your collection into groups — "Favorites," "For Sale," "Vintage," etc.
> [Learn how →]

### After First Week:
> **Tip:** Enable notifications to know when someone comments on your guitar or follows your collection.
> [Turn on notifications]

### After First Forum Post:
> **Tip:** You earned the "First Post" badge! Check your profile to see your badges.

---

## Gamification / Progress (Optional)

### Collection Progress Bar:
> "Your collection: 3 guitars documented"
> "Add details to unlock your 'Storyteller' badge"

### Badges:
- **First Guitar** — Added your first guitar
- **Storyteller** — Wrote stories for 5+ guitars
- **Collector** — Documented 10+ guitars
- **Community Member** — Made your first forum post
- **Helpful** — Got 10+ likes on a comment

---

## Design Notes

### Overall Tone:
- Warm, encouraging
- Never make users feel judged for collection size
- Celebrate every guitar, not just expensive ones

### Visual Style:
- Clean, minimal UI
- Warm color accents (amber, gold)
- Generous white space
- Guitar imagery as subtle backgrounds

### Mobile-First:
- All screens must work on mobile
- Large tap targets
- Swipe gestures where appropriate
- Camera access for photo upload

### Accessibility:
- All form fields labeled
- Error messages clear and specific
- Color contrast meets WCAG standards
- Screen reader compatible

