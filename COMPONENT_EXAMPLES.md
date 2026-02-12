# TWNG Components - Copy & Paste Examples

Quick examples you can copy directly into your pages.

---

## InstrumentCard Example

```jsx
import { InstrumentCard } from '@/components/ui';

export default function InstrumentGallery() {
  const instruments = [
    {
      id: 'guitar-001',
      make: 'Fender',
      model: 'Stratocaster',
      year: 1965,
      main_image_url: 'https://example.com/strat.jpg',
      condition: 'Excellent',
      instrument_type: 'Electric Guitar',
      current_owner: 'John Doe',
      is_featured: true
    },
    // ... more instruments
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {instruments.map(instrument => (
        <InstrumentCard key={instrument.id} instrument={instrument} />
      ))}
    </div>
  );
}
```

---

## ForumThreadCard Example

```jsx
import ForumThreadCard from '@/components/Forum/ForumThreadCard';

export default function ForumThreadList() {
  const threads = [
    {
      id: 'thread-001',
      title: 'Best Beginner Electric Guitars Under $500',
      author: 'guitarnerd',
      created_at: '2024-02-10T10:30:00Z',
      reply_count: 15,
      view_count: 342,
      is_pinned: true,
      is_locked: false,
      last_activity: '2024-02-10T22:15:00Z'
    },
    {
      id: 'thread-002',
      title: 'Vintage Vs Modern: Which Should You Buy?',
      author: 'retromusic',
      created_at: '2024-02-08T14:20:00Z',
      reply_count: 28,
      view_count: 567,
      is_pinned: false,
      is_locked: false,
      last_activity: '2024-02-09T18:45:00Z'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {threads.map(thread => (
        <ForumThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
```

---

## ArticleCard Example

```jsx
import ArticleCard from '@/components/ArticleCard';

export default function ArticleGrid() {
  const articles = [
    {
      id: 'article-001',
      title: 'The History of Electric Guitars',
      excerpt: 'From Leo Fender to modern innovations, discover how electric guitars revolutionized music.',
      cover_image_url: 'https://example.com/article-cover.jpg',
      author: 'Jane Smith',
      category: 'History',
      created_at: '2024-02-01T14:00:00Z',
      slug: 'history-electric-guitars'
    },
    {
      id: 'article-002',
      title: 'Setting Up Your First Acoustic Guitar',
      excerpt: 'A complete beginner\'s guide to string height, action, and intonation.',
      cover_image_url: 'https://example.com/setup-guide.jpg',
      author: 'Mike Johnson',
      category: 'Tutorial',
      created_at: '2024-01-28T09:15:00Z',
      slug: 'acoustic-setup-guide'
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

---

## CollectionCard Example

```jsx
import CollectionCard from '@/components/CollectionCard';

