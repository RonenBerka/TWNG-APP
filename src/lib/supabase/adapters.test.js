import { describe, it, expect } from 'vitest';
import {
  adaptInstrument,
  adaptInstruments,
  adaptGuitar,
  adaptGuitars,
} from './adapters.js';
import { GUITAR_IMAGES } from '../../utils/placeholders.js';

// The adapter turns raw Supabase rows into the flat shape the UI renders. If it
// breaks, cards show blanks or crash — so the mapping is pinned down here.

function makeRow(overrides = {}) {
  return {
    id: 'i1',
    make: 'Gibson',
    model: 'Les Paul',
    year: 1959,
    serial_number: '9-1234',
    description: 'A classic',
    main_image_url: '/main.jpg',
    is_featured: true,
    is_archived: false,
    moderation_status: 'approved',
    is_for_sale: false,
    specs: { neck: 'mahogany' },
    custom_fields: { condition: 'Excellent' },
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-02-01T00:00:00Z',
    current_owner: { id: 'u1', username: 'ronen', avatar_url: '/a.jpg' },
    uploader: { id: 'u2', username: 'dave', avatar_url: '/b.jpg' },
    occ: [
      { id: 'o1', content_type: 'image', media_url: '/img-late.jpg', visible_publicly: true, created_at: '2021-05-01T00:00:00Z' },
      { id: 'o2', content_type: 'image', media_url: '/img-early.jpg', visible_publicly: true, created_at: '2021-01-01T00:00:00Z' },
      { id: 'o3', content_type: 'text', title: 'Nickname', content: 'Old Faithful', visible_publicly: true },
      { id: 'o4', content_type: 'text', title: 'Story', content: 'Bought in 1975', visible_publicly: true },
      { id: 'o5', content_type: 'image', media_url: '/hidden.jpg', visible_publicly: false, created_at: '2019-01-01T00:00:00Z' },
    ],
    ...overrides,
  };
}

describe('adaptInstrument — field mapping', () => {
  it('maps snake_case DB columns to the camelCase UI shape', () => {
    const r = adaptInstrument(makeRow());
    expect(r.make).toBe('Gibson');
    expect(r.model).toBe('Les Paul');
    expect(r.year).toBe(1959);
    expect(r.serialNumber).toBe('9-1234');
    expect(r.mainImage).toBe('/main.jpg');
    expect(r.isFeatured).toBe(true);
    expect(r.moderationStatus).toBe('approved');
    expect(r.specs).toEqual({ neck: 'mahogany' });
    expect(r.customFields).toEqual({ condition: 'Excellent' });
  });

  it('maps owner and uploader, and nulls them when absent', () => {
    const withPeople = adaptInstrument(makeRow());
    expect(withPeople.owner).toEqual({ id: 'u1', username: 'ronen', avatar: '/a.jpg' });
    expect(withPeople.uploader).toEqual({ id: 'u2', username: 'dave', avatar: '/b.jpg' });

    const noPeople = adaptInstrument(makeRow({ current_owner: null, uploader: null }));
    expect(noPeople.owner).toBeNull();
    expect(noPeople.uploader).toBeNull();
  });

  it('defaults specs and customFields to empty objects when missing', () => {
    const r = adaptInstrument(makeRow({ specs: null, custom_fields: undefined }));
    expect(r.specs).toEqual({});
    expect(r.customFields).toEqual({});
  });
});

describe('adaptInstrument — OCC extraction', () => {
  it('picks the earliest public image as the primary image', () => {
    const r = adaptInstrument(makeRow());
    expect(r.image).toBe('/img-early.jpg'); // earliest by created_at, public only
    expect(r.images).toHaveLength(2); // the hidden image is excluded
    expect(r.images[0].url).toBe('/img-early.jpg');
  });

  it('extracts nickname and story from public text OCC', () => {
    const r = adaptInstrument(makeRow());
    expect(r.nickname).toBe('Old Faithful');
    expect(r.story).toBe('Bought in 1975');
  });

  it('keeps every OCC row (published or not) in rawOcc for later filtering', () => {
    const r = adaptInstrument(makeRow());
    expect(r.rawOcc).toHaveLength(5);
  });
});

describe('adaptInstrument — placeholder images', () => {
  it('falls back to the brand placeholder when there is no image OCC', () => {
    const r = adaptInstrument(makeRow({ make: 'Fender', occ: [] }));
    expect(r.image).toBe(GUITAR_IMAGES.tele_relic);
  });

  it('uses the generic fallback for an unknown brand', () => {
    const r = adaptInstrument(makeRow({ make: 'NoSuchBrand', occ: [] }));
    expect(r.image).toBe(GUITAR_IMAGES.heritage_lp);
  });
});

describe('adaptInstrument — guards and list helpers', () => {
  it('returns null for null/undefined input', () => {
    expect(adaptInstrument(null)).toBeNull();
    expect(adaptInstrument(undefined)).toBeNull();
  });

  it('adaptInstruments maps a list and tolerates null/undefined', () => {
    expect(adaptInstruments([makeRow(), makeRow({ id: 'i2' })])).toHaveLength(2);
    expect(adaptInstruments(null)).toEqual([]);
    expect(adaptInstruments(undefined)).toEqual([]);
  });

  it('legacy adaptGuitar/adaptGuitars aliases behave like the instrument adapters', () => {
    expect(adaptGuitar(makeRow()).id).toBe('i1');
    expect(adaptGuitars([makeRow()])).toHaveLength(1);
  });
});
