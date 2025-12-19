/**
 * 模型映射中间件
 * 将 Claude 模型请求按额度使用情况映射到指定的目标模型
 *
 * 用途：
 * - 成本控制：根据额度使用情况智能切换到低成本模型
 * - 测试：统一测试特定模型的行为
 * - 灰度发布：逐步切换到新模型
 *
 * 分段线性概率曲线（默认配置）：
 * - 0% 使用量 → 0% 概率映射
 * - 10% 使用量 → 80% 概率映射（拐点）
 * - 20% 使用量 → 100% 概率映射（封顶）
 * - 20%+ → 100% 概率映射
 *
 * Opus 禁用逻辑（OPUS_TO_SONNET_ENABLED=true 时）：
 * - Opus 模型 → 强制转换为 Sonnet 4.5
 * - Sonnet 模型 → 按概率映射到 Haiku
 * - Haiku 模型 → 直接通过
 */

const logger = require('../utils/logger')

// 默认目标模型
const DEFAULT_TARGET_MODEL = 'claude-haiku-4-5-20251001'
const DEFAULT_SONNET_MODEL = 'claude-sonnet-4-5-20250929'

// 从环境变量获取配置
const MODEL_MAPPER_ENABLED = process.env.MODEL_MAPPER_ENABLED === 'true'
const MODEL_MAPPER_TARGET = process.env.MODEL_MAPPER_TARGET || DEFAULT_TARGET_MODEL

// 分段线性概率配置
// 第一段：0% → INFLECTION_POINT 使用量，概率 0% → INFLECTION_PROB
// 第二段：INFLECTION_POINT → MAX_POINT 使用量，概率 INFLECTION_PROB → 100%
// 第三段：MAX_POINT 之后，概率 100%
const MODEL_MAPPER_INFLECTION_POINT = parseFloat(process.env.MODEL_MAPPER_INFLECTION_POINT) || 0.1
const MODEL_MAPPER_INFLECTION_PROB = parseFloat(process.env.MODEL_MAPPER_INFLECTION_PROB) || 0.8
const MODEL_MAPPER_MAX_POINT = parseFloat(process.env.MODEL_MAPPER_MAX_POINT) || 0.2

// Opus 转 Sonnet 开关（临时禁用 Opus）
const OPUS_TO_SONNET_ENABLED = process.env.OPUS_TO_SONNET_ENABLED === 'true'
const OPUS_TO_SONNET_TARGET = process.env.OPUS_TO_SONNET_TARGET || DEFAULT_SONNET_MODEL

// Claude 模型识别模式
const CLAUDE_MODEL_PATTERNS = [/^claude-/i, /^anthropic\./i]

// Opus 模型识别模式
const OPUS_MODEL_PATTERNS = [/opus/i]

// Haiku 模型识别模式
const HAIKU_MODEL_PATTERNS = [/haiku/i]

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
 * 检查是否为 Opus 模型
 * @param {string} model - 模型名称
 * @returns {boolean}
 */
function isOpusModel(model) {
  if (!model || typeof model !== 'string') {
    return false
  }
  return OPUS_MODEL_PATTERNS.some((pattern) => pattern.test(model))
}

/**
 * 检查是否为 Haiku 模型
 * @param {string} model - 模型名称
 * @returns {boolean}
 */
function isHaikuModel(model) {
  if (!model || typeof model !== 'string') {
    return false
  }
  return HAIKU_MODEL_PATTERNS.some((pattern) => pattern.test(model))
}

/**
 * 计算映射概率（分段线性）
 * @param {number} usedRatio - 已使用比例 (0-1)
 * @param {number} inflectionPoint - 拐点位置 (默认 0.1 即 10%)
 * @param {number} inflectionProb - 拐点概率 (默认 0.8 即 80%)
 * @param {number} maxPoint - 100%概率位置 (默认 0.2 即 20%)
 * @returns {number} 映射概率 (0-1)
 *
 * 曲线形状（默认配置）：
 * - 第一段：0% → 10%，概率 0% → 80%（陡峭）
 * - 第二段：10% → 20%，概率 80% → 100%（较陡）
 * - 第三段：20%+，概率 100%（封顶）
 */
