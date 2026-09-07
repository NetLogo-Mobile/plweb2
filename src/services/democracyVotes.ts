import { getData, login } from '@api/getData'
import storageManager from '@storage/index'
import {
  castDemocracyDemoVote,
  getDemocracyDemoSync,
  isDemocracyDemoMode,
} from './democracyWallDemo'
import { isDemocracyWallWritable } from './democracyWallFeature'
import type { Activity, ActivityStatus, Statistic, Sync } from '../pl-serve-type-main/type/main'

export interface DemocracyVoteContext {
  activities: Activity[]
  statuses: ActivityStatus[]
  statistic?: Statistic
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
  if (!isDemocracyWallWritable()) throw new Error('feature-read-only')
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
