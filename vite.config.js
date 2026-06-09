import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Vercel 部署必须使用根路径
  base: '/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    // 关闭 sourcemap 避免 Vercel CDN 的 MIME 类型问题
    sourcemap: false
  }
})
