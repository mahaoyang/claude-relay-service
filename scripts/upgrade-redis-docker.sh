#!/bin/bash
# Redis Docker 升级脚本 - 启用AOF持久化和端口暴露

echo "🔍 检查当前Redis容器..."
docker ps -a | grep claude-relay-redis

echo ""
echo "📦 当前Redis数据大小:"
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= DBSIZE 2>/dev/null || echo "无法连接到Redis"

echo ""
echo "💾 备份当前Redis数据..."
BACKUP_FILE="redis-backup-$(date +%Y%m%d-%H%M%S).rdb"
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= --rdb "$BACKUP_FILE" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ 备份成功: $BACKUP_FILE"
else
    echo "⚠️  备份失败，但继续..."
fi

echo ""
echo "🛑 停止并删除旧的Redis容器（保留数据卷）..."
docker stop claude-relay-redis
docker rm claude-relay-redis

echo ""
echo "🚀 使用新配置启动Redis容器..."
# 使用与旧容器相同的配置，但添加AOF和端口映射
docker run -d \
  --name claude-relay-redis \
  --restart unless-stopped \
  -p 127.0.0.1:6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server \
  --requirepass y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= \
  --save 60 1 \
  --save 300 10 \
  --save 900 1 \
  --appendonly yes \
  --appendfsync everysec \
  --dir /data

echo ""
echo "⏳ 等待Redis启动..."
sleep 3

echo ""
echo "🔍 检查Redis状态..."
docker ps | grep claude-relay-redis

echo ""
echo "📊 验证数据完整性..."
DBSIZE=$(docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= DBSIZE 2>/dev/null | grep -o '[0-9]*')
echo "✅ Redis数据库大小: $DBSIZE keys"

echo ""
echo "🔍 检查持久化配置..."
docker exec claude-relay-redis redis-cli -a y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y= CONFIG GET appendonly 2>/dev/null

echo ""
echo "✅ 升级完成！"
echo ""
echo "📝 接下来的步骤："
echo "1. 停止你的应用（如果正在运行）"
echo "2. 停止本地系统的Redis服务：sudo systemctl stop redis-server"
echo "3. 重启你的应用"
echo ""
echo "💡 提示："
echo "- Docker Redis已暴露在 127.0.0.1:6379"
echo "- AOF持久化已启用（appendonly.aof）"
echo "- RDB快照策略：60秒1变化、300秒10变化、900秒1变化"
