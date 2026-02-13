import { supabase } from './client';

/**
 * Instrument Attributes History service — for tracking and requesting spec changes.
 *
 * When an attribute grace period has expired, owners can request changes.
 * The system tracks all changes with change_type, is_locked, and grace_period_ends_at.
 *
 * Table: instrument_attributes_history
 *
 * Schema changes from previous version:
 * - guitar_id → instrument_id
 * - requested_by → changed_by_user_id
 * - status → change_type (create, update, delete) + is_locked + grace_period_ends_at
 * - Table: ia_change_requests → instrument_attributes_history
 */

/**
 * Submit a change request for an instrument attribute.
 * This creates an entry in instrument_attributes_history.
 */
export async function submitAttributeChange({
  instrumentId,
  fieldName,
  oldValue,
  newValue,
  changeReason = null,
  changedByUserId,
}) {
  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .insert({
      instrument_id: instrumentId,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      change_reason: changeReason,
      changed_by_user_id: changedByUserId,
      change_type: 'update',
      is_locked: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all attribute changes for an instrument.
 */
export async function getAttributeHistory(instrumentId) {
  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .select('*')
    .eq('instrument_id', instrumentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get unlocked attribute changes (pending review).
 */
export async function getPendingAttributeChanges(instrumentId = null) {
  let query = supabase
    .from('instrument_attributes_history')
    .select(`
      *,
      instrument:instrument_id ( id, make, model, year ),
      user:changed_by_user_id ( id, username )
    `)
    .eq('is_locked', false);

  if (instrumentId) {
    query = query.eq('instrument_id', instrumentId);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Lock an attribute change (after grace period or manual decision).
 */
export async function lockAttributeChange(changeId) {
  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .update({ is_locked: true })
    .eq('id', changeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Set grace period for an attribute change.
 *
 * @param {string} changeId - Change record UUID
 * @param {number} daysUntilLocked - Number of days until auto-locked
 */
export async function setGracePeriod(changeId, daysUntilLocked = 30) {
  const gracePeriodEnds = new Date();
  gracePeriodEnds.setDate(gracePeriodEnds.getDate() + daysUntilLocked);

  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .update({ grace_period_ends_at: gracePeriodEnds.toISOString() })
    .eq('id', changeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an attribute change record.
 */
export async function updateAttributeChange(changeId, updates) {
  const updatePayload = {};

  if (updates.newValue !== undefined) updatePayload.new_value = updates.newValue;
  if (updates.changeReason !== undefined) updatePayload.change_reason = updates.changeReason;
  if (updates.changeType !== undefined) updatePayload.change_type = updates.changeType;
  if (updates.isLocked !== undefined) updatePayload.is_locked = updates.isLocked;
  if (updates.gracePeriodEndsAt !== undefined) updatePayload.grace_period_ends_at = updates.gracePeriodEndsAt;

  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .update(updatePayload)
    .eq('id', changeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Apply a change to the instrument attributes.
 * This should typically be called after grace period expires or admin approval.
 */
export async function applyAttributeChange(changeId) {
  // READ by ID — row may not exist
  const { data: change, error: fetchErr } = await supabase
    .from('instrument_attributes_history')
    .select('*')
    .eq('id', changeId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;

  // Apply the change to the instrument
  const updatePayload = {};
  const specFields = ['body_material', 'neck_material', 'fretboard', 'scale_length', 'pickups', 'bridge', 'tuners', 'weight'];

  if (specFields.includes(change.field_name)) {
    // Spec field — need to update specs JSONB
    // READ by ID — row may not exist
    const { data: instrument } = await supabase
      .from('instruments')
      .select('specs')
      .eq('id', change.instrument_id)
      .maybeSingle();

    const specs = instrument?.specs || {};
    specs[change.field_name] = change.new_value;
    updatePayload.specs = specs;
  } else {
    // Top-level field
    updatePayload[change.field_name] = change.new_value;
  }

  const { error: updateErr } = await supabase
    .from('instruments')
    .update(updatePayload)
    .eq('id', change.instrument_id);

  if (updateErr) throw updateErr;

  // Mark change as locked (applied)
  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .update({ is_locked: true })
    .eq('id', changeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject an attribute change.
 */
export async function rejectAttributeChange(changeId) {
  const { data, error } = await supabase
    .from('instrument_attributes_history')
    .update({ is_locked: true })
    .eq('id', changeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Legacy alias for getPendingAttributeChanges.
 * Kept for backward compatibility with Admin.jsx.
 */
export async function getPendingChangeRequests() {
  return getPendingAttributeChanges();
}

/**
 * Legacy alias for applyAttributeChange.
 * Approve a change request by applying the change.
 */
export async function approveChangeRequest(changeId) {
  return applyAttributeChange(changeId);
}

/**
 * Legacy alias for rejectAttributeChange.
 * Deny a change request.
 */
export async function denyChangeRequest(changeId) {
  return rejectAttributeChange(changeId);
}
