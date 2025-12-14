// Claude 伪装中间件 - 完整版
// 使用真实的完整请求头配置（session, trace, span, anthropic-version, anthropic-beta, x-app）

const claudeHeadersPoolService = require('../services/sentryTripletPoolService')
const fs = require('fs')
const path = require('path')

const DEBUG_LOG_PATH = path.join(__dirname, '../../logs/disguise-debug.log')

function debugLog(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}`

  // 线上环境（Vercel等只读文件系统）使用 console.log
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    console.log('[DISGUISE]', logMessage)
  } else {
    // 本地开发环境写文件
    try {
      fs.appendFileSync(DEBUG_LOG_PATH, `${logMessage}\n`)
    } catch (err) {
      console.log('[DISGUISE]', logMessage)
    }
  }
}

const DISGUISE_ENABLED = process.env.DISGUISE_ENABLED !== 'false' // 默认启用
const FIXED_CLAUDE_MACHINE_ID =
  process.env.DISGUISE_CLIENT_ID ||
  '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf'
const FIXED_CLAUDE_UA = process.env.DISGUISE_UA || 'claude-cli/2.0.69 (external, cli)'
const USE_CLAUDE_HEADERS_POOL = process.env.USE_SENTRY_TRIPLET_POOL !== 'false' // 默认启用（保持环境变量兼容）

// Fallback 完整配置（当池为空或禁用时使用）
const FALLBACK_CONFIG = {
  session: process.env.DISGUISE_SESSION_ID || '9f10edbb-1407-47e1-9b85-fa634be33732',
  trace: '988f1b80178baa34cc02b67566c0269d',
  span: '8a43fcfc28f7ba8e',
  anthropicVersion: '2023-06-01',
  anthropicBeta:
    'claude-code-20250219,oauth-2025-04-20,interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14',
  xApp: 'cli'
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
  // 如果伪装功能被禁用，直接跳过
  if (!DISGUISE_ENABLED) {
    debugLog('Middleware disabled, skipping')
    return next()
  }

  debugLog('=== Middleware started ===')

  try {
    if (!req.body || typeof req.body !== 'object' || !req.headers) {
      debugLog('Invalid req.body or req.headers, skipping')
      return next()
    }

    if (!req.body.metadata || typeof req.body.metadata !== 'object') {
      req.body.metadata = {}
    }

    // 获取当前完整配置 (session, trace, span, anthropic-version, anthropic-beta, x-app)
    let config
    if (USE_CLAUDE_HEADERS_POOL) {
      // 随机决定是否切换配置
      await claudeHeadersPoolService.maybeSwitch()
      // 获取当前配置
      config = await claudeHeadersPoolService.getCurrentConfig()
    } else {
      // 使用 fallback 配置
      config = FALLBACK_CONFIG
    }

    // ========================================
    // 最小伪装模式：只修改身份标识，其他完全透传
    // ========================================
    // 1. 修改 user_id（从 session 构建）
    req.body.metadata.user_id = buildUserId(config.session)

    // 2. 修改 UA
    req.headers['user-agent'] = FIXED_CLAUDE_UA

    // 3. 修改 sentry-trace 和 baggage（从 trace + span 构建）
    req.headers['sentry-trace'] = `${config.trace}-${config.span}`
    req.headers.baggage = generateBaggage(config.trace)

    // 其他字段（anthropic-version、anthropic-beta、x-app）完全透传，不修改

    debugLog(`Minimal disguise applied: session=${config.session.substring(0, 8)}...`)

    req.isDisguised = true
  } catch (error) {
    // 遇到异常不阻塞请求，使用 fallback
    if (!req.body.metadata?.user_id) {
      req.body.metadata.user_id = buildUserId(FALLBACK_CONFIG.session)
    }
    if (!req.headers['sentry-trace']) {
      req.headers['sentry-trace'] = `${FALLBACK_CONFIG.trace}-${FALLBACK_CONFIG.span}`
      req.headers.baggage = generateBaggage(FALLBACK_CONFIG.trace)
    }
    if (!req.headers['anthropic-version']) {
      req.headers['anthropic-version'] = FALLBACK_CONFIG.anthropicVersion
    }
    if (!req.headers['anthropic-beta']) {
      req.headers['anthropic-beta'] = FALLBACK_CONFIG.anthropicBeta
    }
    if (!req.headers['x-app']) {
      req.headers['x-app'] = FALLBACK_CONFIG.xApp
    }
  }

  return next()
}

module.exports = disguiseMiddleware
