/**
 * Playwright 测试辅助工具
 * 
 * 提供 API 拦截、登录状态注入、通用断言等工具函数
 */

import { type Page, type Route, expect } from '@playwright/test'
import { getMockResponse, getAllApiPaths, TEST_USER_ID, TEST_EXPERIMENT_ID, TEST_CATEGORY } from './api-mocks'

// Re-export constants for convenience
export { TEST_USER_ID, TEST_EXPERIMENT_ID, TEST_CATEGORY }

/**
 * 拦截所有已知 API 请求并返回 mock 数据
 * 确保测试覆盖所有可能触发的 API 调用
 */
export async function interceptAllAPIs(page: Page) {
  const apiPaths = getAllApiPaths()

  // 只拦截真正的 API 请求（/api/Users/*, /api/Contents/*, /api/Messages/*）
  await page.route('**/api/(Users|Contents|Messages)/**', async (route: Route) => {
    const url = new URL(route.request().url())
    // 从 /api/Contents/GetSummary 提取 /Contents/GetSummary
    const apiPath = url.pathname.replace(/^\/api/, '')
    const body = route.request().postDataJSON?.() || undefined
    const response = getMockResponse(apiPath, body)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })

  // 拦截静态资源代理
  await page.route('**/static/**', async (route: Route) => {
    // 返回空图片或占位符
    if (route.request().url().includes('.png')) {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        ),
      })
    } else {
      await route.fulfill({ status: 200, body: '' })
    }
  })

  return apiPaths
}

/**
 * 注入登录状态到 localStorage
 * 模拟已登录用户，跳过登录流程
 * 注意：此函数会导航到首页以注入 localStorage
 */
export async function injectLoginState(page: Page) {
  // 先导航到页面以获取 localStorage 上下文
  await page.goto('/')

  await page.evaluate(() => {
    const authInfo = {
      value: {
        token: 'mock-token-12345',
        authCode: 'mock-auth-code-12345',
        userId: '6666ff550b5f97d6e49d12d7',
      },
      time: Date.now(),
      maxAgeMs: 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('userAuthInfo', JSON.stringify(authInfo))

    const userInfo = {
      value: {
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
      time: Date.now(),
      maxAgeMs: 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    const userConfig = {
      value: { language: 'zh', languageManuallySelected: true },
      time: Date.now(),
      maxAgeMs: 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('userConfig', JSON.stringify(userConfig))

    const cookieConsent = {
      value: true,
      time: Date.now(),
      maxAgeMs: 365 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('cookieConsent', JSON.stringify(cookieConsent))
  })
}

/**
 * 仅注入登录状态到 localStorage（不导航）
 * 用于需要在设置路由拦截器后再导航的场景
 */
export async function injectLoginStateWithoutNavigation(page: Page) {
  // 使用 addInitScript 在页面加载前注入 localStorage
  await page.addInitScript(() => {
    const authInfo = {
      value: {
        token: 'mock-token-12345',
        authCode: 'mock-auth-code-12345',
        userId: '6666ff550b5f97d6e49d12d7',
      },
      time: Date.now(),
      maxAgeMs: 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('userAuthInfo', JSON.stringify(authInfo))

    const userInfo = {
      value: {
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
      time: Date.now(),
      maxAgeMs: 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    const userConfig = {
      value: { language: 'zh', languageManuallySelected: true },
      time: Date.now(),
      maxAgeMs: 30 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('userConfig', JSON.stringify(userConfig))

    const cookieConsent = {
      value: true,
      time: Date.now(),
      maxAgeMs: 365 * 24 * 60 * 60 * 1000,
    }
    localStorage.setItem('cookieConsent', JSON.stringify(cookieConsent))
  })
}

/**
 * 等待页面加载完成（所有 API 请求已响应）
 */
export async function waitForPageReady(page: Page, options?: { timeout?: number }) {
  const timeout = options?.timeout || 30000
  // 等待 Vue 应用挂载 - #app 存在且有子内容
  await page.waitForFunction(() => {
    const app = document.getElementById('app')
    return app && app.children.length > 0
  }, { timeout })
  // 等待网络空闲
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {
    // networkidle 可能超时，不阻塞测试
  })
}

/**
 * 断言页面无白屏（#app 内有实际内容）
 */
export async function assertNoWhiteScreen(page: Page) {
  const appContent = await page.evaluate(() => {
    const app = document.getElementById('app')
    if (!app) return { hasApp: false, childCount: 0, textLength: 0 }
    return {
      hasApp: true,
      childCount: app.children.length,
      textLength: app.textContent?.trim().length || 0,
    }
  })
  expect(appContent.hasApp, '页面应存在 #app 元素').toBeTruthy()
  expect(appContent.childCount, '#app 应有子元素（非白屏）').toBeGreaterThan(0)
}

/**
 * 断言无未捕获的 Vue 错误
 */
export async function assertNoVueErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })
  return errors
}

/**
 * 导航到指定 hash 路由页面
 */
export async function navigateTo(page: Page, hashPath: string) {
  await page.goto(`/#${hashPath}`)
  await waitForPageReady(page)
}

/**
 * 获取页面中所有触发的 API 请求路径
 * 用于验证 API 覆盖率
 */
export async function trackApiRequests(page: Page): Promise<string[]> {
  const requests: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('/api/')) {
      const apiPath = new URL(url).pathname.replace(/^\/api/, '')
      requests.push(apiPath)
    }
  })
  return requests
}
