import { test, expect } from './fixtures'
import { injectLoginStateWithoutNavigation, waitForPageReady } from './test-helpers'

const statistic = {
  ID: '6666ff550b5f97d6e49d12d7',
  Activities: [
    {
      ActivityID: '7777ff550b5f97d6e49d12d7',
      Avails: [0, 1],
      Counters: [0, 0],
      Expiration: '2026-09-30T00:00:00Z',
      Finished: false,
      Gains: [],
      LastModified: '2026-08-29T00:00:00Z',
    },
  ],
}

const entriesResponse = {
  Status: 200,
  Message: '',
  Data: {
    $values: [
      {
        $type: 'Summary',
        ID: '66a84559744ed757b46f8917',
        Tags: ['民主墙', '公开卷宗'],
        Type: 0,
        User: {
          ID: '',
          Nickname: '匿名调查员',
          Avatar: 0,
          AvatarRegion: 0,
          Signature: '',
          Decoration: 0,
          Verification: undefined,
        },
        Image: 1,
        ImageRegion: 1,
        Price: 0,
        Stars: 12,
        Editor: null,
        Visits: 88,
        ModelID: null,
        Remixes: 0,
        Subject: '关于公开指控处理流程的卷宗',
        Version: 1,
        Category: 'Discussion',
        Comments: 7,
        Language: 'Chinese',
        Supports: 0,
        Coauthors: [],
        Popularity: 0,
        UpdateDate: 0,
        Visibility: 0,
        SortingDate: 0,
        CreationDate: 0,
        Multilingual: false,
        Description: ['公开事实、规则依据和处理记录。'],
      },
    ],
  },
}

const activitiesResponse = {
  Status: 200,
  Message: '',
  Data: {
    Statistic: statistic,
    Activities: [
      {
        Contents: [{ Chinese: '对条例模糊部分进行社区决议。' }],
        FinishDate: '2026-09-30T00:00:00Z',
        ID: '7777ff550b5f97d6e49d12d7',
        InterfaceModel: 'Vote-Single',
        InternalLink: '/p/Discussion/66a84559744ed757b46f8917',
        IsAttendance: false,
        IsDaily: false,
        IsDevelopment: false,
        IsTutorial: false,
        Items: [
          {
            Bonuses: {},
            Condition: '',
            Counter: 20,
            Counters: {},
            Description: '同意修订',
            Local: false,
          },
          {
            Bonuses: {},
            Condition: '',
            Counter: 10,
            Counters: {},
            Description: '维持原文',
            Local: false,
          },
        ],
        Languages: [],
        Platforms: [],
        Priority: 1,
        StartDate: '2026-08-01T00:00:00Z',
        Subject: { Chinese: '条例修订投票' },
        TargetLink: {},
        TargetText: {},
        Version: 1,
      },
    ],
  },
}

