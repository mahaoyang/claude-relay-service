#!/usr/bin/env node

/**
 * 上游并发限制测试工具 - Node.js 版本
 * 功能更强大，支持详细的统计和报告
 */

const https = require('https')
const http = require('http')

// ==================== 配置区域 ====================
const CONFIG = {
  // 上游服务地址（不要包含 /v1/messages）
  upstreamUrl: 'https://www.88code.org/api',

  // API Keys（替换为你的实际 Key）
  apiKeys: [
    '88_ca8e98e727486fcf112ce8c089b61e92b876fd281e0b384cf6652799821c04e8', // Key 1
    '88_8416a48c3b9c3a9940cdf69f0ff8eb0579dd84dee302f7344239a1986e6f5c90', // Key 2
    '88_1a04d70c77de076871c0c12466105d9590723612026e298e162b0a9fa3c39c2c' // Key 3
  ],

  // 测试配置
  maxConcurrent: 10, // 最大并发测试数
  testDelay: 2000, // 每次测试间隔（毫秒）
  requestTimeout: 30000, // 请求超时时间（毫秒）

  // 测试请求体（使用真实捕获的格式 - 重放攻击）
  requestBody: {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    stream: true,
    system: [
      {
        type: 'text',
        text: "You are Claude Code, Anthropic's official CLI for Claude."
      }
    ],
    metadata: {
      user_id:
        'user_1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf_account__session_a6be45ab-4c74-408a-be13-7af599bb2edb'
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Say hello in 5 words'
          }
        ]
      }
    ],
    tools: []
  },

  // 长时间请求体（用于并发占用测试）
  longRequestBody: {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 32000,
    stream: true,
    system: [
      {
        type: 'text',
        text: "You are Claude Code, Anthropic's official CLI for Claude."
      }
    ],
    metadata: {
      user_id:
        'user_1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf_account__session_a6be45ab-4c74-408a-be13-7af599bb2edb'
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please write a detailed explanation of quantum computing in 500 words.'
          }
        ]
      }
    ],
    tools: []
  }
}

// ==================== 辅助函数 ====================

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(level, message) {
  // const timestamp = new Date().toISOString() // 预留用于将来可能的时间戳日志
  const levelColors = {
    INFO: colors.blue,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARNING: colors.yellow
  }
  const color = levelColors[level] || colors.reset
  console.log(`${color}[${level}]${colors.reset} ${message}`)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 发送请求（使用真实捕获的请求头 - 完整重放攻击）
function sendRequest(apiKey, requestBody, timeout = CONFIG.requestTimeout) {
  return new Promise((resolve) => {
    const url = new URL(CONFIG.upstreamUrl)
    const path = `${url.pathname.replace(/\/$/, '')}/v1/messages?beta=true`

    const postData = JSON.stringify(requestBody)

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path,
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-stainless-retry-count': '0',
        'x-stainless-timeout': '600',
        'x-stainless-lang': 'js',
        'x-stainless-package-version': '0.68.0',
        'x-stainless-os': 'Linux',
        'x-stainless-arch': 'x64',
        'x-stainless-runtime': 'node',
        'x-stainless-runtime-version': 'v24.11.1',
        'anthropic-dangerous-direct-browser-access': 'true',
        'anthropic-version': '2023-06-01',
        'x-app': 'cli',
        'User-Agent': 'claude-cli/2.0.42 (external, cli)',
        authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-beta':
          'interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14,context-management-2025-06-27',
        'x-stainless-helper-method': 'stream',
        'accept-language': '*',
        'sec-fetch-mode': 'cors',
        'accept-encoding': 'gzip, deflate',
        'sentry-trace': '835556fcf4424608b0b091c9a353a19f-aa52195943252db1',
        baggage:
          'sentry-environment=external,sentry-release=2.0.42,sentry-public_key=e531a1d9ec1de9064fae9d4affb0b0f4,sentry-trace_id=835556fcf4424608b0b091c9a353a19f',
        'x-api-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout
    }

    const startTime = Date.now()
    const protocol = url.protocol === 'https:' ? https : http

    const req = protocol.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        const duration = Date.now() - startTime
        let parsedData = null

        try {
          parsedData = JSON.parse(data)
        } catch (e) {
          parsedData = { raw: data }
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 300
        })
      })
    })

    req.on('error', (error) => {
      const duration = Date.now() - startTime
      resolve({
        statusCode: 0,
        error: error.message,
        duration,
        success: false
      })
    })

    req.on('timeout', () => {
      req.destroy()
      const duration = Date.now() - startTime
      resolve({
        statusCode: 0,
        error: 'Request timeout',
        duration,
        success: false
      })
    })

    req.write(postData)
    req.end()
  })
}

