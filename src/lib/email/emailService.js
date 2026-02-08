/**
 * TWNG Email Service
 * Handles sending emails via configurable provider
 * Supports: Resend (recommended), SendGrid, Supabase Edge Functions
 *
 * Database Schema (Migration):
 *
 * CREATE TABLE email_queue (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *   to_email VARCHAR(255) NOT NULL,
 *   sequence_key VARCHAR(50),
 *   email_key VARCHAR(50),
 *   subject VARCHAR(500),
 *   html TEXT,
 *   text_content TEXT,
 *   variables JSONB DEFAULT '{}',
 *   status VARCHAR(20) DEFAULT 'pending',
 *   send_at TIMESTAMPTZ NOT NULL,
 *   sent_at TIMESTAMPTZ,
 *   error TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX idx_email_queue_status_send_at ON email_queue(status, send_at);
 *
 * CREATE TABLE email_preferences (
 *   user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 *   marketing_emails BOOLEAN DEFAULT TRUE,
 *   sequence_emails BOOLEAN DEFAULT TRUE,
 *   notification_emails BOOLEAN DEFAULT TRUE,
 *   unsubscribed_at TIMESTAMPTZ,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

import { supabase } from '../supabase/client';
import { emailTemplates } from './templates';

// Provider configuration — set via system_config or env
const EMAIL_CONFIG = {
  provider: import.meta.env.VITE_EMAIL_PROVIDER || 'resend', // 'resend' | 'sendgrid' | 'supabase'
  from: import.meta.env.VITE_EMAIL_FROM || 'TWNG <hello@twng.com>',
  replyTo: import.meta.env.VITE_EMAIL_REPLY_TO || 'support@twng.com',
  resendApiKey: import.meta.env.VITE_RESEND_API_KEY,
  sendgridApiKey: import.meta.env.VITE_SENDGRID_API_KEY,
  baseUrl: typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_BASE_URL || 'https://twng.com'),
};

/**
 * Core send function
 * Sends an email via configured provider and logs to email_log table
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} [options.text] - Plain text email body
 * @param {string} [options.userId] - User ID for tracking
 * @param {string[]} [options.tags] - Email tags for analytics
 * @returns {Promise<{success: boolean, messageId: string, error: string}>}
 */
export async function sendEmail({ to, subject, html, text, userId, tags = [] }) {
  try {
    // Check if user has unsubscribed
    if (userId) {
      const unsubscribed = await isUnsubscribed(to);
      if (unsubscribed) {
        console.warn(`[Email] User ${userId} is unsubscribed, skipping email to ${to}`);
        return { success: false, error: 'User unsubscribed', messageId: null };
      }
    }

    let result;
    switch (EMAIL_CONFIG.provider) {
      case 'resend':
        result = await sendViaResend({ to, subject, html, text, tags });
        break;
      case 'sendgrid':
        result = await sendViaSendGrid({ to, subject, html, text, tags });
        break;
      case 'supabase':
        result = await sendViaSupabaseFunction({ to, subject, html, text, tags });
        break;
      default:
        throw new Error(`Unknown email provider: ${EMAIL_CONFIG.provider}`);
    }

    // Log to email_log table
    if (userId || to) {
      await supabase
        .from('email_log')
        .insert({
          user_id: userId,
          to_email: to,
          subject,
          provider: EMAIL_CONFIG.provider,
          status: result.success ? 'sent' : 'failed',
          message_id: result.messageId,
          error: result.error,
          tags: tags,
          sent_at: new Date().toISOString(),
        });
    }

    return result;
  } catch (error) {
    console.error('[Email] Send failed:', error);
    return { success: false, messageId: null, error: error.message };
  }
}

/**
 * Send email via Resend provider
 * @private
 */
async function sendViaResend({ to, subject, html, text, tags }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EMAIL_CONFIG.resendApiKey}`,
    },
    body: JSON.stringify({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text: text || stripHtmlTags(html),
      reply_to: EMAIL_CONFIG.replyTo,
      tags: tags.map(tag => ({ name: tag })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${error.message}`);
  }

  const data = await response.json();
  return { success: true, messageId: data.id, error: null };
}

/**
 * Send email via SendGrid provider
 * @private
 */
async function sendViaSendGrid({ to, subject, html, text, tags }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EMAIL_CONFIG.sendgridApiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: EMAIL_CONFIG.from },
      subject,
      content: [
        { type: 'text/html', value: html },
        { type: 'text/plain', value: text || stripHtmlTags(html) },
      ],
      reply_to: { email: EMAIL_CONFIG.replyTo },
      categories: tags,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`SendGrid API error: ${error.errors?.[0]?.message || 'Unknown error'}`);
  }

  const messageId = response.headers.get('x-message-id');
  return { success: true, messageId, error: null };
}

/**
 * Send email via Supabase Edge Function
 * Assumes you have a Supabase Edge Function at `supabase/functions/send-email`
 * @private
 */
async function sendViaSupabaseFunction({ to, subject, html, text, tags }) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to,
      subject,
      html,
      text: text || stripHtmlTags(html),
      replyTo: EMAIL_CONFIG.replyTo,
      tags,
    },
  });

  if (error) {
    throw error;
  }

  return { success: true, messageId: data?.messageId, error: null };
}

