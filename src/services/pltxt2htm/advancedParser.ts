import { getWasmInstance } from "./wasmLoader";
import { getDeallocator } from "./deallocator";
import hljs from "highlight.js";
import dompurify from "dompurify";
// import renderMathInElement from "katex/contrib/auto-render/auto-render.js";

async function fixedadvParser(text: string, host: string): Promise<string> {
  const wasmInstance = await getWasmInstance();
  const instanceAny: any = wasmInstance;
  if (!instanceAny.__fixedadv_parser_fn) {
    instanceAny.__fixedadv_parser_fn = wasmInstance.cwrap(
      "fixedadv_parser",
      "number",
      ["string", "string"]
    );
  }
  let deallocate = await getDeallocator();
  let char8_t_const_ptr = (
    instanceAny.__fixedadv_parser_fn as (t: string, h: string) => number
  )(text, host);
  let result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}

async function parse(source: string) {
  const rawHtml = await fixedadvParser(source, import.meta.env.VITE_ROOT_URL);
  console.log(rawHtml)
  if (!rawHtml) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawHtml;
  // if (typeof renderMathInElement === "function") {
  //   renderMathInElement(tempDiv, {
  //     delimiters: [
  //       { left: "$$", right: "$$", display: true },
  //       { left: "$", right: "$", display: false },
  //       { left: "\\(", right: "\\)", display: false },
  //       { left: "\\[", right: "\\]", display: true },
  //     ],
  //     ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
  //   });
  // }
  tempDiv.querySelectorAll("pre code").forEach((block) => {
    block.querySelectorAll("br").forEach(br => br.replaceWith("\n"))
    hljs.highlightElement(block as HTMLElement);
  });
  return dompurify.sanitize(tempDiv.innerHTML);
}

export default parse;
