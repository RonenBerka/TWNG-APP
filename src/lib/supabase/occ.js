import { supabase } from './client';

/**
 * OCC (Owner Created Content) service — CRUD for the owner_created_content table.
 *
 * Content types: text, image, video, audio, document
 * Visibility flags: visible_publicly, visible_to_owners
 *
 * Schema changes from previous version:
 * - ie_id → instrument_id
 * - content_data (JSONB) → split to content (text) + media_url (text)
 * - visible_to_future_owners → visible_to_owners
 * - Removed: position, admin_hidden columns
 * - Added: title, is_published fields
 */

/**
 * Fetch all OCC items for an instrument, unfiltered.
 * Visibility filtering should happen in the UI based on visible_publicly/visible_to_owners flags.
 */
export async function getOccForInstrument(instrumentId) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .select('*')
    .eq('instrument_id', instrumentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update visibility flags on a single OCC item.
 * Cycles: Public → Owners Only → Private → Public
 *
 * @param {string} occId - OCC item UUID
 * @param {object} visibility - { visible_publicly, visible_to_owners }
 */
export async function updateOccVisibility(occId, visibility) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .update({
      visible_publicly: visibility.visible_publicly,
      visible_to_owners: visibility.visible_to_owners,
    })
    .eq('id', occId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new OCC item.
 *
 * @param {Object} params - Creation parameters
 * @param {string} params.instrumentId - Instrument UUID
 * @param {string} params.ownerId - Owner/creator UUID
 * @param {string} params.contentType - Type: text, image, video, audio, document
 * @param {string} params.title - OCC title
 * @param {string} params.content - Text content (for text-based items)
 * @param {string} params.mediaUrl - URL to media file (for image/video/audio/document)
 * @param {boolean} params.isPublished - Published state (default: false)
 * @param {boolean} params.visiblePublicly - Public visibility (default: true)
 * @param {boolean} params.visibleToOwners - Visible to owners (default: true)
 */
export async function createOcc({
  instrumentId,
  ownerId,
  contentType,
  title,
  content = null,
  mediaUrl = null,
  isPublished = false,
  visiblePublicly = true,
  visibleToOwners = true,
}) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .insert({
      instrument_id: instrumentId,
      current_owner_id: ownerId,
      content_type: contentType,
      title,
      content,
      media_url: mediaUrl,
      is_published: isPublished,
      visible_publicly: visiblePublicly,
      visible_to_owners: visibleToOwners,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an OCC item.
 */
export async function deleteOcc(occId) {
  const { error } = await supabase
    .from('owner_created_content')
    .delete()
    .eq('id', occId);

  if (error) throw error;
}

/**
 * Update OCC content (text content and/or media URL).
 *
 * @param {string} occId - OCC item UUID
 * @param {Object} updates - Fields to update: { title, content, mediaUrl, isPublished }
 */
export async function updateOccContent(occId, updates) {
  const updatePayload = {};

  if (updates.title !== undefined) updatePayload.title = updates.title;
  if (updates.content !== undefined) updatePayload.content = updates.content;
  if (updates.mediaUrl !== undefined) updatePayload.media_url = updates.mediaUrl;
  if (updates.isPublished !== undefined) updatePayload.is_published = updates.isPublished;

  const { data, error } = await supabase
    .from('owner_created_content')
    .update(updatePayload)
    .eq('id', occId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Publish/unpublish an OCC item.
 */
export async function publishOcc(occId, isPublished = true) {
  const { data, error } = await supabase
    .from('owner_created_content')
    .update({ is_published: isPublished })
    .eq('id', occId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
