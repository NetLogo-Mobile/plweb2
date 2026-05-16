import { afterRequest, beforeRequest } from "./Interceptor.ts";
import sm from "@storage/index.ts";
import i18n from "@i18n/index.ts";
import { detectBrowserLanguage, toApiLanguage } from "@i18n/index.ts";
import { getDeviceInfo, getVisitorId } from "./getDevice.ts";
import { showMessage } from "@popup/naiveui.ts";
import { showAPiError } from "@popup/apiError.ts";
import { getPath } from "../utils.ts";
import { normalizePath } from "./types.ts";

/**
 * 本API会使用本地存储的登录凭据Token和AuthCode，但不会处理未登录或者权限不足，使用本API必须手动处理错误。
 *
 * Sends a POST request to the specified API path with the provided body.
 * Note: This API will use the login credentials Token and AuthCode from local storage, but it does not handle errors for not being logged in or insufficient permissions. You must handle these errors manually when using this API.
 * Destroys all existing messages before and after the request.
 * Executes `beforeRequest` and `afterRequest` hooks to allow pre- and post-processing.
 *
 * @param path - API端点路径（相对于基本API URL）。 The API endpoint path (relative to the base API URL).
 * @param body - 作为JSON发送的请求负载。 The request payload to be sent as JSON.
 * @returns 一个Promise，该Promise将解析为响应数据，或者如果中断了流，则解析为结果的钩子。 A promise that resolves with the response data, or with the result of the hooks if they interrupt the flow.
 */

import type { ApiPath, APIParam, APIResult } from "./types.ts";
import type { Device, ResultOf, Users } from "../../pl-serve-type-main/type/main";

type ApiResultLike = {
  Status?: number;
  Message?: string;
  [key: string]: unknown;
};

function isApiResultLike(value: unknown): value is ApiResultLike {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getData<Path extends ApiPath>(
  path: Path,
  body: APIParam<Path>,
): Promise<APIResult<Path>>;
export function getData(path: string, body?: unknown): Promise<unknown>;
export function getData(path: string, body?: unknown): Promise<unknown> {
  const npath = normalizePath(String(path));
  const beforeRes = beforeRequest(npath);
  if (beforeRes.continue === false) {
    return Promise.resolve(beforeRes.data);
  }

  const userInfo = sm.getObj("userAuthInfo");
  const token = userInfo.value?.token;
  const authCode = userInfo.value?.authCode;

  // If token || authcode is null, it means a there's a problem with our code logic
  // Mabe the anonymous token storage or local storage or authentication (CheckLogin) has a problem
  // 可能是匿名Token的存储或者本地存储或者鉴权(CheckLogin)出了问题

  const buildRetry = () => () => getData(path, body);
  const showRetryableApiError = (message: string) => {
    showAPiError(i18n.global.t("errors.networkError") as string, message, buildRetry());
  };

  return fetch(getPath(`/@api${npath}`), {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-API-Token": token,
      "x-API-AuthCode": authCode,
      "x-API-Version": "2502",
    },
  }).then((response) => {
    if (!response.ok) {
      if (npath !== "/Users/GetUser") {
        window.$ErrorLogger.addBreadcrumb(
          "api",
          `${npath} failed with status ${response.status}`,
          {
            statusCode: response.status,
            path: npath,
          },
        );
      }
      window.$ErrorLogger.captureApiError(
        "POST",
        npath,
        response.status,
        undefined,
        body,
      );
      return response.json().catch(() => undefined).then(() => {
        showMessage("error", i18n.global.t("errors.networkError"), { duration: 5000 });
        showRetryableApiError(`${npath} failed with HTTP ${response.status}`);
      });
    }
    return response.json().then((data: unknown) => {
      if (!isApiResultLike(data)) {
        const invalidError = new Error(`Invalid API response shape from ${npath}`);
        window.$ErrorLogger.captureError({
          type: "api",
          message: invalidError.message,
          stack: invalidError.stack,
          error: invalidError,
          method: "POST",
          url: npath,
          statusCode: response.status,
          responseData: data,
          requestData: body,
          breadcrumbs: [...window.$ErrorLogger.getBreadcrumbs()],
        });
        showRetryableApiError(`Invalid response from ${npath}`);
        return {};
      }

      if (npath !== "/Users/GetUser") {
        window.$ErrorLogger.addBreadcrumb("api", `${npath} success`, {
          statusCode: 200,
          path: npath,
          dataStatus: data.Status,
        });
      }

      if (data.Status !== 200) {
        window.$ErrorLogger.captureApiError(
          "POST",
          npath,
          typeof data.Status === "number" ? data.Status : -1,
          data,
          body,
        );
        showRetryableApiError(
          `${npath} returned business status ${String(data.Status ?? "unknown")}`,
        );
      }
      const afterRes = afterRequest(data);
      if (afterRes.continue === false) {
        return afterRes.data;
      }

      return data;
    }).catch((error) => {
      window.$ErrorLogger.captureError({
        type: "network",
        message: `Failed to parse API response: ${npath}`,
        stack: error?.stack,
        error,
        method: "POST",
        url: npath,
        requestData: body,
        breadcrumbs: [...window.$ErrorLogger.getBreadcrumbs()],
      });
      showRetryableApiError(`Failed to parse response from ${npath}`);
      throw error;
    });
  });
}

