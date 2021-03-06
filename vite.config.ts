import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'VueGLSL',
      fileName: (format) => `vue-glsl.${format}.js`
    },

    rollupOptions: {
      external: ['vue-demi'],
    }
  },
  optimizeDeps: {
    exclude: ['vue-demi']
  },
})
