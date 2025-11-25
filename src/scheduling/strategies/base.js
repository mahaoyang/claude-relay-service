/**
 * 调度策略基类
 *
 * 所有调度策略都需要实现这个接口
 */

class BaseSchedulingStrategy {
  constructor(name) {
    this.name = name
  }

  /**
   * 从候选账户中选择一个
   * @param {Array} candidates - 候选账户列表，每个账户包含 { accountId, accountType, priority, ... }
   * @param {Object} context - 上下文信息 { apiKey, sessionHash, requestedModel }
   * @returns {Promise<Object|null>} - 选中的账户，或 null 表示无可用账户
   */
  async select(_candidates, _context) {
    throw new Error('select() must be implemented by subclass')
  }

  /**
   * 请求完成后的回调（用于更新状态）
   * @param {string} accountId
   * @param {boolean} success
   * @param {Object} details - { statusCode, errorCode, ... }
   */
  async onRequestComplete(_accountId, _success, _details = {}) {
    // 默认空实现，子类可选择覆盖
  }
}

module.exports = BaseSchedulingStrategy
