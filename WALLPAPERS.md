# Static site wallpapers

## Shop integration draft

Own profile now links to `/shop`, containing Products and My backpack. All three wallpapers cost 1,000 community coins each. The displayed balance comes from the existing `userInfo.Gold` browser cache and is explicitly labeled as cached, with unknown values shown as a dash. No wallet mutation, purchase request or ownership record is created. Purchasing is disabled; backpack availability is unknown until a service exists. Local preview is development-only, excluded from ownership, and production wallpaper selection fails closed pending an ownership service. Chinese and English shop strings are provided; other locales currently use English shop copy.

Required backend integration: authenticate the community account, obtain authorized community-wallet debit capability, atomically debit 1,000 coins and grant permanent ownership, prevent duplicate purchases with idempotency and unique ownership constraints, return authoritative balance/inventory, and persist equipment. An independent service alone cannot debit the community wallet without its authorized integration.

Local prototype on an independent branch. Open `/#/wallpapers`, or Settings > Site wallpaper. Three built-in CSS gradient/pattern backgrounds are bundled with the application. No uploads, remote image URLs, animation, payments or grants are supported.

The shared header also provides a wallpaper selector for comparing backgrounds directly on normal community pages. For live public content on this machine, the network-enabled development server is at `http://127.0.0.1:5177/#/`. Public home and discussion feeds were visually checked with real API data; authenticated notifications and friends still require user login. Automated home/discussion navigation uses fixture responses for repeatability.

The selected allowlisted ID is stored in this browser under the typed `siteWallpaper` preference. It persists across routes and reloads and synchronizes across same-origin tabs. Storage errors keep the previous selection. Unknown IDs fall back to the default background. This is a browser appearance preference shared by accounts using that browser, with no server or account ownership claims.

The application shell paints one fixed non-interactive background. Settings, editor outer backgrounds, the shared header and footer use a transparent override only when a wallpaper is selected. The login card explicitly uses the reactive wallpaper so it also works when mounted outside the app shell. Inputs, content cards, experiment covers and editor content retain readable surfaces. Restoring default removes the overrides and returns the login card to its default background.

## Test locally

Start `npm run dev -- --host 127.0.0.1 --port 5176 --strictPort` and open `http://127.0.0.1:5176/#/wallpapers`.

Run `npx playwright test --config scripts/tests/wallpapers.local.config.ts --workers=2`. The suite checks persistence, settings navigation, reset, tab synchronization, unknown IDs, keyboard selection and storage errors in Chromium and narrow-screen WebKit. These tests do not establish authenticated page coverage or real-device acceptance.

Before release: review authenticated content-heavy pages and editor layouts, check real mobile devices, and decide whether wallpaper selection should become an account setting. Account-owned/paid wallpapers require a server inventory and ownership checks before integration.
