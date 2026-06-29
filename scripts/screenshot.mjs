#!/usr/bin/env node

import path from 'path'
import fs from 'fs/promises'
import { createReadStream, createWriteStream, existsSync } from 'fs'
import http from 'http'
import { chromium } from 'playwright'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { ZipArchive } from 'archiver'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT, 'dist')
const DISCUSSIONS_DIR = '/tmp/pl-discussions/discussions'
const OUTPUT_DIR = path.join(ROOT, 'snapshot_output')
const IMG_DIR = path.join(OUTPUT_DIR, 'img')
const PORT = 8765
const CONCURRENCY = 8
const BASE_URL = `http://localhost:${PORT}`

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function buildApp() {
  console.log('[BUILD] Building Vue app...')
  const start = Date.now()
  execSync('npx vite build', { cwd: ROOT, stdio: 'pipe' })
  console.log(`[BUILD] Build complete in ${((Date.now() - start) / 1000).toFixed(1)}s`)
}

async function readAllJsonFiles() {
  const files = (await fs.readdir(DISCUSSIONS_DIR))
    .filter(f => f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${DISCUSSIONS_DIR}`)
  }

  console.log(`[DATA] Found ${files.length} JSON files`)

  // Read all file contents in parallel batches
  const batchSize = 500
  const allData = []
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)
    const contents = await Promise.all(
      batch.map(async (f) => {
        const content = await fs.readFile(path.join(DISCUSSIONS_DIR, f), 'utf-8')
        return { filename: f, data: JSON.parse(content) }
      })
    )
    allData.push(...contents)
    if ((i + batchSize) % 2000 === 0 || i + batchSize >= files.length) {
      console.log(`[DATA] Loaded ${Math.min(i + batchSize, files.length)}/${files.length} files`)
    }
  }

  return allData
}

function extractTimestamp(filename) {
  const match = filename.match(/data_(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})/)
  if (match) {
    return `${match[1]} ${match[2]}:${match[3]}:${match[4]}`
  }
  return filename
}

function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
  }

  const server = http.createServer((req, res) => {
    let urlPath = req.url

    // Normalize path to serve from dist/
    if (urlPath.startsWith('/plweb2')) {
      urlPath = urlPath.slice('/plweb2'.length) || '/'
    }

    // SPA fallback: serve index.html for all non-file routes
    if (urlPath === '/' || !path.extname(urlPath)) {
      urlPath = '/index.html'
    }

    const filePath = path.join(DIST_DIR, urlPath)

    if (!existsSync(filePath)) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    res.writeHead(200, { 'Content-Type': contentType })
    createReadStream(filePath).pipe(res)
  })

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[SERVER] Serving ${DIST_DIR} at http://localhost:${PORT}`)
      resolve(server)
    })
  })
}

