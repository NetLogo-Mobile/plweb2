import type {
  Activity,
  ActivityStatus,
  ContentSubmitSummary,
  Statistic,
  Summary,
  Sync,
} from '../pl-serve-type-main/type/main'
import type {
  DemocracyAccountAction,
  DemocracyAuditEntry,
  DemocracyContribution,
  DemocracyInvestigationInvite,
  DemocracyMatterParticipation,
  DemocracyMatterStage,
  DemocracyReportCategory,
  DemocracyVotePlan,
} from './democracyWallContract'
import { democracyTransitionTargets } from './democracyMatterState'
import { validateDemocracyBanDays } from './democracyModerationRules'

export const DEMOCRACY_DEMO_QUERY = 'demo=1'
export const DEMOCRACY_DEMO_ADMIN_QUERY = 'admin=1'
const DEMO_VOTE_KEY = 'plweb2.democracy.demoVotes'
const DEMO_MATTER_KEY = 'plweb2.democracy.demoMatters'
const DEMO_ANONYMOUS_PROFILE_KEY = 'plweb2.democracy.demoAnonymousProfiles'
const DEMO_ANONYMOUS_TRACE_KEY = 'plweb2.democracy.demoAnonymousTrace'
const DEMO_ADMIN_STATE_KEY = 'plweb2.democracy.demoAdminState'
const DEMO_CUSTOM_VOTES_KEY = 'plweb2.democracy.demoCustomVotes'
const DEMO_VOTE_PLANS_KEY = 'plweb2.democracy.demoVotePlans'
const DEMO_USER_ID = '66d10000000000000000a001'
const DEMO_CONTRIBUTION_AUTHORS: Record<string, string> = {
  '66d100000000000000000001:demo-contribution-001': '66d10000000000000000a002',
  '66d100000000000000000001:demo-contribution-002': DEMO_USER_ID,
}
const DEFAULT_DEMO_ANONYMOUS_ALIAS = '潮汐观察员'

export interface DemocracyDemoAnonymousProfile {
  alias: string
  revoked: boolean
  userId: string
}

export interface DemocracyDemoAnonymousAudit {
  alias: string
  revoked: boolean
  userId: string
}

type DemoAnonymousProfileStore = Record<string, DemocracyDemoAnonymousProfile>
type DemoAnonymousTraceStore = Record<string, string>
type DemoVotePlanStore = Record<string, DemocracyVotePlan>

interface DemoAdminState {
  bannedUntil: Record<string, string>
  contributionAuthors: Record<string, string>
  disclosures: Record<string, NonNullable<DemocracyContribution['Disclosure']>>
  audit: Record<string, DemocracyAuditEntry[]>
  bannedAccounts: Record<string, boolean>
  deletedMatters: string[]
  investigationTeams: Record<string, DemocracyInvestigationInvite[]>
  reports: Record<
    string,
    Array<{ category: DemocracyReportCategory; createdAt: string; details: string }>
  >
  stages: Record<string, DemocracyMatterStage>
}

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
  questions: DemocracyContribution[]
}

interface DemoSummaryOptions {
  anonymous?: boolean
  id: string
  subject: string
  description: string
  tags: string[]
  verification: Summary['User']['Verification']
  nickname: string
  comments: number
  visits: number
}

function createSummary(options: DemoSummaryOptions): ContentSubmitSummary {
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
    Anonymous: options.anonymous,
  }
}

const DEMOCRACY_DEMO_SUMMARIES: Summary[] = [
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
    tags: ['公共议案', '匿名投票'],
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
  createSummary({
    id: '66d100000000000000000007',
    subject: '提议回复：公开调查团成员替补流程',
    description: '管理组已回复匿名提议，并公布调查团成员退出后的替补顺序与公开记录要求。',
    tags: ['匿名提议', '提议回复', '公共议案', '已决议', '已归档'],
    verification: 'Administrator',
    nickname: '管理员·议事回复',
    comments: 12,
    visits: 206,
  }),
]

function readMatterStore(): Summary[] {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_MATTER_KEY) || '[]')
    return Array.isArray(value) ? (value as Summary[]) : []
  } catch {
    return []
  }
}

function readAnonymousProfiles(): DemoAnonymousProfileStore {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_ANONYMOUS_PROFILE_KEY) || '{}')
    return value && typeof value === 'object' ? (value as DemoAnonymousProfileStore) : {}
  } catch {
    return {}
  }
}

