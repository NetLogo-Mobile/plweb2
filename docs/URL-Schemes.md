# Physics Lab URL Schemes 参考文档

> 来源:`Navigator.cs`(Quantum-Common 模块)+ `NavigatorImpl.cs`(Physics Lab 工程)

## Scheme 前缀

| Scheme | 说明 |
|---|---|
| `physics://` | iOS/Android 主 scheme |
| `turtle://` | 海龟实验室 |
| `https://xxx.turtlesim.com/?...` | 带 query 的 HTTPS 链接(host 必须以 `turtlesim.com` 结尾),query 按深链格式解析 |

## 统一格式

```
{scheme}://{区域}/{类别}/{参数}
```

**区域**(必填):

| 区域 | 说明 |
|---|---|
| `any` | 当前区域 |
| `chinese` | 切换中国区后执行 |
| `global` | 切换全球区后执行 |

## 内容类别(打开内容页)

| 格式 | 功能 |
|---|---|
| `physics://any/experiment/{ID}` | 打开实验 |
| `physics://any/model/{ID}` | 打开模型 |
| `physics://any/discussion/{ID}` | 打开讨论 |
| `physics://any/experiments/{ID}` | 实验列表页 |
| `physics://any/models/{ID}` | 模型列表页 |
| `physics://any/discussions/{ID}` | 讨论列表页 |
| `physics://any/user/{ID}` | 用户主页弹窗 |
| `physics://any/library/{页面}` | 图书馆页面,如 `library/Homepage` |
| `physics://any/library/{库ID}` | 打开具体库(由 VisitTag 生成) |

## 内部操作(`internal`)

| 格式 | 功能 |
|---|---|
| `physics://any/internal/forum` | 进论坛(未绑定先绑定) |
| `physics://any/internal/forum-connect` | OAuth 授权论坛 |
| `physics://any/internal/forum-direct` | 直接打开论坛(不授权) |
| `physics://any/internal/privacy` / `privacy-us` / `privacy-china` | 隐私政策 |
| `physics://any/internal/termofuse` / `-us` / `-china` | 使用条款 |
| `physics://any/internal/charge` | 商店/充值 |
| `physics://any/internal/messages` | 消息页 |
| `physics://any/internal/friends` | 好友页 |
| `physics://any/internal/activity` | 活动弹窗 |
| `physics://any/internal/homepage` | 回到首页 |
| `physics://any/internal/settings` | 设置页 |
| `physics://any/internal/exchange` | 兑换码弹窗 |
| `physics://any/internal/circuit` | 进入电路沙盒 |
| `physics://any/internal/celestial` | 进入天体沙盒 |
| `physics://any/internal/electromagnet` | 进入电磁沙盒 |

## 外部链接(`external`)

```
physics://any/external/{完整URL}
```

仅白名单域名放行:`turtlesim.com`、`turtlesim.net`、`hicivitas.com`、`netlogo.org`、`netlogoweb.org`、`northwestern.edu`,以及 `physics://`/`turtle://` 会递归再解析。

## 解析细节(容易踩坑)

- 参数按 `/` 和 `-` 分隔,**至少 3 段**(区域/类别/参数),但参数本体用 substring 截取,`-` 和 `/` 可以出现在参数里。
- 末尾 `=` 会被剥掉(微信兼容),末尾 `?X`(≤2字符)也会被剥掉。
- 未知类别/参数 → App 显示"不支持"或调用 FailedHandler(所以 `?redirect=` 加在 `forum-connect` 后面会挂)。
