import type { MessageReactive } from "naive-ui";
import translateErrorMessage from "@i18n/translateErrorMessage.ts";
import storageManager from "@storage/index.ts";
import { showMessage } from "@popup/naiveui.ts";

let messageRef: MessageReactive;

interface IResponse {
  Status: number;
  Message: string;
  Data: any;
}
interface IIntercetporResponse {
  continue: boolean;
  data: IResponse | null;
}

const noMessagesPath = ["/Users/GetUser"];
const noDestroyPath = ["Quantum.Models.Packages.UserPackage, Quantum Models"];

const initialHistoryResult = storageManager.getObj("requestHistoryMap");
const initialHistory =
  initialHistoryResult.status === "success" && initialHistoryResult.value
    ? initialHistoryResult.value
    : {};
const requestHistoryMap = new Map<string, number[]>(
  Object.entries(initialHistory),
);

function rateLimit(path: string): boolean {
  const history = requestHistoryMap.get(path) || [];
  if (history.length === 0) return false;

  if (!requestHistoryMap.has(path)) {
    requestHistoryMap.set(path, [Date.now()]);
    return false;
  }

  if (history.length > 10) {
    requestHistoryMap.set(path, history.slice(1));
  }

  switch (path) {
    case "/Messages/PostComment": {
      const list = history;
      let n = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        n++;
        const ts = list[i];
        if (ts !== undefined && Math.sqrt(Date.now() / 1000 - ts / 1000) < n) {
          return true;
        }
      }
    }
  }
  requestHistoryMap.set(path, [...history, Date.now()]);
  storageManager.setObj(
    "requestHistoryMap",
    Object.fromEntries(requestHistoryMap),
    2 * 24 * 60 * 60 * 1000,
  );
  return false;
}

export function beforeRequest(path: string): IIntercetporResponse {
  if (rateLimit(path)) {
    return {
      continue: false,
      data: { Status: -1001, Message: "连接失败，请稍候重试", Data: null },
    };
  }
  if (!noMessagesPath.some((p) => path === p))
    messageRef = showMessage("loading", "loading...", {
      duration: 6000,
    });
  return { continue: true, data: null };
}

export function afterRequest(response: IResponse): IIntercetporResponse {
  let re = response;
  if (response.Status !== 200) {
    re.Message = translateErrorMessage(response.Message);
  }
  if (messageRef && re.Data && !noDestroyPath.some((p) => re.Data.$type === p)) messageRef.destroy();
  return {
    continue: false,
    data: re,
  };
}