function writeAnonymousProfiles(profiles: DemoAnonymousProfileStore) {
  localStorage.setItem(DEMO_ANONYMOUS_PROFILE_KEY, JSON.stringify(profiles))
}

function readAnonymousTrace(): DemoAnonymousTraceStore {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_ANONYMOUS_TRACE_KEY) || '{}')
    return value && typeof value === 'object' ? (value as DemoAnonymousTraceStore) : {}
  } catch {
    return {}
  }
}

function readAdminState(): DemoAdminState {
  try {
    const value = JSON.parse(
      localStorage.getItem(DEMO_ADMIN_STATE_KEY) || '{}',
    ) as Partial<DemoAdminState>
    return {
      audit: value.audit ?? {},
      bannedUntil: value.bannedUntil ?? {},
      contributionAuthors: value.contributionAuthors ?? {},
      disclosures: value.disclosures ?? {},
      bannedAccounts: value.bannedAccounts ?? {},
      deletedMatters: value.deletedMatters ?? [],
      investigationTeams: value.investigationTeams ?? {},
      reports: value.reports ?? {},
      stages: value.stages ?? {},
    }
  } catch {
    return {
      audit: {},
      bannedUntil: {},
      contributionAuthors: {},
      disclosures: {},
      bannedAccounts: {},
      deletedMatters: [],
      investigationTeams: {},
      reports: {},
      stages: {},
    }
  }
}

function writeAdminState(state: DemoAdminState) {
  localStorage.setItem(DEMO_ADMIN_STATE_KEY, JSON.stringify(state))
}

function readVotePlans(): DemoVotePlanStore {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_VOTE_PLANS_KEY) || '{}')
    return value && typeof value === 'object' ? (value as DemoVotePlanStore) : {}
  } catch {
    return {}
  }
}

function writeVotePlans(plans: DemoVotePlanStore) {
  localStorage.setItem(DEMO_VOTE_PLANS_KEY, JSON.stringify(plans))
}

function appendDemoAudit(matterId: string, action: DemocracyAuditEntry['Action'], details: string) {
  const state = readAdminState()
  const entry: DemocracyAuditEntry = {
    Action: action,
    ActorAlias: '演示管理人员',
    CreatedAt: new Date().toISOString(),
    Details: details,
    ID: crypto.randomUUID(),
  }
  state.audit[matterId] = [entry, ...(state.audit[matterId] ?? [])]
  writeAdminState(state)
  return entry
}

function inferDemoStage(summary: Summary): DemocracyMatterStage {
  const tags = summary.Tags ?? []
  if (tags.includes('已归档')) return 'Archived'
  if (tags.includes('已决议')) return 'Resolved'
  if (tags.includes('匿名投票')) return 'Voting'
  if (tags.includes('待审核')) return 'PendingReview'
  return 'Questions'
}

function applyDemoStage(summary: Summary): Summary {
  const stage = readAdminState().stages[summary.ID]
  if (!stage) return summary
  const stageTags: Record<DemocracyMatterStage, string[]> = {
    Archived: ['已决议', '已归档'],
    PendingReview: ['待审核'],
    Questions: ['待质询'],
    Rejected: ['已驳回'],
    Resolved: ['已决议'],
    Voting: ['匿名投票'],
  }
  const reserved = new Set(['待审核', '待质询', '匿名投票', '已决议', '已归档', '已驳回'])
  return {
    ...summary,
    Tags: [...(summary.Tags ?? []).filter((tag) => !reserved.has(tag)), ...stageTags[stage]],
  }
}

function applyDemoParticipation(summary: Summary): Summary {
  const participationTag =
    getDemocracyDemoMatterParticipation(summary.ID) === 'Vote' ? '投票事务' : '意见征集'
  return {
    ...summary,
    Tags: [
      ...(summary.Tags ?? []).filter((tag) => tag !== '意见征集' && tag !== '投票事务'),
      participationTag,
    ],
  }
}

export function getDemocracyDemoAnonymousProfile(userId = DEMO_USER_ID) {
  return (
    readAnonymousProfiles()[userId] ?? {
      alias: DEFAULT_DEMO_ANONYMOUS_ALIAS,
      revoked: false,
      userId,
    }
  )
}

