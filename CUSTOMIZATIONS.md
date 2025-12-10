# Fork 定制功能清单

本文档记录了相对于上游仓库 (Wei-Shaw/claude-relay-service) 的所有定制功能，方便后续合并时避免覆盖或遗漏。

**上游仓库**: `git@github.com:Wei-Shaw/claude-relay-service.git`

## 1. 伪装中间件 (Disguise Middleware)

### 1.1 Claude 伪装 (`src/middleware/disguise.js`)
- **功能**: 统一请求指纹，降低被识别为多用户的风险
- **伪装内容**:
  - 固定 `user_id` (基于 machine_id 和 session_id)
  - 固定 `User-Agent` (claude-cli/2.0.42)
  - 动态生成 `sentry-trace` 和 `baggage` 头
- **环境变量**:
  - `DISGUISE_SESSION_ID` - 固定的会话ID
  - `DISGUISE_CLIENT_ID` - 固定的客户端机器ID
  - `DISGUISE_UA` - 固定的User-Agent

### 1.2 Codex 伪装 (`src/middleware/codexDisguise.js`)
- **功能**: OpenAI Responses (Codex) 请求伪装
- **伪装内容**: 固定 `session_id`
- **环境变量**: `CODEX_SESSION_ID`

---

## 2. Vercel 部署支持

### 2.1 Serverless 入口 (`api/serverless.js`)
- **功能**: Vercel Serverless Function 入口点
- **特性**: 单例模式，避免冷启动重复初始化

### 2.2 部署配置 (`vercel.json`)
- **功能**: Vercel 部署和路由配置
- **路由规则**:
  - `/admin-next/*` → Vue SPA
  - 其他路由 → Express 应用

### 2.3 配置路径修复
- **修改文件**:
  - `config/index.js` - 新增配置入口点
  - `src/services/pricingService.js` - 使用 `__dirname` 替代 `process.cwd()`
- **原因**: Vercel 环境下 `process.cwd()` 可能不正确，且文件系统只读

### 2.4 所有服务文件的 config 引用修改
- **修改**: `require('../../config/config')` → `require('../../config')`
- **影响文件**: 约30个服务和路由文件

---

## 3. 公开页面系统 (Public Pages)

### 3.1 页面文件 (`web/public-pages/`)
| 文件 | 功能 |
|------|------|
| `index.html` | Hero 首页（项目介绍） |
| `stats.html` | 公开统计页面（API Key 使用统计） |
| `docs.html` | 使用文档页面 |

### 3.2 共享资源 (`web/public-pages/assets/`)
| 文件 | 功能 |
|------|------|
| `navbar.js` | 共享导航栏组件 |
| `lily-ui.css` | UI 样式库 |
| `logo.svg` | Logo 图标 |
| `retro_typewriter.png` | 背景图片 |

### 3.3 路由文件
- `src/routes/publicPages.js` - 公开页面路由 (`/`, `/stats`, `/docs`)
- `src/routes/admin/publicStats.js` - 公开统计 API (`/admin/public/api-stats`)

### 3.4 应用入口修改 (`src/app.js`)
- **修改**: 根路径 `/` 从重定向到管理界面改为渲染 Hero 页面
- **注意**: 公开页面路由必须在其他路由之前注册

---

## 4. 费用倍率功能 (Cost Multiplier)

### 4.1 功能描述
支持对 API 调用费用应用倍率，用于成本分摊或加价场景。

### 4.2 环境变量 (`.env.example`)
```bash
# 全局倍率（默认1.0，所有模型费用乘以此值）
COST_MULTIPLIER=1.0

# 模型特定倍率（与全局倍率相乘）
# 格式: COST_MULTIPLIER_<MODEL_KEY>=<倍率>
# MODEL_KEY: 模型名中的 - 替换为 _，全部大写
# 示例: Opus 额外 1.5 倍（全局 1.5 × 模型 1.5 = 2.25 倍）
COST_MULTIPLIER_CLAUDE_OPUS_4_5=1.5
```

### 4.3 代码实现 (`src/services/pricingService.js`)
- `_loadModelMultipliers()` - 加载模型特定倍率
- `getCostMultiplier(modelName)` - 获取最终倍率
- 支持精确匹配和前缀匹配

---

## 5. 已用费用编辑功能 (Used Cost Editing)

### 5.1 功能描述
允许管理员手动调整 API Key 的已用费用，用于费用限制检查。

### 5.2 前端组件
- `web/admin-spa/src/components/apikeys/EditUsedCostModal.vue` - 费用编辑弹窗
- 集成到 `ApiKeysView.vue`

### 5.3 后端 API (`src/routes/admin/apiKeys.js`)
- `PUT /admin/api-keys/:id` - 支持 `usedCost` 字段更新

---

## 6. API Key 过期时间编辑

### 6.1 功能描述
在编辑 API Key 时支持修改过期时间。

