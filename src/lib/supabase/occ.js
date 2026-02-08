import { supabase } from './client';

/**
 * OCC (Owner Created Content) service — CRUD for the owner_created_content table.
 *
 * Content types: image, video, audio, story, nickname, document, receipt, timeline_event
 * Visibility flags: visible_publicly, visible_to_future_owners
 */

/**
 * Fetch all OCC items for a guitar (IE), unfiltered.
 * Visibility filtering should happen in the UI via shouldDisplayOcc().
 */
export async function getOccForGuitar(ieId) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .select('*')
    .eq('ie_id', ieId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Update visibility flags on a single OCC item.
 * Cycles: Public → Owners Only → Private → Public
 *
 * @param {string} occId - OCC item UUID
 * @param {object} visibility - { visible_publicly, visible_to_future_owners }
 */
export async function updateOccVisibility(occId, visibility) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .update({
      visible_publicly: visibility.visible_publicly,
      visible_to_future_owners: visibility.visible_to_future_owners,
    })
    .eq('id', occId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new OCC item.
 */
export async function createOcc({ ieId, contentType, contentData, visiblePublicly = true, visibleToFutureOwners = true, position = 0 }) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .insert({
      ie_id: ieId,
      content_type: contentType,
      content_data: contentData,
      visible_publicly: visiblePublicly,
      visible_to_future_owners: visibleToFutureOwners,
      position,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Soft-delete an OCC item.
 */
export async function deleteOcc(occId) {
  const { error } = await supabase
    .from('owner_created_content')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', occId);

  if (error) throw error;
}

/**
 * Update OCC content data (e.g. story text, nickname).
 */
export async function updateOccContent(occId, contentData) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .update({ content_data: contentData })
    .eq('id', occId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
