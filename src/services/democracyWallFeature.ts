export type DemocracyWallReleaseMode = 'off' | 'read-only' | 'full'

function configuredMode(): DemocracyWallReleaseMode {
  const value = String(import.meta.env.VITE_DEMOCRACY_WALL_MODE || '').toLowerCase()
  if (value === 'read-only' || value === 'full') return value
  return import.meta.env.DEV ? 'full' : 'off'
}

export function isDemocracyWallDemoRequest() {
  return import.meta.env.DEV && window.location.hash.includes('demo=1')
}

export function getDemocracyWallReleaseMode(): DemocracyWallReleaseMode {
  return isDemocracyWallDemoRequest() ? 'full' : configuredMode()
}

export function isDemocracyWallVisible() {
  return getDemocracyWallReleaseMode() !== 'off'
}

export function isDemocracyWallWritable() {
  return getDemocracyWallReleaseMode() === 'full'
}
