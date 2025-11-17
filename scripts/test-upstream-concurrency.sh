#!/bin/bash

# 测试上游 API 的并发限制
# 使用方法: ./test-upstream-concurrency.sh

set -e

# ==================== 配置区域 ====================
# 上游服务地址
UPSTREAM_URL="https://your-upstream-url.com"

# API Keys（替换为你的实际 Key）
API_KEY_1="cr_xxxxxxxxxxxxxx"
API_KEY_2="cr_yyyyyyyyyyyyyy"
API_KEY_3="cr_zzzzzzzzzzzzzz"

# 测试配置
MAX_CONCURRENT=10  # 最大并发测试数
TEST_DELAY=2       # 每次测试间隔（秒）
REQUEST_TIMEOUT=30 # 请求超时时间（秒）

# 测试请求体（简单的测试消息）
REQUEST_BODY='{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 100,
  "messages": [
    {
      "role": "user",
      "content": "Say hello in 5 words"
    }
  ]
}'

# ==================== 辅助函数 ====================

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 发送单个请求
send_request() {
    local api_key=$1
    local request_id=$2
    local output_file="/tmp/upstream_test_${request_id}.json"
    local start_time=$(date +%s%N)

    http_code=$(curl -s -w "%{http_code}" -o "$output_file" \
        -X POST "${UPSTREAM_URL}/v1/messages" \
        -H "x-api-key: ${api_key}" \
        -H "Content-Type: application/json" \
        -H "anthropic-version: 2023-06-01" \
        --max-time "$REQUEST_TIMEOUT" \
        -d "$REQUEST_BODY" 2>/dev/null || echo "000")

    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # 转换为毫秒

    echo "${http_code}|${duration}|${output_file}"
}

# ==================== 测试函数 ====================

# 测试1: 单个 Key 的并发限制
test_single_key_concurrency() {
    log_info "=========================================="
    log_info "测试1: 单个 API Key 的并发限制"
    log_info "=========================================="
    log_info "使用 API Key: ${API_KEY_1:0:10}..."
    log_info "逐步增加并发数，找出限制点"
    echo ""

    for concurrent in $(seq 1 $MAX_CONCURRENT); do
        log_info "测试并发数: $concurrent"

        # 启动并发请求
        pids=()
        for i in $(seq 1 $concurrent); do
            send_request "$API_KEY_1" "test1_${concurrent}_${i}" &
            pids+=($!)
        done

        # 等待所有请求完成
        success=0
        failed=0
        rate_limited=0

        for pid in "${pids[@]}"; do
            wait $pid
        done

        # 分析结果
        for i in $(seq 1 $concurrent); do
            result=$(send_request "$API_KEY_1" "test1_${concurrent}_${i}")
            http_code=$(echo "$result" | cut -d'|' -f1)
            duration=$(echo "$result" | cut -d'|' -f2)
            output_file=$(echo "$result" | cut -d'|' -f3)

            if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
                ((success++))
                log_success "  请求 #$i: 成功 (${duration}ms)"
            elif [ "$http_code" == "429" ]; then
                ((rate_limited++))
                error_msg=$(jq -r '.message // .error' "$output_file" 2>/dev/null || echo "N/A")
                concurrency_limit=$(jq -r '.concurrencyLimit // "N/A"' "$output_file" 2>/dev/null)
                log_error "  请求 #$i: 并发限流 (429) - Limit: $concurrency_limit"
                log_error "    错误信息: $error_msg"
            else
                ((failed++))
                log_warning "  请求 #$i: 失败 (HTTP $http_code)"
            fi

            rm -f "$output_file" 2>/dev/null
        done

        echo ""
        log_info "结果: 成功=$success, 限流=$rate_limited, 失败=$failed"

        if [ $rate_limited -gt 0 ]; then
            log_warning "检测到并发限制！限制值可能是 $((concurrent - 1)) 或 $concurrent"
            break
        fi

        echo ""
        sleep $TEST_DELAY
    done
}

