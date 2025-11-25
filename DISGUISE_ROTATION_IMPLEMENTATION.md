# SessionId 双层概率式轮换功能实现总结

## 🎉 已完成功能

### 1. 核心架构 ✅

#### 数据结构
- **API Key 扩展** (`src/services/apiKeyService.js`)
  ```javascript
  sessionCollection: {
    enabled: boolean,        // 是否允许收集
    priority: 1-10,          // 优先级
    quota: number,           // 收集配额（-1 无限）
    collectedCount: number,  // 已收集次数
    lastCollectedAt: number, // 最后收集时间
    tags: string[]           // 标签
  }
  ```

- **Redis 数据结构**
  ```
  Claude CLI:
  - disguise:session_queue (Sorted Set)     # 优先级队列
  - disguise:online_set (Sorted Set)        # 在线集合
  - disguise:last_rotation_time (String)    # 轮换时间戳
  - disguise:rotation_lock (String)         # 分布式锁

  Codex:
  - codex_disguise:session_queue (Sorted Set)
  - codex_disguise:online_set (Sorted Set)
  - codex_disguise:last_rotation_time (String)
  - codex_disguise:rotation_lock (String)
  ```

#### 双层概率轮换
- **第一层 (P1)**: 决定是否考虑轮换（默认 15%）
- **第二层 (P2)**: 决定换几个（默认 40%）
- **保护机制**:
  - 最小轮换间隔（30秒）
  - 分布式锁防并发
  - 异步执行不阻塞请求

#### 优先级队列
- **score 计算**: `priority × 10¹² + timestamp`
- **高优先级优先**: ZPOPMAX 取最大 score
- **自动淘汰**: 队列满时移除最低优先级

#### 白名单控制
- API Key 级别的收集开关
- 配额限制（-1 无限，0 禁用，>0 限制）
- 频率限制（同一 Key 最小间隔 60 秒）
- 格式验证（UUID）

---

### 2. 已实现文件清单 ✅

| 文件 | 说明 | 状态 |
|------|------|------|
| `src/services/apiKeyService.js` | API Key 数据结构 + 统计更新 | ✅ |
| `src/utils/codexDisguiseHelper.js` | Codex 伪装核心逻辑（完全重写） | ✅ |
| `src/utils/disguiseHelper.js` | Claude 伪装核心逻辑（完全重写） | ✅ |
| `src/middleware/codexDisguise.js` | Codex 中间件 + 白名单检查 | ✅ |
| `src/middleware/disguise.js` | Claude 中间件 + 白名单检查 | ✅ |
| `.env.example` | 新增 30+ 配置项 | ✅ |
| `cli/index.js` | CLI 命令（5个子命令） | ✅ |
| `scripts/test-disguise-rotation.js` | 测试脚本 | ✅ |

---

### 3. CLI 命令 ✅

```bash
# 查看伪装状态（Claude + Codex）
npm run cli disguise
# 选择：📊 查看伪装状态

# 查看收集统计
npm run cli disguise
# 选择：📋 查看收集统计

# 启用 API Key 收集
npm run cli disguise
# 选择：✅ 启用 API Key 收集
# 输入：优先级 (1-10)、配额 (-1 无限)

# 禁用 API Key 收集
npm run cli disguise
# 选择：❌ 禁用 API Key 收集

# 清空 SessionId 池
npm run cli disguise
# 选择：🗑️  清空 SessionId 池
```

**输出示例**：
```
=== Claude CLI 伪装状态 ===
状态: ✅ 已启用

配置:
  轮换概率 P1: 15%
  轮换概率 P2: 40%
  最大轮换数: 1
  在线 SessionId: 3/3
  队列大小: 8/15

轮换指标:
  尝试次数: 42
  成功次数: 18
  累计轮换: 18 个
  最后轮换: 2025-11-25T10:30:45.123Z

队列详情:
┌──────────────────────┬────────┬──────────┬─────────────────────┐
│ SessionId            │ 优先级  │ 来源      │ 添加时间             │
├──────────────────────┼────────┼──────────┼─────────────────────┤
│ 9f10edbb-1407-47e... │ 10     │ VIP Key  │ 2025-11-25 10:25:30 │
│ 50475d3e-7ba5-417... │ 5      │ Test Key │ 2025-11-25 10:20:15 │
└──────────────────────┴────────┴──────────┴─────────────────────┘
```

---

### 4. 配置项 ✅

