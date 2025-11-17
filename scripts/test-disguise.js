#!/usr/bin/env node

/**
 * 测试伪装功能
 */

const disguiseHelper = require('../src/utils/disguiseHelper')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

// 测试用的原始请求
const originalRequest = {
  body: {
    model: 'claude-sonnet-4-5-20250929',
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello' }]
      }
    ],
    metadata: {
      user_id: 'user_abc123_account__session_xyz789'
    },
    max_tokens: 4096
  },
  headers: {
    'user-agent': 'claude-cli/2.0.42 (external, cli)',
    'sentry-trace': 'original-trace-id-123456789',
    baggage: 'sentry-environment=external,sentry-release=2.0.42',
    'x-app': 'cli'
  }
}

console.log(`${colors.bright}\n🎭 伪装功能测试\n${colors.reset}`)

// 1. 显示伪装配置
log(colors.cyan, '='.repeat(80))
log(colors.cyan, '📋 伪装配置')
log(colors.cyan, '='.repeat(80))

const disguiseInfo = disguiseHelper.getDisguiseInfo()
console.log(
  '\n启用状态:',
  disguiseInfo.enabled ? `${colors.green}✓ 已启用` : `${colors.red}✗ 未启用`,
  colors.reset
)

if (disguiseInfo.enabled) {
  console.log('\n固定客户端ID (WSL):')
  log(colors.yellow, `  ${disguiseInfo.clientId}`)

  console.log('\n可用会话ID池 (3个):')
  disguiseHelper.DISGUISE_CONFIG.sessionIds.forEach((id, idx) => {
    const isCurrent = id === disguiseInfo.todaySessionId
    log(
      isCurrent ? colors.green : colors.reset,
      `  [${idx + 1}] ${id}${isCurrent ? ' ← 今日选中' : ''}`
    )
  })

  console.log('\n今日信息:')
  log(colors.blue, `  日期: ${disguiseInfo.date}`)
  log(colors.green, `  选中会话ID: ${disguiseInfo.todaySessionId}`)
  log(colors.cyan, `  伪装user_id: ${disguiseInfo.todayUserId}`)
}

// 2. 测试伪装
log(colors.cyan, `\n${'='.repeat(80)}`)
log(colors.cyan, '🔄 伪装转换测试')
log(colors.cyan, '='.repeat(80))

console.log('\n原始请求:')
log(colors.yellow, `  user_id: ${originalRequest.body.metadata.user_id}`)
log(colors.yellow, `  sentry-trace: ${originalRequest.headers['sentry-trace']}`)
log(colors.yellow, `  baggage: ${originalRequest.headers.baggage}`)

const { body: disguisedBody, headers: disguisedHeaders } = disguiseHelper.disguiseRequest(
  originalRequest.body,
  originalRequest.headers
)

console.log('\n伪装后请求:')
log(colors.green, `  user_id: ${disguisedBody.metadata.user_id}`)
log(colors.green, `  sentry-trace: ${disguisedHeaders['sentry-trace']}`)
log(colors.green, `  baggage: ${disguisedHeaders.baggage}`)

// 3. 测试多次调用的一致性
log(colors.cyan, `\n${'='.repeat(80)}`)
log(colors.cyan, '🔁 多次调用一致性测试')
log(colors.cyan, '='.repeat(80))

console.log('\n同一天内多次调用应该使用相同的sessionId，但不同的sentry-trace:')

for (let i = 1; i <= 3; i++) {
  const { body, headers } = disguiseHelper.disguiseRequest(
    originalRequest.body,
    originalRequest.headers
  )
  const sessionMatch = body.metadata.user_id.match(/session_([a-f0-9-]{36})/)
  const sessionId = sessionMatch ? sessionMatch[1] : 'unknown'

  console.log(`\n  调用 ${i}:`)
  log(colors.blue, `    sessionId: ${sessionId}`)
  log(colors.yellow, `    sentry-trace: ${headers['sentry-trace']}`)
}

// 4. 验证格式
log(colors.cyan, `\n${'='.repeat(80)}`)
log(colors.cyan, '✅ 格式验证')
log(colors.cyan, '='.repeat(80))

const userIdPattern = /^user_[a-f0-9]{64}_account__session_[a-f0-9-]{36}$/
const sentryTracePattern = /^[a-f0-9]{32}-[a-f0-9]{16}$/

const isUserIdValid = userIdPattern.test(disguisedBody.metadata.user_id)
const isSentryTraceValid = sentryTracePattern.test(disguisedHeaders['sentry-trace'])

console.log(
  '\nuser_id格式:',
  isUserIdValid ? `${colors.green}✓ 有效` : `${colors.red}✗ 无效`,
  colors.reset
)
console.log(
  'sentry-trace格式:',
  isSentryTraceValid ? `${colors.green}✓ 有效` : `${colors.red}✗ 无效`,
  colors.reset
)

// 5. 使用说明
log(colors.cyan, `\n${'='.repeat(80)}`)
log(colors.cyan, '📖 使用说明')
log(colors.cyan, '='.repeat(80))

console.log('\n要启用伪装功能，在 .env 中添加:')
log(colors.yellow, '  DISGUISE_ENABLED=true')

console.log('\n伪装规则:')
console.log('  • 固定使用 WSL 的客户端ID')
console.log('  • 从3个会话ID中，每天基于日期hash选择1个')
console.log('  • 每个请求生成新的 sentry-trace 和 baggage')
console.log('  • 不影响原始请求，只在转发给上游时应用')

console.log('\n每日会话ID轮换:')
console.log('  • 每天00:00自动切换到新的会话ID')
console.log('  • 基于SHA256(日期)确定性选择')
console.log('  • 保证同一天内所有请求使用相同sessionId')

log(colors.cyan, `\n${'='.repeat(80)}\n`)
