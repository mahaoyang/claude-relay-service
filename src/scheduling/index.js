/**
 * 调度模块统一入口
 *
 * 提供可插拔的调度策略切换能力
 * 通过环境变量 SCHEDULING_STRATEGY 控制使用哪种策略：
 * - 'binary': 原有二元策略（默认）
 * - 'probabilistic': 概率权重策略
 */

const logger = require('../utils/logger')
const healthScore = require('./healthScore')
const BinaryStrategy = require('./strategies/binary')
const ProbabilisticStrategy = require('./strategies/probabilistic')

// 策略注册表
const strategies = {
  binary: BinaryStrategy,
  probabilistic: ProbabilisticStrategy
}

// 当前策略实例缓存
let currentStrategy = null
let currentStrategyName = null

/**
 * 获取配置的策略名称
 */
function getStrategyName() {
  return process.env.SCHEDULING_STRATEGY || 'binary'
}

/**
 * 检查是否启用了非默认调度策略
 */
function isEnabled() {
  const strategyName = getStrategyName()
  return strategyName !== 'binary' && !!strategies[strategyName]
}

/**
 * 获取当前调度策略实例
 */
function getStrategy() {
  const strategyName = getStrategyName()

  // 策略未变，返回缓存
  if (currentStrategy && currentStrategyName === strategyName) {
    return currentStrategy
  }

  const StrategyClass = strategies[strategyName]

  if (!StrategyClass) {
    logger.warn(`[Scheduling] Unknown strategy: ${strategyName}, falling back to binary`)
    currentStrategy = new BinaryStrategy()
    currentStrategyName = 'binary'
  } else {
    currentStrategy = new StrategyClass()
    currentStrategyName = strategyName
    logger.info(`[Scheduling] Using strategy: ${strategyName}`)
  }

  return currentStrategy
}

/**
 * 从候选账户中选择一个
 *
 * @param {Array} candidates - 候选账户列表（已经过基础过滤）
 * @param {Object} context - 上下文 { apiKey, sessionHash, requestedModel }
 * @returns {Promise<Object|null>}
 */
async function selectAccount(candidates, context) {
  const strategy = getStrategy()
  return strategy.select(candidates, context)
}

/**
 * 记录请求结果（用于更新健康分等状态）
 *
 * @param {string} accountId
 * @param {boolean} success
 * @param {Object} details - { statusCode, errorCode, ... }
 */
async function recordResult(accountId, success, details = {}) {
  const strategy = getStrategy()
  return strategy.onRequestComplete(accountId, success, details)
}

/**
 * 直接获取健康分管理器（用于管理接口）
 */
function getHealthScoreManager() {
  return healthScore
}

/**
 * 获取所有可用策略名称
 */
function getAvailableStrategies() {
  return Object.keys(strategies)
}

/**
 * 获取当前策略信息
 */
function getStatus() {
  const strategyName = getStrategyName()
  const failover = require('./failover')
  return {
    enabled: isEnabled(),
    strategy: strategyName,
    available: Object.keys(strategies),
    failover: {
      enabled: failover.isEnabled(),
      maxRetries: failover.getConfig().maxRetries
    }
  }
}

// 延迟加载 failover 模块，避免循环依赖
let _failover = null
function getFailover() {
  if (!_failover) {
    _failover = require('./failover')
  }
  return _failover
}

module.exports = {
  isEnabled,
  getStrategy,
  getStrategyName,
  selectAccount,
  recordResult,
  getHealthScoreManager,
  getAvailableStrategies,
  getStatus,
  // 直接导出健康分管理器，方便使用
  healthScore,
  // 故障转移模块
  get failover() {
    return getFailover()
  }
}
