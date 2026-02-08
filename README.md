# TWNG - The World's Next Guitar Platform

A modern React + Vite web application for discovering, sharing, and connecting over guitars.

## Quick Start

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:5173/`

### Production Build

```bash
npm run build
npm run preview
```

Creates an optimized production build and previews it locally.

## Features

### 16 Integrated Pages

- **Homepage** - Landing and main content
- **Authentication** - Login/signup
- **Guitar Details** - View individual guitar information
- **Add Guitar** - Contribute guitars to the platform
- **My Collection** - Personal guitar collection
- **Explore** - Discover guitars and content
- **Search** - Find guitars and users
- **User Profile** - View user profiles
- **Luthier Directory** - Find luthiers and craftspeople
- **Luthier Profile** - Detailed luthier information
- **Articles** - Read guitar articles and guides
- **Forum** - Community discussion
- **Messaging** - Direct user messaging
- **Settings** - User settings and preferences
- **Mobile Shell** - Mobile-optimized interface
- **Admin Panel** - Administrative features

## Technology Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **React Router 7** - Client-side routing
- **Lucide React** - Icon library
- **Modern CSS** - Styling with custom theme

## Project Structure

```
src/
├── pages/          # 16 page components
├── theme/          # Design tokens
├── components/     # Shared components (ready for expansion)
├── App.jsx         # Router configuration
├── main.jsx        # React entry point
└── index.css       # Global styles
```

## Theme

Dark-mode design with warm, vintage guitar aesthetic:

```javascript
{
  bgDeep: "#0C0A09",    // Deep dark
  bgCard: "#1C1917",    // Card surface
  bgElev: "#1A1816",    // Elevated
  border: "#2E2A27",    // Border
  borderAcc: "#78350F", // Accent border
  txt: "#FAFAF9",       // Primary text
  txt2: "#A8A29E",      // Secondary text
  txtM: "#78716C",      // Muted text
  warm: "#D97706",      // Warm amber
  amber: "#F59E0B",     // Bright accent
}
```

## Routing

```
/                    - Homepage
/auth                - Authentication
/guitar/:id          - Guitar detail view
/guitar/new          - Add new guitar
/collection          - My collection
/explore             - Explore guitars
/search              - Search results
/user/:username      - User profile
/luthiers            - Luthier directory
/luthier/:username   - Luthier profile
/articles            - Articles
/community           - Forum/community
/messages            - Direct messaging
/settings/*          - Settings (nested)
/admin/*             - Admin panel (nested)
```

## Development

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Adding Components

1. Create new component in `src/components/`
2. Import theme tokens: `import { T } from '../theme/tokens'`
3. Use theme colors in your component
4. Import and use in pages

### Adding Pages

1. Create new page in `src/pages/`
2. Export default React component
3. Import in `App.jsx`
4. Add route in the Routes configuration

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled

## Performance

- Production bundle: ~157 KB gzipped
- Optimized with Vite for fast development and builds
- Consider code-splitting for large feature additions

## File Locations

**Project Root**: `/sessions/intelligent-gifted-volta/mnt/New TWNG WebApp/twng-app/`

Key files:
- App.jsx: `src/App.jsx`
- Theme: `src/theme/tokens.js`
- Styles: `src/index.css`
- Pages: `src/pages/`

## License

Proprietary - TWNG Platform

---

**Built with ❤️ for Guitar Enthusiasts**

Every guitar has a story. Let's share them.
