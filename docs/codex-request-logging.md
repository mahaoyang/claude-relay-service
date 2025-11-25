# Codex Request Logging 使用指南

## 概述

Codex Request Logger 是一个用于捕获和分析 Codex (OpenAI Responses) 请求格式的中间件系统。它可以帮助你：

- 📋 查看完整的 Codex 请求格式（请求头、请求体、响应头）
- 🔍 分析 Codex CLI 和其他客户端的请求差异
- 📊 监控 Codex API 的限流信息（x-codex-* 响应头）
- 🐛 调试 OpenAI Responses 相关的问题

## 功能特性

### 1. 自动请求捕获

- **请求头捕获**: 自动捕获所有相关的请求头（version, openai-beta, session_id 等）
- **请求体捕获**: 记录请求体的关键字段（model, instructions, messages 等）
- **响应头捕获**: 捕获 Codex 限流信息（x-codex-primary-used-percent 等）
- **敏感信息脱敏**: 自动对 authorization 等敏感字段进行脱敏处理

### 2. Codex CLI 检测

自动识别 Codex CLI 请求（基于 instructions 字段），并单独记录：

```javascript
// 检测模式：
- "You are a coding agent running in the Codex CLI"
- "You are Codex"
- "You are GPT-5.1 running in the Codex CLI"
```

### 3. 多层存储

- **文件存储**: 每个请求保存为独立的 JSON 文件（`logs/codex-requests/codex-request-{timestamp}.json`）
- **Redis 存储**: 最近50条请求保存在 Redis（`codex_request_logs`）
- **Codex CLI 专用**: Codex CLI 请求额外保存在 `codex_cli_request_logs`（最近20条）

### 4. 实时日志输出

每个请求都会在控制台输出简化的摘要信息：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Codex Request Summary [2025-01-18T10:30:45.123Z]
   Type: Codex CLI
   URL: /openai/responses
   Model: gpt-5
   Stream: true
   Session ID: abc123...
   Request Headers:
     user-agent: codex-cli/1.0.0
     version: 2024-10-01
   Instructions: You are a coding agent running in the Codex CLI...
   Messages: 5 messages
   Response Headers (Codex Usage):
     x-codex-primary-used-percent: 45.2
     x-codex-secondary-used-percent: 12.8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 快速开始

### 1. 启用日志记录

在 `.env` 文件中添加：

```bash
# 启用 Codex 请求日志
CODEX_REQUEST_LOGGING=true

# 或者使用 DEBUG_HTTP_TRAFFIC（会同时启用所有调试日志）
DEBUG_HTTP_TRAFFIC=true
```

### 2. 重启服务

```bash
npm start
# 或
npm run dev
```

### 3. 发送测试请求

发送一个 Codex 请求到服务：

```bash
curl -X POST http://localhost:3000/openai/responses \
  -H "Authorization: Bearer cr_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "stream": true,
    "instructions": "You are a coding agent running in the Codex CLI...",
    "messages": [...]
  }'
```

### 4. 查看日志

#### 方式1: 查看文件日志

```bash
# 查看所有日志文件
ls -lh logs/codex-requests/

# 查看最新的日志
cat logs/codex-requests/codex-request-*.json | jq '.'
```

#### 方式2: 通过 API 查看

```bash
# 获取最近10条日志
curl -X GET http://localhost:3000/admin/codex-request-logs \
  -H "Authorization: Bearer your_admin_token"

# 获取最近20条日志
curl -X GET "http://localhost:3000/admin/codex-request-logs?limit=20" \
  -H "Authorization: Bearer your_admin_token"

# 只获取 Codex CLI 请求
curl -X GET "http://localhost:3000/admin/codex-request-logs?codexCliOnly=true" \
  -H "Authorization: Bearer your_admin_token"
```

#### 方式3: 直接查看 Redis

```bash
# 查看所有日志（最近50条）
redis-cli LRANGE codex_request_logs 0 -1

# 查看 Codex CLI 日志（最近20条）
redis-cli LRANGE codex_cli_request_logs 0 -1
```

## 日志格式

每个日志文件的格式如下：

```json
{
  "timestamp": "2025-01-18T10:30:45.123Z",
  "url": "/openai/responses",
  "method": "POST",
  "isCodexCLI": true,
  "requestHeaders": {
    "version": "2024-10-01",
    "openai-beta": "...",
    "user-agent": "codex-cli/1.0.0",
    "content-type": "application/json",
    "authorization": "Bearer sk-xxxxxx...xxxxxx"
  },
  "requestBody": {
    "model": "gpt-5",
    "stream": true,
    "instructions": "You are a coding agent running in the Codex CLI...",
    "messages": {
      "count": 5,
      "sample": {
        "role": "user",
        "content": "Hello..."
      }
    }
  },
  "responseHeaders": {
    "x-codex-primary-used-percent": "45.2",
    "x-codex-secondary-used-percent": "12.8",
    "x-codex-primary-reset-after-seconds": "3600",
    "openai-version": "2024-10-01",
    "x-request-id": "req_abc123..."
  },
  "metadata": {
    "apiKeyId": "key_123",
    "apiKeyName": "My API Key",
    "ip": "192.168.1.100",
    "userAgent": "codex-cli/1.0.0",
    "statusCode": 200
  }
}
```

## API 端点

### GET /admin/codex-request-logs

获取最近的 Codex 请求日志。

