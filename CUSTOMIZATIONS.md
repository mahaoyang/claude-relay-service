# Fork 定制功能清单

本文档记录了相对于上游仓库 (Wei-Shaw/claude-relay-service) 的所有定制功能，方便后续合并时避免覆盖或遗漏。

**上游仓库**: `git@github.com:Wei-Shaw/claude-relay-service.git`

---

## 1. Vercel 部署支持

### 1.1 智能配置加载 (`config/index.js`)

**功能**: 自动识别运行环境，无需手动创建 config.js

- 开发环境：优先使用 `config/config.js`（手动创建的本地配置）
- 生产环境/Vercel：自动使用 `config/config.example.js`（所有配置从环境变量读取）

```javascript
// config/index.js 核心逻辑
if (fs.existsSync(configPath)) {
  config = require('./config.js')      // 开发环境
} else {
  config = require('./config.example.js')  // 生产环境/Vercel
}
```

**所有服务文件的引用修改**:
- `require('../../config/config')` → `require('../../config')`
- 影响约 30 个服务和路由文件

### 1.2 无文件系统日志收拢

**功能**: Vercel 环境下自动将日志重定向到 `/tmp` 或禁用文件写入

**检测方式**:
```javascript
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined
```

**受影响的日志系统**:
| 文件 | 行为 |
|------|------|
| `src/utils/logger.js` | Vercel 环境禁用文件日志，仅输出到 console |
| `src/middleware/debugInterceptor.js` | 日志目录切换到 `/tmp/crs-debug-logs` |
| `src/middleware/requestLogger.js` | 同上 |
| `src/middleware/codexRequestLogger.js` | 同上 |
| `src/utils/debugLogger.js` | 生产/Vercel 环境禁用文件写入 |
| `src/utils/tokenRefreshLogger.js` | Vercel 环境禁用文件日志 |

### 1.3 Serverless 入口 (`api/serverless.js`)

**功能**: Vercel Serverless Function 入口点
- 单例模式，避免冷启动重复初始化
- 处理所有 HTTP 请求并转发到 Express 应用

### 1.4 部署配置 (`vercel.json`)

**路由规则**:
- `/admin-next/assets/*` → Vue SPA 静态资源
- `/admin-next/*` → Vue SPA 入口
- 其他路由 → Express Serverless Function

---

## 2. 公开页面系统 (Public Pages)

### 2.1 页面概览

对外展示的落地页，无需登录即可访问：

| 路径 | 文件 | 功能 |
|------|------|------|
| `/` | `index.html` | Hero 首页（项目介绍、特性展示） |
| `/stats` | `stats.html` | 公开统计页面（API Key 使用统计查询） |
| `/docs` | `docs.html` | 使用文档（Claude Code、Gemini CLI 配置指南） |
| `/about` | `about.html` | 关于页面 |
| `/price` | `price.html` | 定价页面 |
| `/privacy` | `privacy.html` | 隐私政策 |
| `/terms` | `terms.html` | 服务条款 |

### 2.2 文件位置

```
web/public-pages/
├── index.html          # 首页
├── stats.html          # 统计页
├── docs.html           # 文档页
├── about.html          # 关于页
├── price.html          # 定价页
├── privacy.html        # 隐私政策
├── terms.html          # 服务条款
└── assets/
    ├── navbar.js       # 共享导航栏组件
    ├── lily-ui.css     # UI 样式库
    ├── logo-light.png  # Logo（明亮主题）
    ├── logo-dark.png   # Logo（暗黑主题）
    └── ...             # 其他图片资源
```

### 2.3 路由配置

- **路由文件**: `src/routes/publicPages.js`
- **统计 API**: `src/routes/admin/publicStats.js` (`GET /admin/public/api-stats`)
- **入口修改**: `src/app.js` 根路径 `/` 从重定向管理界面改为渲染 Hero 页面

---

## 3. Token 计费倍率系统

### 3.1 功能说明

在 Token 统计阶段应用倍率，用于成本分摊或加价场景。

**计算公式**:
```
记录的 Token 数 = 实际 Token × 全局倍率 × 模型特定倍率
```

### 3.2 环境变量配置

