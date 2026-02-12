import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, Plus, Settings, LogOut, Shield, Sun, Moon, MessageSquare } from 'lucide-react';
import { T } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';
import NotificationDropdown from '../ui/NotificationDropdown';
import MessageDropdown from '../ui/MessageDropdown';
import GlobalSearchBar from '../GlobalSearchBar';

const BASE_NAV_LINKS = [
  { label: "Explore", path: "/explore" },
  { label: "Collections", path: "/collections" },
  { label: "Articles", path: "/articles" },
  { label: "Forum", path: "/forum" },
];

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout, isStaff } = useAuth();
  const { isDark, toggleTheme, tokens: TH } = useTheme();

  // Build nav links — add Admin for staff users
  const navLinks = useMemo(() => {
    const links = [...BASE_NAV_LINKS];
    if (isStaff) {
      links.push({ label: "Admin", path: "/admin" });
    }
    return links;
  }, [isStaff]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Close user menu on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const showBg = scrolled || !transparent;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.3s ease",
        backgroundColor: showBg ? TH.bgDeep + "E6" : "transparent",
        borderBottom: `1px solid ${showBg ? TH.border : "transparent"}`,
        backdropFilter: showBg ? "blur(40px)" : "none",
      }}>
        <div style={{
          maxWidth: "80rem", margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "64px",
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <Logo size={28} showBeta />
          </Link>

          {/* Desktop Nav Links */}
          <div style={{
            display: "flex", alignItems: "center", gap: "32px",
          }} className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: "14px", fontWeight: "500",
                  textDecoration: "none", transition: "color 0.2s",
                  color: location.pathname.startsWith(link.path) ? TH.warm : TH.txt2,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
          }} className="desktop-nav">
            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Search (Ctrl+K)"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "40px", height: "40px", borderRadius: "8px",
                border: `1px solid ${TH.border}`, backgroundColor: TH.bgCard,
                color: TH.txt, cursor: "pointer", transition: "all 0.2s",
                padding: 0,
              }}
            >
              <Search size={18} strokeWidth={2} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "40px", height: "40px", borderRadius: "8px",
                border: `1px solid ${TH.border}`, backgroundColor: TH.bgCard,
                color: TH.txt, cursor: "pointer", transition: "all 0.2s",
                padding: 0,
              }}
            >
              {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </button>

            {!isAuthenticated ? (
              <>
                <Link to="/auth" style={{
                  padding: "8px 16px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: "500",
                  color: T.txt2, border: `1px solid ${T.border}`,
                  textDecoration: "none", transition: "all 0.2s",
                }}>
                  Sign In
                </Link>
                <Link to="/auth" style={{
                  padding: "8px 16px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: "600",
                  backgroundColor: T.warm, color: T.bgDeep,
                  textDecoration: "none", border: "none",
                  transition: "all 0.2s",
                }}>
                  Join TWNG
                </Link>
              </>
            ) : (
              <>
                {/* Notifications dropdown */}
                <NotificationDropdown />

                {/* Messages dropdown */}
                <MessageDropdown />

                {/* Add Instrument */}
                <Link to="/instrument/new" style={{
                  padding: "8px 16px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: "600",
                  backgroundColor: T.warm, color: T.bgDeep,
                  display: "flex", alignItems: "center", gap: "6px",
                  textDecoration: "none", border: "none",
                  transition: "all 0.2s",
                }}>
                  <Plus size={16} />
                  Add Instrument
                </Link>

                {/* User menu */}
                <div ref={userMenuRef} style={{ position: "relative" }}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="User menu" aria-expanded={userMenuOpen} style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    backgroundColor: T.warm, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    border: userMenuOpen ? `2px solid ${T.borderAcc}` : "2px solid transparent",
                    transition: "all 0.2s", cursor: "pointer",
                    color: "white", fontWeight: "600", fontSize: "16px",
                    padding: 0, overflow: "hidden",
                  }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile?.display_name} style={{
                        width: "100%", height: "100%", borderRadius: "50%",
                        objectFit: "cover",
                      }} />
                    ) : (
                      profile?.display_name?.charAt(0).toUpperCase() || "U"
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      width: "220px", borderRadius: "12px",
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      overflow: "hidden", zIndex: 100,
                    }}>
                      {/* User info header */}
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: T.txt, margin: 0 }}>
                          {profile?.display_name || "User"}
                        </p>
                        <p style={{ fontSize: "12px", color: T.txtM, margin: "2px 0 0" }}>
                          @{profile?.username || "user"}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div style={{ padding: "6px" }}>
                        <button onClick={() => navigate(`/user/${profile?.username || profile?.email?.split('@')[0] || 'me'}`)} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px", border: "none",
                          background: "transparent", color: T.txt, fontSize: "13px",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }} onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <User size={15} color={T.txtM} /> My Profile
                        </button>

                        <button onClick={() => navigate("/my-instruments")} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px", border: "none",
                          background: "transparent", color: T.txt, fontSize: "13px",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }} onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          🎸 My Instruments
                        </button>

                        <button onClick={() => navigate("/my-collections")} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px", border: "none",
                          background: "transparent", color: T.txt, fontSize: "13px",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }} onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          📁 My Collections
                        </button>

                        <button onClick={() => navigate("/my-favorites")} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px", border: "none",
                          background: "transparent", color: T.txt, fontSize: "13px",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }} onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          ❤️ Favorites
                        </button>

                        <button onClick={() => navigate("/settings")} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px", border: "none",
                          background: "transparent", color: T.txt, fontSize: "13px",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }} onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Settings size={15} color={T.txtM} /> Settings
                        </button>

                        {isStaff && (
                          <button onClick={() => navigate("/admin")} style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 12px", borderRadius: "8px", border: "none",
                            background: "transparent", color: T.txt, fontSize: "13px",
                            cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                          }} onMouseEnter={e => e.currentTarget.style.background = T.bgElev}
                             onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Shield size={15} color={T.txtM} /> Admin Console
                          </button>
                        )}
                      </div>

                      {/* Sign out */}
                      <div style={{ padding: "6px", borderTop: `1px solid ${T.border}` }}>
                        <button onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          navigate("/");
                        }} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px", border: "none",
                          background: "transparent", color: "#F87171", fontSize: "13px",
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                        }} onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Action Bar */}
          <div className="mobile-nav" style={{ display: "none", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Search"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "8px",
                border: `1px solid ${TH.border}`, backgroundColor: TH.bgCard,
                color: TH.txt, cursor: "pointer", transition: "all 0.2s",
                padding: 0,
              }}
            >
              <Search size={18} strokeWidth={2} />
            </button>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "8px",
                border: `1px solid ${TH.border}`, backgroundColor: TH.bgCard,
                color: TH.txt, cursor: "pointer", transition: "all 0.2s",
                padding: 0,
              }}
            >
              {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </button>
            {isAuthenticated && (
              <>
                <NotificationDropdown />
                <MessageDropdown />
              </>
            )}
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              style={{
                padding: "8px", border: "none",
                backgroundColor: "transparent", color: T.txt, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Global Search Bar (slides down below nav) */}
        {showSearch && (
          <div style={{
            maxWidth: "40rem", margin: "0 auto", padding: "0 24px 12px",
          }}>
            <GlobalSearchBar />
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 45,
          backgroundColor: TH.bgDeep + "F5",
          backdropFilter: "blur(40px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "24px",
          paddingTop: "80px",
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: "20px", fontWeight: "500",
                textDecoration: "none",
                color: location.pathname.startsWith(link.path) ? TH.warm : TH.txt,
              }}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <Link to="/auth" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                border: `1px solid ${T.border}`, backgroundColor: "transparent",
                color: T.txt2, textDecoration: "none",
              }}>Sign In</Link>
              <Link to="/auth" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                fontWeight: "600", backgroundColor: T.warm,
                color: T.bgDeep, textDecoration: "none", border: "none",
              }}>Join TWNG</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", width: "100%", maxWidth: "300px" }}>
              <Link to="/my-instruments" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                textDecoration: "none", color: T.txt, textAlign: "center",
              }}>My Instruments</Link>
              <Link to="/my-collections" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                textDecoration: "none", color: T.txt, textAlign: "center",
              }}>My Collections</Link>
              <Link to="/instrument/new" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                fontWeight: "600", backgroundColor: T.warm,
                color: T.bgDeep, textDecoration: "none", border: "none", textAlign: "center",
              }}>Add Instrument</Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                textDecoration: "none", color: T.txt, textAlign: "center",
              }}>Messages</Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                textDecoration: "none", color: T.txt, textAlign: "center",
              }}>Settings</Link>
              <button onClick={async () => {
                await logout();
                setMenuOpen(false);
              }} style={{
                padding: "12px 24px", borderRadius: "8px", fontSize: "16px",
                border: `1px solid ${T.border}`, backgroundColor: "transparent",
                color: T.txt2, cursor: "pointer", textAlign: "center",
              }}>Sign Out</button>
            </div>
          )}
        </div>
      )}

      {/* CSS for responsive show/hide */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
