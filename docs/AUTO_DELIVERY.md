# 自动发货集成指南

## 概述

自动发货功能提供了一个REST API接口，用于自动生成和分配Claude Relay Service的API Keys。这个功能特别适合与电商平台（如闲鱼）的自动发货系统集成。

## 特性

- ✅ **低入侵设计**: 独立的路由模块，不影响现有功能
- ✅ **可选启用**: 通过环境变量控制，默认关闭
- ✅ **安全认证**: Bearer Token认证机制
- ✅ **灵活配置**: 支持自定义API Key的各项参数
- ✅ **自动化**: 适合集成到自动发货系统

## 配置

### 1. 启用自动发货功能

在 `.env` 文件中添加或修改以下配置：

```bash
# 启用自动发货功能
AUTO_DELIVERY_ENABLED=true

# 设置安全密钥（建议使用64位随机字符串）
AUTO_DELIVERY_SECRET=your-super-secret-key-here
```

### 2. 生成安全密钥

推荐使用以下命令生成随机密钥：

```bash
# Linux/Mac
openssl rand -hex 32

# 或者使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 重启服务

```bash
npm restart
```

## API 接口

### 基础信息

- **Base URL**: `http://your-server:3000/auto-delivery`
- **认证方式**: Bearer Token
- **Content-Type**: `application/json`

### 1. 健康检查

**请求**:
```bash
GET /auto-delivery/health
Authorization: Bearer your-auto-delivery-secret
```

**响应**:
```json
{
  "success": true,
  "message": "自动发货服务运行正常",
  "enabled": true,
  "timestamp": "2025-12-16T12:00:00.000Z"
}
```

### 2. 生成API Key

**请求**:
```bash
POST /auto-delivery/generate-api-key
Authorization: Bearer your-auto-delivery-secret
Content-Type: application/json

{
  "orderNo": "XY20251216001",           // 订单号（可选）
  "name": "客户001",                     // API Key名称（可选）
  "description": "闲鱼订单发货",         // 描述（可选）
  "expiresInDays": 365,                 // 有效期天数（可选，默认365）
  "concurrencyLimit": 3,                // 并发限制（可选，默认3）
  "dailyCostLimit": 1,                  // 每日费用限制美元（可选，默认1）
  "totalCostLimit": 10,                 // 总费用限制美元（可选，默认10）
  "permissions": "all",                 // 权限（all/claude/gemini/openai，默认all）
  "rateLimitRequests": 20,              // 速率限制请求数（可选，默认20）
  "rateLimitWindow": 60                 // 速率限制窗口秒数（可选，默认60）
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "apiKey": "cr_1234567890abcdef...",  // API Key（仅显示一次！）
    "keyId": "uuid-here",
    "name": "客户001",
    "expiresAt": "2026-12-16T00:00:00.000Z",
    "concurrencyLimit": 3,
    "dailyCostLimit": 1,
    "totalCostLimit": 10,
    "permissions": "all"
  },
  "orderNo": "XY20251216001"
}
```

**错误响应**:
```json
{
  "error": "Unauthorized",
  "message": "认证失败"
}
```

## 集成示例

### Python (闲鱼自动回复系统)

```python
import requests
import json

# 配置
AUTO_DELIVERY_URL = "http://your-server:3000/auto-delivery/generate-api-key"
AUTO_DELIVERY_SECRET = "your-auto-delivery-secret"

def generate_api_key_for_order(order_no, buyer_name):
    """为订单生成API Key"""
    headers = {
        "Authorization": f"Bearer {AUTO_DELIVERY_SECRET}",
        "Content-Type": "application/json"
    }

    payload = {
        "orderNo": order_no,
        "name": f"买家-{buyer_name}",
        "description": f"闲鱼订单: {order_no}",
        "expiresInDays": 365,
        "concurrencyLimit": 3,
        "dailyCostLimit": 1,
        "totalCostLimit": 10,
        "permissions": "all"
    }

    try:
        response = requests.post(
            AUTO_DELIVERY_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        response.raise_for_status()

        result = response.json()
        if result.get("success"):
            api_key = result["data"]["apiKey"]
            expires_at = result["data"]["expiresAt"]

            # 这里可以将API Key发送给买家
            print(f"生成成功！API Key: {api_key}")
            print(f"有效期至: {expires_at}")

            return api_key
        else:
            print(f"生成失败: {result.get('error')}")
            return None

    except Exception as e:
        print(f"请求失败: {str(e)}")
        return None

# 使用示例
if __name__ == "__main__":
    api_key = generate_api_key_for_order("XY20251216001", "张三")
```

### cURL 示例

