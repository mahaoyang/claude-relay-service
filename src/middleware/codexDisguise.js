/**
 * Codex 请求伪装中间件（增强版）
 * 将多个下游用户伪装成单一上游身份
 *
 * 功能：
 * - 仅修改 session_id 请求头
 * - 模型字段完全透传，不做任何修改
 * - 白名单控制 sessionId 收集
 * - 优先级队列 + 双层概率轮换
 */

const codexDisguiseHelper = require('../utils/codexDisguiseHelper')
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
  const minInterval = codexDisguiseHelper.CODEX_DISGUISE_CONFIG.collectionMinInterval || 60
  if (config.lastCollectedAt) {
    const elapsed = Date.now() - config.lastCollectedAt
    if (elapsed < minInterval * 1000) {
      return false
    }
  }

  // 4. 验证 sessionId 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(sessionId)) {
    logger.warn(`⚠️  Invalid session_id format from API Key ${apiKey.name}: ${sessionId}`)
    return false
  }

  return true
}

/**
 * Codex 伪装中间件
 * 在请求到达转发服务前应用伪装
 *
 * 流程：
 * 1. 检查白名单，决定是否收集真实 session_id
 * 2. 池未满时添加到优先级队列
 * 3. 从在线集合中随机选择 session_id
 * 4. 应用伪装（仅修改 session_id 请求头）
 * 5. 异步触发双层概率轮换
 *
 * 注意：
 * - 模型字段透传，不做修改
 * - 请求体不做任何修改
 */
async function codexDisguiseMiddleware(req, res, next) {
  // 如果未启用伪装，直接跳过
  if (!codexDisguiseHelper.CODEX_DISGUISE_CONFIG.enabled) {
    return next()
  }

  // 只处理有 headers 的请求
  if (!req.headers) {
    return next()
  }

  try {
    // 保存原始数据用于日志
    const originalSessionId = req.headers['session_id']

    // ====== 步骤 1: 检查白名单并收集 sessionId ======
    if (req.apiKey && originalSessionId) {
      const shouldCollect = await shouldCollectSessionId(req.apiKey, originalSessionId)

      if (shouldCollect) {
        const priority = req.apiKey.sessionCollection?.priority || 1
        const metadata = {
          apiKeyId: req.apiKey.id,
          apiKeyName: req.apiKey.name,
          priority,
          timestamp: Date.now()
        }

        const collected = await codexDisguiseHelper.addSessionIdToQueue(originalSessionId, metadata)

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

    // ====== 步骤 2: 应用伪装（包含轮换逻辑）======
    const disguisedHeaders = await codexDisguiseHelper.disguiseCodexRequest(req.headers)

    // 更新请求头
    Object.assign(req.headers, disguisedHeaders)

    // 标记请求已伪装
    req.isCodexDisguised = true

    // 日志记录（仅在 debug 模式下记录详细信息）
    if (process.env.DEBUG_DISGUISE === 'true') {
      const disguiseInfo = await codexDisguiseHelper.getCodexDisguiseInfo()
      logger.debug('🎭 Codex request disguised', {
        originalSessionId: originalSessionId ? `${originalSessionId.substring(0, 20)}...` : 'N/A',
        disguisedSessionId: disguisedHeaders['session_id']
          ? `${disguisedHeaders['session_id'].substring(0, 20)}...`
          : 'N/A',
        onlineCount: disguiseInfo.onlineSet?.size || 0,
        queueSize: disguiseInfo.queue?.size || 0,
        collected: req.apiKey?.sessionCollection?.enabled || false,
        model: req.body?.model || 'N/A'
      })
    }
  } catch (error) {
    logger.error(`❌ Codex disguise middleware error: ${error.message}`, error)
    // 发生错误时不阻塞请求，继续处理
  }

  next()
}

module.exports = codexDisguiseMiddleware
