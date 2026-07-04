# E2E 测试

使用 Playwright 进行端到端测试，**直连真实后端 API**。

## 文件说明

### 测试 Spec

| 文件 | 说明 |
|------|------|
| `home.spec.ts` | 首页渲染、匿名/登录态、项目列表、底部导航 |
| `login.spec.ts` | 登录弹窗、邮箱密码输入、登录成功/失败 |
| `navigation.spec.ts` | 路由可访问、404、重定向、浏览器前进后退 |
| `profile.spec.ts` | 个人主页信息、作品列表、标签页切换 |
| `friends.spec.ts` | 好友列表、标签切换、底部导航跳转 |
| `notifications.spec.ts` | 通知列表、分类切换、底部导航 |
| `experiment-summary.spec.ts` | 作品详情展示、评论区、返回导航 |
| `error-handling.spec.ts` | API 报错/超时/断网、无效路由、XSS、边界输入 |
| `fuzz-testing.spec.ts` | 1000 次随机点击/跳转，检测崩溃和白屏 |
| `workflow.spec.ts` | 用户完整流程：首页→作品→个人页→设置等 |

### 工具

| 文件 | 说明 |
|------|------|
| `test-helpers.ts` | 登录注入、页面就绪等待、白屏检测、`mockApiError`/`mockApiAbort` |
| `playwright.config.ts` | Playwright 配置（浏览器、超时、重试） |

### 模拟 API 错误

测试中需要模拟后端报错时，使用 `mockApiError` 或 `mockApiAbort`：

```ts
import { mockApiError, mockApiAbort } from './test-helpers'

// 模拟登录接口返回 401
await mockApiError(page, '**/api/Users/Authenticate', 401, 'Invalid credentials')

// 模拟网络断开
await mockApiAbort(page, '**/api/Contents/**')
```

也可直接用 `page.route()` 做更精细的 mock。
