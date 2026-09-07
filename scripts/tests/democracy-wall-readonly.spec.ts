import { test, expect } from './fixtures'
import { injectLoginStateWithoutNavigation } from './test-helpers'

test('只读部署阻止详情写入口和服务层管理调用', async ({ page }) => {
  test.skip(process.env.DEMOCRACY_READONLY_TEST !== '1', 'Requires a read-only Vite server')
  await injectLoginStateWithoutNavigation(page)
  const id = '66a84559744ed757b46f8917'
  let writes = 0
  await page.route('**/api/Democracy/**', (route) => {
    const path = new URL(route.request().url()).pathname.split('/').pop()
    if (!path?.startsWith('Get') && !path?.startsWith('Query')) writes++
    const data =
      path === 'GetContext'
        ? {
            ApiVersion: 1,
            Profile: { Alias: '只读测试', CanPublish: true },
            Permissions: {
              CanContribute: true,
              CanInitiate: true,
              CanSuggest: true,
              CanModerate: true,
              CanTransition: true,
            },
          }
        : path === 'GetMatter'
          ? {
              Kind: 'Oversight',
              Mode: 'Formal',
              Participation: 'Consultation',
              Stage: 'Questions',
              CanEdit: true,
              Revision: '1',
              Summary: {
                ID: id,
                Tags: [],
                Subject: '只读模式测试事务',
                Description: ['验证生产只读配置的交互限制'],
                User: { ID: '', Nickname: '公开化名' },
              },
            }
          : { Entries: [] }
    return route.fulfill({ json: { Status: 200, Data: data } })
  })
  await page.route('**/api/Users/Authenticate', (route) =>
    route.fulfill({
      json: {
        Status: 200,
        Data: { Activities: [], Statistic: { Activities: [] } },
      },
    }),
  )
  await page.goto(`/#/d/matter/${id}`)
  await expect(page.getByText('只读模式测试事务', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '事务管理与审计' })).toHaveCount(0)
  await expect(page.locator('.comment-composer')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '举报事务' })).toHaveCount(0)
  const errors = await page.evaluate(async (matterId) => {
    const path = '/src/services/democracyWall.ts'
    const service = await import(path)
    const results = await Promise.allSettled([
      service.deleteDemocracyMatter(matterId, '只读配置验证'),
      service.moderateDemocracyAccount(matterId, 'Ban', '只读配置验证'),
      service.submitDemocracyContribution(matterId, '只读配置验证'),
    ])
    return results.map((result) =>
      result.status === 'rejected' ? result.reason.message : 'allowed',
    )
  }, id)
  expect(errors).toEqual(['feature-read-only', 'feature-read-only', 'feature-read-only'])
  expect(writes).toBe(0)
})
