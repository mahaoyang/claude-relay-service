#!/usr/bin/env node
const axios = require('axios')

const API_KEY = 'Bearer cr_3bd37978972d2484da4c337cc0fbd602489ee8153cd3b44d6746b5f78fc62fde'
const BASE_URL = 'http://localhost:3010'

// 使用相同的 session_id 发送 3 次请求
const SESSION_ID = '019a95b0-test-replay-attack-12345'

async function test() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Codex 重放攻击测试')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`Session ID: ${SESSION_ID}\n`)

  const results = []

  for (let i = 1; i <= 3; i++) {
    console.log(`📤 请求 #${i}/3`)

    const startTime = Date.now()
    try {
      const response = await axios({
        method: 'POST',
        url: `${BASE_URL}/openai/responses`,
        headers: {
          authorization: API_KEY,
          'content-type': 'application/json',
          accept: 'text/event-stream',
          session_id: SESSION_ID,
          'user-agent': 'codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color'
        },
        data: {
          model: 'gpt-5.1-codex',
          stream: true,
          instructions: 'You are a test assistant for replay attack testing.',
          input: [
            {
              role: 'user',
              content: 'Hello, this is a replay attack test'
            }
          ]
        },
        timeout: 10000,
        validateStatus: () => true,
        responseType: 'stream'
      })

      let responseData = ''
      if (response.data && typeof response.data.on === 'function') {
        await new Promise((resolve) => {
          response.data.on('data', (chunk) => {
            responseData += chunk.toString()
          })
          response.data.on('end', resolve)
          response.data.on('error', resolve)
          setTimeout(resolve, 3000)
        })
      }

      const duration = Date.now() - startTime

      results.push({
        attempt: i,
        status: response.status,
        duration,
        success: response.status >= 200 && response.status < 300
      })

      console.log(`   状态: ${response.status} ${response.statusText}`)
      console.log(`   耗时: ${duration}ms`)

      if (response.status >= 400) {
        console.log(`   错误: ${responseData.substring(0, 150)}`)
      } else if (response.status >= 200 && response.status < 300) {
        console.log(`   ✅ 请求成功`)
        // 显示响应内容前200个字符
        if (responseData) {
          console.log(`   响应预览: ${responseData.substring(0, 200)}...`)
        }
      }
      console.log('')

      if (i < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      const duration = Date.now() - startTime
      results.push({
        attempt: i,
        error: error.message,
        duration,
        success: false
      })
      console.log(`   ❌ 失败: ${error.message}`)
      console.log(`   耗时: ${duration}ms\n`)
    }
  }

  // 分析结果
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 测试结果')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const successCount = results.filter((r) => r.success).length
  const failCount = results.filter((r) => !r.success).length

  console.log(`总请求: ${results.length}`)
  console.log(`成功 (2xx): ${successCount}`)
  console.log(`失败: ${failCount}\n`)

  const statusCodes = {}
  results.forEach((r) => {
    if (r.status) {
      statusCodes[r.status] = (statusCodes[r.status] || 0) + 1
    }
  })

  if (Object.keys(statusCodes).length > 0) {
    console.log('状态码:')
    Object.entries(statusCodes).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} 次`)
    })
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 重放攻击保护评估')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (successCount === 3) {
    console.log('⚠️⚠️⚠️  所有 3 个重放请求都成功！')
    console.log('⚠️  服务缺少重放攻击保护')
    console.log('⚠️  相同 session_id 被接受多次\n')
  } else if (successCount === 1 && failCount === 2) {
    console.log('✅✅✅  只有第一个请求成功')
    console.log('✅  后续重放请求被拒绝')
    console.log('✅  服务有重放攻击保护\n')
  } else if (successCount > 1) {
    console.log(`🟡 部分成功: ${successCount}/3`)
    console.log('🟡 可能有速率限制\n')
  } else {
    console.log('❌ 所有请求失败')
    console.log('原因: 请求格式或配置问题\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

test().catch((error) => {
  console.error('Fatal:', error.message)
  process.exit(1)
})
