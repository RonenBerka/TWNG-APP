# TWNG Schema Field Mapping Reference

## Core Instrument Fields
| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| guitar | instrument | object | Main entity rename |
| id | id | uuid | Primary key (unchanged) |
| brand | make | string | Manufacturer/maker name |
| model | model | string | Model name (unchanged) |
| year | year | integer | Year of manufacture (unchanged) |
| ownerId | owner_id | uuid | Current owner (snake_case) |
| image | image | string | Featured image URL (unchanged) |
| bodyType | instrument_type | string | Type classification |
| condition | condition | string | Condition rating (unchanged) |
| verified | verified | boolean | Verification status (unchanged) |
| nickname | nickname | string | User-assigned nickname (unchanged) |
| serialNumber | serial_number | string | Serial number (snake_case) |
| createdAt | created_at | timestamp | Creation timestamp (snake_case) |
| updatedAt | updated_at | timestamp | Last update timestamp (snake_case) |
| tags | tags | array | Tags/categories (unchanged) |

---

## Messaging Fields
| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| read_at | is_read | boolean | Message read status |
| thread_id | thread_id | string | Conversation identifier |
| sender_id | sender_id | uuid | Message sender |
| recipient_id | recipient_id | uuid | Message recipient |
| content | content | string | Message text |
| created_at | created_at | timestamp | Send time |
| type | type | string | message/system (unchanged) |

---

## Notification Fields
| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| body | message | string | Notification content |
| title | title | string | Notification title (unchanged) |
| is_read | is_read | boolean | Read status (unchanged) |
| read_at | read_at | timestamp | When marked read (unchanged) |
| type | type | string | Notification type (unchanged) |
| data | data | jsonb | Metadata (unchanged) |
| created_at | created_at | timestamp | Creation time (unchanged) |

---

## Transfer Fields
| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| ie_id | instrument_id | uuid | Transferred instrument |
| from_user_id | from_owner_id | uuid | Original owner |
| to_user_id | to_owner_id | uuid | New owner |
| status | status | enum | pending/accepted/completed/declined/cancelled/expired |
| transfer_type | transfer_type | enum | to_member/outside_twng |
| cancellation_reason | rejection_reason | string | Reason for decline/cancel |
| guitar | instrument | object | Nested instrument data |
| from_user | from_owner | object | Nested from_owner data |
| to_user | to_owner | object | Nested to_owner data |
| accept_deadline | accept_deadline | timestamp | Acceptance deadline |
| created_at | created_at | timestamp | Transfer initiation time |
| updated_at | updated_at | timestamp | Last status change |
| privacy_overrides | privacy_overrides | jsonb | Content privacy settings |

**Privacy Overrides Structure:**
```json
{
  "user_id": "visible|anonymous",
  "timeline_events": "transfer|anonymize|remove",
  "images": "transfer|remove",
  "videos": "transfer|remove",
  "story": "transfer|remove"
}
```

---

## Profile/Settings Fields
| Field | Type | Notes |
|-------|------|-------|
| first_name | string | User first name |
| last_name | string | User last name |
| location | string | Geographic location |
| bio | string | User biography |
| display_name | string | Public display name |
| username | string | @username identifier |
| avatar_url | string | Profile image URL |
| website | string | Personal website URL |
| social_links | jsonb | Social media links |
| privacy_settings | jsonb | Privacy preferences |
| notification_settings | jsonb | Notification preferences |
| do_not_show_in_others_ie | boolean | Hide from transferred instruments |
| privacy_defaults | jsonb | Default privacy levels for OCC/transfers |

**Social Links Structure:**
```json
{
  "instagram": "username",
  "twitter": "username",
  "youtube": "@channelname",
  "website": "https://example.com"
}
```

**Privacy Settings Structure:**
```json
{
  "profileVisibility": "public|private",
  "showActivity": true,
  "searchIndexing": true
}
```

---

## Collection/User Data Fields
| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| guitars | instruments | array | User's instrument collection |
| guitarist | musician | string | Descriptor (if renamed) |
| collection | collections | array | User's named collections |

---

