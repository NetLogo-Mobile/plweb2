# plweb2 — AI Agent 开发指南

本文档为 AI 编码 Agent 提供 plweb2 项目的完整上下文。请先阅读本文档再执行任何代码修改。

---

## 1. 项目概述

- **项目**: plweb2 — 物理实验室 (Physics Lab) 的 Web 社区前端
- **技术栈**: Vue 3 (Composition API, `<script setup lang="ts">`) + TypeScript + Vite 7
- **包管理**: npm (package-lock.json)
- **Node 要求**: 参见 package.json 中 engines 字段 (未指定则任意现代版本)
- **UI 库**: Naive UI (devDependency, 仅通过 `createDiscreteApi` 使用, 无组件式使用)
- **PWA**: vite-plugin-pwa + Workbox (injectManifest 策略)
- **支持语言**: 中文, 英文, 德文, 日文, 法文

**关键设计原则**:
- 所有 API 请求走 `getData` (不允许绕过)
- 所有组件函数/逻辑在 `<script setup lang="ts">` 中
- 所有组件使用 BEM 命名的 scoped CSS
- 无 Pinia/Vuex — 组件间通信通过 EventEmitter 和 storageManager 进行
- 弹窗类 UI 脱离主 Vue 应用根节点独立挂载

---

## 2. 入口与根组件

### src/main.ts
- 挂载 `router`、`i18n`、`App` 到 `#app`
- 注册全局指令 `v-richText` (接受 `() => Promise<string>` 用于异步富文本渲染)
- 注入 `window.$ErrorLogger` (ErrorLogger 实例) 和 `window.$Logger` (LogManager 实例)
- 引入 `highlight.js` 的 GitHub 主题 CSS

### src/App.vue
- `<CookieNotice />` 放在 `<router-view>` 之前
- 使用 `<keep-alive>` 缓存路由组件 (设置页 `keepAlive: false`, 其余 `true`)
- 全局点击委托: 点击 `.RUser` 元素弹出用户卡片 (`showUserCard`)

---

## 3. 路由系统

**文件**: `src/router/index.ts`
**模式**: `createWebHashHistory("/plweb2/")` — 所有 URL 以 `#/plweb2/` 开头

| 路径 | 页面 | keepAlive |
|---|---|---|
| `/` | 首页 Home (同步导入) | true |
| `/b` | 黑洞 | true |
| `/n` | 通知 | true |
| `/m` | 留言 | true |
| `/p/:category/:id` | 实验详情 | true |
| `/c/:category/:id/:name` | 评论 | true |
| `/u/:id` | 个人资料 | true |
| `/f` | 好友 | true |
| `/l/:config` | 作品列表 | true |
| `/s` | 设置 | false |
| `/:catchAll(.*)` | 404 | true |

---

## 4. 路径别名 (在 vite.config.ts 和 tsconfig 中定义)

| 别名 | 路径 |
|---|---|
| `@api` | `src/services/api` |
| `@popup` | `src/services/popup` |
| `@storage` | `src/services/storage` |
| `@services` | `src/services` |
| `@components` | `src/components` |
| `@views` | `src/views` |
| `@i18n` | `src/i18n` |

---

## 5. 服务层详情

### 5.1 API 请求 — `src/services/api/getData.ts`

**核心函数**:
- `getData<Path>(path, body)` — 通用类型化请求函数
- `login(arg1, arg2, is_token?)` — 登录专用函数

**调用约定**:
- 所有请求 POST 到 `getPath('/@api' + normalizedPath)`
- 自动携带 header: `x-API-Token`, `x-API-AuthCode`, `x-API-Version`
- 自动执行 `beforeRequest` / `afterRequest` 拦截器 (速率限制, 加载提示, 历史记录)
- 非 2xx 或 API 返回非 200 时自动记录到 `$ErrorLogger` 并弹出错误通知
- 调用方只需处理应用层业务逻辑错误

**可缓存路径** (离线回退):
`GetProfile`, `GetSummary`, `GetComments`, `GetMessages`, `GetLibrary`, `GetUser`

**请求流程**: `getData` → `getPath(path)` → `fetch` → `beforeRequest` → `afterRequest` → 离线缓存回退

### 5.2 拦截器 — `src/services/api/Interceptor.ts`

