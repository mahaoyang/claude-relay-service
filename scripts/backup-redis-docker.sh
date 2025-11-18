#!/bin/bash
# Docker Redis 自动备份脚本
# 用法：./backup-redis-docker.sh [备份目录]

# 配置
REDIS_CONTAINER="claude-relay-redis"
REDIS_PASSWORD="y8cQENYsMQjWpUC4aW+WbMvaDvSwg2yLSwwBrO1mC6Y="
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
MAX_BACKUPS=7  # 保留最近7个备份

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "🔍 开始备份Docker Redis数据..."

# 检查容器是否运行
if ! docker ps | grep -q "$REDIS_CONTAINER"; then
    echo "❌ Redis容器未运行！"
    exit 1
fi

# 获取数据库大小
DBSIZE=$(docker exec $REDIS_CONTAINER redis-cli -a "$REDIS_PASSWORD" DBSIZE 2>/dev/null | grep -o '[0-9]*')
echo "📊 当前数据库大小: $DBSIZE keys"

# 方法1：使用 BGSAVE 触发后台保存
echo "💾 触发Redis后台保存..."
docker exec $REDIS_CONTAINER redis-cli -a "$REDIS_PASSWORD" BGSAVE 2>/dev/null

# 等待保存完成
echo "⏳ 等待保存完成..."
sleep 2

while docker exec $REDIS_CONTAINER redis-cli -a "$REDIS_PASSWORD" LASTSAVE 2>/dev/null | grep -q "$(date +%s)"; do
    sleep 1
done

# 复制RDB文件
echo "📦 复制RDB文件..."
docker cp $REDIS_CONTAINER:/data/dump.rdb "$BACKUP_DIR/dump-$TIMESTAMP.rdb"

# 如果启用了AOF，也备份AOF文件
if docker exec $REDIS_CONTAINER test -f /data/appendonly.aof 2>/dev/null; then
    echo "📦 复制AOF文件..."
    docker cp $REDIS_CONTAINER:/data/appendonly.aof "$BACKUP_DIR/appendonly-$TIMESTAMP.aof"
fi

# 方法2：使用JSON导出（项目自带工具）
if [ -f "./scripts/data-transfer-enhanced.js" ]; then
    echo "📤 使用项目工具导出JSON数据..."
    node ./scripts/data-transfer-enhanced.js export "$BACKUP_DIR/data-$TIMESTAMP.json" 2>/dev/null || true
fi

# 清理旧备份
echo "🧹 清理旧备份（保留最近${MAX_BACKUPS}个）..."
cd "$BACKUP_DIR"
ls -t dump-*.rdb 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
ls -t appendonly-*.aof 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
ls -t data-*.json 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
cd - > /dev/null

# 显示备份结果
echo ""
echo "✅ 备份完成！"
echo "📂 备份位置: $BACKUP_DIR"
echo "📝 备份文件:"
ls -lh "$BACKUP_DIR"/*-$TIMESTAMP.* 2>/dev/null || echo "  - dump-$TIMESTAMP.rdb"
echo ""
echo "📊 当前备份数量:"
echo "  - RDB备份: $(ls -1 $BACKUP_DIR/dump-*.rdb 2>/dev/null | wc -l)"
echo "  - AOF备份: $(ls -1 $BACKUP_DIR/appendonly-*.aof 2>/dev/null | wc -l)"
echo "  - JSON备份: $(ls -1 $BACKUP_DIR/data-*.json 2>/dev/null | wc -l)"
