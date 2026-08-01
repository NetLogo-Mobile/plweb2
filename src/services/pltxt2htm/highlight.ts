import hljs from 'highlight.js/lib/core'
import type { LanguageFn } from 'highlight.js'
import 'highlight.js/styles/github.css'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import bash from 'highlight.js/lib/languages/bash'
import powershell from 'highlight.js/lib/languages/powershell'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

const languages: Record<string, LanguageFn> = {
  javascript,
  typescript,
  python,
  java,
  c,
  cpp,
  csharp,
  go,
  rust,
  kotlin,
  swift,
  php,
  ruby,
  bash,
  powershell,
  sql,
  json,
  xml,
  css,
  markdown,
  yaml,
  dockerfile,
}

for (const [name, lang] of Object.entries(languages)) {
  hljs.registerLanguage(name, lang)
}

export function highlightCodeBlocks(container: HTMLElement) {
  container
    .querySelectorAll('pre code:not(.language-mermaid)')
    .forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })
}
