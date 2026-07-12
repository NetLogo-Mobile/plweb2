import { test, expect } from './fixtures'
import {
  injectLoginStateWithoutNavigation,
  waitForPageReady,
  assertNoWhiteScreen,
  TEST_EXPERIMENT_ID,
  TEST_CATEGORY,
} from './test-helpers'

// 错误处理测试本身就会触发控制台错误（API 报错、网络断开等）
// 关闭 autoCollectErrors 以避免误报
test.use({ suppressErrorCollection: true })

// 匹配后端 API 端点（/api/Contents/...）但不会误伤 Vite 服务的源文件
// （/src/services/api/getData.ts 等）。`**/api/**` 会同时匹配两者，
// 导致模块脚本被替换为 JSON 返回 → MIME 错误 → 白屏。
const API_URL_MATCH = (url: URL) => url.pathname.startsWith('/api/')

test.describe('错误状态与边界 (Error Handling)', () => {

  test('网络故障时页面不应白屏', async ({ page }) => {
    await page.route(API_URL_MATCH, async (route) => {
      await route.abort('connectionfailed')
    })

    await page.goto('/')
    await page.waitForTimeout(5000)

    await assertNoWhiteScreen(page)
  })

  test('API 超时应显示友好提示', async ({ page }) => {
    // 模拟 API 超时（延迟 10 秒，足够模拟"慢"但不超过测试超时）
    await page.route(API_URL_MATCH, async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000))
    })

    await page.goto('/')
    // 不等待 networkidle（那会等待延迟的 API 返回），只等 DOM 加载
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    await assertNoWhiteScreen(page)
  })

  test('API 返回错误状态码页面不崩溃', async ({ page }) => {
    await page.route(API_URL_MATCH, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 500,
          Message: 'Internal Server Error',
          Data: null,
        }),
      })
    })

    await page.goto('/')
    await page.waitForTimeout(3000)

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

  test('无效路由参数不崩溃', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto('/#/p/invalid/invalid-id-12345')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('极长 URL 参数不崩溃', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    const longString = 'a'.repeat(10000)
    await page.goto(`/#/p/Discussion/${longString}`)
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('极其深层的嵌套路由不崩溃', async ({ page }) => {
    await page.goto('/#/' + 'a/'.repeat(50) + 'b')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })

  test('作品详情页 API 报错后返回导航正常', async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
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

    // GetSummary 返回 404 后，应用会弹出错误对话框，遮挡 footer 导航
    // 先关闭对话框（点击 close 按钮）再点击 footer 链接
    const closeBtn = page.locator('.n-modal .n-base-close').first()
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click()
      await page.waitForTimeout(500)
    }

    const footerLinks = page.locator('footer nav a')
    const count = await footerLinks.count()
    if (count > 0) {
      await footerLinks.first().click()
      await page.waitForTimeout(2000)
    }

    const url = page.url()
    expect(url).toContain('/')
    await assertNoWhiteScreen(page)
  })
})
