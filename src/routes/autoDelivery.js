/**
 * 自动发货路由 - 低入侵扩展模块
 * 用于集成自动发货系统，自动生成和分配API Keys
 *
 * 启用方式：设置环境变量 AUTO_DELIVERY_ENABLED=true
 * 安全性：需要配置 AUTO_DELIVERY_SECRET 进行接口验证
 */

const express = require('express')
const router = express.Router()
const logger = require('../utils/logger')
const apiKeyService = require('../services/apiKeyService')

// 从环境变量读取配置
const AUTO_DELIVERY_ENABLED = process.env.AUTO_DELIVERY_ENABLED === 'true'
const AUTO_DELIVERY_SECRET = process.env.AUTO_DELIVERY_SECRET || ''

/**
 * 验证自动发货请求的中间件
 */
function verifyAutoDeliverySecret(req, res, next) {
  const authHeader = req.headers.authorization
  const secret = authHeader?.replace('Bearer ', '')

  if (!secret || secret !== AUTO_DELIVERY_SECRET) {
    logger.warn('自动发货接口认证失败', {
      ip: req.ip,
      headers: req.headers
    })
    return res.status(401).json({
      error: 'Unauthorized',
      message: '认证失败'
    })
  }

  next()
}

/**
 * POST /auto-delivery/generate-api-key
 *
 * 自动生成API Key用于发货
 *
 * 请求体：
 * {
 *   "orderNo": "订单号（可选，用于日志记录）",
 *   "name": "API Key名称（可选，默认：自动发货-时间戳）",
 *   "description": "描述（可选）",
 *   "expiresInDays": 过期天数（可选，默认365天）,
 *   "concurrencyLimit": 并发限制（可选，默认3）,
 *   "dailyCostLimit": 每日费用限制美元（可选，默认1）,
 *   "totalCostLimit": 总费用限制美元（可选，默认10）,
 *   "permissions": "权限（可选，默认all，可选值：all/claude/gemini/openai/droid）",
 *   "rateLimitRequests": 速率限制请求数（可选，默认20）,
 *   "rateLimitWindow": 速率限制窗口秒数（可选，默认60）,
 *   "enableModelRestriction": 是否启用模型限制（可选，默认false）,
 *   "restrictedModels": 限制的模型列表（可选，数组，默认[]空数组不限制）,
 *   "enableClientRestriction": 是否启用客户端限制（可选，默认false）,
 *   "allowedClients": 允许的客户端列表（可选，数组，默认[]）,
 *
 *   // === 账户绑定配置（新增）===
 *   "accountBindings": [
 *     {
 *       "platform": "claude",                // 平台：claude/gemini/openai/droid
 *       "mode": "group",                     // 模式：shared/dedicated/group
 *       "accountId": "account-uuid",         // 专属账户ID（mode=dedicated时必填）
 *       "groupId": "group-uuid",             // 分组ID（mode=group时必填）
 *       "groupName": "高级用户组"             // 分组名称（可选，仅用于描述）
 *     },
 *     {
 *       "platform": "gemini",
 *       "mode": "shared"                     // 共享模式
 *     }
 *   ]
 * }
 *
 * 响应：
 * {
 *   "success": true,
 *   "data": {
 *     "apiKey": "cr_xxx...",
 *     "keyId": "uuid",
 *     "name": "API Key名称",
 *     "expiresAt": "2025-12-16T00:00:00.000Z",
 *     "concurrencyLimit": 3,
 *     "dailyCostLimit": 1,
 *     "totalCostLimit": 10,
 *     "permissions": "all",
 *     "enableModelRestriction": false,
 *     "restrictedModels": [],
 *     "enableClientRestriction": false,
 *     "allowedClients": []
 *   },
 *   "orderNo": "订单号"
 * }
 */
