# 物理实验室API类型定义

## 结构

- ./type/enums.ts
 枚举本身
- ./type/enum.ts
 枚举值的类型（联合类型）
- ./type/index.ts
 主入口
- ./type/main.ts
 主文件
- ./type/shape.ts
 可复用的形状接口
- ./type/serve.ts
 服务相关接口
- ./type/unit.ts
 基元类型的别名
- ./upstream.ts
 上游代理服务器（`Upstream` 基类，可被继承以扩展）

## 使用例

`./example.ts` 只是从 `./type/main` 重新导出所有类型，方便外部模块统一引入：

```ts
export * from './type/main'
```

若要实现自定义服务中间件，可以继承 `./upstream.ts` 中的 `Upstream` 基类，并调用 `super` 访问父级方法（见 `upstream.ts` 中的 `bindRouter` 绑定路由）：

```ts
import { Upstream, type UpstreamContext } from './upstream'

const ctx: UpstreamContext = {
  upstream: { Href: 'https://example.com/', Headers: {} },
  auth: {},
}
const server = new Upstream(ctx)
const res = await server.GetUser({ ID: '123' })
```
