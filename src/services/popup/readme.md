# Popup Service (`src/services/popup/`)

This module provides **popup/dialog UI elements** like login dialogs, user cards, action sheets, error dialogs, and Naive UI notifications.

**Key concept:** All popups here are **mounted independently** from the main Vue app — they create their own DOM elements, call `createApp()`, and mount separately. This lets them overlay above everything.

## Quick Start

```ts
import { showMessage, showNotification, showDialog } from '@popup/index';

showMessage('success', 'Operation completed!');
showNotification({ title: 'Hello', content: 'World' });
showDialog('warning', {
  title: 'Confirm',
  content: 'Are you sure?',
  positiveText: 'Yes',
});
```

## Files & What They Do

### `index.ts` — Entry point (re-exports everything)

```ts
import { showMessage, showDialog, showLoadingBar, showModal, showNotification,
         showUserProfileDialog, showLoginModel, showAPiError } from '@popup/index';
```

### `naiveui.ts` — Naive UI discrete API wrappers

**Exports:**
- `showMessage(type, content, config?)` — show a brief toast message
  - Types: `'loading' | 'info' | 'success' | 'warning' | 'error'`
  - Returns a `MessageReactive` that can be `.destroy()`-ed
- `showNotification(config)` — show a notification in the corner
- `showDialog(type, config)` — show a modal dialog with buttons
  - Types: `'info' | 'success' | 'warning' | 'error'`
- `showModal(config)` — show a generic modal overlay
- `showLoadingBar(duration)` — show a top-of-page loading bar for `duration` ms

Uses Naive UI's `createDiscreteApi` so these work **without** installing any Vue component.

### `loginModel.ts` — Login dialog

```ts
import showLoginModel from '@popup/loginModel';

await showLoginModel(); // Opens a full-screen login overlay
```

Mounts `src/components/popup/loginModel.vue` as an independent Vue instance.

### `userProfileDialog.ts` — User card popup

```ts
import showUserProfileDialog from '@popup/userProfileDialog';

showUserProfileDialog('user-id-123'); // Shows a floating user card
```

Triggered globally by clicking any `.RUser` element (see `App.vue`).

Mounts `src/components/popup/userProfileDialog.vue`.

### `apiError.ts` — Retry-able error dialog

```ts
import { showAPiError } from '@popup/apiError';

showAPiError(
  'Failed to load',
  'Connection timed out',
  () => getData('/Contents/GetProfile', { ID: '123' }),
);
```

Features:
- **Singleton** — only one error dialog exists at a time; calling again updates its content
- **Retry button** — optional retry callback; shows success/failure after retry
- Mounts `src/components/popup/ApiErrorDialog.vue`

### `actionSheet.ts` — Bottom action sheet

```ts
import showActionSheet from '@popup/actionSheet';

showActionSheet(
  [{ label: 'Edit' }, { label: 'Delete' }, { label: 'Share' }],
  (index) => console.log('Selected option', index),
);
```

Mounts `src/components/popup/actionSheet.vue`. Click outside to dismiss.

## Architecture Pattern

All popups follow this pattern:
1. Create a `<div>` and append it to `document.body`
2. Use `createApp(Component, props)` to mount the component
3. Pass a `close` callback that calls `app.unmount()` and `div.remove()`
4. Register needed plugins (e.g., `app.use(i18n)`)

Only `naiveui.ts` is different — it uses `createDiscreteApi()` which doesn't need mounting.
