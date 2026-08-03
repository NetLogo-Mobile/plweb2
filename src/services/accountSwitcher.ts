import storageManager, { type SavedAccount, type UserAuthInfo } from '@storage/index'
import type { UserInfo } from '../pl-serve-type-main/type/main'

const MAX_SAVED_ACCOUNTS = 5

export function getSavedAccounts(): SavedAccount[] {
  return storageManager.getObj('savedAccounts').value || []
}

export function rememberAccount(user: UserInfo, auth: UserAuthInfo | null) {
  if (!user.ID || !auth?.token) return
  const next = [
    { user, auth, updatedAt: Date.now() },
    ...getSavedAccounts().filter((account) => account.user.ID !== user.ID),
  ].slice(0, MAX_SAVED_ACCOUNTS)
  storageManager.setObj('savedAccounts', next)
}

export function switchAccount(account: SavedAccount) {
  storageManager.setObj('userInfo', account.user)
  storageManager.setObj('userAuthInfo', account.auth, 30 * 24 * 60 * 60 * 1000)
}
