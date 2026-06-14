#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, extname, relative } from 'path'

const SRC_DIR = join(process.cwd(), 'src')

const results = []

function getAllFiles(dir, extensions) {
  const files = []
  if (!existsSync(dir)) return files

  function walk(d) {
    const entries = readdirSync(d, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(d, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          walk(fullPath)
        }
      } else if (extensions.includes(extname(entry.name))) {
        files.push(fullPath)
      }
    }
  }
  walk(dir)
  return files
}

function readFileLines(filePath) {
  try {
    return readFileSync(filePath, 'utf-8').split('\n')
  } catch {
    return []
  }
}

function scanEmptyCatch(filePath) {
  const lines = readFileLines(filePath)
  const relPath = relative(process.cwd(), filePath)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineNum = i + 1

    if (/catch\s*(\(\w*\))?\s*\{/.test(line)) {
      let j = i + 1
      let hasContent = false
      let commentOnly = ''
      while (j < lines.length && j < i + 10) {
        const nextLine = lines[j].trim()
        if (nextLine === '}') {
          break
        }
        if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('*') && !nextLine.startsWith('/*')) {
          hasContent = true
          break
        }
        if (nextLine.startsWith('//')) {
          commentOnly = nextLine
        }
        j++
      }

      if (!hasContent) {
        results.push({
          category: 'empty-catch',
          severity: commentOnly ? 'info' : 'warning',
          file: relPath,
          line: lineNum,
          message: commentOnly
            ? `空 catch 块（有注释说明: "${commentOnly}"）`
            : '空 catch 块，错误被静默吞掉',
          code: line,
        })
      }
    }
  }
}

console.log('扫描空 catch 块...')

const sourceFiles = getAllFiles(SRC_DIR, ['.ts', '.vue', '.js'])
console.log(`扫描 ${sourceFiles.length} 个源文件`)

for (const file of sourceFiles) {
  scanEmptyCatch(file)
}

const errors = results.filter((r) => r.severity === 'error')
const warnings = results.filter((r) => r.severity === 'warning')
const infos = results.filter((r) => r.severity === 'info')

console.log(`错误: ${errors.length}, 警告: ${warnings.length}, 信息: ${infos.length}`)

for (const r of warnings) {
  console.log(`  ${r.file}:${r.line} - ${r.message}`)
}
for (const r of infos) {
  console.log(`  ${r.file}:${r.line} - ${r.message}`)
}

const reportDir = join(process.cwd(), 'scripts', 'tests', 'reports')
mkdirSync(reportDir, { recursive: true })
writeFileSync(
  join(reportDir, 'static-analysis-report.json'),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total: results.length, errors: errors.length, warnings: warnings.length, infos: infos.length },
    byCategory: { 'empty-catch': results.length },
    results,
  }),
)

if (errors.length > 0) {
  process.exit(1)
}
