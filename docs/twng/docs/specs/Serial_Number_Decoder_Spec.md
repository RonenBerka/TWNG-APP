# TWNG — Serial Number Decoder Specification

> **Feature:** Automatic Serial Number Decoding
> **Version:** 1.0
> **Priority:** P1

---

## Overview

### What is the Serial Decoder?
A feature that takes a guitar's serial number and returns information about when, where, and how it was made.

### User Value
- **Instant history:** "Your guitar was made in 1965 at the Fullerton factory"
- **Verification:** Confirm the year matches the seller's claim
- **Discovery:** Learn things about your guitar you didn't know

### Coverage
| Brand | Coverage | Notes |
|-------|----------|-------|
| Fender | Excellent | 1950s-present |
| Gibson | Excellent | 1952-present |
| PRS | Excellent | All years |
| Martin | Good | Sequential serials |
| Taylor | Excellent | Clear date encoding |
| Ibanez | Good | Japanese models |
| Epiphone | Good | Post-Gibson ownership |
| Squier | Good | By era/factory |
| Gretsch | Moderate | Varies by era |
| Rickenbacker | Good | All USA |
| Others | Limited | As documented |

---

## User Flow

### Flow 1: During Magic Add

Serial automatically extracted and decoded:

```
┌─────────────────────────────────────────────┐
│                                             │
│   Magic Add Results                         │
│   ─────────────────                         │
│                                             │
│   🎸 Fender Stratocaster                    │
│      American Professional II               │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ Serial Number                       │   │
│   │ US21034567                          │   │
│   │                                     │   │
│   │ ✓ Made in Corona, CA                │   │
│   │ ✓ Year: 2021                        │   │
│   │ ✓ American Professional series      │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Flow 2: Manual Entry with Decode

User enters serial, clicks decode:

```
┌─────────────────────────────────────────────┐
│                                             │
│   Serial Number                             │
│   ┌─────────────────────────────────────┐   │
│   │ US21034567                          │   │
│   └─────────────────────────────────────┘   │
│   [🔍 Decode]                               │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   ✓ Serial Decoded                          │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ Brand      Fender                   │   │
│   │ Year       2021                     │   │
│   │ Factory    Corona, California       │   │
│   │ Series     American (US prefix)     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [Apply to this guitar]                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Flow 3: Standalone Decoder Tool

Accessible from menu or search:

```
┌─────────────────────────────────────────────┐
│  Serial Number Decoder                      │
│─────────────────────────────────────────────│
│                                             │
│   Enter a serial number to decode           │
│   ─────────────────────────────────         │
│                                             │
│   Brand (helps accuracy)                    │
│   ┌─────────────────────────────────────┐   │
│   │ Fender                          [▼] │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Serial Number                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │            🔍 Decode                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   💡 Where to find serial numbers:          │
│   • Headstock (front or back)               │
│   • Neck pocket (remove neck)               │
│   • Inside sound hole (acoustics)           │
│   • Bridge plate                            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Decode Results

### Result: Full Match

```
┌─────────────────────────────────────────────┐
│                                             │
│   ✓ Serial Decoded Successfully             │
│   ─────────────────────────────             │
│                                             │
│   Serial: US21034567                        │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   Brand        Fender               │   │
│   │   Year         2021                 │   │
│   │   Factory      Corona, CA, USA      │   │
│   │   Series       American Professional│   │
│   │   Production   Unit #34567          │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   📖 About this serial format:              │
│   "US" prefix indicates American-made       │
│   Fender. The "21" is the year (2021).      │
│                                             │
│   Confidence: High ✓                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Result: Partial Match (Year Range)

