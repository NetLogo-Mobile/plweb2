import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

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
    plugins: [vue()],
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
        external: ['virtual:pwa-register'],
        output: {
          manualChunks: (id) => {
            if (id.includes('highlight.js')) return 'highlightjs'
          }
        }
      }
    }
  }
})
