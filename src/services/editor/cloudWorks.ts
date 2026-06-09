import i18n from '@i18n/index'
import { getData } from '@services/api/getData.ts'
import storageManager from '@storage/index.ts'
import type {
  Category,
  ExperimentQuery,
  Result,
  Summary,
  SummaryTag,
  UserInfo,
  Workspace,
} from '@services/../pl-serve-type-main/type/main'

export type EditorWork = {
  id: string
  contentId: string
  category: Category
  subject: string
  markdown: string
  language: string
  tags: SummaryTag[]
  rawSummary?: Summary
}

export type publishEditorWorkResult = {
  requestBody: Record<string, unknown>
  response: Result<unknown>
  updatedWork: EditorWork
}

export type CategoryCursor = {
  category: Category
  from?: string
}

export type FetchWorksResult = {
  works: EditorWork[]
  hasMore: boolean
  cursors: CategoryCursor[]
}

const EDITABLE_VERIFICATIONS = new Set(['Editor', 'Administrator'])

function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params || {}) as string
}

function getCurrentUser(): UserInfo | null {
  return storageManager.getObj('userInfo').value as UserInfo | null
}

export function getCurrentUserId(): string {
  return getCurrentUser()?.ID || ''
}

export function canEditSummary(summary: Summary): boolean {
  const currentUser = getCurrentUser()
  if (!currentUser?.ID) return false
  if (summary.User?.ID === currentUser.ID) return true
  if (summary.Coauthors?.some((user) => user.ID === currentUser.ID)) return true
  return EDITABLE_VERIFICATIONS.has(String(currentUser.Verification || ''))
}

function normalizeDescription(description: Summary['Description']): string {
  if (Array.isArray(description)) return description.join('\n')
  return ''
}

function toEditorWork(summary: Summary): EditorWork {
  return {
    id: summary.ID,
    contentId: summary.ContentID || summary.ID,
    category: summary.Category || 'Discussion',
    subject: summary.Subject || t('mdEditor.untitled'),
    markdown: normalizeDescription(summary.Description),
    language: summary.Language || 'Chinese',
    tags: summary.Tags || [],
    rawSummary: summary,
  }
}

async function fetchSummary(category: Category, id: string): Promise<Summary> {
  const res = await getData('/Contents/GetSummary', {
    ContentID: id,
    Category: category,
  })
  if (res.Status !== 200 || !res.Data) {
    throw new Error(res.Message || t('mdEditor.readSummaryFailed', { status: res.Status }))
  }
  return res.Data
}

async function queryCategory(
  userId: string,
  category: Category,
  from: string | undefined,
  take: number,
): Promise<{ summaries: Summary[]; lastId: string }> {
  const query: ExperimentQuery = {
    Category: category,
    Languages: [],
    ExcludeLanguages: [],
    Tags: [],
    ExcludeTags: [],
    ModelTags: [],
    ModelID: undefined,
    ParentID: undefined,
    UserID: userId,
    Special: null,
    From: from || null,
    Skip: 0,
    Take: take,
    Days: 0,
    Sort: 0,
    ShowAnnouncement: false,
  }

  const res = await getData('/Contents/QueryExperiments', { Query: query })
  if (res.Status !== 200) {
    throw new Error(res.Message || t('mdEditor.fetchWorksFailed', { status: res.Status }))
  }

  const summaries: Summary[] = res.Data?.$values || []
  const lastId = summaries.length > 0 ? summaries[summaries.length - 1].ID : from || ''
  return { summaries, lastId }
}

export async function fetchEditableWorks(
  cursors: CategoryCursor[],
  take = 20,
): Promise<FetchWorksResult> {
  const userId = getCurrentUserId()
  if (!userId) return { works: [], hasMore: false, cursors: [] }

  const cats = cursors.length ? cursors : [{ category: 'Discussion' as Category }]

  const results = await Promise.all(
    cats.map((c) => queryCategory(userId, c.category, c.from, take)),
  )

  const allSummaries = results.flatMap((r) => r.summaries)
  const works = allSummaries.filter(canEditSummary).map(toEditorWork)
  const hasMore = results.some((r) => r.summaries.length >= take)

  const nextCursors: CategoryCursor[] = cats.map((c, i) => ({
    category: c.category,
    from: results[i].lastId,
  }))

  return { works, hasMore, cursors: nextCursors }
}

export async function fetchEditableWork(category: Category, id: string): Promise<EditorWork> {
  const summary = await fetchSummary(category, id)
  if (!canEditSummary(summary)) {
    throw new Error(t('mdEditor.noPermission'))
  }
  return toEditorWork(summary)
}

export async function loadWorkDetail(work: EditorWork): Promise<EditorWork> {
  const summary = await fetchSummary(work.category, work.id)
  return {
    ...toEditorWork(summary),
    contentId: summary.ContentID || summary.ID,
  }
}

export async function fetchWorkspace(work: EditorWork): Promise<Workspace | null> {
  const res = await getData('/Contents/GetWorkspace', {
    ContentID: work.contentId,
    Language: work.language || 'Chinese',
  })
  if (res.Status !== 200) {
    throw new Error(res.Message || t('mdEditor.readWorkspaceFailed', { status: res.Status }))
  }
  return res.Data || null
}

export async function publishEditorWork(
  work: EditorWork,
  markdown: string,
  subject: string,
): Promise<publishEditorWorkResult> {
  if (!work.rawSummary) {
    throw new Error(t('mdEditor.noPermission'))
  }
  if (!canEditSummary(work.rawSummary)) {
    throw new Error(t('mdEditor.noPermission'))
  }

  const workspace = await fetchWorkspace(work)
  const summary: Summary = {
    ...work.rawSummary,
    Subject: subject.trim() || work.subject,
    Description: markdown.split('\n'),
    Language: work.language as Summary['Language'],
  }

  const requestBody: Record<string, unknown> = {
    Summary: summary,
    Workspace: workspace ? { ...workspace, Summary: null } : null,
  }

  const response = (await getData(
    '/Contents/SubmitExperiment',
    requestBody as any,
  )) as unknown as Result<Summary>
  if (response.Status !== 200) {
    throw new Error(response.Message || t('mdEditor.saveWorkFailed', { status: response.Status }))
  }

  const updatedWork: EditorWork = {
    ...work,
    subject: summary.Subject || work.subject,
    markdown,
    tags: summary.Tags || [],
    rawSummary: summary,
  }

  return { requestBody, response, updatedWork }
}
