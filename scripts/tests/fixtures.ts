import { test as base, expect } from '@playwright/test'

const NOISE_KEYWORDS = [
  'favicon',
  'manifest',
  'service-worker',
  'sw.ts',
  '404',
  'CORS',
  'oss-cn-hongkong.aliyuncs.com',
  'ERR_ABORTED',
  'Login.Required',
  'Input.Field.Missing',
]

export const test = base.extend<{ autoCollectErrors: void }>({
  autoCollectErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      await use()
      const critical = errors.filter((e) => !NOISE_KEYWORDS.some((kw) => e.includes(kw)))
      expect(critical.length, critical.length > 0 ? `控制台错误: ${critical.join(' | ')}` : '').toBe(0)
    },
    { auto: true },
  ],
})

export { expect }
