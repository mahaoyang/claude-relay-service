#!/usr/bin/env node

/**
 * 快速测试：单 Key 每分钟速率限制
 * 目标：找出1分钟内最大请求数
 */

const https = require('https')
const http = require('http')

// ==================== 配置 ====================
const CONFIG = {
  upstreamUrl: 'https://www.88code.org/api',
  apiKey: '88_ca8e98e727486fcf112ce8c089b61e92b876fd281e0b384cf6652799821c04e8',

  // 测试参数
  testDurationSeconds: 30, // 缩短测试时间
  maxRequests: 250, // 最大请求数
  requestDelay: 20, // 非常快的发送（20ms间隔）

  // 使用真实捕获的格式
  requestBody: {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10, // 极小的tokens，加快响应
    stream: false, // 不使用流式，加快测试
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
            text: 'Hi'
          }
        ]
      }
    ],
    tools: []
  }
}

// ==================== 辅助函数 ====================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(level, message) {
  const levelColors = {
    INFO: colors.blue,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARNING: colors.yellow
  }
  const color = levelColors[level] || colors.reset
  console.log(`${color}[${level}]${colors.reset} ${message}`)
}

// 发送单个请求
function sendRequest(requestNumber) {
  return new Promise((resolve) => {
    const url = new URL(CONFIG.upstreamUrl)
    const path = `${url.pathname.replace(/\/$/, '')}/v1/messages?beta=true`
    const postData = JSON.stringify(CONFIG.requestBody)

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
        authorization: `Bearer ${CONFIG.apiKey}`,
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
        'x-api-key': CONFIG.apiKey,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }

    const startTime = Date.now()
    const protocol = url.protocol === 'https:' ? https : http

    const req = protocol.request(options, (res) => {
      // 接收响应数据（不需要使用）
      res.on('data', () => {
        // 数据接收但不处理
      })

      res.on('end', () => {
        const duration = Date.now() - startTime

        resolve({
          requestNumber,
          statusCode: res.statusCode,
          duration,
          isRateLimited: res.statusCode === 429,
          success: res.statusCode === 200
        })
      })
    })

    req.on('error', (error) => {
      resolve({
        requestNumber,
        statusCode: 0,
        error: error.message,
        duration: Date.now() - startTime,
        isRateLimited: false,
        success: false
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({
        requestNumber,
        statusCode: 0,
        error: 'Timeout',
        duration: Date.now() - startTime,
        isRateLimited: false,
        success: false
      })
    })

    req.write(postData)
    req.end()
  })
}

// 主测试函数
async function testRateLimit() {
  log('INFO', '速率限制测试 - 单 Key 每分钟请求数')
  log('INFO', `目标: ${CONFIG.upstreamUrl}`)
  log('INFO', `测试时长: ${CONFIG.testDurationSeconds}秒`)
  log('INFO', `请求间隔: ${CONFIG.requestDelay}ms`)
  log('INFO', '==========================================\n')

  const startTime = Date.now()
  const endTime = startTime + CONFIG.testDurationSeconds * 1000

  let requestCount = 0
  let successCount = 0
  let rateLimitCount = 0
  let errorCount = 0
  let firstRateLimitTime = null

  const results = []

  // 并发发送请求 - 不等待响应
  const pendingRequests = []
  let stopSending = false

  // 启动发送循环
  const sendLoop = setInterval(() => {
    if (stopSending || Date.now() >= endTime || requestCount >= CONFIG.maxRequests) {
      clearInterval(sendLoop)
      return
    }

    requestCount++
    const reqNum = requestCount

    // 异步发送，不等待
    const promise = sendRequest(reqNum).then((result) => {
      results.push(result)

      if (result.success) {
        successCount++
        process.stdout.write(`${colors.green}✓${colors.reset}`)
      } else if (result.isRateLimited) {
        rateLimitCount++
        if (!firstRateLimitTime) {
          firstRateLimitTime = Date.now() - startTime
          stopSending = true
          clearInterval(sendLoop)
          log('WARNING', `\n第 ${reqNum} 个请求被限流 (429)`)
          log('WARNING', `用时: ${(firstRateLimitTime / 1000).toFixed(2)}秒`)
          log('WARNING', `已发送请求数: ${requestCount}`)
        }
        process.stdout.write(`${colors.red}✗${colors.reset}`)
      } else {
        errorCount++
        process.stdout.write(`${colors.yellow}?${colors.reset}`)
      }

      // 每50个请求换行
      if (reqNum % 50 === 0) {
        process.stdout.write(` ${reqNum}\n`)
      }
    })

    pendingRequests.push(promise)
  }, CONFIG.requestDelay)

  // 等待所有请求完成或遇到限流
  await new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (stopSending || Date.now() >= endTime) {
        clearInterval(checkInterval)
        // 等待所有pending请求完成
        Promise.all(pendingRequests).then(() => {
          setTimeout(resolve, 1000) // 额外等待1秒确保所有响应都回来了
        })
      }
    }, 100)
  })

  const totalTime = (Date.now() - startTime) / 1000

  console.log('\n')
  log('INFO', '==========================================')
  log('SUCCESS', '测试完成')
  log('INFO', '==========================================\n')

  log('INFO', `总请求数: ${requestCount}`)
  log('SUCCESS', `成功: ${successCount}`)
  log('ERROR', `限流 (429): ${rateLimitCount}`)
  log('WARNING', `其他错误: ${errorCount}`)
  log('INFO', `总用时: ${totalTime.toFixed(2)}秒`)

  if (firstRateLimitTime) {
    const requestsPerSecond = successCount / (firstRateLimitTime / 1000)
    const requestsPerMinute = Math.floor(requestsPerSecond * 60)

    log('INFO', '\n速率限制分析:')
    log(
      'SUCCESS',
      `  在 ${(firstRateLimitTime / 1000).toFixed(2)}秒 内发送了 ${successCount} 个成功请求`
    )
    log('SUCCESS', `  速率: ${requestsPerSecond.toFixed(2)} 请求/秒`)
    log('SUCCESS', `  估算: ${colors.cyan}~${requestsPerMinute} 请求/分钟${colors.reset}`)
  } else {
    log('INFO', '\n未遇到速率限制')
    log('INFO', `在 ${totalTime.toFixed(2)}秒 内成功发送 ${successCount} 个请求`)

    if (totalTime >= 60) {
      const requestsPerMinute = Math.floor((successCount / totalTime) * 60)
      log('INFO', `估算速率: ~${requestsPerMinute} 请求/分钟`)
    }
  }

  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      testDuration: CONFIG.testDurationSeconds,
      requestDelay: CONFIG.requestDelay
    },
    summary: {
      totalRequests: requestCount,
      successCount,
      rateLimitCount,
      errorCount,
      totalTimeSeconds: totalTime,
      firstRateLimitAtSeconds: firstRateLimitTime ? firstRateLimitTime / 1000 : null
    },
    estimatedRateLimit: firstRateLimitTime
      ? {
          requestsPerMinute: Math.floor((successCount / (firstRateLimitTime / 1000)) * 60),
          requestsPerSecond: successCount / (firstRateLimitTime / 1000)
        }
      : null,
    results
  }

  const fs = require('fs')
  const reportPath = './rate-limit-test-report.json'
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  log('INFO', `\n详细报告已保存: ${reportPath}`)
}

// 运行测试
testRateLimit().catch((error) => {
  log('ERROR', `测试失败: ${error.message}`)
  process.exit(1)
})
