// 简化版 Claude 伪装中间件
// 动态 user_id (session pool) + UA + sentry-trace + baggage，降低指纹差异

const crypto = require('crypto')
const sessionPoolService = require('../services/sessionPoolService')

const FIXED_CLAUDE_MACHINE_ID =
  process.env.DISGUISE_CLIENT_ID ||
  '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf'
const FIXED_CLAUDE_UA = process.env.DISGUISE_UA || 'claude-cli/2.0.69 (external, cli)'
const USE_SESSION_POOL = process.env.USE_SESSION_POOL !== 'false' // 默认启用

function buildUserId(sessionId) {
  return `user_${FIXED_CLAUDE_MACHINE_ID}_account__session_${sessionId}`
}

function generateHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex')
}

function generateSentryTrace() {
  const traceId = generateHex(16) // 32 hex chars
  const spanId = generateHex(8) // 16 hex chars
  return `${traceId}-${spanId}-1`
}

function generateBaggage(traceId) {
  const match = FIXED_CLAUDE_UA.match(/claude-cli\/([0-9.]+)/)
  const version = (match && match[1]) || '2.0.69'
  const release = encodeURIComponent(`claude-cli@${version}`)
  return [
    `sentry-environment=production`,
    `sentry-release=${release}`,
    `sentry-trace_id=${traceId}`,
    `sentry-sample_rate=1`
  ].join(',')
}

async function disguiseMiddleware(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object' || !req.headers) {
      return next()
    }

    if (!req.body.metadata || typeof req.body.metadata !== 'object') {
      req.body.metadata = {}
    }

    // 获取当前 session_id (从池中或 fallback)
    let sessionId
    if (USE_SESSION_POOL) {
      // 随机决定是否切换 session
      await sessionPoolService.maybeSwitch()
      // 获取当前 session
      sessionId = await sessionPoolService.getCurrentSession()
    } else {
      // 使用环境变量或默认值
      sessionId = process.env.DISGUISE_SESSION_ID || '9f10edbb-1407-47e1-9b85-fa634be33732'
    }

    // 核心伪装字段
    req.body.metadata.user_id = buildUserId(sessionId)
    req.headers['user-agent'] = FIXED_CLAUDE_UA

    const sentryTrace = generateSentryTrace()
    req.headers['sentry-trace'] = sentryTrace
    req.headers.baggage = generateBaggage(sentryTrace.split('-')[0])

    req.isDisguised = true
  } catch (error) {
    // 遇到异常不阻塞请求，使用 fallback
    if (!req.body.metadata?.user_id) {
      const fallbackSessionId =
        process.env.DISGUISE_SESSION_ID || '9f10edbb-1407-47e1-9b85-fa634be33732'
      req.body.metadata.user_id = buildUserId(fallbackSessionId)
    }
  }

  return next()
}

module.exports = disguiseMiddleware
