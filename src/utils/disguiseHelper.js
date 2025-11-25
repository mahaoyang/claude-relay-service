/**
 * Claude CLI 请求伪装工具（增强版）
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
const DISGUISE_CONFIG = {
  // 固定使用的客户端ID (WSL机器码)
  clientId: '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf',

  // 默认会话ID池 (用于初始化或回退)
  defaultSessionIds: [
    '9f10edbb-1407-47e1-9b85-fa634be33732',
    '50475d3e-7ba5-417d-a71d-bc3711f26693',
    '4fe5b286-192b-4929-a25e-8bc1789b5de4'
  ],

  // 是否启用伪装
  enabled: process.env.DISGUISE_ENABLED === 'true' || false,

  // 优先级队列配置
  sessionQueueSize: parseInt(process.env.DISGUISE_SESSION_QUEUE_SIZE || '15', 10),
  queueKey: 'disguise:session_queue', // Sorted Set

  // 在线集合配置
  maxOnlineSessions: parseInt(process.env.DISGUISE_MAX_ONLINE_SESSIONS || '3', 10),
  minOnlineSessions: parseInt(process.env.DISGUISE_MIN_ONLINE_SESSIONS || '2', 10),
  onlineSetKey: 'disguise:online_set', // Sorted Set (score = timestamp)

  // 双层概率配置
  rotationP1: parseFloat(process.env.DISGUISE_ROTATION_P1 || '0.15'), // 15% 概率考虑轮换
  rotationP2: parseFloat(process.env.DISGUISE_ROTATION_P2 || '0.4'), // 40% 概率换掉一个
  maxRotationCount: parseInt(process.env.DISGUISE_MAX_ROTATION_COUNT || '1', 10), // 每次最多换 1 个

  // 保护配置
  minRotationInterval: parseInt(process.env.DISGUISE_MIN_ROTATION_INTERVAL || '30', 10), // 最小轮换间隔（秒）
  lastRotationKey: 'disguise:last_rotation_time',

  // 收集配置
  collectionMinInterval: parseInt(process.env.DISGUISE_COLLECTION_MIN_INTERVAL || '60', 10), // 同一 Key 最小收集间隔（秒）

  // 轮换锁
  rotationLockKey: 'disguise:rotation_lock',
  rotationLockTTL: 2, // 锁超时时间（秒）

  // 是否自动使用最新版本
  autoUseLatestVersion: process.env.DISGUISE_AUTO_VERSION === 'true' || true
}

// 版本信息缓存
const latestVersion = {
  userAgent: 'claude-cli/2.0.42 (external, cli)',
  lastUpdated: null
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
 * 从 user_id 中提取 sessionId
 * 格式: user_{clientId}_account__session_{sessionId}
 */
function extractSessionIdFromUserId(userId) {
  if (!userId) {
    return null
  }
  const match = userId.match(/session_([a-f0-9-]{36})$/i)
  return match ? match[1] : null
}

/**
 * 验证 sessionId 格式（UUID v4）
 */
function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false
  }
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
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
    logger.warn(`⚠️  Invalid Claude sessionId format: ${sessionId}`)
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
    const queueSize = await client.zcard(DISGUISE_CONFIG.queueKey)

    if (queueSize >= DISGUISE_CONFIG.sessionQueueSize) {
      // 队列满了，移除最低优先级的（score 最小的）
      await client.zpopmin(DISGUISE_CONFIG.queueKey)
      logger.debug('📤 Claude queue full, removed lowest priority sessionId')
    }

    // 添加到队列（如果已存在会更新 score）
    await client.zadd(DISGUISE_CONFIG.queueKey, score, sessionId)

    // 存储元数据（可选，用于调试）
    if (metadata.apiKeyId) {
      const metadataKey = `${DISGUISE_CONFIG.queueKey}:metadata:${sessionId}`
      await client.setex(metadataKey, 7 * 24 * 60 * 60, JSON.stringify(metadata))
    }

    logger.info(
      `📥 Collected Claude sessionId [priority=${priority}] from API Key: ${metadata.apiKeyName || 'Unknown'}`
    )

    return true
  } catch (error) {
    logger.error('Failed to add Claude sessionId to queue:', error)
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
    const result = await client.zpopmax(DISGUISE_CONFIG.queueKey)

    if (result && result.length >= 1) {
      return result[0] // 返回 sessionId
    }

    return null
  } catch (error) {
    logger.error('Failed to pop from Claude priority queue:', error)
    return null
  }
}

