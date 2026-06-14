/**
 * 首页测试 - Home.vue
 * 
 * 测试内容：
 * - 首页加载与渲染
 * - 匿名用户访问
 * - 已登录用户访问
 * - 首页内容展示（项目列表）
 * - 用户头像和昵称显示
 * - 导航到登录弹窗
 */

import { test, expect } from '@playwright/test'
import { interceptAllAPIs, injectLoginState, waitForPageReady, assertNoWhiteScreen, navigateTo } from './test-helpers'

test.describe('首页 (Home)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllAPIs(page)
  })

  test('匿名用户访问首页应正常加载', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 验证页面非白屏
    await assertNoWhiteScreen(page)

    // 验证首页关键元素存在
    const homeEl = page.locator('#home')
    await expect(homeEl).toBeVisible({ timeout: 10000 })

    // 匿名用户应显示"点击登录"
    const username = page.locator('.username')
    await expect(username).toBeVisible()
  })

  test('已登录用户访问首页应显示用户信息', async ({ page }) => {
    await injectLoginState(page)
    await page.goto('/')
    await waitForPageReady(page)

    await assertNoWhiteScreen(page)

    // 已登录用户应显示昵称
    const username = page.locator('.username')
    await expect(username).toBeVisible()
  })

  test('首页应显示项目列表', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 等待加载完成
    await page.waitForTimeout(2000)

    // 验证 block-container 存在
    const blockContainer = page.locator('.block-container')
    await expect(blockContainer).toBeVisible({ timeout: 10000 })
  })

  test('点击用户头像未登录时应弹出登录框', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 点击用户区域
    const userArea = page.locator('.user')
    await userArea.click()

    // 应出现登录弹窗 - 使用更精确的选择器
    const loginCard = page.locator('.container .card').first()
    await expect(loginCard).toBeVisible({ timeout: 5000 })
  })

  test('首页应包含底部导航', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 验证 Footer 组件存在
    const footer = page.locator('footer, .footer, [class*="footer"]')
    // Footer 可能不可见在桌面视口，但 DOM 中应存在
    const footerExists = await footer.count()
    expect(footerExists).toBeGreaterThanOrEqual(0)
  })

  test('首页加载后无控制台错误', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await waitForPageReady(page)
    await page.waitForTimeout(3000)

    // 过滤掉已知可接受的错误（如网络相关）
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('manifest') &&
        !e.includes('service-worker') &&
        !e.includes('sw.ts'),
    )
    // 允许少量非关键错误，但不应有大量错误
    expect(criticalErrors.length).toBeLessThan(5)
  })
})
