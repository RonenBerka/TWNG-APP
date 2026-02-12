# TWNG Shared Components Guide

## Overview
This document provides quick reference for the 6 new shared card/display components created for the TWNG platform.

---

## 1. InstrumentCard

**Location:** `src/components/ui/InstrumentCard.jsx`

**Usage:**
```jsx
import { InstrumentCard } from '@/components/ui';

<InstrumentCard
  instrument={{
    id: 'guitar-001',
    make: 'Fender',
    model: 'Stratocaster',
    year: 1965,
    main_image_url: 'https://example.com/image.jpg',
    condition: 'Excellent',
    instrument_type: 'Electric Guitar',
    current_owner: 'John Doe',
    is_featured: true
  }}
  compact={false}
/>
```

**Props:**
- `instrument` (object, required): Instrument data with fields: id, make, model, year, main_image_url, condition, instrument_type, current_owner, is_featured
- `compact` (boolean, optional): Display in compact 1:1 aspect ratio. Default: false (4:5 aspect ratio)

**Features:**
- 4:5 aspect ratio image (adjustable to 1:1 with compact mode)
- Make, model, year in header
- Featured badge (if is_featured=true)
- Condition badge
- Owner information
- Clicks navigate to `/instrument/:id`

---

## 2. ForumThreadCard

**Location:** `src/components/Forum/ForumThreadCard.jsx`

**Usage:**
```jsx
import ForumThreadCard from '@/components/Forum/ForumThreadCard';

<ForumThreadCard
  thread={{
    id: 'thread-001',
    title: 'Best Beginner Electric Guitars',
    author: 'guitarnerd',
    created_at: '2024-02-10T10:30:00Z',
    reply_count: 15,
    view_count: 342,
    is_pinned: true,
    is_locked: false,
    last_activity: '2024-02-10T22:15:00Z'
  }}
/>
```

**Props:**
- `thread` (object, required): Thread data with fields: id, title, author, created_at, reply_count, view_count, is_pinned, is_locked, last_activity

**Features:**
- Bold thread title
- Author name and post date
- Reply/view count with icons
- Pinned/locked status indicators
- Last activity timestamp
- "Time ago" formatting (just now, 5m ago, etc.)
- Clicks navigate to `/forum/thread/:id`

---

## 3. ArticleCard

**Location:** `src/components/ArticleCard.jsx`

**Usage:**
```jsx
import ArticleCard from '@/components/ArticleCard';

<ArticleCard
  article={{
    id: 'article-001',
    title: 'The History of Electric Guitars',
    excerpt: 'Discover how electric guitars revolutionized music...',
    cover_image_url: 'https://example.com/article-cover.jpg',
    author: 'Jane Smith',
    category: 'History',
    created_at: '2024-02-01T14:00:00Z',
    slug: 'history-electric-guitars'
  }}
/>
```

**Props:**
- `article` (object, required): Article data with fields: id, title, excerpt, cover_image_url, author, category, created_at, slug (optional)

**Features:**
- 16:9 aspect ratio cover image
- Category badge (displayed on image)
- Title, excerpt (clamped to 2 lines)
- Author name and publish date
- Clicks navigate to `/articles/:slug` (or `/articles/:id` if no slug)

---

## 4. CollectionCard

**Location:** `src/components/CollectionCard.jsx`

**Usage:**
```jsx
import CollectionCard from '@/components/CollectionCard';

<CollectionCard
  collection={{
    id: 'collection-001',
    name: 'Vintage Guitars',
    description: 'My collection of rare vintage instruments...',
    cover_image_url: 'https://example.com/collection-cover.jpg',
    item_count: 24,
    user: 'guitarCollector',
    is_public: true
  }}
/>
```

**Props:**
- `collection` (object, required): Collection data with fields: id, name, description, cover_image_url, item_count, user, is_public

**Features:**
- 16:9 aspect ratio cover image
- Public/private badge with icon (Globe/Lock)
- Name, description (clamped to 2 lines)
- Item count
- Owner information
- Clicks navigate to `/collections/:id`

---

## 5. BadgeDisplay

**Location:** `src/components/ui/BadgeDisplay.jsx`

**Usage:**
```jsx
import { BadgeDisplay } from '@/components/ui';

<BadgeDisplay
  badges={[
    {
      id: 'badge-1',
      badge_type: 'achievement',
      name: 'First Collection',
      description: 'Created your first collection',
      icon_url: 'https://example.com/badge-1.png',
      awarded_at: '2024-01-15T10:00:00Z'
    },
    // ... more badges
  ]}
  size="md"
  max={6}
/>
```