export function updateDemocracyDemoAnonymousAlias(alias: string, userId = DEMO_USER_ID) {
  const normalizedAlias = alias.trim()
  if (normalizedAlias.length < 2 || normalizedAlias.length > 16) throw new Error('invalid-alias')

  const profiles = readAnonymousProfiles()
  const duplicate = Object.values(profiles).some(
    (profile) =>
      profile.userId !== userId &&
      profile.alias.toLocaleLowerCase() === normalizedAlias.toLocaleLowerCase(),
  )
  if (duplicate) throw new Error('duplicate-alias')

  const profile = {
    ...getDemocracyDemoAnonymousProfile(userId),
    alias: normalizedAlias,
    userId,
  }
  profiles[userId] = profile
  writeAnonymousProfiles(profiles)

  const trace = readAnonymousTrace()
  const matters = readMatterStore()
  let changed = false
  for (const matter of matters) {
    if (trace[matter.ID] !== userId) continue
    matter.User.Nickname = normalizedAlias
    changed = true
  }
  if (changed) localStorage.setItem(DEMO_MATTER_KEY, JSON.stringify(matters))
  return profile
}

export function isDemocracyDemoAnonymousPostingRevoked(userId = DEMO_USER_ID) {
  return getDemocracyDemoAnonymousProfile(userId).revoked || isDemoAccountBanned(userId)
}

export function isDemocracyDemoDeveloperMode() {
  return (
    isDemocracyDemoMode() &&
    new URLSearchParams(window.location.hash.split('?')[1]).get('developer') === '1'
  )
}

function isDemoAccountBanned(userId: string) {
  const state = readAdminState()
  return state.bannedUntil[userId]
    ? new Date(state.bannedUntil[userId]).getTime() > Date.now()
    : !!state.bannedAccounts[userId]
}

export function setDemocracyDemoAnonymousPostingRevoked(userId: string, revoked: boolean) {
  const profiles = readAnonymousProfiles()
  profiles[userId] = {
    ...getDemocracyDemoAnonymousProfile(userId),
    revoked,
    userId,
  }
  writeAnonymousProfiles(profiles)
  return profiles[userId]
}

export function traceDemocracyDemoPublisher(matterId: string, reason: string) {
  const summary = getDemocracyDemoSummaries().find((item) => item.ID === matterId)
  if (!summary) throw new Error('matter-not-found')
  const userId = readAnonymousTrace()[matterId] || DEMO_USER_ID
  const profile = getDemocracyDemoAnonymousProfile(userId)
  appendDemoAudit(matterId, 'TracePublisher', reason)
  return {
    Alias: profile.alias,
    Banned: isDemoAccountBanned(userId),
    BannedUntil: readAdminState().bannedUntil[userId],
    CanPublish: !isDemocracyDemoAnonymousPostingRevoked(userId),
    PublishingRevoked: profile.revoked,
    UserID: userId,
  }
}

export function moderateDemocracyDemoAccount(
  matterId: string,
  action: DemocracyAccountAction,
  reason: string,
  banDays?: number,
) {
  const userId = readAnonymousTrace()[matterId] || DEMO_USER_ID
  return moderateDemoAccountById(matterId, userId, action, reason, banDays)
}

function moderateDemoAccountById(
  matterId: string,
  userId: string,
  action: DemocracyAccountAction,
  reason: string,
  banDays?: number,
) {
  const state = readAdminState()
  if (action === 'Ban') {
    validateDemocracyBanDays(banDays)
    state.bannedUntil[userId] = new Date(Date.now() + banDays * 86_400_000).toISOString()
  }
  if (action === 'Unban') {
    state.bannedAccounts[userId] = false
    delete state.bannedUntil[userId]
  }
  writeAdminState(state)
  const auditAction =
    action === 'Warn' ? 'WarnAccount' : action === 'Ban' ? 'BanAccount' : 'UnbanAccount'
  appendDemoAudit(
    matterId,
    auditAction,
    `${userId}: ${reason}${action === 'Ban' ? ` (${banDays} days)` : ''}`,
  )
  return {
    Banned: isDemoAccountBanned(userId),
    BannedUntil: readAdminState().bannedUntil[userId],
    CanPublish: !isDemocracyDemoAnonymousPostingRevoked(userId),
  }
}

