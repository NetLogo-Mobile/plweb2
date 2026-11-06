# 民主墙服务端 v1 上线契约

前端生产入口由 `VITE_DEMOCRACY_WALL_MODE` 控制：

- `off`：隐藏入口并阻止路由访问；生产默认值。
- `read-only`：允许读取公开事务，关闭发布和管理操作。
- `full`：启用专用 `/Democracy/*` 接口。

只有服务端完成本文档的隐私、权限与审计要求后，生产环境才能设置为 `full`。

## 数据模型

### AnonymousProfile

| 字段            | 约束                                         |
| --------------- | -------------------------------------------- |
| UserID          | 主键；真实账号 ID；永不进入公开响应          |
| Alias           | 规范化后全局唯一；2–16 个 Unicode 字符       |
| AliasNormalized | 唯一索引；使用服务端统一大小写与兼容字符规则 |
| CanPublish      | 服务端发布总开关                             |
| ModifiedAt      | UTC 时间                                     |
| Version         | 乐观并发版本                                 |

改名必须在事务中完成唯一性检查。旧事务公开响应应读取当前化名；审计记录保留当时化名。

### DemocracyMatter

| 字段                  | 约束                                        |
| --------------------- | ------------------------------------------- |
| MatterID              | 主键                                        |
| CreatorUserID         | 真实账号 ID；仅审计权限可读                 |
| PublicAlias           | 可选快照；公开展示优先使用当前 profile      |
| Kind                  | `Public` 或 `Oversight`                     |
| Mode                  | `Formal` 或 `Suggestion`                    |
| Participation         | `Consultation`（意见征集）或 `Vote`（投票） |
| Stage                 | 见状态机                                    |
| Subject               | 4–80 字符                                   |
| Description           | 10–2000 字符                                |
| CreatedAt / UpdatedAt | UTC 时间                                    |
| Version               | 乐观并发版本                                |

### DemocracyAuditLog

记录发布、修改、改名、追溯、撤销/恢复发布权、阶段迁移、投票创建和决议归档。至少包含操作者、目标、理由、前后值、时间、请求 ID 与来源 IP 的安全摘要。审计日志只能追加。

### DemocracyVotePlan

包含 `Options`、`Multiple`、`StartAt` 与 `FinishAt`。投票沿用所属事务的上下文，不再单独保存题目；`Options` 为 2–20 项，每项规范化后 1–80 字符且不得重复。发布者可以在质询阶段设置或修改计划；开始时间到达后，由服务端调度器原子创建现有匿名投票并将事务迁移到 `Voting`。投票开始后正文、选项和时间冻结。

### DemocracyContribution

| 字段                      | 约束                                                 |
| ------------------------- | ---------------------------------------------------- |
| ContributionID / MatterID | 主键与所属事务                                       |
| AuthorUserID              | 真实账号 ID；仅追溯与审计权限可读                    |
| AuthorAlias               | 当前民主墙虚拟名；公开展示                           |
| AuthorPosition            | 服务端根据当前身份与权限标签生成的公开职位；公开展示 |
| Content                   | 建议或质询正文；1–400 字符                           |
| ClientRequestID           | 用户范围内唯一，用于幂等                             |
| CreatedAt                 | UTC 时间                                             |

公开职位由服务端生成，客户端无权指定或覆盖。实名账号、社区昵称、头像及其他可关联身份的字段不得进入公开响应。

### DemocracyInvestigationInvite

| 字段                          | 约束                                |
| ----------------------------- | ----------------------------------- |
| InviteID                      | 主键                                |
| MatterID                      | 必须关联 `Oversight` 事务           |
| InviterUserID / InviteeUserID | 私有账号 ID，不进入公开事务响应     |
| InviteeNickname               | 当前公开昵称快照                    |
| Status                        | `Pending`、`Accepted` 或 `Declined` |
| CreatedAt / RespondedAt       | UTC 时间                            |

重复发送未处理邀请应返回原邀请。受邀人接受前只显示“等待接受”，不得计入已加入成员。

### DemocracyReport

