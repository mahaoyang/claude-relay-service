// 简化版 Codex 伪装中间件
// 动态 session_id 管理 + User-Agent 伪装

const codexSessionPoolService = require('../services/codexSessionPoolService')

const USE_CODEX_SESSION_POOL = process.env.USE_CODEX_SESSION_POOL !== 'false' // 默认启用
const FALLBACK_SESSION_ID = process.env.CODEX_SESSION_ID || '019a9544-7ab1-73c1-837e-1fa681f4462b'
const CODEX_USER_AGENT = process.env.CODEX_USER_AGENT || 'codex_cli_rs/0.72.0' // 默认 UA

async function codexDisguiseMiddleware(req, res, next) {
  try {
    // 获取当前 session_id
    let sessionId
    if (USE_CODEX_SESSION_POOL) {
      // 随机决定是否切换 session
      await codexSessionPoolService.maybeSwitch()
      // 获取当前 session
      sessionId = await codexSessionPoolService.getCurrentSession()
    } else {
      // 使用环境变量或默认值
      sessionId = FALLBACK_SESSION_ID
    }

    // 注入 session_id 到请求头和请求体
    if (req.headers) {
      req.headers['session_id'] = sessionId
      // 伪装 User-Agent
      req.headers['user-agent'] = CODEX_USER_AGENT
    }

    if (req.body && typeof req.body === 'object') {
      req.body.session_id = sessionId
    }

    req.isCodexDisguised = true
  } catch (error) {
    // 遇到异常不阻塞请求，使用 fallback
    const fallbackId = FALLBACK_SESSION_ID
    if (req.headers) {
      req.headers['session_id'] = fallbackId
      req.headers['user-agent'] = CODEX_USER_AGENT
    }
    if (req.body && typeof req.body === 'object') {
      req.body.session_id = fallbackId
    }
  }

  return next()
}

module.exports = codexDisguiseMiddleware
