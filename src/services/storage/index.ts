// Check the status when using storage
// If you don't need to raise a notification when storage.status!=success, try `sm.getObj("key").value?.a?.b?.c`

type StorageStatus = "success" | "expired" | "empty";
type localStorages =
  | "userInfo"
  | "tagConfig"
  | "userConfig"
  | "visitorId"
  | "requestHistoryMap"
  | "userIDAndAvatarIDMap"
  | "userAuthInfo";

interface StorageResult<T> {
  status: StorageStatus;
  value: T | null;
}

function now() {
  return Date.now();
}

const storageManager = {
  getObj(key: localStorages, maxAgeMs?: number): StorageResult<any> {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { status: "empty", value: null };
      const { value, time, maxAgeMs: savedMaxAgeMs } = JSON.parse(raw);
      const ageLimit = maxAgeMs ?? savedMaxAgeMs;
      if (ageLimit && time && now() - time > ageLimit) {
        return { status: "expired", value: null };
      }
      return { status: "success", value };
    } catch (e) {
      console.error(e);
      return { status: "empty", value: null };
    }
  },
  getStr(key: localStorages, maxAgeMs?: number): StorageResult<string> {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { status: "empty", value: null };
      let obj;
      try {
        obj = JSON.parse(raw);
      } catch {
        obj = { value: raw, time: undefined, maxAgeMs: undefined };
      }
      const ageLimit = maxAgeMs ?? obj.maxAgeMs;
      if (ageLimit && obj.time && now() - obj.time > ageLimit) {
        return { status: "expired", value: null };
      }
      return { status: "success", value: obj.value ?? raw };
    } catch (e) {
      console.error(e);
      return { status: "empty", value: null };
    }
  },
  setObj(key: localStorages, value: any, maxAgeMs?: number) {
    const data = { value, time: now(), maxAgeMs };
    localStorage.setItem(key, JSON.stringify(data));
  },
  setStr(key: localStorages, value: string, maxAgeMs?: number) {
    const data = { value, time: now(), maxAgeMs };
    localStorage.setItem(key, JSON.stringify(data));
  },
  remove(key: localStorages) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
};

export default storageManager;
