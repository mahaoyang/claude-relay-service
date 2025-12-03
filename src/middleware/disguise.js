// 简化版 Claude 伪装中间件
// 固定 user_id + UA + sentry-trace + baggage，降低指纹差异

const crypto = require('crypto')

const FIXED_CLAUDE_SESSION_ID =
  process.env.DISGUISE_SESSION_ID || '9f10edbb-1407-47e1-9b85-fa634be33732'
const FIXED_CLAUDE_MACHINE_ID =
  process.env.DISGUISE_CLIENT_ID ||
  '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf'
const FIXED_CLAUDE_UA = process.env.DISGUISE_UA || 'claude-cli/2.0.42 (external, cli)'

function buildUserId() {
  return `user_${FIXED_CLAUDE_MACHINE_ID}_account__session_${FIXED_CLAUDE_SESSION_ID}`
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
  const version = (match && match[1]) || '2.0.42'
  const release = encodeURIComponent(`claude-cli@${version}`)
  return [
    `sentry-environment=production`,
    `sentry-release=${release}`,
    `sentry-trace_id=${traceId}`,
    `sentry-sample_rate=1`
  ].join(',')
}

function disguiseMiddleware(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object' || !req.headers) {
      return next()
    }

    if (!req.body.metadata || typeof req.body.metadata !== 'object') {
      req.body.metadata = {}
    }

    // 核心伪装字段
    req.body.metadata.user_id = buildUserId()
    req.headers['user-agent'] = FIXED_CLAUDE_UA

    const sentryTrace = generateSentryTrace()
    req.headers['sentry-trace'] = sentryTrace
    req.headers.baggage = generateBaggage(sentryTrace.split('-')[0])

    req.isDisguised = true
  } catch (error) {
    // 遇到异常不阻塞请求
  }

  return next()
}

module.exports = disguiseMiddleware
