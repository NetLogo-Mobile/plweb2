import type { MessageReactive as _MessageReactive } from "naive-ui";
import type { Logger } from "./services/api/logWriter";
import type { ErrorLogger } from "./services/errorLogger";

declare global {
  interface Window {
    $Logger: Logger;
    $ErrorLogger: ErrorLogger;
    $getPath: (path: string) => string;
    $message: any;
    $notification: any;
  }
}

// global augmentations (window helpers are declared above)
