import { createApp, ref } from 'vue'
import type { Ref } from 'vue'
import ApiErrorDialog from '../../components/popup/ApiErrorDialog.vue'
import i18n from '@i18n/index'
import { showMessage } from './naiveui'
import type { Result } from '../../pl-serve-type-main/type/main'

// Single dialog state for reuse (prevents stacking)
let current: {
  close: () => void
  title: Ref<string>
  message: Ref<string>
  retry?: () => Promise<unknown> | void
} | null = null

function updateCurrentDialog(title: string, message: string, retry?: () => Promise<unknown> | void) {
  if (!current) return false
  current.title.value = title
  current.message.value = message
  current.retry = retry
  return true
}

async function retryCurrent(close: () => void) {
  if (!current?.retry) return
  try {
    const result = await current.retry()
    if ((result as Result | null)?.Status === 200) {
      showMessage('success', (i18n.global.t('ui.retrySuccess') as string) || 'Success')
      close()
    } else {
      showMessage('error', (i18n.global.t('ui.retryFailed') as string) || 'Retry failed', {
        duration: 3000,
      })
    }
    return result
  } catch (_error) {
    showMessage('error', (i18n.global.t('ui.retryFailed') as string) || 'Retry failed', {
      duration: 3000,
    })
  }
}

export function showAPiError(
  title: string,
  message: string,
  retry?: () => Promise<unknown> | void,
) {
  if (updateCurrentDialog(title, message, retry)) return

  const titleRef = ref(title)
  const messageRef = ref(message)

  const div = document.createElement('div')
  document.body.appendChild(div)
  let closed = false

  const app = createApp(ApiErrorDialog, {
    titleRef,
    messageRef,
    confirmLabel: (i18n.global.t('ui.ok') as string) || 'OK',
    cancelLabel: (i18n.global.t('ui.cancel') as string) || 'Cancel',
    confirmingLabel: (i18n.global.t('ui.retrying') as string) || 'Retrying...',
    onConfirm: () => retryCurrent(close),
    close: close,
  })

  app.use(i18n)

  function close() {
    if (closed) return
    closed = true
    app.unmount()
    div.remove()
    if (current && current.close === close) current = null
  }

  current = { close, title: titleRef, message: messageRef, retry }
  app.mount(div)
}
