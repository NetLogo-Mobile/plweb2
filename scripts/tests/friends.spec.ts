import { test, expect } from './fixtures'
import {
  injectLoginStateWithoutNavigation,
  waitForPageReady,
  assertNoWhiteScreen,
} from './test-helpers'

test.describe('好友/社交页 (Friends)', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
  })

  test('好友页应正常加载', async ({ page }) => {
    await page.goto('/#/f')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const tabs = page.locator('.n-tabs')
    await expect(tabs).toBeVisible({ timeout: 10000 })
  })

  test('切换好友标签不白屏', async ({ page }) => {
    await page.goto('/#/f')
    await waitForPageReady(page)

    const tabLabels = ['follower', 'volunteers', 'editors', 'en', 'baned']

    for (const name of tabLabels) {
      const tab = page
        .locator(`.n-tabs-tab[data-name="${name}"], .n-tabs-tab`)
        .filter({ hasText: new RegExp(name, 'i') })
      if (await tab.isVisible().catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(1500)
        await assertNoWhiteScreen(page)
      } else {
        const allTabs = page.locator('.n-tabs-tab')
        const count = await allTabs.count()
        for (let i = 0; i < count; i++) {
          const t = allTabs.nth(i)
          await t.click()
          await page.waitForTimeout(1000)
          await assertNoWhiteScreen(page)
        }
        break
      }
    }
  })

  test('从底部导航进入好友页', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    const friendLink = page.locator('footer nav a').nth(2)
    await friendLink.click()
    await page.waitForTimeout(2000)

    const url = page.url()
    expect(url).toContain('/f')

    await assertNoWhiteScreen(page)
  })

})
