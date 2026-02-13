import { useParams, Link } from 'react-router-dom';
import { T } from '../theme/tokens';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../lib/routes';

/* ─── Legal content for each page ─── */
const PAGES = {
  terms: {
    title: "Terms of Service",
    lastUpdated: "February 8, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: `By accessing or using the TWNG platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service. TWNG reserves the right to update these terms at any time, and continued use constitutes acceptance of the updated terms.`
      },
      {
        heading: "2. Description of Service",
        body: `TWNG is a guitar documentation platform that enables users to catalog, share, and explore musical instruments. Features include photo uploads, AI-powered guitar identification ("Magic Add"), serial number decoding, community forums, messaging, instrument transfers, and luthier directory services.`
      },
      {
        heading: "3. User Accounts",
        body: `You must create an account to access most features. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must provide accurate information and promptly update it if it changes. You must be at least 13 years of age to create an account.`
      },
      {
        heading: "4. User Content",
        body: `You retain ownership of content you upload (photos, descriptions, stories). By uploading content, you grant TWNG a non-exclusive, worldwide license to display, reproduce, and distribute your content within the platform. You represent that you have the right to share any content you upload and that it does not infringe on any third party's rights.`
      },
      {
        heading: "5. Instrument Documentation & Transfers",
        body: `TWNG facilitates the documentation and transfer of guitar ownership records within the platform. TWNG does not verify physical ownership of instruments and makes no guarantees regarding the accuracy of user-submitted information. Transfers recorded on TWNG are informational and do not constitute legal proof of ownership.`
      },
      {
        heading: "6. AI-Powered Features",
        body: `The Magic Add feature uses artificial intelligence to identify guitars from photos. AI results are provided as suggestions only and may contain errors. Users are responsible for verifying and correcting any AI-generated information before publishing it to their profile.`
      },
      {
        heading: "7. Prohibited Conduct",
        body: `You may not: use the Service for any unlawful purpose; upload false, misleading, or fraudulent instrument information; harass, abuse, or threaten other users; attempt to gain unauthorized access to the Service; scrape or collect data from the Service without permission; use automated tools to interact with the Service; or impersonate another person or entity.`
      },
      {
        heading: "8. Intellectual Property",
        body: `The TWNG platform, including its design, logos, and software, is owned by TWNG and protected by intellectual property laws. User-generated content remains the property of its respective creators, subject to the license granted in Section 4.`
      },
      {
        heading: "9. Termination",
        body: `TWNG may suspend or terminate your account at any time for violation of these terms. You may delete your account at any time through the Settings page. Upon termination, your right to use the Service ceases immediately, though certain provisions of these terms will survive termination.`
      },
      {
        heading: "10. Disclaimer of Warranties",
        body: `The Service is provided "as is" without warranties of any kind, either express or implied. TWNG does not warrant that the Service will be uninterrupted, error-free, or that AI identification results will be accurate. TWNG is not responsible for the accuracy of user-submitted instrument data.`
      },
      {
        heading: "11. Limitation of Liability",
        body: `To the maximum extent permitted by law, TWNG shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. TWNG's total liability shall not exceed the amount you paid to TWNG in the twelve months preceding the claim.`
      },
      {
        heading: "12. Contact",
        body: `For questions about these Terms of Service, contact us at legal@twng.com.`
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    lastUpdated: "February 8, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: `We collect information you provide directly: account details (name, email, username), profile information (bio, location, social links), guitar documentation data (photos, specs, stories), and community content (forum posts, messages). We also collect usage data automatically, including pages visited, features used, and device information.`
      },
      {
        heading: "2. How We Use Your Information",
        body: `We use your information to: provide and maintain the Service; process AI guitar identification; enable community features (forums, messaging); send notifications you've opted into; improve the platform and develop new features; and ensure security and prevent fraud.`
      },
      {
        heading: "3. Data Storage & Security",
        body: `Your data is stored securely using Supabase infrastructure with row-level security policies. Photos are stored in encrypted cloud storage. We use industry-standard security measures to protect your personal information. Authentication is handled through secure token-based sessions stored in your browser's local storage.`
      },
      {
        heading: "4. Data Sharing",
        body: `We do not sell your personal information. Your public profile and guitar documentation are visible to other users as you configure. We may share data with: service providers who assist in operating the platform (hosting, AI processing); and law enforcement when required by law.`
      },
      {
        heading: "5. Your Rights",
        body: `You have the right to: access your personal data; correct inaccurate data; export your data (available in Settings > Data); delete your account and associated data; and opt out of non-essential communications. To exercise these rights, visit your Settings page or contact privacy@twng.com.`
      },
      {
        heading: "6. Data Retention",
        body: `We retain your data for as long as your account is active. When you delete your account, we remove your personal data within 30 days. Some data may be retained in anonymized form for analytics purposes. Backup copies may persist for up to 90 days after deletion.`
      },
      {
        heading: "7. Third-Party Services",
        body: `TWNG integrates with third-party services including: Supabase (database and authentication), cloud AI services (guitar image analysis), and cloud storage providers (photo hosting). Each service has its own privacy policy governing their use of data.`
      },
      {
        heading: "8. Children's Privacy",
        body: `TWNG is not intended for children under 13. We do not knowingly collect information from children under 13. If we learn we have collected such information, we will promptly delete it.`
      },
      {
        heading: "9. Changes to This Policy",
        body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of the Service after changes constitutes acceptance of the updated policy.`
      },
      {
        heading: "10. Contact",
        body: `For privacy-related questions or requests, contact us at privacy@twng.com.`
      },
    ],
  },

  cookies: {
    title: "Cookie Policy",
    lastUpdated: "February 8, 2026",
    sections: [
      {
        heading: "1. Overview",
        body: `TWNG primarily uses browser local storage rather than traditional cookies to maintain your session and preferences. This policy explains what data is stored in your browser and how it is used.`
      },
      {
        heading: "2. What We Store Locally",
        body: `Authentication tokens: Secure session tokens managed by Supabase are stored in your browser's local storage to keep you signed in. Theme preference: Your chosen display theme (light or dark mode) is stored locally so the platform remembers your preference. These are essential for the platform to function and cannot be disabled.`
      },
      {
        heading: "3. Third-Party Storage",
        body: `Our infrastructure provider (Supabase) may set minimal cookies or local storage entries required for authentication and security. These are strictly necessary and are not used for tracking or advertising purposes.`
      },
      {
        heading: "4. Analytics",
        body: `TWNG does not currently use third-party analytics cookies or tracking pixels. If we introduce analytics in the future, we will update this policy and provide appropriate opt-out mechanisms.`
      },
      {
        heading: "5. No Advertising Cookies",
        body: `TWNG does not use advertising cookies, tracking cookies, or any form of cross-site tracking. We do not share browsing data with advertisers or data brokers.`
      },
      {
        heading: "6. Managing Your Data",
        body: `You can clear your locally stored data at any time through your browser settings. Note that clearing authentication tokens will sign you out of TWNG. You can also delete your account entirely through Settings > Data > Delete Account.`
      },
      {
        heading: "7. Contact",
        body: `For questions about our data storage practices, contact us at privacy@twng.com.`
      },
    ],
  },

  dmca: {
    title: "DMCA Policy",
    lastUpdated: "February 8, 2026",
    sections: [
      {
        heading: "1. Copyright Respect",
        body: `TWNG respects the intellectual property rights of others and expects our users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and will respond promptly to notices of alleged copyright infringement.`
      },
      {
        heading: "2. Reporting Copyright Infringement",
        body: `If you believe that content on TWNG infringes your copyright, please send a DMCA takedown notice to our designated agent with the following information: a description of the copyrighted work; identification of the infringing material and its location on TWNG; your contact information; a statement that you have a good faith belief the use is not authorized; and a statement under penalty of perjury that the information is accurate and you are the copyright owner or authorized to act on their behalf.`
      },
      {
        heading: "3. Designated Agent",
        body: `DMCA notices should be sent to: TWNG DMCA Agent, email: dmca@twng.com. Please include "DMCA Notice" in the subject line.`
      },
      {
        heading: "4. Counter-Notification",
        body: `If you believe your content was wrongly removed due to a DMCA notice, you may file a counter-notification with: identification of the removed material; a statement under penalty of perjury that you have a good faith belief the material was removed by mistake; your name, address, and phone number; and a statement consenting to jurisdiction. Counter-notifications should be sent to the same designated agent.`
      },
      {
        heading: "5. Repeat Infringers",
        body: `TWNG will terminate the accounts of users who are repeat copyright infringers. We maintain records of DMCA notices and will act upon repeat violations.`
      },
      {
        heading: "6. User-Submitted Content",
        body: `Users are solely responsible for ensuring that photos, descriptions, and other content they upload to TWNG do not infringe on any third party's copyrights. By uploading content, users represent that they own or have permission to use all uploaded materials.`
      },
      {
        heading: "7. Good Faith",
        body: `Please note that under the DMCA, any person who knowingly misrepresents that material is infringing may be subject to liability. If you are unsure whether material infringes your copyright, we recommend consulting an attorney before filing a notice.`
      },
    ],
  },
};

