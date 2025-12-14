// Codex 请求日志记录中间件 - 用于调试 Codex CLI 真实请求
const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(__dirname, '../../logs')
const LOG_FILE = path.join(LOG_DIR, 'codex-requests.log')

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function formatJson(obj) {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (err) {
    return String(obj)
  }
}

function codexRequestLoggerMiddleware(req, res, next) {
  const timestamp = new Date().toISOString()
  const separator = '='.repeat(80)

  const logEntry = [
    '',
    separator,
    `[${timestamp}] ${req.method} ${req.originalUrl}`,
    separator,
    '',
    '📋 Headers:',
    formatJson(req.headers),
    '',
    '📦 Body:',
    formatJson(req.body),
    '',
    '🔍 关键字段提取:',
    `  - User-Agent: ${req.headers['user-agent'] || 'N/A'}`,
    `  - originator: ${req.headers['originator'] || 'N/A'}`,
    `  - session_id (header): ${req.headers['session_id'] || 'N/A'}`,
    `  - session_id (body): ${req.body?.session_id || 'N/A'}`,
    `  - model: ${req.body?.model || 'N/A'}`,
    `  - instructions (前100字): ${req.body?.instructions ? `${req.body.instructions.substring(0, 100)}...` : 'N/A'}`,
    ''
  ].join('\n')

  fs.appendFileSync(LOG_FILE, `${logEntry}\n`)

  // 同时输出到控制台
  console.log(`\n🔍 [Codex Request Logger] ${req.method} ${req.originalUrl}`)
  console.log(`   User-Agent: ${req.headers['user-agent'] || 'N/A'}`)
  console.log(`   originator: ${req.headers['originator'] || 'N/A'}`)
  console.log(`   session_id (header): ${req.headers['session_id'] || 'N/A'}`)

  if (req.body?.session_id) {
    console.log(`   session_id (body): ${req.body.session_id}`)
  }

  next()
}

module.exports = codexRequestLoggerMiddleware
