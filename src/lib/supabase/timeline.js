import { supabase } from './client';

/**
 * Timeline events service — CRUD for the timeline_events table.
 *
 * Tier model:
 *   0 — Immutable system events (verifications, transfers, automated)
 *   1 — Owner-created editable events (repairs, mods, custom)
 *   2 — Special grace-period events (ownership start date override)
 */

/**
 * Fetch all timeline events for a guitar, ordered by event_date desc.
 */
export async function getTimelineEvents(guitarId) {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('guitar_id', guitarId)
    .order('event_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new timeline event (Tier 1 by default).
 */
export async function createTimelineEvent({
  guitarId,
  eventType = 'custom',
  title,
  description,
  eventDate,
  mediaUrls = [],
  tier = 1,
}) {
  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      guitar_id: guitarId,
      event_type: eventType,
      title,
      description,
      event_date: eventDate,
      media_urls: mediaUrls,
      tier,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a timeline event. Only Tier 1 events that are not locked.
 */
export async function updateTimelineEvent(eventId, updates) {
  const { data, error } = await supabase
    .from('timeline_events')
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.eventDate !== undefined && { event_date: updates.eventDate }),
      ...(updates.eventType !== undefined && { event_type: updates.eventType }),
      ...(updates.mediaUrls !== undefined && { media_urls: updates.mediaUrls }),
    })
    .eq('id', eventId)
    .eq('is_locked', false)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a timeline event. Only Tier 1 non-locked events can be deleted.
 * Tier 0 events cannot be deleted.
 */
export async function deleteTimelineEvent(eventId) {
  const { error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', eventId)
    .eq('is_locked', false)
    .neq('tier', 0);

  if (error) throw error;
}
