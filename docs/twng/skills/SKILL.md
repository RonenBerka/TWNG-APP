---
name: twng-guitar-knowledge
description: Comprehensive guitar identification system for TWNG. Contains the 9-step identification protocol, response formatting rules, and routing to brand-specific reference files. Use this skill whenever identifying guitars from images or descriptions.
---

# TWNG Guitar Identification Protocol

## 🎯 Purpose

This skill enables accurate guitar identification from images and descriptions. It follows a systematic 9-step protocol and routes to brand-specific reference files for detailed identification.

---

## 📚 Reference File Routing

**IMPORTANT**: After initial identification, load the appropriate brand reference file for detailed specs:

| Identified Brand | Load Reference |
|-----------------|----------------|
| Fender, Squier | `references/fender.md` |
| Gibson, Epiphone | `references/gibson.md` |
| Martin | `references/martin.md` |
| PRS (Paul Reed Smith) | `references/prs.md` |
| Ibanez | `references/ibanez.md` |
| Taylor | `references/taylor.md` |
| Yamaha | `references/yamaha.md` |
| Gretsch | `references/gretsch.md` |
| Rickenbacker | `references/rickenbacker.md` |
| Jackson, Charvel | `references/jackson-charvel.md` |
| ESP, LTD | `references/esp.md` |
| Music Man, Sterling | `references/musicman.md` |
| Schecter | `references/schecter.md` |
| Guild | `references/guild.md` |
| B.C. Rich | `references/bcrich.md` |
| Cort | `references/cort.md` |
| Unknown / Other | `references/general-knowledge.md` |

### Tier 2 Bundle References

| Category | Brands | Load Reference |
|----------|--------|----------------|
| Acoustic Specialists | Takamine, Alvarez, Seagull, Breedlove, Eastman, Collings, Santa Cruz, Bourgeois, Lowden | `references/tier2/acoustic-specialists.md` |
| Bass Specialists | Warwick, Spector, Lakland, Sadowsky, Fodera, MTD, Dingwall, Sandberg, Sire | `references/tier2/bass-specialists.md` |
| Japanese Builders | Tokai, Fujigen, Edwards, Navigator, Bacchus, Greco, Burny, Fernandes, Aria | `references/tier2/japanese-builders.md` |
| Boutique Electric | Suhr, Tom Anderson, Kiesel, Mayones, Strandberg, Ormsby, Solar, Aristides | `references/tier2/boutique-electric.md` |
| European Builders | Hagstrom, Framus, Vigier, Lag, Höfner, Duesenberg, Maybach | `references/tier2/european-builders.md` |
| Budget/Mainstream | Harley Benton, Donner, Dean, Washburn, Kramer | `references/tier2/budget-mainstream.md` |
| **Forgotten American** | Harmony, Supro, Kay, Kalamazoo, Silvertone, Danelectro, National, Airline | `references/tier2/forgotten-american.md` |

**Always load `references/general-knowledge.md` for**:
- Serial number decoding
- Terminology questions
- Vintage market information
- General guitar education

---

## 🔍 The 9-Step Identification Protocol

### Step 1: Image Quality Assessment
- Is the image clear enough for identification?
- Can you see the headstock? (Most important for brand ID)
- Is the full guitar visible or partial?
- Note any obstructions or angles that limit identification

### Step 2: Guitar Category
Determine the broad category:
- **Electric Solid Body** (Stratocaster, Les Paul, etc.)
- **Electric Semi-Hollow** (ES-335, etc.)
- **Electric Hollow Body** (Jazz boxes)
- **Acoustic Steel String** (Dreadnought, OM, etc.)
- **Acoustic Nylon / Classical**
- **Bass** (4, 5, 6 string)
- **Other** (Resonator, lap steel, etc.)

### Step 3: Brand Identification
Look for these identifiers in order:
1. **Headstock logo** (most reliable)
2. **Headstock shape** (Fender 6-in-line, Gibson 3+3, etc.)
3. **Body shape** (proprietary shapes)
4. **Hardware style** (bridge, tuners, pickups)
5. **Inlay patterns** (PRS birds, Gibson trapezoids, etc.)

### Step 4: Model Identification
Once brand is identified, determine model by:
- Body shape and contours
- Pickup configuration (SSS, HSS, HH, P90, etc.)
- Control layout
- Bridge type
- Binding and appointments

### Step 5: Era/Year Dating
Look for era indicators:
- Serial number (if visible)
- Logo style variations
- Hardware evolution
- Finish types
- Construction details

