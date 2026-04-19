/**
 * Completed (conservative): added enums/types and clarified several fields.
 * - 新增类型: MessageCategory, DisplayType, AppointType, RelationFlags
 * - 将若干 `unknown` 替换为更明确的类型并允许 null，若后续发现真实取值再进一步精化。
 */
/** 保守的枚举和类型补充（可依据后续发现再精化） */
export enum MessageCategories {
  System = 0,
  User = 1,
  Activity = 2,
  Other = 99,
}
export type MessageCategory = keyof typeof MessageCategories | number;
export type DisplayType =
  | "Followers"
  | "Following"
  | "Mutual"
  | "Blocked"
  | number;
export type AppointType = "Editor" | "Moderator" | "Teacher" | string;
export type RelationFlags = number;
/** 枚举 */
/** 需要导出的命名空间，命名空间导出前置于依赖 */
// export namespace Exports {
//   export { Enums, Enum, Unit, Entity, Serve }
// }
// export namespace Enums {
//   export { Categories, Verifications, Sorts, CommentSpecials, QuerySpecials, APIMessages }
// }
// /** 枚举值的类型 */
// export namespace Enum {
//   export type { Category, Verification, Sort, CommentSpecial, QuerySpecial, APIMessage }
// }
/** 部分上下文允许任意字符串 */
export type Language = keyof typeof Languages;
export enum Languages {
  Chinese = "Chinese",
  ChineseTraditional = "ChineseTraditional",
  English = "English",
  French = "French",
  German = "German",
  Italian = "Italian",
  Japanese = "Japanese",
  Polish = "Polish",
  Spanish = "Spanish",
  Ukrainian = "Ukrainian",
}
/** 在早期作品为null */
export type Category = keyof typeof Categories;
export enum Categories {
  User = "User",
  Experiment = "Experiment",
  Discussion = "Discussion",
  Model = "Model",
}
/** 普通用户为null */
export type Verification = keyof typeof Verifications;
export enum Verifications {
  Oldtimer = "Oldtimer",
  Volunteer = "Volunteer",
  Junior = "Junior",
  Emeritus = "Emeritus",
  Editor = "Editor",
  Administrator = "Administrator",
  /** plweb2 - added */
  Banned = "Banned",
  /** 仅存在于翻译文件中的身份 */
  Teacher = "Teacher",
}
/** TODO：不同环境（例如分区和服务器）枚举数字似乎不同 */
export type Sort = keyof typeof Sorts | number;
export enum Sorts {
  Default,
  Popularity,
  Random,
}
export type CommentSpecial = keyof typeof CommentSpecials;
export enum CommentSpecials {
  Reminder = "Reminder",
  Locked = "Locked",
}
/** 正常查询为null */
export type QuerySpecial = keyof typeof QuerySpecials;
export enum QuerySpecials {
  Favorite = "Favorite",
  Support = "Support",
  Star = "Star",
}
/** TODO: more tags */
/** plweb2 - edited */
export type SummaryTag = string;
export type Price = keyof typeof Prices;
export enum Prices {
  Gold = "Gold",
  Diamond = "Diamond",
}
export const APIRouterCategories = {
  Authenticate: "Users",
  Follow: "Users",
  GetRelations: "Users",
  GetUser: "Users",
  ModifyInformation: "Users",
  Rename: "Users",
  SyncActivities: "Users",
  Appoint: "Users",
  Ban: "Users",
  Block: "Users",
  Logout: "Users",
  ReceiveBonus: "Users",
  SetCover: "Users",
  Unban: "Users",
  GetDerivatives: "Contents",
  GetLibrary: "Contents",
  GetProfile: "Contents",
  GetWorkspace: "Contents",
  QueryExperiments: "Contents",
  SubmitExperiment: "Contents",
  ConfirmExperiment: "Contents",
  GetSummary: "Contents",
  MoveCategory: "Contents",
  StarContent: "Contents",
  GetComments: "Messages",
  GetMessages: "Messages",
  PostComment: "Messages",
  RemoveComment: "Messages",
  GetMessage: "Messages",
} as const;
export type APIRouterCategory = keyof typeof APIRouterCategories;
// TODO: 我更想知道对应的响应状态码
export type APIMessage = keyof typeof APIMessages | keyof typeof UnamedMessages;
export enum APIMessages {
  "Server.Exception" = "服务器发生错误，请稍候再试……",
  "Server.Offline" = "服务器遇到问题，联网功能可能无法使用。",
  "Nickname.Duplicated" = "您输入的名称已被使用，请重新选择。",
  "Input.Field.Illegal" = "您输入的内容不合法，请检查输入。",
  "Input.Field.Outof.Bound" = "您输入的内容长度超限，请检查输入。",
  "Network.Offline" = "网络断开，部分功能可能无法使用！",
  "Activity.Not.Started" = "活动还没有开始，请稍候再来。",
  "Activity.Already.Finished" = "活动已经结束了，下次记得参与～",
  "Activity.Bonus.Not.Available" = "您尚未达成获取奖励的条件。",
  "Activity.Bonus.Received" = "您已经领取到相关奖励了。",
  "Invitation.Handled" = "成功处理了邀请！",
  "Invitation.Already.Handled" = "邀请已经被处理过了。",
  "Login.Invalid" = "您输入的登录名或密码不正确。",
  "Login.Password.Invalid" = "您输入的密码不正确。",
  "Login.Expired" = "您的登录已经过期，现在切换为匿名用户。",
  "Client.Incompatible" = "客户端版本和服务器不兼容，请升级。",
  "IAP.Failed.1" = "您的设备上未启用应用内购功能！",
  "IAP.Failed.2" = "您主动取消了本次充值！",
  "IAP.Failed.3" = "您提交的购买标识符不合法，请重试……",
  "IAP.Failed.4" = "您的设备未被允许发起充值。",
  "IAP.Failed.5" = "充值项目在您所在的区域不可用。",
  "IAP.Failed.6" = "没有找到可供恢复的内购订单。",
  "IAP.Failed.7" = "正在等待商城服务准备就绪，请稍候……",
  "Demo.Version.Limited" = "您正处于演示版本中，部分功能无法使用！",
  "Receipt.Validation.Failed" = "未能验证您的内购订单，请与我们联系。",
  "Social.Validation.Failed" = "未能验证您的社交网络帐户，请重试。",
  "Social.Email.Banned" = "请更换一家邮件服务商。",
  "Social.Already.Binded" = "社交网络帐户已被绑定过了。",
  "Social.Blocked" = "你无法对目标用户进行操作。",
  "Upload.Illegal" = "待上传的内容不合要求，请重试。",
  "Upload.Cancelled" = "抱歉，暂时未能完成上传……",
  "User.Not.Allowed" = "你没有访问内容或执行操作的权限。",
  "User.Not.Found" = "未能找到您查找的用户！",
  "Report.Already" = "你已经上报过这项内容了。",
  "Report.Too.Frequent" = "为了避免滥用，每 {0} 分钟只能上报一次。",
  "Collaborator.Maximum" = "作品最多只能有 {0} 位合作者。",
  "Collaborator.Existed" = "你输入的用户已经是合作者之一了。",
  "Comment.Not.Allowed" = "这项内容不能被评论。",
  "Comment.Cannot.Remove" = "你无法隐藏这条回复。",
  "Comment.Maximum" = "你已经达到了作品的回复上限。",
  "Block.Not.Allowed" = "你不能屏蔽管理人员。",
  "Stopword.Blocked" = "你输入的内容中包含不适宜字句。",
  "Stopword.Blocked.Details" = "你输入的 {0} 中包含不适宜字句。",
  "Publish.Failed.1" = "请填写{0}的标题。",
  "Publish.Failed.2" = "请填写{0}的介绍内容。",
  "Publish.Failed.3" = "请选择至少一个标签。",
  "Publish.Failed.4" = "请选择正确的分类。",
  "Publish.Failed.5" = "{0}至少需要包含两个元件。",
  "Publish.Failed.6" = "请选择下列标签中的一个：{1}。",
  "Publish.Failed.7" = "请不要过于频繁地发布内容。",
  "Publish.Failed.8" = "您短时间内发布的作品过多，请暂时保存到本地，等待以后再发布。",
  "Content.Not.Found" = "指定实验已被删除或您无权查看！",
  "Redeem.Succeeded" = "您的奖励物品已成功兑换！",
  "Redeem.Failed" = "您输入的兑换码不存在或已被使用！",
  "Editing.Junior" = "作为见习编辑，你可以将实验归入正确的标签。",
  "Editing.Editor" = "作为认证编辑，你可以编辑实验内容，但最好征求对方的同意。",
  "Editing.Administrator" = "作为管理员，你可以编辑任何内容，但最好征求对方的同意。",
  "Switch.Region.China" = "你正在进行的操作需要切换到中文区。中文区由 Turtle Sim LLC 运营，按美国和伊利诺伊州法律法规的要求运作。",
  "Switch.Region.China.Migrate" = "你正在进行的操作需要切换到中文区，并且创建一个关联的帐号。如果你希望在中文区登录应用，需要重新绑定邮箱、手机或其他登录方式。中文区由 Turtle Sim LLC 运营，按美国和伊利诺伊州法律法规的要求运作。",
  "Switch.Region.US" = "你正在进行的操作需要切换到全球区。全球区由 Turtle Sim LLC 运营，按美国和伊利诺伊州法律法规的要求运作。",
  "Switch.Region.US.Migrate" = "你正在进行的操作需要切换到全球区，并且创建一个关联的帐号。如果你希望在全球区登录应用，需要重新绑定邮箱、手机或其他登录方式。全球区由 Turtle Sim LLC 运营，按美国和伊利诺伊州法律法规的要求运作。",
  "validation.too_often" = "验证邮件或短信已经发送，请稍候再试。",
  "validation.token_error" = "您输入的验证码不正确，请重试。",
  "user.save.duplicate_login" = "地址已被注册过了，请尝试登录。",
}
export enum UnamedMessages {
  "Input.Field.Missing",
  "Input.Field.Invalid",
}

