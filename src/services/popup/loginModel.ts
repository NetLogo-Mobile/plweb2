import { createApp } from 'vue'
import loginModel from '../../components/popup/loginModel.vue'
import i18n from '@i18n/index'

let currentClose: (() => void) | null = null

export default function showLoginModel(): () => void {
  currentClose?.()
  const div = document.createElement('div')
  Object.assign(div.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '8000',
    // make sure it's on top.
    // I donnot know why it need to be as big as 8000, but it works.
    pointerEvents: 'auto',
    background: 'transparent',
  })
  document.body.appendChild(div)
  let closed = false
  const app = createApp(loginModel, {
    close,
  })

  function close() {
    if (closed) return
    closed = true
    app.unmount()
    div.remove()
    if (currentClose === close) currentClose = null
  }

  currentClose = close
  app.use(i18n)
  app.mount(div)
  return close
}