**Props:**
- `badges` (array, optional): Array of badge objects. Each badge: id, badge_type, name, description, icon_url, awarded_at
- `size` (string, optional): 'sm' (32px), 'md' (48px), 'lg' (64px). Default: 'md'
- `max` (number, optional): Maximum badges to display before "+N more". Default: 6

**Features:**
- Circular badge display with optional icon images
- Hover tooltips showing badge name + description
- Size variants (small, medium, large)
- "+N more" overflow indicator
- Responsive layout
- "No badges earned yet" message when empty

---

## 6. ActivityFeed

**Location:** `src/components/ActivityFeed.jsx`

**Usage:**
```jsx
import ActivityFeed from '@/components/ActivityFeed';

<ActivityFeed
  userId="user-123"
  limit={5}
/>
```

**Props:**
- `userId` (string, required): User ID to fetch activity for
- `limit` (number, optional): Maximum activities to display. Default: 5

**Features:**
- Timeline-style activity list with icons
- Activity types:
  - added_instrument: Music icon
  - created_collection: Folder icon
  - wrote_article: FileText icon
  - joined_forum: MessageCircle icon
  - earned_badge: Award icon
- Loading skeleton while fetching
- Error state handling
- "Time ago" formatting
- "View all activity" link to `/profile/:userId/activity`
- Fetches from `getActivityFeed(userId, limit)` service

---

## Service: activityFeed

**Location:** `src/services/activityFeed.js`

**Functions:**

### getActivityFeed(userId, limit = 10)
Fetches user activity feed.

```jsx
import { getActivityFeed } from '@/services/activityFeed';

const activities = await getActivityFeed('user-123', 5);
```

Returns: Array of activity objects
```javascript
{
  id: string,
  type: 'added_instrument' | 'created_collection' | 'wrote_article' | 'joined_forum' | 'earned_badge',
  title: string,
  description: string,
  timestamp: Date,
  icon: string
}
```

### getActivityIcon(activityType)
Returns icon type name for activity type.

```jsx
const iconName = getActivityIcon('added_instrument'); // returns 'guitar'
```

---

## Styling Reference

All components use the theme token system (`T` from `src/theme/tokens.js`):

```javascript
const T = {
  bgDeep: "#0C0A09",      // Darkest background
  bgCard: "#1C1917",      // Card background
  bgElev: "#1A1816",      // Elevated/hover background
  border: "#2E2A27",      // Subtle borders
  borderAcc: "#78350F",   // Accent borders
  txt: "#FAFAF9",         // Primary text
  txt2: "#A8A29E",        // Secondary text
  txtM: "#78716C",        // Muted text
  warm: "#D97706",        // Warm accent (orange)
  amber: "#F59E0B",       // Amber accent
  success: "#34D399",     // Success green
  error: "#EF4444",       // Error red
  info: "#60A5FA",        // Info blue
};
```

---

## Installation in Index Files

The following exports have been added to `src/components/ui/index.js`:

```javascript
export { default as InstrumentCard } from './InstrumentCard';
export { default as BadgeDisplay } from './BadgeDisplay';
```

Import them as:
```jsx
import { InstrumentCard, BadgeDisplay } from '@/components/ui';
```

---

## Component Architecture

All components follow these patterns:

1. **Styling:** Inline styles using theme tokens, no external CSS files
2. **Icons:** Lucide React icons
3. **Navigation:** react-router-dom Link component
4. **Exports:** Both default and named exports
5. **Props:** Destructured with sensible defaults
6. **Responsive:** Mobile-friendly inline styles
7. **No TypeScript:** Pure JavaScript with JSDoc comments where needed

---

## Future Enhancements

- `InstrumentCard`: Add favorite/like button, condition rating system
- `ForumThreadCard`: Add tag system, user reputation indicators
- `ArticleCard`: Add reading time estimate, bookmark button
- `CollectionCard`: Add sharing options, collaborative editing
- `BadgeDisplay`: Add achievement progression bars, unlock info
- `ActivityFeed`: Add real-time updates, activity filtering, pagination

---

## Backup File

Original `GuitarCard.jsx` has been backed up to `src/components/ui/GuitarCard.jsx.OLD` for reference.
