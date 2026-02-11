import { supabase } from './client';

/**
 * Guitar data service — CRUD operations for the guitars (IE) table.
 * OCC (images, stories, etc.) is handled separately in occ.js.
 */

// Base select for guitar queries — includes owner info + OCC images
const GUITAR_SELECT = `
  *,
  owner:users!owner_id (
    id, username, display_name, avatar_url
  ),
  occ:owner_created_content (
    id, content_type, content_data, visible_publicly,
    visible_to_future_owners, position, creator_id
  )
`;

// Fetch a single guitar by ID (with owner + OCC images)
export async function getGuitar(id) {
  const { data, error } = await supabase
    .from('guitars')
    .select(GUITAR_SELECT)
    .eq('id', id)
    .eq('state', 'published')
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

// Fetch guitars with filters, pagination, and sorting
export async function getGuitars({
  page = 1,
  perPage = 20,
  brand,
  instrumentType,
  bodyStyle,
  yearMin,
  yearMax,
  search,
  sortBy = 'created_at',
  sortOrder = 'desc',
  ownerId,
} = {}) {
  let query = supabase
    .from('guitars')
    .select(GUITAR_SELECT, { count: 'exact' })
    .eq('state', 'published')
    .is('deleted_at', null);

  // Filters
  if (brand) query = query.ilike('brand', `%${brand}%`);
  if (instrumentType) query = query.eq('instrument_type', instrumentType);
  if (bodyStyle) query = query.eq('body_style', bodyStyle);
  if (yearMin) query = query.gte('year', yearMin);
  if (yearMax) query = query.lte('year', yearMax);
  if (ownerId) query = query.eq('owner_id', ownerId);

  // Full-text search
  if (search) {
    query = query.textSearch('search_vector', search, {
      type: 'websearch',
      config: 'english',
    });
  }

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    guitars: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

// Fetch primary image for a guitar (first public OCC image by position)
export async function getGuitarPrimaryImage(guitarId) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .select('content_data')
    .eq('ie_id', guitarId)
    .eq('content_type', 'image')
    .eq('visible_publicly', true)
    .eq('admin_hidden', false)
    .order('position', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data?.content_data?.url || null;
}

// Get distinct brands (for filter dropdowns)
export async function getBrands() {
  const { data, error } = await supabase
    .from('guitars')
    .select('brand')
    .eq('state', 'published')
    .is('deleted_at', null)
    .order('brand');

  if (error) throw error;
  // Deduplicate
  const unique = [...new Set(data.map((g) => g.brand))];
  return unique;
}

// Get guitar count by brand (for explore page stats)
export async function getGuitarCountByBrand() {
  const { data, error } = await supabase
    .rpc('get_guitar_counts_by_brand');

  // Fallback: if RPC doesn't exist, do client-side
  if (error) {
    const { data: guitars, error: err2 } = await supabase
      .from('guitars')
      .select('brand')
      .eq('state', 'published')
      .is('deleted_at', null);

    if (err2) throw err2;

    const counts = {};
    guitars.forEach((g) => {
      counts[g.brand] = (counts[g.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }

  return data;
}

// Create a new guitar
export async function createGuitar(guitarData) {
  const { data, error } = await supabase
    .from('guitars')
    .insert({
      ...guitarData,
      state: guitarData.state || 'draft',
      source: guitarData.source || 'manual',
    })
    .select(GUITAR_SELECT)
    .single();

  if (error) throw error;
  return data;
}

// Update a guitar (respects IA immutability — server enforces via trigger)
export async function updateGuitar(id, updates) {
  const { data, error } = await supabase
    .from('guitars')
    .update(updates)
    .eq('id', id)
    .select(GUITAR_SELECT)
    .single();

  if (error) throw error;
  return data;
}

// Soft delete a guitar
export async function deleteGuitar(id) {
  const { error } = await supabase
    .from('guitars')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
