# Redis 安全配置指南

## ✅ 已实施的安全措施

### 1. 网络访问限制

**配置**：Redis 只绑定到 `127.0.0.1` (localhost)

```bash
# Docker 端口映射
-p 127.0.0.1:6379:6379  # 只允许本地访问
```

**验证**：
```bash
# 查看端口绑定
docker port claude-relay-redis
# 输出: 6379/tcp -> 127.0.0.1:6379 ✅

# 从外部无法访问
telnet <你的外部IP> 6379  # 连接失败 ✅
```

**安全等级**：⭐⭐⭐⭐⭐
- ✅ 外部网络无法访问
- ✅ 只有本机应用可以连接
- ✅ 防止网络扫描和攻击

---

### 2. 密码认证

**配置**：Redis 启用强密码保护

```bash
# .env 配置
REDIS_PASSWORD=y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=

# Docker 启动参数
redis-server --requirepass "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y="
```

**验证**：
```bash
# 无密码连接 - 失败
docker exec claude-relay-redis redis-cli PING
# (error) NOAUTH Authentication required. ✅

# 带密码连接 - 成功
docker exec claude-relay-redis redis-cli -a "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=" PING
# PONG ✅
```

**密码强度**：
- 长度：44 字符
- 生成方式：`openssl rand -base64 32`
- 包含大小写字母、数字、特殊字符

**安全等级**：⭐⭐⭐⭐⭐

---

### 3. 数据持久化

**配置**：使用 Docker Volume 持久化存储

```bash
# Volume 配置
-v redis-data:/data

# 数据保存路径
/data/dump.rdb  # RDB 快照
```

**验证**：
```bash
# 查看 volume
docker volume ls | grep redis-data
# local     redis-data ✅

# 查看 volume 详情
docker volume inspect redis-data
```

**安全等级**：⭐⭐⭐⭐⭐
- ✅ 容器删除后数据不丢失
- ✅ 系统重启后数据保留
- ✅ 支持数据备份和恢复

---

## 🔒 安全架构总览

```
外部网络 ❌ → [防火墙/路由器] → 本机网络
                                    ↓
                              127.0.0.1:6379 (Redis)
                                    ↑ 需要密码
                              应用服务 (localhost:3001)
                                    ↑
                              用户访问 ✅
```

**安全层次**：
1. **网络层**：只绑定 localhost，外部无法访问
2. **认证层**：强密码保护，防止未授权访问
3. **数据层**：Volume 持久化，防止数据丢失
4. **应用层**：应用服务验证 Redis 密码后连接

---

## 📋 配置文件清单

### .env 配置
```env
# Redis 安全配置
REDIS_HOST=localhost          # 连接地址（本地）
REDIS_PORT=6379              # 端口
REDIS_PASSWORD=y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=  # 强密码
REDIS_DB=0
REDIS_ENABLE_TLS=
```

### Docker 命令
```bash
docker run -d \
  --name claude-relay-redis \
  -p 127.0.0.1:6379:6379 \             # 只绑定 localhost
  -v redis-data:/data \                # Volume 持久化
  --restart unless-stopped \           # 自动重启
  redis:alpine redis-server --requirepass "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y="
```

---

## 🧪 安全测试

### 测试 1: 网络隔离
```bash
# 从本机访问 - 成功
redis-cli -h 127.0.0.1 -p 6379 -a "密码" PING
# PONG ✅

# 从外部访问 - 失败
redis-cli -h <外部IP> -p 6379 PING
# Could not connect ✅
```

### 测试 2: 密码保护
```bash
# 无密码 - 失败
redis-cli PING
# (error) NOAUTH Authentication required. ✅

# 错误密码 - 失败
redis-cli -a "wrong_password" PING
# (error) WRONGPASS invalid username-password pair ✅

# 正确密码 - 成功
redis-cli -a "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=" PING
# PONG ✅
```

