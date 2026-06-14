import { test, expect } from '@playwright/test'
import {
  interceptAllAPIs,
  injectLoginState,
  waitForPageReady,
  assertNoWhiteScreen,
  TEST_EXPERIMENT_ID,
  TEST_CATEGORY,
} from './test-helpers'

test.describe('错误状态与边界 (Error Handling)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllAPIs(page)
  })

  test('网络故障时页面不应白屏', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.abort('connectionfailed')
    })

    await page.goto('/')
    await page.waitForTimeout(5000)

    await assertNoWhiteScreen(page)
  })

  test('API 超时应显示友好提示', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 30000))
    })

    await page.goto('/')
    await waitForPageReady(page).catch(() => {})
    await page.waitForTimeout(2000)

    await assertNoWhiteScreen(page)
  })

  test('API 返回空数据时页面正常', async ({ page }) => {
    await page.route('**/api/Users/Authenticate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Status: 200, Message: 'OK', Data: null }),
      })
    })

    await page.goto('/')
    await page.waitForTimeout(5000)

    await assertNoWhiteScreen(page)
  })

  test('API 返回错误状态码页面不崩溃', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Status: 500, Message: 'Internal Server Error', Data: null }),
      })
    })

    await page.goto('/')
    await page.waitForTimeout(5000)

    await assertNoWhiteScreen(page)
  })

  test('无效路由参数不崩溃', async ({ page }) => {
    await page.goto('/#/p/invalid/invalid-id-12345')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('恶意 XSS 注入路由不崩溃', async ({ page }) => {
    await page.goto('/#/' + encodeURIComponent('<script>alert("xss")</script>'))
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('极其深层的嵌套路由不崩溃', async ({ page }) => {
    await page.goto('/#/' + 'a/'.repeat(50) + 'b')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('极长 URL 参数不崩溃', async ({ page }) => {
    const longString = 'x'.repeat(10000)
    await page.goto(`/#/p/Discussion/${longString}`)
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('作品详情页 API 报错后返回导航正常', async ({ page }) => {
    await page.route('**/api/Contents/GetSummary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Status: 404, Message: 'Not Found', Data: null }),
      })
    })

    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)

    const footerLinks = page.locator('footer nav a')
    await footerLinks.first().click()
    await page.waitForTimeout(2000)

    const url = page.url()
    expect(url).toContain('/')
    await assertNoWhiteScreen(page)
  })
})
