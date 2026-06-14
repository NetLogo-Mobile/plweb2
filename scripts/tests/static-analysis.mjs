#!/usr/bin/env node
/**
 * 静态代码扫描分析工具
 * 
 * 检测项目中的潜在问题：
 * 1. 空 catch 块（可能导致错误被静默吞掉）
 * 2. 404 路径风险（引用了不存在的静态资源）
 * 3. 白屏风险（未处理的 Promise 拒绝、缺少错误边界）
 * 4. console.log 残留
 * 5. Vue 组件常见问题
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs'
import { join, extname, relative } from 'path'

// ==================== 配置 ====================
const SRC_DIR = join(process.cwd(), 'src')
const PUBLIC_DIR = join(process.cwd(), 'public')

const results = []

// ==================== 工具函数 ====================
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

// ==================== 扫描规则 ====================

/**
 * 规则1: 检测空 catch 块
 * 空 catch 块会静默吞掉错误，可能导致白屏等难以排查的问题
 */
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
        const severity = commentOnly ? 'info' : 'warning'
        results.push({
          category: 'empty-catch',
          severity,
          file: relPath,
          line: lineNum,
          message: commentOnly
            ? `空 catch 块（有注释说明: "${commentOnly}"）`
            : '空 catch 块，错误被静默吞掉，可能导致白屏或难以排查的问题',
          code: line,
        })
      }
    }
  }
}

/**
 * 规则2: 检测静态资源引用路径 404 风险
 */
function scanBrokenAssetPaths(filePath) {
  const lines = readFileLines(filePath)
  const relPath = relative(process.cwd(), filePath)
  const ext = extname(filePath)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const srcMatches = line.matchAll(/src=["']([^"']+)["']/g)
    for (const match of srcMatches) {
      const assetPath = match[1]
      if (assetPath.startsWith('/assets/') || assetPath.startsWith('/@base/')) {
        const physicalPath = join(PUBLIC_DIR, assetPath.replace(/^\/@base\//, '/'))
        if (!existsSync(physicalPath)) {
          results.push({
            category: 'broken-asset-path',
            severity: 'warning',
            file: relPath,
            line: lineNum,
            message: `引用的静态资源可能不存在: ${assetPath}`,
            code: line.trim(),
          })
        }
      }
    }

    if (ext === '.vue' || ext === '.css') {
      const urlMatches = line.matchAll(/url\(['"]?([^'")\s]+)['"]?\)/g)
      for (const match of urlMatches) {
        const assetPath = match[1]
        if (!assetPath.startsWith('data:') && !assetPath.startsWith('http') && !assetPath.startsWith('//')) {
          const physicalPath = join(PUBLIC_DIR, assetPath)
          if (!existsSync(physicalPath)) {
            results.push({
              category: 'broken-asset-path',
              severity: 'info',
              file: relPath,
              line: lineNum,
              message: `CSS 中引用的资源可能不存在: ${assetPath}`,
              code: line.trim(),
            })
          }
        }
      }
    }
  }
}

/**
 * 规则3: 检测白屏风险
 */
function scanWhiteScreenRisk(filePath) {
  const lines = readFileLines(filePath)
  const relPath = relative(process.cwd(), filePath)
  const content = lines.join('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // 检测 .then() 无 .catch() 的链式调用
    if (line.includes('.then(') && !line.includes('.catch(')) {
      let hasCatch = false
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('.catch(')) {
          hasCatch = true
          break
        }
      }
      if (!hasCatch) {
        results.push({
          category: 'white-screen-risk',
          severity: 'warning',
          file: relPath,
          line: lineNum,
          message: '.then() 调用缺少 .catch()，未处理的 Promise 拒绝可能导致白屏',
          code: line.trim(),
        })
      }
    }

    // 检测直接访问可能为 null 的对象属性
    if (/\w+\.\w+/.test(line) && !line.includes('?.') && !line.includes('null') && !line.includes('undefined')) {
      if (line.includes('Data.') && !line.includes('Data?.')) {
        results.push({
          category: 'white-screen-risk',
          severity: 'info',
          file: relPath,
          line: lineNum,
          message: '直接访问 Data 属性未使用可选链，如果 Data 为 null 可能导致白屏',
          code: line.trim(),
        })
      }
    }
  }
}

