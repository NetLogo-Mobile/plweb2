import type { MessageReactive } from "naive-ui";

import storageManager from "@storage/index.ts";
import { showMessage } from "@popup/naiveui.ts";
import i18n from "@i18n/index.ts";

let messageRef: MessageReactive;

import type { Result } from "src/pl-serve-type-main/type/main";

interface IIntercetporResponse {
  continue: boolean;
  data: Result | null;
}

const RATE_LIMIT_STATUS = 429;
const RATE_LIMIT_MESSAGE = "Server.Offline";

// No loading message for these paths
const noMessagesPath = ["/Users/GetUser","/Messages/PostComment"];
const noDestroyPath = ["Quantum.Models.Packages.UserPackage, Quantum Models"];

type RequestHistoryPayload = {
  userId: string;
  records: Record<string, number[]>;
};

function getUserId(): string {
  const userInfo = storageManager.getObj("userInfo").value;
  const userAuthInfo = storageManager.getObj("userAuthInfo").value;
  return (
    userInfo?.ID ||
    userAuthInfo?.userId ||
    userAuthInfo?.userID ||
    userAuthInfo?.ID ||
    "anonymous"
  );
}

function normalizeHistoryPayload(raw: unknown): RequestHistoryPayload {
  if (
    raw &&
    typeof raw === "object" &&
    "records" in raw &&
    (raw as RequestHistoryPayload).records
  ) {
    const payload = raw as RequestHistoryPayload;
    return {
      userId: payload.userId || "anonymous",
      records: payload.records,
    };
  }

  return {
    userId: "anonymous",
    records: (raw as Record<string, number[]>) || {},
  };
}

const initialHistoryResult = storageManager.getObj("requestHistoryMap");
const initialPayload =
  initialHistoryResult.status === "success" && initialHistoryResult.value
    ? normalizeHistoryPayload(initialHistoryResult.value)
    : { userId: getUserId(), records: {} };
let activeUserId = initialPayload.userId;
const requestHistoryMap = new Map<string, number[]>(
  Object.entries(initialPayload.records),
);

function persistHistory() {
  storageManager.setObj(
    "requestHistoryMap",
    {
      userId: activeUserId,
      records: Object.fromEntries(requestHistoryMap),
    },
    2 * 24 * 60 * 60 * 1000,
  );
}

function syncUserHistory(userId: string) {
  if (activeUserId === userId) return;
  activeUserId = userId;
  requestHistoryMap.clear();
  persistHistory();
}

function rateLimit(path: string, userId: string): boolean {
  if (path !== "/Messages/PostComment") return false;

  syncUserHistory(userId);
  const historyKey = `${userId}:${path}`;
  const history = requestHistoryMap.get(historyKey) || [];
  if (history.length === 0) {
    requestHistoryMap.set(historyKey, [Date.now()]);
    persistHistory();
    return false;
  }

  if (history.length > 10) {
    requestHistoryMap.set(historyKey, history.slice(1));
  }

  const list = history;
  let n = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    n++;
    const ts = list[i];
    if (ts !== undefined && Math.sqrt(Date.now() / 1000 - ts / 1000) < n) {
      return true;
    }
  }

  requestHistoryMap.set(historyKey, [...history, Date.now()]);
  persistHistory();
  return false;
}

function rateLimitResponse(): Result {
  return {
    Status: RATE_LIMIT_STATUS,
    Message: RATE_LIMIT_MESSAGE,
    Data: {
      i18nKey: "ui.messages.rateLimitExceeded",
    },
  };
}

export function isRateLimitResponse(response: unknown): boolean {
  const data = (response as Result)?.Data as { i18nKey?: string } | null;
  return (
    !!response &&
    typeof response === "object" &&
    (response as Result).Status === RATE_LIMIT_STATUS &&
    (response as Result).Message === RATE_LIMIT_MESSAGE &&
    data?.i18nKey === "ui.messages.rateLimitExceeded"
  );
}

export function beforeRequest(path: string): IIntercetporResponse {
  const userId = getUserId();
  if (rateLimit(path, userId)) {
    return {
      continue: false,
      data: rateLimitResponse(),
    };
  }

  if (!noMessagesPath.some((p) => path === p))
    messageRef = showMessage("loading", i18n.global.t("ui.messages.loading"), {
      duration: 6000,
    });
  return { continue: true, data: null };
}

export function afterRequest(response: Result): IIntercetporResponse {
  const re = response;
  if (messageRef && re.Data && !noDestroyPath.some((p) => re.Data.$type === p))
    messageRef.destroy();
  // re.Status = 400;
  //  For testing purpose
  return {
    continue: false,
    data: re,
  };
}