// ==================== 测试函数 ====================

// 测试1: 单个 Key 的并发限制
async function testSingleKeyConcurrency() {
  log('INFO', '==========================================')
  log('INFO', '测试1: 单个 API Key 的并发限制')
  log('INFO', '==========================================')
  log('INFO', `使用 API Key: ${CONFIG.apiKeys[0].substring(0, 10)}...`)
  log('INFO', '逐步增加并发数，找出限制点')
  console.log('')

  const results = []

  for (let concurrent = 1; concurrent <= CONFIG.maxConcurrent; concurrent++) {
    log('INFO', `测试并发数: ${concurrent}`)

    // 发送并发请求
    const promises = []
    for (let i = 0; i < concurrent; i++) {
      promises.push(sendRequest(CONFIG.apiKeys[0], CONFIG.requestBody))
    }

    // 等待所有请求完成
    const responses = await Promise.all(promises)

    // 分析结果
    let success = 0
    let rateLimited = 0
    let failed = 0
    let concurrencyLimit = null

    responses.forEach((res, index) => {
      if (res.success) {
        success++
        log('SUCCESS', `  请求 #${index + 1}: 成功 (${res.duration}ms)`)
      } else if (res.statusCode === 429) {
        rateLimited++
        concurrencyLimit = res.data?.concurrencyLimit || null
        log('ERROR', `  请求 #${index + 1}: 并发限流 (429) - Limit: ${concurrencyLimit || 'N/A'}`)
        if (res.data?.message) {
          log('ERROR', `    错误信息: ${res.data.message}`)
        }
      } else {
        failed++
        log(
          'WARNING',
          `  请求 #${index + 1}: 失败 (${res.statusCode || 'ERR'}) - ${res.error || 'Unknown error'}`
        )
      }
    })

    console.log('')
    log('INFO', `结果: 成功=${success}, 限流=${rateLimited}, 失败=${failed}`)

    results.push({
      concurrent,
      success,
      rateLimited,
      failed,
      concurrencyLimit
    })

    if (rateLimited > 0) {
      log(
        'WARNING',
        `检测到并发限制！限制值: ${concurrencyLimit || `约 ${concurrent - 1} 或 ${concurrent}`}`
      )
      break
    }

    console.log('')
    await sleep(CONFIG.testDelay)
  }

  return results
}

