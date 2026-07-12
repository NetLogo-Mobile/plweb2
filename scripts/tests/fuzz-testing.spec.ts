import { test, expect } from './fixtures'
import { faker } from '@faker-js/faker'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { injectLoginStateWithoutNavigation } from './test-helpers'

// 只有 Footer 那几个页面可以直接打开，其他靠点击自然跳转
const ROUTES = ['/', '/b', '/n', '/f', '/s', '/about', '/nonexistent-page']

async function isAppRendered(page: any) {
  return page
    .evaluate(() => {
      const app = document.getElementById('app')
      return app !== null && app.children.length > 0
    })
    .catch(() => false)
}

async function pickRandomNavigable(page: any) {
  const selectors = ['a', 'button', '[role="button"]', 'footer a']
  const candidates: any[] = []
  for (const sel of selectors) {
    const loc = page.locator(sel)
    const n = await loc.count().catch(() => 0)
    for (let i = 0; i < n; i++) {
      candidates.push(loc.nth(i))
    }
  }
  if (candidates.length === 0) return null
  return candidates[faker.number.int({ min: 0, max: candidates.length - 1 })]
}

test.describe('Fuzz Testing', () => {
  test('50 次随机交互 — 基于真实渲染元素 @fuzz', async ({ page }, testInfo) => {
    test.setTimeout(180000)

    const screenshotsDir = join(
      process.cwd(),
      'scripts',
      'tests',
      'reports',
      'fuzz',
      testInfo.project.name,
    )
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

    // API 速率控制
    let lastApiTime = 0
    page.on('request', (req) => {
      if (req.url().includes('/api/')) {
        lastApiTime = Date.now()
      }
    })
    async function respectRateLimit() {
      const elapsed = Date.now() - lastApiTime
      if (elapsed < 250 && lastApiTime > 0) {
        await new Promise((r) => setTimeout(r, 250 - elapsed))
      }
    }

    let currentIteration = 0
    const totalIterations = 50

    await injectLoginStateWithoutNavigation(page)
    await page.goto('/')
    await page.waitForTimeout(1500)

    for (let i = 0; i < totalIterations; i++) {
      currentIteration = i

      const roll = Math.random()

      if (roll < 0.25) {
        // 跳转路由
        await respectRateLimit()
        const route = ROUTES[Math.floor(faker.number.int({ min: 0, max: ROUTES.length - 1 }))]
        await page.goto(`/#${route}`).catch(() => {})
        await page.waitForTimeout(faker.number.int({ min: 3000, max: 5000 }))
      } else {
        // 点击可跳转元素（<a> <button> 等，无类名依赖）
        await respectRateLimit()
        const el = await pickRandomNavigable(page)
        if (el) {
          try {
            await el.click({ timeout: 3000 })
            await page.waitForTimeout(faker.number.int({ min: 1500, max: 3000 }))
          } catch {
            // skip
          }
        }
      }

      const rendered = await isAppRendered(page)
      if (!rendered) {
        const screenshotPath = join(screenshotsDir, `whitescreen-iter-${i}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
      }
    }

    const { writeFileSync } = await import('fs')

    const errorLogsRaw = await page
      .evaluate(() => localStorage.getItem('error_logs'))
      .catch(() => null)
    if (errorLogsRaw) {
      writeFileSync(join(screenshotsDir, 'app-error-logs.json'), errorLogsRaw)
      try {
        const parsed = JSON.parse(errorLogsRaw)
        const lines = parsed.map(
          (log: any) =>
            `[${new Date(log.timestamp).toISOString()}] ${log.type.toUpperCase()}: ${log.message}` +
            (log.url ? `\n  URL: ${log.url}` : '') +
            (log.stack ? `\n  Stack: ${log.stack}` : '') +
            (log.statusCode ? `\n  Status: ${log.statusCode}` : ''),
        )
        writeFileSync(join(screenshotsDir, 'app-error-logs.txt'), lines.join('\n\n'))
      } catch {}
    }

    if (errors.length > 0) {
      writeFileSync(join(screenshotsDir, 'fuzz-errors.json'), JSON.stringify(errors, null, 2))
      console.log(`\n❌ Fuzz 测试发现 ${errors.length} 个错误 (${testInfo.project.name})`)
      for (const err of errors.slice(0, 20)) {
        console.log(`  [iter ${err.iteration}] [${err.type}] ${err.message.slice(0, 200)}`)
      }
      if (errors.length > 20) console.log(`  ... 还有 ${errors.length - 20} 个错误`)
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
      `[${testInfo.project.name}] ${filteredErrors.length} 个非预期控制台错误`,
    ).toBe(0)
  })
})
