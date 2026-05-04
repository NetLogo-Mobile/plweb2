/// <reference lib="webworker" />

import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

const DEFAULT_AVATAR_URL = `${import.meta.env.BASE_URL}assets/user/default-avatar.png`;
const DEFAULT_COVER_URL = `${import.meta.env.BASE_URL}assets/messages/Experiment-Default.png`;
const STATIC_IMAGE_CACHE = "static-images-v1";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

function isAvatarRequest(url: URL): boolean {
  return url.pathname.includes("/users/avatars/");
}

function isCoverRequest(url: URL): boolean {
  return url.pathname.includes("/experiments/images/");
}

function isManagedImageRequest(request: Request, url: URL): boolean {
  return (
    request.destination === "image" &&
    (isAvatarRequest(url) || isCoverRequest(url))
  );
}

async function getFallbackResponse(url: URL): Promise<Response> {
  const fallbackUrl = isAvatarRequest(url)
    ? DEFAULT_AVATAR_URL
    : DEFAULT_COVER_URL;
  return (await matchPrecache(fallbackUrl)) || fetch(fallbackUrl);
}

async function putInCache(request: RequestInfo | URL, response: Response) {
  try {
    const cache = await caches.open(STATIC_IMAGE_CACHE);
    await cache.put(request, response.clone());
  } catch {
    // Ignore cache put failures for opaque or transient responses.
  }
}

async function tryCorsFetch(url: URL): Promise<Response> {
  return fetch(
    new Request(url.toString(), {
      mode: "cors",
      credentials: "omit",
    }),
  );
}

registerRoute(
  ({ request, url }) => isManagedImageRequest(request, url),
  async ({ request, url }) => {
    const cached = await caches.match(request, {
      ignoreSearch: false,
    });
    if (cached) {
      return cached;
    }

    try {
      const corsResponse = await tryCorsFetch(url);
      if (corsResponse.ok) {
        await putInCache(request, corsResponse);
        return corsResponse;
      }
      if (corsResponse.status === 404) {
        return await getFallbackResponse(url);
      }
    } catch {
      // Fall back to the original request mode below.
    }

    try {
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        await putInCache(request, response);
        return response;
      }
      if (response.status === 404) {
        return await getFallbackResponse(url);
      }
    } catch {
      // Fall through to fallback response.
    }

    return getFallbackResponse(url);
  },
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: STATIC_IMAGE_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10000,
        maxAgeSeconds: 300 * 24 * 60 * 60,
      }),
    ],
  }),
);
