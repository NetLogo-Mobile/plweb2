import { getWasmInstance } from './wasmLoader'
import { getDeallocator } from './deallocator'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import DOMPurify from 'dompurify'
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
let mermaidRenderId = 0

function ensureMermaidInitialized() {
  if (mermaidInitialized) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
  })
  mermaidInitialized = true
}

function createMermaidDiagram(svg: string): Node | null {
  const diagram = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    RETURN_DOM: true,
  })
  return diagram instanceof SVGSVGElement ? diagram : null
}

async function renderMermaidDiagrams(container: HTMLElement) {
  ensureMermaidInitialized()
  const mermaidBlocks = Array.from(container.querySelectorAll('pre code.language-mermaid'))

  await Promise.all(
    mermaidBlocks.map(async (block) => {
      const source = block.textContent?.trim().replace(/\u00a0/g, ' ')
      if (!source) return

      const pre = block.closest('pre')
      if (!pre) return

      try {
        const renderId = `mermaid-${mermaidRenderId++}`
        const { svg } = await mermaid.render(renderId, source)
        const diagram = createMermaidDiagram(svg)
        if (!diagram) return

        const wrapper = document.createElement('div')
        wrapper.className = 'mermaid-diagram'
        wrapper.replaceChildren(diagram)
        pre.replaceWith(wrapper)
      } catch (error) {
        console.warn('mermaid render failed:', error)
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
  if (!wasmInstance.__advanced_parser_fn) {
    wasmInstance.__advanced_parser_fn = wasmInstance.cwrap(
      'fixedadv_parser',
      'number',
      ['string', 'string', 'string', 'string', 'string', 'string'],
    )
  }

  const deallocate = await getDeallocator()
  const char8_t_const_ptr = wasmInstance.__advanced_parser_fn(
    text,
    host,
    project,
    visitor,
    author,
    coauthors,
  )
  try {
    return wasmInstance.UTF8ToString(char8_t_const_ptr)
  } finally {
    deallocate(char8_t_const_ptr)
  }
}

function renderMath(container: HTMLElement) {
  if (typeof renderMathInElement !== 'function') return
  renderMathInElement(container, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  })
}

function highlightCode(container: HTMLElement) {
  container.querySelectorAll('pre code:not(.language-mermaid)').forEach((block) => {
    hljs.highlightElement(block as HTMLElement)
  })
}

function getParserContext(context: ParseContext) {
  return [
    context.host ?? getPath('/@root'),
    context.project ?? '',
    context.visitorId ?? '',
    context.authorId ?? '',
    context.coauthorIds?.filter(Boolean).join(',') || 'None',
  ] as const
}

async function parse(source: string, context: ParseContext = {}) {
  if (!source) return ''
  const rawHtml = await advancedParser(source, ...getParserContext(context))

  if (!rawHtml) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
  })

  renderMath(tempDiv)
  const enableMermaid = (storageManager.getObj('userConfig')?.value?.mermaid ?? 'on') === 'on'
  if (enableMermaid) await renderMermaidDiagrams(tempDiv)
  highlightCode(tempDiv)
  return tempDiv.innerHTML
}

export default parse
