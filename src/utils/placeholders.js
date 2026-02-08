/**
 * Image system for TWNG app.
 * Maps to actual files in twng-app/public/images/
 */

const generatePlaceholder = (color, label, width = 400, height = 300) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0C0A09;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <text x="50%" y="50%" font-size="14" font-family="sans-serif" fill="#888" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
};

// ============================================================
// Guitar Product Images (actual filenames in public/images/guitars/)
// ============================================================
export const GUITAR_IMAGES = {
  heritage_lp: "/images/guitars/shopping-1.webp",         // Heritage H-150 — honey burst close-up body
  heritage_full: "/images/guitars/shopping-3.webp",        // Heritage H-150 — full body product shot
  heritage_semi: "/images/guitars/shopping.webp",          // Heritage H-535 Semi-Hollow — cherry red
  heritage_closeup: "/images/guitars/shopping-1.webp",     // Heritage H-150 — close-up (same as body)
  nash_sunburst: "/images/guitars/nash-s57-1.jpg",         // Nash S-57 Heavy Relic — three-tone sunburst
  blue_strat: "/images/guitars/images.jpg",                // Nash-style Strat — Daphne Blue
  tele_relic: "/images/guitars/shopping-2.webp",           // Telecaster — heavy relic butterscotch (product)
  tele_product: "/images/guitars/shopping-2.webp",         // Telecaster — heavy relic butterscotch (product)
  suhr_green: "/images/guitars/download.webp",             // Suhr Classic S — Surf Green
  brian_may: "/images/guitars/images-1.jpg",               // Brian May BMG Special — cherry red
  red_strat: "/images/guitars/images-4.jpg",               // Squier Mini Strat — Torino Red
  yamaha_classical: "/images/guitars/images-2.jpg",        // Yamaha C40 Classical
  classical: "/images/guitars/images-3.jpg",               // Cordoba C5 Cedar Classical
};

// ============================================================
// Artist / Performer Images (actual filenames in public/images/artists/)
// ============================================================
export const ARTIST_IMAGES = {
  artist1: "/images/artists/download-1.jpg",   // Performer in sparkly top with Strat
  artist2: "/images/artists/download.jpg",     // Performer on stage, green lights
  artist3: "/images/artists/download-4.jpg",   // Performer with white Strat on stage
  artist4: "/images/artists/download-3.jpg",   // Female performer, blonde hair
  artist5: "/images/artists/download-2.jpg",   // Female guitarist with Les Paul
  artist6: "/images/artists/download-5.jpg",   // Performer in colorful outfit with Strat
};

// ============================================================
// Lifestyle / Hero / Background Images (actual filenames in public/images/lifestyle/)
// ============================================================
export const HERO_IMAGES = {
  hero_tele: "/images/lifestyle/Gemini_Generated_Image_i97zdai97zdai97z.png",   // Telecaster moody room
  hero_collection: "/images/lifestyle/Gemini_Generated_Image_qn85whqn85whqn85.png", // Collection room
};

// ============================================================
// Combined image map (matches the Homepage IMG keys)
// ============================================================
export const IMG = {
  heritage_lp: GUITAR_IMAGES.heritage_lp,
  heritage_full: GUITAR_IMAGES.heritage_full,
  nash_sunburst: GUITAR_IMAGES.nash_sunburst,
  tele_relic: GUITAR_IMAGES.tele_product,
  suhr_green: GUITAR_IMAGES.suhr_green,
  heritage_semi: GUITAR_IMAGES.heritage_semi,
  brian_may: GUITAR_IMAGES.brian_may,
  blue_strat: GUITAR_IMAGES.blue_strat,
  red_strat: GUITAR_IMAGES.red_strat,
  yamaha_classical: GUITAR_IMAGES.yamaha_classical,
  classical: GUITAR_IMAGES.classical,
  heritage_closeup: GUITAR_IMAGES.heritage_closeup,
  artist1: ARTIST_IMAGES.artist1,
  artist2: ARTIST_IMAGES.artist2,
  artist3: ARTIST_IMAGES.artist3,
  artist4: ARTIST_IMAGES.artist4,
  artist5: ARTIST_IMAGES.artist5,
  artist6: ARTIST_IMAGES.artist6,
  hero_tele: HERO_IMAGES.hero_tele,
  hero_collection: HERO_IMAGES.hero_collection,
  logo: "/images/twng-logo.svg",
};

// ============================================================
// User Avatar Generator (for mock profiles)
// ============================================================
export const generateAvatar = (name) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ["#D97706", "#059669", "#7C3AED", "#DC2626", "#0891B2", "#D946EF"];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
    <rect width="80" height="80" rx="40" fill="${color}"/>
    <text x="50%" y="50%" font-size="28" font-weight="600" font-family="sans-serif" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
};

export { generatePlaceholder };
