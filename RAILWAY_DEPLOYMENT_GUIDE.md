# Railway 部署指南

## 📋 目录

- [为什么选择 Railway](#为什么选择-railway)
- [部署前准备](#部署前准备)
- [快速部署步骤](#快速部署步骤)
- [详细配置说明](#详细配置说明)
- [环境变量配置](#环境变量配置)
- [持久化存储配置](#持久化存储配置)
- [监控和日志](#监控和日志)
- [成本估算](#成本估算)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)

---

## 为什么选择 Railway

### ✅ Railway 的优势

1. **零改动部署**
   - 原生支持 Docker 和 Dockerfile
   - 自动检测并构建项目
   - 无需修改任何代码

2. **免费 Redis**
   - 内置 Redis 插件，无需额外配置
   - 自动注入连接环境变量
   - 生产级别的 Redis 服务

3. **慷慨的免费额度**
   - $5/月 免费额度（约 500 小时运行时间）
   - 适合轻量级到中等流量
   - 无信用卡要求（开始时）

4. **简单易用**
   - Web 界面直观友好
   - 一键部署和回滚
   - 自动 HTTPS 证书

5. **开发者友好**
   - GitHub 集成，自动部署
   - 实时日志查看
   - 完整的 CLI 工具

6. **生产就绪**
   - 自动扩展（付费计划）
   - 健康检查和自动重启
   - 全球 CDN 和边缘网络

### 📊 Railway vs 其他平台

| 特性 | Railway | Vercel | Render | Fly.io |
|-----|---------|--------|--------|--------|
| Docker 支持 | ✅ 原生 | ❌ | ✅ | ✅ |
| 免费 Redis | ✅ | ✅ (有限) | ✅ (25MB) | ⚠️ 需配置 |
| 长期运行服务 | ✅ | ❌ Serverless | ✅ | ✅ |
| 定时任务 | ✅ | ⚠️ Cron Jobs | ✅ | ✅ |
| 免费额度 | $5/月 | 有限制 | 750h/月 | 3 VM |
| 部署难度 | ⭐ 简单 | ⭐⭐ 需改造 | ⭐ 简单 | ⭐⭐ 中等 |
| 适合本项目 | ✅ 完美 | ❌ 不适合 | ✅ 很好 | ✅ 很好 |

---

## 部署前准备

### 1. Railway 账户

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录（推荐）
3. 验证邮箱地址

### 2. 项目准备

确保项目包含以下文件（已存在）：
- ✅ `Dockerfile` - Docker 构建配置
- ✅ `package.json` - Node.js 依赖
- ✅ `.env.example` - 环境变量示例
- ✅ `docker-entrypoint.sh` - 启动脚本

### 3. 生成密钥

在本地运行以下命令生成必需的密钥：

```bash
# 生成 32 字符的随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('base64').substring(0, 32))"

# 输出示例：
# JWT_SECRET: a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6
# ENCRYPTION_KEY: X7Y8Z9a0B1c2D3e4F5g6H7i8J9k0L1m2
```

保存这两个密钥，稍后配置环境变量时使用。

### 4. GitHub 仓库（可选但推荐）

如果项目还没有推送到 GitHub：

```bash
# 初始化 git（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/claude-relay-service.git

# 推送代码
git add .
git commit -m "Initial commit for Railway deployment"
git push -u origin main
```

---

## 快速部署步骤

### 方法 1：通过 GitHub（推荐）

#### 步骤 1: 创建新项目

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择你的 `claude-relay-service` 仓库
5. Railway 会自动检测 Dockerfile

#### 步骤 2: 添加 Redis 服务

1. 在项目页面，点击 **"+ New"**
2. 选择 **"Database"** → **"Add Redis"**
3. Redis 服务会自动创建并注入环境变量：
   - `REDIS_URL`（格式：`redis://default:password@host:port`）

#### 步骤 3: 配置环境变量

1. 点击你的服务（claude-relay-service）
2. 切换到 **"Variables"** 标签
3. 添加以下**必需**的环境变量：

```bash
# 🔐 安全配置（必填）
JWT_SECRET=<your-generated-jwt-secret>
ENCRYPTION_KEY=<your-generated-encryption-key>

# 📊 Redis 配置（自动注入，需要手动提取）
# Railway 提供 REDIS_URL，我们需要拆分成单独的变量
REDIS_HOST=<从 REDIS_URL 提取>
REDIS_PORT=<从 REDIS_URL 提取>
REDIS_PASSWORD=<从 REDIS_URL 提取>

# 🌐 应用配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 📝 其他重要配置
LOG_LEVEL=info
DEBUG=false
ENABLE_CORS=true
TRUST_PROXY=true
```

**自动化 Redis 配置**：Railway 提供 `REDIS_URL`，格式为：
```
redis://default:password@redis.railway.internal:6379
```

添加以下环境变量来自动解析：
```bash
# 从 REDIS_URL 自动提取（使用 Railway 的变量引用）
REDIS_HOST=${{Redis.REDIS_PRIVATE_URL}}  # Railway 会自动解析
```

**或者手动配置**：
1. 点击 Redis 服务查看连接信息
2. 复制 `Host`、`Port`、`Password`
3. 手动添加到应用的环境变量

#### 步骤 4: 配置持久化存储（推荐）

Railway 默认使用临时存储，重启后数据会丢失。配置持久化卷：

1. 在服务设置中，找到 **"Volumes"** 或 **"Settings"**
2. 添加挂载点：
   ```
   挂载路径: /app/logs
   ```
   ```
   挂载路径: /app/data
   ```

**注意**：Railway 的持久化卷在免费计划中可能有限制。

#### 步骤 5: 部署

1. 保存所有环境变量
2. Railway 会自动触发部署
3. 查看 **"Deployments"** 标签监控构建进度
4. 构建成功后，点击 **"Settings"** → **"Generate Domain"** 生成公开 URL

### 方法 2：通过 Railway CLI

#### 安装 CLI

```bash
# macOS/Linux
npm install -g @railway/cli

# 或使用 Homebrew (macOS)
brew install railway
```

#### 部署步骤

```bash
# 1. 登录 Railway
railway login

# 2. 在项目目录初始化
cd /path/to/claude-relay-service
railway init

# 3. 添加 Redis 服务
railway add -d redis

# 4. 设置环境变量
railway variables set JWT_SECRET="<your-jwt-secret>"
railway variables set ENCRYPTION_KEY="<your-encryption-key>"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

# 5. 链接 Redis（自动注入变量）
# Railway 会自动处理 Redis 连接

# 6. 部署
railway up

# 7. 查看日志
railway logs

# 8. 获取部署 URL
railway domain
```

---

## 详细配置说明

### Railway 项目结构

部署后，你的 Railway 项目会包含：

```
📦 claude-relay-service (Project)
  ├── 🚀 claude-relay-service (Service)
  │   ├── 🔧 Settings
  │   ├── 📊 Variables
  │   ├── 🚢 Deployments
  │   ├── 📝 Logs
  │   └── 📈 Metrics
  └── 📊 Redis (Service)
      ├── 🔗 Connect
      ├── 📊 Variables
      └── 📝 Logs
```

### Redis 连接配置

#### 选项 1: 使用 Railway 的服务引用（推荐）

Railway 提供了服务引用语法，自动处理内部网络连接：

```bash
# 在应用的环境变量中
REDIS_HOST=${{Redis.REDIS_PRIVATE_URL}}
```

这样 Railway 会自动解析为内部地址（如 `redis.railway.internal`）。

#### 选项 2: 手动配置

1. 点击 Redis 服务
2. 切换到 **"Connect"** 标签
3. 复制连接信息：
   ```
   Host: redis.railway.internal
   Port: 6379
   Password: <generated-password>
   ```
4. 在应用服务中添加环境变量：
   ```bash
   REDIS_HOST=redis.railway.internal
   REDIS_PORT=6379
   REDIS_PASSWORD=<generated-password>
   ```

#### 选项 3: 使用完整的 REDIS_URL

修改 `src/models/redis.js` 以支持 `REDIS_URL`：

```javascript
// 检查是否提供了 REDIS_URL
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    // ...其他配置
  });
}
```

### 健康检查配置

Railway 会自动使用 Dockerfile 中的 `HEALTHCHECK`：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
```

你也可以在 Railway 设置中自定义：
1. 服务设置 → **"Health Check"**
2. 设置路径：`/health`
3. 设置间隔和超时

### 域名配置

#### 生成 Railway 子域名

1. 服务设置 → **"Networking"** → **"Generate Domain"**
2. 获得类似：`https://claude-relay-production.up.railway.app`

#### 自定义域名

1. 服务设置 → **"Networking"** → **"Custom Domains"**
2. 添加你的域名（如 `api.yourdomain.com`）
3. 在域名 DNS 设置中添加 CNAME 记录：
   ```
   Type: CNAME
   Name: api
   Value: <railway-provided-cname>
   ```
4. 等待 DNS 传播和 SSL 证书自动配置

---

## 环境变量配置

### 必需的环境变量（最小配置）

```bash
# 🔐 安全配置
JWT_SECRET=<32字符随机字符串>
ENCRYPTION_KEY=<32字符随机字符串>

# 📊 Redis 配置
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=<from-railway-redis-service>

# 🌐 基础配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

### 推荐的生产环境变量

```bash
# 🔐 安全配置
JWT_SECRET=<your-generated-jwt-secret>
ENCRYPTION_KEY=<your-generated-encryption-key>
ADMIN_SESSION_TIMEOUT=86400000
API_KEY_PREFIX=cr_

# 📊 Redis 配置
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=<from-railway>
REDIS_DB=0

# 🔗 会话管理
STICKY_SESSION_TTL_HOURS=1
STICKY_SESSION_RENEWAL_THRESHOLD_MINUTES=15

# 🎯 Claude API 配置
CLAUDE_API_URL=https://api.anthropic.com/v1/messages
CLAUDE_API_VERSION=2023-06-01
CLAUDE_BETA_HEADER=claude-code-20250219,oauth-2025-04-20,interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14

# 🚫 错误处理
CLAUDE_OVERLOAD_HANDLING_MINUTES=5
CLAUDE_CONSOLE_BLOCKED_HANDLING_MINUTES=10

# 🌐 代理配置（如果需要）
DEFAULT_PROXY_TIMEOUT=600000
MAX_PROXY_RETRIES=3
PROXY_USE_IPV4=true

# ⏱️ 请求超时
REQUEST_TIMEOUT=600000

# 📈 使用限制
DEFAULT_TOKEN_LIMIT=1000000

# 📝 日志配置
LOG_LEVEL=info
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# 🔧 系统配置
CLEANUP_INTERVAL=3600000
TOKEN_USAGE_RETENTION=2592000000
HEALTH_CHECK_INTERVAL=60000
TIMEZONE_OFFSET=8
METRICS_WINDOW=5

# 🎨 Web 界面
WEB_TITLE=Claude Relay Service
WEB_DESCRIPTION=Multi-account Claude API relay service
WEB_LOGO_URL=/assets/logo.png

# 🛠️ 运维配置
DEBUG=false
DEBUG_HTTP_TRAFFIC=false
ENABLE_CORS=true
TRUST_PROXY=true

# 👥 用户管理（可选）
USER_MANAGEMENT_ENABLED=false
MAX_API_KEYS_PER_USER=1
ALLOW_USER_DELETE_API_KEYS=false

# 🔐 LDAP 认证（可选）
LDAP_ENABLED=false

# 📢 Webhook 通知（可选）
WEBHOOK_ENABLED=true
WEBHOOK_TIMEOUT=10000
WEBHOOK_RETRIES=3
WEBHOOK_ALLOW_LOCAL_URLS=false
```

### 环境变量配置技巧

#### 批量导入

1. 创建 `.env.railway` 文件：
   ```bash
   JWT_SECRET=xxx
   ENCRYPTION_KEY=xxx
   # ...其他变量
   ```

2. 使用 CLI 批量导入：
   ```bash
   # 导入所有变量
   railway variables set --from-file .env.railway

   # 或逐个导入
   source .env.railway
   railway variables set JWT_SECRET="$JWT_SECRET"
   ```

#### 使用 Railway 变量引用

Railway 支持引用其他服务的变量：

```bash
# 引用 Redis 服务的变量
REDIS_HOST=${{Redis.REDIS_PRIVATE_URL}}

# 引用项目级变量
API_BASE_URL=${{PROJECT_DOMAIN}}
```

---

## 持久化存储配置

### 为什么需要持久化

Railway 默认使用**临时文件系统**，每次部署或重启后数据会丢失。本项目需要持久化：
- `/app/logs` - 日志文件
- `/app/data` - 初始化数据（`init.json`）

### 配置持久化卷

#### 方法 1: 通过 Web 界面

1. 点击服务 → **"Settings"** → **"Volumes"**
2. 点击 **"+ New Volume"**
3. 配置卷：
   ```
   Volume Name: logs
   Mount Path: /app/logs
   ```
4. 再添加一个卷：
   ```
   Volume Name: data
   Mount Path: /app/data
   ```

#### 方法 2: 使用 railway.toml

在项目根目录创建 `railway.toml`：

```toml
[deploy]
startCommand = "node src/app.js"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 10

[[deploy.volumes]]
mountPath = "/app/logs"
name = "logs"

[[deploy.volumes]]
mountPath = "/app/data"
name = "data"
```

提交到 Git 并推送，Railway 会自动应用配置。

### 持久化注意事项

1. **卷大小限制**：
   - 免费计划可能有存储限制
   - 监控卷使用情况避免超出配额

2. **日志轮转**：
   - 项目已配置日志轮转（`LOG_MAX_SIZE=10m`, `LOG_MAX_FILES=5`）
   - 最多保留 50MB 日志

3. **Redis 持久化**：
   - Railway Redis 服务自动处理持久化
   - 无需额外配置

4. **备份策略**：
   - 定期导出 Redis 数据：`npm run data:export`
   - 下载日志文件备份

---

## 监控和日志

### 实时日志查看

#### Web 界面

1. 点击服务 → **"Logs"** 标签
2. 实时查看应用输出
3. 支持搜索和过滤

#### CLI

```bash
# 实时查看日志
railway logs

# 查看最近 100 行
railway logs --tail 100

# 只看错误日志
railway logs | grep ERROR
```

### 应用监控

#### 内置指标

Railway 提供的监控：
1. 点击服务 → **"Metrics"** 标签
2. 查看：
   - CPU 使用率
   - 内存使用
   - 网络流量
   - 请求响应时间

#### 健康检查

访问你的部署 URL：
```bash
curl https://your-app.up.railway.app/health
```

返回示例：
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "redis": "connected",
  "memory": {
    "used": "120 MB",
    "total": "512 MB"
  }
}
```

#### 系统指标

```bash
curl https://your-app.up.railway.app/metrics
```

### 日志级别调整

在 Railway 环境变量中设置：
```bash
LOG_LEVEL=debug  # 开发/调试
LOG_LEVEL=info   # 生产环境（默认）
LOG_LEVEL=warn   # 仅警告和错误
LOG_LEVEL=error  # 仅错误
```

### 日志下载

由于日志持久化到卷中，可以通过：
1. **临时容器**：运行一次性任务下载文件
2. **导出工具**：使用 Railway CLI 或 API
3. **应用端点**：添加管理端点提供日志下载（需要认证）

---

## 成本估算

### Railway 定价

#### 免费计划（Hobby）

- ✅ **$5 免费额度/月**
- ✅ 无需信用卡
- ✅ 包含：
  - 所有服务类型（Web、Redis、Cron 等）
  - 500 GB 出站流量
  - 合理的 CPU 和内存使用

**适用场景**：
- 个人项目
- 小团队开发
- 轻量级流量（< 1000 请求/天）

#### 付费计划（Developer / Team）

从 **$20/月** 起：
- ✅ 更高资源限额
- ✅ 优先级支持
- ✅ 团队协作功能
- ✅ 自定义资源配置

### 本项目预估成本

#### 场景 1: 小型个人使用

**配置**：
- 1x Web 服务（512MB 内存）
- 1x Redis 服务（256MB 内存）
- 流量：< 10 GB/月

**成本**：
- **免费计划足够**（< $5/月）

#### 场景 2: 小型团队

**配置**：
- 1x Web 服务（1GB 内存）
- 1x Redis 服务（512MB 内存）
- 流量：20-50 GB/月

**成本**：
- **约 $8-15/月**

#### 场景 3: 中型业务

**配置**：
- 1x Web 服务（2GB 内存）
- 1x Redis 服务（1GB 内存）
- 流量：100-200 GB/月

**成本**：
- **约 $25-40/月**

### 成本优化建议

1. **监控使用情况**
   - 定期查看 Railway 账单页面
   - 优化资源密集型操作

2. **日志管理**
   - 避免过度日志记录
   - 配置合适的 `LOG_LEVEL`

3. **缓存优化**
   - 充分利用 Redis 缓存
   - 减少外部 API 调用

4. **流量优化**
   - 启用响应压缩（已配置）
   - 使用 CDN 加速静态资源

### 与其他平台对比

| 场景 | Railway | VPS (DigitalOcean) | Render |
|-----|---------|-------------------|--------|
| 小型个人 | **免费** | $6/月 | 免费 |
| 小型团队 | $8-15/月 | $12/月 | $7/月 |
| 中型业务 | $25-40/月 | $24/月 | $25/月 |
| 部署难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 | ⭐ 简单 |
| 维护成本 | 低 | 高 | 低 |

**结论**：Railway 对于中小型项目性价比极高，特别适合不想管理基础设施的开发者。

---

## 常见问题

### Q1: 部署后无法访问？

**排查步骤**：

1. **检查部署状态**：
   ```bash
   railway status
   ```

2. **查看日志**：
   ```bash
   railway logs
   ```
   查找错误信息。

3. **验证环境变量**：
   ```bash
   railway variables
   ```
   确保 `JWT_SECRET`、`ENCRYPTION_KEY`、Redis 配置正确。

4. **测试健康检查**：
   ```bash
   curl https://your-app.up.railway.app/health
   ```

5. **检查端口配置**：
   - 确保 `PORT=3000`
   - Railway 会自动映射到公网

### Q2: Redis 连接失败？

**解决方案**：

1. **确认 Redis 服务运行**：
   - Railway Dashboard → Redis 服务 → 检查状态

2. **验证连接信息**：
   ```bash
   # 查看 Redis 变量
   railway variables --service redis

   # 在应用中打印连接信息（调试）
   DEBUG=true railway logs
   ```

3. **使用内部地址**：
   ```bash
   # 不要使用公网地址
   REDIS_HOST=redis.railway.internal  # ✅ 正确
   REDIS_HOST=redis-production.railway.app  # ❌ 错误
   ```

4. **测试连接**：
   在 Railway Shell 中运行：
   ```bash
   railway run redis-cli -h redis.railway.internal -p 6379 -a <password>
   ```

### Q3: 环境变量更新后不生效？

**原因**：Railway 需要重新部署才能应用环境变量更改。

**解决方案**：

1. **自动重新部署**：
   - 修改环境变量后，Railway 通常会自动触发重新部署

2. **手动重新部署**：
   ```bash
   railway up --detach
   ```

3. **重启服务**：
   ```bash
   railway restart
   ```

### Q4: 初始化失败，找不到 admin 凭据？

**解决方案**：

1. **检查 /app/data/init.json**：
   ```bash
   railway run ls -la /app/data/
   ```

2. **手动初始化**：
   ```bash
   railway run npm run setup
   ```

3. **使用环境变量指定管理员**：
   ```bash
   ADMIN_USERNAME=cr_admin_custom
   ADMIN_PASSWORD=your-secure-password
   ```

4. **查看初始化日志**：
   ```bash
   railway logs | grep -i "admin\|setup\|init"
   ```

### Q5: 部署很慢或超时？

**原因**：
- Docker 构建时间长（包含前端构建）
- 网络速度慢

**解决方案**：

1. **优化 Dockerfile**（已优化，使用多阶段构建）

2. **使用 Docker 缓存**：
   - Railway 会自动缓存层

3. **跳过前端构建**（如果不需要 Web 界面）：
   在 Dockerfile 中注释掉前端构建阶段。

4. **增加超时时间**：
   在 `railway.toml` 中：
   ```toml
   [build]
   buildCommand = "npm ci --only=production"
   ```

### Q6: 如何查看和管理 Redis 数据？

**方法 1: Redis CLI**

```bash
# 连接 Redis
railway run redis-cli -h redis.railway.internal -p 6379 -a <password>

# 查看所有键
railway run redis-cli -h redis.railway.internal -p 6379 -a <password> KEYS '*'

# 获取键值
railway run redis-cli -h redis.railway.internal -p 6379 -a <password> GET api_key:123
```

**方法 2: 使用本地工具**

1. 开启 Railway 代理：
   ```bash
   railway connect
   ```

2. 使用 Redis Desktop Manager 或 RedisInsight 连接：
   ```
   Host: localhost
   Port: <railway-proxy-port>
   Password: <from-railway>
   ```

**方法 3: 导出数据**

```bash
# 导出所有数据
railway run npm run data:export

# 下载导出文件
railway run cat data/export-*.json > local-export.json
```

### Q7: 如何回滚到之前的部署？

**Web 界面**：

1. 服务 → **"Deployments"** 标签
2. 找到要回滚的部署
3. 点击 **"Redeploy"**

**CLI**：

```bash
# 查看部署历史
railway deployments

# 回滚到指定部署
railway rollback <deployment-id>
```

### Q8: 域名 SSL 证书配置失败？

**排查步骤**：

1. **验证 DNS 配置**：
   ```bash
   dig api.yourdomain.com
   nslookup api.yourdomain.com
   ```

2. **检查 CNAME 记录**：
   - 确保指向 Railway 提供的地址
   - DNS 传播可能需要 10 分钟到 48 小时

3. **Railway 自动 SSL**：
   - Railway 使用 Let's Encrypt 自动配置
   - 等待 Railway 完成 SSL 证书申请

4. **查看 Railway 日志**：
   - 搜索 SSL 或证书相关错误

### Q9: 如何设置定时任务（Cron Jobs）？

Railway 支持 Cron 服务：

1. **创建 Cron 服务**：
   - Dashboard → 项目 → **"+ New"** → **"Cron"**

2. **配置调度**：
   ```bash
   # 每小时刷新 token
   0 * * * * curl -X POST https://your-app.up.railway.app/admin/refresh-tokens
   ```

3. **使用内部端点**：
   - 为 Cron 任务创建认证端点
   - 使用内部服务引用（无需公网）

**替代方案**：应用内部定时任务（已实现）
- `tokenRefreshService` - 自动 token 刷新
- `rateLimitCleanupService` - 速率限制清理

### Q10: 如何扩展和优化性能？

**垂直扩展**（增加资源）：

1. Railway Settings → **"Resources"**
2. 调整：
   - CPU 限制
   - 内存限制
   - 存储大小

**水平扩展**（多实例）：

Railway 付费计划支持多副本：
```toml
[deploy]
numReplicas = 2
```

**性能优化**：

1. **启用缓存**：
   - 项目已实现多层缓存
   - 调整缓存大小和 TTL

2. **数据库优化**：
   - 使用 Redis 管道操作
   - 减少不必要的查询

3. **代码优化**：
   - 异步处理
   - 连接池管理

4. **监控瓶颈**：
   ```bash
   railway metrics
   ```

---

## 最佳实践

### 1. 环境管理

#### 多环境策略

创建多个 Railway 项目：
- `claude-relay-dev` - 开发环境
- `claude-relay-staging` - 预发布环境
- `claude-relay-prod` - 生产环境

每个环境使用不同的环境变量和 Redis 实例。

#### 环境变量分组

```bash
# 开发环境
railway link claude-relay-dev
railway variables set NODE_ENV=development
railway variables set DEBUG=true

# 生产环境
railway link claude-relay-prod
railway variables set NODE_ENV=production
railway variables set DEBUG=false
```

### 2. CI/CD 集成

#### GitHub Actions

创建 `.github/workflows/railway.yml`：

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

获取 Railway Token：
```bash
railway login
railway whoami --token
```

将 token 添加到 GitHub Secrets。

### 3. 安全加固

#### 敏感数据管理

1. **永远不要提交密钥到 Git**：
   - 使用 `.gitignore` 忽略 `.env`、`data/init.json`

2. **使用强密钥**：
   ```bash
   # 生成强密钥
   openssl rand -base64 32
   ```

3. **定期轮换密钥**：
   - JWT_SECRET 每季度更换
   - ENCRYPTION_KEY 更换前需要数据迁移

4. **限制 Redis 访问**：
   - 使用 Railway 内部网络
   - 不要暴露 Redis 到公网

#### API 安全

1. **启用速率限制**（已实现）
2. **使用 HTTPS**（Railway 自动）
3. **配置 CORS**：
   ```bash
   ENABLE_CORS=true
   # 或指定允许的域名
   CORS_ORIGIN=https://yourdomain.com
   ```
4. **添加认证中间件**

### 4. 监控和告警

#### 日志聚合

考虑集成日志服务：
- **Logtail**（推荐，Railway 原生集成）
- **Papertrail**
- **Datadog**

配置方法：
1. Railway Settings → **"Integrations"**
2. 选择日志服务并授权

#### 性能监控

集成 APM 工具：
- **New Relic**
- **Datadog APM**
- **Sentry**（错误追踪）

安装示例（New Relic）：
```bash
npm install newrelic

# 在 src/app.js 顶部
require('newrelic');
```

#### 自定义告警

设置 Webhook 告警（已实现）：
```bash
WEBHOOK_ENABLED=true
WEBHOOK_URLS=https://hooks.slack.com/xxx
```

### 5. 备份策略

#### Redis 数据备份

**定时备份脚本**：

```bash
#!/bin/bash
# backup-redis.sh

# 导出数据
railway run npm run data:export

# 下载到本地
railway run cat data/export-$(date +%Y%m%d).json > backups/export-$(date +%Y%m%d).json

# 上传到云存储（可选）
aws s3 cp backups/export-$(date +%Y%m%d).json s3://your-bucket/
```

**配置 Cron**（本地或 GitHub Actions）：
```bash
0 2 * * * /path/to/backup-redis.sh
```

#### 日志备份

定期下载日志文件：
```bash
# 通过 Railway Shell 或临时容器
railway run tar -czf logs-backup.tar.gz /app/logs
```

### 6. 文档维护

#### 更新部署文档

每次重大更新后，记录：
- 环境变量更改
- 新增依赖
- 配置调整
- 数据迁移步骤

#### 运维手册

创建 `RUNBOOK.md`：
- 常见故障处理
- 紧急联系方式
- 回滚流程
- 数据恢复步骤

### 7. 性能调优

#### 内存优化

监控内存使用：
```bash
railway metrics --memory
```

如果内存不足：
1. 增加 Railway 内存限制
2. 优化应用代码（减少缓存大小）
3. 启用 Node.js 内存优化标志：
   ```toml
   [deploy]
   startCommand = "node --max-old-space-size=512 src/app.js"
   ```

#### 并发优化

调整 Node.js 集群（可选）：
```javascript
// src/cluster.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numWorkers = Math.min(os.cpus().length, 2);
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
} else {
  require('./app.js');
}
```

更新启动命令：
```toml
[deploy]
startCommand = "node src/cluster.js"
```

### 8. 成本控制

#### 监控使用量

定期检查：
- Railway Dashboard → **"Usage"**
- 查看 CPU、内存、流量使用情况

#### 优化策略

1. **合理配置资源**：
   - 不要过度分配
   - 根据实际使用调整

2. **减少外部流量**：
   - 使用内部服务引用
   - 缓存静态资源

3. **清理旧数据**：
   - 定期清理过期日志
   - 归档历史数据

---

## 部署检查清单

### 部署前

- [ ] 生成 `JWT_SECRET` 和 `ENCRYPTION_KEY`
- [ ] 准备好所有必需的环境变量
- [ ] 代码推送到 GitHub
- [ ] 本地测试通过（`npm test`）
- [ ] Dockerfile 验证（`docker build .`）

### 部署中

- [ ] Railway 项目创建成功
- [ ] Redis 服务添加并连接
- [ ] 所有环境变量配置完成
- [ ] 持久化卷配置（logs、data）
- [ ] 构建成功，无错误
- [ ] 健康检查通过

### 部署后

- [ ] 访问公开 URL，确认服务可用
- [ ] 测试 `/health` 端点
- [ ] 检查 Redis 连接状态
- [ ] 查看实时日志，确认无错误
- [ ] 测试管理界面登录
- [ ] 创建测试 API Key
- [ ] 发送测试请求验证功能
- [ ] 配置自定义域名（如需要）
- [ ] 设置监控和告警
- [ ] 文档更新（记录部署信息）

---

## 下一步

部署成功后，你可以：

1. **配置账户**：
   - 登录管理界面：`https://your-app.up.railway.app/admin-next`
   - 添加 Claude OAuth 账户
   - 配置其他平台账户（Gemini、OpenAI 等）

2. **创建 API Keys**：
   - 管理界面 → API Keys → 创建新 Key
   - 设置配额和权限

3. **测试集成**：
   ```bash
   curl -X POST https://your-app.up.railway.app/api/v1/messages \
     -H "x-api-key: cr_your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "claude-sonnet-4-5-20250929",
       "max_tokens": 1024,
       "messages": [{
         "role": "user",
         "content": "Hello!"
       }]
     }'
   ```

4. **监控和优化**：
   - 定期查看 Railway 指标
   - 根据实际使用调整资源
   - 优化成本和性能

---

## 获取帮助

- **Railway 文档**：https://docs.railway.app
- **项目 Issues**：提交问题到 GitHub
- **Railway 社区**：https://discord.gg/railway
- **本项目文档**：查看 `README.md` 和 `CLAUDE.md`

---

## 总结

Railway 是部署此项目的**最佳选择**，提供：
- ✅ **零改动部署** - 直接使用 Dockerfile
- ✅ **免费 Redis** - 无需额外配置
- ✅ **简单易用** - 几分钟即可部署
- ✅ **生产就绪** - 自动 HTTPS、健康检查、自动重启
- ✅ **性价比高** - $5 免费额度对小项目足够

按照本指南操作，你应该能在 **10-15 分钟内**完成部署。

祝部署顺利！🚀
