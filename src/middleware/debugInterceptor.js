// HTTP 请求/响应调试拦截器
// 用于开发环境调试和分析 Claude Code 等客户端的真实请求
const fs = require('fs')
const path = require('path')
const logger = require('../utils/logger')

// 检测运行环境
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined
const LOG_DIR = isVercel ? '/tmp/crs-debug-logs' : path.join(__dirname, '../../logs/http-debug')

// Vercel 环境直接禁用文件日志
let fileLoggingEnabled = !isVercel
if (fileLoggingEnabled) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true })
    }
  } catch (error) {
    fileLoggingEnabled = false
    logger.warn('[DebugInterceptor] File logging disabled:', error.message)
  }
}

// 获取当前日期作为日志文件名
function getLogFilePath() {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return path.join(LOG_DIR, `http-debug-${date}.log`)
}

// 安全的 JSON 序列化
function safeStringify(obj, indent = 2) {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (err) {
    return String(obj)
  }
}

// 记录到文件
function writeLog(content) {
  if (!fileLoggingEnabled) {
    return
  }

  try {
    fs.appendFileSync(getLogFilePath(), `${content}\n`)
  } catch (error) {
    logger.warn('[DebugInterceptor] Failed to write log:', error.message)
  }
}

// 格式化请求日志
function formatRequestLog(req, requestId) {
  const timestamp = new Date().toISOString()
  const separator = '='.repeat(100)
  const minorSeparator = '-'.repeat(100)

  const sections = [
    '',
    separator,
    `🔵 REQUEST [${requestId}] - ${timestamp}`,
    separator,
    `${req.method} ${req.originalUrl}`,
    `IP: ${req.ip || req.connection.remoteAddress}`,
    '',
    minorSeparator,
    '📋 HEADERS:',
    minorSeparator,
    safeStringify(req.headers, 2),
    '',
    minorSeparator,
    '🔍 KEY HEADERS EXTRACTED:',
    minorSeparator,
    `User-Agent:        ${req.headers['user-agent'] || 'N/A'}`,
    `anthropic-version: ${req.headers['anthropic-version'] || 'N/A'}`,
    `anthropic-beta:    ${req.headers['anthropic-beta'] || 'N/A'}`,
    `x-api-key:         ${req.headers['x-api-key'] ? '[REDACTED]' : 'N/A'}`,
    `x-app:             ${req.headers['x-app'] || 'N/A'}`,
    `sentry-trace:      ${req.headers['sentry-trace'] || 'N/A'}`,
    `baggage:           ${req.headers.baggage || 'N/A'}`,
    `session_id:        ${req.headers['session_id'] || 'N/A'}`,
    `content-type:      ${req.headers['content-type'] || 'N/A'}`,
    `content-length:    ${req.headers['content-length'] || 'N/A'}`,
    ''
  ]

  // Body 内容
  if (req.body && Object.keys(req.body).length > 0) {
    sections.push(minorSeparator)
    sections.push('📦 REQUEST BODY:')
    sections.push(minorSeparator)
    sections.push(safeStringify(req.body, 2))
    sections.push('')

    // 提取关键字段
    if (req.body.model) {
      sections.push(minorSeparator)
      sections.push('🎯 KEY FIELDS FROM BODY:')
      sections.push(minorSeparator)
      sections.push(`model:             ${req.body.model}`)
      sections.push(`max_tokens:        ${req.body.max_tokens || 'N/A'}`)
      sections.push(`stream:            ${req.body.stream !== undefined ? req.body.stream : 'N/A'}`)
      sections.push(`session_id:        ${req.body.session_id || 'N/A'}`)
      sections.push(`user_id:           ${req.body.metadata?.user_id || 'N/A'}`)
      sections.push(
        `messages_count:    ${Array.isArray(req.body.messages) ? req.body.messages.length : 'N/A'}`
      )
      sections.push('')
    }
  }

  // Query 参数
  if (req.query && Object.keys(req.query).length > 0) {
    sections.push(minorSeparator)
    sections.push('🔗 QUERY PARAMETERS:')
    sections.push(minorSeparator)
    sections.push(safeStringify(req.query, 2))
    sections.push('')
  }

  // Sentry Trace 解析
  if (req.headers['sentry-trace']) {
    const parts = req.headers['sentry-trace'].split('-')
    sections.push(minorSeparator)
    sections.push('🔎 SENTRY TRACE PARSED:')
    sections.push(minorSeparator)
    sections.push(`trace_id:  ${parts[0] || 'N/A'}`)
    sections.push(`span_id:   ${parts[1] || 'N/A'}`)
    sections.push(`sampled:   ${parts[2] || 'N/A'}`)
    sections.push('')
  }

  return sections.join('\n')
}

