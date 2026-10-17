import { getData } from './api/getData'
import storageManager from './storage'
import { setAvatarCache } from './getUserCurentAvatarByID'
import { removeToken } from './utils'
import type { UploadRequest, UploadToken, UserInfo } from '../pl-serve-type-main/type/main'

/**
 * Upyun 上传入口。头像与封面共用同一个 bucket（qphysics）。
 * Upyun upload endpoint. Avatars and covers share the same bucket (qphysics).
 */
const UPYUN_ENDPOINT = 'https://v0.api.upyun.com'

/**
 * 后端 RequestAvatar 的硬限制：文件超过 1MB 直接拒绝（Upload.Illegal）。
 * Hard limit enforced by the backend RequestAvatar: files over 1MB are rejected.
 */
const MAX_AVATAR_FILE_SIZE = 1024 * 1024

/**
 * 允许的图片 MIME 白名单。后端按扩展名（jpg/png/webp）硬校验；
 * 空 type（部分拖拽来源或旧浏览器）不属于任何白名单项，同样拒绝。
 * Allowed image MIME allowlist. The backend hard-validates the extension
 * (jpg/png/webp); an empty type (some drag-drop or legacy sources) matches
 * no allowlist entry and is rejected as well.
 */
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * 本地校验失败的错误码，视图层据此选择提示文案。
 * Error codes for local validation failures; the view picks the toast text.
 */
export const AVATAR_FILE_TYPE_INVALID = 'Avatar.File.Type.Invalid'
export const AVATAR_FILE_SIZE_EXCEEDED = 'Avatar.File.Size.Exceeded'

/**
 * 双分支上传：RequestHost 有值时是 Aliyun OSS 表单上传（RequestURI 是对象 key），
 * 为空时是 Upyun 表单上传（RequestURI 是 bucket 路径）。同一字段在两朵云语义不同，
 * 这是后端 UploadToken 的真实契约（AliyunUtility / UpyunUtility.AuthorizeUpload）。
 *
 * Two upload branches: with RequestHost it is an Aliyun OSS form upload
 * (RequestURI is the object key), without it an Upyun form upload (RequestURI
 * is the bucket path). The field legitimately changes meaning per provider.
 */
async function uploadAvatarFile(file: File, token: UploadToken): Promise<void> {
  const form = new FormData()
  let endpoint = UPYUN_ENDPOINT

  if (token.RequestHost) {
    endpoint = token.RequestHost.replace(/^http:/, 'https:')
    form.append('key', token.RequestURI)
    form.append('OSSAccessKeyId', token.AccessKey || '')
    form.append('policy', token.Policy || '')
    form.append('Signature', token.Authorization || '')
  } else {
    form.append('authorization', token.Authorization || '')
    form.append('policy', token.Policy || '')
    endpoint += token.RequestURI || '/qphysics'
  }

  // 文件名固定为 avatar.jpg：后端按扩展名硬校验且落库对象名与服务端约定，
  // 与封面上传流程一致（内容可能实际是 png/webp 字节，服务端会重新编码）。
  // The filename is always avatar.jpg: the backend validates by extension and
  // derives the stored object name from its own convention, mirroring the
  // cover flow (the bytes may really be png/webp; the server re-encodes).
  form.append('file', file, 'avatar.jpg')
  const response = await fetch(endpoint, { method: 'POST', body: form })
  if (!response.ok) throw new Error(`Avatar upload returned ${response.status}`)
}

/**
 * 记录 API 失败的控制台观测。getData 已把每个非 200 响应上报给
 * $ErrorLogger.captureApiError（含凭证脱敏），这里不再重复上报，
 * 只留带脱敏请求/响应的 console.error 便于本地排查。
 *
 * Console observability for API failures. getData already reports every
 * non-200 body to $ErrorLogger.captureApiError (with credential redaction),
 * so this only logs a redacted console.error for local debugging instead of
 * double-reporting.
 */
function logApiError(path: string, status: number, res: unknown, req: unknown) {
  console.error(`${path} returned ${status}`, { response: res, request: req })
}

/**
 * 重读服务器上的最新用户信息。
 * skipUserCache：其他页面（如个人资料页）会把 GetUser 结果写进 IndexedDB
 * 用户缓存，这里若命中缓存就会读到刚要修正的过期头像索引——审查实测该
 * 缓存会让第二次 GetUser 完全不发网络请求。
 *
 * Re-read the freshest user info from the server.
 * skipUserCache: other pages (the profile page) write GetUser results into
 * the IndexedDB user cache; hitting that cache here would return exactly the
 * stale avatar index this flow is trying to correct — the review proved the
 * cached read issues no network request at all.
 */
