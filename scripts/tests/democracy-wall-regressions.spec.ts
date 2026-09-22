import { test, expect } from './fixtures'
import { injectLoginStateWithoutNavigation } from './test-helpers'

const matterId = '66a84559744ed757b46f8917'
const activityId = '7777ff550b5f97d6e49d12d7'

async function prepare(page: import('@playwright/test').Page, stage = 'Voting') {
  await injectLoginStateWithoutNavigation(page, { verification: 'Oldtimer' })
  const activity = {
    ID: activityId,
    InterfaceModel: 'Vote-Single',
    InternalLink: '',
    TargetLink: {},
    TargetText: {},
    StartDate: new Date(Date.now() - 60_000).toISOString(),
    FinishDate: new Date(Date.now() + 3600_000).toISOString(),
    Items: [
      { Description: '方案甲', Counter: 10 },
      { Description: '方案乙', Counter: 0 },
    ],
  }
  const statistic = {
    ID: matterId,
    Activities: [{ ActivityID: activityId, Finished: false, Gains: [] }],
  }
  const matter = {
    Kind: 'Oversight',
    Mode: 'Formal',
    Participation: 'Vote',
    Stage: stage,
    CanEdit: false,
    Revision: '1',
    VoteActivity: activity,
    Summary: {
      ID: matterId,
      Tags: [],
      Subject: '回归测试事务',
      Description: ['测试事务的公开说明'],
      User: { ID: '', Nickname: '公开虚拟名' },
      Comments: 0,
      Visits: 0,
    },
  }
  await page.route('**/api/Democracy/**', async (route) => {
    const path = new URL(route.request().url()).pathname.split('/').pop()
    const data =
      path === 'GetMatter'
        ? matter
        : path === 'GetContext'
          ? {
              ApiVersion: 1,
              Profile: { Alias: '测试化名', CanPublish: true },
              Permissions: {
                CanContribute: true,
                CanInitiate: false,
                CanSuggest: true,
                CanModerate: false,
                CanTransition: false,
              },
            }
          : { Entries: [] }
    await route.fulfill({ json: { Status: 200, Data: data } })
  })
  await page.route('**/api/Users/Authenticate', (route) =>
    route.fulfill({
      json: { Status: 200, Data: { Activities: [activity], Statistic: statistic } },
    }),
  )
  return { activity, statistic, matter }
}

test('投票使用实际票数且采用提交后的最新快照', async ({ page }) => {
  const { activity, statistic } = await prepare(page)
  await page.route('**/api/Users/ReceiveBonus', (route) =>
    route.fulfill({
      json: {
        Status: 200,
        Data: {
          Activities: [
            { ...activity, Items: [activity.Items[0], { ...activity.Items[1], Counter: 10 }] },
          ],
          Statistic: {
            ...statistic,
            Activities: [{ ActivityID: activityId, Finished: false, Gains: [1] }],
          },
        },
      },
    }),
  )
  await page.goto(`/#/d/matter/${matterId}`)
  await expect(page.getByText('公开虚拟名', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /方案乙/ }).click()
  await expect(page.getByRole('button', { name: /方案甲/ })).toContainText('50%')
  await expect(page.getByRole('button', { name: /方案乙/ })).toContainText('50%')
  await expect(page.getByRole('button', { name: /方案乙/ })).toBeDisabled()
})

test('历史事务直达链接只读且10比0显示100比0', async ({ page }) => {
  const { statistic } = await prepare(page, 'Archived')
  await page.route('**/api/Users/Authenticate', (route) =>
    route.fulfill({
      json: {
        Status: 200,
        Data: { Statistic: { ...statistic, Activities: [] }, Activities: [] },
      },
    }),
  )
  await page.goto(`/#/d/matter/${matterId}`)
  await expect(page.locator('.comment-composer')).toHaveCount(0)
  await page.getByText('2. 投票阶段', { exact: true }).click()
  await expect(page.getByRole('button', { name: /方案甲/ })).toContainText('100%')
  await expect(page.getByRole('button', { name: /方案乙/ })).toContainText('0%')
  await expect(page.getByRole('button', { name: /方案甲/ })).toBeDisabled()
})

