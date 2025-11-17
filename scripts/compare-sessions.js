#!/usr/bin/env node

/**
 * 会话对比分析脚本
 * 分析多窗口/多终端的请求差异
 */

const fs = require('fs')
const path = require('path')

const CAPTURE_DIR = path.join(__dirname, '../logs/captured-requests')

// 颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

// 读取所有捕获的请求
function loadCapturedRequests() {
  if (!fs.existsSync(CAPTURE_DIR)) {
    log(colors.red, `❌ 捕获目录不存在: ${CAPTURE_DIR}`)
    return []
  }

  const files = fs
    .readdirSync(CAPTURE_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()

  const requests = []
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(CAPTURE_DIR, file), 'utf8')
      const data = JSON.parse(content)
      requests.push({ file, ...data })
    } catch (error) {
      log(colors.yellow, `⚠️  无法解析文件: ${file}`)
    }
  }

  return requests
}

// 按会话分组
function groupBySession(requests) {
  const sessions = new Map()

  for (const req of requests) {
    const sessionId = req.sessionId || 'unknown'
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, [])
    }
    sessions.get(sessionId).push(req)
  }

  return sessions
}

// 提取关键字段
function extractKeyFields(req) {
  return {
    captureNumber: req.captureNumber,
    timestamp: req.timestamp,
    sessionId: req.sessionId,
    clientId: req.clientId,
    sessionRequestNumber: req.sessionRequestNumber,
    userId: req.body?.metadata?.user_id,
    model: req.body?.model,
    userAgent: req.headers?.['user-agent'],
    xApp: req.headers?.['x-app'],
    sentryTrace: req.headers?.['sentry-trace'],
    baggage: req.headers?.baggage
  }
}

// 对比两个请求
function compareRequests(req1, req2) {
  const fields1 = extractKeyFields(req1)
  const fields2 = extractKeyFields(req2)

  const differences = []
  const same = []

  for (const key in fields1) {
    if (fields1[key] !== fields2[key]) {
      differences.push({
        field: key,
        value1: fields1[key],
        value2: fields2[key]
      })
    } else {
      same.push(key)
    }
  }

  return { differences, same }
}

// 分析会话差异
function analyzeSessionDifferences(sessions) {
  const sessionArray = Array.from(sessions.entries())

  if (sessionArray.length < 2) {
    log(colors.yellow, '\n⚠️  只检测到1个会话，无法对比')
    return
  }

  log(colors.cyan, `\n${'='.repeat(80)}`)
  log(colors.cyan, '📊 会话间差异分析')
  log(colors.cyan, '='.repeat(80))

  // 对比前两个会话的第一个请求
  const [sessionId1, requests1] = sessionArray[0]
  const [sessionId2, requests2] = sessionArray[1]

  const req1 = requests1[0]
  const req2 = requests2[0]

  log(colors.blue, `\n对比会话:`)
  log(colors.green, `  会话1: ${sessionId1} (${requests1.length}个请求)`)
  log(colors.green, `  会话2: ${sessionId2} (${requests2.length}个请求)`)

  const { differences, same } = compareRequests(req1, req2)

  // 显示差异
  if (differences.length > 0) {
    log(colors.yellow, `\n❌ 差异字段 (${differences.length}个):`)
    for (const diff of differences) {
      log(colors.reset, `\n  字段: ${colors.bright}${diff.field}${colors.reset}`)
      log(colors.green, `    会话1: ${diff.value1}`)
      log(colors.red, `    会话2: ${diff.value2}`)
    }
  }

  // 显示相同字段
  if (same.length > 0) {
    log(colors.green, `\n✅ 相同字段 (${same.length}个):`)
    log(colors.reset, `  ${same.join(', ')}`)
  }

  // 特别分析 user_id
  log(colors.cyan, `\n${'='.repeat(80)}`)
  log(colors.cyan, '🔍 user_id 详细分析')
  log(colors.cyan, '='.repeat(80))

  const userId1 = req1.body?.metadata?.user_id
  const userId2 = req2.body?.metadata?.user_id

  if (userId1 && userId2) {
    const match1 = userId1.match(/^user_([a-f0-9]{64})(_account__session_([a-f0-9-]{36}))$/)
    const match2 = userId2.match(/^user_([a-f0-9]{64})(_account__session_([a-f0-9-]{36}))$/)

    if (match1 && match2) {
      const clientId1 = match1[1]
      const userSessionId1 = match1[3]
      const clientId2 = match2[1]
      const userSessionId2 = match2[3]

      log(colors.blue, '\n会话1:')
      log(colors.reset, `  完整user_id: ${userId1}`)
      log(colors.reset, `  客户端ID: ${clientId1}`)
      log(colors.reset, `  会话ID: ${userSessionId1}`)

      log(colors.blue, '\n会话2:')
      log(colors.reset, `  完整user_id: ${userId2}`)
      log(colors.reset, `  客户端ID: ${clientId2}`)
      log(colors.reset, `  会话ID: ${userSessionId2}`)

      log(colors.cyan, '\n分析结果:')
      if (clientId1 === clientId2) {
        log(colors.green, `  ✅ 客户端ID相同 → 同一台机器`)
      } else {
        log(colors.red, `  ❌ 客户端ID不同 → 不同机器`)
      }

      if (userSessionId1 === userSessionId2) {
        log(colors.green, `  ✅ 会话ID相同 → 同一个会话`)
      } else {
        log(colors.yellow, `  ⚠️  会话ID不同 → 不同会话/窗口/终端`)
      }
    }
  }
}

