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

/**
 * 基于 session_id 生成确定性的 trace_id 和 span_id
 * 这样同一个 session 的所有请求都使用相同的 trace_id 和 span_id
 *
 * 真实 Claude CLI 行为：
 * - trace_id 和 span_id 在同一 session 中固定不变
 * - sentry-trace 格式: "trace_id-span_id" (无 sampled flag)
 */
function generateSentryTraceFromSession(sessionId) {
  // 使用 SHA-256 生成确定性的 trace_id 和 span_id
  const traceHash = crypto.createHash('sha256').update(`${sessionId}:trace`).digest('hex')
  const spanHash = crypto.createHash('sha256').update(`${sessionId}:span`).digest('hex')

  const traceId = traceHash.substring(0, 32) // 32 hex chars
  const spanId = spanHash.substring(0, 16) // 16 hex chars

  return `${traceId}-${spanId}` // 注意：无 -1 后缀
}

/**
 * 生成 Baggage 头
 *
 * 真实 Claude CLI 格式：
 * sentry-environment=external,sentry-release=2.0.69,sentry-public_key=xxx,sentry-trace_id=xxx
 */
function generateBaggage(traceId) {
  const match = FIXED_CLAUDE_UA.match(/claude-cli\/([0-9.]+)/)
  const version = (match && match[1]) || '2.0.69'
  const publicKey = process.env.SENTRY_PUBLIC_KEY || 'e531a1d9ec1de9064fae9d4affb0b0f4'

  return [
    `sentry-environment=external`, // 真实值是 external，不是 production
    `sentry-release=${version}`, // 真实值是 2.0.69，不是 claude-cli@2.0.69
    `sentry-public_key=${publicKey}`,
    `sentry-trace_id=${traceId}`
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

    // 基于 session_id 生成确定性的 sentry-trace 和 baggage
    // 这样同一个 session 的所有请求都使用相同的 trace_id 和 span_id
    const sentryTrace = generateSentryTraceFromSession(sessionId)
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
