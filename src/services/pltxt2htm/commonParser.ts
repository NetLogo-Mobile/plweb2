import { getWasmInstance } from './wasmLoader'
import { getDeallocator } from './deallocator'
import DOMPurify from 'dompurify'

async function commonParser(text: string): Promise<string> {
  const wasmInstance = await getWasmInstance()
  const instanceAny: any = wasmInstance
  if (!instanceAny.__common_parser_fn) {
    instanceAny.__common_parser_fn = wasmInstance.cwrap('common_parser', 'number', ['string'])
  }
  const deallocate = await getDeallocator()
  const parser = instanceAny.__common_parser_fn as (text: string) => number
  const char8_t_const_ptr = parser(text)
  const result = wasmInstance.UTF8ToString(char8_t_const_ptr)
  deallocate(char8_t_const_ptr)
  return result
}

async function parse(source: string) {
  const html = await commonParser(source)
  return DOMPurify.sanitize(html)
}

export default parse
