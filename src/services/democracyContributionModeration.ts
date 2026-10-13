import { getData } from '@api/getData'
import { requireDemocracyDeveloperAccess } from './democracyWall'
import { validateDemocracyBanDays } from './democracyModerationRules'
import {
  isDemocracyDemoMode,
  traceDemocracyDemoContribution,
  moderateDemocracyDemoContributor,
  discloseDemocracyDemoContribution,
} from './democracyWallDemo'
import type { DemocracyAccountAction } from './democracyWallContract'

export async function traceContribution(matterId: string, contributionId: string, reason: string) {
  await requireDemocracyDeveloperAccess()
  if (isDemocracyDemoMode()) return traceDemocracyDemoContribution(matterId, contributionId, reason)
  const result = await getData('/Democracy/TraceContribution', {
    MatterID: matterId,
    ContributionID: contributionId,
    Reason: reason,
    Notify: false,
  })
  if (result.Status !== 200 || !result.Data) throw new Error(result.Message)
  return result.Data
}

export async function moderateContributor(
  matterId: string,
  contributionId: string,
  action: DemocracyAccountAction,
  reason: string,
  days?: number,
) {
  await requireDemocracyDeveloperAccess()
  if (action === 'Ban') validateDemocracyBanDays(days)
  if (isDemocracyDemoMode())
    return moderateDemocracyDemoContributor(matterId, contributionId, action, reason, days)
  const result = await getData('/Democracy/ModerateContributionAuthor', {
    MatterID: matterId,
    ContributionID: contributionId,
    Action: action,
    Reason: reason,
    BanDays: action === 'Ban' ? days : undefined,
  })
  if (result.Status !== 200 || !result.Data) throw new Error(result.Message)
  return result.Data
}

export async function discloseContribution(
  matterId: string,
  contributionId: string,
  reason: string,
) {
  await requireDemocracyDeveloperAccess()
  if (isDemocracyDemoMode())
    return discloseDemocracyDemoContribution(matterId, contributionId, reason)
  const result = await getData('/Democracy/DiscloseContribution', {
    MatterID: matterId,
    ContributionID: contributionId,
    Reason: reason,
  })
  if (result.Status !== 200 || !result.Data) throw new Error(result.Message)
  return result.Data
}
