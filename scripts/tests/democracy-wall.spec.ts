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
          ID: '6666ff550b5f97d6e49d12d7',
          Nickname: '调查员',
          Avatar: 0,
          AvatarRegion: 0,
          Signature: '',
          Decoration: 0,
          Verification: 'Editor',
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
        InternalLink: null,
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
    await injectLoginStateWithoutNavigation(page)
    await page.route('**/api/Contents/QueryExperiments', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(entriesResponse),
      })
    })
    await page.route('**/api/Users/Authenticate', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(activitiesResponse),
      })
    })
  })

  test('展示卷宗、身份标签和现有匿名投票', async ({ page }) => {
    await page.goto('/#/d')
    await waitForPageReady(page)

    await expect(page.getByRole('heading', { name: '民主墙' })).toBeVisible()
    await expect(page.getByText('关于公开指控处理流程的卷宗')).toBeVisible()
    await expect(page.getByText('Editor')).toBeVisible()

    await page.getByText('公共事务 1', { exact: true }).click()
    await expect(page.getByText('条例修订投票')).toBeVisible()
    await expect(page.getByRole('button', { name: /同意修订/ })).toBeVisible()
  })
})