function calculateMappingProbability(
  usedRatio,
  inflectionPoint = MODEL_MAPPER_INFLECTION_POINT,
  inflectionProb = MODEL_MAPPER_INFLECTION_PROB,
  maxPoint = MODEL_MAPPER_MAX_POINT
) {
  if (usedRatio <= 0) {
    return 0
  }
  if (usedRatio >= maxPoint) {
    return 1
  }

  if (usedRatio <= inflectionPoint) {
    // 第一段：0 → inflectionPoint，概率 0 → inflectionProb
    return (usedRatio / inflectionPoint) * inflectionProb
  } else {
    // 第二段：inflectionPoint → maxPoint，概率 inflectionProb → 1
    const remainingRatio = (usedRatio - inflectionPoint) / (maxPoint - inflectionPoint)
    return inflectionProb + remainingRatio * (1 - inflectionProb)
  }
}

/**
 * 模型映射中间件
 * 仅作用于 Claude 模型请求，根据额度使用情况按概率映射到配置的目标模型
 *
 * 当 OPUS_TO_SONNET_ENABLED=true 时：
 * - Opus 模型 → 强制转换为 Sonnet 4.5，然后走概率映射
 * - Sonnet 模型 → 按概率映射到 Haiku
 * - Haiku 模型 → 直接通过
 */
function modelMapper(req, res, next) {
  // 检查请求体中是否有 model 字段
  if (!req.body || !req.body.model) {
    return next()
  }

  let currentModel = req.body.model
  const originalModel = currentModel

  // 仅处理 Claude 模型
  if (!isClaudeModel(currentModel)) {
    return next()
  }

  // ============================================================
  // 第一步：Opus 强制转 Sonnet（当 OPUS_TO_SONNET_ENABLED=true 时）
  // ============================================================
  if (OPUS_TO_SONNET_ENABLED && isOpusModel(currentModel)) {
    currentModel = OPUS_TO_SONNET_TARGET
    req.body.model = currentModel
    req.originalModel = originalModel
    logger.info(
      `🚫 Opus blocked: ${originalModel} → ${currentModel} (API Key: ${req.apiKey?.id || 'unknown'})`
    )
  }

  // ============================================================
  // 第二步：概率映射（Sonnet → Haiku）
  // ============================================================
  // 检查是否启用概率映射
  if (!MODEL_MAPPER_ENABLED) {
    return next()
  }

  // Haiku 模型直接通过，不参与概率映射
  if (isHaikuModel(currentModel)) {
    return next()
  }

  // 如果已经是目标模型，跳过
  if (currentModel === MODEL_MAPPER_TARGET) {
    return next()
  }

  // 获取 API Key 的额度信息
  const totalCost = req.apiKey?.totalCost || 0
  const totalCostLimit = req.apiKey?.totalCostLimit || 0

  // 如果没有设置额度限制，按原逻辑直接映射
  if (totalCostLimit <= 0) {
    req.body.model = MODEL_MAPPER_TARGET
    if (!req.originalModel) req.originalModel = originalModel
    logger.info(
      `🔄 Model mapped (no limit): ${currentModel} → ${MODEL_MAPPER_TARGET} (API Key: ${req.apiKey?.id || 'unknown'})`
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
    if (!req.originalModel) req.originalModel = originalModel

    logger.info(
      `🔄 Model mapped: ${currentModel} → ${MODEL_MAPPER_TARGET} | ` +
        `Usage: ${(usedRatio * 100).toFixed(1)}%, Prob: ${(mappingProbability * 100).toFixed(1)}%, ` +
        `Roll: ${(random * 100).toFixed(1)}% (API Key: ${req.apiKey?.id || 'unknown'})`
    )
  } else {
    logger.debug(
      `🎯 Model kept: ${currentModel} | ` +
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
    // 分段线性配置
    inflectionPoint: MODEL_MAPPER_INFLECTION_POINT,
    inflectionProb: MODEL_MAPPER_INFLECTION_PROB,
    maxPoint: MODEL_MAPPER_MAX_POINT,
    // Opus 禁用配置
    opusToSonnetEnabled: OPUS_TO_SONNET_ENABLED,
    opusToSonnetTarget: OPUS_TO_SONNET_TARGET
  }
}

module.exports = {
  modelMapper,
  isClaudeModel,
  isOpusModel,
  isHaikuModel,
  getMapperConfig,
  calculateMappingProbability,
  DEFAULT_TARGET_MODEL,
  DEFAULT_SONNET_MODEL
}