- 速率限制: 根据请求方法限制频率 (通过 `requestHistoryMap` 存储)
- 加载消息: 通过全局加载状态和 Naive UI loading bar 实现
- Quantum Models: 专门跳过某些路径的销毁操作
- 每个请求在完成后会记录到 `requestHistoryMap` (localStorage)

### 5.3 缓存 — `src/services/api/cache.ts`

- 基于 localStorage 的 API 响应缓存
- 以用户 ID 为键
- 支持排序后的序列化 (t, p, et, pg 字段排序)
- 与 `getData` 中的 `CACHEABLE_PATHS` 配合使用

### 5.4 设备信息 — `src/services/api/getDevice.ts`

- 使用 FingerprintJS 生成 `visitorId`
- 收集: userAgent, screen 尺寸, cpu cores, memory, platform, language, timezone, colorDepth, deviceMemory, connection, webdriver
- 存储到 `visitorId` 缓存中 (365 天)

### 5.5 日志记录 — `src/services/api/logWriter.ts`

- 会话日志: 上报会话开始/结束 (包含页面浏览数据)
- 行为日志: 上报用户行为 (使用通用数据键值对)
- 事件日志: 上报 UI 事件
- 以二进制格式发送 (降低传输开销)

---

## 6. 本地存储系统

**文件**: `src/services/storage/index.ts`
**默认导出**: `storageManager`
**仓库别名**: `@storage`

### 6.1 存储格式

所有值存储为: `{ value: any, time: number (Date.now()), maxAgeMs?: number }`

### 6.2 方法

| 方法 | 说明 |
|---|---|
| `getObj(key, maxAgeMs?)` | `{ status: "success"\|"expired"\|"empty", value: T\|null }` |
| `getStr(key, maxAgeMs?)` | 同上, 但返回字符串 |
| `setObj(key, value, maxAgeMs?)` | 存储任意对象 |
| `setStr(key, value, maxAgeMs?)` | 存储字符串 |
| `remove(key)` | 删除 |
| `clear()` | 调用 `localStorage.clear()` |

### 6.3 已注册键 (`localStorages` 联合类型)

```
userInfo | tagConfig | userConfig | visitorId
| requestHistoryMap | apiResponseCache
| userIDAndAvatarIDMap | userAuthInfo | cookieConsent
```

**⚠ 新增键**: 必须在 `localStorages` 类型中添加声明。

### 6.4 使用模式

```ts
import sm from '@storage/index';

// 读 (安全: 自动处理 JSON 解析失败和过期)
const result = sm.getObj('userInfo');
if (result.status === 'success') {
  const value = result.value;
}

// 写
sm.setObj('userConfig', { lang: 'zh' });

// 带过期时间写 (单位: 毫秒)
sm.setObj('visitorId', 'abc123', 365 * 24 * 60 * 60 * 1000);
```

---

## 7. 事件系统

**文件**: `src/services/eventEmitter.ts`
**默认导出**: `Emitter` 单例

### 事件类型

| 事件名 | 载荷 | 触发时机 |
|---|---|---|
| `loginRequired` | 无 | 需要登录时 |
| `updateTagConfig` | `ContentTag[]` | 标签配置更新 |
| `updateUserConfig` | `Record<string, unknown>` | 用户配置更新 |
| `notificationUnreadChanged` | `boolean` | 未读通知状态变化 |
| `userLogin` | `ResultOf<Users["Authenticate"]>` | 用户登录成功 |

### 使用模式

```ts
import Emitter from '@services/eventEmitter';

Emitter.on('loginRequired', () => { /* 显示登录弹窗 */ });
Emitter.emit('userLogin', loginResult);
```

---

## 8. 错误日志系统

**文件**: `src/services/errorLogger.ts`
**默认导出**: `ErrorLogger` 类

### 初始化
构造函数会自动设置:
- Vue 全局错误处理器 (`app.config.errorHandler`)
- `window.onerror`
- `unhandledrejection` 监听器

### 主要方法

