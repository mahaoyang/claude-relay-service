// Session Pool 服务 - 管理动态 session_id 池
// 从白名单用户请求中收集真实 session_id，随机切换使用

const logger = require('../utils/logger')
const redisClient = require('../models/redis')

const REDIS_KEY_SESSION_POOL = 'session_pool:available'
const REDIS_KEY_CURRENT_SESSION = 'session_pool:current'
const REDIS_KEY_LAST_SWITCH_TIME = 'session_pool:last_switch'

// 默认 session (fallback)
const DEFAULT_SESSION_ID = '9f10edbb-1407-47e1-9b85-fa634be33732'

// 配置
const MIN_POOL_SIZE = parseInt(process.env.SESSION_POOL_MIN_SIZE) || 3 // 最小池大小
const MAX_POOL_SIZE = parseInt(process.env.SESSION_POOL_MAX_SIZE) || 20 // 最大池大小
const SWITCH_PROBABILITY = parseFloat(process.env.SESSION_SWITCH_PROBABILITY) || 0.1 // 10% 切换概率
const MIN_SWITCH_INTERVAL_MS = parseInt(process.env.SESSION_MIN_SWITCH_INTERVAL_MS) || 5 * 60 * 1000 // 最小切换间隔 5 分钟

class SessionPoolService {
  constructor() {
    this.initialized = false
  }

  /**
   * 初始化服务
   */
  async initialize() {
    if (this.initialized) {
      return
    }

    try {
      // 确保有当前 session
      const current = await redisClient.get(REDIS_KEY_CURRENT_SESSION)
      if (!current) {
        await redisClient.set(REDIS_KEY_CURRENT_SESSION, DEFAULT_SESSION_ID)
        await this.addToPool(DEFAULT_SESSION_ID)
        logger.info(`[SessionPool] Initialized with default session: ${DEFAULT_SESSION_ID}`)
      }

      this.initialized = true
    } catch (error) {
      logger.error(`[SessionPool] Initialization failed: ${error.message}`)
    }
  }

  /**
   * 从用户请求中提取 session_id
   * @param {Object} metadata - 请求的 metadata 对象
   * @returns {string|null} - 提取的 session_id
   */
  extractSessionId(metadata) {
    if (!metadata || typeof metadata !== 'object') {
      return null
    }

    const userId = metadata.user_id
    if (!userId || typeof userId !== 'string') {
      return null
    }

    // 解析格式: user_{machine_id}_account__session_{session_id}
    const match = userId.match(/session_([a-f0-9-]+)$/i)
    return match ? match[1] : null
  }

  /**
   * 添加 session_id 到池中
   * @param {string} sessionId
   */
  async addToPool(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return
    }

