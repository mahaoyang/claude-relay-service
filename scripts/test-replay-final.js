#!/usr/bin/env node

/**
 * Codex 重放攻击最终测试
 * 直接从 Redis 获取最新请求并重放（不截断字段）
 */

const axios = require('axios')

const API_KEY = process.env.REPLAY_API_KEY || process.argv[2]
const BASE_URL = process.env.REPLAY_URL || 'http://localhost:3010'

async function test() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 Codex 重放攻击最终测试')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (!API_KEY) {
      console.error('❌ 错误: 请提供 API Key')
      console.error('使用: REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-final.js\n')
      process.exit(1)
    }

    // 从 Redis 获取完整的原始请求数据（非日志，而是实际数据）
    // 我们需要手动构造一个符合 Codex 格式的请求
    console.log('📝 构造 Codex 请求...\n')

    const sessionId = '019a9570-test-replay-attack-test123'

    const codexRequest = {
      model: 'gpt-5.1-codex',
      stream: true
      // Codex 可能不需要其他字段就能工作，或者需要完整的 instructions
    }

    const headers = {
      authorization: API_KEY,
      'content-type': 'application/json',
      accept: 'text/event-stream',
      session_id: sessionId,
      'user-agent': 'codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color'
    }

    console.log(`Session ID: ${sessionId}`)
    console.log(`Model: ${codexRequest.model}`)
    console.log(`Stream: ${codexRequest.stream}\n`)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚀 执行重放攻击 (3次)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const results = []

    for (let i = 1; i <= 3; i++) {
      console.log(`📤 请求 #${i}/3`)

      const startTime = Date.now()
      try {
        const response = await axios({
          method: 'POST',
          url: `${BASE_URL}/openai/responses`,
          headers,
          data: codexRequest,
          timeout: 15000,
          validateStatus: () => true,
          responseType: 'stream'
        })

        // 收集响应数据
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
          statusText: response.statusText,
          duration,
          data: responseData.substring(0, 200)
        })

        console.log(`   状态: ${response.status} ${response.statusText}`)
        console.log(`   耗时: ${duration}ms`)

        if (response.status >= 400) {
          console.log(`   错误: ${responseData.substring(0, 150)}`)
        } else if (response.status >= 200 && response.status < 300) {
          console.log(`   ✅ 请求成功!`)
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
          duration
        })
        console.log(`   ❌ 失败: ${error.message}`)
        console.log(`   耗时: ${duration}ms\n`)
      }
    }

    // 分析结果
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 测试结果')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const successCount = results.filter((r) => r.status >= 200 && r.status < 300).length
    const failCount = results.filter((r) => r.status >= 400 || r.error).length

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
      console.log('建议: 添加 session_id 唯一性检查\n')
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

      // 显示具体错误
      results.forEach((r) => {
        if (r.data || r.error) {
          console.log(`请求 #${r.attempt}: ${r.data || r.error}`)
        }
      })
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('Fatal:', error.message)
    process.exit(1)
  }
}

test()
