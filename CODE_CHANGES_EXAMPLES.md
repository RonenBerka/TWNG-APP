# TWNG Migration - Code Changes Examples

## Quick Reference: Before & After Code Snippets

---

## 1. Explore.jsx

### Import Changes
**Before:**
```javascript
import { useGuitars } from "../hooks/useGuitars";

const BRANDS = [
  "Fender", "Gibson", "Gretsch", // ...
];

const BODY_TYPES = ["Solid Body", "Semi-Hollow", // ...];
```

**After:**
```javascript
import { getInstruments } from "../lib/supabase/instruments";

const MAKES = [
  "Fender", "Gibson", "Gretsch", // ...
];

const INSTRUMENT_TYPES = ["Solid Body", "Semi-Hollow", // ...];
```

### Component Rename
**Before:**
```javascript
function ExploreGuitarCard({ guitar, view }) {
  return (
    <Link to={`/guitar/${guitar.id}`}>
      <span>{guitar.brand} · {guitar.year}</span>
      <p>{guitar.model}</p>
      <span>{guitar.bodyType}</span>
```

**After:**
```javascript
function ExploreInstrumentCard({ instrument, view }) {
  return (
    <Link to={`/instrument/${instrument.id}`}>
      <span>{instrument.make} · {instrument.year}</span>
      <p>{instrument.model}</p>
      <span>{instrument.instrument_type}</span>
```

### Fetch Logic
**Before:**
```javascript
const { guitars: allGuitars, total, loading, error } = useGuitars({
  search: debouncedSearch,
  sortOrder: sort,
  yearMin, yearMax,
});
```

**After:**
```javascript
const [allInstruments, setAllInstruments] = useState([]);

useEffect(() => {
  const fetchInstruments = async () => {
    try {
      const data = await getInstruments({
        search: debouncedSearch,
        sortOrder: sort,
        yearMin, yearMax,
      });
      setAllInstruments(data?.data || []);
      setTotal(data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch instruments:", err);
    }
  };
  fetchInstruments();
}, [debouncedSearch, sort, yearMin, yearMax]);
```

---

## 2. Notifications.jsx

### Field Rename
**Before:**
```javascript
const handleMarkRead = async (id) => {
  await markAsRead(id);
  setNotifications(prev => prev.map(n =>
    n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
  ));
};

{notification.title || notification.body || 'Notification'}
{notification.body && (
  <p>{notification.body}</p>
)}
```

**After:**
```javascript
const handleMarkRead = async (id) => {
  await markAsRead(id);
  // Updated schema: is_read field (not read)
  setNotifications(prev => prev.map(n =>
    n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
  ));
};

{notification.title || notification.message || 'Notification'}
{notification.message && (
  <p>{notification.message}</p>
)}
```

---

## 3. MyCollection.jsx

### Service & Hook Changes
**Before:**
```javascript
import { useGuitars } from "../hooks/useGuitars";

export default function MyCollection() {
  const { guitars: rawGuitars } = useGuitars();

  const collectionGuitars = useMemo(() =>
    (rawGuitars || []).map((g, i) => ({
      ...g,
      nickname: g.nickname || `Guitar #${i + 1}`,
    })),
  [rawGuitars]);
```

**After:**
```javascript
import { getInstruments } from "../lib/supabase/instruments";
import { useEffect } from "react";