/* ─── Component ─── */
export default function Legal() {
  const { page } = useParams();
  const content = PAGES[page];

  if (!content) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: T.txt }}>Page Not Found</h1>
        <Link to={ROUTES.HOME} style={{ color: T.warm, textDecoration: "none" }}>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* Back link */}
      <Link to={ROUTES.HOME} style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        color: T.txt2, textDecoration: "none", fontSize: "13px",
        marginBottom: "32px",
      }}>
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "32px", fontWeight: 700, color: T.txt,
        marginBottom: "8px",
      }}>
        {content.title}
      </h1>
      <p style={{ fontSize: "13px", color: T.txtM, marginBottom: "40px" }}>
        Last updated: {content.lastUpdated}
      </p>

      {/* Sections */}
      {content.sections.map((section, i) => (
        <div key={i} style={{ marginBottom: "32px" }}>
          <h2 style={{
            fontSize: "16px", fontWeight: 700, color: T.txt,
            marginBottom: "10px",
          }}>
            {section.heading}
          </h2>
          <p style={{
            fontSize: "14px", lineHeight: "1.7", color: T.txt2,
          }}>
            {section.body}
          </p>
        </div>
      ))}

      {/* Footer note */}
      <div style={{
        borderTop: `1px solid ${T.border}`, paddingTop: "24px", marginTop: "16px",
      }}>
        <p style={{ fontSize: "12px", color: T.txtM }}>
          © 2026 TWNG. All rights reserved. For questions about this document, contact{" "}
          <a href="mailto:legal@twng.com" style={{ color: T.warm, textDecoration: "none" }}>legal@twng.com</a>.
        </p>
      </div>
    </div>
  );
}
