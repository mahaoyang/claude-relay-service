/**
 * 模型映射中间件
 * 将 Claude 模型请求按额度使用情况映射到指定的目标模型
 *
 * 用途：
 * - 成本控制：根据额度使用情况智能切换到低成本模型
 * - 测试：统一测试特定模型的行为
 * - 灰度发布：逐步切换到新模型
 *
 * 额度感知逻辑：
 * - 前 10% 额度：不做映射，使用原始模型
 * - 10%-100% 额度：按概率映射，概率随使用比例线性增加
 *   - 10% 使用量 → 0% 概率映射
 *   - 55% 使用量 → 50% 概率映射
 *   - 100% 使用量 → 100% 概率映射
 */

const logger = require('../utils/logger')

// 默认目标模型
const DEFAULT_TARGET_MODEL = 'claude-haiku-4-5-20251001'

// 从环境变量获取配置
const MODEL_MAPPER_ENABLED = process.env.MODEL_MAPPER_ENABLED === 'true'
const MODEL_MAPPER_TARGET = process.env.MODEL_MAPPER_TARGET || DEFAULT_TARGET_MODEL
// 开始映射的阈值（默认 0.1 即 10%）
const MODEL_MAPPER_THRESHOLD = parseFloat(process.env.MODEL_MAPPER_THRESHOLD) || 0.1

// Claude 模型识别模式
const CLAUDE_MODEL_PATTERNS = [/^claude-/i, /^anthropic\./i]

/**
 * 检查是否为 Claude 模型
 * @param {string} model - 模型名称
 * @returns {boolean}
 */
function isClaudeModel(model) {
  if (!model || typeof model !== 'string') {
    return false
  }
  return CLAUDE_MODEL_PATTERNS.some((pattern) => pattern.test(model))
}

/**
 * 计算映射概率
 * @param {number} usedRatio - 已使用比例 (0-1)
 * @param {number} threshold - 开始映射的阈值 (默认 0.1)
 * @returns {number} 映射概率 (0-1)
 */
function calculateMappingProbability(usedRatio, threshold = MODEL_MAPPER_THRESHOLD) {
  // 未达到阈值，不映射
  if (usedRatio < threshold) {
    return 0
  }
  // 超过阈值，线性增加概率
  // 公式: (usedRatio - threshold) / (1 - threshold)
  // 例如 threshold=0.1: 10%→0%, 55%→50%, 100%→100%
  return (usedRatio - threshold) / (1 - threshold)
}

/**
 * 模型映射中间件
 * 仅作用于 Claude 模型请求，根据额度使用情况按概率映射到配置的目标模型
 */
function modelMapper(req, res, next) {
  // 检查是否启用
  if (!MODEL_MAPPER_ENABLED) {
    return next()
  }

  // 检查请求体中是否有 model 字段
  if (!req.body || !req.body.model) {
    return next()
  }

  const originalModel = req.body.model

  // 仅处理 Claude 模型
  if (!isClaudeModel(originalModel)) {
    return next()
  }

  // 如果已经是目标模型，跳过
  if (originalModel === MODEL_MAPPER_TARGET) {
    return next()
  }

  // 获取 API Key 的额度信息
  const totalCost = req.apiKey?.totalCost || 0
  const totalCostLimit = req.apiKey?.totalCostLimit || 0

  // 如果没有设置额度限制，按原逻辑直接映射
  if (totalCostLimit <= 0) {
    req.body.model = MODEL_MAPPER_TARGET
    req.originalModel = originalModel
    logger.info(
      `🔄 Model mapped (no limit): ${originalModel} → ${MODEL_MAPPER_TARGET} (API Key: ${req.apiKey?.id || 'unknown'})`
    )
    return next()
  }

  // 计算使用比例
  const usedRatio = Math.min(totalCost / totalCostLimit, 1)

  // 计算映射概率
  const mappingProbability = calculateMappingProbability(usedRatio)

  // 按概率决定是否映射
  const random = Math.random()
  const shouldMap = random < mappingProbability

  if (shouldMap) {
    // 执行映射
    req.body.model = MODEL_MAPPER_TARGET
    req.originalModel = originalModel

    logger.info(
      `🔄 Model mapped: ${originalModel} → ${MODEL_MAPPER_TARGET} | ` +
        `Usage: ${(usedRatio * 100).toFixed(1)}%, Prob: ${(mappingProbability * 100).toFixed(1)}%, ` +
        `Roll: ${(random * 100).toFixed(1)}% (API Key: ${req.apiKey?.id || 'unknown'})`
    )
  } else {
    logger.debug(
      `🎯 Model kept: ${originalModel} | ` +
        `Usage: ${(usedRatio * 100).toFixed(1)}%, Prob: ${(mappingProbability * 100).toFixed(1)}%, ` +
        `Roll: ${(random * 100).toFixed(1)}% (API Key: ${req.apiKey?.id || 'unknown'})`
    )
  }

  next()
}

/**
 * 获取当前映射配置
 * @returns {object}
 */
function getMapperConfig() {
  return {
    enabled: MODEL_MAPPER_ENABLED,
    targetModel: MODEL_MAPPER_TARGET,
    threshold: MODEL_MAPPER_THRESHOLD
  }
}

module.exports = {
  modelMapper,
  isClaudeModel,
  getMapperConfig,
  calculateMappingProbability,
  DEFAULT_TARGET_MODEL
}
