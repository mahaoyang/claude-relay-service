/**
 * 账户健康分管理
 *
 * 健康分范围: 0-100
 * - 初始值: 100
 * - 成功请求: +2 (上限100)
 * - 429 限流: -30
 * - 529 过载: -20
 * - 401/403 ��证错误: -50
 * - 超时/网络错误: -15
 * - 时间衰减: 每小时 +5 (自愈，上限100)
 * - 最低保底: 5 (永不归零，保留探测机会)
 */

const redis = require('../models/redis')
const logger = require('../utils/logger')

// 默认配置
const DEFAULT_CONFIG = {
  initialScore: 100,
  maxScore: 100,
  minScore: 5, // 保底分，永远有探测机会
  decayHours: 1, // 每小时恢复
  decayAmount: 5, // 每次恢复的分数

  // 扣分规则
  penalties: {
    rate_limit: 30, // 429
    overload: 20, // 529
    auth_error: 50, // 401/403
    timeout: 15, // 超时
    network_error: 15, // 网络错误
    server_error: 10 // 5xx
  },

  // 加分规则
  rewards: {
    success: 2 // 请求成功
  }
}

class HealthScoreManager {
  constructor() {
    this.keyPrefix = 'account:health:'
    this.config = this._loadConfig()
  }

  _loadConfig() {
    const envConfig = {
      minScore: parseInt(process.env.SCHEDULING_MIN_HEALTH_SCORE) || DEFAULT_CONFIG.minScore,
      decayHours: parseInt(process.env.SCHEDULING_HEALTH_DECAY_HOURS) || DEFAULT_CONFIG.decayHours
    }

    return { ...DEFAULT_CONFIG, ...envConfig }
  }

  _getKey(accountId) {
    return `${this.keyPrefix}${accountId}`
  }

  /**
   * 获取账户健康分
   * @param {string} accountId
   * @returns {Promise<{score: number, lastUpdated: string, lastDecay: string}>}
   */
  async getScore(accountId) {
    try {
      const key = this._getKey(accountId)
      const data = await redis.get(key)

      if (!data) {
        // 新账户，返回初始分数
        return {
          score: this.config.initialScore,
          lastUpdated: new Date().toISOString(),
          lastDecay: new Date().toISOString()
        }
      }

      const parsed = JSON.parse(data)

      // 应用时间衰减恢复
      const decayedScore = this._applyDecay(parsed)

      return decayedScore
    } catch (error) {
      logger.error(`[HealthScore] Failed to get score for ${accountId}:`, error)
      // 出错时返回默认分数，不影响调度
      return {
        score: this.config.initialScore,
        lastUpdated: new Date().toISOString(),
        lastDecay: new Date().toISOString()
      }
    }
  }

  /**
   * 批量获取多���账户的健康分
   * @param {string[]} accountIds
   * @returns {Promise<Map<string, number>>}
   */
  async getScores(accountIds) {
    const scores = new Map()

    if (!accountIds || accountIds.length === 0) {
      return scores
    }

    try {
      // 并行获取所有账户的健康分
      const now = new Date()
      const promises = accountIds.map(async (accountId) => {
        try {
          const key = this._getKey(accountId)
          const data = await redis.get(key)

          if (!data) {
            return { accountId, score: this.config.initialScore }
          }

          const parsed = JSON.parse(data)
          const decayed = this._applyDecay(parsed, now)
          return { accountId, score: decayed.score }
        } catch {
          return { accountId, score: this.config.initialScore }
        }
      })

      const results = await Promise.all(promises)

      for (const { accountId, score } of results) {
        scores.set(accountId, score)
      }
    } catch (error) {
      logger.error('[HealthScore] Failed to batch get scores:', error)
      // 出错时全部返回默认分数
      for (const id of accountIds) {
        scores.set(id, this.config.initialScore)
      }
    }

    return scores
  }

  /**
   * 应用时间衰减恢复
   */
  _applyDecay(data, now = new Date()) {
    const lastDecay = new Date(data.lastDecay || data.lastUpdated)
    const hoursSinceDecay = (now - lastDecay) / (1000 * 60 * 60)

    // 计算应该恢复的次数
    const decayIntervals = Math.floor(hoursSinceDecay / this.config.decayHours)

    if (decayIntervals > 0 && data.score < this.config.maxScore) {
      const recoveredScore = Math.min(
        this.config.maxScore,
        data.score + decayIntervals * this.config.decayAmount
      )

      return {
        score: recoveredScore,
        lastUpdated: data.lastUpdated,
        lastDecay: now.toISOString()
      }
    }

    return data
  }

