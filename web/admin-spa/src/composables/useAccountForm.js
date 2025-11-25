import { ref, computed } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'
import { useAccountsStore } from '@/stores/accounts'

/**
 * Composable for account form shared logic
 * Handles form state, validation, proxy configuration, and common operations
 */
export function useAccountForm(props) {
  const accountsStore = useAccountsStore()

  // Loading states
  const loading = ref(false)
  const oauthStep = ref(1)

  // Is edit mode
  const isEdit = computed(() => !!props.account)

  // Groups state
  const groups = ref([])
  const showGroupManagement = ref(false)

  // Platform group state
  const platformGroup = ref('')

  // Setup Token states
  const setupTokenLoading = ref(false)
  const setupTokenExchanging = ref(false)
  const setupTokenAuthUrl = ref('')
  const setupTokenAuthCode = ref('')
  const setupTokenCopied = ref(false)
  const setupTokenSessionId = ref('')

  // Claude Code unified User-Agent
  const unifiedUserAgent = ref('')
  const clearingCache = ref(false)

  // Form validation errors
  const errors = ref({
    name: '',
    refreshToken: '',
    accessToken: '',
    apiKeys: '',
    apiUrl: '',
    apiKey: '',
    baseApi: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    azureEndpoint: '',
    deploymentName: ''
  })

  // =====================
  // Proxy Configuration
  // =====================

  const createDefaultProxyState = () => ({
    enabled: false,
    type: 'socks5',
    host: '',
    port: '',
    username: '',
    password: ''
  })

  const parseProxyResponse = (rawProxy) => {
    if (!rawProxy) return null

    let proxyObject = rawProxy
    if (typeof rawProxy === 'string') {
      try {
        proxyObject = JSON.parse(rawProxy)
      } catch {
        return null
      }
    }

    if (proxyObject?.proxy && typeof proxyObject.proxy === 'object') {
      proxyObject = proxyObject.proxy
    }

    if (!proxyObject || typeof proxyObject !== 'object') return null

    const host =
      typeof proxyObject.host === 'string'
        ? proxyObject.host.trim()
        : proxyObject.host != null
          ? String(proxyObject.host).trim()
          : ''

    const port = proxyObject.port != null ? String(proxyObject.port).trim() : ''
    const type =
      typeof proxyObject.type === 'string' && proxyObject.type.trim()
        ? proxyObject.type.trim()
        : 'socks5'
    const username =
      typeof proxyObject.username === 'string'
        ? proxyObject.username
        : proxyObject.username != null
          ? String(proxyObject.username)
          : ''
    const password =
      typeof proxyObject.password === 'string'
        ? proxyObject.password
        : proxyObject.password != null
          ? String(proxyObject.password)
          : ''

    return { type, host, port, username, password }
  }

  const normalizeProxyFormState = (rawProxy) => {
    const parsed = parseProxyResponse(rawProxy)

    if (parsed?.host && parsed?.port) {
      return {
        enabled: true,
        type: parsed.type || 'socks5',
        host: parsed.host,
        port: parsed.port,
        username: parsed.username || '',
        password: parsed.password || ''
      }
    }

    return createDefaultProxyState()
  }

  const buildProxyPayload = (proxyState) => {
    if (!proxyState?.enabled) return null

    const host = (proxyState.host || '').trim()
    const portNumber = parseInt(proxyState.port, 10)

    if (!host || isNaN(portNumber) || portNumber <= 0) return null

    return {
      type: proxyState.type || 'socks5',
      host,
      port: portNumber,
      username: proxyState.username?.trim() || null,
      password: proxyState.password?.trim() || null
    }
  }

  // =====================
  // Platform Group Logic
  // =====================

  const determinePlatformGroup = (platform) => {
    if (['claude', 'claude-console', 'ccr', 'bedrock'].includes(platform)) {
      return 'claude'
    } else if (['openai', 'openai-responses', 'azure_openai'].includes(platform)) {
      return 'openai'
    } else if (platform === 'gemini') {
      return 'gemini'
    } else if (platform === 'droid') {
      return 'droid'
    }
    return ''
  }

  const selectPlatformGroup = (group, form) => {
    platformGroup.value = group
    const platformDefaults = {
      claude: 'claude',
      openai: 'openai',
      gemini: 'gemini',
      droid: 'droid'
    }
    form.value.platform = platformDefaults[group] || 'claude'
  }

  // =====================
  // Groups Management
  // =====================

  const loadGroups = async () => {
    try {
      const response = await apiClient.get('/admin/account-groups')
      groups.value = response.data || []
    } catch (error) {
      showToast('加载分组列表失败', 'error')
      groups.value = []
    }
  }

  const refreshGroups = async () => {
    await loadGroups()
    showToast('分组列表已刷新', 'success')
  }

  const handleNewGroup = () => {
    showGroupManagement.value = true
  }

  const handleGroupRefresh = async () => {
    await loadGroups()
  }

  const filteredGroups = computed(() => {
    return groups.value.filter((group) => group.status === 'active')
  })

  // =====================
  // Expire Date Logic
  // =====================

  const minDateTime = computed(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 1)
    return now.toISOString().slice(0, 16)
  })

  const updateAccountExpireAt = (form) => {
    if (!form.value.expireDuration) {
      form.value.expiresAt = null
      return
    }

    if (form.value.expireDuration === 'custom') return

    const now = new Date()
    const duration = form.value.expireDuration
    const match = duration.match(/(\d+)([d])/)

    if (match) {
      const [, value, unit] = match
      const num = parseInt(value)
      if (unit === 'd') {
        now.setDate(now.getDate() + num)
      }
      form.value.expiresAt = now.toISOString()
    }
  }

  const updateAccountCustomExpireAt = (form) => {
    if (form.value.customExpireDate) {
      form.value.expiresAt = new Date(form.value.customExpireDate).toISOString()
    }
  }

  const formatExpireDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // =====================
  // Claude Specific
  // =====================

  const generateClientId = () => {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  const regenerateClientId = (form) => {
    form.value.unifiedClientId = generateClientId()
    showToast('已生成新的客户端标识', 'success')
  }

  const handleUnifiedClientIdChange = (form) => {
    if (form.value.useUnifiedClientId) {
      form.value.useUnifiedUserAgent = true
      if (!form.value.unifiedClientId) {
        form.value.unifiedClientId = generateClientId()
      }
    }
  }

  const fetchUnifiedUserAgent = async () => {
    try {
      const response = await apiClient.get('/admin/claude-code-version')
      unifiedUserAgent.value = response.success && response.userAgent ? response.userAgent : ''
    } catch {
      unifiedUserAgent.value = ''
    }
  }

  const clearUnifiedCache = async () => {
    clearingCache.value = true
    try {
      const response = await apiClient.post('/admin/claude-code-version/clear')
      if (response.success) {
        unifiedUserAgent.value = ''
        showToast('统一User-Agent缓存已清除', 'success')
      } else {
        showToast('清除缓存失败', 'error')
      }
    } catch (error) {
      showToast('清除缓存失败：' + (error.message || '未知错误'), 'error')
    } finally {
      clearingCache.value = false
    }
  }

  // =====================
  // Setup Token Flow
  // =====================

  const generateSetupTokenAuthUrl = async (form) => {
    setupTokenLoading.value = true
    try {
      const proxyPayload = buildProxyPayload(form.value.proxy)
      const proxyConfig = proxyPayload ? { proxy: proxyPayload } : {}

      const result = await accountsStore.generateClaudeSetupTokenUrl(proxyConfig)
      setupTokenAuthUrl.value = result.authUrl
      setupTokenSessionId.value = result.sessionId
    } catch (error) {
      showToast(error.message || '生成Setup Token授权链接失败', 'error')
    } finally {
      setupTokenLoading.value = false
    }
  }

  const regenerateSetupTokenAuthUrl = (form) => {
    setupTokenAuthUrl.value = ''
    setupTokenAuthCode.value = ''
    generateSetupTokenAuthUrl(form)
  }

  const copySetupTokenAuthUrl = async () => {
    try {
      await navigator.clipboard.writeText(setupTokenAuthUrl.value)
      setupTokenCopied.value = true
      showToast('链接已复制', 'success')
      setTimeout(() => {
        setupTokenCopied.value = false
      }, 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = setupTokenAuthUrl.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setupTokenCopied.value = true
          showToast('链接已复制', 'success')
        } else {
          showToast('复制失败，请手动复制', 'error')
        }
      } catch {
        showToast('复制失败，请手动复制', 'error')
      }

      document.body.removeChild(textarea)
      setTimeout(() => {
        setupTokenCopied.value = false
      }, 2000)
    }
  }

  // =====================
  // Model Mappings
  // =====================

  const modelRestrictionMode = ref('whitelist')
  const allowedModels = ref([
    'claude-sonnet-4-20250514',
    'claude-sonnet-4-5-20250929',
    'claude-3-5-haiku-20241022'
  ])
  const modelMappings = ref([])

  const commonModels = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', color: 'blue' },
    { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', color: 'indigo' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', color: 'green' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', color: 'emerald' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4', color: 'purple' },
    { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1', color: 'purple' },
    { value: 'deepseek-chat', label: 'DeepSeek Chat', color: 'cyan' },
    { value: 'Qwen', label: 'Qwen', color: 'orange' },
    { value: 'Kimi', label: 'Kimi', color: 'pink' },
    { value: 'GLM', label: 'GLM', color: 'teal' }
  ]

  const initModelMappings = (account) => {
    if (!account?.supportedModels) return

    const models = account.supportedModels

    if (typeof models === 'object' && !Array.isArray(models)) {
      const entries = Object.entries(models)
      const isWhitelist = entries.every(([from, to]) => from === to)

      if (isWhitelist) {
        modelRestrictionMode.value = 'whitelist'
        allowedModels.value = entries.map(([from]) => from)
        modelMappings.value = entries.map(([from, to]) => ({ from, to }))
      } else {
        modelRestrictionMode.value = 'mapping'
        modelMappings.value = entries.map(([from, to]) => ({ from, to }))
      }
    } else if (Array.isArray(models)) {
      modelRestrictionMode.value = 'whitelist'
      allowedModels.value = models
      modelMappings.value = models.map((model) => ({ from: model, to: model }))
    }
  }

  const addModelMapping = () => {
    modelMappings.value.push({ from: '', to: '' })
  }

  const removeModelMapping = (index) => {
    modelMappings.value.splice(index, 1)
  }

  const addPresetMapping = (from, to) => {
    const exists = modelMappings.value.some((m) => m.from === from)
    if (exists) {
      showToast(`模型 ${from} 的映射已存在`, 'info')
      return
    }
    modelMappings.value.push({ from, to })
    showToast(`已添加映射: ${from} → ${to}`, 'success')
  }

  const convertMappingsToObject = () => {
    const mapping = {}

    if (modelRestrictionMode.value === 'whitelist') {
      allowedModels.value.forEach((model) => {
        mapping[model] = model
      })
    } else {
      modelMappings.value.forEach((item) => {
        if (item.from && item.to) {
          mapping[item.from] = item.to
        }
      })
    }

    return Object.keys(mapping).length > 0 ? mapping : null
  }

  // =====================
  // API Key Parsing
  // =====================

  const parseApiKeysInput = (input) => {
    if (!input || typeof input !== 'string') return []

    const segments = input
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    if (segments.length === 0) return []

    return Array.from(new Set(segments))
  }

  const apiKeyModeOptions = [
    {
      value: 'append',
      label: '追加模式',
      description: '保留现有 Key，并在末尾追加新 Key 列表。'
    },
    {
      value: 'replace',
      label: '覆盖模式',
      description: '先清空旧 Key，再写入上方的新 Key 列表。'
    },
    {
      value: 'delete',
      label: '删除模式',
      description: '输入要移除的 Key，可精准删除失效或被封禁的 Key。'
    }
  ]

  // =====================
  // Navigation
  // =====================

  const canProceed = (form) => {
    return form.value.name?.trim() && form.value.platform
  }

  const nextStep = async (form, showConfirm) => {
    errors.value.name = ''

    if (!canProceed(form)) {
      if (!form.value.name || form.value.name.trim() === '') {
        errors.value.name = '请填写账户名称'
      }
      return false
    }

    if (
      form.value.accountType === 'group' &&
      (!form.value.groupIds || form.value.groupIds.length === 0)
    ) {
      showToast('请选择一个分组', 'error')
      return false
    }

    if (form.value.accountType === 'group') {
      form.value.groupId = form.value.groupIds?.[0] || ''
    }

    if (
      form.value.platform === 'gemini' &&
      oauthStep.value === 1 &&
      form.value.addType === 'oauth'
    ) {
      if (!form.value.projectId || form.value.projectId.trim() === '') {
        const confirmed = await showConfirm(
          '项目 ID 未填写',
          '您尚未填写项目 ID。\n\n如果您的Google账号绑定了Google Cloud或被识别为Workspace账号，需要提供项目 ID。\n如果您使用的是普通个人账号，可以继续不填写。',
          '继续',
          '返回填写'
        )
        if (!confirmed) return false
      }
    }

    oauthStep.value = 2
    return true
  }

  return {
    // States
    loading,
    oauthStep,
    isEdit,
    groups,
    showGroupManagement,
    platformGroup,
    errors,

    // Setup Token
    setupTokenLoading,
    setupTokenExchanging,
    setupTokenAuthUrl,
    setupTokenAuthCode,
    setupTokenCopied,
    setupTokenSessionId,

    // Claude specific
    unifiedUserAgent,
    clearingCache,

    // Model mappings
    modelRestrictionMode,
    allowedModels,
    modelMappings,
    commonModels,

    // API Key
    apiKeyModeOptions,

    // Proxy methods
    createDefaultProxyState,
    normalizeProxyFormState,
    buildProxyPayload,

    // Platform methods
    determinePlatformGroup,
    selectPlatformGroup,

    // Groups methods
    loadGroups,
    refreshGroups,
    handleNewGroup,
    handleGroupRefresh,
    filteredGroups,

    // Expire date methods
    minDateTime,
    updateAccountExpireAt,
    updateAccountCustomExpireAt,
    formatExpireDate,

    // Claude methods
    generateClientId,
    regenerateClientId,
    handleUnifiedClientIdChange,
    fetchUnifiedUserAgent,
    clearUnifiedCache,

    // Setup Token methods
    generateSetupTokenAuthUrl,
    regenerateSetupTokenAuthUrl,
    copySetupTokenAuthUrl,

    // Model mapping methods
    initModelMappings,
    addModelMapping,
    removeModelMapping,
    addPresetMapping,
    convertMappingsToObject,

    // API Key methods
    parseApiKeysInput,

    // Navigation
    canProceed,
    nextStep,

    // Store
    accountsStore
  }
}
