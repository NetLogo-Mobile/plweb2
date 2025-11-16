import {
  isSameDay,
  isThisYear,
  differenceInCalendarDays,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";
import i18n from "./i18n/i18n";
import Emitter from "./eventEmitter";
import storageManager from "./storage";
import router from "../router";

type PUser = {
  ID: string;
  Avatar: number;
  Verification?: string;
  // 封禁用户直接返回默认头像 ，在getUserCurentAvatarByID.ts中不会传入Verification。所以可选
  // If the user is banned, return the default avatar directly. It will not be passed in Verification in getUserCurentAvatarByID.ts. So it's optional.
};

type PProjects = {
  ID: string;
  Image?: number;
};

const apiUrl = import.meta.env.VITE_API_URL;
const staticUrl = import.meta.env.VITE_STATIC_URL;
const rootUrl = import.meta.env.VITE_ROOT_URL;
const baseUrl = import.meta.env.VITE_BASE_URL;

/**
 * 替换路径中的预设标记为配置的URL地址,静态资源走@/base，路由走@/root
 *
 * REplace the preset mark in the path with the configured URL address, static resources go to @/base, and routing goes to @/root
 *
 * @param path -  including @/api、@/static、@/root、@/base
 * @returns 替换后的完整URL字符串，所有预设标记已被替换为配置的URL
 *
 */

export function getPath(path: string): string {
  const a = path
    .replace(/\/@api/g, apiUrl)
    .replace(/\/@static/g, staticUrl)
    .replace(/\/@base/g, baseUrl)
    .replace(/\/@root/g, rootUrl);
  if (window.location.host.includes("turtlesim")) {
    return a.replace("/Physics-Lab-Web/", "");
  }
  return a;
}

export function getUserUrl(user: PUser): string {
  const url =
    user.Avatar === 0 || user.Verification === "Banned"
      ? "/@base/assets/user/default-avatar.png"
      : `/@static/users/avatars/${user.ID.slice(0, 4)}/${user.ID.slice(4, 6)}/${user.ID.slice(
          6,
          8,
        )}/${user.ID.slice(8, 24)}/${user.Avatar}.jpg`;

  return getPath(url);
}

export function getCoverUrl(data: PProjects): string {
  const url = `/@static/experiments/images/${data.ID.slice(0, 4)}/${data.ID.slice(
    4,
    6,
  )}/${data.ID.slice(6, 8)}/${data.ID.slice(8, 24)}/${data.Image || 0}.jpg`;
  return getPath(url);
}

/**
 * 将物理实验 API 返回的 targetLink 转换为查询参数对象。
 *
 * 数据流顺序：
 * 1. 收到 API 返回的 targetLink，使用 EncodeAPITargetLink 创建 URL
 * 2. 结果展示界面使用 decodeHrefToQueryObj 解码 URL 中的参数，再发起新的请求
 *
 * Converts the targetLink from physicsLab's API response to a query object.
 * Data flow:
 * 1. Receive API response's targetLink, create URL using EncodeAPITargetLink
 * 2. Result display page uses decodeHrefToQueryObj to decode URL's parameters, then make new request
 *
 * @param {string} input 例如："discussion://Tags/Tag1/Tags/Tag2/ExcludeTags/Tag3"
 * @returns {string} 路由路径局部的 base64-like 字符串（the base64-like string in router path）
 * @example
 * // 跳转到列表页
 * router.push(`/list/${EncodeAPITargetLink(input)}`);
 */
export function EncodeAPITargetLink(input: string) {
  const result: any = {
    Category: null,
    Tags: null,
    ExcludeTags: null,
  };
  // 处理前缀以确定 Category
  // To handle the prefix to determine Category
  result.Category = input.startsWith("d") ? "Discussion" : "Experiment";
  const segments = input.split("://").slice(1).join("://");
  const parts = segments.split("/");

  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i] as string;
    const value = parts[i + 1];

    if (key === "ExcludeTags" || key === "Tags") {
      if (!result[key]) {
        result[key] = [];
      }
      if (value) {
        result[key].push(value);
      }
    } else {
      result[key] = value;
    }
  }
  // 确保 Tag 和 ExcludeTags 是数组或 null
  // Ensure that Tag and ExcludeTags are arrays or null
  if (!Array.isArray(result.Tags) || result.Tags.length === 0) {
    result.Tags = null;
  }
  if (!Array.isArray(result.ExcludeTags) || result.ExcludeTags.length === 0) {
    result.ExcludeTags = null;
  }

  const jsonString = JSON.stringify(result);
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const base64String = btoa(String.fromCharCode(...utf8Bytes));

  return base64String.replace(/\//g, "DEVIDER");
}

