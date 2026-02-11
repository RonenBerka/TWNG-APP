import { supabase } from './client.js';

/**
 * Advanced search service — for searching instruments with complex filters.
 *
 * Provides functions to search the instruments table with various filters
 * including make, model, year range, condition, type, and more.
 */

/**
 * Search instruments with advanced filtering.
 * @param {Object} filters - Search filter criteria
 * @param {string} filters.query - Free-text search query
 * @param {string} filters.make - Instrument manufacturer/make
 * @param {string} filters.model - Instrument model
 * @param {number} filters.yearFrom - Minimum year
 * @param {number} filters.yearTo - Maximum year
 * @param {string} filters.condition - Instrument condition
 * @param {string} filters.type - Instrument type (e.g., 'acoustic_guitar')
 * @param {string} filters.visibility - Visibility filter ('public', 'all')
 * @param {Array<string>} filters.tags - Array of tag IDs to filter by
 * @param {string} filters.location - Geographic location
 * @param {number} filters.priceMin - Minimum price
 * @param {number} filters.priceMax - Maximum price
 * @param {Object} options - Query options
 * @param {number} options.offset - Number of results to skip
 * @param {number} options.limit - Number of results to return
 * @param {string} options.sortBy - Field to sort by (e.g., 'created_at', 'year')
 * @param {string} options.sortOrder - Sort direction ('asc' or 'desc')
 * @returns {Promise<Object>} Object with data array and count
 */
export async function searchInstruments(filters = {}, options = {}) {
  try {
    const {
      query = null,
      make = null,
      model = null,
      yearFrom = null,
      yearTo = null,
      condition = null,
      type = null,
      visibility = 'public',
      tags = null,
      location = null,
      priceMin = null,
      priceMax = null,
    } = filters;

    const {
      offset = 0,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    // Build dynamic query
    let queryBuilder = supabase
      .from('instruments')
      .select(`
        id,
        current_owner_id,
        make,
        model,
        year,
        description,
        main_image_url,
        is_featured,
        custom_fields,
        created_at,
        instrument_tags(tag_id, tags(name, slug))
      `, { count: 'exact' });

    // Apply filters
    if (visibility === 'public') {
      queryBuilder = queryBuilder.eq('is_featured', true);
    }

    if (make) {
      queryBuilder = queryBuilder.ilike('make', `%${make}%`);
    }

    if (model) {
      queryBuilder = queryBuilder.ilike('model', `%${model}%`);
    }

    if (yearFrom) {
      queryBuilder = queryBuilder.gte('year', yearFrom);
    }

    if (yearTo) {
      queryBuilder = queryBuilder.lte('year', yearTo);
    }

    if (condition) {
      queryBuilder = queryBuilder.eq('custom_fields->condition', `"${condition}"`);
    }

    if (type) {
      queryBuilder = queryBuilder.eq('custom_fields->type', `"${type}"`);
    }

    if (location) {
      queryBuilder = queryBuilder.ilike('custom_fields->location', `%${location}%`);
    }

    if (priceMin) {
      queryBuilder = queryBuilder.gte('custom_fields->price', priceMin);
    }

    if (priceMax) {
      queryBuilder = queryBuilder.lte('custom_fields->price', priceMax);
    }

    if (query) {
      // Full text search using description or make/model
      queryBuilder = queryBuilder.or(
        `make.ilike.%${query}%,model.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    // Apply sorting and pagination
    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      offset,
      limit,
    };
  } catch (error) {
    console.error('Error searching instruments:', error.message);
    throw error;
  }
}

/**
 * Get available instrument makes for filter dropdown.
 * @returns {Promise<Array>} Unique makes
 */
export async function getInstrumentMakes() {
  try {
    const { data, error } = await supabase
      .from('instruments')
      .select('make')
      .not('make', 'is', null)
      .order('make', { ascending: true });

    if (error) throw error;

    // Extract unique makes
    const makes = [...new Set(data.map(i => i.make))];
    return makes;
  } catch (error) {
    console.error('Error fetching instrument makes:', error.message);
    throw error;
  }
}

/**
 * Get available models for a specific make.
 * @param {string} make - The instrument make
 * @returns {Promise<Array>} Models for that make
 */
export async function getInstrumentModels(make) {
  try {
    const { data, error } = await supabase
      .from('instruments')
      .select('model')
      .eq('make', make)
      .not('model', 'is', null)
      .order('model', { ascending: true });

    if (error) throw error;

    // Extract unique models
    const models = [...new Set(data.map(i => i.model))];
    return models;
  } catch (error) {
    console.error('Error fetching instrument models:', error.message);
    throw error;
  }
}

/**
 * Get year range statistics for filtering.
 * @returns {Promise<Object>} Object with minYear and maxYear
 */
export async function getYearRange() {
  try {
    const { data: minData, error: minError } = await supabase
      .from('instruments')
      .select('year')
      .not('year', 'is', null)
      .order('year', { ascending: true })
      .limit(1);

    const { data: maxData, error: maxError } = await supabase
      .from('instruments')
      .select('year')
      .not('year', 'is', null)
      .order('year', { ascending: false })
      .limit(1);

    if (minError || maxError) throw minError || maxError;

    return {
      minYear: minData && minData.length > 0 ? minData[0].year : null,
      maxYear: maxData && maxData.length > 0 ? maxData[0].year : null,
    };
  } catch (error) {
    console.error('Error fetching year range:', error.message);
    throw error;
  }
}