/**
 * 在首页进行登录操作。 Login operation on the Home.vue
 * 注意，不进行本操作无法访问其他任何API接口（除非有本地缓存），所以在处理任何其他API时都要处理是否登录的错误（不等同于没有“类似管理行为”的权限）
 * Note that without performing this operation, you cannot access any other API interfaces (unless there is local cache).
 * Therefore, when handling any other API, you should handle the error of whether the user is
 * @param arg1 - 用户名或者API令牌，取决于IsToken。’The username or API token, depending on `is_token`.
 * @param arg2 - 密码或者API认证码，取决于IsToken。The password or API auth code, depending on `is_token`.
 * @returns 成功时返回服务器响应数据，失败时发出错误事件。A promise that resolves to the server response data if successful, or emits an error event on failure.
 */
// eslint-disable-next-line max-lines-per-function
export async function login(
  arg1: string | null,
  arg2: string | null,
  is_token = false,
): Promise<ResultOf<Users["Authenticate"]>> {
  let messageRef = showMessage("loading", i18n.global.t("ui.messages.loading"), {
    duration: 6000,
  });
  let username = is_token ? null : arg1;
  let password = is_token ? null : arg2;
  let header = { "Content-Type": "application/json" };
  // It works ,though i do not konw why it works
  // If the server respones with status 500, please check everything about these params
  let Device: Device = {
    Identifier: await getVisitorId(),

    Language: toApiLanguage(i18n.global.locale.value),
  };
  if (is_token && arg1 && arg2) {
    // @ts-expect-error 暂无类型信息 There is no type information
    header["x-API-Token"] = arg1;
    // @ts-expect-error 暂无类型信息 There is no type information
    header["x-API-AuthCode"] = arg2;
    Device = { ...Device, ...getDeviceInfo() };
  }
  return fetch(getPath("/@api/Users/Authenticate"), {
    method: "POST",
    body: JSON.stringify({
      Login: username,
      Password: password,
      Version: 2411,
      Device,
    }),
    headers: header,
  }).then(async (response) => {
    window.$ErrorLogger.writeLog(Device);
    if (!response.ok) {
      return response.json().then(() => {
        showMessage("error", i18n.global.t("errors.networkError"), {
          duration: 5000,
        });
        return {
          Status: response.status,
          Message: "",
          Data: null,
        } as ResultOf<Users["Authenticate"]>;
      });
    }
    return response.json().then((data: ResultOf<Users["Authenticate"]>) => {
      // Exclude(排除) user who has authenticated successfully but still does an null-null login to get homepage data
      if (sm.getObj("userAuthInfo").value?.token == null) {
        sm.setObj(
          "userAuthInfo",
          {
            token: data.Token,
            authCode: data.AuthCode,
          },
          30 * 24 * 60 * 60 * 1000,
        );
      }

      const userConfig = sm.getObj("userConfig").value || {};
      const languageManuallySelected = Boolean(
        userConfig.languageManuallySelected,
      );
      if (!languageManuallySelected) {
        const detectedLanguage = detectBrowserLanguage();
        i18n.global.locale.value = detectedLanguage;
        sm.setObj("userConfig", {
          ...userConfig,
          language: detectedLanguage,
          languageManuallySelected: false,
        });
      }
      messageRef.destroy();
      return data;
    });
  });
}
