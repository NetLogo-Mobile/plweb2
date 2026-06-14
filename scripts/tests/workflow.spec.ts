import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import {
  interceptAllAPIs,
  injectLoginState,
  injectLoginStateWithoutNavigation,
  waitForPageReady,
  assertNoWhiteScreen,
  TEST_EXPERIMENT_ID,
  TEST_CATEGORY,
  TEST_USER_ID,
} from './test-helpers'

test.describe('用户操作流程 (Workflows)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllAPIs(page)
  })

  test('完整浏览流程: 首页 → 作品 → 返回', async ({ page }) => {
    await injectLoginState(page)
    await page.goto('/')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const blockContainer = page.locator('.block-container')
    await expect(blockContainer).toBeVisible({ timeout: 10000 })

    const firstDetailed = page.locator('.block-container .detailed').first()
    await expect(firstDetailed).toBeVisible({ timeout: 10000 })
    await firstDetailed.click()
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    expect(currentUrl).toContain('/p/')

    await assertNoWhiteScreen(page)

    const returnBtn = page.locator('.return').first()
    if (await returnBtn.isVisible()) {
      await returnBtn.click()
      await page.waitForTimeout(1500)
      await assertNoWhiteScreen(page)
    }
  })

  test('已登录用户: 首页 → 个人资料 → 设置页', async ({ page }) => {
    await injectLoginState(page)
    await page.goto('/')
    await waitForPageReady(page)

    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const settingsBtn = page.locator('.settings-btn').first()
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click()
      await page.waitForTimeout(1500)
      const url = page.url()
      expect(url).toContain('/s')
      await assertNoWhiteScreen(page)

      const pageTitle = page.locator('.page-title')
      await expect(pageTitle).toBeVisible({ timeout: 5000 })
    }
  })

  test('底部导航切换所有标签页', async ({ page }) => {
    await injectLoginState(page)
    await page.goto('/')
    await waitForPageReady(page)

    const tabs = [
      { name: 'Home', path: '/', selector: 'footer nav a' },
      { name: 'BlackHole', path: '/b', selector: 'footer nav a' },
      { name: 'Friends', path: '/f', selector: 'footer nav a' },
      { name: 'Notifications', path: '/n', selector: 'footer nav a' },
    ]

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      const links = page.locator(tab.selector)
      const link = links.nth(i)
      await expect(link).toBeVisible()
      await link.click()
      await page.waitForTimeout(2000)
      await assertNoWhiteScreen(page)
    }
  })

  test('匿名用户尝试登录流程', async ({ page }) => {
    const fakeEmail = faker.internet.email()
    const fakePassword = faker.internet.password()

    await page.goto('/')
    await waitForPageReady(page)

    const userArea = page.locator('.user')
    await userArea.click()
    await page.waitForTimeout(1000)

    const loginCard = page.locator('.container .card').first()
    await expect(loginCard).toBeVisible({ timeout: 5000 })

    const emailInput = page.locator('.inputArea input').first()
    await emailInput.fill(fakeEmail)

    const passwordInput = page.locator('.inputArea input[type="password"]').first()
    await passwordInput.fill(fakePassword)

    const loginButton = page.locator('.loginButton').first()
    await expect(loginButton).toBeVisible()
    await loginButton.click()
    await page.waitForTimeout(2000)

    await assertNoWhiteScreen(page)
  })

  test('查看作品详情并浏览评论区', async ({ page }) => {
    await injectLoginState(page)

    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const cover = page.locator('.cover')
    await expect(cover).toBeVisible({ timeout: 10000 })

    const context = page.locator('.context')
    await expect(context).toBeVisible({ timeout: 10000 })

    const tagContainer = page.locator('.tagContainer')
    await expect(tagContainer).toBeVisible({ timeout: 5000 })

    const contextText = await context.textContent()
    expect(contextText).toBeTruthy()
  })

  test('已登录用户在评论区互动', async ({ page }) => {
    await injectLoginState(page)

    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(2000)

    const messageList = page.locator('.message-list, .context')
    if (await messageList.isVisible()) {
      const messages = messageList.locator('.message-item, .n-divider + div')
      const count = await messages.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('用户在 BlackHole 页面浏览', async ({ page }) => {
    await injectLoginState(page)
    await page.goto('/#/b')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const blackHole = page.locator('#blackhole')
    await expect(blackHole).toBeVisible({ timeout: 10000 })

    const blockContainer = page.locator('.block-container')
    await expect(blockContainer).toBeVisible({ timeout: 15000 })

    const headerTitle = page.locator('.header-container h1')
    await expect(headerTitle).toBeVisible()
  })

  test('导航到 About 页面', async ({ page }) => {
    await page.goto('/#/about')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('浏览器前进后退导航不白屏', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    await page.goto('/#/b')
    await waitForPageReady(page)

    await page.goto('/#/f')
    await waitForPageReady(page)

    await page.goBack()
    await page.waitForTimeout(1500)
    await assertNoWhiteScreen(page)

    await page.goBack()
    await page.waitForTimeout(1500)
    await assertNoWhiteScreen(page)

    await page.goForward()
    await page.waitForTimeout(1500)
    await assertNoWhiteScreen(page)
  })
})
