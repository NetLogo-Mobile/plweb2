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
]

export const test = base.extend<{ autoCollectErrors: void; suppressErrorCollection: boolean }>({
  // 可在每个 spec / test 中通过 test.use({ suppressErrorCollection: true }) 关闭
  // 用于错误处理类测试：它们本身就预期触发控制台错误
  suppressErrorCollection: [false, { option: true }],

  autoCollectErrors: [
    async ({ page, suppressErrorCollection }, use) => {
      if (suppressErrorCollection) {
        await use()
        return
      }
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
