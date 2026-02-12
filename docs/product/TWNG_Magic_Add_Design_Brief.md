# TWNG Magic Add - Design Brief

## Overview

**Feature Name:** Magic Add
**Tagline:** "Snap. Identify. Keep."
**Product:** TWNG - Guitar Collection Platform
**Brand Promise:** "Every Guitar Has a Story. Finally, a place to keep them."

---

## 1. Feature Description

Magic Add is TWNG's signature feature that transforms a simple photo into a complete guitar profile. Users snap or upload a photo of their guitar, and AI automatically identifies the make, model, year, and specifications - creating an instant, detailed entry in their collection.

### Core Value Proposition
- **Zero friction:** No forms to fill, no specs to look up
- **Instant gratification:** From photo to complete profile in seconds
- **Accuracy:** AI-powered identification with manual override options
- **Story-first:** Immediately prompts for the personal story behind the guitar

---

## 2. User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAGIC ADD FLOW                           │
└─────────────────────────────────────────────────────────────────┘

[1] TRIGGER
    ├── Floating "+" button (primary)
    ├── Empty state CTA
    └── Menu option

        ↓

[2] CAPTURE
    ├── Camera (default on mobile)
    ├── Upload from gallery
    └── Drag & drop (desktop)

        ↓

[3] PROCESSING
    ├── Upload animation (guitar silhouette filling)
    ├── "Identifying your guitar..."
    └── Progress indicators

        ↓

[4] RESULTS
    ├── Guitar image displayed prominently
    ├── Identified specs card:
    │   • Make: [e.g., Fender]
    │   • Model: [e.g., Stratocaster]
    │   • Year: [e.g., 1962]
    │   • Series: [e.g., American Vintage]
    │   • Color: [e.g., Olympic White]
    │   • Pickups: [e.g., SSS]
    │   • Country: [e.g., USA]
    │
    ├── Confidence indicator
    ├── "Edit" option for corrections
    └── "Looks right!" confirmation

        ↓

[5] STORY PROMPT
    ├── "Now for the best part..."
    ├── "What's the story behind this guitar?"
    ├── Voice-to-text option (microphone icon)
    ├── Text input field
    └── "Skip for now" (de-emphasized)

        ↓

[6] COMPLETION
    ├── Success animation
    ├── "Added to your collection!"
    ├── View guitar profile
    └── "Add another" option
```

---

## 3. UI Components

### 3.1 Trigger Button
- **Style:** Floating Action Button (FAB)
- **Position:** Bottom right, above navigation
- **Icon:** "+" with subtle guitar pick shape
- **Color:** Primary brand color (warm amber #D4A574)
- **Animation:** Gentle pulse on first visit

### 3.2 Capture Screen
- **Camera viewfinder:** Full screen with subtle frame guide
- **Helper text:** "Center your guitar in the frame"
- **Toggle:** Camera / Gallery
- **Flash control:** Auto / On / Off
- **Close button:** Top left

### 3.3 Processing State
- **Animation:** Guitar silhouette outline that fills with color
- **Text sequence:**
  1. "Uploading..."
  2. "Analyzing..."
  3. "Identifying make and model..."
  4. "Almost there..."
- **Duration:** 2-4 seconds (real) + fake delay for satisfaction

### 3.4 Results Card
```
┌────────────────────────────────────────┐
│  [Guitar Photo - Large]                │
│                                        │
├────────────────────────────────────────┤
│  🎸 We found your guitar!              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ FENDER                           │  │
│  │ Stratocaster                     │  │
│  │ American Vintage '62 Reissue     │  │
│  │                                  │  │
│  │ Year: 1962 (reissue)             │  │
│  │ Color: Olympic White             │  │
│  │ Pickups: SSS (Single x3)         │  │
│  │ Made in: USA                     │  │
│  │                                  │  │
│  │ Confidence: ████████░░ 85%       │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [ Something wrong? Edit ]             │
│                                        │
│  ┌────────────────────────────────┐    │
│  │     ✓ Looks right!             │    │
│  └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

### 3.5 Story Input
```
┌────────────────────────────────────────┐
│                                        │
│  Now for the best part...              │
│                                        │
│  What's the story behind              │
│  this guitar? 🎸                       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │ How did you get it?              │  │
│  │ What does it mean to you?        │  │
│  │ Any memorable moments?           │  │
│  │                                  │  │
│  │                            🎤   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌────────────────────────────────┐    │
│  │     Save to Collection         │    │
│  └────────────────────────────────┘    │
│                                        │
│         Skip for now                   │
│                                        │
└────────────────────────────────────────┘
```

### 3.6 Edit Modal (for corrections)
- Make: Dropdown with search
- Model: Dropdown filtered by make
- Year: Number input / range selector
- Series/Variant: Text input with suggestions
- Color: Color picker + text
- Pickups: Visual picker (SSS/HSS/HH/etc.)
- Country of origin: Dropdown

---

## 4. Copy & Microcopy

