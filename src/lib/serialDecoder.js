/**
 * TWNG Serial Number Decoder Engine
 * Pure JavaScript module for guitar serial number decoding
 * No framework dependencies, no external APIs
 *
 * Usage:
 *   import { decodeSerial, SUPPORTED_BRANDS, getDecoderInfo } from './serialDecoder';
 *   const result = decodeSerial('US21034567', 'Fender');
 */

// ─── IMPORTS ──────────────────────────────────────────────────────────────

import {
  SUPPORTED_BRANDS,
  BRAND_HINTS,
  FACTORIES,
  FENDER_YEAR_PREFIXES,
  FENDER_SQUIER_FACTORIES,
  GIBSON_VINTAGE_SERIALS,
  MARTIN_RANGES,
  MONTH_NAMES,
} from './serialDecoderConfig.js';

// ─── EXPORTS ──────────────────────────────────────────────────────────────

export { SUPPORTED_BRANDS } from './serialDecoderConfig.js';

// ─── RESULT BUILDERS ──────────────────────────────────────────────────────

/**
 * Creates a standard decoder result object
 */
function createResult(success, brand, decoded, confidence = 'none', explanation = '', tips = [], alternatives = []) {
  return {
    success,
    confidence,
    decoded: success ? decoded : null,
    alternatives,
    explanation,
    tips,
  };
}

/**
 * Creates a decoded object with standard shape
 */
function createDecoded(brand, year = null, yearRange = null, factory = null, country = null, series = null, productionNumber = null) {
  return {
    brand,
    year,
    yearRange,
    factory,
    country,
    series,
    productionNumber,
  };
}

// ─── FENDER DECODER ───────────────────────────────────────────────────────

