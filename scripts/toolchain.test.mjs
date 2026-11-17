import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import test from 'node:test'

const require = createRequire(import.meta.url)
const pwaRequire = createRequire(require.resolve('vite-plugin-pwa'))
const builderRequire = createRequire(require.resolve('electron-builder'))
const { getManifest } = pwaRequire('workbox-build')
const { FileMatcher } = builderRequire('app-builder-lib/out/fileMatcher')

function createFixture(t) {
  const temporaryDirectory = realpathSync(tmpdir())
  const root = mkdtempSync(join(temporaryDirectory, 'plweb2-toolchain-'))
  t.after(() => {
    assert.equal(dirname(root), temporaryDirectory)
    assert.match(basename(root), /^plweb2-toolchain-/)
    rmSync(root, { recursive: true, force: true })
  })
  mkdirSync(join(root, 'assets', 'nested'), { recursive: true })
  for (const file of ['index.html', 'assets/app.js', 'assets/app.css', 'assets/nested/parser.wasm', 'assets/ignored.js', 'assets/app.js.map']) {
    writeFileSync(join(root, file), `fixture: ${file}`)
  }
  return root
}

test('Workbox precaches nested application assets and respects ignored files', async (t) => {
  const root = createFixture(t)
  // glob 11 assumes RegExp segments; minimatch 11 uses Matcher segments instead.
  // Exercise Workbox itself so an incompatible override cannot silently empty the cache.
  const { manifestEntries, warnings } = await getManifest({
    globDirectory: root,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,wasm}'],
    globIgnores: ['**/ignored.js'],
  })

  assert.deepEqual(warnings, [])
  assert.deepEqual(manifestEntries.map(({ url }) => url).sort(), [
    'assets/app.css',
    'assets/app.js',
    'assets/nested/parser.wasm',
    'index.html',
  ])
  assert(manifestEntries.every(({ revision }) => typeof revision === 'string' && revision.length > 0))
})

test('Electron packaging retains assets, traverses directories, and excludes source maps', (t) => {
  const root = createFixture(t)
  const matcher = new FileMatcher(root, join(root, 'output'), (value) => value, ['assets/**/*', '!**/*.map'])
  const filter = matcher.createFilter()
  const matches = (relative) => {
    const file = join(root, relative)
    return filter(file, statSync(file))
  }

  assert.equal(matches('assets'), true)
  assert.equal(matches('assets/nested'), true)
  assert.equal(matches('assets/app.js'), true)
  assert.equal(matches('assets/nested/parser.wasm'), true)
  assert.equal(matches('assets/app.js.map'), false)
  assert.equal(matches('index.html'), false)
})
