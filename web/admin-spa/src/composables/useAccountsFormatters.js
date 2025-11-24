// Formatters and utility functions for AccountsView

export function useAccountsFormatters() {
  // Format number to M (millions)
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    const number = Number(num)
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2)
    } else if (number >= 1000) {
      return (number / 1000000).toFixed(4)
    }
    return (number / 1000000).toFixed(6)
  }

  // Format last used time
  const formatLastUsed = (dateString) => {
    if (!dateString) return '从未使用'

    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

    return date.toLocaleDateString('zh-CN')
  }

  const formatRelativeTime = (dateString) => formatLastUsed(dateString)

  // Format proxy display
  const formatProxyDisplay = (proxy, normalizeProxyData) => {
    const parsed = normalizeProxyData(proxy)
    if (!parsed) return null

    const typeShort = parsed.type.toLowerCase() === 'socks5' ? 'S5' : parsed.type.toUpperCase()

    let host = parsed.host
    if (host.length > 15) {
      host = host.substring(0, 12) + '...'
    }

    let display = `${typeShort}://${host}:${parsed.port}`

    if (parsed.username) {
      display = `${typeShort}://***@${host}:${parsed.port}`
    }

    return display
  }

  // Format session window time
  const formatSessionWindow = (windowStart, windowEnd) => {
    if (!windowStart || !windowEnd) return '--'

    const start = new Date(windowStart)
    const end = new Date(windowEnd)

    const startHour = start.getHours().toString().padStart(2, '0')
    const startMin = start.getMinutes().toString().padStart(2, '0')
    const endHour = end.getHours().toString().padStart(2, '0')
    const endMin = end.getMinutes().toString().padStart(2, '0')

    return `${startHour}:${startMin} - ${endHour}:${endMin}`
  }

  // Format remaining time
  const formatRemainingTime = (minutes) => {
    if (!minutes || minutes <= 0) return '已结束'

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  // Format rate limit time
  const formatRateLimitTime = (minutes) => {
    if (!minutes || minutes <= 0) return ''

    minutes = Math.floor(minutes)

    const days = Math.floor(minutes / 1440)
    const remainingAfterDays = minutes % 1440
    const hours = Math.floor(remainingAfterDays / 60)
    const mins = remainingAfterDays % 60

    if (days > 0) {
      if (hours > 0) {
        return `${days}天${hours}小时`
      }
      return `${days}天`
    } else if (hours > 0) {
      if (mins > 0) {
        return `${hours}小时${mins}分钟`
      }
      return `${hours}小时`
    } else {
      return `${mins}分钟`
    }
  }

  // Format cost
  const formatCost = (cost) => {
    if (!cost || cost === 0) return '0.0000'
    if (cost < 0.0001) return cost.toExponential(2)
    if (cost < 0.01) return cost.toFixed(6)
    if (cost < 1) return cost.toFixed(4)
    return cost.toFixed(2)
  }

  // Format expire date
  const formatExpireDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Check if expired
  const isExpired = (expiresAt) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  // Check if expiring soon
  const isExpiringSoon = (expiresAt) => {
    if (!expiresAt) return false
    const now = new Date()
    const expireDate = new Date(expiresAt)
    const daysUntilExpire = (expireDate - now) / (1000 * 60 * 60 * 24)
    return daysUntilExpire > 0 && daysUntilExpire <= 7
  }

  // Calculate daily cost
  const calculateDailyCost = (account) => {
    if (!account.usage || !account.usage.daily) return '0.0000'
    if (account.usage.daily.cost !== undefined) {
      return formatCost(account.usage.daily.cost)
    }
    return '0.0000'
  }

  // Get Claude auth type
  const getClaudeAuthType = (account) => {
    if (!account.lastRefreshAt || account.lastRefreshAt === '') {
      return 'Setup'
    }
    return 'OAuth'
  }

  // Get Gemini auth type
  const getGeminiAuthType = () => 'OAuth'

  // Get OpenAI auth type
  const getOpenAIAuthType = () => 'OAuth'

  // Get Droid auth type
  const getDroidAuthType = (account) => {
    if (!account || typeof account !== 'object') return 'OAuth'

    const apiKeyModeFlag =
      account.isApiKeyMode ?? account.is_api_key_mode ?? account.apiKeyMode ?? account.api_key_mode

    if (
      apiKeyModeFlag === true ||
      apiKeyModeFlag === 'true' ||
      apiKeyModeFlag === 1 ||
      apiKeyModeFlag === '1'
    ) {
      return 'API Key'
    }

    const methodCandidate =
      account.authenticationMethod ||
      account.authMethod ||
      account.authentication_mode ||
      account.authenticationMode ||
      account.authentication_method ||
      account.auth_type ||
      account.authType ||
      account.authentication_type ||
      account.authenticationType ||
      account.droidAuthType ||
      account.droidAuthenticationMethod ||
      account.method ||
      account.auth ||
      ''

    if (typeof methodCandidate === 'string') {
      const normalized = methodCandidate.trim().toLowerCase()
      const compacted = normalized.replace(/[\s_-]/g, '')
      if (compacted === 'apikey') {
        return 'API Key'
      }
    }

    return 'OAuth'
  }

  const isDroidApiKeyMode = (account) => getDroidAuthType(account) === 'API Key'

  // Get Droid API key count
  const getDroidApiKeyCount = (account) => {
    if (!account || typeof account !== 'object') return 0

    if (Array.isArray(account.apiKeys)) {
      return account.apiKeys.filter((apiKey) => apiKey.status !== 'error').length
    }

    if (typeof account.apiKeys === 'string' && account.apiKeys.trim()) {
      try {
        const parsed = JSON.parse(account.apiKeys)
        if (Array.isArray(parsed)) {
          return parsed.filter((apiKey) => apiKey.status !== 'error').length
        }
      } catch (error) {
        // ignore
      }
    }

    const candidates = [
      account.apiKeyCount,
      account.api_key_count,
      account.apiKeysCount,
      account.api_keys_count
    ]

    for (const candidate of candidates) {
      const value = Number(candidate)
      if (Number.isFinite(value) && value >= 0) {
        return value
      }
    }

    return 0
  }

  // Get Droid API key badge classes
  const getDroidApiKeyBadgeClasses = (account) => {
    const count = getDroidApiKeyCount(account)
    const baseClass =
      'ml-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-[1px] text-[10px] font-medium shadow-sm backdrop-blur-sm'

    if (count > 0) {
      return [
        baseClass,
        'border-cyan-200 bg-cyan-50/90 text-cyan-700 dark:border-cyan-500/40 dark:bg-cyan-900/40 dark:text-cyan-200'
      ]
    }

    return [
      baseClass,
      'border-rose-200 bg-rose-50/90 text-rose-600 dark:border-rose-500/40 dark:bg-rose-900/40 dark:text-rose-200'
    ]
  }

  // Get Claude account type
  const getClaudeAccountType = (account) => {
    if (account.subscriptionInfo) {
      try {
        const info =
          typeof account.subscriptionInfo === 'string'
            ? JSON.parse(account.subscriptionInfo)
            : account.subscriptionInfo

        if (info.hasClaudeMax === true) {
          return 'Claude Max'
        } else if (info.hasClaudePro === true) {
          return 'Claude Pro'
        } else {
          return 'Claude Free'
        }
      } catch (e) {
        return 'Claude'
      }
    }
    return 'Claude'
  }

  // Get schedulable reason
  const getSchedulableReason = (account) => {
    if (account.schedulable !== false) return null

    if (account.platform === 'claude-console') {
      if (account.status === 'unauthorized') return 'API Key无效或已过期（401错误）'
      if (account.overloadStatus === 'overloaded') return '服务过载（529错误）'
      if (account.rateLimitStatus === 'limited') return '触发限流（429错误）'
      if (account.status === 'blocked' && account.errorMessage) return account.errorMessage
    }

    if (account.platform === 'claude') {
      if (account.status === 'unauthorized') return '认证失败（401错误）'
      if (account.status === 'temp_error' && account.errorMessage) return account.errorMessage
      if (account.status === 'error' && account.errorMessage) return account.errorMessage
      if (account.isRateLimited) return '触发限流（429错误）'
      if (account.stoppedReason) return account.stoppedReason
      if (account.fiveHourAutoStopped === 'true' || account.fiveHourAutoStopped === true) {
        return '5小时使用量接近限制，已自动停止调度'
      }
    }

    if (account.platform === 'openai') {
      if (account.status === 'unauthorized') return '认证失败（401错误）'
      if (
        (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
        account.isRateLimited
      )
        return '触发限流（429错误）'
      if (account.status === 'error' && account.errorMessage) return account.errorMessage
    }

    if (account.platform === 'openai-responses') {
      if (account.status === 'unauthorized') return '认证失败（401错误）'
      if (
        (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
        account.isRateLimited
      )
        return '触发限流（429错误）'
      if (account.status === 'error' && account.errorMessage) return account.errorMessage
      if (account.status === 'rateLimited') return '触发限流（429错误）'
    }

    if (account.stoppedReason) return account.stoppedReason
    if (account.errorMessage) return account.errorMessage

    return '手动停止调度'
  }

  // Get account status text
  const getAccountStatusText = (account) => {
    if (account.status === 'blocked') return '已封锁'
    if (account.status === 'unauthorized') return '异常'
    if (
      account.isRateLimited ||
      account.status === 'rate_limited' ||
      (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
      account.rateLimitStatus === 'limited'
    )
      return '限流中'
    if (account.status === 'temp_error') return '临时异常'
    if (account.status === 'error' || !account.isActive) return '错误'
    if (account.schedulable === false) return '已暂停'
    return '正常'
  }

  // Get account status class
  const getAccountStatusClass = (account) => {
    if (account.status === 'blocked') return 'bg-red-100 text-red-800'
    if (account.status === 'unauthorized') return 'bg-red-100 text-red-800'
    if (
      account.isRateLimited ||
      account.status === 'rate_limited' ||
      (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
      account.rateLimitStatus === 'limited'
    )
      return 'bg-orange-100 text-orange-800'
    if (account.status === 'temp_error') return 'bg-orange-100 text-orange-800'
    if (account.status === 'error' || !account.isActive) return 'bg-red-100 text-red-800'
    if (account.schedulable === false) return 'bg-gray-100 text-gray-800'
    return 'bg-green-100 text-green-800'
  }

  // Get account status dot class
  const getAccountStatusDotClass = (account) => {
    if (account.status === 'blocked') return 'bg-red-500'
    if (account.status === 'unauthorized') return 'bg-red-500'
    if (
      account.isRateLimited ||
      account.status === 'rate_limited' ||
      (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
      account.rateLimitStatus === 'limited'
    )
      return 'bg-orange-500'
    if (account.status === 'temp_error') return 'bg-orange-500'
    if (account.status === 'error' || !account.isActive) return 'bg-red-500'
    if (account.schedulable === false) return 'bg-gray-500'
    return 'bg-green-500'
  }

  // Session progress bar class
  const getSessionProgressBarClass = (status, account = null) => {
    if (!status) return 'bg-gradient-to-r from-primary-500 to-primary-600'

    const isRateLimited =
      account &&
      (account.isRateLimited ||
        account.status === 'rate_limited' ||
        (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
        account.rateLimitStatus === 'limited')

    if (isRateLimited) return 'bg-gradient-to-r from-red-500 to-red-600'

    const normalizedStatus = String(status).toLowerCase()

    if (normalizedStatus === 'rejected') {
      return 'bg-gradient-to-r from-red-500 to-red-600'
    } else if (normalizedStatus === 'allowed_warning') {
      return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    } else {
      return 'bg-gradient-to-r from-primary-500 to-primary-600'
    }
  }

  // Check if Claude OAuth
  const isClaudeOAuth = (account) => account.authType === 'oauth'

  // Claude usage formatters
  const formatClaudeUsagePercent = (window) => {
    if (!window || window.utilization === null || window.utilization === undefined) return '-'
    return `${window.utilization}%`
  }

  const getClaudeUsageWidth = (window) => {
    if (!window || window.utilization === null || window.utilization === undefined) return '0%'
    return `${window.utilization}%`
  }

  const getClaudeUsageBarClass = (window) => {
    const util = window?.utilization || 0
    if (util < 60) return 'bg-gradient-to-r from-primary-500 to-primary-600'
    if (util < 90) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-red-500 to-red-600'
  }

  const formatClaudeRemaining = (window) => {
    if (!window || !window.remainingSeconds) return '-'

    const seconds = window.remainingSeconds
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      if (hours > 0) return `${days}天${hours}小时`
      return `${days}天`
    }
    if (hours > 0) {
      if (minutes > 0) return `${hours}小时${minutes}分钟`
      return `${hours}小时`
    }
    if (minutes > 0) return `${minutes}分钟`
    return `${Math.floor(seconds % 60)}秒`
  }

  // Codex usage formatters
  const normalizeCodexUsagePercent = (usageItem) => {
    if (!usageItem) return null

    const basePercent =
      typeof usageItem.usedPercent === 'number' && !Number.isNaN(usageItem.usedPercent)
        ? usageItem.usedPercent
        : null

    const resetAfterSeconds =
      typeof usageItem.resetAfterSeconds === 'number' && !Number.isNaN(usageItem.resetAfterSeconds)
        ? usageItem.resetAfterSeconds
        : null

    const remainingSeconds =
      typeof usageItem.remainingSeconds === 'number' ? usageItem.remainingSeconds : null

    const resetAtMs = usageItem.resetAt ? Date.parse(usageItem.resetAt) : null

    const resetElapsed =
      resetAfterSeconds !== null &&
      ((remainingSeconds !== null && remainingSeconds <= 0) ||
        (resetAtMs !== null && !Number.isNaN(resetAtMs) && Date.now() >= resetAtMs))

    if (resetElapsed) return 0
    if (basePercent === null) return null
    return Math.max(0, Math.min(100, basePercent))
  }

  const getCodexUsageBarClass = (usageItem) => {
    const percent = normalizeCodexUsagePercent(usageItem)
    if (percent === null) return 'bg-gradient-to-r from-gray-300 to-gray-400'
    if (percent >= 90) return 'bg-gradient-to-r from-red-500 to-red-600'
    if (percent >= 75) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-emerald-500 to-teal-500'
  }

  const formatCodexUsagePercent = (usageItem) => {
    const percent = normalizeCodexUsagePercent(usageItem)
    if (percent === null) return '--'
    return `${percent.toFixed(1)}%`
  }

  const getCodexUsageWidth = (usageItem) => {
    const percent = normalizeCodexUsagePercent(usageItem)
    if (percent === null) return '0%'
    return `${percent}%`
  }

  const getCodexWindowLabel = (type) => {
    if (type === 'secondary') return '周限'
    return '5h'
  }

  const formatCodexRemaining = (usageItem) => {
    if (!usageItem) return '--'

    let seconds = usageItem.remainingSeconds
    if (seconds === null || seconds === undefined) {
      seconds = usageItem.resetAfterSeconds
    }

    if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '--'

    seconds = Math.max(0, Math.floor(Number(seconds)))

    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) {
      if (hours > 0) return `${days}天${hours}小时`
      return `${days}天`
    }
    if (hours > 0) {
      if (minutes > 0) return `${hours}小时${minutes}分钟`
      return `${hours}小时`
    }
    if (minutes > 0) return `${minutes}分钟`
    return `${secs}秒`
  }

  // Claude Console quota formatters
  const getQuotaUsagePercent = (account) => {
    const used = Number(account?.usage?.daily?.cost || 0)
    const quota = Number(account?.dailyQuota || 0)
    if (!quota || quota <= 0) return 0
    return (used / quota) * 100
  }

  const getQuotaBarClass = (percent) => {
    if (percent >= 90) return 'bg-red-500'
    if (percent >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getConsoleConcurrencyPercent = (account) => {
    const max = Number(account?.maxConcurrentTasks || 0)
    if (!max || max <= 0) return 0
    const active = Number(account?.activeTaskCount || 0)
    return Math.min(100, (active / max) * 100)
  }

  const getConcurrencyBarClass = (percent) => {
    if (percent >= 100) return 'bg-red-500'
    if (percent >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getConcurrencyLabelClass = (account) => {
    const max = Number(account?.maxConcurrentTasks || 0)
    if (!max || max <= 0) return 'text-gray-500 dark:text-gray-400'
    const active = Number(account?.activeTaskCount || 0)
    if (active >= max) return 'text-red-600 dark:text-red-400'
    if (active >= max * 0.8) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-700 dark:text-gray-200'
  }

  const formatRemainingQuota = (account) => {
    const used = Number(account?.usage?.daily?.cost || 0)
    const quota = Number(account?.dailyQuota || 0)
    if (!quota || quota <= 0) return '0.00'
    return Math.max(0, quota - used).toFixed(2)
  }

  return {
    formatNumber,
    formatLastUsed,
    formatRelativeTime,
    formatProxyDisplay,
    formatSessionWindow,
    formatRemainingTime,
    formatRateLimitTime,
    formatCost,
    formatExpireDate,
    isExpired,
    isExpiringSoon,
    calculateDailyCost,
    getClaudeAuthType,
    getGeminiAuthType,
    getOpenAIAuthType,
    getDroidAuthType,
    isDroidApiKeyMode,
    getDroidApiKeyCount,
    getDroidApiKeyBadgeClasses,
    getClaudeAccountType,
    getSchedulableReason,
    getAccountStatusText,
    getAccountStatusClass,
    getAccountStatusDotClass,
    getSessionProgressBarClass,
    isClaudeOAuth,
    formatClaudeUsagePercent,
    getClaudeUsageWidth,
    getClaudeUsageBarClass,
    formatClaudeRemaining,
    normalizeCodexUsagePercent,
    getCodexUsageBarClass,
    formatCodexUsagePercent,
    getCodexUsageWidth,
    getCodexWindowLabel,
    formatCodexRemaining,
    getQuotaUsagePercent,
    getQuotaBarClass,
    getConsoleConcurrencyPercent,
    getConcurrencyBarClass,
    getConcurrencyLabelClass,
    formatRemainingQuota
  }
}
