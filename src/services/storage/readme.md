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
const cached = sm.getObj('userConfig', 60 * 60 * 1000);

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
getObj<Key extends StorageKey>(key: Key, maxAgeMs?: number): StorageResult<StorageSchema[Key]>
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
sm.setObj('userIDAndAvatarIDMap', { 'user-1': [3, Date.now()] }, 72 * 60 * 60 * 1000); // expires in 72 hours
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

The TypeScript type `StorageKey` restricts valid keys to the keys of the `StorageSchema` interface:

| Key | Purpose |
|---|---|
| `userInfo` | Current user's profile data |
| `tagConfig` | Content tag configuration |
| `userConfig` | User preferences (language, mermaid, debugger, API base URL, ...) |
| `visitorId` | Legacy FingerprintJS device ID — no longer written; device ID is generated on-the-fly by `@api/getDevice` |
| `requestHistoryMap` | API request timestamps for rate limiting (2 days) |
| `apiResponseCache` | Legacy offline API response cache — no longer written; removed on startup (see `@api/cache`) |
| `userIDAndAvatarIDMap` | Avatar index cache per user (72 hours) |
| `userAuthInfo` | Auth token + auth code (30 days) |
| `cookieConsent` | Whether user dismissed the cookie notice |

## Adding a New Key

If you need to store something new, add it to the `StorageSchema` interface in `index.ts`:

```ts
export interface StorageSchema {
  userInfo: UserInfo
  // ... existing keys ...
  yourNewKey: YourType; // ← add here
}
```

This gives you full TypeScript type safety when calling `sm.getObj('yourNewKey')`.

## Why Not Just Use localStorage Directly?

- **No try/catch needed** — storage operations can throw (quota exceeded, private browsing, corrupted data). `getObj`/`getStr` catch everything and return `{ status: 'empty' }`.
- **TTL built in** — expiration logic is handled automatically.
- **Type safe** — keys are checked at compile time.
- **Consistent format** — all data follows the `{ value, time, maxAgeMs }` shape.
