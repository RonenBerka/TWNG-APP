/**
 * TWNG Transactional Email Templates
 * Authentication flows and claim notifications
 *
 * Brand Colors:
 * - Background: #1C1917 (stone-900)
 * - Card: #292524 (stone-800)
 * - Accent: #D97706 (amber-600)
 * - Text: #FAFAF9 (stone-50)
 * - Secondary: #A3A3A3
 * - Border: #44403C (stone-700)
 * - Footer: #78716C (stone-500)
 */

// ============================================================================
// AUTHENTICATION TEMPLATES
// ============================================================================

/**
 * Password Reset Request
 * Sends a secure link to reset forgotten password
 */
const passwordReset = ({ username, resetUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
        .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
        .logo { font-size: 28px; font-weight: 700; color: #D97706; letter-spacing: 2px; margin: 0 0 8px 0; }
        .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
        .content { padding: 32px 24px; }
        .content h1 { color: #FAFAF9; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .content p.secondary { color: #A3A3A3; font-size: 13px; }
        .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .cta-container { text-align: center; margin: 24px 0; }
        .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
        .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
        .footer a { color: #D97706; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Reset Your Password</h1>
            <p>Hi ${username},</p>
            <p>We received a request to reset your password. Click the link below to create a new one.</p>

            <div class="cta-container">
              <a href="${resetUrl}" class="cta-button">RESET YOUR PASSWORD</a>
            </div>

            <p class="secondary">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>

          <div class="footer">
            <p>Questions? <a href="mailto:support@twng.app">Contact our support team</a></p>
            <p style="margin-bottom: 0;">© 2024 TWNG. Every Guitar Has A Story.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password

Hi ${username},

We received a request to reset your password. Click the link below to create a new one.

${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.

© 2024 TWNG. Every Guitar Has A Story.
  `.trim();

  return {
    subject: 'Reset your TWNG password',
    html,
    text
  };
};

/**
 * Passwordless Login (Magic Link)
 * Ultra-minimal login experience with time-sensitive link
 */
const magicLink = ({ username, magicLinkUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
        .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
        .logo { font-size: 28px; font-weight: 700; color: #D97706; letter-spacing: 2px; margin: 0 0 8px 0; }
        .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
        .content { padding: 32px 24px; }
        .content h1 { color: #FAFAF9; font-size: 20px; margin: 0 0 16px 0; font-weight: 600; }
        .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .content p.secondary { color: #A3A3A3; font-size: 13px; }
        .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .cta-container { text-align: center; margin: 24px 0; }
        .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
        .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
        .footer a { color: #D97706; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Your Login Link</h1>
            <p>Hi ${username},</p>
            <p>Click below to sign in to your TWNG account.</p>

            <div class="cta-container">
              <a href="${magicLinkUrl}" class="cta-button">SIGN IN TO TWNG</a>
            </div>

            <p class="secondary">This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>

          <div class="footer">
            <p>© 2024 TWNG. Every Guitar Has A Story.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Login Link

Hi ${username},

Click below to sign in to your TWNG account.

${magicLinkUrl}

This link expires in 10 minutes. If you didn't request this, you can safely ignore this email.

© 2024 TWNG. Every Guitar Has A Story.
  `.trim();

  return {
    subject: 'Your TWNG login link',
    html,
    text
  };
};

/**
 * Email Confirmation
 * Verify email address to complete account signup
 */
const confirmSignup = ({ username, confirmUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
        .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
        .logo { font-size: 28px; font-weight: 700; color: #D97706; letter-spacing: 2px; margin: 0 0 8px 0; }
        .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
        .content { padding: 32px 24px; }
        .content h1 { color: #FAFAF9; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .content p.secondary { color: #A3A3A3; font-size: 13px; }
        .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .cta-container { text-align: center; margin: 24px 0; }
        .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
        .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
        .footer a { color: #D97706; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Confirm Your Email</h1>
            <p>Hi ${username},</p>
            <p>One last step before you're in. Verify your email address to activate your TWNG account.</p>

            <div class="cta-container">
              <a href="${confirmUrl}" class="cta-button">CONFIRM YOUR EMAIL</a>
            </div>

            <p class="secondary">Welcome to the community of musicians and guitar enthusiasts who share their stories with TWNG.</p>
          </div>

          <div class="footer">
            <p>Questions? <a href="mailto:support@twng.app">Contact our support team</a></p>
            <p style="margin-bottom: 0;">© 2024 TWNG. Every Guitar Has A Story.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Confirm Your Email

Hi ${username},

One last step before you're in. Verify your email address to activate your TWNG account.

${confirmUrl}

Welcome to the community of musicians and guitar enthusiasts who share their stories with TWNG.

© 2024 TWNG. Every Guitar Has A Story.
  `.trim();

  return {
    subject: 'Confirm your email for TWNG',
    html,
    text
  };
};

/**
 * Change Email Confirmation
 * Verify new email address when changing account email
 */
const changeEmail = ({ username, confirmUrl, newEmail }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
        .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
        .logo { font-size: 28px; font-weight: 700; color: #D97706; letter-spacing: 2px; margin: 0 0 8px 0; }
        .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
        .content { padding: 32px 24px; }
        .content h1 { color: #FAFAF9; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .content p.secondary { color: #A3A3A3; font-size: 13px; }
        .highlight { color: #D97706; }
        .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .cta-container { text-align: center; margin: 24px 0; }
        .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
        .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
        .footer a { color: #D97706; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Confirm Your New Email</h1>
            <p>Hi ${username},</p>
            <p>You requested to change your email address to <span class="highlight">${newEmail}</span>. Click below to confirm this change.</p>

            <div class="cta-container">
              <a href="${confirmUrl}" class="cta-button">CONFIRM NEW EMAIL</a>
            </div>

            <p class="secondary">If you didn't make this request, please secure your account immediately by changing your password or <a href="mailto:support@twng.app" style="color: #D97706;">contacting support</a>.</p>
          </div>

          <div class="footer">
            <p>Questions? <a href="mailto:support@twng.app">Contact our support team</a></p>
            <p style="margin-bottom: 0;">© 2024 TWNG. Every Guitar Has A Story.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Confirm Your New Email

Hi ${username},

You requested to change your email address to ${newEmail}. Click below to confirm this change.

${confirmUrl}

If you didn't make this request, please secure your account immediately by changing your password or contacting support at support@twng.app.

© 2024 TWNG. Every Guitar Has A Story.
  `.trim();

  return {
    subject: 'Confirm your new email address',
    html,
    text
  };
};

// ============================================================================
// TRANSACTIONAL TEMPLATES
// ============================================================================

/**
 * Claim Denied Notification
 * Empathetic notification when a guitar claim cannot be verified
 */
const claimDenied = ({ username, brand, model, reason, supportUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
        .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
        .logo { font-size: 28px; font-weight: 700; color: #D97706; letter-spacing: 2px; margin: 0 0 8px 0; }
        .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
        .content { padding: 32px 24px; }
        .content h1 { color: #FAFAF9; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .content p.secondary { color: #A3A3A3; font-size: 13px; }
        .guitar-info { background-color: #1C1917; border-left: 3px solid #D97706; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .guitar-info p { margin: 0 0 8px 0; }
        .guitar-info p:last-child { margin-bottom: 0; }
        .reason-box { background-color: #1C1917; padding: 16px; margin: 20px 0; border-radius: 4px; border: 1px solid #44403C; }
        .reason-box p { margin: 0; color: #A3A3A3; }
        .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .cta-container { text-align: center; margin: 24px 0; }
        .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
        .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
        .footer a { color: #D97706; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>Update on Your Claim</h1>
            <p>Hi ${username},</p>
            <p>We've completed our review of your guitar claim, but unfortunately we weren't able to verify it at this time.</p>

            <div class="guitar-info">
              <p><strong style="color: #FAFAF9;">${brand} ${model}</strong></p>
              <p style="color: #A3A3A3; margin: 0;">Guitar claim review completed</p>
            </div>

            <p style="color: #FAFAF9; font-weight: 600; margin-top: 20px;">Why wasn't your claim verified?</p>
            <div class="reason-box">
              <p>${reason}</p>
            </div>

            <p>Don't give up — many claims are approved after resubmission with additional documentation. Try again with better photos, original paperwork, or receipts if you have them.</p>

            <div class="cta-container">
              <a href="${supportUrl}" class="cta-button">CONTACT SUPPORT</a>
            </div>

            <p class="secondary">Our support team is here to help guide you through the process or answer any questions.</p>
          </div>

          <div class="footer">
            <p>Questions? <a href="mailto:support@twng.app">Email our support team</a></p>
            <p style="margin-bottom: 0;">© 2024 TWNG. Every Guitar Has A Story.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Update on Your Claim

Hi ${username},

We've completed our review of your guitar claim, but unfortunately we weren't able to verify it at this time.

Guitar: ${brand} ${model}

Why wasn't your claim verified?
${reason}

Don't give up — many claims are approved after resubmission with additional documentation. Try again with better photos, original paperwork, or receipts if you have them.

${supportUrl}

Our support team is here to help guide you through the process or answer any questions.

© 2024 TWNG. Every Guitar Has A Story.
  `.trim();

  return {
    subject: `Update on your ${brand} ${model} claim`,
    html,
    text
  };
};

/**
 * Claim Pending Review Notification
 * Confirmation that claim has been submitted and is under review
 */
const claimPendingReview = ({ username, brand, model, claimUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #1C1917; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background-color: #292524; border-radius: 12px; overflow: hidden; border: 1px solid #44403C; }
        .header { padding: 32px 24px; text-align: center; border-bottom: 1px solid #44403C; }
        .logo { font-size: 28px; font-weight: 700; color: #D97706; letter-spacing: 2px; margin: 0 0 8px 0; }
        .tagline { font-size: 12px; color: #A3A3A3; margin: 0; }
        .content { padding: 32px 24px; }
        .content h1 { color: #FAFAF9; font-size: 24px; margin: 0 0 16px 0; font-weight: 600; }
        .content p { color: #FAFAF9; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .content p.secondary { color: #A3A3A3; font-size: 13px; }
        .guitar-info { background-color: #1C1917; border-left: 3px solid #D97706; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .guitar-info p { margin: 0 0 8px 0; }
        .guitar-info p:last-child { margin-bottom: 0; }
        .timeline { margin: 20px 0; }
        .timeline-item { display: flex; margin-bottom: 16px; }
        .timeline-dot { width: 12px; height: 12px; background-color: #D97706; border-radius: 50%; margin-right: 12px; margin-top: 3px; flex-shrink: 0; }
        .timeline-text { color: #FAFAF9; font-size: 14px; line-height: 1.6; }
        .timeline-text .label { color: #A3A3A3; font-size: 12px; }
        .cta-button { display: inline-block; background-color: #D97706; color: #1C1917; padding: 14px 48px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
        .cta-container { text-align: center; margin: 24px 0; }
        .divider { height: 1px; background-color: #44403C; margin: 24px 0; }
        .footer { padding: 20px 24px; border-top: 1px solid #44403C; }
        .footer p { color: #78716C; font-size: 12px; margin: 0 0 8px 0; line-height: 1.6; }
        .footer a { color: #D97706; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            <p class="tagline">EVERY GUITAR HAS A STORY</p>
          </div>

          <div class="content">
            <h1>We're Reviewing Your Claim</h1>
            <p>Hi ${username},</p>
            <p>Thanks for submitting your guitar claim! Our team is now reviewing the information and documentation you provided.</p>

            <div class="guitar-info">
              <p><strong style="color: #FAFAF9;">${brand} ${model}</strong></p>
              <p style="color: #A3A3A3; margin: 0;">Claim status: Under review</p>
            </div>

            <p style="color: #FAFAF9; font-weight: 600;">What happens next?</p>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-text">
                  <strong>Verification Review</strong>
                  <div class="label">We verify ownership and authenticity</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-text">
                  <strong>Processing (24-48 hours)</strong>
                  <div class="label">Our team reviews your documentation</div>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-text">
                  <strong>You'll Hear From Us</strong>
                  <div class="label">We'll notify you of the outcome</div>
                </div>
              </div>
            </div>

            <p class="secondary">We typically process claims within 24-48 hours. Check back anytime to see the status of your claim.</p>

            <div class="cta-container">
              <a href="${claimUrl}" class="cta-button">VIEW YOUR CLAIM</a>
            </div>
          </div>

          <div class="footer">
            <p>Questions? <a href="mailto:support@twng.app">Contact our support team</a></p>
            <p style="margin-bottom: 0;">© 2024 TWNG. Every Guitar Has A Story.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
We're Reviewing Your Claim

Hi ${username},

Thanks for submitting your guitar claim! Our team is now reviewing the information and documentation you provided.

Guitar: ${brand} ${model}
Status: Under review

What happens next?

1. Verification Review
   We verify ownership and authenticity

2. Processing (24-48 hours)
   Our team reviews your documentation

3. You'll Hear From Us
   We'll notify you of the outcome

We typically process claims within 24-48 hours. Check back anytime to see the status of your claim.

${claimUrl}

Questions? Contact our support team at support@twng.app

© 2024 TWNG. Every Guitar Has A Story.
  `.trim();

  return {
    subject: `We're reviewing your ${brand} ${model} claim`,
    html,
    text
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export const authTemplates = {
  passwordReset,
  magicLink,
  confirmSignup,
  changeEmail
};

export const transactionalTemplates = {
  claimDenied,
  claimPendingReview
};

export const authEmailTemplates = {
  auth: {
    passwordReset,
    magicLink,
    confirmSignup,
    changeEmail
  },
  transaction: {
    claimDenied,
    claimPendingReview
  }
};
