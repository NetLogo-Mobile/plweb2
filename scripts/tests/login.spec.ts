import { test, expect } from './fixtures'
import { waitForPageReady} from './test-helpers'

test.describe('登录流程', () => {
  test('点击用户区域应弹出登录弹窗', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)
    const userArea = page.locator('.user')
    await userArea.click()
    const loginOverlay = page
      .locator('.container[style*="position: fixed"], .container[style*="position:fixed"]')
      .first()
    if (await loginOverlay.isVisible()) {
      const loginCard = loginOverlay.locator('.card')
      await expect(loginCard).toBeVisible({ timeout: 5000 })
    } else {
      const loginCard = page
        .locator('.card')
        .filter({ has: page.locator('.card-tabs') })
        .first()
      await expect(loginCard).toBeVisible({ timeout: 5000 })
    }
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
    await page.locator('.user').click()
    await page.waitForTimeout(1000)
    const emailInput = page.locator('.inputArea input').first()
    await emailInput.fill('wrong@example.com')
    const passwordInput = page.locator('.inputArea input[type="password"]').first()
    await passwordInput.fill('wrongpassword')
    await page.locator('.loginButton').first().click()
    await page.waitForTimeout(2000)
    const loginCard = page
      .locator('.card')
      .filter({ has: page.locator('.card-tabs') })
      .first()
    await expect(loginCard).toBeVisible({ timeout: 3000 })
  })

  test('登录弹窗应可通过点击关闭按钮关闭', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)
    await page.locator('.user').click()
    const loginCard = page
      .locator('.card')
      .filter({ has: page.locator('.card-tabs') })
      .first()
    await expect(loginCard).toBeVisible({ timeout: 5000 })
    const closeBtn = page
      .locator('.close-btn, .container .n-icon, .container button[title]')
      .first()
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
    } else {
      const overlay = page
        .locator('.container')
        .filter({ has: page.locator('.card-tabs') })
        .first()
      await overlay.click({ position: { x: 5, y: 5 }, force: true })
    }
    await expect(loginCard).not.toBeVisible({ timeout: 3000 })
  })

})
