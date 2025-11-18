# Codex 请求格式分析报告

**分析时间**: 2025-11-18
**总请求数**: 4
**客户端数**: 2

---

## 📊 一、Codex 常规请求样式

### 1.1 基本请求格式

```json
{
  "method": "POST",
  "url": "/openai/responses",
  "headers": {
    "session_id": "019a9544-7ab1-73c1-837e-1fa681f4462b",
    "user-agent": "codex_cli_rs/0.58.0 (Windows 10.0.26200; x86_64) WindowsTerminal",
    "content-type": "application/json",
    "accept": "text/event-stream"
  },
  "body": {
    "model": "gpt-5.1-codex",
    "stream": true,
    "instructions": "You are Codex, based on GPT-5. ...",
    "tools": [...]
  }
}
```

### 1.2 关键请求头

| 字段 | 值示例 | 说明 |
|------|--------|------|
| `session_id` | `019a9544-7ab1-73c1-837e-1fa681f4462b` | UUID v7 格式会话标识 |
| `user-agent` | `codex_cli_rs/0.58.0 (Windows 10.0.26200; x86_64) WindowsTerminal` | 客户端标识（含OS、架构、终端） |
| `content-type` | `application/json` | 请求格式 |
| `accept` | `text/event-stream` | 流式响应（SSE） |
| `authorization` | `Bearer cr_1390d...a2412b7a` | 你的 API Key |

### 1.3 请求体结构

```json
{
  "model": "gpt-5.1-codex",        // 固定模型
  "stream": true,                   // 固定流式
  "instructions": "...",            // 系统提示（固定）
  "tools": [                        // 7 个工具
    {"type": "function", "function": {"name": "shell", ...}},
    {"type": "function", "function": {"name": "list_mcp_resources", ...}},
    {"type": "function", "function": {"name": "list_mcp_resource_templates", ...}},
    {"type": "function", "function": {"name": "read_mcp_resource", ...}},
    {"type": "function", "function": {"name": "update_plan", ...}},
    {"type": "function", "function": {"name": "apply_patch", ...}},
    {"type": "function", "function": {"name": "view_image", ...}}
  ]
}
```

---

## 🔍 二、多客户端差异对比（并发伪装分析）

### 2.1 客户端识别信息

#### 客户端 1 (Windows - WSL 外)
```
User-Agent: codex_cli_rs/0.58.0 (Windows 10.0.26200; x86_64) WindowsTerminal
Session ID: 019a9544-7ab1-73c1-837e-1fa681f4462b
IP: 127.0.0.1
```

#### 客户端 2 (Ubuntu - WSL 内)
```
User-Agent: codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color
Session ID: 019a9543-6c61-7310-8e37-f069df526d56
IP: 127.0.0.1
```

### 2.2 差异点详细对比

| 字段 | 客户端1 (Windows) | 客户端2 (Ubuntu) | 是否相同 | 重要性 |
|------|------------------|-----------------|---------|--------|
| **session_id** | `019a9544-7ab1-...` | `019a9543-6c61-...` | ❌ 不同 | 🔴 **必须不同** |
| **user-agent** | `Windows 10.0.26200; WindowsTerminal` | `Ubuntu 24.4.0; xterm-256color` | ❌ 不同 | 🟡 可变 |
| **model** | `gpt-5.1-codex` | `gpt-5.1-codex` | ✅ 相同 | 🟢 应相同 |
| **stream** | `true` | `true` | ✅ 相同 | 🟢 应相同 |
| **instructions** | `You are Codex...` | `You are Codex...` | ✅ 相同* | 🟢 应相同 |
| **tools** | 7 个工具 | 7 个工具 | ✅ 相同 | 🟢 应相同 |
| **content-type** | `application/json` | `application/json` | ✅ 相同 | 🟢 应相同 |
| **accept** | `text/event-stream` | `text/event-stream` | ✅ 相同 | 🟢 应相同 |

> *注意：instructions 在两个客户端中换行符不同（`\r\n` vs `\n`），但内容相同

### 2.3 Session ID 格式分析

```
客户端1: 019a9544-7ab1-73c1-837e-1fa681f4462b
客户端2: 019a9543-6c61-7310-8e37-f069df526d56

格式: UUID v7 (时间戳前缀)
      ^^^^^^^^ - 时间戳部分（相近）
              ^^^^ - 随机部分
```

