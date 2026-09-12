import { createApp } from 'vue'
import ActionSheet from '../../components/popup/actionSheet.vue'

let currentClose: (() => void) | null = null

/**
 * To show an action sheet. Click outside to close.Click option to callback.
 * 弹出底部操作选项，点击遮罩关闭，点击选项回调
 * @param options 选项数组，每项 { label: string }
 * @param onSelect 选中回调 (index: number)
 */
export default function showActionSheet(
  options: { label: string }[],
  onSelect: (idx: number) => void,
): () => void {
  currentClose?.()
  const div = document.createElement('div')
  document.body.appendChild(div)
  let closed = false
  const app = createApp(ActionSheet, {
    options,
    close,
    onSelect,
  })

  function close() {
    if (closed) return
    closed = true
    app.unmount()
    div.remove()
    if (currentClose === close) currentClose = null
  }

  currentClose = close
  app.mount(div)
  return close
}
