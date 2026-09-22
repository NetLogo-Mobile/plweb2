import type { DemocracyMatterStage } from './democracyWallContract'

const MATTER_ID = /^[a-f0-9]{24}$/i

export function getDemocracyNotificationTarget(fields?: Record<string, unknown> | null) {
  if (!fields) return null
  const matterId = fields.DemocracyMatterID ?? fields.MatterID
  if (typeof matterId !== 'string' || !MATTER_ID.test(matterId)) return null

  const stage = fields.DemocracyStage as DemocracyMatterStage | undefined
  const query = new URLSearchParams()
  const inviteId = fields.DemocracyInviteID
  if (
    fields.DemocracyEvent === 'InvestigationInvite' &&
    typeof inviteId === 'string' &&
    /^[a-z0-9-]{1,80}$/i.test(inviteId)
  ) {
    query.set('invitation', inviteId)
  }
  if (stage === 'Voting') query.set('stage', 'vote')
  if (stage === 'Resolved' || stage === 'Archived') query.set('scope', 'history')
  const suffix = query.size ? `?${query.toString()}` : ''
  return `/d/matter/${matterId}${suffix}`
}
