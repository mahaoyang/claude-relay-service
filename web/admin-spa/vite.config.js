import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { LucideIconsResolver } from './src/plugins/lucide-resolver.js'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:3010'
  const httpProxy = env.VITE_HTTP_PROXY || env.HTTP_PROXY || env.http_proxy
  // 标准前后端分离：开发模式用 /，生产模式用 /admin-next/
  const basePath = mode === 'development' ? '/' : env.VITE_APP_BASE_URL || '/admin-next/'

  // 创建代理配置
  const proxyConfig = {
    target: apiTarget,
    changeOrigin: true,
    secure: false
  }

  // 如果设置了代理，动态导入并配置 agent（仅在开发模式下）
  if (httpProxy && mode === 'development') {
    console.log(`Using HTTP proxy: ${httpProxy}`)
    // Vite 的 proxy 使用 http-proxy，它支持通过环境变量自动使用代理
    // 设置环境变量让 http-proxy 使用代理
    process.env.HTTP_PROXY = httpProxy
    process.env.HTTPS_PROXY = httpProxy
  }

  console.log(
    `${mode === 'development' ? 'Starting dev server' : 'Building'} with base path: ${basePath}`
  )

  return {
    base: basePath,
    plugins: [
      vue(),
      // checker({
      //   eslint: {
      //     lintCommand: 'eslint "./src/**/*.{js,vue}" --cache=false',
      //     dev: {
      //       logLevel: ['error', 'warning']
      //     }
      //   }
      // }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia']
      }),
      Components({
        resolvers: [ElementPlusResolver(), LucideIconsResolver()]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3001,
      host: true,
      open: false, // 禁止自动打开浏览器
      proxy: {
        // 标准前后端分离：直接代理所有API路由到后端
        // 使用正则确保精确匹配，避免 /api 匹配到 /api-stats 等前端路由
        '^/admin/': proxyConfig,
        '^/api/': proxyConfig,
        '^/web/': proxyConfig,
        '^/users/': proxyConfig,
        '^/users$': proxyConfig,
        '^/apiStats': proxyConfig,
        '^/health$': proxyConfig,
        '^/metrics$': proxyConfig
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 将 vue 相关的库打包到一起
            if (id.includes('node_modules')) {
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              if (id.includes('chart.js')) {
                return 'chart'
              }
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                return 'vue-vendor'
              }
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