**Additional Authentication Clues:**
- Potentiometer date codes (inside cavity)
- Neck date stamps (neck heel/pocket)
- Capacitor markings (electronics cavity)
- Pickup stamps (underside)
- Tuner manufacturer marks

### Step 6: Variant/Series Identification
Narrow down to specific variant:
- Standard vs Custom Shop
- Country of manufacture (USA, Mexico, Japan, Korea, Indonesia, China)
- Signature models
- Limited editions
- Reissue vs vintage

### Step 7: Color/Finish Identification
- Standard colors (Sunburst, Black, Natural, etc.)
- Custom colors (Fender Custom Colors, etc.)
- Finish type (Nitro, Poly, Satin, Relic)
- Aging and wear patterns

### Step 8: Condition Assessment
Note visible condition factors:
- Wear patterns (natural vs relic)
- Hardware condition
- Modifications visible
- Overall state

### Step 9: Confidence Scoring
Rate confidence based on available evidence:
- **90-100%**: Clear headstock logo + model identifiers
- **70-89%**: Clear body/shape + partial identifiers
- **50-69%**: Body shape only, no logo visible
- **30-49%**: Partial view, educated guess
- **0-29%**: Cannot reliably identify

---

## 📝 Response Format

### Standard Identification Response

```markdown
## 🎸 זיהוי גיטרה

**מותג:** [Brand]
**דגם:** [Model]
**סדרה/וריאנט:** [Series/Variant]

---

### מאפיינים מזוהים:

| מאפיין | פרט |
|--------|-----|
| **סוג** | [Electric/Acoustic/Bass] |
| **גוף** | [Body shape] |
| **צבע/פיניש** | [Color/Finish] |
| **פיקאפים** | [Pickup configuration] |
| **צוואר** | [Neck details] |
| **סף** | [Fretboard material] |
| **גשר** | [Bridge type] |
| **ייצור** | [Country of origin if known] |
| **שנים** | [Year range if identifiable] |

---

### רמת ביטחון: **XX%** ●●●●●○○○○○

**סיבה:** [Why this confidence level]

---

### לזיהוי מדויק יותר:
- [What additional info would help]
- [What to look for]
```

---

## ⚠️ Common Identification Mistakes

### 1. Squier vs Fender
- **Check headstock**: Squier has "Squier by Fender" or "Squier"
- **Check neck plate**: "Crafted in..." vs "Made in USA"
- **Don't assume**: Many Squiers look identical to Fenders

### 2. Epiphone vs Gibson
- **Headstock shape**: Epiphone has different "open book" shape
- **Logo**: Epiphone script vs Gibson script
- **Binding**: Gibson typically has more appointments

### 3. Reissue vs Vintage
- **Never claim vintage without evidence**
- Modern reissues are designed to look old
- Relic ≠ actually old
- Check for modern construction tells

### 4. Country of Origin
- Don't assume USA without evidence
- Many great guitars made in Japan, Mexico, Korea
- Country doesn't equal quality

### 5. Custom Shop vs Standard
- Custom Shop has specific markers (neck plate, case candy)
- High-end appearance ≠ Custom Shop
- Verify with specific identifiers

---

## 🚫 Never Do

1. **Never claim 100% certainty** without seeing serial number and full documentation
2. **Never assume vintage** based on wear alone (relic exists)
3. **Never dismiss replicas** - some are very convincing
4. **Never guess serial number decode** - use the brand reference files
5. **Never provide value estimates** without clear disclaimers

---

## ✅ Always Do

1. **State confidence level clearly**
2. **Explain what you can and cannot see**
3. **Suggest what additional info would help**
4. **Load brand reference file** for detailed identification
5. **Use Hebrew response format** for TWNG users

---

## 🎸 Guitar Accuracy Mandate

**CRITICAL FOR AI IMAGE GENERATION:**

When creating AI image prompts for guitars, these details MUST be accurate:

| Element | Requirement |
|---------|-------------|
| **Fret Inlays** | Correct positions: 3, 5, 7, 9, 12 (double), 15, 17, 19, 21, 24 |
| **Headstock** | Correct shape for brand (6-in-line vs 3+3) |
| **Body Shape** | Faithful to actual model |
| **Pickup Layout** | Correct number and type (SSS, HH, etc.) |
| **Bridge Type** | Correct for model (tremolo vs hardtail) |
| **Control Layout** | Correct number of knobs/switches |
| **Logo** | Never include trademarked logos in AI prompts |

**Why this matters**: Guitar enthusiasts immediately notice inaccuracies. Wrong inlay positions or headstock shapes destroy credibility.

---

## 📖 Quick Reference Tables

