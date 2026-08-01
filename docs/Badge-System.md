# 徽章 & 装备系统 — 接口对接报告

## 一、接口列表

### POST /Badge/Equip — 装备装饰（本人）
```json
请求: { "Type": "Badge", "Identifier": "community-veteran" }
成功: { "Message": "", "Data": <User>, "Status": 200, "Token": "...", "AuthCode": "..." }
```
校验：Type 必须是 `Badge` / `AvatarFrame` / `AvatarBackground` 之一；必须已持有该徽章；Type 必须与定义的 Type 一致。

### POST /Badge/Unequip — 卸下装饰（本人）
```json
请求: { "Type": "AvatarFrame" }
成功: { "Message": "", "Data": <User>, "Status": 200 }
```
未装备该类型时幂等成功。

## 二、装备数据结构（User / UserSummary 内）
```json
"Equipped": {
    "Badge": "community-veteran",
    "AvatarFrame": "gold-frame",
    "AvatarBackground": "nebula"
}
```
- key = 装饰类型（三选一，每类单选一个）
- value = 徽章定义 Identifier，用 `Badge/Info` 换取 `Image`/`Name`
- **可能为 `null` 或 `{}`，都要处理**
- 他人资料可见（投影已包含）

## 三、既有接口注意变更

| 接口 | 变更 |
|------|------|
| `POST /Badge/Info` | `UserID` 缺省/空 → 查自己；非法 ID → 400。他人（非管理员）仍只返回 `BadgeIdentifier` 列表；本人/管理员返回完整定义 + `GrantorID`/`GrantorName` |
| `POST /Badge/Holders` | **必须传 `Skip`、`Take`**（Take ≤ 100，否则 400）；分页在数据库层完成 |
| `POST /Badge/Revoke` | 撤销后会自动卸下该用户已装备的同类型徽章 |

## 四、错误码

| Status | Message | 说明 |
|--------|---------|------|
| 400 | `Input.Field.Missing` / `Input.Field.Invalid` | 缺字段 / 字段非法（具体字段名在 `Data`） |
| 403 | `User.Not.Allowed` | 无权限（Holders 受 `HolderMinVerification` 控制；空=任意登录用户可看） |
| 403 | `Badge.Not.Available` | 定义不可用 |
| 403 | `Badge.Not.Owned` | 未持有（装备时） |
| 403 | `Badge.Not.Enumerable` | 定义不允许枚举持有者 |
| 404 | `Badge.NotFound` / `User.NotFound` | 定义/用户不存在 |

## 五、边界提醒
1. `Holders` 非管理员返回 `{UserID, Timestamp}`，管理员返回含 `Nickname`/`GrantorID`/`GrantorName`
2. 定义被标记 `Obsoleted` 后，`Info` 中对应字段为 `null`，前端需容错
3. `GrantorName == "system"` 表示系统授予（`GrantorID` 为全 0 ObjectId）
4. 所有请求仍需 `x-API-Token`/`x-API-AuthCode` 认证头
