import { getData } from '@api/getData'
import {
  createDemocracyDemoVote,
  canEditDemocracyDemoMatter,
  deleteDemocracyDemoMatter,
  getDemocracyDemoAnonymousProfile,
  getDemocracyDemoAudit,
  getDemocracyDemoContributions,
  getDemocracyDemoInvestigationTeam,
  getDemocracyDemoMatterStage,
  getDemocracyDemoMatterParticipation,
  getDemocracyDemoSummaries,
  getDemocracyDemoVotePlan,
  moderateDemocracyDemoPublisher,
  moderateDemocracyDemoAccount,
  inviteDemocracyDemoInvestigator,
  reportDemocracyDemoMatter,
  traceDemocracyDemoPublisher,
  transitionDemocracyDemoMatter,
  isDemocracyDemoAnonymousPostingRevoked,
  isDemocracyDemoAdminMode,
  isDemocracyDemoDeveloperMode,
  isDemocracyDemoMode,
  submitDemocracyDemoMatter,
  submitDemocracyDemoContribution,
  updateDemocracyDemoMatter,
} from './democracyWallDemo'
import type { Activity, Summary } from '../pl-serve-type-main/type/main'
import type {
  DemocracyContext,
  DemocracyContribution,
  DemocracyAccountAction,
  DemocracyAuditEntry,
  DemocracyInvestigationInvite,
  DemocracyMatterScope,
  DemocracyMatterParticipation,
  DemocracyMatterStage,
  DemocracyPublicMatter,
  DemocracyPublisherTrace,
  DemocracyReportCategory,
  DemocracyVotePlan,
} from './democracyWallContract'
import { isDemocracyWallWritable } from './democracyWallFeature'
import { isDemocracyHistoryStage } from './democracyMatterState'
import { validateDemocracyBanDays } from './democracyModerationRules'

function requireWritable() {
  if (!isDemocracyWallWritable()) throw new Error('feature-read-only')
}

export async function requireDemocracyDeveloperAccess() {
  requireWritable()
  const context = await fetchDemocracyContext()
  if (context.Permissions.CanDeveloperManage !== true) throw new Error('permission-denied')
}

async function collectPages<T>(load: (skip: number, take: number) => Promise<T[]>) {
  const entries: T[] = []
  const take = 50
  for (;;) {
    const page = await load(entries.length, take)
    entries.push(...page)
    if (page.length < take) return entries
  }
}

export const DEMOCRACY_WALL_TAG = '民主墙'

const CASE_TAGS = new Set(['公开卷宗', '调查卷宗', '公开案件', '管理监察'])
const RESOLVED_TAGS = new Set(['已决议', '已归档'])
export type DemocracyEntryKind = 'case' | 'proposal'
export type DemocracyEntryStatus = 'open' | 'resolved'

export interface DemocracyEntry {
  anonymousAuthor: boolean
  anonymousSuggestion: boolean
  kind: DemocracyEntryKind
  status: DemocracyEntryStatus
  summary: Summary
}

export interface DemocracyMatterDetail {
  canEdit: boolean
  kind: DemocracyPublicMatter['Kind']
  mode: DemocracyPublicMatter['Mode']
  participation: DemocracyMatterParticipation
  revision: string
  stage: DemocracyMatterStage
  summary: Summary
  voteActivity?: Activity
  votePlan?: DemocracyVotePlan
}

export interface DemocracyMatterInput {
  anonymous: boolean
  anonymousAlias?: string
  clientRequestId: string
  description: string
  kind: 'public' | 'oversight'
  participation: DemocracyMatterParticipation
  subject: string
  votePlan?: DemocracyVotePlan
}

export interface DemocracyMatterEditInput {
  description: string
  expectedRevision: string
  matterId: string
  participation: DemocracyMatterParticipation
  subject: string
  votePlan?: DemocracyVotePlan
}

export interface DemocracyCreationAccess {
  anonymousAlias: string
  canInitiate: boolean
  canSuggestAnonymously: boolean
}

export interface DemocracyManagementAccess {
  canModerate: boolean
  canTransition: boolean
}

