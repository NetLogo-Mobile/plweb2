# Physics-Lab-Web v2

本项目是 [Physics-Lab-Web](https://plweb.turtlesim.com) 的新版本，该 web 应用来自 [Physics Lab AR](https://turtlesim.com/products/physics-lab/index-cn.html) (陈健 & 赵亮, 2017)。它仅提供基础的社区支持，并**不包含实验相关功能**。

本项目只是从旧仓库迁移过来的，存在一些小问题，例如：组件未导入、路径写错等。

最重要的是，我们衷心感谢之前的贡献者：Arenfelle、sfls-huangzeyuan 以及其他热心的朋友，他们帮助我们在 physicslab 社区中发现了许多 bug。

- 使用技术：vue3, typescript, vite, [基于 C wasm 的富文本渲染](https://github.com/SekaiArendelle/pltxt2htm)
- 其他开发工具：
  矢量图标库: https://icomoon.io/app/#/select
  vue3 组件库: https://www.naiveui.com/zh-CN/os-theme/components/t
- 推荐 IDE 插件：prettier, errorlens, vue3-official
- 推荐浏览器插件：vue.js devtools

## 环境配置

1. [如果安装2，则跳过这个步骤]安装 [Node.js](https://nodejs.org/)（版本 22）。
2. [可选] 安装 [nvm](https://github.com/nvm-sh/nvm)（Node 版本管理工具）并运行 `nvm install 22`，或手动下载 Node.js v22。
3. [可选] 安装 [nrm](https://github.com/Pana/nrm)（NPM 注册表管理器）并运行 `nrm use taobao`。
4. 克隆仓库并运行 `npm install` 安装依赖。可以忽略所有警告。
5. 运行 `npm run dev` 启动本地服务器。
6. 运行 `npm run lint` 格式化代码并检查 ESLint。
7. 运行 `npm run build` 执行 TypeScript 检查。

## 项目结构
- `public/`: **在这里添加图片和图标**，不要在代码中使用相对路径导入。
- `src/views`: 页面，每个页面对应一个路由。
- `src/components/popup`: 不要在其他组件中导入这些组件，使用 @services/pupup 中的函数。这些组件与根 vue 实例是分离的。

## **注意事项**
- 如果添加新页面，请记得在 `src/router/index.ts` 中添加路由。
- **富文本渲染将来会被 wasm 版本替换**，不要向当前版本添加新功能。
- 不要直接使用 localStorage 或 sessionStorage，应使用 @storage/index，并在其中注册键值。
- 不要直接使用 fetch，应使用 @services/api/。
- *不要直接通过路径导入静态文件*，应使用 @services/utils 中的 `getPath` 函数。
- 我们使用 eventEmitter 进行页面通信，需要在 @services/eventEmitter 注册事件类型。
- 我们使用 i18n，因此组件中不要使用硬编码字符串。
- 一些配置可以在 service/config 中设置。

## 待办事项

如果你想开始贡献，方向如下：
- [ ] 完成设置界面（包括i18n的切换，和导出错误日志等功能），组件在./views/settings user.config.ts system.config.ts 都已经有雏形了 
- [ ] 重新设计错误日志，现在的这支格式太烂了
- [ ] 运行时的一些错误可能无法被检测
- [ ] 修复窗口过大时的样式问题
- [ ] 完善响应式设计，目前字体等大小都有问题
- [ ] 把作品条目和作品块，以及标签加入响应式
- [ ] 完善 API 失败时的错误处理（我们很少检查，责任在我）
- [ ] 更好的存储管理 (**使用 indexDB**)。部分请求可以缓存，当需要再次请求时，可以先使用缓存版本，同时再获取真实数据并更新它（Vue 有一个很棒的策略，可以精准更新 DOM 元素）。
- [ ] 转译代码以支持旧浏览器，使用插件（分配给 @wsxiaolin）
- [ ] 把router里面路由名称缩短一些，例如 #experiment-summary/:id 改为 #p/:id , userProfile 改为 u 等等