// export namespace Unit {
//   export type { TypeTag, ID, int32, TimeStamp, float64, DateTime, ElementID }
// }

export type TypeTag = string;
/** 24位hex */
export type ID = string;
export type int32 = number;
/** 通常是在f64范围内的时间戳 */
export type TimeStamp = number;
/** 用于设备参数等不影响服务的部分 */
export type float64 = number;
export type DateTime = string;
/** Exam: 1;3;Ocean*/
export type ElementID = string;

/** 可能用到的实体 */
export interface User {
  /** 匿名发布的作品作者ID为空，特殊场景要用UserID字段 */
  ID: ID;
  /** 在评论等有自己的ID的实体中使用UserID替代ID字段 */
  UserID?: ID;
  Nickname: string;
  Avatar: int32;
  AvatarRegion: int32;
  /**
   * 不能超过20字符，实际上19字符就是上限了（可能为null）
   * @TODO: 检查是否可能出现空字符串
   * */
  Signature: string;
  /** （总是为零）2021年提出的徽章时不时会以字段的方式提醒我们还没实装 */
  Decoration: int32;
  Verification: Verification;
}
export interface Summary {
  /** plweb2 edited */
  $type: string;
  ID: ID;
  Tags: SummaryTag[];
  Type: int32;
  User: User;
  Image: int32;
  Price: int32;
  Stars: int32;
  Editor?: User;
  Visits: int32;
  ModelID?: ID;
  Remixes: int32;
  Subject?: string;
  Version: int32;
  Category?: Category;
  Comments: int32;
  Language: Language;
  ParentID?: string;
  /** plweb2 edited */
  Settings?:
    | Record<"Comment-Post" | "Comment-View", int32>
    | Record<string, never>;
  Supports: int32;
  Coauthors: User[];
  ContentID?: ID;
  ModelName?: string;
  ModelTags?: SummaryTag[];
  ParentName?: string;
  Popularity: int32;
  UpdateDate: TimeStamp;
  Visibility: int32;
  /** 查询作品不一定带有正文，但查询作品的评论（包括翻页）总是返回最新正文（然而评论区看不到正文，打开正文还要重新获取） */
  Description?: string[];
  ImageRegion: int32;
  SortingDate: TimeStamp;
  CreationDate: TimeStamp;
  Multilingual: boolean;
  ParentCategory?: Category;
  LocalizedSubject?: Record<string, string | null> | null;
  LocalizedDescription?: Record<string, string | null> | null;
}
export interface CommentCore {
  Content: string;
  Language: Language;
  TargetID: ID;
}
export interface CommentPost extends CommentCore {
  ID: ID;
  UserID: ID;
  Flag?: string[];
  ReplyID?: ID;
  Special: CommentSpecial;
  TargetType: Category;
}
export interface UserInComment {
  Nickname: string;
  UserID: ID;
  Verification: Verification;
  Avatar: int32;
}
export interface CommentResult extends CommentCore, UserInComment {
  Flags?: CommentSpecial[];
  /** 我也不知道已删除的评论该怎么看到 */
  Hidden: boolean;
  ID: ID;
  /** 这玩意总是空列表 */
  Replies?: never[];
  Timestamp: TimeStamp;
}
export type Comment = CommentResult;
export interface MessageTemplate {
  Action: unknown;
  AvailableFrom: TimeStamp;
  AvailableUntil: TimeStamp;
  Bonuses: Record<string, int32> | null;
  CategoryID: int32;
  CombineLimit: int32;
  Content: Record<Language, string | null>;
  Description: string | null;
  ID: ID;
  Identifier: string;
  Management: boolean;
  Push: int32;
  Subject: Record<Language, string | null>;
}
export interface UserInfo {
  Avatar: int32;
  AvatarRegion: int32;
  Decoration: int32;
  Diamond: int32;
  Experience: int32;
  Fragment: int32;
  Gold: int32;
  ID: ID;
  IsBinded: boolean;
  Level: int32;
  Nickname: string;
  Prestige: int32;
  Regions: int32[];
  Signature: string;
  Socials: Record<string, string>;
  Subscription: int32;
  SubscriptionUntil: DateTime;
  Verification: Verification;
}
export interface RelationList {
  Relation: int32;
  Statistic?: Statistic;
  User?: UserInfo;
  Backpack?: never;
  Bonuses?: never;
  TargetLink?: never;
  UserToken?: never;
}

