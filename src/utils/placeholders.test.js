import { describe, it, expect } from 'vitest';
import {
  generateAvatar,
  generatePlaceholder,
  GUITAR_IMAGES,
  IMG,
} from './placeholders.js';

// Placeholder/avatar generation is pure and deterministic. These tests lock in
// that behaviour so cards and profiles always get a valid image.

describe('generateAvatar', () => {
  it('returns an SVG data URI', () => {
    const uri = generateAvatar('Ronen Berka');
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
  });

  it('embeds the uppercased initials of the first two words', () => {
    expect(generateAvatar('Ronen Berka')).toContain('RB');
    expect(generateAvatar('john paul jones')).toContain('JP'); // first two, capped at 2
  });

  it('handles a single-word name', () => {
    expect(generateAvatar('Madonna')).toContain('M');
  });

  it('is deterministic — same name gives the exact same avatar', () => {
    expect(generateAvatar('Ronen Berka')).toBe(generateAvatar('Ronen Berka'));
  });
});

describe('generatePlaceholder', () => {
  it('returns an SVG data URI containing the label', () => {
    const uri = generatePlaceholder('#D97706', 'Fender');
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
    expect(uri).toContain('Fender');
  });
});

describe('image maps', () => {
  it('GUITAR_IMAGES entries are all string paths', () => {
    const values = Object.values(GUITAR_IMAGES);
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((v) => typeof v === 'string' && v.length > 0)).toBe(true);
  });

  it('IMG exposes the logo and re-uses guitar image paths', () => {
    expect(typeof IMG.logo).toBe('string');
    expect(IMG.heritage_lp).toBe(GUITAR_IMAGES.heritage_lp);
  });
});
