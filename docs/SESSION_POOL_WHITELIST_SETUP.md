# Session Pool 白名单快速设置指南

## 概述

Session Pool 从**白名单 API Key** 的请求中收集真实的 session_id。只需要标记几个 API Key 为白名单，系统就会自动收集并使用它们的 session。

## 方法 1: 通过管理接口（推荐）

### 1. 获取现有 API Key 列表

```bash
GET /admin/api-keys
Authorization: Bearer YOUR_ADMIN_TOKEN
```

找到你想要设为白名单的 API Key，记下它的 `id`。

### 2. 设置白名单状态

```bash
PATCH /admin/api-keys/{keyId}/collect-session
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "collectSession": true
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "Session collection enabled for API key",
  "data": {
    "id": "abc123...",
    "collectSession": true
  }
}
```

### 3. 取消白名单状态

```bash
PATCH /admin/api-keys/{keyId}/collect-session
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "collectSession": false
}
```

## 方法 2: 创建新 API Key 时直接设置

```bash
POST /admin/api-keys
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Whitelist Key for Session Collection",
  "description": "用于收集真实 session_id",
  "collectSession": true,
  "tokenLimit": 100000,
  "concurrencyLimit": 10,
  "permissions": "all"
}
```

## 方法 3: 通过 Redis 直接修改（高级）

### 1. 获取 API Key 数据

```bash
redis-cli GET "api_key:{keyId}"
```

### 2. 解析 JSON 并添加字段

```bash
# 例如使用 jq 工具
redis-cli GET "api_key:{keyId}" | jq '. + {collectSession: "true"}'
```

### 3. 写回 Redis

```bash
redis-cli SET "api_key:{keyId}" "{修改后的JSON}"
```

**注意**: Redis 中存储的是字符串，所以 `collectSession: "true"` 而不是 `collectSession: true`

## 推荐配置

### 最小配置（快速启动）

至少设置 **1-2 个** API Key 为白名单：

```bash
# 设置你自己的 API Key 为白名单
PATCH /admin/api-keys/{你的keyId}/collect-session
{
  "collectSession": true
}
```

然后使用这个 Key 发送几个请求，系统就会开始收集 session。

### 生产配置（推荐）

设置 **3-5 个** API Key 为白名单，确保多样性：

```bash
# 设置多个不同的 API Key
PATCH /admin/api-keys/{key1}/collect-session {"collectSession": true}
PATCH /admin/api-keys/{key2}/collect-session {"collectSession": true}
PATCH /admin/api-keys/{key3}/collect-session {"collectSession": true}
```

## 验证白名单是否生效

### 1. 查看 API Key 配置

```bash
GET /admin/api-keys/{keyId}
```

检查响应中的 `collectSession` 字段：

```json
{
  "id": "abc123...",
  "name": "My Whitelist Key",
  "collectSession": true,  // ✅ 已启用
  ...
}
```

### 2. 查看日志

使用白名单 API Key 发送请求后，查看日志：

```bash
tail -f logs/claude-relay-*.log | grep SessionPool
```

应该看到类似的日志：

```
[SessionPool] Collected session from whitelist API Key: cr_xxx -> 9f10edbb-...
[SessionPool] Added new session to pool: 9f10edbb-... (pool size: 2)
```

### 3. 检查 Session Pool 状态

```bash
GET /admin/session-pool/stats
```

查看池大小和 session 列表：

```json
{
  "success": true,
  "data": {
    "currentSession": "9f10edbb-1407-47e1-9b85-fa634be33732",
    "poolSize": 3,  // ✅ 池中已有 3 个 session
    "sessions": [
      "9f10edbb-1407-47e1-9b85-fa634be33732",
      "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "..."
    ]
  }
}
```

## 完整示例：从零开始

### 步骤 1: 检查当前 API Keys

```bash
curl -H "Authorization: Bearer admin_token_here" \
  http://localhost:3000/admin/api-keys
```

假设得到：

```json
[
  {
    "id": "key-001",
    "name": "Personal Key",
    "collectSession": false
  },
  {
    "id": "key-002",
    "name": "Test Key",
    "collectSession": false
  }
]
```

### 步骤 2: 设置白名单

```bash
# 设置 Personal Key 为白名单
curl -X PATCH \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{"collectSession": true}' \
  http://localhost:3000/admin/api-keys/key-001/collect-session

# 设置 Test Key 为白名单
curl -X PATCH \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{"collectSession": true}' \
  http://localhost:3000/admin/api-keys/key-002/collect-session
```

### 步骤 3: 使用白名单 Key 发送请求

```bash
# 使用 Personal Key 发送几个请求
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Authorization: Bearer cr_your_personal_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'

# 多发送几次，让系统收集 session
```

### 步骤 4: 检查结果

```bash
curl -H "Authorization: Bearer admin_token_here" \
  http://localhost:3000/admin/session-pool/stats
```

## 常见问题

### Q: 需要设置多少个白名单 API Key？

**A**:
- 最少 **1 个**即可开始收集
- 推荐 **3-5 个**确保 session 多样性
- 最多 **不限制**，但池大小有上限（默认 20）

### Q: 白名单 API Key 有什么限制吗？

**A**: 没有限制！白名单只是一个标记，不影响 API Key 的其他功能（限流、配额、权限等）。

### Q: 可以随时添加/移除白名单吗？

**A**: 可以！使用 `PATCH /admin/api-keys/{id}/collect-session` 接口随时切换。

### Q: 池中的 session 会过期吗？

**A**: 不会自动过期。除非：
1. 手动清空池（`DELETE /admin/session-pool`）
2. Redis 数据丢失
3. 池满后不再收集新 session（达到 `MAX_POOL_SIZE`）

### Q: 如果我的 API Key 被其他人使用，会收集他们的 session 吗？

**A**: 是的。白名单是基于 API Key 的，无论谁使用这个 Key，它的 session 都会被收集。确保白名单 Key 的安全性。

## 安全建议

1. ✅ **只标记你信任的 API Key**为白名单
2. ✅ **定期检查白名单列表**，确保没有被滥用
3. ✅ **不要将白名单 Key 分享给不信任的人**
4. ✅ **监控 session pool 大小**，异常增长时调查原因

## 快速命令汇总

```bash
# 启用白名单
PATCH /admin/api-keys/{keyId}/collect-session {"collectSession": true}

# 禁用白名单
PATCH /admin/api-keys/{keyId}/collect-session {"collectSession": false}

# 查看池状态
GET /admin/session-pool/stats

# 手动切换 session
POST /admin/session-pool/switch

# 清空池
DELETE /admin/session-pool
```

现在你可以开始使用 Session Pool 了！🎉
