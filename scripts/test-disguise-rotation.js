#!/usr/bin/env node

/**
 * 测试伪装轮换功能
 * 验证：
 * 1. API Key sessionCollection 字段
 * 2. 优先级队列添加/取出
 * 3. 在线集合初始化
 * 4. 双层概率轮换逻辑
 * 5. 白名单检查
 */

const codexDisguiseHelper = require('../src/utils/codexDisguiseHelper')
const apiKeyService = require('../src/services/apiKeyService')
const redis = require('../src/models/redis')

async function testAPIKeySessionCollection() {
  console.log('\n========== 测试 1: API Key sessionCollection 字段 ==========')

  try {
    // 创建一个测试 API Key
    const result = await apiKeyService.generateApiKey({
      name: 'Test Collection Key',
      sessionCollection: {
        enabled: true,
        priority: 5,
        quota: 100,
        collectedCount: 0,
        lastCollectedAt: null,
        tags: ['test', 'high-priority']
      }
    })

    console.log('✅ 创建 API Key 成功')
    console.log('   ID:', result.id)
    console.log('   Key:', `${result.apiKey.substring(0, 20)}...`)

    // 读取并验证
    const keys = await apiKeyService.getAllApiKeys()
    const testKey = keys.find((k) => k.id === result.id)

    if (testKey && testKey.sessionCollection) {
      console.log('✅ sessionCollection 字段读取成功')
      console.log('   enabled:', testKey.sessionCollection.enabled)
      console.log('   priority:', testKey.sessionCollection.priority)
      console.log('   quota:', testKey.sessionCollection.quota)
      console.log('   tags:', testKey.sessionCollection.tags)
    } else {
      console.error('❌ sessionCollection 字段不存在')
    }

    return result.id
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return null
  }
}

async function testPriorityQueue() {
  console.log('\n========== 测试 2: 优先级队列 ==========')

  try {
    // 清空队列
    await codexDisguiseHelper.clearAllSessions()
    console.log('✅ 清空队列成功')

    // 添加不同优先级的 sessionId
    const testSessions = [
      { id: '019a9544-7ab1-73c1-837e-1fa681f4462b', priority: 1, name: 'Low Priority' },
      { id: '019a9543-6c61-7310-8e37-f069df526d56', priority: 5, name: 'Medium Priority' },
      { id: '019a9545-a2b3-7421-9f48-2ab7c8e3d647', priority: 10, name: 'High Priority' }
    ]

    for (const session of testSessions) {
      const added = await codexDisguiseHelper.addSessionIdToQueue(session.id, {
        apiKeyName: session.name,
        priority: session.priority,
        timestamp: Date.now()
      })
      console.log(`${added ? '✅' : '❌'} 添加 ${session.name} (priority=${session.priority})`)
    }

    // 获取队列信息
    const info = await codexDisguiseHelper.getCodexDisguiseInfo()
    console.log('\n📊 队列状态:')
    console.log('   队列大小:', info.queue.size)
    console.log('   队列项:')
    info.queue.items.forEach((item) => {
      console.log(`     - ${item.sessionId} (priority=${item.priority}, source=${item.source})`)
    })

    return true
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return false
  }
}

async function testOnlineSet() {
  console.log('\n========== 测试 3: 在线集合 ==========')

  try {
    // 初始化在线集合
    await codexDisguiseHelper.initializeOnlineSet()
    console.log('✅ 初始化在线集合成功')

    // 获取在线 sessionId
    const onlineIds = await codexDisguiseHelper.getOnlineSessionIds()
    console.log('\n📊 在线集合:')
    console.log('   在线数量:', onlineIds.length)
    console.log('   SessionIds:')
    onlineIds.forEach((id) => {
      console.log(`     - ${id.substring(0, 30)}...`)
    })

    // 测试选择逻辑
    console.log('\n🎲 随机选择测试 (5次):')
    for (let i = 0; i < 5; i++) {
      const selected = await codexDisguiseHelper.selectSessionIdFromOnline()
      console.log(`   ${i + 1}. ${selected.substring(0, 30)}...`)
    }

    return true
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return false
  }
}

