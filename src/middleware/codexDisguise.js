/**
 * Codex 请求伪装中间件
 * 将多个下游用户伪装成单一上游身份
 *
 * 功能：
 * - 仅修改 session_id 请求头
 * - 模型字段完全透传，不做任何修改
 * - 其他请求体字段保持不变
 */

const codexDisguiseHelper = require('../utils/codexDisguiseHelper')
const logger = require('../utils/logger')

/**
 * Codex 伪装中间件
 * 在请求到达转发服务前应用伪装
 *
 * 流程：
 * 1. 提取真实 session_id（来自请求头）
 * 2. 池未满时添加到池
 * 3. 从池中选择当日 session_id
 * 4. 应用伪装（仅修改 session_id 请求头）
 *
 * 注意：
 * - 模型字段透传，不做修改
 * - 请求体不做任何修改
 */
async function codexDisguiseMiddleware(req, res, next) {
  // 如果未启用伪装，直接跳过
  if (!codexDisguiseHelper.CODEX_DISGUISE_CONFIG.enabled) {
    return next()
  }

  // 只处理有 headers 的请求
  if (!req.headers) {
    return next()
  }

  try {
    // 保存原始数据用于日志
    const originalSessionId = req.headers['session_id']

    // 应用伪装（包含收集和选择逻辑）
    const disguisedHeaders = await codexDisguiseHelper.disguiseCodexRequest(req.headers)

    // 更新请求头
    Object.assign(req.headers, disguisedHeaders)

    // 标记请求已伪装
    req.isCodexDisguised = true

    const disguiseInfo = await codexDisguiseHelper.getCodexDisguiseInfo()

    logger.info(`🎭 Codex request disguised`, {
      originalSessionId: originalSessionId ? `${originalSessionId.substring(0, 20)}...` : 'N/A',
      disguisedSessionId: disguiseInfo.todaySessionId,
      poolStatus: `${disguiseInfo.sessionPool.size}/${disguiseInfo.sessionPool.maxSize}`,
      model: req.body?.model || 'N/A' // 记录模型但不修改
    })
  } catch (error) {
    logger.error(`❌ Codex disguise middleware error: ${error.message}`, error)
    // 发生错误时不阻塞请求，继续处理
  }

  next()
}

module.exports = codexDisguiseMiddleware
