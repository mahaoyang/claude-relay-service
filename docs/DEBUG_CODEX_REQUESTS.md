# Codex 请求调试指南

本文档说明如何使用 Codex 请求日志功能调试真实的 Codex CLI 请求。

## 📝 日志位置

- **日志文件**: `logs/codex-requests.log`
- **中间件**: `src/middleware/codexRequestLogger.js`

## 🔍 记录的信息

每个请求会记录以下信息：

### 请求头 (Headers)
- `user-agent`: Codex CLI 的 User-Agent（如 `codex_cli_rs/0.72.0`）
- `originator`: 客户端类型（如 `codex_cli_rs` 或 `codex_vscode`）
- `session_id`: 会话 ID（UUID 格式）
- 其他所有请求头

### 请求体 (Body)
- `session_id`: 会话 ID（可能在 body 中）
- `model`: 模型名称（如 `gpt-5-codex`）
- `instructions`: 指令内容（前 100 字符）
- 其他请求参数

## 🎯 使用场景

### 1. 分析 Codex CLI 的真实请求格式
```bash
# 使用真实的 Codex CLI 发送请求
codex "帮我写一个函数"

# 查看日志
tail -f logs/codex-requests.log
```

### 2. 检查 session_id 格式和变化规律
观察不同请求中的 session_id 是否保持一致，以及何时会变化。

### 3. 分析 originator 和 user-agent 的关系
验证两者是否需要保持一致匹配。

### 4. 研究 instructions 的格式模式
Codex CLI 的 instructions 通常以特定前缀开头：
```
You are Codex, based on GPT-5. You are running as a coding agent in the Codex CLI...
```

## 🔧 启用/禁用日志

### 启用日志
日志已在以下路由中自动启用：
- `POST /openai/responses`
- `POST /openai/v1/responses`
- `POST /openai/responses/compact`
- `POST /openai/v1/responses/compact`

### 禁用日志
如果需要禁用，在 `src/routes/openaiRoutes.js` 中移除 `codexRequestLogger` 中间件：

```javascript
// 从这样：
router.post('/responses', codexRequestLogger, authenticateApiKey, codexDisguise, handleResponses)

// 改为：
router.post('/responses', authenticateApiKey, codexDisguise, handleResponses)
```

## 📊 日志示例

```
================================================================================
[2025-12-14T15:30:00.123Z] POST /openai/v1/responses
================================================================================

📋 Headers:
{
  "user-agent": "codex_cli_rs/0.72.0 (Ubuntu 22.4.0; x86_64) WindowsTerminal",
  "originator": "codex_cli_rs",
  "session_id": "019a9544-7ab1-73c1-837e-1fa681f4462b",
  "content-type": "application/json",
  ...
}

📦 Body:
{
  "session_id": "019a9544-7ab1-73c1-837e-1fa681f4462b",
  "model": "gpt-5-codex",
  "instructions": "You are Codex, based on GPT-5. You are running as a coding agent in the Codex CLI...",
  ...
}

🔍 关键字段提取:
  - User-Agent: codex_cli_rs/0.72.0 (Ubuntu 22.4.0; x86_64) WindowsTerminal
  - originator: codex_cli_rs
  - session_id (header): 019a9544-7ab1-73c1-837e-1fa681f4462b
  - session_id (body): 019a9544-7ab1-73c1-837e-1fa681f4462b
  - model: gpt-5-codex
  - instructions (前100字): You are Codex, based on GPT-5. You are running as a coding agent in the Codex CLI...
```

## 🎯 后续分析

根据日志分析结果，可以考虑以下优化策略：

1. **Session Pool 策略**
   - 是否需要像 Claude 一样建立三元组池？
   - session_id 的切换频率和规律？

2. **User-Agent 动态化**
   - 是否需要收集不同版本的 User-Agent？
   - 建立 User-Agent 池？

3. **originator 关联**
   - 是否需要建立 (session_id, originator, user_agent) 三元组？
   - originator 和 session_id 之间是否有验证关系？

## 🔒 安全提示

- 日志文件可能包含敏感信息，请妥善保管
- 生产环境建议禁用详细日志记录
- 仅在调试和研究时使用此功能
