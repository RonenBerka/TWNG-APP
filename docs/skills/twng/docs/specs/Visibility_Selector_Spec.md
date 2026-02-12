# TWNG — Visibility Selector Specification

> **Feature:** User Choice Privacy Controls
> **Version:** 1.0
> **Priority:** P0 (Core Feature)

---

## Overview

### What is the Visibility Selector?
A UI component that lets users choose who can see each guitar: Private, Link, or Public. This is the "User Choice" privacy model.

### Core Principle
> "Your guitars. Your way."

Users control visibility per guitar. No forced sharing. No hidden defaults.

---

## Three Visibility Levels

| Level | Icon | Who Can See | Use Case |
|-------|------|-------------|----------|
| **Private** | 🔒 | Only you | Valuable guitars, personal archive |
| **Link** | 🔗 | Anyone with the link | Share with friends, get help ID'ing |
| **Public** | 🌐 | Everyone (searchable) | Community, show collection |

### Default
**Private** is always the default. Nothing shared without explicit choice.

---

## UI Contexts

The visibility selector appears in 3 contexts:

### Context 1: Add Guitar Flow (after Magic Add / Manual Entry)

Full selector with descriptions:

```
┌─────────────────────────────────────────────┐
│                                             │
│   Who can see this guitar?                  │
│   ────────────────────────                  │
│   Your guitars. Your way.                   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ ● 🔒 Private                        │   │
│   │   Only you can see it.              │   │
│   │   Perfect for valuable guitars or   │   │
│   │   personal documentation.           │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ ○ 🔗 Link sharing                   │   │
│   │   Anyone with the link can view.    │   │
│   │   Great for sharing with friends.   │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ ○ 🌐 Public                         │   │
│   │   Visible in TWNG community.        │   │
│   │   Connect with other owners.        │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ℹ️ You can change this anytime.           │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │       Save to My Collection         │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Context 2: Guitar Detail Page (Quick Toggle)

Compact dropdown on guitar page:

```
┌─────────────────────────────────────────────┐
│                                             │
│   🎸 Fender Stratocaster 1965               │
│   ─────────────────────────────             │
│                                             │
│   Visibility: [🔒 Private      ▼]           │
│                                             │
│   ┌─────────────────────────────┐           │
│   │ ● 🔒 Private                │ ← Current │
│   │ ○ 🔗 Link sharing           │           │
│   │ ○ 🌐 Public                 │           │
│   └─────────────────────────────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Click to open dropdown
- Select new option
- Auto-saves (with brief confirmation)

---

### Context 3: Collection View (Icon Indicator)

Visibility shown as icon on guitar cards:

```
┌─────────────────────────────────────────────┐
│  My Collection                        [+ Add]│
│─────────────────────────────────────────────│
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ 🎸      │  │ 🎸      │  │ 🎸      │     │
│  │ Strat   │  │ Les Paul│  │ Martin  │     │
│  │ 1965    │  │ 2019    │  │ D-28    │     │
│  │ 🔒      │  │ 🌐      │  │ 🔗      │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                             │
│  5 guitars · 3 private · 1 link · 1 public  │
│                                             │
└─────────────────────────────────────────────┘
```

**Tap icon to quick-change**, or tap card to open detail page.

---

## Confirmation Dialogs

### Changing to Public

When changing from Private/Link to Public, show confirmation:

```
┌─────────────────────────────────────────────┐
│                                             │
│   Make this guitar public?                  │
│   ────────────────────────                  │
│                                             │
│   Your Fender Stratocaster will be          │
│   visible to everyone on TWNG and           │
│   may appear in search results.             │
│                                             │
│   ┌─────────────┐  ┌─────────────┐         │
│   │   Cancel    │  │ Make Public │         │
│   └─────────────┘  └─────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

### Changing from Public to Private

No confirmation needed (more restrictive is always OK).

### Changing to Link

No confirmation needed.

---

## Link Sharing Flow

When user selects "Link sharing":

```
┌─────────────────────────────────────────────┐
│                                             │
│   🔗 Link sharing enabled                   │
│   ─────────────────────                     │
│                                             │
│   Anyone with this link can view:           │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ twng.com/g/abc123xyz               │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌───────────┐  ┌───────────┐             │
│   │ 📋 Copy   │  │ 📤 Share  │             │
│   └───────────┘  └───────────┘             │
│                                             │
│   ℹ️ Only people with this link can see     │
│      this guitar. It won't appear in        │
│      search or your public profile.         │
│                                             │
│   [Done]                                    │
│                                             │
└─────────────────────────────────────────────┘
```

**Share options:**
- Copy link
- Share via system share sheet (iOS/Android)
- WhatsApp, iMessage, Email shortcuts

---

## Bulk Visibility Change

For multiple guitars at once:

```
┌─────────────────────────────────────────────┐
│  Select Guitars                     [Done]  │
│─────────────────────────────────────────────│
│                                             │
│  ☑️ Fender Stratocaster                     │
│  ☑️ Gibson Les Paul                         │
│  ☐ Martin D-28                              │
│  ☑️ PRS Custom 24                           │
│                                             │
│  ─────────────────────────────────────      │
│  3 selected                                 │
│                                             │
│  Change visibility to:                      │
│                                             │
│  [🔒 Private] [🔗 Link] [🌐 Public]         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Settings: Default Visibility

