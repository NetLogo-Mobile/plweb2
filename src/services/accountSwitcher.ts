import storageManager, { type SavedAccount, type UserAuthInfo } from '@storage/index'
import type { UserInfo } from '../pl-serve-type-main/type/main'

const MAX_SAVED_ACCOUNTS = 5
const AUTH_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function getSavedAccounts(): SavedAccount[] {
  const accounts = storageManager.getObj('savedAccounts').value || []
  const now = Date.now()
  const activeAccounts = accounts.filter(
    (account) => account.updatedAt > 0 && now - account.updatedAt < AUTH_TTL_MS,
  )
  if (activeAccounts.length !== accounts.length) {
    if (activeAccounts.length === 0) storageManager.remove('savedAccounts')
    else {
      const remainingTtl = Math.max(
        ...activeAccounts.map((account) => account.updatedAt + AUTH_TTL_MS - now),
      )
      storageManager.setObj('savedAccounts', activeAccounts, remainingTtl)
    }
  }
  return activeAccounts
}

export function rememberAccount(user: UserInfo, auth: UserAuthInfo | null) {
  if (!user.ID || !auth?.token) return
  const next = [
    { user, auth, updatedAt: Date.now() },
    ...getSavedAccounts().filter((account) => account.user.ID !== user.ID),
  ].slice(0, MAX_SAVED_ACCOUNTS)
  storageManager.setObj('savedAccounts', next, AUTH_TTL_MS)
}

export function switchAccount(account: SavedAccount) {
  storageManager.setObj('userInfo', account.user)
  storageManager.setObj('userAuthInfo', account.auth, AUTH_TTL_MS)
}
