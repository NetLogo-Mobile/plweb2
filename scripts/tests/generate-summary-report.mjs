#!/usr/bin/env node
/**
 * 测试报告汇总生成器
 * 
 * 合并静态分析和 Playwright 测试结果，生成最终报告
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const REPORTS_DIR = join(process.cwd(), 'scripts', 'tests', 'reports')

const report = {
  timestamp: new Date().toISOString(),
  staticAnalysis: { available: false },
  playwright: { available: false },
  overall: { status: 'partial', message: '' },
}

// 读取静态分析报告
const staticReportPath = join(REPORTS_DIR, 'static-analysis-report.json')
if (existsSync(staticReportPath)) {
  try {
    const staticReport = JSON.parse(readFileSync(staticReportPath, 'utf-8'))
    report.staticAnalysis = {
      available: true,
      summary: staticReport.summary,
      byCategory: staticReport.byCategory,
    }
  } catch {
    // ignore
  }
}

// 读取 Playwright 报告
const pwReportPath = join(REPORTS_DIR, 'playwright-results.json')
if (existsSync(pwReportPath)) {
  try {
    const pwReport = JSON.parse(readFileSync(pwReportPath, 'utf-8'))
    const stats = pwReport.stats || {}
    report.playwright = {
      available: true,
      summary: {
        passed: stats.expected || stats.passed || 0,
        failed: stats.unexpected || stats.failed || 0,
        skipped: stats.skipped || 0,
        total: (stats.expected || 0) + (stats.unexpected || 0) + (stats.skipped || 0),
        duration: stats.duration || 0,
      },
      suites: pwReport.suites || [],
    }
  } catch {
    // ignore
  }
}

// 计算总体状态
const hasStaticErrors = report.staticAnalysis.summary?.errors > 0
const hasTestFailures = report.playwright.summary?.failed > 0

if (!hasStaticErrors && !hasTestFailures) {
  report.overall = { status: 'pass', message: '所有测试通过，无严重问题' }
} else if (hasTestFailures) {
  report.overall = { status: 'fail', message: '存在测试失败，需要修复' }
} else {
  report.overall = { status: 'partial', message: '静态分析发现问题，但测试通过' }
}

// 输出摘要
console.log('\n' + '='.repeat(60))
console.log('测试报告汇总')
console.log('='.repeat(60))

if (report.staticAnalysis.available) {
  console.log('\n静态分析:')
  console.log(`   错误: ${report.staticAnalysis.summary?.errors || 0}`)
  console.log(`   警告: ${report.staticAnalysis.summary?.warnings || 0}`)
  console.log(`   信息: ${report.staticAnalysis.summary?.infos || 0}`)
} else {
  console.log('\n静态分析: 报告未生成')
}

if (report.playwright.available) {
  console.log('\nE2E 测试:')
  console.log(`   通过: ${report.playwright.summary?.passed || 0}`)
  console.log(`   失败: ${report.playwright.summary?.failed || 0}`)
  console.log(`   跳过: ${report.playwright.summary?.skipped || 0}`)
  console.log(`   耗时: ${((report.playwright.summary?.duration || 0) / 1000).toFixed(1)}s`)
} else {
  console.log('\nE2E 测试: 报告未生成')
}

console.log(`\n总体状态: ${report.overall.status.toUpperCase()} - ${report.overall.message}`)
console.log('='.repeat(60))

// 保存报告
const outputPath = join(REPORTS_DIR, 'summary-report.json')
writeFileSync(outputPath, JSON.stringify(report, null, 2))
console.log(`\n汇总报告已保存到: ${outputPath}`)
