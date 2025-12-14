// Sentry 三元组池管理服务
// 管理真实的 (session_id, trace_id, span_id) 配对

const redisClient = require('../models/redis')
const logger = require('../utils/logger')

const REDIS_KEY_AVAILABLE = 'sentry_triplet_pool:available'
const REDIS_KEY_CURRENT = 'sentry_triplet_pool:current'
const REDIS_KEY_LAST_SWITCH = 'sentry_triplet_pool:last_switch'

// 默认三元组（当池为空时使用）
const DEFAULT_TRIPLET = {
  session: '9f10edbb-1407-47e1-9b85-fa634be33732',
  trace: '988f1b80178baa34cc02b67566c0269d',
  span: '8a43fcfc28f7ba8e'
}

// 配置
const MIN_POOL_SIZE = parseInt(process.env.SENTRY_TRIPLET_POOL_MIN_SIZE || '3', 10)
const MAX_POOL_SIZE = parseInt(process.env.SENTRY_TRIPLET_POOL_MAX_SIZE || '20', 10)
const SWITCH_PROBABILITY = parseFloat(process.env.SENTRY_TRIPLET_SWITCH_PROBABILITY || '0.1')
const MIN_SWITCH_INTERVAL_MS = parseInt(
  process.env.SENTRY_TRIPLET_MIN_SWITCH_INTERVAL_MS || '300000',
  10
)

class SentryTripletPoolService {
  constructor() {
    this.initialized = false
  }

  /**
   * 初始化三元组池
   */
  async initialize() {
    if (this.initialized) {
      return
    }

    try {
      // 检查是否已有当前三元组
      const current = await redisClient.get(REDIS_KEY_CURRENT)

      if (!current) {
        // 使用默认三元组初始化
        const defaultTripletStr = JSON.stringify(DEFAULT_TRIPLET)
        await redisClient.set(REDIS_KEY_CURRENT, defaultTripletStr)
        await redisClient.sadd(REDIS_KEY_AVAILABLE, defaultTripletStr)
        logger.info(
          `[SentryTripletPool] Initialized with default triplet: session=${DEFAULT_TRIPLET.session.substring(0, 8)}...`
        )
      }

      this.initialized = true
    } catch (error) {
      logger.error(`[SentryTripletPool] Initialization failed: ${error.message}`)
    }
  }

  /**
   * 从请求中提取三元组
   */
  extractTriplet(req) {
    try {
      // 提取 session_id
      const userId = req.body?.metadata?.user_id
      if (!userId) {
        return null
      }

      const sessionMatch = userId.match(/session_([a-f0-9-]+)$/i)
      if (!sessionMatch) {
        return null
      }
      const sessionId = sessionMatch[1]

      // 提取 trace_id 和 span_id
      const sentryTrace = req.headers['sentry-trace']
      if (!sentryTrace) {
        return null
      }

      const parts = sentryTrace.split('-')
      if (parts.length < 2) {
        return null
      }

      const traceId = parts[0]
      const spanId = parts[1]

      // 验证格式
      if (!this.isValidTriplet(sessionId, traceId, spanId)) {
        return null
      }

      return {
        session: sessionId,
        trace: traceId,
        span: spanId
      }
    } catch (error) {
      logger.debug(`[SentryTripletPool] Failed to extract triplet: ${error.message}`)
      return null
    }
  }

  /**
   * 验证三元组格式
   */
  isValidTriplet(sessionId, traceId, spanId) {
    // session: UUID 格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId)) {
      return false
    }

    // trace: 32位 hex
    if (!/^[0-9a-f]{32}$/i.test(traceId)) {
      return false
    }

    // span: 16位 hex
    if (!/^[0-9a-f]{16}$/i.test(spanId)) {
      return false
    }

