import { getData } from './api/getData'
import storageManager from './storage'
import { setAvatarCache } from './getUserCurentAvatarByID'
import { removeToken } from './utils'
import type { UploadToken, UserInfo } from '../pl-serve-type-main/type/main'

/**
 * Upyun 上传入口。头像与封面共用同一个 bucket（qphysics）。
 * Upyun upload endpoint. Avatars and covers share the same bucket (qphysics).
 */
const UPYUN_ENDPOINT = 'https://v0.api.upyun.com'

/**
 * 后端 RequestAvatar 的硬限制：文件超过 1MB 直接拒绝（Upload.Illegal）。
 * Hard limit enforced by the backend RequestAvatar: files over 1MB are rejected.
 */
const MAX_AVATAR_FILE_SIZE = 1 * 1048576

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

  form.append('file', file, 'avatar.jpg')
  const response = await fetch(endpoint, { method: 'POST', body: form })
  if (!response.ok) throw new Error(`Avatar upload returned ${response.status}`)
}

/**
 * 记录 API 失败，保持与封面上传流程一致的观测口径。
 * Log an API failure with the same observability as the cover upload flow.
 */
function logApiError(path: string, status: number, res: unknown, req: unknown) {
  window.$ErrorLogger.captureApiError('POST', path, status, res, req)
  console.error(`${path} returned ${status}`, res)
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
 * @throws Error 不是图片或超过 1MB / not an image or larger than 1MB
 */
export async function changeAvatar(file: File): Promise<UserInfo> {
  // 后端对扩展名与大小均有硬校验，提前在本地拒绝并给出明确提示
  // The backend hard-validates extension and size; reject up front with a clear message.
  if (!file.type.startsWith('image/')) throw new Error(AVATAR_FILE_TYPE_INVALID)
  if (file.size > MAX_AVATAR_FILE_SIZE) throw new Error(AVATAR_FILE_SIZE_EXCEEDED)

  const currentUser = storageManager.getObj('userInfo').value
  if (!currentUser || !currentUser.ID) throw new Error('User.Not.Logged.In')

  // 1. 从服务器重读当前头像索引。本地 userInfo 只在登录时写入，可能落后于服务器；
  //    ConfirmAvatar 会把索引直接设为传入值，用过期索引会把头像回退到旧图片。
  //    与封面上传前先 GetSummary 同理。
  //    Re-read the current avatar index from the server: the local userInfo is
  //    only written at login and may lag behind, while ConfirmAvatar sets the
  //    index to exactly the given value — a stale index would roll the avatar
  //    back to the previous image. Same reason the cover flow re-reads first.
  const userRes = await getData('/Users/GetUser', { ID: currentUser.ID })
  const serverUser = userRes.Data?.User
  if (userRes.Status !== 200 || !serverUser) {
    logApiError('/Users/GetUser', userRes.Status, removeToken(userRes), removeToken({ ID: currentUser.ID }))
    throw new Error(`/Users/GetUser returned ${userRes.Status}`)
  }
  const newAvatar = (serverUser.Avatar || 0) + 1

  // 2. 申请上传凭证。服务器按「当前头像索引 +1」签名保存路径，必须与第 1 步一致。
  //    Request the upload token. The server signs the save path for
  //    "current avatar index + 1", which must match step 1.
  const requestReq = { Request: { FileSize: 0 - Math.abs(file.size), Extension: '.jpg' } }
  const requestRes = await getData('/Users/RequestAvatar', requestReq)
  if (requestRes.Status !== 200 || !requestRes.Data) {
    logApiError('/Users/RequestAvatar', requestRes.Status, removeToken(requestRes), removeToken(requestReq))
    throw new Error(`/Users/RequestAvatar returned ${requestRes.Status}`)
  }

  // 3. 直传对象存储，字段与封面上传保持一致
  //    Upload to object storage with the same fields as the cover upload.
  const token = requestRes.Data
  await uploadAvatarFile(file, token)

  // 4. 确认头像更新。返回 UserPackage（RelationList），User 缺省时本地兜底合并。
  //    Confirm the avatar update. Returns a UserPackage (RelationList);
  //    fall back to a local merge when User is absent.
  const confirmReq = { Avatar: newAvatar }
  const confirmRes = await getData('/Users/ConfirmAvatar', confirmReq)
  if (confirmRes.Status !== 200) {
    logApiError('/Users/ConfirmAvatar', confirmRes.Status, removeToken(confirmRes), removeToken(confirmReq))
    throw new Error(`/Users/ConfirmAvatar returned ${confirmRes.Status}`)
  }
  const updatedUser: UserInfo = confirmRes.Data?.User || {
    ...currentUser,
    Avatar: newAvatar,
  }

  storageManager.setObj('userInfo', { ...currentUser, ...updatedUser })
  setAvatarCache(updatedUser.ID, updatedUser.Avatar || newAvatar)
  return updatedUser
}
