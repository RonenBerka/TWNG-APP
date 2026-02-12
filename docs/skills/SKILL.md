---
name: twng-guitar-knowledge
description: Reference database of guitar knowledge including brands, models, terminology, history, and technical specifications. Use when you need accurate guitar information for TWNG content, product features, or user support. Also use when identifying guitars from photos or descriptions — includes a systematic identification protocol with headstock diagnostic markers, artist signature recognition, and non-standard feature detection to avoid misidentification.
---

# TWNG Guitar Knowledge Base

## How This Skill Works

This skill uses a **tiered architecture** with progressive loading:

1. **This file (SKILL.md)** — Contains the Guitar Identification Protocol and routing rules. Always loaded first.
2. **references/brand-index.md** — Lookup table for all 120+ brands. Load when identifying a guitar to match headstock/brand.
3. **references/[brand].md** — Tier 1 brand files (deep). Load the specific brand file after identification.
4. **references/[category].md** — Tier 2 grouped files. Load the category file for smaller brands.
5. **references/general-knowledge.md** — Terminology, body styles, tonewoods, condition grading, market info.
6. **references/serial-number-guide.md** — Multi-brand serial number decoders and dating systems.

**Loading rules**:
- Guitar identification → Load brand-index.md first, then the relevant brand/category file
- General guitar questions → Load general-knowledge.md
- Serial number questions → Load serial-number-guide.md
- Brand-specific questions → Load the specific brand file directly
- Never load all files at once — only what's needed

---

## Guitar Identification Protocol

When identifying a guitar from photos, examine EVERY visible element systematically before making any model guess. Do NOT jump to conclusions. Every non-standard element is a clue. Describe each element by its actual shape/content, never generically.

**Response format**: Lead with the identification (brand, model, approximate year). Provide the detailed analysis ONLY if the user asks for it. Do not dump the full step-by-step unless requested.

### Step 1: Headstock Analysis

The most information-dense area. Check ALL of the following:

1. **Logo/brand text**: Exact wording, font, material (decal, gold foil, inlaid pearl, painted, engraved)
2. **Graphic inlays between or around tuners**: Often the single strongest identifier. Known examples:
   - **Banjo sketch** → Pete Seeger models (Martin JSO/J12SO)
   - **Birds** → PRS (different birds = different model tiers)
   - **Crown** → Fender Custom Shop
   - **Split diamond** → Martin Style 28+
   - **Torch/flowerpot** → Martin Style 42/45
   - **Clover/shamrock** → Collings
   - **Trident** → Suhr
   - **Tree of life** → Ibanez high-end
   - **Flying V shape** → Dean
   - **Star** → Various makers
3. **Signatures or handwriting-style inlays**: Almost always an artist signature edition — identify the name FIRST, it overrides all other guesses
4. **Additional text**: Model names, "EST. [year]", anniversary text, "Limited Edition", "Custom Shop", "Authentic", edition numbers
5. **Headstock shape**: Cross-reference against brand-index.md headstock shape descriptors
6. **Tuners**: Open-gear, sealed, Grover, Gotoh, Schaller, Waverly, vintage-style, butterbean, keystone — narrows era and price tier
7. **Headplate material**: Ebony, rosewood, painted, natural wood, overlay — indicates model tier
8. **Truss rod cover** (electric/some acoustic): Shape, material, engraved text (e.g., Gibson "Standard", "Custom", "Les Paul Model", blank = Studio)

### Step 2: Neck & Fretboard Inlays

Fretboard inlays are major model identifiers:

1. **Inlay shape and material**:
   - **Dots** → Standard/entry level on most brands
   - **Blocks/rectangles** → Gibson LP Custom, Standard 50s; Fender Jazzmasters; higher-tier
   - **Trapezoids** → Gibson Les Paul Standard, SG Standard
   - **Birds** → PRS (specific bird species at each fret = model identifier)
   - **Shark fins** → Jackson high-end
   - **Offset dots** → Rickenbacker, some Eric Johnson models
   - **Snowflakes** → Martin Style 42/45
   - **Hexagons** → old Ibanez models
   - **Custom graphics** → Signature editions (describe exactly what you see)
   - **No inlays / side dots only** → Some high-end or minimalist models
2. **Inlay material**: Mother of pearl, abalone, acrylic, clay, glow-in-dark
3. **Fret markers at which frets**: Standard (3,5,7,9,12,15,17,19,21) vs non-standard
4. **12th fret special inlay**: Many brands use a unique marker
5. **Fretboard material**: Ebony (high-end), rosewood (mid-high), pau ferro (modern mid), maple (Fender), richlite (modern Gibson budget)
6. **Binding on fretboard**: Indicates higher-tier model
7. **Number of frets**: 20 (acoustic standard), 21 (vintage Fender), 22 (Gibson/modern Fender), 24 (shred/modern)

