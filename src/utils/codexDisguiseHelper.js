/**
 * Codex 请求伪装工具（增强版）
 *
 * 功能：
 * - 优先级队列管理 sessionId
 * - 双层概率式轮换策略
 * - 多 sessionId 并发在线
 * - 白名单控制收集来源
 *
 * 架构：
 * - sessionId 队列：Redis Sorted Set（按优先级排序）
 * - 在线集合：当前活跃使用的 sessionId（最多 n 个）
 * - 双层概率：p1 控制是否轮换，p2 控制轮换几个
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

  // 是否启用伪装
  enabled: process.env.CODEX_DISGUISE_ENABLED === 'true' || false,

  // 优先级队列配置
  sessionQueueSize: parseInt(process.env.CODEX_SESSION_QUEUE_SIZE || '15', 10),
  queueKey: 'codex_disguise:session_queue', // Sorted Set

  // 在线集合配置
  maxOnlineSessions: parseInt(process.env.CODEX_MAX_ONLINE_SESSIONS || '3', 10),
  minOnlineSessions: parseInt(process.env.CODEX_MIN_ONLINE_SESSIONS || '2', 10),
  onlineSetKey: 'codex_disguise:online_set', // Sorted Set (score = timestamp)

  // 双层概率配置
  rotationP1: parseFloat(process.env.CODEX_ROTATION_P1 || '0.15'), // 15% 概率考虑轮换
  rotationP2: parseFloat(process.env.CODEX_ROTATION_P2 || '0.4'), // 40% 概率换掉一个
  maxRotationCount: parseInt(process.env.CODEX_MAX_ROTATION_COUNT || '1', 10), // 每次最多换 1 个

  // 保护配置
  minRotationInterval: parseInt(process.env.CODEX_MIN_ROTATION_INTERVAL || '30', 10), // 最小轮换间隔（秒）
  lastRotationKey: 'codex_disguise:last_rotation_time',

  // 收集配置
  collectionMinInterval: parseInt(process.env.CODEX_COLLECTION_MIN_INTERVAL || '60', 10), // 同一 Key 最小收集间隔（秒）

  // 轮换锁
  rotationLockKey: 'codex_disguise:rotation_lock',
  rotationLockTTL: 2 // 锁超时时间（秒）
}

// 轮换统计（内存缓存）
const rotationMetrics = {
  rotationAttempts: 0,
  rotationSuccess: 0,
  rotationSessionCount: 0,
  lastRotationTime: null
}

/**
 * 获取当天的日期字符串 (YYYY-MM-DD)
 */
function getTodayDateString() {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * 验证 sessionId 格式（UUID v7）
 */
function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(sessionId)
}

/**
 * 添加 sessionId 到优先级队列
 * @param {string} sessionId - UUID 格式的会话ID
 * @param {object} metadata - { apiKeyId, apiKeyName, priority, timestamp }
 * @returns {Promise<boolean>} 是否添加成功
 */
async function addSessionIdToQueue(sessionId, metadata = {}) {
  if (!isValidSessionId(sessionId)) {
    logger.warn(`⚠️  Invalid Codex session_id format: ${sessionId}`)
    return false
  }

  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }

    // 计算 score = priority * 1e12 + timestamp
    // 高优先级 score 更大，会排在后面（ZPOPMAX 取最大的）
    const priority = metadata.priority || 1
    const timestamp = metadata.timestamp || Date.now()
    const score = priority * 1e12 + timestamp

    // 检查队列大小
    const queueSize = await client.zcard(CODEX_DISGUISE_CONFIG.queueKey)

    if (queueSize >= CODEX_DISGUISE_CONFIG.sessionQueueSize) {
      // 队列满了，移除最低优先级的（score 最小的）
      await client.zpopmin(CODEX_DISGUISE_CONFIG.queueKey)
      logger.debug('📤 Codex queue full, removed lowest priority sessionId')
    }

    // 添加到队列（如果已存在会更新 score）
    await client.zadd(CODEX_DISGUISE_CONFIG.queueKey, score, sessionId)

    // 存储元数据（可选，用于调试）
    if (metadata.apiKeyId) {
      const metadataKey = `${CODEX_DISGUISE_CONFIG.queueKey}:metadata:${sessionId}`
      await client.setex(metadataKey, 7 * 24 * 60 * 60, JSON.stringify(metadata))
    }

    logger.info(
      `📥 Collected Codex sessionId [priority=${priority}] from API Key: ${metadata.apiKeyName || 'Unknown'}`
    )

    return true
  } catch (error) {
    logger.error('Failed to add Codex sessionId to queue:', error)
    return false
  }
}

