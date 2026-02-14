/**
 * TWNG Transactional Notification Email Templates
 * Triggered by real-time events: messages, transfers, follows.
 * Design: Dark bg (#1C1917), amber accent (#D97706), 600px card layout.
 */

// Shared CSS used by all notification templates
const sharedStyles = `
  body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
  .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
  .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
  .content { padding: 32px 24px; }
  .content h1 { color: #FAFAF9; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
  .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
  .content p.secondary { color: #A3A3A3; font-size: 13px; }
  .highlight-box { background-color: #1C1917; border-left: 3px solid #D97706; padding: 16px; margin: 20px 0; border-radius: 4px; }
  .highlight-box p { margin: 0 0 8px 0; }
  .highlight-box p:last-child { margin-bottom: 0; }
  .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
  .cta-container { text-align: center; margin: 24px 0; }
  .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
  .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
  .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
  .footer a { color: #D97706; text-decoration: none; }
`;

const logoHtml = '<img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">';

const footerHtml = `
  <div class="footer">
    <p>You received this because you have notification emails enabled on TWNG.</p>
    <p>Questions? <a href="mailto:support@twng.app">Email our support team</a></p>
    <p style="margin-bottom: 0;">&copy; 2025 TWNG. Every Guitar Has A Story.</p>
  </div>
`;

// ============================================================================
// NEW MESSAGE NOTIFICATION
// ============================================================================

export const newMessage = ({ recipientName, senderName, senderUsername, messagePreview, conversationUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            ${logoHtml}
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>New Message</h1>
            <p>Hi ${recipientName},</p>
            <p><strong style="color: #D97706;">${senderName}</strong> (@${senderUsername}) sent you a message on TWNG.</p>

            <div class="highlight-box">
              <p style="color: #A3A3A3; font-size: 12px; margin-bottom: 8px;">Message preview:</p>
              <p style="color: #FAFAF9; font-style: italic;">${messagePreview}${messagePreview.length >= 100 ? '...' : ''}</p>
            </div>

            <div class="cta-container">
              <a href="${conversationUrl}" class="cta-button">VIEW CONVERSATION</a>
            </div>

            <p class="secondary">Reply directly on TWNG to keep the conversation going.</p>
          </div>

          ${footerHtml}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `New Message

Hi ${recipientName},

${senderName} (@${senderUsername}) sent you a message on TWNG.

"${messagePreview}${messagePreview.length >= 100 ? '...' : ''}"

View conversation: ${conversationUrl}

© 2025 TWNG. Every Guitar Has A Story.`.trim();

  return {
    subject: `New message from ${senderName} on TWNG`,
    html,
    text,
  };
};

// ============================================================================
// TRANSFER REQUEST RECEIVED (sent to recipient)
// ============================================================================

export const transferRequestReceived = ({ recipientName, senderName, make, model, year, transferUrl }) => {
  const guitarName = [make, model, year].filter(Boolean).join(' ');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            ${logoHtml}
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Transfer Request</h1>
            <p>Hi ${recipientName},</p>
            <p><strong style="color: #D97706;">${senderName}</strong> wants to transfer an instrument to you on TWNG.</p>

            <div class="highlight-box">
              <p><strong style="color: #FAFAF9;">${guitarName}</strong></p>
              <p style="color: #A3A3A3; margin: 0;">Pending your approval</p>
            </div>

            <p>Review the transfer details and accept or decline the request.</p>

            <div class="cta-container">
              <a href="${transferUrl}" class="cta-button">VIEW TRANSFER REQUEST</a>
            </div>

            <p class="secondary">This request will remain pending until you take action.</p>
          </div>

          ${footerHtml}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Transfer Request

Hi ${recipientName},

${senderName} wants to transfer an instrument to you on TWNG.

Guitar: ${guitarName}
Status: Pending your approval

Review the transfer: ${transferUrl}

© 2025 TWNG. Every Guitar Has A Story.`.trim();

  return {
    subject: `${senderName} wants to transfer a ${make} ${model} to you`,
    html,
    text,
  };
};

// ============================================================================
// TRANSFER REQUEST SENT (confirmation to sender)
// ============================================================================

export const transferRequestSent = ({ senderName, recipientName, make, model, year, transferUrl }) => {
  const guitarName = [make, model, year].filter(Boolean).join(' ');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            ${logoHtml}
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Transfer Initiated</h1>
            <p>Hi ${senderName},</p>
            <p>Your transfer request has been sent to <strong style="color: #D97706;">${recipientName}</strong>.</p>

            <div class="highlight-box">
              <p><strong style="color: #FAFAF9;">${guitarName}</strong></p>
              <p style="color: #A3A3A3; margin: 0;">Waiting for ${recipientName} to accept</p>
            </div>

            <p>You'll be notified once they respond to the transfer request.</p>

            <div class="cta-container">
              <a href="${transferUrl}" class="cta-button">VIEW TRANSFER</a>
            </div>

            <p class="secondary">You can cancel the transfer anytime before it's accepted.</p>
          </div>

          ${footerHtml}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Transfer Initiated

Hi ${senderName},

Your transfer request has been sent to ${recipientName}.

Guitar: ${guitarName}
Status: Waiting for ${recipientName} to accept

View transfer: ${transferUrl}

© 2025 TWNG. Every Guitar Has A Story.`.trim();

  return {
    subject: `Transfer request sent for your ${make} ${model}`,
    html,
    text,
  };
};

// ============================================================================
// NEW FOLLOWER NOTIFICATION
// ============================================================================

export const newFollower = ({ recipientName, followerName, followerUsername, profileUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            ${logoHtml}
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>New Follower</h1>
            <p>Hi ${recipientName},</p>
            <p><strong style="color: #D97706;">${followerName}</strong> (@${followerUsername}) started following you on TWNG.</p>

            <p>Check out their profile to see their collection and story.</p>

            <div class="cta-container">
              <a href="${profileUrl}" class="cta-button">VIEW PROFILE</a>
            </div>

            <p class="secondary">Building connections is what makes TWNG special. Keep sharing your story.</p>
          </div>

          ${footerHtml}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `New Follower

Hi ${recipientName},

${followerName} (@${followerUsername}) started following you on TWNG.

View their profile: ${profileUrl}

© 2025 TWNG. Every Guitar Has A Story.`.trim();

  return {
    subject: `${followerName} started following you on TWNG`,
    html,
    text,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export const transactionalNotificationTemplates = {
  newMessage,
  transferRequestReceived,
  transferRequestSent,
  newFollower,
};