function decodeFender(serial) {
  const s = serial.toUpperCase().trim();
  const tips = [];

  // Pattern: US/MX/JD + 2-digit year + digits
  const americanMatch = /^(US|MX|JD)(\d{2})(\d+)$/.exec(s);
  if (americanMatch) {
    const [, location, yearCode, prodNum] = americanMatch;
    const year = 2000 + parseInt(yearCode, 10);
    const factories = {
      'US': 'Corona, California',
      'MX': 'Ensenada, Mexico',
      'JD': 'Japan (Dyna Gakki)',
    };

    let series = location === 'US' ? 'American' : location === 'MX' ? 'Mexican' : 'Japanese Dyna Gakki';
    if (year >= 2024) {
      tips.push('Recent model (2024+)');
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Fender',
        year,
        null,
        factories[location],
        null,
        series,
        prodNum,
      ),
      alternatives: [],
      explanation: `${location} prefix indicates ${factories[location]} manufacture. Year code ${yearCode} = ${year}.`,
      tips,
    };
  }

  // Pattern: CZ + digits (Custom Shop)
  if (s.startsWith('CZ')) {
    tips.push('Custom Shop series');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Fender',
        null,
        '1991-present',
        'USA / Custom Shop',
        'USA',
        'Custom Shop',
        s.slice(2),
      ),
      alternatives: [],
      explanation: 'CZ prefix indicates Fender Custom Shop. Exact year cannot be determined from serial alone.',
      tips,
    };
  }

  // Pattern: V + 5-6 digits (Vintage Reissue)
  if (/^V\d{5,6}$/.test(s)) {
    tips.push('Vintage reissue series');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Fender',
        null,
        '1982-present',
        'USA',
        'USA',
        'Vintage Reissue',
        s.slice(1),
      ),
      alternatives: [],
      explanation: 'V prefix indicates Fender Vintage Reissue series (1982-present). Exact year unclear from serial.',
      tips,
    };
  }

  // Pattern: Prefix + 6 digits (S=1970s, E=1980s, N=1990s, Z=2000s)
  const prefixMatch = /^([SENZ])(\d{6})$/.exec(s);
  if (prefixMatch) {
    const [, prefix, prodNum] = prefixMatch;
    const year = FENDER_YEAR_PREFIXES[prefix];
    const yearDesc = {
      'S': '1970s',
      'E': '1980s',
      'N': '1990s',
      'Z': '2000s',
    };

    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Fender',
        null,
        yearDesc[prefix],
        'USA',
        'USA',
        'Vintage',
        prodNum,
      ),
      alternatives: [],
      explanation: `${prefix} prefix indicates ${yearDesc[prefix]} production. Exact year cannot be determined.`,
      tips: ['Consider professional appraisal for vintage models'],
    };
  }

  // Pattern: SE + 6 digits (Squier Affinity/Vintage Modified)
  if (/^SE\d{6}$/.test(s)) {
    tips.push('Squier standard/mid-range line');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Squier',
        null,
        'Various',
        FENDER_SQUIER_FACTORIES['SE'],
        'South Korea',
        'Squier SE',
        s.slice(2),
      ),
      alternatives: [],
      explanation: 'SE prefix indicates Squier series (standard/mid-range). Manufacture location varies.',
      tips,
    };
  }

  // Pattern: Indonesian Squier (IC, ICS, IS)
  const squierIndoMatch = /^(IC|ICS|IS)/.exec(s);
  if (squierIndoMatch) {
    tips.push('Squier Indonesia series');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Squier',
        null,
        'Various',
        'Indonesia (CORT/Sulit)',
        'Indonesia',
        'Squier Indonesia',
        s.slice(squierIndoMatch[0].length),
      ),
      alternatives: [],
      explanation: `${squierIndoMatch[0]} prefix indicates Squier made in Indonesia.`,
      tips,
    };
  }

  // Pattern: China/Korea Squier (CGS, CY)
  const squierChinaMatch = /^(CGS|CY)/.exec(s);
  if (squierChinaMatch) {
    const location = squierChinaMatch[0] === 'CGS' ? 'China' : 'South Korea';
    tips.push(`Squier ${location} series`);
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Squier',
        null,
        'Various',
        location,
        location,
        `Squier ${location}`,
        s.slice(squierChinaMatch[0].length),
      ),
      alternatives: [],
      explanation: `${squierChinaMatch[0]} prefix indicates Squier made in ${location}.`,
      tips,
    };
  }

  // Pattern: L + 5 digits (1963-1965 Fender)
  if (/^L\d{5}$/.test(s)) {
    tips.push('Early CBS-era Fender');
    return {
      success: true,
      confidence: 'low',
      decoded: createDecoded(
        'Fender',
        null,
        '1963-1965',
        'USA',
        'USA',
        'Pre-CBS',
        s.slice(1),
      ),
      alternatives: [],
      explanation: 'L prefix with 5 digits suggests 1963-1965 Fender from early CBS era.',
      tips: ['Verify with expert for pre-CBS authenticity'],
    };
  }

  return null;
}

// ─── GIBSON DECODER ───────────────────────────────────────────────────────