/**
 * 从优先级队列取出一个 sessionId（高优先级优先）
 * @returns {Promise<string|null>}
 */
async function popFromQueue() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return null
    }

    // ZPOPMAX 取最高优先级的（score 最大的）
    const result = await client.zpopmax(CODEX_DISGUISE_CONFIG.queueKey)

    if (result && result.length >= 1) {
      return result[0] // 返回 sessionId
    }

    return null
  } catch (error) {
    logger.error('Failed to pop from Codex priority queue:', error)
    return null
  }
}

/**
 * 获取随机默认 sessionId（兜底）
 */
function getRandomDefaultSessionId() {
  const defaults = CODEX_DISGUISE_CONFIG.defaultSessionIds
  return defaults[Math.floor(Math.random() * defaults.length)]
}

/**
 * 获取在线集合中的所有 sessionId
 * @returns {Promise<string[]>}
 */
async function getOnlineSessionIds() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      logger.warn('⚠️  Redis not connected, using default sessionIds')
      return CODEX_DISGUISE_CONFIG.defaultSessionIds.slice(
        0,
        CODEX_DISGUISE_CONFIG.minOnlineSessions
      )
    }

    const sessionIds = await client.zrange(CODEX_DISGUISE_CONFIG.onlineSetKey, 0, -1)

    // 如果在线集合为空，初始化
    if (!sessionIds || sessionIds.length === 0) {
      await initializeOnlineSet()
      return await client.zrange(CODEX_DISGUISE_CONFIG.onlineSetKey, 0, -1)
    }

    return sessionIds
  } catch (error) {
    logger.error('Failed to get online sessionIds:', error)
    return CODEX_DISGUISE_CONFIG.defaultSessionIds.slice(0, CODEX_DISGUISE_CONFIG.minOnlineSessions)
  }
}

/**
 * 初始化在线集合（从队列或默认值）
 */
async function initializeOnlineSet() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }

    const now = Date.now()

    // 尝试从队列中取出 minOnlineSessions 个
    for (let i = 0; i < CODEX_DISGUISE_CONFIG.minOnlineSessions; i++) {
      const sessionId = await popFromQueue()
      if (sessionId) {
        await client.zadd(CODEX_DISGUISE_CONFIG.onlineSetKey, now + i, sessionId)
      } else {
        // 队列为空，使用默认值
        const defaultId = CODEX_DISGUISE_CONFIG.defaultSessionIds[i]
        if (defaultId) {
          await client.zadd(CODEX_DISGUISE_CONFIG.onlineSetKey, now + i, defaultId)
        }
      }
    }

    logger.info(
      `🎬 Initialized Codex online set with ${CODEX_DISGUISE_CONFIG.minOnlineSessions} sessionIds`
    )

    return true
  } catch (error) {
    logger.error('Failed to initialize online set:', error)
    return false
  }
}

/**
 * 从在线集合中随机选择一个 sessionId
 * @returns {Promise<string>}
 */
async function selectSessionIdFromOnline() {
  const onlineIds = await getOnlineSessionIds()

  if (onlineIds.length === 0) {
    logger.warn('⚠️  Online set is empty, using random default')
    return getRandomDefaultSessionId()
  }

  // 随机选择（均匀分布）
  const randomIndex = Math.floor(Math.random() * onlineIds.length)
  return onlineIds[randomIndex]
}

/**
 * 获取分布式锁
 */
async function acquireLock(key, ttl) {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }

    const result = await client.set(key, '1', 'EX', ttl, 'NX')
    return result === 'OK'
  } catch (error) {
    logger.error('Failed to acquire lock:', error)
    return false
  }
}

/**
 * 释放分布式锁
 */
async function releaseLock(key) {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }

    await client.del(key)
    return true
  } catch (error) {
    logger.error('Failed to release lock:', error)
    return false
  }
}

/**
 * 检查是否可以进行轮换（最小间隔保护）
 */