export interface DemocracyVoteInput {
  finishDate: string
  matterId: string
  multiple: boolean
  options: string[]
  reason: string
}

const NO_CREATION_ACCESS: DemocracyCreationAccess = {
  anonymousAlias: '',
  canInitiate: false,
  canSuggestAnonymously: false,
}

export function getDemocracyCreationAccess(): DemocracyCreationAccess {
  if (isDemocracyDemoMode()) {
    const demoPostingAllowed = !isDemocracyDemoAnonymousPostingRevoked()
    return {
      anonymousAlias: '',
      canInitiate: demoPostingAllowed && isDemocracyDemoAdminMode(),
      canSuggestAnonymously: demoPostingAllowed,
    }
  }
  return NO_CREATION_ACCESS
}

export async function fetchDemocracyCreationAccess(): Promise<DemocracyCreationAccess> {
  if (isDemocracyDemoMode()) return getDemocracyCreationAccess()
  if (!isDemocracyWallWritable()) return NO_CREATION_ACCESS

  return toCreationAccess(await fetchDemocracyContext())
}

export async function fetchDemocracyContext(): Promise<DemocracyContext> {
  if (isDemocracyDemoMode()) {
    const profile = getDemocracyDemoAnonymousProfile()
    const adminMode = isDemocracyDemoAdminMode()
    const canPublish = !isDemocracyDemoAnonymousPostingRevoked()
    return {
      ApiVersion: 1,
      Permissions: {
        CanDeveloperManage: isDemocracyDemoDeveloperMode(),
        CanContribute: canPublish,
        CanInitiate: adminMode,
        CanModerate: adminMode,
        CanSuggest: canPublish,
        CanTransition: adminMode,
      },
      Profile: {
        Alias: profile.alias,
        CanPublish: canPublish,
        ModifiedAt: new Date().toISOString(),
      },
    }
  }
  const response = await getData('/Democracy/GetContext', {})
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

function toCreationAccess(context: DemocracyContext): DemocracyCreationAccess {
  return {
    anonymousAlias: context.Profile?.Alias ?? '',
    canInitiate: context.Profile?.CanPublish === true && context.Permissions.CanInitiate,
    canSuggestAnonymously: context.Profile?.CanPublish === true && context.Permissions.CanSuggest,
  }
}

function hasAnyTag(tags: string[], candidates: Set<string>) {
  return tags.some((tag) => candidates.has(tag))
}

function canSubmitMatter(access: DemocracyCreationAccess, anonymous: boolean) {
  return anonymous ? access.canSuggestAnonymously : access.canInitiate
}

function normalizedParticipation(input: DemocracyMatterInput) {
  return input.anonymous ? ('Consultation' as const) : input.participation
}

function requireVotePlan(
  participation: DemocracyMatterParticipation,
  votePlan?: DemocracyVotePlan,
) {
  if (participation === 'Vote' && !votePlan) throw new Error('vote-plan-required')
}

function buildMatterSubmission(input: DemocracyMatterInput, fallbackAlias: string) {
  const participation = normalizedParticipation(input)
  return {
    Alias: input.anonymousAlias?.trim() || fallbackAlias,
    ClientRequestID: input.clientRequestId,
    Description: input.description.trim(),
    Kind:
      !input.anonymous && input.kind === 'oversight' ? ('Oversight' as const) : ('Public' as const),
    Mode: input.anonymous ? ('Suggestion' as const) : ('Formal' as const),
    Participation: participation,
    Subject: input.subject.trim(),
    VotePlan: participation === 'Vote' ? input.votePlan : undefined,
  }
}

function participationFromMatter(matter: DemocracyPublicMatter): DemocracyMatterParticipation {
  if (matter.Participation) return matter.Participation
  return matter.VotePlan || matter.VoteActivity || matter.Stage === 'Voting'
    ? 'Vote'
    : 'Consultation'
}

export function toDemocracyEntry(summary: Summary): DemocracyEntry {
  const tags = summary.Tags ?? []
  return {
    anonymousAuthor: true,
    anonymousSuggestion: tags.includes('匿名提议'),
    kind: hasAnyTag(tags, CASE_TAGS) ? 'case' : 'proposal',
    status: hasAnyTag(tags, RESOLVED_TAGS) ? 'resolved' : 'open',
    summary,
  }
}

function normalizePublicMatter(matter: DemocracyPublicMatter): Summary {
  const reservedTags = new Set([
    '匿名提议',
    '公共议案',
    '管理监察',
    '待审核',
    '待质询',
    '匿名投票',
    '已决议',
    '已归档',
    '意见征集',
    '投票事务',
  ])
  const stageTags: Partial<Record<DemocracyPublicMatter['Stage'], string[]>> = {
    PendingReview: ['待审核'],
    Questions: ['待质询'],
    Voting: ['匿名投票'],
    Resolved: ['已决议'],
    Archived: ['已决议', '已归档'],
  }
  return {
    ...matter.Summary,
    Tags: [
      DEMOCRACY_WALL_TAG,
      ...(matter.Summary.Tags ?? []).filter(
        (tag) => tag !== DEMOCRACY_WALL_TAG && !reservedTags.has(tag),
      ),
      ...(matter.Mode === 'Suggestion' ? ['匿名提议'] : []),
      ...(matter.Participation === 'Vote' ? ['投票事务'] : ['意见征集']),
      ...(matter.Mode === 'Formal' ? [matter.Kind === 'Oversight' ? '管理监察' : '公共议案'] : []),
      ...(stageTags[matter.Stage] ?? []),
    ],
  }
}

async function queryDemocracySummaries(scope: DemocracyMatterScope) {
  const matters = await collectPages(async (skip, take) => {
    const response = await getData('/Democracy/QueryMatters', {
      Scope: scope,
      Skip: skip,
      Take: take,
    })

    if (response.Status !== 200 || !response.Data) {
      throw new Error(response.Message || String(response.Status))
    }

    return response.Data.Entries
  })
  return matters
    .filter((matter) => matter.Stage !== 'Rejected')
    .map((matter) => ({
      anonymousAuthor: true,
      anonymousSuggestion: matter.Mode === 'Suggestion',
      kind: matter.Kind === 'Oversight' ? ('case' as const) : ('proposal' as const),
      status: isDemocracyHistoryStage(matter.Stage) ? ('resolved' as const) : ('open' as const),
      summary: normalizePublicMatter(matter),
    }))
}

export async function fetchDemocracyEntries(): Promise<DemocracyEntry[]> {
  if (isDemocracyDemoMode()) {
    return getDemocracyDemoSummaries()
      .map(toDemocracyEntry)
      .filter((entry) => entry.status === 'open')
  }

  return (await queryDemocracySummaries('Current')).filter((entry) => entry.status === 'open')
}

export async function fetchDemocracyHistoryEntries(): Promise<DemocracyEntry[]> {
  if (isDemocracyDemoMode()) {
    return getDemocracyDemoSummaries()
      .map(toDemocracyEntry)
      .filter((entry) => entry.status === 'resolved')
  }

  return (await queryDemocracySummaries('History')).filter((entry) => entry.status === 'resolved')
}

export async function submitDemocracyMatter(input: DemocracyMatterInput) {
  requireVotePlan(normalizedParticipation(input), input.votePlan)
  if (isDemocracyDemoMode()) return submitDemocracyDemoMatter(input)
  if (!isDemocracyWallWritable()) throw new Error('feature-read-only')

  const access = await fetchDemocracyCreationAccess()
  if (!canSubmitMatter(access, input.anonymous)) {
    throw new Error('permission-denied')
  }

  const response = await getData(
    '/Democracy/SubmitMatter',
    buildMatterSubmission(input, access.anonymousAlias),
  )
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return normalizePublicMatter(response.Data)
}

export async function fetchDemocracyMatter(matterId: string) {
  if (isDemocracyDemoMode()) {
    const summary = getDemocracyDemoSummaries().find((item) => item.ID === matterId)
    if (!summary) throw new Error('matter-not-found')
    const tags = summary.Tags ?? []
    return {
      canEdit: canEditDemocracyDemoMatter(matterId),
      kind: tags.includes('管理监察') ? 'Oversight' : 'Public',
      mode: tags.includes('匿名提议') ? 'Suggestion' : 'Formal',
      participation: getDemocracyDemoMatterParticipation(matterId),
      revision: String(summary.UpdateDate),
      stage: getDemocracyDemoMatterStage(matterId),
      summary,
      votePlan: getDemocracyDemoVotePlan(matterId),
    } satisfies DemocracyMatterDetail
  }
  const response = await getData('/Democracy/GetMatter', { MatterID: matterId })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return {
    canEdit: response.Data.CanEdit,
    kind: response.Data.Kind,
    mode: response.Data.Mode,
    participation: participationFromMatter(response.Data),
    revision: response.Data.Revision,
    stage: response.Data.Stage,
    summary: normalizePublicMatter(response.Data),
    voteActivity: response.Data.VoteActivity,
    votePlan: response.Data.VotePlan,
  } satisfies DemocracyMatterDetail
}

async function prepareMatterEdit(input: DemocracyMatterEditInput) {
  if (!isDemocracyWallWritable()) throw new Error('feature-read-only')
  const current = await fetchDemocracyMatter(input.matterId)
  if (!current.canEdit) throw new Error('permission-denied')
  const votingStarted =
    current.stage === 'Voting' ||
    (current.votePlan && new Date(current.votePlan.StartAt).getTime() <= Date.now())
  if (votingStarted || isDemocracyHistoryStage(current.stage)) {
    await requireDemocracyDeveloperAccess()
    input = { ...input, participation: current.participation, votePlan: current.votePlan }
  }
  return input
}

export async function updateDemocracyMatter(input: DemocracyMatterEditInput) {
  input = await prepareMatterEdit(input)
  requireVotePlan(input.participation, input.votePlan)
  if (isDemocracyDemoMode()) {
    return updateDemocracyDemoMatter(input.matterId, {
      description: input.description,
      subject: input.subject,
      participation: input.participation,
      votePlan: input.votePlan,
    })
  }
  const response = await getData('/Democracy/UpdateMatter', {
    Description: input.description.trim(),
    ExpectedRevision: input.expectedRevision,
    MatterID: input.matterId,
    Participation: input.participation,
    Subject: input.subject.trim(),
    VotePlan: input.participation === 'Vote' ? input.votePlan : undefined,
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return normalizePublicMatter(response.Data)
}

export async function traceDemocracyPublisher(matterId: string, reason: string) {
  await requireDemocracyDeveloperAccess()
  if (isDemocracyDemoMode()) return traceDemocracyDemoPublisher(matterId, reason)
  const response = await getData('/Democracy/TracePublisher', {
    Notify: false,
    MatterID: matterId,
    Reason: reason.trim(),
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data satisfies DemocracyPublisherTrace
}

export async function moderateDemocracyPublisher(
  matterId: string,
  revoked: boolean,
  reason: string,
) {
  await requireDemocracyDeveloperAccess()
  if (isDemocracyDemoMode()) {
    return moderateDemocracyDemoPublisher(matterId, revoked, reason)
  }
  const response = await getData('/Democracy/ModeratePublisher', {
    MatterID: matterId,
    Reason: reason.trim(),
    Revoked: revoked,
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export async function moderateDemocracyAccount(
  matterId: string,
  action: DemocracyAccountAction,
  reason: string,
  banDays?: number,
) {
  await requireDemocracyDeveloperAccess()
  if (action === 'Ban') validateDemocracyBanDays(banDays)
  if (isDemocracyDemoMode()) {
    return moderateDemocracyDemoAccount(matterId, action, reason, banDays)
  }
  const response = await getData('/Democracy/ModerateAccount', {
    BanDays: action === 'Ban' ? banDays : undefined,
    Action: action,
    MatterID: matterId,
    Reason: reason.trim(),
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export async function deleteDemocracyMatter(matterId: string, reason: string) {
  await requireDemocracyDeveloperAccess()
  if (isDemocracyDemoMode()) return deleteDemocracyDemoMatter(matterId, reason)
  const response = await getData('/Democracy/DeleteMatter', {
    MatterID: matterId,
    Reason: reason.trim(),
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export async function fetchDemocracyAudit(matterId: string): Promise<DemocracyAuditEntry[]> {
  await requireDemocracyDeveloperAccess()
  if (isDemocracyDemoMode()) return getDemocracyDemoAudit(matterId)
  const response = await getData('/Democracy/QueryAudit', { MatterID: matterId })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data.Entries
}

export async function fetchDemocracyContributions(
  matterId: string,
): Promise<DemocracyContribution[]> {
  if (isDemocracyDemoMode()) return getDemocracyDemoContributions(matterId)
  return collectPages(async (skip, take) => {
    const response = await getData('/Democracy/QueryContributions', {
      MatterID: matterId,
      Skip: skip,
      Take: take,
    })
    if (response.Status !== 200 || !response.Data) {
      throw new Error(response.Message || String(response.Status))
    }
    return response.Data.Entries
  })
}

export async function submitDemocracyContribution(
  matterId: string,
  content: string,
  clientRequestId = crypto.randomUUID(),
) {
  requireWritable()
  if (isDemocracyDemoMode()) return submitDemocracyDemoContribution(matterId, content)
  const response = await getData('/Democracy/SubmitContribution', {
    ClientRequestID: clientRequestId,
    Content: content.trim(),
    MatterID: matterId,
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export async function fetchDemocracyInvestigationTeam(
  matterId: string,
): Promise<DemocracyInvestigationInvite[]> {
  if (isDemocracyDemoMode()) return getDemocracyDemoInvestigationTeam(matterId)
  const response = await getData('/Democracy/QueryInvestigationTeam', { MatterID: matterId })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data.Entries
}

export async function inviteDemocracyInvestigator(
  matterId: string,
  userId: string,
  reason: string,
) {
  requireWritable()
  if (isDemocracyDemoMode()) {
    return inviteDemocracyDemoInvestigator(matterId, userId, reason)
  }
  const response = await getData('/Democracy/InviteInvestigator', {
    MatterID: matterId,
    Reason: reason.trim(),
    UserID: userId,
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export async function transitionDemocracyMatter(
  matterId: string,
  expectedStage: DemocracyMatterStage,
  targetStage: DemocracyMatterStage,
  reason: string,
) {
  requireWritable()
  if (isDemocracyDemoMode()) {
    transitionDemocracyDemoMatter(matterId, expectedStage, targetStage, reason)
    return
  }
  const response = await getData('/Democracy/TransitionMatter', {
    ExpectedStage: expectedStage,
    MatterID: matterId,
    Reason: reason.trim(),
    TargetStage: targetStage,
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
}

export async function createDemocracyVote(input: DemocracyVoteInput) {
  requireWritable()
  if (isDemocracyDemoMode()) {
    return createDemocracyDemoVote(input)
  }
  const response = await getData('/Democracy/CreateVote', {
    ExpectedStage: 'Questions',
    FinishDate: input.finishDate,
    MatterID: input.matterId,
    Multiple: input.multiple,
    Options: input.options.map((option) => option.trim()).filter(Boolean),
    Reason: input.reason.trim(),
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export async function reportDemocracyMatter(
  matterId: string,
  category: DemocracyReportCategory,
  details: string,
  clientRequestId = crypto.randomUUID(),
) {
  requireWritable()
  if (isDemocracyDemoMode()) return reportDemocracyDemoMatter(matterId, category, details)
  const response = await getData('/Democracy/ReportMatter', {
    Category: category,
    ClientRequestID: clientRequestId,
    Details: details.trim(),
    MatterID: matterId,
  })
  if (response.Status !== 200 || !response.Data) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data
}

export {
  fetchDemocracyVoteContext,
  getDemocracyMatterActivities,
  mergeDemocracyVoteContext,
  submitDemocracyVote,
  type DemocracyVoteContext,
} from './democracyVotes'
