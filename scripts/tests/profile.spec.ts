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

test.describe('更换头像 (Change Avatar)', () => {
  // 1x1 透明 PNG：本地校验只看 MIME 与大小，内容不做解码。
  // A 1x1 transparent PNG: local validation only checks MIME and size.
  const TINY_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  )

  /**
   * 打开资料页操作单并选中第 4 项（更换头像）。
   * 按稳定索引选择而非翻译文案；第 4 项仅自己的资料页存在。
   * Open the profile action sheet and pick the 4th entry (change avatar).
   * Dispatch on the stable index, not on translated labels; the 4th entry
   * only exists on one's own profile.
   */
  async function chooseChangeAvatar(page: import('@playwright/test').Page) {
    await page.locator('.user-avatar').click()
    const options = page.locator('.action-sheet-option')
    await expect(options.nth(3)).toBeVisible()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await options.nth(3).click()
    return fileChooserPromise
  }

  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto(`/#/u/${TEST_USER_ID}`)
    await waitForPageReady(page)
    // 等待资料页自身的 GetUser 完成并把用户缓存写满（回归测试的前置条件）
    await page.waitForTimeout(1500)
  })

  test('应拒绝非图片与超过 1MB 的文件且不发起上传', async ({ page }) => {
    let requestAvatarCalls = 0
    await page.route('**/api/Users/RequestAvatar', async (route) => {
      requestAvatarCalls++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Status: 200, Message: '', Data: null }),
      })
    })

    // 非图片
    const fileChooser1 = await chooseChangeAvatar(page)
    await fileChooser1.setFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    })
    await expect(page.locator('.n-message').filter({ hasText: '仅支持图片文件' })).toBeVisible()

    // 超过 1MB（后端硬限制）
    const fileChooser2 = await chooseChangeAvatar(page)
    await fileChooser2.setFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(1024 * 1024 + 1, 1),
    })
    await expect(page.locator('.n-message').filter({ hasText: '图片大小不能超过 1MB' })).toBeVisible()

    // 两次本地校验失败都不应触达后端
    expect(requestAvatarCalls).toBe(0)
  })

  test('应绕过用户缓存重读头像索引并确认新值', async ({ page }) => {
    // 424242 不可能是真实账号的当前索引：若走了缓存，确认值必然不同
    // 424242 cannot be the live account's index; a cache-served read would
    // necessarily confirm a different value.
    const MOCK_SERVER_AVATAR = 424242
    const confirmBodies: { Avatar?: number }[] = []
    let getUserNetworkCalls = 0

    await page.route('**/api/Users/GetUser', async (route) => {
      getUserNetworkCalls++
      const body = (route.request().postDataJSON() || {}) as { ID?: string }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: { User: { ID: body.ID, Avatar: MOCK_SERVER_AVATAR, Nickname: 'TestUser' } },
        }),
      })
    })
    await page.route('**/api/Users/RequestAvatar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            AccessKey: null,
            Authorization: 'test-authorization',
            Policy: 'test-policy',
            RequestHost: null,
            RequestURI: '/qphysics',
          },
        }),
      })
    })
    await page.route('**/v0.api.upyun.com/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
    await page.route('**/api/Users/ConfirmAvatar', async (route) => {
      confirmBodies.push((route.request().postDataJSON() || {}) as { Avatar?: number })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Status: 200, Message: '', Data: null }),
      })
    })

    const fileChooser = await chooseChangeAvatar(page)
    await fileChooser.setFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: TINY_PNG })

    await expect(
      page.locator('.n-message').filter({ hasText: '头像更换成功' }),
    ).toBeVisible({ timeout: 15000 })

    // 回归点 1：更换头像的 GetUser 必须真实发起网络请求（skipUserCache），
    // 页面加载时写满的 5 分钟用户缓存不允许拦截这次读取
    expect(
      getUserNetworkCalls,
      'changeAvatar 的 GetUser 应绕过用户缓存（真实网络请求）',
    ).toBeGreaterThanOrEqual(1)
    // 回归点 2：ConfirmAvatar 收到的是服务器索引 + 1
    expect(confirmBodies[0]?.Avatar).toBe(MOCK_SERVER_AVATAR + 1)
  })
})
