# 捕获 Claude Code 真实请求

## 📋 概述

已启用请求捕获功能，会自动保存前 **5 个** Claude Code 的请求信息，包括：
- 完整的请求头
- 请求体
- metadata.user_id 的详细信息
- system prompt 内容

## 🚀 使用步骤

### 1. 启动本地服务

```bash
# 确保 Redis 已启动
redis-server &

# 启动服务（开发模式，可以看到详细日志）
npm run dev

# 或者后台启动
npm start
```

### 2. 配置 Claude Code 连接到本地服务

Claude Code 需要配置 API Base URL 指向本地服务：

```bash
# 方法1: 通过环境变量
export ANTHROPIC_API_URL="http://localhost:3000"

# 方法2: 或通过配置文件（如果 Claude Code 支持）
# 编辑 ~/.config/claude-code/config.json
{
  "api_base_url": "http://localhost:3000"
}
```

### 3. 准备本地 API Key

在本地服务中创建一个测试用的 API Key：

```bash
# 使用 CLI 创建 API Key
npm run cli keys create -- --name "Test Key for Capture"

# 或者通过 Web 界面创建
# 访问 http://localhost:3000/admin-next/
# 导航到 API Keys → 创建新 Key
```

### 4. 配置 Claude Code 使用本地 API Key

```bash
# 设置 API Key 环境变量
export ANTHROPIC_API_KEY="cr_your_local_api_key"

# 或者在 Claude Code 的配置文件中设置
```

### 5. 使用 Claude Code 发送请求

```bash
# 任意使用 Claude Code 发送请求
claude "Hello, can you help me?"

# 或者使用 Claude Code 的其他功能
claude code review
claude explain somefile.js
# 等等...
```

### 6. 查看捕获的请求

```bash
# 查看捕获的文件列表
ls -lh logs/captured-requests/

# 查看第一个捕获的请求
cat logs/captured-requests/capture-1-*.json | jq '.'

# 查看所有捕获的请求
for f in logs/captured-requests/capture-*.json; do
  echo "=== $f ==="
  cat "$f" | jq '.metadata.user_id, .headers["user-agent"]'
  echo ""
done
```

## 📊 捕获的信息

每个捕获的文件包含：

```json
{
  "timestamp": "2025-11-16T19:50:00.000Z",
  "captureNumber": 1,

  // 请求基本信息
  "method": "POST",
  "url": "/v1/messages",
  "originalUrl": "/api/v1/messages",

  // 完整的请求头
  "headers": {
    "user-agent": "claude-cli/1.0.69 (external, cli)",
    "x-app": "...",
    "anthropic-beta": "...",
    "anthropic-version": "...",
    "authorization": "Bearer ..."
  },

  // 请求体
  "body": {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4096,
    "system": [...],
    "metadata": {
      "user_id": "user_{64位hex}_account__session_{uuid}"
    },
    "messages": [...]
  },

  // 客户端信息
  "clientInfo": {
    "ip": "127.0.0.1",
    "hostname": "localhost"
  }
}
```

## 🔍 重点关注

### 1. metadata.user_id 格式

```
user_{64位十六进制客户端ID}_account__session_{UUID}
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     这部分是机器唯一标识，重点分析
```

### 2. 请求头

特别关注：
- `user-agent`: 完整的版本信息
- `x-app`: 应用标识
- `anthropic-beta`: beta 功能标识
- 其他可能的隐藏头

### 3. system prompt

Claude Code 的完整系统提示词内容

## 🛠️ 故障排除

### 问题1: 捕获目录不存在

```bash
mkdir -p logs/captured-requests
```

### 问题2: 没有捕获到请求

检查：
- ✅ 服务是否正常启动
- ✅ Claude Code 是否配置了正确的 API URL
- ✅ Claude Code 是否使用了正确的 API Key
- ✅ 请求的 User-Agent 是否包含 "claude-cli"

查看服务日志：
```bash
tail -f logs/claude-relay-*.log
```

### 问题3: 已经捕获了5个，想重新开始

删除已捕获的文件，重启服务：
```bash
rm -f logs/captured-requests/capture-*.json
npm run dev
```

## 📝 分析步骤

捕获到请求后：

### 1. 提取 user_id 的客户端 ID

```bash
# 从捕获的文件中提取 user_id
cat logs/captured-requests/capture-1-*.json | jq -r '.body.metadata.user_id'

# 输出示例:
# user_abc123def456...xyz_account__session_550e8400-...
#      ^^^^^^^^^^^^^^^^ 提取这64位十六进制
```

### 2. 对比多个请求

```bash
# 查看所有请求的 user_id 客户端ID部分
for f in logs/captured-requests/capture-*.json; do
  echo "=== $(basename $f) ==="
  cat "$f" | jq -r '.body.metadata.user_id' | grep -oP 'user_\K[a-f0-9]{64}'
done

# 如果多个请求的客户端ID相同 → 说明是固定的机器标识
# 如果每次都不同 → 说明有随机性或其他生成逻辑
```

### 3. 分析请求头差异

```bash
# 提取所有请求的关键头部
for f in logs/captured-requests/capture-*.json; do
  echo "=== $(basename $f) ==="
  cat "$f" | jq -r '.headers | {
    "user-agent": .["user-agent"],
    "x-app": .["x-app"],
    "anthropic-beta": .["anthropic-beta"]
  }'
done
```

### 4. 更新测试脚本

根据捕获的真实数据，更新 `scripts/test-upstream-concurrency.js`：

```javascript
// 使用真实的 user_id 格式
metadata: {
  user_id: "user_{真实的64位hex}_account__session_{真实的UUID}"
}

// 使用真实的请求头
headers: {
  'User-Agent': '{真实的 user-agent}',
  'x-app': '{真实的 x-app}',
  'anthropic-beta': '{真实的 anthropic-beta}'
}
```

## 🎯 下一步

1. ✅ 捕获真实的 Claude Code 请求
2. ✅ 分析 user_id 的生成规律
3. ✅ 分析请求头的具体值
4. ✅ 更新测试脚本使用真实数据
5. ✅ 重新测试上游的并发限制

---

## 🔄 自动停止

捕获功能会自动在捕获 5 个请求后停止，避免生成过多文件。

如需调整数量，编辑 `src/middleware/requestCapture.js`：

```javascript
const MAX_CAPTURES = 5  // 修改这个值
```

---

## 📞 需要帮助？

如有问题，查看：
1. 服务日志: `logs/claude-relay-*.log`
2. 控制台输出（如果使用 `npm run dev`）
3. 捕获的 JSON 文件

捕获成功后会在控制台显示：

```
================================================================================
📸 捕获 Claude Code 请求 #1
================================================================================
时间: 2025-11-16T19:50:00.000Z
URL: POST /api/v1/messages
...
📁 完整数据已保存: logs/captured-requests/capture-1-...json
================================================================================
```
