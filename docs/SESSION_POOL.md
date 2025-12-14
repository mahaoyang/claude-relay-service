# Session Pool 动态管理

## 概述

Session Pool 是一个**非入侵式**的动态 session_id 管理系统，用于 Claude 伪装中间件。它能够：

- 🎯 从白名单 API Key 的请求中收集真实的 session_id
- 🔄 维护一个 session_id 池，定期随机切换
- 🎲 每个时间段只使用一个 session_id（全局共享）
- 🚀 完全非阻塞，不影响请求性能

## 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│  客户端请求 (带真实 session_id)                                  │
│  metadata.user_id = "user_{machine}_account__session_{真实ID}"  │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  auth.js 中间件                                                  │
│  - 验证 API Key                                                  │
│  - 检查是否为白名单 (isWhitelisted/collectSession)              │
│  - 异步收集 session_id 到池中 (非阻塞)                          │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  sessionPoolService                                              │
│  - 提取 session_id (正则匹配)                                    │
│  - 添加到 Redis Set (自动去重)                                   │
│  - 检查池大小限制 (MAX_POOL_SIZE)                                │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  disguise.js 中间件                                              │
│  - 随机决定是否切换 session (概率 + 最小间隔限制)               │
│  - 从池中获取当前 session_id                                     │
│  - 构建伪装的 user_id                                            │
│  - 所有请求共享同一个 session_id                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 配置说明

### 环境变量

在 `.env` 文件中配置：

```bash
# 🎭 Session Pool 配置
USE_SESSION_POOL=true                      # 启用 session pool (默认: true)
SESSION_POOL_MIN_SIZE=3                    # 最小池大小 (默认: 3)
SESSION_POOL_MAX_SIZE=20                   # 最大池大小 (默认: 20)
SESSION_SWITCH_PROBABILITY=0.1             # 切换概率 (默认: 0.1 即 10%)
SESSION_MIN_SWITCH_INTERVAL_MS=300000      # 最小切换间隔 (默认: 5 分钟)

# 🎭 Fallback 配置 (当 session pool 禁用时使用)
DISGUISE_SESSION_ID=9f10edbb-1407-47e1-9b85-fa634be33732
DISGUISE_CLIENT_ID=1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf
DISGUISE_UA=claude-cli/2.0.69 (external, cli)
```

### 配置说明

| 配置项 | 默认值 | 说明 |
|-------|--------|------|
| `USE_SESSION_POOL` | `true` | 是否启用动态 session pool |
| `SESSION_POOL_MIN_SIZE` | `3` | 池大小小于此值时不切换 session |
| `SESSION_POOL_MAX_SIZE` | `20` | 池大小上限，超过后不再收集新 session |
| `SESSION_SWITCH_PROBABILITY` | `0.1` | 每次请求切换 session 的概率 (0.0-1.0) |
| `SESSION_MIN_SWITCH_INTERVAL_MS` | `300000` | 最小切换间隔（毫秒），避免频繁切换 |

## API Key 白名单配置

要让某个 API Key 的 session_id 被收集到池中，需要在 API Key 数据中设置以下字段之一：

- `isWhitelisted: true` - 标记为白名单
- `collectSession: true` - 启用 session 收集

可以通过以下方式配置：

### 方法 1: 通过 Redis 直接修改

```bash
# 获取 API Key 数据
redis-cli GET "api_key:{keyId}"

# 更新字段 (需要解析 JSON 并重新设置)
# 添加 "isWhitelisted": true 或 "collectSession": true
```

### 方法 2: 通过管理接口

```javascript
// 在创建或更新 API Key 时添加字段
{
  "name": "WhitelistKey",
  "isWhitelisted": true,  // 或 collectSession: true
  // ... 其他配置
}
```

## 管理接口

### 1. 查看 Session Pool 状态

```bash
GET /admin/session-pool/stats
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "currentSession": "9f10edbb-1407-47e1-9b85-fa634be33732",
    "poolSize": 5,
    "sessions": [
      "9f10edbb-1407-47e1-9b85-fa634be33732",
      "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "..."
    ],
    "lastSwitchTime": 1702345678000,
    "config": {
      "minPoolSize": 3,
      "maxPoolSize": 20,
      "switchProbability": 0.1,
      "minSwitchIntervalMs": 300000
    }
  }
}
```

### 2. 手动触发切换

```bash
POST /admin/session-pool/switch
```

**响应示例**:
```json
{
  "success": true,
  "switched": true,
  "message": "Session switched successfully"
}
```

### 3. 手动设置当前 session

```bash
POST /admin/session-pool/set-current
Content-Type: application/json

{
  "sessionId": "new-session-id-here"
}
```

### 4. 清空 Session Pool

```bash
DELETE /admin/session-pool
```

**注意**: 清空后会保留当前使用的 session。

## 工作流程详解

### 1. Session 收集

```javascript
// auth.js 中间件中 (非阻塞)
if (req.apiKeyData?.isWhitelisted || req.apiKeyData?.collectSession) {
  sessionPoolService.collectFromWhitelist(req).catch(err => {
    logger.debug(`[SessionPool] Collection failed: ${err.message}`)
  })
}
```

### 2. Session 提取

