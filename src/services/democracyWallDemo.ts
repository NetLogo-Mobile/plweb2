import type {
  Activity,
  ActivityStatus,
  Statistic,
  Summary,
  Sync,
} from '../pl-serve-type-main/type/main'

export const DEMOCRACY_DEMO_QUERY = 'demo=1'
const DEMO_VOTE_KEY = 'plweb2.democracy.demoVotes'
const DEMO_USER_ID = '66d10000000000000000a001'

interface DemoVoteState {
  counts: number[]
  gains: number[]
}

type DemoVoteStore = Record<string, DemoVoteState>

export interface DemocracyDemoDetail {
  id: string
  rule: string
  facts: string[]
  timeline: Array<{ date: string; text: string }>
  finding: string
  questions: string[]
}

interface DemoSummaryOptions {
  id: string
  subject: string
  description: string
  tags: string[]
  verification: Summary['User']['Verification']
  nickname: string
  comments: number
  visits: number
}

function createSummary(options: DemoSummaryOptions): Summary {
  const { id, subject, description, tags, verification, nickname, comments, visits } = options

  return {
    $type: 'Quantum.Models.Contents.Summary, Quantum Models',
    ID: id,
    Tags: ['民主墙', ...tags],
    Type: 0,
    User: {
      ID: DEMO_USER_ID,
      Nickname: nickname,
      Avatar: 0,
      AvatarRegion: 0,
      Signature: '',
      Decoration: 0,
      Verification: verification,
    },
    Image: 0,
    Price: 0,
    Stars: 0,
    Visits: visits,
    Remixes: 0,
    Subject: subject,
    Version: 1,
    Category: 'Discussion',
    Comments: comments,
    Language: 'Chinese',
    Supports: 0,
    Coauthors: [],
    Popularity: 0,
    UpdateDate: Date.now(),
    Visibility: 0,
    Description: [description],
    ImageRegion: 0,
    SortingDate: Date.now(),
    CreationDate: Date.now(),
    Multilingual: false,
  }
}

export const DEMOCRACY_DEMO_SUMMARIES: Summary[] = [
  createSummary({
    id: '66d100000000000000000001',
    subject: '关于公开指控处理流程的调查卷宗',
    description: '调查团已完成事实时间线、相关条例和当事人回应的初步整理，现向社区公开征集质询。',
    tags: ['公开卷宗', '待质询'],
    verification: 'Editor',
    nickname: '认证编辑·星观',
    comments: 23,
    visits: 386,
  }),
  createSummary({
    id: '66d100000000000000000002',
    subject: '提案：卷宗公开后设置 72 小时质询期',
    description: '建议统一卷宗公开后的质询时间，给当事人、调查团和社区留出明确的回应窗口。',
    tags: ['公共议案', '待讨论'],
    verification: 'Volunteer',
    nickname: '志愿者·枫岚',
    comments: 18,
    visits: 241,
  }),
  createSummary({
    id: '66d100000000000000000003',
    subject: '提案：调查团成员利益关系回避规则',
    description:
      '建议公开调查团成员与当事人的关系申明，并对同团、直接冲突与共同利益情形建立回避流程。',
    tags: ['社区议案', '匿名投票'],
    verification: 'Oldtimer',
    nickname: '老用户·潮汐',
    comments: 31,
    visits: 512,
  }),
  createSummary({
    id: '66d100000000000000000004',
    subject: '已决议：条例修订必须保留旧版本',
    description: '社区已通过决议：条例修订需保留原文、生效时间、修订理由和受影响的历史决议。',
    tags: ['公共议案', '已决议', '已归档', '精选'],
    verification: 'Administrator',
    nickname: '管理员·归档员',
    comments: 47,
    visits: 923,
  }),
  createSummary({
    id: '66d100000000000000000005',
    subject: '历史事务：社区公开记录保留规则',
    description: '该事务于 2025 年完成质询与决议，历史卷宗保留了规则原文、投票结果和后续修订记录。',
    tags: ['管理监察', '已决议', '已归档'],
    verification: 'Editor',
    nickname: '认证编辑·文档组',
    comments: 36,
    visits: 704,
  }),
  createSummary({
    id: '66d100000000000000000006',
    subject: '历史事务：志愿调查团回避办法试行记录',
    description: '试行期结束后，社区将回避申明、临时替补和异议处理流程归档，供后续管理监察引用。',
    tags: ['公开卷宗', '已决议', '已归档'],
    verification: 'Volunteer',
    nickname: '志愿者·记录员',
    comments: 29,
    visits: 618,
  }),
]

export const DEMOCRACY_DEMO_DETAILS: Record<string, DemocracyDemoDetail> = {
  '66d100000000000000000001': {
    id: '66d100000000000000000001',
    rule: '社区管理条例第 4.2 条：公开指控需有可核查的事实依据。',
    facts: [
      '8 月 24 日，用户发布一则公开质疑。',
      '管理员在 42 分钟后隐藏作品并发起初审。',
      '调查团已收集两份公开作品记录和一份脱敏日志。',
    ],
    timeline: [
      { date: '08-24 19:20', text: '公开质疑发布' },
      { date: '08-24 20:02', text: '管理员完成初审' },
      { date: '08-25 13:00', text: '临时调查团成立' },
      { date: '08-28 18:30', text: '卷宗摘要公开' },
    ],
    finding: '已确认事实部分成立，对行为性质的解释仍需结合条例版本接受质询。',
    questions: [
      '卷宗引用的条例版本是否在事件发生时已生效？',
      '隐藏期间是否保留了当事人补充证据的通道？',
    ],
  },
}

