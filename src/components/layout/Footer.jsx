import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { T } from '../../theme/tokens';
import Logo from '../ui/Logo';
import { ROUTES } from '../../lib/routes';

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "Explore Guitars", path: ROUTES.EXPLORE },
      { label: "Collections", path: ROUTES.COLLECTIONS },
      { label: "Magic Add", path: ROUTES.INSTRUMENT_NEW },
      { label: "Serial Decoder", path: ROUTES.DECODER },
      { label: "Luthier Directory", path: ROUTES.COMMUNITY },
      { label: "Community Forum", path: ROUTES.COMMUNITY },
      { label: "Founding Members", path: ROUTES.FOUNDING_MEMBERS },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Articles", path: ROUTES.ARTICLES },
      { label: "Guides", path: ROUTES.ARTICLES },
      { label: "Interviews", path: ROUTES.ARTICLES },
      { label: "Brand Histories", path: ROUTES.ARTICLES },
      { label: "FAQ", path: ROUTES.FAQ },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About TWNG", path: ROUTES.ABOUT },
      { label: "Careers", path: ROUTES.ABOUT },
      { label: "Press", path: ROUTES.ABOUT },
      { label: "Contact", path: ROUTES.ABOUT },
      { label: "API (Coming Soon)", path: ROUTES.ABOUT },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", path: "/legal/terms" },
      { label: "Privacy Policy", path: "/legal/privacy" },
      { label: "Cookie Policy", path: "/legal/cookies" },
      { label: "DMCA", path: "/legal/dmca" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, backgroundColor: T.bgCard }}>
      <div style={{
        maxWidth: "80rem", margin: "0 auto", padding: "64px 24px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px", marginBottom: "48px",
        }}>
          {/* Brand Column */}
          <div>
            <div style={{ marginBottom: "12px" }}>
              <Logo size={24} />
            </div>
            <p style={{ fontSize: "14px", lineHeight: "1.625", maxWidth: "20rem", color: T.txt2 }}>
              The guitar documentation platform for collectors, musicians, and luthiers.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {[
                { Icon: Instagram, url: "#", label: "Follow us on Instagram" },
                { Icon: Twitter, url: "#", label: "Follow us on Twitter" },
                { Icon: Youtube, url: "#", label: "Subscribe on YouTube" }
              ].map(({ Icon, url, label }, i) => (
                <a key={i} href={url} aria-label={label} style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${T.border}`, color: T.txtM,
                  transition: "all 0.2s", textDecoration: "none",
                  cursor: url === "#" ? "default" : "pointer"
                }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map(col => (
            <div key={col.title}>
              <h4 style={{
                fontSize: "12px", fontWeight: "600", textTransform: "uppercase",
                marginBottom: "16px", fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em", color: T.txtM,
              }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {col.links.map(link => (
                  <li key={link.label} style={{ marginBottom: "10px" }}>
                    {link.path.startsWith("/") ? (
                      <Link to={link.path} style={{
                        fontSize: "14px", color: T.txt2,
                        textDecoration: "none", transition: "color 0.2s",
                      }}>{link.label}</Link>
                    ) : (
                      <a href={link.path} style={{
                        fontSize: "14px", color: T.txt2,
                        textDecoration: "none", transition: "color 0.2s",
                      }}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${T.border}`, paddingTop: "24px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{
            fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: T.txtM,
          }}>© 2026 TWNG. All rights reserved.</p>
          <p style={{ fontSize: "12px", color: T.txtM }}>
            Made with ♥ for guitar lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
