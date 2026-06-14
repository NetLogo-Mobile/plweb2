import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 配置文件 - plweb2 前端自动化测试
 * 
 * 测试策略：
 * 1. 使用 route.fulfill() 拦截所有 API 请求，确保测试不依赖外部服务
 * 2. 覆盖所有已知 API 路径（见 src/services/api/types.ts PathMap）
 * 3. 测试页面逻辑、导航、登录、数据展示等核心功能
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'scripts/tests/reports/playwright-report', open: 'never' }],
    ['json', { outputFile: 'scripts/tests/reports/playwright-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  outputDir: 'reports/test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