  /**
   * 记录请求成功
   */
  async recordSuccess(accountId) {
    return this._adjustScore(accountId, this.config.rewards.success, 'success')
  }

  /**
   * 记录请求失败
   * @param {string} accountId
   * @param {'rate_limit'|'overload'|'auth_error'|'timeout'|'network_error'|'server_error'} errorType
   */
  async recordFailure(accountId, errorType) {
    const penalty = this.config.penalties[errorType] || this.config.penalties.server_error
    return this._adjustScore(accountId, -penalty, errorType)
  }

  /**
   * 根据 HTTP 状态码记录结果
   * @param {string} accountId
   * @param {number} statusCode
   * @param {string} [errorCode] 可选的错误代码
   */
  async recordByStatusCode(accountId, statusCode, errorCode = null) {
    if (statusCode >= 200 && statusCode < 300) {
      return this.recordSuccess(accountId)
    }

    let errorType = 'server_error'

    if (statusCode === 429) {
      errorType = 'rate_limit'
    } else if (statusCode === 529) {
      errorType = 'overload'
    } else if (statusCode === 401 || statusCode === 403) {
      errorType = 'auth_error'
    } else if (statusCode === 408 || errorCode === 'ETIMEDOUT' || errorCode === 'TIMEOUT') {
      errorType = 'timeout'
    } else if (
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'ENETUNREACH'
    ) {
      errorType = 'network_error'
    }

    return this.recordFailure(accountId, errorType)
  }

  /**
   * 内部方法：调整分数
   */
  async _adjustScore(accountId, delta, reason) {
    try {
      const key = this._getKey(accountId)
      const current = await this.getScore(accountId)

      let newScore = current.score + delta

      // 限制范围
      newScore = Math.max(this.config.minScore, Math.min(this.config.maxScore, newScore))

      const newData = {
        score: newScore,
        lastUpdated: new Date().toISOString(),
        lastDecay: current.lastDecay,
        lastReason: reason,
        lastDelta: delta
      }

      // 设置��期时间为7天（如果账户长期不用，自动清理）
      await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(newData))

      if (delta < 0) {
        logger.warn(
          `[HealthScore] Account ${accountId} score: ${current.score} -> ${newScore} (${reason}, ${delta})`
        )
      } else {
        logger.debug(
          `[HealthScore] Account ${accountId} score: ${current.score} -> ${newScore} (${reason}, +${delta})`
        )
      }

      return newData
    } catch (error) {
      logger.error(`[HealthScore] Failed to adjust score for ${accountId}:`, error)
      // 不抛出错误，避免影响主流程
      return null
    }
  }

  /**
   * 重置账户健康分（管理员操作）
   */
  async resetScore(accountId) {
    try {
      const key = this._getKey(accountId)
      const newData = {
        score: this.config.initialScore,
        lastUpdated: new Date().toISOString(),
        lastDecay: new Date().toISOString(),
        lastReason: 'manual_reset',
        lastDelta: 0
      }

      await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(newData))

      logger.info(`[HealthScore] Account ${accountId} score reset to ${this.config.initialScore}`)

      return newData
    } catch (error) {
      logger.error(`[HealthScore] Failed to reset score for ${accountId}:`, error)
      throw error
    }
  }

  /**
   * 删除健康分记录
   */
  async deleteScore(accountId) {
    try {
      const key = this._getKey(accountId)
      await redis.del(key)
      logger.info(`[HealthScore] Deleted health score for account ${accountId}`)
    } catch (error) {
      logger.error(`[HealthScore] Failed to delete score for ${accountId}:`, error)
    }
  }

  /**
   * 获取所有健康分数据（用于管理界面）
   */
  async getAllScores() {
    try {
      const pattern = `${this.keyPrefix}*`
      const keys = await redis.keys(pattern)

      const scores = []
      for (const key of keys) {
        const accountId = key.replace(this.keyPrefix, '')
        const data = await this.getScore(accountId)
        scores.push({
          accountId,
          ...data
        })
      }

      return scores
    } catch (error) {
      logger.error('[HealthScore] Failed to get all scores:', error)
      return []
    }
  }
}

// 单例导出
module.exports = new HealthScoreManager()