test('服务端阶段迁移延迟时限制轮询频率', async ({ page }) => {
  const { matter } = await prepare(page, 'Questions')
  let requests = 0
  await page.route('**/api/Democracy/GetMatter', (route) => {
    requests++
    return route.fulfill({
      json: {
        Status: 200,
        Data: {
          ...matter,
          VotePlan: {
            StartAt: new Date(Date.now() - 60_000).toISOString(),
            FinishAt: new Date(Date.now() + 3600_000).toISOString(),
            Options: ['甲', '乙'],
          },
        },
      },
    })
  })
  await page.goto(`/#/d/matter/${matterId}`)
  await expect(page.getByText('回归测试事务', { exact: true })).toBeVisible()
  await page.waitForTimeout(6500)
  expect(requests).toBeGreaterThanOrEqual(2)
  expect(requests).toBeLessThanOrEqual(3)
})

for (const decision of ['Accepted', 'Declined'] as const) {
  test(`通知定位邀请并${decision === 'Accepted' ? '接受' : '拒绝'}，刷新保留结果`, async ({
    page,
  }) => {
    await prepare(page, 'Questions')
    let status: string = 'Pending'
    let writes = 0
    await page.route('**/api/Democracy/GetInvestigationInvite', (route) =>
      route.fulfill({
        json: {
          Status: 200,
          Data: { ID: 'invite-1', Status: status, CreatedAt: new Date().toISOString() },
        },
      }),
    )
    await page.route('**/api/Democracy/RespondInvestigationInvite', (route) => {
      expect(route.request().postDataJSON()).toMatchObject({
        MatterID: matterId,
        InviteID: 'invite-1',
        Decision: decision,
      })
      writes++
      status = decision
      return route.fulfill({
        json: {
          Status: 200,
          Data: {
            ID: 'invite-1',
            Status: status,
            CreatedAt: new Date().toISOString(),
          },
        },
      })
    })
    await page.route('**/api/Messages/GetMessages', (route) =>
      route.fulfill({
        json: {
          Status: 200,
          Data: {
            Templates: [],
            Messages: [
              {
                ID: 'notice-1',
                CategoryID: 1,
                TemplateID: 'invitation',
                Users: [],
                UserNames: [],
                Fields: {
                  Content: '你收到一封调查团邀请',
                  DemocracyMatterID: matterId,
                  DemocracyEvent: 'InvestigationInvite',
                  DemocracyInviteID: 'invite-1',
                },
              },
            ],
          },
        },
      }),
    )
    await page.goto('/#/n')
    await page
      .locator('.notification_message')
      .filter({ hasText: '你收到一封调查团邀请' })
      .first()
      .click()
    await expect(page).toHaveURL(new RegExp(`/d/matter/${matterId}\\?invitation=invite-1$`))
    await page
      .getByRole('button', { name: decision === 'Accepted' ? '接受邀请' : '拒绝邀请' })
      .click()
    const label = decision === 'Accepted' ? '已加入' : '已拒绝'
    await expect(page.locator('.invitation').getByText(label, { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.locator('.invitation').getByText(label, { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '接受邀请' })).toHaveCount(0)
    expect(writes).toBe(1)
  })
}

test('超过一页的质询全部可见', async ({ page }) => {
  await prepare(page, 'Questions')
  const offsets: number[] = []
  await page.route('**/api/Democracy/QueryContributions', (route) => {
    const { Skip, Take } = route.request().postDataJSON()
    offsets.push(Skip)
    const entries = Array.from({ length: 51 }, (_, index) => ({
      ID: String(index),
      AuthorAlias: '测试化名',
      AuthorPosition: 'Oldtimer',
      CreatedAt: new Date().toISOString(),
      Content: `质询编号${index + 1}`,
    })).slice(Skip, Skip + Take)
    return route.fulfill({ json: { Status: 200, Data: { Entries: entries } } })
  })
  await page.goto(`/#/d/matter/${matterId}`)
  await expect(page.getByText('质询编号51', { exact: true })).toBeAttached()
  expect(offsets).toEqual([0, 50])
})
