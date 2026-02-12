# 🎸 TWNG Magazine Cover Generator

Automated tool to generate TWNG magazine-style covers from images.

## Quick Start

### 1. Install Dependencies
```bash
cd cover-generator
npm install
```

### 2. Generate Single Cover
```bash
node generate.js <image> <guitar-name> <subtitle>
```

**Example:**
```bash
node generate.js photo.jpg "FENDER STRATOCASTER" "The One That Started Everything"
```

### 3. Generate Multiple Covers (Batch)

Edit `batch.js` with your covers data, or create a JSON file:

```json
[
  {
    "imagePath": "images/photo1.jpg",
    "guitarName": "FENDER STRATOCASTER",
    "subtitle": "The One That Started Everything",
    "issueNumber": "01"
  },
  {
    "imagePath": "images/photo2.jpg",
    "guitarName": "GIBSON LES PAUL",
    "subtitle": "When Rock Found Its Voice",
    "issueNumber": "02"
  }
]
```

Then run:
```bash
node batch.js covers.json
```

## Output

- Single covers: Saved to current directory
- Batch covers: Saved to `output/` folder

## Cover Specs

- **Size:** 1080 × 1350 px (Instagram Portrait 4:5)
- **Format:** PNG
- **Fonts:** Playfair Display, Oswald, Inter

## Customization

Edit `template.html` to change:
- Colors (default: #F59E0B amber)
- Layout and positioning
- Text styling
- Gradient overlay

## Examples

```bash
# Basic cover
node generate.js strat.jpg "FENDER STRATOCASTER" "The One That Started Everything"

# With issue number and year
node generate.js lespaul.jpg "GIBSON LES PAUL" "When Rock Found Its Voice" 02 2026

# Batch from JSON
node batch.js my-covers.json
```

## Tips for Best Results

1. **Image:** Use vertical/portrait photos (will be cropped to fit)
2. **Guitar Name:** Use ALL CAPS for consistency
3. **Subtitle:** Keep it short and evocative
4. **Image Size:** Minimum 1080px wide recommended

---

Made for TWNG 🎸
