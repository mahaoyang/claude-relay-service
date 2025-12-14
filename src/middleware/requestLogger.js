// 请求日志记录中间件 - 用于调试 Claude CLI 真实请求
const fs = require('fs')
const path = require('path')

// 使用环境检测来决定日志目录
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined
const LOG_DIR = isVercel ? '/tmp/crs-debug-logs' : path.join(__dirname, '../../logs')
const LOG_FILE = path.join(LOG_DIR, 'claude-cli-requests.log')

// 确保日志目录存在（使用 try-catch 处理权限问题）
let fileLoggingEnabled = true
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
} catch (error) {
  // 如果无法创建目录，禁用文件日志
  fileLoggingEnabled = false
  console.warn('[RequestLogger] File logging disabled:', error.message)
}

function formatJson(obj) {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (err) {
    return String(obj)
  }
}

function requestLoggerMiddleware(req, res, next) {
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
    `  - anthropic-version: ${req.headers['anthropic-version'] || 'N/A'}`,
    `  - anthropic-beta: ${req.headers['anthropic-beta'] || 'N/A'}`,
    `  - x-app: ${req.headers['x-app'] || 'N/A'}`,
    `  - sentry-trace: ${req.headers['sentry-trace'] || 'N/A'}`,
    `  - baggage: ${req.headers.baggage || 'N/A'}`,
    `  - session_id (header): ${req.headers['session_id'] || 'N/A'}`,
    `  - session_id (body): ${req.body?.session_id || 'N/A'}`,
    `  - metadata.user_id: ${req.body?.metadata?.user_id || 'N/A'}`,
    '',
    '🔎 Sentry Trace 解析:'
  ].join('\n')

  // 解析 sentry-trace
  if (fileLoggingEnabled) {
    try {
      if (req.headers['sentry-trace']) {
        const parts = req.headers['sentry-trace'].split('-')
        const parsed = [
          `  - trace_id: ${parts[0] || 'N/A'}`,
          `  - span_id: ${parts[1] || 'N/A'}`,
          `  - sampled: ${parts[2] || 'N/A'}`,
          ''
        ].join('\n')

        fs.appendFileSync(LOG_FILE, `${logEntry}\n${parsed}`)
      } else {
        fs.appendFileSync(LOG_FILE, `${logEntry}\n  - (无 sentry-trace)\n\n`)
      }

      // 解析 user_id 中的 session
      if (req.body?.metadata?.user_id) {
        const userId = req.body.metadata.user_id
        const sessionMatch = userId.match(/session_([a-f0-9-]+)$/i)
        const sessionExtracted = sessionMatch ? sessionMatch[1] : 'N/A'

        const userIdParsed = [
          '🆔 User ID 解析:',
          `  - 完整 user_id: ${userId}`,
          `  - 提取的 session_id: ${sessionExtracted}`,
          ''
        ].join('\n')

        fs.appendFileSync(LOG_FILE, userIdParsed)
      }

      fs.appendFileSync(LOG_FILE, '\n')
    } catch (error) {
      console.warn('[RequestLogger] Failed to write log:', error.message)
    }
  }

  // 同时输出到控制台
  console.log(`\n🔍 [Request Logger] ${req.method} ${req.originalUrl}`)
  console.log(`   User-Agent: ${req.headers['user-agent'] || 'N/A'}`)
  console.log(`   anthropic-version: ${req.headers['anthropic-version'] || 'N/A'}`)
  console.log(`   anthropic-beta: ${req.headers['anthropic-beta'] || 'N/A'}`)
  console.log(`   x-app: ${req.headers['x-app'] || 'N/A'}`)
  console.log(`   sentry-trace: ${req.headers['sentry-trace'] || 'N/A'}`)

  if (req.body?.metadata?.user_id) {
    console.log(`   user_id: ${req.body.metadata.user_id}`)
  }

  next()
}

module.exports = requestLoggerMiddleware
