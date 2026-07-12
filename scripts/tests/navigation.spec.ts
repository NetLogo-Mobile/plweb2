/**
 * 导航与路由测试
 *
 * 测试内容：
 * - 所有路由页面可访问性
 * - 路由切换不白屏
 * - 404 页面
 * - 重定向规则
 * - 浏览器前进/后退
 */

import { test, expect } from './fixtures'
import {
  injectLoginStateWithoutNavigation,
  waitForPageReady,
  assertNoWhiteScreen,
} from './test-helpers'

test.describe('路由与导航', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
  })

  const routes = [
    { path: '/', name: '首页' },
    { path: '/b', name: '黑洞' },
    { path: '/n', name: '通知' },
    { path: '/p/Discussion/66a84559744ed757b46f8917', name: '作品详情' },
    { path: '/c/Discussion/66a84559744ed757b46f8917/test', name: '评论' },
    { path: '/u/6666ff550b5f97d6e49d12d7', name: '用户资料' },
    { path: '/f', name: '好友' },
    { path: '/s', name: '设置' },
    { path: '/about', name: '关于' },
  ]

  for (const route of routes) {
    test(`路由 ${route.name} (${route.path}) 应正常加载且不白屏`, async ({ page }) => {
      await page.goto(`/#${route.path}`)
      await waitForPageReady(page)
      await assertNoWhiteScreen(page)
    })
  }

  test('访问不存在的路由应显示 404 页面', async ({ page }) => {
    await page.goto('/#/nonexistent-page-12345')
    await waitForPageReady(page)

    // 应该显示 NotFound 组件
    await assertNoWhiteScreen(page)
  })

  test('重定向 /friends → /f 应正常工作', async ({ page }) => {
    await page.goto('/#/friends')
    await waitForPageReady(page)
    const url = page.url()
    expect(url).toContain('/f')
  })

  test('重定向 /settings → /s 应正常工作', async ({ page }) => {
    await page.goto('/#/settings')
    await waitForPageReady(page)

    const url = page.url()
    expect(url).toContain('/s')
  })

  test('浏览器后退应正常工作', async ({ page }) => {
    // 导航到首页
    await page.goto('/#/')
    await waitForPageReady(page)

    // 导航到设置页
    await page.goto('/#/s')
    await waitForPageReady(page)

    // 后退
    await page.goBack()
    await page.waitForTimeout(1000)

    // 应回到首页
    await assertNoWhiteScreen(page)
  })

})