test.describe('民主墙', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page, { verification: 'Oldtimer' })
    await page.route('**/api/Democracy/GetContext', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            ApiVersion: 1,
            Permissions: {
              CanContribute: true,
              CanInitiate: false,
              CanModerate: false,
              CanSuggest: true,
              CanTransition: false,
            },
            Profile: { Alias: 'Oldtimer测试化名', CanPublish: true, ModifiedAt: '' },
          },
        }),
      })
    })
    await page.route('**/api/Democracy/QueryMatters', async (route) => {
      const request = route.request().postDataJSON()
      const summaries = request?.Scope === 'History' ? [] : entriesResponse.Data.$values
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            Entries: [
              ...summaries.map((Summary) => ({
                Kind: 'Oversight',
                Mode: 'Formal',
                Participation: 'Vote',
                Stage: 'Questions',
                Summary,
              })),
              ...(request?.Scope === 'Current'
                ? [
                    {
                      Kind: 'Public',
                      Mode: 'Suggestion',
                      Participation: 'Consultation',
                      Stage: 'Rejected',
                      Summary: {
                        ...entriesResponse.Data.$values[0],
                        ID: '66a84559744ed757b46f8000',
                        Subject: '不应公开的已拒绝事项',
                      },
                    },
                  ]
                : []),
            ],
          },
        }),
      })
    })
    await page.route('**/api/Users/Authenticate', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(activitiesResponse),
      })
    })
    await page.route('**/api/Democracy/GetMatter', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            Kind: 'Oversight',
            Mode: 'Formal',
            Participation: 'Vote',
            Stage: 'Questions',
            Summary: entriesResponse.Data.$values[0],
            VoteActivity: {
              ...activitiesResponse.Data.Activities[0],
              InternalLink: '',
            },
          },
        }),
      })
    })
    await page.route('**/api/Democracy/QueryContributions', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            Entries: [
              {
                AuthorAlias: '晨星记录员',
                AuthorPosition: 'Oldtimer',
                Content: '请补充适用条例的生效日期。',
                CreatedAt: '2026-08-29T10:20:00+08:00',
                ID: '66a84559744ed757b46f8101',
              },
            ],
          },
        }),
      })
    })
  })

  test('展示卷宗、身份标签和现有匿名投票', async ({ page }) => {
    await page.goto('/#/d')
    await waitForPageReady(page)

    await expect(page.getByRole('heading', { name: '民主墙' })).toBeVisible()
    await expect(page.getByText('精选决议', { exact: true })).toHaveCount(0)
    await expect(page.getByText('关于公开指控处理流程的卷宗')).toBeVisible()
    await expect(page.getByText('不应公开的已拒绝事项')).toHaveCount(0)
    await expect(page.getByText('Editor')).toHaveCount(0)
    await expect(page.getByRole('link', { name: '查看详情' }).first()).toHaveAttribute(
      'href',
      '#/d/matter/66a84559744ed757b46f8917',
    )
    await expect(page.getByRole('link', { name: '参与质询' })).toHaveCount(0)

    await page.getByRole('link', { name: '查看详情' }).first().click()
    await expect(page.getByRole('heading', { name: '建议收集与质询' })).toBeVisible()
    await expect(page.getByText('晨星记录员', { exact: true })).toBeVisible()
    await expect(page.getByText('Oldtimer', { exact: true })).toBeVisible()
    await expect(page.getByText('请补充适用条例的生效日期。', { exact: true })).toBeVisible()
    await page.getByText('2. 投票阶段', { exact: true }).click()
    await expect(page.getByRole('button', { name: /同意修订/ })).toBeVisible()
  })

  test('Oldtimer 通过社区接口提交匿名提议', async ({ page }) => {
    let submission: Record<string, any> | undefined
    await page.route('**/api/Democracy/SubmitMatter', async (route) => {
      submission = route.request().postDataJSON()
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            Kind: 'Public',
            Mode: 'Suggestion',
            Participation: 'Consultation',
            Stage: 'PendingReview',
            Summary: {
              ...entriesResponse.Data.$values[0],
              Anonymous: true,
              ID: '66a84559744ed757b46f8999',
              Subject: submission?.Subject,
              Description: [submission?.Description],
              Tags: ['民主墙', '匿名提议', '公共议案', '待审核'],
              User: {
                ...entriesResponse.Data.$values[0].User,
                ID: '',
                Nickname: submission?.Alias,
                Verification: undefined,
              },
            },
          },
        }),
      })
    })
    await page.goto('/#/d')
    await waitForPageReady(page)

    await expect(page.getByRole('link', { name: '发起事务' })).toHaveCount(0)
    await page.getByRole('link', { name: '匿名提议' }).click()
    await expect(page.getByLabel('匿名化名')).toHaveValue('Oldtimer测试化名')
    await expect(page.getByText('公共事务', { exact: true })).toHaveCount(0)
    await expect(page.getByText('管理监察', { exact: true })).toHaveCount(0)
    await expect(page.getByText(/匿名提议仅可进行意见征集/)).toBeVisible()
    await expect(page.getByPlaceholder('选项 1')).toHaveCount(0)
    await page.getByRole('textbox', { name: '标题', exact: true }).fill('建议公开条例修订时间表')
    await page
      .locator('.democracy-editor .cm-content')
      .fill('建议在民主墙公开修订节点、负责人和预计投票时间，便于社区持续跟进。')
    await page.getByRole('button', { name: '发布' }).click()

    await expect.poll(() => submission?.Mode).toBe('Suggestion')
    expect(submission?.Alias).toBe('Oldtimer测试化名')
    expect(submission?.Kind).toBe('Public')
    expect(submission?.Participation).toBe('Consultation')
    expect(submission?.ClientRequestID).toEqual(expect.any(String))
    expect(JSON.stringify(submission)).not.toContain('6666ff550b5f97d6e49d12d7')
    await expect(page).toHaveURL(/#\/d\/matter\/66a84559744ed757b46f8999$/)
  })

  test('撤销名单中的 Oldtimer 无法匿名提议', async ({ page }) => {
    await page.unroute('**/api/Democracy/GetContext')
    await page.route('**/api/Democracy/GetContext', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: {
            ApiVersion: 1,
            Permissions: {
              CanContribute: false,
              CanInitiate: false,
              CanModerate: false,
              CanSuggest: true,
              CanTransition: false,
            },
            Profile: { Alias: '受限用户', CanPublish: false, ModifiedAt: '' },
          },
        }),
      })
    })
    await page.goto('/#/d/new?mode=anonymous')
    await expect(page.getByText(/被撤销资格的账号无法提交/)).toBeVisible()
    await expect(page.getByRole('button', { name: '发布' })).toBeDisabled()
  })

  test('权限接口失败后可以重试', async ({ page }) => {
    await page.unroute('**/api/Democracy/GetContext')
    let requests = 0
    await page.route('**/api/Democracy/GetContext', async (route) => {
      requests += 1
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(
          requests === 1
            ? { Status: 503, Message: 'temporarily unavailable', Data: null }
            : {
                Status: 200,
                Message: '',
                Data: {
                  ApiVersion: 1,
                  Permissions: {
                    CanContribute: true,
                    CanInitiate: false,
                    CanModerate: false,
                    CanSuggest: true,
                    CanTransition: false,
                  },
                  Profile: { Alias: '恢复后的化名', CanPublish: true, ModifiedAt: '' },
                },
              },
        ),
      })
    })

    await page.goto('/#/d/new?mode=anonymous')
    await expect(page.getByText('暂时无法确认发布权限，请稍后重试。')).toBeVisible()
    await page.getByRole('button', { name: '重试' }).click()
    await expect(page.getByLabel('匿名化名')).toHaveValue('恢复后的化名')
    await expect(page.getByRole('button', { name: '发布' })).toBeDisabled()
  })
})
