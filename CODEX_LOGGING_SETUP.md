# Codex 请求日志 - 环境配置完成 ✅

## 📋 配置总结

### 1. ✅ 环境变量已配置

在 `.env` 文件中已添加：
```bash
CODEX_REQUEST_LOGGING=true
```

### 2. ✅ 日志目录已创建

```
logs/codex-requests/  (权限: 755)
```

### 3. 📊 Redis 配置

从 `.env` 读取到的 Redis 配置：
- **Host**: localhost
- **Port**: 6379
- **Database**: 0
- **密码**: ✅ 已配置

> 注意：Redis 连接将在服务启动时自动建立

## 🚀 下一步操作

### 1. 启动服务

你需要自己启动服务：

```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm start

# 或使用守护进程
npm run service:start:daemon
```

### 2. 验证日志功能

启动服务后，发送一个测试请求：

```bash
# 替换 YOUR_API_KEY 为你的实际 API Key
curl -X POST http://localhost:3010/openai/responses \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "stream": true,
    "instructions": "You are a coding agent running in the Codex CLI, a terminal-based coding assistant.",
    "messages": [
      {
        "role": "user",
        "content": "Hello, this is a test request"
      }
    ]
  }'
```

### 3. 查看日志

#### 方式1: 控制台输出

服务启动后，每个请求都会在控制台打印类似这样的摘要：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Codex Request Summary [2025-01-18T12:29:45.123Z]
   Type: Codex CLI
   URL: /openai/responses
   Model: gpt-5
   Stream: true
   Request Headers:
     user-agent: curl/7.68.0
     version: 2024-10-01
   Instructions: You are a coding agent running in the Codex CLI...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 方式2: 查看文件日志

```bash
# 列出所有日志文件
ls -lh logs/codex-requests/

# 查看最新的日志（需要安装 jq）
ls -t logs/codex-requests/codex-request-*.json | head -1 | xargs cat | jq '.'

# 或者不使用 jq
ls -t logs/codex-requests/codex-request-*.json | head -1 | xargs cat
```

#### 方式3: 使用测试脚本

```bash
# 查看最近 10 条日志
node scripts/test-codex-logging.js

# 查看最近 20 条日志（带统计）
node scripts/test-codex-logging.js --limit=20

# 只查看 Codex CLI 请求
node scripts/test-codex-logging.js --codex-cli-only

# 查看帮助
node scripts/test-codex-logging.js --help
```

#### 方式4: 通过管理 API

```bash
# 先登录获取 token（替换管理员凭据）
TOKEN=$(curl -s -X POST http://localhost:3010/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin8281Ahdsu","password":"HJagdgvdi.128egdbuebwe.Hbwqdb12"}' \
  | jq -r '.token')

# 获取最近的日志
curl "http://localhost:3010/admin/codex-request-logs?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 只获取 Codex CLI 请求
curl "http://localhost:3010/admin/codex-request-logs?limit=10&codexCliOnly=true" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

## 📊 捕获的信息

### 请求头
- `version` - API 版本
- `openai-beta` - Beta 功能标识
- `session_id` / `x-session-id` - 会话 ID
- `user-agent` - 客户端标识
- `content-type` - 内容类型
- `authorization` - 认证信息（已脱敏）

### 请求体
- `model` - 使用的模型
- `stream` - 是否流式请求
- `instructions` - 系统指令（前200字符）
- `messages` - 消息列表（数量 + 示例）
- `tools` - 工具列表（数量 + 名称）
- `session_id` / `conversation_id` - 会话标识

### 响应头（Codex 限流信息）
- `x-codex-primary-used-percent` - 主限流使用百分比
- `x-codex-secondary-used-percent` - 次限流使用百分比
- `x-codex-primary-reset-after-seconds` - 主限流重置秒数
- `x-codex-primary-window-minutes` - 主限流窗口（分钟）
- `x-codex-secondary-reset-after-seconds` - 次限流重置秒数
- `x-codex-secondary-window-minutes` - 次限流窗口（分钟）
- `openai-version` - OpenAI API 版本
- `x-request-id` - 请求 ID

## 🔧 配置选项

### 完全启用所有调试日志

如果你想同时启用所有 HTTP 调试日志：

```bash
# 在 .env 中设置
DEBUG_HTTP_TRAFFIC=true
```

这会启用：
- Codex 请求日志
- 所有 HTTP 请求/响应调试信息

### 只启用 Codex 日志

保持当前配置即可：

```bash
CODEX_REQUEST_LOGGING=true
DEBUG_HTTP_TRAFFIC=false  # 或者不设置
```

### 禁用日志

如果需要禁用日志记录：

```bash
CODEX_REQUEST_LOGGING=false
```

然后重启服务。

## 📁 文件位置

- **配置文件**: `.env` (已配置)
- **日志目录**: `logs/codex-requests/` (已创建)
- **服务代码**: `src/services/codexRequestLoggerService.js`
- **中间件**: `src/middleware/codexRequestLogger.js`
- **路由集成**: `src/routes/openaiRoutes.js`
- **管理端点**: `src/routes/admin.js`
- **测试脚本**: `scripts/test-codex-logging.js`
- **完整文档**: `docs/codex-request-logging.md`

## 📖 详细文档

查看完整使用指南：
```bash
cat docs/codex-request-logging.md
```

或在浏览器中打开项目文档。

## ⚠️ 注意事项

1. **存储空间**: 每个请求约 2-10KB，请定期清理旧日志
2. **Redis 存储**: 最近50条日志保存在 Redis（7天过期）
3. **敏感信息**: Authorization 等字段已自动脱敏
4. **性能影响**: 约 1-5ms 的额外延迟（异步写入）

## 🗑️ 清理日志

### 通过 API 清除

```bash
curl -X DELETE http://localhost:3010/admin/codex-request-logs \
  -H "Authorization: Bearer $TOKEN"
```

### 通过脚本清除

```bash
node scripts/test-codex-logging.js --clear
```

### 手动清除文件

```bash
# 清除所有日志
rm -f logs/codex-requests/codex-request-*.json

# 清除7天前的日志
find logs/codex-requests/ -name "codex-request-*.json" -mtime +7 -delete
```

## ✅ 环境配置检查清单

- [x] `.env` 文件已配置 `CODEX_REQUEST_LOGGING=true`
- [x] 日志目录已创建 `logs/codex-requests/`
- [x] 中间件已集成到路由
- [x] 管理 API 端点已添加
- [x] 测试脚本已创建
- [ ] **待操作**: 启动服务并测试

---

**当前服务配置**:
- 端口: 3010
- 环境: development
- Redis: localhost:6379 (DB 0)
- 管理员: admin8281Ahdsu

现在你可以启动服务并开始捕获 Codex 请求了！🚀
