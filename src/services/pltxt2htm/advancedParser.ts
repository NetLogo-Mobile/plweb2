import hljs from "highlight.js";
import renderMathInElement from "katex/contrib/auto-render/auto-render.js";
import "katex/dist/katex.min.css";
import { escapeToHtml } from "./prerender";

interface ParseContext {
  host?: string;
  project?: string;
  visitorId?: string;
  authorId?: string;
  coauthorIds?: string[];
}

async function parse(source: string, _context: ParseContext = {}) {
  if (!source) return "";

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = escapeToHtml(source);

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
