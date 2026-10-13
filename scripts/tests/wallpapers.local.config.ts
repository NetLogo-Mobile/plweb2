import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default defineConfig({
  testDir: '.',
  testMatch: 'wallpapers.spec.ts',
  outputDir: join(tmpdir(), 'plweb-wallpaper-tests'),
  use: { baseURL: 'http://127.0.0.1:5176' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit-mobile', use: { browserName: 'webkit', viewport: { width: 390, height: 844 } } },
  ],
})