```
┌─────────────────────────────────────────────┐
│                                             │
│   ⚡ Partially Decoded                      │
│   ─────────────────────────────             │
│                                             │
│   Serial: 82345                             │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   Brand        Gibson               │   │
│   │   Year         1958-1959            │   │
│   │   Factory      Kalamazoo, MI        │   │
│   │   Era          Golden Era           │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ℹ️ Gibson serials from this era can       │
│      overlap between years. Check pot       │
│      codes for exact dating.                │
│                                             │
│   [What are pot codes? →]                   │
│                                             │
│   Confidence: Medium                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Result: No Match

```
┌─────────────────────────────────────────────┐
│                                             │
│   🔍 Couldn't decode this serial            │
│   ─────────────────────────────             │
│                                             │
│   Serial: XYZ123456                         │
│                                             │
│   This serial doesn't match known           │
│   patterns for Fender guitars.              │
│                                             │
│   Possible reasons:                         │
│   • Different brand than selected           │
│   • Custom shop or special edition          │
│   • Typo in the serial number               │
│   • Counterfeit instrument                  │
│                                             │
│   ─────────────────────────────────────     │
│                                             │
│   Try:                                      │
│   [Change brand] [Re-enter serial]          │
│                                             │
│   Or continue without decoding:             │
│   [Save as-is]                              │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Result: Multiple Possibilities

```
┌─────────────────────────────────────────────┐
│                                             │
│   🔀 Multiple matches found                 │
│   ─────────────────────────────             │
│                                             │
│   Serial: E823456                           │
│                                             │
│   This serial format was used in            │
│   multiple eras. Select the most likely:    │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ ○ Fender USA (1980s)                │   │
│   │   E prefix = 1980s American         │   │
│   │   Year: 1988                        │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ ○ Fender Japan (1984-1987)          │   │
│   │   E prefix also used in Japan       │   │
│   │   Year: 1984-1987                   │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   💡 Check the neck pocket or body          │
│      cavity for "Made in" stamp.            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Technical Implementation

### Decode Function

```typescript
interface SerialDecodeResult {
  success: boolean;
  confidence: 'high' | 'medium' | 'low' | 'none';
  decoded: {
    brand: string;
    year: number | null;
    year_range: string | null;  // "1958-1959"
    factory: string | null;
    country: string | null;
    series: string | null;
    production_number: string | null;
  } | null;
  alternatives: SerialDecodeResult['decoded'][];
  explanation: string;
  tips: string[];
}

async function decodeSerial(
  serial: string,
  brandHint?: string
): Promise<SerialDecodeResult> {
  // 1. Normalize serial (remove spaces, uppercase)
  const normalized = serial.trim().toUpperCase().replace(/\s/g, '');

  // 2. Try brand-specific decoders
  if (brandHint) {
    const decoder = getDecoder(brandHint);
    const result = decoder.decode(normalized);
    if (result.success) return result;
  }

  // 3. Try all decoders
  for (const decoder of allDecoders) {
    const result = decoder.decode(normalized);
    if (result.success) return result;
  }

  // 4. No match
  return { success: false, confidence: 'none', ... };
}
```

### Brand-Specific Decoders

```typescript
// Fender decoder
const fenderDecoder = {
  patterns: [
    {
      regex: /^US(\d{2})(\d+)$/,
      decode: (match) => ({
        year: 2000 + parseInt(match[1]),
        factory: 'Corona, CA',
        country: 'USA',
        series: 'American'
      })
    },
    {
      regex: /^MX(\d{2})(\d+)$/,
      decode: (match) => ({
        year: 2000 + parseInt(match[1]),
        factory: 'Ensenada',
        country: 'Mexico',
        series: 'Mexican'
      })
    },
    // ... more patterns
  ]
};

// Gibson decoder
const gibsonDecoder = {
  patterns: [
    {
      // Modern 8-digit: YDDDYPPP
      regex: /^(\d)(\d{3})(\d)(\d{3})$/,
      decode: (match) => {
        const yearDigit1 = parseInt(match[1]);
        const dayOfYear = parseInt(match[2]);
        const yearDigit2 = parseInt(match[3]);
        // Complex logic for Gibson's confusing system
      }
    },
    // ... more patterns
  ]
};
```

### API Endpoint

```
POST /api/v1/serial/decode

Request:
{
  "serial": "US21034567",
  "brand_hint": "Fender"
}