#### Claude CLI 伪装
```bash
DISGUISE_ENABLED=true                  # 启用伪装
DISGUISE_AUTO_VERSION=true             # 自动使用最新版本

# 队列和在线集合
DISGUISE_SESSION_QUEUE_SIZE=15         # 队列大小
DISGUISE_MAX_ONLINE_SESSIONS=3         # 最大在线数
DISGUISE_MIN_ONLINE_SESSIONS=2         # 最小在线数

# 双层概率
DISGUISE_ROTATION_P1=0.15              # 15% 概率考虑轮换
DISGUISE_ROTATION_P2=0.4               # 40% 概率换 1 个
DISGUISE_MAX_ROTATION_COUNT=1          # 每次最多换 1 个

# 保护
DISGUISE_MIN_ROTATION_INTERVAL=30      # 最小轮换间隔（秒）
DISGUISE_COLLECTION_MIN_INTERVAL=60    # 最小收集间隔（秒）
```

#### Codex 伪装
```bash
CODEX_DISGUISE_ENABLED=true            # 启用伪装
CODEX_SESSION_QUEUE_SIZE=15            # 队列大小
CODEX_MAX_ONLINE_SESSIONS=3            # 最大在线数
CODEX_MIN_ONLINE_SESSIONS=2            # 最小在线数
CODEX_ROTATION_P1=0.15                 # 15% 概率
CODEX_ROTATION_P2=0.4                  # 40% 概率
CODEX_MAX_ROTATION_COUNT=1             # 最多换 1 个
CODEX_MIN_ROTATION_INTERVAL=30         # 最小间隔
CODEX_COLLECTION_MIN_INTERVAL=60       # 收集间隔
```

#### 调试
```bash
DEBUG_DISGUISE=true                    # 详细日志
```

---

## 🚧 待完成功能

### 1. Web 界面（建议实现）

#### 需要修改的文件
- `web/admin-spa/src/components/apikeys/CreateApiKeyModal.vue`
- `web/admin-spa/src/components/apikeys/EditApiKeyModal.vue`

#### 实现步骤

**步骤 1**: 在表单数据中添加 sessionCollection
```vue
<script setup>
const formData = ref({
  // ... 现有字段
  sessionCollection: {
    enabled: false,
    priority: 1,
    quota: -1,
    tags: []
  }
})
</script>
```

**步骤 2**: 添加表单区块
```vue
<template>
  <!-- ... 现有表单 -->

  <!-- SessionId 收集配置 -->
  <div class="form-section">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      SessionId 收集配置
    </h3>

    <div class="space-y-4">
      <!-- 启用开关 -->
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          允许收集 SessionId
        </label>
        <input
          type="checkbox"
          v-model="formData.sessionCollection.enabled"
          class="toggle-checkbox"
        />
      </div>

      <!-- 收集启用时显示详细配置 -->
      <div v-if="formData.sessionCollection.enabled" class="space-y-4 pl-4 border-l-2 border-blue-500">
        <!-- 优先级 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            优先级 (1-10)
          </label>
          <input
            type="number"
            v-model.number="formData.sessionCollection.priority"
            min="1"
            max="10"
            class="input-field w-full"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            高优先级的 SessionId 优先进入队列和被使用
          </p>
        </div>

        <!-- 配额 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            收集配额
          </label>
          <input
            type="number"
            v-model.number="formData.sessionCollection.quota"
            min="-1"
            class="input-field w-full"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            -1: 无限制，0: 禁用，>0: 限制收集次数
          </p>
        </div>

        <!-- 标签 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标签（可选）
          </label>
          <input
            type="text"
            v-model="tagsInput"
            @blur="parseTags"
            placeholder="trusted, vip, test (逗号分隔)"
            class="input-field w-full"
          />
        </div>

        <!-- 统计信息（仅编辑模式） -->
        <div v-if="formData.sessionCollection.collectedCount > 0" class="stats-display">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            已收集: {{ formData.sessionCollection.collectedCount }} 次
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            最后收集: {{ formatTime(formData.sessionCollection.lastCollectedAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 标签处理
const tagsInput = ref('')

function parseTags() {
  formData.value.sessionCollection.tags = tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

function formatTime(timestamp) {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.form-section {
  @apply mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg;
}

.input-field {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600
         rounded-md bg-white dark:bg-gray-700
         text-gray-900 dark:text-gray-100
         focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.toggle-checkbox {
  @apply w-12 h-6 rounded-full appearance-none cursor-pointer
         bg-gray-300 dark:bg-gray-600
         checked:bg-blue-500
         transition-colors duration-200;
}

.stats-display {
  @apply p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800;
}
</style>
```