```javascript
// 从 metadata.user_id 中提取 session_id
// 格式: "user_{machine_id}_account__session_{session_id}"
const match = userId.match(/session_([a-f0-9-]+)$/i)
```

### 3. 随机切换

```javascript
// disguise.js 中间件中
if (USE_SESSION_POOL) {
  await sessionPoolService.maybeSwitch()  // 随机决定是否切换
  sessionId = await sessionPoolService.getCurrentSession()
}
```

**切换条件**:
- 距离上次切换时间 >= `SESSION_MIN_SWITCH_INTERVAL_MS`
- 随机数 <= `SESSION_SWITCH_PROBABILITY`
- 池大小 >= `SESSION_POOL_MIN_SIZE`
- 抽中的 session 与当前不同

### 4. 伪装应用

```javascript
// 使用当前 session 构建 user_id
req.body.metadata.user_id = buildUserId(sessionId)
// 结果: "user_{machine_id}_account__session_{当前池中的session}"
```

## Redis 数据结构

```
session_pool:available          # Redis Set，存储所有可用的 session_id
session_pool:current             # Redis String，当前使用的 session_id
session_pool:last_switch         # Redis String，上次切换的时间戳
```

## 监控和调试

### 日志输出

启用 session pool 后，会输出以下日志：

```
[SessionPool] Initialized with default session: 9f10edbb-1407-47e1-9b85-fa634be33732
[SessionPool] Added new session to pool: a1b2c3d4-... (pool size: 2)
[SessionPool] Collected session from whitelist API Key: cr_xxx -> a1b2c3d4-...
[SessionPool] Switched session: 9f10edbb-... -> a1b2c3d4-...
[SessionPool] Pool too small (2), skip switching
```

### 检查池状态

```bash
# 使用管理接口
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/admin/session-pool/stats

# 或直接查询 Redis
redis-cli SMEMBERS session_pool:available
redis-cli GET session_pool:current
redis-cli GET session_pool:last_switch
```

## 最佳实践

### 1. 初始化池

- 至少配置 **3-5 个白名单 API Key**，确保能快速积累 session
- 池大小建议 **10-20 个** session，保证多样性

### 2. 切换策略

- **生产环境**: `SESSION_SWITCH_PROBABILITY=0.05` (5%)，减少切换频率
- **开发环境**: `SESSION_SWITCH_PROBABILITY=0.2` (20%)，快速测试

### 3. 切换间隔

- **保守策略**: `SESSION_MIN_SWITCH_INTERVAL_MS=600000` (10 分钟)
- **激进策略**: `SESSION_MIN_SWITCH_INTERVAL_MS=180000` (3 分钟)

### 4. 禁用 Session Pool

如果需要回退到固定 session 模式：

```bash
USE_SESSION_POOL=false
DISGUISE_SESSION_ID=your-fixed-session-id
```

## 故障排除

### 问题 1: 池始终为空

**原因**: 没有白名单 API Key，或白名单 Key 没有发送请求

**解决**:
1. 确认至少有一个 API Key 设置了 `isWhitelisted: true`
2. 使用该 Key 发送几个请求，检查日志是否有收集信息
3. 查看 `/admin/session-pool/stats` 确认池大小

### 问题 2: 从不切换 session

**原因**: 切换概率太低、间隔太长、或池太小

**解决**:
1. 检查 `SESSION_SWITCH_PROBABILITY` 是否太低
2. 确认距离上次切换已超过 `SESSION_MIN_SWITCH_INTERVAL_MS`
3. 确保池大小 >= `SESSION_POOL_MIN_SIZE`

### 问题 3: 性能问题

**原因**: session 收集是异步非阻塞的，理论上不会影响性能

**检查**:
1. 查看日志是否有大量 `[SessionPool] Collection failed` 错误
2. 检查 Redis 连接是否正常
3. 如果仍有问题，可临时禁用 `USE_SESSION_POOL=false`

## 与其他功能的兼容性

- ✅ **伪装中间件**: 完全兼容，session pool 是伪装中间件的增强
- ✅ **浏览器兜底**: 兼容，浏览器请求也会被伪装
- ✅ **API Key 限流**: 兼容，session 收集不影响限流逻辑
- ✅ **并发控制**: 兼容，异步收集不占用并发资源
- ✅ **粘性会话**: 兼容，伪装的 session 不影响账户绑定

## 安全考虑

- 🔒 **隔离收集**: 只从白名单 API Key 收集，避免收集恶意 session
- 🔒 **池大小限制**: `MAX_POOL_SIZE` 防止池无限增长
- 🔒 **自动去重**: Redis Set 自动去重，避免重复 session
- 🔒 **Fallback 机制**: 出错时自动回退到默认 session，不影响服务

## 总结

Session Pool 是一个**智能、非入侵式**的 session_id 管理方案，能够：

- 📊 动态收集真实的 session_id
- 🔄 随机切换，降低指纹识别风险
- 🎯 全局单一 session，保持一致性
- 🚀 完全异步，零性能影响
- 🛡️ 安全可控，支持白名单机制

启用后，系统会自动从白名单用户请求中学习真实的 session_id，并随机使用它们，大大降低了被 API 识别为异常流量的风险。
