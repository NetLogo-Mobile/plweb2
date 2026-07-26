export interface NetworkInformation extends EventTarget {
  downlink?: number
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  rtt?: number
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

export function getNetworkInformation(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined
  const networkNavigator = navigator as NavigatorWithConnection
  return (
    networkNavigator.connection ??
    networkNavigator.mozConnection ??
    networkNavigator.webkitConnection
  )
}
