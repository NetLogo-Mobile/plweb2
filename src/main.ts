import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import i18n from '@i18n/index'
import ErrorLogger from './services/errorLogger.ts'
import { LogManager } from '@api/logWriter.ts'
import { getPath, registerNetworkListener } from '@services/utils'
import storageManager from '@storage/index'
import { showMessage } from '@popup/naiveui'
import type { DirectiveBinding } from 'vue'
import 'highlight.js/styles/github.css'
import { registerSW } from 'virtual:pwa-register'

const PWA_UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

registerSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    if (!registration) return

    const checkForUpdate = () => {
      if (!navigator.onLine) return
      registration.update().catch((error) => {
        window.$ErrorLogger?.captureError({
          type: 'custom',
          message: 'Failed to check for PWA update',
          context: { error },
        })
      })
    }

    checkForUpdate()
    window.setInterval(checkForUpdate, PWA_UPDATE_CHECK_INTERVAL)
    window.addEventListener('online', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
  },
})

navigator.serviceWorker?.addEventListener('controllerchange', () => {
  window.location.reload()
})

const app = createApp(App)
app.use(router)
app.use(i18n)

app.directive('richText', {
  mounted(el, binding: DirectiveBinding<() => Promise<string>>) {
    el.innerHTML = 'rendering...'
    Promise.resolve(binding.value()).then((html) => {
      el.innerHTML = html
    })
  },
  updated(el: HTMLElement, binding: DirectiveBinding<() => Promise<string> | string>) {
    Promise.resolve(binding.value()).then((html) => {
      el.innerHTML = html
    })
  },
})

app.mount('#app')
window.$ErrorLogger = new ErrorLogger(app)
window.$Logger = LogManager

// No-cors responses for cross-origin images:
// the browser wraps a 404 from the source site as opaque,
// and the service worker cannot see the actual status code.
// The current code treats opaque as a successful response and caches it,
// so broken avatars do not enter the default avatar branch.
document.addEventListener(
  'error',
  (event) => {
    const target = event.target
    if (!(target instanceof HTMLImageElement)) return

    const currentSrc = target.currentSrc
    const fallbackUrl = currentSrc.includes('/users/avatars/')
      ? getPath('/@base/assets/user/default-avatar.png')
      : currentSrc.includes('/experiments/images/')
        ? getPath('/@base/assets/messages/Experiment-Default.png')
        : ''

    if (!fallbackUrl) return
    if (target.src !== fallbackUrl) {
      target.src = fallbackUrl
    }
  },
  true,
)

function parseCopiedRouteTarget(input: string): { path: string; needLogin: boolean } | null {
  const text = input.trim()

  const workTag = text.match(/<(experiment|discussion)=([a-f0-9]{24})>/i)
  if (workTag?.[1] && workTag[2]) {
    const category = workTag[1].toLowerCase() === 'discussion' ? 'Discussion' : 'Experiment'
    return { path: `/p/${category}/${workTag[2]}`, needLogin: false }
  }

  const discussionHash = text.match(/#\/p\/Discussion\/([a-f0-9]{24})/i)
  if (discussionHash?.[1]) return { path: `/p/Discussion/${discussionHash[1]}`, needLogin: false }

  const discussionQuery = text.match(/\?[\w-]+-([a-f0-9]{24})\?/i)
  if (discussionQuery?.[1]) return { path: `/p/Discussion/${discussionQuery[1]}`, needLogin: false }

  const userTag = text.match(/<user=([a-f0-9]{24})>/i)
  if (userTag?.[1]) return { path: `/u/${userTag[1]}`, needLogin: true }

  // Match direct /p/Discussion/ or /p/Experiment/ or /u/ paths
  const directPath = text.match(/\/p\/(Discussion|Experiment)\/([a-f0-9]{24})/i)
  if (directPath?.[1] && directPath[2]) {
    return { path: `/p/${directPath[1]}/${directPath[2]}`, needLogin: false }
  }

  const directUser = text.match(/\/u\/([a-f0-9]{24})/i)
  if (directUser?.[1]) return { path: `/u/${directUser[1]}`, needLogin: true }

  return null
}

let lastCheckedClipboard = ''

async function navigateToTarget(target: { path: string; needLogin: boolean }) {
  if (target.needLogin && !storageManager.getObj('userInfo').value?.User?.ID) {
    showMessage('warning', 'Please login first', { duration: 2000 })
    return false
  }
  try {
    await router.push(target.path)
    return true
  } catch (error) {
    window.$ErrorLogger?.captureError({
      type: 'custom',
      message: 'Failed to auto-open pasted link',
      context: { targetPath: target.path, error },
    })
    showMessage('error', 'Failed to open link', { duration: 2500 })
    return false
  }
}

async function handlePasteAutoOpen(event: ClipboardEvent) {
  const isEnabled = storageManager.getObj('userConfig').value?.autoOpenCopiedLink === 'on'
  if (!isEnabled) return

  const pastedText = event.clipboardData?.getData('text/plain')?.trim()
  if (!pastedText) return

  const target = parseCopiedRouteTarget(pastedText)
  if (!target) return

  await navigateToTarget(target)
}

async function checkClipboardForAutoOpen() {
  const isEnabled = storageManager.getObj('userConfig').value?.autoOpenCopiedLink === 'on'
  if (!isEnabled) return
  if (!navigator.clipboard?.readText) return

  try {
    const text = await navigator.clipboard.readText()
    if (!text || text === lastCheckedClipboard) return
    lastCheckedClipboard = text

    const target = parseCopiedRouteTarget(text)
    if (!target) return

    await navigateToTarget(target)
  } catch {
    // Permission denied or unavailable - expected if user denies the prompt
  }
}

document.addEventListener('paste', handlePasteAutoOpen)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkClipboardForAutoOpen()
  }
})
registerNetworkListener()