    try {
      // 检查池大小
      const poolSize = await redisClient.scard(REDIS_KEY_SESSION_POOL)

      if (poolSize >= MAX_POOL_SIZE) {
        // 池已满，不添加
        return
      }

      // 添加到集合（自动去重）
      const added = await redisClient.sadd(REDIS_KEY_SESSION_POOL, sessionId)

      if (added) {
        logger.info(
          `[SessionPool] Added new session to pool: ${sessionId} (pool size: ${poolSize + 1})`
        )
      }
    } catch (error) {
      logger.error(`[SessionPool] Failed to add session: ${error.message}`)
    }
  }

  /**
   * 从白名单用户请求中收集 session_id
   * @param {Object} req - Express request 对象
   */
  async collectFromWhitelist(req) {
    // 检查是否为白名单 API Key
    if (!req.apiKeyData?.isWhitelisted && !req.apiKeyData?.collectSession) {
      return
    }

    // 提取 session_id
    const sessionId = this.extractSessionId(req.body?.metadata)

    if (sessionId) {
      await this.addToPool(sessionId)
      logger.debug(
        `[SessionPool] Collected session from whitelist API Key: ${req.apiKeyData.id} -> ${sessionId}`
      )
    }
  }

  /**
   * 获取当前使用的 session_id
   * @returns {Promise<string>}
   */
  async getCurrentSession() {
    await this.initialize()

    try {
      const current = await redisClient.get(REDIS_KEY_CURRENT_SESSION)
      return current || DEFAULT_SESSION_ID
    } catch (error) {
      logger.error(`[SessionPool] Failed to get current session: ${error.message}`)
      return DEFAULT_SESSION_ID
    }
  }

  /**
   * 随机决定是否切换 session_id
   * @returns {Promise<boolean>} - 是否发生了切换
   */
  async maybeSwitch() {
    await this.initialize()

    try {
      // 检查最小切换间隔
      const lastSwitchTime = await redisClient.get(REDIS_KEY_LAST_SWITCH_TIME)
      if (lastSwitchTime) {
        const elapsed = Date.now() - parseInt(lastSwitchTime)
        if (elapsed < MIN_SWITCH_INTERVAL_MS) {
          return false // 间隔太短，不切换
        }
      }

      // 随机决定是否切换
      if (Math.random() > SWITCH_PROBABILITY) {
        return false // 不切换
      }

      // 从池中随机选择一个 session
      const poolSize = await redisClient.scard(REDIS_KEY_SESSION_POOL)

      if (poolSize < MIN_POOL_SIZE) {
        logger.debug(`[SessionPool] Pool too small (${poolSize}), skip switching`)
        return false
      }

      // 随机获取一个成员
      const sessions = await redisClient.srandmember(REDIS_KEY_SESSION_POOL, 1)
      if (!sessions || sessions.length === 0) {
        return false
      }

      const newSession = sessions[0]
      const currentSession = await redisClient.get(REDIS_KEY_CURRENT_SESSION)

      // 如果抽到的和当前相同，不切换
      if (newSession === currentSession) {
        return false
      }

      // 切换到新 session
      await redisClient.set(REDIS_KEY_CURRENT_SESSION, newSession)
      await redisClient.set(REDIS_KEY_LAST_SWITCH_TIME, Date.now().toString())

      logger.info(`[SessionPool] Switched session: ${currentSession} -> ${newSession}`)
      return true
    } catch (error) {
      logger.error(`[SessionPool] Failed to switch session: ${error.message}`)
      return false
    }
  }

  /**
   * 获取池统计信息
   * @returns {Promise<Object>}
   */
  async getStats() {
    await this.initialize()

    try {
      const [currentSession, poolSize, sessions, lastSwitchTime] = await Promise.all([
        redisClient.get(REDIS_KEY_CURRENT_SESSION),
        redisClient.scard(REDIS_KEY_SESSION_POOL),
        redisClient.smembers(REDIS_KEY_SESSION_POOL),
        redisClient.get(REDIS_KEY_LAST_SWITCH_TIME)
      ])

      return {
        currentSession: currentSession || DEFAULT_SESSION_ID,
        poolSize,
        sessions: sessions || [],
        lastSwitchTime: lastSwitchTime ? parseInt(lastSwitchTime) : null,
        config: {
          minPoolSize: MIN_POOL_SIZE,
          maxPoolSize: MAX_POOL_SIZE,
          switchProbability: SWITCH_PROBABILITY,
          minSwitchIntervalMs: MIN_SWITCH_INTERVAL_MS
        }
      }
    } catch (error) {
      logger.error(`[SessionPool] Failed to get stats: ${error.message}`)
      return null
    }
  }

  /**
   * 手动设置当前 session (管理接口用)
   * @param {string} sessionId
   */
  async setCurrentSession(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID')
    }

    await redisClient.set(REDIS_KEY_CURRENT_SESSION, sessionId)
    await this.addToPool(sessionId) // 同时添加到池中
    logger.info(`[SessionPool] Manually set current session: ${sessionId}`)
  }

  /**
   * 清空池 (保留当前 session)
   */
  async clearPool() {
    const current = await redisClient.get(REDIS_KEY_CURRENT_SESSION)
    await redisClient.del(REDIS_KEY_SESSION_POOL)
    await redisClient.del(REDIS_KEY_LAST_SWITCH_TIME)

    if (current) {
      await redisClient.sadd(REDIS_KEY_SESSION_POOL, current)
    }

    logger.info('[SessionPool] Pool cleared')
  }
}

// 单例
const sessionPoolService = new SessionPoolService()

module.exports = sessionPoolService
