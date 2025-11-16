#!/bin/bash

# Claude Relay Service 启动脚本
# 使用方法: ./start.sh [dev|prod|daemon|docker]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查 Redis 是否运行
check_redis() {
    print_info "检查 Redis 连接..."

    if command_exists redis-cli; then
        REDIS_HOST=${REDIS_HOST:-localhost}
        REDIS_PORT=${REDIS_PORT:-6379}

        if [ -n "$REDIS_PASSWORD" ]; then
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping >/dev/null 2>&1
        else
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1
        fi

        if [ $? -eq 0 ]; then
            print_success "Redis 连接正常"
            return 0
        else
            print_warning "Redis 连接失败，请确保 Redis 服务正在运行"
            return 1
        fi
    else
        print_warning "未安装 redis-cli，跳过 Redis 检查"
        return 0
    fi
}

# 检查配置文件
check_config() {
    print_info "检查配置文件..."

    if [ ! -f ".env" ]; then
        print_warning ".env 文件不存在"
        if [ -f ".env.example" ]; then
            print_info "从 .env.example 复制..."
            cp .env.example .env
            print_warning "请编辑 .env 文件配置必要的环境变量"
        fi
    fi

    if [ ! -f "config/config.js" ]; then
        print_warning "config/config.js 文件不存在"
        if [ -f "config/config.example.js" ]; then
            print_info "从 config.example.js 复制..."
            cp config/config.example.js config/config.js
        fi
    fi

    if [ ! -f "data/init.json" ]; then
        print_warning "data/init.json 不存在，需要运行初始化"
        print_info "运行: npm run setup"
        read -p "是否现在运行初始化？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm run setup
        fi
    fi
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."

    if [ ! -d "node_modules" ]; then
        print_warning "node_modules 不存在，正在安装依赖..."
        npm install
    fi
}

# 开发模式启动
start_dev() {
    print_info "启动开发模式（热重载）..."
    npm run dev
}

# 生产模式启动
start_prod() {
    print_info "启动生产模式..."
    npm start
}

# 后台守护进程启动
start_daemon() {
    print_info "启动后台守护进程..."
    npm run service:start:daemon

    sleep 2
    print_info "检查服务状态..."
    npm run service:status
}

# Docker 启动
start_docker() {
    print_info "使用 Docker Compose 启动..."

    if ! command_exists docker-compose && ! command_exists docker; then
        print_error "未找到 docker-compose 或 docker 命令"
        exit 1
    fi

    read -p "是否包含监控服务？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose --profile monitoring up -d
    else
        docker-compose up -d
    fi

    print_success "Docker 容器已启动"
    print_info "查看日志: docker-compose logs -f"
}

# 显示使用说明
show_usage() {
    echo "使用方法: ./start.sh [模式]"
    echo ""
    echo "可用模式:"
    echo "  dev      - 开发模式（热重载，推荐开发使用）"
    echo "  prod     - 生产模式（直接运行）"
    echo "  daemon   - 后台守护进程（推荐生产环境）"
    echo "  docker   - Docker Compose 启动（推荐部署）"
    echo ""
    echo "如果不指定模式，将进入交互式选择"
}

# 交互式选择启动模式
interactive_mode() {
    echo ""
    echo "请选择启动模式:"
    echo "1) 开发模式 (dev) - 热重载，适合开发"
    echo "2) 生产模式 (prod) - 直接运行"
    echo "3) 后台守护进程 (daemon) - 推荐生产环境"
    echo "4) Docker Compose - 推荐部署"
    echo "5) 退出"
    echo ""
    read -p "请输入选项 [1-5]: " choice

    case $choice in
        1) MODE="dev" ;;
        2) MODE="prod" ;;
        3) MODE="daemon" ;;
        4) MODE="docker" ;;
        5) exit 0 ;;
        *)
            print_error "无效选项"
            exit 1
            ;;
    esac
}

# 主函数
main() {
    echo "========================================"
    echo "  Claude Relay Service 启动脚本"
    echo "========================================"
    echo ""

    # 获取启动模式
    MODE=${1:-""}

    if [ "$MODE" = "-h" ] || [ "$MODE" = "--help" ]; then
        show_usage
        exit 0
    fi

    # 如果没有指定模式，进入交互式选择
    if [ -z "$MODE" ]; then
        interactive_mode
    fi

    # Docker 模式不需要检查本地依赖
    if [ "$MODE" != "docker" ]; then
        # 检查 Node.js
        if ! command_exists node; then
            print_error "未找到 Node.js，请先安装 Node.js"
            exit 1
        fi

        # 检查 npm
        if ! command_exists npm; then
            print_error "未找到 npm，请先安装 npm"
            exit 1
        fi

        print_info "Node.js 版本: $(node --version)"
        print_info "npm 版本: $(npm --version)"
        echo ""

        # 执行检查
        check_config
        check_dependencies
        check_redis || print_warning "Redis 检查失败，服务可能无法正常启动"
        echo ""
    fi

    # 根据模式启动
    case $MODE in
        dev)
            start_dev
            ;;
        prod)
            start_prod
            ;;
        daemon)
            start_daemon
            ;;
        docker)
            start_docker
            ;;
        *)
            print_error "未知模式: $MODE"
            show_usage
            exit 1
            ;;
    esac
}

# 加载 .env 文件
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | sed 's/#.*$//' | sed 's/[[:space:]]*$//' | xargs)
fi

# 运行主函数
main "$@"
