import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/dmpi/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        methodology: resolve(__dirname, 'methodology.html'),
      },
    },
  },
})