// 生成统计报告
function generateReport(sessions) {
  log(colors.cyan, `\n${'='.repeat(80)}`)
  log(colors.cyan, '📈 统计报告')
  log(colors.cyan, '='.repeat(80))

  log(colors.blue, `\n总会话数: ${colors.bright}${sessions.size}${colors.reset}`)

  const sessionArray = Array.from(sessions.entries())
  sessionArray.forEach(([sessionId, requests], index) => {
    log(
      colors.green,
      `\n会话 ${index + 1}: ${sessionId.substring(0, 8)}...${sessionId.substring(sessionId.length - 8)}`
    )
    log(colors.reset, `  请求数: ${requests.length}`)

    const firstReq = requests[0]
    const lastReq = requests[requests.length - 1]

    log(colors.reset, `  首次请求: ${firstReq.timestamp}`)
    log(colors.reset, `  最后请求: ${lastReq.timestamp}`)

    // 提取客户端ID
    const userId = firstReq.body?.metadata?.user_id
    if (userId) {
      const match = userId.match(/^user_([a-f0-9]{64})/)
      if (match) {
        const clientId = match[1]
        log(colors.reset, `  客户端ID: ${clientId.substring(0, 16)}...`)
      }
    }
  })

  // 客户端ID汇总
  const clientIds = new Set()
  sessionArray.forEach(([, requests]) => {
    const userId = requests[0]?.body?.metadata?.user_id
    if (userId) {
      const match = userId.match(/^user_([a-f0-9]{64})/)
      if (match) {
        clientIds.add(match[1])
      }
    }
  })

  log(colors.cyan, `\n${'='.repeat(80)}`)
  log(colors.blue, `唯一客户端ID数量: ${colors.bright}${clientIds.size}${colors.reset}`)
  if (clientIds.size === 1) {
    log(colors.green, `  ✅ 所有请求来自同一台机器`)
  } else {
    log(colors.yellow, `  ⚠️  请求来自 ${clientIds.size} 台不同的机器`)
  }
}

// 主函数
function main() {
  log(colors.bright, '\n🔍 Claude Code 多会话对比分析工具\n')

  const requests = loadCapturedRequests()

  if (requests.length === 0) {
    log(colors.red, '❌ 没有找到捕获的请求')
    log(colors.yellow, '\n请先启动服务并使用 Claude Code 发送请求')
    log(colors.yellow, '参考: CAPTURE_CLAUDE_CODE_REQUESTS.md')
    return
  }

  log(colors.green, `✅ 加载了 ${requests.length} 个请求`)

  const sessions = groupBySession(requests)
  log(colors.green, `✅ 检测到 ${sessions.size} 个会话\n`)

  // 生成统计报告
  generateReport(sessions)

  // 分析会话差异
  if (sessions.size >= 2) {
    analyzeSessionDifferences(sessions)
  }

  // 保存详细报告
  const report = {
    timestamp: new Date().toISOString(),
    totalRequests: requests.length,
    totalSessions: sessions.size,
    sessions: Array.from(sessions.entries()).map(([sessionId, reqs]) => ({
      sessionId,
      requestCount: reqs.length,
      firstRequest: reqs[0].timestamp,
      lastRequest: reqs[reqs.length - 1].timestamp,
      clientId: reqs[0].clientId,
      requests: reqs.map((r) => ({
        captureNumber: r.captureNumber,
        timestamp: r.timestamp,
        sessionRequestNumber: r.sessionRequestNumber,
        model: r.body?.model,
        userId: r.body?.metadata?.user_id
      }))
    }))
  }

  const reportPath = path.join(__dirname, '../session-comparison-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  log(colors.cyan, `\n📁 详细报告已保存: ${reportPath}`)

  log(colors.cyan, `\n${'='.repeat(80)}\n`)
}

// 运行
main()
