import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  base: isProduction ? 'https://micro-sub-vue.vercel.app/' : '/',
  plugins: [
    vue(),
    qiankun('sub-vue', { useDevMode: true }),
  ],
  server: {
    port: 8082,
    cors: true,
    origin: 'http://localhost:8082',
  },
  build: {
    rollupOptions: {
      external: ['lodash'],
    },
  },
})
