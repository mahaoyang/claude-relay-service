# Vercel 部署指南

本文档说明如何将 Claude Relay Service 部署到 Vercel。

## 前置要求

1. ✅ Vercel 账户
2. ✅ Redis 数据库（推荐使用 Upstash Redis 或其他云 Redis）
3. ✅ GitHub 仓库（用于自动部署）

## 部署步骤

### 1. 准备 Redis 数据库

**推荐使用 Upstash Redis:**
1. 访问 https://upstash.com/
2. 创建一个新的 Redis 数据库
3. 复制 Redis URL（格式：`redis://...` 或 `rediss://...`）

**或使用其他 Redis 服务:**
- Railway Redis
- Redis Labs
- AWS ElastiCache
- 任何支持 Redis URL 连接的服务

### 2. 导入项目到 Vercel

#### 方式一：通过 Vercel Dashboard

1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 选择你的 GitHub 仓库
4. 点击 "Import"

#### 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

```bash
# Node 环境
NODE_ENV=production

# Redis 连接（生产环境使用 CRS_REDIS_URL）
CRS_REDIS_URL=rediss://your-redis-url

# 安全密钥（至少32字符）
JWT_SECRET=your-jwt-secret-32-characters-or-more
ENCRYPTION_KEY=your-32-character-encryption-key

# 管理员凭据（可选，不设置会自动生成）
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
```

#### 可选的环境变量

```bash
# 服务器配置
PORT=3000
HOST=0.0.0.0

# API Key 前缀
API_KEY_PREFIX=cr_

# 会话配置
STICKY_SESSION_TTL_HOURS=1
STICKY_SESSION_RENEWAL_THRESHOLD_MINUTES=15

# Claude API 配置
CLAUDE_API_URL=https://api.anthropic.com/v1/messages
CLAUDE_API_VERSION=2023-06-01

# 错误处理
CLAUDE_OVERLOAD_HANDLING_MINUTES=10
CLAUDE_CONSOLE_BLOCKED_HANDLING_MINUTES=10

# 用户管理
USER_MANAGEMENT_ENABLED=false
MAX_API_KEYS_PER_USER=1
ALLOW_USER_DELETE_API_KEYS=false

# LDAP（如果需要）
LDAP_ENABLED=false
LDAP_URL=ldaps://ldap.example.com:636

# Webhook
WEBHOOK_ENABLED=true
WEBHOOK_URLS=https://your-webhook-url.com

# 其他配置
METRICS_WINDOW=5
REQUEST_TIMEOUT=600000
PROXY_USE_IPV4=true
```

### 4. 构建配置

Vercel 会自动使用以下配置：

#### `vercel.json` 配置说明

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/admin-next/(.*)",
      "dest": "/web/admin-spa/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/src/app.js"
    }
  ]
}
```

#### 构建过程

Vercel 会自动执行：

```bash
npm install              # 安装后端依赖
npm run vercel-build    # 执行构建脚本
  ↳ npm run install:web # 安装前端依赖
  ↳ npm run build:web   # 构建前端
```

### 5. 部署后验证

部署成功后，访问以下端点验证：

1. **健康检查**: `https://your-app.vercel.app/health`
2. **管理界面**: `https://your-app.vercel.app/admin-next/`
3. **API 端点**: `https://your-app.vercel.app/api/v1/models`

## 重要注意事项

### ⚠️ Vercel 限制

1. **函数执行时间限制**
   - Hobby 计划: 10 秒
   - Pro 计划: 60 秒
   - Enterprise 计划: 300 秒

2. **内存限制**
   - 默认: 1024 MB
   - 可在 `vercel.json` 中配置

3. **无状态设计**
   - Vercel Functions 是无状态的
   - 所有数据必须存储在 Redis 中

### 📝 Redis URL 格式

生产环境必须设置 `CRS_REDIS_URL`：

```bash
# 标准 Redis
redis://username:password@host:port/db

# Redis with TLS
rediss://username:password@host:port/db

# Upstash 示例
rediss://default:xxxxx@us1-xxxxx.upstash.io:6379
```

### 🔐 安全建议

1. **密钥生成**
   ```bash
   # 生成随机密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **环境变量保护**
   - 不要将密钥提交到 Git
   - 使用 Vercel 环境变量管理
   - 为生产环境设置强密码

3. **访问控制**
   - 配置管理员密码
   - 启用 API Key 认证
   - 考虑添加 IP 白名单

## 自动部署

Vercel 支持 Git 集成，自动部署：

1. **主分支**: `main` → 生产环境
2. **开发分支**: `dev` → 预览环境
3. **Pull Request**: 自动创建预览部署

配置自动部署：
- Settings → Git → Production Branch: `main`
- Settings → Git → Enable Automatic Deployments

## 故障排查

### 部署失败

1. **检查构建日志**
   - Vercel Dashboard → Deployments → 查看日志

2. **常见错误**
   ```bash
   # 依赖安装失败
   → 检查 package.json 中的依赖版本

   # 构建超时
   → 优化构建脚本

   # 内存不足
   → 增加函数内存限制
   ```

### 运行时错误

1. **Redis 连接失败**
   ```bash
   # 检查环境变量
   CRS_REDIS_URL 是否正确设置

   # 测试 Redis 连接
   redis-cli -u $CRS_REDIS_URL ping
   ```

2. **函数超时**
   ```bash
   # 检查执行时间
   → 优化数据库查询
   → 增加 maxDuration 设置
   ```

### 日志调试

Vercel 提供实时日志：

```bash
# 使用 Vercel CLI
vercel logs [deployment-url]

# 或在 Dashboard 查看
→ Deployments → 选择部署 → Runtime Logs
```

## 性能优化

### 1. 冷启动优化

```javascript
// 在 vercel.json 中配置
{
  "functions": {
    "src/app.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### 2. 缓存策略

- Redis 缓存频繁访问的数据
- 使用 Vercel Edge Caching

### 3. 监控

- 使用 Vercel Analytics
- 配置 Webhook 通知
- 监控 Redis 性能

## 成本估算

### Vercel 计划对比

| 项目 | Hobby (免费) | Pro | Enterprise |
|------|--------------|-----|------------|
| 函数执行时间 | 10s | 60s | 300s |
| 带宽 | 100GB | 1TB | 定制 |
| 部署次数 | 无限 | 无限 | 无限 |
| 团队成员 | 1 | 无限 | 无限 |
| 价格 | $0 | $20/月 | 定制 |

### Redis 成本

- **Upstash**: 免费层 10,000 命令/天
- **Redis Labs**: 免费层 30MB
- **自建**: 按服务器成本计算

## 进阶配置

### 自定义域名

1. Settings → Domains
2. 添加域名
3. 配置 DNS 记录

### 环境隔离

- **Production**: 主分支部署
- **Preview**: 功能分支/PR
- **Development**: 本地开发

### CI/CD 集成

配合 GitHub Actions：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 参考链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Upstash Redis](https://upstash.com/)
- [项目 README](./README.md)

## 支持

遇到问题？

1. 查看 [GitHub Issues](https://github.com/your-repo/issues)
2. 查看 Vercel 日志
3. 检查 Redis 连接状态
