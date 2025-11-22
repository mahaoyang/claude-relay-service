#!/bin/bash

# 开发模式启动脚本 - 后台启动 Vite，前台启动后端

# 颜色定义
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# PID 变量
FRONTEND_PID=""

# 清理函数
cleanup() {
    if [ ! -z "$FRONTEND_PID" ]; then
        kill -TERM $FRONTEND_PID 2>/dev/null || true
    fi
    pkill -P $$ 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

clear

echo -e "${GREEN}=========================================="
echo -e "  Claude Relay Service 开发环境"
echo -e "==========================================${NC}"
echo ""

# 后台启动前端 Vite
echo -e "${CYAN}[后台]${NC} 启动前端开发服务器..."
cd /home/ha/workspace/claude-relay-service/web/admin-spa
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

# 等待 Vite 启动
sleep 3

# 前台启动后端
echo -e "${GREEN}[前台]${NC} 启动后端服务..."
echo ""
echo -e "${GREEN}管理界面访问: ${CYAN}http://localhost:3010/admin-next/${NC}"
echo -e "${GREEN}API 访问: ${CYAN}http://localhost:3010${NC}"
echo ""
echo -e "前端修改会自动生效，无需刷新"
echo ""
echo "=========================================="
echo ""

cd /home/ha/workspace/claude-relay-service
exec npm run dev
