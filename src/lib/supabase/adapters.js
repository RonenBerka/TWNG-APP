/**
 * Data adapters — map Supabase row shapes to frontend component shapes.
 *
 * The DB schema uses snake_case and separates concerns (instruments + OCC),
 * while the frontend components expect a flattened shape with camelCase.
 * These adapters bridge that gap.
 *
 * Schema changes:
 * - guitars → instruments
 * - OCC fields: removed position, admin_hidden; added title, is_published
 * - OCC content_data split: content (text) + media_url (text)
 * - OCC visible_to_future_owners → visible_to_owners
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
 * Map a Supabase instrument row (with joined owner + OCC) to the
 * shape that ExploreGuitarCard and GuitarDetail expect.
 */
export function adaptInstrument(row) {
  if (!row) return null;

  // Extract primary image from OCC (content_type='image', media_url)
  const images = (row.occ || [])
    .filter((o) => o.content_type === 'image' && o.visible_publicly)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const primaryImage = images[0]?.media_url || brandPlaceholder(row.make);

  // Extract nickname (content_type=text, title='nickname' or infer from content)
  const nicknameOcc = (row.occ || []).find(
    (o) => o.content_type === 'text' && o.title === 'Nickname' && o.visible_publicly
  );

  // Extract story (content_type=text, title='story')
  const storyOcc = (row.occ || []).find(
    (o) => o.content_type === 'text' && o.title === 'Story' && o.visible_publicly
  );

  // Map to display label
  const bodyTypeMap = {
    solid: 'Solid Body',
    'semi-hollow': 'Semi-Hollow',
    hollow: 'Hollow',
    acoustic: 'Acoustic',
    classical: 'Classical',
    bass: 'Bass',
  };

  // Extract condition from custom_fields JSONB
  const condition = row.custom_fields?.condition || 'Not specified';

  // Raw OCC array for detail page visibility filtering
  const rawOcc = (row.occ || []).map((o) => ({
    id: o.id,
    contentType: o.content_type,
    title: o.title,
    content: o.content,
    mediaUrl: o.media_url,
    visible_publicly: o.visible_publicly,
    visible_to_owners: o.visible_to_owners,
    is_published: o.is_published,
    creator_id: o.current_owner_id,
  }));

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    serialNumber: row.serial_number,
    nickname: nicknameOcc?.content || null,
    story: storyOcc?.content || null,
    image: primaryImage,
    images: images.map((img) => ({
      id: img.id,
      url: img.media_url,
      alt: img.title || 'Instrument image',
    })),
    rawOcc,
    owner: row.current_owner
      ? {
          id: row.current_owner.id,
          username: row.current_owner.username,
          avatar: row.current_owner.avatar_url,
        }
      : null,
    uploader: row.uploader
      ? {
          id: row.uploader.id,
          username: row.uploader.username,
          avatar: row.uploader.avatar_url,
        }
      : null,
    description: row.description,
    mainImage: row.main_image_url,
    isFeatured: row.is_featured,
    isArchived: row.is_archived,
    moderationStatus: row.moderation_status,
    isForSale: row.is_for_sale,
    specs: row.specs || {},
    customFields: row.custom_fields || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Adapt a list of instrument rows.
 */
export function adaptInstruments(rows) {
  return (rows || []).map(adaptInstrument);
}

/**
 * Legacy function for backwards compatibility (guitar -> instrument)
 */
export function adaptGuitar(row) {
  return adaptInstrument(row);
}

/**
 * Legacy function for backwards compatibility
 */
export function adaptGuitars(rows) {
  return adaptInstruments(rows);
}
