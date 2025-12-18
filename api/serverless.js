// Vercel Serverless Function 入口
const Application = require('../src/app')

let appInstance = null

module.exports = async (req, res) => {
  try {
    if (!appInstance) {
      const app = new Application()
      await app.start()
      appInstance = app.app
    }
    return appInstance(req, res)
  } catch (err) {
    console.error('Serverless error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
