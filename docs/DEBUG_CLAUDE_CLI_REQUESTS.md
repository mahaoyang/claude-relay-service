# Claude CLI 请求抓包指南

## 目的

通过本地抓包真实的 Claude CLI 请求，分析：
1. Sentry trace_id 和 session_id 的关系
2. Baggage 头的真实内容
3. 同一 session 的多个请求，trace_id 是否变化

## 使用方法

### 1. 启动服务

```bash
npm start
# 或
npm run dev
```

### 2. 配置 Claude CLI

使用你的中转服务 API Key 连接：

```bash
export ANTHROPIC_API_KEY="cr_your_api_key_here"
export ANTHROPIC_BASE_URL="http://localhost:3000"
```

或者在配置文件中设置（`~/.config/claude-cli/config.toml`）：
```toml
[default]
api_key = "cr_your_api_key_here"
base_url = "http://localhost:3000"
```

### 3. 发送测试请求

```bash
# 发送第一个请求
claude "Hello, this is request 1"

# 发送第二个请求（同一个 session）
claude "Hello, this is request 2"

# 发送第三个请求
claude "Hello, this is request 3"
```

### 4. 查看日志

日志文件位置：`logs/claude-cli-requests.log`

```bash
# 实时查看日志
tail -f logs/claude-cli-requests.log

# 查看完整日志
cat logs/claude-cli-requests.log
```

## 日志格式

每个请求会记录：

```
================================================================================
[2025-12-14T12:34:56.789Z] POST /api/v1/messages
================================================================================

📋 Headers:
{
  "user-agent": "claude-cli/2.0.69 (external, cli)",
  "sentry-trace": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-q1r2s3t4u5v6w7x8-1",
  "baggage": "sentry-environment=production,sentry-release=claude-cli%402.0.69,...",
  ...
}

📦 Body:
{
  "model": "claude-sonnet-4-5",
  "messages": [...],
  "metadata": {
    "user_id": "user_1afa2e81..._account__session_9f10edbb-1407-47e1-9b85-fa634be33732"
  }
}

🔍 关键字段提取:
  - User-Agent: claude-cli/2.0.69 (external, cli)
  - sentry-trace: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6-q1r2s3t4u5v6w7x8-1
  - baggage: sentry-environment=production,sentry-release=claude-cli%402.0.69,...
  - metadata.user_id: user_1afa2e81..._account__session_9f10edbb-...

🔎 Sentry Trace 解析:
  - trace_id: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
  - span_id: q1r2s3t4u5v6w7x8
  - sampled: 1

🆔 User ID 解析:
  - 完整 user_id: user_1afa2e81..._account__session_9f10edbb-1407-47e1-9b85-fa634be33732
  - 提取的 session_id: 9f10edbb-1407-47e1-9b85-fa634be33732
```

## 分析重点

### 1. 同一 Session 的多个请求

观察连续发送的 3 个请求：
- ✅ `session_id` 是否相同？
- ❓ `trace_id` 是否相同？
- ❓ `span_id` 是否每次都不同？

**预期行为（需要验证）**：
```
请求1: session_id=xxx, trace_id=aaa, span_id=111
请求2: session_id=xxx, trace_id=aaa, span_id=222  ← trace_id 相同
请求3: session_id=xxx, trace_id=aaa, span_id=333  ← trace_id 相同
```

### 2. Baggage 头内容

确认真实的 baggage 格式：
```
sentry-environment=?
sentry-release=?
sentry-trace_id=?
sentry-sample_rate=?
```

### 3. User ID 格式

确认真实的 user_id 格式：
```
user_{machine_id}_account__session_{session_id}
```

## 清空日志

如果需要重新测试：

```bash
# 清空日志文件
> logs/claude-cli-requests.log

# 或删除
rm logs/claude-cli-requests.log
```

## 注意事项

1. **禁用伪装中间件**（可选）

   如果想要完全透传 Claude CLI 的原始请求，可以临时注释掉 `disguiseMiddleware`：

   ```javascript
   // src/routes/api.js
   router.post('/v1/messages', requestLogger, authenticateApiKey, /* disguiseMiddleware, */ handleMessagesRequest)
   ```

2. **控制台输出**

   中间件会同时输出到控制台，方便实时查看：
   ```
   🔍 [Request Logger] POST /api/v1/messages
      User-Agent: claude-cli/2.0.69 (external, cli)
      sentry-trace: a1b2c3d4...
      user_id: user_1afa2e81...
   ```

## 下一步

1. 发送测试请求
2. 查看日志文件
3. 分析 trace_id 和 session_id 的关系
4. 根据真实行为调整我们的伪装逻辑

开始测试吧！ 🚀