### Step 3: Serial Number & Dating Analysis

Serial numbers are critical but rarely sufficient alone. Apply multi-factor verification:

1. **Locate serial number**: Headstock back, neck plate, f-hole label, bridge plate, neck heel, interior label
2. **Cross-reference with brand-specific decoder** (load serial-number-guide.md)
3. **Check for Factory Order Number** (Gibson pre-1961 — see FON system in gibson.md)
4. **Verify with secondary dating**: Pot codes, construction features, hardware stamps
5. **Flag known issues**: Fender overlapping serial ranges, Gibson reused numbers, Japanese factory codes
6. **Multi-factor rule**: Serial number alone rarely sufficient — always cross-reference with at least 2 construction features from other steps

### Step 4: Body Front

1. **Soundhole shape** (acoustic): Round (standard), oval, triangular (Pete Seeger Martin), D-shaped, offset, multiple small holes
2. **Rosette pattern**: Herringbone (Martin 28 series), abalone (Style 40+), simple rings (Style 18 and below), colored mosaic, none
3. **Binding**: Ivoroid, wood, abalone, multi-ply, none, herringbone purfling
4. **Top wood**: Spruce, cedar, maple, koa, redwood — grain pattern and color visible
5. **Finish**: Gloss, satin, vintage toner/aging, sunburst (2-tone, 3-tone), natural, painted
6. **Cutaway**: Venetian (rounded), Florentine (pointed), none
7. **Pickup configuration** (electric): HH, SSS, SS, HSS, HSH, P-90s, Filtertrons
8. **Pickup covers/bezels**: Chrome, gold, nickel, cream, zebra, open-coil, soapbar
9. **Control layout** (electric): Number and position of knobs, switch type/position

### Step 5: Pickguard

Shape, color, material, and attachment are strong identifiers:

1. **Material and color**: Tortoiseshell, black, white/cream, clear, red, pearloid
2. **Shape**: Teardrop, ornate, Fender Strat shape, Les Paul bracket, none
3. **Split/double pickguard** → Pete Seeger Martin models specifically
4. **Mounting**: Adhesive (most acoustic), screw-mounted (most electric)
5. **Ply count**: Single-ply, 3-ply (white-black-white = Fender vintage), 4-ply
6. **Engraved or decorated**: Hummingbird, floral (Dove), custom art
7. **Absence**: Deliberate on some models — not a sign of removal

### Step 6: Bridge & Tailpiece

1. **Acoustic bridge**: Standard belly, pyramid belly (vintage Martin, Pete Seeger), pin bridge, pinless, moustache bridge (Gibson vintage)
2. **Electric bridge**: Tune-o-matic, tremolo/vibrato, hardtail, Floyd Rose, Bigsby, wraparound
3. **Bridge material**: Ebony, rosewood, bone saddle, synthetic, metal
4. **Bridge shape** (critical for Gibson acoustics): Rectangular/straight-line = J-35. Upper belly = J-45/J-50. Must cross-reference with pickguard.
5. **Tailpiece** (electric): Stop bar, trapeze, Bigsby vibrato
6. **String-through body** vs top-loading

### Step 7: Hardware & Electronics

1. **Knob style**: Speed knobs (Gibson), dome knobs (Fender), top-hat, witch-hat, chicken-head
2. **Switch type**: 3-way toggle (Gibson), 5-way blade (Fender), rotary (Gretsch)
3. **Output jack**: Side-mounted, endpin, plate-mounted
4. **Hardware finish**: Chrome, nickel, gold, black, aged/relic

### Step 8: Back, Sides & Body Shape

1. **Back graphics and markings**: Painted/inlaid artwork, artist signature, brand logo, serial number/factory stamp, decorative back strip
2. **Back wood and construction**: Rosewood, mahogany, maple, sapele, walnut, koa. 2-piece, 3-piece, solid, laminate
3. **Body contours**: Belly cut (Strat), forearm contour, carved top (LP, PRS), German carve
4. **Neck joint**: Dovetail, bolt-on, set-neck, neck-through
5. **Neck heel shape**: Rounded, square, sculpted/contoured
6. **Interior label** (if visible through soundhole): Model name, serial number, signature, edition info, factory location — often definitive
7. **Bracing pattern** (if visible): X-bracing, scalloped, forward-shifted, ladder, V-class (Taylor)

### Step 9: Year & Vintage Dating

Once model is identified, compare visible features against known production changes:

