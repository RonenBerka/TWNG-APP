/**
 * Frontend implementation of the OCC display logic algorithm.
 * Mirrors the should_display_occ() PL/pgSQL function from the DB.
 *
 * Spec reference: Section 8 — Display Logic Algorithm
 */

/**
 * Determine if an OCC object should be displayed to the current viewer.
 *
 * @param {Object} occ - The OCC object
 * @param {string|null} occ.creator_id - User ID of who created this OCC
 * @param {boolean} occ.visible_publicly - Whether visible to everyone
 * @param {boolean} occ.visible_to_future_owners - Whether visible to current/future owners
 * @param {boolean} occ.admin_hidden - Whether force-hidden by admin
 *
 * @param {Object} context - Viewing context
 * @param {string|null} context.viewerId - Current logged-in user's ID (null for guests)
 * @param {string|null} context.ownerId - Current guitar owner's user ID
 * @param {boolean} context.showHistoricalContent - Guitar's show_historical_content setting
 *
 * @param {Object|null} creator - Creator's settings (if available)
 * @param {boolean} creator.do_not_show_in_others_ie - Creator's global opt-out flag
 *
 * @returns {boolean} Whether the OCC should be displayed
 */
export function shouldDisplayOcc(occ, context, creator = null) {
  // Step 0: Admin force-hide overrides everything
  if (occ.admin_hidden) return false;

  const { viewerId, ownerId, showHistoricalContent } = context;
  const creatorId = occ.creator_id || occ.created_by;

  // Creator always sees their own content
  if (viewerId && viewerId === creatorId) return true;

  // Step 1: Check creator's global "Do Not Show" setting
  if (creator?.do_not_show_in_others_ie && creatorId !== ownerId) {
    return false;
  }

  // Step 2: Check current owner's display preference for historical content
  if (showHistoricalContent === false && creatorId !== ownerId) {
    return false;
  }

  // Step 3: Apply visibility flags
  if (!viewerId) {
    // Guest — only see publicly visible content
    return !!occ.visible_publicly;
  }

  if (viewerId === ownerId) {
    // Current owner — sees publicly visible + future-owners content
    return !!(occ.visible_publicly || occ.visible_to_future_owners);
  }

  // Other logged-in user — only publicly visible
  return !!occ.visible_publicly;
}

/**
 * Filter a list of OCC objects through the visibility algorithm.
 */
export function filterVisibleOcc(occList, context, creatorsMap = {}) {
  return (occList || []).filter(occ => {
    const creatorId = occ.creator_id || occ.created_by;
    const creator = creatorsMap[creatorId] || null;
    return shouldDisplayOcc(occ, context, creator);
  });
}

/**
 * Get a human-readable label for the visibility state of an OCC item.
 */
export function getVisibilityLabel(occ) {
  if (occ.visible_publicly) return "Public";
  if (occ.visible_to_future_owners) return "Owners Only";
  return "Private";
}

/**
 * Get the next visibility state when cycling (for toggle button).
 * Public → Owners Only → Private → Public
 */
export function cycleVisibility(occ) {
  if (occ.visible_publicly) {
    return { visible_publicly: false, visible_to_future_owners: true };
  }
  if (occ.visible_to_future_owners) {
    return { visible_publicly: false, visible_to_future_owners: false };
  }
  return { visible_publicly: true, visible_to_future_owners: true };
}
