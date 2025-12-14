// Claude 请求头配置池管理服务
// 管理真实的 (session_id, trace_id, span_id, anthropic-version, anthropic-beta, x-app) 完整配置

const redisClient = require('../models/redis')
const logger = require('../utils/logger')

const REDIS_KEY_AVAILABLE = 'claude_headers_pool:available'
const REDIS_KEY_CURRENT = 'claude_headers_pool:current'
const REDIS_KEY_LAST_SWITCH = 'claude_headers_pool:last_switch'

// 默认配置（当池为空时使用）
const DEFAULT_CONFIG = {
  session: '9f10edbb-1407-47e1-9b85-fa634be33732',
  trace: '988f1b80178baa34cc02b67566c0269d',
  span: '8a43fcfc28f7ba8e',
  anthropicVersion: '2023-06-01',
  anthropicBeta:
    'claude-code-20250219,oauth-2025-04-20,interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14',
  xApp: 'cli'
}

// 配置
const MIN_POOL_SIZE = parseInt(process.env.SENTRY_TRIPLET_POOL_MIN_SIZE || '3', 10)
const MAX_POOL_SIZE = parseInt(process.env.SENTRY_TRIPLET_POOL_MAX_SIZE || '20', 10)
const SWITCH_PROBABILITY = parseFloat(process.env.SENTRY_TRIPLET_SWITCH_PROBABILITY || '0.1')
const MIN_SWITCH_INTERVAL_MS = parseInt(
  process.env.SENTRY_TRIPLET_MIN_SWITCH_INTERVAL_MS || '300000',
  10
)

class ClaudeHeadersPoolService {
  constructor() {
    this.initialized = false
  }

