# 本地 Webhook 配置指南

本指南说明如何在本地开发/测试环境中使用 Webhook 功能。

---

## 🚀 快速开始

### 方法 1: 自动模式（推荐）

在开发环境中，系统会**自动允许**本地地址，无需额外配置：

```bash
# .env 文件
NODE_ENV=development
```

✅ 自动允许的地址：
- `http://localhost:3000/webhook`
- `http://127.0.0.1:8080/api/notify`
- `http://192.168.1.100/callback`
- `http://10.0.0.5/webhook`

---

### 方法 2: 手动启用（生产环境临时使用）

如果需要在生产环境中临时使用本地 Webhook：

```bash
# .env 文件
NODE_ENV=production
WEBHOOK_ALLOW_LOCAL_URLS=true  # 启用本地地址
```

⚠️ **安全警告**: 生产环境请谨慎使用，完成测试后请立即关闭！

---

## 📋 支持的本地地址

### ✅ 允许的本地地址类型

| 地址类型 | 示例 | 说明 |
|----------|------|------|
| localhost | `http://localhost:3000` | 本地主机名 |
| 127.0.0.1 | `http://127.0.0.1:8080` | 本地回环IPv4 |
| ::1 | `http://[::1]:8080` | 本地回环IPv6 |
| 私有网络 | `http://192.168.1.100` | 局域网地址 |
| 私有网络 | `http://10.0.0.5` | 私有网络A类 |
| 私有网络 | `http://172.16.0.10` | 私有网络B类 |

### ❌ 仍然被拒绝的地址

即使启用了本地地址，以下地址仍然会被拒绝：

| 地址类型 | 示例 | 原因 |
|----------|------|------|
| 非法协议 | `ftp://localhost/file` | 只支持 http/https |
| 保留地址 | `http://0.0.0.0/api` | 系统保留地址 |
| 多播地址 | `http://224.0.0.1/api` | 多播/实验性地址 |

---

## 🧪 测试示例

### 本地测试服务器

创建一个简单的测试服务器接收 Webhook：

```javascript
// test-webhook-server.js
const express = require('express')
const app = express()

app.use(express.json())

app.post('/webhook', (req, res) => {
  console.log('📢 收到 Webhook:', JSON.stringify(req.body, null, 2))
  res.json({ success: true, message: '收到通知' })
})

app.listen(3001, () => {
  console.log('🎯 Webhook 测试服务器运行在 http://localhost:3001')
})
```

运行测试服务器：
```bash
node test-webhook-server.js
```

### 配置 Webhook URL

在 `.env` 文件中配置：

```bash
# 开发环境自动允许本地地址
NODE_ENV=development

# 配置本地 Webhook URL
WEBHOOK_URLS=http://localhost:3001/webhook
```

或通过管理界面添加平台：
- **平台类型**: custom
- **URL**: `http://localhost:3001/webhook`
- **名称**: 本地测试服务器

---

## 🔍 验证配置

### 检查日志输出

启用本地地址后，日志会显示：

```
⚠️ 允许本地Webhook地址: localhost (开发模式)
✅ 成功发送到 本地测试服务器
```

### 测试 Webhook 连接

通过管理界面的"测试连接"功能验证：

1. 登录管理界面：`http://localhost:3000/admin-next/`
2. 进入 **Webhook 配置** 页面
3. 找到您的本地 Webhook 配置
4. 点击 **测试连接** 按钮
5. 查看测试结果

---

## 📊 配置对比表

| 环境 | NODE_ENV | WEBHOOK_ALLOW_LOCAL_URLS | 本地地址 | 公网地址 |
|------|----------|--------------------------|----------|----------|
| 开发 | development | (任意) | ✅ 允许 | ✅ 允许 |
| 生产 | production | false (默认) | ❌ 拒绝 | ✅ 允许 |
| 生产 | production | true | ✅ 允许 | ✅ 允许 |

