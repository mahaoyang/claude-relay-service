# Redis Docker 数据持久化指南

## 当前状态说明

现有 Redis 容器数据持久化情况：
- ✅ **容器重启/系统重启**：数据保留
- ❌ **容器删除**（`docker rm`）：数据丢失

## 升级到永久持久化存储

### 方案一：使用 Docker Volume（推荐）

#### 步骤 1: 备份现有数据（可选但推荐）
```bash
# 从当前容器导出数据
docker exec claude-relay-redis redis-cli SAVE
docker cp claude-relay-redis:/data/dump.rdb ./redis-backup.rdb
```

#### 步骤 2: 停止并删除旧容器
```bash
docker stop claude-relay-redis
docker rm claude-relay-redis
```

#### 步骤 3: 创建带 Volume 的新容器
```bash
docker run -d \
  --name claude-relay-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:alpine
```

#### 步骤 4: 恢复数据（如果有备份）
```bash
docker cp ./redis-backup.rdb claude-relay-redis:/data/dump.rdb
docker restart claude-relay-redis
```

### 方案二：使用本地目录挂载

```bash
# 创建本地数据目录
mkdir -p ~/redis-data

# 启动容器
docker run -d \
  --name claude-relay-redis \
  -p 6379:6379 \
  -v ~/redis-data:/data \
  --restart unless-stopped \
  redis:alpine
```

## 验证数据持久化

### 测试步骤
```bash
# 1. 写入测试数据
docker exec -it claude-relay-redis redis-cli SET test_key "persistent_value"

# 2. 查看数据
docker exec -it claude-relay-redis redis-cli GET test_key

# 3. 重启容器
docker restart claude-relay-redis

# 4. 验证数据仍存在
docker exec -it claude-relay-redis redis-cli GET test_key
# 应该返回: "persistent_value"

# 5. 删除容器测试（仅在使用 Volume 时）
docker stop claude-relay-redis
docker rm claude-relay-redis

# 6. 用相同 Volume 重新创建容器
docker run -d \
  --name claude-relay-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:alpine

# 7. 验证数据仍存在
docker exec -it claude-relay-redis redis-cli GET test_key
# 应该仍返回: "persistent_value"
```

## Volume 管理命令

```bash
# 查看所有 volumes
docker volume ls

# 查看 volume 详细信息
docker volume inspect redis-data

# 备份 volume（推荐定期执行）
docker run --rm -v redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# 清理未使用的 volumes（谨慎使用）
docker volume prune
```

## 推荐配置

**生产环境建议**：
- 使用 Docker Volume（方案一）
- 定期备份 volume 数据
- 配置 Redis AOF 持久化（更高数据安全性）

**开发环境**：
- 当前配置已足够（容器重启数据保留）
- 如需删除容器重建，考虑使用 Volume

## 当前项目快速迁移

如果你现在就想升级到永久持久化，执行：

```bash
# 一键迁移脚本
cd /home/mhy/workspace/claude-relay-service

# 备份数据
docker exec claude-relay-redis redis-cli SAVE
docker cp claude-relay-redis:/data/dump.rdb ./redis-backup.rdb

# 重建容器（使用 Volume）
docker stop claude-relay-redis
docker rm claude-relay-redis
docker run -d \
  --name claude-relay-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:alpine

# 恢复数据
docker cp ./redis-backup.rdb claude-relay-redis:/data/dump.rdb
docker restart claude-relay-redis

# 验证服务正常
docker exec -it claude-relay-redis redis-cli PING
# 应该返回: PONG
```

## 注意事项

1. **当前配置够用吗？**
   - 如果你只是开发测试，当前配置已经足够
   - 只要不执行 `docker rm`，数据就不会丢失
   - 系统重启、容器重启都不会影响数据

2. **什么时候需要 Volume？**
   - 需要容器升级/重建时
   - 生产环境部署时
   - 需要在多个容器间共享数据时

3. **数据安全最佳实践**
   - 定期备份（每天/每周）
   - 使用 Volume 持久化
   - 配置 Redis RDB + AOF 双重持久化
   - 监控磁盘空间
