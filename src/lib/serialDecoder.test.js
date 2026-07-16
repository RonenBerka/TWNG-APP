import { describe, it, expect } from 'vitest';
import {
  decodeSerial,
  isValidSerialFormat,
  getSupportedBrands,
  getDecoderInfo,
} from './serialDecoder.js';

// These tests lock in the behaviour of the serial-number decoder — the logical
// heart of the app. Each expected value is derived directly from the decoder's
// own rules, so a passing suite means the decoders still work as designed.

describe('decodeSerial — Fender', () => {
  it('decodes a modern American (US) serial to the right year and factory', () => {
    const r = decodeSerial('US21034567', 'Fender');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe('high');
    expect(r.decoded.brand).toBe('Fender');
    expect(r.decoded.year).toBe(2021);
    expect(r.decoded.factory).toBe('Corona, California');
    expect(r.decoded.series).toBe('American');
  });

  it('decodes a Mexican (MX) serial to Ensenada', () => {
    const r = decodeSerial('MX09876543', 'Fender');
    expect(r.success).toBe(true);
    expect(r.decoded.year).toBe(2009);
    expect(r.decoded.factory).toBe('Ensenada, Mexico');
    expect(r.decoded.series).toBe('Mexican');
  });

  it('recognises a Custom Shop (CZ) serial without a concrete year', () => {
    const r = decodeSerial('CZ12345', 'Fender');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe('medium');
    expect(r.decoded.series).toBe('Custom Shop');
    expect(r.decoded.year).toBeNull();
  });
});

describe('decodeSerial — other brands', () => {
  it('decodes a modern 9-digit Gibson (2014+) serial', () => {
    const r = decodeSerial('015123456', 'Gibson');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe('high');
    expect(r.decoded.brand).toBe('Gibson');
    expect(r.decoded.year).toBe(2015);
  });

  it('decodes a standard 7-digit PRS serial', () => {
    const r = decodeSerial('0812345', 'PRS');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe('high');
    expect(r.decoded.brand).toBe('PRS');
    expect(r.decoded.year).toBe(2008);
    expect(r.decoded.factory).toBe('Stevensville, Maryland');
  });

  it('decodes a date-based Taylor serial', () => {
    const r = decodeSerial('1105248123', 'Taylor');
    expect(r.success).toBe(true);
    expect(r.confidence).toBe('high');
    expect(r.decoded.brand).toBe('Taylor');
    expect(r.decoded.year).toBe(2011);
  });
});

describe('decodeSerial — invalid and unknown input', () => {
  it('rejects empty, null, and non-string input', () => {
    expect(decodeSerial('').success).toBe(false);
    expect(decodeSerial(null).success).toBe(false);
    expect(decodeSerial(12345).success).toBe(false);
  });

  it('reports failure for an unrecognised serial format', () => {
    const r = decodeSerial('ABCDEF');
    expect(r.success).toBe(false);
    expect(r.decoded).toBeNull();
  });
});

describe('helper functions', () => {
  it('isValidSerialFormat accepts 5–15 char strings and rejects the rest', () => {
    expect(isValidSerialFormat('US21034567')).toBe(true);
    expect(isValidSerialFormat('abcd')).toBe(false); // too short
    expect(isValidSerialFormat('')).toBe(false);
    expect(isValidSerialFormat(null)).toBe(false);
  });

  it('getSupportedBrands returns all ten brands as a fresh array', () => {
    const brands = getSupportedBrands();
    expect(Array.isArray(brands)).toBe(true);
    expect(brands).toHaveLength(10);
    expect(brands).toContain('Fender');
    expect(brands).toContain('Gibson');
    // must be a copy, not the shared internal array
    brands.push('MUTATED');
    expect(getSupportedBrands()).toHaveLength(10);
  });

  it('getDecoderInfo returns format hints for a known brand and null otherwise', () => {
    expect(getDecoderInfo('Fender')).not.toBeNull();
    expect(getDecoderInfo('NotARealBrand')).toBeNull();
  });
});
