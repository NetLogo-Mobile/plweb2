
import { getWasmInstance } from "./wasmLoader";
import { getDeallocator } from "./deallocator";

async function commonParser(text: string): Promise<string> {
  const wasmInstance = await getWasmInstance();
  const instanceAny: any = wasmInstance;
  if (!instanceAny.__common_parser_fn) {
    instanceAny.__common_parser_fn = wasmInstance.cwrap("common_parser", "number", ["string"]);
  }
  let deallocate = await getDeallocator();
  const parser = instanceAny.__common_parser_fn as (text: string) => number;
  let char8_t_const_ptr = parser(text);
  let result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}

// @ts-expect-error test
window.$p = parse

async function parse(source: string) {
  // 计算函数执行用时
  // console.time("commonParser");
  const result = await commonParser(source);
  // console.timeEnd("commonParser");
  console.log(result)
  return result;
}

export default parse;
