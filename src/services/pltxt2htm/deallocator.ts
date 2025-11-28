import { getWasmInstance } from "./wasmLoader";

let deallocate: ((ptr: number) => void) | null = null;

export async function getDeallocator() : Promise<(ptr: number) => void> {
  if (!deallocate) {
    const wasmInstance = await getWasmInstance();
    deallocate = wasmInstance.cwrap("deallocate", null, ["number"]);
  }
  return deallocate;
}
