import { getData } from '@api/getData'
import { isDemocracyWallWritable } from './democracyWallFeature'
import {
  getDemocracyDemoInvitation,
  isDemocracyDemoMode,
  respondDemocracyDemoInvitation,
} from './democracyWallDemo'

export async function fetchInvestigationInvitation(matterId: string, inviteId: string) {
  if (isDemocracyDemoMode()) return getDemocracyDemoInvitation(matterId, inviteId)
  const result = await getData('/Democracy/GetInvestigationInvite', {
    MatterID: matterId,
    InviteID: inviteId,
  })
  if (result.Status !== 200 || !result.Data)
    throw new Error(result.Message || String(result.Status))
  return result.Data
}

export async function respondInvestigationInvitation(
  matterId: string,
  inviteId: string,
  decision: 'Accepted' | 'Declined',
) {
  if (!isDemocracyWallWritable()) throw new Error('feature-read-only')
  if (isDemocracyDemoMode()) return respondDemocracyDemoInvitation(matterId, inviteId, decision)
  const result = await getData('/Democracy/RespondInvestigationInvite', {
    MatterID: matterId,
    InviteID: inviteId,
    Decision: decision,
  })
  if (result.Status !== 200 || !result.Data)
    throw new Error(result.Message || String(result.Status))
  return result.Data
}