| 字段                  | 约束                                                 |
| --------------------- | ---------------------------------------------------- |
| ReportID              | 主键                                                 |
| MatterID              | 关联公开事务                                         |
| ReporterUserID        | 仅审核权限可读                                       |
| Category              | `Harassment`、`Privacy`、`Misinformation` 或 `Other` |
| Details               | 10–500 字符                                          |
| Status                | `Pending`、`Handled` 或 `Rejected`                   |
| ClientRequestID       | 用户范围内唯一，用于幂等                             |
| CreatedAt / HandledAt | UTC 时间                                             |

举报需按账号和事务限流；重复举报返回原有结果。紧急隐藏只能改变公开可见性，原文和全部处理记录继续保留在受限存储中。

## 权限

- 已登录且状态正常的账号：可提交建议与质询。
- `Oldtimer`：可匿名提议。
- `Editor`、`Administrator`：可发起正式事务。
- 独立的 `DemocracyDeveloperAdmin`：可追溯身份和撤销发布权。
- `DemocracyDeveloperAdmin`：可为管理监察事务邀请调查团成员。
- 独立的 `DemocracyClerk`：可迁移阶段、创建投票和归档。
- 所有权限均由服务端根据当前账号状态判断。
- 被全站封禁或 `CanPublish=false` 的账号无法通过任何民主墙写接口。
- `DemocracyDeveloperAdmin` 的账号警告与封禁权限只取决于操作者能力，不受目标账号的 Oldtimer、认证编辑、管理员等身份标签影响；认证管理员同样没有处置豁免。

## 公开响应隐私约束

`QueryMatters`、`GetMatter`、`SubmitMatter` 和 `UpdateMatter` 的响应必须满足：

- `Summary.User.ID` 为空。
- `Summary.User.Nickname` 仅包含匿名化名。
- 头像、签名、装饰、身份标签及可关联账号的字段清空。
- 响应、CDN 缓存键、通知和客户端日志中不出现真实用户 ID。
- `GetMatter` 对普通用户与未登录用户返回同一个公开 DTO。

身份追溯仅通过 `TracePublisher` 的授权审计流程进行。请求必须包含具体理由，每次读取都写入审计日志。

## API

所有接口使用 POST、现有 token/authCode 认证和统一 `Result<T>` 包装。

### `/Democracy/GetContext`

返回 API 版本、匿名 profile 和五项细分权限：`CanContribute`、`CanSuggest`、`CanInitiate`、`CanModerate`、`CanTransition`。未登录用户返回 `Profile=null` 且全部写权限为 `false`；被禁发账号的全部写权限同样为 `false`。

### `/Democracy/QueryMatters`

输入 `Scope`, `Skip`, `Take`。只返回公开 DTO。服务端固定排序并限制 `Take <= 48`。

### `/Democracy/GetMatter`

输入 `MatterID`。只返回公开 DTO；已删除、待内部审核或无权公开的事务使用一致的不可见响应。

### `/Democracy/SubmitMatter`

输入：

- `ClientRequestID`：用户范围内唯一，服务端保存幂等结果。
- `Alias`：与事务创建在同一事务中完成设置或改名。
- `Kind`, `Mode`, `Participation`, `Subject`, `Description`，以及投票事务所需的 `VotePlan`。

服务端检查身份、角色、发布资格、速率限制、化名唯一性、投票时间和文本规则。客户端提交的用户 ID、标签和阶段一律忽略。匿名提议在公开模型中不区分公共事务与管理监察，传入的 `Kind` 统一按 `Public` 兼容处理，`Participation` 强制归一化为 `Consultation` 并拒绝 `VotePlan`；具备资格的 Oldtimer 与正式事务均进入 `Questions`。正式事务可选择 `Consultation` 或 `Vote`，选择 `Vote` 时必须提交有效投票计划。

### `/Democracy/UpdateMatter`

输入 `MatterID`、`ExpectedRevision`、`Participation`、`Subject`、`Description` 与可选 `VotePlan`。服务端从认证信息判断当前账号是否为原发布者，禁止接收客户端发布者 ID。发布者在 `PendingReview` 或 `Questions` 且服务器时间早于原投票开始时间时可反复修改；到达开始时间即禁止修改，即使阶段迁移任务尚未运行也必须拒绝。仅 `CanDeveloperManage` 对应的特定开发权限可在投票开始后或历史阶段修订标题和正文，投票选项、时间、参与方式及已有票数保持不变。服务端须在同一事务内校验权限、原开始时间及 `ExpectedRevision`，防止并发覆盖或提交新时间绕过限制。匿名提议始终保持 `Consultation`；正式事务在投票开始前可调整参与方式。修改应写入审计日志，但公开响应继续隐藏真实账号。此规则仍需服务端实现并联调，前端预检只改善交互体验。