/**
 * 获取随机默认 sessionId（兜底）
 */
function getRandomDefaultSessionId() {
  const defaults = DISGUISE_CONFIG.defaultSessionIds
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
      return DISGUISE_CONFIG.defaultSessionIds.slice(0, DISGUISE_CONFIG.minOnlineSessions)
    }

    const sessionIds = await client.zrange(DISGUISE_CONFIG.onlineSetKey, 0, -1)

    // 如果在线集合为空，初始化
    if (!sessionIds || sessionIds.length === 0) {
      await initializeOnlineSet()
      return await client.zrange(DISGUISE_CONFIG.onlineSetKey, 0, -1)
    }

    return sessionIds
  } catch (error) {
    logger.error('Failed to get online sessionIds:', error)
    return DISGUISE_CONFIG.defaultSessionIds.slice(0, DISGUISE_CONFIG.minOnlineSessions)
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
    for (let i = 0; i < DISGUISE_CONFIG.minOnlineSessions; i++) {
      const sessionId = await popFromQueue()
      if (sessionId) {
        await client.zadd(DISGUISE_CONFIG.onlineSetKey, now + i, sessionId)
      } else {
        // 队列为空，使用默认值
        const defaultId = DISGUISE_CONFIG.defaultSessionIds[i]
        if (defaultId) {
          await client.zadd(DISGUISE_CONFIG.onlineSetKey, now + i, defaultId)
        }
      }
    }

    logger.info(
      `🎬 Initialized Claude online set with ${DISGUISE_CONFIG.minOnlineSessions} sessionIds`
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
 * 生成伪装的user_id
 */
async function getDisguisedUserId() {
  const sessionId = await selectSessionIdFromOnline()
  return `user_${DISGUISE_CONFIG.clientId}_account__session_${sessionId}`
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

    const lastRotation = await client.get(DISGUISE_CONFIG.lastRotationKey)
    if (!lastRotation) {
      return true
    }

    const elapsed = Date.now() - parseInt(lastRotation)
    return elapsed >= DISGUISE_CONFIG.minRotationInterval * 1000
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

    await client.set(DISGUISE_CONFIG.lastRotationKey, Date.now().toString())
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
  if (Math.random() > DISGUISE_CONFIG.rotationP1) {
    return 0
  }

  rotationMetrics.rotationAttempts++

  // 检查最小间隔
  if (!(await canRotate())) {
    logger.debug('⏳ Claude rotation skipped due to min interval protection')
    return 0
  }

  // 获取分布式锁（防止并发轮换）
  const lockAcquired = await acquireLock(
    DISGUISE_CONFIG.rotationLockKey,
    DISGUISE_CONFIG.rotationLockTTL
  )
  if (!lockAcquired) {
    logger.debug('🔒 Claude rotation skipped due to lock')
    return 0
  }

  try {
    const client = redisClient.getClient()
    if (!client) {
      return 0
    }

    const onlineSize = await client.zcard(DISGUISE_CONFIG.onlineSetKey)
    let rotationCount = 0

    // 第二层概率：轮换几个（最多 m 个）
    for (let i = 0; i < DISGUISE_CONFIG.maxRotationCount; i++) {
      if (Math.random() > DISGUISE_CONFIG.rotationP2) {
        break
      }

      // 决定是添加还是替换
      if (onlineSize + rotationCount < DISGUISE_CONFIG.maxOnlineSessions) {
        // 在线数量未达上限，直接添加
        const newSessionId = await popFromQueue()
        if (newSessionId) {
          const now = Date.now()
          await client.zadd(DISGUISE_CONFIG.onlineSetKey, now, newSessionId)
          rotationCount++
          logger.info(`➕ Added Claude sessionId to online set: ${newSessionId}`)
        } else {
          // 队列为空，无法添加
          break
        }
      } else {
        // 达到上限，替换最老的
        const oldestResult = await client.zpopmin(DISGUISE_CONFIG.onlineSetKey)
        if (oldestResult && oldestResult.length >= 1) {
          const oldSessionId = oldestResult[0]

          const newSessionId = await popFromQueue()
          if (newSessionId) {
            const now = Date.now()
            await client.zadd(DISGUISE_CONFIG.onlineSetKey, now, newSessionId)
            rotationCount++
            logger.info(`🔄 Replaced Claude sessionId: ${oldSessionId} → ${newSessionId}`)
          } else {
            // 队列为空，把旧的放回去
            await client.zadd(DISGUISE_CONFIG.onlineSetKey, Date.now(), oldSessionId)
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

      const currentOnlineSize = await client.zcard(DISGUISE_CONFIG.onlineSetKey)
      logger.info(`🔄 Rotated ${rotationCount} Claude sessionIds, online: ${currentOnlineSize}`)
    }

    return rotationCount
  } catch (error) {
    logger.error('Failed to rotate Claude sessionIds:', error)
    return 0
  } finally {
    await releaseLock(DISGUISE_CONFIG.rotationLockKey)
  }
}

/**
 * 生成随机的sentry-trace
 * 格式: {32位hex}-{16位hex}
 */
function generateSentryTrace() {
  const traceId = crypto.randomBytes(16).toString('hex')
  const spanId = crypto.randomBytes(8).toString('hex')
  return `${traceId}-${spanId}`
}

/**
 * 生成baggage头
 */
function generateBaggage(sentryTraceId, version = '2.0.42') {
  // 从现有请求中提取的固定格式，使用当前版本号
  return `sentry-environment=external,sentry-release=${version},sentry-public_key=e531a1d9ec1de9064fae9d4affb0b0f4,sentry-trace_id=${sentryTraceId}`
}

/**
 * 从user-agent中提取版本号
 */
function extractVersionFromUA(userAgent) {
  if (!userAgent) {
    return null
  }
  const match = userAgent.match(/claude-cli\/(\d+\.\d+\.\d+)/)
  return match ? match[1] : null
}

/**
 * 比较版本号
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) {
      return 1
    }
    if (p1 < p2) {
      return -1
    }
  }
  return 0
}

/**
 * 更新最新版本信息
 */
function updateLatestVersion(userAgent) {
  if (!userAgent || !DISGUISE_CONFIG.autoUseLatestVersion) {
    return
  }

  const newVersion = extractVersionFromUA(userAgent)
  if (!newVersion) {
    return
  }

  const currentVersion = extractVersionFromUA(latestVersion.userAgent)

  // 如果没有当前版本，或新版本更高，则更新
  if (!currentVersion || compareVersions(newVersion, currentVersion) > 0) {
    latestVersion.userAgent = userAgent
    latestVersion.lastUpdated = new Date().toISOString()

    logger.info(`📦 Updated latest Claude CLI version: ${userAgent}`)
  }
}

/**
 * 获取最新的user-agent
 */
function getLatestUserAgent() {
  return latestVersion.userAgent
}

/**
 * 伪装请求
 * @param {Object} requestBody - 请求体
 * @param {Object} headers - 请求头
 * @returns {Promise<Object>} - 伪装后的 { body, headers }
 */
async function disguiseRequest(requestBody, headers) {
  if (!DISGUISE_CONFIG.enabled) {
    // 即使不伪装，也收集版本信息
    if (headers && headers['user-agent']) {
      updateLatestVersion(headers['user-agent'])
    }
    return { body: requestBody, headers }
  }

  // 仅做浅拷贝以减少大请求体的开销
  const disguisedBody = { ...(requestBody || {}) }
  const disguisedHeaders = { ...(headers || {}) }
  if (requestBody?.metadata) {
    disguisedBody.metadata = { ...requestBody.metadata }
  }

  // 0. 更新版本信息（从原始请求中学习）
  if (headers && headers['user-agent']) {
    updateLatestVersion(headers['user-agent'])
  }

  // ====== 步骤 1: 从在线集合中选择 sessionId 用于伪装 ======
  // 1. 伪装 metadata.user_id
  if (disguisedBody.metadata) {
    disguisedBody.metadata.user_id = await getDisguisedUserId()
  }

  // 2. 使用最新的 user-agent（如果启用）
  if (DISGUISE_CONFIG.autoUseLatestVersion) {
    disguisedHeaders['user-agent'] = getLatestUserAgent()
  }

  // 3. 生成新的 sentry-trace 和 baggage
  const sentryTrace = generateSentryTrace()
  const sentryTraceId = sentryTrace.split('-')[0]

  // 从user-agent提取版本号用于baggage
  const version = extractVersionFromUA(disguisedHeaders['user-agent']) || '2.0.42'

  disguisedHeaders['sentry-trace'] = sentryTrace
  disguisedHeaders['baggage'] = generateBaggage(sentryTraceId, version)

  // 异步触发轮换逻辑（不阻塞当前请求）
  setImmediate(() => {
    maybeRotateSessionIds().catch((err) => {
      logger.error('Async rotation failed:', err)
    })
  })

  return {
    body: disguisedBody,
    headers: disguisedHeaders
  }
}

/**
 * 获取伪装信息（用于日志和调试）
 */
async function getDisguiseInfo() {
  try {
    const client = redisClient.getClient()
    if (!client) {
      return {
        enabled: DISGUISE_CONFIG.enabled,
        error: 'Redis not connected'
      }
    }

    const onlineSessionIds = await getOnlineSessionIds()
    const queueSize = await client.zcard(DISGUISE_CONFIG.queueKey)
    const queueItems = await client.zrange(DISGUISE_CONFIG.queueKey, 0, -1, 'WITHSCORES')

    // 解析队列项（包含 score）
    const queueWithPriority = []
    for (let i = 0; i < queueItems.length; i += 2) {
      const sessionId = queueItems[i]
      const score = parseFloat(queueItems[i + 1])
      const priority = Math.floor(score / 1e12)
      const timestamp = score % 1e12

      // 获取元数据
      const metadataKey = `${DISGUISE_CONFIG.queueKey}:metadata:${sessionId}`
      const metadataStr = await client.get(metadataKey)
      const metadata = metadataStr ? JSON.parse(metadataStr) : {}

      queueWithPriority.push({
        sessionId,
        priority,
        addedAt: new Date(timestamp).toISOString(),
        source: metadata.apiKeyName || 'Unknown'
      })
    }

    return {
      enabled: DISGUISE_CONFIG.enabled,
      clientId: DISGUISE_CONFIG.clientId,
      config: {
        rotationP1: DISGUISE_CONFIG.rotationP1,
        rotationP2: DISGUISE_CONFIG.rotationP2,
        maxRotationCount: DISGUISE_CONFIG.maxRotationCount,
        maxOnlineSessions: DISGUISE_CONFIG.maxOnlineSessions,
        minOnlineSessions: DISGUISE_CONFIG.minOnlineSessions,
        sessionQueueSize: DISGUISE_CONFIG.sessionQueueSize,
        minRotationInterval: DISGUISE_CONFIG.minRotationInterval
      },
      onlineSet: {
        size: onlineSessionIds.length,
        sessionIds: onlineSessionIds
      },
      queue: {
        size: queueSize,
        maxSize: DISGUISE_CONFIG.sessionQueueSize,
        items: queueWithPriority
      },
      metrics: {
        ...rotationMetrics
      },
      defaultSessionIds: DISGUISE_CONFIG.defaultSessionIds,
      latestVersion: latestVersion.userAgent,
      versionLastUpdated: latestVersion.lastUpdated,
      autoUseLatestVersion: DISGUISE_CONFIG.autoUseLatestVersion
    }
  } catch (error) {
    logger.error('Failed to get Claude disguise info:', error)
    return {
      enabled: DISGUISE_CONFIG.enabled,
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

    await client.del(DISGUISE_CONFIG.queueKey)
    await client.del(DISGUISE_CONFIG.onlineSetKey)

    logger.info('🗑️  Cleared Claude session queue and online set')
    return true
  } catch (error) {
    logger.error('Failed to clear Claude sessions:', error)
    return false
  }
}

module.exports = {
  disguiseRequest,
  getDisguiseInfo,
  addSessionIdToQueue,
  getOnlineSessionIds,
  selectSessionIdFromOnline,
  getDisguisedUserId,
  maybeRotateSessionIds,
  updateLatestVersion,
  getLatestUserAgent,
  extractSessionIdFromUserId,
  clearAllSessions,
  initializeOnlineSet,
  DISGUISE_CONFIG
}