  /**
   * 初始化配置池
   */
  async initialize() {
    if (this.initialized) {
      return
    }

    try {
      // 检查是否已有当前配置
      const current = await redisClient.get(REDIS_KEY_CURRENT)

      if (!current) {
        // 使用默认配置初始化
        const defaultConfigStr = JSON.stringify(DEFAULT_CONFIG)
        await redisClient.set(REDIS_KEY_CURRENT, defaultConfigStr)
        await redisClient.sadd(REDIS_KEY_AVAILABLE, defaultConfigStr)
        logger.info(
          `[ClaudeHeadersPool] Initialized with default config: session=${DEFAULT_CONFIG.session.substring(0, 8)}..., anthropic-beta=${DEFAULT_CONFIG.anthropicBeta.substring(0, 30)}...`
        )
      }

      this.initialized = true
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Initialization failed: ${error.message}`)
    }
  }

  /**
   * 从请求中提取完整的头部配置
   */
  extractConfig(req) {
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

      // 提取 anthropic 相关头部
      const anthropicVersion = req.headers['anthropic-version']
      const anthropicBeta = req.headers['anthropic-beta']
      const xApp = req.headers['x-app']

      // 验证基本格式
      if (!this.isValidConfig(sessionId, traceId, spanId, anthropicVersion, xApp)) {
        return null
      }

      return {
        session: sessionId,
        trace: traceId,
        span: spanId,
        anthropicVersion: anthropicVersion || '2023-06-01',
        anthropicBeta: anthropicBeta || '',
        xApp: xApp || 'cli'
      }
    } catch (error) {
      logger.debug(`[ClaudeHeadersPool] Failed to extract config: ${error.message}`)
      return null
    }
  }

  /**
   * 验证配置格式
   */
  isValidConfig(sessionId, traceId, spanId, anthropicVersion, xApp) {
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

    // anthropicVersion: 必须存在且格式为 YYYY-MM-DD
    if (!anthropicVersion || !/^\d{4}-\d{2}-\d{2}$/.test(anthropicVersion)) {
      return false
    }

    // xApp: 必须存在且非空
    if (!xApp || xApp.trim() === '') {
      return false
    }

    return true
  }

  /**
   * 从白名单请求收集完整配置
   */
  async collectFromWhitelist(req) {
    try {
      // 检查是否是白名单 API Key
      if (!req.apiKeyData?.collectSession) {
        return
      }

      // 提取完整配置
      const config = this.extractConfig(req)
      if (!config) {
        return
      }

      // 添加到池中
      await this.addToPool(config)

      logger.info(
        `[ClaudeHeadersPool] Collected config from whitelist API Key: ${req.apiKeyData.id} -> session=${config.session.substring(0, 8)}..., trace=${config.trace.substring(0, 8)}..., anthropic-beta=${config.anthropicBeta.substring(0, 30)}...`
      )
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to collect config: ${error.message}`)
    }
  }

  /**
   * 添加配置到池中
   */
  async addToPool(config) {
    await this.initialize()

    try {
      const configStr = JSON.stringify(config)

      // 检查池大小
      const currentSize = await redisClient.scard(REDIS_KEY_AVAILABLE)

      if (currentSize >= MAX_POOL_SIZE) {
        logger.debug(
          `[ClaudeHeadersPool] Pool is full (${currentSize}/${MAX_POOL_SIZE}), not adding new config`
        )
        return false
      }

      // 添加到池中（Set 会自动去重）
      const added = await redisClient.sadd(REDIS_KEY_AVAILABLE, configStr)

      if (added) {
        const newSize = await redisClient.scard(REDIS_KEY_AVAILABLE)
        logger.info(
          `[ClaudeHeadersPool] Added new config to pool: session=${config.session.substring(0, 8)}..., anthropic-beta=${config.anthropicBeta.substring(0, 30)}... (pool size: ${newSize})`
        )
        return true
      }

      return false
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to add config to pool: ${error.message}`)
      return false
    }
  }

  /**
   * 获取当前配置
   */
  async getCurrentConfig() {
    await this.initialize()

    try {
      const configStr = await redisClient.get(REDIS_KEY_CURRENT)
      if (configStr) {
        return JSON.parse(configStr)
      }
      return DEFAULT_CONFIG
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to get current config: ${error.message}`)
      return DEFAULT_CONFIG
    }
  }

  /**
   * 随机决定是否切换配置
   */
  async maybeSwitch() {
    await this.initialize()

    try {
      // 检查池大小
      const poolSize = await redisClient.scard(REDIS_KEY_AVAILABLE)
      if (poolSize < MIN_POOL_SIZE) {
        logger.debug(
          `[ClaudeHeadersPool] Pool size (${poolSize}) below minimum (${MIN_POOL_SIZE}), not switching`
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
            `[ClaudeHeadersPool] Too soon to switch (elapsed: ${elapsed}ms, min: ${MIN_SWITCH_INTERVAL_MS}ms)`
          )
          return false
        }
      }

      // 随机决定是否切换
      if (Math.random() > SWITCH_PROBABILITY) {
        return false
      }

      // 执行切换
      return await this.switchConfig()
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to check switch: ${error.message}`)
      return false
    }
  }

  /**
   * 切换到新的配置
   */
  async switchConfig() {
    await this.initialize()

    try {
      // 获取当前配置
      const currentStr = await redisClient.get(REDIS_KEY_CURRENT)

      // 获取所有可用配置
      const allConfigs = await redisClient.smembers(REDIS_KEY_AVAILABLE)

      if (allConfigs.length === 0) {
        logger.warn('[ClaudeHeadersPool] No configs available for switching')
        return false
      }

      // 过滤掉当前配置
      let availableConfigs = allConfigs
      if (currentStr && allConfigs.length > 1) {
        availableConfigs = allConfigs.filter((s) => s !== currentStr)
      }

      if (availableConfigs.length === 0) {
        availableConfigs = allConfigs
      }

      // 随机选择一个新配置
      const newConfigStr = availableConfigs[Math.floor(Math.random() * availableConfigs.length)]
      const newConfig = JSON.parse(newConfigStr)

      // 更新当前配置
      await redisClient.set(REDIS_KEY_CURRENT, newConfigStr)
      await redisClient.set(REDIS_KEY_LAST_SWITCH, Date.now().toString())

      const oldConfig = currentStr ? JSON.parse(currentStr) : null
      logger.info(
        `[ClaudeHeadersPool] Switched config: session ${oldConfig?.session.substring(0, 8) || 'default'}... → ${newConfig.session.substring(0, 8)}..., anthropic-beta ${oldConfig?.anthropicBeta.substring(0, 20) || 'default'}... → ${newConfig.anthropicBeta.substring(0, 20)}...`
      )

      return true
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to switch config: ${error.message}`)
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
      const allConfigs = await redisClient.smembers(REDIS_KEY_AVAILABLE)
      const configs = allConfigs.map((s) => JSON.parse(s))
      const lastSwitchStr = await redisClient.get(REDIS_KEY_LAST_SWITCH)
      const lastSwitchTime = lastSwitchStr ? parseInt(lastSwitchStr, 10) : null

      return {
        currentConfig: current,
        poolSize,
        configs,
        lastSwitchTime,
        config: {
          minPoolSize: MIN_POOL_SIZE,
          maxPoolSize: MAX_POOL_SIZE,
          switchProbability: SWITCH_PROBABILITY,
          minSwitchIntervalMs: MIN_SWITCH_INTERVAL_MS
        }
      }
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to get stats: ${error.message}`)
      throw error
    }
  }

  /**
   * 设置当前配置
   */
  async setCurrentConfig(config) {
    await this.initialize()

    try {
      if (
        !this.isValidConfig(
          config.session,
          config.trace,
          config.span,
          config.anthropicVersion,
          config.xApp
        )
      ) {
        throw new Error('Invalid config format')
      }

      const configStr = JSON.stringify(config)

      // 确保配置在池中
      await redisClient.sadd(REDIS_KEY_AVAILABLE, configStr)

      // 设置为当前
      await redisClient.set(REDIS_KEY_CURRENT, configStr)
      await redisClient.set(REDIS_KEY_LAST_SWITCH, Date.now().toString())

      logger.info(
        `[ClaudeHeadersPool] Set current config: session=${config.session.substring(0, 8)}..., anthropic-beta=${config.anthropicBeta.substring(0, 30)}...`
      )
      return true
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to set current config: ${error.message}`)
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
      logger.info('[ClaudeHeadersPool] Pool cleared')
      return true
    } catch (error) {
      logger.error(`[ClaudeHeadersPool] Failed to clear pool: ${error.message}`)
      throw error
    }
  }
}

// 单例
const claudeHeadersPoolService = new ClaudeHeadersPoolService()

module.exports = claudeHeadersPoolService