### Pickup Configurations

| Code | Meaning | Common On |
|------|---------|-----------|
| S | Single Coil | Strat, Tele |
| H | Humbucker | Les Paul, PRS |
| P90 | P-90 Single | Les Paul Special, SG Special |
| SSS | 3 Singles | Stratocaster |
| HSS | Hum + 2 Singles | Modern Strat |
| HSH | Hum-Single-Hum | Superstrat |
| HH | 2 Humbuckers | Les Paul, SG |
| SS | 2 Singles | Telecaster |
| HS | Hum + Single | Tele Deluxe |

### Body Shape Quick ID

| Shape | Brands |
|-------|--------|
| Strat | Fender, Squier, countless copies |
| Tele | Fender, Squier |
| Les Paul | Gibson, Epiphone |
| SG | Gibson, Epiphone |
| PRS Double-Cut | PRS |
| Superstrat | Ibanez, Jackson, ESP |
| Dreadnought | Martin, Taylor, Gibson |
| Jumbo | Gibson, Guild |
| Grand Auditorium | Taylor |

### Headstock Shapes

| Brand | Shape | Tuner Layout |
|-------|-------|--------------|
| Fender | Pointed | 6-in-line |
| Gibson | Open Book | 3+3 |
| PRS | Swoop | 3+3 |
| Ibanez | Pointed | 6-in-line |
| Jackson | Pointed/3+3 | Varies |
| Martin | Slotted/Solid | 3+3 |
| Taylor | Modern | 3+3 |

---

## 🔧 Workflow Summary

```
1. Receive image/description
2. Assess image quality
3. Identify category (electric/acoustic/bass)
4. Identify brand (headstock first)
5. → LOAD BRAND REFERENCE FILE ←
6. Identify model using reference
7. Determine era/year
8. Note variant/series
9. Assess condition
10. Calculate confidence
11. Format response in Hebrew
12. Suggest next steps if needed
```

---

## 📁 Reference Files Available

- `references/general-knowledge.md` — Terminology, serial numbers, market info
- `references/fender.md` — Fender & Squier complete guide
- `references/gibson.md` — Gibson & Epiphone complete guide
- `references/martin.md` — Martin complete guide
- `references/prs.md` — PRS complete guide
- `references/ibanez.md` — Ibanez complete guide
- `references/taylor.md` — Taylor complete guide
- `references/yamaha.md` — Yamaha complete guide
- `references/gretsch.md` — Gretsch complete guide
- `references/rickenbacker.md` — Rickenbacker complete guide
- `references/jackson-charvel.md` — Jackson & Charvel complete guide
- `references/esp.md` — ESP & LTD complete guide

---

## 🌐 External Research Resources

When identification requires deeper research, use these trusted sources:

### Serial Number Lookup
| Resource | Best For | URL |
|----------|----------|-----|
| GetMyGuitar | Multi-brand (11+) | getmyguitar.com/guitar-serial-number-lookup |
| Guitar Dater Project | Multi-brand | guitardaterproject.org |
| Fender Official | Fender only | serialnumberlookup.fender.com |
| Gibson Official | Gibson only | gibson.com/support |
| Music Man | EBMM | music-man.com/serial-number-database |

### Specification Databases
| Resource | Best For |
|----------|----------|
| FindMyGuitar | Compare 2000+ current guitars by specs |
| Guitar-Compare | Component details, catalogs |
| Guitar-List | Comprehensive brand index |
| GuitarHQ | Vintage specs (1920-1969) |

### Pickup Information
| Resource | Best For |
|----------|----------|
| GuitarPickupDatabase | Pickup specs, resonance curves |
| Seymour Duncan | SD pickup specs |
| DiMarzio | DiMarzio specs |

### Artist/Provenance
| Resource | Best For |
|----------|----------|
| Equipboard | What gear artists use |
| Reverb | Market prices, sold listings |

---

## 💡 Identification Tips from Research

### FindMyGuitar Scoring Approach
Consider these when evaluating guitars:
- Build Quality (materials, construction)
- Playability (action, neck profile)
- Pickup Quality (tone, output)
- Value for Money (features vs price)

### Verification Beyond Serial Numbers
Serial numbers are ONE piece - also check:
- Pot codes (week/year)
- Neck stamps (date)
- Capacitor codes
- Physical construction details
- Hardware consistency with era

### Japanese Emperor Dating
Some Japanese guitars use traditional calendar:
- Showa codes 45-63 = years 1970-1988
- Heisei codes 1-12 = years 1989-2000
(See general-knowledge.md for details)
