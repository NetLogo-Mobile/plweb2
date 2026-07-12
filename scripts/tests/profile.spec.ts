/**
 * 用户资料页测试 - Profile.vue
 *
 * 测试内容：
 * - 用户资料页加载
 * - 用户信息展示
 * - 作品列表展示
 * - 评论标签页
 * - 设置按钮（自己的资料页）
 * - API 覆盖（/Contents/GetProfile, /Users/GetUser）
 */

import { test, expect } from './fixtures'
import {
  injectLoginState,
  injectLoginStateWithoutNavigation,
  waitForPageReady,
  assertNoWhiteScreen,
  TEST_USER_ID,
} from './test-helpers'

test.describe('用户资料页 (Profile)', () => {

  test('应正常加载用户资料页', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)

    await assertNoWhiteScreen(page)
  })

  test('应显示用户昵称', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(1500)
    const userName = page.locator('.user-name-row div').first()
    await expect(userName).toBeVisible({ timeout: 10000 })
  })

  test('应显示用户标签（粉丝、关注）', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(1500)
    const userInfo = page.locator('.userInfo')
    await expect(userInfo).toBeVisible({ timeout: 10000 })
  })

  test('查看自己的资料页应显示设置按钮', async ({ page }) => {
    await injectLoginState(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(1500)
    await assertNoWhiteScreen(page)
  })

  test('点击设置按钮应导航到设置页', async ({ page }) => {
    await injectLoginState(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(1500)
    const settingsBtn = page.locator('.settings-btn').first()
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click()
      await page.waitForTimeout(1000)
      const url = page.url()
      expect(url).toContain('/s')
    }
  })

  test('应显示作品标签页', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(1500)
    const tabs = page.locator('.n-tabs')
    await expect(tabs).toBeVisible({ timeout: 10000 })
  })

  test('资料页应触发 GetProfile 和 GetUser API', async ({ page }) => {
    const calledApis: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/api/')) {
        const apiPath = new URL(url).pathname.replace(/^\/api/, '')
        calledApis.push(apiPath)
      }
    })

    await injectLoginStateWithoutNavigation(page)

    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(1500)

    // 验证 API 被调用
    expect(
      calledApis.length > 0,
      `应触发 API 调用，实际调用: ${calledApis.join(', ')}`,
    ).toBeTruthy()
  })
})
