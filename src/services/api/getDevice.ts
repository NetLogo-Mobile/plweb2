import FingerprintJS from "@fingerprintjs/fingerprintjs";
import type { Device } from "../../pl-serve-type-main/type/main";

type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  deviceModel?: string;
  gpu?: {
    brand?: string;
    memory?: number;
  };
};

export async function getVisitorId() {
  const fp = await FingerprintJS.load();
  const re = await fp.get();
  return re.visitorId;
}

/**
 * 获取增浏览器和设备信息 / Get browser & device info*/
export function getDeviceInfo(): Device {
  const nav = navigator as ExtendedNavigator;
  return {
    Platform: navigator.platform,
    Model: nav.deviceModel,
    System: navigator.userAgent,
    CPU: String(navigator.hardwareConcurrency ?? ""),
    GPU: nav.gpu?.brand,
    SystemMemory: (nav.deviceMemory ?? 0) * 1024,
    GraphicMemory: nav.gpu?.memory,
    ScreenWidth: screen.width,
    ScreenHeight: screen.height,
    ScreenDPI: window.devicePixelRatio * 96,
    ScreenSize: Math.round(
      Math.sqrt(screen.width ** 2 + screen.height ** 2) /
        (window.devicePixelRatio * 96),
    ),
    Timezone: -new Date().getTimezoneOffset() / 60,
  };
}
