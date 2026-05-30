import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import i18n from '@i18n/index'
import ErrorLogger from './services/errorLogger.ts'
import { LogManager } from '@api/logWriter.ts'
import { getPath } from '@services/utils'
import storageManager from '@storage/index'
import { showMessage } from '@popup/naiveui'
import type { DirectiveBinding } from 'vue'
import 'highlight.js/styles/github.css'
import { registerSW } from 'virtual:pwa-register'


registerSW({
  immediate: true,
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

  return null
}

async function handlePasteAutoOpen(event: ClipboardEvent) {
  const isEnabled = storageManager.getObj('userConfig').value?.autoOpenCopiedLink === 'on'
  if (!isEnabled) return

  const pastedText = event.clipboardData?.getData('text/plain')?.trim()
  if (!pastedText) return

  const target = parseCopiedRouteTarget(pastedText)
  if (!target) return

  if (target.needLogin && !storageManager.getObj('userInfo').value?.User?.ID) {
    showMessage('warning', 'Please login first', { duration: 2000 })
    return
  }

  try {
    await router.push(target.path)
  } catch (error) {
    window.$ErrorLogger?.captureError({
      type: 'custom',
      message: 'Failed to auto-open pasted link',
      context: { pastedText, targetPath: target.path, error },
    })
    showMessage('error', 'Failed to open link', { duration: 2500 })
  }
}

document.addEventListener('paste', handlePasteAutoOpen)
