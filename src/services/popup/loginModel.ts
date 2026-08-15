import { createApp } from 'vue'
import loginModel from '../../components/popup/loginModel.vue'
import i18n from '@i18n/index'

let loginModalOpen = false

export default async function showLoginModel() {
  if (loginModalOpen) return
  loginModalOpen = true
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
  const app = createApp(loginModel, {
    close: () => {
      app.unmount()
      div.remove()
      loginModalOpen = false
    },
  })
  app.use(i18n)
  app.mount(div)
}
