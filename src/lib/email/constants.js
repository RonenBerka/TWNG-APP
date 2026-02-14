/**
 * Email configuration constants — single source of truth.
 * Change EMAIL_FROM here when twng.com domain is verified in Resend.
 */

export const EMAIL_FROM = 'TWNG <onboarding@resend.dev>';
export const EMAIL_REPLY_TO = 'support@twng.com';
export const EMAIL_BASE_URL = typeof window !== 'undefined'
  ? window.location.origin
  : (import.meta.env.VITE_BASE_URL || 'https://twng.com');
