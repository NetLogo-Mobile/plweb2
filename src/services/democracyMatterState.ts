import type { DemocracyMatterParticipation, DemocracyMatterStage } from './democracyWallContract'

export function isDemocracyHistoryStage(stage: DemocracyMatterStage) {
  return stage === 'Resolved' || stage === 'Archived' || stage === 'Rejected'
}

export function democracyTransitionTargets(
  stage: DemocracyMatterStage,
  participation: DemocracyMatterParticipation,
): DemocracyMatterStage[] {
  switch (stage) {
    case 'PendingReview':
      return ['Questions', 'Rejected']
    case 'Questions':
      return participation === 'Vote' ? ['Voting', 'Rejected'] : ['Resolved', 'Rejected']
    case 'Voting':
      return ['Resolved']
    case 'Resolved':
      return ['Archived']
    default:
      return []
  }
}
