// 简化版 Codex 伪装中间件
// 固定 session_id，统一下游指纹

const FIXED_CODEX_SESSION_ID =
  process.env.CODEX_SESSION_ID || '019a9544-7ab1-73c1-837e-1fa681f4462b'

function codexDisguiseMiddleware(req, res, next) {
  try {
    if (req.headers) {
      req.headers['session_id'] = FIXED_CODEX_SESSION_ID
    }

    if (req.body && typeof req.body === 'object') {
      req.body.session_id = FIXED_CODEX_SESSION_ID
    }

    req.isCodexDisguised = true
  } catch (error) {
    // 遇到异常不阻塞请求
  }

  return next()
}

module.exports = codexDisguiseMiddleware