function decodeGibson(serial) {
  const s = serial.toUpperCase().trim();
  const tips = [];

  // Pattern: 9-digit modern (2014+) YYYDDDXXX
  if (/^\d{9}$/.test(s)) {
    const yearDigits = s.slice(0, 3);
    const year = 2000 + parseInt(yearDigits, 10);
    const dayOfYear = s.slice(3, 6);
    const batchNum = s.slice(6, 9);

    if (year >= 2014 && year <= 2099) {
      tips.push('Modern Gibson (2014+)');
      return {
        success: true,
        confidence: 'high',
        decoded: createDecoded(
          'Gibson',
          year,
          null,
          'Nashville / Memphis',
          'USA',
          'Standard',
          batchNum,
        ),
        alternatives: [],
        explanation: `9-digit format: YYY=${yearDigits} (${year}), DDD=${dayOfYear} (day of year), XXX=${batchNum} (batch). Likely post-2014 Nashville or Montana facility.`,
        tips,
      };
    }
  }

  // Pattern: 8-digit modern (post-2005) YDDDYPPP
  if (/^\d{8}$/.test(s)) {
    const digit1 = parseInt(s[0], 10);
    const digit5 = parseInt(s[4], 10);
    const yearCode = (digit1 * 10 + digit5).toString().padStart(2, '0');
    const dayOfYear = s.slice(1, 4);
    const prodNum = s.slice(5, 8);

    // Try to extract year (post-2005)
    const possibleYears = [];
    for (let base = 2005; base <= 2025; base++) {
      const lastTwo = (base % 100).toString().padStart(2, '0');
      if (parseInt(yearCode, 10) === parseInt(lastTwo, 10)) {
        possibleYears.push(base);
      }
    }

    if (possibleYears.length > 0) {
      const year = possibleYears[0];
      const rankingNum = parseInt(dayOfYear, 10);
      let factory = 'Nashville, Tennessee';
      if (rankingNum >= 500) {
        factory = 'Memphis, Tennessee (closed 2019, now Montana)';
      }

      tips.push('Modern Gibson (2005+)');
      return {
        success: true,
        confidence: 'high',
        decoded: createDecoded(
          'Gibson',
          year,
          null,
          factory,
          'USA',
          'Standard',
          prodNum,
        ),
        alternatives: [],
        explanation: `8-digit format: Y=${digit1}, DDD=${dayOfYear}, Y=${digit5}, PPP=${prodNum}. Year ${yearCode}XX → ${year}. Ranking ${dayOfYear}: ${rankingNum < 500 ? 'Nashville' : 'Memphis'}.`,
        tips,
      };
    }

    // Fallback for 8-digit if year extraction fails
    return {
      success: true,
      confidence: 'low',
      decoded: createDecoded(
        'Gibson',
        null,
        '2005-present',
        'Nashville / Memphis',
        'USA',
        'Standard',
        prodNum,
      ),
      alternatives: [],
      explanation: '8-digit serial detected but year extraction inconclusive. Likely 2005+.',
      tips: ['Contact Gibson for exact year confirmation'],
    };
  }

  // Pattern: 5-6 digit vintage (1952-1961)
  if (/^\d{5,6}$/.test(s)) {
    const num = parseInt(s, 10);
    for (const range of GIBSON_VINTAGE_SERIALS) {
      if (num >= range.min && num <= range.max) {
        const yearRange = `${range.yearMin}-${range.yearMax}`;
        tips.push('Vintage Gibson (pre-1970)');
        tips.push('Recommend professional appraisal');
        return {
          success: true,
          confidence: 'medium',
          decoded: createDecoded(
            'Gibson',
            null,
            yearRange,
            'Kalamazoo, Michigan',
            'USA',
            'Vintage',
            s,
          ),
          alternatives: [],
          explanation: `Serial number in vintage range: ${yearRange}. Exact year requires expert authentication.`,
          tips,
        };
      }
    }

    // If not in known ranges, provide conservative estimate
    return {
      success: true,
      confidence: 'low',
      decoded: createDecoded(
        'Gibson',
        null,
        '1952-1980',
        'Kalamazoo, Michigan',
        'USA',
        'Vintage',
        s,
      ),
      alternatives: [],
      explanation: 'Vintage serial format detected but year estimate uncertain. Professional appraisal recommended.',
      tips: ['Contact Gibson with additional instrument details (model, finish, hardware)'],
    };
  }

  return null;
}

// ─── PRS DECODER ──────────────────────────────────────────────────────────

