const winston = require('winston')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { maskToken } = require('./tokenMask')

// 确定日志目录，Vercel 等只读环境回落到 /tmp，并在不可写时仅输出控制台
const isVercel = !!process.env.VERCEL || process.env.NOW_REGION !== undefined
const fallbackLogDir = path.join(os.tmpdir(), 'crs-logs')
let logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
let fileLoggingEnabled = !isVercel // Vercel 环境直接禁用文件日志

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true, mode: 0o755 })
}

// 非 Vercel 环境才尝试创建日志目录
if (fileLoggingEnabled) {
  try {
    ensureDir(logDir)
  } catch (error) {
    try {
      logDir = fallbackLogDir
      ensureDir(logDir)
    } catch (fallbackError) {
      console.warn(
        `Token refresh file logging disabled (target: ${logDir}): ${fallbackError.message}; console only`
      )
      fileLoggingEnabled = false
    }
  }
}

const baseFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.json(),
  winston.format.printf((info) => JSON.stringify(info, null, 2))
)

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(winston.format.colorize(), winston.format.simple())
})

// 创建专用的 token 刷新日志记录器
const tokenRefreshLogger = winston.createLogger({
  level: 'info',
  format: baseFormat,
  transports: [
    // 文件传输 - 每日轮转
    fileLoggingEnabled
      ? new winston.transports.File({
          filename: path.join(logDir, 'token-refresh.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 30, // 保留30天
          tailable: true
        })
      : null,
    // 错误单独记录
    fileLoggingEnabled
      ? new winston.transports.File({
          filename: path.join(logDir, 'token-refresh-error.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 30
        })
      : null,
    // 控制台输出（生产环境也保留，以免无文件写权限时无日志）
    consoleTransport
  ].filter(Boolean),
  // 错误处理
  exitOnError: false
})

tokenRefreshLogger.info('TokenRefresh logger initialized', {
  directory: logDir,
  fileLoggingEnabled,
  isVercel
})

/**
 * 记录 token 刷新开始
 */
function logRefreshStart(accountId, accountName, platform = 'claude', reason = '') {
  tokenRefreshLogger.info({
    event: 'token_refresh_start',
    accountId,
    accountName,
    platform,
    reason,
    timestamp: new Date().toISOString()
  })
}

/**
 * 记录 token 刷新成功
 */
function logRefreshSuccess(accountId, accountName, platform = 'claude', tokenData = {}) {
  const maskedTokenData = {
    accessToken: tokenData.accessToken ? maskToken(tokenData.accessToken) : '[NOT_PROVIDED]',
    refreshToken: tokenData.refreshToken ? maskToken(tokenData.refreshToken) : '[NOT_PROVIDED]',
    expiresAt: tokenData.expiresAt || tokenData.expiry_date || '[NOT_PROVIDED]',
    scopes: tokenData.scopes || tokenData.scope || '[NOT_PROVIDED]'
  }

  tokenRefreshLogger.info({
    event: 'token_refresh_success',
    accountId,
    accountName,
    platform,
    tokenData: maskedTokenData,
    timestamp: new Date().toISOString()
  })
}

/**
 * 记录 token 刷新失败
 */
function logRefreshError(accountId, accountName, platform = 'claude', error, attemptNumber = 1) {
  const errorInfo = {
    message: error.message || error.toString(),
    code: error.code || 'UNKNOWN',
    statusCode: error.response?.status || 'N/A',
    responseData: error.response?.data || 'N/A'
  }

  tokenRefreshLogger.error({
    event: 'token_refresh_error',
    accountId,
    accountName,
    platform,
    error: errorInfo,
    attemptNumber,
    timestamp: new Date().toISOString()
  })
}

/**
 * 记录 token 刷新跳过（由于并发锁）
 */
function logRefreshSkipped(accountId, accountName, platform = 'claude', reason = 'locked') {
  tokenRefreshLogger.info({
    event: 'token_refresh_skipped',
    accountId,
    accountName,
    platform,
    reason,
    timestamp: new Date().toISOString()
  })
}

/**
 * 记录 token 使用情况
 */
function logTokenUsage(accountId, accountName, platform = 'claude', expiresAt, isExpired) {
  tokenRefreshLogger.debug({
    event: 'token_usage_check',
    accountId,
    accountName,
    platform,
    expiresAt,
    isExpired,
    remainingMinutes: expiresAt ? Math.floor((new Date(expiresAt) - Date.now()) / 60000) : 'N/A',
    timestamp: new Date().toISOString()
  })
}

/**
 * 记录批量刷新任务
 */
function logBatchRefreshStart(totalAccounts, platform = 'all') {
  tokenRefreshLogger.info({
    event: 'batch_refresh_start',
    totalAccounts,
    platform,
    timestamp: new Date().toISOString()
  })
}

/**
 * 记录批量刷新结果
 */
function logBatchRefreshComplete(results) {
  tokenRefreshLogger.info({
    event: 'batch_refresh_complete',
    results: {
      total: results.total || 0,
      success: results.success || 0,
      failed: results.failed || 0,
      skipped: results.skipped || 0
    },
    timestamp: new Date().toISOString()
  })
}

module.exports = {
  logger: tokenRefreshLogger,
  logRefreshStart,
  logRefreshSuccess,
  logRefreshError,
  logRefreshSkipped,
  logTokenUsage,
  logBatchRefreshStart,
  logBatchRefreshComplete
}
