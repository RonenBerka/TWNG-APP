import { supabase } from './client';

/**
 * Timeline events service — CRUD for the timeline_events table.
 *
 * Tier model (enum timeline_tier):
 *   system_generated — Immutable system events (transfers, automated)
 *   user_reported_fact — Owner-created factual events (acquisition date, etc.)
 *   story_based — User stories and narratives
 *   verified_luthier — Verified luthier events
 *
 * Event types (enum timeline_event_type):
 *   system_introduced, system_ownership_transfer, user_manufacture_date,
 *   user_acquisition_date, user_modification, story, luthier_event
 *
 * Schema changes from previous version:
 * - guitar_id → instrument_id
 * - event_type: text → enum timeline_event_type
 * - tier: 0/1/2 (numbers) → enum timeline_tier (strings)
 * - media_urls → event_data (JSONB)
 * - Added: source_ia_history_id, source_luthier_event_id, source_occ_id, source_ownership_history_id
 * - Added: visible_publicly, visible_to_owners
 */

/**
 * Fetch all timeline events for an instrument, ordered by event_timestamp.
 */
export async function getTimelineEvents(instrumentId) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('instrument_id', instrumentId)
    .order('event_timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new timeline event.
 *
 * @param {Object} params - Event parameters
 * @param {string} params.instrumentId - Instrument UUID
 * @param {string} params.eventType - Event type (from timeline_event_type enum)
 * @param {string} params.tier - Event tier (from timeline_tier enum)
 * @param {string} params.title - Event title
 * @param {string} params.description - Event description
 * @param {Object} params.eventData - Optional JSONB event data (replaces mediaUrls)
 * @param {string} params.createdByUserId - User who created this event
 * @param {boolean} params.visiblePublicly - Public visibility (default: true)
 * @param {boolean} params.visibleToOwners - Visible to owners (default: true)
 */
export async function createTimelineEvent({
  instrumentId,
  eventType,
  tier,
  title,
  description = null,
  eventData = null,
  createdByUserId,
  visiblePublicly = true,
  visibleToOwners = true,
  eventTimestamp = new Date().toISOString(),
}) {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      instrument_id: instrumentId,
      event_type: eventType,
      tier,
      title,
      description,
      event_data: eventData,
      created_by_user_id: createdByUserId,
      event_timestamp: eventTimestamp,
      visible_publicly: visiblePublicly,
      visible_to_owners: visibleToOwners,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a timeline event. Only non-locked events can be updated.
 */
export async function updateTimelineEvent(eventId, updates) {
  const updatePayload = {};

  if (updates.title !== undefined) updatePayload.title = updates.title;
  if (updates.description !== undefined) updatePayload.description = updates.description;
  if (updates.eventData !== undefined) updatePayload.event_data = updates.eventData;
  if (updates.eventType !== undefined) updatePayload.event_type = updates.eventType;
  if (updates.visiblePublicly !== undefined) updatePayload.visible_publicly = updates.visiblePublicly;
  if (updates.visibleToOwners !== undefined) updatePayload.visible_to_owners = updates.visibleToOwners;
  if (updates.status !== undefined) updatePayload.status = updates.status;

  const { data, error } = await supabase
    .from('timeline_events')
    .update(updatePayload)
    .eq('id', eventId)
    .eq('is_locked', false)
    .select()
    // UPDATE with condition — may match 0 rows if locked
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Publish/unpublish a timeline event (change status from draft to published).
 */
export async function publishTimelineEvent(eventId, publish = true) {
  const { data, error } = await supabase
    .from('timeline_events')
    .update({ status: publish ? 'soft' : 'draft' })
    .eq('id', eventId)
    .eq('is_locked', false)
    .select()
    // UPDATE with condition — may match 0 rows if locked
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Delete a timeline event. Only non-locked, non-system-generated events can be deleted.
 */
export async function deleteTimelineEvent(eventId) {
  const { error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', eventId)
    .eq('is_locked', false)
    .neq('tier', 'system_generated');

  if (error) throw error;
}

/**
 * Link a timeline event to a source record (OCC, luthier event, etc.).
 */
export async function linkTimelineEventSource(eventId, sourceType, sourceId) {
  const updatePayload = {};

  switch (sourceType) {
    case 'occ':
      updatePayload.source_occ_id = sourceId;
      break;
    case 'luthier_event':
      updatePayload.source_luthier_event_id = sourceId;
      break;
    case 'ia_history':
      updatePayload.source_ia_history_id = sourceId;
      break;
    case 'ownership_history':
      updatePayload.source_ownership_history_id = sourceId;
      break;
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }

  const { data, error } = await supabase
    .from('timeline_events')
    .update(updatePayload)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
