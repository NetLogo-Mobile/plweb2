import { afterRequest, beforeRequest } from './Interceptor.ts'
import sm from '@storage/index.ts'
import i18n, { detectBrowserLanguage, toApiLanguage } from '@i18n/index.ts'
import { getDeviceInfo, getVisitorId } from './getDevice.ts'
import { showMessage } from '@popup/naiveui.ts'
import { getPath } from '../utils.ts'
import { normalizePath } from './types.ts'
import { readApiCache, writeApiCache } from './cache.ts'
import { updateNotificationUnread } from '@services/notificationUnread.ts'

import type { ApiPath, APIParam, APIResult } from './types.ts'
import type { Device, Result, ResultOf, Users } from '../../pl-serve-type-main/type/main'

const CACHEABLE_PATHS = new Set([
  '/Contents/GetProfile',
  '/Contents/GetSummary',
  '/Messages/GetComments',
  '/Messages/GetMessages',
  '/Contents/GetLibrary',
  '/Users/GetUser',
])

function canCache(path: string): boolean {
  return CACHEABLE_PATHS.has(path)
}

function applyAfterRequest<T extends Result>(data: T): T {
  const afterRes = afterRequest(data)
  if (afterRes.continue === false) {
    return (afterRes.data as T) || data
  }
  return data
}

async function getDataImpl(path: string, body?: unknown): Promise<any> {
  const npath = normalizePath(String(path))
  const beforeRes = beforeRequest(npath)
  if (beforeRes.continue === false) {
    return (beforeRes.data ?? {}) as Result
  }

  const userInfo = sm.getObj('userAuthInfo')
  const token = userInfo.value?.token?.trim()
  const authCode = userInfo.value?.authCode
  const isAuthcatePath = npath === '/Users/Authenticate'
  const apiToken = !isAuthcatePath && !token ? '7pEWTsF4gR9qauzJCDQkxPLOZlnbMtAG' : token

  try {
    const response = await fetch(getPath(`/@api${npath}`), {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-API-Token': apiToken,
        'x-API-AuthCode': authCode,
        'x-API-Version': '2502',
      },
    })

    if (!response.ok) {
      if (npath !== '/Users/GetUser') {
        window.$ErrorLogger.addBreadcrumb('api', `${npath} failed with status ${response.status}`, {
          statusCode: response.status,
          path: npath,
        })
      }
      window.$ErrorLogger.captureApiError('POST', npath, response.status, undefined, body)
      try {
        await response.json()
      } catch {
        // Ignore malformed error payloads.
      }
      showMessage('error', i18n.global.t('errors.networkError'), {
        duration: 5000,
      })
      return {
        Status: response.status,
        Message: 'Network Error',
        Data: null,
      } as unknown as Result
    }

    const data = (await response.json()) as Result
    if (npath !== '/Users/GetUser') {
      window.$ErrorLogger.addBreadcrumb('api', `${npath} success`, {
        statusCode: 200,
        path: npath,
        dataStatus: data.Status,
      })
    }

    if (data.Status !== 200) {
      window.$ErrorLogger.captureApiError('POST', path, data.Status, data, body)
    } else if (canCache(npath)) {
      writeApiCache(npath, body, data)
    }

    return applyAfterRequest(data)
  } catch (error) {
    const cached = canCache(npath) ? readApiCache<Result>(npath, body) : null
    if (cached) {
      window.$ErrorLogger.addBreadcrumb('api-cache', `${npath} served from offline cache`, {
        path: npath,
      })
      return applyAfterRequest(cached)
    }
    throw error
  }
}

export function getData<Path extends ApiPath>(
  path: Path,
  body: APIParam<Path>,
): Promise<APIResult<Path>>
export function getData(path: string, body?: unknown): Promise<any> {
  return getDataImpl(path, body)
}

export async function login(
  arg1: string | null,
  arg2: string | null,
  is_token = false,
): Promise<ResultOf<Users['Authenticate']>> {
  const messageRef = showMessage('loading', i18n.global.t('ui.messages.loading'), {
    duration: 6000,
  })
  const username = is_token ? null : arg1
  const password = is_token ? null : arg2
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  let Device: Device = {
    Identifier: await getVisitorId(),
    Language: toApiLanguage(i18n.global.locale.value),
  }
  if (is_token && arg1 && arg2) {
    header['x-API-Token'] = arg1
    header['x-API-AuthCode'] = arg2
    Device = { ...Device, ...getDeviceInfo() }
  }

  const requestBody = {
    Login: username,
    Password: password,
    Version: 2411,
    Device,
  }
  const cacheKey = is_token
    ? `/Users/Authenticate:${arg1 || ''}:${arg2 || ''}`
    : '/Users/Authenticate:anonymous'

  try {
    const response = await fetch(getPath('/@api/Users/Authenticate'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: header,
    })
    window.$ErrorLogger.writeLog(Device)

    if (!response.ok) {
      try {
        await response.json()
      } catch {
        // Ignore malformed error payloads.
      }
      showMessage('error', i18n.global.t('errors.networkError'), {
        duration: 5000,
      })
      return {
        Status: response.status,
        Message: '',
        Data: null,
      } as ResultOf<Users['Authenticate']>
    }

    const data = (await response.json()) as ResultOf<Users['Authenticate']>
    if (data.Status === 200) {
      writeApiCache(cacheKey, requestBody, data)
      const isRealLogin = Boolean((is_token && arg1 && arg2) || (!is_token && arg1 && arg2))
      if (isRealLogin) {
        updateNotificationUnread(data.Data?.Statistic)
      }
    }

    if (sm.getObj('userAuthInfo').value?.token == null) {
      sm.setObj(
        'userAuthInfo',
        {
          token: data.Token,
          authCode: data.AuthCode,
        },
        30 * 24 * 60 * 60 * 1000,
      )
    }

    const userConfig = sm.getObj('userConfig').value || {}
    const languageManuallySelected = Boolean(userConfig.languageManuallySelected)
    if (!languageManuallySelected) {
      const detectedLanguage = detectBrowserLanguage()
      i18n.global.locale.value = detectedLanguage
      sm.setObj('userConfig', {
        ...userConfig,
        language: detectedLanguage,
        languageManuallySelected: false,
      })
    }
    messageRef.destroy()
    return data
  } catch (error) {
    const cached = readApiCache<ResultOf<Users['Authenticate']>>(cacheKey, requestBody)
    messageRef.destroy()
    if (cached) {
      window.$ErrorLogger.addBreadcrumb('api-cache', `${cacheKey} served from offline cache`, {})
      return cached
    }
    throw error
  }
}
