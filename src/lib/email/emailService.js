/**
 * TWNG Email Service
 * All emails are sent via Supabase Edge Function (send-email).
 * NO API keys are stored or used in the frontend.
 *
 * The Edge Function handles provider logic (Resend/SendGrid) server-side,
 * keeping secrets safe.
 */

import { supabase } from '../supabase/client';
import { emailTemplates } from './templates';

// Frontend-safe config (no secrets)
const EMAIL_CONFIG = {
  from: import.meta.env.VITE_EMAIL_FROM || 'TWNG <onboarding@resend.dev>',
  replyTo: import.meta.env.VITE_EMAIL_REPLY_TO || 'support@twng.com',
  baseUrl: typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_BASE_URL || 'https://twng.com'),
};

/**
 * Core send function — routes through Supabase Edge Function
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
    // Check unsubscribe status
    if (userId) {
      const unsubscribed = await isUnsubscribed(userId);
      if (unsubscribed) {
        return { success: false, error: 'User unsubscribed', messageId: null };
      }
    }

    // Send via Edge Function — the function holds the Resend/SendGrid API key
    const { data, error: fnError } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        html,
        text: text || stripHtmlTags(html),
        from: EMAIL_CONFIG.from,
        replyTo: EMAIL_CONFIG.replyTo,
        tags,
      },
    });

    if (fnError) {
      let msg = fnError.message || 'Email send failed';
      try {
        if (fnError.context) {
          const body = await fnError.context.json();
          if (body?.error) msg = body.error;
        }
      } catch { /* ignore parse errors */ }
      throw new Error(msg);
    }

    // Log to email_log table (non-blocking)
    if (userId || to) {
      supabase
        .from('email_log')
        .insert({
          user_id: userId,
          to_email: to,
          subject,
          provider: 'edge_function',
          status: 'sent',
          message_id: data?.messageId,
          tags,
          sent_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch(() => {});
    }

    return { success: true, messageId: data?.messageId || null, error: null };
  } catch (error) {
    // Log failure (non-blocking)
    if (userId || to) {
      supabase
        .from('email_log')
        .insert({
          user_id: userId,
          to_email: to,
          subject,
          provider: 'edge_function',
          status: 'failed',
          error: error.message,
          sent_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch(() => {});
    }

    return { success: false, messageId: null, error: error.message };
  }
}

/**
 * Schedule an email for later (for sequences)
 * Inserts into email_queue table with send_at timestamp
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
    return { success: false, error: error.message };
  }
}

/**
 * Send a sequence email by key
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

    return await sendEmail({ to, userId, subject, html, text, tags: [sequenceKey, emailKey] });
  } catch (error) {
    return { success: false, messageId: null, error: error.message };
  }
}

/**
 * Check if user has unsubscribed
 */
export async function isUnsubscribed(userId) {
  try {
    const { data } = await supabase
      .from('email_preferences')
      .select('marketing_emails')
      .eq('user_id', userId)
      .single();

    return data?.marketing_emails === false;
  } catch {
    return false; // default: not unsubscribed
  }
}

/**
 * Process email queue (called by cron/edge function)
 */
export async function processEmailQueue() {
  try {
    const { data: emails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString())
      .order('send_at', { ascending: true })
      .limit(50);

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

        await supabase
          .from('email_queue')
          .update({
            status: result.success ? 'sent' : 'failed',
            sent_at: result.success ? new Date().toISOString() : undefined,
            error: result.error || undefined,
          })
          .eq('id', email.id);

        if (result.success) results.sent++;
        else {
          results.failed++;
          results.errors.push({ emailId: email.id, error: result.error });
        }
      } catch (err) {
        await supabase
          .from('email_queue')
          .update({ status: 'failed', error: err.message })
          .eq('id', email.id);
        results.failed++;
        results.errors.push({ emailId: email.id, error: err.message });
      }
    }

    return results;
  } catch (error) {
    return { sent: 0, failed: 0, errors: [{ global: error.message }] };
  }
}

/**
 * Trigger welcome sequence for a new user
 */