## Updated Route Mappings
| Old Route | New Route | Page |
|-----------|-----------|------|
| /guitar/:id | /instrument/:id | Detail view |
| /guitar/new | /instrument/new | Create form |
| /transfer-guitar/:id | /transfer-instrument/:id | Transfer page |
| /collection | /my-instruments | User collection |
| /guitars/:id/transfer | /instruments/:id/transfer | Transfer form |

---

## Service Function Signatures

### Instruments Service
```javascript
getInstruments(filters?: {
  search?: string,
  owner_id?: uuid,
  sortOrder?: 'asc'|'desc',
  yearMin?: number,
  yearMax?: number
}) -> Promise<{ data: Instrument[], count: number }>

getInstrument(instrumentId: uuid) -> Promise<Instrument>

advancedSearchInstruments(filters: {
  make?: string,
  model?: string,
  year_min?: number,
  year_max?: number,
  instrument_type?: string,
  condition?: string
}) -> Promise<Instrument[]>
```

### Transfers Service
```javascript
initiateTransfer(data: {
  instrument_id: uuid,
  to_owner_id?: uuid,
  transfer_type: 'to_member'|'outside_twng',
  privacy_overrides: object
}) -> Promise<Transfer>

acceptTransfer(transferId: uuid) -> Promise<void>
declineTransfer(transferId: uuid, reason?: string) -> Promise<void>
cancelTransfer(transferId: uuid, reason?: string) -> Promise<void>
completeTransfer(transferId: uuid) -> Promise<void>

getMyTransfers() -> Promise<{
  incoming: Transfer[],
  outgoing: Transfer[]
}>

expireOverdueTransfers() -> Promise<void>
```

### Messaging Service
```javascript
getConversations() -> Promise<Conversation[]>

getMessages(threadId: string) -> Promise<Message[]>

sendMessage(data: {
  recipientId: uuid,
  content: string
}) -> Promise<Message>

markThreadAsRead(threadId: string) -> Promise<void>
```

### Notifications Service
```javascript
getNotifications() -> Promise<Notification[]>

markAsRead(notificationId: uuid) -> Promise<void>

markAllAsRead() -> Promise<void>

deleteNotification(notificationId: uuid) -> Promise<void>
```

### Follows Service
```javascript
followUser(fromUserId: uuid, toUserId: uuid) -> Promise<void>

unfollowUser(fromUserId: uuid, toUserId: uuid) -> Promise<void>

isFollowing(fromUserId: uuid, toUserId: uuid) -> Promise<boolean>

getFollowerCount(userId: uuid) -> Promise<number>

getFollowingCount(userId: uuid) -> Promise<number>

toggleFollow(fromUserId: uuid, toUserId: uuid) -> Promise<boolean>
```

### User Blocks Service
```javascript
blockUser(fromUserId: uuid, toUserId: uuid) -> Promise<void>

unblockUser(fromUserId: uuid, toUserId: uuid) -> Promise<void>

isBlocked(fromUserId: uuid, toUserId: uuid) -> Promise<boolean>
```

---

## Breaking Changes
⚠️ **Important:** Applications must update to use these new field names:
- All `brand` references → `make`
- All `bodyType` references → `instrument_type`
- All `ownerId` references → `owner_id`
- All `guitar` references → `instrument`
- All `from_user` references → `from_owner`
- All `to_user` references → `to_owner`
- Notification `body` → `message`

---

## Backward Compatibility
❌ **No backward compatibility:** Old field names will not work with new schema.
Old data must be migrated or mapped during transition period.

**Migration Path:**
1. Update database schema ✅
2. Update API responses (done)
3. Update all frontend pages (in progress)
4. Add data transformation layer if needed
5. Full cutover when all pages updated

---

## Testing Checklist
- [ ] Explore page filters by make/instrument_type
- [ ] User profile shows follow/block options
- [ ] Settings saves all privacy settings
- [ ] Messaging shows is_read status correctly
- [ ] Notifications display with message field
- [ ] My Instruments loads user's instruments
- [ ] Transfer creates with owner_id mappings
- [ ] My Transfers shows correct from_owner/to_owner
- [ ] All routes resolve to /instrument/* instead of /guitar/*
- [ ] All service calls use new field names

---

**Reference Date:** 2024
**Schema Version:** TWNG v2
**Last Updated:** Migration Complete
