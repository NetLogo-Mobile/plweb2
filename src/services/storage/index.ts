// Check the status when using storage
// If you don't need to raise a notification when storage.status!=success, try `sm.getObj("key").value?.a?.b?.c`

type StorageStatus = 'success' | 'expired' | 'empty'
type localStorages =
  | 'userInfo'
  | 'tagConfig'
  | 'userConfig'
  | 'visitorId'
  | 'requestHistoryMap'
  | 'apiResponseCache'
  | 'userIDAndAvatarIDMap'
  | 'userAuthInfo'
  | 'cookieConsent'
  | 'notificationsCache'

interface StorageResult<T> {
  status: StorageStatus
  value: T | null
}

const IDB_DB_NAME = 'plweb2-storage-db'
const IDB_STORE_NAME = 'kv'

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readonly')
    const store = tx.objectStore(IDB_STORE_NAME)
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite')
    const store = tx.objectStore(IDB_STORE_NAME)
    store.put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function now() {
  return Date.now()
}

const storageManager = {
  getObj(key: localStorages, maxAgeMs?: number): StorageResult<any> {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return { status: 'empty', value: null }
      const { value, time, maxAgeMs: savedMaxAgeMs } = JSON.parse(raw)
      const ageLimit = maxAgeMs ?? savedMaxAgeMs
      if (ageLimit && time && now() - time > ageLimit) {
        return { status: 'expired', value: null }
      }
      return { status: 'success', value }
    } catch (e) {
      console.error(e)
      return { status: 'empty', value: null }
    }
  },
  getStr(key: localStorages, maxAgeMs?: number): StorageResult<string> {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return { status: 'empty', value: null }
      let obj
      try {
        obj = JSON.parse(raw)
      } catch {
        obj = { value: raw, time: undefined, maxAgeMs: undefined }
      }
      const ageLimit = maxAgeMs ?? obj.maxAgeMs
      if (ageLimit && obj.time && now() - obj.time > ageLimit) {
        return { status: 'expired', value: null }
      }
      return { status: 'success', value: obj.value ?? raw }
    } catch (e) {
      console.error(e)
      return { status: 'empty', value: null }
    }
  },
  setObj(key: localStorages, value: any, maxAgeMs?: number) {
    const data = { value, time: now(), maxAgeMs }
    localStorage.setItem(key, JSON.stringify(data))
  },
  setStr(key: localStorages, value: string, maxAgeMs?: number) {
    const data = { value, time: now(), maxAgeMs }
    localStorage.setItem(key, JSON.stringify(data))
  },
  remove(key: localStorages) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  },
  async getObjFromIDB<T>(key: string, maxAgeMs?: number): Promise<StorageResult<T>> {
    try {
      const data = await idbGet<{ value: T; time: number; maxAgeMs?: number }>(key)
      if (!data) return { status: 'empty', value: null }
      const ageLimit = maxAgeMs ?? data.maxAgeMs
      if (ageLimit && data.time && now() - data.time > ageLimit) {
        return { status: 'expired', value: null }
      }
      return { status: 'success', value: data.value }
    } catch (e) {
      console.error(e)
      return { status: 'empty', value: null }
    }
  },
  async setObjToIDB<T>(key: string, value: T, maxAgeMs?: number): Promise<void> {
    const data = { value, time: now(), maxAgeMs }
    await idbSet(key, data)
  },
}

export default storageManager
