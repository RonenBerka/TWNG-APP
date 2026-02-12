# TWNG — Design System

> **Version:** 1.0
> **For:** Design & Development Team

---

## Brand Identity

### Core Message
> "Every Guitar Has a Story. Finally, a place to keep them."

### Brand Attributes
- **Warm** — Not cold/corporate
- **Personal** — Your guitars, your stories
- **Trustworthy** — Safe place for valuable memories
- **Simple** — Easy to use, no friction
- **Guitar-centric** — Built by people who get it

---

## Color Palette

### Primary Colors

| Name | Hex | Use |
|------|-----|-----|
| **Amber** | `#F59E0B` | Primary actions, highlights |
| **Amber Dark** | `#D97706` | Hover states |
| **Amber Light** | `#FCD34D` | Subtle highlights |

### Neutral Colors

| Name | Hex | Use |
|------|-----|-----|
| **Black** | `#1F2937` | Primary text |
| **Gray 700** | `#374151` | Secondary text |
| **Gray 500** | `#6B7280` | Muted text |
| **Gray 300** | `#D1D5DB` | Borders |
| **Gray 100** | `#F3F4F6` | Backgrounds |
| **White** | `#FFFFFF` | Cards, inputs |

### Semantic Colors

| Name | Hex | Use |
|------|-----|-----|
| **Success** | `#10B981` | Confirmations |
| **Warning** | `#F59E0B` | Warnings |
| **Error** | `#EF4444` | Errors |
| **Info** | `#3B82F6` | Information |

### Visibility Colors

| Level | Icon BG | Use |
|-------|---------|-----|
| **Private** | `#6B7280` | 🔒 Private items |
| **Link** | `#3B82F6` | 🔗 Link sharing |
| **Public** | `#10B981` | 🌐 Public items |

---

## Typography

### Font Family

**Primary:** Inter (or system-ui fallback)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Hebrew:** Heebo
```css
font-family: 'Heebo', 'Inter', sans-serif;
```

### Type Scale

| Name | Size | Weight | Use |
|------|------|--------|-----|
| **Display** | 36px / 2.25rem | 700 | Hero headlines |
| **H1** | 30px / 1.875rem | 700 | Page titles |
| **H2** | 24px / 1.5rem | 600 | Section headers |
| **H3** | 20px / 1.25rem | 600 | Card titles |
| **Body** | 16px / 1rem | 400 | Main text |
| **Body Small** | 14px / 0.875rem | 400 | Secondary text |
| **Caption** | 12px / 0.75rem | 400 | Labels, hints |

### Line Heights

| Type | Line Height |
|------|-------------|
| Headings | 1.2 |
| Body | 1.5 |
| Tight | 1.25 |

---

## Spacing

### Base Unit
**4px** — All spacing is multiples of 4

### Scale

| Name | Size | Use |
|------|------|-----|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Icon gaps, tight padding |
| `md` | 16px | Standard padding |
| `lg` | 24px | Section gaps |
| `xl` | 32px | Large sections |
| `2xl` | 48px | Page sections |
| `3xl` | 64px | Hero spacing |

---

## Components

### Buttons

#### Primary Button
```
┌─────────────────────────────────────┐
│          Get Started                │
└─────────────────────────────────────┘
```
- Background: Amber (`#F59E0B`)
- Text: White
- Padding: 12px 24px
- Border radius: 8px
- Hover: Amber Dark (`#D97706`)

#### Secondary Button
```
┌─────────────────────────────────────┐
│            Cancel                   │
└─────────────────────────────────────┘
```
- Background: White
- Border: 1px Gray 300
- Text: Gray 700
- Hover: Gray 100 background

#### Ghost Button
```
          Learn more →
```
- Background: Transparent
- Text: Amber
- Hover: Underline

### Cards

#### Guitar Card
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │         [Photo]             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Fender Stratocaster               │
│  1965 · USA                        │
│                                🔒  │
└─────────────────────────────────────┘
```
- Background: White
- Border: 1px Gray 200
- Border radius: 12px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Hover: Shadow increases

#### Info Card
```
┌─────────────────────────────────────┐
│  ℹ️ Tip                             │
│  ───                                │
│  Include the headstock for best     │
│  identification results.            │
└─────────────────────────────────────┘
```
- Background: Gray 100
- Border-left: 4px Amber
- Padding: 16px

### Inputs

#### Text Input
```
  Serial Number
  ┌─────────────────────────────────┐
  │ US21034567                      │
  └─────────────────────────────────┘
```
- Border: 1px Gray 300
- Border radius: 8px
- Padding: 12px 16px
- Focus: 2px Amber ring

#### Select
```
  Brand
  ┌─────────────────────────────────┐
  │ Fender                      [▼] │
  └─────────────────────────────────┘
