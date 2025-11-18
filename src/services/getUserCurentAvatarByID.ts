import { getData } from "./api/getData";
import { getUserUrl } from "./utils";
import { getPath } from "./utils";
import storageManager from "./storage";

let cache = (() => {
  const result = storageManager.getObj("userIDAndAvatarIDMap");
  return result.status === "success" && result.value ? result.value : {};
})();

/**
 * 根据ID获取用户头像，默认缓存，三秒超时，调用本操作后，请等待全部异步结束之后调用saveCache()
 * @param {string} 用户ID
 * @param {boolean} useCache=true
 * @returns {string} url
 */

export async function getAvatarUrl(ID: string, useCache = true) {
  let avatarIndex = 0;
  // 72小时缓存, 注意，在任何getUser请求都会刷新本缓存
  // 72-hour cache, note that any getUser request will refresh this cache
  if (
    useCache &&
    cache[ID] &&
    Math.abs(Date.now() - cache[ID][1]) < 72 * 60 * 60 * 1000 &&
    cache[ID][0] !== undefined &&
    cache[ID][0] !== null
  ) {
    avatarIndex = cache[ID][0];
  } else {
    try {
      // Promise用于超时
      // Promise is used for timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("请求超时")), 30000); // 30秒 30s
      });
      const response = await Promise.race([
        getData("/Users/GetUser", { ID }),
        timeoutPromise,
      ]);
      avatarIndex = response.Data?.User?.Avatar;
      if (!avatarIndex) {
        return getPath("/@base/assets/user/default-avatar.png");
      }
      cache[ID] = [avatarIndex, Date.now()];
      storageManager.setObj("userIDAndAvatarIDMap", cache, 72 * 60 * 60 * 1000); // 72小时 72 hours
    } catch (error) {
      console.error("Getting avatar error", error);
      return getPath("/@base/assets/user/default-avatar.png");
    }
  }
  const user = { ID, Avatar: avatarIndex };
  return getUserUrl(user);
}

export function saveCache() {
  storageManager.setObj("userIDAndAvatarIDMap", cache, 72 * 60 * 60 * 1000);
}
