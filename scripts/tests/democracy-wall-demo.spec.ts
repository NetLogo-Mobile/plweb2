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
    await expect(page.getByText('Editor')).toHaveCount(0)

    await page.getByText('关于公开指控处理流程的调查卷宗').click()
    await expect(page).toHaveURL(/#\/d\/matter\/66d100000000000000000001\?demo=1$/)
    await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '建议收集与质询' })).toBeVisible()
    await expect(page.getByText('卷宗引用的条例版本是否在事件发生时已生效？')).toBeVisible()
    await expect(page.getByText('星轨记录员', { exact: true })).toBeVisible()
    await expect(page.getByText('认证编辑', { exact: true })).toBeVisible()
    await expect(page.getByText('潮汐观察员', { exact: true })).toBeVisible()
    await expect(page.getByText('Oldtimer', { exact: true })).toBeVisible()

    const contribution = '建议补充调查团回避记录的公开日期。'
    await page.getByPlaceholder(/提出建议、事实质询/).fill(contribution)
    await page.locator('.comment-composer__send').click()
    await expect(page.getByText(contribution, { exact: true })).toBeVisible()
    await page.reload()
    await waitForPageReady(page)
    await expect(page.getByText(contribution, { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: '事务管理与审计' })).toHaveCount(0)
  })

  test('在当前事务和历史事务之间切换', async ({ page }) => {
    await expect(page.getByRole('button', { name: /当前事务 3/ })).toBeVisible()
    await page.getByRole('button', { name: /历史事务 4/ }).click()

    await expect(page.getByRole('heading', { name: '历史事务' })).toBeVisible()
    await expect(page.getByText('公共事务 1', { exact: true })).toBeVisible()
    await expect(page.getByText('管理监察 2', { exact: true })).toBeVisible()
    await expect(page.getByText('提议回复 1', { exact: true })).toBeVisible()
    await expect(page.getByText('已决议：条例修订必须保留旧版本')).toBeVisible()

    await page.getByText('管理监察 2', { exact: true }).click()
    await expect(page.getByText('历史事务：志愿调查团回避办法试行记录')).toBeVisible()

    await page.getByText('提议回复 1', { exact: true }).click()
    await expect(page.getByText('提议回复：公开调查团成员替补流程')).toBeVisible()
    await expect(page.getByRole('link', { name: '参与质询' })).toHaveCount(0)
    await page.getByRole('link', { name: '提议回复：公开调查团成员替补流程' }).click()
    await expect(page.getByText('历史记录只读')).toBeVisible()
    await expect(page.getByRole('button', { name: '提交建言' })).toHaveCount(0)
  })

  test('普通用户与管理视角严格隔离', async ({ page }) => {
    await expect(page.getByRole('link', { name: '发起事务' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '进入管理视角' })).toBeVisible()
    await page.getByRole('button', { name: '进入管理视角' }).click()
    await expect(page).toHaveURL(/admin=1/)
    await expect(page.getByRole('link', { name: '发起事务' })).toBeVisible()
    await page.getByText('关于公开指控处理流程的调查卷宗').click()
    await expect(page.getByRole('heading', { name: '事务管理与审计' })).toHaveCount(0)
  })

  test('提案详情整合建议收集、质询和投票阶段', async ({ page }) => {
    await page.getByText('公共事务 2', { exact: true }).click()
    await page.getByRole('link', { name: '提案：卷宗公开后设置 72 小时质询期' }).first().click()
    await expect(page.getByText('1. 建议收集与质询', { exact: true })).toBeVisible()
    await expect(page.getByText('2. 投票阶段', { exact: true })).toBeVisible()
    await page.getByText('2. 投票阶段', { exact: true }).click()
    await expect(page.getByRole('button', { name: /同意 72 小时/ })).toBeVisible()

    await page.goto('/#/d?demo=1&scope=history')
    await page.getByRole('button', { name: /历史事务 4/ }).click()
    await page.getByRole('link', { name: '已决议：条例修订必须保留旧版本' }).first().click()
    await page.getByText('2. 投票阶段', { exact: true }).click()
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

  test('开发权限可审计举报且没有事务阶段操作', async ({ page }) => {
    await page.goto('/#/d/matter/66d100000000000000000001?demo=1&admin=1&developer=1')
    await page.getByRole('button', { name: '举报事务' }).click()
    await page
      .getByPlaceholder(/说明具体内容、位置和可能造成的影响/)
      .fill('该卷宗可能包含需要进一步核对的个人隐私信息。')
    await page.getByRole('button', { name: '提交举报' }).click()
    await expect(page.getByText('举报已提交')).toBeVisible()
    await page
      .locator('.management-panel__audit-heading')
      .getByRole('button', { name: '刷新' })
      .click()
    await expect(page.getByText('Report', { exact: true })).toBeVisible()
    await expect(page.getByText('事务阶段', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '确认阶段变更' })).toHaveCount(0)
  })

  test('有处理权限时可警告并封禁认证管理员账号', async ({ page }) => {
    await page.goto('/#/d/matter/66d100000000000000000004?demo=1&admin=1&developer=1&scope=history')
    await expect(page.getByText('管理员·归档员')).toBeVisible()
    await page
      .locator('.management-panel').getByPlaceholder(/填写追溯/)
      .fill('该认证管理员账号发布的内容需要执行正式账号处置')
    await page.getByRole('button', { name: '授权追溯发布者' }).click()
    await page.getByRole('button', { name: '警告实名账号' }).click()
    await expect(page.getByText('WarnAccount')).toBeVisible()
    await page.getByRole('button', { name: '封禁实名账号' }).click()
    await expect(page.getByText('已封禁', { exact: true })).toBeVisible()
    await expect(page.getByText('BanAccount')).toBeVisible()
    await expect(page.getByRole('button', { name: '解除账号封禁' })).toBeVisible()
    await expect(page.getByRole('button', { name: '撤销发布权' })).toBeVisible()

    await page.getByRole('button', { name: '解除账号封禁' }).click()
    await expect(page.getByText('正常', { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: '撤销发布权' }).click()
    await expect(page.getByRole('button', { name: '恢复发布权' })).toBeVisible()
    await page.getByRole('button', { name: '封禁实名账号' }).click()
    await page.getByRole('button', { name: '解除账号封禁' }).click()
    await expect(page.getByRole('button', { name: '恢复发布权' })).toBeVisible()
    await expect(page.getByText('已撤销', { exact: true })).toBeVisible()
  })

  test('管理监察可邀请调查团成员并保留审计记录', async ({ page }) => {
    await page.goto('/#/d/matter/66d100000000000000000005?demo=1&admin=1&developer=1&scope=history')
    await page
      .locator('.management-panel').getByPlaceholder(/填写追溯/)
      .fill('邀请该用户加入调查团协助核对公开记录和处理流程')
    await page
      .getByPlaceholder('输入 24 位用户 ID 或资料页链接')
      .fill('https://dl.turtlesim.com/plc/?chinese-user-5ea1934c8116c49429d3e405?')
    await page.getByRole('button', { name: '发送邀请' }).click()

    await expect(page.getByText('受邀用户·e405', { exact: true })).toBeVisible()
    await expect(page.getByText('等待接受')).toBeVisible()
    await expect(page.getByText('InviteInvestigator')).toBeVisible()
    await page.reload()
    await expect(page.getByText('受邀用户·e405', { exact: true })).toBeVisible()
  })

  test('删除事务后公开下架并返回列表', async ({ page }) => {
    await page.goto('/#/d/matter/66d100000000000000000001?demo=1&admin=1&developer=1')
    await page
      .locator('.management-panel').getByPlaceholder(/填写追溯/)
      .fill('该事务包含违规内容，需要从民主墙公开区域下架')
    await page.getByRole('button', { name: '删除事务' }).click()
    await page.getByRole('button', { name: '确认删除' }).click()
    await expect(page).toHaveURL(/#\/d\?.*developer=1/)
    await expect(page.getByText('关于公开指控处理流程的调查卷宗')).toHaveCount(0)
  })
})

test.describe('民主墙离线创建事务', () => {
  test.beforeEach(async ({ page }) => {
    await injectLoginStateWithoutNavigation(page)
    await page.goto('/#/d?demo=1')
    await waitForPageReady(page)
  })

  test('演示用户匿名提议并进入独立板块', async ({ page }) => {
    await page.getByRole('link', { name: '匿名提议' }).click()
    await expect(page.getByRole('heading', { name: '提交匿名提议' })).toBeVisible()
    await expect(page.getByText('公共事务', { exact: true })).toHaveCount(0)
    await expect(page.getByText('管理监察', { exact: true })).toHaveCount(0)
    await expect(page.getByText(/匿名提议仅可进行意见征集/)).toBeVisible()
    await expect(page.getByPlaceholder('选项 1')).toHaveCount(0)
    await page.getByLabel('匿名化名').fill('蓝鲸记录员')

    await page
      .getByRole('textbox', { name: '标题', exact: true })
      .fill('建议增加社区条例修订预告期')
    await page
      .locator('.democracy-editor .cm-content')
      .fill('建议条例修订在投票前公开七天，让普通用户有时间阅读并提出修改意见。')
    await page.getByRole('button', { name: '发布' }).click()

    await expect(page.getByRole('heading', { name: '事务详情' })).toBeVisible()
    await expect(page.getByText('建议增加社区条例修订预告期')).toBeVisible()
    await expect(page.getByText('蓝鲸记录员')).toBeVisible()
    await expect(page.getByText('2. 投票阶段', { exact: true })).toHaveCount(0)
    await expect(page.getByText('66d10000000000000000a001')).toHaveCount(0)

    await page.goto(`${page.url()}&admin=1&developer=1`)
    await page
      .locator('.management-panel').getByPlaceholder(/填写追溯/)
      .fill('意见征集已经完成，可以整理意见并形成最终决议')
    await expect(page.locator('.management-panel__group .n-base-selection')).toHaveCount(0)
    await expect(page.getByRole('button', { name: '确认阶段变更' })).toHaveCount(0)

    await page.goto('/#/d?demo=1')
    await page.getByText('匿名提议 1', { exact: true }).click()
    await expect(page.getByText('建议增加社区条例修订预告期')).toBeVisible()
    await expect(page.getByText('TestUser')).toHaveCount(0)
  })

  test('正式投票事务到点自动开放投票', async ({ page }) => {
    await page.goto('/#/d?demo=1&admin=1&developer=1')
    await page.getByRole('link', { name: '发起事务' }).click()
    await page.getByLabel('匿名化名').fill('定时议事员')
    await page.getByText('投票', { exact: true }).click()
    await page.getByRole('textbox', { name: '标题', exact: true }).fill('定时开放的正式投票事务')
    await page
      .locator('.democracy-editor .cm-content')
      .fill('该正式事务用于验证意见征集与投票分流，并在预定时间自动开放社区投票。')
    await page.getByPlaceholder('选项 1').fill('通过')
    await page.getByPlaceholder('选项 2').fill('退回修改')

    const schedule = await page.evaluate(() => {
      const format = (date: Date) => {
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        return local.toISOString().slice(0, 19)
      }
      return {
        start: format(new Date(Date.now() + 3_000)),
        finish: format(new Date(Date.now() + 12_000)),
      }
    })
    const dateInputs = page.locator('input[type="datetime-local"]')
    await dateInputs.nth(0).fill(schedule.start)
    await dateInputs.nth(1).fill(schedule.finish)
    await page.getByRole('button', { name: '发布' }).click()

    await expect(page.getByText('定时开放的正式投票事务')).toBeVisible()
    await expect(page.getByText('2. 投票阶段', { exact: true })).toBeVisible({ timeout: 8_000 })
    const voteChoice = page.getByRole('button', { name: /通过/ })
    await expect(voteChoice).toBeVisible()
    await expect(voteChoice).toBeEnabled()

    const waitUntilFinished = Math.max(0, new Date(schedule.finish).getTime() - Date.now() + 800)
    await page.waitForTimeout(waitUntilFinished)
    await expect(voteChoice).toBeDisabled()
    await expect(voteChoice).toContainText('%')
    await expect(page.getByText('投票已结束', { exact: true })).toBeVisible()
    await expect(page.getByText('自动判定通过', { exact: true })).toHaveCount(0)
  })

  test('匿名化名唯一、可修改，管理人员可追溯并撤销资格', async ({ page }) => {
    await page.getByRole('link', { name: '匿名提议' }).click()
    await page.getByLabel('匿名化名').fill('社区观察鲸')
    await page.getByRole('textbox', { name: '标题', exact: true }).fill('第一份匿名社区建议')
    await page
      .locator('.democracy-editor .cm-content')
      .fill('这是用于验证匿名化名、后台追溯以及管理禁发能力的测试内容。')
    await page.getByRole('button', { name: '发布' }).click()

    await expect(page.getByText('社区观察鲸')).toBeVisible()
    await expect(page.getByText('66d10000000000000000a001')).toHaveCount(0)
    await page.goto(`${page.url()}&admin=1&developer=1`)
    await page
      .locator('.management-panel').getByPlaceholder(/填写追溯/)
      .fill('核查该账号连续发布重复提议的情况')
    await page.getByRole('button', { name: '授权追溯发布者' }).click()
    await expect(page.getByText('66d10000000000000000a001')).toBeVisible()
    await page.getByRole('button', { name: '撤销发布权' }).click()
    await expect(page.getByRole('button', { name: '恢复发布权' })).toBeVisible()
    await expect(page.getByText('RevokePublisher')).toBeVisible()

    await page.goto('/#/d/new?demo=1&mode=anonymous')
    await expect(page.getByText(/匿名发布权已被撤销/)).toBeVisible()
    await expect(page.getByRole('button', { name: '发布' })).toBeDisabled()

    await page.goto('/#/d/new?demo=1&mode=formal')
    await expect(page.getByRole('heading', { name: '发起社区事务' })).toBeVisible()
    await expect(page.getByText(/匿名发布权已被撤销/)).toBeVisible()
    await expect(page.getByRole('button', { name: '发布' })).toBeDisabled()

    await page.evaluate(() => {
      const profiles = JSON.parse(
        localStorage.getItem('plweb2.democracy.demoAnonymousProfiles') || '{}',
      )
      profiles['66d10000000000000000a001'].revoked = false
      profiles['another-demo-user'] = {
        alias: '已被占用的名字',
        revoked: false,
        userId: 'another-demo-user',
      }
      localStorage.setItem('plweb2.democracy.demoAnonymousProfiles', JSON.stringify(profiles))
    })
    await page.goto('/#/d/new?demo=1&mode=anonymous')
    await page.getByLabel('匿名化名').fill('已被占用的名字')
    await page.getByRole('textbox', { name: '标题', exact: true }).fill('重复化名测试事务')
    await page
      .locator('.democracy-editor .cm-content')
      .fill('这条内容用于验证另一个账号已经占用的匿名化名无法再次注册。')
    await page.getByRole('button', { name: '发布' }).click()
    await expect(page).toHaveURL(/#\/d\/new\?demo=1&mode=anonymous$/)

    await page.getByLabel('匿名化名').fill('改名后的观察鲸')
    await page.getByRole('button', { name: '发布' }).click()
    await expect(page.getByText('改名后的观察鲸')).toBeVisible()

    await page.goto('/#/d?demo=1')
    await page.getByText('匿名提议 2', { exact: true }).click()
    await expect(page.getByText('改名后的观察鲸')).toHaveCount(2)
    await expect(page.getByText('社区观察鲸')).toHaveCount(0)
  })

  test('具备权限的用户可以发起正式事务', async ({ page }) => {
    await page.goto('/#/d?demo=1&admin=1&developer=1')
    await page.getByRole('link', { name: '发起事务' }).click()
    await expect(page.getByRole('heading', { name: '发起社区事务' })).toBeVisible()
    await page.getByLabel('匿名化名').fill('事务记录员')
    await page.getByText('管理监察', { exact: true }).click()
    await page.getByRole('textbox', { name: '标题', exact: true }).fill('调查团成员回避申明核查')
    await page
      .locator('.democracy-editor .cm-content')
      .fill('请核查本次调查团成员已公开的关系申明，并在质询期内补充遗漏信息。')
    await page.getByRole('button', { name: '发布' }).click()

    await expect(page.getByText('调查团成员回避申明核查')).toBeVisible()
    await expect(page.getByText('事务记录员')).toBeVisible()
    await expect(page.getByText('66d10000000000000000a001')).toHaveCount(0)
    await expect(page.getByText('认证编辑·演示用户')).toHaveCount(0)

    await page.goto('/#/d?demo=1')
    await page.getByText('管理监察 2', { exact: true }).click()
    await expect(page.getByRole('link', { name: '调查团成员回避申明核查' }).last()).toBeVisible()
  })
})