1. **Logo evolution**: Font, size, material, positioning changes across decades
2. **Headstock shape changes**: Fender (small pre-CBS → large CBS → small again), Gibson (open-book variations)
3. **Tuner changes**: Kluson → Schaller → Grover → Gotoh transitions
4. **Pickup changes** (electric): PAF → patent number → T-top → modern (Gibson)
5. **Bridge/saddle evolution**: Shape changes across decades per brand
6. **Finish type**: Nitrocellulose lacquer (vintage/high-end) → polyurethane/polyester (modern)
7. **Country of origin markings**: Production relocation dates

### Step 10: Cross-Reference All Non-Standard Elements

**Critical rule**: If ANY element across Steps 1-9 is non-standard for the brand, this is likely a signature/artist/limited/custom edition. Search for that specific element BEFORE guessing a standard production model.

Priority order:
1. **Artist signature or name visible** → search "[brand] [artist name] signature model"
2. **Unique graphic inlay** → search "[brand] [describe actual shape] inlay model"
3. **Non-standard body/soundhole feature** → search "[brand] [specific feature] guitar model"
4. **Unusual combination of standard features** → search "[brand] [feature A] [feature B] model"
5. **Only if nothing unusual found** → default to standard model identification

### Common Identification Mistakes to Avoid

- **Do NOT describe an unknown inlay generically** ("some decoration"). Describe its actual shape: "banjo", "bird", "diamond"
- **Do NOT assume standard model** when non-standard elements are present
- **Do NOT ignore signatures**. Any handwriting-style inlay is likely an artist autograph
- **Do NOT skip the fretboard**. Absence of inlays is itself a strong identifier
- **Do NOT overlook the pickguard**. Split, engraved, or unusual shape can be definitive
- **Do NOT dismiss interior labels**. If any part is visible, read it
- **Do NOT mismatch bridge shape and pickguard shape**. Cross-reference together — straight-line bridge + teardrop pickguard = different model/era than belly bridge + large pointed pickguard
- **Do NOT default to the most common model**. A round-shoulder Gibson acoustic is NOT automatically a J-45 — check bridge shape, pickguard, rosette, fret count
- **Missing elements are data too**: No pickguard, no inlays, no binding each narrows identification

---

## Routing Table

| Question Type | Load File(s) |
|---|---|
| Identify guitar from photo | brand-index.md → [specific brand].md |
| What brand is this? | brand-index.md |
| Gibson question | gibson.md |
| Fender question | fender.md |
| Martin question | martin.md |
| Serial number lookup | serial-number-guide.md |
| What wood/body style/pickup type | general-knowledge.md |
| Condition grading | general-knowledge.md |
| Vintage market question | general-knowledge.md |
| Acoustic specialist brand | acoustic-specialists.md |
| Bass brand question | bass-specialists.md |
| Japanese brand question | japanese-builders.md |
| Boutique electric brand | boutique-electric.md |
| European brand question | european-builders.md |
| Budget/mainstream brand | budget-mainstream.md |
| TWNG platform question | twng-platform.md |
| Marketing/launch question | twng-marketing-launch.md |
| Luthier outreach | twng-luthier-outreach.md |
| Product specs/PRD | twng-product-specs.md |

---

## File Index

```
twng-skills/
├── SKILL.md                          ← This file (protocol + routing)
├── references/
│   ├── brand-index.md                ← All 120+ brands: headstock, country, routing
│   ├── general-knowledge.md          ← Terminology, body styles, tonewoods, grading, market
│   ├── serial-number-guide.md        ← Multi-brand serial decoders & dating systems
│   │
│   ├── [TIER 1 — Individual brand files]
│   ├── gibson.md
│   ├── fender.md
│   ├── martin.md
│   ├── taylor.md
│   ├── prs.md
│   ├── ibanez.md
│   ├── epiphone.md
│   ├── yamaha.md
│   ├── gretsch.md
│   ├── jackson.md
│   ├── esp-ltd.md
│   ├── squier.md
│   ├── music-man.md
│   ├── cort.md
│   ├── schecter.md
│   ├── charvel.md
│   ├── bc-rich.md
│   ├── seagull.md
│   ├── guild.md
│   │
│   ├── [TIER 2 — Grouped category files]
│   ├── acoustic-specialists.md
│   ├── bass-specialists.md
│   ├── japanese-builders.md
│   ├── boutique-electric.md
│   ├── european-builders.md
│   └── budget-mainstream.md
│
├── [TWNG Platform Skills]
├── twng-platform.md                  ← Platform overview, brand voice, quick actions
├── twng-marketing-launch.md          ← Launch strategy, campaigns, channels
├── twng-luthier-outreach.md          ← Luthier communication & partnerships
└── twng-product-specs.md             ← PRDs, user stories, API specs
```