**步骤 3**: 提交时包含 sessionCollection 字段
```javascript
const submitForm = async () => {
  const payload = {
    // ... 现有字段
    sessionCollection: formData.value.sessionCollection
  }

  await api.post('/admin/api-keys', payload)
}
```

---

### 2. 监控统计（建议实现）

#### Dashboard 组件增强
文件: `web/admin-spa/src/views/Dashboard.vue`

添加伪装状态卡片：
```vue
<template>
  <!-- ... 现有卡片 -->

  <!-- SessionId 伪装状态卡片 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <!-- Claude CLI 伪装 -->
    <div class="stat-card">
      <div class="stat-header">
        <h3>Claude CLI 伪装</h3>
        <span :class="disguise.claude.enabled ? 'status-enabled' : 'status-disabled'">
          {{ disguise.claude.enabled ? '已启用' : '已禁用' }}
        </span>
      </div>

      <div v-if="disguise.claude.enabled" class="stat-body">
        <div class="stat-row">
          <span>在线 SessionId</span>
          <span class="font-semibold">
            {{ disguise.claude.onlineCount }}/{{ disguise.claude.maxOnline }}
          </span>
        </div>
        <div class="stat-row">
          <span>队列大小</span>
          <span class="font-semibold">
            {{ disguise.claude.queueSize }}/{{ disguise.claude.queueMax }}
          </span>
        </div>
        <div class="stat-row">
          <span>轮换成功率</span>
          <span class="font-semibold">
            {{ disguise.claude.successRate }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Codex 伪装 -->
    <div class="stat-card">
      <div class="stat-header">
        <h3>Codex 伪装</h3>
        <span :class="disguise.codex.enabled ? 'status-enabled' : 'status-disabled'">
          {{ disguise.codex.enabled ? '已启用' : '已禁用' }}
        </span>
      </div>

      <div v-if="disguise.codex.enabled" class="stat-body">
        <div class="stat-row">
          <span>在线 SessionId</span>
          <span class="font-semibold">
            {{ disguise.codex.onlineCount }}/{{ disguise.codex.maxOnline }}
          </span>
        </div>
        <div class="stat-row">
          <span>队列大小</span>
          <span class="font-semibold">
            {{ disguise.codex.queueSize }}/{{ disguise.codex.queueMax }}
          </span>
        </div>
        <div class="stat-row">
          <span>轮换成功率</span>
          <span class="font-semibold">
            {{ disguise.codex.successRate }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const disguise = ref({
  claude: {
    enabled: false,
    onlineCount: 0,
    maxOnline: 0,
    queueSize: 0,
    queueMax: 0,
    successRate: 0
  },
  codex: {
    enabled: false,
    onlineCount: 0,
    maxOnline: 0,
    queueSize: 0,
    queueMax: 0,
    successRate: 0
  }
})

async function fetchDisguiseStatus() {
  try {
    const response = await axios.get('/admin/disguise/status')
    const data = response.data

    // Claude
    disguise.value.claude = {
      enabled: data.claude.enabled,
      onlineCount: data.claude.onlineSet?.size || 0,
      maxOnline: data.claude.config?.maxOnlineSessions || 0,
      queueSize: data.claude.queue?.size || 0,
      queueMax: data.claude.queue?.maxSize || 0,
      successRate: data.claude.metrics?.rotationAttempts > 0
        ? Math.round((data.claude.metrics.rotationSuccess / data.claude.metrics.rotationAttempts) * 100)
        : 0
    }

    // Codex
    disguise.value.codex = {
      enabled: data.codex.enabled,
      onlineCount: data.codex.onlineSet?.size || 0,
      maxOnline: data.codex.config?.maxOnlineSessions || 0,
      queueSize: data.codex.queue?.size || 0,
      queueMax: data.codex.queue?.maxSize || 0,
      successRate: data.codex.metrics?.rotationAttempts > 0
        ? Math.round((data.codex.metrics.rotationSuccess / data.codex.metrics.rotationAttempts) * 100)
        : 0
    }
  } catch (error) {
    console.error('Failed to fetch disguise status:', error)
  }
}

onMounted(() => {
  fetchDisguiseStatus()
  // 每30秒刷新一次
  setInterval(fetchDisguiseStatus, 30000)
})
</script>

<style scoped>
.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
}

.stat-header {
  @apply flex items-center justify-between mb-4;
}

.stat-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}

.status-enabled {
  @apply px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.status-disabled {
  @apply px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300;
}

.stat-body {
  @apply space-y-3;
}

.stat-row {
  @apply flex items-center justify-between text-sm text-gray-600 dark:text-gray-400;
}
</style>
```