function decodePRS(serial) {
  const s = serial.toUpperCase().trim();
  const tips = [];

  // Pattern: YY NNNNN (2-digit year + 5-digit production)
  const match = /^(\d{2})(\d{5})$/.exec(s);
  if (match) {
    const [, yearCode, prodNum] = match;
    let year = 1900 + parseInt(yearCode, 10);

    // PRS started in 1985, so adjust logic
    if (year < 1985) {
      year += 100;
    }

    tips.push('Standard PRS format');
    if (year < 2000) {
      tips.push('Consider authentication for pre-2000 vintage');
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'PRS',
        year,
        null,
        'Stevensville, Maryland',
        'USA',
        'Standard',
        prodNum,
      ),
      alternatives: [],
      explanation: `PRS 7-digit format: YY=${yearCode} (${year}), NNNNN=${prodNum} (production number). All USA-made at Paul Reed Smith facility.`,
      tips,
    };
  }

  // Pattern: Y NNNNN (1-digit year + 5-digit production, older models)
  const olderMatch = /^(\d)(\d{5,6})$/.exec(s);
  if (olderMatch) {
    const [, yearDigit, prodNum] = olderMatch;
    const year = 1990 + parseInt(yearDigit, 10);

    if (year > 1999) {
      return null; // Already covered by 2-digit pattern
    }

    tips.push('Early PRS format');
    tips.push('Pre-2000 model');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'PRS',
        year,
        null,
        'Stevensville, Maryland',
        'USA',
        'Standard',
        prodNum,
      ),
      alternatives: [],
      explanation: `Early PRS 6-digit format: Y=${yearDigit} (199${yearDigit}), production=${prodNum}.`,
      tips,
    };
  }

  // Pattern: SE models (PRS SE / budget line)
  const seMatch = /^SE(\d{6})$/.exec(s);
  if (seMatch) {
    const [, prodNum] = seMatch;
    tips.push('PRS SE series (budget)');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'PRS',
        null,
        '2000-present',
        'Indonesia / South Korea',
        'Indonesia / South Korea',
        'PRS SE',
        prodNum,
      ),
      alternatives: [],
      explanation: 'PRS SE prefix indicates budget "Student Edition" made overseas.',
      tips,
    };
  }

  return null;
}

// ─── MARTIN DECODER ───────────────────────────────────────────────────────

function decodeMartin(serial) {
  const s = serial.trim();

  // Try to parse as integer
  const num = parseInt(s, 10);
  if (isNaN(num)) {
    return null;
  }

  const tips = [];

  // Interpolate based on known ranges
  let estimatedYear = null;
  let yearRange = null;

  for (let i = 0; i < MARTIN_RANGES.length; i++) {
    const range = MARTIN_RANGES[i];
    if (num >= range.min && num <= range.max) {
      estimatedYear = range.year;

      // Calculate a range estimate
      if (i < MARTIN_RANGES.length - 1) {
        const nextRange = MARTIN_RANGES[i + 1];
        const yearSpan = nextRange.year - range.year;
        const serialSpan = range.max - range.min;
        const yearsPerSerial = yearSpan / serialSpan;
        const estimatedOffset = (num - range.min) * yearsPerSerial;
        const endYear = Math.round(range.year + estimatedOffset);
        yearRange = `${Math.round(estimatedYear)}-${endYear}`;
      } else {
        yearRange = `${estimatedYear}-present`;
      }

      break;
    }
  }

  if (estimatedYear || yearRange) {
    tips.push('Martin uses sequential numbering with no embedded date');
    tips.push('Year estimate based on known serial ranges');
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Martin',
        estimatedYear,
        yearRange,
        'Nazareth, Pennsylvania',
        'USA',
        'Acoustic',
        s,
      ),
      alternatives: [],
      explanation: `Martin serial #${s} falls within estimated range. Martin does not encode manufacturing date in serial; range is interpolated from known batches.`,
      tips,
    };
  }

  // Generic fallback for Martin serials
  return {
    success: true,
    confidence: 'low',
    decoded: createDecoded(
      'Martin',
      null,
      'Unknown',
      'Nazareth, Pennsylvania',
      'USA',
      'Acoustic',
      s,
    ),
    alternatives: [],
    explanation: 'Serial appears valid but year cannot be estimated. Contact Martin directly.',
    tips: ['Contact C.F. Martin & Company for year confirmation'],
  };
}

// ─── TAYLOR DECODER ───────────────────────────────────────────────────────

