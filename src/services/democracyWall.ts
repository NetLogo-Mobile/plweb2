import { getData, login } from '@api/getData'
import storageManager from '@storage/index'
import {
  castDemocracyDemoVote,
  getDemocracyDemoSummaries,
  getDemocracyDemoSync,
  isDemocracyDemoMode,
  submitDemocracyDemoMatter,
} from './democracyWallDemo'
import type {
  Activity,
  ActivityStatus,
  Statistic,
  Summary,
  Sync,
  UserInfo,
} from '../pl-serve-type-main/type/main'

export const DEMOCRACY_WALL_TAG = '民主墙'

const CASE_TAGS = new Set(['公开卷宗', '调查卷宗', '公开案件', '管理监察'])
const RESOLVED_TAGS = new Set(['已决议', '已归档'])
const FEATURED_TAGS = new Set(['精选', '精选决议'])

export type DemocracyEntryKind = 'case' | 'proposal'
export type DemocracyEntryStatus = 'open' | 'resolved'

export interface DemocracyEntry {
  anonymousSuggestion: boolean
  featured: boolean
  kind: DemocracyEntryKind
  status: DemocracyEntryStatus
  summary: Summary
}

export interface DemocracyVoteContext {
  activities: Activity[]
  statuses: ActivityStatus[]
  statistic?: Statistic
}

export interface DemocracyMatterInput {
  anonymous: boolean
  description: string
  kind: 'public' | 'oversight'
  subject: string
}

const INITIATOR_VERIFICATIONS = new Set(['Editor', 'Administrator'])

export function getDemocracyCreationAccess() {
  const user = storageManager.getObj('userInfo').value
  return {
    canInitiate:
      isDemocracyDemoMode() || INITIATOR_VERIFICATIONS.has(String(user?.Verification || '')),
    canSuggestAnonymously: isDemocracyDemoMode() || Boolean(user?.ID),
  }
}

function hasAnyTag(tags: string[], candidates: Set<string>) {
  return tags.some((tag) => candidates.has(tag))
}

export function toDemocracyEntry(summary: Summary): DemocracyEntry {
  const tags = summary.Tags ?? []
  return {
    anonymousSuggestion: tags.includes('匿名提议'),
    featured: hasAnyTag(tags, FEATURED_TAGS),
    kind: hasAnyTag(tags, CASE_TAGS) ? 'case' : 'proposal',
    status: hasAnyTag(tags, RESOLVED_TAGS) ? 'resolved' : 'open',
    summary,
  }
}

async function queryDemocracySummaries(tags: string[], take: number) {
  const response = await getData('/Contents/QueryExperiments', {
    Query: {
      Category: 'Discussion',
      Languages: [],
      ExcludeLanguages: [],
      Tags: tags,
      ModelTags: [],
      ExcludeTags: [],
      ModelID: undefined,
      ParentID: undefined,
      UserID: undefined,
      Special: undefined,
      From: undefined,
      Skip: 0,
      Take: take,
      Days: 0,
      Sort: 0,
      ShowAnnouncement: true,
    },
  })

  if (response.Status !== 200) {
    throw new Error(response.Message || String(response.Status))
  }

  return response.Data?.$values ?? []
}

export async function fetchDemocracyEntries(): Promise<DemocracyEntry[]> {
  if (isDemocracyDemoMode()) {
    return getDemocracyDemoSummaries()
      .map(toDemocracyEntry)
      .filter((entry) => entry.status === 'open' || entry.featured)
  }

  return (await queryDemocracySummaries([DEMOCRACY_WALL_TAG], 48))
    .map(toDemocracyEntry)
    .filter((entry) => entry.status === 'open' || entry.featured)
}

export async function fetchDemocracyHistoryEntries(): Promise<DemocracyEntry[]> {
  if (isDemocracyDemoMode()) {
    return getDemocracyDemoSummaries()
      .map(toDemocracyEntry)
      .filter((entry) => entry.status === 'resolved')
  }

  const results = await Promise.allSettled([
    queryDemocracySummaries([DEMOCRACY_WALL_TAG, '已归档'], 48),
    queryDemocracySummaries([DEMOCRACY_WALL_TAG, '已决议'], 48),
  ])
  const summaries = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  const firstFailure = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  )
  if (!summaries.length && firstFailure) {
    throw firstFailure.reason
  }

  return Array.from(new Map(summaries.map((summary) => [summary.ID, summary])).values())
    .map(toDemocracyEntry)
    .filter((entry) => entry.status === 'resolved')
}

