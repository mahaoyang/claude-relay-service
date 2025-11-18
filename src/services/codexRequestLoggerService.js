/**
 * Codex Request Logger Service
 * 用于捕获和记录 Codex (OpenAI Responses) 的请求格式
 * 只保存到 Redis，2 小时自动过期
 */

const redis = require('../models/redis')
const logger = require('../utils/logger')

class CodexRequestLoggerService {
  constructor() {
    // Redis 过期时间：2 小时 = 7200 秒
    this.REDIS_TTL = 7200

    // 需要捕获的请求头
    this.requestHeaderKeys = [
      'version',
      'openai-beta',
      'session_id',
      'x-session-id',
      'user-agent',
      'content-type',
      'accept',
      'accept-language',
      'accept-encoding',
      'authorization',
      'chatgpt-account-id'
    ]

    // 需要捕获的响应头（Codex 限流信息）
    this.responseHeaderKeys = [
      'x-codex-primary-used-percent',
      'x-codex-primary-reset-after-seconds',
      'x-codex-primary-window-minutes',
      'x-codex-secondary-used-percent',
      'x-codex-secondary-reset-after-seconds',
      'x-codex-secondary-window-minutes',
      'x-codex-primary-over-secondary-limit-percent',
      'openai-version',
      'x-request-id',
      'openai-processing-ms'
    ]

    // 需要捕获的请求体字段
    this.requestBodyKeys = [
      'model',
      'stream',
      'instructions',
      'session_id',
      'conversation_id',
      'temperature',
      'top_p',
      'max_output_tokens',
      'user',
      'text_formatting',
      'truncation',
      'service_tier',
      'messages',
      'tools'
    ]
  }

  /**
   * 从请求头中提取需要的字段（忽略大小写）
   */
  extractRequestHeaders(clientHeaders) {
    const headers = {}

    // 转换所有 header keys 为小写进行比较
    const lowerCaseHeaders = {}
    Object.keys(clientHeaders || {}).forEach((key) => {
      lowerCaseHeaders[key.toLowerCase()] = clientHeaders[key]
    })

    // 提取需要的 headers
    this.requestHeaderKeys.forEach((key) => {
      const lowerKey = key.toLowerCase()
      if (lowerCaseHeaders[lowerKey]) {
        // 对敏感信息进行脱敏处理
        if (key === 'authorization' && lowerCaseHeaders[lowerKey]) {
          const authValue = lowerCaseHeaders[lowerKey]
          if (authValue.startsWith('Bearer ')) {
            const token = authValue.substring(7)
            headers[key] = `Bearer ${token.substring(0, 8)}...${token.substring(token.length - 8)}`
          } else {
            headers[key] = '[REDACTED]'
          }
        } else {
          headers[key] = lowerCaseHeaders[lowerKey]
        }
      }
    })

    return headers
  }

  /**
   * 从响应头中提取 Codex 限流信息
   */
  extractResponseHeaders(responseHeaders) {
    const headers = {}

    // 转换所有 header keys 为小写进行比较
    const lowerCaseHeaders = {}
    Object.keys(responseHeaders || {}).forEach((key) => {
      lowerCaseHeaders[key.toLowerCase()] = responseHeaders[key]
    })

    // 提取需要的 headers
    this.responseHeaderKeys.forEach((key) => {
      const lowerKey = key.toLowerCase()
      if (lowerCaseHeaders[lowerKey]) {
        headers[key] = lowerCaseHeaders[lowerKey]
      }
    })

    return headers
  }

  /**
   * 从请求体中提取需要的字段
   */
  extractRequestBody(body) {
    if (!body || typeof body !== 'object') {
      return {}
    }

    const extracted = {}

    this.requestBodyKeys.forEach((key) => {
      if (body[key] !== undefined) {
        // 对于 messages 和 tools 等大字段，只记录结构而非完整内容
        if (key === 'messages' && Array.isArray(body[key])) {
          extracted[key] = {
            count: body[key].length,
            sample: body[key].length > 0 ? this.sanitizeMessage(body[key][0]) : null
          }
        } else if (key === 'tools' && Array.isArray(body[key])) {
          extracted[key] = {
            count: body[key].length,
            names: body[key].map((t) => t.name || t.type).filter(Boolean)
          }
        } else if (key === 'instructions' && typeof body[key] === 'string') {
          // 对于 instructions，只记录前200字符
          extracted[key] = body[key].substring(0, 200) + (body[key].length > 200 ? '...' : '')
        } else {
          extracted[key] = body[key]
        }
      }
    })

    return extracted
  }

  /**
   * 脱敏 message 对象
   */
  sanitizeMessage(message) {
    if (!message) {
      return null
    }

    const sanitized = {
      role: message.role
    }

    if (typeof message.content === 'string') {
      sanitized.content =
        message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
    } else if (Array.isArray(message.content)) {
      sanitized.content = {
        type: 'array',
        length: message.content.length,
        types: message.content.map((c) => c.type).filter(Boolean)
      }
    }

    return sanitized
  }

