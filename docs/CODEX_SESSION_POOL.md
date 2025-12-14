# Codex Session Pool 动态管理

## 概述

为 **OpenAI Responses (Codex)** 实现的动态 session_id 池管理系统，与 Claude Session Pool 功能相同。同时支持 **User-Agent 伪装**。

## 快速开始

### 1. 启用 Codex Session Pool

在 `.env` 文件中配置：

```bash
# Codex Session Pool 配置
USE_CODEX_SESSION_POOL=true                      # 启用 (默认: true)
CODEX_SESSION_POOL_MIN_SIZE=3                    # 最小池大小
CODEX_SESSION_POOL_MAX_SIZE=20                   # 最大池大小
CODEX_SESSION_SWITCH_PROBABILITY=0.1             # 切换概率 (10%)
CODEX_SESSION_MIN_SWITCH_INTERVAL_MS=300000      # 最小间隔 (5分钟)

# User-Agent 伪装
CODEX_USER_AGENT=codex_cli_rs/0.72.0              # 伪装成 Codex CLI

# Fallback 配置
CODEX_SESSION_ID=019a9544-7ab1-73c1-837e-1fa681f4462b
```

### 支持的 User-Agent 格式

官方 Codex CLI 的 UA 格式：
- `codex_vscode/x.x.x` - VSCode 插件
- `codex_cli_rs/x.x.x` - Rust CLI（推荐）

**推荐配置**:
```bash
CODEX_USER_AGENT=codex_cli_rs/0.72.0
```

### 2. 设置白名单 API Key

与 Claude 相同，使用 `collectSession` 字段：

```bash
PATCH /admin/api-keys/{keyId}/collect-session
{
  "collectSession": true
}
```

### 3. 使用白名单 Key 发送 Codex 请求

```bash
POST /openai/responses
Authorization: Bearer cr_your_whitelist_key
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [...],
  "session_id": "your-real-session-id"  # 会被收集
}
```

## 工作原理

### Session 提取

Codex 的 session_id 可能在两个位置：

1. **请求体**: `req.body.session_id`
2. **请求头**: `req.headers['session_id']`

系统会自动从这两个位置提取 session_id。

### Session 格式验证

Codex session 必须是标准 UUID 格式：
```
019a9544-7ab1-73c1-837e-1fa681f4462b
```

格式验证正则：`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`

### 注入位置

伪装后的数据会注入到：
- **session_id**:
  - `req.headers['session_id']` - 请求头
  - `req.body.session_id` - 请求体
- **User-Agent**:
  - `req.headers['user-agent']` - 伪装成 Codex CLI

**示例**:
```javascript
// 伪装前
req.headers['user-agent'] = 'PostmanRuntime/7.26.8'
req.body.session_id = undefined

// 伪装后
req.headers['user-agent'] = 'codex_cli_rs/0.72.0'
req.headers['session_id'] = '019a9544-...'
req.body.session_id = '019a9544-...'
```

## 管理接口

### 1. 查看 Codex Session Pool 状态

```bash
GET /admin/codex-session-pool/stats
```

**响应**:
```json
{
  "success": true,
  "data": {
    "currentSession": "019a9544-7ab1-73c1-837e-1fa681f4462b",
    "poolSize": 5,
    "sessions": ["...", "..."],
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

### 2. 手动切换 Codex Session

```bash
POST /admin/codex-session-pool/switch
```

### 3. 设置当前 Codex Session

```bash
POST /admin/codex-session-pool/set-current
Content-Type: application/json

{
  "sessionId": "019a9544-7ab1-73c1-837e-1fa681f4462b"
}
```

### 4. 清空 Codex Session Pool

```bash
DELETE /admin/codex-session-pool
```

## Redis 数据结构

```
codex_session_pool:available      # Redis Set，可用 session_id
codex_session_pool:current         # Redis String，当前 session_id
codex_session_pool:last_switch     # Redis String，上次切换时间
```

## 与 Claude Session Pool 的区别

| 特性 | Claude Session Pool | Codex Session Pool |
|------|---------------------|-------------------|
| Session 位置 | `metadata.user_id` | 请求头 + 请求体 |
| Session 格式 | `user_{machine}_account__session_{uuid}` | 直接 UUID |
| 提取方式 | 正则匹配 | 直接读取 |
| 验证方式 | 无特殊验证 | UUID 格式验证 |
| 注入位置 | `metadata.user_id` | 请求头 + 请求体 |
| User-Agent | `claude-cli/2.0.69` | `codex_cli_rs/0.72.0` |
| UA 伪装 | ✅ 是 | ✅ 是 |

## 日志示例

```
[CodexSessionPool] Initialized with default session: 019a9544-...
[CodexSessionPool] Collected session from whitelist API Key: cr_xxx -> 019a9544-...
[CodexSessionPool] Added new session to pool: 019a9544-... (pool size: 2)
[CodexSessionPool] Switched session: 019a9544-... -> 12345678-...
[CodexSessionPool] Invalid session format: not-a-uuid
```

## 完整示例

### 1. 设置白名单

```bash
curl -X PATCH \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{"collectSession": true}' \
  http://localhost:3000/admin/api-keys/key-001/collect-session
```

### 2. 使用白名单 Key 发送 Codex 请求

```bash
curl -X POST http://localhost:3000/openai/responses \
  -H "Authorization: Bearer cr_whitelist_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "session_id": "019a9544-7ab1-73c1-837e-1fa681f4462b"
  }'
```

### 3. 检查池状态

```bash
curl -H "Authorization: Bearer admin_token" \
  http://localhost:3000/admin/codex-session-pool/stats
```

## 常见问题

### Q: Codex 和 Claude 能共用同一个 API Key 的白名单标记吗？

**A**: 是的！`collectSession: true` 会同时启用 Claude 和 Codex 的 session 收集。系统会智能识别请求类型并收集对应的 session。

### Q: 如果请求中没有 session_id 会怎样？

**A**:
- 收集时：忽略此请求，不会收集到池中
- 伪装时：注入池中的 session_id（或 fallback session）

### Q: Codex session 格式必须是 UUID 吗？

**A**: 是的。为了安全和一致性，只收集符合 UUID 格式的 session。

### Q: 可以同时使用 Claude 和 Codex Session Pool 吗？

**A**: 可以！两个池完全独立：
- Claude Pool: 管理 Claude 请求的 session
- Codex Pool: 管理 Codex 请求的 session
- 可以独立启用/禁用、独立配置

## 禁用 Codex Session Pool

如果只想使用固定 session：

```bash
USE_CODEX_SESSION_POOL=false
CODEX_SESSION_ID=your-fixed-session-id
```

## 快速命令汇总

```bash
# 查看池状态
GET /admin/codex-session-pool/stats

# 手动切换
POST /admin/codex-session-pool/switch

# 设置当前 session
POST /admin/codex-session-pool/set-current {"sessionId": "..."}

# 清空池
DELETE /admin/codex-session-pool

# 启用白名单 (与 Claude 共用)
PATCH /admin/api-keys/{id}/collect-session {"collectSession": true}
```

## 最佳实践

1. ✅ **共用白名单**: 标记的 API Key 同时为 Claude 和 Codex 收集 session
2. ✅ **独立监控**: 分别检查两个池的状态
3. ✅ **格式验证**: 确保 Codex 请求中的 session_id 是有效的 UUID
4. ✅ **定期检查**: 监控两个池的大小和切换频率

现在你可以同时使用 Claude 和 Codex Session Pool 了！🎉