// 格式化响应日志
function formatResponseLog(req, res, requestId, responseBody, duration) {
  const timestamp = new Date().toISOString()
  const separator = '='.repeat(100)
  const minorSeparator = '-'.repeat(100)

  const sections = [
    '',
    separator,
    `🟢 RESPONSE [${requestId}] - ${timestamp}`,
    separator,
    `${req.method} ${req.originalUrl}`,
    `Status: ${res.statusCode}`,
    `Duration: ${duration}ms`,
    '',
    minorSeparator,
    '📋 RESPONSE HEADERS:',
    minorSeparator,
    safeStringify(res.getHeaders(), 2),
    ''
  ]

  // 响应体（如果存在且非流式）
  if (responseBody) {
    sections.push(minorSeparator)
    sections.push('📦 RESPONSE BODY:')
    sections.push(minorSeparator)
    sections.push(typeof responseBody === 'string' ? responseBody : safeStringify(responseBody, 2))
    sections.push('')
  }

  sections.push(separator)
  sections.push('')

  return sections.join('\n')
}

// 拦截响应体
function captureResponseBody(res, callback) {
  const originalWrite = res.write
  const originalEnd = res.end
  const chunks = []

  res.write = function (chunk, ...args) {
    if (chunk) {
      chunks.push(Buffer.from(chunk))
    }
    return originalWrite.apply(res, [chunk, ...args])
  }

  res.end = function (chunk, ...args) {
    if (chunk) {
      chunks.push(Buffer.from(chunk))
    }

    const body = Buffer.concat(chunks).toString('utf8')
    callback(body)

    return originalEnd.apply(res, [chunk, ...args])
  }
}

// 主中间件
function debugInterceptor(req, res, next) {
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
  const startTime = Date.now()

  // 检查是否为 Codex/GPT 模型请求
  const isCodexRequest =
    req.body?.model &&
    (req.body.model.toLowerCase().includes('gpt') || req.body.model.toLowerCase().includes('codex'))

  // 记录请求
  const requestLog = formatRequestLog(req, requestId)
  writeLog(requestLog)

  // Codex 专用日志
  if (isCodexRequest) {
    const codexLogPath = path.join(
      LOG_DIR,
      `codex-debug-${new Date().toISOString().split('T')[0]}.log`
    )
    try {
      const codexLog = [
        '',
        '='.repeat(100),
        `✨ CODEX REQUEST [${requestId}] - ${new Date().toISOString()}`,
        '='.repeat(100),
        `Model: ${req.body.model}`,
        `URL: ${req.method} ${req.originalUrl}`,
        'Complete Request JSON:',
        safeStringify(req.body, 2),
        ''
      ].join('\n')

      fs.appendFileSync(codexLogPath, codexLog)
      logger.info(`✨ Codex request logged to ${codexLogPath}`)
    } catch (error) {
      logger.warn('[DebugInterceptor] Failed to write Codex log:', error.message)
    }
  }

  // 同时输出到控制台（简化版）
  logger.info(
    `🐛 [${requestId}] ${req.method} ${req.originalUrl} | Model: ${req.body?.model || 'N/A'} | User-Agent: ${req.headers['user-agent'] || 'N/A'}`
  )

  // 捕获响应
  captureResponseBody(res, (responseBody) => {
    const duration = Date.now() - startTime

    // 记录响应
    const responseLog = formatResponseLog(req, res, requestId, responseBody, duration)
    writeLog(responseLog)

    // Codex 响应日志
    if (isCodexRequest) {
      const codexLogPath = path.join(
        LOG_DIR,
        `codex-debug-${new Date().toISOString().split('T')[0]}.log`
      )
      try {
        const codexResponseLog = [
          '-'.repeat(100),
          `✨ CODEX RESPONSE [${requestId}] - Status: ${res.statusCode} | Duration: ${duration}ms`,
          '-'.repeat(100),
          'Complete Response JSON:',
          safeStringify(
            typeof responseBody === 'string'
              ? responseBody.startsWith('{') || responseBody.startsWith('[')
                ? JSON.parse(responseBody)
                : responseBody
              : responseBody,
            2
          ),
          ''
        ].join('\n')

        fs.appendFileSync(codexLogPath, codexResponseLog)
      } catch (error) {
        logger.warn('[DebugInterceptor] Failed to write Codex response log:', error.message)
      }
    }

    // 控制台简化输出
    logger.info(`🐛 [${requestId}] Response: ${res.statusCode} | Duration: ${duration}ms`)
  })

  next()
}

module.exports = {
  debugInterceptor
}