### `/Democracy/QueryContributions`

输入 `MatterID`、`Skip`、`Take`。返回按创建时间稳定排序的建议与质询，单页限制 `Take <= 100`。每项公开响应仅包含 `ID`、`AuthorAlias`、`AuthorPosition`、`Content` 和 `CreatedAt`；历史事务同样可读，但不提供写入口。

### `/Democracy/SubmitContribution`

输入 `MatterID`、`Content`、`ClientRequestID`。服务端核验事务可见性、当前阶段、账号状态、速率限制与幂等键，从认证账号关联的民主墙 profile 取得虚拟名，并根据当前权限与身份标签生成公开职位。客户端提交的虚拟名、职位、用户 ID 和时间字段一律忽略。响应返回与查询接口相同的公开 DTO。

### `/Democracy/ModeratePublisher`

输入 `MatterID`, `Revoked`, `Reason`。服务端从 MatterID 解析真实用户，禁止客户端传入目标 UserID。调用者必须具备 `DemocracyDeveloperAdmin`。响应返回独立的 `Revoked` 与合并账号状态后的 `CanPublish`，避免账号封禁状态覆盖民主墙发布权设置。

### `/Democracy/ModerateAccount`

输入 `MatterID`、`Action`（`Warn`、`Ban`、`Unban`）和 `Reason`。服务端先核验操作者的账号处置能力，再从事务私有字段解析目标实名账号。目标账号的认证标签与管理员身份不提供豁免。警告应生成实名通知；封禁与解封调用全站账号状态服务，并写入追加式审计记录。响应同时返回 `Banned` 与合并民主墙发布权设置后的 `CanPublish`。

### `/Democracy/DeleteMatter`

输入 `MatterID` 与 `Reason`。执行公开下架并阻止详情、评论和投票继续写入，同时保留私有原文、审计记录、举报记录和申诉所需证据。公开查询统一返回不可见响应，避免泄露删除原因或内部状态。

### `/Democracy/TracePublisher`

输入 `MatterID`, `Reason`。仅向 `DemocracyDeveloperAdmin` 返回真实 `UserID`、当前化名、主账号 `Banned`、民主墙独立状态 `PublishingRevoked` 和最终有效状态 `CanPublish`。禁止缓存响应；每次调用必须追加审计记录。

### `/Democracy/QueryAudit`

输入 `MatterID`。仅 `DemocracyDeveloperAdmin` 可读取。返回公开操作名、操作者展示名、理由和时间；来源 IP、安全摘要及内部账号标识保留在更高权限日志中。

### `/Democracy/QueryInvestigationTeam`

输入 `MatterID`。管理人员可读取待处理、已接受和已拒绝邀请；普通用户仅可读取已接受成员。响应包含 `InviteID`、公开昵称、状态与时间，不包含可关联账号的私有字段。管理界面的授权响应额外返回 `UserID`。

### `/Democracy/InviteInvestigator`

输入 `MatterID`、`UserID` 与 `Reason`。调用者必须具备 `DemocracyDeveloperAdmin`，事务必须为 `Oversight`。服务端创建 `Pending` 邀请、写入 `InviteInvestigator` 审计记录并向受邀账号发送实名通知；相同事务与受邀人的未处理邀请保持幂等。受邀人接受后方可获得该事务的调查团权限。

### 邀请通知与受邀人响应

创建邀请和写入通知发送队列必须在同一数据库事务内提交。通知经现有社区消息系统发给受邀账号，Fields 包含 `DemocracyEvent: InvestigationInvite`、`DemocracyMatterID`、`DemocracyInviteID`。消息中不携带发布者实名信息。前端将其定位到 `/d/matter/:id?invitation=:inviteId`，在详情展示接受或拒绝操作。