#### 后端 API 端点
文件: `src/routes/admin.js`

```javascript
const disguiseHelper = require('../utils/disguiseHelper')
const codexDisguiseHelper = require('../utils/codexDisguiseHelper')

// 获取伪装状态
router.get('/admin/disguise/status', authenticateAdmin, async (req, res) => {
  try {
    const claudeInfo = await disguiseHelper.getDisguiseInfo()
    const codexInfo = await codexDisguiseHelper.getCodexDisguiseInfo()

    res.json({
      success: true,
      claude: claudeInfo,
      codex: codexInfo
    })
  } catch (error) {
    logger.error('Failed to get disguise status:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})
```

---

## 📊 使用示例

### 场景 1：VIP 客户端高优先级收集
```bash
# 1. 启用伪装
DISGUISE_ENABLED=true
CODEX_DISGUISE_ENABLED=true

# 2. 通过 CLI 启用 VIP Key 收集
npm run cli disguise
# 选择：✅ 启用 API Key 收集
# 选择 API Key: VIP-Client
# 输入优先级: 10
# 输入配额: -1（无限）

# 3. VIP 客户端开始使用，自动收集 sessionId
# 4. 系统自动轮换，VIP sessionId 优先被使用
```

### 场景 2：测试环境限制收集
```bash
# 通过 CLI 启用测试 Key 收集
npm run cli disguise
# 选择 API Key: Test-Client
# 输入优先级: 1
# 输入配额: 50（只收集50次）
```

### 场景 3：查看实时状态
```bash
# CLI 查看
npm run cli disguise
# 选择：📊 查看伪装状态

# 查看收集统计
npm run cli disguise
# 选择：📋 查看收集统计
```

---

## 🎯 核心优势

1. **自然行为模拟**: 概率式轮换，难以被检测
2. **动态质量管理**: 优先级队列，自动使用最优 sessionId
3. **灵活控制**: 白名单 + 配额 + 频率限制
4. **高可用**: 分布式锁 + 兜底机制 + 异步执行
5. **可观测**: CLI 详细统计 + 日志 + 监控
6. **双平台支持**: Claude CLI + Codex 同时支持

---

## 🔧 调试和监控

### 启用调试日志
```bash
DEBUG_DISGUISE=true
```

### 日志示例
```
📥 Collected Claude sessionId [priority=10] from API Key: VIP Client
🔄 Rotated 1 Claude sessionIds, online: 3
➕ Added Codex sessionId to online set: 019a9544-7ab1-73c1...
```

### Redis 键监控
```bash
# 查看队列
redis-cli ZRANGE disguise:session_queue 0 -1 WITHSCORES

# 查看在线集合
redis-cli ZRANGE disguise:online_set 0 -1 WITHSCORES

# 查看轮换时间
redis-cli GET disguise:last_rotation_time
```

---

## ✅ 核心功能验证清单

- [x] API Key 数据结构扩展
- [x] 优先级队列实现
- [x] 在线集合管理
- [x] 双层概率轮换
- [x] 白名单控制
- [x] 配额和频率限制
- [x] Claude CLI 伪装
- [x] Codex 伪装
- [x] 两个中间件集成
- [x] CLI 命令工具
- [x] 测试脚本
- [x] 环境变量配置
- [ ] Web 界面（建议补充）
- [ ] 监控统计（建议补充）

---

## 🚀 快速开始

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，设置：
#   DISGUISE_ENABLED=true
#   CODEX_DISGUISE_ENABLED=true

# 2. 启动服务
npm start

# 3. 通过 CLI 启用 API Key 收集
npm run cli disguise

# 4. 测试功能
node scripts/test-disguise-rotation.js
```

---

## 📝 注意事项

1. **配额耗尽**: 当 API Key 配额耗尽时，不再收集新的 sessionId
2. **队列为空**: 自动使用默认 sessionId 兜底
3. **Redis 连接**: 确保 Redis 运行正常，否则使用默认值
4. **格式验证**: 只收集 UUID 格式的 sessionId
5. **异步轮换**: 轮换逻辑异步执行，不阻塞请求

---

## 💡 后续优化建议

1. **Web 界面**: 完成 API Key 表单的 sessionCollection 配置区块
2. **Dashboard**: 添加伪装状态监控卡片
3. **告警**: sessionId 池耗尽时的通知机制
4. **日志**: 收集行为的详细审计日志
5. **测试**: 单元测试和集成测试覆盖
