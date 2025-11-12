# Redis 开机启动控制指南

## 📋 当前状态

- ✅ **Node.js 服务**：已停止
- ✅ **Redis 容器**：已停止
- ✅ **开机自启动**：已禁用（restart policy = no）

---

## 🔧 Redis 重启策略管理

### 查看当前重启策略

```bash
docker inspect claude-relay-redis --format '{{.HostConfig.RestartPolicy.Name}}'
```

**输出说明**：
- `no` - 不自动重启（包括开机）
- `always` - 总是自动重启（包括开机）
- `unless-stopped` - 除非手动停止，否则自动重启
- `on-failure` - 仅在失败时重启

---

## 🚀 方法 1: 禁用开机自启动（已执行）

```bash
# 停止 Redis 容器
docker stop claude-relay-redis

# 禁用自动重启
docker update --restart=no claude-relay-redis
```

**效果**：
- ✅ 开机后 Redis **不会**自动启动
- ✅ 容器崩溃后 Redis **不会**自动重启
- ✅ 需要手动启动才能运行

---

## 🔄 方法 2: 启用开机自启动

### 选项 A: 总是自动重启（推荐生产环境）

```bash
docker update --restart=always claude-relay-redis
```

**效果**：
- 开机自动启动
- 容器崩溃自动重启
- 即使手动停止后重启也会自动启动

### 选项 B: 除非手动停止（推荐开发环境）

```bash
docker update --restart=unless-stopped claude-relay-redis
```

**效果**：
- 开机自动启动
- 容器崩溃自动重启
- 手动停止后重启**不会**自动启动

### 选项 C: 仅失败时重启

```bash
docker update --restart=on-failure:5 claude-relay-redis
```

**效果**：
- 开机**不会**自动启动
- 容器崩溃自动重启（最多5次）
- 正常停止**不会**重启

---

## 📝 手动启动/停止命令

### 启动 Redis

```bash
# 启动容器
docker start claude-relay-redis

# 验证运行状态
docker ps | grep redis

# 测试连接
docker exec claude-relay-redis redis-cli -a "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=" PING
```

### 停止 Redis

```bash
# 优雅停止（等待保存数据）
docker stop claude-relay-redis

# 强制停止（不推荐）
docker kill claude-relay-redis
```

### 重启 Redis

```bash
docker restart claude-relay-redis
```

---

## 🎯 启动服务组合命令

### 方案 1: 启动 Redis + Node 服务

```bash
# 启动 Redis
docker start claude-relay-redis

# 等待 Redis 就绪
sleep 2

# 启动 Node 服务（前台运行）
cd /home/mhy/workspace/claude-relay-service
npm run dev
```

### 方案 2: 启动 Redis + Node 服务（后台）

```bash
# 启动 Redis
docker start claude-relay-redis

# 等待 Redis 就绪
sleep 2

# 后台启动 Node 服务
cd /home/mhy/workspace/claude-relay-service
nohup npm run dev > logs/app.log 2>&1 &

# 查看日志
tail -f logs/app.log
```

### 方案 3: 一键启动脚本

创建启动脚本 `start-services.sh`：

```bash
#!/bin/bash

echo "🚀 启动 Claude Relay Service..."

# 启动 Redis
echo "📊 启动 Redis..."
docker start claude-relay-redis
if [ $? -ne 0 ]; then
    echo "❌ Redis 启动失败！"
    exit 1
fi

# 等待 Redis 就绪
echo "⏳ 等待 Redis 就绪..."
sleep 3

# 验证 Redis 连接
docker exec claude-relay-redis redis-cli -a "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=" PING > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Redis 连接失败！"
    exit 1
fi
echo "✅ Redis 运行正常"

# 启动 Node 服务
echo "🚀 启动 Node 服务..."
cd /home/mhy/workspace/claude-relay-service
npm run dev
```

**使用方法**：

```bash
# 赋予执行权限
chmod +x start-services.sh

# 运行脚本
./start-services.sh
```

---

## 🛑 停止服务组合命令

### 方案 1: 停止所有服务

```bash
# 停止 Node 服务
pkill -f "npm run dev"
pkill -f "node.*app.js"

# 停止 Redis
docker stop claude-relay-redis
```

### 方案 2: 一键停止脚本

创建停止脚本 `stop-services.sh`：

