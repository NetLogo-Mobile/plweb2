# Avatar frames: integration draft

Local preview: start Vite and open `/#/avatar-frames?frameDemo=1`. The demo is available only in development. Three CSS/SVG placeholder frames are included. No purchases or real account changes occur.

Production API calls are opt-in with `VITE_AVATAR_FRAMES=on`. Keep disabled until the backend is implemented. The proposed `/AvatarFrames/GetInventory` and `/AvatarFrames/Equip` endpoints use the existing `getData` authentication flow; they are frontend contracts, pending server support.

Inventory response: `{ Owned: FrameID[], Equipped: FrameID | null, IsBanned: boolean, Revision: string }`. Equip input: `{ FrameID: string | null, ExpectedRevision: string }`. Return the full authoritative inventory after success. The server must resolve the account from authentication, validate ownership and current ban status, and apply revision checks atomically. Reject unknown/unowned frames and writes from banned accounts. Never trust a client-supplied ban state or owner ID.

On account ban, clear Equipped atomically, preserve Owned, invalidate public profile caches, and omit frames from all public responses. On unban, Owned remains unchanged and the user may equip again. The frontend also suppresses frames when Verification is Banned or IsBanned is true. Missing public status fails closed. Moderation races must be handled server-side.

Public user metadata: optional `AvatarFrameID` plus authoritative `Verification`/`IsBanned`. Reuse the existing account/backpack system where possible; the current Backpack type alone does not provide an equip operation. Do not reinterpret the existing numeric Decoration field without agreeing on its server contract.

Current shared renderer integration: home avatar, comment avatar, user-card popup, notifications and friend lists; inventory owns its preview. Rich-text generated avatars remain integration work. No new per-avatar API requests are introduced. Friend lists use public metadata on the existing User object. Notifications require an optional AvatarUser public object whose ID exactly matches Users[0]; system messages, missing status and mismatched IDs display no frame. The server must enrich these responses with current public status rather than historical sender snapshots, and strip frame fields for anonymous senders. Frame ownership, cross-device sync, cache invalidation and moderation notifications require backend acceptance tests before release.

## Validation and remaining release gates

Start the local server with `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort`, then run `npx playwright test --config scripts/tests/avatar-frames.local.config.ts --workers=2`. The four scenarios run in Chromium and WebKit: cached banned account isolation, friend/notification metadata updates, equip/reload/ban/unban persistence, and banned/unowned frame rejection. The spec also participates in the existing development-server Playwright suite.

Before production enablement, implement the server contracts and frame grants, verify real-account switching and cross-device updates, complete avatar coverage, and test moderation races and API failures. Local demo validation does not cover these server release gates.
