// Vercel Serverless Function 入口 - 调试版本
console.log('SERVERLESS: Starting...')

let Application
let loadError = null

try {
  console.log('SERVERLESS: Loading app module...')
  Application = require('../src/app')
  console.log('SERVERLESS: App module loaded successfully')
} catch (err) {
  loadError = err
  console.error('SERVERLESS FATAL:', err.message)
  console.error('SERVERLESS STACK:', err.stack)
}

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
      console.log('SERVERLESS: Creating app instance...')
      const app = new Application()
      console.log('SERVERLESS: Starting app...')
      await app.start()
      console.log('SERVERLESS: App started successfully')
      appInstance = app.app
      return appInstance
    })()
  }

  return appPromise
}

module.exports = async (req, res) => {
  console.log('SERVERLESS: Handling request:', req.method, req.url)
  try {
    const app = await getApp()
    return app(req, res)
  } catch (err) {
    console.error('SERVERLESS ERROR:', err.message)
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    })
  }
}
