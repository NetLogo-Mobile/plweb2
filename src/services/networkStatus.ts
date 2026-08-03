import i18n from '@i18n/index'
import { showNotification } from '@popup/naiveui'
import { getNetworkInformation } from './networkInformation'
import type { NetworkInformation } from './networkInformation'

type NetworkState = 'online' | 'poor' | 'offline'

let activeNotification: ReturnType<typeof showNotification> | null = null
let currentState: NetworkState | null = null
let listenerRegistered = false

function isPoorConnection(connection?: NetworkInformation) {
  if (!connection) return false

  return (
    connection.saveData === true ||
    ['slow-2g', '2g', '3g'].includes(connection.effectiveType ?? '') ||
    (connection.downlink !== undefined && connection.downlink > 0 && connection.downlink < 1) ||
    (connection.rtt !== undefined && connection.rtt >= 1000)
  )
}

function getNetworkState(): NetworkState {
  if (!navigator.onLine) return 'offline'
  return isPoorConnection(getNetworkInformation()) ? 'poor' : 'online'
}

function closeNotification() {
  activeNotification?.destroy()
  activeNotification = null
}

function showNetworkNotification(state: Exclude<NetworkState, 'online'>) {
  activeNotification = showNotification({
    type: 'warning',
    title: i18n.global.t(`networkStatus.${state}.title`) as string,
    content: i18n.global.t(`networkStatus.${state}.message`) as string,
    duration: 0,
    closable: true,
  })
}

function updateNetworkStatus() {
  const nextState = getNetworkState()
  if (nextState === currentState) return

  currentState = nextState
  closeNotification()
  if (nextState !== 'online') showNetworkNotification(nextState)
}

export function unregisterNetworkStatusListener() {
  if (!listenerRegistered) return
  listenerRegistered = false
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
  getNetworkInformation()?.removeEventListener('change', updateNetworkStatus)
  closeNotification()
  currentState = null
}

export function registerNetworkStatusListener(): () => void {
  if (listenerRegistered) return unregisterNetworkStatusListener
  listenerRegistered = true

  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  getNetworkInformation()?.addEventListener('change', updateNetworkStatus)
  updateNetworkStatus()
  return unregisterNetworkStatusListener
}