  /**
   * 检测是否为 Codex CLI 请求
   */
  isCodexCLIRequest(body) {
    if (!body || !body.instructions) {
      return false
    }

    const { instructions } = body
    return (
      instructions.startsWith('You are a coding agent running in the Codex CLI') ||
      instructions.startsWith('You are Codex') ||
      instructions.startsWith('You are GPT-5.1 running in the Codex CLI')
    )
  }

  /**
   * 记录完整的请求/响应信息到 Redis
   */
  async logRequest(req, responseHeaders = null, metadata = {}) {
    try {
      const requestHeaders = this.extractRequestHeaders(req.headers)
      const requestBody = this.extractRequestBody(req.body)
      const isCodexCLI = this.isCodexCLIRequest(req.body)

      const logData = {
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method,
        isCodexCLI,
        requestHeaders,
        requestBody,
        metadata: {
          apiKeyId: req.apiKey?.id,
          apiKeyName: req.apiKey?.name,
          ...metadata
        }
      }

      // 如果有响应头，添加响应信息
      if (responseHeaders) {
        logData.responseHeaders = this.extractResponseHeaders(responseHeaders)
      }

      // 存储到 Redis
      const redisClient = redis.getClient()

      // 所有请求日志（保留最近50条）
      const allLogsKey = 'codex_request_logs'
      await redisClient.lpush(allLogsKey, JSON.stringify(logData))
      await redisClient.ltrim(allLogsKey, 0, 49) // 只保留最近50条
      await redisClient.expire(allLogsKey, this.REDIS_TTL) // 2小时过期

      // 如果是 Codex CLI 请求，单独记录
      if (isCodexCLI) {
        const codexKey = 'codex_cli_request_logs'
        await redisClient.lpush(codexKey, JSON.stringify(logData))
        await redisClient.ltrim(codexKey, 0, 19) // 只保留最近20条
        await redisClient.expire(codexKey, this.REDIS_TTL) // 2小时过期

        logger.info(`✅ Logged Codex CLI request to Redis (TTL: 2h)`)
      } else {
        logger.info(`📝 Logged non-Codex CLI request to Redis (TTL: 2h)`)
      }

      // 打印到控制台（简化版）
      this.printRequestSummary(logData)

      return true
    } catch (error) {
      logger.error('❌ Failed to log Codex request:', error)
      return false
    }
  }

  /**
   * 打印请求摘要到控制台
   */
  printRequestSummary(logData) {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info(`📋 Codex Request Summary [${logData.timestamp}]`)
    logger.info(`   Type: ${logData.isCodexCLI ? 'Codex CLI ✅' : 'Other'}`)
    logger.info(`   URL: ${logData.url}`)

    if (logData.requestBody.model) {
      logger.info(`   Model: ${logData.requestBody.model}`)
    }
    if (logData.requestBody.stream !== undefined) {
      logger.info(`   Stream: ${logData.requestBody.stream}`)
    }
    if (logData.requestBody.session_id) {
      logger.info(`   Session ID: ${logData.requestBody.session_id}`)
    }

    // 打印请求头（关键信息）
    logger.info('   Request Headers:')
    const keyHeaders = ['user-agent', 'version', 'openai-beta', 'content-type']
    keyHeaders.forEach((key) => {
      if (logData.requestHeaders[key]) {
        logger.info(`     ${key}: ${logData.requestHeaders[key]}`)
      }
    })

    // 打印请求体（关键信息）
    if (logData.requestBody.instructions) {
      const preview = logData.requestBody.instructions.substring(0, 80)
      logger.info(
        `   Instructions: ${preview}${logData.requestBody.instructions.length > 80 ? '...' : ''}`
      )
    }

    if (logData.requestBody.messages) {
      logger.info(`   Messages: ${logData.requestBody.messages.count} messages`)
    }

    // 打印响应头（Codex 限流信息）
    if (logData.responseHeaders) {
      logger.info('   Response Headers (Codex Usage):')
      const usageHeaders = [
        'x-codex-primary-used-percent',
        'x-codex-secondary-used-percent',
        'x-codex-primary-reset-after-seconds'
      ]
      usageHeaders.forEach((key) => {
        if (logData.responseHeaders[key]) {
          logger.info(`     ${key}: ${logData.responseHeaders[key]}`)
        }
      })
    }

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }

  /**
   * 获取最近的请求日志
   */
  async getRecentLogs(limit = 10, codexCliOnly = false) {
    try {
      const redisClient = redis.getClient()
      const redisKey = codexCliOnly ? 'codex_cli_request_logs' : 'codex_request_logs'

      const logs = await redisClient.lrange(redisKey, 0, limit - 1)
      return logs.map((log) => JSON.parse(log))
    } catch (error) {
      logger.error('❌ Failed to get recent Codex logs:', error)
      return []
    }
  }

  /**
   * 清除所有日志
   */
  async clearLogs() {
    try {
      const redisClient = redis.getClient()
      await redisClient.del('codex_request_logs')
      await redisClient.del('codex_cli_request_logs')

      logger.info('🗑️ Cleared all Codex request logs from Redis')
    } catch (error) {
      logger.error('❌ Failed to clear Codex logs:', error)
    }
  }
}

module.exports = new CodexRequestLoggerService()
