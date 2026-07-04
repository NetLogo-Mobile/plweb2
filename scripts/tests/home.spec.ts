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

import { test, expect } from './fixtures'
import {
  injectLoginState,
  waitForPageReady,
  assertNoWhiteScreen,
} from './test-helpers'

test.describe('首页 (Home)', () => {
  test('匿名用户访问首页应正常加载', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
    const homeEl = page.locator('#home')
    await expect(homeEl).toBeVisible({ timeout: 10000 })
    const username = page.locator('.username')
    await expect(username).toBeVisible()
  })

  test('已登录用户访问首页应显示用户信息', async ({ page }) => {
    await injectLoginState(page)
    await page.goto('/')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
    const username = page.locator('.username')
    await expect(username).toBeVisible()
  })

  test('首页应显示项目列表', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)
    await page.waitForTimeout(2000)
    const blockContainer = page.locator('.block-container')
    await expect(blockContainer).toBeVisible({ timeout: 10000 })
  })

  test('点击用户头像未登录时应弹出登录框', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)
    const userArea = page.locator('.user')
    await userArea.click()
    const loginCard = page.locator('.container .card').first()
    await expect(loginCard).toBeVisible({ timeout: 5000 })
  })


})
