#!/usr/bin/env node

/**
 * Codex Request Logging 测试脚本
 *
 * 用途：测试 Codex 请求日志记录功能
 *
 * 使用方法：
 *   node scripts/test-codex-logging.js
 *
 * 功能：
 *   1. 从 Redis 读取最近的 Codex 请求日志
 *   2. 显示日志摘要信息
 *   3. 支持只查看 Codex CLI 请求
 */

const codexRequestLoggerService = require('../src/services/codexRequestLoggerService')
const logger = require('../src/utils/logger')

async function main() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Codex Request Logging 测试脚本')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // 获取命令行参数
    const args = process.argv.slice(2)
    const codexCliOnly = args.includes('--codex-cli-only')
    const limit = parseInt(args.find((arg) => arg.startsWith('--limit='))?.split('=')[1]) || 10
    const clearLogs = args.includes('--clear')

    if (clearLogs) {
      console.log('🗑️  清除所有 Codex 请求日志...\n')
      await codexRequestLoggerService.clearLogs()
      console.log('✅ 日志已清除\n')
      return
    }

    console.log(`📊 获取最近 ${limit} 条日志 ${codexCliOnly ? '(仅 Codex CLI)' : '(所有类型)'}\n`)

    const logs = await codexRequestLoggerService.getRecentLogs(limit, codexCliOnly)

    if (logs.length === 0) {
      console.log('⚠️  没有找到日志记录')
      console.log('\n提示：')
      console.log('  1. 确认已启用日志记录: CODEX_REQUEST_LOGGING=true')
      console.log('  2. 发送一些 Codex 请求以生成日志')
      console.log('  3. 检查服务是否正在运行')
      console.log('  4. 日志在 Redis 中保存 2 小时后自动过期\n')
      return
    }

    console.log(`找到 ${logs.length} 条日志记录：\n`)

    // 显示每条日志的摘要
    logs.forEach((log, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📝 日志 #${index + 1}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`⏰ 时间: ${log.timestamp}`)
      console.log(`🔗 URL: ${log.url}`)
      console.log(`📋 方法: ${log.method}`)
      console.log(`🎯 类型: ${log.isCodexCLI ? 'Codex CLI ✅' : '其他'}`)

      if (log.requestBody?.model) {
        console.log(`🤖 模型: ${log.requestBody.model}`)
      }

      if (log.requestBody?.stream !== undefined) {
        console.log(`💧 流式: ${log.requestBody.stream ? '是' : '否'}`)
      }

      if (log.requestBody?.session_id) {
        console.log(`🔑 会话: ${log.requestBody.session_id.substring(0, 16)}...`)
      }

      // 显示请求头关键信息
      if (log.requestHeaders) {
        console.log('\n📨 请求头:')
        const keyHeaders = ['user-agent', 'version', 'openai-beta', 'content-type']
        keyHeaders.forEach((key) => {
          if (log.requestHeaders[key]) {
            console.log(`  ${key}: ${log.requestHeaders[key]}`)
          }
        })
      }

      // 显示 instructions 预览
      if (log.requestBody?.instructions) {
        const preview = log.requestBody.instructions.substring(0, 100)
        console.log(
          `\n📝 Instructions: ${preview}${log.requestBody.instructions.length > 100 ? '...' : ''}`
        )
      }

      // 显示消息数量
      if (log.requestBody?.messages) {
        console.log(`\n💬 消息: ${log.requestBody.messages.count} 条`)
        if (log.requestBody.messages.sample) {
          console.log(
            `   示例角色: ${log.requestBody.messages.sample.role} - ${log.requestBody.messages.sample.content?.substring(0, 50) || '[无内容]'}...`
          )
        }
      }

      // 显示响应头（Codex 限流信息）
      if (log.responseHeaders) {
        const usageHeaders = {
          'x-codex-primary-used-percent': '主限流使用率',
          'x-codex-secondary-used-percent': '次限流使用率',
          'x-codex-primary-reset-after-seconds': '主限流重置时间',
          'openai-version': 'OpenAI 版本',
          'x-request-id': '请求 ID'
        }

        const hasUsageInfo = Object.keys(usageHeaders).some((key) => log.responseHeaders[key])
        if (hasUsageInfo) {
          console.log('\n📊 响应头 (Codex 使用信息):')
          Object.entries(usageHeaders).forEach(([key, label]) => {
            if (log.responseHeaders[key]) {
              console.log(`  ${label}: ${log.responseHeaders[key]}`)
            }
          })
        }
      }

      // 显示元数据
      if (log.metadata) {
        console.log('\n🔧 元数据:')
        if (log.metadata.apiKeyId) {
          console.log(`  API Key ID: ${log.metadata.apiKeyId}`)
        }
        if (log.metadata.apiKeyName) {
          console.log(`  API Key 名称: ${log.metadata.apiKeyName}`)
        }
        if (log.metadata.statusCode) {
          console.log(`  状态码: ${log.metadata.statusCode}`)
        }
      }

      console.log('\n')
    })

    // 统计信息
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📈 统计信息')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const codexCliCount = logs.filter((log) => log.isCodexCLI).length
    const nonCodexCount = logs.length - codexCliCount

    console.log(`总日志数: ${logs.length}`)
    console.log(`Codex CLI: ${codexCliCount}`)
    console.log(`其他类型: ${nonCodexCount}`)

    // 模型统计
    const modelCounts = {}
    logs.forEach((log) => {
      const model = log.requestBody?.model || 'unknown'
      modelCounts[model] = (modelCounts[model] || 0) + 1
    })

    if (Object.keys(modelCounts).length > 0) {
      console.log('\n模型分布:')
      Object.entries(modelCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([model, count]) => {
          console.log(`  ${model}: ${count}`)
        })
    }

    // 流式 vs 非流式
    const streamCount = logs.filter((log) => log.requestBody?.stream === true).length
    const nonStreamCount = logs.filter((log) => log.requestBody?.stream === false).length

    if (streamCount + nonStreamCount > 0) {
      console.log('\n流式请求:')
      console.log(`  流式: ${streamCount}`)
      console.log(`  非流式: ${nonStreamCount}`)
    }

    console.log('\n')
  } catch (error) {
    logger.error('❌ 测试失败:', error)
    console.error('\n错误详情:', error.message)
    process.exit(1)
  }
}

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Codex Request Logging 测试脚本

用法:
  node scripts/test-codex-logging.js [选项]

选项:
  --limit=N              获取 N 条日志记录（默认: 10）
  --codex-cli-only       只显示 Codex CLI 请求
  --clear                清除所有日志
  --help, -h             显示此帮助信息

示例:
  # 获取最近 10 条日志
  node scripts/test-codex-logging.js

  # 获取最近 20 条日志
  node scripts/test-codex-logging.js --limit=20

  # 只查看 Codex CLI 请求
  node scripts/test-codex-logging.js --codex-cli-only

  # 清除所有日志
  node scripts/test-codex-logging.js --clear

提示:
  1. 启用日志: 在 .env 中设置 CODEX_REQUEST_LOGGING=true
  2. 查看文件: ls -lh logs/codex-requests/
  3. 通过 API 查看: GET /admin/codex-request-logs
`)
  process.exit(0)
}

main()
