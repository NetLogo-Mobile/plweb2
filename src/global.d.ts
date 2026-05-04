import type { MessageReactive as _MessageReactive } from "naive-ui";
import type { Logger } from "./services/api/logWriter";
import type ErrorLogger from "./services/errorLogger";

declare global {
  interface Window {
    $Logger: Logger;
    $ErrorLogger: ErrorLogger;
    prerenderReady: boolean;
  }
}

export {};
