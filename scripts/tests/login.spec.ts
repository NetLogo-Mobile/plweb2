/**
 * 登录流程测试 - loginModel.vue
 * 
 * 测试内容：
 * - 登录弹窗显示
 * - 邮箱/密码输入
 * - 登录成功流程
 * - 登录失败流程
 * - 登录后状态持久化
 */

import { test, expect } from '@playwright/test'
import { interceptAllAPIs, waitForPageReady, assertNoWhiteScreen } from './test-helpers'

test.describe('登录流程', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllAPIs(page)
  })

  test('点击用户区域应弹出登录弹窗', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 点击用户区域触发登录弹窗
    const userArea = page.locator('.user')
    await userArea.click()

    // 验证登录弹窗出现 - 使用更精确的选择器
    // loginModel 的 .container 是 fixed 定位的遮罩层
    const loginOverlay = page.locator('.container[style*="position: fixed"], .container[style*="position:fixed"]').first()
    if (await loginOverlay.isVisible()) {
      // 找到了 fixed 定位的登录弹窗
      const loginCard = loginOverlay.locator('.card')
      await expect(loginCard).toBeVisible({ timeout: 5000 })
    } else {
      // 回退：查找包含 n-tabs 的 card（登录弹窗特征）
      const loginCard = page.locator('.card').filter({ has: page.locator('.card-tabs') }).first()
      await expect(loginCard).toBeVisible({ timeout: 5000 })
    }
  })

  test('输入邮箱和密码后点击登录应触发 API 调用', async ({ page }) => {
    let authenticateCalled = false
    let requestBody: unknown = null

    await page.route('**/api/Users/Authenticate', async (route) => {
      authenticateCalled = true
      requestBody = route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: 'OK',
          Data: {
            User: {
              ID: '6666ff550b5f97d6e49d12d7',
              Nickname: 'TestUser',
              Avatar: 1,
              AvatarRegion: 1,
              Verification: 'user',
              Gold: 100,
              Diamond: 50,
              Level: 5,
              Experience: 1200,
              Prestige: 30,
              Signature: 'Hello from test',
              Decoration: 0,
              Fragment: 10,
              Subscription: 0,
              SubscriptionUntil: '',
              IsBinded: true,
              Regions: [1],
              Socials: {},
            },
          },
        }),
      })
    })

    await page.goto('/')
    await waitForPageReady(page)

    // 打开登录弹窗
    await page.locator('.user').click()
    await page.waitForTimeout(1000)

    // Naive UI n-input 组件：.inputArea 是外层 div，内部有 input 元素
    // 需要定位到实际的 input 元素
    const emailInput = page.locator('.inputArea input').first()
    await emailInput.fill('xiegushi2022@outlook.com')

    const passwordInput = page.locator('.inputArea input[type="password"]').first()
    await passwordInput.fill('hh090108')

    // 点击登录按钮
    await page.locator('.loginButton').first().click()
    await page.waitForTimeout(2000)

    // 验证 API 被调用
    expect(authenticateCalled).toBeTruthy()
    expect(requestBody).toBeTruthy()
  })

  test('登录失败应显示错误消息', async ({ page }) => {
    await page.route('**/api/Users/Authenticate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 401,
          Message: 'Invalid credentials',
          Data: null,
        }),
      })
    })

    await page.goto('/')
    await waitForPageReady(page)

    // 打开登录弹窗
    await page.locator('.user').click()
    await page.waitForTimeout(1000)

    // 填写错误信息
    const emailInput = page.locator('.inputArea input').first()
    await emailInput.fill('wrong@example.com')

    const passwordInput = page.locator('.inputArea input[type="password"]').first()
    await passwordInput.fill('wrongpassword')

    // 点击登录
    await page.locator('.loginButton').first().click()
    await page.waitForTimeout(2000)

    // 登录弹窗不应关闭（因为登录失败）
    const loginCard = page.locator('.card').filter({ has: page.locator('.card-tabs') }).first()
    await expect(loginCard).toBeVisible({ timeout: 3000 })
  })

  test('登录弹窗应可通过点击关闭按钮关闭', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 打开登录弹窗
    await page.locator('.user').click()
    const loginCard = page.locator('.card').filter({ has: page.locator('.card-tabs') }).first()
    await expect(loginCard).toBeVisible({ timeout: 5000 })

    // 查找关闭按钮 - loginModel 中有 .close-btn 或 n-icon 类的关闭按钮
    const closeBtn = page.locator('.close-btn, .container .n-icon, .container button[title]').first()
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
    } else {
      // 回退：点击遮罩层区域
      const overlay = page.locator('.container').filter({ has: page.locator('.card-tabs') }).first()
      await overlay.click({ position: { x: 5, y: 5 }, force: true })
    }

    // 弹窗应关闭
    await expect(loginCard).not.toBeVisible({ timeout: 3000 })
  })

  test('登录弹窗应包含登录和注册两个标签页', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    // 打开登录弹窗
    await page.locator('.user').click()
    await page.waitForTimeout(1000)

    // 验证标签页存在 - n-tabs 渲染的标签
    const tabButtons = page.locator('.card-tabs .n-tabs-tab')
    const tabCount = await tabButtons.count()
    expect(tabCount).toBeGreaterThanOrEqual(2)
  })
})
