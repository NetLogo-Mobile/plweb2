import { getWasmInstance } from './wasmLoader'

export async function getDeallocator(): Promise<(ptr: number) => void> {
  const wasmInstance = await getWasmInstance()
  if (!wasmInstance.__deallocate_fn) {
    wasmInstance.__deallocate_fn = wasmInstance.cwrap('free', null, ['number'])
  }
  return wasmInstance.__deallocate_fn
}
