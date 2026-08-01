# Rich Text Parser (`src/services/pltxt2htm/`)

This module converts **pltxt format** (Physics Lab's custom rich text format) into **HTML** with full support for LaTeX math, code highlighting, and Mermaid diagrams.

## Quick Start

```ts
import parseAdvanced from '@services/pltxt2htm/advancedParser';
import parseCommon from '@services/pltxt2htm/commonParser';

// For user-generated content (supports math, code, diagrams)
const html = await parseAdvanced(sourceText, {
  host: 'https://example.com',
  project: 'project-id',
  visitorId: 'visitor-id',
  authorId: 'author-id',
  coauthorIds: ['coauthor-1'],
});

// For simple text (plain conversion, no extra rendering)
const simpleHtml = await parseCommon(sourceText);
```

## Files & What They Do

### `advancedParser.ts` — Full-featured parser

**Default export:** `parse(source: string, context?: ParseContext): Promise<string>`

**What it does:**
1. Calls WASM function `fixedadv_parser` to convert pltxt → raw HTML
2. Renders LaTeX math with KaTeX (`$...$` for inline, `$$...$$` for display)
3. Renders Mermaid diagrams (code blocks with `language-mermaid`) — honors the `userConfig.mermaid` setting (`'on'` default, `'off'` disables)
4. Highlights code blocks with highlight.js
5. Returns the complete HTML string

**`ParseContext` interface:**
```ts
interface ParseContext {
  host?: string;       // Base URL for links
  project?: string;    // Current project ID
  visitorId?: string;  // Current visitor's device ID
  authorId?: string;   // Content author's user ID
  coauthorIds?: string[]; // Co-author user IDs
}
```

**Important:** The returned HTML is **not sanitized** — it comes from trusted WASM output + your server. Only render it in `v-html` for content you trust.

### `commonParser.ts` — Simple parser

**Default export:** `parse(source: string): Promise<string>`

Just converts pltxt → raw HTML via WASM. No KaTeX, no Mermaid, no highlight.js. Use this when you only need the basic text conversion.

### `wasmLoader.ts` — Shared WASM instance

**Export:** `getWasmInstance(): Promise<any>`

Loads the pltxt2htm WebAssembly module once and caches it. If called during an ongoing load, it returns the existing promise instead of starting a new one.

Loads from `./vendor/pltxt2htm.js` which bootstraps the `.wasm` binary.

### `deallocator.ts` — WASM memory deallocation

**Export:** `getDeallocator(): Promise<(ptr: number) => void>`

Returns a function that frees WASM-allocated memory. Wraps the `free` C function. Always call this after extracting a string from WASM to avoid memory leaks.

## Architecture

```
pltxt text string
    │
    ▼
WASM (pltxt2htm.wasm) — converts pltxt to raw HTML
    │
    ▼
KaTeX — renders $$...$$ and $...$ math
    │
    ▼
Mermaid — renders ```mermaid diagrams
    │
    ▼
highlight.js — highlights ```code blocks
    │
    ▼
Final HTML string
```

The WASM binary is at `./vendor/pltxt2htm.wasm` and loaded via the JS glue code at `./vendor/pltxt2htm.js`.

## Vendor Files

- `vendor/pltxt2htm.js` — Emscripten-generated JS loader for the WASM module
- `vendor/pltxt2htm.wasm` — compiled WebAssembly binary (not human-readable)

## CI Workflows / CI 工作流

- **English:** `.github/workflows/sync-pltxt2htm-release.yml` runs daily (cron `0 0 * * *`) and on manual dispatch. It downloads the latest upstream release asset `wasm32-unknown-emscripten-pltxt2htm-wasm-release.zip` from the `SekaiArendelle/pltxt2htm` repository, extracts the `.js`/`.wasm` files, and copies them into `vendor/`, committing when the files have changed.
- **中文：** `.github/workflows/sync-pltxt2htm-release.yml` 每天执行一次（cron `0 0 * * *`），并支持手动触发。它会从 `SekaiArendelle/pltxt2htm` 仓库下载最新发行版资产 `wasm32-unknown-emscripten-pltxt2htm-wasm-release.zip`，解压 `.js`/`.wasm` 文件并复制到 `vendor/` 目录，有更新时自动提交。

- **English:** `.github/workflows/run-playright-checks.yml` runs the Playwright E2E suite (Chromium, Firefox, WebKit) on pull requests and pushes to `main`/`dev`/`feature/**` branches.
- **中文：** `.github/workflows/run-playright-checks.yml` 在 PR 以及 `main`/`dev`/`feature/**` 分支的推送时运行 Playwright 端到端测试（Chromium、Firefox、WebKit）。
