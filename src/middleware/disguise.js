/**
 * 请求伪装中间件
 * 将多个下游用户伪装成单一上游身份
 */

const disguiseHelper = require('../utils/disguiseHelper')
const logger = require('../utils/logger')

/**
 * 伪装中间件
 * 在请求到达转发服务前应用伪装
 */
function disguiseMiddleware(req, res, next) {
  // 如果未启用伪装，直接跳过
  if (!disguiseHelper.DISGUISE_CONFIG.enabled) {
    return next()
  }

  // 只处理有 body 和 headers 的请求
  if (!req.body || !req.headers) {
    return next()
  }

  try {
    // 保存原始数据用于日志
    const originalUserId = req.body.metadata?.user_id

    // 应用伪装
    const disguised = disguiseHelper.disguiseRequest(req.body, req.headers)

    // 更新请求
    req.body = disguised.body
    Object.assign(req.headers, disguised.headers)

    // 标记请求已伪装
    req.isDisguised = true

    const disguiseInfo = disguiseHelper.getDisguiseInfo()

    logger.info(`🎭 Request disguised`, {
      originalUserId: `${originalUserId?.substring(0, 50)}...`,
      disguisedSessionId: disguiseInfo.todaySessionId,
      disguisedClientId: `${disguiseInfo.clientId.substring(0, 16)}...`
    })
  } catch (error) {
    logger.error(`❌ Disguise middleware error: ${error.message}`, error)
    // 发生错误时不阻塞请求，继续处理
  }

  next()
}

module.exports = disguiseMiddleware