export function deleteDemocracyDemoMatter(matterId: string, reason: string) {
  const summaries = [...readMatterStore(), ...DEMOCRACY_DEMO_SUMMARIES]
  if (!summaries.some((matter) => matter.ID === matterId)) throw new Error('matter-not-found')
  const state = readAdminState()
  state.deletedMatters = Array.from(new Set([...state.deletedMatters, matterId]))
  writeAdminState(state)
  appendDemoAudit(matterId, 'DeleteMatter', reason)
  return { Deleted: true }
}

export function moderateDemocracyDemoPublisher(matterId: string, revoked: boolean, reason: string) {
  const userId = readAnonymousTrace()[matterId] || DEMO_USER_ID
  setDemocracyDemoAnonymousPostingRevoked(userId, revoked)
  appendDemoAudit(matterId, revoked ? 'RevokePublisher' : 'RestorePublisher', reason)
  return {
    CanPublish: !isDemocracyDemoAnonymousPostingRevoked(userId),
    Revoked: revoked,
  }
}

export function getDemocracyDemoMatterStage(matterId: string): DemocracyMatterStage {
  const summary = getDemocracyDemoSummaries().find((item) => item.ID === matterId)
  if (!summary) throw new Error('matter-not-found')
  return readAdminState().stages[matterId] ?? inferDemoStage(summary)
}

export function getDemocracyDemoMatterParticipation(
  matterId: string,
): DemocracyMatterParticipation {
  if (readVotePlans()[matterId]) return 'Vote'
  const summary = [...readMatterStore(), ...DEMOCRACY_DEMO_SUMMARIES].find(
    (item) => item.ID === matterId,
  )
  const tags = summary?.Tags ?? []
  if (tags.includes('投票事务') || tags.includes('匿名投票')) return 'Vote'
  if (
    matterId === '66d100000000000000000002' ||
    matterId === '66d100000000000000000003' ||
    matterId === '66d100000000000000000004'
  ) {
    return 'Vote'
  }
  return 'Consultation'
}

export function transitionDemocracyDemoMatter(
  matterId: string,
  expectedStage: DemocracyMatterStage,
  targetStage: DemocracyMatterStage,
  reason: string,
) {
  const current = getDemocracyDemoMatterStage(matterId)
  if (current !== expectedStage) throw new Error('stage-conflict')
  const participation = getDemocracyDemoMatterParticipation(matterId)
  if (!democracyTransitionTargets(current, participation).includes(targetStage)) {
    throw new Error('invalid-transition')
  }
  const state = readAdminState()
  state.stages[matterId] = targetStage
  writeAdminState(state)
  appendDemoAudit(matterId, 'Transition', `${current} → ${targetStage}：${reason}`)
  return getDemocracyDemoSummaries().find((item) => item.ID === matterId)
}

export function getDemocracyDemoAudit(matterId: string) {
  return readAdminState().audit[matterId] ?? []
}

export function getDemocracyDemoInvestigationTeam(matterId: string) {
  return readAdminState().investigationTeams[matterId] ?? []
}

export function getDemocracyDemoInvitation(matterId: string, inviteId: string) {
  const invite = getDemocracyDemoInvestigationTeam(matterId).find((item) => item.ID === inviteId)
  if (!invite || invite.UserID !== DEMO_USER_ID) throw new Error('invitation-unavailable')
  return { ID: invite.ID, Status: invite.Status, CreatedAt: invite.CreatedAt }
}

export function respondDemocracyDemoInvitation(
  matterId: string,
  inviteId: string,
  decision: 'Accepted' | 'Declined',
) {
  const invite = getDemocracyDemoInvitation(matterId, inviteId)
  if (invite.Status === decision) return invite
  if (invite.Status !== 'Pending') throw new Error('invitation-already-answered')
  if (isDemocracyDemoAnonymousPostingRevoked()) throw new Error('permission-denied')
  const state = readAdminState()
  state.investigationTeams[matterId] = (state.investigationTeams[matterId] ?? []).map((item) =>
    item.ID === inviteId ? { ...item, Status: decision } : item,
  )
  writeAdminState(state)
  appendDemoAudit(matterId, 'RespondInvestigationInvite', `${inviteId}: ${decision}`)
  return { ...invite, Status: decision }
}

