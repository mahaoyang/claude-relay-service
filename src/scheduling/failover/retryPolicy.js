/**
 * 重试策略配置
 *
 * 定义哪些错误可以重试，以及重试的行为
 */

// 可重试的错误类型
const RETRYABLE_ERRORS = {
  // HTTP 状态码
  429: { retryable: true, reason: 'rate_limit' },
  529: { retryable: true, reason: 'overload' },
  500: { retryable: true, reason: 'server_error' },
  502: { retryable: true, reason: 'bad_gateway' },
  503: { retryable: true, reason: 'service_unavailable' },
  504: { retryable: true, reason: 'gateway_timeout' },

  // 不可重试
  400: { retryable: false, reason: 'bad_request' },
  401: { retryable: false, reason: 'unauthorized' },
  403: { retryable: false, reason: 'forbidden' },
  404: { retryable: false, reason: 'not_found' }
}

// 可重试的错误代码
const RETRYABLE_ERROR_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ENOTFOUND',
  'ENETUNREACH',
  'EAI_AGAIN',
  'CONSOLE_ACCOUNT_CONCURRENCY_FULL'
])

// 不可重试的错误代码
const NON_RETRYABLE_ERROR_CODES = new Set([
  'CLAUDE_DEDICATED_RATE_LIMITED', // 专属账户限流，无法切换
  'ERR_INVALID_ARG_TYPE',
  'ERR_ASSERTION'
])

/**
 * 判断错误是否可重试
 * @param {Error|Object} error - 错误对象
 * @param {number} [statusCode] - HTTP状态码
 * @returns {{retryable: boolean, reason: string}}
 */
function isRetryable(error, statusCode = null) {
  // 检查错误代码
  const errorCode = error?.code || error?.errorCode

  if (errorCode) {
    if (NON_RETRYABLE_ERROR_CODES.has(errorCode)) {
      return { retryable: false, reason: errorCode }
    }
    if (RETRYABLE_ERROR_CODES.has(errorCode)) {
      return { retryable: true, reason: errorCode }
    }
  }

  // 检查状态码
  const code = statusCode || error?.statusCode || error?.status
  if (code && RETRYABLE_ERRORS[code]) {
    return RETRYABLE_ERRORS[code]
  }

  // 检查错误消息中的关键词
  const message = error?.message || ''
  if (message.includes('timeout') || message.includes('TIMEOUT')) {
    return { retryable: true, reason: 'timeout' }
  }
  if (message.includes('socket hang up') || message.includes('ECONNRESET')) {
    return { retryable: true, reason: 'connection_reset' }
  }

  // 默认不重试
  return { retryable: false, reason: 'unknown' }
}

/**
 * 获取默认配置
 */
function getDefaultConfig() {
  return {
    maxRetries: parseInt(process.env.FAILOVER_MAX_RETRIES) || 2,
    enabled: process.env.FAILOVER_ENABLED === 'true'
  }
}

module.exports = {
  isRetryable,
  getDefaultConfig,
  RETRYABLE_ERRORS,
  RETRYABLE_ERROR_CODES,
  NON_RETRYABLE_ERROR_CODES
}
