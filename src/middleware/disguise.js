// 简化版 Claude 伪装中间件
// 使用真实的 (session, trace, span) 三元组进行伪装

const sentryTripletPoolService = require('../services/sentryTripletPoolService')

const FIXED_CLAUDE_MACHINE_ID =
  process.env.DISGUISE_CLIENT_ID ||
  '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf'
const FIXED_CLAUDE_UA = process.env.DISGUISE_UA || 'claude-cli/2.0.69 (external, cli)'
const USE_SENTRY_TRIPLET_POOL = process.env.USE_SENTRY_TRIPLET_POOL !== 'false' // 默认启用

// Fallback 三元组（当池为空或禁用时使用）
const FALLBACK_TRIPLET = {
  session: process.env.DISGUISE_SESSION_ID || '9f10edbb-1407-47e1-9b85-fa634be33732',
  trace: '988f1b80178baa34cc02b67566c0269d',
  span: '8a43fcfc28f7ba8e'
}

function buildUserId(sessionId) {
  return `user_${FIXED_CLAUDE_MACHINE_ID}_account__session_${sessionId}`
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

    // 获取当前三元组 (session, trace, span)
    let triplet
    if (USE_SENTRY_TRIPLET_POOL) {
      // 随机决定是否切换三元组
      await sentryTripletPoolService.maybeSwitch()
      // 获取当前三元组
      triplet = await sentryTripletPoolService.getCurrentTriplet()
    } else {
      // 使用 fallback 三元组
      triplet = FALLBACK_TRIPLET
    }

    // 核心伪装字段：使用真实的三元组配对
    req.body.metadata.user_id = buildUserId(triplet.session)
    req.headers['user-agent'] = FIXED_CLAUDE_UA
    req.headers['sentry-trace'] = `${triplet.trace}-${triplet.span}`
    req.headers.baggage = generateBaggage(triplet.trace)

    req.isDisguised = true
  } catch (error) {
    // 遇到异常不阻塞请求，使用 fallback
    if (!req.body.metadata?.user_id) {
      req.body.metadata.user_id = buildUserId(FALLBACK_TRIPLET.session)
    }
    if (!req.headers['sentry-trace']) {
      req.headers['sentry-trace'] = `${FALLBACK_TRIPLET.trace}-${FALLBACK_TRIPLET.span}`
      req.headers.baggage = generateBaggage(FALLBACK_TRIPLET.trace)
    }
  }

  return next()
}

module.exports = disguiseMiddleware
