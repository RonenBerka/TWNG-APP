# TWNG Image Setup Guide

Save the images you uploaded into these folders inside `twng-app/public/images/`.
Use the exact filenames below. The app will display them automatically.

## Guitars (`public/images/guitars/`)

| Filename | Image Description |
|---|---|
| `heritage-h150-body.jpg` | Heritage H-150 — honey burst, close-up of body (flame top, 2 humbuckers) |
| `heritage-h150-full.jpg` | Heritage H-150 — full body product shot, lemon/honey burst on white background |
| `heritage-h535-cherry.jpg` | Heritage H-535 Semi-Hollow — translucent cherry red, flame maple |
| `heritage-h150-closeup.jpg` | Heritage H-150 — same as body shot (use same file or a variant) |
| `nash-s57-sunburst.jpg` | Nash/Fender Strat — three-tone sunburst heavy relic, maple neck, full body |
| `nash-s63-daphne.jpg` | Nash-style Strat — Daphne Blue, light relic, rosewood board |
| `tele-butterscotch-moody.jpg` | Telecaster — butterscotch blonde, moody room with shadow on wall |
| `tele-butterscotch-relic.jpg` | Telecaster — heavy relic, butterscotch blonde, black pickguard (product shot on white) |
| `suhr-classic-s-green.jpg` | Suhr Classic S — Surf Green, white pickguard, on white background |
| `brian-may-special.jpg` | Brian May BMG Special — cherry red, unique shape |
| `squier-mini-red.jpg` | Squier Mini Strat — Torino Red, white pickguard |
| `yamaha-c40.jpg` | Yamaha C40 Classical — natural spruce top |
| `cordoba-c5.jpg` | Cordoba C5 — cedar top classical guitar |

## Artists (`public/images/artists/`)

| Filename | Image Description |
|---|---|
| `artist-strat-sparkle.jpg` | Performer in sparkly/sequin top playing a Strat |
| `artist-stage-green.jpg` | Performer on stage with guitar, green stage lights |
| `artist-white-strat.jpg` | Performer on stage with white Stratocaster |
| `artist-female-blonde.jpg` | Female performer with blonde hair and guitar |
| `artist-female-lp.jpg` | Female guitarist with a red Les Paul, urban/alley setting |
| `artist-colorful-strat.jpg` | Performer in colorful outfit playing Stratocaster |

## Lifestyle (`public/images/lifestyle/`)

| Filename | Image Description |
|---|---|
| `tele-moody-room.jpg` | Telecaster leaning against wall in moody room with sunlight |
| `collection-room.jpg` | Guitar collection room — wall-mounted guitars, leather chair, string lights |

## Quick Setup

```bash
cd ~/Desktop/"New TWNG WebApp"/twng-app/public/images

# Create folders if they don't exist
mkdir -p guitars artists lifestyle

# Then copy/save your images with the filenames above
```

Once images are in place, the running dev server will pick them up automatically (no restart needed).
