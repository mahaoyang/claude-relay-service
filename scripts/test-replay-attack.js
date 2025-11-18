#!/usr/bin/env node

/**
 * Codex 重放攻击测试脚本
 *
 * 用途：测试服务是否能检测和防御重放攻击
 *
 * 测试内容：
 * 1. 从 Redis 读取真实的 Codex 请求
 * 2. 重放这些请求到服务器
 * 3. 观察服务器响应
 * 4. 分析是否有重放攻击保护
 *
 * 使用方法：
 *   node scripts/test-replay-attack.js [选项]
 *
 * 选项：
 *   --url <url>           目标 URL（默认: http://localhost:3010）
 *   --count <number>      重放次数（默认: 3）
 *   --delay <ms>          请求间隔（默认: 1000ms）
 *   --concurrent          并发重放（同时发送）
 */

const redis = require('../src/models/redis')
const axios = require('axios')

class ReplayAttackTester {
  constructor(options = {}) {
    this.baseUrl = options.url || 'http://localhost:3010'
    this.replayCount = options.count || 3
    this.delay = options.delay || 1000
    this.concurrent = options.concurrent || false
    this.results = []
  }

  async run() {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔄 Codex 重放攻击测试')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      // 1. 从 Redis 获取真实请求
      console.log('📥 步骤 1: 从 Redis 获取捕获的请求...\n')
      const client = await redis.connect()
      const logs = await client.lrange('codex_request_logs', 0, 0) // 获取最新的一条

      if (logs.length === 0) {
        console.log('⚠️  没有找到捕获的请求')
        console.log('\n提示：')
        console.log('  1. 确认已启用日志记录: CODEX_REQUEST_LOGGING=true')
        console.log('  2. 先发送一些真实的 Codex 请求')
        console.log('  3. 然后再运行此脚本\n')
        await redis.disconnect()
        return
      }

      const originalRequest = JSON.parse(logs[0])
      console.log('✅ 找到请求记录')
      console.log(`   时间: ${originalRequest.timestamp}`)
      console.log(`   URL: ${originalRequest.url}`)
      console.log(`   Model: ${originalRequest.requestBody.model}`)
      console.log(`   Session ID: ${originalRequest.requestHeaders['session_id']}\n`)

      await redis.disconnect()

      // 2. 构建重放请求
      console.log('🔧 步骤 2: 构建重放请求...\n')
      const replayRequest = this.buildReplayRequest(originalRequest)
      console.log('✅ 请求已构建')
      console.log(`   目标 URL: ${this.baseUrl}${originalRequest.url}`)
      console.log(`   重放次数: ${this.replayCount}`)
      console.log(`   模式: ${this.concurrent ? '并发' : '顺序'}`)
      console.log(`   延迟: ${this.delay}ms\n`)

      // 3. 执行重放攻击
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 步骤 3: 执行重放攻击...')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      if (this.concurrent) {
        await this.replayConcurrent(replayRequest, originalRequest.url)
      } else {
        await this.replaySequential(replayRequest, originalRequest.url)
      }

      // 4. 分析结果
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 步骤 4: 分析结果')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      this.analyzeResults()

