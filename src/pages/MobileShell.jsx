import { useState } from "react";
import {
  Home, Search, Plus, MessageSquare, User, Menu, X, Bell, Guitar,
  Heart, Shield, BookOpen, Users, Wrench, Settings, HelpCircle,
  LogOut, ChevronRight, Camera, Upload, FileText
} from "lucide-react";
import { T } from '../theme/tokens';

const IMG = {
  logo: "/images/twng-logo.svg",
  artist: "/images/artists/download-1.jpg",
};

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "explore", label: "Explore", icon: Search },
  { key: "add", label: "Add", icon: Plus, accent: true },
  { key: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { key: "profile", label: "Profile", icon: User },
];

const MENU_SECTIONS = [
  {
    title: "Collection",
    items: [
      { label: "My Guitars", icon: Guitar, badge: "8" },
      { label: "Loved Guitars", icon: Heart },
      { label: "Verified", icon: Shield, badge: "5" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Forum", icon: MessageSquare },
      { label: "Articles", icon: BookOpen },
      { label: "Luthier Directory", icon: Wrench },
      { label: "People", icon: Users },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", icon: Settings },
      { label: "Help & Support", icon: HelpCircle },
      { label: "Log Out", icon: LogOut },
    ],
  },
];

// NotifDot Component
function NotifDot({ count }) {
  if (!count) return null;
  return (
    <span
      style={{
        position: "absolute",
        top: "-4px",
        right: "-8px",
        minWidth: "16px",
        height: "16px",
        borderRadius: "8px",
        background: T.amber,
        color: T.bgDeep,
        fontSize: "9px",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
      }}
    >
      {count}
    </span>
  );
}

// Bottom Sheet Component
function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "#00000080",
          zIndex: 100,
          transition: "opacity 0.3s",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          background: T.bgCard,
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease-out",
          maxWidth: "430px",
          margin: "0 auto",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* Handle Bar */}
        <div
          style={{
            padding: "12px 0 8px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: T.border,
            }}
          />
        </div>

        {/* Title Section */}
        {title && (
          <div
            style={{
              padding: "0 20px 12px",
              borderBottom: "1px solid " + T.border,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                fontWeight: 600,
                color: T.txt,
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: T.txt2,
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px 32px",
          }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

// Add Guitar Bottom Sheet
function AddGuitarSheet({ open, onClose }) {
  const options = [
    {
      title: "Magic Add",
      description: "AI identifies your guitar from a photo",
      icon: Camera,
      accent: true,
    },
    {
      title: "Manual Entry",
      description: "Enter your guitar details step by step",
      icon: Guitar,
    },
    {
      title: "Import from File",
      description: "Upload a guitar data file",
      icon: Upload,
    },
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Guitar">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {options.map((item, idx) => {
          const IconComponent = item.icon;
          const isAccent = item.accent;
          return (
            <button
              key={idx}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px",
                borderRadius: "12px",
                background: isAccent ? T.warm + "10" : T.bgElev,
                border: "1px solid " + (isAccent ? T.borderAcc : T.border),
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isAccent
                  ? T.warm + "20"
                  : T.bgCard;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isAccent
                  ? T.warm + "10"
                  : T.bgElev;
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: isAccent ? T.warm + "20" : T.bgCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isAccent ? T.warm : T.txt2,
                  flexShrink: 0,
                }}
              >
                <IconComponent size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontWeight: 600,
                    color: T.txt,
                    fontSize: "15px",
                    margin: 0,
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: T.txtM,
                    margin: "4px 0 0 0",
                  }}
                >
                  {item.description}
                </p>
              </div>
              <ChevronRight
                size={16}
                style={{
                  color: T.txtM,
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// Fixed Header
function HeaderBar({ menuOpen, onMenuToggle, notificationCount }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: T.bgDeep + "E6",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid " + T.border,
        height: "52px",
      }}
    >
      <div
        style={{
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
        {/* Hamburger Menu */}
        <button
          onClick={onMenuToggle}
          style={{
            padding: "8px",
            borderRadius: "8px",
            background: "transparent",
            border: "none",
            color: T.txt2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = T.txt)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.txt2)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* TWNG Logo */}
        <img
          src={IMG.logo}
          alt="TWNG"
          style={{
            height: "24px",
            filter: "brightness(0) invert(1)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        />

        {/* Right Actions */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* Notification Bell */}
          <button
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "transparent",
              border: "none",
              color: T.txt2,
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.txt)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.txt2)}
          >
            <Bell size={18} />
            <NotifDot count={notificationCount} />
          </button>

          {/* User Avatar */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid " + T.borderAcc,
              backgroundColor: T.bgElev,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={IMG.artist}
              alt="User"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Hamburger Menu
function SlideOutMenu({ open, onClose }) {
  return (
    <>
      {open && (
        <>
          <div
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "#00000060",
              zIndex: 45,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "280px",
              background: T.bgCard,
              zIndex: 50,
              padding: "24px 0",
              borderRight: "1px solid " + T.border,
              animation: "slideIn 0.25s ease-out",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* User Info Section */}
            <div
              style={{
                padding: "0 20px 20px",
                borderBottom: "1px solid " + T.border,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid " + T.borderAcc,
                    backgroundColor: T.bgElev,
                  }}
                >
                  <img
                    src={IMG.artist}
                    alt="User"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: T.txt,
                      fontSize: "15px",
                      margin: 0,
                    }}
                  >
                    Ronen B
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: T.txtM,
                      margin: 0,
                    }}
                  >
                    @ronen_b
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                <span>
                  <strong style={{ color: T.txt }}>8</strong>{" "}
                  <span style={{ color: T.txtM }}>guitars</span>
                </span>
              </div>
            </div>

            {/* Menu Sections */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {MENU_SECTIONS.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      padding: "0 20px",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: T.txtM,
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      margin: 0,
                      paddingBottom: "8px",
                    }}
                  >
                    {section.title}
                  </p>
                  {section.items.map((item, iIdx) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={iIdx}
                        onClick={onClose}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 20px",
                          background: "transparent",
                          border: "none",
                          color: T.txt2,
                          fontSize: "14px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = T.txt;
                          e.currentTarget.style.background = T.bgElev;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = T.txt2;
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ color: T.txtM, display: "flex" }}>
                          <IconComponent size={18} />
                        </span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "11px",
                              color: T.warm,
                              background: T.warm + "15",
                              padding: "2px 8px",
                              borderRadius: "99px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          size={14}
                          style={{ color: T.border }}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  );
}

// Bottom Tab Navigation
function BottomTabBar({ activeTab, onTabClick }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "430px",
        background: T.bgDeep + "F2",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid " + T.border,
        zIndex: 40,
        padding: "0 8px",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "56px",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.key;
          const isAccent = item.accent;

          return (
            <button
              key={item.key}
              onClick={() => onTabClick(item.key)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                padding: isAccent ? 0 : "6px 12px",
                background: isAccent
                  ? T.warm
                  : "transparent",
                borderRadius: isAccent ? "50%" : "8px",
                border: "none",
                color: isAccent
                  ? T.bgDeep
                  : isActive
                    ? T.amber
                    : T.txtM,
                cursor: "pointer",
                position: "relative",
                width: isAccent ? "44px" : "auto",
                height: isAccent ? "44px" : "auto",
                boxShadow: isAccent
                  ? `0 4px 12px ${T.warm}40`
                  : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isAccent) {
                  e.currentTarget.style.color = T.txt;
                }
              }}
              onMouseLeave={(e) => {
                if (!isAccent) {
                  e.currentTarget.style.color = isActive
                    ? T.amber
                    : T.txtM;
                }
              }}
            >
              <IconComponent size={20} />
              {!isAccent && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              )}
              {item.badge && !isAccent && (
                <NotifDot count={item.badge} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Demo Page Content
function HomePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "24px",
          fontWeight: 700,
          color: T.txt,
          marginBottom: "16px",
          margin: "0 0 16px 0",
        }}
      >
        Home Feed
      </h2>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            padding: "16px",
            background: T.bgCard,
            borderRadius: "12px",
            border: "1px solid " + T.border,
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: T.bgElev,
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  fontWeight: 600,
                  color: T.txt,
                  fontSize: "13px",
                  margin: 0,
                }}
              >
                @user_{i}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: T.txtM,
                  margin: 0,
                }}
              >
                {i} hour{i > 1 ? "s" : ""} ago
              </p>
            </div>
          </div>
          <div
            style={{
              height: "180px",
              borderRadius: "8px",
              background: T.bgElev,
              marginBottom: "10px",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: T.txtM,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Heart size={12} /> {i * 23}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: T.txtM,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MessageSquare size={12} /> {i * 5}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        color: T.txtM,
        textAlign: "center",
        padding: "40px",
      }}
    >
      <div>
        <Guitar
          size={48}
          style={{
            opacity: 0.2,
            marginBottom: "16px",
          }}
        />
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "20px",
            color: T.txt,
            marginBottom: "8px",
            margin: 0,
            marginBottom: "8px",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "14px",
            margin: 0,
          }}
        >
          This page is available as a standalone artifact
        </p>
      </div>
    </div>
  );
}