// 测试2: 多个 Key 是否独立限制
async function testMultiKeyIndependence() {
  log('INFO', '==========================================')
  log('INFO', '测试2: 多个 API Key 的独立性')
  log('INFO', '==========================================')
  log('INFO', '测试策略: 用 Key1 占满并发，然后测试 Key2 是否仍可用')
  console.log('')

  if (CONFIG.apiKeys.length < 2) {
    log('WARNING', '需要至少2个 API Key 才能进行此测试')
    return null
  }

  // 步骤1: 用 Key1 发送3个长时间请求
  log('INFO', '步骤1: 使用 Key1 发送3个并发请求（长时间运行）...')

  const key1Promises = []
  for (let i = 0; i < 3; i++) {
    key1Promises.push(sendRequest(CONFIG.apiKeys[0], CONFIG.longRequestBody, 60000))
  }

  // 等待请求开始
  await sleep(1000)

  // 步骤2: 用 Key1 再发一个请求，应该被限流
  log('INFO', '步骤2: 用 Key1 发送第4个请求（预期被限流）...')
  const key1Test = await sendRequest(CONFIG.apiKeys[0], CONFIG.requestBody)

  if (key1Test.statusCode === 429) {
    log('SUCCESS', 'Key1 第4个请求被限流 (符合预期)')
  } else if (key1Test.success) {
    log('WARNING', `Key1 第4个请求未被限流 (HTTP ${key1Test.statusCode})`)
    log('WARNING', '可能并发限制 > 3，或者长请求已完成')
  } else {
    log('WARNING', `Key1 第4个请求失败 (HTTP ${key1Test.statusCode})`)
  }

  // 步骤3: 用 Key2 发送请求，测试是否独立
  log('INFO', '步骤3: 用 Key2 发送请求（测试独立性）...')
  const key2Test = await sendRequest(CONFIG.apiKeys[1], CONFIG.requestBody)

  console.log('')
  let result = null

  if (key2Test.success) {
    log('SUCCESS', '✅ Key2 请求成功！多个 Key 是独立限制的')
    log('SUCCESS', '   → 可以使用多 Key 方案扩展并发数')
    result = 'independent'
  } else if (key2Test.statusCode === 429) {
    log('ERROR', '❌ Key2 也被限流！可能存在用户级总限制')
    log('ERROR', '   → 需要请求管理员提供多个用户账户')
    result = 'shared'
  } else {
    log('WARNING', `Key2 请求失败 (HTTP ${key2Test.statusCode || 'ERR'})`)
    result = 'error'
  }

  // 等待 Key1 的请求完成
  await Promise.all(key1Promises)

  console.log('')
  return { result, key1Test, key2Test }
}

// 测试3: 速率限制测试（预留，目前未启用）
// eslint-disable-next-line no-unused-vars
async function _testRateLimit() {
  log('INFO', '==========================================')
  log('INFO', '测试3: 速率限制（1分钟内最大请求数）')
  log('INFO', '==========================================')
  log('INFO', '在1分钟内快速发送请求，测试速率限制')
  console.log('')

  const maxRequests = 100
  const startTime = Date.now()
  let success = 0
  let rateLimited = 0

  for (let i = 0; i < maxRequests; i++) {
    const result = await sendRequest(CONFIG.apiKeys[0], CONFIG.requestBody, 10000)

    if (result.success) {
      success++
      process.stdout.write('.')
    } else if (result.statusCode === 429) {
      rateLimited++
      console.log('')
      log('ERROR', `第 ${i + 1} 个请求被限流: ${result.data?.message || 'Rate limit exceeded'}`)
      break
    } else {
      console.log('')
      log('WARNING', `第 ${i + 1} 个请求失败 (HTTP ${result.statusCode || 'ERR'})`)
    }

    // 检查是否超过1分钟
    if (Date.now() - startTime >= 60000) {
      break
    }
  }

  console.log('')
  log('INFO', `结果: 成功=${success}, 限流=${rateLimited}`)

  if (rateLimited > 0) {
    log('WARNING', `检测到速率限制！约为 ${success} 请求/分钟`)
  } else {
    log('SUCCESS', `未检测到速率限制（在 ${success} 个请求内）`)
  }

  console.log('')
  return { success, rateLimited }
}

// 测试4: 测试所有 Keys 的并发限制
async function testAllKeysConcurrency() {
  log('INFO', '==========================================')
  log('INFO', '测试4: 所有 API Keys 的并发限制对比')
  log('INFO', '==========================================')
  console.log('')

  const results = []

  for (let i = 0; i < CONFIG.apiKeys.length; i++) {
    const apiKey = CONFIG.apiKeys[i]
    if (apiKey === 'cr_xxxxxxxxxxxxxx' || apiKey === 'cr_yyyyyyyyyyyyyy') {
      continue // 跳过未配置的 Key
    }

    log('INFO', `测试 Key #${i + 1}: ${apiKey.substring(0, 10)}...`)

    // 发送并发请求找出限制
    for (let concurrent = 1; concurrent <= 10; concurrent++) {
      const promises = []
      for (let j = 0; j < concurrent; j++) {
        promises.push(sendRequest(apiKey, CONFIG.requestBody))
      }

      const responses = await Promise.all(promises)
      const rateLimited = responses.filter((r) => r.statusCode === 429).length
      const success = responses.filter((r) => r.success).length

      if (rateLimited > 0) {
        const limit = responses.find((r) => r.statusCode === 429)?.data?.concurrencyLimit
        log('INFO', `  Key #${i + 1} 并发限制: ${limit || concurrent - 1}`)
        results.push({ key: i + 1, limit: limit || concurrent - 1 })
        break
      }

      if (concurrent === 10 && success === 10) {
        log('INFO', `  Key #${i + 1} 并发限制: > 10`)
        results.push({ key: i + 1, limit: '>10' })
      }

      await sleep(500)
    }

    console.log('')
    await sleep(CONFIG.testDelay)
  }

  return results
}

