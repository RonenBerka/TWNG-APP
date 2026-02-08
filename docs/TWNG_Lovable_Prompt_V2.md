# TWNG Magic Add - Lovable Prompt V2
## "Holy Shit, It Knows My Guitar!"

---

## הפרומפט (העתק ל-Lovable)

Build "Magic Add" for TWNG - a guitar collection app that feels **magical, warm, and exciting**. Not another boring dark-mode app. This should feel like walking into an amazing guitar store.

### Brand
- **Name**: TWNG
- **Tagline**: "Every Guitar Has a Story"
- **Vibe**: Warm, personal, exciting - like New Guitar Day energy
- **NOT**: Corporate, cold, utilitarian

### Design System - WARM, NOT BORING

**Colors** (warm stage lighting, not cold tech):
```css
/* Glowing amber - like a spotlight */
--glow-amber: #FFB347;
--glow-amber-bright: #FFC93C;

/* Warm blacks - like wood, not tech */
--bg-deep: #0D0D0D;
--bg-warm: #1A1512;
--bg-surface: #252019;

/* Accents */
--accent-gold: #D4AF37;
--accent-cream: #F5E6D3;

/* Emotional */
--success-warm: #7CB342;
--magic-purple: #9C7CF4;
```

**Typography**:
- Display/Headings: `Playfair Display` or `Instrument Serif` (elegant, guitar-shop vibe)
- Body: `Inter`
- Stories/Quotes: `Crimson Pro` (literary feel)

**Effects**:
- Subtle wood grain texture on backgrounds (3-5% opacity)
- Warm glows around important elements
- Film grain on photos (vintage feel)
- Everything should "breathe" - subtle scale animations

### The Flow - 6 Screens

#### 1. The Invitation (not a boring + button)
Instead of a floating action button, create an **invitation card** when the collection is empty or as a prominent CTA:

```jsx
// Full-screen empty state or modal entry point
<div className="invitation-card">
  {/* Background: blurred guitar silhouette with warm spotlight behind it */}
  <div className="breathing-guitar-bg" /> {/* Subtle zoom in/out animation */}

  <div className="invitation-content">
    <span className="emoji">📸</span>
    <h2>Got a guitar?</h2>
    <p>Let's add it.</p>
    <button>Tap anywhere to start</button>
  </div>
</div>
```

**Animation**: The background guitar image should "breathe" - scale 1.0 → 1.02 → 1.0 over 4 seconds. The spotlight behind it should flicker gently like a candle.

#### 2. Capture - "Show Me"
Full-screen camera/upload with personality:

```jsx
<div className="capture-screen">
  <header>
    <button>← Back</button>
  </header>

  {/* Camera viewfinder with guitar outline overlay */}
  <div className="viewfinder">
    <div className="guitar-outline breathing" /> {/* Animated outline */}
  </div>

  {/* Helpful tip that changes */}
  <p className="tip">
    "Show me the headstock for best results" 👀
  </p>

  <div className="actions">
    <button className="primary">📷 Snap it</button>
    <button className="secondary">🖼 From pics</button>
  </div>
</div>
```

**Micro-interactions**:
- Guitar outline pulses/breathes
- When camera detects a guitar shape → outline turns green, phone vibrates gently
- Tip changes to: "Perfect! Now tap to capture"

#### 3. The Magic Moment ⭐ (MOST IMPORTANT SCREEN)
This is where the magic happens. Build suspense, then REVEAL.

```jsx
<div className="magic-screen">
  {/* User's uploaded photo with scanning effect */}
  <div className="photo-container scanning">
    <img src={userPhoto} />
    <div className="scan-lines" /> {/* Animated light scanning across */}
    <div className="particles" /> {/* Sparkle particles around edges */}
  </div>

  {/* Suspenseful loading indicator */}
  <div className="loader rotating">◐ ◓ ◑ ◒</div>

  {/* Text that builds suspense */}
  <p className="status">{currentStatus}</p>
</div>
```

**Animation sequence** (3-4 seconds total):
1. **"Scanning..."** (1s) - Light beams scan across the photo
2. **"Hmm, this looks familiar..."** (1s) - Light focuses on headstock area
3. **"Wait... is that a..."** (0.5s) - Slight zoom on photo
4. **THE REVEAL** - Photo "explodes" back, result card flies up from bottom with confetti/sparkles, strong haptic feedback

#### 4. The Reveal - "We Know Your Guitar"

