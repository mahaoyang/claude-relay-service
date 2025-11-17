# 🎭 伪装功能快速开始

## 一分钟启用

```bash
# 1. 在 .env 中添加
echo "DISGUISE_ENABLED=true" >> .env

# 2. 测试伪装功能
npm run test:disguise

# 3. 重启服务
npm run service:restart
```

## 验证伪装

启动后查看日志，应该看到：

```
🎭 Request disguised - using sessionId: 50475d3e-7ba5-417d-a71d-bc3711f26693
```

## 当前配置

### 固定客户端ID (WSL)
```
1afa2e8165ce838aac57ba26c30a0b8468f0b287fcfce2d8b6e2f6169ebf76cf
```

### 3个会话ID池（每天自动轮换）
```
1. 9f10edbb-1407-47e1-9b85-fa634be33732
2. 50475d3e-7ba5-417d-a71d-bc3711f26693  ← 今日(2025-11-17)
3. 4fe5b286-192b-4929-a25e-8bc1789b5de4
```

## 工作原理

```
[下游用户A] ────┐
[下游用户B] ────┼──> [伪装层] ──> [固定身份] ──> [上游API]
[下游用户C] ────┘                 └─今日sessionId
```

**每个请求的转换:**
- `user_id`: 替换为伪装的固定格式
- `sentry-trace`: 每请求随机生成
- `baggage`: 更新匹配新的trace ID

**不会造成上下文污染:**
- ✅ 对话历史由客户端维护，不依赖sessionId
- ✅ 每个请求完全独立，包含完整上下文
- ✅ 多用户之间不会相互影响

## 关闭伪装

```bash
# 在 .env 中设置
DISGUISE_ENABLED=false

# 或者删除该配置行
```

## 详细文档

查看 `DISGUISE_GUIDE.md` 了解完整功能说明和技术细节。
