# AI-friendly 分支说明（ai-friendly）

这个分支专门用于部署到 Netlify：
- 目标站点：`https://plweb-ai-friendly.netlify.app/`
- 分支名：`ai-friendly`
- 维护策略：**永久与 `main` 解耦，不再同步。**

## 做了什么

1. 将生产环境 API / 静态资源地址改为同源路径：`/api`、`/static`。
2. 使用 `netlify.toml` 做反向代理，避免浏览器跨域问题。
3. 启用 `netlify-plugin-prerender-spa`，为爬虫/AI提供可直接读取的数据化 HTML 快照。
4. 移除 PWA 构建插件，避免 Service Worker 对抓取和快照的一致性干扰。

## Netlify 建议配置

- Build command: `npm run build`
- Publish directory: `dist`
- Deploy branch: `ai-friendly`

