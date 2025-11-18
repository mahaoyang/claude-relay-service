/**
 * Codex Request Logger Middleware
 * 用于捕获和记录 Codex 请求的中间件
 */

const codexRequestLoggerService = require('../services/codexRequestLoggerService')
const logger = require('../utils/logger')

/**
 * 记录 Codex 请求的中间件
 * @param {object} options - 配置选项
 * @param {boolean} options.enabled - 是否启用日志记录（默认从环境变量读取）
 * @param {boolean} options.logResponseHeaders - 是否记录响应头（默认 true）
 */
function codexRequestLogger(options = {}) {
  const {
    enabled = process.env.CODEX_REQUEST_LOGGING === 'true' ||
      process.env.DEBUG_HTTP_TRAFFIC === 'true',
    logResponseHeaders = true
  } = options

  return async (req, res, next) => {
    // 如果未启用日志记录，直接跳过
    if (!enabled) {
      return next()
    }

    try {
      // 只记录 OpenAI/Codex 相关的路由
      const isOpenAIRoute =
        req.originalUrl.includes('/openai/') ||
        req.originalUrl.includes('/responses') ||
        req.originalUrl.includes('/codex/')

      if (!isOpenAIRoute) {
        return next()
      }

      // 记录请求信息（不含响应头）
      await codexRequestLoggerService.logRequest(req, null, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      })

      // 如果需要记录响应头，拦截响应
      if (logResponseHeaders) {
        // 保存原始的 res.setHeader 和 res.writeHead 方法
        const originalSetHeader = res.setHeader.bind(res)
        const originalWriteHead = res.writeHead.bind(res)
        const responseHeaders = {}

        // 拦截 setHeader
        res.setHeader = function (name, value) {
          responseHeaders[name.toLowerCase()] = value
          return originalSetHeader(name, value)
        }

        // 拦截 writeHead
        res.writeHead = function (statusCode, statusMessage, headers) {
          if (headers) {
            Object.keys(headers).forEach((name) => {
              responseHeaders[name.toLowerCase()] = headers[name]
            })
          }
          return originalWriteHead(statusCode, statusMessage, headers)
        }

        // 拦截响应结束，记录完整的请求/响应信息
        const originalEnd = res.end.bind(res)
        res.end = async function (...args) {
          try {
            // 记录包含响应头的完整日志
            await codexRequestLoggerService.logRequest(req, responseHeaders, {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
              statusCode: res.statusCode
            })
          } catch (error) {
            logger.error('❌ Failed to log Codex response headers:', error)
          }
          return originalEnd(...args)
        }
      }

      next()
    } catch (error) {
      logger.error('❌ Codex request logger middleware error:', error)
      next()
    }
  }
}

module.exports = codexRequestLogger