```

#### Textarea
```
  Story
  ┌─────────────────────────────────┐
  │ I got this guitar from my       │
  │ grandfather in 1998...          │
  │                                 │
  │                                 │
  └─────────────────────────────────┘
```

### Visibility Selector

#### Full (Onboarding)
```
  ┌─────────────────────────────────────┐
  │ ● 🔒 Private                        │
  │   Only you can see it.              │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ ○ 🔗 Link sharing                   │
  │   Anyone with the link can view.    │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ ○ 🌐 Public                         │
  │   Visible in TWNG community.        │
  └─────────────────────────────────────┘
```
- Selected: Amber border, light amber background
- Unselected: Gray border

#### Compact (Guitar Page)
```
  Visibility: [🔒 Private ▼]
```

#### Icon Only (Collection)
```
  🔒  🔗  🌐
```

### Badges

#### Verification Badge
```
  ✓ Verified
```
- Background: Green 100
- Text: Green 700
- Border radius: full

#### Confidence Badge
```
  High confidence
```
- Background: Amber 100
- Text: Amber 700

#### User Badge
```
  🎸 Guitar Expert
     Helped identify 47 guitars
```

---

## Icons

### System Icons (Lucide)
| Icon | Name | Use |
|------|------|-----|
| 🔒 | Lock | Private visibility |
| 🔗 | Link | Link sharing |
| 🌐 | Globe | Public visibility |
| ✓ | Check | Success, confirm |
| ✏️ | Edit | Edit action |
| 📸 | Camera | Magic Add |
| 🎤 | Mic | Voice recording |
| ➕ | Plus | Add new |
| ← | ArrowLeft | Back |
| ▼ | ChevronDown | Dropdown |

### Guitar-Specific Icons
Consider custom icons for:
- Electric guitar silhouette
- Acoustic guitar silhouette
- Bass silhouette
- Headstock
- Sound hole

---

## Layout

### Page Structure
```
┌─────────────────────────────────────────────┐
│  Header (fixed)                        56px │
├─────────────────────────────────────────────┤
│                                             │
│  Content                                    │
│  (scrollable)                               │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  Bottom Nav (mobile only)              64px │
└─────────────────────────────────────────────┘
```

### Grid
- Mobile: 1 column, 16px gutters
- Tablet: 2 columns, 24px gutters
- Desktop: 3-4 columns, 32px gutters

### Max Width
- Content: 1200px
- Text blocks: 720px

---

## Motion

### Transitions
```css
/* Standard */
transition: all 150ms ease-out;

/* Slow (modals, overlays) */
transition: all 300ms ease-out;
```

### Animations
- **Loading spinner:** Rotate 360° in 1s
- **Success check:** Scale in with bounce
- **Card hover:** Subtle lift (translateY -2px)
- **Page transitions:** Fade in/out

---

## Dark Mode (Future)

Reserved for future implementation:

| Element | Light | Dark |
|---------|-------|------|
| Background | White | `#1F2937` |
| Surface | Gray 100 | `#374151` |
| Text | Gray 900 | Gray 100 |
| Border | Gray 300 | Gray 600 |

---

## Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- Interactive elements have visible focus states

### Touch Targets
- Minimum 44x44px for all interactive elements

### Focus States
```css
:focus-visible {
  outline: 2px solid #F59E0B;
  outline-offset: 2px;
}
```

### Screen Readers
- All images have alt text
- Icons have aria-labels
- Form fields have labels
- Status changes announced

---

## Responsive Breakpoints

| Name | Min Width | Use |
|------|-----------|-----|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Mobile-First
Design for mobile, enhance for desktop.

---

## Component Library

### Recommended: shadcn/ui + Tailwind
- Accessible by default
- Customizable
- React-based
- Good TypeScript support

### Key Components
1. Button
2. Input
3. Select
4. Card
5. Dialog (Modal)
6. Dropdown Menu
7. Radio Group (Visibility Selector)
8. Toast (Notifications)
9. Sheet (Mobile drawers)
10. Tabs

---

## File Organization

```
/components
├── /ui          # Base components (shadcn)
├── /guitar      # Guitar-specific components
│   ├── GuitarCard.tsx
│   ├── GuitarForm.tsx
│   ├── VisibilitySelector.tsx
│   └── MagicAddFlow.tsx
├── /layout      # Layout components
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   └── PageContainer.tsx
└── /shared      # Shared utilities
    ├── Badge.tsx
    └── LoadingSpinner.tsx
```

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-amber: #F59E0B;
  --color-amber-dark: #D97706;
  --color-amber-light: #FCD34D;

  --color-gray-900: #1F2937;
  --color-gray-700: #374151;
  --color-gray-500: #6B7280;
  --color-gray-300: #D1D5DB;
  --color-gray-100: #F3F4F6;

  --color-success: #10B981;
  --color-error: #EF4444;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-base: 16px;

  /* Spacing */
  --space-unit: 4px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

---

*"Design for guitar people, by guitar people."*
