import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Guitar, Users, Shield, BookOpen, Heart, ArrowRight, Sparkles, Quote, MapPin, Calendar } from 'lucide-react';
import { T } from '../theme/tokens';
import { IMG } from '../utils/placeholders';

export default function About() {
  const [hoveredFounder, setHoveredFounder] = useState(null);

  const founders = [
    {
      id: 1,
      name: 'Ronen',
      role: 'Founder & Visionary',
      image: IMG.artist1,
      bio: 'Passionate about guitar culture and community-driven platforms. Ronen leads TWNG\'s strategic vision.',
    },
    {
      id: 2,
      name: 'Uri',
      role: 'Founder & Engineer',
      image: IMG.artist2,
      bio: 'Full-stack builder bringing TWNG\'s technical foundation to life. When not coding, Uri collects vintage Strats.',
    },
    {
      id: 3,
      name: 'Doron',
      role: 'Founder & Design',
      image: IMG.artist3,
      bio: 'Crafting the beautiful, intuitive interface. Doron believes great design helps stories shine.',
    },
    {
      id: 4,
      name: 'Ori',
      role: 'Founder & Community',
      image: IMG.artist4,
      bio: 'Building the heart of TWNG — the people, the connections, the shared passion for guitars.',
    },
  ];

  const pillars = [
    {
      icon: Heart,
      title: 'Unite People',
      description: 'Create a place that brings together collectors, musicians, and luthiers around a shared love of guitars.',
    },
    {
      icon: Users,
      title: 'Solve Documentation',
      description: 'End the scattered spreadsheets and forgotten specs. One home for your guitar\'s complete story.',
    },
    {
      icon: BookOpen,
      title: 'Give Every Guitar a Stage',
      description: 'Every guitar deserves recognition. TWNG gives them a personal, permanent home in guitar history.',
    },
  ];

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
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${T.warm}15 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '800px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: '24px',
            lineHeight: 1.2,
          }}>
            About TWNG
          </h1>
          <p style={{
            fontSize: '20px',
            color: T.txt2,
            marginBottom: '16px',
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
          }}>
            Every Guitar Has a Story
          </p>
          <p style={{
            fontSize: '16px',
            color: T.txt2,
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            TWNG is the first platform built specifically for guitar collectors, musicians, and luthiers. We believe every guitar deserves recognition, preservation, and a place in guitar history.
          </p>
        </div>
      </section>

      {/* ============================================================
          MISSION STATEMENT
          ============================================================ */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <p style={{
          fontSize: '32px',
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          lineHeight: 1.7,
          color: T.amber,
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          TWNG is the first platform built specifically for guitar collectors. It combines community, stories, and organization into one dedicated home for documenting, preserving, and sharing the legacy of guitars worldwide.
        </p>
      </section>

      {/* ============================================================
          THREE PILLARS
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
          Our Purpose
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
        }}>
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '40px',
                  backgroundColor: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.amber;
                  e.currentTarget.style.backgroundColor = T.bgElev;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.backgroundColor = T.bgCard;
                }}
              >
                <IconComponent size={40} style={{ color: T.amber, marginBottom: '20px' }} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  fontFamily: "'Playfair Display', serif",
                }}>
                  {pillar.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: T.txt2,
                  lineHeight: 1.6,
                }}>
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          OUR STORY
          ============================================================ */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '80px 24px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <h2 style={{
          fontSize: '36px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          How TWNG Was Born
        </h2>
        <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <p style={{
              fontSize: '16px',
              color: T.txt2,
              lineHeight: 1.8,
              marginBottom: '20px',
            }}>
              Four friends who love guitars sat around a table and realized something was broken. Collectors had spreadsheets. Musicians had notebooks. Luthiers had no way to connect with people who cared about their work. Guitar stories were scattered, forgotten, and lost.
            </p>
            <p style={{
              fontSize: '16px',
              color: T.txt2,
              lineHeight: 1.8,
              marginBottom: '20px',
            }}>
              We knew there had to be a better way. A place built from the ground up for guitars. Not an afterthought. Not a feature. A platform that says: your guitar matters. Your story matters. Your collection matters.
            </p>
            <p style={{
              fontSize: '16px',
              color: T.txt2,
              lineHeight: 1.8,
            }}>
              TWNG is what we built. And we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          THE TEAM
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
          Meet the Founders
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
        }}>
          {founders.map((founder) => (
            <div
              key={founder.id}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                transform: hoveredFounder === founder.id ? 'translateY(-8px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setHoveredFounder(founder.id)}
              onMouseLeave={() => setHoveredFounder(null)}
            >
              <div style={{
                width: '160px',
                height: '160px',
                borderRadius: '12px',
                overflow: 'hidden',
                margin: '0 auto 20px',
                border: `2px solid ${hoveredFounder === founder.id ? T.amber : T.border}`,
                transition: 'border-color 0.3s ease',
              }}>
                <img
                  src={founder.image}
                  alt={founder.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: "'Playfair Display', serif",
                marginBottom: '8px',
              }}>
                {founder.name}
              </h3>
              <p style={{
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                color: T.amber,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '12px',
              }}>
                {founder.role}
              </p>
              <p style={{
                fontSize: '13px',
                color: T.txt2,
                lineHeight: 1.6,
              }}>
                {founder.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          VISION
          ============================================================ */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '80px 24px',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{
          backgroundColor: T.bgCard,
          border: `1px solid ${T.borderAcc}`,
          padding: '60px 40px',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <Quote size={32} style={{ color: T.amber, margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{
            fontSize: '28px',
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            lineHeight: 1.6,
            marginBottom: '20px',
            color: T.txt,
          }}>
            TWNG starts as a place for documentation and history, but over time will become a tool that provides economic value.
          </h2>
          <p style={{
            fontSize: '16px',
            color: T.txt2,
            lineHeight: 1.7,
            marginBottom: '20px',
          }}>
            Well-documented guitars will receive clearer recognition and value. TWNG aims to become the official place where guitars receive a verified digital identity.
          </p>
          <p style={{
            fontSize: '14px',
            fontFamily: "'JetBrains Mono', monospace",
            color: T.txtM,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            The Future of Guitar History
          </p>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '80px 24px',
      }}>
        <div style={{
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: '36px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            Be Part of Guitar History
          </h2>
          <p style={{
            fontSize: '16px',
            color: T.txt2,
            marginBottom: '40px',
            lineHeight: 1.7,
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}>
            Start exploring the TWNG community. Document your collection. Connect with other collectors, musicians, and luthiers. Your guitars deserve more than a closet — they deserve a home.
          </p>
          <Link
            to="/explore"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              backgroundColor: T.amber,
              color: '#000',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = T.warm;
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = T.amber;
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            Start Your Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
