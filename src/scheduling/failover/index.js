/**
 * 故障转移模块
 *
 * 提供请求级别的自动重试和账户降级能力
 * 当一个账户请求失败时，自动尝试其他可用账户
 */

const logger = require('../../utils/logger')
const { isRetryable, getDefaultConfig } = require('./retryPolicy')
const scheduling = require('../index')

/**
 * 检查是否启用故障转移
 */
function isEnabled() {
  return getDefaultConfig().enabled
}

/**
 * 获取配置
 */
function getConfig() {
  return getDefaultConfig()
}

/**
 * 故障转移上下文
 * 用于在重试过程中跟踪状态
 */
class FailoverContext {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || getDefaultConfig().maxRetries
    this.attempt = 0
    this.excludedAccounts = new Set()
    this.errors = []
    this.startTime = Date.now()
  }

  /**
   * 记录失败的账户
   */
  recordFailure(accountId, error, statusCode) {
    this.excludedAccounts.add(accountId)
    this.errors.push({
      accountId,
      error: error?.message || String(error),
      statusCode,
      attempt: this.attempt,
      timestamp: Date.now()
    })

    // 更新健康分
    if (scheduling.isEnabled()) {
      scheduling.recordResult(accountId, false, { statusCode, errorCode: error?.code })
    }
  }

  /**
   * 记录成功
   */
  recordSuccess(accountId, statusCode) {
    if (scheduling.isEnabled()) {
      scheduling.recordResult(accountId, true, { statusCode })
    }
  }

  /**
   * 检查是否可以继续重试
   */
  canRetry() {
    return this.attempt < this.maxRetries
  }

  /**
   * 增加尝试次数
   */
  incrementAttempt() {
    this.attempt++
  }

  /**
   * 获取已排除的账户ID列表
   */
  getExcludedAccounts() {
    return Array.from(this.excludedAccounts)
  }

  /**
   * 获取摘要信息
   */
  getSummary() {
    return {
      totalAttempts: this.attempt,
      excludedAccounts: this.getExcludedAccounts(),
      errors: this.errors,
      duration: Date.now() - this.startTime
    }
  }
}

/**
 * 从候选账户中过滤掉已排除的账户
 * @param {Array} candidates - 候选账户列表
 * @param {Set} excludedIds - 已排除的账户ID集合
 * @returns {Array}
 */
function filterExcludedAccounts(candidates, excludedIds) {
  if (!excludedIds || excludedIds.size === 0) {
    return candidates
  }
  return candidates.filter((acc) => !excludedIds.has(acc.accountId))
}

/**
 * 执行带故障转移的操作
 *
 * @param {Object} options
 * @param {Function} options.selectAccount - 选择账户的函数，接收 excludedIds 参数
 * @param {Function} options.executeRequest - 执行请求的函数，接收 account 参数
 * @param {Function} options.onRetry - 重试时的回调（可选）
 * @param {number} options.maxRetries - 最大重试次数（可选）
 * @returns {Promise<{result: any, context: FailoverContext}>}
 */
async function executeWithFailover(options) {
  const { selectAccount, executeRequest, onRetry, maxRetries } = options

  const context = new FailoverContext({ maxRetries })

  // eslint-disable-next-line no-constant-condition
  while (true) {
    context.incrementAttempt()

    // 选择账户（排除之前失败的）
    let account
    try {
      account = await selectAccount(context.excludedAccounts)
    } catch (selectError) {
      // 无法选择账户（可能所有账户都被排除了）
      logger.error('[Failover] Failed to select account:', selectError.message)
      throw selectError
    }

    if (!account) {
      const error = new Error('No available accounts for failover')
      error.code = 'NO_AVAILABLE_ACCOUNTS'
      error.failoverContext = context.getSummary()
      throw error
    }

    logger.info(
      `[Failover] Attempt ${context.attempt}/${context.maxRetries + 1}: ` +
        `using account ${account.accountId} (${account.accountType})`
    )

    // 执行请求
    try {
      const result = await executeRequest(account)

      // 检查结果中的状态码
      const statusCode = result?.statusCode || result?.status
      if (statusCode && statusCode >= 200 && statusCode < 300) {
        context.recordSuccess(account.accountId, statusCode)
      } else if (statusCode && statusCode >= 400) {
        // 返回了错误状态码，但没有抛出异常
        const { retryable, reason } = isRetryable(null, statusCode)

        context.recordFailure(account.accountId, { message: reason }, statusCode)

        if (retryable && context.canRetry()) {
          logger.warn(
            `[Failover] Request returned ${statusCode} (${reason}), will retry with different account`
          )
          if (onRetry) {
            await onRetry(account, { statusCode, reason }, context)
          }
          continue
        }
      }

      // 成功或不可重试，返回结果
      return { result, context }
    } catch (error) {
      const statusCode = error?.statusCode || error?.status || error?.response?.status
      const { retryable, reason } = isRetryable(error, statusCode)

      context.recordFailure(account.accountId, error, statusCode)

      logger.warn(
        `[Failover] Request failed: ${error.message} (${reason}), ` +
          `retryable: ${retryable}, attempts: ${context.attempt}/${context.maxRetries + 1}`
      )

      if (retryable && context.canRetry()) {
        if (onRetry) {
          await onRetry(account, error, context)
        }
        continue
      }

      // 不可重试或已达最大次数
      error.failoverContext = context.getSummary()
      throw error
    }
  }
}

/**
 * 创建一个包装了故障转移逻辑的调度器
 *
 * @param {Object} scheduler - 原始调度器（如 unifiedClaudeScheduler）
 * @returns {Object} 包装后的调度器
 */
function wrapSchedulerWithFailover(scheduler) {
  return {
    ...scheduler,

    /**
     * 带故障转移的账户选择
     * 返回一个可以多次调用的选择器
     */
    createFailoverSelector(apiKeyData, sessionHash, requestedModel, getAllCandidates) {
      return async (excludedIds) => {
        // 获取所有候选账户
        const allCandidates = await getAllCandidates()

        // 过滤已排除的账户
        const availableCandidates = filterExcludedAccounts(allCandidates, excludedIds)

        if (availableCandidates.length === 0) {
          return null
        }

        // 使用调度策略选择
        if (scheduling.isEnabled()) {
          return scheduling.selectAccount(availableCandidates, {
            apiKey: apiKeyData,
            sessionHash,
            requestedModel
          })
        }

        // 回退到原始排序逻辑
        const sorted = scheduler._sortAccountsByPriority(availableCandidates)
        return sorted[0]
      }
    }
  }
}

module.exports = {
  isEnabled,
  getConfig,
  isRetryable,
  executeWithFailover,
  wrapSchedulerWithFailover,
  filterExcludedAccounts,
  FailoverContext
}