// ==================== 主程序 ====================

async function main() {
  log('INFO', '上游并发限制测试工具 - Node.js 版本')
  log('INFO', `目标: ${CONFIG.upstreamUrl}`)
  console.log('')

  // 验证配置
  if (CONFIG.upstreamUrl === 'https://your-upstream-url.com') {
    log('ERROR', '请先配置 upstreamUrl')
    process.exit(1)
  }

  if (CONFIG.apiKeys[0] === 'cr_xxxxxxxxxxxxxx') {
    log('ERROR', '请先配置至少一个 API Key')
    process.exit(1)
  }

  const allResults = {}

  // 运行测试
  try {
    // 测试1: 单 Key 并发
    allResults.singleKeyConcurrency = await testSingleKeyConcurrency()
    await sleep(3000)

    // 测试2: 多 Key 独立性
    if (
      CONFIG.apiKeys.length >= 2 &&
      CONFIG.apiKeys[1] !== 'cr_yyyyyyyyyyyyyy' &&
      CONFIG.apiKeys[1] !== 'cr_xxxxxxxxxxxxxx'
    ) {
      allResults.multiKeyIndependence = await testMultiKeyIndependence()
      await sleep(3000)
    } else {
      log('WARNING', '跳过测试2: 需要至少2个有效的 API Key')
      console.log('')
    }

    // 测试3: 速率限制（可选，取消注释启用）
    // allResults.rateLimit = await testRateLimit()
    // await sleep(3000)

    // 测试4: 所有 Keys 对比
    if (
      CONFIG.apiKeys.filter((k) => k !== 'cr_xxxxxxxxxxxxxx' && k !== 'cr_yyyyyyyyyyyyyy').length >
      1
    ) {
      allResults.allKeysConcurrency = await testAllKeysConcurrency()
    }

    // 生成测试报告
    log('SUCCESS', '==========================================')
    log('SUCCESS', '测试报告')
    log('SUCCESS', '==========================================')
    console.log('')

    // 报告1: 单 Key 并发限制
    if (allResults.singleKeyConcurrency) {
      const lastResult = allResults.singleKeyConcurrency[allResults.singleKeyConcurrency.length - 1]
      if (lastResult.concurrencyLimit) {
        log('INFO', `单 Key 并发限制: ${lastResult.concurrencyLimit}`)
      } else {
        log('INFO', `单 Key 并发限制: > ${lastResult.concurrent}`)
      }
    }

    // 报告2: 多 Key 独立性
    if (allResults.multiKeyIndependence) {
      if (allResults.multiKeyIndependence.result === 'independent') {
        log('SUCCESS', '多 Key 独立性: ✅ 独立（推荐使用多 Key 方案）')
      } else if (allResults.multiKeyIndependence.result === 'shared') {
        log('ERROR', '多 Key 独立性: ❌ 共享限制（需要多用户账户）')
      }
    }

    // 报告3: 所有 Keys 对比
    if (allResults.allKeysConcurrency && allResults.allKeysConcurrency.length > 0) {
      console.log('')
      log('INFO', '所有 Keys 并发限制对比:')
      allResults.allKeysConcurrency.forEach((r) => {
        log('INFO', `  Key #${r.key}: ${r.limit}`)
      })
    }

    console.log('')
    log('SUCCESS', '所有测试完成！')

    // 生成 JSON 报告
    const fs = require('fs')
    const reportPath = './upstream-test-report.json'
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          upstreamUrl: CONFIG.upstreamUrl,
          results: allResults
        },
        null,
        2
      )
    )
    log('INFO', `详细报告已保存到: ${reportPath}`)
  } catch (error) {
    log('ERROR', `测试失败: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// 运行主程序
main()