- `/Democracy/GetInvestigationInvite`：输入 `MatterID`、`InviteID`，仅受邀账号可以读取；返回 `ID`、`Status`、`CreatedAt`。其他账号统一返回不可访问，避免通过邀请 ID 推断身份。
- `/Democracy/RespondInvestigationInvite`：输入 `MatterID`、`InviteID`、`Decision`（`Accepted` 或 `Declined`）。账号身份从认证头取得，禁止客户端代指定。检查账号封禁、邀请有效性、事务可参与状态，并原子迁移 `Pending` 状态。
- 相同决定重复提交返回当前状态；相反决定返回 409；失效或已删除事务返回 410。接受后授予该事务范围内的调查团权限，拒绝不授予权限。
- 响应、成员权限写入、`RespondInvestigationInvite` 审计及给邀请人的结果通知必须原子提交；通知投递由可重试队列完成。结果通知用 `DemocracyEvent: InvestigationInviteResponded`、`DemocracyMatterID`，详情中管理人员可刷新成员状态。
- 全局只读模式由服务端一并执行；前端开关用于同步交互。历史事务不得接受新邀请或继续质询。

当前仓库实现前端调用、通知定位与本地演示响应；上述服务端事务、消息投递与真实账号授权需在社区服务端实现并联调。

### `/Democracy/ReportMatter`

输入 `MatterID`, `Category`, `Details`, `ClientRequestID`。登录用户可调用；服务端执行幂等、限流和可见性检查。举报人的账号信息不会进入事务公开响应或通知正文。

### `/Democracy/TransitionMatter`

输入 `MatterID`, `ExpectedStage`, `TargetStage`, `Reason`。使用乐观并发，非法迁移返回冲突。

### `/Democracy/CreateVote`

输入 `MatterID`, `ExpectedStage`, `Options`, `Multiple`, `FinishDate`, `Reason`。服务端先确认事务的 `Participation=Vote`，再从事务中取得上下文，在同一数据库事务中创建绑定投票并完成 `Questions -> Voting` 迁移，任一步失败都回滚。意见征集与匿名提议调用该接口时返回阶段或类型冲突。

该接口保留给 `DemocracyClerk` 手动处理特殊事务。发布者设置的 `VotePlan` 由服务端调度任务执行同等的原子创建与迁移；页面计时器仅负责及时刷新展示，不能承担状态迁移权威。

## 通知精确跳转

民主墙通知沿用现有消息系统，并在 `Message.Fields` 中提供：

- `DemocracyMatterID`：24 位事务 ID。
- `DemocracyStage`：通知生成时的事务阶段。
- `DemocracyEvent`：`QuestionReply`、`VotingOpened`、`VotingClosing`、`InvestigationInvite`、`Resolved`、`Archived`、`ReportHandled`。

`Voting` 通知进入详情投票页；`Resolved` 和 `Archived` 通知进入历史只读详情。通知字段、正文和模板不得包含真实发布者 ID。

## 治理与限流

- 匿名提议：每账号每 24 小时最多 3 次；失败请求不占额度。
- 建议收集与质询：沿用社区评论限流，并增加单事务突发限制。
- 举报：同一账号对同一事务保留一个待处理举报，可修改补充说明。
- 追溯身份：要求不少于 6 个字符的理由，禁止批量接口。
- 隐藏内容：仅 `DemocracyDeveloperAdmin` 可执行；必须填写理由并通知事务发起人。
- 所有写接口拒绝客户端传入操作者、发布者、阶段、审计时间或公开身份字段。

## 状态机

允许的迁移：

- `PendingReview -> Questions | Rejected`
- 投票事务：`Questions -> Voting | Rejected`
- 意见征集：`Questions -> Resolved | Rejected`
- `Voting -> Resolved`
- `Resolved -> Archived`

投票截止只关闭投票并公开票数或比例，不依据多数票、阈值或选项名称自动判定通过、否决或形成决议。`Voting -> Resolved` 必须由具备权限的人员确认并写入审计理由。

禁止跳级、回退和覆盖历史决议。条例修订应创建新事务，并引用受影响的旧决议。

## 上线验收

