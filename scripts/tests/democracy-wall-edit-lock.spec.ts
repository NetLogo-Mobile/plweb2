import { test, expect } from './fixtures'
import { injectLoginStateWithoutNavigation } from './test-helpers'

test.beforeEach(async ({ page }) => {
  await injectLoginStateWithoutNavigation(page)
  await page.goto('/#/d?demo=1&admin=1')
})

test('发布者投票前可重复编辑，跨过开始时间后服务层拒绝修改', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const path = '/src/services/democracyWall.ts'
    const service = await import(path)
    const plan = {
      StartAt: new Date(Date.now() + 60000).toISOString(),
      FinishAt: new Date(Date.now() + 3600000).toISOString(),
      Options: ['赞成', '反对'],
      Multiple: false,
    }
    const matter = await service.submitDemocracyMatter({
      subject: '编辑时间边界测试',
      description: '用于验证发起后到投票开始之间的编辑权限。',
      anonymous: false,
      kind: 'public',
      participation: 'Vote',
      votePlan: plan,
    })
    const input = {
      matterId: matter.ID,
      expectedRevision: String(matter.UpdateDate),
      subject: '投票开始前第一次修改',
      description: '这里是第一次修改后的完整事务正文。',
      participation: 'Vote',
      votePlan: plan,
    }
    await service.updateDemocracyMatter(input)
    await service.updateDemocracyMatter({ ...input, subject: '投票开始前第二次修改' })
    const clock = Date.now
    Date.now = () => new Date(plan.StartAt).getTime()
    let error = ''
    try {
      await service.updateDemocracyMatter({ ...input, subject: '投票后禁止保存内容' })
    } catch (e) {
      error = (e as Error).message
    } finally {
      Date.now = clock
    }
    return { error, subject: (await service.fetchDemocracyMatter(matter.ID)).summary.Subject }
  })
  expect(result).toEqual({ error: 'permission-denied', subject: '投票开始前第二次修改' })
})

test('编辑页面跨过投票开始时间自动禁用，开发权限可修改正文', async ({ page }) => {
  const id = await page.evaluate(async () => {
    const path = '/src/services/democracyWall.ts'
    const service = await import(path)
    const matter = await service.submitDemocracyMatter({
      subject: '编辑页自动锁定测试',
      description: '用于验证编辑页面跨越投票开始时间后自动锁定。',
      anonymous: false,
      kind: 'public',
      participation: 'Vote',
      votePlan: {
        StartAt: new Date(Date.now() + 10000).toISOString(),
        FinishAt: new Date(Date.now() + 3600000).toISOString(),
        Options: ['同意', '不同意'],
        Multiple: false,
      },
    })
    return matter.ID
  })
  await page.goto(`/#/d/new?edit=${id}&demo=1&admin=1`)
  const title = page.getByRole('textbox', { name: '标题', exact: true })
  await expect(title).toBeEnabled()
  await expect(title).toBeDisabled({ timeout: 15000 })
  await page.goto(`/#/d/new?edit=${id}&demo=1&admin=1&developer=1`)
  await expect(title).toBeEnabled()
  await title.fill('开发权限修订后的正文标题')
  await expect(page.locator('input[type="datetime-local"]').first()).toBeDisabled()
  await page.getByRole('button', { name: '发布', exact: true }).click()
  await expect(page.getByRole('heading', { name: '开发权限修订后的正文标题' })).toBeVisible()
})
