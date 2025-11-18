#!/usr/bin/env node

/**
 * Codex 请求日志分析脚本
 * 分析不同客户端的请求差异
 */

const redis = require('../src/models/redis')
const fs = require('fs')

async function main() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Codex 请求日志分析')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const client = await redis.connect()
    const logs = await client.lrange('codex_request_logs', 0, 49)

    if (logs.length === 0) {
      console.log('⚠️  没有找到日志记录')
      console.log('\n提示：')
      console.log('  1. 确认服务正在运行')
      console.log('  2. 确认已发送一些 Codex 请求')
      console.log('  3. 日志在 Redis 中保存 2 小时\n')
      await redis.disconnect()
      return
    }

    console.log(`找到 ${logs.length} 条日志记录\n`)

    // 解析日志
    const parsedLogs = logs.map((log) => JSON.parse(log))

    // 按 user-agent 分组
    const byUserAgent = {}
    parsedLogs.forEach((log) => {
      const ua = log.requestHeaders['user-agent'] || 'unknown'
      if (!byUserAgent[ua]) {
        byUserAgent[ua] = []
      }
      byUserAgent[ua].push(log)
    })

    console.log('═══════════════════════════════════════════════════════')
    console.log('📊 客户端分组统计')
    console.log('═══════════════════════════════════════════════════════\n')

    Object.entries(byUserAgent).forEach(([ua, clientLogs], index) => {
      console.log(`🔹 客户端 #${index + 1}`)
      console.log(`   User-Agent: ${ua}`)
      console.log(`   请求数量: ${clientLogs.length}`)
      console.log(`   首次请求: ${clientLogs[clientLogs.length - 1].timestamp}`)
      console.log(`   最后请求: ${clientLogs[0].timestamp}`)

      // 提取关键差异
      const firstLog = clientLogs[0]
      console.log(`\n   📋 请求特征:`)
      console.log(`      Model: ${firstLog.requestBody.model || 'N/A'}`)
      console.log(`      Stream: ${firstLog.requestBody.stream}`)
      console.log(`      Version: ${firstLog.requestHeaders.version || 'N/A'}`)
      console.log(`      OpenAI-Beta: ${firstLog.requestHeaders['openai-beta'] || 'N/A'}`)
      console.log(
        `      Session ID: ${firstLog.requestHeaders['session_id'] || firstLog.requestBody.session_id || 'N/A'}`
      )

      console.log('')
    })

    // 详细对比分析
    console.log('═══════════════════════════════════════════════════════')
    console.log('🔍 请求头对比分析（用于并发伪装）')
    console.log('═══════════════════════════════════════════════════════\n')

    const clients = Object.entries(byUserAgent)
    if (clients.length >= 2) {
      const [client1, client2] = clients
      const [ua1, logs1] = client1
      const [ua2, logs2] = client2

      const sample1 = logs1[0]
      const sample2 = logs2[0]

      console.log('📌 关键差异点:\n')

      // User-Agent 对比
      console.log('1️⃣  User-Agent:')
      console.log(`   客户端1: ${ua1}`)
      console.log(`   客户端2: ${ua2}`)
      console.log(`   差异: ${ua1 === ua2 ? '相同 ✅' : '不同 ⚠️'}\n`)

      // Session ID 对比
      const session1 =
        sample1.requestHeaders['session_id'] || sample1.requestBody.session_id || null
      const session2 =
        sample2.requestHeaders['session_id'] || sample2.requestBody.session_id || null

      console.log('2️⃣  Session ID:')
      console.log(`   客户端1: ${session1 ? `${session1.substring(0, 32)}...` : 'N/A'}`)
      console.log(`   客户端2: ${session2 ? `${session2.substring(0, 32)}...` : 'N/A'}`)
      console.log(
        `   差异: ${session1 === session2 ? '相同 ⚠️（不应该相同）' : '不同 ✅（正常）'}\n`
      )

      // 请求体内容对比
      console.log('3️⃣  Instructions:')
      const inst1 = sample1.requestBody.instructions || ''
      const inst2 = sample2.requestBody.instructions || ''
      console.log(`   客户端1: ${inst1.substring(0, 60)}...`)
      console.log(`   客户端2: ${inst2.substring(0, 60)}...`)
      console.log(`   差异: ${inst1 === inst2 ? '相同 ✅' : '不同 ⚠️'}\n`)

      // 其他请求头对比
      console.log('4️⃣  其他请求头:')
      const headers1 = sample1.requestHeaders
      const headers2 = sample2.requestHeaders

      const compareHeaders = ['version', 'openai-beta', 'content-type', 'accept']
      compareHeaders.forEach((header) => {
        const v1 = headers1[header] || 'N/A'
        const v2 = headers2[header] || 'N/A'
        const same = v1 === v2
        console.log(`   ${header}:`)
        console.log(`      客户端1: ${v1}`)
        console.log(`      客户端2: ${v2}`)
        console.log(`      ${same ? '相同 ✅' : '不同 ⚠️'}`)
      })

      console.log('')
    }

    // 并发伪装建议
    console.log('═══════════════════════════════════════════════════════')
    console.log('💡 并发伪装建议')
    console.log('═══════════════════════════════════════════════════════\n')

    console.log('基于日志分析，以下是关键伪装点:\n')

    console.log('1️⃣  必须不同的字段（每个并发请求都要变）:')
    console.log('   • session_id - 会话标识符（UUID 格式）')
    console.log('   • x-session-id - 备用会话标识符')
    console.log('   • 请求内容（messages）')
    console.log('')

    console.log('2️⃣  应该相同的字段（保持一致）:')
    console.log('   • user-agent - 客户端标识')
    console.log('   • version - API 版本')
    console.log('   • openai-beta - Beta 功能标识')
    console.log('   • model - 模型名称')
    console.log('   • instructions - 系统指令')
    console.log('')

    console.log('3️⃣  可选变化的字段:')
    console.log('   • accept-language - 语言偏好')
    console.log('   • accept-encoding - 编码方式')
    console.log('')

    // 保存完整日志
    const outputPath = '/tmp/codex-logs-analysis.json'
    const detailedAnalysis = {
      summary: {
        totalRequests: logs.length,
        uniqueClients: Object.keys(byUserAgent).length,
        timestamp: new Date().toISOString()
      },
      clientGroups: Object.entries(byUserAgent).map(([ua, clientLogs]) => ({
        userAgent: ua,
        requestCount: clientLogs.length,
        firstRequest: clientLogs[clientLogs.length - 1].timestamp,
        lastRequest: clientLogs[0].timestamp,
        sampleRequest: clientLogs[0]
      })),
      allLogs: parsedLogs
    }

    fs.writeFileSync(outputPath, JSON.stringify(detailedAnalysis, null, 2))
    console.log(`✅ 完整分析已保存到: ${outputPath}`)
    console.log('')

    await redis.disconnect()
  } catch (error) {
    console.error('❌ 分析失败:', error)
    process.exit(1)
  }
}

main()