      // 5. 安全建议
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💡 安全建议')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      this.printSecurityAdvice()
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
      if (error.response) {
        console.error('   状态码:', error.response.status)
        console.error('   响应:', error.response.data)
      }
      process.exit(1)
    }
  }

  buildReplayRequest(originalRequest) {
    // 完全复制原始请求（包括 session_id）
    const headers = {}

    // 复制所有请求头（除了 authorization，我们用脱敏后的）
    Object.keys(originalRequest.requestHeaders).forEach((key) => {
      if (key === 'authorization') {
        // 使用原始的 authorization（已脱敏，需要用户提供真实的）
        // 这里我们假设用户会通过环境变量或参数提供
        headers[key] = process.env.REPLAY_API_KEY || originalRequest.requestHeaders[key]
      } else {
        headers[key] = originalRequest.requestHeaders[key]
      }
    })

    return {
      method: 'POST',
      url: originalRequest.url,
      headers,
      body: originalRequest.requestBody
    }
  }

  async replaySequential(request, url) {
    for (let i = 0; i < this.replayCount; i++) {
      console.log(`📤 重放 #${i + 1}/${this.replayCount}`)

      const startTime = Date.now()
      try {
        const response = await axios({
          method: request.method,
          url: `${this.baseUrl}${url}`,
          headers: request.headers,
          data: request.body,
          timeout: 10000,
          validateStatus: () => true // 接受所有状态码
        })

        const endTime = Date.now()
        const duration = endTime - startTime

        this.results.push({
          attempt: i + 1,
          status: response.status,
          statusText: response.statusText,
          duration,
          timestamp: new Date().toISOString(),
          headers: response.headers,
          dataPreview: this.getResponsePreview(response.data)
        })

        console.log(`   状态: ${response.status} ${response.statusText}`)
        console.log(`   耗时: ${duration}ms`)
        console.log(`   时间: ${new Date().toISOString()}`)

        // 如果是错误响应，显示错误详情
        if (response.status >= 400) {
          console.log(
            `   错误详情:`,
            typeof response.data === 'string'
              ? response.data.substring(0, 200)
              : JSON.stringify(response.data).substring(0, 200)
          )
        }

        // 检查是否有特殊响应头
        const rateLimitHeaders = this.extractRateLimitHeaders(response.headers)
        if (Object.keys(rateLimitHeaders).length > 0) {
          console.log(`   限流信息:`)
          Object.entries(rateLimitHeaders).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`)
          })
        }

        console.log('')

        // 延迟
        if (i < this.replayCount - 1) {
          await this.sleep(this.delay)
        }
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime

        this.results.push({
          attempt: i + 1,
          status: error.response?.status || 'ERROR',
          statusText: error.message,
          duration,
          timestamp: new Date().toISOString(),
          error: true
        })

        console.log(`   状态: ❌ ${error.message}`)
        console.log(`   耗时: ${duration}ms\n`)
      }
    }
  }

  async replayConcurrent(request, url) {
    console.log('🔀 同时发送所有请求...\n')

    const promises = []
    const startTime = Date.now()

    for (let i = 0; i < this.replayCount; i++) {
      const promise = axios({
        method: request.method,
        url: `${this.baseUrl}${url}`,
        headers: request.headers,
        data: request.body,
        timeout: 10000,
        validateStatus: () => true
      })
        .then((response) => ({
          attempt: i + 1,
          status: response.status,
          statusText: response.statusText,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          headers: response.headers,
          dataPreview: this.getResponsePreview(response.data)
        }))
        .catch((error) => ({
          attempt: i + 1,
          status: error.response?.status || 'ERROR',
          statusText: error.message,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          error: true
        }))

      promises.push(promise)
    }

    this.results = await Promise.all(promises)

    // 打印结果
    this.results.forEach((result) => {
      console.log(`📤 重放 #${result.attempt}`)
      console.log(`   状态: ${result.status} ${result.statusText}`)
      console.log(`   耗时: ${result.duration}ms`)
      console.log(`   时间: ${result.timestamp}\n`)
    })
  }

  analyzeResults() {
    const successCount = this.results.filter((r) => r.status >= 200 && r.status < 300).length
    const errorCount = this.results.filter((r) => r.status >= 400 || r.error).length
    const statusCodes = {}

    this.results.forEach((r) => {
      statusCodes[r.status] = (statusCodes[r.status] || 0) + 1
    })

    console.log('📈 测试结果统计:\n')
    console.log(`   总请求数: ${this.results.length}`)
    console.log(
      `   成功 (2xx): ${successCount} ${this.getEmoji(successCount, this.results.length)}`
    )
    console.log(`   失败 (4xx/5xx): ${errorCount}`)
    console.log('')

    console.log('📊 状态码分布:\n')
    Object.entries(statusCodes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const percentage = ((count / this.results.length) * 100).toFixed(1)
        console.log(`   ${status}: ${count} 次 (${percentage}%)`)
      })

    console.log('')

    // 判断是否有重放攻击保护
    console.log('🔍 重放攻击保护分析:\n')

    if (successCount === this.results.length) {
      console.log('   ⚠️  所有重放请求都成功了！')
      console.log('   ⚠️  服务可能没有重放攻击保护')
      console.log('   ⚠️  相同的 session_id 被接受了多次')
    } else if (successCount === 1 && errorCount === this.results.length - 1) {
      console.log('   ✅ 只有第一个请求成功，后续请求被拒绝')
      console.log('   ✅ 服务可能有重放攻击保护')
      console.log('   ✅ 相同的 session_id 只能使用一次')
    } else if (successCount > 0 && errorCount > 0) {
      console.log('   🟡 部分请求成功，部分失败')
      console.log('   🟡 可能有速率限制或其他保护机制')
    } else {
      console.log('   ❌ 所有请求都失败了')
      console.log('   ❌ 可能是其他原因（如 API Key 无效）')
    }

    // 检查响应时间
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
    console.log(`\n⏱️  平均响应时间: ${avgDuration.toFixed(0)}ms`)

    // 检查响应内容差异
    const uniqueResponses = new Set(this.results.map((r) => r.dataPreview))
    if (uniqueResponses.size > 1) {
      console.log(`\n📝 响应内容: ${uniqueResponses.size} 种不同的响应`)
    }
  }

  getEmoji(success, total) {
    if (success === total) {
      return '⚠️'
    }
    if (success === 1) {
      return '✅'
    }
    if (success > 0) {
      return '🟡'
    }
    return '❌'
  }

  printSecurityAdvice() {
    const successCount = this.results.filter((r) => r.status >= 200 && r.status < 300).length

    if (successCount === this.results.length) {
      console.log('🔴 高风险：服务缺少重放攻击保护\n')
      console.log('建议实施以下保护措施:\n')
      console.log('1️⃣  Session ID 唯一性检查')
      console.log('   • 记录已使用的 session_id')
      console.log('   • 拒绝重复的 session_id')
      console.log('   • 设置合理的过期时间（如 24 小时）\n')

      console.log('2️⃣  时间戳验证')
      console.log('   • 检查请求时间戳（如果有）')
      console.log('   • 拒绝过期的请求（如 5 分钟前）\n')

      console.log('3️⃣  Nonce 机制')
      console.log('   • 要求客户端提供一次性随机数')
      console.log('   • 记录使用过的 nonce')
      console.log('   • 拒绝重复的 nonce\n')

      console.log('4️⃣  请求签名')
      console.log('   • 使用 HMAC 对请求进行签名')
      console.log('   • 包含时间戳防止重放')
      console.log('   • 验证签名有效性\n')
    } else if (successCount === 1) {
      console.log('🟢 良好：服务似乎有重放攻击保护\n')
      console.log('当前保护机制可能包括:\n')
      console.log('✅ Session ID 唯一性检查')
      console.log('✅ 请求去重机制')
      console.log('✅ 状态追踪\n')

      console.log('建议进一步加强:\n')
      console.log('1️⃣  添加时间戳验证')
      console.log('2️⃣  实施请求签名')
      console.log('3️⃣  监控异常重放模式\n')
    } else if (successCount > 1) {
      console.log('🟡 中等：部分请求被接受\n')
      console.log('可能原因:\n')
      console.log('• 速率限制触发')
      console.log('• 部分保护机制生效')
      console.log('• 并发处理的时间窗口\n')

      console.log('建议:\n')
      console.log('1️⃣  检查是否是速率限制而非重放保护')
      console.log('2️⃣  确保 session_id 唯一性检查生效')
      console.log('3️⃣  添加更严格的验证机制\n')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('💡 提示: 重放攻击测试完成')
    console.log('   完整结果已保存到内存，可以通过代码访问\n')
  }

  extractRateLimitHeaders(headers) {
    const rateLimitHeaders = {}
    const keys = [
      'x-codex-primary-used-percent',
      'x-codex-secondary-used-percent',
      'x-codex-primary-reset-after-seconds',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset'
    ]

    keys.forEach((key) => {
      if (headers[key]) {
        rateLimitHeaders[key] = headers[key]
      }
    })

    return rateLimitHeaders
  }

  getResponsePreview(data) {
    if (typeof data === 'string') {
      return data.substring(0, 100)
    }
    if (typeof data === 'object') {
      return JSON.stringify(data).substring(0, 100)
    }
    return String(data).substring(0, 100)
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// 命令行参数解析
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Codex 重放攻击测试脚本

用法:
  node scripts/test-replay-attack.js [选项]

选项:
  --url <url>           目标 URL（默认: http://localhost:3010）
  --count <number>      重放次数（默认: 3）
  --delay <ms>          请求间隔（默认: 1000ms）
  --concurrent          并发重放（同时发送所有请求）
  --help, -h            显示此帮助信息

环境变量:
  REPLAY_API_KEY        真实的 API Key（如果日志中的被脱敏）

示例:
  # 顺序重放 3 次（默认）
  node scripts/test-replay-attack.js

  # 顺序重放 5 次，每次间隔 2 秒
  node scripts/test-replay-attack.js --count 5 --delay 2000

  # 并发重放 3 次（同时发送）
  node scripts/test-replay-attack.js --concurrent

  # 指定目标 URL
  node scripts/test-replay-attack.js --url http://example.com:3010

  # 提供真实的 API Key
  REPLAY_API_KEY="Bearer cr_your_real_key" node scripts/test-replay-attack.js

说明:
  此脚本用于测试服务是否能检测和防御重放攻击。
  它会从 Redis 读取最新的 Codex 请求，然后重放多次。
  通过分析响应，判断服务是否有重放攻击保护机制。

  重放攻击是指攻击者截获合法的请求，然后多次重复发送。
  良好的服务应该能检测并拒绝重复的请求。
`)
    process.exit(0)
  }

  const options = {
    url: args.includes('--url')
      ? args[args.indexOf('--url') + 1]
      : process.env.REPLAY_URL || 'http://localhost:3010',
    count: args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1]) : 3,
    delay: args.includes('--delay') ? parseInt(args[args.indexOf('--delay') + 1]) : 1000,
    concurrent: args.includes('--concurrent')
  }

  const tester = new ReplayAttackTester(options)
  await tester.run()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
