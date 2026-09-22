import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { injectLoginStateWithoutNavigation, waitForPageReady } from './test-helpers'

interface PermissionCase {
  alias?: string
  canPublish: boolean
  login: boolean
  name: string
  permissions: {
    CanContribute: boolean
    CanInitiate: boolean
    CanModerate: boolean
    CanSuggest: boolean
    CanTransition: boolean
  }
  verification?: string
}

const matterSummary = {
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
  Image: 0,
  ImageRegion: 0,
  Price: 0,
  Stars: 0,
  Editor: null,
  Visits: 0,
  ModelID: null,
  Remixes: 0,
  Subject: '权限兼容性测试事务',
  Version: 1,
  Category: 'Discussion',
  Comments: 0,
  Language: 'Chinese',
  Supports: 0,
  Coauthors: [],
  Popularity: 0,
  UpdateDate: 0,
  Visibility: 0,
  SortingDate: 0,
  CreationDate: 0,
  Multilingual: false,
  Description: ['用于验证不同账号权限下的详情页写入口。'],
}

const permissionCases: PermissionCase[] = [
  {
    canPublish: false,
    login: false,
    name: '游客',
    permissions: {
      CanContribute: false,
      CanInitiate: false,
      CanModerate: false,
      CanSuggest: false,
      CanTransition: false,
    },
  },
  {
    alias: '普通用户化名',
    canPublish: true,
    login: true,
    name: '普通用户',
    permissions: {
      CanContribute: true,
      CanInitiate: false,
      CanModerate: false,
      CanSuggest: false,
      CanTransition: false,
    },
    verification: 'user',
  },
  {
    alias: '资深用户化名',
    canPublish: true,
    login: true,
    name: 'Oldtimer',
    permissions: {
      CanContribute: true,
      CanInitiate: false,
      CanModerate: false,
      CanSuggest: true,
      CanTransition: false,
    },
    verification: 'Oldtimer',
  },
  {
    alias: '编辑化名',
    canPublish: true,
    login: true,
    name: '认证编辑',
    permissions: {
      CanContribute: true,
      CanInitiate: true,
      CanModerate: false,
      CanSuggest: false,
      CanTransition: false,
    },
    verification: 'Editor',
  },
  {
    alias: '管理化名',
    canPublish: true,
    login: true,
    name: '管理员',
    permissions: {
      CanContribute: true,
      CanInitiate: true,
      CanModerate: true,
      CanSuggest: true,
      CanTransition: true,
    },
    verification: 'Administrator',
  },
  {
    alias: '受限账号',
    canPublish: false,
    login: true,
    name: '被禁发管理员',
    permissions: {
      CanContribute: true,
      CanInitiate: true,
      CanModerate: true,
      CanSuggest: true,
      CanTransition: true,
    },
    verification: 'Administrator',
  },
]

async function mockPermissionApis(page: Page, account: PermissionCase) {
  await page.route('**/api/Democracy/GetContext', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        Status: 200,
        Message: '',
        Data: {
          ApiVersion: 1,
          Permissions: account.permissions,
          Profile: account.login
            ? { Alias: account.alias, CanPublish: account.canPublish, ModifiedAt: '' }
            : null,
        },
      }),
    }),
  )
  await page.route('**/api/Democracy/QueryMatters', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ Status: 200, Message: '', Data: { Entries: [] } }),
    }),
  )
  await page.route('**/api/Democracy/GetMatter', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        Status: 200,
        Message: '',
        Data: {
          CanEdit: account.login,
          Kind: 'Public',
          Mode: 'Formal',
          Participation: 'Consultation',
          Revision: '1',
          Stage: 'Questions',
          Summary: matterSummary,
        },
      }),
    }),
  )
  await page.route('**/api/Democracy/QueryContributions', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ Status: 200, Message: '', Data: { Entries: [] } }),
    }),
  )
  await page.route('**/api/Democracy/QueryAudit', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ Status: 200, Message: '', Data: { Entries: [] } }),
    }),
  )
  await page.route('**/api/Democracy/QueryInvestigationTeam', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ Status: 200, Message: '', Data: { Entries: [] } }),
    }),
  )
  await page.route('**/api/Users/Authenticate', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        Status: 200,
        Message: '',
        Data: { Activities: [], Statistic: { Activities: [], ID: 'permission-statistic' } },
      }),
    }),
  )
}

async function injectGuestPreferences(page: Page) {
  await page.addInitScript(() => {
    const now = Date.now()
    localStorage.setItem(
      'userConfig',
      JSON.stringify({
        value: { language: 'zh', languageManuallySelected: true },
        time: now,
        maxAgeMs: 30 * 24 * 60 * 60 * 1000,
      }),
    )
    localStorage.setItem(
      'cookieConsent',
      JSON.stringify({ value: true, time: now, maxAgeMs: 365 * 24 * 60 * 60 * 1000 }),
    )
  })
}

function expectedWriteCount(account: PermissionCase, permission = true) {
  return account.login && account.canPublish && permission ? 1 : 0
}

async function prepareAccount(page: Page, account: PermissionCase) {
  if (account.login) {
    await injectLoginStateWithoutNavigation(page, { verification: account.verification })
    return
  }
  await injectGuestPreferences(page)
}

async function assertWallPermissions(page: Page, account: PermissionCase) {
  await expect(page.getByRole('link', { name: '匿名提议' })).toHaveCount(
    expectedWriteCount(account, account.permissions.CanSuggest),
  )
  await expect(page.getByRole('link', { name: '发起事务' })).toHaveCount(
    expectedWriteCount(account, account.permissions.CanInitiate),
  )
}

async function assertDetailPermissions(page: Page, account: PermissionCase) {
  await expect(page.locator('.comment-composer')).toHaveCount(
    expectedWriteCount(account, account.permissions.CanContribute),
  )
  await expect(page.getByRole('button', { name: '举报事务' })).toHaveCount(
    expectedWriteCount(account),
  )
  await expect(page.getByRole('button', { name: '修改事务' })).toHaveCount(
    expectedWriteCount(account),
  )
  await expect(page.getByRole('heading', { name: '事务管理与审计' })).toHaveCount(
    expectedWriteCount(account, false),
  )
}

for (const account of permissionCases) {
  test(`${account.name}的民主墙写入口与服务端权限一致`, async ({ page }) => {
    await prepareAccount(page, account)
    await mockPermissionApis(page, account)
    await page.goto('/#/d')
    await waitForPageReady(page)
    await assertWallPermissions(page, account)

    await page.goto('/#/d/matter/66a84559744ed757b46f8917')
    await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
    await assertDetailPermissions(page, account)
  })
}