function decodeTaylor(serial) {
  const s = serial.trim();

  // Pattern: YYMMDDXXX (9-digit) or longer (11-digit)
  const match = /^(\d{2})(\d{2})(\d{2})(\d{3,5})$/.exec(s);
  if (match) {
    const [, yy, mm, dd, prodNum] = match;
    const year = 2000 + parseInt(yy, 10);
    const month = parseInt(mm, 10);
    const day = parseInt(dd, 10);

    const tips = [];

    // Validate month/day
    if (month < 1 || month > 12) {
      return {
        success: true,
        confidence: 'low',
        decoded: createDecoded(
          'Taylor',
          year,
          null,
          'El Cajon, California',
          'USA',
          'Acoustic',
          prodNum,
        ),
        alternatives: [],
        explanation: `Taylor 9+ digit format detected (YYMMDDXXX), year ${year}, but month ${month} is invalid.`,
        tips: ['Verify serial format with Taylor'],
      };
    }

    if (day < 1 || day > 31) {
      return {
        success: true,
        confidence: 'low',
        decoded: createDecoded(
          'Taylor',
          year,
          null,
          'El Cajon, California',
          'USA',
          'Acoustic',
          prodNum,
        ),
        alternatives: [],
        explanation: `Taylor 9+ digit format detected, year ${year}, but day ${day} is invalid.`,
        tips: ['Verify serial format with Taylor'],
      };
    }

    const dateStr = `${day} ${MONTH_NAMES[month]} ${year}`;

    if (parseInt(prodNum, 10) < 100) {
      tips.push('100 series or lower = Mexico (Tecate) manufacture');
    } else {
      tips.push('Model 100+ = USA (El Cajon) manufacture');
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Taylor',
        year,
        null,
        'El Cajon, California (or Tecate, Mexico)',
        'USA / Mexico',
        'Acoustic',
        prodNum,
      ),
      alternatives: [],
      explanation: `Taylor's date-based system: manufactured ${dateStr}, production #${prodNum}.`,
      tips,
    };
  }

  return null;
}

// ─── IBANEZ DECODER ───────────────────────────────────────────────────────

function decodeIbanez(serial) {
  const s = serial.toUpperCase().trim();
  const tips = [];

  // Pattern: F + YY + MM + XXXX (FujiGen, Japan)
  const fujiMatch = /^F(\d{2})(\d{2})(\d{4,5})$/.exec(s);
  if (fujiMatch) {
    const [, yy, mm, prodNum] = fujiMatch;
    const year = 1980 + parseInt(yy, 10);
    const month = parseInt(mm, 10);

    if (month < 1 || month > 12) {
      tips.push('Month code invalid');
    } else {
      tips.push(`Manufactured: ${month}/19${yy}`);
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Ibanez',
        year,
        null,
        'FujiGen, Japan',
        'Japan',
        'FujiGen',
        prodNum,
      ),
      alternatives: [],
      explanation: `Ibanez FujiGen format: F=FujiGen, YY=${yy} (19${yy}), MM=${mm}, XXXX=${prodNum}.`,
      tips,
    };
  }

  // Pattern: Country-prefixed (C, S, W, I, A)
  const countryMatch = /^([CSWIA])(\d{4,6})$/.exec(s);
  if (countryMatch) {
    const [, prefix, prodNum] = countryMatch;
    const factories = {
      'C': 'CORT, South Korea',
      'S': 'Samick, South Korea',
      'W': 'Ibanez Indonesia',
      'I': 'Indonesia',
      'A': 'AcRE, South Korea',
    };

    tips.push(`Made in ${factories[prefix]}`);
    return {
      success: true,
      confidence: 'medium',
      decoded: createDecoded(
        'Ibanez',
        null,
        'Various (1980s-present)',
        factories[prefix],
        prefix === 'C' || prefix === 'S' || prefix === 'A' ? 'South Korea' : 'Indonesia',
        `${prefix}-series`,
        prodNum,
      ),
      alternatives: [],
      explanation: `Ibanez country code: ${prefix}=${factories[prefix]}. Exact year not encoded.`,
      tips,
    };
  }

  return null;
}

// ─── EPIPHONE DECODER ──────────────────────────────────────────────────────