    return true
  }

  /**
   * 从白名单请求收集三元组
   */
  async collectFromWhitelist(req) {
    try {
      // 检查是否是白名单 API Key
      if (!req.apiKeyData?.collectSession) {
        return
      }

      // 提取三元组
      const triplet = this.extractTriplet(req)
      if (!triplet) {
        return
      }

      // 添加到池中
      await this.addToPool(triplet)

      logger.info(
        `[SentryTripletPool] Collected triplet from whitelist API Key: ${req.apiKeyData.id} -> session=${triplet.session.substring(0, 8)}..., trace=${triplet.trace.substring(0, 8)}..., span=${triplet.span.substring(0, 8)}...`
      )
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to collect triplet: ${error.message}`)
    }
  }

  /**
   * 添加三元组到池中
   */
  async addToPool(triplet) {
    await this.initialize()

    try {
      const tripletStr = JSON.stringify(triplet)

      // 检查池大小
      const currentSize = await redisClient.scard(REDIS_KEY_AVAILABLE)

      if (currentSize >= MAX_POOL_SIZE) {
        logger.debug(
          `[SentryTripletPool] Pool is full (${currentSize}/${MAX_POOL_SIZE}), not adding new triplet`
        )
        return false
      }

      // 添加到池中（Set 会自动去重）
      const added = await redisClient.sadd(REDIS_KEY_AVAILABLE, tripletStr)

      if (added) {
        const newSize = await redisClient.scard(REDIS_KEY_AVAILABLE)
        logger.info(
          `[SentryTripletPool] Added new triplet to pool: session=${triplet.session.substring(0, 8)}... (pool size: ${newSize})`
        )
        return true
      }

      return false
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to add triplet to pool: ${error.message}`)
      return false
    }
  }

  /**
   * 获取当前三元组
   */
  async getCurrentTriplet() {
    await this.initialize()

    try {
      const tripletStr = await redisClient.get(REDIS_KEY_CURRENT)
      if (tripletStr) {
        return JSON.parse(tripletStr)
      }
      return DEFAULT_TRIPLET
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to get current triplet: ${error.message}`)
      return DEFAULT_TRIPLET
    }
  }

  /**
   * 随机决定是否切换三元组
   */
  async maybeSwitch() {
    await this.initialize()

    try {
      // 检查池大小
      const poolSize = await redisClient.scard(REDIS_KEY_AVAILABLE)
      if (poolSize < MIN_POOL_SIZE) {
        logger.debug(
          `[SentryTripletPool] Pool size (${poolSize}) below minimum (${MIN_POOL_SIZE}), not switching`
        )
        return false
      }

      // 检查上次切换时间
      const lastSwitchStr = await redisClient.get(REDIS_KEY_LAST_SWITCH)
      if (lastSwitchStr) {
        const lastSwitch = parseInt(lastSwitchStr, 10)
        const now = Date.now()
        const elapsed = now - lastSwitch

        if (elapsed < MIN_SWITCH_INTERVAL_MS) {
          logger.debug(
            `[SentryTripletPool] Too soon to switch (elapsed: ${elapsed}ms, min: ${MIN_SWITCH_INTERVAL_MS}ms)`
          )
          return false
        }
      }

      // 随机决定是否切换
      if (Math.random() > SWITCH_PROBABILITY) {
        return false
      }

      // 执行切换
      return await this.switchTriplet()
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to check switch: ${error.message}`)
      return false
    }
  }

  /**
   * 切换到新的三元组
   */
  async switchTriplet() {
    await this.initialize()

    try {
      // 获取当前三元组
      const currentStr = await redisClient.get(REDIS_KEY_CURRENT)

      // 获取所有可用三元组
      const allTriplets = await redisClient.smembers(REDIS_KEY_AVAILABLE)

      if (allTriplets.length === 0) {
        logger.warn('[SentryTripletPool] No triplets available for switching')
        return false
      }

      // 过滤掉当前三元组
      let availableTriplets = allTriplets
      if (currentStr && allTriplets.length > 1) {
        availableTriplets = allTriplets.filter((s) => s !== currentStr)
      }

      if (availableTriplets.length === 0) {
        availableTriplets = allTriplets
      }

      // 随机选择一个新三元组
      const newTripletStr = availableTriplets[Math.floor(Math.random() * availableTriplets.length)]
      const newTriplet = JSON.parse(newTripletStr)

      // 更新当前三元组
      await redisClient.set(REDIS_KEY_CURRENT, newTripletStr)
      await redisClient.set(REDIS_KEY_LAST_SWITCH, Date.now().toString())

      const oldTriplet = currentStr ? JSON.parse(currentStr) : null
      logger.info(
        `[SentryTripletPool] Switched triplet: session ${oldTriplet?.session.substring(0, 8) || 'default'}... → ${newTriplet.session.substring(0, 8)}..., trace ${oldTriplet?.trace.substring(0, 8) || 'default'}... → ${newTriplet.trace.substring(0, 8)}...`
      )

      return true
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to switch triplet: ${error.message}`)
      return false
    }
  }

  /**
   * 获取池统计信息
   */
  async getStats() {
    await this.initialize()

    try {
      const currentStr = await redisClient.get(REDIS_KEY_CURRENT)
      const current = currentStr ? JSON.parse(currentStr) : null
      const poolSize = await redisClient.scard(REDIS_KEY_AVAILABLE)
      const allTriplets = await redisClient.smembers(REDIS_KEY_AVAILABLE)
      const triplets = allTriplets.map((s) => JSON.parse(s))
      const lastSwitchStr = await redisClient.get(REDIS_KEY_LAST_SWITCH)
      const lastSwitchTime = lastSwitchStr ? parseInt(lastSwitchStr, 10) : null

      return {
        currentTriplet: current,
        poolSize,
        triplets,
        lastSwitchTime,
        config: {
          minPoolSize: MIN_POOL_SIZE,
          maxPoolSize: MAX_POOL_SIZE,
          switchProbability: SWITCH_PROBABILITY,
          minSwitchIntervalMs: MIN_SWITCH_INTERVAL_MS
        }
      }
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to get stats: ${error.message}`)
      throw error
    }
  }

  /**
   * 设置当前三元组
   */
  async setCurrentTriplet(triplet) {
    await this.initialize()

    try {
      if (!this.isValidTriplet(triplet.session, triplet.trace, triplet.span)) {
        throw new Error('Invalid triplet format')
      }

      const tripletStr = JSON.stringify(triplet)

      // 确保三元组在池中
      await redisClient.sadd(REDIS_KEY_AVAILABLE, tripletStr)

      // 设置为当前
      await redisClient.set(REDIS_KEY_CURRENT, tripletStr)
      await redisClient.set(REDIS_KEY_LAST_SWITCH, Date.now().toString())

      logger.info(
        `[SentryTripletPool] Set current triplet: session=${triplet.session.substring(0, 8)}..., trace=${triplet.trace.substring(0, 8)}..., span=${triplet.span.substring(0, 8)}...`
      )
      return true
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to set current triplet: ${error.message}`)
      throw error
    }
  }

  /**
   * 清空池
   */
  async clearPool() {
    try {
      await redisClient.del(REDIS_KEY_AVAILABLE)
      await redisClient.del(REDIS_KEY_CURRENT)
      await redisClient.del(REDIS_KEY_LAST_SWITCH)
      this.initialized = false
      logger.info('[SentryTripletPool] Pool cleared')
      return true
    } catch (error) {
      logger.error(`[SentryTripletPool] Failed to clear pool: ${error.message}`)
      throw error
    }
  }
}

// 单例
const sentryTripletPoolService = new SentryTripletPoolService()

module.exports = sentryTripletPoolService
