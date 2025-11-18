# 🔄 Codex 重放攻击测试指南

## 📋 测试目的

验证服务是否能检测和防御重放攻击。重放攻击是指攻击者截获合法的请求，然后多次重复发送以绕过安全检查或消耗资源。

## 🚀 快速开始

### 1. 提供真实的 API Key

因为日志中的 API Key 被脱敏了（`Bearer cr_1390d...a2412b7a`），你需要提供真实的 API Key：

```bash
# 方法 1: 通过环境变量
export REPLAY_API_KEY="Bearer cr_your_real_api_key_here"
node scripts/test-replay-attack.js

# 方法 2: 一行命令
REPLAY_API_KEY="Bearer cr_your_real_api_key_here" node scripts/test-replay-attack.js
```

### 2. 基本测试（顺序重放 3 次）

```bash
REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-attack.js
```

### 3. 高级测试

```bash
# 重放 5 次，每次间隔 2 秒
REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-attack.js --count 5 --delay 2000

# 并发重放（同时发送 3 个请求）
REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-attack.js --concurrent

# 快速测试（间隔 100ms）
REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-attack.js --count 5 --delay 100

# 指定目标服务器
REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-attack.js --url http://your-server:3010
```

## 📊 测试场景

### 场景 1: 顺序重放（默认）

测试服务是否能检测到相同请求的多次提交：

```bash
REPLAY_API_KEY="Bearer cr_xxxxx" \
node scripts/test-replay-attack.js --count 3 --delay 1000
```

**预期结果**：
- ✅ **良好**：只有第一个请求成功（200），后续请求失败（401/403/409）
- ⚠️ **有风险**：所有请求都成功（200）

### 场景 2: 并发重放

测试服务是否能检测到同时发送的重复请求：

```bash
REPLAY_API_KEY="Bearer cr_xxxxx" \
node scripts/test-replay-attack.js --count 3 --concurrent
```

**预期结果**：
- ✅ **良好**：只有一个请求成功，其他被拒绝
- ⚠️ **有风险**：多个请求同时成功

### 场景 3: 快速连续重放

测试服务的响应速度和保护机制：

```bash
REPLAY_API_KEY="Bearer cr_xxxxx" \
node scripts/test-replay-attack.js --count 10 --delay 100
```

## 📈 结果解读

### 理想结果（有重放保护）

```
📊 状态码分布:
   200: 1 次 (33.3%)    ← 第一个请求成功
   401: 2 次 (66.7%)    ← 后续请求被拒绝

🔍 重放攻击保护分析:
   ✅ 只有第一个请求成功，后续请求被拒绝
   ✅ 服务可能有重放攻击保护
   ✅ 相同的 session_id 只能使用一次
```

### 危险结果（无重放保护）

```
📊 状态码分布:
   200: 3 次 (100.0%)   ← 所有请求都成功！

🔍 重放攻击保护分析:
   ⚠️  所有重放请求都成功了！
   ⚠️  服务可能没有重放攻击保护
   ⚠️  相同的 session_id 被接受了多次
```

### 部分保护（可能是速率限制）

```
📊 状态码分布:
   200: 2 次 (66.7%)    ← 部分请求成功
   429: 1 次 (33.3%)    ← 触发速率限制

🔍 重放攻击保护分析:
   🟡 部分请求成功，部分失败
   🟡 可能有速率限制或其他保护机制
```

## 🛡️ 重放攻击保护建议

### 当前服务状态检查

从你的代码来看，`openaiRoutes.js` 目前**没有**实现 session_id 的唯一性检查。这意味着：

⚠️ **潜在风险**：相同的 session_id 可以被重复使用

### 推荐实施的保护措施

#### 1. Session ID 唯一性检查（最重要）

```javascript
// 在 openaiRoutes.js 的 handleResponses 函数中添加
const sessionId = req.headers['session_id'] || req.body?.session_id

if (sessionId) {
  const usedKey = `used_session:${sessionId}`
  const isUsed = await redis.getClient().get(usedKey)

  if (isUsed) {
    logger.security(`🚫 重放攻击检测: Session ID ${sessionId} 已被使用`)
    return res.status(409).json({
      error: {
        type: 'replay_attack',
        message: 'This session ID has already been used',
        code: 'session_already_used'
      }
    })
  }

  // 标记为已使用（24 小时过期）
  await redis.getClient().setex(usedKey, 86400, Date.now())
}
```

#### 2. 时间戳验证

```javascript
// 检查请求时间戳（如果客户端提供）
const requestTime = req.headers['x-request-time']
if (requestTime) {
  const timeDiff = Date.now() - parseInt(requestTime)
  if (timeDiff > 5 * 60 * 1000) { // 超过 5 分钟
    return res.status(403).json({
      error: { message: 'Request expired' }
    })
  }
}
```

#### 3. Nonce 机制

```javascript
// 要求客户端提供随机 nonce
const nonce = req.headers['x-nonce']
if (nonce) {
  const nonceKey = `nonce:${nonce}`
  if (await redis.getClient().get(nonceKey)) {
    return res.status(409).json({
      error: { message: 'Nonce already used' }
    })
  }
  await redis.getClient().setex(nonceKey, 3600, '1')
}
```

## 📝 完整测试流程

### 步骤 1: 发送真实请求

先正常使用 Codex CLI 发送一些请求，让系统捕获请求格式：

```bash
# 在 WSL 内或外使用 Codex CLI
codex "你好"
```

### 步骤 2: 运行重放攻击测试

```bash
# 获取你的 API Key
# 从 web 界面或数据库中查看

# 运行测试
REPLAY_API_KEY="Bearer cr_your_key" node scripts/test-replay-attack.js
```

### 步骤 3: 查看测试结果

脚本会自动分析并给出安全建议。

### 步骤 4: 实施保护措施（如果需要）

根据测试结果，在代码中添加相应的保护机制。

## 🔧 脚本选项

```bash
node scripts/test-replay-attack.js [选项]

选项:
  --url <url>           目标 URL（默认: http://localhost:3010）
  --count <number>      重放次数（默认: 3）
  --delay <ms>          请求间隔（默认: 1000ms）
  --concurrent          并发重放（同时发送）
  --help, -h            显示帮助信息

环境变量:
  REPLAY_API_KEY        真实的 API Key（必须）
```

## 📊 测试记录

### 测试 1: 初始测试（API Key 脱敏）

```
日期: 2025-11-18 13:04:20
结果: 401 Unauthorized (100%)
原因: API Key 被脱敏，无法通过认证
```

### 测试 2: 使用真实 API Key（待执行）

```bash
# 执行命令
REPLAY_API_KEY="Bearer cr_xxxxx" node scripts/test-replay-attack.js

# 记录结果
日期: ___________
结果: ___________
分析: ___________
```

## ⚠️ 注意事项

1. **只在测试环境运行**：不要在生产环境进行重放攻击测试
2. **使用真实 API Key**：测试需要有效的认证凭据
3. **观察服务状态**：测试可能触发速率限制或其他保护机制
4. **记录测试结果**：用于改进安全策略

## 🎯 安全目标

- ✅ Session ID 只能使用一次
- ✅ 重复请求被拒绝（409 Conflict）
- ✅ 有明确的错误信息
- ✅ 日志记录可疑活动
- ✅ 自动清理过期的 session 记录

---

**下一步**：提供真实的 API Key 并运行测试，然后根据结果决定是否需要添加重放攻击保护。
