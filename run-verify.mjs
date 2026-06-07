import { spawn } from 'child_process';
import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';

const server = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--host', '0.0.0.0'], {
  stdio: 'pipe',
  shell: true,
});

let serverOutput = '';

server.stdout.on('data', d => serverOutput += d.toString());
server.stderr.on('data', d => serverOutput += d.toString());

async function waitForServer(timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${BASE}/`);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Server did not start\n' + serverOutput);
}

async function main() {
  console.log('Waiting for server...');
  await waitForServer();
  console.log('Server started');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];

  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', message: err.message });
  });
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console-error', message: msg.text() });
  });

  // Test 1: Home
  console.log('1. Home page...');
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForSelector('#app', { timeout: 10000 });
  await page.waitForTimeout(1500);

  // Test 2: About
  console.log('2. About page...');
  await page.goto(`${BASE}/#/about`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Test 3: Settings
  console.log('3. Settings page...');
  await page.goto(`${BASE}/#/s`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Check for console errors related to clipboard
  const clipboardErrors = errors.filter(e =>
    e.message.toLowerCase().includes('clipboard')
  );
  if (clipboardErrors.length > 0) {
    console.log('Clipboard errors found (likely pre-existing):', clipboardErrors);
  }

  await page.screenshot({ path: 'verify-vapor.png', fullPage: false });

  console.log('\n=== VERIFICATION ===');
  if (errors.length === 0) {
    console.log('PASS: No errors detected');
  } else {
    console.log(`ISSUES: ${errors.length} console error(s):`);
    errors.forEach(e => console.log(`  [${e.type}] ${e.message}`));
  }

  await browser.close();
}

main().catch(err => {
  console.error('FAILED:', err.message);
  process.exitCode = 1;
}).finally(() => {
  server.kill();
  setTimeout(() => process.exit(), 1000);
});
