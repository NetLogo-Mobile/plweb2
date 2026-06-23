import { ref, onMounted, onUnmounted } from 'vue'

interface NetworkInformation extends EventTarget {
  effectiveType?: string
  saveData?: boolean
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
}

function getConnection(): NetworkInformation | null {
  const nav = navigator as Navigator & { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation }
  return nav.connection || nav.mozConnection || nav.webkitConnection || null
}

export function useNetworkStatus() {
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const isPoorConnection = ref(false)

  let connection: NetworkInformation | null = null

  function updateConnectionQuality() {
    if (!connection) return
    const type = connection.effectiveType
    isPoorConnection.value = type === 'slow-2g' || type === '2g' || !!connection.saveData
  }

  function onOnline() {
    isOnline.value = true
    updateConnectionQuality()
  }

  function onOffline() {
    isOnline.value = false
    isPoorConnection.value = false
  }

  function onConnectionChange() {
    updateConnectionQuality()
  }

  onMounted(() => {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    connection = getConnection()
    if (connection) {
      connection.addEventListener('change', onConnectionChange)
      updateConnectionQuality()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)

    if (connection) {
      connection.removeEventListener('change', onConnectionChange)
    }
  })

  return { isOnline, isPoorConnection }
}
