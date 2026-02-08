import { useState } from "react";
import { ChevronDown, HelpCircle, Shield, CreditCard, Rocket, Camera, Database, Monitor, User, MessageSquare, Lock, Heart, ArrowLeft, Mail } from "lucide-react";
import { T } from '../theme/tokens';

const faqData = [
  {
    id: "about",
    title: "About TWNG",
    icon: HelpCircle,
    questions: [
      {
        q: "What is TWNG?",
        a: "TWNG is a place to keep your guitars — specs, photos, serial numbers, and the stories behind them. Think of it as a home for your collection."
      },
      {
        q: 'Why "TWNG"?',
        a: 'It\'s short for "twang" — the sound a guitar makes. Simple, memorable, and unmistakably guitar.'
      },
      {
        q: "Who is TWNG for?",
        a: "Anyone who owns a guitar and wants to remember it properly. Whether you have one guitar with a story or fifty with histories — TWNG is for you."
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Sharing",
    icon: Shield,
    questions: [
      {
        q: "Is my collection private?",
        a: "You decide. When you add a guitar, you choose who can see it:\n\n• Private — Only you can see it\n• Link sharing — Anyone with the link can view\n• Public — Visible in community/search\n\nYou're in complete control. Change anytime."
      },
      {
        q: "Do I have to share anything?",
        a: "No. You never have to share anything. TWNG works perfectly as your private vault. Sharing is always optional."
      },
      {
        q: "Can I change privacy per guitar?",
        a: "Yes. Each guitar has its own privacy setting. Keep some private, share others — mix and match however you like."
      },
      {
        q: "What's the default privacy setting?",
        a: "Private by default. Nothing is shared unless you choose to share it."
      },
      {
        q: "Can I make my whole collection public?",
        a: "Yes. You can set a collection-wide default, or go guitar by guitar. Your choice."
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing — It's Free",
    icon: CreditCard,
    questions: [
      {
        q: "Is TWNG free?",
        a: "Yes. Completely free. Add unlimited guitars. No catch. No credit card. No trial that expires."
      },
      {
        q: "Wait, unlimited guitars for free?",
        a: "Yes. Upload as many guitars as you want. 5 guitars, 50 guitars, 500 guitars — all free, forever."
      },
      {
        q: "How does TWNG make money then?",
        a: "We're focused on building something useful first. In the future, we may offer premium services (advanced features, integrations, professional tools) — but keeping your guitars will always be free."
      },
      {
        q: "Will you add limits later?",
        a: "No. We believe your guitar collection shouldn't have a paywall. Future premium features will be add-ons, not restrictions on what you already have."
      },
      {
        q: "Is there a Pro version?",
        a: "Not yet. When we introduce premium features, they'll be genuinely useful extras — not artificial limits on free users."
      },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    questions: [
      {
        q: "Do I need to download an app?",
        a: "TWNG works in your browser on any device — phone, tablet, or desktop. No app download required."
      },
      {
        q: "How do I add a guitar?",
        a: "Two ways:\n\n1. Magic Add — Take a photo, and TWNG identifies your guitar automatically\n2. Manual — Enter the details yourself\n\nMost people love Magic Add. It's like magic, but real."
      },
      {
        q: "What's Magic Add?",
        a: "Point your camera at a guitar, take a photo, and TWNG identifies the make, model, year, and specs. You review, edit if needed, and save. Takes about 30 seconds."
      },
      {
        q: "How accurate is Magic Add?",
        a: "Very accurate for common brands (Fender, Gibson, Martin, Taylor, PRS, Ibanez, and 80+ more). For rare or custom guitars, you might need to adjust a few details."
      },
      {
        q: "What if Magic Add gets it wrong?",
        a: "No problem. You can edit anything before saving. Magic Add gives you a head start — you're always in control."
      },
    ],
  },
  {
    id: "features",
    title: "Features",
    icon: Camera,
    questions: [
      {
        q: "What can I keep for each guitar?",
        a: "• Photos — Multiple angles, details, history\n• Specs — Make, model, year, serial number, color, etc.\n• Story — The narrative behind the guitar (how you got it, why it matters)\n• Serial number decode — Find the year and factory\n• Notes — Anything else you want to remember\n• Privacy setting — Per guitar"
      },
      {
        q: "What's Voice-to-Story?",
        a: "Speak your guitar's story instead of typing. TWNG transcribes it into text you can edit. Perfect for capturing memories without the keyboard."
      },
      {
        q: "Can I decode my serial number?",
        a: "Yes. Enter your serial number and TWNG tells you the year, factory, and other details. Works for Fender, Gibson, Martin, Taylor, PRS, Ibanez, and 80+ more brands."
      },
      {
        q: "Can I add photos later?",
        a: "Yes. Add, remove, or replace photos anytime. Your collection evolves with you."
      },
      {
        q: "Can I track guitar value?",
        a: "Not yet. We're focused on keeping your guitars first. Valuation features may come later."
      },
      {
        q: "How many photos per guitar?",
        a: "Enough to document it properly. No artificial limits."
      },
    ],
  },
  {
    id: "data-security",
    title: "Data & Security",
    icon: Database,
    questions: [
      {
        q: "Where is my data stored?",
        a: "Your data is stored securely in the cloud. Encrypted, backed up, and protected."
      },
      {
        q: "Can I export my collection?",
        a: "Export features are coming. Your data is yours — you'll always be able to take it with you."
      },
      {
        q: "What if TWNG shuts down?",
        a: "You'll always be able to export your data. We'll give plenty of notice if anything changes."
      },
      {
        q: "Do you sell my data?",
        a: "No. Never. Your collection is yours. We don't sell, share, or use it for advertising."
      },
    ],
  },
  {
    id: "technical",
    title: "Technical",
    icon: Monitor,
    questions: [
      {
        q: "What browsers work with TWNG?",
        a: "All modern browsers — Chrome, Safari, Firefox, Edge. Mobile and desktop."
      },
      {
        q: "Does Magic Add work offline?",
        a: "No. Magic Add requires an internet connection to identify your guitar."
      },
      {
        q: "Why won't Magic Add recognize my guitar?",
        a: "Possible reasons:\n\n• Photo is blurry or too dark\n• Guitar is unusual or custom-built\n• Angle doesn't show identifying features\n\nTry a clearer photo showing the headstock, or use manual entry instead."
      },
      {
        q: "Can I use TWNG on my phone?",
        a: "Yes. TWNG is fully responsive. Works great on phones and tablets."
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    icon: User,
    questions: [
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Delete Account. All your data will be permanently removed."
      },
      {
        q: "Can I change my email?",
        a: "Yes. Go to Settings → Account → Change Email."
      },
      {
        q: "I forgot my password.",
        a: 'Click "Forgot Password" on the login page. We\'ll send a reset link.'
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    icon: MessageSquare,
    questions: [
      {
        q: "How do I report a bug?",
        a: "Email us at support@twng.com or use the feedback button in the app."
      },
      {
        q: "How do I request a feature?",
        a: "Same — email or feedback button. We read everything."
      },
      {
        q: "How do I contact TWNG?",
        a: "• Email: hello@twng.com\n• Support: support@twng.com\n• Instagram: @twng"
      },
    ],
  },
  {
    id: "common",
    title: "Common Questions",
    icon: Heart,
    questions: [
      {
        q: "Is this like Reverb?",
        a: "No. Reverb is for buying and selling. TWNG is for keeping. Your guitars, your stories, your collection — not a marketplace."
      },
      {
        q: "Is this like a spreadsheet?",
        a: "Kind of, but better. TWNG is built specifically for guitars — photos, stories, serial decoding, and a beautiful interface. No formulas required."
      },
      {
        q: "Can I use TWNG for other instruments?",
        a: "TWNG is designed for guitars (including bass). Other instruments may work, but the features are guitar-focused."
      },
      {
        q: "What about vintage guitars?",
        a: "TWNG works great for vintage guitars. Serial number decoding covers most eras, and you can add as much history and provenance as you want."
      },
      {
        q: "Can dealers use TWNG?",
        a: "Yes. With unlimited guitars, dealers can manage their inventory. Professional features may come later."
      },
      {
        q: 'Can I add guitars I used to own?',
        a: 'Yes. Mark them as "Former" — the story doesn\'t disappear just because the guitar did.'
      },
      {
        q: "What if I don't know what guitar I have?",
        a: "Add what you know. Upload photos. Try the serial number decoder. Magic Add can often identify guitars you can't."
      },
    ],
  },
  {
    id: "privacy-model",
    title: "Privacy Model Explained",
    icon: Lock,
    questions: [
      {
        q: 'What is "User Choice" privacy?',
        a: "TWNG lets YOU decide the visibility of each guitar:\n\n• Private — Only you\n• Link — Anyone with the link\n• Public — Anyone (searchable)"
      },
      {
        q: "Can I have a mix?",
        a: "Yes. Keep your valuable vintage guitar private, share your player guitar with the community. Each guitar is independent."
      },
      {
        q: "What's the benefit of sharing?",
        a: "• Get help identifying unknown guitars\n• Connect with other owners of the same model\n• Show off your collection (if you want)\n• Contribute to the guitar community"
      },
      {
        q: "What's the benefit of keeping private?",
        a: "• Security (no one knows what you have)\n• Personal archive (just for you)\n• Insurance documentation\n• Peace of mind"
      },
    ],
  },
];

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${T.border}`,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
          gap: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: isOpen ? T.warm : T.txt,
            fontFamily: "'DM Sans', sans-serif",
            transition: "color 0.2s",
          }}
        >
          {question}
        </h3>
        <ChevronDown
          size={18}
          style={{
            color: isOpen ? T.warm : T.txtM,
            transition: "transform 0.3s, color 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </div>
      {isOpen && (
        <div
          style={{
            paddingBottom: "20px",
            fontSize: "15px",
            color: T.txt2,
            lineHeight: 1.7,
            whiteSpace: "pre-line",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

function CategoryNav({ categories, activeCategory, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "48px",
        justifyContent: "center",
      }}
    >
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "9999px",
              border: `1px solid ${isActive ? T.borderAcc : T.border}`,
              background: isActive ? "rgba(120, 53, 15, 0.2)" : "transparent",
              color: isActive ? T.amber : T.txt2,
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Icon size={14} />
            {cat.title}
          </button>
        );
      })}
    </div>
  );
}

export default function TWNGFAQ() {
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = faqData
    .filter((section) => !activeCategory || section.id === activeCategory)
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (q) =>
          !searchQuery ||
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.questions.length > 0);

  const totalQuestions = faqData.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div
      style={{
        background: T.bgDeep,
        minHeight: "100vh",
        color: T.txt,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        `}
      </style>

      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${T.border}`,
          background: T.bgDeep + "E6",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              color: T.txt2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: T.txt,
            }}
          >
            FAQ
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 24px 48px",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            fontWeight: 500,
            color: T.warm,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "16px",
          }}
        >
          {totalQuestions} Answers
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            color: T.txt,
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          Frequently Asked Questions
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: T.txt2,
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Everything you need to know about TWNG.
          Can't find what you're looking for?{" "}
          <a
            href="mailto:hello@twng.com"
            style={{ color: T.warm, textDecoration: "none" }}
          >
            Reach out to us.
          </a>
        </p>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: "480px", margin: "0 auto" }}>
          <HelpCircle
            size={18}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: T.txtM,
            }}
          />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px 14px 48px",
              borderRadius: "12px",
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              color: T.txt,
              fontSize: "15px",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = T.borderAcc)}
            onBlur={(e) => (e.target.style.borderColor = T.border)}
          />
        </div>
      </div>

      {/* Category Navigation */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        <CategoryNav
          categories={faqData}
          activeCategory={activeCategory}
          onSelect={(id) =>
            setActiveCategory(activeCategory === id ? null : id)
          }
        />
      </div>

      {/* FAQ Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px" }}>
        {filteredSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} style={{ marginBottom: "48px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <Icon size={18} style={{ color: T.warm }} />
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: T.txt,
                  }}
                >
                  {section.title}
                </h2>
              </div>

              <div>
                {section.questions.map((item, idx) => {
                  const key = `${section.id}-${idx}`;
                  return (
                    <FAQItem
                      key={key}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItem === key}
                      onClick={() =>
                        setOpenItem(openItem === key ? null : key)
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <HelpCircle size={48} style={{ color: T.txtM, marginBottom: "16px" }} />
            <p style={{ fontSize: "18px", color: T.txt2, marginBottom: "8px" }}>
              No matching questions found
            </p>
            <p style={{ fontSize: "14px", color: T.txtM }}>
              Try a different search term or{" "}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: T.warm,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                clear all filters
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          background: T.bgCard,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px",
            fontWeight: 600,
            color: T.txt,
            marginBottom: "12px",
          }}
        >
          Still have questions?
        </h2>
        <p
          style={{
            color: T.txt2,
            fontSize: "15px",
            marginBottom: "24px",
          }}
        >
          We're here to help. Reach out anytime.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="mailto:hello@twng.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              background: T.warm,
              color: T.bgDeep,
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <Mail size={16} /> Email Us
          </a>
          <a
            href="https://instagram.com/twng"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "10px",
              background: "transparent",
              color: T.txt,
              fontWeight: 500,
              fontSize: "15px",
              textDecoration: "none",
              border: `1px solid ${T.border}`,
              cursor: "pointer",
            }}
          >
            @twng on Instagram
          </a>
        </div>
        <p
          style={{
            marginTop: "32px",
            fontSize: "14px",
            fontStyle: "italic",
            color: T.txtM,
          }}
        >
          Because every guitar has a story. And those stories deserve a place to live.
        </p>
      </div>
    </div>
  );
}