```bash
#!/bin/bash

echo "🛑 停止 Claude Relay Service..."

# 停止 Node 服务
echo "🛑 停止 Node 服务..."
pkill -f "npm run dev"
pkill -f "node.*app.js"
sleep 1

# 停止 Redis
echo "📊 停止 Redis..."
docker stop claude-relay-redis

echo "✅ 所有服务已停止"
```

**使用方法**：

```bash
# 赋予执行权限
chmod +x stop-services.sh

# 运行脚本
./stop-services.sh
```

---

## 🔍 服务状态查看

### 查看所有服务状态

```bash
echo "=== Node.js 服务 ==="
ps aux | grep -E "npm run dev|node.*app.js" | grep -v grep || echo "未运行"

echo -e "\n=== Redis 容器 ==="
docker ps -a --filter "name=claude-relay-redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== Redis 重启策略 ==="
docker inspect claude-relay-redis --format '{{.HostConfig.RestartPolicy.Name}}'
```

### 查看服务健康状态

```bash
# 测试 Redis 连接
docker exec claude-relay-redis redis-cli -a "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y=" PING 2>&1 | grep -v Warning

# 测试 Node 服务
curl -s http://localhost:3010/health | grep -o '"status":"[^"]*"'
```

---

## 📊 Docker 容器管理

### 查看所有容器

```bash
docker ps -a
```

### 查看容器日志

```bash
# 实时查看日志
docker logs -f claude-relay-redis

# 查看最近 100 行
docker logs --tail 100 claude-relay-redis
```

### 查看容器资源占用

```bash
docker stats claude-relay-redis
```

### 删除容器（保留数据）

```bash
# 停止容器
docker stop claude-relay-redis

# 删除容器（Volume 数据保留）
docker rm claude-relay-redis

# 用相同配置重建容器
docker run -d \
  --name claude-relay-redis \
  -p 127.0.0.1:6379:6379 \
  -v redis-data:/data \
  --restart=no \
  redis:alpine redis-server --requirepass "y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y="
```

---

## 🎯 不同场景推荐配置

### 开发环境（当前推荐）

```bash
# 禁用自动启动，手动控制
docker update --restart=no claude-relay-redis
```

**优点**：
- ✅ 不占用系统资源
- ✅ 需要时手动启动
- ✅ 灵活控制

### 测试环境

```bash
# 除非手动停止，否则自动启动
docker update --restart=unless-stopped claude-relay-redis
```

**优点**：
- ✅ 开机自动启动
- ✅ 崩溃自动恢复
- ✅ 手动停止后不再自动启动

### 生产环境

```bash
# 总是自动启动
docker update --restart=always claude-relay-redis
```

**优点**：
- ✅ 最高可用性
- ✅ 自动恢复
- ✅ 适合 7x24 运行

---

## 🚨 常见问题

### Q1: 如何确认 Redis 不会开机自启动？

```bash
# 查看重启策略
docker inspect claude-relay-redis --format '{{.HostConfig.RestartPolicy.Name}}'

# 输出 "no" 表示不会自动启动 ✅
```

### Q2: 修改重启策略后需要重启容器吗？

**不需要**。`docker update` 立即生效，下次重启系统时自动应用。

### Q3: 如何临时测试开机启动？

```bash
# 启用自动启动
docker update --restart=always claude-relay-redis

# 重启 Docker 服务（模拟重启）
sudo systemctl restart docker

# 检查容器是否自动启动
docker ps | grep redis
```

### Q4: 数据会丢失吗？

**不会**。重启策略只影响容器启动行为，不影响 Volume 数据。

---

## 📚 参考命令速查表

| 操作 | 命令 |
|------|------|
| 禁用自启动 | `docker update --restart=no claude-relay-redis` |
| 启用自启动（除非手动停止） | `docker update --restart=unless-stopped claude-relay-redis` |
| 启用自启动（总是） | `docker update --restart=always claude-relay-redis` |
| 查看重启策略 | `docker inspect claude-relay-redis --format '{{.HostConfig.RestartPolicy.Name}}'` |
| 启动容器 | `docker start claude-relay-redis` |
| 停止容器 | `docker stop claude-relay-redis` |
| 重启容器 | `docker restart claude-relay-redis` |
| 查看容器状态 | `docker ps -a \| grep redis` |
| 查看容器日志 | `docker logs -f claude-relay-redis` |

---

**最后更新**：2025-11-11
**当前配置**：restart=no（禁用自启动）✅
