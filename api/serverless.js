// Vercel Serverless Function 入口 - 极简调试版本
console.log('STEP1')

try {
  console.log('STEP2')
  const Application = require('../src/app')
  console.log('STEP3')

  let appInstance = null

  module.exports = async (req, res) => {
    console.log('STEP4')
    try {
      if (!appInstance) {
        console.log('STEP5')
        const app = new Application()
        await app.start()
        appInstance = app.app
        console.log('STEP6')
      }
      return appInstance(req, res)
    } catch (err) {
      console.error('ERROR:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
} catch (err) {
  console.error('LOAD_ERROR:', err.message)
  console.error('STACK:', err.stack)
  module.exports = (req, res) => {
    res.status(500).json({ error: 'Failed to load: ' + err.message })
  }
}