```bash
# 全局倍率（默认 1.0，应用于所有模型）
COST_MULTIPLIER=1.0

# GPT 系列 (Codex/GPT-5) 专属倍率（默认 0.71）
# 应用于所有模型名包含 "codex" 或 "gpt-5" 的请求
COST_MULTIPLIER_GPT_SERIES=0.71
```

**注意**:
- 已移除 Opus 模型的单独倍率配置，统一使用全局倍率
- GPT 系列倍率保留，用于 OpenAI Codex 转发场景

### 3.3 代码实现

**文件**: `src/services/pricingService.js`

关键方法:
- `getCostMultiplier(modelName)` - 获取最终倍率（全局 × 模型特定）
- `calculateCost()` - 在统计时应用倍率

### 3.4 Token 统计应用倍率

**功能**: Token 统计也应用费用倍率，使 `/api-gateway-stats` 显示的 token 数量反映倍率设置

**实现位置**: `src/models/redis.js` 的 `incrementTokenUsage` 方法

**受影响的统计维度**:
- API Key 总计（totalTokens, totalInputTokens, totalOutputTokens, 等）
- 每日/每月统计
- 按模型统计（每日/每月/每小时）
- API Key 级别的模型统计
- 系统级分钟统计

**代码逻辑**:
```javascript
// 延迟加载 pricingService 避免循环依赖
const pricingService = require('../services/pricingService')
const tokenMultiplier = pricingService.getCostMultiplier(model)

// 应用倍率到所有 token 计数（使用 Math.round 四舍五入）
const multipliedInputTokens = Math.round(finalInputTokens * tokenMultiplier)
const multipliedOutputTokens = Math.round(finalOutputTokens * tokenMultiplier)
// ... 其他 token 类型同理
```

**注意**: 费用（cost）和 token 使用相同的倍率，保持统计一致性。

---

## 4. 请求头伪装中间件

### 4.1 Claude 伪装 (`src/middleware/disguise.js`)

**功能**: 统一请求指纹，降低被识别为多用户的风险

**伪装内容**:
- 固定 `user_id`（基于 machine_id 和 session_id 构建）
- 固定 `User-Agent`（如 `claude-cli/2.0.69`）
- 动态生成 `sentry-trace` 和 `baggage` 请求头

**环境变量**:
```bash
DISGUISE_ENABLED=true          # 全局开关（默认 true）
DISGUISE_SESSION_ID=xxx        # 固定会话 ID
DISGUISE_CLIENT_ID=xxx         # 固定客户端机器 ID
DISGUISE_UA=claude-cli/2.0.69  # 固定 User-Agent
USE_SENTRY_TRIPLET_POOL=true   # 使用 Session 池轮换
```

**Session 池服务**: `src/services/sentryTripletPoolService.js`

### 4.2 Codex 伪装 (`src/middleware/codexDisguise.js`)

**功能**: OpenAI Responses (Codex) 请求伪装

**伪装内容**:
- 固定 `session_id`
- 固定 `User-Agent`（如 `codex_cli_rs/0.72.0`）

**环境变量**:
```bash
USE_CODEX_SESSION_POOL=true    # 使用 Session 池轮换（默认 true）
CODEX_SESSION_ID=xxx           # Fallback 会话 ID
CODEX_USER_AGENT=codex_cli_rs/0.72.0  # 固定 User-Agent
```

**Session 池服务**: `src/services/codexSessionPoolService.js`

### 4.3 前端伪装开关

**功能**: 管理员可在前端按账户单独控制伪装开关

**位置**: 账户管理页面 (`AccountsView.vue`)
- 每个账户显示「伪装」/「透传」按钮
- 支持点击切换状态

**后端 API**: `src/routes/admin/disguiseSettings.js`
```
GET  /admin/disguise-settings                     # 获取所有禁用的账户
PUT  /admin/disguise-settings/:platform/:accountId  # 设置伪装状态
PUT  /admin/disguise-settings/:platform/:accountId/toggle  # 切换状态
```

**数据存储**: Redis Set `disguise:disabled_accounts`
- 默认所有账户开启伪装
- 禁用时将 `platform:accountId` 加入 Set

**服务**: `src/services/disguiseSettingsService.js`

---

## 5. 请求拦截记录中间件（调试用）

### 5.1 调试拦截器 (`src/middleware/debugInterceptor.js`)

