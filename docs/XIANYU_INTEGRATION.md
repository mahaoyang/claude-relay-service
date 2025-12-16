# 闲鱼自动发货 API 配置

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

## 账户绑定模式

- **shared**: 共享池 | **dedicated**: 专属账户(需`accountId`) | **group**: 分组账户(需`groupId`+`groupName`)
