import type { Activity, ContentSubmitSummary, ID, Result } from '../pl-serve-type-main/type/main'

export type DemocracyMatterKind = 'Public' | 'Oversight'
export type DemocracyMatterMode = 'Formal' | 'Suggestion'
export type DemocracyMatterParticipation = 'Consultation' | 'Vote'
export type DemocracyMatterScope = 'Current' | 'History'
export type DemocracyMatterStage =
  'PendingReview' | 'Questions' | 'Voting' | 'Resolved' | 'Archived' | 'Rejected'

export interface DemocracyAnonymousProfile {
  Alias: string
  CanPublish: boolean
  ModifiedAt: string
}

export interface DemocracyPermissions {
  CanDeveloperManage?: boolean
  CanContribute: boolean
  CanInitiate: boolean
  CanModerate: boolean
  CanSuggest: boolean
  CanTransition: boolean
}

export interface DemocracyContext {
  ApiVersion: 1
  Permissions: DemocracyPermissions
  Profile: DemocracyAnonymousProfile | null
}

export interface DemocracyPublicMatter {
  CanEdit: boolean
  Kind: DemocracyMatterKind
  Mode: DemocracyMatterMode
  Participation: DemocracyMatterParticipation
  Revision: string
  Stage: DemocracyMatterStage
  Summary: ContentSubmitSummary
  VoteActivity?: Activity
  VotePlan?: DemocracyVotePlan
}

export interface DemocracyVotePlan {
  FinishAt: string
  Multiple: boolean
  Options: string[]
  StartAt: string
}

export type DemocracyInvestigationInviteStatus = 'Accepted' | 'Declined' | 'Pending'

export interface DemocracyInvestigationInvite {
  CreatedAt: string
  ID: string
  Nickname: string
  Status: DemocracyInvestigationInviteStatus
  UserID: ID
}

export type DemocracyReceivedInvitation = Pick<
  DemocracyInvestigationInvite,
  'ID' | 'Status' | 'CreatedAt'
>

export interface DemocracyContribution {
  Disclosure?: { UserID: ID; Reason: string; DisclosedAt: string }
  AuthorAlias: string
  AuthorPosition: string
  Content: string
  CreatedAt: string
  ID: string
}

export type DemocracyAuditAction =
  | 'Create'
  | 'Edit'
  | 'TracePublisher'
  | 'TraceContribution'
  | 'DiscloseContribution'
  | 'RevokePublisher'
  | 'RestorePublisher'
  | 'Transition'
  | 'CreateVote'
  | 'InviteInvestigator'
  | 'RespondInvestigationInvite'
  | 'DeleteMatter'
  | 'WarnAccount'
  | 'BanAccount'
  | 'UnbanAccount'
  | 'Report'

export type DemocracyReportCategory = 'Harassment' | 'Privacy' | 'Misinformation' | 'Other'

export interface DemocracyAuditEntry {
  Action: DemocracyAuditAction
  ActorAlias: string
  CreatedAt: string
  Details: string
  ID: string
}

export interface DemocracyPublisherTrace {
  BannedUntil?: string
  Alias: string
  Banned: boolean
  CanPublish: boolean
  PublishingRevoked: boolean
  UserID: ID
}

export type DemocracyAccountAction = 'Warn' | 'Ban' | 'Unban'

export interface DemocracyApi {
  TraceContribution(q: {
    MatterID: ID
    ContributionID: string
    Reason: string
    Notify: false
  }): Promise<Result<DemocracyPublisherTrace>>
  DiscloseContribution(q: {
    MatterID: ID
    ContributionID: string
    Reason: string
  }): Promise<Result<DemocracyContribution>>
  ModerateContributionAuthor(q: {
    MatterID: ID
    ContributionID: string
    Action: DemocracyAccountAction
    Reason: string
    BanDays?: number
  }): Promise<Result<{ Banned: boolean; CanPublish: boolean; BannedUntil?: string }>>
  GetInvestigationInvite(q: {
    MatterID: ID
    InviteID: string
  }): Promise<Result<DemocracyReceivedInvitation>>
  RespondInvestigationInvite(q: {
    MatterID: ID
    InviteID: string
    Decision: 'Accepted' | 'Declined'
  }): Promise<Result<DemocracyReceivedInvitation>>
  GetContext(q: Record<string, never>): Promise<Result<DemocracyContext>>
  QueryMatters(q: {
    Scope: DemocracyMatterScope
    Skip: number
    Take: number
  }): Promise<Result<{ Entries: DemocracyPublicMatter[] }>>
  GetMatter(q: { MatterID: ID }): Promise<Result<DemocracyPublicMatter>>
  SubmitMatter(q: {
    Alias: string
    ClientRequestID: string
    Description: string
    Kind: DemocracyMatterKind
    Mode: DemocracyMatterMode
    Participation: DemocracyMatterParticipation
    Subject: string
    VotePlan?: DemocracyVotePlan
  }): Promise<Result<DemocracyPublicMatter>>
  UpdateMatter(q: {
    Description: string
    ExpectedRevision: string
    MatterID: ID
    Participation: DemocracyMatterParticipation
    Subject: string
    VotePlan?: DemocracyVotePlan
  }): Promise<Result<DemocracyPublicMatter>>
  ModeratePublisher(q: {
    MatterID: ID
    Reason: string
    Revoked: boolean
  }): Promise<Result<{ CanPublish: boolean; Revoked: boolean }>>
  ModerateAccount(q: {
    BanDays?: number
    Action: DemocracyAccountAction
    MatterID: ID
    Reason: string
  }): Promise<Result<{ Banned: boolean; CanPublish: boolean; BannedUntil?: string }>>
  DeleteMatter(q: { MatterID: ID; Reason: string }): Promise<Result<{ Deleted: boolean }>>
  TracePublisher(q: {
    MatterID: ID
    Reason: string
    Notify: false
  }): Promise<Result<DemocracyPublisherTrace>>
  QueryAudit(q: { MatterID: ID }): Promise<Result<{ Entries: DemocracyAuditEntry[] }>>
  QueryInvestigationTeam(q: {
    MatterID: ID
  }): Promise<Result<{ Entries: DemocracyInvestigationInvite[] }>>
  InviteInvestigator(q: {
    MatterID: ID
    Reason: string
    UserID: ID
  }): Promise<Result<DemocracyInvestigationInvite>>
  QueryContributions(q: {
    MatterID: ID
    Skip: number
    Take: number
  }): Promise<Result<{ Entries: DemocracyContribution[] }>>
  SubmitContribution(q: {
    ClientRequestID: string
    Content: string
    MatterID: ID
  }): Promise<Result<DemocracyContribution>>
  ReportMatter(q: {
    Category: DemocracyReportCategory
    ClientRequestID: string
    Details: string
    MatterID: ID
  }): Promise<Result<{ Accepted: boolean }>>
  TransitionMatter(q: {
    ExpectedStage: DemocracyMatterStage
    MatterID: ID
    Reason: string
    TargetStage: DemocracyMatterStage
  }): Promise<Result<DemocracyPublicMatter>>
  CreateVote(q: {
    ExpectedStage: DemocracyMatterStage
    FinishDate: string
    MatterID: ID
    Multiple: boolean
    Options: string[]
    Reason: string
  }): Promise<Result<DemocracyPublicMatter>>
}
