import { vi, describe, it, expect, beforeEach } from 'vitest';

// These tests exercise the Supabase service functions against a *fake* database.
// We replace ./client.js with a mock whose query builder is fully chainable and
// resolves to values we queue up per test. That lets us verify the real branching
// logic — validation, "already exists" short-circuits, error fallbacks, and
// empty-result handling — without any network. Deterministic, so no false alarms.

const h = vi.hoisted(() => {
  const queue = [];

  // A chainable, awaitable query builder. Every method returns the builder;
  // awaiting it pops the next queued result (or rejects if that result is an Error).
  const makeBuilder = () => {
    const b = {};
    const methods = [
      'select', 'insert', 'update', 'delete', 'upsert',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in',
      'contains', 'or', 'not', 'filter', 'match', 'order', 'range', 'limit',
      'single', 'maybeSingle', 'textSearch', 'overlaps',
    ];
    for (const m of methods) b[m] = vi.fn(() => b);
    b.then = (resolve, reject) => {
      const next = queue.length ? queue.shift() : { data: null, error: null };
      const p = next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
      return p.then(resolve, reject);
    };
    return b;
  };

  const supabase = {
    from: vi.fn(() => makeBuilder()),
    rpc: vi.fn(() => makeBuilder()),
    auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: null })) },
  };

  return { queue, supabase };
});

vi.mock('./client.js', () => ({ supabase: h.supabase, default: h.supabase }));

// Silence the deliberate console.error calls in the error-path tests.
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

import { supabase } from './client.js';
import { getUserRoles, hasRole, getAllRoles, getAdmins } from './roles.js';
import {
  addFavorite,
  isFavorited,
  getFavoriteCount,
  getUserFavorites,
  removeFavorite,
} from './userFavorites.js';

/** Queue the result(s) the next awaited query/queries will resolve to. */
const queueResults = (...results) => h.queue.push(...results);

beforeEach(() => {
  h.queue.length = 0;
  supabase.from.mockClear();
});

describe('roles service', () => {
  it('getAllRoles returns the fixed system roles (no DB call)', async () => {
    expect(await getAllRoles()).toEqual(['user', 'moderator', 'admin', 'luthier']);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('getUserRoles wraps a found user in an array', async () => {
    queueResults({ data: { id: 'u1', role: 'admin' }, error: null });
    expect(await getUserRoles('u1')).toEqual([{ id: 'u1', role: 'admin' }]);
    expect(supabase.from).toHaveBeenCalledWith('users');
  });

  it('getUserRoles returns an empty array when the user is missing', async () => {
    queueResults({ data: null, error: null });
    expect(await getUserRoles('nobody')).toEqual([]);
  });

  it('getUserRoles throws on a database error', async () => {
    queueResults({ data: null, error: new Error('db down') });
    await expect(getUserRoles('u1')).rejects.toThrow('db down');
  });

  it('hasRole is true only when the role matches', async () => {
    queueResults({ data: { id: 'u1', role: 'admin' }, error: null });
    expect(await hasRole('u1', 'admin')).toBe(true);

    queueResults({ data: { id: 'u1', role: 'user' }, error: null });
    expect(await hasRole('u1', 'admin')).toBe(false);
  });

  it('hasRole treats a not-found (PGRST116) rejection as false, not an error', async () => {
    const notFound = new Error('no rows');
    notFound.code = 'PGRST116';
    queueResults(notFound);
    expect(await hasRole('ghost', 'admin')).toBe(false);
  });

  it('getAdmins returns the rows, or an empty array when there are none', async () => {
    queueResults({ data: [{ id: 'a1' }, { id: 'a2' }], error: null });
    expect(await getAdmins()).toHaveLength(2);

    queueResults({ data: null, error: null });
    expect(await getAdmins()).toEqual([]);
  });
});

describe('userFavorites service', () => {
  it('addFavorite rejects an invalid target type before touching the DB', async () => {
    await expect(addFavorite('u1', 't1', 'banana')).rejects.toThrow(/Invalid favorite type/);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('addFavorite short-circuits and returns the existing favorite', async () => {
    queueResults({ data: { id: 'fav1' }, error: null }); // existing check finds one
    const result = await addFavorite('u1', 'i1', 'instrument');
    expect(result).toEqual({ id: 'fav1' });
    // only the existence check ran — no insert
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('addFavorite inserts a new favorite when none exists', async () => {
    queueResults(
      { data: null, error: null },              // no existing favorite
      { data: { id: 'fav-new' }, error: null }, // insert result
    );
    const result = await addFavorite('u1', 'i1', 'instrument');
    expect(result).toEqual({ id: 'fav-new' });
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });

  it('isFavorited reflects whether a row was found, and is false on error', async () => {
    queueResults({ data: { id: 'fav1' }, error: null });
    expect(await isFavorited('u1', 'i1', 'instrument')).toBe(true);

    queueResults({ data: null, error: null });
    expect(await isFavorited('u1', 'i1', 'instrument')).toBe(false);

    queueResults(new Error('boom')); // rejection → caught → false
    expect(await isFavorited('u1', 'i1', 'instrument')).toBe(false);
  });

  it('getFavoriteCount returns the count, 0 when null, and 0 on error', async () => {
    queueResults({ count: 7, error: null });
    expect(await getFavoriteCount('i1', 'instrument')).toBe(7);

    queueResults({ count: null, error: null });
    expect(await getFavoriteCount('i1', 'instrument')).toBe(0);

    queueResults({ count: null, error: new Error('x') }); // throws inside try → caught → 0
    expect(await getFavoriteCount('i1', 'instrument')).toBe(0);
  });

  it('getUserFavorites returns rows, or [] when empty', async () => {
    queueResults({ data: [{ id: 1 }], error: null });
    expect(await getUserFavorites('u1')).toHaveLength(1);

    queueResults({ data: null, error: null });
    expect(await getUserFavorites('u1', 'instrument')).toEqual([]);
  });

  it('removeFavorite resolves on success and throws on a DB error', async () => {
    queueResults({ error: null });
    await expect(removeFavorite('u1', 'i1', 'instrument')).resolves.toBeUndefined();

    queueResults({ error: new Error('delete failed') });
    await expect(removeFavorite('u1', 'i1', 'instrument')).rejects.toThrow('delete failed');
  });
});