async function processFiles(entries) {
  console.log(`[PROCESS] Starting screenshot pipeline with concurrency=${CONCURRENCY}`)
  const total = entries.length
  const results = []
  let completed = 0
  let errors = 0

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  // Create a pool of workers (each worker is a browser page)
  async function createWorker(startIdx) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    // Intercept API calls using a single handler with URL checking
    let currentFileIdx = startIdx

    const emptyLibraryData = {
      Status: 200,
      Message: '',
      Data: {
        $type: 'Quantum.Models.Contents.Library, Quantum Models',
        ID: '',
        Identifier: 'Discussions',
        Subject: '黑洞 - 物理实验室分享区',
        Language: 'Chinese',
        IsNavigation: true,
        IsDevelopment: false,
        Blocks: [],
      },
      Token: '',
      AuthCode: '',
    }

    await page.route('**/physics-api-cn.turtlesim.com/**', async (route) => {
      const url = route.request().url()
      if (url.includes('Contents/GetLibrary')) {
        // Return snapshot data for GetLibrary requests
        if (currentFileIdx < total) {
          const entry = entries[currentFileIdx]
          // Handle files with 403 / null Data by returning empty library
          if (entry.data.Status !== 200 || !entry.data.Data) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(emptyLibraryData),
            })
            return
          }
          const responseData = {
            ...entry.data,
            Status: 200,
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responseData),
          })
          return
        }
      }
      // Return empty 200 for other API calls
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 200,
          Message: '',
          Data: null,
          Token: '',
          AuthCode: '',
        }),
      })
    })

    return { page, context, setIndex: (i) => { currentFileIdx = i } }
  }

  // Launch workers
  const workers = []
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(await createWorker(i))
  }

  // Process files round-robin
  const processPromises = []
  for (let i = 0; i < CONCURRENCY; i++) {
    processPromises.push(processBatch(i))
  }

  async function processBatch(workerIdx) {
    const worker = workers[workerIdx]

    for (let i = workerIdx; i < total; i += CONCURRENCY) {
      const entry = entries[i]
      const timestamp = extractTimestamp(entry.filename)
      const seqNum = String(i + 1).padStart(6, '0')
      const imgName = `screenshot_${seqNum}.png`

      worker.setIndex(i)

      try {
        // Navigate to BlackHole page with a cache-busting timestamp
        await worker.page.goto(`${BASE_URL}/plweb2/#/b?t=${Date.now()}`, {
          waitUntil: 'load',
          timeout: 30000,
        })

        // Wait for the block container to appear (data loaded)
        await worker.page.waitForSelector('.block-container', {
          timeout: 20000,
        })

        // Wait for rich text rendering (WASM, KaTeX, Mermaid, etc.)
        await worker.page.waitForTimeout(2000)

        // Take full-page screenshot
        const imgPath = path.join(IMG_DIR, imgName)
        await worker.page.screenshot({
          path: imgPath,
          fullPage: true,
        })

        // Add watermark with timestamp
        await addWatermark(imgPath, timestamp)

        results.push({
          image: imgName,
          capture_time: timestamp,
          seq: i,
        })

        completed++
        if (completed % 50 === 0 || completed === total) {
          console.log(`[PROGRESS] ${completed}/${total} screenshots taken (${errors} errors)`)
        }
      } catch (err) {
        errors++
        console.error(`[ERROR] File ${entry.filename}: ${err.message}`)
        // Continue with next file
      }
    }

    await worker.context.close()
  }

  await Promise.all(processPromises)
  await browser.close()

  console.log(`[DONE] Processed ${completed}/${total} files with ${errors} errors`)
  return results.sort((a, b) => a.seq - b.seq)
}

async function addWatermark(imagePath, timestamp) {
  const font = 'sans-serif'
  const watermarkText = `Captured: ${timestamp}`

  try {
    const image = sharp(imagePath)
    const metadata = await image.metadata()
    const width = metadata.width || 1440

    // Create a semi-transparent watermark overlay
    const fontSize = Math.max(14, Math.floor(width / 96))
    const padding = 10
    const textHeight = fontSize + padding * 2
    const textWidth = watermarkText.length * fontSize * 0.6 + padding * 2

    // Create SVG watermark
    const svgText = `
      <svg width="${width}" height="${textHeight}">
        <rect x="${width - textWidth - 10}" y="0" width="${textWidth}" height="${textHeight}"
              fill="rgba(0,0,0,0.5)" rx="4" />
        <text x="${width - 10 - padding}" y="${fontSize + padding}"
              font-family="${font}" font-size="${fontSize}" fill="white"
              text-anchor="end">
          ${watermarkText}
        </text>
      </svg>
    `

    // Composite the watermark onto the image
    await image
      .composite([
        {
          input: Buffer.from(svgText),
          top: 10,
          left: 0,
        },
      ])
      .toFile(imagePath + '.tmp')
      .then(() => {
        // Replace original with watermarked
        return fs.rename(imagePath + '.tmp', imagePath)
      })
  } catch (err) {
    console.error(`[WATERMARK] Failed to add watermark to ${imagePath}: ${err.message}`)
  }
}

async function generateZip(results) {
  console.log('[ZIP] Creating img.zip...')
  const zipPath = path.join(OUTPUT_DIR, 'img.zip')
  const output = createWriteStream(zipPath)
  const archive = new ZipArchive({ zlib: { level: 6 } })

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
      console.log(`[ZIP] Created img.zip (${sizeMB} MB)`)
      resolve()
    })
    archive.on('error', reject)
    archive.pipe(output)

    for (const result of results) {
      const imgPath = path.join(IMG_DIR, result.image)
      if (existsSync(imgPath)) {
        archive.file(imgPath, { name: result.image })
      }
    }

    archive.finalize()
  })
}

async function generateContentsJson(results) {
  console.log('[CONTENTS] Creating contents.json...')
  const contents = results.map((r) => ({
    image: r.image,
    capture_time: r.capture_time,
  }))
  const contentsPath = path.join(OUTPUT_DIR, 'contents.json')
  await fs.writeFile(contentsPath, JSON.stringify(contents, null, 2))
  console.log(`[CONTENTS] contents.json created with ${contents.length} entries`)
}

