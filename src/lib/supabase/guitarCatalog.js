import { supabase } from './client';

/**
 * Guitar Catalog service — queries the guitar_catalog reference table
 * for autocomplete suggestions and spec auto-fill.
 *
 * guitar_catalog columns:
 *   make, model, year, year_range, body_style, instrument_type,
 *   body_material, neck_joint, neck_profile, fretboard_material,
 *   fretboard_radius, pickup_config, bridge_type, tuners,
 *   finish_options (JSONB), specifications (JSONB), tags (JSONB),
 *   category, production_status, confidence
 */

/**
 * Search makes by prefix. Returns unique make names matching the query.
 * @param {string} query - The search prefix
 * @param {number} limit - Max results (default 15)
 * @returns {Promise<string[]>} Array of make names
 */
export async function searchBrands(query, limit = 15) {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from('guitar_catalog')
    .select('make')
    .ilike('make', `${query}%`)
    .order('make')
    .limit(100);

  if (error) {
    console.error('Error searching brands:', error);
    return [];
  }

  // Deduplicate make names
  const unique = [...new Set((data || []).map(r => r.make))];
  return unique.slice(0, limit);
}

/**
 * Search models for a given make. Returns matching model names.
 * @param {string} brand - The make to filter by
 * @param {string} query - The model search query (prefix match)
 * @param {number} limit - Max results (default 20)
 * @returns {Promise<Array>} Array of { model, year_range, body_style, category }
 */
export async function searchModels(brand, query = '', limit = 20) {
  if (!brand) return [];

  let q = supabase
    .from('guitar_catalog')
    .select('model, year, year_range, body_style, instrument_type, category')
    .ilike('make', brand);

  if (query && query.length > 0) {
    q = q.ilike('model', `%${query}%`);
  }

  const { data, error } = await q
    .order('model')
    .limit(limit);

  if (error) {
    console.error('Error searching models:', error);
    return [];
  }

  return data || [];
}

/**
 * Get full specs for a specific make + model combination.
 * Returns the catalog entry with all specifications for auto-fill.
 * @param {string} brand - Make name
 * @param {string} model - Model name
 * @returns {Promise<Object|null>} Full catalog entry or null
 */
export async function getModelSpecs(brand, model) {
  if (!brand || !model) return null;

  const { data, error } = await supabase
    .from('guitar_catalog')
    .select('*')
    .ilike('make', brand)
    .ilike('model', model)
    .limit(1)
    .single();

  if (error) {
    // Could be no match — not an error
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching model specs:', error);
    return null;
  }

  return data;
}

/**
 * Map a guitar_catalog record to AddGuitar form fields.
 * Extracts nested specifications JSON into flat form fields.
 * @param {Object} catalogEntry - A row from guitar_catalog
 * @returns {Object} Mapped form field values (only non-empty fields)
 */
export function mapCatalogToFormFields(catalogEntry) {
  if (!catalogEntry) return {};

  const fields = {};
  const specs = catalogEntry.specifications || {};

  // Direct mappings
  if (catalogEntry.year) fields.year = String(catalogEntry.year);
  if (catalogEntry.body_style) fields.bodyType = catalogEntry.body_style;
  if (catalogEntry.body_material) fields.bodyWood = catalogEntry.body_material;
  if (catalogEntry.fretboard_material) fields.fretboardWood = catalogEntry.fretboard_material;
  if (catalogEntry.neck_profile) fields.neckProfile = catalogEntry.neck_profile;
  if (catalogEntry.pickup_config) fields.pickupConfig = catalogEntry.pickup_config;
  if (catalogEntry.bridge_type) fields.bridgeType = catalogEntry.bridge_type;
  if (catalogEntry.tuners) fields.tuners = catalogEntry.tuners;

  // From specifications JSON
  if (specs.neck_material) fields.neckWood = specs.neck_material;
  if (specs.scale_length) fields.scaleLength = String(specs.scale_length).replace(/['"]/g, '');
  if (specs.num_frets) fields.frets = String(specs.num_frets);
  if (specs.hardware_finish) fields.hardwareFinish = specs.hardware_finish;
  if (specs.country_of_origin) fields.country = specs.country_of_origin;
  if (specs.pickups && typeof specs.pickups === 'string') fields.pickups = specs.pickups;
  if (specs.bridge && typeof specs.bridge === 'string') fields.bridgeModel = specs.bridge;
  if (specs.nut_material) fields.nutMaterial = specs.nut_material;
  if (specs.top_material) fields.topWood = specs.top_material;

  // Finish from finish_options (take first if array)
  if (catalogEntry.finish_options) {
    try {
      const finishes = typeof catalogEntry.finish_options === 'string'
        ? JSON.parse(catalogEntry.finish_options)
        : catalogEntry.finish_options;
      if (Array.isArray(finishes) && finishes.length > 0) {
        // Don't auto-fill finish — too many options. User should pick.
        // But we can store it for display.
        fields._availableFinishes = finishes;
      }
    } catch {
      // ignore parse errors
    }
  }

  return fields;
}

/**
 * Search the guitar catalog by make and/or model.
 * General search function for finding guitars in the catalog.
 * @param {string} query - Search query (make or model)
 * @param {number} limit - Max results (default 20)
 * @returns {Promise<Array>} Array of matching catalog entries
 */
export async function searchGuitarCatalog(query = '', limit = 20) {
  if (!query || query.length < 1) return [];

  const { data, error } = await supabase
    .from('guitar_catalog')
    .select('*')
    .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
    .order('make')
    .limit(limit);

  if (error) {
    console.error('Error searching guitar catalog:', error);
    return [];
  }

  return data || [];
}
