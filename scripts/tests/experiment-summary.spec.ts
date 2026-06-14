/**
 * 作品详情页测试 - ExperimentSummary.vue
 * 
 * 测试内容：
 * - 作品详情页加载
 * - 作品信息展示（标题、标签、描述）
 * - 评论标签页
 * - 导航返回
 * - API 覆盖（/Contents/GetSummary, /Messages/GetComments）
 * 
 * 测试路径: /p/Discussion/66a84559744ed757b46f8917
 */

import { test, expect } from '@playwright/test'
import {
  interceptAllAPIs,
  injectLoginState,
  waitForPageReady,
  assertNoWhiteScreen,
  TEST_EXPERIMENT_ID,
  TEST_CATEGORY,
} from './test-helpers'

test.describe('作品详情页 (ExperimentSummary)', () => {
  test.beforeEach(async ({ page }) => {
    await interceptAllAPIs(page)
  })

  test('应正常加载作品详情页', async ({ page }) => {
    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)

    await assertNoWhiteScreen(page)

    // 验证页面非白屏且加载了内容
    const cover = page.locator('.cover')
    await expect(cover).toBeVisible({ timeout: 10000 })
  })

  test('应显示作品标题', async ({ page }) => {
    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)

    // 验证标题区域存在 - 使用更精确的选择器避免匹配多个 .title
    const title = page.locator('.cover .title').first()
    await expect(title).toBeVisible({ timeout: 10000 })
  })

  test('应显示标签', async ({ page }) => {
    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(2000)

    // 验证标签容器存在
    const tagContainer = page.locator('.tagContainer')
    await expect(tagContainer).toBeVisible({ timeout: 10000 })
  })

  test('已登录用户应能看到评论区', async ({ page }) => {
    await injectLoginState(page)
    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(2000)

    // 验证评论标签页或评论区域
    const context = page.locator('.context')
    await expect(context).toBeVisible({ timeout: 10000 })
  })

  test('点击返回按钮应导航回上一页', async ({ page }) => {
    // 先导航到首页
    await page.goto('/')
    await waitForPageReady(page)

    // 再导航到详情页
    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)

    // 点击返回
    const returnBtn = page.locator('.return').first()
    if (await returnBtn.isVisible()) {
      await returnBtn.click()
      await page.waitForTimeout(1000)
      // 应该回到首页
      const url = page.url()
      expect(url).not.toContain(`/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    }
  })

  test('详情页加载时应触发 GetSummary API', async ({ page }) => {
    let getSummaryCalled = false

    await page.route('**/api/Contents/GetSummary', async (route) => {
      getSummaryCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: 'OK',
          Data: {
            Summary: {
              ID: TEST_EXPERIMENT_ID,
              Subject: 'Test Discussion Topic',
              Category: TEST_CATEGORY,
              Tags: ['physics', 'test'],
              Image: 1,
              UserID: 'test-user-001',
              Nickname: 'TestUser',
              Avatar: 1,
              Date: new Date().toISOString(),
              Stars: 10,
              Comments: 5,
              Derivatives: 2,
              IsStarred: false,
            },
            Description: 'Test description',
            Content: '# Test Content',
          },
        }),
      })
    })

    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)
    await page.waitForTimeout(3000)

    expect(getSummaryCalled).toBeTruthy()
  })

  test('详情页应正确处理 API 错误', async ({ page }) => {
    await page.route('**/api/Contents/GetSummary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 404,
          Message: 'Not Found',
          Data: null,
        }),
      })
    })

    await page.goto(`/#/p/${TEST_CATEGORY}/${TEST_EXPERIMENT_ID}`)
    await waitForPageReady(page)

    // 页面不应白屏，应有错误提示或 NotFound
    await assertNoWhiteScreen(page)
  })
})
