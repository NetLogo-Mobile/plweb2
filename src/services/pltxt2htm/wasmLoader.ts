export interface Pltxt2HtmModule {
  UTF8ToString: (pointer: number) => string
  cwrap: {
    (name: string, returnType: null, argumentTypes: string[]): (pointer: number) => void
    (name: string, returnType: 'number', argumentTypes: string[]): (...args: string[]) => number
  }
  __deallocate_fn?: (pointer: number) => void
  __common_parser_fn?: (text: string) => number
  __advanced_parser_fn?: (...args: string[]) => number
}

let wasmInstance: Pltxt2HtmModule | null = null
let wasmInstancePromise: Promise<Pltxt2HtmModule> | null = null

/**
 * To load the WebAssembly instance only once and reuse it.
 * Guard initialization using a promise so concurrent calls won't re-init multiple times.
 * @returns WebAssembly instance.
 */
export async function getWasmInstance(): Promise<Pltxt2HtmModule> {
  if (wasmInstance) return wasmInstance
  if (wasmInstancePromise) return wasmInstancePromise
  wasmInstancePromise = (async () => {
    const pltxt2htm = (await import('./vendor/pltxt2htm.js')).default
    wasmInstance = (await pltxt2htm()) as Pltxt2HtmModule
    return wasmInstance
  })().catch((error) => {
    wasmInstancePromise = null
    throw error
  })
  return wasmInstancePromise
}
