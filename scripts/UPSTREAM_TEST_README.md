# 上游并发限制测试工具使用指南

## 📋 概述

这些脚本用于测试上游 API 的并发限制机制，帮助你确定：
1. **单个 API Key 的并发限制**（concurrencyLimit）
2. **多个 API Key 是否独立限制**（是否可以通过多 Key 扩展并发）
3. **速率限制**（rateLimitRequests）

提供两个版本：
- **Bash 版本** (`test-upstream-concurrency.sh`) - 简单快速，依赖少
- **Node.js 版本** (`test-upstream-concurrency.js`) - 功能强大，报告详细

---

## 🚀 快速开始

### 方法1: 使用 Bash 脚本（推荐快速测试）

#### 1. 配置脚本

编辑 `test-upstream-concurrency.sh`：

```bash
# 上游服务地址
UPSTREAM_URL="https://your-upstream-url.com"

# 你的 API Keys
API_KEY_1="cr_your_real_key_1"
API_KEY_2="cr_your_real_key_2"
API_KEY_3="cr_your_real_key_3"
```

#### 2. 运行测试

```bash
cd scripts
./test-upstream-concurrency.sh
```

#### 3. 查看结果

脚本会实时输出测试结果，示例：

```
[INFO] 测试1: 单个 API Key 的并发限制
[INFO] 测试并发数: 3
[SUCCESS]   请求 #1: 成功 (1234ms)
[SUCCESS]   请求 #2: 成功 (1456ms)
[SUCCESS]   请求 #3: 成功 (1678ms)
[INFO] 结果: 成功=3, 限流=0, 失败=0

[INFO] 测试并发数: 4
[SUCCESS]   请求 #1: 成功 (1234ms)
[SUCCESS]   请求 #2: 成功 (1456ms)
[SUCCESS]   请求 #3: 成功 (1678ms)
[ERROR]   请求 #4: 并发限流 (429) - Limit: 3
[WARNING] 检测到并发限制！限制值: 3
```

---

### 方法2: 使用 Node.js 脚本（推荐详细分析）

#### 1. 配置脚本

编辑 `test-upstream-concurrency.js`：

```javascript
const CONFIG = {
  upstreamUrl: 'https://your-upstream-url.com',

  apiKeys: [
    'cr_your_real_key_1',
    'cr_your_real_key_2',
    'cr_your_real_key_3'
  ],

  maxConcurrent: 10,
  testDelay: 2000,
  requestTimeout: 30000
}
```

#### 2. 运行测试

```bash
cd scripts
node test-upstream-concurrency.js

# 或者直接执行
./test-upstream-concurrency.js
```

#### 3. 查看结果

除了终端输出，还会生成 JSON 报告：

```bash
cat upstream-test-report.json
```

---

## 📊 测试说明

### 测试1: 单 Key 并发限制

**目的**: 找出单个 API Key 的最大并发数

**流程**:
1. 发送 1 个并发请求
2. 发送 2 个并发请求
3. 发送 3 个并发请求
4. ...
5. 直到出现 429 错误

**结果示例**:
```
单 Key 并发限制: 3
```

---

### 测试2: 多 Key 独立性

**目的**: 判断多个 API Key 是否共享并发限制

**流程**:
1. 用 Key1 发送 3 个长时间请求（占住并发槽）
2. 用 Key1 再发 1 个请求 → 预期被限流
3. 用 Key2 发送 1 个请求 → **观察是否成功**

**结果解读**:

| Key2 结果 | 含义 | 建议 |
|----------|------|------|
| ✅ 成功 | 多个 Key **独立限制** | **使用多 Key 方案扩展并发** |
| ❌ 429 限流 | 多个 Key **共享限制**（用户级） | 需要多个用户账户 |
| ⚠️ 其他错误 | 测试失败 | 检查配置或网络 |

---

### 测试3: 速率限制（可选）

**目的**: 找出 1 分钟内最大请求数

**流程**:
1. 在 1 分钟内快速发送请求（串行，不并发）
2. 直到出现 429 错误

**注意**: 此测试默认关闭，需要手动启用

---

## 🎯 根据测试结果的行动方案

### 场景A: 多 Key 独立 + 限制较低

**测试结果**:
```
单 Key 并发限制: 3
多 Key 独立性: ✅ 独立
```

**方案**: 使用多 Key 分发

