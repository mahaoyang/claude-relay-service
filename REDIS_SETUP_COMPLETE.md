# ✅ Redis升级完成！

## 🎉 当前状态

- ✅ **数据完整**：930个key全部恢复
- ✅ **AOF持久化已启用**：每秒同步，最多丢失1秒数据
- ✅ **RDB快照已配置**：多级备份策略
- ✅ **端口已映射**：Docker Redis 在 `127.0.0.1:6380`
- ✅ **应用配置已更新**：.env文件已修改为6380端口

## 📋 ���下来的步骤

### 1. 重启应用（必须）

```bash
# 停止应用
pm2 stop all  # 或 Ctrl+C

# 重启应用
npm start
```

### 2. 验证连接

打开浏览器访问管理界面，检查：
- 账户列表是否显示
- API Keys是否恢复
- 使用统计是否正常

### 3. （可选）停止本地Redis并切换回6379端口

**在PowerShell管理员模式下执行：**

```powershell
# 停止本地Redis服务
Stop-Service redis

# 禁用自动启动
Set-Service redis -StartupType Disabled
```

然后修改配置切换回标准端口：

```bash
# 1. 停止应用
pm2 stop all

# 2. 停止Docker Redis
docker stop claude-relay-redis
docker rm claude-relay-redis

# 3. 重新启动在6379端口
docker run -d \
  --name claude-relay-redis \
  --restart unless-stopped \
  -p 127.0.0.1:6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server \
  --requirepass y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= \
  --save 60 1 --save 300 10 --save 900 1 \
  --appendonly yes --appendfsync everysec \
  --dir /data

# 4. 修改.env中的端口
# REDIS_PORT=6379

# 5. 重启应用
npm start
```

## 🔄 自动备份设置

### Windows定时任务（推荐每6小时）

```powershell
# 在PowerShell中执行
schtasks /create /tn "Redis自动备份" /tr "C:\路径\到\项目\scripts\backup-redis-docker.bat" /sc hourly /mo 6 /ru SYSTEM
```

### 手动备份

```bash
# Linux/WSL
./scripts/backup-redis-docker.sh

# Windows
.\scripts\backup-redis-docker.bat
```

备份保存在 `backups/` 目录，自动保留最近7个备份。

## 🔍 验证命令

```bash
# 检查数据库大小
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= DBSIZE

# 检查持久化配置
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= CONFIG GET appendonly

# 查看AOF文件
docker exec claude-relay-redis ls -lh /data/appendonlydir/

# 测试连接
redis-cli -h 127.0.0.1 -p 6380 -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= PING
```

## 📊 持久化配置说明

| 持久化方式 | 配置 | 说明 |
|-----------|------|------|
| **RDB快照** | 60秒1��化<br>300秒10变化<br>900秒1变化 | 定期保存完整数据库快照 |
| **AOF日志** | appendonly yes<br>appendfsync everysec | 每秒同步一次写操作日志 |
| **Docker卷** | redis-data | 数据持久化到Docker volume |

## ⚠️ 重要提示

- **不要删除** `redis-data` Docker volume
- **定期备份**：使用提供的备份脚本
- **监控磁盘空间**：AOF和RDB会占用磁盘空间
- **数据库密码**：已配置在 .env 文件中，请妥善保管

## 🆘 故障排除

### 应用无法连接Redis

```bash
# 检查容器是否运行
docker ps | grep redis

# 检查端口是否正确映射
docker port claude-relay-redis

# 测试连接
redis-cli -h 127.0.0.1 -p 6380 -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= PING
```

### 数据丢失

```bash
# 从最近的备份恢复
docker stop claude-relay-redis
docker cp backups/dump-最新时间戳.rdb claude-relay-redis:/data/dump.rdb
docker start claude-relay-redis
```

### 性能问题

```bash
# 检查AOF文件大小
docker exec claude-relay-redis ls -lh /data/appendonlydir/

# 手动触发AOF重写
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= BGREWRITEAOF
```

---

**升级时间**: 2025-11-18
**数据恢复**: 930 keys ✅
**持久化**: RDB + AOF ✅
**备份**: 已配置 ✅