| 方法 | 说明 |
|---|---|
| `captureError(context)` | 捕获并去重错误 (相同签名 2.5 秒内去重) |
| `captureApiError(method, path, statusCode, ...)` | 记录 API 错误 |
| `addBreadcrumb(category, message, data)` | 添加面包屑 (最多 50 条) |
| `writeLog(message, category, data)` | 调试日志 (仅 debug 模式) |
| `exportToTxt()` | 导出日志为 .txt 下载 |
| `getLogs()` / `filterLogs()` / `getBreadcrumbs()` | 诊断方法 |
| `clearLogs()` | 清空日志 |
| `getStatistics()` | 错误统计 |

**持久化**: 通过 localStorage(`"error_logs"`) 跨页面刷新持久化

---

## 9. 头像与缓存

**文件**: `src/services/getUserCurentAvatarByID.ts`

### 使用方式

```ts
import { getAvatarUrl, saveCache } from '@services/getUserCurentAvatarByID';

// 获取头像 URL
const url = await getAvatarUrl(userId);

// 修改缓存后必须调用
saveCache();
```

### 缓存机制
- 内存 Map (72 小时过期) + localStorage 持久化
- 缓存键: `userIDAndAvatarIDMap`
- 过期后自动调用 `/Users/GetUser` API 刷新

---

## 10. 弹窗系统

**文件**: `src/services/popup/index.ts` (入口), `src/services/popup/naiveui.ts`

### 弹窗组件 (独立挂载, 脱离主 Vue 根)

| 文件 | 功能 | 挂载方式 |
|---|---|---|
| `loginModel.ts` | 登录弹窗 | `createApp` + `mount` 到独立 div |
| `userProfileDialog.ts` | 用户卡片 | `createApp` + `mount` 到独立 div |
| `actionSheet.ts` | 操作面板 | `createApp` + `mount` 到独立 div |
| `apiError.ts` | API 错误对话框 | 单例, `createApp` + `mount` |

### Naive UI 离散 API (`naiveui.ts`)
```ts
import { showMessage, showNotification, showDialog, showModal, showLoadingBar } from '@popup/naiveui';
```
这些无需挂载, 使用 `createDiscreteApi` 直接调用。

---

## 11. 工具函数

**文件**: `src/services/utils.ts`

| 函数 | 说明 |
|---|---|
| `getPath(path)` | 替换路径中的 `@api`, `@static`, `@base`, `@root` 为运行时值 |
| `getUserUrl(user)` | 构建用户头像 URL |
| `getAnonymousAvatarByNickname(nickname)` | 生成 4 位数字昵称的 SVG data URL 头像 |
| `getCoverUrl(data)` | 构建实验封面 URL |
| `copyText(text)` | 复制到剪贴板 |
| `encodeAPITargetLink(input)` / `decodeHrefToQueryObj(base64)` | API targetLink 编解码 |
| `formatDate(id, showRelative?, type?)` | 从十六进制 ID 格式化日期 (支持相对时间) |
| `removeToken(obj)` | 遮盖对象中的 token/authCode 字段 |
| `checkLogin(showLoginLeader?)` | 检查登录状态 (可显示引导弹窗) |

---

## 12. 国际化

**文件**: `src/i18n/index.ts` (导出 `i18n` 实例, `AppLanguage`, `detectBrowserLanguage` 等)

### AppLanguage 枚举
`"Chinese"` | `"English"` | `"German"` | `"Japanese"` | `"French"`

### 使用

```ts
const { t } = useI18n();
t('cookieNotice.title');
```

### 语言文件结构 (以 en.ts 为例, 176 行)
分区: `login`, `cookieNotice`, `user`, `blackhole`, `worklist`, `profile`, `comments`, `notfound`, `notifications`, `friends`, `messagesI18n`, `errors`, `expeSummary`, `date`, `userCard`, `settings`, `footer`, `ui`

### 特殊工具
- `getTagName.ts` (753 行): 根据 tag 数组和当前语言返回本地化标签名
- `translateErrorMessage.ts`: 服务器错误码 → 中文消息映射
- `scripts/check-i18n.mjs`: 确保各语言文件的键同步

### 日期格式 (每种语言独立定义)
`time`, `monthDay`, `yearMonthDay`, `date` 四种格式

---

## 13. 配置

### `src/config/system.config.ts`
- `version`: "1.0.0"
- `contributorsMain`, `contributors`: 贡献者列表
- `links`: GitHub, 论坛 URL
- `allowedOrigin`: 允许的跨域来源

