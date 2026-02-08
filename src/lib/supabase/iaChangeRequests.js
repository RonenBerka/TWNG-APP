import { supabase } from './client';

/**
 * IA Change Request service — for requesting spec changes after grace period.
 *
 * When the grace period has expired, owners can submit a change request
 * that goes to admin review. Status: pending → locked | admin_override.
 */

/**
 * Submit a change request for a locked IA field.
 */
export async function submitChangeRequest({ guitarId, fieldName, oldValue, newValue }) {
  const { data, error } = await supabase
    .from('ia_change_requests')
    .insert({
      guitar_id: guitarId,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all change requests for a guitar.
 */
export async function getChangeRequests(guitarId) {
  const { data, error } = await supabase
    .from('ia_change_requests')
    .select('*')
    .eq('guitar_id', guitarId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all pending change requests (admin view).
 */
export async function getPendingChangeRequests() {
  const { data, error } = await supabase
    .from('ia_change_requests')
    .select(`
      *,
      guitar:guitars!guitar_id ( id, brand, model, year ),
      requester:users!requested_by ( id, username, display_name )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Admin: approve a change request (applies the change).
 */
export async function approveChangeRequest(requestId) {
  // Get the request
  const { data: req, error: fetchErr } = await supabase
    .from('ia_change_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchErr) throw fetchErr;

  // Apply the change to the guitar
  const updatePayload = {};
  const specFields = ['body_material', 'neck_material', 'fretboard', 'scale_length', 'pickups', 'bridge', 'tuners', 'weight'];

  if (specFields.includes(req.field_name)) {
    // Spec field — need to update specifications JSONB
    const { data: guitar } = await supabase
      .from('guitars')
      .select('specifications')
      .eq('id', req.guitar_id)
      .single();

    const specs = guitar?.specifications || {};
    specs[req.field_name] = req.new_value;
    updatePayload.specifications = specs;
  } else {
    // Top-level field (finish, condition, etc.)
    updatePayload[req.field_name] = req.new_value;
  }

  const { error: updateErr } = await supabase
    .from('guitars')
    .update(updatePayload)
    .eq('id', req.guitar_id);

  if (updateErr) throw updateErr;

  // Mark request as approved
  const { data, error } = await supabase
    .from('ia_change_requests')
    .update({ status: 'admin_override', locked_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: deny a change request.
 */
export async function denyChangeRequest(requestId) {
  const { data, error } = await supabase
    .from('ia_change_requests')
    .update({ status: 'locked', locked_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
