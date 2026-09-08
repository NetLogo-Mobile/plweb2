import { computed, onMounted, onUnmounted, ref } from 'vue'
import storage from './storage'

export const WALLPAPERS = [
  {
    id: 'tide',
    background:
      'radial-gradient(ellipse at 10% 15%, #a8dce8 0%, transparent 55%), radial-gradient(ellipse at 90% 85%, #b6c5ef 0%, transparent 60%), linear-gradient(130deg, #eff9fc, #e5edf8)',
  },
  {
    id: 'dawn',
    background:
      'radial-gradient(ellipse at 85% 10%, #efd0b7 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, #dbcae9 0%, transparent 60%), linear-gradient(145deg, #fff5e9, #f3eafa)',
  },
  {
    id: 'grid',
    background:
      'repeating-linear-gradient(0deg, transparent 0 39px, #638a9c12 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, #638a9c12 39px 40px), radial-gradient(ellipse at top right, #cce6dd, #f2f7ed)',
  },
] as const
export type WallpaperId = (typeof WALLPAPERS)[number]['id']

function readWallpaper(): WallpaperId | null {
  if (!import.meta.env.DEV) return null
  const value = storage.getObj('siteWallpaper').value
  return WALLPAPERS.find((item) => item.id === value)?.id ?? null
}

export const wallpaperId = ref<WallpaperId | null>(readWallpaper())
export const wallpaper = computed(() => WALLPAPERS.find((item) => item.id === wallpaperId.value))

export function setWallpaper(id: WallpaperId | null) {
  if (id !== null && !import.meta.env.DEV) throw new Error('Wallpaper ownership service unavailable')
  if (id !== null && !WALLPAPERS.some((item) => item.id === id))
    throw new Error('Unknown wallpaper')
  if (id === null) storage.remove('siteWallpaper')
  else storage.setObj('siteWallpaper', id)
  wallpaperId.value = id
}

export function useWallpaperSync() {
  function sync(event: StorageEvent) {
    if (
      event.storageArea === localStorage &&
      (event.key === 'siteWallpaper' || event.key === null)
    ) {
      wallpaperId.value = readWallpaper()
    }
  }
  onMounted(() => window.addEventListener('storage', sync))
  onUnmounted(() => window.removeEventListener('storage', sync))
}
