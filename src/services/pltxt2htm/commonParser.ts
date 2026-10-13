import { getWasmInstance } from './wasmLoader'
import { getDeallocator } from './deallocator'

async function commonParser(text: string): Promise<string> {
  const wasmInstance = await getWasmInstance()
  if (!wasmInstance.__common_parser_fn) {
    wasmInstance.__common_parser_fn = wasmInstance.cwrap('common_parser', 'number', ['string'])
  }
  const deallocate = await getDeallocator()
  const char8_t_const_ptr = wasmInstance.__common_parser_fn(text)
  try {
    return wasmInstance.UTF8ToString(char8_t_const_ptr)
  } finally {
    deallocate(char8_t_const_ptr)
  }
}

async function parse(source: string) {
  return commonParser(source)
}

export default parse