---

## ⚠️ 安全最佳实践

### 开发环境
✅ **推荐做法**:
- 使用 `NODE_ENV=development` 自动启用本地地址
- 在本地测试所有 Webhook 功能
- 验证数据格式和错误处理

### 生产环境
❌ **不推荐做法**:
- 不要在生产环境中启用 `WEBHOOK_ALLOW_LOCAL_URLS=true`
- 避免使用本地地址作为 Webhook 目标

✅ **推荐做法**:
- 只使用公网域名（如 `https://your-domain.com/webhook`）
- 配置域名白名单限制允许的目标
- 定期检查 Webhook 日志

---

## 🛠️ 常见问题

### Q1: 为什么本地 Webhook 不工作？

**答**: 检查以下配置：

1. 确认 `NODE_ENV=development` 或 `WEBHOOK_ALLOW_LOCAL_URLS=true`
2. 检查本地测试服务器是否正在运行
3. 验证端口号是否正确
4. 查看日志文件 `logs/webhook-error.log`

```bash
# 查看最新的 Webhook 错误
tail -f logs/webhook-error.log
```

### Q2: 生产环境临时需要测试本地服务怎么办？

**答**: 临时启用，测试完成后立即关闭：

```bash
# 1. 临时启用
WEBHOOK_ALLOW_LOCAL_URLS=true

# 2. 重启服务
npm run service:restart

# 3. 完成测试后关闭
WEBHOOK_ALLOW_LOCAL_URLS=false

# 4. 再次重启
npm run service:restart
```

### Q3: Docker 环境如何配置本地 Webhook？

**答**: 使用 Docker 网络别名：

```yaml
# docker-compose.yml
services:
  relay-service:
    environment:
      - NODE_ENV=development
      - WEBHOOK_URLS=http://webhook-test:3001/webhook

  webhook-test:
    image: your-webhook-test-image
    ports:
      - "3001:3001"
```

### Q4: 局域网其他设备能访问本地 Webhook 吗？

**答**: 可以，配置示例：

```bash
# 使用局域网 IP 地址
WEBHOOK_URLS=http://192.168.1.100:3001/webhook

# 或使用主机名（需要 DNS/hosts 配置）
WEBHOOK_URLS=http://my-local-server.local:3001/webhook
```

---

## 📚 相关文档

- [Webhook 配置文档](./CLAUDE.md#webhook和通知)
- [安全修复报告](./SECURITY_FIXES.md)
- [API 文档](./docs/API.md)

---

## 💡 进阶技巧

### 使用 ngrok 暴露本地服务

如果需要在生产环境测试 Webhook（但不想修改安全配置）：

```bash
# 1. 启动 ngrok（需要先安装）
ngrok http 3001

# 2. 获取公网 URL
# 示例：https://abc123.ngrok.io

# 3. 配置 Webhook
WEBHOOK_URLS=https://abc123.ngrok.io/webhook
```

这样可以避免修改 `WEBHOOK_ALLOW_LOCAL_URLS` 设置。

### 使用环境变量模板

创建不同环境的配置文件：

```bash
# .env.development
NODE_ENV=development
WEBHOOK_URLS=http://localhost:3001/webhook

# .env.production
NODE_ENV=production
WEBHOOK_URLS=https://your-domain.com/webhook
WEBHOOK_ALLOW_LOCAL_URLS=false
```

切换环境：
```bash
# 开发环境
cp .env.development .env
npm run dev

# 生产环境
cp .env.production .env
npm start
```

---

## 📝 总结

- ✅ 开发环境自动允许本地地址（推荐）
- ✅ 生产环境可临时启用（谨慎使用）
- ✅ 支持所有常见的本地地址格式
- ✅ 仍然阻止非法协议和保留地址
- ✅ 日志会明确标记本地地址访问

**记住**: 生产环境中应始终使用公网域名和 HTTPS！