export interface ActivityStatus {
  ActivityID: ID;
  Avails: unknown[];
  Counters: int32[];
  Expiration: DateTime;
  Finished: boolean;
  Gains: int32[];
  LastModified: DateTime;
}

export interface CoverAnon {
  Anonymous: boolean;
  Category: string;
  ID: ID;
  Image: int32;
  ImageRegion: int32;
  LocalizedSubject: Record<string, string | null> | null;
  Multilingual: boolean;
  Settings: Empty;
  Subject: string;
  User: UserVerify;
  Visibility: int32;
}
export type Empty = Record<string, never>;
export interface Statistic {
  Activities: ActivityStatus[];
  BannedUntil: DateTime;
  CommentCount: int32;
  Counters: Empty;
  Cover: CoverAnon;
  /** exam: 1012-0 */
  Experiment: string;
  ExperimentCount: int32;
  FirstPublished: DateTime;
  FollowerCount: int32;
  FollowingCount: int32;
  ID: ID;
  InteractionCount: int32;
  LastDeviceID: string;
  LastLanguage: Language;
  LastLogin: DateTime;
  LastTimezone: string;
  LastVersion: int32;
  LoginContinuity: int32;
  LoginCounter: int32;
  PushFrequency: int32;
  PushRecord: int32;
  PushTags: never[];
  /** exam: 0|Android */
  PushToken: string;
  Registration: DateTime;
  ResearchSurvey: never;
  RewardCount: int32;
  StarCount: int32;
  SupportCount: int32;
  SurveyCount: int32;
  Surveys: Empty;
  TermUntil: DateTime;
  UnreadLetters: int32;
  UnreadMessages: int32;
}
export type Lang10 = Record<Language, string>;