### 6.2 修改文件
- `web/admin-spa/src/components/apikeys/EditApiKeyModal.vue` - 新增过期时间编辑区域
- 引用 `ExpiryEditModal.vue` 组件

---

## 7. 统计页面增强

### 7.1 缓存 Tokens 显示
- 统计页面显示 `cache_create` 和 `cache_read` tokens

### 7.2 剩余预算显示
- 显示已用/总限额格式的费用信息

### 7.3 过期时间显示
- 显示完整的过期日期时间

### 7.4 费用统计统一化
- **修改**: 从实时计算改为直接读取 Redis 累计值
- **文件**: `src/routes/apiStats.js`
- **原因**: 保持与管理界面的一致性

---

## 8. Redis 连接方式增强

### 8.1 URL 连接支持 (`src/models/redis.js`)
- 新增 `CRS_REDIS_URL` 环境变量支持
- 支持 `redis://` 和 `rediss://` 格式
- 生产环境优先使用 URL 连接

### 8.2 配置示例 (`config/config.example.js`)
```javascript
redis: {
  url: process.env.NODE_ENV === 'production' && process.env.CRS_REDIS_URL
    ? process.env.CRS_REDIS_URL
    : null,
  // ...其他配置
}
```

---

## 9. 用户消息队列优化

### 9.1 配置调整 (`config/config.example.js`)
| 参数 | 上游默认值 | 定制默认值 | 说明 |
|------|-----------|-----------|------|
| `delayMs` | 200 | 100 | 请求间隔 |
| `timeoutMs` | 5000 | 60000 | 队列等待超时 |
| `lockTtlMs` | 5000 | 120000 | 锁租约 TTL |

### 9.2 锁续租机制 (`src/services/userMessageQueueService.js`)
- 新增 `startLockRenewal()` - 防止长连接超过 TTL 导致锁丢失
- 新增 `stopAllRenewalTimers()` - 服务关闭时清理定时器
- `MAX_RENEWAL_DURATION_MS` - 续租最大持续时间（与 REQUEST_TIMEOUT 保持一致）

### 9.3 Redis 锁续租 (`src/models/redis.js`)
- 新增 `refreshUserMessageLock()` - 锁续租 Lua 脚本

---

## 10. 定价数据优化

### 10.1 远程数据优先 (`src/services/pricingService.js`)
- 修改: 优先使用远程价格数据，fallback 文件作为备选

### 10.2 Fallback 数据更新
- 文件: `resources/model-pricing/model_prices_and_context_window.json`
- 包含最新模型的价格信息

---

## 11. 其他修改

### 11.1 新增文件
| 文件 | 功能 |
|------|------|
| `config/index.js` | 配置入口点 |
| `tests/userMessageQueue.test.js` | 消息队列测试 |
| `backups/README.txt` | 备份说明 |

### 11.2 移除文件
- `pnpm-lock.yaml` - 解决 Vercel 部署问题（使用 npm）

### 11.3 API Key 哈希映射重建
- `src/models/redis.js` 新增 `rebuildApiKeyHashMap()` 方法

---

## 合并注意事项

### 合并前检查
1. 保留所有 `src/middleware/disguise.js` 和 `codexDisguise.js` 相关代码
2. 保留 `vercel.json` 和 `api/serverless.js`
3. 保留 `web/public-pages/` 目录
4. 保留 `src/routes/publicPages.js` 和 `src/routes/admin/publicStats.js`
5. 保留 `.env.example` 中的费用倍率配置
6. 检查 `src/services/pricingService.js` 中的倍率相关代码
7. 检查 `src/routes/apiStats.js` 中费用统计的统一化修改
8. 检查 `src/models/redis.js` 中的 URL 连接和锁续租代码
9. 检查 `src/services/userMessageQueueService.js` 中的锁续租机制

### 合并策略
```bash
# 获取上游更新
git fetch upstream

# 查看差异
git diff HEAD..upstream/main --stat

# 合并时保留定制文件
git merge upstream/main

# 如有冲突，优先保留以下文件的本地版本:
# - src/middleware/disguise.js
# - src/middleware/codexDisguise.js
# - src/routes/publicPages.js
# - web/public-pages/*
# - vercel.json
# - api/serverless.js
```

### 环境变量清单
需要在部署环境中配置的定制相关变量：

```bash
# 伪装相关（可选）
DISGUISE_SESSION_ID=
DISGUISE_CLIENT_ID=
DISGUISE_UA=
CODEX_SESSION_ID=

# 费用倍率（可选）
COST_MULTIPLIER=1.0
COST_MULTIPLIER_CLAUDE_OPUS_4_5=1.5

# Redis URL（Vercel 生产环境）
CRS_REDIS_URL=rediss://...
```

---

## 更新日志

| 日期 | 内容 |
|------|------|
| 2025-12-10 | 初始版本，整理所有定制功能 |
