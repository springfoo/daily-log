import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/daily-log/',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 重点：自定义 chunk 文件名，去掉默认的下划线
        chunkFileNames: (chunkInfo) => {
          // 移除开头的 _
          const name = chunkInfo.name.replace(/^_/, '')
          return `assets/${name}-[hash].js`
        },

        // 如果你想连 CSS 也一起去掉下划线（推荐）
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name?.replace(/^_/, '')
          return `assets/${name}-[hash].[ext]`
        }
      }
    }
  }
})
