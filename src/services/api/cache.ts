import storageManager from '@storage/index.ts'

interface StoredEntry {
  cacheKey: string
  value: unknown
  timestamp: number
  size: number
}

const DB_NAME = 'plweb-api-cache'
const DB_VERSION = 2

const OFFLINE_STORE = 'offlineCache'
const USER_STORE = 'userCache'

const OFFLINE_MAX_ENTRIES = 200
const OFFLINE_MAX_BYTES = 4 * 1024 * 1024
const OFFLINE_MAX_AGE = 15 * 24 * 60 * 60 * 1000

const USER_CACHE_MAX_AGE = 5 * 60 * 1000

// One-time cleanup of the old localStorage-based cache.
if (localStorage.getItem('apiResponseCache')) {
  localStorage.removeItem('apiResponseCache')
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (db.objectStoreNames.contains('entries')) {
        db.deleteObjectStore('entries')
      }
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        const store = db.createObjectStore(OFFLINE_STORE, { keyPath: 'cacheKey' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
      if (!db.objectStoreNames.contains(USER_STORE)) {
        const store = db.createObjectStore(USER_STORE, { keyPath: 'cacheKey' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
  return dbPromise
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`
}

function getActiveUserKey(): string {
  const userInfo = storageManager.getObj('userInfo').value
  return userInfo?.ID || 'anonymous'
}

export function buildApiCacheKey(path: string, body?: unknown): string {
  return `${getActiveUserKey()}::${path}::${stableStringify(body ?? null)}`
}

function getStoredSize(value: unknown): number {
  return new Blob([JSON.stringify(value)]).size
}

// ── Offline cache (fallback on network error, long TTL + eviction) ──

async function evictOfflineEntries(justWrittenKey: string): Promise<void> {
  let db: IDBDatabase
  try {
    db = await openDB()
  } catch {
    return
  }

  const transaction = db.transaction(OFFLINE_STORE, 'readonly')
  const store = transaction.objectStore(OFFLINE_STORE)
  const countRequest = store.count()
  const allRequest = store.getAll()

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })

  let totalCount = countRequest.result
  const allEntries = allRequest.result as StoredEntry[]

  let totalSize = allEntries.reduce((sum, e) => sum + (e.size || 0), 0)

  if (totalCount <= OFFLINE_MAX_ENTRIES && totalSize <= OFFLINE_MAX_BYTES) return

  allEntries.sort((a, b) => a.timestamp - b.timestamp)

  const writeTx = db.transaction(OFFLINE_STORE, 'readwrite')
  const writeStore = writeTx.objectStore(OFFLINE_STORE)

  for (const entry of allEntries) {
    if (totalCount <= OFFLINE_MAX_ENTRIES && totalSize <= OFFLINE_MAX_BYTES) break
    if (entry.cacheKey === justWrittenKey) continue
    writeStore.delete(entry.cacheKey)
    totalCount--
    totalSize -= entry.size || 0
  }

  return new Promise((resolve, reject) => {
    writeTx.oncomplete = () => resolve()
    writeTx.onerror = () => reject(writeTx.error)
  })
}

export async function readOfflineCache<T>(path: string, body?: unknown): Promise<T | null> {
  const key = buildApiCacheKey(path, body)
  let db: IDBDatabase
  try {
    db = await openDB()
  } catch {
    return null
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(OFFLINE_STORE, 'readwrite')
    const store = transaction.objectStore(OFFLINE_STORE)
    const request = store.get(key)

    request.onsuccess = () => {
      const entry = request.result as StoredEntry | undefined
      if (!entry) {
        resolve(null)
        return
      }
      if (Date.now() - entry.timestamp > OFFLINE_MAX_AGE) {
        store.delete(key)
        resolve(null)
        return
      }
      resolve(entry.value as T)
    }
    request.onerror = () => resolve(null)
  })
}

export async function writeOfflineCache(path: string, body: unknown, value: unknown): Promise<void> {
  const key = buildApiCacheKey(path, body)
  const entry: StoredEntry = {
    cacheKey: key,
    value,
    timestamp: Date.now(),
    size: getStoredSize(value),
  }

  let db: IDBDatabase
  try {
    db = await openDB()
  } catch {
    return
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(OFFLINE_STORE, 'readwrite')
    const store = transaction.objectStore(OFFLINE_STORE)
    store.put(entry)
    transaction.oncomplete = () => {
      evictOfflineEntries(key)
      resolve()
    }
    transaction.onerror = () => resolve()
  })
}

// ── User cache (short TTL, for GetUser reads) ──

export async function readUserCache<T>(path: string, body?: unknown): Promise<T | null> {
  const key = buildApiCacheKey(path, body)
  let db: IDBDatabase
  try {
    db = await openDB()
  } catch {
    return null
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(USER_STORE, 'readwrite')
    const store = transaction.objectStore(USER_STORE)
    const request = store.get(key)

    request.onsuccess = () => {
      const entry = request.result as StoredEntry | undefined
      if (!entry) {
        resolve(null)
        return
      }
      if (Date.now() - entry.timestamp > USER_CACHE_MAX_AGE) {
        store.delete(key)
        resolve(null)
        return
      }
      resolve(entry.value as T)
    }
    request.onerror = () => resolve(null)
  })
}

export async function writeUserCache(path: string, body: unknown, value: unknown): Promise<void> {
  const key = buildApiCacheKey(path, body)
  const entry: StoredEntry = {
    cacheKey: key,
    value,
    timestamp: Date.now(),
    size: 0,
  }

  let db: IDBDatabase
  try {
    db = await openDB()
  } catch {
    return
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(USER_STORE, 'readwrite')
    const store = transaction.objectStore(USER_STORE)
    store.put(entry)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => resolve()
  })
}