### `src/config/user.config.ts`
- 设置定义数组, 目前仅 "general" 分区
- 设置项: `language` (link 类型, 切换 i18n locale), `debugger` (link 类型, 开关), `exportLogs` (button 类型)

---

## 14. 类型定义

### 主类型
- `src/pl-serve-type-main/type/`: 后端 API 类型定义 (enum, interface) — 与后端协议紧耦合, **谨慎修改**
  - `enum.ts`, `enums.ts`: 枚举
  - `unit.ts`: 基元类型别名
  - `shape.ts`: 可复用接口
  - `serve.ts`: 服务相关接口
  - `main.ts`: API 参数/返回值结构体
  - `index.ts`: 重新导出所有类型
- API 路径类型: `src/services/api/types.ts` (PathMap, ApiPath, APIParam, APIResult)

### 全局声明
- `src/global.d.ts`: 扩展 `Window` 接口 (`$Logger`, `$ErrorLogger`)
- `src/types/global.d.ts`: 扩展 `ErrorConstructor`
- `src/shims-vue.d.ts`: `*.vue` 模块声明
- `src/shims-katex.d.ts`: KaTeX auto-render 模块声明

---

## 15. TypeScript 配置

| 配置 | 用途 | 严格模式 |
|---|---|---|
| `tsconfig.app.json` | 主应用类型检查 | 全严格 (strict, noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess 等) |
| `tsconfig.lib.json` | 库兼容性检查 | 部分宽松 (noImplicitAny: false, strictNullChecks: false) |
| `tsconfig.node.json` | Vite 配置 | Node 模式 |

**路径映射** (在 tsconfig.app.json 和 tsconfig.lib.json 中一致):
```json
"@api/*": ["src/services/api/*"],
"@popup/*": ["src/services/popup/*"],
"@storage/*": ["src/services/storage/*"],
"@services/*": ["src/services/*"],
"@i18n/*": ["src/i18n/*"]
```

---

## 16. Vue 组件约定

### 目录结构
```
src/components/
  blocks/       — Block.vue, TopicBlock.vue
  friends/      — item.vue, list.vue
  messages/     — MessageItem, MessageList, NotificationItem, NotificationList
  popup/        — 弹窗/单独立挂载组件 (actionSheet, ApiErrorDialog, loginModel, userProfileDialog)
  projects/     — brief, detailed, item, wortList
  utils/        — CommentComposer, CookieNotice, Footer, Header, infiniteScroll, Tag, TagLarger
```

### 组件规范
- 使用 `<script setup lang="ts">` + TypeScript
- 使用 scoped CSS 和 BEM 命名
- 国际化使用 `useI18n()` (不使用 `this.$t`)
- 组件名使用 PascalCase, 文件名保持一致
- 弹窗组件 (`src/services/popup/` 中的 .vue 文件) 独立挂载, 不通过 App.vue 路由
- 内置 `<keep-alive>` 缓存路由组件 (见路由表)

### 布局组件
- `src/layout/BiLayout.vue`: 响应式双列布局 (宽屏左右, 竖屏上下)
- `src/layout/useResponsive.ts`: 提供 `width`, `height`, `isPortrait`, `isCompact`, `isUltraCompact`, `blockItemsPerRow` 响应式状态

---

## 17. PWA / Service Worker

**文件**: `src/sw.ts` (injectManifest 策略)

### 功能
- Workbox 预缓存所有构建产物
- 静态图片回退 (默认头像/封面)
- CORS 跨域请求支持
- 缓存策略: CacheFirst (最多 10000 项, 最长 300 天过期)

### 构建
- PWA 配置在 `vite.config.ts` 中
- `dev-dist/` 为开发时 PWA 构建输出目录

---

## 18. 环境变量

```ini
# 开发 (.env)
VITE_API_URL=/api
VITE_STATIC_URL=/static
VITE_ROOT_URL="/#"
VITE_BASE_URL=""

# 生产 (.env.production)
VITE_API_URL=https://physics-api-cn.turtlesim.com
VITE_STATIC_URL=https://physics-lab.oss-cn-hongkong.aliyuncs.com
VITE_ROOT_URL="/plweb2/#"
VITE_BASE_URL=/plweb2/
```