**功能**: 详细记录 HTTP 请求/响应，用于分析 Claude Code、Codex 等客户端的真实请求格式

**记录内容**:
- 完整请求头（含 anthropic-version、anthropic-beta、sentry-trace 等）
- 请求体（model、max_tokens、messages 等）
- 响应状态码和耗时
- Codex/GPT 请求单独记录到 `codex-debug-*.log`

**启用方式**:
```bash
DEBUG_HTTP_TRAFFIC=true  # 在 .env 中启用
```

**日志位置**:
- 本地: `logs/http-debug/http-debug-{date}.log`
- Vercel: `/tmp/crs-debug-logs/`

### 5.2 请求日志中间件 (`src/middleware/requestLogger.js`)

**功能**: 精简版请求日志，记录关键请求信息

### 5.3 Codex 专用日志 (`src/middleware/codexRequestLogger.js`)

**功能**: 专门记录 Codex/GPT 模型请求的详细信息

---

## 6. API Key 费用重置与有效期编辑

### 6.1 已用费用编辑

**功能**: 管理员可手动调整 API Key 的已用费用（`usedCost`）

**使用场景**:
- 费用误记时的修正
- 手动重置费用配额

**前端组件**: `web/admin-spa/src/components/apikeys/EditUsedCostModal.vue`
- 集成到 `ApiKeysView.vue` API Key 列表操作菜单

**后端 API**: `PUT /admin/api-keys/:id`
- 支持更新 `usedCost` 字段

### 6.2 过期时间编辑

**功能**: 在编辑 API Key 时支持修改过期时间

**前端组件**:
- `web/admin-spa/src/components/apikeys/EditApiKeyModal.vue` - 新增过期时间编辑区域
- 引用 `ExpiryEditModal.vue` 组件

---

## 7. 自动发货系统（闲鱼集成）

### 7.1 功能说明

**功能**: 提供 REST API 接口，自动生成和分配 API Keys，适合与电商平台（如闲鱼）自动发货系统集成

**特性**:
- 低入侵设计：独立路由模块，默认关闭
- Bearer Token 认证
- 支持账户绑定配置（专属/分组/共享模式）

### 7.2 环境变量配置

```bash
AUTO_DELIVERY_ENABLED=true                    # 启用自动发货（默认 false）
AUTO_DELIVERY_SECRET=your-64-char-secret      # 安全密钥
```

### 7.3 API 接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/auto-delivery/health` | GET | 健康检查 |
| `/auto-delivery/generate-api-key` | POST | 生成 API Key |

**生成 API Key 请求示例**:
```json
{
  "orderNo": "XY20251216001",
  "name": "客户001",
  "expiresInDays": 365,
  "totalCostLimit": 10,
  "accountBindings": [
    { "platform": "claude", "mode": "group", "groupId": "xxx" }
  ]
}
```

### 7.4 相关文件

- **路由**: `src/routes/autoDelivery.js`
- **文档**: `docs/AUTO_DELIVERY.md`、`docs/XIANYU_INTEGRATION.md`
- **测试**: `scripts/test-auto-delivery.sh`

---

## 8. 其他定制功能

### 8.1 Redis URL 连接支持

**功能**: 生产环境支持使用 Redis URL 连接

**环境变量**:
```bash
CRS_REDIS_URL=rediss://user:password@host:port
```

**支持格式**: `redis://` 和 `rediss://`（TLS）

### 8.2 智能定价 Fallback

**功能**: 当新模型发布但定价数据尚未更新时，自动使用同系列最新模型价格估算

**覆盖模型系列**:
| 系列 | 参考模型 | 估算价格 |
|------|----------|----------|
| GPT | gpt-5.1 | $1.75/$14 per 1M tokens |
| Claude | claude-sonnet-4.5 | $3/$15 per 1M tokens |
| Gemini | gemini-2.0-flash | $0.15/$0.60 per 1M tokens |

**代码位置**: `src/services/pricingService.js` 中的 `FORK CUSTOMIZATION` 代码块

### 8.3 统计页面增强

- 显示 `cache_create` 和 `cache_read` tokens
- 显示剩余预算（已用/总限额）
- 显示完整过期日期时间
- 费用统计从实时计算改为读取 Redis 累计值

### 8.4 模型映射中间件 (`src/middleware/modelMapper.js`)

