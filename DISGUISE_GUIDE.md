# 🎭 请求伪装功能指南

## 功能说明

请求伪装功能允许将多个下游用户伪装成单一上游身份，用于绕过基于用户的并发限制。

### 工作原理

- **固定客户端ID**: 使用WSL机器的固定客户端ID
- **每日会话轮换**: 从3个预设会话ID中，基于日期hash每天自动选择1个
- **动态追踪ID**: 每个请求生成新的 sentry-trace 和 baggage
- **完全透明**: 不影响原始请求，只在转发给上游时应用

## 配置

### 1. 启用伪装

在 `.env` 文件中添加：

```bash
DISGUISE_ENABLED=true
```

### 2. 预设配置

伪装配置位于 `src/utils/disguiseHelper.js`:

```javascript
const DISGUISE_CONFIG = {
  // 固定客户端ID (WSL)
  clientId: '1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf',

  // 3个可用会话ID（每天轮换）
  sessionIds: [
    '9f10edbb-1407-47e1-9b85-fa634be33732',
    '50475d3e-7ba5-417d-a71d-bc3711f26693',
    '4fe5b286-192b-4929-a25e-8bc1789b5de4'
  ]
}
```

## 测试

### 快速测试

```bash
# 测试伪装功能（不启用）
npm run test:disguise

# 测试伪装功能（启用）
DISGUISE_ENABLED=true npm run test:disguise
```

### 测试输出示例

```
🎭 伪装功能测试

================================================================================
📋 伪装配置
================================================================================

启用状态: ✓ 已启用

固定客户端ID (WSL):
  1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf

可用会话ID池 (3个):
  [1] 9f10edbb-1407-47e1-9b85-fa634be33732
  [2] 50475d3e-7ba5-417d-a71d-bc3711f26693 ← 今日选中
  [3] 4fe5b286-192b-4929-a25e-8bc1789b5de4

今日信息:
  日期: 2025-11-17
  选中会话ID: 50475d3e-7ba5-417d-a71d-bc3711f26693
```

## 伪装规则

### 1. 会话ID选择

- 基于 SHA256(日期) 确定性选择
- 每天00:00自动切换
- 同一天内所有请求使用相同sessionId

### 2. 字段转换

| 原始字段 | 伪装后 | 说明 |
|---------|--------|------|
| metadata.user_id | user_{固定clientId}_account__session_{今日sessionId} | 使用伪装的user_id |
| sentry-trace | {32位hex}-{16位hex} | 每请求随机生成 |
| baggage | sentry-environment=...,sentry-trace_id={traceId} | 匹配sentry-trace |

### 3. 不变字段

以下字段保持原样：
- user-agent
- x-app
- anthropic-beta
- 其他所有客户端请求头

## 技术细节

### 伪装时机

伪装发生在 `claudeRelayService.js` 的 `_makeClaudeRequest` 方法中：

```javascript
// 🎭 应用请求伪装（如果启用）
if (disguiseHelper.DISGUISE_CONFIG.enabled) {
  const disguised = disguiseHelper.disguiseRequest(requestPayload, finalHeaders)
  requestPayload = disguised.body
  finalHeaders = disguised.headers

  logger.info(`🎭 Request disguised - using sessionId: ${disguiseInfo.todaySessionId}`)
}
```

### 日志输出

启用伪装后，每个转发请求会输出：

```
🎭 Request disguised - using sessionId: 50475d3e-7ba5-417d-a71d-bc3711f26693
```

## 安全考虑

### ✅ 安全的

- **不会造成上下文污染**: 每个请求包含完整独立的对话历史
- **客户端维护状态**: 对话历史由客户端维护，服务器无状态
- **透明转发**: 只修改身份标识，不修改实际内容

### ⚠️ 注意事项

1. **共享提示缓存**: 所有用户共享同一套缓存，可能降低成本
2. **粘性会话**: 同一天内所有用户会被路由到同一上游账户
3. **追踪困难**: 伪装后难以追踪具体用户的请求

## 监控

### 查看伪装状态

```bash
# 查看当前伪装配置
DISGUISE_ENABLED=true node -e "
const d = require('./src/utils/disguiseHelper');
console.log(JSON.stringify(d.getDisguiseInfo(), null, 2));
"
```

### 输出示例

```json
{
  "enabled": true,
  "clientId": "1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf",
  "todaySessionId": "50475d3e-7ba5-417d-a71d-bc3711f26693",
  "todayUserId": "user_1afa2e..._account__session_50475d3e-...",
  "date": "2025-11-17",
  "availableSessionIds": [...]
}
```

## 常见问题

### Q: 为什么选择3个会话ID？

A: 3个会话ID提供足够的轮换周期，避免上游检测到固定模式，同时保持简单可管理。

### Q: 可以添加更多会话ID吗？

A: 可以，编辑 `src/utils/disguiseHelper.js` 中的 `DISGUISE_CONFIG.sessionIds` 数组即可。

### Q: 伪装会影响性能吗？

A: 几乎无影响。伪装只是简单的字段替换，开销极小。

### Q: 如何验证伪装是否生效？

A: 启用 `DISGUISE_ENABLED=true` 后，查看日志中的 `🎭 Request disguised` 消息，或使用测试脚本验证。

## 最佳实践

1. **测试先行**: 在生产环境启用前，先用测试脚本验证
2. **监控日志**: 观察伪装后的请求是否正常工作
3. **逐步启用**: 先在少量用户上测试，确认无问题后再全面启用
4. **定期检查**: 确认选中的sessionId有效，上游没有检测到异常

## 故障排除

### 问题1: 伪装未生效

- 检查 `.env` 中 `DISGUISE_ENABLED=true` 是否设置
- 检查服务是否重启加载新配置
- 查看日志是否有 `🎭 Request disguised` 消息

### 问题2: 上游返回401/403

- 检查伪装的clientId和sessionId是否有效
- 尝试更换其他sessionId
- 查看上游是否检测到异常模式

### 问题3: 性能下降

- 检查是否所有请求路由到同一账户（粘性会话）
- 考虑禁用粘性会话或增加sessionId池大小

## 相关文件

- `src/utils/disguiseHelper.js` - 伪装核心逻辑
- `src/services/claudeRelayService.js` - 伪装集成点
- `scripts/test-disguise.js` - 测试脚本
- `.env.example` - 配置模板
