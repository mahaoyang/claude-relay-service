# 闲鱼自动发货 API 配置

## 环境变量配置

在使用自动发货功能前，需要在服务器上配置以下环境变量：

### 必需环境变量

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `AUTO_DELIVERY_ENABLED` | 启用自动发货功能 | `true` |
| `AUTO_DELIVERY_SECRET` | Bearer token 认证密钥 | `your-secure-secret-key-here` |

### 配置示例

**.env 文件**
```bash
# 启用自动发货功能
AUTO_DELIVERY_ENABLED=true

# 设置 Bearer token 密钥（强烈建议使用强密钥）
AUTO_DELIVERY_SECRET=sk-delivery-abc123defghijklmnop1234567890
```

### 安全建议

- ✅ 使用强随机密钥（建议32字符以上）
- ✅ 定期轮换 `AUTO_DELIVERY_SECRET` 值
- ✅ 不要将密钥提交到版本控制系统
- ✅ 生产环境建议通过密钥管理系统（如 HashiCorp Vault）管理
- ⚠️ 如未配置 `AUTO_DELIVERY_SECRET`，系统会发出警告日志

### 生成强密钥

```bash
# 使用 OpenSSL 生成随机密钥
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 默认配置说明

**不传参时的默认兜底**：30天 | 并发3 | 每日$2 | 总额$5 | 仅Claude | 禁Opus

## 方案1：基础套餐（30天 | 并发5 | 每日不限 | 总额$10 | 不限模型）

```json
{
  "url": "https://www.jojocode.org/auto-delivery/generate-api-key",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer your-auto-delivery-secret-here",
    "Content-Type": "application/json"
  },
  "params": {
    "orderNo": "{order_id}",
    "name": "基础套餐-{order_id}",
    "description": "买家:{buyer_id}|商品:{item_id}|规格:{spec_name}={spec_value}|账号:{cookie_id}",
    "expiresInDays": 30,
    "concurrencyLimit": 5,
    "dailyCostLimit": 0,
    "totalCostLimit": 10,
    "permissions": "all",
    "enableModelRestriction": false,
    "restrictedModels": []
  }
}
```

## 方案2：标准套餐（延长有效期）

```json
{
  "url": "http://your-relay-server:3000/auto-delivery/generate-api-key",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer your-auto-delivery-secret-here",
    "Content-Type": "application/json"
  },
  "params": {
    "orderNo": "{order_id}",
    "name": "标准套餐-{order_id}",
    "description": "买家:{buyer_id}|商品:{item_id}|规格:{spec_name}={spec_value}|账号:{cookie_id}",
    "expiresInDays": 90,
    "totalCostLimit": 10
  }
}
```

## 方案3：高级套餐（更高额度+不限模型）

```json
{
  "url": "http://your-relay-server:3000/auto-delivery/generate-api-key",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer your-auto-delivery-secret-here",
    "Content-Type": "application/json"
  },
  "params": {
    "orderNo": "{order_id}",
    "name": "高级套餐-{order_id}",
    "description": "买家:{buyer_id}|商品:{item_id}|规格:{spec_name}={spec_value}|账号:{cookie_id}",
    "expiresInDays": 365,
    "concurrencyLimit": 5,
    "dailyCostLimit": 5,
    "totalCostLimit": 30,
    "permissions": "all",
    "enableModelRestriction": false,
    "restrictedModels": []
  }
}
```

## 方案4：VIP套餐（账户绑定+高额度）

```json
{
  "url": "http://your-relay-server:3000/auto-delivery/generate-api-key",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer your-auto-delivery-secret-here",
    "Content-Type": "application/json"
  },
  "params": {
    "orderNo": "{order_id}",
    "name": "VIP套餐-{order_id}",
    "description": "买家:{buyer_id}|商品:{item_id}|规格:{spec_name}={spec_value}|账号:{cookie_id}",
    "expiresInDays": 365,
    "concurrencyLimit": 10,
    "dailyCostLimit": 10,
    "totalCostLimit": 100,
    "permissions": "all",
    "enableModelRestriction": false,
    "accountBindings": [
      {
        "platform": "claude",
        "mode": "group",
        "groupId": "your-group-uuid-here",
        "groupName": "VIP用户组"
      },
      {
        "platform": "gemini",
        "mode": "shared"
      }
    ]
  }
}
```

## 方案5：预售套餐（首次激活模式）

适合预售场景，Key 创建后不立即计时，首次使用时才开始计算有效期。

```json
{
  "url": "http://your-relay-server:3000/auto-delivery/generate-api-key",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer your-auto-delivery-secret-here",
    "Content-Type": "application/json"
  },
  "params": {
    "orderNo": "{order_id}",
    "name": "预售套餐-{order_id}",
    "description": "买家:{buyer_id}|商品:{item_id}|规格:{spec_name}={spec_value}|账号:{cookie_id}",
    "expiresInDays": 30,
    "expirationMode": "activation",
    "concurrencyLimit": 5,
    "dailyCostLimit": 0,
    "totalCostLimit": 10,
    "permissions": "all",
    "enableModelRestriction": false
  }
}
```

**说明**: `expirationMode` 可选值：
- `fixed`（默认）：立刻计时，创建后即开始计算有效期
- `activation`：首次激活，首次 API 调用时才开始计算有效期

## 账户绑定模式

- **shared**: 共享池 | **dedicated**: 专属账户(需`accountId`) | **group**: 分组账户(需`groupId`+`groupName`)

---

## Bearer Token 认证说明

### 请求头格式

所有自动发货接口都需要在请求头中包含 Bearer token：

```
Authorization: Bearer <AUTO_DELIVERY_SECRET的值>
```

### 验证流程

1. 服务器读取环境变量 `AUTO_DELIVERY_SECRET`
2. 从请求头 `Authorization` 中提取 token（去掉 "Bearer " 前缀）
3. 比对提取的 token 与 `AUTO_DELIVERY_SECRET` 是否相等
4. 验证成功才允许生成 API Key，失败返回 401 Unauthorized

### 错误示例

```bash
# ❌ 错误：缺少 Bearer 前缀
curl -H "Authorization: sk-delivery-xxxxx" \
  https://www.jojocode.org/auto-delivery/generate-api-key

# ❌ 错误：token 不匹配
curl -H "Authorization: Bearer wrong-token" \
  https://www.jojocode.org/auto-delivery/generate-api-key

# ✅ 正确
curl -H "Authorization: Bearer sk-delivery-xxxxx" \
  https://www.jojocode.org/auto-delivery/generate-api-key
```

### 健康检查接口

可使用健康检查接口验证 Bearer token 配置是否正确：

```bash
curl -X GET \
  -H "Authorization: Bearer <AUTO_DELIVERY_SECRET>" \
  https://www.jojocode.org/auto-delivery/health
```

响应示例（成功）：
```json
{
  "success": true,
  "message": "自动发货服务运行正常",
  "enabled": true,
  "timestamp": "2025-12-17T10:30:45.123Z"
}
```
