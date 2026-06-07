import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Server did not start in time');
}

async function main() {
  await waitForServer(BASE);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  const errors = [];

  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console-error', message: msg.text() });
    }
  });

  // Test 1: Home page loads without errors
  console.log('Testing: Home page...');
  await page.goto(BASE + '/#/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#app', { timeout: 10000 });
  await page.screenshot({ path: 'verify-home.png', fullPage: true });

  if (errors.length > 0) {
    console.log('ERRORS on home page:');
    errors.forEach(e => console.log(`  [${e.type}] ${e.message}`));
    // Don't exit yet - test other pages
  } else {
    console.log('OK: Home page loaded without errors');
  }

  // Test 2: Navigate to About page
  console.log('Testing: About page...');
  await page.goto(BASE + '/#/about', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000); // let lazy-loaded component render
  const aboutErrors = errors.length;
  if (errors.length > aboutErrors) {
    console.log('ERRORS on about page:');
    errors.slice(aboutErrors).forEach(e => console.log(`  [${e.type}] ${e.message}`));
  } else {
    console.log('OK: About page loaded without errors');
  }

  // Test 3: Navigate to Settings page
  console.log('Testing: Settings page...');
  await page.goto(BASE + '/#/s', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const settingsErrors = errors.length;
  if (errors.length > settingsErrors) {
    console.log('ERRORS on settings page:');
    errors.slice(settingsErrors).forEach(e => console.log(`  [${e.type}] ${e.message}`));
  } else {
    console.log('OK: Settings page loaded without errors');
  }

  // Test 4: Navigate to 404 page
  console.log('Testing: 404 page...');
  await page.goto(BASE + '/#/nonexistent', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const notFoundErrors = errors.length;
  if (errors.length > notFoundErrors) {
    console.log('ERRORS on 404 page:');
    errors.slice(notFoundErrors).forEach(e => console.log(`  [${e.type}] ${e.message}`));
  } else {
    console.log('OK: 404 page loaded without errors');
  }

  await page.screenshot({ path: 'verify-final.png', fullPage: true });

  console.log('\n=== VERIFICATION SUMMARY ===');
  if (errors.length === 0) {
    console.log('PASS: No errors detected');
  } else {
    console.log(`FAIL: ${errors.length} error(s) detected`);
    errors.forEach(e => console.log(`  [${e.type}] ${e.message}`));
  }

  await browser.close();
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
