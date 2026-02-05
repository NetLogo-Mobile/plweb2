import { getWasmInstance } from "./wasmLoader";
import { getDeallocator } from "./deallocator";
import hljs from "highlight.js";
import dompurify from "dompurify";
// import renderMathInElement from "katex/contrib/auto-render/auto-render.js";

async function advancedParser(text: string, host: string, project: string, visitor: string,
    author : string, coauthors: string): Promise<string> {
  const wasmInstance = await getWasmInstance();
  const instanceAny: any = wasmInstance;
  if (!instanceAny.__advanced_parser_fn) {
    instanceAny.__advanced_parser_fn = wasmInstance.cwrap(
      "fixedadv_parser",
      "number",
      ["string", "string", "string", "string", "string", "string"]
    );
  }
  let deallocate = await getDeallocator();
  let char8_t_const_ptr = (
    instanceAny.__advanced_parser_fn as (_1: string, _2: string, _3: string, _4: string, _5: string, _6: string) => number
  )(text, host,
    project, visitor, author, coauthors
  );
  let result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}

async function parse(source: string, project: string, visitor_name: string, visitor_id: string, author_name: string, author_id: string, coauthors: string[]) {
  console.log(source);
  // TODO i18n support for 'None'
  const rawHtml = await advancedParser(source, import.meta.env.VITE_ROOT_URL, project, `<span class='RUser' data-user='${visitor_id}'>${dompurify.sanitize(visitor_name)}</span>`,
     `<span class='RUser' data-user='${author_id}'>${dompurify.sanitize(author_name)}</span>`, coauthors.length ? coauthors.join(",") : "None");
  console.log(rawHtml);
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
    hljs.highlightElement(block as HTMLElement);
  });
  return dompurify.sanitize(tempDiv.innerHTML);
}

export default parse;