async function canRotate() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return true
    }

    const lastRotation = await client.get(CODEX_DISGUISE_CONFIG.lastRotationKey)
    if (!lastRotation) {
      return true
    }

    const elapsed = Date.now() - parseInt(lastRotation)
    return elapsed >= CODEX_DISGUISE_CONFIG.minRotationInterval * 1000
  } catch (error) {
    return true
  }
}

/**
 * 记录轮换时间
 */
async function recordRotationTime() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return
    }

    await client.set(CODEX_DISGUISE_CONFIG.lastRotationKey, Date.now().toString())
  } catch (error) {
    logger.error('Failed to record rotation time:', error)
  }
}

/**
 * 双层概率式轮换逻辑
 * @returns {Promise<number>} 轮换的 sessionId 数量
 */
async function maybeRotateSessionIds() {
  // 第一层概率：是否轮换
  if (Math.random() > CODEX_DISGUISE_CONFIG.rotationP1) {
    return 0
  }

  rotationMetrics.rotationAttempts++

  // 检查最小间隔
  if (!(await canRotate())) {
    logger.debug('⏳ Codex rotation skipped due to min interval protection')
    return 0
  }

  // 获取分布式锁（防止并发轮换）
  const lockAcquired = await acquireLock(
    CODEX_DISGUISE_CONFIG.rotationLockKey,
    CODEX_DISGUISE_CONFIG.rotationLockTTL
  )
  if (!lockAcquired) {
    logger.debug('🔒 Codex rotation skipped due to lock')
    return 0
  }

  try {
    const client = redisClient.getClient()
    if (!client) {
      return 0
    }

    const onlineSize = await client.zcard(CODEX_DISGUISE_CONFIG.onlineSetKey)
    let rotationCount = 0

    // 第二层概率：轮换几个（最多 m 个）
    for (let i = 0; i < CODEX_DISGUISE_CONFIG.maxRotationCount; i++) {
      if (Math.random() > CODEX_DISGUISE_CONFIG.rotationP2) {
        break
      }

      // 决定是添加还是替换
      if (onlineSize + rotationCount < CODEX_DISGUISE_CONFIG.maxOnlineSessions) {
        // 在线数量未达上限，直接添加
        const newSessionId = await popFromQueue()
        if (newSessionId) {
          const now = Date.now()
          await client.zadd(CODEX_DISGUISE_CONFIG.onlineSetKey, now, newSessionId)
          rotationCount++
          logger.info(`➕ Added Codex sessionId to online set: ${newSessionId.substring(0, 20)}...`)
        } else {
          // 队列为空，无法添加
          break
        }
      } else {
        // 达到上限，替换最老的
        const oldestResult = await client.zpopmin(CODEX_DISGUISE_CONFIG.onlineSetKey)
        if (oldestResult && oldestResult.length >= 1) {
          const oldSessionId = oldestResult[0]

          const newSessionId = await popFromQueue()
          if (newSessionId) {
            const now = Date.now()
            await client.zadd(CODEX_DISGUISE_CONFIG.onlineSetKey, now, newSessionId)
            rotationCount++
            logger.info(
              `🔄 Replaced Codex sessionId: ${oldSessionId.substring(0, 20)}... → ${newSessionId.substring(0, 20)}...`
            )
          } else {
            // 队列为空，把旧的放回去
            await client.zadd(CODEX_DISGUISE_CONFIG.onlineSetKey, Date.now(), oldSessionId)
            break
          }
        }
      }
    }

    if (rotationCount > 0) {
      rotationMetrics.rotationSuccess++
      rotationMetrics.rotationSessionCount += rotationCount
      rotationMetrics.lastRotationTime = new Date().toISOString()
      await recordRotationTime()

      const currentOnlineSize = await client.zcard(CODEX_DISGUISE_CONFIG.onlineSetKey)
      logger.info(`🔄 Rotated ${rotationCount} Codex sessionIds, online: ${currentOnlineSize}`)
    }

    return rotationCount
  } catch (error) {
    logger.error('Failed to rotate Codex sessionIds:', error)
    return 0
  } finally {
    await releaseLock(CODEX_DISGUISE_CONFIG.rotationLockKey)
  }
}

