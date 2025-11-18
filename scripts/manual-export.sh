#!/bin/bash
# 手动导出所有数据到JSON

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
EXPORT_DIR="./data-exports"

mkdir -p "$EXPORT_DIR"

echo "📤 导出Redis数据到JSON..."

# 使用项目自带的数据导出工具
if [ -f "./scripts/data-transfer-enhanced.js" ]; then
    node ./scripts/data-transfer-enhanced.js export "$EXPORT_DIR/data-$TIMESTAMP.json"
    echo "✅ 导出完成: $EXPORT_DIR/data-$TIMESTAMP.json"
    
    # 显示文件大小
    ls -lh "$EXPORT_DIR/data-$TIMESTAMP.json"
else
    echo "❌ 数据导出工具不存在"
fi

# 可选：压缩旧备份
find "$EXPORT_DIR" -name "data-*.json" -mtime +30 -exec gzip {} \;

echo ""
echo "📊 当前导出文件："
ls -lh "$EXPORT_DIR" | grep data-
