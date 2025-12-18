// Vercel Serverless Function 入口
// 将所有请求代理到 Express 应用

const Application = require('../src/app')

// 创建应用实例
let appInstance = null
let appPromise = null

async function getApp() {
  if (appInstance) {
    return appInstance
  }

  if (!appPromise) {
    appPromise = (async () => {
      const app = new Application()
      await app.start()
      appInstance = app.app // 获取 Express 实例
      return appInstance
    })()
  }

  return appPromise
}

// 导出 Vercel Serverless Handler
module.exports = async (req, res) => {
  const app = await getApp()
  return app(req, res)
}
