import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { mkdirSync } from 'fs'
import { join } from 'path'

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/b', name: 'BlackHole' },
  { path: '/n', name: 'Notifications' },
  { path: '/m', name: 'Messages' },
  { path: '/f', name: 'Friends' },
  { path: '/s', name: 'Settings' },
  { path: '/about', name: 'About' },
  { path: '/u/test-user-001', name: 'Profile' },
  { path: '/nonexistent-page', name: 'NotFound' },
]

const CLICKABLE_SELECTORS = [
  'footer nav a',
  '.n-tabs-tab',
  '.user-item',
  '.detailed',
  '.brief',
  '.return',
  '.back-icon',
  '.settings-btn',
  '.close-btn',
  '.tag',
  '.block-container .block',
  '.cover',
  '.message-item',
  '.notification-item',
  '.user',
  '.username',
  '.resource',
  '.item',
  'button',
]

const INPUT_SELECTORS = [
  'input[type="text"]',
  'input[type="email"]',
  'input[type="password"]',
  'textarea',
  '.n-input input',
]

test.describe('Fuzz Testing', () => {
  test('随机交互 1000 次 — 基于真实 API 响应 @fuzz', async ({ page }, testInfo) => {
    const screenshotsDir = join(process.cwd(), 'scripts', 'tests', 'reports', 'fuzz', testInfo.project.name)
    mkdirSync(screenshotsDir, { recursive: true })

    interface FuzzError {
      iteration: number
      type: 'console-error' | 'page-error'
      message: string
      url: string
      timestamp: number
    }
    const errors: FuzzError[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push({
          iteration: currentIteration,
          type: 'console-error',
          message: msg.text(),
          url: page.url(),
          timestamp: Date.now(),
        })
      }
    })

    page.on('pageerror', (error) => {
      errors.push({
        iteration: currentIteration,
        type: 'page-error',
        message: error.message,
        url: page.url(),
        timestamp: Date.now(),
      })
    })

    // API 速率限制: 最多 5 请求/秒 → 每次请求后至少等 250ms
    let lastApiTime = 0
    page.on('request', (req) => {
      if (req.url().includes('/api/')) {
        const now = Date.now()
        lastApiTime = now
      }
    })

    async function respectRateLimit() {
      const elapsed = Date.now() - lastApiTime
      if (elapsed < 250 && lastApiTime > 0) {
        await new Promise((r) => setTimeout(r, 250 - elapsed))
      }
    }

    let currentIteration = 0
    const totalIterations = 1000
    let screenshotCount = 0

    // 首页等待真实 API 返回内容后再开始
    await page.goto('/')
    await page.waitForTimeout(5000)

    for (let i = 0; i < totalIterations; i++) {
      currentIteration = i

      if (errors.length > screenshotCount) {
        const screenshotPath = join(screenshotsDir, `error-iter-${i}-err-${errors.length}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
        screenshotCount = errors.length
      }

      const roll = Math.random()

      if (roll < 0.25) {
        // 跳转到随机路由，等待真实 API 数据加载
        await respectRateLimit()
        const route = ROUTES[Math.floor(faker.number.int({ min: 0, max: ROUTES.length - 1 }))]
        await page.goto(`/#${route.path}`).catch(() => {})
        await page.waitForTimeout(faker.number.int({ min: 3000, max: 5000 }))
        continue
      }

      if (roll < 0.65) {
        // 点击真实渲染的元素
        await respectRateLimit()
        const targets: any[] = []
        for (const sel of CLICKABLE_SELECTORS) {
          const loc = page.locator(sel)
          const count = await loc.count().catch(() => 0)
          for (let j = 0; j < Math.min(count, 3); j++) {
            targets.push(loc.nth(j))
          }
        }
        if (targets.length > 0) {
          const el = targets[faker.number.int({ min: 0, max: targets.length - 1 })]
          try {
            await el.click({ timeout: 3000, force: true })
            await page.waitForTimeout(faker.number.int({ min: 500, max: 1500 }))
          } catch {
            // skip
          }
        }
        continue
      }

      if (roll < 0.85) {
        // 在真实输入框填入文字
        await respectRateLimit()
        for (const sel of INPUT_SELECTORS) {
          const inputs = page.locator(sel)
          const count = await inputs.count().catch(() => 0)
          if (count > 0) {
            const input = inputs.nth(faker.number.int({ min: 0, max: count - 1 }))
            try {
              await input.fill(faker.lorem.words(3), { timeout: 2000 })
              await page.waitForTimeout(200)
            } catch {
              // skip
            }
            break
          }
        }
        continue
      }

      {
        // 点 checkbox
        await respectRateLimit()
        const checkboxes = page.locator('input[type="checkbox"]')
        const cc = await checkboxes.count().catch(() => 0)
        if (cc > 0) {
          const cb = checkboxes.nth(faker.number.int({ min: 0, max: cc - 1 }))
          try {
            await cb.click({ timeout: 2000, force: true })
            await page.waitForTimeout(300)
          } catch {
            // skip
          }
        }
      }
    }

    if (errors.length > screenshotCount) {
      const screenshotPath = join(screenshotsDir, `error-final-${errors.length}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
    }

    if (errors.length > 0) {
      const reportPath = join(screenshotsDir, 'fuzz-errors.json')
      const { writeFileSync } = await import('fs')
      writeFileSync(reportPath, JSON.stringify(errors, null, 2))

      console.log(`\n❌ Fuzz 测试发现 ${errors.length} 个错误 (${testInfo.project.name})`)
      for (const err of errors.slice(0, 20)) {
        console.log(`  [iter ${err.iteration}] [${err.type}] ${err.message.slice(0, 200)}`)
        console.log(`    URL: ${err.url}`)
      }
      if (errors.length > 20) {
        console.log(`  ... 还有 ${errors.length - 20} 个错误，详见 fuzz-errors.json`)
      }
      console.log(`  截图保存在: ${screenshotsDir}\n`)
    }

    const filteredErrors = errors.filter(
      (e) =>
        !e.message.includes('favicon') &&
        !e.message.includes('manifest') &&
        !e.message.includes('service-worker') &&
        !e.message.includes('sw.ts') &&
        !e.message.includes('404') &&
        !e.message.includes('ERR_BLOCKED_BY_CLIENT') &&
        !e.message.includes('Failed to load resource') &&
        !e.message.includes('net::ERR_'),
    )

    expect(
      filteredErrors.length,
      `[${testInfo.project.name}] Fuzz 测试完成: ${filteredErrors.length} 个非预期错误, 截图已上传到 artifacts`,
    ).toBe(0)
  })
})