router.post('/generate-api-key', verifyAutoDeliverySecret, async (req, res) => {
  try {
    const {
      orderNo = '',
      name = '',
      description = '',
      expiresInDays = 30,
      concurrencyLimit = 3,
      dailyCostLimit = 2,
      totalCostLimit = 5,
      permissions = 'claude',
      rateLimitRequests = 20,
      rateLimitWindow = 60,
      enableModelRestriction = true,
      restrictedModels = ['claude-opus-4-5', 'claude-opus-4'],
      enableClientRestriction = false,
      allowedClients = [],
      // 账户绑定配置（数组形式）
      accountBindings = []
    } = req.body

    // 验证参数
    if (!Array.isArray(accountBindings)) {
      return res.status(400).json({
        success: false,
        error: 'accountBindings 必须是数组'
      })
    }

    // 验证每个绑定配置
    for (const binding of accountBindings) {
      const { platform, mode, accountId, groupId } = binding

      if (!platform || !['claude', 'gemini', 'openai', 'droid'].includes(platform)) {
        return res.status(400).json({
          success: false,
          error: `无效的平台类型: ${platform}`
        })
      }

      if (!mode || !['shared', 'dedicated', 'group'].includes(mode)) {
        return res.status(400).json({
          success: false,
          error: `无效的账户模式: ${mode}`
        })
      }

      if (mode === 'dedicated' && !accountId) {
        return res.status(400).json({
          success: false,
          error: `${platform} 专属模式必须提供 accountId`
        })
      }

      if (mode === 'group' && !groupId) {
        return res.status(400).json({
          success: false,
          error: `${platform} 分组模式必须提供 groupId`
        })
      }
    }

    // 生成默认名称
    const timestamp = new Date().toISOString().split('T')[0]
    const apiKeyName = name || `自动发货-${timestamp}`

    // 计算过期时间
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays, 10))

    // 根据绑定配置设置账户字段
    const accountFields = {}
    const platformAccountField = {
      claude: 'claudeAccountId',
      gemini: 'geminiAccountId',
      openai: 'openaiAccountId',
      droid: 'droidAccountId'
    }

    // 构建描述信息
    const bindingDescriptions = []

    // 处理每个平台的绑定
    for (const binding of accountBindings) {
      const { platform, mode, accountId, groupId, groupName } = binding
      const fieldName = platformAccountField[platform]

      if (mode === 'shared') {
        accountFields[fieldName] = ''
        bindingDescriptions.push(`${platform}:共享`)
      } else if (mode === 'dedicated') {
        accountFields[fieldName] = accountId
        bindingDescriptions.push(`${platform}:专属(${accountId.substring(0, 8)}...)`)
      } else if (mode === 'group') {
        accountFields[fieldName] = `group:${groupId}`
        bindingDescriptions.push(
          `${platform}:分组(${groupName || `${groupId.substring(0, 8)}...`})`
        )
      }
    }

    // 未配置的平台默认为空（共享模式）
    for (const [_platform, fieldName] of Object.entries(platformAccountField)) {
      if (!(fieldName in accountFields)) {
        accountFields[fieldName] = ''
      }
    }

    // 构建完整描述
    const bindingDesc =
      bindingDescriptions.length > 0 ? `【${bindingDescriptions.join(' | ')}】` : '【全部共享】'
    const fullDescription = `${bindingDesc}${description || `订单号: ${orderNo || 'N/A'}`}`

    // 生成API Key
    const result = await apiKeyService.generateApiKey({
      name: apiKeyName,
      description: fullDescription,
      expiresAt: expiresAt.toISOString(),
      concurrencyLimit: parseInt(concurrencyLimit, 10),
      dailyCostLimit: parseFloat(dailyCostLimit),
      totalCostLimit: parseFloat(totalCostLimit),
      permissions,
      rateLimitRequests: parseInt(rateLimitRequests, 10),
      rateLimitWindow: parseInt(rateLimitWindow, 10),
      enableModelRestriction: Boolean(enableModelRestriction),
      restrictedModels: Array.isArray(restrictedModels) ? restrictedModels : [],
      enableClientRestriction: Boolean(enableClientRestriction),
      allowedClients: Array.isArray(allowedClients) ? allowedClients : [],
      ...accountFields, // 添加所有平台的账户绑定配置
      isActive: true
    })

    logger.success('自动发货生成API Key成功', {
      keyId: result.keyId,
      name: apiKeyName,
      orderNo,
      expiresInDays,
      permissions,
      accountBindings: accountBindings.map((b) => ({
        platform: b.platform,
        mode: b.mode,
        ...(b.mode === 'dedicated' && { accountId: b.accountId }),
        ...(b.mode === 'group' && { groupId: b.groupId, groupName: b.groupName })
      })),
      enableModelRestriction,
      restrictedModelsCount: restrictedModels.length,
      ip: req.ip
    })

    // 格式化过期时间为易读格式
    const expiresAtFormatted = new Date(expiresAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })

    // 构建友好的消息内容（用于闲鱼自动回复）
    const friendlyMessage = `🎉 自动发货成功！

您的 Claude API Key：
${result.apiKey}

📋 套餐信息：
• 有效期至：${expiresAtFormatted}
• 总额度：$${parseFloat(totalCostLimit)}
• 每日限额：$${parseFloat(dailyCostLimit)}
• 并发数：${parseInt(concurrencyLimit, 10)}

🔧 使用方法：
1. Base URL: http://your-server:3000/api/v1/messages
2. 请求头添加：Authorization: Bearer ${result.apiKey}
3. 完全兼容 Claude API 格式

⚠️ 重要提示：
• 请妥善保管您的 API Key
• 此密钥仅显示一次，请立即保存
• 如有问题请联系客服

祝您使用愉快！`

    res.json({
      success: true,
      data: {
        apiKey: result.apiKey, // 明文API Key，只返回一次
        keyId: result.keyId,
        name: apiKeyName,
        expiresAt: expiresAt.toISOString(),
        expiresAtFormatted,
        concurrencyLimit: parseInt(concurrencyLimit, 10),
        dailyCostLimit: parseFloat(dailyCostLimit),
        totalCostLimit: parseFloat(totalCostLimit),
        permissions,
        enableModelRestriction: Boolean(enableModelRestriction),
        restrictedModels: Array.isArray(restrictedModels) ? restrictedModels : [],
        enableClientRestriction: Boolean(enableClientRestriction),
        allowedClients: Array.isArray(allowedClients) ? allowedClients : []
      },
      orderNo,
      // 友好消息格式（供闲鱼自动回复使用）
      content: friendlyMessage,
      message: friendlyMessage
    })
  } catch (error) {
    logger.error('自动发货生成API Key失败', {
      error: error.message,
      stack: error.stack,
      body: req.body
    })

    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /auto-delivery/health
 *
 * 健康检查接口
 */
router.get('/health', verifyAutoDeliverySecret, (req, res) => {
  res.json({
    success: true,
    message: '自动发货服务运行正常',
    enabled: AUTO_DELIVERY_ENABLED,
    timestamp: new Date().toISOString()
  })
})

// 导出路由（仅在启用时）
if (AUTO_DELIVERY_ENABLED) {
  logger.info('✅ 自动发货路由已启用')
  if (!AUTO_DELIVERY_SECRET) {
    logger.warn('⚠️ AUTO_DELIVERY_SECRET 未配置，建议设置以提高安全性')
  }
  module.exports = router
} else {
  logger.info('⏸️  自动发货路由未启用（设置 AUTO_DELIVERY_ENABLED=true 启用）')
  // 返回空路由
  module.exports = express.Router()
}