export function inviteDemocracyDemoInvestigator(matterId: string, userId: string, reason: string) {
  const matter = getDemocracyDemoSummaries().find((item) => item.ID === matterId)
  if (!matter) throw new Error('matter-not-found')
  if (!(matter.Tags ?? []).includes('管理监察')) throw new Error('matter-kind-invalid')

  const state = readAdminState()
  const existing = (state.investigationTeams[matterId] ?? []).find(
    (entry) => entry.UserID === userId && entry.Status !== 'Declined',
  )
  if (existing) return existing

  const invitation: DemocracyInvestigationInvite = {
    CreatedAt: new Date().toISOString(),
    ID: crypto.randomUUID(),
    Nickname: `受邀用户·${userId.slice(-4)}`,
    Status: 'Pending',
    UserID: userId,
  }
  state.investigationTeams[matterId] = [invitation, ...(state.investigationTeams[matterId] ?? [])]
  writeAdminState(state)
  appendDemoAudit(matterId, 'InviteInvestigator', `${invitation.Nickname}（${userId}）：${reason}`)
  return invitation
}

export function reportDemocracyDemoMatter(
  matterId: string,
  category: DemocracyReportCategory,
  details: string,
) {
  const state = readAdminState()
  state.reports[matterId] = [
    ...(state.reports[matterId] ?? []),
    { category, createdAt: new Date().toISOString(), details },
  ]
  writeAdminState(state)
  appendDemoAudit(matterId, 'Report', `${category}：${details}`)
  return { Accepted: true }
}

export function getDemocracyDemoAnonymousAudit(
  matterId: string,
): DemocracyDemoAnonymousAudit | undefined {
  const userId = readAnonymousTrace()[matterId]
  if (!userId) return undefined
  const profile = getDemocracyDemoAnonymousProfile(userId)
  return { alias: profile.alias, revoked: profile.revoked, userId }
}

export function getDemocracyDemoSummaries() {
  const deleted = new Set(readAdminState().deletedMatters)
  const stored = readMatterStore()
  const storedIds = new Set(stored.map((summary) => summary.ID))
  const summaries = [
    ...stored,
    ...DEMOCRACY_DEMO_SUMMARIES.filter((summary) => !storedIds.has(summary.ID)),
  ].filter((summary) => !deleted.has(summary.ID))
  for (const summary of summaries) activateScheduledVoteIfDue(summary)
  return summaries.map(applyDemoStage).map(applyDemoParticipation)
}

export function canEditDemocracyDemoMatter(matterId: string) {
  if (readAdminState().deletedMatters.includes(matterId)) return false
  if (isDemocracyDemoDeveloperMode()) {
    return [...readMatterStore(), ...DEMOCRACY_DEMO_SUMMARIES].some((item) => item.ID === matterId)
  }
  if (isDemocracyDemoAnonymousPostingRevoked()) return false
  if (readAnonymousTrace()[matterId] !== DEMO_USER_ID) return false
  const summary = readMatterStore().find((item) => item.ID === matterId)
  if (!summary) return false
  const stage = readAdminState().stages[matterId] ?? inferDemoStage(summary)
  const plan = readVotePlans()[matterId]
  return (
    (stage === 'PendingReview' || stage === 'Questions') &&
    (!plan || new Date(plan.StartAt).getTime() > Date.now())
  )
}

export function getDemocracyDemoVotePlan(matterId: string) {
  return readVotePlans()[matterId]
}

function demoContributionKey(matterId: string) {
  return `plweb2.democracy.demoQuestions.${matterId}`
}

function readDemoContributions(matterId: string): DemocracyContribution[] {
  try {
    const value = JSON.parse(localStorage.getItem(demoContributionKey(matterId)) || '[]')
    if (!Array.isArray(value)) return []
    return value.flatMap((item, index) => {
      if (typeof item === 'string') {
        return [
          {
            AuthorAlias: DEFAULT_DEMO_ANONYMOUS_ALIAS,
            AuthorPosition: 'Oldtimer',
            Content: item,
            CreatedAt: new Date().toISOString(),
            ID: `legacy-${matterId}-${index}`,
          },
        ]
      }
      return item && typeof item === 'object' ? [item as DemocracyContribution] : []
    })
  } catch {
    return []
  }
}