/**
 * 伪装 Codex 请求
 * @param {Object} headers - 请求头
 * @returns {Promise<Object>} - 伪装后的 headers
 */
async function disguiseCodexRequest(headers) {
  if (!CODEX_DISGUISE_CONFIG.enabled) {
    return headers
  }

  // 深拷贝避免修改原始对象
  const disguisedHeaders = { ...headers }

  // 从在线集合中选择 sessionId
  const selectedSessionId = await selectSessionIdFromOnline()
  disguisedHeaders['session_id'] = selectedSessionId

  // 异步触发轮换逻辑（不阻塞当前请求）
  setImmediate(() => {
    maybeRotateSessionIds().catch((err) => {
      logger.error('Async rotation failed:', err)
    })
  })

  return disguisedHeaders
}

/**
 * 获取伪装信息（用于日志和调试）
 */
async function getCodexDisguiseInfo() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return {
        enabled: CODEX_DISGUISE_CONFIG.enabled,
        error: 'Redis not connected'
      }
    }

    const onlineSessionIds = await getOnlineSessionIds()
    const queueSize = await client.zcard(CODEX_DISGUISE_CONFIG.queueKey)
    const queueItems = await client.zrange(CODEX_DISGUISE_CONFIG.queueKey, 0, -1, 'WITHSCORES')

    // 解析队列项（包含 score）
    const queueWithPriority = []
    for (let i = 0; i < queueItems.length; i += 2) {
      const sessionId = queueItems[i]
      const score = parseFloat(queueItems[i + 1])
      const priority = Math.floor(score / 1e12)
      const timestamp = score % 1e12

      // 获取元数据
      const metadataKey = `${CODEX_DISGUISE_CONFIG.queueKey}:metadata:${sessionId}`
      const metadataStr = await client.get(metadataKey)
      const metadata = metadataStr ? JSON.parse(metadataStr) : {}

      queueWithPriority.push({
        sessionId: `${sessionId.substring(0, 20)}...`,
        priority,
        addedAt: new Date(timestamp).toISOString(),
        source: metadata.apiKeyName || 'Unknown'
      })
    }

    return {
      enabled: CODEX_DISGUISE_CONFIG.enabled,
      config: {
        rotationP1: CODEX_DISGUISE_CONFIG.rotationP1,
        rotationP2: CODEX_DISGUISE_CONFIG.rotationP2,
        maxRotationCount: CODEX_DISGUISE_CONFIG.maxRotationCount,
        maxOnlineSessions: CODEX_DISGUISE_CONFIG.maxOnlineSessions,
        minOnlineSessions: CODEX_DISGUISE_CONFIG.minOnlineSessions,
        sessionQueueSize: CODEX_DISGUISE_CONFIG.sessionQueueSize,
        minRotationInterval: CODEX_DISGUISE_CONFIG.minRotationInterval
      },
      onlineSet: {
        size: onlineSessionIds.length,
        sessionIds: onlineSessionIds.map((id) => `${id.substring(0, 20)}...`)
      },
      queue: {
        size: queueSize,
        maxSize: CODEX_DISGUISE_CONFIG.sessionQueueSize,
        items: queueWithPriority
      },
      metrics: {
        ...rotationMetrics
      },
      defaultSessionIds: CODEX_DISGUISE_CONFIG.defaultSessionIds
    }
  } catch (error) {
    logger.error('Failed to get Codex disguise info:', error)
    return {
      enabled: CODEX_DISGUISE_CONFIG.enabled,
      error: error.message
    }
  }
}

/**
 * 清空队列和在线集合（用于重新收集）
 */
async function clearAllSessions() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return false
    }

    await client.del(CODEX_DISGUISE_CONFIG.queueKey)
    await client.del(CODEX_DISGUISE_CONFIG.onlineSetKey)

    logger.info('🗑️  Cleared Codex session queue and online set')
    return true
  } catch (error) {
    logger.error('Failed to clear Codex sessions:', error)
    return false
  }
}

module.exports = {
  disguiseCodexRequest,
  getCodexDisguiseInfo,
  addSessionIdToQueue,
  getOnlineSessionIds,
  selectSessionIdFromOnline,
  maybeRotateSessionIds,
  clearAllSessions,
  initializeOnlineSet,
  CODEX_DISGUISE_CONFIG
}
