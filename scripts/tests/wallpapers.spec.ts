import { test, expect } from '@playwright/test'

test('商城展示缓存金币，关闭购买且试用不会扣款发货', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('userInfo', JSON.stringify({ value: { ID: '66d100000000000000000001', Gold: 2500, Nickname: '商城测试' } }))
  })
  const purchaseRequests: string[] = []
  page.on('request', request => { if (request.method() === 'POST') purchaseRequests.push(request.url()) })
  await page.goto('/#/shop')
  await expect(page.locator('.shop__account')).toContainText('2,500')
  await expect(page.locator('.shop__price')).toHaveCount(3)
  for (const button of await page.locator('.shop__product button:disabled').all()) await expect(button).toBeDisabled()
  await expect(page.locator('.shop__product button:disabled')).toHaveCount(3)
  await page.locator('.shop__preview').first().click()
  await expect(page.locator('.wallpaper-shell')).toHaveClass(/has-wallpaper/)
  await page.locator('.shop__tabs button').nth(1).click()
  await expect(page.locator('.shop__bag')).toBeVisible()
  await page.locator('.shop__bag button').click()
  await expect(page.locator('.wallpaper-shell')).not.toHaveClass(/has-wallpaper/)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('userInfo')!).value.Gold)).toBe(2500)
  expect(purchaseRequests).toEqual([])
})

test('正常首页和黑洞卡片中直接切换壁纸', async ({ page }) => {
  const blocks = [
    {
      Header: '壁纸回归测试作品',
      TargetLink: '{}',
      Summaries: [
        {
          ID: '66d100000000000000000001',
          Subject: '正常作品卡片',
          Image: -1,
          Category: 'Experiment',
          Tags: [],
          User: { Nickname: '测试作者' },
        },
      ],
    },
  ]
  await page.route('**/api/Users/Authenticate', (route) =>
    route.fulfill({ json: { Status: 200, Data: { Library: { Blocks: blocks } } } }),
  )
  await page.route('**/api/Contents/GetLibrary', (route) =>
    route.fulfill({ json: { Status: 200, Data: { Blocks: blocks } } }),
  )
  await page.goto('/#/')
  await page.locator('.cookie-notice button').click()
  await expect(page.locator('#home .card')).toBeVisible()
  await page.locator('.wallpaper-picker select').selectOption('tide')
  await expect(page.locator('.wallpaper-shell')).toHaveClass(/has-wallpaper/)
  await expect(page.locator('.header-container')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(page.locator('footer')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await page.locator('#home .user').click()
  await expect(page.locator('.login-surface')).toBeVisible()
  await expect(page.locator('.login-surface')).not.toHaveCSS('background-image', 'none')
  await page.locator('.login-surface input').first().fill('wallpaper-visual-check')
  await expect(page.locator('.login-surface input').first()).toHaveValue('wallpaper-visual-check')
  await page.locator('.container').filter({ has: page.locator('.login-surface') }).click({ position: { x: 5, y: 5 } })
  await expect(page.locator('.login-surface')).toHaveCount(0)
  await expect(page.locator('#home .block > .outer')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )
  await page.locator('footer a[href="#/b"]').click()
  await expect(page.locator('#blackhole .card')).toBeVisible()
  await expect(page.locator('.wallpaper-picker select')).toHaveValue('tide')
  await page.locator('.wallpaper-picker select').selectOption('grid')
  await page.locator('footer a[href="#/"]').click()
  await expect(page.locator('.wallpaper-picker select')).toHaveValue('grid')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.wallpaper-picker select').selectOption('')
  await expect(page.locator('.wallpaper-shell')).not.toHaveClass(/has-wallpaper/)
  await expect(page.locator('.header-container')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('footer')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.locator('#home .user').click()
  await expect(page.locator('.login-surface')).toHaveCSS('background-image', 'none')
})

test('壁纸可切换、刷新保留、跨页面生效并恢复默认', async ({ page }) => {
  await page.goto('/#/wallpapers')
  await expect(page.locator('input[type=file]')).toHaveCount(0)
  await page.locator('[data-wallpaper=tide]').click()
  await expect(page.locator('.wallpaper-shell')).toHaveClass(/has-wallpaper/)
  await page.reload()
  await expect(page.locator('[data-wallpaper=tide]')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.wallpapers__intro a').click()
  await expect(page.locator('.settings-wrapper')).toBeVisible()
  await expect(page.locator('.settings-wrapper')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(page.locator('.wallpaper-shell')).toHaveClass(/has-wallpaper/)
  await page.locator('a[href="#/wallpapers"]').click()
  await page.locator('[data-wallpaper=dawn]').click()
  await page.locator('[data-wallpaper=grid]').click()
  await expect(page.locator('[data-wallpaper=grid]')).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.wallpapers__card').first().click()
  await expect(page.locator('.wallpaper-shell')).not.toHaveClass(/has-wallpaper/)
  await page.reload()
  await expect(page.locator('.wallpapers__card').first()).toHaveAttribute('aria-pressed', 'true')
})

test('同浏览器标签页同步应用和恢复默认', async ({ page, context }) => {
  await page.goto('/#/wallpapers')
  const other = await context.newPage()
  await other.goto('/#/wallpapers')
  await page.locator('[data-wallpaper=grid]').click()
  await expect(other.locator('[data-wallpaper=grid]')).toHaveAttribute('aria-pressed', 'true')
  await other.locator('.wallpapers__card').first().click()
  await expect(page.locator('.wallpaper-shell')).not.toHaveClass(/has-wallpaper/)
  await other.close()
})

test('未知壁纸安全回退且支持键盘选择', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'siteWallpaper',
      JSON.stringify({ value: 'https://invalid.test/upload.jpg' }),
    ),
  )
  await page.goto('/#/wallpapers')
  await expect(page.locator('.wallpapers__card').first()).toHaveAttribute('aria-pressed', 'true')
  await page.locator('[data-wallpaper=dawn]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-wallpaper=dawn]')).toHaveAttribute('aria-pressed', 'true')
})

test('存储失败时保留原选择并显示提示', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'siteWallpaper') throw new DOMException('Storage full', 'QuotaExceededError')
      original.call(this, key, value)
    }
  })
  await page.goto('/#/wallpapers')
  await page.locator('[data-wallpaper=tide]').click()
  await expect(page.locator('.wallpapers__status')).not.toBeEmpty()
  await expect(page.locator('.wallpapers__card').first()).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.wallpaper-shell')).not.toHaveClass(/has-wallpaper/)
})
