/**
 * 临时请求捕获中间件
 * 用于捕获 Claude Code 的真实请求信息
 *
 * 通过环境变量 CAPTURE_REQUESTS_ENABLED 控制开关
 */

const fs = require('fs')
const path = require('path')
const logger = require('../utils/logger')

const CAPTURE_DIR = path.join(__dirname, '../../logs/captured-requests')
const MAX_CAPTURES = 50 // 增加到50个请求，用于多窗口测试

// 捕获开关（默认禁用）
const CAPTURE_ENABLED = process.env.CAPTURE_REQUESTS_ENABLED === 'true'

// 确保目录存在（仅在启用时）
if (CAPTURE_ENABLED && !fs.existsSync(CAPTURE_DIR)) {
  fs.mkdirSync(CAPTURE_DIR, { recursive: true })
}

// 计数器和会话跟踪
let captureCount = 0
const sessionMap = new Map() // 跟踪不同的会话

/**
 * 捕获 Claude Code 请求的中间件
 */
function captureClaudeCodeRequest(req, res, next) {
  // 检查是否启用捕获
  if (!CAPTURE_ENABLED) {
    return next()
  }

  // 只捕获前 MAX_CAPTURES 个请求
  if (captureCount >= MAX_CAPTURES) {
    return next()
  }

  // 只捕获 Claude Code 的请求
  const userAgent = req.headers['user-agent'] || ''
  if (!userAgent.includes('claude-cli')) {
    return next()
  }

  // 增加计数
  captureCount++

  // 提取会话信息
  let sessionId = 'unknown'
  let clientId = 'unknown'
  if (req.body?.metadata?.user_id) {
    const userId = req.body.metadata.user_id
    const sessionMatch = userId.match(/session_([a-f0-9-]{36})/)
    const clientMatch = userId.match(/user_([a-f0-9]{64})/)
    if (sessionMatch) {
      sessionId = sessionMatch[1]
    }
    if (clientMatch) {
      clientId = clientMatch[1]
    }

    // 跟踪会话
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        firstSeen: new Date().toISOString(),
        requestCount: 0,
        clientId
      })
    }
    const sessionInfo = sessionMap.get(sessionId)
    sessionInfo.requestCount++
    sessionInfo.lastSeen = new Date().toISOString()
  }

  // 准备捕获数据
  const captureData = {
    timestamp: new Date().toISOString(),
    captureNumber: captureCount,

    // 会话标识
    sessionId,
    clientId,
    sessionRequestNumber: sessionMap.get(sessionId)?.requestCount || 0,

    // 请求基本信息
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,

    // 所有请求头
    headers: { ...req.headers },

    // 请求体
    body: req.body ? JSON.parse(JSON.stringify(req.body)) : null,

    // 查询参数
    query: req.query,

    // 客户端信息
    clientInfo: {
      ip: req.ip,
      ips: req.ips,
      hostname: req.hostname,
      protocol: req.protocol,
      secure: req.secure
    }
  }

  // 生成文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `capture-${captureCount}-${timestamp}.json`
  const filepath = path.join(CAPTURE_DIR, filename)

  // 保存到文件
  try {
    fs.writeFileSync(filepath, JSON.stringify(captureData, null, 2), 'utf8')
    logger.info(`✅ [Request Capture ${captureCount}/${MAX_CAPTURES}] Saved to: ${filename}`)
    logger.info(`   User-Agent: ${userAgent}`)
    logger.info(`   URL: ${req.method} ${req.originalUrl}`)

    // 重点信息也打印到控制台
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📸 捕获 Claude Code 请求 #${captureCount}`)
    console.log('='.repeat(80))
    console.log(`时间: ${captureData.timestamp}`)
    console.log(`URL: ${req.method} ${req.originalUrl}`)
    console.log(`User-Agent: ${userAgent}`)

    console.log('\n--- 会话信息 ---')
    console.log(`客户端ID: ${clientId.substring(0, 16)}...`)
    console.log(`会话ID: ${sessionId}`)
    console.log(`会话请求数: ${captureData.sessionRequestNumber}`)
    console.log(`已发现会话数: ${sessionMap.size}`)

    console.log('\n--- 关键请求头 ---')
    console.log(`x-app: ${req.headers['x-app'] || 'N/A'}`)
    console.log(`anthropic-beta: ${req.headers['anthropic-beta'] || 'N/A'}`)
    console.log(`anthropic-version: ${req.headers['anthropic-version'] || 'N/A'}`)
    console.log(
      `authorization: ${req.headers.authorization ? `${req.headers.authorization.substring(0, 30)}...` : 'N/A'}`
    )

    if (req.body) {
      console.log('\n--- 请求体关键信息 ---')
      console.log(`model: ${req.body.model || 'N/A'}`)
      console.log(`max_tokens: ${req.body.max_tokens || 'N/A'}`)

      if (req.body.metadata) {
        console.log('\n--- Metadata ---')
        console.log(`user_id: ${req.body.metadata.user_id || 'N/A'}`)

        // 解析 user_id 格式
        const userId = req.body.metadata.user_id
        if (userId) {
          const match = userId.match(/^user_([a-fA-F0-9]{64})(_account__session_[\w-]+)$/)
          if (match) {
            console.log(`  客户端ID (64位hex): ${match[1]}`)
            console.log(`  会话部分: ${match[2]}`)
          }
        }
      }

      if (req.body.system) {
        console.log('\n--- System Prompt ---')
        if (Array.isArray(req.body.system)) {
          req.body.system.forEach((item, index) => {
            if (item.text) {
              const preview = item.text.substring(0, 100)
              console.log(`[${index}] ${preview}${item.text.length > 100 ? '...' : ''}`)
              if (item.cache_control) {
                console.log(`    cache_control: ${JSON.stringify(item.cache_control)}`)
              }
            }
          })
        } else if (typeof req.body.system === 'string') {
          console.log(req.body.system.substring(0, 200))
        }
      }

      if (req.body.messages && req.body.messages.length > 0) {
        console.log('\n--- 第一条消息 ---')
        const firstMsg = req.body.messages[0]
        console.log(`role: ${firstMsg.role}`)
        if (typeof firstMsg.content === 'string') {
          console.log(
            `content: ${firstMsg.content.substring(0, 100)}${firstMsg.content.length > 100 ? '...' : ''}`
          )
        }
      }
    }

    console.log(`\n${'='.repeat(80)}`)
    console.log(`📁 完整数据已保存: ${filepath}`)
    console.log(`${'='.repeat(80)}\n`)

    if (captureCount >= MAX_CAPTURES) {
      console.log(`\n${'🎉'.repeat(40)}`)
      console.log(`\n✅ 已捕获 ${MAX_CAPTURES} 个请求，自动停止捕获\n`)
      console.log(`📂 查看捕获的请求: ls -lh ${CAPTURE_DIR}\n`)
      console.log(`${'🎉'.repeat(40)}\n`)
    }
  } catch (error) {
    logger.error(`❌ Failed to save captured request: ${error.message}`)
  }

  next()
}

/**
 * 重置捕获计数（用于重新开始捕获）
 */
function resetCapture() {
  captureCount = 0
  logger.info('🔄 Request capture counter reset')
}

/**
 * 获取当前捕获状态
 */
function getCaptureStatus() {
  return {
    captureEnabled: CAPTURE_ENABLED,
    count: captureCount,
    max: MAX_CAPTURES,
    enabled: CAPTURE_ENABLED && captureCount < MAX_CAPTURES,
    captureDir: CAPTURE_DIR
  }
}

module.exports = {
  captureClaudeCodeRequest,
  resetCapture,
  getCaptureStatus,
  CAPTURE_ENABLED
}