# 测试2: 多个 Key 是否独立限制
test_multi_key_independence() {
    log_info "=========================================="
    log_info "测试2: 多个 API Key 的独立性"
    log_info "=========================================="
    log_info "测试策略: 用 Key1 占满并发，然后测试 Key2 是否仍可用"
    echo ""

    # 先用 Key1 发送3个长时间运行的请求（占住并发槽）
    log_info "步骤1: 使用 Key1 发送3个并发请求..."

    # 修改请求体，让请求运行更长时间
    LONG_REQUEST_BODY='{
      "model": "claude-sonnet-4-20250514",
      "max_tokens": 1000,
      "messages": [
        {
          "role": "user",
          "content": "Please write a detailed explanation of quantum computing in 500 words."
        }
      ]
    }'

    pids_key1=()
    for i in {1..3}; do
        (
            curl -s -X POST "${UPSTREAM_URL}/v1/messages" \
                -H "x-api-key: ${API_KEY_1}" \
                -H "Content-Type: application/json" \
                -H "anthropic-version: 2023-06-01" \
                --max-time 60 \
                -d "$LONG_REQUEST_BODY" \
                > "/tmp/key1_${i}.json" 2>&1
        ) &
        pids_key1+=($!)
    done

    # 等待1秒确保请求已发送
    sleep 1

    # 用 Key1 再发一个请求，应该被限流
    log_info "步骤2: 用 Key1 发送第4个请求（预期被限流）..."
    result_key1=$(send_request "$API_KEY_1" "test2_key1_4")
    http_code_key1=$(echo "$result_key1" | cut -d'|' -f1)
    output_file_key1=$(echo "$result_key1" | cut -d'|' -f3)

    if [ "$http_code_key1" == "429" ]; then
        log_success "Key1 第4个请求被限流 (符合预期)"
    else
        log_warning "Key1 第4个请求未被限流 (HTTP $http_code_key1)"
    fi
    rm -f "$output_file_key1" 2>/dev/null

    # 用 Key2 发送请求，测试是否独立
    log_info "步骤3: 用 Key2 发送请求（测试独立性）..."
    result_key2=$(send_request "$API_KEY_2" "test2_key2_1")
    http_code_key2=$(echo "$result_key2" | cut -d'|' -f1)
    output_file_key2=$(echo "$result_key2" | cut -d'|' -f3)

    echo ""
    if [ "$http_code_key2" == "200" ] || [ "$http_code_key2" == "201" ]; then
        log_success "✅ Key2 请求成功！多个 Key 是独立限制的"
        log_success "   → 可以使用多 Key 方案扩展并发数"
    elif [ "$http_code_key2" == "429" ]; then
        log_error "❌ Key2 也被限流！可能存在用户级总限制"
        log_error "   → 需要请求管理员提供多个用户账户"
    else
        log_warning "Key2 请求失败 (HTTP $http_code_key2)"
    fi
    rm -f "$output_file_key2" 2>/dev/null

    # 清理 Key1 的后台请求
    for pid in "${pids_key1[@]}"; do
        kill $pid 2>/dev/null || true
    done

    rm -f /tmp/key1_*.json 2>/dev/null
    echo ""
}

# 测试3: 速率限制测试
test_rate_limit() {
    log_info "=========================================="
    log_info "测试3: 速率限制（1分钟内最大请求数）"
    log_info "=========================================="
    log_info "在1分钟内快速发送请求，测试速率限制"
    echo ""

    local max_requests=100
    local success=0
    local rate_limited=0
    local start_time=$(date +%s)

    for i in $(seq 1 $max_requests); do
        result=$(send_request "$API_KEY_1" "test3_${i}")
        http_code=$(echo "$result" | cut -d'|' -f1)
        output_file=$(echo "$result" | cut -d'|' -f3)

        if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
            ((success++))
            echo -n "."
        elif [ "$http_code" == "429" ]; then
            ((rate_limited++))
            error_msg=$(jq -r '.message // .error' "$output_file" 2>/dev/null || echo "N/A")
            echo ""
            log_error "第 $i 个请求被限流: $error_msg"
            break
        fi

        rm -f "$output_file" 2>/dev/null

        # 检查是否超过1分钟
        current_time=$(date +%s)
        if [ $((current_time - start_time)) -ge 60 ]; then
            break
        fi
    done

    echo ""
    log_info "结果: 成功=$success, 限流=$rate_limited"

    if [ $rate_limited -gt 0 ]; then
        log_warning "检测到速率限制！约为 $success 请求/分钟"
    else
        log_success "未检测到速率限制（在 $success 个请求内）"
    fi
    echo ""
}

# ==================== 主程序 ====================

main() {
    log_info "上游并发限制测试工具"
    log_info "目标: $UPSTREAM_URL"
    echo ""

    # 检查依赖
    if ! command -v curl &> /dev/null; then
        log_error "需要安装 curl"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_warning "未安装 jq，部分功能可能受限"
    fi

    # 验证配置
    if [ "$UPSTREAM_URL" == "https://your-upstream-url.com" ]; then
        log_error "请先配置 UPSTREAM_URL"
        exit 1
    fi

    if [ "$API_KEY_1" == "cr_xxxxxxxxxxxxxx" ]; then
        log_error "请先配置 API_KEY_1"
        exit 1
    fi

    # 运行测试
    test_single_key_concurrency
    sleep 3

    if [ "$API_KEY_2" != "cr_yyyyyyyyyyyyyy" ]; then
        test_multi_key_independence
        sleep 3
    else
        log_warning "跳过测试2: 未配置 API_KEY_2"
    fi

    # test_rate_limit  # 可选：取消注释以测试速率限制

    log_success "=========================================="
    log_success "所有测试完成！"
    log_success "=========================================="
}

# 运行主程序
main