export function getDemocracyDemoContributions(matterId: string) {
  return [
    ...(DEMOCRACY_DEMO_DETAILS[matterId]?.questions ?? []),
    ...readDemoContributions(matterId),
  ].map((entry) => ({
    ...entry,
    Disclosure: readAdminState().disclosures[`${matterId}:${entry.ID}`],
  }))
}

export function submitDemocracyDemoContribution(matterId: string, content: string) {
  if (!getDemocracyDemoSummaries().some((matter) => matter.ID === matterId)) {
    throw new Error('matter-not-found')
  }
  const contribution: DemocracyContribution = {
    AuthorAlias: getDemocracyDemoAnonymousProfile().alias,
    AuthorPosition: isDemocracyDemoAdminMode() ? '认证编辑' : 'Oldtimer',
    Content: content.trim(),
    CreatedAt: new Date().toISOString(),
    ID: crypto.randomUUID(),
  }
  const entries = [...readDemoContributions(matterId), contribution]
  localStorage.setItem(demoContributionKey(matterId), JSON.stringify(entries))
  const state = readAdminState()
  state.contributionAuthors[`${matterId}:${contribution.ID}`] = DEMO_USER_ID
  writeAdminState(state)
  return contribution
}

export function traceDemocracyDemoContribution(
  matterId: string,
  contributionId: string,
  reason: string,
) {
  const entry = getDemocracyDemoContributions(matterId).find((item) => item.ID === contributionId)
  if (!entry) throw new Error('contribution-not-found')
  const userId =
    readAdminState().contributionAuthors[`${matterId}:${contributionId}`] ??
    DEMO_CONTRIBUTION_AUTHORS[`${matterId}:${contributionId}`]
  if (!userId) throw new Error('trace-unavailable')
  appendDemoAudit(matterId, 'TraceContribution', reason)
  return {
    Alias: entry.AuthorAlias,
    UserID: userId,
    Banned: isDemoAccountBanned(userId),
    BannedUntil: readAdminState().bannedUntil[userId],
    CanPublish: !isDemocracyDemoAnonymousPostingRevoked(userId),
    PublishingRevoked: getDemocracyDemoAnonymousProfile(userId).revoked,
  }
}

export function moderateDemocracyDemoContributor(
  matterId: string,
  contributionId: string,
  action: DemocracyAccountAction,
  reason: string,
  days?: number,
) {
  const userId =
    readAdminState().contributionAuthors[`${matterId}:${contributionId}`] ??
    DEMO_CONTRIBUTION_AUTHORS[`${matterId}:${contributionId}`]
  if (!userId) throw new Error('trace-unavailable')
  return moderateDemoAccountById(matterId, userId, action, reason, days)
}

export function discloseDemocracyDemoContribution(
  matterId: string,
  contributionId: string,
  reason: string,
) {
  const trace = traceDemocracyDemoContribution(matterId, contributionId, reason)
  const state = readAdminState()
  state.disclosures[`${matterId}:${contributionId}`] = {
    UserID: trace.UserID,
    Reason: reason,
    DisclosedAt: new Date().toISOString(),
  }
  writeAdminState(state)
  appendDemoAudit(matterId, 'DiscloseContribution', reason)
  return getDemocracyDemoContributions(matterId).find((item) => item.ID === contributionId)!
}

function validateDemoVotePlan(
  participation: DemocracyMatterParticipation,
  votePlan?: DemocracyVotePlan,
) {
  if (participation !== 'Vote' || !votePlan) return
  const startsAt = new Date(votePlan.StartAt).getTime()
  const finishesAt = new Date(votePlan.FinishAt).getTime()
  if (!Number.isFinite(startsAt) || !Number.isFinite(finishesAt) || startsAt <= Date.now() || finishesAt <= startsAt) throw new Error('invalid-vote-plan')
}

function demoMatterTags(
  anonymous: boolean,
  kind: 'oversight' | 'public',
  participation: DemocracyMatterParticipation,
) {
  if (anonymous) return ['匿名提议', '意见征集', '待质询']
  return [
    kind === 'oversight' ? '管理监察' : '公共议案',
    participation === 'Vote' ? '投票事务' : '意见征集',
    '待质询',
  ]
}