**查询参数：**
- `limit` (可选): 返回的日志数量，默认10
- `codexCliOnly` (可选): 只返回 Codex CLI 请求，默认 false

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-01-18T10:30:45.123Z",
      "url": "/openai/responses",
      "isCodexCLI": true,
      ...
    }
  ],
  "count": 10,
  "codexCliOnly": false
}
```

### DELETE /admin/codex-request-logs

清除所有 Codex 请求日志（包括文件和 Redis）。

**响应示例：**

```json
{
  "success": true,
  "message": "All Codex request logs have been cleared"
}
```

## 高级用法

### 1. 分析请求差异

比较 Codex CLI 和其他客户端的请求差异：

```bash
# 导出 Codex CLI 请求
curl "http://localhost:3000/admin/codex-request-logs?codexCliOnly=true&limit=5" \
  -H "Authorization: Bearer token" > codex-cli-requests.json

# 导出所有请求
curl "http://localhost:3000/admin/codex-request-logs?limit=50" \
  -H "Authorization: Bearer token" > all-requests.json

# 使用 jq 进行分析
jq '.data[] | select(.isCodexCLI == true)' all-requests.json
```

### 2. 监控限流信息

提取所有限流相关的响应头：

```bash
jq '.data[] | {
  timestamp: .timestamp,
  primaryUsed: .responseHeaders["x-codex-primary-used-percent"],
  secondaryUsed: .responseHeaders["x-codex-secondary-used-percent"],
  resetAfter: .responseHeaders["x-codex-primary-reset-after-seconds"]
}' all-requests.json
```

### 3. 统计请求类型

```bash
# 统计 Codex CLI vs 非 Codex CLI 请求
jq '.data | group_by(.isCodexCLI) | map({type: .[0].isCodexCLI, count: length})' all-requests.json
```

### 4. 查看 instructions 变化

```bash
# 提取所有 instructions 字段
jq '.data[] | select(.requestBody.instructions) | {
  timestamp: .timestamp,
  instructions: .requestBody.instructions
}' all-requests.json
```

## 性能和存储

### 存储空间

- **文件存储**: 每个日志文件约 2-10KB（取决于 messages 大小）
- **Redis 存储**:
  - `codex_request_logs`: 最近50条，约 100-500KB
  - `codex_cli_request_logs`: 最近20条，约 40-200KB
- **过期时间**: Redis 数据7天自动过期

### 清理建议

```bash
# 定期清理旧文件（保留最近7天）
find logs/codex-requests/ -name "codex-request-*.json" -mtime +7 -delete

# 或者通过 API 清除所有日志
curl -X DELETE http://localhost:3000/admin/codex-request-logs \
  -H "Authorization: Bearer your_admin_token"
```

## 注意事项

1. **生产环境**: 建议只在需要调试时启用，避免日志占用过多存储空间
2. **敏感信息**: authorization 字段会自动脱敏，但仍建议定期清理日志文件
3. **性能影响**: 日志记录会轻微增加响应时间（约 1-5ms）
4. **并发控制**: 文件写入是异步的，不会阻塞请求处理

## 故障排除

### 问题1: 日志目录不存在

**解决方案**:
服务会自动创建 `logs/codex-requests/` 目录，如果失败请手动创建：

```bash
mkdir -p logs/codex-requests
chmod 755 logs/codex-requests
```

### 问题2: Redis 连接失败

**解决方案**:
检查 Redis 配置和连接状态：

```bash
redis-cli PING
```

### 问题3: 日志未记录

**检查清单**:
1. 确认 `CODEX_REQUEST_LOGGING=true` 或 `DEBUG_HTTP_TRAFFIC=true`
2. 检查路由是否匹配（必须是 `/openai/` 或 `/responses`）
3. 查看控制台是否有错误日志
4. 确认服务已重启

## 相关文件

- **服务**: `src/services/codexRequestLoggerService.js`
- **中间件**: `src/middleware/codexRequestLogger.js`
- **路由**: `src/routes/openaiRoutes.js` (中间件应用)
- **管理端点**: `src/routes/admin.js` (查看和清理日志)
- **日志目录**: `logs/codex-requests/`
- **配置**: `.env` (CODEX_REQUEST_LOGGING)

## 示例脚本

### 实时监控脚本

```bash
#!/bin/bash
# watch-codex-requests.sh

while true; do
  clear
  echo "=== Latest Codex Requests ==="
  curl -s "http://localhost:3000/admin/codex-request-logs?limit=5" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data[] | {
      time: .timestamp,
      type: (if .isCodexCLI then "Codex CLI" else "Other" end),
      model: .requestBody.model,
      stream: .requestBody.stream
    }'
  sleep 10
done
```

### 导出分析脚本

```bash
#!/bin/bash
# export-codex-analysis.sh

OUTPUT_DIR="codex-analysis-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTPUT_DIR"

# 导出所有日志
curl -s "http://localhost:3000/admin/codex-request-logs?limit=100" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > "$OUTPUT_DIR/all-requests.json"

# 导出 Codex CLI 日志
curl -s "http://localhost:3000/admin/codex-request-logs?codexCliOnly=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > "$OUTPUT_DIR/codex-cli-requests.json"

# 生成统计报告
jq '{
  total: (.data | length),
  codexCLI: (.data | map(select(.isCodexCLI)) | length),
  models: (.data | group_by(.requestBody.model) | map({model: .[0].requestBody.model, count: length})),
  avgPrimaryUsage: (.data | map(.responseHeaders["x-codex-primary-used-percent"] | tonumber?) | add / length)
}' "$OUTPUT_DIR/all-requests.json" > "$OUTPUT_DIR/statistics.json"

echo "分析完成，结果保存在: $OUTPUT_DIR/"
```

## 更新日志

- **2025-01-18**: 初始版本发布
  - 支持请求头、请求体、响应头捕获
  - Codex CLI 自动检测
  - 文件和 Redis 双重存储
  - 管理 API 端点
