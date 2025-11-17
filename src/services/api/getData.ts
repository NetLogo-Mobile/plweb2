import Emitter from "../eventEmitter.ts";
import { beforeRequest, afterRequest } from "./Interceptor.ts";
import sm from "@storage/index.ts";
import i18n from "../i18n/i18n.ts";
import { getDeviceInfo, getVisitorId } from "./getDevice.ts";
import { removeToken } from "../utils.ts";
import { showMessage } from "@popup/naiveui.ts";
import { getPath } from "../utils.ts";

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
// eslint-disable-next-line max-lines-per-function
export async function getData(path: string, body: unknown) {
  const userInfo = sm.getObj("userAuthInfo");
  if (userInfo.status === "empty" || userInfo.status === "expired") {
    Emitter.emit("loginRequired");
    return;
  }
  const token = userInfo.value.token;
  const authCode = userInfo.value.authCode;
  const beforeRes = beforeRequest(path);
  if (beforeRes.continue === false) {
    return beforeRes.data;
  }
  return fetch(getPath(`/@api${path}`), {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-API-Token": token,
      "x-API-AuthCode": authCode,
      "x-API-Version": "2502",
      // F**K! When was it updated from 2411 to 2502?
    },
  }).then((response) => {
    if (!response.ok) {
      window.$ErrorLogger.writeLog(
        `API请求失败: ${path}, 状态码: ${response.status}`,
      );
      return response.json().then(() => {
        // 这里的错误处理仅处理API本身非2xx的错误，及服务器本身出了问题
        // 而Response.data中的错误是API本身的错误（如权限不足、参数错误等），需要在调用API时处理
        // This error handling only deals with non-2xx errors from the API itself, and server issues.
        // Errors in Response.data are API-specific errors (like insufficient permissions, parameter errors
        showMessage("error", "无法与服务器通讯，请稍候再试", {
          duration: 5000,
        });
      });
    }
    return response.json().then((data) => {
      if (data.Status !== 200) {
        window.$ErrorLogger.writeLog(
          removeToken({
            res: data,
            info: userInfo,
          }),
        );
      }
      const afterRes = afterRequest(data);
      if (afterRes.continue === false) {
        return afterRes.data;
      }

      return data;
    });
  });
}

/**
 * 在首页进行登录操作。 Login operation on the Home.vue
 * 注意，不进行本操作无法访问其他任何API接口（除非有本地缓存），所以在处理任何其他API时都要处理是否登录的错误（不等同于没有“类似管理行为”的权限）
 * 可以使用EventEmitter来发布LoginRequired事件
 * 订阅laoding、error、success事件，并管理用户登录状态存储。使用`window.$message`显示消息。
 *
 * Note that without performing this operation, you cannot access any other API interfaces (unless there is local cache).
 * Therefore, when handling any other API, you should handle the error of whether the user is
 * Emits loading, error, and success events via `Emitter` and manages user login status in storage. Displays messages using `window.$message`.
 *
 * @param arg1 - 用户名或者API令牌，取决于IsToken。’The username or API token, depending on `is_token`.
 * @param arg2 - 密码或者API认证码，取决于IsToken。The password or API auth code, depending on `is_token`.
 * @returns 成功时返回服务器响应数据，失败时发出错误事件。A promise that resolves to the server response data if successful, or emits an error event on failure.
 */
// eslint-disable-next-line max-lines-per-function
export async function login(
  arg1: string | null,
  arg2: string | null,
  is_token = false,
): Promise<{
  Status: number;
  Message: string;
  Data: any;
}> {
  let messageRef = showMessage("loading", "loading...", {
    duration: 6000,
  });

  let username = is_token ? null : arg1;
  let password = is_token ? null : arg2;
  let header = { "Content-Type": "application/json" };
  // It works ,though i do not konw why it works
  // If the server respones with status 500, please check everything about these params
  let Device = {
    Identifier: await getVisitorId(),
    Language: i18n.global.locale.value,
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
        showMessage("error", "无法与服务器通讯，请稍候再试", {
          duration: 5000,
        });
      });
    }
    return response.json().then((data) => {
      if (data.Token != null && data.AuthCode != null)
        sm.setObj(
          "userAuthInfo",
          {
            token: data.Token,
            authCode: data.AuthCode,
          },
          30 * 24 * 60 * 60 * 1000,
        );
      messageRef.destroy();
      return data;
    });
  });
}
