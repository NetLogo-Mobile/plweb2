import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

/** Provide a no-op stub for virtual:pwa-register in Electron mode. */
const pwaRegisterStubPlugin = {
  name: 'pwa-register-stub',
  resolveId(id) {
    if (id === 'virtual:pwa-register') return '\0virtual:pwa-register'
  },
  load(id) {
    if (id === '\0virtual:pwa-register') return 'export function registerSW() {}'
  }
}

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        },
        external: ['electron', '@electron-toolkit/utils']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: '.',
    define: {
      __ELECTRON__: 'true'
    },
    plugins: [vue(), pwaRegisterStubPlugin],
    resolve: {
      alias: {
        '@popup': '/src/services/popup',
        '@api': '/src/services/api',
        '@storage': '/src/services/storage',
        '@services': '/src/services',
        '@components': '/src/components',
        '@views': '/src/views',
        '@i18n': '/src/i18n'
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          manualChunks: (id) => {
            if (id.includes('highlight.js')) return 'highlightjs'
          }
        }
      }
    }
  }
})
