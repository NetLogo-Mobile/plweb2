import { getData, login } from '@api/getData'
import storageManager from '@storage/index'
import {
  castDemocracyDemoVote,
  DEMOCRACY_DEMO_SUMMARIES,
  getDemocracyDemoSync,
  isDemocracyDemoMode,
} from './democracyWallDemo'
import type {
  Activity,
  ActivityStatus,
  Statistic,
  Summary,
  Sync,
} from '../pl-serve-type-main/type/main'

export const DEMOCRACY_WALL_TAG = '民主墙'

const CASE_TAGS = new Set(['公开卷宗', '调查卷宗', '公开案件'])
const RESOLVED_TAGS = new Set(['已决议', '已归档'])
const FEATURED_TAGS = new Set(['精选', '精选决议'])

export type DemocracyEntryKind = 'case' | 'proposal'
export type DemocracyEntryStatus = 'open' | 'resolved'

export interface DemocracyEntry {
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

function hasAnyTag(tags: string[], candidates: Set<string>) {
  return tags.some((tag) => candidates.has(tag))
}

export function toDemocracyEntry(summary: Summary): DemocracyEntry {
  const tags = summary.Tags ?? []
  return {
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
    return DEMOCRACY_DEMO_SUMMARIES.map(toDemocracyEntry).filter(
      (entry) => entry.status === 'open' || entry.featured,
    )
  }

  return (await queryDemocracySummaries([DEMOCRACY_WALL_TAG], 48))
    .map(toDemocracyEntry)
    .filter((entry) => entry.status === 'open' || entry.featured)
}

export async function fetchDemocracyHistoryEntries(): Promise<DemocracyEntry[]> {
  if (isDemocracyDemoMode()) {
    return DEMOCRACY_DEMO_SUMMARIES.map(toDemocracyEntry).filter(
      (entry) => entry.status === 'resolved',
    )
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
