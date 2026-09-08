import { ref } from 'vue'
import { getData } from './api/getData'
import storage from './storage'

export const FRAME_IDS = ['orbit', 'laurel', 'prism'] as const
export type AvatarFrameId = (typeof FRAME_IDS)[number]
export interface AvatarFrameInventory {
  Owned: AvatarFrameId[]
  Equipped: AvatarFrameId | null
  IsBanned: boolean
  Revision: string
}
export interface FramedUser {
  ID?: string
  UserID?: string
  Verification?: string
  IsBanned?: boolean
  AvatarFrameID?: string | null
}

export const frameInventory = ref<AvatarFrameInventory | null>(null)
export function isFrameDemo() {
  return (
    import.meta.env.DEV && new URLSearchParams(location.hash.split('?')[1]).get('frameDemo') === '1'
  )
}
export function framesEnabled() {
  return isFrameDemo() || import.meta.env.VITE_AVATAR_FRAMES === 'on'
}
export function isFrameId(value: unknown): value is AvatarFrameId {
  return FRAME_IDS.some((id) => id === value)
}
export function visibleFrame(user: FramedUser | undefined): AvatarFrameId | null {
  if (!user || user.IsBanned || user.Verification === 'Banned') return null
  if (isFrameDemo() && user.ID === 'frame-demo') {
    const inventory = frameInventory.value
    return inventory && !inventory.IsBanned ? inventory.Equipped : null
  }
  return user.Verification && isFrameId(user.AvatarFrameID) ? user.AvatarFrameID : null
}
function readDemo(): AvatarFrameInventory {
  const saved = storage.getObj('avatarFrameDemo').value
  return saved || { Owned: [...FRAME_IDS], Equipped: null, IsBanned: false, Revision: '0' }
}
export async function loadFrames() {
  frameInventory.value = null
  if (isFrameDemo()) return (frameInventory.value = readDemo())
  if (!framesEnabled()) throw new Error('frames-unavailable')
  const result = await getData('/AvatarFrames/GetInventory', {})
  if (result.Status !== 200 || !result.Data) throw new Error('frames-unavailable')
  return (frameInventory.value = result.Data)
}
export async function equipFrame(id: AvatarFrameId | null) {
  if (isFrameDemo()) {
    const inventory = readDemo()
    if (inventory.IsBanned) throw new Error('account-banned')
    if (id && !inventory.Owned.includes(id)) throw new Error('frame-not-owned')
    inventory.Equipped = id
    inventory.Revision = String(Number(inventory.Revision) + 1)
    storage.setObj('avatarFrameDemo', inventory)
    frameInventory.value = inventory
    return
  }
  if (!framesEnabled() || !frameInventory.value) throw new Error('frames-unavailable')
  const result = await getData('/AvatarFrames/Equip', {
    FrameID: id,
    ExpectedRevision: frameInventory.value.Revision,
  })
  if (result.Status !== 200 || !result.Data) throw new Error('equip-failed')
  frameInventory.value = result.Data
}
export function setDemoFrameBan(banned: boolean) {
  if (!isFrameDemo()) throw new Error('demo-only')
  const inventory = readDemo()
  inventory.IsBanned = banned
  if (banned) inventory.Equipped = null
  inventory.Revision = String(Number(inventory.Revision) + 1)
  storage.setObj('avatarFrameDemo', inventory)
  frameInventory.value = inventory
}
