import { ref, watch } from "vue";
import { getWasmInstance } from "./wasmLoader";
import { getDeallocator } from "./deallocator";

async function fixedadvParser(text: string, host: string): Promise<string> {
  const wasmInstance = await getWasmInstance();
  const instanceAny: any = wasmInstance;
  if (!instanceAny.__fixedadv_parser_fn) {
    instanceAny.__fixedadv_parser_fn = wasmInstance.cwrap("fixedadv_parser", "number", ["string", "string"]);
  }
  let deallocate = await getDeallocator();
  let char8_t_const_ptr = (instanceAny.__fixedadv_parser_fn as (t: string, h: string) => number)(text, host);
  let result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}


async function parse(source: string) {
  // 计算函数执行用时
  // console.time("commonParser");
  const result = await fixedadvParser(source, import.meta.env.VITE_ROOT_URL);
  // console.timeEnd("commonParser");
  console.log(result)
  return result;
}


export default parse;