- 并发注册相同化名时只允许一个成功。
- 重放相同 `ClientRequestID` 不生成重复事务。
- 前端改角色、本地存储或请求体无法绕过权限。
- 普通用户无法从列表、详情、评论、通知、缓存和错误日志获得真实身份。
- 建议与质询只展示民主墙虚拟名和服务端生成的公开职位，伪造客户端身份字段不会改变响应。
- 追溯、禁发、恢复、阶段迁移均生成审计记录。
- 管理监察调查团邀请保持幂等，受邀人接受前不获得调查权限，邀请操作生成审计和实名通知。
- 删除事务执行公开下架并保留证据；账号警告、封禁、解封均产生审计和实名通知，目标认证身份不影响处置结果。
- 举报幂等、限流、处理通知和紧急隐藏流程通过验收。
- 投票创建与 `Questions -> Voting` 阶段迁移具备事务原子性。
- 原发布者可在质询阶段修改内容和投票计划；其他用户无法伪造发布者身份，投票开始后修改被拒绝。
- 匿名提议只能进入意见征集，篡改请求为 `Vote` 或携带 `VotePlan` 均无法创建投票。
- 发布者设置的 `StartAt` 到达后，即使没有用户打开页面，服务端也会自动创建并展示投票。
- 通知能精确进入质询、投票或历史只读详情，且不泄露真实身份。
- Chromium、Firefox、WebKit、移动端视口和 GitHub Pages 子目录部署全部通过。
- 灰度期间可从 `full` 回退到 `read-only` 或 `off`，公开历史记录保持可读。

## 开发专项权限与质询处置（2026-09 更新）

- 服务端通过 GetContext.Permissions.CanDeveloperManage 明确授权，默认 false。必须映射到单独授予的 DemocracyDeveloperAdmin 能力，普通管理员、认证编辑、开发者身份标签和 CanModerate/CanTransition 均不能自动代替该授权。禁用或封禁操作者应撤销此能力。
- 管理与审计界面仅对该能力开放。移除手动事务阶段选择、决议确认及手动创建投票；内容处置保留直接删除（带确认）。发布者设定的自动投票计划继续由服务端执行，历史事务状态仍由服务端管理。
- TracePublisher 和 TraceContribution 均带 Notify: false，默认不通知被追溯者。仅权限者获得真实账号，响应 Cache-Control: no-store；每次读取追加审计。禁用普通缓存、公共日志和通知中的实名泄露。
- ModerateAccount 增加 BanDays：Ban 操作必须为正整数，可自行填写任意可表示的天数；零、负数、小数和超出时间表示范围的值返回 422。服务端按当前 UTC 时间计算 BannedUntil，到期恢复，返回 Banned、BannedUntil、CanPublish。目标根据 MatterID 查找，不要求客户端先追溯，不接受客户端指定 UserID。目标身份不提供处置豁免。这里封禁社区主账号。
- TraceContribution 输入 MatterID、ContributionID、Reason、Notify: false，必须校验质询属于事务；只向权限者返回与 TracePublisher 相同的私有身份字段。
- ModerateContributionAuthor 输入 MatterID、ContributionID、Action、Reason、BanDays，服务端从质询作者关联定位主账号，其余行为与 ModerateAccount 一致。公开昵称、职位和客户端提交的 UserID 均不能作为定位依据。
- DiscloseContribution 是独立写操作，输入 MatterID、ContributionID、Reason，必须具备 CanDeveloperManage。界面先私密追溯，再二次确认披露；该接口也必须再次鉴权，不能将追溯自动升级为公开。服务器提交披露记录和审计后返回更新后的质询。
- 公开质询仅在主动披露成功后附加 Disclosure: { UserID, Reason, DisclosedAt }。默认完全省略此字段。只公开账号 ID 和披露理由、时间，不公开邮箱、IP、令牌或其他私有资料。服务端记录披露者、关联质询及依据；一般访客始终无法调用私密追溯接口。
- 前端不得通过自行调用社区消息接口给被追溯者发送通知；封禁相关通知按社区账号处置规则由服务端发送。
- 演示管理员使用 demo=1&admin=1；专项开发权限演示额外使用 developer=1。该参数仅开发环境有效，生产环境始终以服务端能力字段为准。
