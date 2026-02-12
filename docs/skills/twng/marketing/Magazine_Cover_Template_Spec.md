# TWNG Magazine Cover Template

> **Style:** Rolling Stone / Guitar World vintage magazine
> **Format:** Instagram 4:5 (1080×1350px)
> **Vibe:** Nostalgic, iconic, collector-focused

---

## Visual Structure

```
┌────────────────────────────────────────────┐
│  ISSUE NO. 001              [right corner] │
│  FREE FOREVER                              │
│                                            │
│              🎸 TWNG 🎸                    │  ← Logo (amber #F59E0B)
│        EVERY GUITAR HAS A STORY            │  ← Tagline (smaller)
│                                            │
│  ┌─────────────┐                          │
│  │ THE COLLECTION                         │  ← Side headlines
│  │ Your Guitars.                          │     (left side)
│  │ Your Stories.                          │
│  │ Your Way.                              │
│  │                                        │
│  │ INSIDE                                 │
│  │ Magic Add: AI                          │
│  │ That Knows                             │
│  │ Your Guitar                            │
│  └─────────────┘                          │
│                                            │
│         ╔═══════════════════╗              │
│         ║                   ║              │
│         ║   GUITAR PHOTO    ║              │  ← Main image
│         ║    (full bleed)   ║              │     fills entire cover
│         ║                   ║              │
│         ╚═══════════════════╝              │
│                                            │
│  ┌─────────────────────────────────────┐  │
│  │  FENDER                              │  │  ← Main headline
│  │  STRATOCASTER                        │  │     (large, bold)
│  │  The One That Started Everything     │  │  ← Subtitle (amber)
│  └─────────────────────────────────────┘  │
│                                            │
│  "Finally, a place to keep them."         │  ← Bottom tagline
└────────────────────────────────────────────┘
```

---

## Typography

### Logo "TWNG"
- **Font:** Oswald Bold or similar condensed sans-serif
- **Size:** 80-100px
- **Color:** #F59E0B (Amber)
- **Effect:** Drop shadow for legibility over photos

### Tagline "Every Guitar Has a Story"
- **Font:** Oswald Medium
- **Size:** 18px
- **Letter spacing:** 4px
- **Color:** #F59E0B (Amber)
- **Style:** ALL CAPS

### Main Headline (Guitar Name)
- **Font:** Playfair Display Black or similar serif
- **Size:** 72-80px
- **Color:** #FFFFFF
- **Style:** ALL CAPS, line breaks between words
- **Effect:** Heavy drop shadow

### Subtitle
- **Font:** Oswald Medium
- **Size:** 28px
- **Color:** #F59E0B (Amber)
- **Letter spacing:** 1px

### Side Headlines
- **Category:** Oswald SemiBold, 14px, Amber, ALL CAPS
- **Title:** Playfair Display Bold, 22px, White

### Bottom Tagline
- **Font:** Playfair Display Italic
- **Size:** 20px
- **Color:** White 90% opacity

---

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Amber) | Logo, taglines, accents | #F59E0B |
| Text (White) | Headlines | #FFFFFF |
| Text (Muted) | Issue info | rgba(255,255,255,0.7) |
| Overlay (Dark) | Photo gradient | rgba(0,0,0,0.3-0.8) |

---

## Photo Guidelines

### Requirements:
- High resolution (minimum 1080px wide)
- Guitar as hero OR person with guitar
- Warm lighting preferred (matches amber brand)
- Room for text overlays (avoid busy top/bottom)

### Overlay:
Apply gradient overlay to ensure text readability:
```css
background: linear-gradient(
  180deg,
  rgba(0,0,0,0.4) 0%,
  rgba(0,0,0,0.1) 30%,
  rgba(0,0,0,0.1) 50%,
  rgba(0,0,0,0.8) 100%
);
```

---

## Variations

### Variation A: Guitar Hero
- Photo: Just the guitar, dramatic lighting
- Headline: Guitar model name
- Subtitle: Year or legendary status
- Example: "1959 LES PAUL / The Holy Grail"

### Variation B: Player Portrait
- Photo: Person with guitar (like your fur coat photo)
- Headline: Story-focused
- Subtitle: Emotional hook
- Example: "THE FIRST ONE / The guitar that started everything"

### Variation C: Collection Showcase
- Photo: Multiple guitars or guitar wall
- Headline: Collection theme
- Subtitle: TWNG benefit
- Example: "25 GUITARS / One place to keep them all"

### Variation D: Nostalgic
- Photo: Vintage-style, sepia tones
- Headline: Memory-focused
- Subtitle: Emotional connection
- Example: "DAD'S MARTIN / Some guitars are more than wood"

---

## Content Templates

### Side Headlines (Rotate These):

**Set 1 - Core Message:**
```
THE COLLECTION
Your Guitars.
Your Stories.
Your Way.

INSIDE
Magic Add: AI That
Knows Your Guitar
```

**Set 2 - Privacy Focus:**
```
YOUR CHOICE
🔒 Private
🔗 Shared
🌐 Public

FREE FOREVER
Unlimited Guitars.
No Catch.
```

**Set 3 - Features:**
```
MAGIC ADD
One Photo.
All The Specs.
30 Seconds.

TELL THE STORY
Voice to Text.
We'll Transcribe.
```

### Main Headlines (Examples):

| Guitar | Headline | Subtitle |
|--------|----------|----------|
| Strat | FENDER STRATOCASTER | The One That Started Everything |
| Les Paul | 1959 LES PAUL | Still The Holy Grail |
| Telecaster | THE TELECASTER | 70 Years of Twang |
| Acoustic | DAD'S MARTIN | Some Stories Last Forever |
| First Guitar | THE FIRST ONE | Everyone Remembers |
| Collection | 15 YEARS | One Collector's Journey |

---

## Production Notes

### For Canva:
1. Create 1080×1350 canvas
2. Upload photo, set to fill
3. Add dark gradient overlay
4. Add text layers per spec
5. Export as PNG, high quality

### For Figma:
1. Frame: 1080×1350
2. Image fill with gradient overlay
3. Text styles saved as components
4. Easy to duplicate and customize

### For AI Image Generation:
When creating cover photos, add to prompt:
```
"space for text overlay at top and bottom, dramatic lighting,
warm amber tones, editorial photography style, no text in image"
```

---

## Example Covers to Create

1. **Launch Cover** — The Strat photo (fur coat guy)
   - Headline: "THE FIRST STRAT"
   - Subtitle: "Where Do Your Guitar Stories Live?"

2. **Collector Cover** — Guitar wall or collection
   - Headline: "THE COLLECTION"
   - Subtitle: "Free Forever. Unlimited Guitars."

3. **Nostalgia Cover** — Vintage guitar, soft light
   - Headline: "THE ONE THAT GOT AWAY"
   - Subtitle: "Don't Let Yours Disappear"

4. **NGD Cover** — Unboxing moment
   - Headline: "NEW GUITAR DAY"
   - Subtitle: "Remember Everything"

---

*Template v1.0 — February 2026*
*For TWNG Instagram @twng*
