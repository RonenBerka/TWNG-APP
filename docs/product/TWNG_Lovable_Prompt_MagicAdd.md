# TWNG Magic Add - Lovable Prompt

Copy this prompt into Lovable to build the Magic Add feature.

---

## Prompt

Build the "Magic Add" feature for TWNG, a guitar collection app. This is the signature feature where users snap a photo of their guitar and AI automatically identifies it.

### Brand Context
- **App Name**: TWNG
- **Tagline**: "Every Guitar Has a Story. Finally, a place to keep them."
- **Tone**: Warm, personal, enthusiast-friendly
- **Theme**: Dark mode optimized for displaying guitars

### Design System

**Colors**:
```css
--primary: #D4A574;          /* Warm amber - CTAs */
--primary-dark: #B8956A;     /* Hover states */
--background: #1A1A1A;       /* Main background */
--surface: #2C2C2C;          /* Cards, modals */
--text-primary: #FFFFFF;
--text-secondary: #A0A0A0;
--success: #4CAF50;
--error: #FF5252;
```

**Typography**:
- Headings: Plus Jakarta Sans
- Body: Inter
- Use Tailwind classes

**Border Radius**: `rounded-lg` (16px) for cards, `rounded-full` for buttons/badges

### Feature Requirements

Build a multi-step flow with these screens:

#### 1. Trigger (Floating Action Button)
- Floating "+" button, bottom-right corner
- Warm amber (#D4A574) background
- On click, opens the capture modal
- Subtle pulse animation on first visit

#### 2. Capture Screen
- Full-screen modal with dark overlay
- Two options: "Take Photo" (camera icon) and "Choose from Gallery" (image icon)
- Desktop: Add drag & drop zone
- Helper text: "Center your guitar in the frame"
- Close button top-left

#### 3. Processing Screen
- Show uploaded image preview (blurred/dimmed)
- Animated loading indicator (guitar silhouette that fills with amber color)
- Text sequence cycling through:
  1. "Uploading..."
  2. "Analyzing..."
  3. "Identifying your guitar..."
  4. "Almost there..."
- Fake 2-3 second delay for satisfaction

#### 4. Results Screen
- Display the uploaded image prominently
- Below image, show identification card:
  ```
  🎸 We found your guitar!

  FENDER
  Stratocaster
  American Professional II

  Year: 2020
  Color: Olympic White
  Pickups: SSS
  Made in: USA

  Confidence: ████████░░ 85%
  ```
- Confidence bar with color coding:
  - 70-100%: Green (#4CAF50)
  - 40-69%: Yellow (#FFC107)
  - 0-39%: Red (#FF5252)
- Buttons:
  - Primary: "Looks right!" (amber, full-width)
  - Secondary: "Something wrong? Edit" (text button below)

#### 5. Edit Modal (if user clicks edit)
- Form with fields:
  - Brand (dropdown with search)
  - Model (dropdown, filtered by brand)
  - Year (number input)
  - Color (text input)
  - Pickup Configuration (visual picker: SSS, HSS, HSH, HH, etc.)
  - Country of Origin (dropdown)
- Save & Cancel buttons

#### 6. Story Input Screen
- Headline: "Now for the best part..."
- Subheadline: "What's the story behind this guitar?"
- Large textarea with placeholder: "How did you get it? What does it mean to you? Any memorable moments?"
- Microphone button for voice input (top-right of textarea)
- Buttons:
  - Primary: "Save to Collection"
  - Secondary: "Skip for now" (text link, de-emphasized)

#### 7. Success Screen
- Checkmark animation
- "Added to your collection!"
- Guitar image thumbnail with name
- Buttons:
  - "View Guitar" (primary)
  - "Add Another" (secondary)

### Component Structure

```
src/
├── components/
│   └── MagicAdd/
│       ├── MagicAddButton.tsx      # FAB trigger
│       ├── MagicAddModal.tsx       # Main modal container
│       ├── CaptureScreen.tsx       # Photo/upload
│       ├── ProcessingScreen.tsx    # Loading animation
│       ├── ResultsScreen.tsx       # Guitar identification
│       ├── EditModal.tsx           # Edit form
│       ├── StoryScreen.tsx         # Story input
│       ├── SuccessScreen.tsx       # Completion
│       └── ConfidenceBar.tsx       # Reusable confidence indicator
├── hooks/
│   └── useMagicAdd.ts              # State management
└── types/
    └── guitar.ts                   # Type definitions
```

### State Management

```typescript
interface MagicAddState {
  step: 'idle' | 'capture' | 'processing' | 'results' | 'story' | 'success';
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
  isEditing: boolean;
}
```

### Mock Data for Demo

Since we're not connecting to a real AI yet, use this mock identification:

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
```

### Animations

1. **FAB pulse**: Subtle scale animation on mount (first time only)
2. **Modal entrance**: Slide up + fade in (300ms)
3. **Processing loader**: Guitar silhouette fills from bottom to top
4. **Results reveal**: Card slides up, image fades in
5. **Success checkmark**: Draw-in animation
6. **Screen transitions**: Cross-fade between steps

### Accessibility

- All buttons have visible focus states
- Form inputs have proper labels
- Modal traps focus
- Escape key closes modal
- Reduced motion support

### Responsive Behavior

- **Mobile**: Full-screen modal, bottom sheet style
- **Desktop**: Centered modal (max-width: 480px), rounded corners

### Don't Include

- Backend/database integration (mock everything)
- Actual AI image recognition
- User authentication
- Navigation to other app sections

### Additional Notes

- Use Lucide React for icons
- Use Framer Motion for animations
- Form validation with react-hook-form or similar
- Image should be stored in state, not uploaded anywhere

---

## Quick Start

Start by creating the MagicAddButton component and the modal container. Then build each screen step by step. Use the mock data to simulate AI identification.

The most important thing is the flow feeling smooth and magical - the "aha moment" when the guitar is identified should feel delightful.

---

## MCP Integration (Optional)

If you have the TWNG MCP server connected, use these tools:

- `twng_identify_guitar` - For identification (instead of mock)
- `twng_get_design_tokens` - For design system values
- `twng_get_ui_copy` - For screen copy
- `twng_generate_story_prompts` - For story screen prompts
- `twng_get_supported_values` - For dropdown options