Response:
{
  "success": true,
  "confidence": "high",
  "decoded": {
    "brand": "Fender",
    "year": 2021,
    "year_range": null,
    "factory": "Corona, CA",
    "country": "USA",
    "series": "American Professional",
    "production_number": "34567"
  },
  "alternatives": [],
  "explanation": "US prefix indicates American-made Fender. 21 = 2021.",
  "tips": []
}
```

---

## Database: Serial Registry

Store verified serials for instant lookup:

```sql
CREATE TABLE serial_registry (
  id UUID PRIMARY KEY,
  serial_number VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(200),
  year INTEGER,
  year_range VARCHAR(20),
  factory VARCHAR(100),
  country VARCHAR(50),

  -- Verification
  verified BOOLEAN DEFAULT false,
  source VARCHAR(20),  -- 'user', 'official', 'import'
  contributed_by UUID REFERENCES users(id),

  UNIQUE(serial_number, brand)
);
```

### Lookup Priority

1. **Check registry first** — instant, verified results
2. **If not found, decode algorithmically** — pattern matching
3. **Save new verified serials** — grows the registry

---

## Integration Points

### With Magic Add

```typescript
// In Magic Add flow
const magicAddResult = await identifyGuitar(image);

if (magicAddResult.serial_detected) {
  const decoded = await decodeSerial(
    magicAddResult.serial,
    magicAddResult.brand
  );

  // Merge decoded info with AI identification
  if (decoded.success) {
    magicAddResult.year = decoded.decoded.year;
    magicAddResult.country = decoded.decoded.country;
    magicAddResult.serial_decoded = decoded;
  }
}
```

### With Feedback Loop

```typescript
// When user confirms/corrects identification
if (userCorrection.serial_number && userCorrection.year) {
  await addToSerialRegistry({
    serial: userCorrection.serial_number,
    brand: userCorrection.brand,
    year: userCorrection.year,
    source: 'user',
    contributed_by: userId
  });
}
```

---

## Educational Content

### "Where to Find Serial Numbers"

```
┌─────────────────────────────────────────────┐
│                                             │
│   📍 Where to Find Serial Numbers           │
│   ─────────────────────────────             │
│                                             │
│   Electric Guitars:                         │
│   • Headstock (front or back)               │
│   • Neck pocket (under neck)                │
│   • Bridge plate                            │
│   • Control cavity                          │
│                                             │
│   Acoustic Guitars:                         │
│   • Inside sound hole (on label)            │
│   • Neck block (inside body)                │
│   • Headstock                               │
│                                             │
│   [Show me examples →]                      │
│                                             │
└─────────────────────────────────────────────┘
```

### "Understanding Pot Codes"

```
┌─────────────────────────────────────────────┐
│                                             │
│   🔧 What are Pot Codes?                    │
│   ─────────────────────────────             │
│                                             │
│   Potentiometers (volume/tone knobs) have   │
│   date codes stamped on them.               │
│                                             │
│   Format: 137-XXYY                          │
│   • 137 = CTS (manufacturer)                │
│   • XX = Year (65 = 1965)                   │
│   • YY = Week of year                       │
│                                             │
│   Example: 137-6520                         │
│   = Made by CTS in week 20 of 1965          │
│                                             │
│   💡 Guitars can't be older than their      │
│      pots — useful for verification!        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Analytics Events

| Event | When | Data |
|-------|------|------|
| `serial_decode_attempted` | User clicks decode | brand_hint |
| `serial_decode_success` | Decode succeeded | brand, confidence |
| `serial_decode_failed` | Decode failed | serial_pattern |
| `serial_registry_hit` | Found in registry | brand |
| `serial_applied` | User applies decoded info | brand, year |

---

## Future Enhancements

1. **OCR from photo** — Extract serial from image automatically
2. **Pot code decoder** — Additional dating method
3. **Neck stamp decoder** — Fender pencil dates
4. **Community contributions** — Users add rare serial patterns
5. **Official partnerships** — Direct data from manufacturers

---

*"Know your guitar's history."*
