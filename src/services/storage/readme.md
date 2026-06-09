# Storage Service (`src/services/storage/`)

A thin wrapper around `localStorage` that adds **expiry / TTL support** and **error-safe parsing**.

## Quick Start

```ts
import sm from '@storage/index';

// Write
sm.setObj('userConfig', { lang: 'en' });

// Read (always safe — returns { status, value } never throws)
const result = sm.getObj('userConfig');
if (result.status === 'success') {
  console.log(result.value.lang); // 'en'
}

// Read with expiry (returns 'expired' after 1 hour)
const cached = sm.getObj('apiResponseCache', 60 * 60 * 1000);

// Remove
sm.remove('visitorId');

// Clear everything
sm.clear();
```

## Files

Just one file: `index.ts`. Default export is `storageManager`.

## API

### `getObj(key, maxAgeMs?)`

```ts
getObj(key: localStorages, maxAgeMs?: number): StorageResult<any>
```

Returns:
- `{ status: 'success', value: ... }` — data exists and hasn't expired
- `{ status: 'expired', value: null }` — data exists but is too old
- `{ status: 'empty', value: null }` — no data, or JSON parse error

The `maxAgeMs` parameter **overrides** the stored maxAge. If neither is set, the data never expires.

### `getStr(key, maxAgeMs?)`

Same as `getObj` but tries to return a string value. If the stored value is plain text (not JSON), it returns it directly.

### `setObj(key, value, maxAgeMs?)`

Stores as: `{ value, time: Date.now(), maxAgeMs }`

```ts
sm.setObj('visitorId', 'abc123', 365 * 24 * 60 * 60 * 1000); // expires in 365 days
sm.setObj('cookieConsent', true); // never expires
```

### `setStr(key, value, maxAgeMs?)`

Same as `setObj` but for string values.

### `remove(key)`

```ts
sm.remove('userAuthInfo');
```

### `clear()`

Calls `localStorage.clear()` — removes everything.

## Available Keys

The TypeScript type `localStorages` restricts valid keys to:

| Key | Purpose |
|---|---|
| `userInfo` | Current user's profile data |
| `tagConfig` | Content tag configuration |
| `userConfig` | User preferences (language, debug mode) |
| `visitorId` | FingerprintJS device ID (365 days) |
| `requestHistoryMap` | API request timestamps for rate limiting (2 days) |
| `apiResponseCache` | Offline API response cache (30 days) |
| `userIDAndAvatarIDMap` | Avatar index cache per user (72 hours) |
| `userAuthInfo` | Auth token + auth code (30 days) |
| `cookieConsent` | Whether user dismissed the cookie notice |

## Adding a New Key

If you need to store something new, add it to the `localStorages` union type in `index.ts`:

```ts
type localStorages =
  | "userInfo"
  // ... existing keys ...
  | "yourNewKey";  // ← add here
```

This gives you full TypeScript type safety when calling `sm.getObj('yourNewKey')`.

## Why Not Just Use localStorage Directly?

- **No try/catch needed** — storage operations can throw (quota exceeded, private browsing, corrupted data). `getObj`/`getStr` catch everything and return `{ status: 'empty' }`.
- **TTL built in** — expiration logic is handled automatically.
- **Type safe** — keys are checked at compile time.
- **Consistent format** — all data follows the `{ value, time, maxAgeMs }` shape.