### Headlines
- **Main CTA:** "Add a Guitar"
- **Camera screen:** "Let's see your guitar"
- **Processing:** "Hang tight, identifying your guitar..."
- **Success:** "We found it!"
- **Story prompt:** "Now for the best part..."

### Button Labels
- Primary: "Looks right!" / "Save to Collection"
- Secondary: "Something wrong? Edit"
- Tertiary: "Skip for now"

### Empty States
- **No guitars yet:** "Your collection is waiting. Add your first guitar!"
- **Processing error:** "Hmm, we couldn't identify this one. Want to add details manually?"

### Error Messages
- **Upload failed:** "Upload didn't work. Try again?"
- **Can't identify:** "We're not 100% sure about this one. Help us out?"
- **Network error:** "Lost connection. We'll retry when you're back online."

### Tooltips
- **Voice input:** "Tell us the story - we'll transcribe it"
- **Confidence score:** "How certain we are about the identification"
- **Privacy:** "Your guitar is private by default"

---

## 5. Technical Specifications

### Image Requirements
- **Formats:** JPEG, PNG, HEIC, WebP
- **Max size:** 10MB
- **Min resolution:** 800x600
- **Orientation:** Auto-correct

### AI Identification
- **Primary:** Image recognition for guitar identification
- **Fallback:** Manual entry with search
- **Database:** Guitar specs database (Reverb API / custom)
- **Output fields:**
  - Make (brand)
  - Model
  - Year / Year range
  - Series / Variant
  - Body shape
  - Color / Finish
  - Pickup configuration
  - Country of origin

### Privacy
- **Default:** Private (only user can see)
- **Option:** Share to community (explicit action)
- **Storage:** User photos stored securely

---

## 6. Design Tokens

### Colors
```css
--color-primary: #D4A574;        /* Warm amber - CTAs */
--color-primary-dark: #B8956A;   /* Hover states */
--color-secondary: #2C2C2C;      /* Dark backgrounds */
--color-background: #1A1A1A;     /* Main background */
--color-surface: #2C2C2C;        /* Cards */
--color-text-primary: #FFFFFF;
--color-text-secondary: #A0A0A0;
--color-success: #4CAF50;
--color-error: #FF5252;
--color-confidence-high: #4CAF50;
--color-confidence-medium: #FFC107;
--color-confidence-low: #FF5252;
```

### Typography
```css
--font-heading: 'Plus Jakarta Sans', sans-serif;
--font-body: 'Inter', sans-serif;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
```

### Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-full: 9999px;
```

---

## 7. Animations

### Upload Progress
- Guitar silhouette outline
- Fills from bottom to top with primary color
- Subtle glow effect at fill line

### Success State
- Checkmark draws in
- Card slides up slightly
- Confetti or sparkle effect (subtle)

### Transitions
- Screen transitions: Slide + fade (300ms)
- Button states: Scale + color (150ms)
- Cards: Lift shadow on hover (200ms)

---

## 8. Responsive Behavior

### Mobile (< 768px)
- Full screen camera/upload
- Bottom sheet for results and story
- FAB position: bottom-right, 16px from edge

### Tablet (768px - 1024px)
- Centered modal for camera/upload
- Side-by-side image and specs on results
- FAB position: bottom-right, 24px from edge

### Desktop (> 1024px)
- Modal overlay for entire flow
- Drag & drop zone prominent
- Keyboard shortcuts (⌘+N for new)

---

## 9. Accessibility

- **Color contrast:** All text meets WCAG AA
- **Focus states:** Visible focus rings on all interactive elements
- **Screen reader:** Proper ARIA labels
- **Reduced motion:** Option to disable animations
- **Voice input:** Alternative to typing story

---

## 10. Success Metrics

### Conversion
- Photo uploaded → Guitar saved: Target 85%+
- Guitar saved → Story added: Target 40%+

### Engagement
- Time to complete Magic Add: Target < 30 seconds
- Repeat usage: Target 3+ guitars in first week

### Quality
- AI accuracy rate: Target 80%+ correct identification
- Manual edit rate: Monitor (lower is better)

---

## 11. Edge Cases

| Scenario | Behavior |
|----------|----------|
| Blurry photo | "Photo's a bit blurry. Want to try again or continue?" |
| Multiple guitars in frame | "We see multiple guitars! Let's focus on one at a time." |
| Not a guitar | "That doesn't look like a guitar. Did you mean to upload something else?" |
| Rare/custom guitar | "This one's unique! We'll need your help with the details." |
| Offline | Queue upload, sync when online |
| Duplicate guitar | "Looks familiar! Is this the same as [guitar name]?" |

---

## 12. Future Enhancements

- **Serial number scan:** OCR for headstock serial numbers
- **Batch upload:** Add multiple guitars at once
- **Guitar DNA:** Deep specs (neck profile, fret size, etc.)
- **Price estimate:** Market value based on identification
- **Similar guitars:** "Others who have this guitar also have..."
