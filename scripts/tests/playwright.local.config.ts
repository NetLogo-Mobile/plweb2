import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  outputDir: join(tmpdir(), 'plweb-democracy-playwright-results'),
  reporter: [['list']],
  use: {
    ...baseConfig.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? baseConfig.use?.baseURL,
  },
  webServer: undefined,
})
