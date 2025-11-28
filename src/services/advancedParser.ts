import { ref, watch } from "vue";
import { getWasmInstance } from "./pltxt2htm/wasmLoader";
import { getDeallocator } from "./pltxt2htm/deallocator";

let fixedadv_parser: ((text: string, host: string) => number) | null = null;

async function fixedadvParser(text: string, host: string): Promise<string> {
  const wasmInstance = await getWasmInstance();
  if (!fixedadv_parser) {
    fixedadv_parser = wasmInstance.cwrap("fixedadv_parser", "number", ["string", "string"]);
  }
  let deallocate = await getDeallocator();
  let char8_t_const_ptr = fixedadv_parser(text, host);
  let result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}

function parse(source: () => string) {
  const html = ref("");
  watch(
    source,
    async (val) => {
      html.value = val ? await fixedadvParser(val, import.meta.env.VITE_ROOT_URL) : "";
    },
    { immediate: true }
  );
  return html;
}

export default parse;
