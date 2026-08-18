// Check the status when using storage
// If you don't need to raise a notification when storage.status!=success, try `sm.getObj("key").value?.a?.b?.c`

import type { AppLanguage } from '@i18n/index'
import type { ContentTag, UserInfo } from '../../pl-serve-type-main/type/main'

export type StorageStatus = 'success' | 'expired' | 'empty'

export interface UserConfig {
  language?: AppLanguage
  languageManuallySelected?: boolean
  mermaid?: 'on' | 'off'
  apiBaseUrl?: string
  staticBaseUrl?: string
  debugger?: 'on' | 'off' | 'export'
  autoOpenCopiedLink?: 'on' | 'off'
  [key: string]: string | boolean | undefined
}

export interface UserAuthInfo {
  token?: string
  authCode?: string
  // Kept for compatibility with login state written by older clients.
  userId?: string
  userID?: string
  ID?: string
}

export interface RequestHistoryPayload {
  userId: string
  records: Record<string, number[]>
}

export type AvatarCache = Record<string, [avatarId: number, updatedAt: number]>

export interface StorageSchema {
  userInfo: UserInfo
  tagConfig: ContentTag[]
  userConfig: UserConfig
  visitorId: string
  requestHistoryMap: RequestHistoryPayload
  apiResponseCache: Record<string, unknown>
  userIDAndAvatarIDMap: AvatarCache
  userAuthInfo: UserAuthInfo
  cookieConsent: boolean
}

export type StorageKey = keyof StorageSchema
type StringStorageKey = {
  [Key in StorageKey]: StorageSchema[Key] extends string ? Key : never
}[StorageKey]

export interface StorageResult<T> {
  status: StorageStatus
  value: T | null
}

function now() {
  return Date.now()
}

const storageManager = {
  getObj<Key extends StorageKey>(
    key: Key,
    maxAgeMs?: number,
  ): StorageResult<StorageSchema[Key]> {
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
  getStr(key: StringStorageKey, maxAgeMs?: number): StorageResult<string> {
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
  setObj<Key extends StorageKey>(key: Key, value: StorageSchema[Key], maxAgeMs?: number) {
    const data = { value, time: now(), maxAgeMs }
    localStorage.setItem(key, JSON.stringify(data))
  },
  setStr(key: StringStorageKey, value: string, maxAgeMs?: number) {
    const data = { value, time: now(), maxAgeMs }
    localStorage.setItem(key, JSON.stringify(data))
  },
  remove(key: StorageKey) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  },
}

export default storageManager
