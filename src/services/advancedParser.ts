import { ref, watch } from "vue";
import { getWasmInstance } from "./pltxt2htm/wasmLoader";

let fixedadv_parser: ((text: string, host: string) => string) | null = null;

async function FixedadvParser(text: string, host: string): Promise<string> {
  if (!fixedadv_parser) {
    const wasmInstance = await getWasmInstance();
    fixedadv_parser = wasmInstance.cwrap("fixedadv_parser", "string", ["string", "string"]);
  }
  return fixedadv_parser(text, host);
}

function parse(source: () => string) {
  const html = ref("");
  watch(
    source,
    async (val) => {
      html.value = val ? await FixedadvParser(val, `${window.location.host}/#`) : "";
    },
    { immediate: true }
  );
  return html;
}

export default parse;
