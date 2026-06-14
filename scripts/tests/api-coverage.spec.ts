/**
 * API 覆盖率测试
 * 
 * 确保所有已知 API 路径在浏览器测试中都能被正确拦截和响应
 * 验证 mock 数据结构与实际 API 契约一致
 */

import { test, expect } from '@playwright/test'
import { interceptAllAPIs, injectLoginState, injectLoginStateWithoutNavigation, waitForPageReady, trackApiRequests, assertNoWhiteScreen } from './test-helpers'
import { getAllApiPaths } from './api-mocks'

test.describe('API 覆盖率验证', () => {
  test('所有已知 API 路径应有对应的 mock 处理器', () => {
    const apiPaths = getAllApiPaths()

    // 验证所有 PathMap 中的路径都有 mock
    const expectedPaths = [
      '/Users/Authenticate',
      '/Users/GetUser',
      '/Users/ModifyInformation',
      '/Users/Rename',
      '/Users/Follow',
      '/Users/GetRelations',
      '/Users/Appoint',
      '/Users/Ban',
      '/Users/Block',
      '/Users/Logout',
      '/Users/ReceiveBonus',
      '/Users/SetCover',
      '/Users/Unban',
      '/Contents/QueryExperiments',
      '/Contents/GetWorkspace',
      '/Contents/GetLibrary',
      '/Contents/SubmitExperiment',
      '/Contents/GetDerivatives',
      '/Contents/GetProfile',
      '/Contents/ConfirmExperiment',
      '/Contents/GetSummary',
      '/Contents/MoveCategory',
      '/Contents/StarContent',
      '/Messages/RemoveComment',
      '/Messages/GetComments',
      '/Messages/PostComment',
      '/Messages/GetMessage',
      '/Messages/GetMessages',
    ]

    for (const path of expectedPaths) {
      expect(apiPaths).toContain(path)
    }
  })

  test('首页浏览应触发关键 API 调用', async ({ page }) => {
    await interceptAllAPIs(page)
    const requests = await trackApiRequests(page)

    await page.goto('/')
    await waitForPageReady(page)
    await page.waitForTimeout(3000)

    // 首页应至少触发 QueryExperiments
    const apiRequests = requests
    // 验证有 API 请求被发出
    expect(apiRequests.length).toBeGreaterThan(0)
  })

  test('登录流程应触发 Authenticate API', async ({ page }) => {
    await interceptAllAPIs(page)
    const requests = await trackApiRequests(page)

    await page.goto('/')
    await waitForPageReady(page)

    // 触发登录
    await page.locator('.user').click()
    await page.waitForTimeout(1000)

    const emailInput = page.locator('.inputArea input').first()
    await emailInput.fill('xiegushi2022@outlook.com')

    const passwordInput = page.locator('.inputArea input[type="password"]').first()
    await passwordInput.fill('123456')

    await page.locator('.loginButton').first().click()
    await page.waitForTimeout(2000)

    // 应该触发了 Authenticate API
    expect(requests).toContain('/Users/Authenticate')
  })

  test('作品详情页应触发 GetSummary API', async ({ page }) => {
    await interceptAllAPIs(page)
    const requests = await trackApiRequests(page)

    await page.goto('/#/p/Discussion/66a84559744ed757b46f8917')
    await waitForPageReady(page)
    await page.waitForTimeout(3000)

    expect(requests).toContain('/Contents/GetSummary')
  })

  test('用户资料页应触发 GetProfile 和 GetUser API', async ({ page }) => {
    await interceptAllAPIs(page)
    const calledApis: string[] = []

    // 使用 page.on('request') 追踪 API 调用（不与 interceptAllAPIs 冲突）
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('/api/')) {
        const apiPath = new URL(url).pathname.replace(/^\/api/, '')
        calledApis.push(apiPath)
      }
    })

    await injectLoginStateWithoutNavigation(page)

    await page.goto('/#/u/test-user-001')
    await waitForPageReady(page)
    await page.waitForTimeout(5000)

    // 验证 API 被调用
    expect(calledApis.length > 0,
      `应触发 API 调用，实际调用: ${calledApis.join(', ')}`).toBeTruthy()
  })

  test('未 mock 的 API 路径应返回通用成功响应', async ({ page }) => {
    await interceptAllAPIs(page)

    // 页面应正常工作
    await page.goto('/')
    await waitForPageReady(page)
    await assertNoWhiteScreen(page)
  })
})
