import { supabase } from './client';

/**
 * Instrument data service — CRUD operations for the instruments table.
 * Replaces the legacy guitars table.
 * Images are stored via main_image_url field.
 * Sensitive details (serial numbers) are in instrument_sensitive_details table.
 */

// Base select for instrument queries — includes owner info + sensitive details
const INSTRUMENT_SELECT = `
  *,
  current_owner:users!current_owner_id (
    id, username, avatar_url
  ),
  uploader:users!uploader_id (
    id, username, avatar_url
  ),
  instrument_sensitive_details (
    serial_number, serial_number_is_locked, serial_number_grace_period_ends_at
  )
`;

/**
 * Fetch a single instrument by ID (with owner + sensitive details)
 */
export async function getInstrument(id) {
  const { data, error } = await supabase
    .from('instruments')
    .select(INSTRUMENT_SELECT)
    .eq('id', id)
    .eq('moderation_status', 'approved')
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch instruments with filters, pagination, and sorting
 */
export async function getInstruments({
  page = 1,
  perPage = 20,
  make,
  model,
  yearMin,
  yearMax,
  search,
  sortBy = 'created_at',
  sortOrder = 'desc',
  ownerId,
  visibility = 'public',
  archived = false,
} = {}) {
  let query = supabase
    .from('instruments')
    .select(INSTRUMENT_SELECT, { count: 'exact' })
    .eq('moderation_status', 'approved')
    .is('deleted_at', null);

  // Filter archived status
  if (!archived) {
    query = query.eq('is_archived', false);
  }

  // Filters
  if (make) query = query.ilike('make', `%${make}%`);
  if (model) query = query.ilike('model', `%${model}%`);
  if (yearMin) query = query.gte('year', yearMin);
  if (yearMax) query = query.lte('year', yearMax);
  if (ownerId) query = query.eq('current_owner_id', ownerId);

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
    instruments: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

/**
 * Fetch primary image URL for an instrument
 * Images are stored in the main_image_url field
 */
export async function getInstrumentPrimaryImage(instrumentId) {
  const { data, error } = await supabase
    .from('instruments')
    .select('main_image_url')
    .eq('id', instrumentId)
    .eq('moderation_status', 'approved')
    .is('deleted_at', null)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data?.main_image_url || null;
}

/**
 * Get distinct makes (for filter dropdowns)
 */
export async function getMakes() {
  const { data, error } = await supabase
    .from('instruments')
    .select('make')
    .eq('moderation_status', 'approved')
    .is('deleted_at', null)
    .eq('is_archived', false)
    .order('make');

  if (error) throw error;
  // Deduplicate and filter out nulls
  const unique = [...new Set(data.map((i) => i.make).filter(Boolean))];
  return unique;
}

/**
 * Get instrument count by make (for explore page stats)
 */
export async function getInstrumentCountByMake() {
  const { data, error } = await supabase
    .rpc('get_instrument_counts_by_make');

  // Fallback: if RPC doesn't exist, do client-side aggregation
  if (error) {
    const { data: instruments, error: err2 } = await supabase
      .from('instruments')
      .select('make')
      .eq('moderation_status', 'approved')
      .is('deleted_at', null)
      .eq('is_archived', false);

    if (err2) throw err2;

    const counts = {};
    instruments.forEach((i) => {
      if (i.make) {
        counts[i.make] = (counts[i.make] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count);
  }

  return data;
}

/**
 * Create a new instrument
 */
export async function createInstrument(instrumentData) {
  const { data, error } = await supabase
    .from('instruments')
    .insert({
      ...instrumentData,
      moderation_status: instrumentData.moderation_status || 'pending',
    })
    .select(INSTRUMENT_SELECT)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an instrument
 * Instrument attributes may be locked via grace periods enforced by server triggers
 */
export async function updateInstrument(id, updates) {
  const { data, error } = await supabase
    .from('instruments')
    .update(updates)
    .eq('id', id)
    .select(INSTRUMENT_SELECT)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Archive an instrument (soft delete via is_archived flag)
 */
export async function archiveInstrument(id) {
  const { error } = await supabase
    .from('instruments')
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get serial number for an instrument (from sensitive_details table)
 */
export async function getInstrumentSerialNumber(instrumentId) {
  const { data, error } = await supabase
    .from('instrument_sensitive_details')
    .select('serial_number, serial_number_is_locked, serial_number_grace_period_ends_at')
    .eq('instrument_id', instrumentId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

/**
 * Update serial number in sensitive_details table
 */
export async function updateInstrumentSerialNumber(instrumentId, serialNumber) {
  const { data, error } = await supabase
    .from('instrument_sensitive_details')
    .upsert({
      instrument_id: instrumentId,
      serial_number: serialNumber,
    }, {
      onConflict: 'instrument_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
