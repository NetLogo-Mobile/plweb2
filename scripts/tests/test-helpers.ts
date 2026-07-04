import { type Page, expect } from '@playwright/test'

export const TEST_USER_ID = '6666ff550b5f97d6e49d12d7'
export const TEST_EXPERIMENT_ID = '66a84559744ed757b46f8917'
export const TEST_CATEGORY = 'Discussion'

/**
 * 模拟指定 API 返回错误
 * 用于测试前端对后端错误的处理
 */
export async function mockApiError(page: Page, urlPattern: string, status: number, message: string, data?: unknown) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Status: status, Message: message, Data: data ?? null }),
    })
  })
}

/**
 * 模拟指定 API 网络断开/超时
 */
export async function mockApiAbort(page: Page, urlPattern: string, errorCode?: string) {
  await page.route(urlPattern, async (route) => {
    await route.abort(errorCode as any ?? 'connectionfailed')
  })
}

export async function injectLoginState(page: Page) {
  await injectLoginStateWithoutNavigation(page)
  await page.goto('/')
}

export async function injectLoginStateWithoutNavigation(page: Page) {
  await page.addInitScript(() => {
    const authInfo = {
      value: {
        token: 'pKexl3M9jB1iWX2tyCPh6udYmEOFUnRz',
        authCode: 'RaQwt53Jnr9CSuUTH1kjsxqB40cV2fFD',
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

export async function waitForPageReady(page: Page, options?: { timeout?: number }) {
  const timeout = options?.timeout || 30000
  await page.waitForFunction(
    () => {
      const app = document.getElementById('app')
      return app && app.children.length > 0
    },
    { timeout },
  )
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {})
}

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

export async function assertNoVueErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })
  return errors
}

export async function navigateTo(page: Page, hashPath: string) {
  await page.goto(`/#${hashPath}`)
  await waitForPageReady(page)
}
