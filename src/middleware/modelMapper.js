/**
 * 模型映射中间件
 * 将所有 Claude 模型请求映射到指定的目标模型
 *
 * 用途：
 * - 成本控制：强制所有请求使用较低成本的模型
 * - 测试：统一测试特定模型的行为
 * - 灰度发布：逐步切换到新模型
 */

const logger = require('../utils/logger')

// 默认目标模型
const DEFAULT_TARGET_MODEL = 'claude-haiku-4-5-20251001'

// 从环境变量获取配置
const MODEL_MAPPER_ENABLED = process.env.MODEL_MAPPER_ENABLED === 'true'
const MODEL_MAPPER_TARGET = process.env.MODEL_MAPPER_TARGET || DEFAULT_TARGET_MODEL

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
 * 模型映射中间件
 * 仅作用于 Claude 模型请求，将其映射到配置的目标模型
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

  // 执行映射
  req.body.model = MODEL_MAPPER_TARGET

  // 保存原始模型信息供后续使用（如日志记录）
  req.originalModel = originalModel

  logger.info(
    `🔄 Model mapped: ${originalModel} → ${MODEL_MAPPER_TARGET} (API Key: ${req.apiKey?.id || 'unknown'})`
  )

  next()
}

/**
 * 获取当前映射配置
 * @returns {object}
 */
function getMapperConfig() {
  return {
    enabled: MODEL_MAPPER_ENABLED,
    targetModel: MODEL_MAPPER_TARGET
  }
}

module.exports = {
  modelMapper,
  isClaudeModel,
  getMapperConfig,
  DEFAULT_TARGET_MODEL
}