export interface ActivityItem {
  Bonuses: {
    Gold: int32;
    Experience: int32;
    Diamond: int32;
  };
  Condition: string;
  Counter: int32;
  Counters: Empty;
  Description: string | null;
  Local: boolean;
}
export interface Activity {
  Contents: Lang10[];
  FinishDate: DateTime;
  ID: ID;
  InterfaceModel: string;
  InternalLink: unknown;
  IsAttendance: boolean;
  IsDaily: boolean;
  IsDevelopment: boolean;
  IsTutorial: boolean;
  Items: ActivityItem[];
  Languages: string[];
  Platforms: string[];
  Priority: int32;
  StartDate: DateTime;
  Subject: Lang10;
  TargetLink: Lang10;
  TargetText: Lang10;
  Version: int32;
}
export interface Backpack {
  ID: ID;
  Inventories: Record<string, never>;
  Trials: Record<string, DateTime>;
  Purchases: Record<string, { PurchaseDate: DateTime }>;
}

export interface ContentTag {
  Available: boolean;
  Conflicts: string[];
  Flags: string[];
  ID: ID;
  Identifier: string;
  ModeratorTips: string | null;
  Subject: Lang10;
  Tips: string | null;
}

export interface ChargePrice {
  Description: string | null;
  Diamonds: int32;
  DisplayName: string | null;
  ExtraDiamonds: Empty;
  ID: ID;
  Identifier: string;
  SubscriptionType: int32;
}
export interface ObjectPrice {
  ID: ID;
  Identifier: ElementID;
  Price1: Price;
  Amount1: int32;
  Duration1: int32;
  Original1: int32;
  Price2: Price;
  Amount2: int32;
  Original2: int32;
  Duration2: int32;
  FragmentAmount: int32;
  IsLimitedFree: boolean;
}
export interface Sync {
  Activities?: Activity[];
  Backpack?: Backpack;
  Blacklist?: ID[];
  Bonuses?: never;
  ChargePrices?: ChargePrice[];
  ContentTags?: ContentTag[];
  Dependency?: string;
  DeviceToken?: string;
  Features?: Summary[];
  Library?: Library;
  Localizations?: never;
  LogSetting?: never;
  ObjectPrices?: ObjectPrice[];
  Password?: string;
  Relation?: int32;
  Statistic?: Statistic;
  Surveys?: never[];
  TargetLink?: never;
  User?: UserInfo;
  UserToken?: {
    Email: string;
    Mobile: never;
  };
}
/** TODO: 其实有部分字段是必须的 */
export interface Device {
  CPU?: string;
  GPU?: string;
  GraphicMemory?: int32;
  ID?: string;
  Identifier?: string;
  Language?: string;
  Model?: string;
  Platform?: string;
  ScreenDPI?: float64;
  ScreenHeight?: float64;
  ScreenSize?: float64;
  ScreenWidth?: float64;
  System?: string;
  SystemMemory?: int32;
  Timezone?: string;
}
export interface Block {
  $type?: TypeTag;
  DefaultLink: string | null;
  DefaultText: string | null;
  FetchAmount: int32;
  FetchConfiguration: Record<string, unknown> | null;
  FetchSource: string;
  Header: string;
  Locations: unknown;
  Permission: unknown;
  Summaries: Summary[];
  TargetLink: string;
  Type: int32;
}
export interface ListBlock extends Block {
  $type: "Quantum.Models.Contents.ListBlock, Quantum Models";
}
export interface TopicBlock extends Block {
  $type: "Quantum.Models.Contents.TopicBlock, Quantum Models";
  Subject: string;
  Background: string;
  ContentTags: string;
  AuxiliaryImage: string;
  AuxiliaryText: string;
  AuxiliaryLink: string;
  AuxiliaryTarget: unknown;
}
export interface ExperimentQuery {
  /** 留空并不能找到Category为null的作品 */
  Category?: Category | null;
  Sort?: Sort;
  Languages: Language[];
  ExcludeLanguages?: Language[];
  ExcludeTags?: string[];
  ModelTags?: SummaryTag[];
  ModelID?: ID;
  Special?: QuerySpecial | null;
  ParentID?: ID;
  /** 也可以是Nickname */
  UserID?: ID;
  Days?: int32;
  Tags: string[];
  Take: int32;
  /** TODO: 大部分查询条件不能用From */
  From?: ID;
  /** 上限24，但负值取正最多101 */
  Skip?: int32;
  ShowAnnouncement?: boolean;
}
export interface Library {
  ID: ID;
  Identifier: "Homepage";
  IsDevelopment: boolean;
  IsNavigation: boolean;
  Language: "Chinese";
  Subject?: unknown;
  Blocks: [TopicBlock, TopicBlock, ...ListBlock[]];
}
export type Homepage = Library;
export interface ContentSubmitSummary extends Summary {
  Anonymous?: boolean;
}
/** 可以在本地存档里用 */
export interface UserVerify {
  Avatar?: int32;
  AvatarRegion?: int32;
  Decoration?: int32;
  ID?: ID;
  IsAdministrator?: boolean;
  IsBanned?: boolean;
  IsEditor?: boolean;
  IsJunior?: boolean;
  IsOldtimer?: boolean;
  IsVolunteer?: boolean;
  Nickname?: string;
  Signature?: string;
  Verification?: string;
}
export interface SubmitExperiment {
  AliyunToken: unknown;
  Backpack: unknown;
  Bonuses: unknown;
  Relation: int32;
  Statistic: unknown;
  Summary: Summary;
  TargetLink: unknown;
  Token: SubmitToken;
  User: UserInfo;
  UserToken: unknown;
}
export interface SubmitToken {
  AccessKey: string | null;
  Authorization: string;
  Policy: string;
  RequestHost: string | null;
  RequestURI: string;
}

