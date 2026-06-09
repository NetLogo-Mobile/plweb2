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
3. Renders Mermaid diagrams (code blocks with `language-mermaid`)
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

## Automated XSS Monitoring Workflow / 自动化 XSS 监控工作流

- **English:** CI now includes a scheduled workflow (`.github/workflows/pltxt2htm-xss-monitor.yml`) that runs every 6 hours and on manual dispatch. It dynamically downloads the latest upstream release asset `wasm32-unknown-emscripten-pltxt2htm-wasm-release.zip`, refreshes payload dictionaries from multiple authoritative feeds, and executes browser-based detection with Playwright.
- **中文：** CI 现已包含定时工作流（`.github/workflows/pltxt2htm-xss-monitor.yml`），每 6 小时执行一次，并支持手动触发。它会动态下载上游最新发行版资产 `wasm32-unknown-emscripten-pltxt2htm-wasm-release.zip`，从多个权威源刷新攻击载荷字典，并通过 Playwright 执行浏览器级自动检测。

### Payload Sources / 载荷来源

- **PayloadsAllTheThings**
- **PortSwigger XSS Cheat Sheet**
- **XSSTest Polyglots**
- **Bypass Filters payload list**

### Detection Logic / 检测逻辑

- **English:** The monitor treats each payload as suspicious if it produces executable HTML patterns (e.g., `<script>`, event handlers, JS URLs) or triggers browser-level execution signals (dialogs/console markers). Any hit fails CI.
- **中文：** 监控脚本会将每条载荷注入检测流程：若产出可执行 HTML 模式（如 `<script>`、事件处理器、`javascript:` URL）或触发浏览器执行信号（对话框/控制台标记），即判定为可疑并让 CI 失败。
