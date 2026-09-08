import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
export default defineConfig({
  testDir: '.',
  testMatch: 'avatar-frames.spec.ts',
  outputDir: join(tmpdir(), 'plweb-avatar-frame-tests'),
  use: { baseURL: 'http://127.0.0.1:5175' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
})
