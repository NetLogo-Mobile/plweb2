# AI-friendly 分支说明（ai-friendly）

这个分支专门用于部署到 Netlify：
- 目标站点：`https://plweb-ai-friendly.netlify.app/`
- 分支名：`ai-friendly`
- 维护策略：**永久与 `main` 解耦，不再同步。**

## 核心策略

1. 生产环境 API / 静态资源改为同源路径：`/api`、`/static`。
2. 使用 `netlify.toml` 反向代理，解决浏览器跨域。
3. **不再使用 build-time prerender 插件**，改为 Netlify Function 运行时抓取数据：
   - 端点：`/__ai_snapshot`
   - 行为：每次请求时实时 fetch 上游 API，并把结果直接写进 HTML（`<pre>` + JSON script）。

## 为什么这样做

你需要的是“请求发生后才有数据”的 AI 可读输出，而不是构建瞬间的静态快照。
所以这里改成 **runtime snapshot**：每次访问 `__ai_snapshot` 都现抓数据。

## Netlify 建议配置

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Deploy branch: `ai-friendly`

## AI 快照用法

示例：
- `https://plweb-ai-friendly.netlify.app/__ai_snapshot`
- `https://plweb-ai-friendly.netlify.app/__ai_snapshot?path=/Contents/GetContents&search=?Category=Experiment&Skip=0&Take=10`

