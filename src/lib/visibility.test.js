import { describe, it, expect } from 'vitest';
import {
  shouldDisplayOcc,
  filterVisibleOcc,
  getVisibilityLabel,
  cycleVisibility,
} from './visibility.js';

// Visibility rules decide who can see owner-created content (OCC). Getting these
// wrong leaks private content, so every branch is pinned down here.

const guest = { viewerId: null, ownerId: 'owner', showHistoricalContent: true };
const owner = { viewerId: 'owner', ownerId: 'owner', showHistoricalContent: true };
const stranger = { viewerId: 'someone-else', ownerId: 'owner', showHistoricalContent: true };

describe('shouldDisplayOcc', () => {
  it('never shows admin-hidden content, even if public', () => {
    const occ = { creator_id: 'c', admin_hidden: true, visible_publicly: true };
    expect(shouldDisplayOcc(occ, guest)).toBe(false);
  });

  it('always shows creators their own content, even when private', () => {
    const occ = { creator_id: 'owner', visible_publicly: false, visible_to_future_owners: false };
    expect(shouldDisplayOcc(occ, owner)).toBe(true);
  });

  it('shows guests only publicly-visible content', () => {
    const pub = { creator_id: 'c', visible_publicly: true };
    const priv = { creator_id: 'c', visible_publicly: false, visible_to_future_owners: true };
    expect(shouldDisplayOcc(pub, guest)).toBe(true);
    expect(shouldDisplayOcc(priv, guest)).toBe(false);
  });

  it('shows the current owner both public and future-owner content', () => {
    const occ = { creator_id: 'c', visible_publicly: false, visible_to_future_owners: true };
    expect(shouldDisplayOcc(occ, owner)).toBe(true);
  });

  it('shows other logged-in users only public content', () => {
    const pub = { creator_id: 'c', visible_publicly: true };
    const futureOnly = { creator_id: 'c', visible_publicly: false, visible_to_future_owners: true };
    expect(shouldDisplayOcc(pub, stranger)).toBe(true);
    expect(shouldDisplayOcc(futureOnly, stranger)).toBe(false);
  });

  it("hides others' content when the owner disables historical content", () => {
    const occ = { creator_id: 'c', visible_publicly: true };
    const ctx = { viewerId: 'someone-else', ownerId: 'owner', showHistoricalContent: false };
    expect(shouldDisplayOcc(occ, ctx)).toBe(false);
  });

  it("respects the creator's global do-not-show opt-out", () => {
    const occ = { creator_id: 'c', visible_publicly: true };
    const creator = { do_not_show_in_others_ie: true };
    expect(shouldDisplayOcc(occ, stranger, creator)).toBe(false);
  });
});

describe('filterVisibleOcc', () => {
  it('keeps only the items a guest may see', () => {
    const list = [
      { id: 1, creator_id: 'c', visible_publicly: true },
      { id: 2, creator_id: 'c', visible_publicly: false, visible_to_future_owners: true },
    ];
    const visible = filterVisibleOcc(list, guest);
    expect(visible.map(o => o.id)).toEqual([1]);
  });

  it('returns an empty array for null input', () => {
    expect(filterVisibleOcc(null, guest)).toEqual([]);
  });
});

describe('getVisibilityLabel', () => {
  it('labels each visibility state', () => {
    expect(getVisibilityLabel({ visible_publicly: true })).toBe('Public');
    expect(getVisibilityLabel({ visible_publicly: false, visible_to_future_owners: true })).toBe('Owners Only');
    expect(getVisibilityLabel({ visible_publicly: false, visible_to_future_owners: false })).toBe('Private');
  });
});

describe('cycleVisibility', () => {
  it('cycles Public -> Owners Only -> Private -> Public', () => {
    const fromPublic = cycleVisibility({ visible_publicly: true });
    expect(fromPublic).toEqual({ visible_publicly: false, visible_to_future_owners: true });

    const fromOwners = cycleVisibility({ visible_publicly: false, visible_to_future_owners: true });
    expect(fromOwners).toEqual({ visible_publicly: false, visible_to_future_owners: false });

    const fromPrivate = cycleVisibility({ visible_publicly: false, visible_to_future_owners: false });
    expect(fromPrivate).toEqual({ visible_publicly: true, visible_to_future_owners: true });
  });
});
