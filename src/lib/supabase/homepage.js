/**
 * Homepage data service — fetches live data for all homepage sections.
 * Falls back to null/empty so the homepage can use its local defaults.
 */

import { supabase } from './client';

// The same GUITAR_SELECT used in guitars.js — includes owner + OCC images
const HOMEPAGE_GUITAR_SELECT = `
  id, brand, model, year, nickname, story, tags, state,
  owner:users!owner_id (id, username, display_name, avatar_url),
  occ:owner_created_content (id, content_type, content_data, visible_publicly, position)
`;

// ─── Featured Guitars ─────────────────────────────
// Fetches guitars whose IDs are in the admin-configured list,
// OR falls back to verified guitars ordered by created_at.
export async function getFeaturedGuitars(configuredIds = null) {
  try {
    if (configuredIds && configuredIds.length > 0) {
      // Admin has hand-picked specific guitars
      const { data, error } = await supabase
        .from('guitars')
        .select(HOMEPAGE_GUITAR_SELECT)
        .in('id', configuredIds)
        .eq('state', 'published')
        .is('deleted_at', null);
      if (error) throw error;
      // Sort by the order the admin specified
      const idOrder = new Map(configuredIds.map((id, i) => [id, i]));
      return (data || []).sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
    }

    // Default: top 8 published guitars, prefer verified
    const { data, error } = await supabase
      .from('guitars')
      .select(HOMEPAGE_GUITAR_SELECT)
      .eq('state', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) throw error;
    // Put verified first
    return (data || []).sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
  } catch (err) {
    console.error('getFeaturedGuitars error:', err);
    return null; // caller will use fallback data
  }
}

// ─── Recently Added ───────────────────────────────
export async function getRecentlyAdded(limit = 8) {
  try {
    const { data, error } = await supabase
      .from('guitars')
      .select('id, brand, model, year, owner:users!owner_id (id, username, display_name), occ:owner_created_content (id, content_type, content_data, visible_publicly, position)')
      .eq('state', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('getRecentlyAdded error:', err);
    return null;
  }
}

// ─── Brand Stats ──────────────────────────────────
export async function getTopBrands(limit = 8) {
  try {
    // Try RPC first
    const { data, error } = await supabase.rpc('get_guitar_counts_by_brand');
    if (!error && data) {
      return data
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(b => ({ name: b.brand, count: b.count }));
    }

    // Fallback: client-side count
    const { data: guitars, error: err2 } = await supabase
      .from('guitars')
      .select('brand')
      .eq('state', 'published')
      .is('deleted_at', null);
    if (err2) throw err2;

    const counts = {};
    (guitars || []).forEach(g => { counts[g.brand] = (counts[g.brand] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  } catch (err) {
    console.error('getTopBrands error:', err);
    return null;
  }
}

// ─── Published Articles ──────────────────────────
export async function getHomepageArticles(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, author, read_time, category, cover_image_url, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('getHomepageArticles error:', err);
    return null;
  }
}

// ─── Testimonials ────────────────────────────────
// Reads from system_config key 'homepage_testimonials'
export async function getHomepageTestimonials() {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'homepage_testimonials')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value?.testimonials || null;
  } catch (err) {
    console.error('getHomepageTestimonials error:', err);
    return null;
  }
}

// ─── Stats Overrides ─────────────────────────────
// Reads admin-configured stat overrides or computes live counts
export async function getHomepageStats() {
  try {
    // First check for admin overrides
    const { data: configData, error: configErr } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'homepage_stats')
      .single();

    if (!configErr && configData?.value?.stats) {
      return configData.value.stats; // admin has set custom values
    }

    // Otherwise compute from live data
    const [guitarsRes, usersRes, brandsRes] = await Promise.all([
      supabase.from('guitars').select('id', { count: 'exact', head: true }).eq('state', 'published').is('deleted_at', null),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('guitars').select('brand').eq('state', 'published').is('deleted_at', null),
    ]);

    const uniqueBrands = new Set((brandsRes.data || []).map(g => g.brand)).size;

    return {
      guitars: guitarsRes.count ?? 0,
      collectors: usersRes.count ?? 0,
      brands: uniqueBrands,
    };
  } catch (err) {
    console.error('getHomepageStats error:', err);
    return null;
  }
}

// ─── Homepage Section Content Config ─────────────
// Reads per-section content settings from system_config
export async function getHomepageSectionConfig() {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'homepage_section_config')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || null;
  } catch (err) {
    console.error('getHomepageSectionConfig error:', err);
    return null;
  }
}

// ─── Save Homepage Section Config ────────────────
export async function saveHomepageSectionConfig(config, userId) {
  const { data, error } = await supabase
    .from('system_config')
    .upsert({
      key: 'homepage_section_config',
      value: config,
      description: 'Per-section content configuration for homepage',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Save Homepage Testimonials ──────────────────
export async function saveHomepageTestimonials(testimonials, userId) {
  const { data, error } = await supabase
    .from('system_config')
    .upsert({
      key: 'homepage_testimonials',
      value: { testimonials },
      description: 'Homepage testimonials content',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Save Homepage Stats Overrides ───────────────
export async function saveHomepageStats(stats, userId) {
  const { data, error } = await supabase
    .from('system_config')
    .upsert({
      key: 'homepage_stats',
      value: { stats },
      description: 'Homepage stats bar overrides',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
