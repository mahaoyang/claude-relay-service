// Vercel Serverless Function 入口
// 将所有请求代理到 Express 应用

// 捕获模块加载错误
let Application
let loadError = null

try {
  Application = require('../src/app')
} catch (err) {
  loadError = err
  console.error('FATAL: Failed to load application:', err.stack || err.message)
}

// 创建应用实例
let appInstance = null
let appPromise = null

async function getApp() {
  if (loadError) {
    throw loadError
  }

  if (appInstance) {
    return appInstance
  }

  if (!appPromise) {
    appPromise = (async () => {
      try {
        const app = new Application()
        await app.start()
        appInstance = app.app // 获取 Express 实例
        return appInstance
      } catch (err) {
        console.error('FATAL: Failed to start application:', err.stack || err.message)
        throw err
      }
    })()
  }

  return appPromise
}

// 导出 Vercel Serverless Handler
module.exports = async (req, res) => {
  try {
    const app = await getApp()
    return app(req, res)
  } catch (err) {
    console.error('Handler error:', err.stack || err.message)
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    })
  }
}
