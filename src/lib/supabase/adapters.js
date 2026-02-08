/**
 * Data adapters — map Supabase row shapes to frontend component shapes.
 *
 * The DB schema uses snake_case and separates concerns (IE + OCC),
 * while the frontend components expect a flattened shape with camelCase.
 * These adapters bridge that gap.
 */

import { GUITAR_IMAGES } from '../../utils/placeholders';

// Brand-specific placeholder images so every card looks different
const BRAND_IMAGE_MAP = {
  Heritage: GUITAR_IMAGES.heritage_lp,
  Nash: GUITAR_IMAGES.nash_sunburst,
  Fender: GUITAR_IMAGES.tele_relic,
  Suhr: GUITAR_IMAGES.suhr_green,
  'Brian May': GUITAR_IMAGES.brian_may,
  Gibson: GUITAR_IMAGES.heritage_semi,
  Martin: GUITAR_IMAGES.classical,
  PRS: GUITAR_IMAGES.heritage_full,
  Yamaha: GUITAR_IMAGES.yamaha_classical,
  Cordoba: GUITAR_IMAGES.classical,
  Gretsch: GUITAR_IMAGES.heritage_semi,
  Epiphone: GUITAR_IMAGES.heritage_lp,
  Ibanez: GUITAR_IMAGES.heritage_full,
  Taylor: GUITAR_IMAGES.classical,
  Rickenbacker: GUITAR_IMAGES.heritage_semi,
  ESP: GUITAR_IMAGES.heritage_full,
  Jackson: GUITAR_IMAGES.heritage_full,
  Squier: GUITAR_IMAGES.blue_strat,
};

// Generic fallback when brand isn't in the map
const FALLBACK_IMAGE = GUITAR_IMAGES.heritage_lp;

/**
 * Pick a placeholder image based on brand name.
 */
function brandPlaceholder(brand) {
  return BRAND_IMAGE_MAP[brand] || FALLBACK_IMAGE;
}

/**
 * Map a Supabase guitar row (with joined owner + OCC) to the
 * shape that ExploreGuitarCard and GuitarDetail expect.
 */
export function adaptGuitar(row) {
  if (!row) return null;

  // Extract primary image from OCC
  const images = (row.occ || [])
    .filter((o) => o.content_type === 'image' && o.visible_publicly)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const primaryImage = images[0]?.content_data?.url
    || images[0]?.content_data?.thumbnail_url
    || brandPlaceholder(row.brand);

  // Extract nickname and story from OCC
  const nicknameOcc = (row.occ || []).find(
    (o) => o.content_type === 'nickname' && o.visible_publicly
  );
  const storyOcc = (row.occ || []).find(
    (o) => o.content_type === 'story' && o.visible_publicly
  );

  // Map body_style to display label
  const bodyTypeMap = {
    solid: 'Solid Body',
    'semi-hollow': 'Semi-Hollow',
    hollow: 'Hollow',
    acoustic: 'Acoustic',
    classical: 'Classical',
    bass: 'Bass',
  };

  // Extract condition from specs JSONB
  const condition = row.specifications?.condition || 'Not specified';

  // Raw OCC array for detail page visibility filtering
  const rawOcc = (row.occ || []).map((o) => ({
    id: o.id,
    contentType: o.content_type,
    contentData: o.content_data,
    visible_publicly: o.visible_publicly,
    visible_to_future_owners: o.visible_to_future_owners,
    admin_hidden: o.admin_hidden,
    creator_id: o.creator_id,
    position: o.position,
  }));

  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    serialNumber: row.serial_number,
    nickname: nicknameOcc?.content_data?.name || null,
    story: storyOcc?.content_data?.text || null,
    image: primaryImage,
    images: images.map((img) => ({
      id: img.id,
      url: img.content_data?.url,
      thumbnail: img.content_data?.thumbnail_url,
      alt: img.content_data?.alt_text,
    })),
    rawOcc,
    owner: row.owner
      ? {
          handle: row.owner.username,
          displayName: row.owner.display_name,
          avatar: row.owner.avatar_url,
        }
      : null,
    verified: row.source === 'automation' || row.specifications?.verified === true,
    bodyType: bodyTypeMap[row.body_style] || row.body_style || 'Unknown',
    instrumentType: row.instrument_type,
    condition,
    finish: row.finish,
    specs: {
      body: row.specifications?.body_material || null,
      neck: row.specifications?.neck_material || null,
      fretboard: row.specifications?.fretboard || null,
      pickups: row.specifications?.pickups || null,
      bridge: row.specifications?.bridge || null,
      tuners: row.specifications?.tuners || null,
      finish: row.finish || null,
      weight: row.specifications?.weight || null,
      scale: row.specifications?.scale_length || null,
    },
    tags: row.specifications?.tags || [],
    state: row.state,
    source: row.source,
    ownerId: row.owner_id,
    iaGracePeriodEnds: row.ia_grace_period_ends,
    iaLockedAt: row.ia_locked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Adapt a list of guitar rows.
 */
export function adaptGuitars(rows) {
  return (rows || []).map(adaptGuitar);
}