export default function UserCollections() {
  const collections = [
    {
      id: 'collection-001',
      name: 'Vintage Guitars',
      description: 'My personal collection of rare vintage instruments from the 1950s-1970s. All are playable and well-maintained.',
      cover_image_url: 'https://example.com/vintage.jpg',
      item_count: 24,
      user: 'guitarCollector',
      is_public: true
    },
    {
      id: 'collection-002',
      name: 'Modern Production Guitars',
      description: 'Contemporary guitars from major manufacturers. Great for beginners and professionals alike.',
      cover_image_url: 'https://example.com/modern.jpg',
      item_count: 18,
      user: 'guitarCollector',
      is_public: true
    },
    {
      id: 'collection-003',
      name: 'Wishlist - Private',
      description: 'Guitars I want to acquire in the future. Personal notes on condition and pricing.',
      cover_image_url: 'https://example.com/wishlist.jpg',
      item_count: 12,
      user: 'guitarCollector',
      is_public: false
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
      {collections.map(collection => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
```

---

## BadgeDisplay Example

```jsx
import { BadgeDisplay } from '@/components/ui';

export default function UserProfile() {
  const userBadges = [
    {
      id: 'badge-1',
      badge_type: 'achievement',
      name: 'First Collection',
      description: 'Created your first collection',
      icon_url: 'https://example.com/badges/first-collection.png',
      awarded_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'badge-2',
      badge_type: 'achievement',
      name: 'Forum Expert',
      description: 'Made 100+ forum posts with positive feedback',
      icon_url: 'https://example.com/badges/forum-expert.png',
      awarded_at: '2024-01-20T15:30:00Z'
    },
    {
      id: 'badge-3',
      badge_type: 'milestone',
      name: '10 Instruments',
      description: 'Added 10 instruments to platform',
      icon_url: 'https://example.com/badges/10-instruments.png',
      awarded_at: '2024-01-25T12:00:00Z'
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Achievements</h2>
      <BadgeDisplay badges={userBadges} size="md" max={5} />
    </div>
  );
}
```

### BadgeDisplay Size Variants

```jsx
// Small badges (32px)
<BadgeDisplay badges={userBadges} size="sm" />

// Medium badges (48px) - default
<BadgeDisplay badges={userBadges} size="md" />

// Large badges (64px)
<BadgeDisplay badges={userBadges} size="lg" />
```

---

## ActivityFeed Example

```jsx
import ActivityFeed from '@/components/ActivityFeed';
import { useAuth } from '@/context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '500px' }}>
      <ActivityFeed userId={user.id} limit={5} />
    </div>
  );
}
```

### With Custom Styling

```jsx
export default function ActivityWidget() {
  const { user } = useAuth();

  return (
    <div style={{
      backgroundColor: '#1C1917',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '20px'
    }}>
      <ActivityFeed userId={user.id} limit={10} />
    </div>
  );
}
```

---

## Complete Page Example

```jsx
import { InstrumentCard, BadgeDisplay } from '@/components/ui';
import ActivityFeed from '@/components/ActivityFeed';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  const userBadges = [
    // ... badges
  ];

  const instruments = [
    // ... instruments
  ];

  return (
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
      {/* Main Content */}
      <div>
        <h1>My Instruments</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {instruments.map(instrument => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3>Badges</h3>
          <BadgeDisplay badges={userBadges} size="md" />
        </div>

        <ActivityFeed userId={user.id} limit={5} />
      </div>
    </div>
  );
}
```

---

## Grid Layout Recipes

### 3-Column Grid (InstrumentCard)
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px'
}}>
  {instruments.map(i => <InstrumentCard key={i.id} instrument={i} />)}
</div>
```

### Responsive Grid (ArticleCard)
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '16px'
}}>
  {articles.map(a => <ArticleCard key={a.id} article={a} />)}
</div>
```

### Single Column (ForumThreadCard)
```jsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}}>
  {threads.map(t => <ForumThreadCard key={t.id} thread={t} />)}
</div>
```

---

## Error Handling

All components handle missing data gracefully:

```jsx
// Safe - missing fields won't break
<InstrumentCard instrument={{
  id: 'test-1',
  make: 'Test',
  model: 'Model'
  // year, owner, condition all optional
}} />

<BadgeDisplay badges={[]} />  // Shows "No badges earned yet"

<ActivityFeed userId={user.id} />  // Shows loading state, handles errors
```

---

## Performance Tips

1. **Memoization for Lists:**
```jsx
import { memo } from 'react';
const MemoizedCard = memo(InstrumentCard);

{instruments.map(i => <MemoizedCard key={i.id} instrument={i} />)}
```

2. **Lazy Load Images:**
```jsx
<InstrumentCard instrument={instrument} />
// Images use standard <img> tag which supports lazy loading
```

3. **Virtual Scrolling for Long Lists:**
```jsx
// Use react-window or react-virtual for very long lists
import { FixedSizeList } from 'react-window';
```

---

## Theme Token Reference

All components automatically respect the theme:

```javascript
const T = {
  bgDeep: "#0C0A09",      // Darkest background
  bgCard: "#1C1917",      // Card background
  bgElev: "#1A1816",      // Elevated background
  border: "#2E2A27",      // Borders
  txt: "#FAFAF9",         // Primary text
  txt2: "#A8A29E",        // Secondary text
  txtM: "#78716C",        // Muted text
  warm: "#D97706",        // Orange accent (primary)
  amber: "#F59E0B",       // Amber accent
  success: "#34D399",     // Green (success)
  error: "#EF4444",       // Red (error)
  info: "#60A5FA",        // Blue (info)
};
```

Change the theme globally via ThemeContext - all components update automatically.