In user settings:

```
┌─────────────────────────────────────────────┐
│  Privacy Settings                           │
│─────────────────────────────────────────────│
│                                             │
│  Default visibility for new guitars         │
│  ─────────────────────────────────          │
│                                             │
│  ● 🔒 Private (recommended)                 │
│  ○ 🔗 Link sharing                          │
│  ○ 🌐 Public                                │
│                                             │
│  ℹ️ You can always change visibility        │
│     when adding each guitar.                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Component Specifications

### VisibilitySelector Component

```tsx
interface VisibilitySelectorProps {
  value: 'private' | 'link' | 'public';
  onChange: (value: 'private' | 'link' | 'public') => void;
  variant: 'full' | 'compact' | 'icon';
  showDescriptions?: boolean;
  disabled?: boolean;
}

// Usage
<VisibilitySelector
  value={guitar.visibility}
  onChange={handleVisibilityChange}
  variant="full"
  showDescriptions={true}
/>
```

### VisibilityIcon Component

```tsx
interface VisibilityIconProps {
  visibility: 'private' | 'link' | 'public';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

// Icons
const icons = {
  private: '🔒',  // or LockIcon
  link: '🔗',     // or LinkIcon
  public: '🌐'    // or GlobeIcon
};
```

---

## Database Schema

```sql
-- Guitars table
ALTER TABLE guitars ADD COLUMN visibility VARCHAR(10) DEFAULT 'private';
-- Values: 'private', 'link', 'public'

ALTER TABLE guitars ADD COLUMN share_token VARCHAR(20);
-- Unique token for link sharing (generated when visibility = 'link')

-- Index for public guitars (for community/search)
CREATE INDEX idx_guitars_public ON guitars(visibility) WHERE visibility = 'public';

-- User settings
ALTER TABLE users ADD COLUMN default_visibility VARCHAR(10) DEFAULT 'private';
```

---

## API Endpoints

### Update Visibility

```
PATCH /api/v1/guitars/:id/visibility

Request:
{
  "visibility": "public"
}

Response:
{
  "success": true,
  "guitar_id": "uuid",
  "visibility": "public",
  "share_url": null  // Only returned for 'link'
}
```

### Get Share Link

```
GET /api/v1/guitars/:id/share-link

Response:
{
  "share_url": "https://twng.com/g/abc123xyz",
  "share_token": "abc123xyz"
}
```

### Bulk Update

```
PATCH /api/v1/guitars/bulk-visibility

Request:
{
  "guitar_ids": ["uuid1", "uuid2", "uuid3"],
  "visibility": "private"
}

Response:
{
  "success": true,
  "updated_count": 3
}
```

---

## URL Structure for Shared Guitars

| Visibility | URL Pattern |
|------------|-------------|
| Private | Not accessible via URL |
| Link | `twng.com/g/{share_token}` |
| Public | `twng.com/guitar/{guitar_id}` or `twng.com/@{username}/{guitar_slug}` |

---

## Accessibility

- Radio buttons are keyboard accessible
- Focus states clearly visible
- Icons have aria-labels
- Screen reader announces current visibility
- Color is not the only indicator

---

## Analytics Events

| Event | When | Data |
|-------|------|------|
| `visibility_changed` | User changes visibility | from, to, guitar_id |
| `share_link_copied` | User copies share link | guitar_id |
| `share_link_shared` | User uses system share | guitar_id, platform |
| `public_confirmation_shown` | Confirmation dialog appears | - |
| `public_confirmation_accepted` | User confirms public | guitar_id |
| `public_confirmation_cancelled` | User cancels | guitar_id |

---

## Error States

### Network Error

```
┌─────────────────────────────────────────────┐
│                                             │
│   ⚠️ Couldn't update visibility             │
│                                             │
│   Check your connection and try again.      │
│                                             │
│   [Retry]                                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Already Public (duplicate warning)

```
┌─────────────────────────────────────────────┐
│                                             │
│   ℹ️ This guitar is already public          │
│                                             │
└─────────────────────────────────────────────┘
```

---

*"You decide who sees."*

> **Note:** TWNG is English-only. No Hebrew in the product UI.
