import React, { useState } from 'react';

const TWNGMagazineCover = () => {
  const [guitarName, setGuitarName] = useState('FENDER STRATOCASTER');
  const [subtitle, setSubtitle] = useState('The One That Started Everything');

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      {/* Magazine Cover */}
      <div
        className="relative overflow-hidden bg-black shadow-2xl"
        style={{ width: '540px', height: '675px' }}
      >
        {/* Background Image Placeholder */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%),
                             url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 675"><rect fill="%23332211" width="540" height="675"/><text x="270" y="337" text-anchor="middle" fill="%23665544" font-size="20">📸 Drag photo here</text></svg>')`
          }}
        />

        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* TWNG Logo */}
        <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
          <div
            className="text-amber-500 font-black tracking-wider drop-shadow-lg"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '48px',
              textShadow: '0 4px 12px rgba(0,0,0,0.8)'
            }}
          >
            TWNG
          </div>
        </div>

        {/* Tagline */}
        <div
          className="absolute top-20 left-0 right-0 text-center text-amber-400 uppercase tracking-widest z-10"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '11px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          Every Guitar Has a Story
        </div>

        {/* Issue Info */}
        <div
          className="absolute top-4 right-4 text-right text-white/70 z-10"
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '10px',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          ISSUE NO. 001<br/>
          FREE FOREVER
        </div>

        {/* Side Headlines */}
        <div className="absolute top-28 left-4 z-10 space-y-4">
          <div>
            <div
              className="text-amber-500 uppercase tracking-wider mb-1"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '9px',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              The Collection
            </div>
            <div
              className="text-white leading-tight max-w-36"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '14px',
                fontWeight: '700',
                textShadow: '0 2px 6px rgba(0,0,0,0.8)'
              }}
            >
              Your Guitars.<br/>Your Stories.<br/>Your Way.
            </div>
          </div>

          <div>
            <div
              className="text-amber-500 uppercase tracking-wider mb-1"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '9px',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              Inside
            </div>
            <div
              className="text-white leading-tight max-w-36"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '13px',
                fontWeight: '700',
                textShadow: '0 2px 6px rgba(0,0,0,0.8)'
              }}
            >
              Magic Add: AI That Knows Your Guitar
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <div className="absolute bottom-16 left-4 right-4 z-10">
          <div
            className="text-white leading-none mb-2"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '42px',
              fontWeight: '900',
              textShadow: '0 4px 12px rgba(0,0,0,0.8)'
            }}
          >
            {guitarName.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {word}<br/>
              </React.Fragment>
            ))}
          </div>
          <div
            className="text-amber-400"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '16px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              textShadow: '0 2px 6px rgba(0,0,0,0.8)'
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom Tagline */}
        <div
          className="absolute bottom-4 left-4 text-white/80 italic z-10"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          "Finally, a place to keep them."
        </div>

        {/* Border */}
        <div className="absolute inset-0 border-2 border-white/10 pointer-events-none z-20" />
      </div>

      {/* Controls */}
      <div className="mt-8 space-y-4 w-full max-w-md">
        <div>
          <label className="text-white/60 text-sm block mb-1">Guitar Name</label>
          <input
            type="text"
            value={guitarName}
            onChange={(e) => setGuitarName(e.target.value.toUpperCase())}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-white/60 text-sm block mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Format Note */}
      <div className="mt-6 text-white/40 text-sm text-center">
        Instagram Format: 1080×1350px (4:5)
      </div>
    </div>
  );
};

export default TWNGMagazineCover;
