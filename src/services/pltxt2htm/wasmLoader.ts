let wasmInstance: any = null;
let wasmInstancePromise: Promise<any> | null = null;

/**
 * To load the WebAssembly instance only once and reuse it.
 * Guard initialization using a promise so concurrent calls won't re-init multiple times.
 * @returns WebAssembly instance.
 */
export async function getWasmInstance() {
  if (wasmInstance) return wasmInstance;
  if (wasmInstancePromise) return wasmInstancePromise;
  wasmInstancePromise = (async () => {
    // @ts-expect-error No type info
    const pltxt2htm = (await import("./vendor/pltxt2htm.js")).default;
    wasmInstance = await pltxt2htm();
    wasmInstancePromise = null;
    return wasmInstance;
  })();
  return wasmInstancePromise;
}
