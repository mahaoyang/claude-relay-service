/**
 * Claude CLI 请求伪装中间件（增强版）
 * 将多个下游用户伪装成单一上游身份
 *
 * 功能：
 * - 修改 metadata.user_id 中的 sessionId
 * - 白名单控制 sessionId 收集
 * - 优先级队列 + 双层概率轮换
 * - 自动学习和使用最新 user-agent 版本
 */

const disguiseHelper = require('../utils/disguiseHelper')
const apiKeyService = require('../services/apiKeyService')
const logger = require('../utils/logger')

/**
 * 判断是否应该收集该请求的 sessionId
 * @param {Object} apiKey - API Key 对象
 * @param {string} sessionId - 会话ID
 * @returns {Promise<boolean>}
 */
async function shouldCollectSessionId(apiKey, sessionId) {
  if (!apiKey || !sessionId) {
    return false
  }

  const config = apiKey.sessionCollection || {}

  // 1. 检查是否启用收集
  if (!config.enabled) {
    return false
  }

  // 2. 检查配额
  if (config.quota !== -1 && (config.collectedCount || 0) >= config.quota) {
    logger.debug(`SessionId collection quota exceeded for API Key: ${apiKey.name}`)
    return false
  }

  // 3. 检查频率限制（最小收集间隔）
  const minInterval = disguiseHelper.DISGUISE_CONFIG.collectionMinInterval || 60
  if (config.lastCollectedAt) {
    const elapsed = Date.now() - config.lastCollectedAt
    if (elapsed < minInterval * 1000) {
      return false
    }
  }

  // 4. 验证 sessionId 格式（UUID v4）
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
  if (!uuidRegex.test(sessionId)) {
    logger.warn(`⚠️  Invalid Claude sessionId format from API Key ${apiKey.name}: ${sessionId}`)
    return false
  }

  return true
}

/**
 * Claude CLI 伪装中间件
 * 在请求到达转发服务前应用伪装
 *
 * 流程：
 * 1. 从 metadata.user_id 提取真实 sessionId
 * 2. 检查白名单，决定是否收集
 * 3. 池未满时添加到优先级队列
 * 4. 从在线集合中选择 sessionId
 * 5. 应用伪装（更新 metadata.user_id、user-agent、sentry-trace 等）
 * 6. 异步触发双层概率轮换
 */
async function disguiseMiddleware(req, res, next) {
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

    // ====== 步骤 1: 提取并检查白名单，收集 sessionId ======
    if (req.apiKey && originalUserId) {
      const realSessionId = disguiseHelper.extractSessionIdFromUserId(originalUserId)

      if (realSessionId) {
        const shouldCollect = await shouldCollectSessionId(req.apiKey, realSessionId)

        if (shouldCollect) {
          const priority = req.apiKey.sessionCollection?.priority || 1
          const metadata = {
            apiKeyId: req.apiKey.id,
            apiKeyName: req.apiKey.name,
            priority,
            timestamp: Date.now()
          }

          const collected = await disguiseHelper.addSessionIdToQueue(realSessionId, metadata)

          if (collected) {
            // 更新 API Key 的收集统计（异步，不阻塞请求）
            setImmediate(() => {
              apiKeyService.updateSessionCollectionStats(req.apiKey.id).catch((err) => {
                logger.error('Failed to update collection stats:', err)
              })
            })
          }
        }
      }
    }

    // ====== 步骤 2: 应用伪装（包含轮换逻辑）======
    const disguised = await disguiseHelper.disguiseRequest(req.body, req.headers)

    // 更新请求
    req.body = disguised.body
    Object.assign(req.headers, disguised.headers)

    // 标记请求已伪装
    req.isDisguised = true

    // 日志记录（仅在 debug 模式下记录详细信息）
    if (process.env.DEBUG_DISGUISE === 'true') {
      const disguiseInfo = await disguiseHelper.getDisguiseInfo()
      logger.debug('🎭 Claude request disguised', {
        originalUserId: originalUserId ? `${originalUserId.substring(0, 50)}...` : 'N/A',
        disguisedUserId: disguised.body.metadata?.user_id
          ? `${disguised.body.metadata.user_id.substring(0, 50)}...`
          : 'N/A',
        onlineCount: disguiseInfo.onlineSet?.size || 0,
        queueSize: disguiseInfo.queue?.size || 0,
        collected: req.apiKey?.sessionCollection?.enabled || false
      })
    }
  } catch (error) {
    logger.error(`❌ Claude disguise middleware error: ${error.message}`, error)
    // 发生错误时不阻塞请求，继续处理
  }

  next()
}

module.exports = disguiseMiddleware