export function submitDemocracyDemoMatter(input: {
  subject: string
  description: string
  kind: 'public' | 'oversight'
  anonymous: boolean
  anonymousAlias?: string
  clientRequestId?: string
  participation: DemocracyMatterParticipation
  votePlan?: DemocracyVotePlan
}) {
  if (isDemocracyDemoAnonymousPostingRevoked()) {
    throw new Error('permission-denied')
  }
  const participation = input.anonymous ? 'Consultation' : input.participation
  validateDemoVotePlan(participation, input.votePlan)
  const anonymousProfile = updateDemocracyDemoAnonymousAlias(
    input.anonymousAlias || DEFAULT_DEMO_ANONYMOUS_ALIAS,
  )
  const summary = createSummary({
    anonymous: true,
    id: `demo-${Date.now().toString(36)}`,
    subject: input.subject,
    description: input.description,
    tags: demoMatterTags(input.anonymous, input.kind, participation),
    verification: 'Oldtimer',
    nickname: anonymousProfile.alias,
    comments: 0,
    visits: 0,
  })
  summary.User.ID = ''
  const matters = readMatterStore()
  matters.unshift(summary)
  localStorage.setItem(DEMO_MATTER_KEY, JSON.stringify(matters))
  const trace = readAnonymousTrace()
  trace[summary.ID] = DEMO_USER_ID
  localStorage.setItem(DEMO_ANONYMOUS_TRACE_KEY, JSON.stringify(trace))
  if (participation === 'Vote' && input.votePlan) {
    const plans = readVotePlans()
    plans[summary.ID] = input.votePlan
    writeVotePlans(plans)
  }
  appendDemoAudit(summary.ID, 'Create', '发布者创建事务')
  return summary
}

function findEditableDemoMatter(matters: Summary[], matterId: string) {
  let matter = matters.find((item) => item.ID === matterId)
  if (!matter && isDemocracyDemoDeveloperMode()) {
    const seeded = DEMOCRACY_DEMO_SUMMARIES.find((item) => item.ID === matterId)
    if (seeded) {
      matter = { ...seeded }
      matters.push(matter)
    }
  }
  if (!matter) throw new Error('matter-not-found')
  return matter
}

export function updateDemocracyDemoMatter(
  matterId: string,
  input: {
    description: string
    participation: DemocracyMatterParticipation
    subject: string
    votePlan?: DemocracyVotePlan
  },
) {
  if (!canEditDemocracyDemoMatter(matterId)) throw new Error('permission-denied')
  const previousPlan = readVotePlans()[matterId]
  const votingStarted = previousPlan && new Date(previousPlan.StartAt).getTime() <= Date.now()
  if (votingStarted) {
    input = { ...input, participation: 'Vote', votePlan: previousPlan }
  }
  if (!votingStarted) validateDemoVotePlan(input.participation, input.votePlan)
  const matters = readMatterStore()
  const matter = findEditableDemoMatter(matters, matterId)
  matter.Subject = input.subject.trim()
  matter.Description = [input.description.trim()]
  matter.Tags = [
    ...(matter.Tags ?? []).filter((tag) => tag !== '意见征集' && tag !== '投票事务'),
    input.participation === 'Vote' ? '投票事务' : '意见征集',
  ]
  matter.UpdateDate = Date.now()
  localStorage.setItem(DEMO_MATTER_KEY, JSON.stringify(matters))

  const plans = readVotePlans()
  if (input.participation === 'Vote' && input.votePlan) plans[matterId] = input.votePlan
  else delete plans[matterId]
  writeVotePlans(plans)
  appendDemoAudit(matterId, 'Edit', '发布者修改内容或投票时间')
  return matter
}

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
      {
        AuthorAlias: '星轨记录员',
        AuthorPosition: '认证编辑',
        Content: '卷宗引用的条例版本是否在事件发生时已生效？',
        CreatedAt: '2026-08-29T10:20:00+08:00',
        ID: 'demo-contribution-001',
      },
      {
        AuthorAlias: '潮汐观察员',
        AuthorPosition: 'Oldtimer',
        Content: '隐藏期间是否保留了当事人补充证据的通道？',
        CreatedAt: '2026-08-29T11:05:00+08:00',
        ID: 'demo-contribution-002',
      },
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

function readCustomVotes(): Activity[] {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_CUSTOM_VOTES_KEY) || '[]')
    return Array.isArray(value) ? (value as Activity[]) : []
  } catch {
    return []
  }
}

