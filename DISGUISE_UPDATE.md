# 🎭 伪装功能更新说明

## 更新内容

### 1. ✅ 重构为中间件架构

**之前**: 伪装逻辑在 `claudeRelayService.js` 中
**现在**: 独立的中间件 `src/middleware/disguise.js`

**优势**:
- 更清晰的关注点分离
- 易于维护和测试
- 可在多个路由中重用

### 2. ✅ 自动版本检测

**新功能**: 自动从真实请求中学习并使用最新的 Claude CLI 版本

```javascript
// 自动收集版本
原始请求: user-agent: claude-cli/2.0.37
→ 系统记录版本

新请求: user-agent: claude-cli/2.0.42
→ 系统更新最新版本

伪装时自动使用: claude-cli/2.0.42 (最新版本)
```

**配置**:
```bash
# .env
DISGUISE_AUTO_VERSION=true  # 默认启用
```

## 文件变更

### 新增文件
1. **`src/middleware/disguise.js`** - 伪装中间件
2. **`DISGUISE_UPDATE.md`** - 本更新说明

### 修改文件
1. **`src/utils/disguiseHelper.js`**
   - 添加版本检测逻辑
   - 添加版本比较和更新
   - 自动使用最新user-agent
   - baggage版本号自动匹配

2. **`src/routes/api.js`**
   - 导入伪装中间件
   - 在路由中应用中间件：
     ```javascript
     router.post('/v1/messages',
       authenticateApiKey,
       captureClaudeCodeRequest,
       disguiseMiddleware,  // ← 新增
       handleMessagesRequest
     )
     ```

3. **`src/services/claudeRelayService.js`**
   - 移除伪装逻辑（迁移到中间件）
   - 移除 disguiseHelper 导入

4. **`.env.example`**
   - 添加 `DISGUISE_AUTO_VERSION=true` 配置

## 工作流程

```
客户端请求
    ↓
认证中间件 (authenticateApiKey)
    ↓
请求捕获 (captureClaudeCodeRequest)
    ↓
伪装中间件 (disguiseMiddleware) ← 新增位置
    ├─ 收集版本信息
    ├─ 替换 user_id
    ├─ 使用最新 user-agent
    └─ 生成新的 sentry-trace/baggage
    ↓
处理请求 (handleMessagesRequest)
    ↓
转发到上游
```

## 版本检测机制

### 版本收集
```javascript
// 每个请求都会检查版本
if (headers['user-agent']) {
  updateLatestVersion(headers['user-agent'])
}

// 自动比较和更新
const newVersion = "2.0.42"
const currentVersion = "2.0.37"

if (compareVersions(newVersion, currentVersion) > 0) {
  latestVersion.userAgent = newVersion
  logger.info(`📦 Updated latest Claude CLI version`)
}
```

### 版本使用
```javascript
// 伪装时自动使用最新版本
if (DISGUISE_CONFIG.autoUseLatestVersion) {
  disguisedHeaders['user-agent'] = getLatestUserAgent()
}

// baggage版本号自动匹配
const version = extractVersionFromUA(userAgent) || '2.0.42'
baggage = `sentry-release=${version},...`
```

## 日志输出

### 版本更新日志
```
📦 Updated latest Claude CLI version: claude-cli/2.0.42 (external, cli)
```

### 伪装请求日志
```json
🎭 Request disguised {
  "originalUserId": "user_abc123_account__session_xyz789...",
  "disguisedSessionId": "50475d3e-7ba5-417d-a71d-bc3711f26693",
  "disguisedClientId": "1afa2e8165ce838..."
}
```

## 配置选项

```bash
# .env

# 启用伪装（默认false）
DISGUISE_ENABLED=true

# 自动使用最新版本（默认true）
DISGUISE_AUTO_VERSION=true

# 调试：启用请求捕获（默认false，仅用于调试和测试）
CAPTURE_REQUESTS_ENABLED=false
```

### 请求捕获中间件

请求捕获功能用于调试和测试，可以捕获真实 Claude Code 请求的详细信息。

**用途**：
- 调试请求格式
- 分析不同终端/会话的差异
- 学习真实的请求头和参数

**配置**：
```bash
# 启用请求捕获
CAPTURE_REQUESTS_ENABLED=true

# 捕获位置：logs/captured-requests/
# 捕获限制：最多50个请求
# 性能：禁用时完全跳过，无性能影响
```

**注意**：
- 默认禁用，避免不必要的文件写入
- 仅在需要调试时启用
- 捕获的数据包含完整的请求头和请求体

## 测试

```bash
# 测试伪装功能
npm run test:disguise

# 启用伪装测试
DISGUISE_ENABLED=true npm run test:disguise
```

## 查看当前版本

```bash
# 查看伪装信息（包括最新版本）
DISGUISE_ENABLED=true node -e "
const d = require('./src/utils/disguiseHelper');
const info = d.getDisguiseInfo();
console.log('当前使用版本:', info.latestVersion);
console.log('最后更新时间:', info.versionLastUpdated);
console.log('自动版本检测:', info.autoUseLatestVersion);
"
```

## 升级步骤

如果你已经启用了伪装功能：

1. **无需操作** - 代码已自动重构为中间件
2. **可选**: 在 `.env` 添加 `DISGUISE_AUTO_VERSION=true`（默认已启用）
3. **重启服务**: `npm run service:restart`

## 向后兼容

- ✅ 完全向后兼容
- ✅ 现有配置继续有效
- ✅ 无需修改 `.env`（除非要禁用自动版本）

## 技术细节

### 版本比较算法
```javascript
compareVersions("2.0.42", "2.0.37")
// 按数字比较: [2,0,42] vs [2,0,37]
// 结果: 42 > 37 → 返回 1 (更新版本)

compareVersions("2.1.0", "2.0.42")
// 比较: [2,1,0] vs [2,0,42]
// 结果: 1 > 0 → 返回 1 (更新版本)
```

### 缓存机制
```javascript
const latestVersion = {
  userAgent: 'claude-cli/2.0.42 (external, cli)',
  lastUpdated: '2025-11-17T15:39:23.000Z'
}
```

## 常见问题

### Q: 版本信息会持久化吗？
A: 不会，版本信息存储在内存中。服务重启后会重新学习最新版本。

### Q: 如何禁用自动版本？
A: 在 `.env` 中设置 `DISGUISE_AUTO_VERSION=false`

### Q: 版本信息从哪里来？
A: 从所有通过系统的真实 Claude Code 请求中自动收集。

### Q: 中间件会影响性能吗？
A: 几乎无影响。版本检测和伪装都是简单的字符串操作，开销极小。

## 监控建议

1. 观察日志中的 `📦 Updated latest Claude CLI version` 消息
2. 定期检查伪装信息确认版本更新
3. 监控伪装后的请求是否正常

## 安全注意

- 版本信息来自真实客户端，可信度高
- 自动版本只在有新版本时更新，不会降级
- 伪装逻辑在中间件中隔离，易于审计
