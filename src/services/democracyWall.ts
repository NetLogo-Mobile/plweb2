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

export type DemocracyEntryKind = 'case' | 'proposal'
export type DemocracyEntryStatus = 'open' | 'resolved'

export interface DemocracyEntry {
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
    kind: hasAnyTag(tags, CASE_TAGS) ? 'case' : 'proposal',
    status: hasAnyTag(tags, RESOLVED_TAGS) ? 'resolved' : 'open',
    summary,
  }
}

export async function fetchDemocracyEntries(): Promise<DemocracyEntry[]> {
  if (isDemocracyDemoMode()) {
    return DEMOCRACY_DEMO_SUMMARIES.map(toDemocracyEntry)
  }

  const response = await getData('/Contents/QueryExperiments', {
    Query: {
      Category: 'Discussion',
      Languages: [],
      ExcludeLanguages: [],
      Tags: [DEMOCRACY_WALL_TAG],
      ModelTags: [],
      ExcludeTags: [],
      ModelID: undefined,
      ParentID: undefined,
      UserID: undefined,
      Special: undefined,
      From: undefined,
      Skip: 0,
      Take: 48,
      Days: 0,
      Sort: 0,
      ShowAnnouncement: true,
    },
  })

  if (response.Status !== 200) {
    throw new Error(response.Message || String(response.Status))
  }

  return (response.Data?.$values ?? []).map(toDemocracyEntry)
}

function isVoteActivity(activity: Activity) {
  return activity.InterfaceModel === 'Vote' || activity.InterfaceModel === 'Vote-Single'
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