/**
 * Schedule an email for later (for sequences)
 * Inserts into email_queue table with send_at timestamp
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.userId - User ID
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - Plain text body
 * @param {Date|string} options.sendAt - When to send
 * @param {string} [options.sequenceKey] - Sequence identifier
 * @param {string} [options.emailKey] - Email within sequence
 * @param {Object} [options.variables] - Template variables
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function scheduleEmail({
  to,
  userId,
  subject,
  html,
  text,
  sendAt,
  sequenceKey,
  emailKey,
  variables = {},
}) {
  try {
    const sendAtDate = sendAt instanceof Date ? sendAt.toISOString() : sendAt;

    const { error } = await supabase
      .from('email_queue')
      .insert({
        user_id: userId,
        to_email: to,
        subject,
        html,
        text_content: text || stripHtmlTags(html),
        send_at: sendAtDate,
        sequence_key: sequenceKey,
        email_key: emailKey,
        variables,
        status: 'pending',
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('[Email] Schedule failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a sequence email by key
 * @param {string} sequenceKey - e.g., 'welcome', 'claim', 'reengagement'
 * @param {string} emailKey - e.g., 'welcome', 'completeProfile', 'activation'
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.userId - User ID
 * @param {Object} options.variables - Template variables
 * @returns {Promise<{success: boolean, messageId: string, error: string}>}
 */
export async function sendSequenceEmail(sequenceKey, emailKey, { to, userId, variables = {} }) {
  try {
    const template = emailTemplates[sequenceKey]?.[emailKey];
    if (!template) {
      throw new Error(`Template not found: ${sequenceKey}.${emailKey}`);
    }

    const subject = interpolateTemplate(template.subject, variables);
    const html = interpolateTemplate(template.html, variables);
    const text = interpolateTemplate(template.text, variables);

    return await sendEmail({
      to,
      userId,
      subject,
      html,
      text,
      tags: [sequenceKey, emailKey],
    });
  } catch (error) {
    console.error('[Email] Sequence send failed:', error);
    return { success: false, messageId: null, error: error.message };
  }
}

/**
 * Check if user has unsubscribed
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>}
 */
export async function isUnsubscribed(email) {
  try {
    // First, get user ID from email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) return false;

    // Check email_preferences
    const { data: prefs, error } = await supabase
      .from('email_preferences')
      .select('marketing_emails, sequence_emails')
      .eq('user_id', user.id)
      .single();

    if (error || !prefs) return false;

    return !prefs.marketing_emails || !prefs.sequence_emails;
  } catch (error) {
    console.error('[Email] Unsubscribe check failed:', error);
    return false;
  }
}

/**
 * Process email queue (called by cron/edge function)
 * Fetches pending emails where send_at <= now and sends them
 * Should be called every 5 minutes via cron or webhook
 * @returns {Promise<{sent: number, failed: number, errors: Object[]}>}
 */