function decodeEpiphone(serial) {
  const s = serial.toUpperCase().trim();
  const tips = [];

  // Pattern: FYYMRRRR (Factory + 2-digit year + Month + 4-digit ranking)
  const match = /^([SUICK])(\d{2})(\d{1})(\d{4,5})$/.exec(s);
  if (match) {
    const [, factory, yy, mm, ranking] = match;
    const year = 2000 + parseInt(yy, 10);
    const month = parseInt(mm, 10);

    const factories = {
      'S': 'Samick Korea',
      'U': 'Unsung Korea',
      'I': 'Peerless Indonesia',
      'C': 'China',
      'K': 'Samick Korea',
    };

    if (month < 1 || month > 12) {
      tips.push('Month code appears invalid');
    } else {
      tips.push(`Manufactured: ${MONTH_NAMES[month]} ${year}`);
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Epiphone',
        year,
        null,
        factories[factory],
        null,
        `${factory}-series`,
        ranking,
      ),
      alternatives: [],
      explanation: `Epiphone post-2008 format: F=${factory} (${factories[factory]}), YY=${yy} (${year}), M=${mm}, RRRR=${ranking}.`,
      tips,
    };
  }

  return null;
}

// ─── RICKENBACKER DECODER ──────────────────────────────────────────────────

function decodeRickenbacker(serial) {
  const s = serial.trim();
  const tips = [];

  // Pattern: YYMM + production (2-digit year, 2-digit month, rest is production)
  const match = /^(\d{2})(\d{2})(\d{4,6})$/.exec(s);
  if (match) {
    const [, yy, mm, prodNum] = match;
    const year = 1900 + parseInt(yy, 10);
    const month = parseInt(mm, 10);

    // Rickenbacker started in 1931, adjust if needed
    let adjustedYear = year;
    if (year < 1930) {
      adjustedYear = year + 100;
    }

    if (month < 1 || month > 12) {
      tips.push('Month code appears invalid');
    } else {
      tips.push(`Manufactured: ${MONTH_NAMES[month]} ${adjustedYear}`);
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Rickenbacker',
        adjustedYear,
        null,
        'Santa Ana, California',
        'USA',
        'Standard',
        prodNum,
      ),
      alternatives: [],
      explanation: `Rickenbacker format: YY=${yy} (${adjustedYear}), MM=${mm}, production=${prodNum}. All made in Santa Ana, CA.`,
      tips,
    };
  }

  return null;
}

// ─── GRETSCH DECODER ───────────────────────────────────────────────────────

function decodeGretsch(serial) {
  const s = serial.toUpperCase().trim();
  const tips = [];

  // Pattern: JT + YY + MM + XXXX (Japan Terada, Fender era 2003+)
  const jtMatch = /^JT(\d{2})(\d{2})(\d{4,5})$/.exec(s);
  if (jtMatch) {
    const [, yy, mm, prodNum] = jtMatch;
    const year = 2000 + parseInt(yy, 10);
    const month = parseInt(mm, 10);

    tips.push(`Japan Terada, Fender partnership era (2003+)`);
    if (month > 0 && month <= 12) {
      tips.push(`Manufactured: ${MONTH_NAMES[month]} ${year}`);
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Gretsch',
        year,
        null,
        'Terada, Japan',
        'Japan',
        'Fender-era',
        prodNum,
      ),
      alternatives: [],
      explanation: `Gretsch JT format: JT=Japan Terada, YY=${yy} (${year}), MM=${mm}, XXXX=${prodNum}.`,
      tips,
    };
  }

  // Pattern: KS/KF + YY + MM + XXXX (Korea, Samick or Fender partnership)
  const ksMatch = /^(KS|KF)(\d{2})(\d{2})(\d{4,5})$/.exec(s);
  if (ksMatch) {
    const [, factory, yy, mm, prodNum] = ksMatch;
    const year = 2000 + parseInt(yy, 10);
    const month = parseInt(mm, 10);

    const factoryName = factory === 'KS' ? 'Samick Korea' : 'Korea Fender partnership';

    tips.push(`${factoryName}`);
    if (month > 0 && month <= 12) {
      tips.push(`Manufactured: ${MONTH_NAMES[month]} ${year}`);
    }

    return {
      success: true,
      confidence: 'high',
      decoded: createDecoded(
        'Gretsch',
        year,
        null,
        factoryName,
        'South Korea',
        'Korean-made',
        prodNum,
      ),
      alternatives: [],
      explanation: `Gretsch ${factory} format: ${factory}=${factoryName}, YY=${yy} (${year}), MM=${mm}, XXXX=${prodNum}.`,
      tips,
    };
  }

  return null;
}

