/**
 * TWNG Email Templates
 * Complete email sequences for user onboarding, claim activation, and re-engagement
 * Brand: Dark backgrounds (#1C1917), amber accents (#D97706), warm typography
 * Voice: Casual, authoritative, approachable, community-focused
 */

// ============================================================================
// WELCOME / ONBOARDING SEQUENCE (System D)
// ============================================================================

export const welcomeSequence = {
  /**
   * Email 1: Welcome (triggered immediately after registration)
   * Warm introduction to TWNG
   */
  welcome: ({ username, profileUrl }) => {
    const subject = "Welcome to TWNG — Your guitars have been waiting for this";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto 12px;">
              <p style="color:#A3A3A3;font-size:14px;margin:0;letter-spacing:1px;">EVERY GUITAR HAS A STORY</p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Hey ${username}!</p>

              <p style="margin:0 0 16px 0;">Welcome to TWNG — the platform where guitar collectors document their collections, share their stories, and connect with fellow enthusiasts who get it.</p>

              <p style="margin:0 0 24px 0;">Whether you've got one guitar or a whole room full of them, we're here to help you tell their stories. Because let's be real — every guitar has history, character, and a reason it found its way to you.</p>

              <p style="margin:0 0 32px 0;color:#A3A3A3;font-size:15px;">Here's what's next:</p>

              <ul style="margin:0 0 32px 0;padding-left:20px;color:#FAFAF9;">
                <li style="margin:0 0 12px 0;">Set up your profile</li>
                <li style="margin:0 0 12px 0;">Add your first guitar (or your whole collection)</li>
                <li style="margin:0 0 0;">Explore guitars documented by collectors just like you</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${profileUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">COMPLETE YOUR PROFILE</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Welcome to TWNG — Your guitars have been waiting for this

Hey ${username}!

Welcome to TWNG — the platform where guitar collectors document their collections, share their stories, and connect with fellow enthusiasts who get it.

Whether you've got one guitar or a whole room full of them, we're here to help you tell their stories. Because let's be real — every guitar has history, character, and a reason it found its way to you.

Here's what's next:
- Set up your profile
- Add your first guitar (or your whole collection)
- Explore guitars documented by collectors just like you

Complete your profile: ${profileUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 2: Complete Profile (triggered Day 1)
   * Gentle reminder and benefits of a complete profile
   */
  completeProfile: ({ username, profileUrl }) => {
    const subject = "One quick thing — let's set up your profile";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Just one more thing, ${username}.</p>

              <p style="margin:0 0 24px 0;">A complete profile means other collectors can find you, learn your story, and trust what you know. It's the difference between being a name in the database and being someone people actually want to connect with.</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:14px;font-weight:500;">Quick checklist (5 minutes max):</p>

              <div style="background-color:#1C1917;border-left:3px solid #D97706;padding:16px;border-radius:4px;margin:0 0 32px 0;">
                <p style="margin:0 0 12px 0;color:#FAFAF9;font-size:15px;"><span style="color:#D97706;">✓</span> Add a photo (the real you, not your guitar... well, maybe both)</p>
                <p style="margin:0 0 12px 0;color:#FAFAF9;font-size:15px;"><span style="color:#D97706;">✓</span> Write a short bio (where you're from, what you collect)</p>
                <p style="margin:0 0 0;color:#FAFAF9;font-size:15px;"><span style="color:#D97706;">✓</span> Set your location (so people know where you're building from)</p>
              </div>

              <p style="margin:0;color:#A3A3A3;font-size:15px;">Takes five minutes. Makes all the difference.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${profileUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">FINISH YOUR PROFILE</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `One quick thing — let's set up your profile

Just one more thing, ${username}.

A complete profile means other collectors can find you, learn your story, and trust what you know. It's the difference between being a name in the database and being someone people actually want to connect with.

Quick checklist (5 minutes max):
✓ Add a photo (the real you, not your guitar... well, maybe both)
✓ Write a short bio (where you're from, what you collect)
✓ Set your location (so people know where you're building from)

Takes five minutes. Makes all the difference.

Finish your profile: ${profileUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 3: Add Your First Guitar (triggered Day 3)
   * Encouragement and guidance for adding first guitar
   */
  addFirstGuitar: ({ username, addGuitarUrl }) => {
    const subject = "Ready to document your first guitar?";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Time to add your first guitar, ${username}.</p>

              <p style="margin:0 0 24px 0;">This is the fun part. Every guitar profile on TWNG captures what makes that instrument special — the make, model, year, finish, modifications, and the story behind how you got it.</p>

              <p style="margin:0 0 24px 0;color:#A3A3A3;font-size:15px;">Here's what you can do:</p>

              <div style="background-color:#1C1917;padding:20px;border-radius:4px;margin:0 0 24px 0;border-left:3px solid #D97706;">
                <p style="margin:0 0 16px 0;color:#FAFAF9;"><span style="color:#D97706;font-weight:700;">Magic Add</span><br><span style="font-size:14px;color:#A3A3A3;">Snap a photo of the serial number. We'll decode it and fill in the details automatically.</span></p>
                <p style="margin:0;color:#FAFAF9;"><span style="color:#D97706;font-weight:700;">Manual Entry</span><br><span style="font-size:14px;color:#A3A3A3;">Know your specs? Add them manually. You control every detail.</span></p>
              </div>

              <p style="margin:0 0 24px 0;">Once it's added, you can upload photos, tell its story, log modifications, and watch as other collectors discover what you're building.</p>

              <p style="margin:0;color:#A3A3A3;font-size:15px;font-style:italic;">Pro tip: Our serial number decoder works with most major brands. Even if your guitar's from 1952.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${addGuitarUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">ADD YOUR FIRST GUITAR</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Ready to document your first guitar?

Time to add your first guitar, ${username}.

This is the fun part. Every guitar profile on TWNG captures what makes that instrument special — the make, model, year, finish, modifications, and the story behind how you got it.

Here's what you can do:

MAGIC ADD
Snap a photo of the serial number. We'll decode it and fill in the details automatically.

MANUAL ENTRY
Know your specs? Add them manually. You control every detail.

Once it's added, you can upload photos, tell its story, log modifications, and watch as other collectors discover what you're building.

Pro tip: Our serial number decoder works with most major brands. Even if your guitar's from 1952.

Add your first guitar: ${addGuitarUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 4: Explore & Connect (triggered Day 7)
   * Introduction to community and discovery features
   */
  exploreConnect: ({ username, exploreUrl }) => {
    const subject = "12,400+ guitars documented — find your next obsession";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">The best part? You're not alone, ${username}.</p>

              <p style="margin:0 0 24px 0;">TWNG has over 12,400 guitars documented by collectors from around the world. That means you've got access to thousands of collections, rare finds, and stories that might just inspire your next purchase (or restore).</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:15px;font-weight:500;">What you can do right now:</p>

              <ul style="margin:0 0 32px 0;padding-left:20px;color:#FAFAF9;line-height:1.8;">
                <li style="margin:0 0 12px 0;"><span style="color:#D97706;font-weight:600;">Explore the Collection</span> — Filter by brand, era, or body type. See what other collectors are documenting.</li>
                <li style="margin:0 0 12px 0;"><span style="color:#D97706;font-weight:600;">Browse Collections</span> — Find collectors who specialize in your favorite brands. Learn what makes their collections special.</li>
                <li style="margin:0 0 0;"><span style="color:#D97706;font-weight:600;">Read Articles</span> — Expert insights on everything from setup to restoration to the history of iconic models.</li>
              </ul>

              <p style="margin:0;color:#A3A3A3;font-size:15px;">Stick around. This community is built by people who actually care about guitars.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${exploreUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">EXPLORE THE COLLECTION</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `12,400+ guitars documented — find your next obsession

The best part? You're not alone, ${username}.

TWNG has over 12,400 guitars documented by collectors from around the world. That means you've got access to thousands of collections, rare finds, and stories that might just inspire your next purchase (or restore).

What you can do right now:

EXPLORE THE COLLECTION
Filter by brand, era, or body type. See what other collectors are documenting.

BROWSE COLLECTIONS
Find collectors who specialize in your favorite brands. Learn what makes their collections special.

READ ARTICLES
Expert insights on everything from setup to restoration to the history of iconic models.

Stick around. This community is built by people who actually care about guitars.

Explore the collection: ${exploreUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },
};

// ============================================================================
// CLAIM ACTIVATION SEQUENCE (System E)
// ============================================================================

export const claimSequence = {
  /**
   * Email 1: Claim Confirmed (triggered immediately when claim is activated)
   * Celebration of guitar claim
   */
  claimConfirmed: ({ username, brand, model, guitarUrl }) => {
    const subject = `It's official — your ${brand} ${model} is now yours on TWNG`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Congrats, ${username}! 🎸</p>

              <p style="margin:0 0 24px 0;">Your <strong>${brand} ${model}</strong> is officially claimed and part of your collection on TWNG. That guitar now has a permanent home — linked to you, verified, and ready to tell its story.</p>

              <p style="margin:0 0 24px 0;">What claiming means:</p>

              <ul style="margin:0 0 32px 0;padding-left:20px;color:#FAFAF9;line-height:1.8;">
                <li style="margin:0 0 12px 0;">You're the verified owner on TWNG</li>
                <li style="margin:0 0 12px 0;">Other collectors can see it in your collection</li>
                <li style="margin:0 0 0;">You can add photos, tell the story, log modifications, and build its history over time</li>
              </ul>

              <p style="margin:0;color:#A3A3A3;font-size:15px;">Next up? Let's make sure everyone knows this guitar's story.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${guitarUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">VIEW YOUR GUITAR</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `It's official — your ${brand} ${model} is now yours on TWNG

Congrats, ${username}! 🎸

Your ${brand} ${model} is officially claimed and part of your collection on TWNG. That guitar now has a permanent home — linked to you, verified, and ready to tell its story.

What claiming means:
- You're the verified owner on TWNG
- Other collectors can see it in your collection
- You can add photos, tell the story, log modifications, and build its history over time

Next up? Let's make sure everyone knows this guitar's story.

View your guitar: ${guitarUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 2: Add Photos & Story (triggered Day 1 after claim)
   * Encouragement to document the guitar's story
   */
  addPhotosStory: ({ username, brand, model, guitarUrl }) => {
    const subject = `Your ${brand} ${model} is waiting for its story`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Every guitar has a story, ${username}.</p>

              <p style="margin:0 0 24px 0;">And that <strong>${brand} ${model}</strong> in your hands? It's got one worth telling. Where did you find it? How long have you had it? What makes it special? Did you modify it? Does it have battle scars? Was it a dream guitar you finally saved up for?</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:15px;font-weight:500;">Here's what we'd love to see:</p>

              <div style="background-color:#1C1917;padding:20px;border-radius:4px;margin:0 0 32px 0;border-left:3px solid #D97706;">
                <p style="margin:0 0 16px 0;color:#FAFAF9;"><span style="color:#D97706;font-weight:700;">Photos</span><br><span style="font-size:14px;color:#A3A3A3;">Full body shots, headstock, hardware, the details that make it yours.</span></p>
                <p style="margin:0 0 16px 0;color:#FAFAF9;"><span style="color:#D97706;font-weight:700;">The Story</span><br><span style="font-size:14px;color:#A3A3A3;">How you got it. What it means to you. The journey it's been on.</span></p>
                <p style="margin:0;color:#FAFAF9;"><span style="color:#D97706;font-weight:700;">The Details</span><br><span style="font-size:14px;color:#A3A3A3;">Mods, setup, year acquired, condition notes — anything that tells the full picture.</span></p>
              </div>

              <p style="margin:0;color:#A3A3A3;font-size:15px;">This is what makes TWNG special. Not just a database of guitars, but a collection of stories.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${guitarUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">TELL YOUR GUITAR'S STORY</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Your ${brand} ${model} is waiting for its story

Every guitar has a story, ${username}.

And that ${brand} ${model} in your hands? It's got one worth telling. Where did you find it? How long have you had it? What makes it special? Did you modify it? Does it have battle scars? Was it a dream guitar you finally saved up for?

Here's what we'd love to see:

PHOTOS
Full body shots, headstock, hardware, the details that make it yours.

THE STORY
How you got it. What it means to you. The journey it's been on.

THE DETAILS
Mods, setup, year acquired, condition notes — anything that tells the full picture.

This is what makes TWNG special. Not just a database of guitars, but a collection of stories.

Tell your guitar's story: ${guitarUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 3: Share Your Collection (triggered Day 3 after claim)
   * Encourage sharing collection with others
   */
  shareCollection: ({ username, collectionUrl }) => {
    const subject = "Your collection is looking good";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Your collection is coming together, ${username}.</p>

              <p style="margin:0 0 24px 0;">You've claimed your guitar, told its story, and now your collection page is live on TWNG. It's a space that shows off what you've built — the guitars, the stories, the care you put into it.</p>

              <p style="margin:0 0 24px 0;">Here's the thing: collections get better when they're shared. When people see what you're into, they'll share theirs. You'll make connections with other collectors who specialize in the same brands. You might discover guitars you didn't know existed. You might even inspire someone to start their own collection.</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:15px;font-weight:500;">A few ways to get the word out:</p>

              <ul style="margin:0 0 32px 0;padding-left:20px;color:#FAFAF9;line-height:1.8;">
                <li style="margin:0 0 12px 0;">Send the link to friends and fellow collectors who'd get it</li>
                <li style="margin:0 0 12px 0;">Share to your social media (we've got share buttons built in)</li>
                <li style="margin:0 0 0;">Invite other collectors to follow your collection and see what you add next</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${collectionUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">SHARE YOUR COLLECTION</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Your collection is looking good

Your collection is coming together, ${username}.

You've claimed your guitar, told its story, and now your collection page is live on TWNG. It's a space that shows off what you've built — the guitars, the stories, the care you put into it.

Here's the thing: collections get better when they're shared. When people see what you're into, they'll share theirs. You'll make connections with other collectors who specialize in the same brands. You might discover guitars you didn't know existed. You might even inspire someone to start their own collection.

A few ways to get the word out:
- Send the link to friends and fellow collectors who'd get it
- Share to your social media (we've got share buttons built in)
- Invite other collectors to follow your collection and see what you add next

Share your collection: ${collectionUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 4: Invite Fellow Collectors (triggered Day 7 after claim)
   * Encourage inviting others to the platform
   */
  inviteCollectors: ({ username, inviteUrl }) => {
    const subject = "Know someone who'd love this?";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">The best platforms grow with people who care, ${username}.</p>

              <p style="margin:0 0 24px 0;">You know that person (or people) who lights up when they talk about their guitars? The collector who somehow fits another one in the closet? The friend who can spend hours debating the specs of a vintage model?</p>

              <p style="margin:0 0 24px 0;">They'd love TWNG.</p>

              <p style="margin:0 0 24px 0;">TWNG is built for them. For people who don't just own guitars — they know them. Who care about the details. Who love sharing the stories. Who want to connect with other collectors who get it.</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:15px;">Invite them. Show them what you're building. Add them to your collector network. The more people on TWNG who care about guitars, the better it gets for everyone.</p>

              <p style="margin:0;color:#A3A3A3;font-size:15px;">Plus, we might have some cool benefits for referrals down the road. But honestly, the best part is building a community with people who care.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${inviteUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">INVITE A COLLECTOR</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Know someone who'd love this?

The best platforms grow with people who care, ${username}.

You know that person (or people) who lights up when they talk about their guitars? The collector who somehow fits another one in the closet? The friend who can spend hours debating the specs of a vintage model?

They'd love TWNG.

TWNG is built for them. For people who don't just own guitars — they know them. Who care about the details. Who love sharing the stories. Who want to connect with other collectors who get it.

Invite them. Show them what you're building. Add them to your collector network. The more people on TWNG who care about guitars, the better it gets for everyone.

Plus, we might have some cool benefits for referrals down the road. But honestly, the best part is building a community with people who care.

Invite a collector: ${inviteUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },
};

// ============================================================================
// RE-ENGAGEMENT SEQUENCE (System D)
// ============================================================================

export const reengagementSequence = {
  /**
   * Email 1: We Miss You (triggered at Day 14 of inactivity)
   * Warm, light check-in without guilt
   */
  missYou: ({ username, exploreUrl }) => {
    const subject = "Your guitars miss you";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Hey ${username} — we've missed you.</p>

              <p style="margin:0 0 24px 0;">It's been a minute since you've stopped by TWNG. No judgment — life happens. But we've got new guitars in the collection, new stories from collectors, and updates that might just catch your attention.</p>

              <p style="margin:0 0 24px 0;color:#A3A3A3;font-size:15px;font-weight:500;">What's new since you've been away:</p>

              <ul style="margin:0 0 32px 0;padding-left:20px;color:#FAFAF9;line-height:1.8;">
                <li style="margin:0 0 12px 0;"><span style="color:#D97706;">500+</span> new guitars documented</li>
                <li style="margin:0 0 12px 0;">Fresh stories from collectors in your favorite brands</li>
                <li style="margin:0 0 0;">Community highlights worth checking out</li>
              </ul>

              <p style="margin:0;color:#A3A3A3;font-size:15px;">Come explore. Your collection will be right where you left it.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${exploreUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">COME BACK AND EXPLORE</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Your guitars miss you

Hey ${username} — we've missed you.

It's been a minute since you've stopped by TWNG. No judgment — life happens. But we've got new guitars in the collection, new stories from collectors, and updates that might just catch your attention.

What's new since you've been away:
- 500+ new guitars documented
- Fresh stories from collectors in your favorite brands
- Community highlights worth checking out

Come explore. Your collection will be right where you left it.

Come back and explore: ${exploreUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 2: New in Your Brand (triggered at Day 21 of inactivity)
   * Personalized content about preferred brand
   */
  newInBrand: ({ username, preferredBrand, exploreUrl }) => {
    const subject = `New ${preferredBrand} guitars just documented`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Heads up, ${username}.</p>

              <p style="margin:0 0 24px 0;">We know you're into <strong>${preferredBrand}</strong>. And lately, collectors have been documenting some great ones. New models, rare years, interesting specs — the kind of guitars that make you scroll through late at night.</p>

              <p style="margin:0 0 24px 0;">There are also some new articles from our community about ${preferredBrand} setup, maintenance, and collecting tips. The kind of insights that come from people who actually know these guitars inside and out.</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:15px;font-weight:500;">What you might find interesting:</p>

              <ul style="margin:0 0 32px 0;padding-left:20px;color:#FAFAF9;line-height:1.8;">
                <li style="margin:0 0 12px 0;">12 new ${preferredBrand} guitars added this month</li>
                <li style="margin:0 0 12px 0;">Featured collection spotlight from a serious ${preferredBrand} enthusiast</li>
                <li style="margin:0 0 0;">Expert article: Collecting ${preferredBrand} across decades</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${exploreUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">SEE WHAT'S NEW</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `New ${preferredBrand} guitars just documented

Heads up, ${username}.

We know you're into ${preferredBrand}. And lately, collectors have been documenting some great ones. New models, rare years, interesting specs — the kind of guitars that make you scroll through late at night.

There are also some new articles from our community about ${preferredBrand} setup, maintenance, and collecting tips. The kind of insights that come from people who actually know these guitars inside and out.

What you might find interesting:
- 12 new ${preferredBrand} guitars added this month
- Featured collection spotlight from a serious ${preferredBrand} enthusiast
- Expert article: Collecting ${preferredBrand} across decades

See what's new: ${exploreUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },

  /**
   * Email 3: Featured Collection Spotlight (triggered at Day 30 of inactivity)
   * Community highlight and social proof
   */
  featuredSpotlight: ({ username, featuredUrl }) => {
    const subject = "This collector's story might inspire you";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#1C1917;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1917;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#292524;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header with logo -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <img src="https://shiny-muffin-21f968.netlify.app/images/twng-logo-email.svg" alt="TWNG" width="140" height="81" style="display:block;margin:0 auto;">
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:0 40px 32px;color:#FAFAF9;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px 0;font-size:18px;color:#D97706;font-weight:600;">Real quick, ${username}.</p>

              <p style="margin:0 0 24px 0;">We don't push much, but when we see a collection that deserves attention, we shine a light on it. There's a collector on TWNG whose build caught our eye — not because of the gear, but because of how they documented it. The stories are genuine. The attention to detail is real. The passion is unmissable.</p>

              <p style="margin:0 0 24px 0;">Sometimes seeing what someone else has built inspires you to dig deeper into your own collection. To add that guitar you've been thinking about. To tell the stories you haven't told yet.</p>

              <p style="margin:0 0 28px 0;color:#A3A3A3;font-size:15px;">This is one of those collections. Check it out. See what they're building. See how they told their stories. Then come back and add to yours.</p>

              <p style="margin:0;color:#A3A3A3;font-size:15px;font-style:italic;">No pressure. Just community, doing what it does best.</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${featuredUrl}" style="display:inline-block;padding:14px 48px;background-color:#D97706;color:#1C1917;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;transition:background-color 0.2s;">EXPLORE FEATURED COLLECTIONS</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #44403C;text-align:center;">
              <p style="color:#78716C;font-size:12px;margin:0 0 12px 0;">Every Guitar Has a Story · TWNG</p>
              <p style="color:#78716C;font-size:11px;margin:0;"><a href="#" style="color:#D97706;text-decoration:none;">Unsubscribe</a> · <a href="#" style="color:#D97706;text-decoration:none;">Email Preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `This collector's story might inspire you

Real quick, ${username}.

We don't push much, but when we see a collection that deserves attention, we shine a light on it. There's a collector on TWNG whose build caught our eye — not because of the gear, but because of how they documented it. The stories are genuine. The attention to detail is real. The passion is unmissable.

Sometimes seeing what someone else has built inspires you to dig deeper into your own collection. To add that guitar you've been thinking about. To tell the stories you haven't told yet.

This is one of those collections. Check it out. See what they're building. See how they told their stories. Then come back and add to yours.

No pressure. Just community, doing what it does best.

Explore featured collections: ${featuredUrl}

Every Guitar Has a Story · TWNG`;

    return { subject, html, text };
  },
};

// ============================================================================
// AUTH & TRANSACTIONAL IMPORTS
// ============================================================================

import { authTemplates, transactionalTemplates, authEmailTemplates } from './auth-templates';

// ============================================================================
// TEMPLATE MAPPING FOR EMAIL SERVICE
// ============================================================================

export const emailTemplates = {
  welcome: {
    welcome: welcomeSequence.welcome,
    completeProfile: welcomeSequence.completeProfile,
    firstGuitar: welcomeSequence.addFirstGuitar,
    community: welcomeSequence.exploreConnect,
  },
  claim: {
    claimApproved: claimSequence.claimConfirmed,
    addMoreGuitars: claimSequence.addPhotosStory,
    buildCollection: claimSequence.shareCollection,
    exploreFeatures: claimSequence.inviteCollectors,
    claimDenied: transactionalTemplates.claimDenied,
    claimPendingReview: transactionalTemplates.claimPendingReview,
  },
  reengagement: {
    comeBack: reengagementSequence.missYou,
    newFeatures: reengagementSequence.newInBrand,
    exclusiveOffer: reengagementSequence.featuredSpotlight,
  },
  auth: {
    passwordReset: authTemplates.passwordReset,
    magicLink: authTemplates.magicLink,
    confirmSignup: authTemplates.confirmSignup,
    changeEmail: authTemplates.changeEmail,
  },
};

// ============================================================================
// EXPORT ALL SEQUENCES
// ============================================================================

export const ALL_SEQUENCES = {
  welcome: welcomeSequence,
  claim: claimSequence,
  reengagement: reengagementSequence,
};

// Re-export auth templates for direct use
export { authTemplates, transactionalTemplates, authEmailTemplates };