async function testRotation() {
  console.log('\n========== 测试 4: 双层概率轮换 ==========')

  try {
    console.log('⚠️  注意：轮换是概率性的，可能不会每次都成功')
    console.log(`   第一层概率 (P1): ${codexDisguiseHelper.CODEX_DISGUISE_CONFIG.rotationP1}`)
    console.log(`   第二层概率 (P2): ${codexDisguiseHelper.CODEX_DISGUISE_CONFIG.rotationP2}`)
    console.log(
      `   最小轮换间隔: ${codexDisguiseHelper.CODEX_DISGUISE_CONFIG.minRotationInterval}秒`
    )

    // 尝试多次轮换
    console.log('\n🔄 尝试轮换 10 次:')
    let successCount = 0
    for (let i = 0; i < 10; i++) {
      const rotated = await codexDisguiseHelper.maybeRotateSessionIds()
      if (rotated > 0) {
        successCount++
        console.log(`   ${i + 1}. ✅ 轮换了 ${rotated} 个 sessionId`)
      } else {
        console.log(`   ${i + 1}. ⏭️  跳过轮换`)
      }
      // 等待一小段时间避免最小间隔限制
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`\n📊 轮换统计: ${successCount}/10 次成功`)

    // 获取最终状态
    const info = await codexDisguiseHelper.getCodexDisguiseInfo()
    console.log('\n📊 最终状态:')
    console.log('   在线数量:', info.onlineSet.size)
    console.log('   队列大小:', info.queue.size)
    console.log('   轮换指标:', info.metrics)

    return true
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return false
  }
}

async function testWhitelist() {
  console.log('\n========== 测试 5: 白名单检查 ==========')

  try {
    // 模拟白名单检查逻辑
    const testCases = [
      {
        apiKey: {
          id: 'test-1',
          name: 'Enabled Key',
          sessionCollection: { enabled: true, priority: 5, quota: -1, collectedCount: 0 }
        },
        sessionId: '019a9544-7ab1-73c1-837e-1fa681f4462b',
        expected: true
      },
      {
        apiKey: {
          id: 'test-2',
          name: 'Disabled Key',
          sessionCollection: { enabled: false, priority: 1, quota: -1, collectedCount: 0 }
        },
        sessionId: '019a9543-6c61-7310-8e37-f069df526d56',
        expected: false
      },
      {
        apiKey: {
          id: 'test-3',
          name: 'Quota Exceeded Key',
          sessionCollection: {
            enabled: true,
            priority: 5,
            quota: 10,
            collectedCount: 10
          }
        },
        sessionId: '019a9545-a2b3-7421-9f48-2ab7c8e3d647',
        expected: false
      },
      {
        apiKey: {
          id: 'test-4',
          name: 'Invalid SessionId',
          sessionCollection: { enabled: true, priority: 5, quota: -1, collectedCount: 0 }
        },
        sessionId: 'not-a-uuid',
        expected: false
      }
    ]

    console.log('📋 测试用例:')
    for (const testCase of testCases) {
      const config = testCase.apiKey.sessionCollection || {}
      let shouldCollect = false

      // 模拟白名单检查逻辑
      if (config.enabled) {
        if (config.quota !== -1 && (config.collectedCount || 0) >= config.quota) {
          shouldCollect = false
        } else {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          shouldCollect = uuidRegex.test(testCase.sessionId)
        }
      }

      const passed = shouldCollect === testCase.expected
      console.log(
        `   ${passed ? '✅' : '❌'} ${testCase.apiKey.name}: ` +
          `收集=${shouldCollect}, 预期=${testCase.expected}`
      )
    }

    return true
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 开始测试伪装轮换功能...\n')

  // 等待 Redis 连接
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!redis.getClient()) {
    console.error('❌ Redis 未连接，无法进行测试')
    process.exit(1)
  }

  console.log('✅ Redis 已连接')

  // 运行测试
  const keyId = await testAPIKeySessionCollection()
  await testPriorityQueue()
  await testOnlineSet()
  await testRotation()
  await testWhitelist()

  // 清理测试数据
  if (keyId) {
    console.log('\n🧹 清理测试数据...')
    try {
      await apiKeyService.hardDeleteApiKey(keyId)
      console.log('✅ 测试 API Key 已删除')
    } catch (error) {
      console.error('⚠️  清理失败:', error.message)
    }
  }

  console.log('\n✅ 所有测试完成！')
  process.exit(0)
}

// 运行测试
main().catch((error) => {
  console.error('💥 测试失败:', error)
  process.exit(1)
})
