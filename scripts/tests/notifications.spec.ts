import { test, expect } from './fixtures'
import {
  injectLoginStateWithoutNavigation,
  waitForPageReady,
  assertNoWhiteScreen,
} from './test-helpers'

test.describe('通知中心 (Notifications)', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
  })

  test('通知页面应正常加载', async ({ page }) => {
    await page.goto('/#/n')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const tabs = page.locator('.n-tabs')
    await expect(tabs).toBeVisible({ timeout: 10000 })
  })

  test('默认显示全部通知标签', async ({ page }) => {
    await page.goto('/#/n')
    await waitForPageReady(page)
    await page.waitForTimeout(2000)

    const tabPanes = page.locator('.n-tab-pane')
    const firstPane = tabPanes.first()
    await expect(firstPane).toBeVisible({ timeout: 5000 })
  })

  test('切换通知分类标签不白屏', async ({ page }) => {
    await page.goto('/#/n')
    await waitForPageReady(page)

    const tabLabels = ['系统消息', '回复和评论', '关注和粉丝', '作品', '管理通知']

    for (const label of tabLabels) {
      const tab = page.locator('.n-tabs-tab', { hasText: label })
      if (await tab.isVisible()) {
        await tab.click()
        await page.waitForTimeout(1500)

        await assertNoWhiteScreen(page)

        const activeTab = page.locator('.n-tabs-tab--active')
        const activeText = await activeTab.textContent()
        expect(activeText).toBeTruthy()
      }
    }
  })

  test('从底部导航进入通知页', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    const notifLink = page.locator('footer nav a').last()
    await expect(notifLink).toBeVisible()
    await notifLink.click()
    await page.waitForTimeout(2000)

    const url = page.url()
    expect(url).toContain('/n')

    await assertNoWhiteScreen(page)
  })

  test('通知页返回首页导航正常', async ({ page }) => {
    await page.goto('/#/n')
    await waitForPageReady(page)

    const homeLink = page.locator('footer nav a').first()
    await homeLink.click()
    await page.waitForTimeout(2000)

    const url = page.url()
    expect(url).toContain('/')

    await assertNoWhiteScreen(page)
  })
})
