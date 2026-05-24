import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import i18n from '@i18n/index'
import ErrorLogger from './services/errorLogger.ts'
import { LogManager } from '@api/logWriter.ts'
import { getPath } from '@services/utils'
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
