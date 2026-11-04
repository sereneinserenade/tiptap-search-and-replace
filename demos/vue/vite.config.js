import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue(), tailwindcss()],
    base: mode === 'production' ? '/tiptap-search-and-replace/' : '/',
    server: {
      port: 3000,
    }
  }
})
