import { test, expect } from './fixtures'
import { injectLoginStateWithoutNavigation, waitForPageReady } from './test-helpers'

test.describe('民主墙离线演示', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto('/#/d?demo=1')
    await waitForPageReady(page)
  })

  test('浏览卷宗并打开本地详情', async ({ page }) => {
    await expect(page.getByText('离线演示', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('关于公开指控处理流程的调查卷宗')).toBeVisible()
    await expect(page.getByText('Editor')).toBeVisible()

    await page.getByText('关于公开指控处理流程的调查卷宗').click()
    await expect(page).toHaveURL(/#\/d\/demo\/66d100000000000000000001\?demo=1$/)
    await expect(page.getByRole('heading', { name: '公开卷宗' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '已确认事实' })).toBeVisible()
    await expect(page.getByText('卷宗引用的条例版本是否在事件发生时已生效？')).toBeVisible()
  })

  test('匿名投票可刷新保留并重置', async ({ page }) => {
    await page.getByText('公共事务 4', { exact: true }).click()
    const choice = page.getByRole('button', { name: /同意 72 小时/ })

    await expect(choice).toBeEnabled()
    await choice.click()
    await expect(choice).toBeDisabled()

    await page.reload()
    await waitForPageReady(page)
    await page.getByText('公共事务 4', { exact: true }).click()
    await expect(page.getByRole('button', { name: /同意 72 小时/ })).toBeDisabled()

    await page.getByRole('button', { name: '重置投票' }).click()
    await expect(page.getByRole('button', { name: /同意 72 小时/ })).toBeEnabled()
  })
})