/**
 *  解码 router 中的 base64 字符串 decode base64 string in router
 * @param base64Input example router.params.config
 * @returns example {Category: "Discussion", Tags: ["Tag1", "Tag2"], ExcludeTags: ["Tag3"]}
 * @see EncodeAPITargetLink
 */
export function decodeHrefToQueryObj(base64Input: string) {
  if (!base64Input || typeof base64Input !== "string") {
    return {};
  }
  const latin1String = atob(base64Input.replace(/DEVIDER/g, "/"));
  const utf8Bytes = new Uint8Array(
    [...latin1String].map((char) => char.charCodeAt(0)),
  );
  const jsonString = new TextDecoder().decode(utf8Bytes);
  const result = JSON.parse(jsonString);
  for (const k in result) {
    if (Object.prototype.hasOwnProperty.call(result, k)) {
      const v = result[k];
      if (Array.isArray(v) && v.join("").includes(",")) {
        result[k] = v[0].split(",");
      }
    }
  }
  return result;
}

/**
 * 格式化日期文本 format date text
 * @param id 物实ID The id of physicsLab
 * @param showRelative 是否显示相对时间  Whether to show relative time
 * @param type 格式化配置名称 format config
 * @see i18n.ts
 * @returns 格式化后的日期文本 Formatted date text
 */
// eslint-disable-next-line max-lines-per-function
export function formatDate(
  id: string,
  showRelative?: boolean,
  type?: string,
): string {
  // 1. 提取并转换16进制时间戳
  // 1. Extract and convert 16-bit timestamp
  const hexTimestamp = id.substring(0, 8);
  const timestampSeconds = parseInt(hexTimestamp, 16);
  const date = new Date(timestampSeconds * 1000);
  const now = new Date();

  // 2. 处理相对时间 (当 showRelative=true 且日期在3天内)
  // 2. Handle relative time (when showRelative=true and date is within 3 days)
  if (showRelative) {
    const diffDays = differenceInCalendarDays(now, date);

    // 当天的时间处理
    // Time processing for today
    if (isSameDay(date, now)) {
      const diffMinutes = differenceInMinutes(now, date);

      if (diffMinutes < 1) {
        return i18n.global.t("date.justNow") as string; // "刚刚"
      } else if (diffMinutes < 60) {
        return i18n.global.t("date.minutesAgo", {
          minutes: diffMinutes,
        }) as string; // "X分钟前"
      } else {
        const diffHours = differenceInHours(now, date);
        return i18n.global.t("date.hoursAgo", { hours: diffHours }) as string; // "X小时前"
      }
    }
    // 昨天
    // Yesterday
    else if (diffDays === 1) {
      return `${i18n.global.t("date.yesterday") as string} ${i18n.global.d(
        date,
        "time",
      )}`;
    }
    // 前天
    // Day before yesterday
    else if (diffDays === 2) {
      return `${
        i18n.global.t("date.dayBeforeYesterday") as string
      } ${i18n.global.d(date, "time")}`;
    }
  }

  // 3. 常规日期格式化
  // 3. Regular date formatting
  if (type) {
    return i18n.global.d(date, type);
  } else {
    if (isSameDay(date, now)) {
      return i18n.global.d(date, "time");
    } else if (isThisYear(date)) {
      return i18n.global.d(date, "monthDay");
    } else {
      return i18n.global.d(date, "yearMonthDay");
    }
  }
}

export function removeToken(obj: any) {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (
          key === "token" ||
          key === "authCode" ||
          key === "Token" ||
          key === "AuthCode"
        ) {
          // eslint-disable-next-line max-depth
          if (obj[key]) obj[key] = `${obj[key].slice(0, 6)}******`;
        } else if (typeof obj[key] === "object") {
          removeToken(obj[key]);
        }
      }
    }
  }
  return obj;
}

export function checkLogin() {
  if (storageManager.getObj("userInfo").value?.loginStatus !== true) {
    Emitter.emit("nWarning", {
      title: i18n.global.t("login.loginRequired"),
      content: i18n.global.t("login.loginContent"),
      positiveText: i18n.global.t("login.confirm"),
      onPositiveClick: async () => {
        router.push({ name: "Home" });
      },
    });
  }
}