export interface Workspace {
  ID?: ID;
  LocalizationID: ID;
  Localizations: string;
  MachineTranslated: unknown[];
  ModelCode: string;
  TutorialCode: string;
  Workspace: string;
}
export interface Derivatives {
  Experiments: Empty;
  Model: Summary;
  Parent: unknown;
  Summary: Summary;
  Supporters: unknown;
  Survey: unknown;
}

export interface Message {
  CategoryID: int32;
  Fields: {
    CommentID: ID;
    Content: string;
    Discussion: string;
    DiscussionID: ID;
    // plweb2 - edited
    Experiment: string;
    ExperimentID: ID;
    TargetName: string;
    Until:string;
    // plweb2 - edited
    User: string;
    // plweb2 - edited
    UserID: ID;
    Editor: string;
  };
  Handled: int32;
  ID: ID;
  // plweb2 - edited
  Numbers: Record<string, int32>;
  TargetID: ID;
  TemplateID: ID;
  Timestamp: TimeStamp;
  TimestampInitial: TimeStamp;
  Unread: int32;
  UserAvatar: int32;
  UserNames: string[];
  Users: ID[];
}

// export namespace Serve {
//   export type { Param, Result, ResultOf, ParamOf, Server, Contents, Users, Messages }
// }
export type Param<T> = T;
// API Data 包装：允许对象附带 $type 字段，也允许为 null（错误或无数据时）
export type APIData<T> =
  | (T extends object ? T & { $type?: TypeTag } : T)
  | null;
