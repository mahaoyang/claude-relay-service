// Codex Session Pool 服务 - 管理 OpenAI Responses (Codex) 动态 session_id 池
// 从白名单用户请求中收集真实 session_id，随机切换使用

const logger = require('../utils/logger')
const redisClient = require('../models/redis')

const REDIS_KEY_SESSION_POOL = 'codex_session_pool:available'
const REDIS_KEY_CURRENT_SESSION = 'codex_session_pool:current'
const REDIS_KEY_LAST_SWITCH_TIME = 'codex_session_pool:last_switch'

// 默认 session (fallback)
const DEFAULT_SESSION_ID = '019a9544-7ab1-73c1-837e-1fa681f4462b'

// 配置
const MIN_POOL_SIZE = parseInt(process.env.CODEX_SESSION_POOL_MIN_SIZE) || 3
const MAX_POOL_SIZE = parseInt(process.env.CODEX_SESSION_POOL_MAX_SIZE) || 20
const SWITCH_PROBABILITY = parseFloat(process.env.CODEX_SESSION_SWITCH_PROBABILITY) || 0.1
const MIN_SWITCH_INTERVAL_MS =
  parseInt(process.env.CODEX_SESSION_MIN_SWITCH_INTERVAL_MS) || 5 * 60 * 1000

class CodexSessionPoolService {
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
      const current = await redisClient.get(REDIS_KEY_CURRENT_SESSION)
      if (!current) {
        await redisClient.set(REDIS_KEY_CURRENT_SESSION, DEFAULT_SESSION_ID)
        await this.addToPool(DEFAULT_SESSION_ID)
        logger.info(`[CodexSessionPool] Initialized with default session: ${DEFAULT_SESSION_ID}`)
      }

      this.initialized = true
    } catch (error) {
      logger.error(`[CodexSessionPool] Initialization failed: ${error.message}`)
    }
  }

  /**
   * 从用户请求中提取 session_id
   * Codex 的 session_id 可能在请求头或请求体中
   * @param {Object} req - Express request 对象
   * @returns {string|null}
   */
  extractSessionId(req) {
    // 优先从请求体中提取
    if (req.body && typeof req.body === 'object' && req.body.session_id) {
      return req.body.session_id
    }

    // 其次从请求头中提取
    if (req.headers && req.headers['session_id']) {
      return req.headers['session_id']
    }

    return null
  }

  /**
   * 添加 session_id 到池中
   * @param {string} sessionId
   */
  async addToPool(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return
    }

    // 基本格式验证（Codex session 通常是 UUID 格式）
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
      logger.debug(`[CodexSessionPool] Invalid session format: ${sessionId}`)
      return
    }

    try {
      const poolSize = await redisClient.scard(REDIS_KEY_SESSION_POOL)

      if (poolSize >= MAX_POOL_SIZE) {
        return
      }

      const added = await redisClient.sadd(REDIS_KEY_SESSION_POOL, sessionId)

      if (added) {
        logger.info(
          `[CodexSessionPool] Added new session to pool: ${sessionId} (pool size: ${poolSize + 1})`
        )
      }
    } catch (error) {
      logger.error(`[CodexSessionPool] Failed to add session: ${error.message}`)
    }
  }

  /**
   * 从白名单用户请求中收集 session_id
   * @param {Object} req - Express request 对象
   */
  async collectFromWhitelist(req) {
    // 检查是否为白名单 API Key
    if (!req.apiKeyData?.collectSession) {
      return
    }

    const sessionId = this.extractSessionId(req)

    if (sessionId) {
      await this.addToPool(sessionId)
      logger.debug(
        `[CodexSessionPool] Collected session from whitelist API Key: ${req.apiKeyData.id} -> ${sessionId}`
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
      logger.error(`[CodexSessionPool] Failed to get current session: ${error.message}`)
      return DEFAULT_SESSION_ID
    }
  }

  /**
   * 随机决定是否切换 session_id
   * @returns {Promise<boolean>}
   */
  async maybeSwitch() {
    await this.initialize()

    try {
      // 检查最小切换间隔
      const lastSwitchTime = await redisClient.get(REDIS_KEY_LAST_SWITCH_TIME)
      if (lastSwitchTime) {
        const elapsed = Date.now() - parseInt(lastSwitchTime)
        if (elapsed < MIN_SWITCH_INTERVAL_MS) {
          return false
        }
      }

      // 随机决定是否切换
      if (Math.random() > SWITCH_PROBABILITY) {
        return false
      }

      // 从池中随机选择一个 session
      const poolSize = await redisClient.scard(REDIS_KEY_SESSION_POOL)

      if (poolSize < MIN_POOL_SIZE) {
        logger.debug(`[CodexSessionPool] Pool too small (${poolSize}), skip switching`)
        return false
      }

      const sessions = await redisClient.srandmember(REDIS_KEY_SESSION_POOL, 1)
      if (!sessions || sessions.length === 0) {
        return false
      }

      const newSession = sessions[0]
      const currentSession = await redisClient.get(REDIS_KEY_CURRENT_SESSION)

      if (newSession === currentSession) {
        return false
      }

      await redisClient.set(REDIS_KEY_CURRENT_SESSION, newSession)
      await redisClient.set(REDIS_KEY_LAST_SWITCH_TIME, Date.now().toString())

      logger.info(`[CodexSessionPool] Switched session: ${currentSession} -> ${newSession}`)
      return true
    } catch (error) {
      logger.error(`[CodexSessionPool] Failed to switch session: ${error.message}`)
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
      logger.error(`[CodexSessionPool] Failed to get stats: ${error.message}`)
      return null
    }
  }

  /**
   * 手动设置当前 session
   * @param {string} sessionId
   */
  async setCurrentSession(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID')
    }

    await redisClient.set(REDIS_KEY_CURRENT_SESSION, sessionId)
    await this.addToPool(sessionId)
    logger.info(`[CodexSessionPool] Manually set current session: ${sessionId}`)
  }

  /**
   * 清空池
   */
  async clearPool() {
    const current = await redisClient.get(REDIS_KEY_CURRENT_SESSION)
    await redisClient.del(REDIS_KEY_SESSION_POOL)
    await redisClient.del(REDIS_KEY_LAST_SWITCH_TIME)

    if (current) {
      await redisClient.sadd(REDIS_KEY_SESSION_POOL, current)
    }

    logger.info('[CodexSessionPool] Pool cleared')
  }
}

// 单例
const codexSessionPoolService = new CodexSessionPoolService()

module.exports = codexSessionPoolService
