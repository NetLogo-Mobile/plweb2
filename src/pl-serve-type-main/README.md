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
- ./upstream
上游代理服务器

## 使用例

通过继承上游代理实现服务中间件，使用super访问上级。
详见[./example.ts](./example.ts)
