/**
 * 概率权重调度策略
 *
 * 基于账户健康分进行加权随机选择
 * - 健康分高的账户被选中概率大
 * - 健康分低的账户仍有小概率被选中（用于探测恢复）
 * - 权重 = 健康分^2（平方拉大差距）
 */

const BaseSchedulingStrategy = require('./base')
const healthScore = require('../healthScore')
const logger = require('../../utils/logger')

class ProbabilisticStrategy extends BaseSchedulingStrategy {
  constructor() {
    super('probabilistic')
    this.exponent = parseFloat(process.env.SCHEDULING_WEIGHT_EXPONENT) || 2
  }

  /**
   * 基于健康分加权随机选择账户
   */
  async select(candidates, _context) {
    if (!candidates || candidates.length === 0) {
      return null
    }

    // 只有一个候选，直接返回
    if (candidates.length === 1) {
      return candidates[0]
    }

    // 批量获取健康分
    const accountIds = candidates.map((c) => c.accountId)
    const scores = await healthScore.getScores(accountIds)

    // 计算权重
    const weights = candidates.map((candidate) => {
      const score = scores.get(candidate.accountId) || 100
      // 权重 = 分数^指数，拉大高低分差距
      return Math.pow(score, this.exponent)
    })

    const totalWeight = weights.reduce((sum, w) => sum + w, 0)

    if (totalWeight === 0) {
      // 极端情况：所有权重为0，随机选一个
      logger.warn('[ProbabilisticStrategy] All weights are 0, falling back to random')
      return candidates[Math.floor(Math.random() * candidates.length)]
    }

    // 加权随机选择
    const random = Math.random() * totalWeight
    let cumulative = 0

    for (let i = 0; i < candidates.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        const selected = candidates[i]
        const score = scores.get(selected.accountId)
        const probability = ((weights[i] / totalWeight) * 100).toFixed(1)

        logger.debug(
          `[ProbabilisticStrategy] Selected ${selected.accountId} (${selected.accountType}) - ` +
            `score: ${score}, probability: ${probability}%, candidates: ${candidates.length}`
        )

        return selected
      }
    }

    // 理论上不会到这里，保险返回最后一个
    return candidates[candidates.length - 1]
  }

  /**
   * 请求完成后更新健康分
   */
  async onRequestComplete(accountId, success, details = {}) {
    const { statusCode, errorCode } = details

    if (success || (statusCode >= 200 && statusCode < 300)) {
      await healthScore.recordSuccess(accountId)
    } else if (statusCode) {
      await healthScore.recordByStatusCode(accountId, statusCode, errorCode)
    }
  }
}

module.exports = ProbabilisticStrategy