export async function triggerWelcomeSequence(userId, email, username) {
  try {
    const baseUrl = EMAIL_CONFIG.baseUrl;
    const now = new Date();

    const emails = [
      { key: 'welcome', sendAt: now, variables: { username, baseUrl } },
      { key: 'completeProfile', sendAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
      { key: 'firstGuitar', sendAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
      { key: 'community', sendAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
    ];

    let scheduled = 0;
    for (const cfg of emails) {
      const result = await scheduleEmail({
        userId, to: email,
        subject: emailTemplates.welcome[cfg.key].subject,
        html: emailTemplates.welcome[cfg.key].html,
        text: emailTemplates.welcome[cfg.key].text,
        sendAt: cfg.sendAt,
        sequenceKey: 'welcome', emailKey: cfg.key, variables: cfg.variables,
      });
      if (result.success) scheduled++;
    }

    return { success: scheduled === emails.length, scheduled, error: null };
  } catch (error) {
    return { success: false, scheduled: 0, error: error.message };
  }
}

/**
 * Trigger claim activation sequence
 */
export async function triggerClaimSequence(userId, email, username, guitarData) {
  try {
    const baseUrl = EMAIL_CONFIG.baseUrl;
    const now = new Date();

    const emails = [
      { key: 'claimApproved', sendAt: now, variables: { username, ...guitarData, baseUrl } },
      { key: 'addMoreGuitars', sendAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
      { key: 'buildCollection', sendAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
      { key: 'exploreFeatures', sendAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
    ];

    let scheduled = 0;
    for (const cfg of emails) {
      const result = await scheduleEmail({
        userId, to: email,
        subject: emailTemplates.claim[cfg.key].subject,
        html: emailTemplates.claim[cfg.key].html,
        text: emailTemplates.claim[cfg.key].text,
        sendAt: cfg.sendAt,
        sequenceKey: 'claim', emailKey: cfg.key, variables: cfg.variables,
      });
      if (result.success) scheduled++;
    }

    return { success: scheduled === emails.length, scheduled, error: null };
  } catch (error) {
    return { success: false, scheduled: 0, error: error.message };
  }
}

/**
 * Trigger re-engagement sequence for inactive users
 */
export async function triggerReengagementSequence(userId, email, username, preferredBrand) {
  try {
    const baseUrl = EMAIL_CONFIG.baseUrl;
    const now = new Date();

    const emails = [
      { key: 'comeBack', sendAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), variables: { username, baseUrl, preferredBrand } },
      { key: 'newFeatures', sendAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), variables: { username, baseUrl } },
      { key: 'exclusiveOffer', sendAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), variables: { username, baseUrl, preferredBrand } },
    ];

    let scheduled = 0;
    for (const cfg of emails) {
      const result = await scheduleEmail({
        userId, to: email,
        subject: emailTemplates.reengagement[cfg.key].subject,
        html: emailTemplates.reengagement[cfg.key].html,
        text: emailTemplates.reengagement[cfg.key].text,
        sendAt: cfg.sendAt,
        sequenceKey: 'reengagement', emailKey: cfg.key, variables: cfg.variables,
      });
      if (result.success) scheduled++;
    }

    return { success: scheduled === emails.length, scheduled, error: null };
  } catch (error) {
    return { success: false, scheduled: 0, error: error.message };
  }
}

/**
 * Send a transactional/auth email
 */
export async function sendTransactionalEmail(category, templateKey, { to, userId, variables = {} }) {
  try {
    const templateFn = emailTemplates[category]?.[templateKey];
    if (!templateFn) throw new Error(`Template not found: ${category}.${templateKey}`);

    const { subject, html, text } = templateFn(variables);
    return await sendEmail({ to, userId, subject, html, text, tags: [category, templateKey] });
  } catch (error) {
    return { success: false, messageId: null, error: error.message };
  }
}

/**
 * Cancel a scheduled sequence
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
    return { success: false, deleted: 0, error: error.message };
  }
}

/**
 * Update user email preferences
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
    return { success: false, error: error.message };
  }
}

// ------- Helpers -------

function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

function interpolateTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}
