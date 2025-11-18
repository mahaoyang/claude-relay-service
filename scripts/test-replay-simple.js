#!/usr/bin/env node

/**
 * Codex 重放攻击简单测试
 * 使用最小化的有效请求来测试重放攻击保护
 */

const axios = require('axios')
const crypto = require('crypto')

const API_KEY = process.env.REPLAY_API_KEY || process.argv[2]
const BASE_URL = process.env.REPLAY_URL || 'http://localhost:3010'

if (!API_KEY) {
  console.error('❌ 错误: 请提供 API Key')
  console.error('\n使用方法:')
  console.error('  REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-simple.js')
  console.error('  或')
  console.error('  node scripts/test-replay-simple.js "Bearer cr_xxxxx"')
  process.exit(1)
}

// 生成 UUID v7
function generateUUIDv7() {
  const timestamp = Date.now()
  const hex = timestamp.toString(16).padStart(12, '0')
  const random = crypto.randomBytes(10).toString('hex')

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-7${random.substring(0, 3)}-${random.substring(3, 7)}-${random.substring(7, 19)}`
}

// 创建一个最小化的有效 Codex 请求
function createTestRequest(_sessionId) {
  return {
    model: 'gpt-5.1-codex',
    stream: true, // Codex 要求必须使用流式
    messages: [
      {
        role: 'user',
        content: 'Hello, this is a replay attack test'
      }
    ]
  }
}

async function test() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Codex 重放攻击测试（简化版）')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 生成一个 session ID
  const sessionId = generateUUIDv7()
  console.log(`📝 生成测试 Session ID: ${sessionId}\n`)

  const request = createTestRequest(sessionId)
  const results = []

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 执行重放攻击（3 次相同请求）')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  for (let i = 1; i <= 3; i++) {
    console.log(`📤 请求 #${i}/3`)

    try {
      const startTime = Date.now()
      const response = await axios({
        method: 'POST',
        url: `${BASE_URL}/openai/responses`,
        headers: {
          authorization: API_KEY,
          'content-type': 'application/json',
          accept: 'text/event-stream', // 流式响应
          session_id: sessionId, // 使用相同的 session ID
          'user-agent': 'codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color'
        },
        responseType: 'stream', // 接收流式响应
        data: request,
        timeout: 10000,
        validateStatus: () => true
      })

      // 处理流式响应
      let responseData = ''
      if (
        response.status >= 200 &&
        response.status < 300 &&
        response.data &&
        typeof response.data.on === 'function'
      ) {
        await new Promise((resolve, reject) => {
          response.data.on('data', (chunk) => {
            responseData += chunk.toString()
          })
          response.data.on('end', resolve)
          response.data.on('error', reject)
          setTimeout(resolve, 5000) // 5秒超时
        })
      } else if (response.data && typeof response.data.on === 'function') {
        // 错误响应也可能是流
        await new Promise((resolve) => {
          response.data.on('data', (chunk) => {
            responseData += chunk.toString()
          })
          response.data.on('end', resolve)
          response.data.on('error', resolve)
          setTimeout(resolve, 2000)
        })
      } else {
        responseData = response.data
      }

      const duration = Date.now() - startTime

      results.push({
        attempt: i,
        status: response.status,
        statusText: response.statusText,
        duration,
        data: responseData
      })

      console.log(`   状态: ${response.status} ${response.statusText}`)
      console.log(`   耗时: ${duration}ms`)

      if (response.status >= 400) {
        const errorMsg =
          typeof responseData === 'string'
            ? responseData.substring(0, 150)
            : JSON.stringify(responseData).substring(0, 150)
        console.log(`   错误: ${errorMsg}`)
      } else if (response.status >= 200 && response.status < 300) {
        console.log(`   ✅ 请求成功`)
        const previewLen = Math.min(100, responseData.length)
        console.log(`   响应预览: ${responseData.substring(0, previewLen)}...`)
      }

      console.log('')

      // 延迟 500ms
      if (i < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}\n`)
      results.push({
        attempt: i,
        error: error.message
      })
    }
  }

  // 分析结果
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 测试结果分析')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const successCount = results.filter((r) => r.status >= 200 && r.status < 300).length
  const failCount = results.filter((r) => r.status >= 400 || r.error).length

  console.log(`总请求数: ${results.length}`)
  console.log(`成功 (2xx): ${successCount}`)
  console.log(`失败 (4xx/5xx): ${failCount}\n`)

  console.log('状态码分布:')
  const statusCodes = {}
  results.forEach((r) => {
    if (r.status) {
      statusCodes[r.status] = (statusCodes[r.status] || 0) + 1
    }
  })
  Object.entries(statusCodes).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} 次`)
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 重放攻击保护评估')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (successCount === 3) {
    console.log('⚠️  风险: 所有 3 个重放请求都成功！')
    console.log('⚠️  服务可能缺少重放攻击保护')
    console.log('⚠️  相同的 session_id 被接受了多次\n')
    console.log('建议:')
    console.log('  1. 实施 session_id 唯一性检查')
    console.log('  2. 记录已使用的 session_id（24小时过期）')
    console.log('  3. 拒绝重复的 session_id（返回 409 Conflict）\n')
  } else if (successCount === 1 && failCount === 2) {
    console.log('✅ 良好: 只有第一个请求成功')
    console.log('✅ 后续 2 个重放请求被拒绝')
    console.log('✅ 服务有重放攻击保护机制\n')

    // 检查拒绝的原因
    const rejectedReasons = results.filter((r) => r.status >= 400).map((r) => r.status)
    console.log(`拒绝状态码: ${[...new Set(rejectedReasons)].join(', ')}`)
  } else if (successCount > 1) {
    console.log('🟡 部分风险: 部分重放请求成功')
    console.log(`🟡 ${successCount} 个请求成功，${failCount} 个被拒绝`)
    console.log('🟡 可能有速率限制但非重放保护\n')
  } else {
    console.log('❓ 所有请求都失败了')
    console.log('❓ 可能是其他配置问题（API Key、账户等）\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

test().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