function buildCustomVote(
  matterId: string,
  plan: DemocracyVotePlan,
  matterSubject: string,
): Activity {
  return {
    Contents: [],
    FinishDate: plan.FinishAt,
    ID: `demo-vote-${Date.now().toString(36)}`,
    InterfaceModel: plan.Multiple ? 'Vote' : 'Vote-Single',
    InternalLink: `/d/matter/${matterId}`,
    IsAttendance: false,
    IsDaily: false,
    IsDevelopment: true,
    IsTutorial: false,
    Items: plan.Options.map((option) => ({
      Bonuses: { Gold: 0, Experience: 0, Diamond: 0 },
      Condition: '',
      Counter: 0,
      Counters: {},
      Description: option,
      Local: false,
    })),
    Languages: [],
    Platforms: [],
    Priority: 1,
    StartDate: plan.StartAt,
    Subject: { Chinese: matterSubject } as never,
    TargetLink: {} as never,
    TargetText: {} as never,
    Version: 1,
  }
}

function activateScheduledVoteIfDue(summary: Summary) {
  const plan = readVotePlans()[summary.ID]
  if (!plan || new Date(plan.StartAt).getTime() > Date.now()) return
  const state = readAdminState()
  const stage = state.stages[summary.ID] ?? inferDemoStage(summary)
  if (stage !== 'Questions') return

  const votes = readCustomVotes()
  if (!votes.some((vote) => vote.InternalLink === `/d/matter/${summary.ID}`)) {
    votes.unshift(buildCustomVote(summary.ID, plan, summary.Subject))
    localStorage.setItem(DEMO_CUSTOM_VOTES_KEY, JSON.stringify(votes))
  }
  state.stages[summary.ID] = 'Voting'
  writeAdminState(state)
  appendDemoAudit(summary.ID, 'CreateVote', '到达发布者设定的投票开始时间')
}

export function createDemocracyDemoVote(input: {
  finishDate: string
  matterId: string
  multiple: boolean
  options: string[]
  reason: string
}) {
  if (getDemocracyDemoMatterParticipation(input.matterId) !== 'Vote') {
    throw new Error('participation-mode-invalid')
  }
  if (getDemocracyDemoMatterStage(input.matterId) !== 'Questions') {
    throw new Error('stage-conflict')
  }
  const summary = getDemocracyDemoSummaries().find((item) => item.ID === input.matterId)
  if (!summary) throw new Error('matter-not-found')
  const vote = buildCustomVote(
    input.matterId,
    {
      FinishAt: input.finishDate,
      Multiple: input.multiple,
      Options: input.options,
      StartAt: new Date().toISOString(),
    },
    summary.Subject,
  )
  const votes = readCustomVotes()
  votes.unshift(vote)
  localStorage.setItem(DEMO_CUSTOM_VOTES_KEY, JSON.stringify(votes))
  const state = readAdminState()
  state.stages[input.matterId] = 'Voting'
  writeAdminState(state)
  appendDemoAudit(input.matterId, 'CreateVote', input.reason)
  return vote
}

export function isDemocracyDemoMode() {
  return import.meta.env.DEV && window.location.hash.includes(DEMOCRACY_DEMO_QUERY)
}

export function isDemocracyDemoAdminMode() {
  return isDemocracyDemoMode() && window.location.hash.includes(DEMOCRACY_DEMO_ADMIN_QUERY)
}

function readVoteStore(): DemoVoteStore {
  try {
    return JSON.parse(localStorage.getItem(DEMO_VOTE_KEY) || '{}') as DemoVoteStore
  } catch {
    return {}
  }
}

function allDemoVotes() {
  return [...readCustomVotes(), ...DEMO_VOTES]
}

function buildDemoVotes(store = readVoteStore()) {
  return allDemoVotes().map((activity) => ({
    ...activity,
    Items: activity.Items.map((item, index) => ({
      ...item,
      Counter: item.Counter + (store[activity.ID]?.counts[index] ?? 0),
    })),
  }))
}

function buildDemoStatuses(store = readVoteStore()): ActivityStatus[] {
  return allDemoVotes().map((activity) => ({
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
  if (new Date(activity.FinishDate).getTime() <= Date.now()) {
    throw new Error('vote-finished')
  }
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