// Main Mobile Shell Component
export default function TWNGMobileShell() {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const handleTabClick = (key) => {
    if (key === "add") {
      setAddSheetOpen(true);
    } else {
      setActiveTab(key);
      setMenuOpen(false);
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div
      style={{
        background: T.bgDeep,
        color: T.txt,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100vh",
        maxWidth: "430px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Global Styles */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          background: ${T.bgDeep};
          font-family: 'DM Sans', sans-serif;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        -ms-overflow-style: none;
        scrollbar-width: none;
      `}</style>

      {/* Header */}
      <HeaderBar
        menuOpen={menuOpen}
        onMenuToggle={handleMenuToggle}
        notificationCount={2}
      />

      {/* Slide-out Menu */}
      <SlideOutMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Page Content */}
      <div style={{ paddingBottom: "72px" }}>
        {activeTab === "home" && <HomePage />}
        {activeTab === "explore" && <PlaceholderPage title="Explore" />}
        {activeTab === "messages" && <PlaceholderPage title="Messages" />}
        {activeTab === "profile" && <PlaceholderPage title="Profile" />}
      </div>

      {/* Bottom Tab Navigation */}
      <BottomTabBar activeTab={activeTab} onTabClick={handleTabClick} />

      {/* Add Guitar Bottom Sheet */}
      <AddGuitarSheet open={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
    </div>
  );
}
