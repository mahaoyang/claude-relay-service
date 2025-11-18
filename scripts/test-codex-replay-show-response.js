#!/usr/bin/env node
const axios = require('axios')

const API_KEY = 'Bearer cr_3bd37978972d2484da4c337cc0fbd602489ee8153cd3b44d6746b5f78fc62fde'
const BASE_URL = 'http://localhost:3010'
const SESSION_ID = '019a95b0-test-replay-show-resp'

async function test() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Codex 重放测试 - 查看 AI 回复内容')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  for (let i = 1; i <= 3; i++) {
    console.log(`\n📤 请求 #${i}/3`)
    console.log(`❓ 问题: "Hello, this is a replay attack test"`)

    const startTime = Date.now()
    try {
      const response = await axios({
        method: 'POST',
        url: `${BASE_URL}/openai/responses`,
        headers: {
          authorization: API_KEY,
          'content-type': 'application/json',
          accept: 'text/event-stream',
          session_id: SESSION_ID,
          'user-agent': 'codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color'
        },
        data: {
          model: 'gpt-5.1-codex',
          stream: true,
          instructions: 'You are a helpful assistant. Be concise.',
          input: [
            {
              role: 'user',
              content: 'Hello, this is a replay attack test'
            }
          ]
        },
        timeout: 15000,
        validateStatus: () => true,
        responseType: 'stream'
      })

      let fullResponse = ''
      const textContent = []

      if (response.data && typeof response.data.on === 'function') {
        await new Promise((resolve, reject) => {
          response.data.on('data', (chunk) => {
            fullResponse += chunk.toString()

            // 解析 SSE 事件
            const lines = chunk.toString().split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6))
                  // 提取文本内容
                  if (data.type === 'response.output_item.added') {
                    if (data.item?.content) {
                      textContent.push(data.item.content)
                    }
                  } else if (data.type === 'response.output_item.done') {
                    if (data.item?.content) {
                      textContent.push(data.item.content)
                    }
                  } else if (data.type === 'response.content_part.added') {
                    if (data.part?.text) {
                      textContent.push(data.part.text)
                    }
                  } else if (data.type === 'response.text.delta') {
                    if (data.delta) {
                      textContent.push(data.delta)
                    }
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          })
          response.data.on('end', resolve)
          response.data.on('error', reject)
          setTimeout(resolve, 5000)
        })
      }

      const duration = Date.now() - startTime

      console.log(`✅ 状态: ${response.status} ${response.statusText}`)
      console.log(`⏱️  耗时: ${duration}ms`)

      if (textContent.length > 0) {
        console.log(`\n💬 AI 回复:`)
        console.log('─'.repeat(60))
        console.log(textContent.join(''))
        console.log('─'.repeat(60))
      } else {
        console.log(`\n📄 原始响应 (前 500 字符):`)
        console.log(fullResponse.substring(0, 500))
      }

      if (i < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.log(`❌ 失败: ${error.message}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

test().catch((error) => {
  console.error('Fatal:', error.message)
  process.exit(1)
})
