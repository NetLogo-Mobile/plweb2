import i18n from "@i18n/index";
import { getData } from "@services/api/getData.ts";
import storageManager from "@storage/index.ts";
import type {
  Category,
  ExperimentQuery,
  Result,
  Summary,
  UserInfo,
  Workspace,
} from "@services/../pl-serve-type-main/type/main";

export type EditorWork = {
  id: string;
  contentId: string;
  category: Category;
  subject: string;
  markdown: string;
  language: string;
  rawSummary: Summary;
};

export type SaveEditorWorkResult = {
  requestBody: Record<string, unknown>;
  response: Result<Summary> | Result<unknown>;
};

const EDITABLE_VERIFICATIONS = new Set(["Editor", "Administrator"]);

function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params || {}) as string;
}

function getCurrentUser(): UserInfo | null {
  return storageManager.getObj("userInfo").value as UserInfo | null;
}

export function getCurrentUserId(): string {
  return getCurrentUser()?.ID || "";
}

export function canEditSummary(summary: Summary): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser?.ID) return false;
  if (summary.User?.ID === currentUser.ID) return true;
  if (summary.Coauthors?.some((user) => user.ID === currentUser.ID)) return true;
  return EDITABLE_VERIFICATIONS.has(String(currentUser.Verification || ""));
}

function normalizeDescription(description: Summary["Description"]): string {
  if (Array.isArray(description)) return description.join("\n");
  return "";
}

function toEditorWork(summary: Summary): EditorWork {
  return {
    id: summary.ID,
    contentId: summary.ContentID || summary.ID,
    category: summary.Category || "Discussion",
    subject: summary.Subject || t("royterEditor.untitled"),
    markdown: normalizeDescription(summary.Description),
    language: summary.Language || "Chinese",
    rawSummary: summary,
  };
}

async function fetchSummary(category: Category, id: string): Promise<Summary> {
  const res = await getData("/Contents/GetSummary", {
    ContentID: id,
    Category: category,
  });
  if (res.Status !== 200 || !res.Data) {
    throw new Error(
      res.Message || t("royterEditor.readSummaryFailed", { status: res.Status }),
    );
  }
  return res.Data;
}

export async function fetchEditableWorks(take = 50): Promise<EditorWork[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const query: ExperimentQuery = {
    Category: "Discussion",
    Languages: [],
    ExcludeLanguages: [],
    Tags: [],
    ExcludeTags: [],
    ModelTags: [],
    ModelID: undefined,
    ParentID: undefined,
    UserID: userId,
    Special: null,
    From: undefined,
    Skip: 0,
    Take: take,
    Days: 0,
    Sort: 0,
    ShowAnnouncement: false,
  };

  const res = await getData("/Contents/QueryExperiments", { Query: query });
  if (res.Status !== 200) {
    throw new Error(
      res.Message || t("royterEditor.fetchWorksFailed", { status: res.Status }),
    );
  }

  const summaries = res.Data?.$values || [];
  const detailed = await Promise.all(
    summaries.map((item) => fetchSummary((item.Category || "Discussion") as Category, item.ID)),
  );
  return detailed.filter(canEditSummary).map(toEditorWork);
}

export async function fetchWorkspace(work: EditorWork): Promise<Workspace | null> {
  const res = await getData("/Contents/GetWorkspace", {
    ContentID: work.contentId,
    Language: work.language || "Chinese",
  });
  if (res.Status !== 200) {
    throw new Error(
      res.Message || t("royterEditor.readWorkspaceFailed", { status: res.Status }),
    );
  }
  return res.Data || null;
}

export async function saveEditorWork(
  work: EditorWork,
  markdown: string,
  subject: string,
): Promise<SaveEditorWorkResult> {
  if (!canEditSummary(work.rawSummary)) {
    throw new Error(t("royterEditor.noPermission"));
  }

  const workspace = await fetchWorkspace(work);
  const summary: Summary = {
    ...work.rawSummary,
    Subject: subject.trim() || work.subject,
    Description: markdown.split("\n"),
    Language: work.language as Summary["Language"],
  };

  const requestBody: Record<string, unknown> = {
    Summary: summary,
    Workspace: workspace ? { ...workspace, Summary: null } : null,
  };

  const response = (await getData(
    "/Contents/SubmitExperiment" as any,
    requestBody,
  )) as Result<Summary>;
  if (response.Status !== 200) {
    throw new Error(
      response.Message ||
        t("royterEditor.saveWorkFailed", { status: response.Status }),
    );
  }

  work.subject = summary.Subject || work.subject;
  work.markdown = markdown;
  work.rawSummary = summary;

  return { requestBody, response };
}
