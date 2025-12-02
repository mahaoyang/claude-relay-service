import { ref, reactive, computed, watch } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'
import { useAuthStore } from '@/stores/auth'

export function useApiKeysData() {
  const authStore = useAuthStore()

  // State
  const apiKeys = ref([])
  const apiKeysLoading = ref(false)
  const deletedApiKeys = ref([])
  const deletedApiKeysLoading = ref(false)

  // Sorting
  const apiKeysSortBy = ref('periodCost')
  const apiKeysSortOrder = ref('desc')

  // Expanded rows and model stats
  const expandedApiKeys = ref({})
  const apiKeyModelStats = ref({})
  const apiKeyDateFilters = ref({})

  // Tags
  const availableTags = ref([])
  const selectedTagFilter = ref('')

  // Search
  const searchKeyword = ref('')
  const searchMode = ref('apiKey')

  // Pagination
  const currentPage = ref(1)
  const getInitialPageSize = () => {
    const saved = localStorage.getItem('apiKeysPageSize')
    if (saved) {
      const parsedSize = parseInt(saved, 10)
      if ([10, 20, 50, 100].includes(parsedSize)) {
        return parsedSize
      }
    }
    return 10
  }
  const pageSize = ref(getInitialPageSize())
  const pageSizeOptions = [10, 20, 50, 100]

  // Global date filter
  const globalDateFilter = reactive({
    type: 'preset',
    preset: 'today',
    customStart: '',
    customEnd: '',
    customRange: null
  })

  // Default time for date picker
  const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

  // LDAP enabled
  const isLdapEnabled = computed(() => authStore.oemSettings?.ldapEnabled || false)

  // Accounts data
  const accounts = ref({
    claude: [],
    gemini: [],
    openai: [],
    openaiResponses: [],
    bedrock: [],
    droid: [],
    claudeGroups: [],
    geminiGroups: [],
    openaiGroups: [],
    droidGroups: []
  })

  // Time range options
  const timeRangeDropdownOptions = computed(() => [
    { value: 'today', label: '今日', icon: 'CalendarDays' },
    { value: '7days', label: '最近7天', icon: 'CalendarRange' },
    { value: '30days', label: '最近30天', icon: 'Calendar' },
    { value: 'all', label: '全部时间', icon: 'Infinity' },
    { value: 'custom', label: '自定义范围', icon: 'CalendarCheck' }
  ])

  // Search mode options
  const searchModeOptions = computed(() => [
    { value: 'apiKey', label: '按Key名称', icon: 'Key' },
    { value: 'bindingAccount', label: '按所属账号', icon: 'IdCard' }
  ])

  // Tag options
  const tagOptions = computed(() => {
    const options = [{ value: '', label: '所有标签', icon: 'Asterisk' }]
    availableTags.value.forEach((tag) => {
      options.push({ value: tag, label: tag, icon: 'Tag' })
    })
    return options
  })

  const selectedTagCount = computed(() => {
    if (!selectedTagFilter.value) return 0
    return apiKeys.value.filter((key) => key.tags && key.tags.includes(selectedTagFilter.value))
      .length
  })

  // Helper functions for binding info
  const getBoundAccountName = (accountId) => {
    if (!accountId) return '未知账户'

    if (accountId.startsWith('group:')) {
      const groupId = accountId.substring(6)
      const claudeGroup = accounts.value.claudeGroups.find((g) => g.id === groupId)
      if (claudeGroup) return `分组-${claudeGroup.name}`
      const geminiGroup = accounts.value.geminiGroups.find((g) => g.id === groupId)
      if (geminiGroup) return `分组-${geminiGroup.name}`
      const openaiGroup = accounts.value.openaiGroups.find((g) => g.id === groupId)
      if (openaiGroup) return `分组-${openaiGroup.name}`
      const droidGroup = accounts.value.droidGroups.find((g) => g.id === groupId)
      if (droidGroup) return `分组-${droidGroup.name}`
      return `分组-${groupId.substring(0, 8)}`
    }

    const claudeAccount = accounts.value.claude.find((acc) => acc.id === accountId)
    if (claudeAccount) return `${claudeAccount.name}`

    const geminiAccount = accounts.value.gemini.find((acc) => acc.id === accountId)
    if (geminiAccount) return `${geminiAccount.name}`

    if (accountId.startsWith('responses:')) {
      const realAccountId = accountId.replace('responses:', '')
      const openaiResponsesAccount = accounts.value.openaiResponses.find(
        (acc) => acc.id === realAccountId
      )
      if (openaiResponsesAccount) return `${openaiResponsesAccount.name}`
      return `${realAccountId.substring(0, 8)}`
    }

    const openaiAccount = accounts.value.openai.find((acc) => acc.id === accountId)
    if (openaiAccount) return `${openaiAccount.name}`

    const openaiResponsesAccount = accounts.value.openaiResponses.find(
      (acc) => acc.id === accountId
    )
    if (openaiResponsesAccount) return `${openaiResponsesAccount.name}`

    const bedrockAccount = accounts.value.bedrock.find((acc) => acc.id === accountId)
    if (bedrockAccount) return `${bedrockAccount.name}`

    const droidAccount = accounts.value.droid.find((acc) => acc.id === accountId)
    if (droidAccount) return `${droidAccount.name}`

    return `${accountId.substring(0, 8)}`
  }

  const getClaudeBindingInfo = (key) => {
    if (key.claudeAccountId) {
      const info = getBoundAccountName(key.claudeAccountId)
      if (key.claudeAccountId.startsWith('group:')) return info
      const account = accounts.value.claude.find((acc) => acc.id === key.claudeAccountId)
      if (!account) return `${info} (账户不存在)`
      if (account.accountType === 'dedicated') return `专属-${info}`
      return info
    }
    if (key.claudeConsoleAccountId) {
      const account = accounts.value.claude.find(
        (acc) => acc.id === key.claudeConsoleAccountId && acc.platform === 'claude-console'
      )
      if (!account) return `Console账户不存在`
      return `Console-${account.name}`
    }
    return ''
  }

  const getGeminiBindingInfo = (key) => {
    if (key.geminiAccountId) {
      const info = getBoundAccountName(key.geminiAccountId)
      if (key.geminiAccountId.startsWith('group:')) return info
      const account = accounts.value.gemini.find((acc) => acc.id === key.geminiAccountId)
      if (!account) return `${info} (账户不存在)`
      if (account.accountType === 'dedicated') return `专属-${info}`
      return info
    }
    return ''
  }

  const getOpenAIBindingInfo = (key) => {
    if (key.openaiAccountId) {
      const info = getBoundAccountName(key.openaiAccountId)
      if (key.openaiAccountId.startsWith('group:')) return info

      let account = null
      if (key.openaiAccountId.startsWith('responses:')) {
        const realAccountId = key.openaiAccountId.replace('responses:', '')
        account = accounts.value.openaiResponses.find((acc) => acc.id === realAccountId)
      } else {
        account = accounts.value.openai.find((acc) => acc.id === key.openaiAccountId)
      }

      if (!account) return `${info} (账户不存在)`
      if (account.accountType === 'dedicated') return `专属-${info}`
      return info
    }
    return ''
  }

  const getBedrockBindingInfo = (key) => {
    if (key.bedrockAccountId) {
      const info = getBoundAccountName(key.bedrockAccountId)
      if (key.bedrockAccountId.startsWith('group:')) return info
      const account = accounts.value.bedrock.find((acc) => acc.id === key.bedrockAccountId)
      if (!account) return `${info} (账户不存在)`
      if (account.accountType === 'dedicated') return `专属-${info}`
      return info
    }
    return ''
  }

  const getDroidBindingInfo = (key) => {
    if (key.droidAccountId) {
      const info = getBoundAccountName(key.droidAccountId)
      if (key.droidAccountId.startsWith('group:')) return info
      const account = accounts.value.droid.find((acc) => acc.id === key.droidAccountId)
      if (!account) return `${info} (账户不存在)`
      if (account.accountType === 'dedicated') return `专属-${info}`
      return info
    }
    return ''
  }

  const getBindingDisplayStrings = (key) => {
    const values = new Set()

    const collect = (...items) => {
      items.forEach((item) => {
        if (typeof item !== 'string') return
        const trimmed = item.trim()
        if (trimmed) values.add(trimmed)
      })
    }

    const sanitize = (text) => {
      if (typeof text !== 'string') return ''
      return text
        .replace(/^⚠️\s*/, '')
        .replace(/^🔒\s*/, '')
        .trim()
    }

    const appendBindingRow = (label, info) => {
      const infoSanitized = sanitize(info)
      collect(label, info, infoSanitized)
      if (infoSanitized) collect(`${label} ${infoSanitized}`)
    }

    if (key.claudeAccountId || key.claudeConsoleAccountId) {
      appendBindingRow('Claude', getClaudeBindingInfo(key))
    }
    if (key.geminiAccountId) appendBindingRow('Gemini', getGeminiBindingInfo(key))
    if (key.openaiAccountId) appendBindingRow('OpenAI', getOpenAIBindingInfo(key))
    if (key.bedrockAccountId) appendBindingRow('Bedrock', getBedrockBindingInfo(key))
    if (key.droidAccountId) appendBindingRow('Droid', getDroidBindingInfo(key))

    if (
      !key.claudeAccountId &&
      !key.claudeConsoleAccountId &&
      !key.geminiAccountId &&
      !key.openaiAccountId &&
      !key.bedrockAccountId &&
      !key.droidAccountId
    ) {
      collect('共享池')
    }

    return Array.from(values)
  }

  // Period data getters
  const getPeriodRequests = (key) => {
    if (globalDateFilter.type === 'custom') {
      if (key.usage?.['custom']?.requests !== undefined) return key.usage['custom'].requests
      if (key.usage?.total?.requests !== undefined) return key.usage.total.requests
      return 0
    } else if (globalDateFilter.preset === 'today') {
      return key.usage?.daily?.requests || 0
    } else if (globalDateFilter.preset === '7days') {
      return key.usage?.['7days']?.requests ?? 0
    } else if (globalDateFilter.preset === '30days') {
      return key.usage?.['30days']?.requests ?? key.usage?.monthly?.requests ?? 0
    } else if (globalDateFilter.preset === 'all') {
      return key.usage?.['all']?.requests ?? key.usage?.total?.requests ?? 0
    }
    return key.usage?.total?.requests || 0
  }

  const getPeriodCost = (key) => {
    if (globalDateFilter.type === 'custom') {
      if (key.usage?.['custom']?.cost !== undefined) return key.usage['custom'].cost
      if (key.usage?.total?.cost !== undefined) return key.usage.total.cost
      return 0
    } else if (globalDateFilter.preset === 'today') {
      return key.dailyCost || 0
    } else if (globalDateFilter.preset === '7days') {
      return key.usage?.['7days']?.cost ?? key.weeklyCost ?? key.periodCost ?? 0
    } else if (globalDateFilter.preset === '30days') {
      return (
        key.usage?.['30days']?.cost ??
        key.usage?.monthly?.cost ??
        key.usage?.total?.cost ??
        key.monthlyCost ??
        key.periodCost ??
        0
      )
    } else if (globalDateFilter.preset === 'all') {
      return key.usage?.['all']?.cost ?? key.totalCost ?? 0
    }
    return key.periodCost || key.totalCost || 0
  }

  const getPeriodTokens = (key) => {
    if (globalDateFilter.type === 'custom') {
      if (key.usage?.['custom']?.tokens !== undefined) return key.usage['custom'].tokens
      if (key.usage?.total?.tokens !== undefined) return key.usage.total.tokens
      return 0
    } else if (globalDateFilter.preset === 'today') {
      return key.usage?.daily?.tokens || 0
    } else if (globalDateFilter.preset === '7days') {
      return key.usage?.['7days']?.tokens ?? 0
    } else if (globalDateFilter.preset === '30days') {
      return key.usage?.['30days']?.tokens ?? key.usage?.monthly?.tokens ?? 0
    } else if (globalDateFilter.preset === 'all') {
      return key.usage?.['all']?.tokens ?? key.usage?.total?.tokens ?? 0
    }
    return key.usage?.total?.tokens || 0
  }

  const getPeriodInputTokens = (key) => {
    if (globalDateFilter.type === 'custom') {
      return key.usage?.['custom']?.inputTokens ?? key.usage?.total?.inputTokens ?? 0
    } else if (globalDateFilter.preset === 'today') {
      return key.usage?.daily?.inputTokens || 0
    } else if (globalDateFilter.preset === '7days') {
      return key.usage?.['7days']?.inputTokens ?? 0
    } else if (globalDateFilter.preset === '30days') {
      return key.usage?.['30days']?.inputTokens ?? key.usage?.monthly?.inputTokens ?? 0
    } else if (globalDateFilter.preset === 'all') {
      return key.usage?.['all']?.inputTokens ?? key.usage?.total?.inputTokens ?? 0
    }
    return key.usage?.total?.inputTokens || 0
  }

  const getPeriodOutputTokens = (key) => {
    if (globalDateFilter.type === 'custom') {
      return key.usage?.['custom']?.outputTokens ?? key.usage?.total?.outputTokens ?? 0
    } else if (globalDateFilter.preset === 'today') {
      return key.usage?.daily?.outputTokens || 0
    } else if (globalDateFilter.preset === '7days') {
      return key.usage?.['7days']?.outputTokens ?? 0
    } else if (globalDateFilter.preset === '30days') {
      return key.usage?.['30days']?.outputTokens ?? key.usage?.monthly?.outputTokens ?? 0
    } else if (globalDateFilter.preset === 'all') {
      return key.usage?.['all']?.outputTokens ?? key.usage?.total?.outputTokens ?? 0
    }
    return key.usage?.total?.outputTokens || 0
  }

  const calculatePeriodCost = (key) => {
    if (!apiKeyModelStats.value[key.id]) return getPeriodCost(key)

    const stats = apiKeyModelStats.value[key.id] || []
    let totalCost = 0

    stats.forEach((stat) => {
      if (stat.cost !== undefined) {
        totalCost += stat.cost
      } else if (stat.formatted?.total) {
        const costStr = stat.formatted.total.replace('$', '').replace(',', '')
        const cost = parseFloat(costStr)
        if (!isNaN(cost)) totalCost += cost
      }
    })

    return totalCost
  }

  // Sorted and filtered API Keys
  const sortedApiKeys = computed(() => {
    let filteredKeys = apiKeys.value
    if (selectedTagFilter.value) {
      filteredKeys = apiKeys.value.filter(
        (key) => key.tags && key.tags.includes(selectedTagFilter.value)
      )
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase().trim()
      filteredKeys = filteredKeys.filter((key) => {
        if (searchMode.value === 'bindingAccount') {
          const bindings = getBindingDisplayStrings(key)
          if (bindings.length === 0) return false
          return bindings.some((text) => text.toLowerCase().includes(keyword))
        }

        const nameMatch = key.name && key.name.toLowerCase().includes(keyword)
        if (isLdapEnabled.value) {
          const ownerMatch =
            key.ownerDisplayName && key.ownerDisplayName.toLowerCase().includes(keyword)
          return nameMatch || ownerMatch
        }
        return nameMatch
      })
    }

    if (!apiKeysSortBy.value) return filteredKeys

    const sorted = [...filteredKeys].sort((a, b) => {
      let aVal = a[apiKeysSortBy.value]
      let bVal = b[apiKeysSortBy.value]

      if (apiKeysSortBy.value === 'status') {
        aVal = a.isActive ? 1 : 0
        bVal = b.isActive ? 1 : 0
      } else if (apiKeysSortBy.value === 'periodRequests') {
        aVal = getPeriodRequests(a)
        bVal = getPeriodRequests(b)
      } else if (apiKeysSortBy.value === 'periodCost') {
        aVal = calculatePeriodCost(a)
        bVal = calculatePeriodCost(b)
      } else if (apiKeysSortBy.value === 'periodTokens') {
        aVal = getPeriodTokens(a)
        bVal = getPeriodTokens(b)
      } else if (apiKeysSortBy.value === 'dailyCost') {
        aVal = a.dailyCost || 0
        bVal = b.dailyCost || 0
      } else if (apiKeysSortBy.value === 'totalCost') {
        aVal = a.totalCost || 0
        bVal = b.totalCost || 0
      } else if (
        apiKeysSortBy.value === 'createdAt' ||
        apiKeysSortBy.value === 'expiresAt' ||
        apiKeysSortBy.value === 'lastUsedAt'
      ) {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }

      if (aVal < bVal) return apiKeysSortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return apiKeysSortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  })

  // Pagination computed
  const totalPages = computed(() => {
    const total = sortedApiKeys.value.length
    return Math.ceil(total / pageSize.value) || 0
  })

  const pageNumbers = computed(() => {
    const pages = []
    const current = currentPage.value
    const total = totalPages.value

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)

      if (current <= 3) end = 5
      else if (current >= total - 2) start = total - 4

      for (let i = start; i <= end; i++) pages.push(i)
    }

    return pages
  })

  const shouldShowFirstPage = computed(() => {
    const pages = pageNumbers.value
    if (pages.length === 0) return false
    return pages[0] > 1
  })

  const shouldShowLastPage = computed(() => {
    const pages = pageNumbers.value
    if (pages.length === 0) return false
    return pages[pages.length - 1] < totalPages.value
  })

  const showLeadingEllipsis = computed(() => {
    const pages = pageNumbers.value
    if (pages.length === 0) return false
    return shouldShowFirstPage.value && pages[0] > 2
  })

  const showTrailingEllipsis = computed(() => {
    const pages = pageNumbers.value
    if (pages.length === 0) return false
    return shouldShowLastPage.value && pages[pages.length - 1] < totalPages.value - 1
  })

  const paginatedApiKeys = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedApiKeys.value.slice(start, end)
  })

  // Load accounts
  const loadAccounts = async () => {
    try {
      const [
        claudeData,
        claudeConsoleData,
        geminiData,
        openaiData,
        openaiResponsesData,
        bedrockData,
        droidData,
        groupsData
      ] = await Promise.all([
        apiClient.get('/admin/claude-accounts'),
        apiClient.get('/admin/claude-console-accounts'),
        apiClient.get('/admin/gemini-accounts'),
        apiClient.get('/admin/openai-accounts'),
        apiClient.get('/admin/openai-responses-accounts'),
        apiClient.get('/admin/bedrock-accounts'),
        apiClient.get('/admin/droid-accounts'),
        apiClient.get('/admin/account-groups')
      ])

      const claudeAccounts = []

      if (claudeData.success) {
        claudeData.data?.forEach((account) => {
          claudeAccounts.push({
            ...account,
            platform: 'claude-oauth',
            isDedicated: account.accountType === 'dedicated'
          })
        })
      }

      if (claudeConsoleData.success) {
        claudeConsoleData.data?.forEach((account) => {
          claudeAccounts.push({
            ...account,
            platform: 'claude-console',
            isDedicated: account.accountType === 'dedicated'
          })
        })
      }

      accounts.value.claude = claudeAccounts

      if (geminiData.success) {
        accounts.value.gemini = (geminiData.data || []).map((account) => ({
          ...account,
          isDedicated: account.accountType === 'dedicated'
        }))
      }

      if (openaiData.success) {
        accounts.value.openai = (openaiData.data || []).map((account) => ({
          ...account,
          isDedicated: account.accountType === 'dedicated'
        }))
      }

      if (openaiResponsesData.success) {
        accounts.value.openaiResponses = (openaiResponsesData.data || []).map((account) => ({
          ...account,
          isDedicated: account.accountType === 'dedicated'
        }))
      }

      if (bedrockData.success) {
        accounts.value.bedrock = (bedrockData.data || []).map((account) => ({
          ...account,
          isDedicated: account.accountType === 'dedicated'
        }))
      }

      if (droidData.success) {
        accounts.value.droid = (droidData.data || []).map((account) => ({
          ...account,
          platform: 'droid',
          isDedicated: account.accountType === 'dedicated'
        }))
      }

      if (groupsData.success) {
        const allGroups = groupsData.data || []
        accounts.value.claudeGroups = allGroups.filter((g) => g.platform === 'claude')
        accounts.value.geminiGroups = allGroups.filter((g) => g.platform === 'gemini')
        accounts.value.openaiGroups = allGroups.filter((g) => g.platform === 'openai')
        accounts.value.droidGroups = allGroups.filter((g) => g.platform === 'droid')
      }
    } catch (error) {
      // Silent error
    }
  }

  // Load API Keys
  const loadApiKeys = async () => {
    apiKeysLoading.value = true
    try {
      const normalizeApiKeysResponse = (resp) => {
        const payload = resp?.data
        // 支持数组格式或 { items, availableTags } 格式
        const items = Array.isArray(payload) ? payload : payload?.items || []
        const tags =
          Array.isArray(payload?.availableTags) && payload?.availableTags.length > 0
            ? payload.availableTags
            : []
        return { items, tags }
      }

      let params = {}
      if (
        globalDateFilter.type === 'custom' &&
        globalDateFilter.customStart &&
        globalDateFilter.customEnd
      ) {
        params.startDate = globalDateFilter.customStart
        params.endDate = globalDateFilter.customEnd
        params.timeRange = 'custom'
      } else if (globalDateFilter.preset === 'all') {
        params.timeRange = 'all'
      } else {
        params.timeRange = globalDateFilter.preset
      }

      const queryString = new URLSearchParams(params).toString()
      const data = await apiClient.get(`/admin/api-keys?${queryString}`)
      if (data.success) {
        const { items, tags } = normalizeApiKeysResponse(data)
        apiKeys.value = items
        const tagsSet = new Set()
        if (items.length > 0) {
          items.forEach((key) => {
            if (key.tags && Array.isArray(key.tags)) {
              key.tags.forEach((tag) => tagsSet.add(tag))
            }
          })
        }
        // 后端返回的 availableTags 优先，其次从列表计算
        if (tags.length > 0) {
          tags.forEach((t) => tagsSet.add(t))
        }
        availableTags.value = Array.from(tagsSet).sort()
      }
    } catch (error) {
      showToast('加载 API Keys 失败', 'error')
    } finally {
      apiKeysLoading.value = false
    }
  }

  // Load deleted API Keys
  const loadDeletedApiKeys = async () => {
    deletedApiKeysLoading.value = true
    try {
      const data = await apiClient.get('/admin/api-keys/deleted')
      if (data.success) {
        deletedApiKeys.value = data.apiKeys || []
      }
    } catch (error) {
      showToast('加载已删除的 API Keys 失败', 'error')
    } finally {
      deletedApiKeysLoading.value = false
    }
  }

  // Sort API Keys
  const sortApiKeys = (field) => {
    if (apiKeysSortBy.value === field) {
      apiKeysSortOrder.value = apiKeysSortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      apiKeysSortBy.value = field
      apiKeysSortOrder.value = 'asc'
    }
  }

  // Date filter functions
  const setGlobalDateFilterPreset = (preset) => {
    globalDateFilter.preset = preset

    if (preset === 'custom') {
      globalDateFilter.type = 'custom'
      if (!globalDateFilter.customRange) {
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 6)

        const formatDate = (date) => {
          return (
            date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0') +
            ' 00:00:00'
          )
        }

        globalDateFilter.customRange = [formatDate(startDate), formatDate(today)]
        globalDateFilter.customStart = startDate.toISOString().split('T')[0]
        globalDateFilter.customEnd = today.toISOString().split('T')[0]
      }
    } else if (preset === 'all') {
      globalDateFilter.type = 'preset'
      globalDateFilter.customStart = null
      globalDateFilter.customEnd = null
    } else {
      globalDateFilter.type = 'preset'
      const today = new Date()
      const startDate = new Date(today)

      if (preset === 'today') {
        startDate.setHours(0, 0, 0, 0)
      } else if (preset === '7days') {
        startDate.setDate(today.getDate() - 6)
      } else if (preset === '30days') {
        startDate.setDate(today.getDate() - 29)
      }

      globalDateFilter.customStart = startDate.toISOString().split('T')[0]
      globalDateFilter.customEnd = today.toISOString().split('T')[0]
    }

    loadApiKeys()
  }

  const handleTimeRangeChange = (value) => {
    setGlobalDateFilterPreset(value)
  }

  const onGlobalCustomDateRangeChange = (value) => {
    if (value && value.length === 2) {
      globalDateFilter.type = 'custom'
      globalDateFilter.preset = 'custom'
      globalDateFilter.customRange = value
      globalDateFilter.customStart = value[0].split(' ')[0]
      globalDateFilter.customEnd = value[1].split(' ')[0]
      loadApiKeys()
    } else if (value === null) {
      setGlobalDateFilterPreset('today')
    }
  }

  // API Key date filter functions
  const initApiKeyDateFilter = (keyId) => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)

    apiKeyDateFilters.value[keyId] = {
      type: 'preset',
      preset: 'today',
      customStart: today.toISOString().split('T')[0],
      customEnd: today.toISOString().split('T')[0],
      customRange: null,
      presetOptions: [
        { value: 'today', label: '今日', days: 1 },
        { value: '7days', label: '7天', days: 7 },
        { value: '30days', label: '30天', days: 30 },
        { value: 'custom', label: '自定义', days: -1 }
      ]
    }
  }

  const getApiKeyDateFilter = (keyId) => {
    if (!apiKeyDateFilters.value[keyId]) {
      initApiKeyDateFilter(keyId)
    }
    return apiKeyDateFilters.value[keyId]
  }

  const setApiKeyDateFilterPreset = (preset, keyId) => {
    const filter = getApiKeyDateFilter(keyId)
    filter.type = 'preset'
    filter.preset = preset

    const option = filter.presetOptions.find((opt) => opt.value === preset)
    if (option) {
      if (preset === 'custom') {
        filter.type = 'custom'
        if (!filter.customRange) {
          const today = new Date()
          const startDate = new Date(today)
          startDate.setDate(today.getDate() - 6)

          const formatDate = (date) => {
            return (
              date.getFullYear() +
              '-' +
              String(date.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(date.getDate()).padStart(2, '0') +
              ' 00:00:00'
            )
          }

          filter.customRange = [formatDate(startDate), formatDate(today)]
          filter.customStart = startDate.toISOString().split('T')[0]
          filter.customEnd = today.toISOString().split('T')[0]
        }
      } else {
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - (option.days - 1))

        filter.customStart = startDate.toISOString().split('T')[0]
        filter.customEnd = today.toISOString().split('T')[0]

        const formatDate = (date) => {
          return (
            date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0') +
            ' 00:00:00'
          )
        }

        filter.customRange = [formatDate(startDate), formatDate(today)]
      }
    }

    loadApiKeyModelStats(keyId, true)
  }

  const onApiKeyCustomDateRangeChange = (keyId, value) => {
    const filter = getApiKeyDateFilter(keyId)

    if (value && value.length === 2) {
      filter.type = 'custom'
      filter.preset = 'custom'
      filter.customRange = value
      filter.customStart = value[0].split(' ')[0]
      filter.customEnd = value[1].split(' ')[0]

      loadApiKeyModelStats(keyId, true)
    } else if (value === null) {
      setApiKeyDateFilterPreset('7days', keyId)
    }
  }

  const disabledDate = (date) => {
    return date > new Date()
  }

  const resetApiKeyDateFilter = (keyId) => {
    const filter = getApiKeyDateFilter(keyId)

    filter.type = 'preset'
    filter.preset = 'today'

    const today = new Date()
    const startDate = new Date(today)
    startDate.setHours(0, 0, 0, 0)

    filter.customStart = today.toISOString().split('T')[0]
    filter.customEnd = today.toISOString().split('T')[0]
    filter.customRange = null

    loadApiKeyModelStats(keyId, true)
    showToast('已重置筛选条件并刷新数据', 'info')
  }

  // Model stats functions
  const toggleApiKeyModelStats = async (keyId) => {
    if (!expandedApiKeys.value[keyId]) {
      expandedApiKeys.value[keyId] = true
      if (!apiKeyDateFilters.value[keyId]) {
        initApiKeyDateFilter(keyId)
      }
      await loadApiKeyModelStats(keyId, true)
    } else {
      expandedApiKeys.value[keyId] = false
    }
  }

  const loadApiKeyModelStats = async (keyId, forceReload = false) => {
    if (!forceReload && apiKeyModelStats.value[keyId]?.length > 0) {
      return
    }

    const filter = getApiKeyDateFilter(keyId)

    try {
      let url = `/admin/api-keys/${keyId}/model-stats`
      const params = new URLSearchParams()

      if (filter.customStart && filter.customEnd) {
        params.append('startDate', filter.customStart)
        params.append('endDate', filter.customEnd)
        params.append('period', 'custom')
      } else {
        const period =
          filter.preset === 'today' ? 'daily' : filter.preset === '7days' ? 'daily' : 'monthly'
        params.append('period', period)
      }

      url += '?' + params.toString()

      const data = await apiClient.get(url)
      if (data.success) {
        apiKeyModelStats.value[keyId] = data.data || []
      }
    } catch (error) {
      showToast('加载模型统计失败', 'error')
      apiKeyModelStats.value[keyId] = []
    }
  }

  const calculateApiKeyModelPercentage = (value, stats) => {
    const total = stats.reduce((sum, stat) => sum + (stat.allTokens || 0), 0)
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const calculateModelCost = (stat) => {
    if (stat.formatted?.total) return stat.formatted.total
    if (stat.cost !== undefined) return `$${stat.cost.toFixed(6)}`
    return '$0.000000'
  }

  // Clear search
  const clearSearch = () => {
    searchKeyword.value = ''
    currentPage.value = 1
  }

  // Watch for page size changes
  watch(pageSize, (newSize) => {
    localStorage.setItem('apiKeysPageSize', newSize.toString())
  })

  return {
    // State
    apiKeys,
    apiKeysLoading,
    deletedApiKeys,
    deletedApiKeysLoading,
    accounts,
    isLdapEnabled,

    // Sorting
    apiKeysSortBy,
    apiKeysSortOrder,
    sortApiKeys,

    // Expanded rows and model stats
    expandedApiKeys,
    apiKeyModelStats,
    apiKeyDateFilters,
    toggleApiKeyModelStats,
    loadApiKeyModelStats,
    calculateApiKeyModelPercentage,
    calculateModelCost,

    // Tags
    availableTags,
    selectedTagFilter,
    tagOptions,
    selectedTagCount,

    // Search
    searchKeyword,
    searchMode,
    searchModeOptions,
    clearSearch,

    // Pagination
    currentPage,
    pageSize,
    pageSizeOptions,
    totalPages,
    pageNumbers,
    shouldShowFirstPage,
    shouldShowLastPage,
    showLeadingEllipsis,
    showTrailingEllipsis,
    paginatedApiKeys,
    sortedApiKeys,

    // Date filter
    globalDateFilter,
    defaultTime,
    timeRangeDropdownOptions,
    handleTimeRangeChange,
    onGlobalCustomDateRangeChange,
    disabledDate,

    // API Key date filter
    getApiKeyDateFilter,
    setApiKeyDateFilterPreset,
    onApiKeyCustomDateRangeChange,
    resetApiKeyDateFilter,

    // Period data getters
    getPeriodRequests,
    getPeriodCost,
    getPeriodTokens,
    getPeriodInputTokens,
    getPeriodOutputTokens,
    calculatePeriodCost,

    // Binding info
    getBoundAccountName,
    getClaudeBindingInfo,
    getGeminiBindingInfo,
    getOpenAIBindingInfo,
    getBedrockBindingInfo,
    getDroidBindingInfo,
    getBindingDisplayStrings,

    // Load functions
    loadAccounts,
    loadApiKeys,
    loadDeletedApiKeys
  }
}
