#!/bin/bash

# 开发模式启动脚本 - 后台启动 Vite，前台启动后端
# 使用 Ctrl+C 可以优雅地停止所有服务

# 颜色定义
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID 变量
FRONTEND_PID=""
BACKEND_PID=""

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止服务...${NC}"

    # 停止后端（如果有）
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${CYAN}   停止后端服务...${NC}"
        kill -TERM $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null
    fi

    # 停止前端
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${CYAN}   停止前端服务...${NC}"
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null
    fi

    # 清理可能残留的进程
    pkill -P $$ 2>/dev/null || true
    pkill -f "vite.*admin-spa" 2>/dev/null || true

    echo -e "${GREEN}✅ 服务已停止${NC}"
    exit 0
}

# 捕获 Ctrl+C (SIGINT) 和其他终止信号
trap cleanup SIGINT SIGTERM

clear

echo -e "${GREEN}=========================================="
echo -e "  Claude Relay Service 开发环境"
echo -e "==========================================${NC}"
echo ""

# 清理旧进程
echo -e "${YELLOW}🧹 清理旧进程...${NC}"
pkill -f "node src/app.js" 2>/dev/null || true
pkill -f "vite.*admin-spa" 2>/dev/null || true
sleep 1

# 后台启动前端 Vite
echo -e "${CYAN}[后台]${NC} 启动前端开发服务器 (端口 3001)..."
cd "$SCRIPT_DIR/web/admin-spa"
npm run dev > "$SCRIPT_DIR/logs/frontend-dev.log" 2>&1 &
FRONTEND_PID=$!

# 等待 Vite 启动
echo -e "${YELLOW}   等待前端启动...${NC}"
for i in {1..10}; do
    if lsof -i :3001 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ 前端启动成功${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 10 ]; then
        echo -e "${RED}   ❌ 前端启动失败，请查看 logs/frontend-dev.log${NC}"
        cleanup
    fi
done

# 前台启动后端
echo -e "${GREEN}[前台]${NC} 启动后端服务 (端口 3010)..."
echo ""
echo -e "${GREEN}📊 访问地址:${NC}"
echo -e "   前端管理界面: ${CYAN}http://localhost:3001${NC}"
echo -e "   后端管理界面: ${CYAN}http://localhost:3010/admin-next/${NC}"
echo -e "   后端API: ${CYAN}http://localhost:3010${NC}"
echo ""
echo -e "${GREEN}👤 管理员账户:${NC}"
echo -e "   用户名: ${CYAN}admin8281Ahdsu${NC}"
echo -e "   密码: ${CYAN}HJagdgvdi.128egdbuebwe.Hbwqdb12${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   • 前端修改会自动热重载"
echo -e "   • 后端修改会自动重启（nodemon）"
echo -e "   • 按 ${RED}Ctrl+C${NC} 停止所有服务"
echo -e "   • 前端日志: logs/frontend-dev.log"
echo ""
echo "=========================================="
echo ""

cd "$SCRIPT_DIR"
npm run dev &
BACKEND_PID=$!

# 等待后端进程结束
wait $BACKEND_PID

# 后端退出后清理
cleanup