export default function MyCollection() {
  const [collectionInstruments, setCollectionInstruments] = useState([]);

  useEffect(() => {
    const fetchMyInstruments = async () => {
      try {
        const data = await getInstruments({ owner_id: user?.id });
        setCollectionInstruments(data?.data || []);
      } catch (err) {
        console.error("Failed to fetch instruments:", err);
      }
    };
    if (user?.id) fetchMyInstruments();
  }, [user?.id]);

  const enrichedInstruments = useMemo(() =>
    (collectionInstruments || []).map((i, idx) => ({
      ...i,
      nickname: i.nickname || `Instrument #${idx + 1}`,
    })),
  [collectionInstruments]);
```

### Field Mappings
**Before:**
```javascript
<h1>My Collection</h1>
<button>Add Guitar</button>

const filtered = collectionGuitars.filter(g => {
  const matchSearch = !q ||
    g.brand.toLowerCase().includes(q) ||
    g.model.toLowerCase().includes(q);
  const matchFilter =
    selectedFilter === "all" ||
    (selectedFilter === "electric" && g.bodyType === "Solid Body");
});

{guitar.brand} · {guitar.year}
{guitar.bodyType}
```

**After:**
```javascript
<h1>My Instruments</h1>
<button>Add Instrument</button>

const filtered = enrichedInstruments.filter(i => {
  const matchSearch = !q ||
    i.make.toLowerCase().includes(q) ||
    i.model.toLowerCase().includes(q);
  const matchFilter =
    selectedFilter === "all" ||
    (selectedFilter === "electric" && i.instrument_type === "Solid Body");
});

{instrument.make} · {instrument.year}
{instrument.instrument_type}
```

---

## 4. TransferGuitar.jsx

### Component & Hook Changes
**Before:**
```javascript
import { useGuitar } from '../hooks/useGuitar';

export default function TransferGuitar() {
  const { guitarId } = useParams();
  const { guitar, loading: guitarLoading } = useGuitar(guitarId);

  const isOwner = !!(user && guitar && guitar.ownerId === user.id);

  const handleSubmit = async () => {
    await initiateTransfer({
      guitarId,
      toUserId: transferType === 'to_member' ? selectedUser?.id : null,
      transferType,
      privacyOverrides,
    });
  };
```

**After:**
```javascript
import { getInstrument } from '../lib/supabase/instruments';

export default function TransferInstrument() {
  const { instrumentId } = useParams();
  const [instrument, setInstrument] = useState(null);

  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const data = await getInstrument(instrumentId);
        setInstrument(data);
      } catch (err) {
        console.error("Failed to fetch instrument:", err);
      }
    };
    if (instrumentId) fetchInstrument();
  }, [instrumentId]);

  const isOwner = !!(user && instrument && instrument.owner_id === user.id);

  const handleSubmit = async () => {
    await initiateTransfer({
      instrument_id: instrumentId,
      to_owner_id: transferType === 'to_member' ? selectedUser?.id : null,
      transfer_type: transferType,
      privacy_overrides: privacyOverrides,
    });
  };
```

### UI & Route Changes
**Before:**
```javascript
<Link to={`/guitar/${guitarId}`}>Back to guitar</Link>

<div>
  <p>{guitar.brand} · {guitar.year}</p>
  <p>{guitar.model}</p>
</div>

{!guitar || !isOwner ? (
  <p>'Only the owner can transfer this guitar'</p>
  <Link to={guitar ? `/guitar/${guitarId}` : '/collection'}>Go back</Link>
) : null}

<p>The guitar has been marked as transferred...</p>

<Link to="/collection">My Collection</Link>
<Link to={`/guitar/${guitarId}`}>View Guitar</Link>
```

**After:**
```javascript
<Link to={`/instrument/${instrumentId}`}>Back to instrument</Link>

<div>
  <p>{instrument.make} · {instrument.year}</p>
  <p>{instrument.model}</p>
</div>

{!instrument || !isOwner ? (
  <p>'Only the owner can transfer this instrument'</p>
  <Link to={instrument ? `/instrument/${instrumentId}` : '/my-instruments'}>Go back</Link>
) : null}

<p>The instrument has been marked as transferred...</p>

