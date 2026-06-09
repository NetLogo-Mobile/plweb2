import type { MessageReactive as _MessageReactive } from 'naive-ui'
import type { Logger } from './services/api/logWriter'
import type ErrorLogger from './services/errorLogger'

declare global {
  interface Window {
    $Logger: Logger
    $ErrorLogger: ErrorLogger
  }

  const __APP_VERSION__: string
  const __BUILD_HASH__: string
}

export {}

// global augmentations (window helpers are declared above)