```bash
#!/bin/bash

# 生成API Key
curl -X POST http://your-server:3000/auto-delivery/generate-api-key \
  -H "Authorization: Bearer your-auto-delivery-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "XY20251216001",
    "name": "买家张三",
    "expiresInDays": 365,
    "concurrencyLimit": 3,
    "dailyCostLimit": 1,
    "totalCostLimit": 10
  }'
```

### JavaScript/Node.js 示例

```javascript
const axios = require('axios');

const AUTO_DELIVERY_URL = 'http://your-server:3000/auto-delivery/generate-api-key';
const AUTO_DELIVERY_SECRET = 'your-auto-delivery-secret';

async function generateApiKeyForOrder(orderNo, buyerName) {
  try {
    const response = await axios.post(
      AUTO_DELIVERY_URL,
      {
        orderNo,
        name: `买家-${buyerName}`,
        description: `闲鱼订单: ${orderNo}`,
        expiresInDays: 365,
        concurrencyLimit: 3,
        dailyCostLimit: 1,
        totalCostLimit: 10,
        permissions: 'all'
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTO_DELIVERY_SECRET}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data.success) {
      const { apiKey, expiresAt } = response.data.data;
      console.log(`生成成功！API Key: ${apiKey}`);
      console.log(`有效期至: ${expiresAt}`);
      return apiKey;
    } else {
      console.error(`生成失败: ${response.data.error}`);
      return null;
    }
  } catch (error) {
    console.error(`请求失败: ${error.message}`);
    return null;
  }
}

// 使用示例
generateApiKeyForOrder('XY20251216001', '张三');
```

## 测试

项目提供了测试脚本，可以快速验证功能是否正常：

```bash
# 设置环境变量
export BASE_URL="http://localhost:3000"
export AUTO_DELIVERY_SECRET="your-secret"

# 运行测试
./scripts/test-auto-delivery.sh
```

## 安全建议

1. **使用强密钥**: 生成至少64位的随机字符串作为 `AUTO_DELIVERY_SECRET`
2. **HTTPS传输**: 生产环境必须使用HTTPS，避免API Key在传输中泄露
3. **IP白名单**: 建议在Nginx等反向代理层面限制访问IP
4. **日志监控**: 定期检查日志，监控异常请求
5. **密钥轮换**: 定期更换 `AUTO_DELIVERY_SECRET`

## 故障排查

### 1. 接口返回 404

检查是否启用了自动发货功能：
```bash
grep AUTO_DELIVERY_ENABLED .env
```

确保设置为 `true`。

### 2. 认证失败

检查密钥是否正确：
```bash
# 查看服务端配置的密钥
grep AUTO_DELIVERY_SECRET .env

# 确保请求头中的密钥一致
Authorization: Bearer your-auto-delivery-secret
```

### 3. 查看日志

```bash
# 查看服务日志
tail -f logs/claude-relay-*.log | grep "自动发货"
```

## 与闲鱼自动回复系统集成

在 `~/workspace/xianyu-auto-reply` 项目中集成：

1. 在订单处理逻辑中调用自动发货API
2. 将生成的API Key通过闲鱼消息发送给买家
3. 可选：将API Key保存到数据库供后续查询

示例集成点：
- 文件: `order_status_handler.py`
- 时机: 订单支付完成后
- 操作: 调用生成API Key接口，发送给买家

## 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| orderNo | string | 否 | - | 订单号，用于日志记录 |
| name | string | 否 | `自动发货-YYYY-MM-DD` | API Key名称 |
| description | string | 否 | `订单号: xxx` | API Key描述 |
| expiresInDays | number | 否 | 365 | 有效期（天） |
| concurrencyLimit | number | 否 | 3 | 并发请求限制 |
| dailyCostLimit | number | 否 | 1 | 每日费用限制（美元） |
| totalCostLimit | number | 否 | 10 | 总费用限制（美元） |
| permissions | string | 否 | all | 权限（all/claude/gemini/openai） |
| rateLimitRequests | number | 否 | 20 | 速率限制请求数 |
| rateLimitWindow | number | 否 | 60 | 速率限制窗口（秒） |

## 维护说明

这是一个**低入侵扩展模块**，便于将来合并上游更新：

- **路由文件**: `src/routes/autoDelivery.js`（独立模块）
- **路由加载**: `src/app.js` 第30行和285行（仅2处修改）
- **配置示例**: `.env.example` 末尾（独立配置段）

如需禁用此功能：
1. 设置 `AUTO_DELIVERY_ENABLED=false`
2. 或注释掉 `src/app.js` 中的路由加载行

## License

遵循主项目的开源协议。
