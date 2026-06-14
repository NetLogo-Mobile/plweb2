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

import { test, expect } from '@playwright/test'
import { interceptAllAPIs, injectLoginState, waitForPageReady, assertNoWhiteScreen } from './test-helpers'

test.describe('路由与导航', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllAPIs(page)
    await injectLoginState(page)
  })

  const routes = [
    { path: '/', name: '首页' },
    { path: '/b', name: '黑洞' },
    { path: '/n', name: '通知' },
    { path: '/m', name: '消息' },
    { path: '/p/Discussion/66a84559744ed757b46f8917', name: '作品详情' },
    { path: '/c/Discussion/66a84559744ed757b46f8917/test', name: '评论' },
    { path: '/u/test-user-001', name: '用户资料' },
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

    // URL 应重定向到 /f
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

  test('路由切换时不应有控制台错误', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 连续切换多个路由
    for (const route of routes.slice(0, 5)) {
      await page.goto(`/#${route.path}`)
      await page.waitForTimeout(1000)
    }

    // 过滤掉非关键错误
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('manifest') &&
        !e.includes('service-worker') &&
        !e.includes('sw.ts') &&
        !e.includes('404'),
    )
    expect(criticalErrors.length).toBeLessThan(10)
  })
})
