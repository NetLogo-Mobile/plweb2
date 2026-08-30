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
    await expect(page).toHaveURL(/#\/d\/matter\/66d100000000000000000001\?demo=1$/)
    await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '社区质询与建言' })).toBeVisible()
    await expect(page.getByText('卷宗引用的条例版本是否在事件发生时已生效？')).toBeVisible()
  })

  test('在当前事务和历史事务之间切换', async ({ page }) => {
    await expect(page.getByRole('button', { name: /当前事务 4/ })).toBeVisible()
    await page.getByRole('button', { name: /历史事务 3/ }).click()

    await expect(page.getByRole('heading', { name: '历史事务' })).toBeVisible()
    await expect(page.getByText('历史事务：社区公开记录保留规则')).toBeVisible()
    await expect(page.getByText('历史事务：志愿调查团回避办法试行记录')).toBeVisible()
    await expect(page.getByRole('link', { name: '参与质询' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: '查看详情' })).toHaveCount(3)
    await page.getByRole('link', { name: '查看详情' }).first().click()
    await expect(page.getByText('历史记录只读')).toBeVisible()
    await expect(page.getByRole('button', { name: '提交建言' })).toHaveCount(0)
  })

  test('提案详情整合质询建言和投票阶段', async ({ page }) => {
    await page.getByText('公共事务 2', { exact: true }).click()
    await page.getByRole('link', { name: '提案：卷宗公开后设置 72 小时质询期' }).first().click()
    await expect(page.getByText('1. 质询建言阶段', { exact: true })).toBeVisible()
    await expect(page.getByText('2. 投票阶段', { exact: true })).toBeVisible()
    await page.getByText('2. 投票阶段', { exact: true }).click()
    await expect(page.getByText('卷宗质询期决议')).toBeVisible()

    await page.goto('/#/d?demo=1')
    await page.getByText('精选决议 1', { exact: true }).click()
    await page.getByRole('link', { name: '已决议：条例修订必须保留旧版本' }).first().click()
    await page.getByText('2. 投票阶段', { exact: true }).click()
    await expect(page.getByText('条例版本保留决议结果')).toBeVisible()
    await expect(page.getByRole('button', { name: /通过修订/ })).toBeDisabled()
  })

  test('匿名投票可刷新保留并重置', async ({ page }) => {
    await page.getByText('公共事务 2', { exact: true }).click()
    await page.getByRole('link', { name: '提案：卷宗公开后设置 72 小时质询期' }).first().click()
    await page.getByText('2. 投票阶段', { exact: true }).click()
    const choice = page.getByRole('button', { name: /同意 72 小时/ })

    await expect(choice).toBeEnabled()
    await choice.click()
    await expect(choice).toBeDisabled()

    await page.reload()
    await waitForPageReady(page)
    await page.getByText('2. 投票阶段', { exact: true }).click()
    await expect(page.getByRole('button', { name: /同意 72 小时/ })).toBeDisabled()

    await page.goto('/#/d?demo=1')
    await page.getByRole('button', { name: '重置投票' }).click()
    await page.getByText('公共事务 2', { exact: true }).click()
    await page.getByRole('link', { name: '提案：卷宗公开后设置 72 小时质询期' }).first().click()
    await page.getByText('2. 投票阶段', { exact: true }).click()
    await expect(page.getByRole('button', { name: /同意 72 小时/ })).toBeEnabled()
  })
})

test.describe('民主墙离线创建事务', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto('/#/d?demo=1')
    await waitForPageReady(page)
  })

  test('普通用户匿名提议并进入独立板块', async ({ page }) => {
    await page.getByRole('link', { name: '匿名提议' }).click()
    await expect(page.getByRole('heading', { name: '提交匿名提议' })).toBeVisible()

    await page.getByLabel('标题').fill('建议增加社区条例修订预告期')
    await page
      .getByLabel('事实与建议')
      .fill('建议条例修订在投票前公开七天，让普通用户有时间阅读并提出修改意见。')
    await page.getByRole('button', { name: '提交到民主墙' }).click()

    await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
    await expect(page.getByText('建议增加社区条例修订预告期')).toBeVisible()
    await expect(page.getByText('匿名提议者')).toBeVisible()

    await page.goto('/#/d?demo=1')
    await page.getByText('匿名提议 1', { exact: true }).click()
    await expect(page.getByText('建议增加社区条例修订预告期')).toBeVisible()
    await expect(page.getByText('TestUser')).toHaveCount(0)
  })

  test('具备权限的用户可以发起正式事务', async ({ page }) => {
    await page.getByRole('link', { name: '发起事务' }).click()
    await expect(page.getByRole('heading', { name: '发起社区事务' })).toBeVisible()
    await page.getByText('管理监察', { exact: true }).click()
    await page.getByLabel('标题').fill('调查团成员回避申明核查')
    await page
      .getByLabel('事实与建议')
      .fill('请核查本次调查团成员已公开的关系申明，并在质询期内补充遗漏信息。')
    await page.getByRole('button', { name: '提交到民主墙' }).click()

    await expect(page.getByText('调查团成员回避申明核查')).toBeVisible()
    await expect(page.getByText('认证编辑·演示用户')).toBeVisible()

    await page.goto('/#/d?demo=1')
    await page.getByText('管理监察 2', { exact: true }).click()
    await expect(page.getByRole('link', { name: '调查团成员回避申明核查' }).last()).toBeVisible()
  })
})
