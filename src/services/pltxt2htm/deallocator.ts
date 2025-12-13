import { getWasmInstance } from "./wasmLoader";

export async function getDeallocator(): Promise<(ptr: number) => void> {
  const wasmInstance = await getWasmInstance();
  const instanceAny: any = wasmInstance;
  if (!instanceAny.__deallocate_fn) {
    instanceAny.__deallocate_fn = wasmInstance.cwrap("deallocate", null, [
      "number",
    ]);
  }
  return instanceAny.__deallocate_fn as (ptr: number) => void;
}
