/**
 * 二元调度策略（包装原有逻辑）
 *
 * 这是对现有调度逻辑的包装，不改变原有行为：
 * - 账户要么可用，要么不可用
 * - 按优先级和最后使用时间排序
 * - 选择第一个可用的账户
 *
 * 此策略作为默认/回退策略，确保与原逻辑完全兼容
 */

const BaseSchedulingStrategy = require('./base')
const logger = require('../../utils/logger')

class BinaryStrategy extends BaseSchedulingStrategy {
  constructor() {
    super('binary')
  }

  /**
   * 按原有逻辑选择账户（优先级 + 最后使用时间）
   * 注意：candidates 已经是经过 unifiedClaudeScheduler 过滤的可用账户
   */
  async select(candidates, _context) {
    if (!candidates || candidates.length === 0) {
      return null
    }

    // 按优先级（升序，数字小优先级高）和最后使用时间（升序，优先用久未使用的）排序
    const sorted = [...candidates].sort((a, b) => {
      // 优先级比较（数字越小越优先）
      const priorityA = parseInt(a.priority) || 50
      const priorityB = parseInt(b.priority) || 50

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // 优先级相同，比较最后使用时间（越早越优先）
      const lastUsedA = a.lastUsedAt || '0'
      const lastUsedB = b.lastUsedAt || '0'

      return lastUsedA.localeCompare(lastUsedB)
    })

    const selected = sorted[0]

    logger.debug(
      `[BinaryStrategy] Selected ${selected.accountId} (${selected.accountType}) - ` +
        `priority: ${selected.priority}, candidates: ${candidates.length}`
    )

    return selected
  }

  /**
   * 二元策略不需要更新健康分
   */
  async onRequestComplete(_accountId, _success, _details = {}) {
    // 不做任何事，保持原有行为
  }
}

module.exports = BinaryStrategy
