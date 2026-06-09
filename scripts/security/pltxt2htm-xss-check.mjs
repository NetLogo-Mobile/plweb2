import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const RELEASE_REPO = 'SekaiArendelle/pltxt2htm';
const RELEASE_ASSET = 'wasm32-unknown-emscripten-pltxt2htm-wasm-release.zip';
const MAX_PAYLOADS = Number(process.env.MAX_PAYLOADS ?? 1500);
const SKIP_BROWSER = process.env.SKIP_BROWSER === '1';

const SOURCES = [
  {
    name: 'PayloadsAllTheThings',
    required: true,
    urls: [
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/2%20-%20XSS%20Polyglot.md',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/3%20-%20XSS%20Common%20WAF%20Bypass.md',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/IntrudersXSS.txt',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/JHADDIX_XSS.txt',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/RSNAKE_XSS.txt',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/XSS_Polyglots.txt',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/xss_payloads_quick.txt'
    ]
  },
  { name: 'PortSwigger Cheat Sheet', required: true, urls: ['https://portswigger.net/web-security/cross-site-scripting/cheat-sheet'] },
  {
    name: 'Bypass Filters',
    required: true,
    urls: [
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/BRUTELOGIC-XSS-STRINGS.txt',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/BRUTELOGIC-XSS-JS.txt',
      'https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/master/XSS%20Injection/Intruders/port_swigger_xss_cheatsheet_event_handlers.txt'
    ]
  }
];

const clean = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

async function fetchText(url) {
  const { stdout } = await execFileAsync('curl', ['-fsSL', '--max-time', '40', url], { cwd: process.cwd(), maxBuffer: 30 * 1024 * 1024 });
  return stdout;
}

function extractByName(name, text) {
  if (/PortSwigger/.test(name)) return [...text.matchAll(/<code[^>]*>([\s\S]*?)<\/code>/g)].map(m => m[1].replace(/<[^>]*>/g, ''));
  if (/PayloadsAllTheThings|Bypass/.test(name)) return [...text.matchAll(/`([^`]+)`/g)].map(m => m[1]).concat(text.split('\n'));
  return text.split('\n');
}

async function collectPayloads() {
  const set = new Set(['<img src=x onerror=alert(1)>', '<svg onload=alert(1)>']);
  for (const source of SOURCES) {
    let sourceCountBefore = set.size;
    for (const url of source.urls) {
      const txt = await fetchText(url);
      for (const raw of extractByName(source.name, txt)) {
        const line = clean(raw || '');
        if (!line || line.length > 1200 || line.startsWith('#') || line.startsWith('//')) continue;
        if (/(alert|onerror|onload|script|svg|iframe|javascript:|srcdoc|data:|onfocus|onmouseover|onpointer)/i.test(line)) set.add(line);
      }
      console.log(`[source-ok] ${source.name}: ${url}`);
    }
    const gained = set.size - sourceCountBefore;
    if (gained <= 0 && source.required) throw new Error(`Source yielded zero payloads: ${source.name}`);
    console.log(`[source-count] ${source.name}: +${gained}`);
  }
  const payloads = [...set].slice(0, MAX_PAYLOADS);
  console.log(`[payload-total] collected=${set.size} selected=${payloads.length} max=${MAX_PAYLOADS}`);
  return payloads;
}

async function run(cmd, args) {
  await execFileAsync(cmd, args, { cwd: process.cwd() });
}

async function main() {
  const payloads = await collectPayloads();
  if (SKIP_BROWSER) {
    console.log('SKIP_BROWSER=1 set, payload collection only.');
    return;
  }

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'pltxt2htm-xss-'));
  try {
    const release = JSON.parse(await fetchText(`https://api.github.com/repos/${RELEASE_REPO}/releases/latest`));
    const asset = release.assets?.find(a => a.name === RELEASE_ASSET);
    if (!asset?.browser_download_url) throw new Error('release asset missing');

    const zipPath = path.join(tmpDir, 'upstream.zip');
    await run('curl', ['-fL', '--max-time', '120', asset.browser_download_url, '-o', zipPath]);

    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const js = await readFile(path.join(process.cwd(), 'src/services/pltxt2htm/vendor/pltxt2htm.js'), 'utf-8');
    const wasm = await readFile(path.join(process.cwd(), 'src/services/pltxt2htm/vendor/pltxt2htm.wasm'));

    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.endsWith('/pltxt2htm.js')) return route.fulfill({ body: js, contentType: 'application/javascript' });
      if (url.endsWith('/pltxt2htm.wasm')) return route.fulfill({ body: wasm, contentType: 'application/wasm' });
      return route.continue();
    });

    await page.goto(`data:text/html,${encodeURIComponent('<script type="module" src="https://local.test/pltxt2htm.js"></script>')}`);

    const hits = [];
    for (const payload of payloads) {
      const result = await page.evaluate(async p => {
        // @ts-ignore
        const mod = await globalThis.pltxt2htm({ locateFile: () => 'https://local.test/pltxt2htm.wasm' });
        const parse = mod.cwrap('common_parser', 'number', ['string']);
        const ptr = parse(p);
        const html = mod.UTF8ToString(ptr);
        mod._free(ptr);
        const holder = document.createElement('div');
        holder.innerHTML = html;
        document.body.appendChild(holder);
        const suspicious = !!holder.querySelector('script,[onerror],[onload],[onfocus],[onmouseover],iframe,svg,a[href^="javascript:"]');
        return { suspicious, html: html.slice(0, 240) };
      }, payload);
      if (result.suspicious) hits.push({ payload, html: result.html });
    }

    await browser.close();

    if (hits.length > 0) {
      console.error(`Potential XSS detected: ${hits.length}`);
      console.error(JSON.stringify(hits.slice(0, 20), null, 2));
      process.exit(1);
    }

    console.log(`PASS payloads=${payloads.length}`);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
