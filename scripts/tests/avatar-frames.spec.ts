import { test, expect } from '@playwright/test'
test('演示身份独立于已缓存的封禁账号', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('userInfo')) {
      localStorage.setItem('userInfo', JSON.stringify({
        value: { ID: 'cached-banned-user', Verification: 'Banned', Avatar: 0 },
        time: Date.now(),
      }))
    }
  })
  await page.goto('/#/avatar-frames?frameDemo=1')
  const cards = page.locator('.frames__card')
  await cards.first().getByRole('button').click()
  await expect(page.locator('.frames__preview .user-avatar--orbit')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.frames__preview .user-avatar--orbit')).toHaveCount(1)
  await page.locator('.frames__demo').click()
  await expect(page.locator('.frames__preview .user-avatar__frame')).toHaveCount(0)
  await expect(cards).toHaveCount(3)
  await expect(cards.first().getByRole('button')).toBeDisabled()
  const cachedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('userInfo')!).value)
  expect(cachedUser).toEqual({ ID: 'cached-banned-user', Verification: 'Banned', Avatar: 0 })
})

test('通知和好友组件响应框变更及封禁，系统通知不戴框', async ({ page }) => {
  await page.route('**/api/Users/GetUser', (route) =>
    route.fulfill({ json: { Status: 200, Data: { Relation: 3 }, Message: '' } }),
  )
  await page.goto('/#/avatar-frames?frameDemo=1')
  const states = await page.evaluate(async () => {
    const vuePath = '/node_modules/.vite/deps/vue.js'
    const friendPath = '/src/components/friends/item.vue'
    const notificationPath = '/src/components/messages/NotificationItem.vue'
    const { createApp, h, reactive, nextTick } = await import(vuePath)
    const friend = (await import(friendPath)).default
    const notification = (await import(notificationPath)).default
    const user = reactive({
      ID: '66d100000000000000000001',
      Avatar: 0,
      Nickname: '测试用户',
      Signature: '',
      Verification: 'User',
      AvatarFrameID: 'orbit',
    })
    const message = reactive({
      Users: [user.ID],
      UserAvatar: 0,
      AvatarUser: user,
      msg_type: 2,
      msg_title: '',
      msg: '',
      Fields: {},
    })
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      render: () => h('div', [h(friend, { user }), h(notification, { notification: message })]),
    })
    app.config.globalProperties.$t = (key: string) => key
    app.directive('richText', {})
    app.mount(host)
    await nextTick()
    const normal = host.querySelectorAll('.user-avatar--orbit').length
    user.AvatarFrameID = 'laurel'
    await nextTick()
    const changed = host.querySelectorAll('.user-avatar--laurel').length
    user.Verification = 'Banned'
    await nextTick()
    const banned = host.querySelectorAll('.user-avatar__frame').length
    user.Verification = 'User'
    message.msg_type = 1
    await nextTick()
    const system = host.querySelector('.notification_container .user-avatar__frame') !== null
    message.msg_type = 2
    message.Users = ['different-user']
    await nextTick()
    const mismatch = host.querySelector('.notification_container .user-avatar__frame') !== null
    app.unmount()
    host.remove()
    return { normal, changed, banned, system, mismatch }
  })
  expect(states).toEqual({ normal: 2, changed: 2, banned: 0, system: false, mismatch: false })
})
test('佩戴持久化，封禁清除展示但保留背包，解封重新佩戴', async ({ page }) => {
  await page.goto('/#/avatar-frames?frameDemo=1')
  const cards = page.locator('.frames__card')
  await expect(cards).toHaveCount(3)
  await cards.first().getByRole('button').click()
  await expect(page.locator('.frames__preview .user-avatar--orbit')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.frames__preview .user-avatar--orbit')).toHaveCount(1)
  await page.locator('.frames__demo').click()
  await expect(page.locator('.frames__preview .user-avatar__frame')).toHaveCount(0)
  await expect(cards).toHaveCount(3)
  await expect(cards.first().getByRole('button')).toBeDisabled()
  await page.reload()
  await expect(cards.first().getByRole('button')).toBeDisabled()
  await page.locator('.frames__demo').click()
  await expect(page.locator('.frames__preview .user-avatar__frame')).toHaveCount(0)
  await cards.nth(1).getByRole('button').click()
  await expect(page.locator('.frames__preview .user-avatar--laurel')).toHaveCount(1)
  await page.locator('.frames__preview button').click()
  await expect(page.locator('.frames__preview .user-avatar__frame')).toHaveCount(0)
})
test('主站封禁标记覆盖头像框，禁止伪造拥有权', async ({ page }) => {
  await page.goto('/#/avatar-frames?frameDemo=1')
  const result = await page.evaluate(async () => {
    const path = '/src/services/avatarFrames.ts'
    const service = await import(path)
    const blocked = service.visibleFrame({
      ID: 'somebody',
      Verification: 'Banned',
      AvatarFrameID: 'orbit',
    })
    let denied = false
    try {
      await service.equipFrame('unowned')
    } catch {
      denied = true
    }
    return { blocked, denied }
  })
  expect(result).toEqual({ blocked: null, denied: true })
})
