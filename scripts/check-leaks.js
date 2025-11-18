const redis = require('../src/models/redis')

;(async () => {
  const client = await redis.connect()
  const logs = await client.lrange('codex_request_logs', 0, -1)

  const clients = {}
  logs.forEach((logStr) => {
    const log = JSON.parse(logStr)
    const ua = log.requestHeaders['user-agent']
    if (!clients[ua]) {
      clients[ua] = log
    }
  })

  const clientList = Object.entries(clients)

  console.log('【客户端 1 - Windows】')
  console.log('Headers:', JSON.stringify(clientList[0][1].requestHeaders, null, 2))
  console.log('\nBody keys:', Object.keys(clientList[0][1].requestBody))
  console.log('Instructions length:', clientList[0][1].requestBody.instructions?.length)
  console.log('Tools count:', clientList[0][1].requestBody.tools?.length)

  console.log(`\n${'='.repeat(70)}\n`)

  console.log('【客户端 2 - Ubuntu】')
  console.log('Headers:', JSON.stringify(clientList[1][1].requestHeaders, null, 2))
  console.log('\nBody keys:', Object.keys(clientList[1][1].requestBody))
  console.log('Instructions length:', clientList[1][1].requestBody.instructions?.length)
  console.log('Tools count:', clientList[1][1].requestBody.tools?.length)

  console.log(`\n${'='.repeat(70)}\n`)
  console.log('【泄漏检查】\n')

  const h1 = clientList[0][1].requestHeaders
  const h2 = clientList[1][1].requestHeaders

  // 检查所有 header
  const leaks = []
  Object.keys(h1).forEach((key) => {
    if (h1[key] !== h2[key] && key !== 'session_id' && key !== 'authorization') {
      leaks.push({
        field: key,
        client1: h1[key],
        client2: h2[key]
      })
    }
  })

  if (leaks.length > 0) {
    console.log('🔴 发现泄漏字段:')
    leaks.forEach((leak) => {
      console.log(`\n  ${leak.field}:`)
      console.log(`    Windows: ${leak.client1}`)
      console.log(`    Ubuntu:  ${leak.client2}`)
    })
  }

  // 检查 instructions
  const inst1 = clientList[0][1].requestBody.instructions
  const inst2 = clientList[1][1].requestBody.instructions

  if (inst1 !== inst2) {
    console.log('\n🟡 instructions 不同:')
    console.log(`  长度: ${inst1.length} vs ${inst2.length}`)

    const norm1 = inst1.replace(/\r\n/g, '\n')
    const norm2 = inst2.replace(/\r\n/g, '\n')
    if (norm1 === norm2) {
      console.log('  原因: 仅换行符不同 (\\r\\n vs \\n)')
    }
  }

  await redis.disconnect()
})()