**代理** (dev): `/api` → physics-api-cn, `/static` → physics-static-cn

---

## 19. 富文本系统 (pltxt2htm)

**文件**: `src/services/pltxt2htm/`

- 基于 WASM 的 pltxt 转 HTML 解析器
- 集成 KaTeX (LaTeX 数学公式)、highlight.js (代码高亮)、Mermaid (图表)
- 详细文档见 `src/services/pltxt2htm/README.md`

---

## 20. 代码规范检查

### ESLint (`eslint.config.js`, 平面配置 v9)
- 继承: `@typescript-eslint/recommended` + `plugin:vue/vue3-recommended`
- `no-console`: off (允许 console.log)
- `@typescript-eslint/no-explicit-any`: off
- `vue/no-v-html`: off
- `@typescript-eslint/consistent-type-imports`: error
- `complexity`: max 12 (warn)
- `max-lines-per-function`: max 50 (warn)
- `max-depth`: max 4 (warn)
- `max-nested-callbacks`: max 3 (warn)
- `@typescript-eslint/no-unused-vars`: warn (忽略 `_` 开头的变量)

### npm 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 (host 0.0.0.0) |
| `npm run build` | `vue-tsc --build --force` + `vite build` |
| `npm run preview` | 预览 production build |
| `npm run eslint` | 运行 ESLint 修复 |
| `npm run format` | 运行 Prettier 格式化 |
| `npm run lint:i18n` | 检查 i18n 键同步性 |

---

## 21. 常见开发模式

### 新增一个页面
1. 在 `src/views/` 中创建 `.vue` 文件
2. 在 `src/router/index.ts` 中添加路由 (懒加载)
3. 添加 i18n 翻译到所有 5 个语言文件
4. 保持 `keepAlive` 一致性

### 新增一个 API 端点
1. 在 `src/services/api/types.ts` 的 `ApiPath` 中补充类型
2. 使用 `getData` 调用
3. 如需缓存, 在 `CACHEABLE_PATHS` (getData.ts) 中添加路径

### 新增一个 localStorage 键
1. 在 `src/services/storage/index.ts` 的 `localStorages` 类型中添加
2. 使用 `storageManager.setObj/getObj` 操作

### 新增一个事件
1. 在 `src/services/eventEmitter.ts` 的 `Events` 类型中添加
2. 在其他文件中 `Emitter.on` / `Emitter.emit`

### 新增一个 i18n 翻译键
1. 在所有 5 个语言文件中添加相同的键 (zh, en, de, ja, fr)
2. 运行 `npm run lint:i18n` 检查同步性
3. 在模板中使用 `t('section.key')`

### 新增一个弹窗
1. 创建 `.vue` 文件在 `src/components/popup/`
2. 创建对应的 `.ts` 文件在 `src/services/popup/`
3. 使用 `createApp(Component).mount(div)` 独立挂载
4. 在 `src/services/popup/index.ts` 中重新导出

---

## 22. 查看现有文档

| 文档 | 位置 | 内容 |
|---|---|---|
| API 设计说明 | `src/services/api/readme.md` | 接口设计原理 (中英双语) |
| 存储管理器说明 | `src/services/storage/readme.md` | 存储层用法 (中英双语) |
| 富文本解析器说明 | `src/services/pltxt2htm/README.md` | pltxt2htm 使用方法 |
| 后端类型定义说明 | `src/pl-serve-type-main/README.md` | API 类型文档 |
| 项目 README | `README.md`, `README-zh.md` | 项目简介 (中英双语) |
| i18n 检查脚本 | `scripts/check-i18n.mjs` | 确保语言键同步 |

---

## 23. 构建与部署要点

- 构建命令: `npm run build` (先 `vue-tsc -b` 类型检查, 再 `vite build`)
- 构建产物在 `dist/` 目录
- PWA service worker 使用 injectManifest 策略, 自定义 `src/sw.ts`
- Git 页面部署: 哈希路由 `base: "/plweb2/"`, 适合 GitHub Pages
- 类型检查严格: `noUnusedLocals` 和 `noUnusedParameters` 为 true, 引入未使用的变量/参数会导致构建失败
- `@vue/tsconfig/tsconfig.dom.json` 作为基础配置