/**
 * 规则4: 检测 console.log 残留
 */
function scanConsoleLog(filePath) {
  const lines = readFileLines(filePath)
  const relPath = relative(process.cwd(), filePath)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineNum = i + 1

    if (line.includes('console.log(') && !line.startsWith('//')) {
      results.push({
        category: 'console-log',
        severity: 'info',
        file: relPath,
        line: lineNum,
        message: 'console.log 残留，建议在生产构建前移除',
        code: line,
      })
    }
  }
}

/**
 * 规则5: 检测 Vue 组件中的常见问题
 */
function scanVueIssues(filePath) {
  if (extname(filePath) !== '.vue') return

  const lines = readFileLines(filePath)
  const relPath = relative(process.cwd(), filePath)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    if (line.includes('v-for') && !line.includes(':key')) {
      const nextLine = lines[i + 1] || ''
      if (!nextLine.includes(':key')) {
        results.push({
          category: 'vue-issue',
          severity: 'warning',
          file: relPath,
          line: lineNum,
          message: 'v-for 缺少 :key，可能导致渲染异常',
          code: line.trim(),
        })
      }
    }

    if (line.includes('v-html') && !line.startsWith('<!--')) {
      results.push({
        category: 'vue-issue',
        severity: 'info',
        file: relPath,
        line: lineNum,
        message: 'v-html 使用存在 XSS 风险，确保内容已消毒',
        code: line.trim(),
      })
    }
  }
}

// ==================== 执行扫描 ====================
console.log('🔍 开始静态代码扫描分析...\n')

const sourceFiles = getAllFiles(SRC_DIR, ['.ts', '.vue', '.js'])
console.log(`📁 扫描 ${sourceFiles.length} 个源文件\n`)

for (const file of sourceFiles) {
  scanEmptyCatch(file)
  scanBrokenAssetPaths(file)
  scanWhiteScreenRisk(file)
  scanConsoleLog(file)
  scanVueIssues(file)
}

// ==================== 输出结果 ====================
const errors = results.filter((r) => r.severity === 'error')
const warnings = results.filter((r) => r.severity === 'warning')
const infos = results.filter((r) => r.severity === 'info')

console.log('═'.repeat(60))
console.log('📊 扫描结果汇总')
console.log('═'.repeat(60))
console.log(`  ❌ 错误: ${errors.length}`)
console.log(`  ⚠️  警告: ${warnings.length}`)
console.log(`  ℹ️  信息: ${infos.length}`)
console.log(`  📋 总计: ${results.length}`)
console.log('═'.repeat(60))

const categories = [...new Set(results.map((r) => r.category))]
console.log('\n📈 按类别统计:')
for (const cat of categories) {
  const catResults = results.filter((r) => r.category === cat)
  console.log(`  ${cat}: ${catResults.length} 项`)
}

if (warnings.length > 0) {
  console.log('\n⚠️  警告详情:')
  for (const r of warnings) {
    console.log(`  ${r.file}:${r.line} - ${r.message}`)
    if (r.code) console.log(`    ${r.code}`)
  }
}

if (infos.length > 0) {
  console.log('\nℹ️  信息详情:')
  for (const r of infos.slice(0, 30)) {
    console.log(`  ${r.file}:${r.line} - ${r.message}`)
  }
  if (infos.length > 30) {
    console.log(`  ... 还有 ${infos.length - 30} 条信息`)
  }
}

// 输出 JSON 报告
const reportPath = join(process.cwd(), 'scripts', 'tests', 'reports', 'static-analysis-report.json')
writeFileSync(
  reportPath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        errors: errors.length,
        warnings: warnings.length,
        infos: infos.length,
      },
      byCategory: Object.fromEntries(categories.map((cat) => [cat, results.filter((r) => r.category === cat).length])),
      results: results,
    },
    null,
    2,
  ),
)
console.log(`\n📄 详细报告已保存到: ${reportPath}`)

if (errors.length > 0) {
  console.log('\n❌ 扫描发现错误，请修复后重新运行')
  process.exit(1)
} else {
  console.log('\n✅ 扫描完成，无严重错误')
  process.exit(0)
}
