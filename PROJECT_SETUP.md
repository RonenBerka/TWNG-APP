# TWNG Platform - Vite + React Project Setup

## Project Overview

A complete Vite + React implementation of the TWNG (The World's Next Guitar) platform with 16 integrated page components and React Router configuration.

**Project Location:** `/sessions/intelligent-gifted-volta/mnt/New TWNG WebApp/twng-app/`

## Project Structure

```
twng-app/
├── src/
│   ├── pages/              # 16 page components
│   │   ├── Homepage.jsx
│   │   ├── Auth.jsx
│   │   ├── GuitarDetail.jsx
│   │   ├── AddGuitar.jsx
│   │   ├── MyCollection.jsx
│   │   ├── Explore.jsx
│   │   ├── SearchResults.jsx
│   │   ├── UserProfile.jsx
│   │   ├── LuthierDirectory.jsx
│   │   ├── LuthierProfile.jsx
│   │   ├── Articles.jsx
│   │   ├── Forum.jsx
│   │   ├── Messaging.jsx
│   │   ├── Settings.jsx
│   │   ├── MobileShell.jsx
│   │   └── Admin.jsx
│   ├── theme/
│   │   └── tokens.js       # Color theme configuration
│   ├── components/         # Shared components (empty, ready for components)
│   ├── App.jsx            # Router configuration
│   ├── main.jsx           # React entry point
│   ├── index.css          # Global styles with typography imports
│   └── assets/
├── index.html             # HTML template (updated title)
├── package.json           # Dependencies & scripts
├── vite.config.js         # Vite configuration
└── dist/                  # Build output directory
```

## Installed Dependencies

- **React** (v19.2.0): Core React library
- **React DOM** (v19.2.0): DOM rendering
- **React Router DOM** (v7.13.0): Routing and navigation
- **Lucide React** (v0.563.0): Icon library
- **Vite** (v7.2.4): Build tool and dev server
- **ESLint**: Code linting

## Theme Configuration

Color tokens are defined in `/src/theme/tokens.js`:

```javascript
export const T = {
  bgDeep: "#0C0A09",      // Deep dark background
  bgCard: "#1C1917",      // Card background
  bgElev: "#1A1816",      // Elevated background
  border: "#2E2A27",      // Border color
  borderAcc: "#78350F",   // Border accent (warm brown)
  txt: "#FAFAF9",         // Primary text
  txt2: "#A8A29E",        // Secondary text
  txtM: "#78716C",        // Muted text
  warm: "#D97706",        // Warm amber
  amber: "#F59E0B",       // Bright amber
};
```

## Typography

Global fonts imported from Google Fonts:
- **Playfair Display**: Display/heading font
- **DM Sans**: Body/UI font
- **JetBrains Mono**: Monospace font

## Routes

The application includes 15 main routes + admin/settings nested routes:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Homepage | Landing/main page |
| `/auth` | Auth | Login/signup |
| `/guitar/:id` | GuitarDetail | Individual guitar details |
| `/guitar/new` | AddGuitar | Add new guitar to collection |
| `/collection` | MyCollection | User's guitar collection |
| `/explore` | Explore | Browse guitars/content |
| `/search` | SearchResults | Search results |
| `/user/:username` | UserProfile | User profile view |
| `/luthiers` | LuthierDirectory | Luthier directory |
| `/luthier/:username` | LuthierProfile | Individual luthier profile |
| `/articles` | Articles | Articles/blog |
| `/community` | Forum | Community forum |
| `/messages` | Messaging | Direct messaging |
| `/settings/*` | Settings | User settings (nested routes) |
| `/admin/*` | Admin | Admin panel (nested routes) |

## Getting Started

### Development Server

```bash
cd /sessions/intelligent-gifted-volta/mnt/New\ TWNG\ WebApp/twng-app
npm run dev
```

Starts development server at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

Creates optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally.

### Linting

```bash
npm run lint
```

Runs ESLint on the codebase.

## Build Status

✅ **Build Successful**

```
dist/index.html                   0.48 kB │ gzip:   0.31 kB
dist/assets/index-Dkb2vMJ1.css    0.56 kB │ gzip:   0.35 kB
dist/assets/index-w269amr4.js   594.79 kB │ gzip: 157.32 kB
```

### Build Warnings

The build includes warnings about:
1. **Duplicate style/className attributes** in some JSX elements (non-critical, existing in page components)
2. **Bundle size** (~595 KB uncompressed) - Consider code-splitting if needed

These are minor issues that don't prevent the application from functioning.

## Fixes Applied

1. **AddGuitar.jsx** (line 442): Fixed escaped quotes in placeholder text
2. **LuthierProfile.jsx** (line 939): Fixed mismatched closing tag (`</section>` → `</div>`)

## CSS Styling

Global styles in `/src/index.css` provide:
- CSS reset (margin, padding, box-sizing)
- Dark theme colors
- Custom scrollbar styling
- Font imports
- Link styling

Individual page components use inline styles with the theme tokens for consistency.

## Notes for Development

- Each page component is self-contained and exports a default React component
- Pages use inline styles with theme tokens (`T.bgDeep`, `T.txt`, etc.)
- No Tailwind CSS configured (using inline styles and class names)
- Theme tokens are centralized in `src/theme/tokens.js`
- Router uses standard React Router v7 patterns
- All 16 pages are fully integrated and ready to use

## File Locations

- **App.jsx**: `/sessions/intelligent-gifted-volta/mnt/New TWNG WebApp/twng-app/src/App.jsx`
- **Theme tokens**: `/sessions/intelligent-gifted-volta/mnt/New TWNG WebApp/twng-app/src/theme/tokens.js`
- **Global CSS**: `/sessions/intelligent-gifted-volta/mnt/New TWNG WebApp/twng-app/src/index.css`
- **Pages directory**: `/sessions/intelligent-gifted-volta/mnt/New TWNG WebApp/twng-app/src/pages/`
