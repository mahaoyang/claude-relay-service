#!/usr/bin/env node
/**
 * 测试 Sentry trace_id 和 span_id 生成
 * 验证同一个 session_id 生成相同的 trace_id 和 span_id
 */

const crypto = require('crypto')

function generateSentryTraceFromSession(sessionId) {
  const traceHash = crypto.createHash('sha256').update(`${sessionId}:trace`).digest('hex')
  const spanHash = crypto.createHash('sha256').update(`${sessionId}:span`).digest('hex')

  const traceId = traceHash.substring(0, 32) // 32 hex chars
  const spanId = spanHash.substring(0, 16) // 16 hex chars

  return `${traceId}-${spanId}`
}

function generateBaggage(traceId) {
  const version = '2.0.69'
  const publicKey = 'e531a1d9ec1de9064fae9d4affb0b0f4'

  return [
    `sentry-environment=external`,
    `sentry-release=${version}`,
    `sentry-public_key=${publicKey}`,
    `sentry-trace_id=${traceId}`
  ].join(',')
}

console.log('🧪 测试 Sentry Trace 生成\n')

// 测试1：确定性测试
const testSessionId = '93e286cd-afa3-44e8-b2b0-80303141b998'
console.log(`📋 测试 session_id: ${testSessionId}\n`)

const trace1 = generateSentryTraceFromSession(testSessionId)
const trace2 = generateSentryTraceFromSession(testSessionId)
const trace3 = generateSentryTraceFromSession(testSessionId)

console.log('✅ 确定性测试（同一session应生成相同trace）:')
console.log(`   第1次: ${trace1}`)
console.log(`   第2次: ${trace2}`)
console.log(`   第3次: ${trace3}`)
console.log(`   ✔️  结果: ${trace1 === trace2 && trace2 === trace3 ? '通过' : '失败'}`)

// 测试2：不同session生成不同trace
const testSessionId2 = '12345678-1234-1234-1234-123456789012'
const trace4 = generateSentryTraceFromSession(testSessionId2)

console.log(`\n✅ 唯一性测试（不同session应生成不同trace）:`)
console.log(`   Session 1: ${trace1}`)
console.log(`   Session 2: ${trace4}`)
console.log(`   ✔️  结果: ${trace1 !== trace4 ? '通过' : '失败'}`)

// 测试3：格式测试
console.log(`\n✅ 格式测试:`)
const parts = trace1.split('-')
console.log(`   trace_id 长度: ${parts[0].length} (期望: 32)`)
console.log(`   span_id 长度: ${parts[1].length} (期望: 16)`)
console.log(`   部分数量: ${parts.length} (期望: 2, 无sampled flag)`)
console.log(
  `   ✔️  结果: ${parts[0].length === 32 && parts[1].length === 16 && parts.length === 2 ? '通过' : '失败'}`
)

// 测试4：Baggage格式
console.log(`\n✅ Baggage 格式测试:`)
const baggage = generateBaggage(parts[0])
console.log(`   ${baggage}`)
console.log(
  `   包含 environment=external: ${baggage.includes('sentry-environment=external') ? '✔️' : '❌'}`
)
console.log(`   包含 release=2.0.69: ${baggage.includes('sentry-release=2.0.69') ? '✔️' : '❌'}`)
console.log(`   包含 public_key: ${baggage.includes('sentry-public_key=') ? '✔️' : '❌'}`)
console.log(`   包含 trace_id: ${baggage.includes(`sentry-trace_id=${parts[0]}`) ? '✔️' : '❌'}`)
console.log(`   不包含 sample_rate: ${!baggage.includes('sample_rate') ? '✔️' : '❌'}`)

console.log(`\n🎯 真实 Claude CLI 的 trace_id 和 span_id 示例:`)
console.log(`   trace_id: dbe8f02fb02240178c526d32300a1130`)
console.log(`   span_id: 9c5074991bd9738c`)
console.log(`   sentry-trace: dbe8f02fb02240178c526d32300a1130-9c5074991bd9738c`)

console.log(`\n💡 说明:`)
console.log(`   - 我们的实现使用 SHA-256(session_id + salt) 生成确定性的 trace_id 和 span_id`)
console.log(`   - 同一个 session_id 会始终生成相同的 trace_id 和 span_id`)
console.log(`   - 不同的 session_id 会生成不同的 trace_id 和 span_id`)
console.log(`   - 符合真实 Claude CLI 的行为模式`)