**观察**：
- 两个 Session ID 的时间戳前缀非常接近（`019a9544` vs `019a9543`）
- 这表明它们是在大约 1 分钟内创建的（WSL 内先创建，WSL 外后创建）
- 每个客户端会话保持相同的 Session ID（同一客户端的两个请求使用同一 ID）

---

## 💡 三、并发伪装策略建议

基于以上分析，以下是针对 Codex 并发请求的伪装建议：

### 3.1 必须变化的字段（🔴 高优先级）

#### 1. `session_id` - 会话标识符
```javascript
// 每个并发请求必须使用不同的 UUID v7
const sessionId = generateUUIDv7()

// 格式示例
"019a9544-7ab1-73c1-837e-1fa681f4462b"
```

**重要性**：⭐⭐⭐⭐⭐
**原因**：这是区分不同会话的核心标识，服务端可能用它来追踪和限制并发

#### 2. 请求内容（messages）
```javascript
// 不同的并发请求应该有不同的消息内容
// （虽然本次测试中没有 messages，但实际使用时会有）
```

### 3.2 应该保持相同的字段（🟢 保持一致）

#### 1. `model` - 模型名称
```
固定值: "gpt-5.1-codex"
```

#### 2. `stream` - 流式标志
```
固定值: true
```

#### 3. `instructions` - 系统提示
```
固定值: "You are Codex, based on GPT-5. You are running as a coding agent..."
注意: 保持换行符一致（建议使用 \n）
```

#### 4. `tools` - 工具列表
```
固定 7 个工具: shell, list_mcp_resources, list_mcp_resource_templates,
              read_mcp_resource, update_plan, apply_patch, view_image
```

#### 5. 基本请求头
```
content-type: application/json
accept: text/event-stream
```

### 3.3 可选变化的字段（🟡 灵活处理）

#### 1. `user-agent` - 客户端标识

**选项 A - 完全相同（推荐用于简单伪装）**
```
所有并发请求使用同一 User-Agent
例如: "codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color"
```

**选项 B - 轻微变化（推荐用于高级伪装）**
```javascript
// 保持版本和架构不变，只改变终端类型
const terminals = ['xterm-256color', 'screen-256color', 'tmux-256color']
const userAgent = `codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) ${randomChoice(terminals)}`
```

**不推荐**：完全不同的 OS 或架构（会显得很假）

---

## 🎯 四、并发伪装实现建议

### 4.1 核心伪装逻辑

```javascript
// 伪装池配置
const DISGUISE_CONFIG = {
  // 固定字段（所有并发请求保持相同）
  fixed: {
    model: "gpt-5.1-codex",
    stream: true,
    instructions: "You are Codex, based on GPT-5...",
    tools: [...], // 7 个固定工具
    userAgent: "codex_cli_rs/0.58.0 (Ubuntu 24.4.0; x86_64) xterm-256color",
    headers: {
      'content-type': 'application/json',
      'accept': 'text/event-stream'
    }
  },

  // 可变字段（每个请求生成新值）
  variable: {
    sessionIdGenerator: () => generateUUIDv7(),
    // 可选：轻微变化 user-agent
    // userAgentVariation: () => randomTerminal()
  }
}

// 生成伪装请求
function createDisguisedRequest(actualContent) {
  return {
    headers: {
      ...DISGUISE_CONFIG.fixed.headers,
      'session_id': DISGUISE_CONFIG.variable.sessionIdGenerator(),
      'user-agent': DISGUISE_CONFIG.fixed.userAgent,
      'authorization': `Bearer ${YOUR_API_KEY}`
    },
    body: {
      model: DISGUISE_CONFIG.fixed.model,
      stream: DISGUISE_CONFIG.fixed.stream,
      instructions: DISGUISE_CONFIG.fixed.instructions,
      tools: DISGUISE_CONFIG.fixed.tools,
      messages: actualContent.messages // 唯一真实变化的部分
    }
  }
}
```

### 4.2 UUID v7 生成器

```javascript
// UUID v7 生成（带时间戳前缀）
function generateUUIDv7() {
  const timestamp = Date.now()
  const hex = timestamp.toString(16).padStart(12, '0')
  const random = crypto.randomBytes(10).toString('hex')

  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-7${random.substring(0, 3)}-${random.substring(3, 7)}-${random.substring(7, 19)}`
}

