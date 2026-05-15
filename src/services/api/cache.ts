import storageManager from '@storage/index.ts'

type CacheEntry<T = unknown> = {
  value: T
}

type CacheBucket = Record<string, CacheEntry>

const API_CACHE_KEY = 'apiResponseCache'
const API_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000

function readCacheBucket(): CacheBucket {
  const result = storageManager.getObj(API_CACHE_KEY, API_CACHE_MAX_AGE)
  if (result.status !== 'success' || !result.value) {
    return {}
  }
  return result.value as CacheBucket
}

function writeCacheBucket(bucket: CacheBucket) {
  storageManager.setObj(API_CACHE_KEY, bucket, API_CACHE_MAX_AGE)
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
  const userAuthInfo = storageManager.getObj('userAuthInfo').value
  return (
    userInfo?.ID ||
    userAuthInfo?.userId ||
    userAuthInfo?.userID ||
    userAuthInfo?.ID ||
    userAuthInfo?.token ||
    'anonymous'
  )
}

export function buildApiCacheKey(path: string, body?: unknown): string {
  return `${getActiveUserKey()}::${path}::${stableStringify(body ?? null)}`
}

export function readApiCache<T>(path: string, body?: unknown): T | null {
  const bucket = readCacheBucket()
  const entry = bucket[buildApiCacheKey(path, body)]
  if (!entry) return null
  return entry.value as T
}

export function writeApiCache(path: string, body: unknown, value: unknown) {
  const bucket = readCacheBucket()
  bucket[buildApiCacheKey(path, body)] = {
    value,
  }
  writeCacheBucket(bucket)
}
