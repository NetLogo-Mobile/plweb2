// Some popup services using NaiveUI
// https://www.naiveui.com/en-US/os-theme/components/discrete#basic.vue

import { createDiscreteApi } from 'naive-ui'
import type { MessageOptions, NotificationOptions, DialogOptions, ModalOptions } from 'naive-ui'

const { message, notification, dialog, loadingBar, modal } = createDiscreteApi([
  'message',
  'dialog',
  'notification',
  'loadingBar',
  'modal',
])
let loadingBarTimer: ReturnType<typeof setTimeout> | null = null

export function showMessage(
  type: 'loading' | 'info' | 'success' | 'warning' | 'error',
  content: string,
  config?: MessageOptions,
) {
  return message[type](content, config)
}

export function showNotification(config: NotificationOptions) {
  return notification.create(config)
}

export function showDialog(type: 'info' | 'success' | 'warning' | 'error', config: DialogOptions) {
  return dialog[type](config)
}

export function showModal(config: ModalOptions) {
  return modal.create(config)
}

export function showLoadingBar(duration: number) {
  if (loadingBarTimer) clearTimeout(loadingBarTimer)
  loadingBar.start()
  loadingBarTimer = setTimeout(() => {
    loadingBar.finish()
    loadingBarTimer = null
  }, duration)
}