// TODO 整理和测试异常的Result，似乎不是所有异常都是Data:null
export interface Result<
  Data = unknown,
  Message extends APIMessage | "" = APIMessage | "",
  Status extends int32 = int32,
> {
  Data: APIData<Data>;
  Status: Status;
  Message: Message;
  Token?: string;
  AuthCode?: string;
}
export type ResultOf<T> = T extends (q: Param<any>) => Promise<infer R>
  ? R
  : never;
export type ParamOf<T> = T extends (q: Param<infer P>) => Promise<any>
  ? P
  : never;
export interface Server extends Contents, Users, Messages {
  Homepage(): Promise<Result<Homepage>>;
  Route(query: Param<unknown>): Promise<Result>;

  // Example?(q: Param<unknown>): Promise<Result<unknown>>
}
export interface Contents {
  // Contents VisitExperiment,SelectExperiment,AcknowledgeExperiment,
  // RemoveExperiment,RestoreExperiment,InviteCoauthor,RemoveCoauthor
  QueryExperiments(
    q: Param<{ Query: ExperimentQuery }>,
  ): Promise<Result<{ $values: Summary[] }>>;
  GetWorkspace(
    q: Param<{ ContentID: ID; Language: string }>,
  ): Promise<Result<Workspace>>;
  GetLibrary(
    q: Param<{ Identifier: string; Language: string }>,
  ): Promise<Result<Library>>;
  SubmitExperiment(
    q: Param<{
      Request: { Extension: string; FileSize: int32 };
      Summary: ContentSubmitSummary;
    }>,
  ): Promise<Result<SubmitExperiment>>;
  GetDerivatives(
    q: Param<{
      Category: string;
      ContentID: ID;
      Language: string;
      WithSummary: boolean;
    }>,
  ): Promise<Result<Derivatives>>;
  GetProfile(
    q: Param<{ ID: ID }>,
  ): Promise<Result<{ Experiments: Record<string, Summary[]>; Survey: unknown }>>;
  ConfirmExperiment(
    q: Param<{
      Category: string;
      Extension: string;
      Image: int32;
      SummaryID: ID;
    }>,
  ): Promise<Result<Summary>>;
  GetSummary(
    q: Param<{ Category: string; ContentID: ID }>,
  ): Promise<Result<Summary>>;
  MoveCategory(
    q: Param<{ Category: string; SummaryID: ID; Target: string }>,
  ): Promise<Result<Summary>>;
  StarContent(
    q: Param<{ Category: string; ContentID: ID; Status: boolean; Type: int32 }>,
  ): Promise<Result<RelationList>>;
}
export interface Users {
  // Users Report(cat,id),UpdateAvatar(img),SwitchRegion(Region, Transfer)
  Authenticate(
    q: Param<{
      Device: Device;
      Login?: string;
      Password?: string;
      Statistic: Statistic;
      Version: int32;
    }>,
  ): Promise<Result<Sync>>;
  SyncActivities(
    q: Param<{ ContentID: ID; Language: string }>,
  ): Promise<Result<Sync>>;
  GetUser(q: Param<{ ID: ID }>): Promise<Result<RelationList>>;
  // Education,Identity
  ModifyInformation(
    q: Param<{ Field: string; Target: string }>,
  ): Promise<Result<RelationList>>;
  Rename(
    q: Param<{ Target: string; UserID: ID }>,
  ): Promise<Result<RelationList>>;
  Follow(q: Param<{ Action: int32; TargetID: ID }>): Promise<Result<boolean>>;
  GetRelations(
    q: Param<{
      DisplayType: int32;
      Query: string;
      Skip: int32;
      Take: int32;
      UserID: ID;
    }>,
  ): Promise<Result<{ $values: RelationList[] }>>;
  Appoint(
    q: Param<{ Length: int32; Reason: string; TargetID: ID; Type: string }>,
  ): Promise<Result<string>>;
  Ban(
    q: Param<{ Length: int32; Reason: string; TargetID: ID }>,
  ): Promise<Result<string>>;
  Block(q: Param<{ Action: int32; TargetID: ID }>): Promise<Result<boolean>>;
  Logout(q: Param<{ PushToken?: never }>): Promise<Result<string>>;
  ReceiveBonus(
    q: Param<{ ActivityID: ID; Index: int32; Statistic: Statistic }>,
  ): Promise<Result<Sync>>;
  SetCover(
    q: Param<{ Category: string; ContentID: ID }>,
  ): Promise<Result<RelationList>>;
  Unban(q: Param<{ Reason: string; TargetID: ID }>): Promise<Result<string>>;
}
export interface Messages {
  // HandleInvitation(id,bool)
  RemoveComment(
    q: Param<{ CommentID: ID; TargetType: Category }>,
  ): Promise<Result<string>>;
  GetComments(
    q: Param<{
      CommentID?: ID;
      Skip?: int32;
      Take: int32;
      TargetID: ID;
      TargetType: Category;
    }>,
  ): Promise<
    Result<{ Comments: CommentResult[]; Count: int32; Target?: UserInfo }>
  >;
  PostComment(q: Param<CommentPost>): Promise<Result<CommentResult>>;
  GetMessage(q: Param<{ MessageID: ID }>): Promise<Result<RelationList>>;
  GetMessages(
    q: Param<{
      CategoryID: int32;
      NoTemplates: boolean;
      Skip: int32;
      Take: int32;
    }>,
  ): Promise<Result<{ Messages: Message[]; Templates: MessageTemplate[] }>>;
}