async function generateMp4(results) {
  console.log('[MP4] Generating output.mp4...')
  const mp4Path = path.join(OUTPUT_DIR, 'output.mp4')

  // Create a temporary directory for sequentially-numbered copies
  // (ffmpeg needs files named sequentially)
  const tmpDir = path.join(OUTPUT_DIR, '.tmp_frames')
  await ensureDir(tmpDir)

  for (let i = 0; i < results.length; i++) {
    const src = path.join(IMG_DIR, results[i].image)
    const dest = path.join(tmpDir, `frame_${String(i).padStart(8, '0')}.png`)
    if (existsSync(src)) {
      await fs.symlink(src, dest)
    }
  }

  try {
    execSync(
      `ffmpeg -y -framerate 60 -pattern_type glob -i '${tmpDir}/frame_*.png' ` +
      `-c:v libx264 -pix_fmt yuv420p -preset medium -crf 23 "${mp4Path}"`,
      { stdio: 'pipe', timeout: 300000 }
    )
    console.log('[MP4] output.mp4 created successfully')
  } catch (err) {
    console.error('[MP4] Failed to create video:', err.message)
    // Try alternative approach without glob
    try {
      execSync(
        `ffmpeg -y -framerate 60 -i '${tmpDir}/frame_%08d.png' ` +
        `-c:v libx264 -pix_fmt yuv420p -preset medium -crf 23 "${mp4Path}"`,
        { stdio: 'pipe', timeout: 300000 }
      )
      console.log('[MP4] output.mp4 created successfully (alt method)')
    } catch (err2) {
      console.error('[MP4] Failed with alt method:', err2.message)
    }
  }

  // Cleanup temp frames
  await fs.rm(tmpDir, { recursive: true, force: true })
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0
  const skipScreenshots = args.includes('--skip-screenshots')

  console.log('=== PLWeb2 Snapshot Screenshot Pipeline ===')
  console.log(`Node version: ${process.version}`)
  console.log(`Working directory: ${ROOT}`)
  console.log(`Output directory: ${OUTPUT_DIR}`)
  if (limit > 0) console.log(`LIMIT: processing first ${limit} files only (test mode)`)

  // Step 1: Ensure output directories
  await ensureDir(IMG_DIR)
  await ensureDir(OUTPUT_DIR)

  // Step 2: Build the app
  await buildApp()

  // Step 3: Start the server
  const server = await startServer()

  // Step 4: Read all JSON files
  const allEntries = await readAllJsonFiles()
  const entries = limit > 0 ? allEntries.slice(0, limit) : allEntries
  if (limit > 0) {
    console.log(`[DATA] Limited to ${entries.length} files for testing`)
  }

  try {
    let results = []

    if (skipScreenshots) {
      // Rebuild results from existing images
      console.log('[SKIP] Skipping screenshots, scanning existing images...')
      const files = (await fs.readdir(IMG_DIR))
        .filter(f => f.startsWith('screenshot_') && f.endsWith('.png'))
        .sort()
      results = files.map((f, i) => {
        const match = f.match(/screenshot_(\d+)\.png/)
        const seq = match ? parseInt(match[1]) - 1 : i
        return { image: f, capture_time: 'unknown', seq }
      })
      console.log(`[SKIP] Found ${results.length} existing images`)
    } else {
      // Step 5: Process files and take screenshots
      results = await processFiles(entries)
    }

    if (results.length === 0) {
      console.error('[FATAL] No screenshots available')
      server.close()
      process.exit(1)
    }

    // Step 6: Generate outputs
    await generateZip(results)
    await generateContentsJson(results)
    await generateMp4(results)

    const outputSize = await getDirSize(OUTPUT_DIR)
    console.log(`\n=== SUMMARY ===`)
    console.log(`Total screenshots: ${results.length}`)
    console.log(`Output directory: ${OUTPUT_DIR}`)
    console.log(`Total output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  - img/         : ${results.length} watermarked images`)
    console.log(`  - img.zip      : ZIP archive of all images`)
    console.log(`  - contents.json: Capture manifest`)
    console.log(`  - output.mp4   : Video at 60fps`)
  } finally {
    server.close()
  }
}

async function getDirSize(dir) {
  let total = 0
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isFile()) {
      total += (await fs.stat(fullPath)).size
    } else if (entry.isDirectory() && entry.name !== '.tmp_frames') {
      total += await getDirSize(fullPath)
    }
  }
  return total
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
