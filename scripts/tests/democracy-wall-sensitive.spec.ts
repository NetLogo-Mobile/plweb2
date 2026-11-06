import { test, expect } from './fixtures'
import { injectLoginStateWithoutNavigation } from './test-helpers'

const id = '66d100000000000000000001'
const developerUrl = `/#/d/matter/${id}?demo=1&admin=1&developer=1`
test('正式追溯请求明确不通知当事人', async ({ page }) => {
  await injectLoginStateWithoutNavigation(page)
  await page.route('**/api/Democracy/GetContext', (route) => route.fulfill({ json: {
    Status: 200, Data: { ApiVersion: 1, Profile: null, Permissions: { CanDeveloperManage: true } },
  } }))
  let payload: unknown
  await page.route('**/api/Democracy/TracePublisher', (route) => {
    payload = route.request().postDataJSON()
    return route.fulfill({ json: { Status: 200, Data: { UserID: 'private-account', Alias: '测试化名', Banned: false, CanPublish: true, PublishingRevoked: false } } })
  })
  await page.goto('/#/d?demo=1')
  await expect(page.getByRole('heading', { name: '民主墙', exact: true })).toBeVisible()
  await page.evaluate(async (matterId) => {
    history.replaceState(null, '', '/#/d')
    const path = '/src/services/democracyWall.ts'
    const { traceDemocracyPublisher } = await import(path)
    await traceDemocracyPublisher(matterId, '正式追溯静默通知验证')
  }, id)
  expect(payload).toMatchObject({ MatterID: id, Notify: false, Reason: '正式追溯静默通知验证' })
})
test.beforeEach(async ({ page }) => {
  await injectLoginStateWithoutNavigation(page)
})

test('普通管理员无管理入口且服务层拒绝敏感操作', async ({ page }) => {
  await page.goto(`/#/d/matter/${id}?demo=1&admin=1`)
  await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
  await expect(page.locator('.management-panel')).toHaveCount(0)
  await expect(page.getByText('质询人管理')).toHaveCount(0)
  const result = await page.evaluate(async (matterId) => {
    const path = '/src/services/democracyWall.ts'
    const service = await import(path)
    try {
      await service.traceDemocracyPublisher(matterId, '无开发权限的追溯测试')
      return 'allowed'
    } catch (error) {
      return (error as Error).message
    }
  }, id)
  expect(result).toBe('permission-denied')
})

test('直接封禁发布者自定义天数，负数被拒绝', async ({ page }) => {
  await page.goto(developerUrl)
  const panel = page.locator('.management-panel')
  await panel.getByPlaceholder(/填写追溯/).fill('测试直接按自定义天数封禁发布者')
  await panel.getByLabel('封禁天数').fill('-1')
  await expect(panel.getByRole('button', { name: '封禁实名账号' })).toBeDisabled()
  await panel.getByLabel('封禁天数').fill('123')
  await panel.getByRole('button', { name: '封禁实名账号' }).click()
  await expect(panel.getByText('已封禁', { exact: true })).toBeVisible()
  await expect(panel.locator('.account-controls__trace')).toHaveCount(0)
  const duration = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('plweb2.democracy.demoAdminState') || '{}')
    return (
      (new Date(state.bannedUntil['66d10000000000000000a001']).getTime() - Date.now()) / 86400000
    )
  })
  expect(duration).toBeGreaterThan(122.99)
  expect(duration).toBeLessThanOrEqual(123)
})

test('质询追溯默认私密，确认披露后访客可见', async ({ page }) => {
  await page.goto(developerUrl)
  const card = page.locator('.contribution-card').first()
  await card.getByText('质询人管理', { exact: true }).click()
  await card.getByPlaceholder(/填写追溯/).fill('经核实需要公开此次质询的账号归属')
  await card.getByRole('button', { name: '授权追溯质询人' }).click()
  await expect(card.locator('.account-controls__trace')).toContainText('66d10000000000000000a002')
  await expect(card.locator('.contribution-card__disclosure')).toHaveCount(0)
  await page.goto(`/#/d/matter/${id}?demo=1`)
  await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
  await expect(page.getByText('66d10000000000000000a002', { exact: true })).toHaveCount(0)
  await page.goto(developerUrl)
  await card.getByText('质询人管理', { exact: true }).click()
  await card.getByPlaceholder(/填写追溯/).fill('经核实需要公开此次质询的账号归属')
  await card.getByRole('button', { name: '授权追溯质询人' }).click()
  await card.getByRole('button', { name: '公开披露真实账号' }).click()
  await expect(page.getByText(/将向所有访客公开/)).toBeVisible()
  await page.locator('.n-popconfirm__action').getByRole('button').last().click()
  await expect(card.locator('.contribution-card__disclosure')).toContainText(
    '66d10000000000000000a002',
  )
  await page.goto(`/#/d/matter/${id}?demo=1`)
  await expect(page.locator('.contribution-card__disclosure')).toContainText(
    '66d10000000000000000a002',
  )
})

test('封禁质询人仅影响关联账号并到期恢复', async ({ page }) => {
  await page.goto(developerUrl)
  const card = page.locator('.contribution-card').first()
  await card.getByText('质询人管理', { exact: true }).click()
  await card.getByPlaceholder(/填写追溯/).fill('测试对质询人执行两天账号封禁')
  await card.getByLabel('封禁天数').fill('2')
  await card.getByRole('button', { name: '封禁质询人' }).click()
  await expect(card.getByText('已封禁', { exact: true })).toBeVisible()
  const result = await page.evaluate(async () => {
    const path = '/src/services/democracyWallDemo.ts'
    const demo = await import(path)
    const target = '66d10000000000000000a002'
    const before = demo.isDemocracyDemoAnonymousPostingRevoked(target)
    const publisher = demo.isDemocracyDemoAnonymousPostingRevoked('66d10000000000000000a001')
    const key = 'plweb2.democracy.demoAdminState'
    const state = JSON.parse(localStorage.getItem(key) || '{}')
    state.bannedUntil[target] = new Date(Date.now() - 1000).toISOString()
    localStorage.setItem(key, JSON.stringify(state))
    return { before, publisher, after: demo.isDemocracyDemoAnonymousPostingRevoked(target) }
  })
  expect(result).toEqual({ before: true, publisher: false, after: false })
})
