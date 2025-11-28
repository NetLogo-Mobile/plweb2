import { ref, watch } from "vue";
import { getWasmInstance } from "./pltxt2htm/wasmLoader";
import { getDeallocator } from "./pltxt2htm/deallocator";

let common_parser: ((text: string) => number) | null = null;

async function commonParser(text: string): Promise<string> {
  const wasmInstance = await getWasmInstance();
  if (!common_parser) {
    common_parser = wasmInstance.cwrap("common_parser", "number", ["string"]);
  }
  let deallocate = await getDeallocator();
  let char8_t_const_ptr = common_parser(text);
  let result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}

function parse(source: () => string) {
  const html = ref("");
  watch(
    source,
    async (val) => {
      html.value = val ? await commonParser(val) : "";
    },
    { immediate: true }
  );
  return html;
}

export default parse;