// ─── MAIN DECODER ────────────────────────────────────────────────────────

/**
 * Main decoding function
 * @param {string} serial - Guitar serial number
 * @param {string} brandHint - Optional brand hint ('Fender', 'Gibson', etc.)
 * @returns {object} Standard result shape
 */
export function decodeSerial(serial, brandHint = null) {
  if (!serial || typeof serial !== 'string') {
    return createResult(
      false,
      null,
      null,
      'none',
      'Invalid serial number: must be a non-empty string.',
      ['Provide a valid serial number from the guitar headstock'],
      [],
    );
  }

  const normalized = serial.trim().toUpperCase();

  if (normalized.length === 0) {
    return createResult(
      false,
      null,
      null,
      'none',
      'Serial number is empty.',
      ['Serial numbers typically 6-13 characters', 'Check headstock or certificate'],
      [],
    );
  }

  // Map of decoders
  const decoders = {
    Fender: decodeFender,
    Gibson: decodeGibson,
    PRS: decodePRS,
    Martin: decodeMartin,
    Taylor: decodeTaylor,
    Ibanez: decodeIbanez,
    Epiphone: decodeEpiphone,
    Rickenbacker: decodeRickenbacker,
    Gretsch: decodeGretsch,
    Squier: decodeFender, // Squier is Fender subsidiary
  };

  // Try brand hint first
  if (brandHint && decoders[brandHint]) {
    const result = decoders[brandHint](normalized);
    if (result && result.success) {
      return result;
    }
  }

  // Try all decoders
  const allResults = [];
  for (const [brand, decoder] of Object.entries(decoders)) {
    const result = decoder(normalized);
    if (result && result.success) {
      allResults.push(result);
    }
  }

  // Return best match or alternatives
  if (allResults.length > 0) {
    const bestMatch = allResults[0];
    const alternatives = allResults.slice(1);

    return {
      success: true,
      confidence: bestMatch.confidence,
      decoded: bestMatch.decoded,
      alternatives,
      explanation: bestMatch.explanation,
      tips: bestMatch.tips,
    };
  }

  // No match
  return createResult(
    false,
    null,
    null,
    'none',
    'Serial number format not recognized by any decoder. This may be a custom, vintage, or non-standard format.',
    [
      'Verify serial is correct (no spaces, exact as printed)',
      'Contact the manufacturer directly for verification',
      'Consider professional guitar appraisal for authenticity',
    ],
    [],
  );
}

// ─── BRAND INFO ──────────────────────────────────────────────────────────

/**
 * Get information about a specific brand's serial format
 * @param {string} brand - Brand name
 * @returns {object} Brand hints and decoder info
 */
export function getDecoderInfo(brand) {
  return BRAND_HINTS[brand] || null;
}

/**
 * List all supported brands
 * @returns {array} Array of brand names
 */
export function getSupportedBrands() {
  return [...SUPPORTED_BRANDS];
}

/**
 * Validate a serial number format (basic check)
 * @param {string} serial - Serial number to validate
 * @returns {boolean} True if format looks reasonable
 */
export function isValidSerialFormat(serial) {
  if (!serial || typeof serial !== 'string') {
    return false;
  }

  const normalized = serial.trim();
  return normalized.length >= 5 && normalized.length <= 15;
}

export default {
  decodeSerial,
  getDecoderInfo,
  getSupportedBrands,
  isValidSerialFormat,
  SUPPORTED_BRANDS,
};