**功能**: 根据 API Key 额度使用情况，智能映射 Claude 模型请求到低成本模型

**使用场景**:
- 成本控制：根据额度使用进度智能切换到低成本模型
- 测试：统一测试特定模型行为
- 灰度发布：逐步切换到新模型

**额度感知逻辑**:
- 前 10% 额度：不做映射，使用原始模型（保证初期体验）
- 10%-100% 额度：按概率映射，概率随使用比例线性增加
  - 10% 使用量 → 0% 概率映射
  - 55% 使用量 → 50% 概率映射
  - 100% 使用量 → 100% 概率映射

**概率计算公式**:
```
if usedRatio < threshold:
    probability = 0
else:
    probability = (usedRatio - threshold) / (1 - threshold)
```

**环境变量**:
```bash
MODEL_MAPPER_ENABLED=true                    # 启用映射（默认 false）
MODEL_MAPPER_TARGET=claude-haiku-4-5-20251001  # 目标模型
MODEL_MAPPER_THRESHOLD=0.1                   # 开始映射的阈值（默认 0.1 即 10%）
```

**行为**:
- 仅映射 Claude 系列模型（`claude-*`、`anthropic.*`），其他模型不受影响
- 如果 API Key 未设置额度限制（`totalCostLimit <= 0`），则直接映射（兼容旧逻辑）
- 日志记录映射决策详情（使用比例、概率、随机数）

---

## 合并注意事项

### 需保留的定制文件

```
# 核心定制
src/middleware/disguise.js
src/middleware/codexDisguise.js
src/middleware/debugInterceptor.js
src/middleware/requestLogger.js
src/middleware/codexRequestLogger.js
src/middleware/modelMapper.js
src/services/disguiseSettingsService.js
src/services/sentryTripletPoolService.js
src/services/codexSessionPoolService.js
src/routes/admin/disguiseSettings.js

# Vercel 部署
vercel.json
api/serverless.js
config/index.js

# 公开页面
web/public-pages/*
src/routes/publicPages.js
src/routes/admin/publicStats.js

# 自动发货
src/routes/autoDelivery.js
docs/AUTO_DELIVERY.md
docs/XIANYU_INTEGRATION.md
scripts/test-auto-delivery.sh
```

### 需保留的代码块

1. **智能定价 Fallback**: `src/services/pricingService.js` 搜索 "FORK CUSTOMIZATION"
2. **Vercel 日志适配**: 各日志文件中的 `isVercel` 检测逻辑
3. **费用统计统一化**: `src/routes/apiStats.js` 中的修改

### 环境变量清单

```bash
# 伪装相关
DISGUISE_ENABLED=true
DISGUISE_SESSION_ID=
DISGUISE_CLIENT_ID=
DISGUISE_UA=
USE_SENTRY_TRIPLET_POOL=true
USE_CODEX_SESSION_POOL=true
CODEX_SESSION_ID=
CODEX_USER_AGENT=

# 费用倍率
COST_MULTIPLIER=1.0
COST_MULTIPLIER_GPT_SERIES=0.71

# Redis URL（Vercel）
CRS_REDIS_URL=

# 调试
DEBUG_HTTP_TRAFFIC=false

# 模型映射
MODEL_MAPPER_ENABLED=false
MODEL_MAPPER_TARGET=claude-haiku-4-5-20251001
MODEL_MAPPER_THRESHOLD=0.1

# 自动发货
AUTO_DELIVERY_ENABLED=false
AUTO_DELIVERY_SECRET=
```

---

## 更新日志

| 日期 | 内容 |
|------|------|
| 2025-12-10 | 初始版本，整理所有定制功能 |
| 2025-12-13 | 新增智能定价 Fallback 机制 |
| 2025-12-18 | 重构文档结构，简化倍率系统，补充前端伪装开关、调试中间件、自动发货功能文档 |
| 2025-12-18 | 增强模型映射中间件：额度感知逻辑，前 10% 不映射，后 90% 按概率映射 |
| 2025-12-18 | Token 统计应用倍率：`/api-gateway-stats` 显示的 token 数量现在反映 COST_MULTIPLIER 设置 |
| 2025-12-18 | 重构倍率应用层：统一在 redis.js 层处理，移除 costCalculator/pricingService 中的重复应用 |