```javascript
// 在下游配置多个上游 Key
const upstreamKeys = ['key_1', 'key_2', 'key_3']

// 根据 session 分配 Key
function selectKey(sessionId) {
  const hash = hashCode(sessionId)
  return upstreamKeys[hash % upstreamKeys.length]
}

// 总并发数 = 3 × 3 = 9
```

**优点**: 无需代码修改，配置即可

---

### 场景B: 多 Key 共享限制

**测试结果**:
```
单 Key 并发限制: 3
多 Key 独立性: ❌ 共享（用户级总限制）
```

**方案**: 请求多个用户账户

- 联系上游管理员
- 请求创建多个用户账户
- 每个账户生成独立的 API Key
- 用户级隔离，不共享限制

---

### 场景C: 限制足够高

**测试结果**:
```
单 Key 并发限制: 10
```

**方案**: 单 Key 已够用

- 在下游限制并发 < 10
- 实现请求队列机制
- 避免超过上游限制

---

## 🔧 高级配置

### 修改请求体

如果需要测试特定的请求：

```javascript
// Bash 脚本
REQUEST_BODY='{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [...]
}'

// Node.js 脚本
requestBody: {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [...]
}
```

### 调整测试参数

```bash
# Bash
MAX_CONCURRENT=20      # 最大并发测试数
TEST_DELAY=5           # 测试间隔（秒）
REQUEST_TIMEOUT=60     # 请求超时（秒）

# Node.js
maxConcurrent: 20,     # 最大并发测试数
testDelay: 5000,       # 测试间隔（毫秒）
requestTimeout: 60000  # 请求超时（毫秒）
```

### 启用速率限制测试

```bash
# Bash 脚本（取消注释）
test_rate_limit

# Node.js 脚本（取消注释）
allResults.rateLimit = await testRateLimit()
```

---

## 📝 JSON 报告格式

Node.js 脚本会生成 `upstream-test-report.json`：

```json
{
  "timestamp": "2025-01-17T12:34:56.789Z",
  "upstreamUrl": "https://your-upstream-url.com",
  "results": {
    "singleKeyConcurrency": [
      {
        "concurrent": 3,
        "success": 3,
        "rateLimited": 0,
        "failed": 0,
        "concurrencyLimit": null
      },
      {
        "concurrent": 4,
        "success": 3,
        "rateLimited": 1,
        "failed": 0,
        "concurrencyLimit": 3
      }
    ],
    "multiKeyIndependence": {
      "result": "independent",
      "key1Test": { "statusCode": 429, "..." },
      "key2Test": { "statusCode": 200, "..." }
    },
    "allKeysConcurrency": [
      { "key": 1, "limit": 3 },
      { "key": 2, "limit": 3 },
      { "key": 3, "limit": 3 }
    ]
  }
}
```

---

## ⚠️ 注意事项

### 1. 成本考虑

- 每次测试会产生真实的 API 调用
- 建议使用测试用的 API Key
- 或在低峰期进行测试

### 2. 测试影响

- 测试期间会占用并发槽
- 可能影响正常使用
- 建议在维护窗口进行

### 3. 超时设置

- 默认超时 30 秒
- 长时间请求测试使用 60 秒
- 根据网络状况调整

### 4. 依赖要求

**Bash 脚本**:
- `curl` (必需)
- `jq` (可选，用于 JSON 解析)

**Node.js 脚本**:
- Node.js >= 12 (内置依赖)

---

## 🐛 故障排除

### 问题1: 所有请求都失败

**检查**:
- 上游 URL 是否正确
- API Key 是否有效
- 网络连接是否正常

### 问题2: 无法检测到限制

**可能原因**:
- 并发限制 > 10（调整 `maxConcurrent`）
- 请求完成太快（使用长时间请求）
- 上游未配置限制

### 问题3: Key2 测试失败

**检查**:
- 是否配置了有效的 Key2
- Key1 的长请求是否已完成（增加等待时间）

---

## 📞 获取帮助

如有问题，请查看：
1. 上游服务的文档
2. 错误响应中的详细信息
3. 生成的 JSON 报告

---

## 🔄 后续步骤

根据测试结果：

1. **多 Key 独立** → 实施多 Key 分发方案
2. **多 Key 共享** → 请求多用户账户
3. **限制足够高** → 实施队列机制

需要实施方案时，请参考项目文档或联系开发者。