async function fetchFreshUser(ID: string): Promise<UserInfo> {
  const res = await getData('/Users/GetUser', { ID }, { skipUserCache: true })
  const user = res.Data?.User
  if (res.Status !== 200 || !user) {
    logApiError('/Users/GetUser', res.Status, removeToken(res), removeToken({ ID }))
    throw new Error(`/Users/GetUser returned ${res.Status}`)
  }
  return user
}

/**
 * 申请头像上传凭证。
 * Request an avatar upload token.
 */
async function requestUploadToken(request: UploadRequest): Promise<UploadToken> {
  const res = await getData('/Users/RequestAvatar', { Request: request })
  if (res.Status !== 200 || !res.Data) {
    logApiError('/Users/RequestAvatar', res.Status, removeToken(res), removeToken(request))
    throw new Error(`/Users/RequestAvatar returned ${res.Status}`)
  }
  return res.Data
}

/**
 * 确认头像更新。后端把索引直接设为传入值，因此响应缺省 User 时，
 * 用「刚从服务器读到的用户 + 本次确认的索引」兜底——而不是 localStorage
 * 里的 userInfo，那个只在登录时写入，会把 Gold/Level 等过期字段覆盖掉
 * 页面上刚拉到的新数据。
 *
 * Confirm the avatar update. The backend sets the index to exactly the value
 * sent, so when the response omits User, fall back to the user we just read
 * from the server plus the index we just confirmed — NOT the localStorage
 * userInfo, which is only written at login and would overwrite freshly loaded
 * profile fields (Gold, Level, ...) with stale ones.
 */
async function confirmAvatarUpdate(newAvatar: number, serverUser: UserInfo): Promise<UserInfo> {
  const request = { Avatar: newAvatar }
  const res = await getData('/Users/ConfirmAvatar', request)
  if (res.Status !== 200) {
    logApiError('/Users/ConfirmAvatar', res.Status, removeToken(res), removeToken(request))
    throw new Error(`/Users/ConfirmAvatar returned ${res.Status}`)
  }
  return res.Data?.User || { ...serverUser, Avatar: newAvatar }
}

/**
 * 更换当前登录用户的头像。
 * 流程与上传封面一致：先从服务器读取最新头像索引，RequestAvatar 申请上传凭证，
 * 直传对象存储，最后 ConfirmAvatar 落库。
 *
 * Change the avatar of the currently logged-in user.
 * The flow mirrors the cover upload: re-read the current avatar index from
 * the server, request an upload token, upload to object storage, then confirm.
 *
 * @param file 用户选择的图片文件 / the image file picked by the user
 * @returns 更新后的用户信息 / the updated user info
 * @throws Error 不是白名单图片或超过 1MB / not an allowlisted image or over 1MB
 */
export async function changeAvatar(file: File): Promise<UserInfo> {
  // 后端对扩展名与大小均有硬校验，提前在本地拒绝并给出明确提示。
  // The backend hard-validates extension and size; reject up front with a clear message.
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error(AVATAR_FILE_TYPE_INVALID)
  if (file.size > MAX_AVATAR_FILE_SIZE) throw new Error(AVATAR_FILE_SIZE_EXCEEDED)

  const currentUser = storageManager.getObj('userInfo').value
  if (!currentUser || !currentUser.ID) throw new Error('User.Not.Logged.In')

  // 1. 重读服务器索引：本地 userInfo 只在登录时写入，可能落后于服务器；
  //    ConfirmAvatar 把索引直接设为传入值，用过期索引会把头像回退到旧图片。
  //    Re-read the server index: the local userInfo is only written at login
  //    and may lag behind, while ConfirmAvatar sets the index to exactly the
  //    given value — a stale index would roll the avatar back.
  const serverUser = await fetchFreshUser(currentUser.ID)
  const newAvatar = (serverUser.Avatar || 0) + 1

  // 2. 申请上传凭证。FileSize 按后端契约以非正数上报
  //    （与封面上传 ExperimentSummary.vue 相同的约定）。
  //    Request the upload token. The backend contract expects FileSize as a
  //    non-positive number (same convention as the cover flow).
  const token = await requestUploadToken({ FileSize: 0 - Math.abs(file.size), Extension: '.jpg' })

  // 3. 直传对象存储。
  //    Upload to object storage.
  await uploadAvatarFile(file, token)

  // 4. 确认头像更新，拿到（或兜底合成）最新的用户信息。
  //    Confirm the update and get the resulting user info.
  const updatedUser = await confirmAvatarUpdate(newAvatar, serverUser)

  storageManager.setObj('userInfo', { ...currentUser, ...updatedUser })
  setAvatarCache(updatedUser.ID, updatedUser.Avatar || newAvatar)
  return updatedUser
}