### 测试 3: 数据持久化
```bash
# 1. 写入测试数据
redis-cli -a "密码" SET test_persistence "data_safe"

# 2. 重启容器
docker restart claude-relay-redis

# 3. 验证数据存在
redis-cli -a "密码" GET test_persistence
# "data_safe" ✅

# 4. 删除容器
docker stop claude-relay-redis && docker rm claude-relay-redis

# 5. 用相同 Volume 重建容器
docker run -d --name claude-relay-redis \
  -p 127.0.0.1:6379:6379 \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:alpine redis-server --requirepass "密码"

# 6. 验证数据仍存在
redis-cli -a "密码" GET test_persistence
# "data_safe" ✅
```

---

## 🛡️ 额外安全建议

### 1. 防火墙规则（可选）
```bash
# Ubuntu/Debian 使用 ufw
sudo ufw deny 6379/tcp  # 明确禁止外部访问 Redis 端口

# CentOS/RHEL 使用 firewalld
sudo firewall-cmd --permanent --remove-port=6379/tcp
sudo firewall-cmd --reload
```

### 2. Redis 配置优化（可选）
```bash
# 禁用危险命令
docker run -d ... redis:alpine redis-server \
  --requirepass "密码" \
  --rename-command FLUSHDB "" \
  --rename-command FLUSHALL "" \
  --rename-command CONFIG "" \
  --rename-command KEYS ""
```

### 3. 定期备份
```bash
# 手动备份
docker exec claude-relay-redis redis-cli -a "密码" SAVE
docker cp claude-relay-redis:/data/dump.rdb ./backup-$(date +%Y%m%d).rdb

# 自动备份脚本（添加到 crontab）
0 2 * * * /path/to/backup-script.sh  # 每天凌晨2点备份
```

### 4. 监控和日志
```bash
# 查看 Redis 日志
docker logs -f claude-relay-redis

# 监控连接数
docker exec claude-relay-redis redis-cli -a "密码" CLIENT LIST

# 监控内存使用
docker exec claude-relay-redis redis-cli -a "密码" INFO memory
```

---

## 🚨 安全检查清单

- [x] Redis 只绑定到 127.0.0.1
- [x] 启用强密码认证（44字符）
- [x] 使用 Volume 持久化数据
- [x] 容器自动重启（--restart unless-stopped）
- [x] 应用服务正确配置密码（.env）
- [ ] 设置防火墙规则（可选）
- [ ] 禁用危险命令（可选）
- [ ] 配置定期备份（推荐）
- [ ] 设置监控告警（推荐）

---

## 📞 故障排查

### 问题 1: 应用无法连接 Redis
```bash
# 检查 Redis 是否运行
docker ps | grep redis

# 检查 .env 密码配置
grep REDIS_PASSWORD .env

# 测试密码是否正确
docker exec claude-relay-redis redis-cli -a "$(grep REDIS_PASSWORD .env | cut -d= -f2)" PING
```

### 问题 2: 数据丢失
```bash
# 检查 Volume 是否存在
docker volume ls | grep redis-data

# 检查备份文件
ls -lh redis-backup-*.rdb

# 恢复数据
docker cp redis-backup-XXXXXXXX.rdb claude-relay-redis:/data/dump.rdb
docker restart claude-relay-redis
```

### 问题 3: 连接超时
```bash
# 检查端口绑定
docker port claude-relay-redis
# 应该是: 6379/tcp -> 127.0.0.1:6379

# 检查网络连通性
telnet 127.0.0.1 6379
```

---

## 🎯 安全等级评估

**当前配置安全等级：⭐⭐⭐⭐⭐ (5/5)**

- ✅ 网络隔离（只允许本地访问）
- ✅ 强密码认证（44字符随机密码）
- ✅ 数据持久化（Docker Volume）
- ✅ 自动重启（服务可靠性）

**适用场景**：
- ✅ 开发环境
- ✅ 测试环境
- ✅ 单机生产环境（本地应用）

**不适用场景**：
- ❌ 分布式部署（多台服务器需要访问Redis）
- ❌ 需要远程管理（建议使用 TLS + VPN）

---

## 📚 参考文档

- [Redis Security](https://redis.io/docs/management/security/)
- [Docker Redis](https://hub.docker.com/_/redis)
- [Redis Authentication](https://redis.io/docs/management/security/#authentication)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)

---

**最后更新**：2025-11-11
**版本**：v1.0
**状态**：已部署 ✅
