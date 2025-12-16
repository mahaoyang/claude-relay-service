#!/bin/bash

# 自动发货API测试脚本
# 用法: ./scripts/test-auto-delivery.sh

set -e

# 配置
BASE_URL="${BASE_URL:-http://localhost:3000}"
AUTO_DELIVERY_SECRET="${AUTO_DELIVERY_SECRET:-test-secret-123}"

echo "========================================"
echo "自动发货API测试"
echo "========================================"
echo "BASE_URL: $BASE_URL"
echo "========================================"
echo ""

# 测试1: 健康检查
echo "测试1: 健康检查"
echo "--------------------------------------"
curl -X GET "$BASE_URL/auto-delivery/health" \
  -H "Authorization: Bearer $AUTO_DELIVERY_SECRET" \
  -H "Content-Type: application/json" \
  -s | jq .
echo ""
echo ""

# 测试2: 生成API Key（默认配置）
echo "测试2: 生成API Key（默认配置）"
echo "--------------------------------------"
curl -X POST "$BASE_URL/auto-delivery/generate-api-key" \
  -H "Authorization: Bearer $AUTO_DELIVERY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "TEST001"
  }' \
  -s | jq .
echo ""
echo ""

# 测试3: 生成API Key（完整配置）
echo "测试3: 生成API Key（完整配置 - 包含模型限制）"
echo "--------------------------------------"
curl -X POST "$BASE_URL/auto-delivery/generate-api-key" \
  -H "Authorization: Bearer $AUTO_DELIVERY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "TEST002",
    "name": "测试订单002",
    "description": "闲鱼自动发货测试",
    "expiresInDays": 30,
    "concurrencyLimit": 5,
    "dailyCostLimit": 2,
    "totalCostLimit": 20,
    "permissions": "claude",
    "rateLimitRequests": 30,
    "rateLimitWindow": 60,
    "enableModelRestriction": true,
    "restrictedModels": ["claude-opus-4-5", "claude-opus-4"],
    "enableClientRestriction": false,
    "allowedClients": []
  }' \
  -s | jq .
echo ""
echo ""

# 测试4: 生成API Key（不限模型，仅限额度）
echo "测试4: 生成API Key（不限模型，仅限额度）"
echo "--------------------------------------"
curl -X POST "$BASE_URL/auto-delivery/generate-api-key" \
  -H "Authorization: Bearer $AUTO_DELIVERY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "TEST003",
    "name": "标准套餐",
    "expiresInDays": 365,
    "concurrencyLimit": 3,
    "dailyCostLimit": 1,
    "totalCostLimit": 10,
    "permissions": "all",
    "rateLimitRequests": 20,
    "rateLimitWindow": 60,
    "enableModelRestriction": false,
    "restrictedModels": []
  }' \
  -s | jq .
echo ""
echo ""

# 测试5: 无效认证
echo "测试5: 无效认证（应该失败）"
echo "--------------------------------------"
curl -X POST "$BASE_URL/auto-delivery/generate-api-key" \
  -H "Authorization: Bearer wrong-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "TEST004"
  }' \
  -s | jq .
echo ""
echo ""

echo "========================================"
echo "测试完成"
echo "========================================"
