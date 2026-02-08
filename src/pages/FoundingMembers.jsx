import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, Sparkles, Clock, Users, Guitar, Hash, ArrowRight, CheckCircle, Award, Mail, ChevronDown } from 'lucide-react';
import { T } from '../theme/tokens';
import { IMG } from '../utils/placeholders';

export default function FoundingMembers() {
  const [email, setEmail] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const spotsRemaining = 50;

  const benefits = [
    {
      icon: BookOpen,
      title: 'Smart Documentation',
      description: 'AI-powered guitar documentation that auto-identifies specs, condition, and value insights.',
    },
    {
      icon: Guitar,
      title: 'Value Comparison',
      description: 'See your guitar\'s estimated value compared to similar instruments in the market.',
    },
    {
      icon: Hash,
      title: 'Serial Decoder',
      description: 'Exclusive access to our decoded history database to verify authenticity and find production dates.',
    },
    {
      icon: Users,
      title: 'Luthier Network',
      description: 'Direct connection to verified luthiers for restoration, repairs, and custom work.',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Join the Waitlist',
      description: 'Enter your email to claim your spot as a Founding Member.',
    },
    {
      number: 2,
      title: 'Get Your Pioneer Badge',
      description: 'Receive your permanent Pioneer badge — a mark of being part of TWNG\'s origin story.',
    },
    {
      number: 3,
      title: 'Shape the Platform',
      description: 'Your feedback helps guide TWNG\'s development. You\'re not just a user — you\'re a builder.',
    },
  ];

  const faqItems = [
    {
      q: 'Is it really free?',
      a: 'Yes. Completely free. The Pioneer badge, early access to features, and exclusive tools — all free. TWNG will always be free to use. We\'re focused on building something great first.',
    },
    {
      q: 'What do Founding Members get?',
      a: 'A permanent Pioneer badge on your profile, early access to new features before other users, exclusive access to Smart Documentation tools, serial decoder database, direct connection to our luthier network, and voting rights on feature priorities.',
    },
    {
      q: 'How many spots are left?',
      a: `We\'re aiming for 50 Founding Members total by Week 3. Currently ${spotsRemaining} spots available. Once they\'re gone, this opportunity closes — Founding Member status won\'t be available again.`,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // In production, this would submit to Supabase
      console.log('Founding member email:', email);
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setSubmitted(false);
      }, 3000);
    }
  };

  const BookOpen = () => <BookOpen size={24} style={{ color: T.amber }} />;

  return (
    <div style={{ backgroundColor: T.bgDeep, color: T.txt }}>
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.warm}20 0%, ${T.amber}10 50%, transparent 100%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '900px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: T.bgCard,
            border: `1px solid ${T.amber}`,
            borderRadius: '24px',
            marginBottom: '24px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: T.amber,
          }}>
            <Star size={14} /> Founding Members
          </div>

          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: '24px',
            lineHeight: 1.2,
          }}>
            Be Part of <span style={{ background: `linear-gradient(90deg, ${T.amber}, ${T.warm})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Guitar History</span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: T.txt2,
            marginBottom: '32px',
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 32px',
          }}>
            Be among the first to shape the TWNG community. Founding Members get exclusive benefits, a permanent Pioneer badge, and the chance to influence how TWNG evolves.
          </p>

          {/* Urgency Counter */}
          <div style={{
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: T.bgCard,
            border: `1px solid ${T.borderAcc}`,
            borderRadius: '8px',
            marginBottom: '40px',
          }}>
            <p style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: T.txtM,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '4px',
            }}>
              Limited Availability
            </p>
            <p style={{
              fontSize: '24px',
              fontWeight: 700,
              color: T.amber,
            }}>
              Only {spotsRemaining} Spots Remaining
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          PIONEER BADGE SHOWCASE
          ============================================================ */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '80px 24px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '60px',
          alignItems: 'center',
        }}>
          {/* Badge Visual */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{
              position: 'relative',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              backgroundColor: T.bgCard,
              border: `2px solid ${T.amber}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 40px ${T.amber}30`,
            }}>
              <div style={{
                textAlign: 'center',
              }}>
                <Shield size={60} style={{ color: T.amber, margin: '0 auto 12px', display: 'block' }} />
                <Star size={24} style={{
                  color: T.amber,
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                }} />
                <p style={{
                  fontSize: '14px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: T.amber,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}>
                  PIONEER
                </p>
                <p style={{
                  fontSize: '12px',
                  color: T.txt2,
                  marginTop: '8px',
                }}>
                  Founding Member
                </p>
              </div>
            </div>
          </div>

          {/* Badge Info */}
          <div>
            <h2 style={{
              fontSize: '36px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              marginBottom: '24px',
            }}>
              Your Pioneer Badge
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle size={18} style={{ color: T.amber }} />
                  Permanent Badge on Your Profile
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}>
                  Your Pioneer badge is permanently displayed on your profile. It recognizes your role in shaping TWNG from the start.
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Sparkles size={18} style={{ color: T.amber }} />
                  Your Contribution Will Be Recognized Forever
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}>
                  When TWNG launches to the world, Founding Members will be featured. Your name, your story, your guitars — part of TWNG\'s origin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          EXCLUSIVE BENEFITS
          ============================================================ */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <h2 style={{
          fontSize: '36px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          marginBottom: '60px',
          textAlign: 'center',
        }}>
          Exclusive Benefits
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '32px',
        }}>
          {benefits.map((benefit, idx) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '36px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.amber;
                  e.currentTarget.style.backgroundColor = T.bgElev;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${T.amber}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.backgroundColor = T.bgCard;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <IconComponent size={36} style={{ color: T.amber, marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  fontFamily: "'Playfair Display', serif",
                }}>
                  {benefit.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '80px 24px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <h2 style={{
          fontSize: '36px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          marginBottom: '60px',
          textAlign: 'center',
        }}>
          How It Works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
        }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              {/* Step Number */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: T.bgCard,
                border: `2px solid ${T.amber}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '24px',
                fontWeight: 700,
                color: T.amber,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {step.number}
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '12px',
                fontFamily: "'Playfair Display', serif",
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: T.txt2,
                lineHeight: 1.6,
              }}>
                {step.description}
              </p>

              {/* Arrow between steps */}
              {idx < steps.length - 1 && (
                <div style={{
                  margin: '32px 0',
                  color: T.amber,
                  display: 'none',
                }}>
                  <ArrowRight size={24} style={{ transform: 'rotate(90deg)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SOCIAL PROOF
          ============================================================ */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <h3 style={{
          fontSize: '18px',
          fontFamily: "'JetBrains Mono', monospace",
          color: T.txtM,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '20px',
        }}>
          Growing Community
        </h3>
        <p style={{
          fontSize: '28px',
          fontWeight: 700,
          color: T.amber,
          marginBottom: '32px',
        }}>
          Join 3,200+ Collectors
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '-8px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: T.bgCard,
                border: `2px solid ${T.border}`,
                marginLeft: i > 1 ? '-16px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: T.txt2,
              }}
            >
              {i}
            </div>
          ))}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: '12px',
            color: T.txt2,
            fontSize: '14px',
          }}>
            +3,195 more
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA FORM
          ============================================================ */}
      <section style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '80px 24px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <h2 style={{
          fontSize: '36px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          Claim Your Spot
        </h2>
        <p style={{
          fontSize: '16px',
          color: T.txt2,
          textAlign: 'center',
          marginBottom: '40px',
          lineHeight: 1.6,
        }}>
          Only {spotsRemaining} Founding Members available. Once they're gone, this offer closes forever.
        </p>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: '14px 16px',
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: '8px',
              color: T.txt,
              fontSize: '14px',
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = T.amber;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = T.border;
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 32px',
              backgroundColor: T.amber,
              color: '#000',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = T.warm;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = T.amber;
            }}
          >
            Claim Your Spot <ArrowRight size={14} />
          </button>
        </form>

        {submitted && (
          <p style={{
            fontSize: '14px',
            color: T.amber,
            textAlign: 'center',
            fontWeight: 600,
          }}>
            ✓ Thanks for joining! Check your email for next steps.
          </p>
        )}
      </section>

      {/* ============================================================
          FAQ
          ============================================================ */}
      <section style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '80px 24px',
      }}>
        <h2 style={{
          fontSize: '36px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          marginBottom: '60px',
          textAlign: 'center',
        }}>
          Frequently Asked
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  color: T.txt,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = T.bgElev;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                }}>
                  {item.q}
                </p>
                <ChevronDown
                  size={20}
                  style={{
                    color: T.amber,
                    transform: expandedFAQ === idx ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease',
                    flexShrink: 0,
                  }}
                />
              </button>

              {expandedFAQ === idx && (
                <div style={{
                  padding: '0 20px 20px 20px',
                  borderTop: `1px solid ${T.border}`,
                  animation: 'slideDown 0.3s ease',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: T.txt2,
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
