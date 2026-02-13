/**
 * Centralized route constants for the TWNG app.
 * Import these instead of hardcoding path strings in components.
 *
 * Static routes are plain strings. Dynamic routes have helper functions
 * that accept parameters and return the resolved path.
 */

// ── Static routes ────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  EXPLORE: '/explore',
  SEARCH: '/search',

  // Instruments
  INSTRUMENT_NEW: '/instrument/new',
  MY_INSTRUMENTS: '/my-instruments',

  // Collections
  COLLECTIONS: '/collections',
  COLLECTIONS_NEW: '/collections/new',
  MY_COLLECTIONS: '/my-collections',
  MY_FAVORITES: '/my-favorites',

  // Forum
  FORUM: '/forum',
  FORUM_NEW: '/forum/new',

  // Articles
  ARTICLES: '/articles',
  TAGS: '/tags',

  // Social
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',

  // Transfers
  TRANSFERS: '/transfers',

  // Tools
  DECODER: '/decoder',
  PRICE_EVALUATOR: '/tools/price-evaluator',
  BACKGROUND_REMOVAL: '/tools/background-removal',

  // Info pages
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  FOUNDING_MEMBERS: '/founding-members',
  COMMUNITY: '/community',

  // Settings & Admin
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADMIN_ARTICLE_NEW: '/admin/articles/new',
};

// ── Dynamic route helpers ────────────────────────────────────
/** @param {string} id */
export const instrumentPath = (id) => `/instrument/${id}`;

/** @param {string} username */
export const userPath = (username) => `/user/${username}`;

/** @param {string} id */
export const collectionPath = (id) => `/collections/${id}`;

/** @param {string} id */
export const collectionEditPath = (id) => `/collections/${id}/edit`;

/** @param {string} slug */
export const forumCategoryPath = (slug) => `/forum/category/${slug}`;

/** @param {string} id */
export const forumThreadPath = (id) => `/forum/thread/${id}`;

/** @param {string} id */
export const articlePath = (id) => `/articles/${id}`;

/** @param {string} instrumentId */
export const transferPath = (instrumentId) => `/transfer/${instrumentId}`;

/** @param {string} id */
export const adminArticleEditPath = (id) => `/admin/articles/edit/${id}`;

/** @param {string} page */
export const legalPath = (page) => `/legal/${page}`;
