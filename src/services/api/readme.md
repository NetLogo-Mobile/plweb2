# API Service (`src/services/api/`)

This module handles **all communication with the backend server**. Never make raw `fetch()` calls outside of this module.

## Quick Start

```ts
import { getData } from '@api/getData';

const result = await getData('/Users/GetUser', { ID: '123' });
if (result.Status === 200) {
  console.log(result.Data);
}
```

## Files & What They Do

### `getData.ts` — The one function you'll use most

**Exports:**
- `getData<Path>(path, body)` — sends a typed POST request to any API endpoint
- `login(arg1, arg2, is_token?)` — authenticates the user (password or token)

**What happens when you call `getData`:**
1. Interceptor checks rate limits (you can't spam comments too fast)
2. Auto-injects `x-API-Token`, `x-API-AuthCode`, `x-API-Version` headers
3. Sends POST to the server (auto-resolves `@api` → real URL)
4. If network fails, tries to serve from offline cache (works for 6 paths)
5. Logs API errors to `$ErrorLogger` and shows a notification on failure

**Typed paths:** Every API path has TypeScript types. Use `ApiPath` to get full parameter/result types:

```ts
import type { ApiPath, APIParam, APIResult } from '@api/types';

// TypeScript will check your parameters and return type
const result: APIResult<'/Users/GetUser'> = await getData('/Users/GetUser', {
  ID: '123',
});
```

### `types.ts` — API type map

**Exports:**
- `PathMap` — a TypeScript interface mapping endpoint paths to their backend function types
- `ApiPath` — all valid endpoint paths as a union type
- `APIParam<Path>` — extracts the parameter type for a given path
- `APIResult<Path>` — extracts the return type for a given path
- `normalizePath(path)` — converts shorthand like `?user/GetUser` to `/Users/GetUser`

### `Interceptor.ts` — Before & after each request

**Exports:**
- `beforeRequest(path)` — checks rate limits, shows a loading message
- `afterRequest(response)` — hides the loading message
- `isRateLimitResponse(response)` — check if a response means "too many requests"

### `cache.ts` — Offline response cache

**Exports:**
- `buildApiCacheKey(path, body?)` — builds a unique cache key per user + path + body
- `readApiCache<T>(path, body?)` — reads cached API response
- `writeApiCache(path, body, value)` — writes API response to cache

Cached in localStorage under `apiResponseCache` key, expires after 30 days.

### `getDevice.ts` — Browser & device info

**Exports:**
- `getVisitorId()` — uses FingerprintJS to generate a stable device ID
- `getDeviceInfo()` — returns `Device` object (platform, screen size, CPU, GPU, timezone, etc.)

### `logWriter.ts` — Telemetry logger

**Exports:**
- `LogSession` — type for session start log
- `LogPage` — type for page view log
- `LogEvent` — type for user action log
- `LogItem` — union of all log types
- `LogManager` — singleton Logger instance (also available as `window.$Logger`)

**Usage:**
```ts
window.$Logger.logSession({ region: 'CN', userID: '123', ... });
window.$Logger.logPageView({ pageLink: '/home' });
window.$Logger.logEvent({ category: 'Community', action: 'Comment', label: 'experiment' });
```

## How to add a new API endpoint

1. Find the backend function type in `src/pl-serve-type-main/type/main.ts`
2. Add it to `PathMap` in `types.ts`
3. Call it with `getData('/Your/NewEndpoint', { ... })` — types will work automatically
4. For offline caching, add the path to `CACHEABLE_PATHS` in `getData.ts`

## Important Notes

- All requests are **POST** only
- Don't use `fetch()` directly — you'll lose auth headers, error logging, and offline cache
- The Interceptor auto-shows a loading message and hides it when done
- Rate limiting currently only applies to `/Messages/PostComment`