// 示例输出
// 019a9544-7ab1-73c1-837e-1fa681f4462b
//  ^^^^^^^^ 时间戳
//       ^^^^ 时间戳（低位）
//            ^ 版本号 (7)
//             ^^^ 随机
//                 ^^^^ 随机（variant位）
//                      ^^^^^^^^^^^^ 随机
```

### 4.3 并发请求池管理

```javascript
class DisguisePool {
  constructor(size = 3) {
    this.sessions = []
    for (let i = 0; i < size; i++) {
      this.sessions.push({
        sessionId: generateUUIDv7(),
        createdAt: Date.now(),
        requestCount: 0
      })
    }
  }

  // 获取一个 session（轮询）
  getSession() {
    const session = this.sessions.shift()
    this.sessions.push(session)
    session.requestCount++
    return session
  }

  // 定期刷新（避免 session 被识别）
  refresh() {
    this.sessions = this.sessions.map(s => ({
      sessionId: generateUUIDv7(),
      createdAt: Date.now(),
      requestCount: 0
    }))
  }
}

// 使用示例
const pool = new DisguisePool(3) // 3个并发 session

// 每 5 天刷新一次
setInterval(() => pool.refresh(), 5 * 24 * 60 * 60 * 1000)

// 发送请求
async function sendRequest(content) {
  const session = pool.getSession()
  const request = createDisguisedRequest(content)
  request.headers['session_id'] = session.sessionId

  return await fetch(API_URL, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(request.body)
  })
}
```

---

## ⚠️ 五、风险提示

### 5.1 服务端可能的检测点

1. **Session ID 重用检测**
   - 同一 Session ID 在短时间内发送大量不同内容
   - 建议：使用 session 池，定期轮换

2. **并发请求模式检测**
   - 多个请求在完全相同的时间点（毫秒级）到达
   - 建议：添加随机延迟（50-200ms）

3. **User-Agent 一致性检测**
   - 相同 User-Agent 但来自不同 IP
   - 建议：如果使用多 IP，配合 User-Agent 变化

4. **Instructions 版本检测**
   - Instructions 内容与客户端版本不匹配
   - 建议：使用真实 Codex CLI 的 instructions

### 5.2 最佳实践

✅ **推荐做法**：
- 使用小规模 session 池（3-5 个）
- 定期刷新 session（每 5-7 天）
- 保持请求间隔（50-200ms 随机延迟）
- 使用真实的 Codex CLI User-Agent
- 固定使用单一客户端特征（不混用 Windows/Ubuntu）

❌ **不推荐做法**：
- 多个并发请求使用同一 Session ID
- 频繁切换 User-Agent（尤其是 OS/架构）
- 零延迟的批量并发请求
- 使用明显伪造的 Session ID（非 UUID v7 格式）

---

## 📝 六、总结

### 6.1 Codex 请求特征

| 特征 | 值 |
|------|-----|
| 端点 | `/openai/responses` |
| 方法 | `POST` |
| 模型 | `gpt-5.1-codex` (固定) |
| 流式 | `true` (固定) |
| 工具数 | 7 个 (固定) |
| Session 格式 | UUID v7 |
| User-Agent 格式 | `codex_cli_rs/{version} ({OS} {version}; {arch}) {terminal}` |

### 6.2 并发伪装核心原则

1. **Session ID 必须不同** - 这是最重要的区分点
2. **User-Agent 应保持一致** - 避免看起来像不同客户端
3. **Instructions 和 Tools 保持固定** - 使用真实 Codex CLI 的配置
4. **添加随机延迟** - 避免完全同步的并发请求
5. **使用 Session 池** - 定期轮换，避免单一 Session 过度使用

### 6.3 下一步行动

1. 实现 UUID v7 生成器
2. 创建 Session 池管理器
3. 配置请求伪装中间件
4. 测试并发请求（2-3 个并发开始）
5. 监控服务端响应（观察是否有限流或检测）

---

**文件位置**：
- 完整日志数据：`/tmp/codex-logs-analysis.json`
- 分析脚本：`scripts/analyze-codex-logs.js`
- 本报告：`CODEX_REQUEST_ANALYSIS.md`