```jsx
<div className="reveal-screen">
  <header>
    <span className="found-badge">✓ Found it!</span>
  </header>

  {/* Photo with subtle glow */}
  <div className="photo-container with-glow">
    <img src={userPhoto} />
  </div>

  {/* Identification card - THE STAR */}
  <div className="id-card">
    <div className="brand">
      <span className="emoji">🎸</span>
      <h1>FENDER</h1>
    </div>

    <h2 className="model">Stratocaster</h2>
    <p className="variant">American Professional II</p>

    <div className="specs">
      2020 · Olympic White · USA
    </div>

    {/* Confidence meter - like a VU meter, not a progress bar */}
    <div className="confidence-meter">
      <div className="bars">●●●●●●●●○○</div>
      <span>85% sure</span>
    </div>
  </div>

  <button className="primary cta">✨ That's the one!</button>
  <button className="text-link">Not quite? Fix it →</button>
</div>
```

**Design notes**:
- ID card should have warm gradient background
- Brand name BIG in display font
- "85% sure" not "Confidence: 85%" - more human
- "That's the one!" not "Confirm" - more exciting

#### 5. The Story - "Now the Good Part"

```jsx
<div className="story-screen">
  <header>
    <button>← Back</button>
    <div className="guitar-mini">
      <img src={guitarThumb} />
      <span>Fender Strat</span>
    </div>
  </header>

  <h2>"Now for the good part..."</h2>
  <h1>What's the story behind this guitar?</h1>

  {/* Textarea styled like a journal page */}
  <div className="story-input journal-style">
    <span className="quote-mark">"</span>
    <textarea placeholder="Start typing, or tap 🎤 to tell your story..." />
    <button className="mic-button">🎤</button>
    <span className="quote-mark">"</span>
  </div>

  {/* Prompt chips */}
  <div className="prompts">
    <span className="label">💡 Ideas:</span>
    <button className="chip">How'd you get it?</button>
    <button className="chip">First gig with it?</button>
    <button className="chip">Why this one?</button>
  </div>

  <button className="primary">Save to Collection</button>
  <button className="skip">I'll add the story later</button>
</div>
```

**Micro-interactions**:
- Tapping a prompt chip fills textarea with that question
- Mic button pulses when recording, shows sound waves
- "Skip" button should feel guilt-inducing (small, gray, subtle)

#### 6. Welcome Home

```jsx
<div className="success-screen">
  {/* Celebration animation */}
  <div className="celebration">
    <span>✨🎸✨</span>
  </div>

  <h1>"Welcome to the family"</h1>

  {/* Guitar card - like a framed photo */}
  <div className="guitar-frame">
    <img src={guitarPhoto} />
    <h3>Fender Stratocaster</h3>
    {story && <p className="story-preview">"{storySnippet}..."</p>}
  </div>

  <button className="primary">See Your Guitar</button>
  <button className="text-link">Add another one →</button>
</div>
```

**Animation**: Confetti or sparkles when screen appears. Guitar card "lands" with a satisfying settle animation.

### State Management

```typescript
type Step = 'invite' | 'capture' | 'processing' | 'results' | 'edit' | 'story' | 'success';

interface MagicAddState {
  step: Step;
  image: File | null;
  imagePreview: string | null;
  identification: {
    confidence: number;
    brand: string;
    model: string;
    variant?: string;
    year?: string;
    color?: string;
    pickupConfig: string;
    countryOfOrigin?: string;
  } | null;
  story: string;
  processingMessage: string; // For the animated text sequence
}
```

### Mock Data

```typescript
const mockIdentification = {
  confidence: 85,
  brand: "Fender",
  model: "Stratocaster",
  variant: "American Professional II",
  year: "2020",
  color: "Olympic White",
  pickupConfig: "SSS",
  countryOfOrigin: "USA"
};

const processingMessages = [
  "Scanning...",
  "Hmm, this looks familiar...",
  "Wait... is that a...",
];
```

### Key Animations (use Framer Motion)

1. **Breathing**: `scale: [1, 1.02, 1]` over 4s, infinite
2. **Scanning**: Light beam moves left-to-right across image
3. **Reveal**: Card flies up from `y: 100%` to `y: 0` with spring physics
4. **Confetti**: Particles explode from center on success
5. **Pulse**: For mic button when recording

### Typography Classes

```css
.display-text {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}

.story-text {
  font-family: 'Crimson Pro', serif;
  font-style: italic;
}
```

### What NOT to Do
- ❌ Generic dark mode (#1a1a1a everywhere)
- ❌ "Processing..." / "Loading..."
- ❌ "Confirm" / "Submit" / "Save"
- ❌ Progress bars
- ❌ Static UI - everything should feel alive
- ❌ Cold, corporate language

### What TO Do
- ✅ Warm blacks with wood undertones
- ✅ "Hmm, this looks familiar..." / "That's the one!"
- ✅ VU meter style confidence indicator
- ✅ Breathing, glowing, alive UI
- ✅ Friend-who-plays-guitar language
- ✅ Build suspense before reveal
- ✅ Celebrate success properly

---

**Remember**: This should feel like the excitement of New Guitar Day, not like filing taxes. Every interaction should make the user smile.
