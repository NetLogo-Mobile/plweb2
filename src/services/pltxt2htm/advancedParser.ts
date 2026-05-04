import { getWasmInstance } from "./wasmLoader";
import { getDeallocator } from "./deallocator";
import hljs from "highlight.js";
import renderMathInElement from "katex/contrib/auto-render/auto-render.js";
import "katex/dist/katex.min.css";
import { escapeToHtml, isPrerenderRuntime } from "./prerender";

interface ParseContext {
  host?: string;
  project?: string;
  visitorId?: string;
  authorId?: string;
  coauthorIds?: string[];
}

async function advancedParser(
  text: string,
  host: string,
  project: string,
  visitor: string,
  author: string,
  coauthors: string,
): Promise<string> {
  const wasmInstance = await getWasmInstance();
  const instanceAny: any = wasmInstance;
  if (!instanceAny.__advanced_parser_fn) {
    instanceAny.__advanced_parser_fn = wasmInstance.cwrap("fixedadv_parser", "number", [
      "string",
      "string",
      "string",
      "string",
      "string",
      "string",
    ]);
  }

  const deallocate = await getDeallocator();
  const char8_t_const_ptr = (
    instanceAny.__advanced_parser_fn as (
      _1: string,
      _2: string,
      _3: string,
      _4: string,
      _5: string,
      _6: string,
    ) => number
  )(text, host, project, visitor, author, coauthors);
  const result = wasmInstance.UTF8ToString(char8_t_const_ptr);
  deallocate(char8_t_const_ptr);
  return result;
}

async function parse(source: string, context: ParseContext = {}) {
  if (!source) return "";
  if (isPrerenderRuntime()) return escapeToHtml(source);

  let rawHtml = "";
  try {
    rawHtml = await advancedParser(
    source,
    context.host ?? import.meta.env.VITE_ROOT_URL ?? "",
    context.project ?? "",
    context.visitorId ?? "",
    context.authorId ?? "",
    context.coauthorIds?.filter(Boolean).join(",") || "None",
  );
  } catch {
    return escapeToHtml(source);
  }

  if (!rawHtml) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawHtml;

  if (typeof renderMathInElement === "function") {
    renderMathInElement(tempDiv, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    });
  }

  tempDiv.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });

  return tempDiv.innerHTML;
}

export default parse;