export async function processEmailQueue() {
  try {
    // Fetch emails that should be sent now
    const { data: emails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString())
      .order('send_at', { ascending: true })
      .limit(50); // Process max 50 per batch

    if (error) throw error;
    if (!emails || emails.length === 0) {
      return { sent: 0, failed: 0, errors: [] };
    }

    const results = { sent: 0, failed: 0, errors: [] };

    for (const email of emails) {
      try {
        const result = await sendEmail({
          to: email.to_email,
          userId: email.user_id,
          subject: email.subject,
          html: email.html,
          text: email.text_content,
          tags: [email.sequence_key, email.email_key].filter(Boolean),
        });

        if (result.success) {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              message_id: result.messageId,
            })
            .eq('id', email.id);

          results.sent++;
        } else {
          // Mark as failed
          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              error: result.error,
            })
            .eq('id', email.id);

          results.failed++;
          results.errors.push({ emailId: email.id, error: result.error });
        }
      } catch (error) {
        console.error(`[Email Queue] Failed to process email ${email.id}:`, error);
        await supabase
          .from('email_queue')
          .update({
            status: 'failed',
            error: error.message,
          })
          .eq('id', email.id);

        results.failed++;
        results.errors.push({ emailId: email.id, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('[Email Queue] Process failed:', error);
    return { sent: 0, failed: emails?.length || 0, errors: [{ global: error.message }] };
  }
}

/**
 * Trigger welcome sequence for a new user
 * Schedules 4 emails: immediate, day 1, day 3, day 7
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} username - User's chosen username
 * @returns {Promise<{success: boolean, scheduled: number, error: string}>}
 */
export async function triggerWelcomeSequence(userId, email, username) {
  try {
    const baseUrl = EMAIL_CONFIG.baseUrl;
    const now = new Date();

    const emails = [
      {
        key: 'welcome',
        sendAt: now,
        variables: { username, baseUrl },
      },
      {
        key: 'completeProfile',
        sendAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
      {
        key: 'firstGuitar',
        sendAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
      {
        key: 'community',
        sendAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
    ];

    let scheduled = 0;
    for (const emailConfig of emails) {
      const result = await scheduleEmail({
        userId,
        to: email,
        subject: emailTemplates.welcome[emailConfig.key].subject,
        html: emailTemplates.welcome[emailConfig.key].html,
        text: emailTemplates.welcome[emailConfig.key].text,
        sendAt: emailConfig.sendAt,
        sequenceKey: 'welcome',
        emailKey: emailConfig.key,
        variables: emailConfig.variables,
      });

      if (result.success) scheduled++;
    }

    return { success: scheduled === emails.length, scheduled, error: null };
  } catch (error) {
    console.error('[Email] Welcome sequence trigger failed:', error);
    return { success: false, scheduled: 0, error: error.message };
  }
}

/**
 * Trigger claim activation sequence for approved guitar claims
 * Schedules 4 emails: immediate, day 1, day 3, day 7
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} username - User's username
 * @param {Object} guitarData - Guitar details { brand, model, year, color }
 * @returns {Promise<{success: boolean, scheduled: number, error: string}>}
 */
export async function triggerClaimSequence(userId, email, username, guitarData) {
  try {
    const baseUrl = EMAIL_CONFIG.baseUrl;
    const now = new Date();

    const emails = [
      {
        key: 'claimApproved',
        sendAt: now,
        variables: { username, ...guitarData, baseUrl },
      },
      {
        key: 'addMoreGuitars',
        sendAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
      {
        key: 'buildCollection',
        sendAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
      {
        key: 'exploreFeatures',
        sendAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
    ];

    let scheduled = 0;
    for (const emailConfig of emails) {
      const result = await scheduleEmail({
        userId,
        to: email,
        subject: emailTemplates.claim[emailConfig.key].subject,
        html: emailTemplates.claim[emailConfig.key].html,
        text: emailTemplates.claim[emailConfig.key].text,
        sendAt: emailConfig.sendAt,
        sequenceKey: 'claim',
        emailKey: emailConfig.key,
        variables: emailConfig.variables,
      });

      if (result.success) scheduled++;
    }

    return { success: scheduled === emails.length, scheduled, error: null };
  } catch (error) {
    console.error('[Email] Claim sequence trigger failed:', error);
    return { success: false, scheduled: 0, error: error.message };
  }
}

/**
 * Trigger re-engagement sequence for inactive users
 * Schedules 3 emails: day 14, day 21, day 30
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} username - User's username
 * @param {string} [preferredBrand] - Optional: user's preferred guitar brand
 * @returns {Promise<{success: boolean, scheduled: number, error: string}>}
 */
export async function triggerReengagementSequence(userId, email, username, preferredBrand) {
  try {
    const baseUrl = EMAIL_CONFIG.baseUrl;
    const now = new Date();

    const emails = [
      {
        key: 'comeBack',
        sendAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl, preferredBrand },
      },
      {
        key: 'newFeatures',
        sendAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl },
      },
      {
        key: 'exclusiveOffer',
        sendAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        variables: { username, baseUrl, preferredBrand },
      },
    ];

    let scheduled = 0;
    for (const emailConfig of emails) {
      const result = await scheduleEmail({
        userId,
        to: email,
        subject: emailTemplates.reengagement[emailConfig.key].subject,
        html: emailTemplates.reengagement[emailConfig.key].html,
        text: emailTemplates.reengagement[emailConfig.key].text,
        sendAt: emailConfig.sendAt,
        sequenceKey: 'reengagement',
        emailKey: emailConfig.key,
        variables: emailConfig.variables,
      });

      if (result.success) scheduled++;
    }

    return { success: scheduled === emails.length, scheduled, error: null };
  } catch (error) {
    console.error('[Email] Re-engagement sequence trigger failed:', error);
    return { success: false, scheduled: 0, error: error.message };
  }
}

/**
 * Cancel a sequence (e.g., user becomes active again)
 * Deletes all pending emails for this user/sequence from queue
 * @param {string} userId - User ID
 * @param {string} sequenceKey - Sequence to cancel
 * @returns {Promise<{success: boolean, deleted: number, error: string}>}
 */
export async function cancelSequence(userId, sequenceKey) {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .delete()
      .eq('user_id', userId)
      .eq('sequence_key', sequenceKey)
      .eq('status', 'pending');

    if (error) throw error;

    return { success: true, deleted: data?.length || 0, error: null };
  } catch (error) {
    console.error('[Email] Cancel sequence failed:', error);
    return { success: false, deleted: 0, error: error.message };
  }
}

/**
 * Update user email preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - { marketingEmails, sequenceEmails, notificationEmails }
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function updateEmailPreferences(userId, preferences) {
  try {
    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: userId,
        marketing_emails: preferences.marketingEmails !== false,
        sequence_emails: preferences.sequenceEmails !== false,
        notification_emails: preferences.notificationEmails !== false,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('[Email] Update preferences failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Strip HTML tags from string
 * @private
 */
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

/**
 * Helper: Interpolate variables into template strings
 * Usage: interpolateTemplate('Hello {{name}}', { name: 'John' }) => 'Hello John'
 * @private
 */
function interpolateTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}
