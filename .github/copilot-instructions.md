# 供 AI 编码 Agent 使用的简明说明

- **技术栈 & 入口**: Vue 3 + TypeScript + Vite。应用入口：`src/main.ts`（挂载 `router`、`i18n`，并在 `window` 上注入 `window.$ErrorLogger` / `window.$Logger`）。

- **路由**: 位于 `src/router/index.ts`，使用 Hash 历史（createWebHashHistory）并且绑定了 base `/Physics-Lab-Web/`。懒加载路由组件常见。

- **服务层约定（重要）**: 所有后端请求通过 `src/services/api/getData.ts` 发出。
  - 请求为 POST 到 `getPath('/@api' + normalizedPath)`，会自动附带 `x-API-Token` 和 `x-API-AuthCode`（来源于本地存储 `userAuthInfo`）。
  - `getData` 会在非 2xx 或 API 返回非 200 时记录到 `window.$ErrorLogger` 并展示错误消息，调用方需自行处理中层应用逻辑错误（Status !== 200）。

- **本地存储约定**: 使用 `src/services/storage/index.ts`（导出为 `storageManager` / 别名 `@storage`）。常见键名：
  - `userAuthInfo`、`userIDAndAvatarIDMap`、`visitorId`、`userConfig` 等。
  - 使用 `setObj` / `getObj` 时会序列化为 `{ value, time, maxAgeMs }`，注意 expiry 参数。添加新键请在 `localStorages` 类型中声明。

- **头像与缓存示例**: `src/services/getUserCurentAvatarByID.ts`：
  - 行为：查 `storageManager` 缓存，若失效则调用 `/Users/GetUser`，把 `cache[ID] = [avatarIndex, Date.now()]` 并持久化（72 小时）。
  - 调用约定：调用后若修改了 cache，应调用 `saveCache()` 来持久化。

- **错误与日志**: 全局错误/日志在 `src/services/errorLogger.ts`，通过 `window.$ErrorLogger` 与 `LogManager` 使用；API 调用中会调用 `addBreadcrumb` / `captureApiError`。

- **路径别名**: 在 `tsconfig.app.json` 中定义：
  - `@api/*` → `src/services/api/*`
  - `@popup/*`, `@storage/*`, `@services/*`, `@i18n/*`。
  - 编辑或新增模块时请使用这些别名以保持一致。

- **网络/鉴权流程要点**:
  - 登录使用 `getData` 中的 `login()`（POST `/@api/Users/Authenticate`），成功后会写入 `userAuthInfo`（token / authCode）。
  - 许多 API 在 header 中依赖 token/authCode；不要绕过 `getData` 除非很明确为何需要自定义请求头。

- **开发/构建命令**（package.json 脚本）：
  - 本地开发：`npm run dev`（或 `pnpm`/`yarn` 等）
  - 构建：`npm run build`（先 `vue-tsc -b` 再 `vite build`）
  - 预览：`npm run preview`
  - 代码检查/格式：`npm run eslint`、`npm run format`

- **代码风格 & TS 约束**:
  - `tsconfig.app.json` 开启 `strict`，`noUnusedLocals`/`noUnusedParameters`，注意严格类型检查。
  - 遵循现有导出命名与目录结构：`src/services/*` 为业务逻辑，`src/services/api/*` 为 HTTP API。

- **PWA / Service Worker**: `dev-dist/` 含相关 `sw.js` 与 `workbox` 文件。更改 PWA 配置时检查 `vite.config.ts` 中插件配置（`vite-plugin-pwa`）。

- **pl-serve-type-main**: 目录 `pl-serve-type-main/` 包含与后端类型/枚举相关的本地工具和类型定义，谨慎修改——这些文件与后端协议紧耦合。

- **快速示例**（如何读取/调用用户头像）：
  - 读取：`import { getAvatarUrl } from '@services/getUserCurentAvatarByID'` → `await getAvatarUrl(userID)`。
  - 若更新 cache，记得 `saveCache()`。

- **修改提示**: 新增本地存储键需更新 `localStorages` 联动类型；新增 API 路径在 `src/services/api/types.ts`（`ApiPath`）中补充类型可获得完整类型检查。