const DEMO_VOTES: Activity[] = [
  {
    Contents: [{ Chinese: '是否将卷宗公开后的标准质询期设为 72 小时？' } as never],
    FinishDate: '2026-09-30T23:59:59+08:00',
    ID: '66d10000000000000000b001',
    InterfaceModel: 'Vote-Single',
    InternalLink: '/p/Discussion/66d100000000000000000002',
    IsAttendance: false,
    IsDaily: false,
    IsDevelopment: true,
    IsTutorial: false,
    Items: [
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 62,
        Counters: {},
        Description: '同意 72 小时',
        Local: false,
      },
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 21,
        Counters: {},
        Description: '改为 48 小时',
        Local: false,
      },
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 9,
        Counters: {},
        Description: '维持弹性时间',
        Local: false,
      },
    ],
    Languages: [],
    Platforms: [],
    Priority: 1,
    StartDate: '2026-08-20T00:00:00+08:00',
    Subject: { Chinese: '卷宗质询期决议' } as never,
    TargetLink: {} as never,
    TargetText: {} as never,
    Version: 1,
  },
  {
    Contents: [{ Chinese: '调查团成员应当公开哪些回避声明？可选多项。' } as never],
    FinishDate: '2026-10-08T23:59:59+08:00',
    ID: '66d10000000000000000b002',
    InterfaceModel: 'Vote',
    InternalLink: '/p/Discussion/66d100000000000000000003',
    IsAttendance: false,
    IsDaily: false,
    IsDevelopment: true,
    IsTutorial: false,
    Items: [
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 48,
        Counters: {},
        Description: '同一调查团经历',
        Local: false,
      },
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 53,
        Counters: {},
        Description: '近期直接冲突',
        Local: false,
      },
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 37,
        Counters: {},
        Description: '共同作品或组织关系',
        Local: false,
      },
    ],
    Languages: [],
    Platforms: [],
    Priority: 2,
    StartDate: '2026-08-25T00:00:00+08:00',
    Subject: { Chinese: '调查团回避事项投票' } as never,
    TargetLink: {} as never,
    TargetText: {} as never,
    Version: 1,
  },
  {
    Contents: [{ Chinese: '是否通过条例修订版本，并保留所有历史版本供社区查阅？' } as never],
    FinishDate: '2026-08-15T23:59:59+08:00',
    ID: '66d10000000000000000b003',
    InterfaceModel: 'Vote-Single',
    InternalLink: '/p/Discussion/66d100000000000000000004',
    IsAttendance: false,
    IsDaily: false,
    IsDevelopment: true,
    IsTutorial: false,
    Items: [
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 126,
        Counters: {},
        Description: '通过修订',
        Local: false,
      },
      {
        Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
        Condition: '',
        Counter: 18,
        Counters: {},
        Description: '退回修改',
        Local: false,
      },
    ],
    Languages: [],
    Platforms: [],
    Priority: 3,
    StartDate: '2026-08-08T00:00:00+08:00',
    Subject: { Chinese: '条例版本保留决议结果' } as never,
    TargetLink: {} as never,
    TargetText: {} as never,
    Version: 1,
  },
]

export function isDemocracyDemoMode() {
  return import.meta.env.DEV && window.location.hash.includes(DEMOCRACY_DEMO_QUERY)
}

function readVoteStore(): DemoVoteStore {
  try {
    return JSON.parse(localStorage.getItem(DEMO_VOTE_KEY) || '{}') as DemoVoteStore
  } catch {
    return {}
  }
}

function buildDemoVotes(store = readVoteStore()) {
  return DEMO_VOTES.map((activity) => ({
    ...activity,
    Items: activity.Items.map((item, index) => ({
      ...item,
      Counter: item.Counter + (store[activity.ID]?.counts[index] ?? 0),
    })),
  }))
}

function buildDemoStatuses(store = readVoteStore()): ActivityStatus[] {
  return DEMO_VOTES.map((activity) => ({
    ActivityID: activity.ID,
    Avails:
      new Date(activity.FinishDate).getTime() <= Date.now()
        ? []
        : activity.Items.map((_, index) => index),
    Counters: activity.Items.map(() => 0),
    Expiration: activity.FinishDate,
    Finished: new Date(activity.FinishDate).getTime() <= Date.now(),
    Gains: store[activity.ID]?.gains ?? [],
    LastModified: new Date().toISOString(),
  }))
}

export function getDemocracyDemoSync(): Sync {
  const store = readVoteStore()
  const statuses = buildDemoStatuses(store)
  return {
    Activities: buildDemoVotes(store),
    Statistic: { ID: DEMO_USER_ID, Activities: statuses } as Statistic,
  }
}

export function castDemocracyDemoVote(activity: Activity, index: number): Sync {
  const store = readVoteStore()
  const current = store[activity.ID] ?? {
    counts: activity.Items.map(() => 0),
    gains: [],
  }
  const gains =
    activity.InterfaceModel === 'Vote-Single'
      ? [index]
      : Array.from(new Set([...current.gains, index]))
  const counts = [...current.counts]
  if (!current.gains.includes(index)) counts[index] = (counts[index] ?? 0) + 1
  store[activity.ID] = { counts, gains }
  localStorage.setItem(DEMO_VOTE_KEY, JSON.stringify(store))
  return getDemocracyDemoSync()
}

export function resetDemocracyDemoVotes() {
  localStorage.removeItem(DEMO_VOTE_KEY)
}
