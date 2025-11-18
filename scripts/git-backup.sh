#!/bin/bash
# 使用Git版本控制数据备份

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
EXPORT_DIR="./data-exports"
GIT_REPO="./data-git-backup"

mkdir -p "$EXPORT_DIR"

# 导出数据
echo "📤 导出数据..."
node ./scripts/data-transfer-enhanced.js export "$EXPORT_DIR/latest-backup.json" 2>/dev/null || {
    echo "❌ 导出失败，请检查data-transfer-enhanced.js"
    exit 1
}

# 初始化Git仓库（如果不存在）
if [ ! -d "$GIT_REPO" ]; then
    echo "🔧 初始化Git仓库..."
    mkdir -p "$GIT_REPO"
    cd "$GIT_REPO"
    git init
    cd ..
fi

# 复制数据到Git仓库
cp "$EXPORT_DIR/latest-backup.json" "$GIT_REPO/backup-$TIMESTAMP.json"

# 提交到Git
cd "$GIT_REPO"
git add .
git commit -m "Backup on $TIMESTAMP" 2>/dev/null

echo ""
echo "✅ 备份已提交到Git"
echo "📊 备份历史："
git log --oneline --graph --all | head -10
echo ""
echo "💡 恢复到指定版本："
echo "   git checkout <commit-hash> -- backup-YYYYMMDD-HHMMSS.json"

cd ..