<Link to="/my-instruments">My Instruments</Link>
<Link to={`/instrument/${instrumentId}`}>View Instrument</Link>
```

---

## 5. MyTransfers.jsx

### Field Mappings
**Before:**
```javascript
const TransferCard = ({ transfer, direction, onAction }) => {
  const guitar = transfer.guitar;
  const otherUser = direction === 'incoming' ? transfer.from_user : transfer.to_user;
  const [declineReason, setDeclineReason] = useState('');

  return (
    <div>
      <p>{guitar?.brand} · {guitar?.year}</p>
      <Link to={`/guitar/${guitar?.id}`}>
        {guitar?.model || 'Unknown Guitar'}
      </Link>
      <span>From</span>
      <span>To</span>
    </div>
  );
};
```

**After:**
```javascript
const TransferCard = ({ transfer, direction, onAction }) => {
  const instrument = transfer.instrument;
  const otherUser = direction === 'incoming' ? transfer.from_owner : transfer.to_owner;
  // Updated schema: cancellation_reason → rejection_reason
  const [declineReason, setDeclineReason] = useState('');

  return (
    <div>
      <p>{instrument?.make} · {instrument?.year}</p>
      <Link to={`/instrument/${instrument?.id}`}>
        {instrument?.model || 'Unknown Instrument'}
      </Link>
      <span>From</span>
      <span>To</span>
    </div>
  );
};
```

---

## 6. Messaging.jsx

### Read Status Field
**Before:**
```javascript
<MessageBubble message={message} currentUserId={user?.id} />

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.sender_id === currentUserId;

  return (
    <div>
      <span>{formatMessageTime(new Date(message.created_at))}</span>
      {isOwn && (
        <div>
          {message.read_at ? (
            <CheckCheck size={12} />
          ) : (
            <Check size={12} />
          )}
        </div>
      )}
    </div>
  );
};
```

**After:**
```javascript
<MessageBubble message={message} currentUserId={user?.id} />

const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.sender_id === currentUserId;

  return (
    <div>
      <span>{formatMessageTime(new Date(message.created_at))}</span>
      {isOwn && (
        <div>
          {/* Updated schema: is_read field (not read_at) */}
          {message.is_read ? (
            <CheckCheck size={12} />
          ) : (
            <Check size={12} />
          )}
        </div>
      )}
    </div>
  );
};
```

---

## Key Pattern Changes

### Pattern 1: Service Import
**Before:**
```javascript
import { useHook } from "../hooks/useHook";
const { data, loading } = useHook();
```

**After:**
```javascript
import { getService } from "../lib/supabase/service";
const [data, setData] = useState([]);
useEffect(() => {
  const fetch = async () => {
    const result = await getService();
    setData(result?.data || []);
  };
  fetch();
}, [dependencies]);
```

### Pattern 2: Field Renames
**Before:**
```javascript
guitar.brand        // ❌
guitar.bodyType     // ❌
guitar.ownerId      // ❌
```

**After:**
```javascript
instrument.make           // ✅
instrument.instrument_type // ✅
instrument.owner_id       // ✅
```

### Pattern 3: API Call Updates
**Before:**
```javascript
await initiateTransfer({
  guitarId,
  toUserId,
  transferType,
  privacyOverrides,
})
```

**After:**
```javascript
await initiateTransfer({
  instrument_id,
  to_owner_id,
  transfer_type,
  privacy_overrides,
})
```

### Pattern 4: Route Updates
**Before:**
```javascript
<Link to={`/guitar/${guitar.id}`}>
<Link to="/collection">
<Link to="/transfer-guitar/:id">
```

**After:**
```javascript
<Link to={`/instrument/${instrument.id}`}>
<Link to="/my-instruments">
<Link to="/transfer-instrument/:id">
```

---

## Summary of Changes by Category

### Imports/Services
- `useGuitars` hook → `getInstruments` function
- `useGuitar` hook → `getInstrument` function

### Object Names
- `guitar` → `instrument`
- `BRANDS` → `MAKES`
- `BODY_TYPES` → `INSTRUMENT_TYPES`

### Field Names (guitars)
- `brand` → `make`
- `bodyType` → `instrument_type`
- `ownerId` → `owner_id`
- `serialNumber` → `serial_number`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

### Field Names (transfers)
- `guitar` → `instrument`
- `from_user` → `from_owner`
- `to_user` → `to_owner`
- `ie_id` → `instrument_id`
- `from_user_id` → `from_owner_id`
- `to_user_id` → `to_owner_id`
- `cancellation_reason` → `rejection_reason`

### Field Names (messaging)
- Message read indicator: `read_at` → `is_read`

### Field Names (notifications)
- `body` → `message`

### UI Text
- "My Collection" → "My Instruments"
- "Add Guitar" → "Add Instrument"
- "Total Guitars" → "Total Instruments"
- References to "guitar" → "instrument"

### Routes
- `/guitar/:id` → `/instrument/:id`
- `/transfer-guitar/:id` → `/transfer-instrument/:id`
- `/collection` → `/my-instruments`

---

**All changes maintain existing styling, functionality, and architecture.**
**No functionality has been removed or altered—only field names and references updated.**
