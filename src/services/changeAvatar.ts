import { getData } from './api/getData'
import storageManager from './storage'
import { setAvatarCache } from './getUserCurentAvatarByID'
import type { UploadToken, UserInfo } from '../pl-serve-type-main/type/main'

/**
 * Upyun 上传入口。头像与封面共用同一个 bucket（qphysics）。
 * Upyun upload endpoint. Avatars and covers share the same bucket (qphysics).
 */
const UPYUN_ENDPOINT = 'https://v0.api.upyun.com'

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
 * 更换当前登录用户的头像。
 * 流程与上传封面一致：RequestAvatar 申请上传凭证 -> 直传对象存储 -> ConfirmAvatar 落库。
 *
 * Change the avatar of the currently logged-in user.
 * The flow mirrors the cover upload: RequestAvatar for the upload token,
 * upload to object storage, then ConfirmAvatar to persist it.
 *
 * @param file 用户选择的图片文件 / the image file picked by the user
 * @returns 更新后的用户信息 / the updated user info
 */
export async function changeAvatar(file: File): Promise<UserInfo> {
  const currentUser = storageManager.getObj('userInfo').value
  if (!currentUser || !currentUser.ID) throw new Error('User.Not.Logged.In')

  // 1. 申请上传凭证，目标索引为当前头像索引 +1
  // Request the upload token targeting the current avatar index + 1.
  const requestRes = await getData('/Users/RequestAvatar', {
    Request: { FileSize: 0 - Math.abs(file.size), Extension: '.jpg' },
  })
  if (requestRes.Status !== 200 || !requestRes.Data) {
    throw new Error(`/Users/RequestAvatar returned ${requestRes.Status}`)
  }

  // 2. 直传对象存储，字段与封面上传保持一致
  // Upload to object storage with the same fields as the cover upload.
  const token = requestRes.Data
  await uploadAvatarFile(file, token)

  // 3. 确认头像更新
  // Confirm the avatar update.
  const newAvatar = (currentUser.Avatar || 0) + 1
  const confirmRes = await getData('/Users/ConfirmAvatar', { Avatar: newAvatar })
  const updatedUser = confirmRes.Data?.User
  if (confirmRes.Status !== 200 || !updatedUser) {
    throw new Error(`/Users/ConfirmAvatar returned ${confirmRes.Status}`)
  }

  storageManager.setObj('userInfo', { ...currentUser, ...updatedUser })
  setAvatarCache(updatedUser.ID, updatedUser.Avatar || newAvatar)
  return updatedUser
}
