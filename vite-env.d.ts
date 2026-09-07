/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMOCRACY_WALL_MODE?: 'off' | 'read-only' | 'full'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
