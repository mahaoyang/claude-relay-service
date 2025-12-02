# Vercel 快速部署清单 ⚡

## 1️⃣ 准备 Redis（必需）

### 推荐：Upstash Redis（免费）
1. 访问 https://console.upstash.com/
2. 创建账户并登录
3. 点击 "Create Database"
4. 选择区域（推荐靠近你用户的位置）
5. 复制 `Redis URL`（格式：`rediss://...`）

## 2️⃣ 导入到 Vercel

1. 访问 https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 点击 "Import"

## 3️⃣ 配置环境变量（关键！）

在 Vercel 项目设置中添加：

### 最小必需配置
```bash
NODE_ENV=production
CRS_REDIS_URL=rediss://your-upstash-url  # 从步骤1复制
JWT_SECRET=                               # 随机32字符
ENCRYPTION_KEY=                           # 固定32字符
```

### 生成密钥
```bash
# 在本地终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 可选但推荐
```bash
ADMIN_USERNAME=your_admin_name
ADMIN_PASSWORD=your_secure_password
STICKY_SESSION_TTL_HOURS=1
```

## 4️⃣ 部署

点击 "Deploy" 按钮，等待构建完成（约 2-3 分钟）

## 5️⃣ 验证

访问以下 URL（替换 `your-app` 为你的项目名）：

- ✅ 健康检查: `https://your-app.vercel.app/health`
- 🎯 管理界面: `https://your-app.vercel.app/admin-next/`
- 📊 API 测试: `https://your-app.vercel.app/api/v1/models`

## 📝 重要提示

### ⚠️ Vercel 限制
- **免费计划**: 函数执行时间 10 秒
- **推荐**: Pro 计划（$20/月）函数执行时间 60 秒
- **长时间任务**: 建议升级或使用其他平台

### 🔐 安全
- ✅ JWT_SECRET 至少 32 字符
- ✅ ENCRYPTION_KEY 必须 32 字符
- ✅ 使用强管理员密码
- ✅ 定期更换密钥

### 🚀 自动部署
- 推送到 `main` 分支 → 自动部署到生产环境
- 推送到其他分支 → 创建预览环境
- PR → 自动创建预览部署

## 🆘 故障排查

### 部署失败
```bash
# 查看构建日志
→ Vercel Dashboard → Deployments → 查看失败的部署

# 常见问题
✅ 检查 package.json 依赖版本
✅ 检查 vercel.json 配置
✅ 查看构建错误信息
```

### Redis 连接失败
```bash
# 检查环境变量
✅ CRS_REDIS_URL 格式正确（rediss://...）
✅ Redis 数据库在线
✅ 防火墙允许 Vercel IP
```

### 管理界面打不开
```bash
# 检查路由
✅ 确保前端构建成功
✅ 检查 /admin-next/ 路径
✅ 查看浏览器控制台错误
```

## 📚 完整文档

详细部署指南请查看：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 🎉 完成！

部署成功后：
1. 登录管理界面
2. 添加 Claude 账户
3. 创建 API Key
4. 开始使用！

---

需要帮助？查看 [GitHub Issues](https://github.com/your-repo/issues)
