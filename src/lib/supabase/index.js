// Supabase client
export { supabase } from './client';

// Core data services
export * from './instruments';
export * from './forum';
export * from './comments';
export * from './collections';
export * from './articles';
export * from './claims';

// Users — export all except duplicates (getUserRoles, hasRole, searchUsers)
export {
  getProfile,
  getPublicProfile,
  updateProfile,
  getUserByUsername,
  searchUsers,
  getUserRoles,
  hasRole,
  getAdminUsers,
  updateUserRole,
} from './users';

// Admin — export all except homepage-related duplicates
export {
  getDashboardStats,
  getAdminInstruments,
  updateInstrumentModerationStatus,
  adminDeleteInstrument,
  getAdminLuthiers,
  verifyLuthier,
  getSystemSettings,
  updateSystemSetting,
  getAdminArticles,
  updateArticleStatus,
  getAdminForumThreads,
  toggleThreadLocked,
  getAdminTransfers,
  updateTransferStatus,
  getUnreadNotificationCount,
  getRecentActivity,
  getAdminGuitars,
  updateGuitarState,
  adminDeleteGuitar,
  getAuditLogs,
  getSystemConfig,
  updateSystemConfig,
  getAdminDiscussions,
  toggleDiscussionHidden,
  getPrivacyRequests,
  updatePrivacyRequest,
  getDuplicateMatches,
  saveHomepageBlocks,
} from './admin';

// Instrument-related
export * from './guitarCatalog';
export * from './timeline';
export * from './occ';

// Transfers — export all except searchUsers duplicate
export {
  initiateTransfer,
  getMyTransfers,
  getTransferDetails,
  respondToTransfer,
  cancelTransfer,
  getTransferHistory,
} from './transfers';

export * from './iaChangeRequests';
export * from './tags';

// Search
export * from './advancedSearch';
export * from './globalSearch';

// Social — follows exports blockUser/unblockUser/getBlockedUsers, skip those
export {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getFollowCounts,
} from './follows';

export * from './messaging';
export * from './notifications';
export * from './activityFeed';

// User features
export * from './userBadges';
export * from './userBlocks';
export * from './userFavorites';

// Roles — skip getUserRoles/hasRole (already from users.js)
export {
  assignRole,
  removeRole,
  getAllRoles,
  getUsersByRole,
} from './roles';

// Homepage / Config
export * from './homepage';
export {
  getHomepageSectionConfig,
  saveHomepageSectionConfig,
  saveHomepageTestimonials,
  saveHomepageStats,
} from './homepage';
// homepageBlocks — only unique exports (no overlap with homepage.js)
export { getActiveBlocks, getBlock, createBlock, updateBlock, deleteBlock, reorderBlocks } from './homepageBlocks';
export * from './systemSettings';

// Adapters (legacy compatibility)
export * from './adapters';
