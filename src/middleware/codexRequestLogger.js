// Codex 请求日志记录中间件 - 用于调试 Codex CLI 真实请求
const fs = require('fs')
const path = require('path')

// 使用环境检测来决定日志目录
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined
const LOG_DIR = isVercel ? '/tmp/crs-debug-logs' : path.join(__dirname, '../../logs')
const LOG_FILE = path.join(LOG_DIR, 'codex-requests.log')

// 确保日志目录存在（使用 try-catch 处理权限问题）
let fileLoggingEnabled = true
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
} catch (error) {
  // 如果无法创建目录，禁用文件日志
  fileLoggingEnabled = false
  console.warn('[CodexRequestLogger] File logging disabled:', error.message)
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

  // 写入文件（如果启用）
  if (fileLoggingEnabled) {
    try {
      fs.appendFileSync(LOG_FILE, `${logEntry}\n`)
    } catch (error) {
      console.warn('[CodexRequestLogger] Failed to write log:', error.message)
    }
  }

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
