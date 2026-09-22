import { createApp } from 'vue'
import UserCard from '../../components/popup/userProfileDialog.vue'
import i18n from '@i18n/index'

let currentClose: (() => void) | null = null

/**
 * To open a user information card without handling any other events
 * @param {string} userid
 */
export default function showUserProfileDialog(userid: string): () => void {
  currentClose?.()
  const div = document.createElement('div')
  document.body.appendChild(div)
  let closed = false
  const app = createApp(UserCard, {
    userid,
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
