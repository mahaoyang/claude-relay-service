/**
 * 请求伪装工具
 * 用于将多个下游用户伪装成单一上游身份
 */

const crypto = require('crypto')
const logger = require('./logger')

// 伪装配置
const DISGUISE_CONFIG = {
  // 固定使用的客户端ID (WSL机器码)
  clientId: '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf',

  // 可用的会话ID池 (选择3个)
  sessionIds: [
    '9f10edbb-1407-47e1-9b85-fa634be33732',
    '50475d3e-7ba5-417d-a71d-bc3711f26693',
    '4fe5b286-192b-4929-a25e-8bc1789b5de4'
  ],

  // 是否启用伪装
  enabled: process.env.DISGUISE_ENABLED === 'true' || false,

  // 是否自动使用最新版本
  autoUseLatestVersion: process.env.DISGUISE_AUTO_VERSION === 'true' || true
}

// 版本信息缓存
const latestVersion = {
  userAgent: 'claude-cli/2.0.42 (external, cli)',
  lastUpdated: null
}

/**
 * 获取当天的日期字符串 (YYYY-MM-DD)
 */
function getTodayDateString() {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * 基于日期hash选择当天的sessionId
 */
function getDailySessionId() {
  const dateString = getTodayDateString()
  const hash = crypto.createHash('sha256').update(dateString).digest('hex')

  // 使用hash的前8个字符转换为数字，然后模除sessionIds数量
  const hashNum = parseInt(hash.substring(0, 8), 16)
  const index = hashNum % DISGUISE_CONFIG.sessionIds.length

  return DISGUISE_CONFIG.sessionIds[index]
}

/**
 * 生成伪装的user_id
 */
function getDisguisedUserId() {
  const sessionId = getDailySessionId()
  return `user_${DISGUISE_CONFIG.clientId}_account__session_${sessionId}`
}

/**
 * 生成随机的sentry-trace
 * 格式: {32位hex}-{16位hex}
 */
function generateSentryTrace() {
  const traceId = crypto.randomBytes(16).toString('hex')
  const spanId = crypto.randomBytes(8).toString('hex')
  return `${traceId}-${spanId}`
}

/**
 * 生成baggage头
 */
function generateBaggage(sentryTraceId, version = '2.0.42') {
  // 从现有请求中提取的固定格式，使用当前版本号
  return `sentry-environment=external,sentry-release=${version},sentry-public_key=e531a1d9ec1de9064fae9d4affb0b0f4,sentry-trace_id=${sentryTraceId}`
}

/**
 * 从user-agent中提取版本号
 */
function extractVersionFromUA(userAgent) {
  if (!userAgent) {
    return null
  }
  const match = userAgent.match(/claude-cli\/(\d+\.\d+\.\d+)/)
  return match ? match[1] : null
}

/**
 * 比较版本号
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) {
      return 1
    }
    if (p1 < p2) {
      return -1
    }
  }
  return 0
}

/**
 * 更新最新版本信息
 */
function updateLatestVersion(userAgent) {
  if (!userAgent || !DISGUISE_CONFIG.autoUseLatestVersion) {
    return
  }

  const newVersion = extractVersionFromUA(userAgent)
  if (!newVersion) {
    return
  }

  const currentVersion = extractVersionFromUA(latestVersion.userAgent)

  // 如果没有当前版本，或新版本更高，则更新
  if (!currentVersion || compareVersions(newVersion, currentVersion) > 0) {
    latestVersion.userAgent = userAgent
    latestVersion.lastUpdated = new Date().toISOString()

    logger.info(`📦 Updated latest Claude CLI version: ${userAgent}`)
  }
}

/**
 * 获取最新的user-agent
 */
function getLatestUserAgent() {
  return latestVersion.userAgent
}

/**
 * 伪装请求
 * @param {Object} requestBody - 请求体
 * @param {Object} headers - 请求头
 * @returns {Object} - 伪装后的 { body, headers }
 */
function disguiseRequest(requestBody, headers) {
  if (!DISGUISE_CONFIG.enabled) {
    // 即使不伪装，也收集版本信息
    if (headers && headers['user-agent']) {
      updateLatestVersion(headers['user-agent'])
    }
    return { body: requestBody, headers }
  }

  // 深拷贝避免修改原始对象
  const disguisedBody = JSON.parse(JSON.stringify(requestBody))
  const disguisedHeaders = { ...headers }

  // 0. 更新版本信息（从原始请求中学习）
  if (headers && headers['user-agent']) {
    updateLatestVersion(headers['user-agent'])
  }

  // 1. 伪装 metadata.user_id
  if (disguisedBody.metadata) {
    disguisedBody.metadata.user_id = getDisguisedUserId()
  }

  // 2. 使用最新的 user-agent（如果启用）
  if (DISGUISE_CONFIG.autoUseLatestVersion) {
    disguisedHeaders['user-agent'] = getLatestUserAgent()
  }

  // 3. 生成新的 sentry-trace 和 baggage
  const sentryTrace = generateSentryTrace()
  const sentryTraceId = sentryTrace.split('-')[0]

  // 从user-agent提取版本号用于baggage
  const version = extractVersionFromUA(disguisedHeaders['user-agent']) || '2.0.42'

  disguisedHeaders['sentry-trace'] = sentryTrace
  disguisedHeaders['baggage'] = generateBaggage(sentryTraceId, version)

  return {
    body: disguisedBody,
    headers: disguisedHeaders
  }
}

/**
 * 获取伪装信息（用于日志和调试）
 */
function getDisguiseInfo() {
  if (!DISGUISE_CONFIG.enabled) {
    return {
      enabled: false,
      latestVersion: latestVersion.userAgent,
      versionLastUpdated: latestVersion.lastUpdated
    }
  }

  return {
    enabled: true,
    clientId: DISGUISE_CONFIG.clientId,
    todaySessionId: getDailySessionId(),
    todayUserId: getDisguisedUserId(),
    date: getTodayDateString(),
    availableSessionIds: DISGUISE_CONFIG.sessionIds,
    latestVersion: latestVersion.userAgent,
    versionLastUpdated: latestVersion.lastUpdated,
    autoUseLatestVersion: DISGUISE_CONFIG.autoUseLatestVersion
  }
}

module.exports = {
  disguiseRequest,
  getDisguiseInfo,
  getDailySessionId,
  getDisguisedUserId,
  updateLatestVersion,
  getLatestUserAgent,
  DISGUISE_CONFIG
}
