/**
 * Codex 请求伪装工具
 * 用于将多个下游用户伪装成单一上游身份
 *
 * SessionId 池管理：
 * - 从真实请求中收集 session_id（来自请求头）
 * - 池最多保存 3 个
 * - 每天从池中 hash 选择 1 个用于伪装
 *
 * 注意：
 * - 模型字段透传，不做任何修改
 * - 仅修改 session_id 请求头
 */

const crypto = require('crypto')
const logger = require('./logger')
const redisClient = require('../models/redis')

// 伪装配置
const CODEX_DISGUISE_CONFIG = {
  // 默认会话ID池 (用于初始化或回退)
  defaultSessionIds: [
    '019a9544-7ab1-73c1-837e-1fa681f4462b',
    '019a9543-6c61-7310-8e37-f069df526d56',
    '019a9545-a2b3-7421-9f48-2ab7c8e3d647'
  ],

  // SessionId 池配置
  sessionPoolSize: parseInt(process.env.CODEX_DISGUISE_SESSION_POOL_SIZE || '3', 10),
  sessionPoolKey: 'codex_disguise:session_pool',
  sessionPoolTTL:
    parseInt(process.env.CODEX_DISGUISE_SESSION_POOL_TTL_DAYS || '5', 10) * 24 * 60 * 60, // 转换为秒

  // 是否启用伪装
  enabled: process.env.CODEX_DISGUISE_ENABLED === 'true' || false
}

/**
 * 获取当天的日期字符串 (YYYY-MM-DD)
 */
function getTodayDateString() {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * 从 Redis 池中获取所有 sessionId
 * 池为空时返回默认 sessionIds 作为兜底
 */
async function getSessionIdsFromPool() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      logger.warn('⚠️  Redis not connected, using default sessionIds for Codex disguise')
      return CODEX_DISGUISE_CONFIG.defaultSessionIds
    }
    const sessionIds = await client.smembers(CODEX_DISGUISE_CONFIG.sessionPoolKey)

    // 池为空（过期或未收集），使用默认 sessionIds 兜底
    if (!sessionIds || sessionIds.length === 0) {
      logger.info('🔄 Codex sessionId pool is empty, using default sessionIds as fallback')
      return CODEX_DISGUISE_CONFIG.defaultSessionIds
    }

    return sessionIds
  } catch (error) {
    logger.error('Failed to get Codex sessionIds from pool:', error)
    return CODEX_DISGUISE_CONFIG.defaultSessionIds
  }
}

/**
 * 添加 sessionId 到池中
 * @param {string} sessionId - UUID v7 格式的会话ID
 * @returns {Promise<boolean>} 是否添加成功
 */
async function addSessionIdToPool(sessionId) {
  if (!sessionId) {
    return false
  }

  // 验证 UUID 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(sessionId)) {
    logger.warn(`⚠️  Invalid Codex session_id format: ${sessionId}`)
    return false
  }

  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }

    // 检查池大小
    const poolSize = await client.scard(CODEX_DISGUISE_CONFIG.sessionPoolKey)

    if (poolSize >= CODEX_DISGUISE_CONFIG.sessionPoolSize) {
      // 池已满，不再收集
      return false
    }

    // 添加到池中（Set 自动去重）
    const added = await client.sadd(CODEX_DISGUISE_CONFIG.sessionPoolKey, sessionId)

    if (added > 0) {
      const newSize = poolSize + 1
      logger.info(
        `📥 Collected Codex sessionId to pool [${newSize}/${CODEX_DISGUISE_CONFIG.sessionPoolSize}]: ${sessionId}`
      )

      // 设置或刷新 TTL（5天后自动清理）
      await client.expire(
        CODEX_DISGUISE_CONFIG.sessionPoolKey,
        CODEX_DISGUISE_CONFIG.sessionPoolTTL
      )

      // 如果是第一个添加的 sessionId，记录 TTL 设置
      if (newSize === 1) {
        const ttlDays = CODEX_DISGUISE_CONFIG.sessionPoolTTL / (24 * 60 * 60)
        logger.info(`⏰ Codex sessionId pool TTL set to ${ttlDays} days`)
      }

      return true
    }

    return false
  } catch (error) {
    logger.error('Failed to add Codex sessionId to pool:', error)
    return false
  }
}

/**
 * 基于日期hash从池中选择当天的sessionId
 * 池会自动在空时返回默认 sessionIds
 */
async function getDailySessionId() {
  // 获取池中的 sessionIds（自动兜底）
  const sessionIds = await getSessionIdsFromPool()

  // 从池中 hash 选择
  const dateString = getTodayDateString()
  const hash = crypto.createHash('sha256').update(dateString).digest('hex')
  const hashNum = parseInt(hash.substring(0, 8), 16)
  const index = hashNum % sessionIds.length

  return sessionIds[index]
}

/**
 * 伪装 Codex 请求
 * @param {Object} headers - 请求头
 * @returns {Promise<Object>} - 伪装后的 headers
 *
 * 注意：
 * - 不修改 body（包括 model 字段）
 * - 仅修改 session_id 请求头
 */
async function disguiseCodexRequest(headers) {
  if (!CODEX_DISGUISE_CONFIG.enabled) {
    return headers
  }

  // ====== 步骤 1: 收集真实 sessionId 到池 ======
  const originalSessionId = headers['session_id']
  if (originalSessionId) {
    // 尝试添加到池中（池未满时才会添加）
    await addSessionIdToPool(originalSessionId)
  }

  // 深拷贝避免修改原始对象
  const disguisedHeaders = { ...headers }

  // ====== 步骤 2: 从池中选择 sessionId 用于伪装 ======
  // 仅修改 session_id 请求头
  const dailySessionId = await getDailySessionId()
  disguisedHeaders['session_id'] = dailySessionId

  return disguisedHeaders
}

/**
 * 获取伪装信息（用于日志和调试）
 */
async function getCodexDisguiseInfo() {
  const poolSessionIds = await getSessionIdsFromPool()

  if (!CODEX_DISGUISE_CONFIG.enabled) {
    return {
      enabled: false,
      sessionPool: {
        size: poolSessionIds.length,
        maxSize: CODEX_DISGUISE_CONFIG.sessionPoolSize,
        sessionIds: poolSessionIds
      }
    }
  }

  return {
    enabled: true,
    todaySessionId: await getDailySessionId(),
    date: getTodayDateString(),
    sessionPool: {
      size: poolSessionIds.length,
      maxSize: CODEX_DISGUISE_CONFIG.sessionPoolSize,
      sessionIds: poolSessionIds,
      isFull: poolSessionIds.length >= CODEX_DISGUISE_CONFIG.sessionPoolSize
    },
    defaultSessionIds: CODEX_DISGUISE_CONFIG.defaultSessionIds
  }
}

/**
 * 清空 sessionId 池（用于重新收集）
 */
async function clearCodexSessionPool() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }
    await client.del(CODEX_DISGUISE_CONFIG.sessionPoolKey)
    logger.info('🗑️  Codex sessionId pool cleared')
    return true
  } catch (error) {
    logger.error('Failed to clear Codex sessionId pool:', error)
    return false
  }
}

module.exports = {
  disguiseCodexRequest,
  getCodexDisguiseInfo,
  getDailySessionId,
  addSessionIdToPool,
  getSessionIdsFromPool,
  clearCodexSessionPool,
  CODEX_DISGUISE_CONFIG
}