function createSubmissionSummary(
  input: DemocracyMatterInput,
  user: UserInfo,
): Summary & {
  Anonymous?: boolean
} {
  const timestamp = Date.now()
  return {
    $type: 'Quantum.Models.Contents.Summary, Quantum Models',
    ID: '',
    Tags: [
      DEMOCRACY_WALL_TAG,
      ...(input.anonymous ? ['匿名提议'] : []),
      input.kind === 'oversight' ? '管理监察' : '公共议案',
      input.anonymous ? '待审核' : '待质询',
    ],
    Type: 0,
    User: {
      ID: user.ID,
      Nickname: user.Nickname,
      Avatar: user.Avatar,
      AvatarRegion: user.AvatarRegion,
      Signature: user.Signature,
      Decoration: user.Decoration,
      Verification: user.Verification,
    },
    Image: 0,
    Price: 0,
    Stars: 0,
    Visits: 0,
    Remixes: 0,
    Subject: input.subject.trim(),
    Version: 1,
    Category: 'Discussion',
    Comments: 0,
    Language: 'Chinese',
    Supports: 0,
    Coauthors: [],
    Popularity: 0,
    UpdateDate: timestamp,
    Visibility: 0,
    Description: input.description.trim().split('\n'),
    ImageRegion: 0,
    SortingDate: timestamp,
    CreationDate: timestamp,
    Multilingual: false,
    Anonymous: input.anonymous,
  }
}

export async function submitDemocracyMatter(input: DemocracyMatterInput) {
  if (isDemocracyDemoMode()) return submitDemocracyDemoMatter(input)

  const user = storageManager.getObj('userInfo').value
  if (!user?.ID) throw new Error('login-required')
  const access = getDemocracyCreationAccess()
  if (
    (!input.anonymous && !access.canInitiate) ||
    (input.anonymous && !access.canSuggestAnonymously)
  ) {
    throw new Error('permission-denied')
  }

  const summary = createSubmissionSummary(input, user)
  const response = await getData('/Contents/SubmitExperiment', {
    Summary: summary,
    Workspace: null,
  } as never)
  if (response.Status !== 200 || !response.Data?.Summary) {
    throw new Error(response.Message || String(response.Status))
  }
  return response.Data.Summary
}

function isVoteActivity(activity: Activity) {
  return activity.InterfaceModel === 'Vote' || activity.InterfaceModel === 'Vote-Single'
}

export function getDemocracyMatterActivities(activities: Activity[], matterId: string) {
  return activities.filter((activity) => {
    const targets = [activity.InternalLink, activity.TargetLink, activity.TargetText]
    return targets.some((target) => {
      if (typeof target === 'string') return target.includes(matterId)
      try {
        return JSON.stringify(target).includes(matterId)
      } catch {
        return false
      }
    })
  })
}

export async function fetchDemocracyVoteContext(): Promise<DemocracyVoteContext> {
  if (isDemocracyDemoMode()) {
    return mergeDemocracyVoteContext({ activities: [], statuses: [] }, getDemocracyDemoSync())
  }

  const auth = storageManager.getObj('userAuthInfo').value
  const response =
    auth?.token && auth.authCode
      ? await login(auth.token, auth.authCode, true)
      : await login(null, null)

  if (response.Status !== 200) {
    throw new Error(response.Message || String(response.Status))
  }

  const sync = response.Data
  return mergeDemocracyVoteContext(
    {
      activities: [],
      statuses: [],
    },
    sync,
  )
}

export async function submitDemocracyVote(activity: Activity, index: number, statistic: Statistic) {
  if (isDemocracyDemoMode()) {
    return { Status: 200, Message: '', Data: castDemocracyDemoVote(activity, index) } as const
  }

  return getData('/Users/ReceiveBonus', {
    ActivityID: activity.ID,
    Index: index,
    Statistic: statistic,
  })
}

export function mergeDemocracyVoteContext(
  current: DemocracyVoteContext,
  sync?: Sync | null,
): DemocracyVoteContext {
  const activities = (sync?.Activities ?? current.activities).filter(isVoteActivity)
  const statistic = sync?.Statistic ?? current.statistic
  return {
    activities,
    statistic,
    statuses: statistic?.Activities ?? current.statuses,
  }
}
