# TWNG Platform - Quick Start Guide

## Get Started in 30 Seconds

### 1. Start Development Server

```bash
cd /sessions/intelligent-gifted-volta/mnt/New\ TWNG\ WebApp/twng-app
npm run dev
```

**Output:**
```
VITE v7.3.1 ready in 150 ms
Local: http://localhost:5173/
```

### 2. Open in Browser

Visit: `http://localhost:5173/`

### 3. Navigate Between Pages

Try these routes:
- `http://localhost:5173/` - Homepage
- `http://localhost:5173/auth` - Authentication
- `http://localhost:5173/explore` - Explore guitars
- `http://localhost:5173/collection` - My collection
- `http://localhost:5173/articles` - Articles
- `http://localhost:5173/luthiers` - Luthier directory

## Available Commands

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start development server (auto-reload) |
| `npm run build` | Build for production |
| `npm run preview` | View production build locally |
| `npm run lint` | Check code with ESLint |

## Project Contents

### 16 Pages Ready to Use
- Homepage, Auth, Guitar Detail, Add Guitar, My Collection
- Explore, Search, User Profile, Luthier Directory, Luthier Profile
- Articles, Forum, Messaging, Settings, Mobile Shell, Admin

### Theme System
Dark mode with warm guitar aesthetic. Colors in `src/theme/tokens.js`:
```javascript
bgDeep: "#0C0A09"   // Background
txt: "#FAFAF9"      // Text
warm: "#D97706"     // Accent
amber: "#F59E0B"    // Highlight
```

### Typography
- **Playfair Display** - Headings
- **DM Sans** - Body text
- **JetBrains Mono** - Code

## File Locations

| What | Where |
|------|-------|
| Pages | `src/pages/` |
| Router setup | `src/App.jsx` |
| Theme colors | `src/theme/tokens.js` |
| Global styles | `src/index.css` |
| Shared components | `src/components/` (ready to expand) |

## Add a New Component

1. Create `src/components/MyComponent.jsx`:

```jsx
import { T } from '../theme/tokens';

export default function MyComponent() {
  return (
    <div style={{ backgroundColor: T.bgCard, color: T.txt }}>
      Hello TWNG!
    </div>
  );
}
```

2. Use in a page:

```jsx
import MyComponent from '../components/MyComponent';

export default function MyPage() {
  return <MyComponent />;
}
```

## Add a New Page

1. Create `src/pages/NewPage.jsx` (export default React component)
2. Import in `src/App.jsx`:

```jsx
import NewPage from './pages/NewPage';
```

3. Add route:

```jsx
<Route path="/newpage" element={<NewPage />} />
```

## Build for Production

```bash
npm run build
```

Creates `dist/` folder with optimized files. Ready to deploy!

## Technologies Used

- **React 19** - UI framework
- **Vite 7** - Lightning-fast build
- **React Router 7** - Navigation
- **Lucide React** - 1000+ icons
- **Modern CSS** - No frameworks needed

## Need Help?

- Check `README.md` for full documentation
- See `PROJECT_SETUP.md` for detailed configuration
- View `VERIFICATION.md` for checklist

## Key Facts

- 16 pages fully integrated
- Zero-config Vite setup
- Auto-reloading development
- Production-ready build
- ~157 KB gzipped bundle

---

**Built for guitarists by developers** 🎸

Every guitar has a story. Let's share them.
