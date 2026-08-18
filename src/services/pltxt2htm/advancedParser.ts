import { getWasmInstance } from './wasmLoader'
import { getDeallocator } from './deallocator'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import renderMathInElement from 'katex/contrib/auto-render/auto-render.js'
import 'katex/dist/katex.min.css'
import storageManager from '@storage/index'
import { getPath } from '@services/utils'

interface ParseContext {
  host?: string
  project?: string
  visitorId?: string
  authorId?: string
  coauthorIds?: string[]
}

let mermaidInitialized = false

function ensureMermaidInitialized() {
  if (mermaidInitialized) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
  })
  mermaidInitialized = true
}


async function renderMermaidDiagrams(container: HTMLElement) {
  ensureMermaidInitialized()
  const mermaidBlocks = Array.from(container.querySelectorAll('pre code.language-mermaid'))

  await Promise.all(
    mermaidBlocks.map(async (block, index) => {
      const source = block.textContent?.trim().replace(/\u00a0/g, " ");
      if (!source) return;

      const pre = block.closest('pre')
      if (!pre) return

      try {
        const renderId = `mermaid-${Date.now()}-${index}`;
        const { svg } = await mermaid.render(renderId, source);
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-diagram";
        wrapper.innerHTML = svg;
        pre.replaceWith(wrapper);
      } catch (e) {
        console.warn("mermaid render failed:", e);
      }
    }),
  )
}

async function advancedParser(
  text: string,
  host: string,
  project: string,
  visitor: string,
  author: string,
  coauthors: string,
): Promise<string> {
  const wasmInstance = await getWasmInstance()
  const instanceAny: any = wasmInstance
  if (!instanceAny.__advanced_parser_fn) {
    instanceAny.__advanced_parser_fn = wasmInstance.cwrap(
      "fixedadv_parser",
      "number",
      ["string", "string", "string", "string", "string", "string"],
    );
  }

  const deallocate = await getDeallocator()
  const char8_t_const_ptr = (
    instanceAny.__advanced_parser_fn as (
      _1: string,
      _2: string,
      _3: string,
      _4: string,
      _5: string,
      _6: string,
    ) => number
  )(text, host, project, visitor, author, coauthors)
  const result = wasmInstance.UTF8ToString(char8_t_const_ptr)
  deallocate(char8_t_const_ptr)
  return result
}

async function parse(source: string, context: ParseContext = {}) {
  if (!source) return ''
  const rawHtml = await advancedParser(
    source,
    context.host ?? getPath('/@root'),
    context.project ?? '',
    context.visitorId ?? '',
    context.authorId ?? '',
    context.coauthorIds?.filter(Boolean).join(',') || 'None',
  )

  if (!rawHtml) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = rawHtml

  if (typeof renderMathInElement === 'function') {
    renderMathInElement(tempDiv, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    })
  }

  const enableMermaid = (storageManager.getObj('userConfig')?.value?.mermaid ?? 'on') === 'on'
  if (enableMermaid) {
    await renderMermaidDiagrams(tempDiv)
  }

  tempDiv
    .querySelectorAll("pre code:not(.language-mermaid)")
    .forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

  return tempDiv.innerHTML
}

export default parse
