# Physics-Lab-Web v2

This project is the new version of [Physics-Lab-Web](https://plweb.turtlesim.com), a web application for [Physics Lab AR](https://turtlesim.com/products/physics-lab/index-cn.html) (Chen, J. & Zhao, L. (2017)). It only provides basic community support and DOES NOT CONTAIN EXPERIMENT-RELATED FUNCTIONS.

This project is just migrated from the old repository, there are some small problems, such as: components not imported, paths not written correctly, etc.

And most importantly, we sincerely thanks to the previous contributors: Arenfelle, sfls-huangzeyuan, and other warm-hearted people who help us fin many bugs in the physicslab's community.

- technologies used: vue3, typescript, vite, [richtext render based on c++ wasm](https://github.com/SekaiArendelle/pltxt2htm)
- other development tools:
    + Vector icon library: https://icomoon.io/app/#/select
    + vue3 component library: https://www.naiveui.com/zh-CN/os-theme/components/t
- recommended IDE plugins: prettier, errorlens, vue3-official
- recommended browser plugins: vue.js devtools

## Environment setup

1. Install [Node.js](https://nodejs.org/) (version 22 ).
2. [Optional] Install [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) and run `nvm install 22` or download Node.js v22 manually.
3. [Optional] Install [nrm](https://github.com/Pana/nrm) (NPM Registry Manager) and run `nrm use taobao`.
4. Clone the repository and run `npm install` to install dependencies. You can ignore all warnings.
5. Run `npm run dev` to start the local server.
6. Run `npm run lint` to format the code and check ESLint.
7. Run `npm run build` to perform TypeScript checks.

## Project structure
- `public/`: **Add pictures and icons here**, DO NOT import them in code using relative paths.
- `src/views`: Pages, each page corresponds to a route.
- `src/components/popup`: Donnot inport these components in other components, use funtions from @services/pupup instead.These components are seperate from the root vue instance.

## **Notice**
- If you add a new page, please remember to add the route in `src/router/index.ts`.
- **Richtext render will be replaced by a wasm edition later**,do not add new features to the current one
- DONNOT use localstorage or sessionstorage directly, use @storage/index instead.And you need to register the keys in it.
- DONNOT use fetch directly, use @services/api/ instead.
- *DONNOT derectly import static files with its path*, use `getPath` function from @services/utils instead.
- We use eventEmitter for page communication, and you need to register events types in  @services/eventEmitter
- We use i18n , so donnot use hardcoded strings in components
- Some config can be configured in service/config

## TO do list

If you want to start a contribution, here is some directions:
- [ ] Complete the settings page(including i18n switch, export error log etc), the components in ./views/settings user.config.ts system.config.ts already have a prototype
- [ ] Redesign the error log, the format now is terrible
- [ ] Some errors in runtime may not be detected
- [ ] Fix the style when the window is too large
- [ ] Improve the responsive design, there are problems with font size and others now
- [ ] Make the work item and work block, as well as tags responsive
- [ ] Finish the error handling when API fails(We seldom check it, Im to blame)
- [ ] Better storage management(**Using indexDB**).Some requests can be cached, and when we need to fetch them again, we can use the cached version first, and fetch the real source in the same time, then update it(Vue has an incredible stratege to make accurate dom element update). 
- [ ] Transpile the code to support older browsers, using plugins(assigned to @wsxiaolin)
- [ ] Shorten the route names in router, e.g. change #experiment-summary/:id to #p/:id , userProfile to u etc.
