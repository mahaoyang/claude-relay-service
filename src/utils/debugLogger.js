const fs = require('fs')
const path = require('path')

/**
 * 创建环境自适应的调试日志函数
 * @param {string} prefix - 日志前缀，如 'DISGUISE', 'AUTH', 'POOL'
 * @param {string} logFileName - 日志文件名，如 'disguise-debug.log'
 * @returns {Function} 调试日志函数
 */
function createDebugLogger(prefix, logFileName) {
  const logPath = path.join(__dirname, '../../logs', logFileName)

  return function debugLog(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`

    // 线上环境（Vercel等只读文件系统）使用 console.log
    const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined
    if (process.env.NODE_ENV === 'production' || isVercel) {
      console.log(`[${prefix}]`, logMessage)
    } else {
      // 本地开发环境写文件
      try {
        fs.appendFileSync(logPath, `${logMessage}\n`)
      } catch (err) {
        console.log(`[${prefix}]`, logMessage)
      }
    }
  }
}

module.exports = { createDebugLogger }
