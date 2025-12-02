import { ref, computed, watch } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

export function useAccountsData() {
  // Data states
  const accounts = ref([])
  const accountsLoading = ref(false)
  const accountSortBy = ref('name')
  const accountsSortBy = ref('')
  const accountsSortOrder = ref('asc')
  const apiKeys = ref([])
  const accountGroups = ref([])
  const groupFilter = ref('all')
  const platformFilter = ref('all')
  const searchKeyword = ref('')

  // Pagination
  const PAGE_SIZE_STORAGE_KEY = 'accountsPageSize'
  const getInitialPageSize = () => {
    const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
    if (saved) {
      const parsedSize = parseInt(saved, 10)
      if ([10, 20, 50, 100].includes(parsedSize)) {
        return parsedSize
      }
    }
    return 10
  }
  const pageSizeOptions = [10, 20, 50, 100]
  const pageSize = ref(getInitialPageSize())
  const currentPage = ref(1)

  // Cache flags
  const apiKeysLoaded = ref(false)
  const groupsLoaded = ref(false)
  const groupMembersLoaded = ref(false)
  const accountGroupMap = ref(new Map())

  // Dropdown options
  const sortOptions = ref([
    { value: 'name', label: '按名称排序', icon: 'Type' },
    { value: 'dailyTokens', label: '按今日Token排序', icon: 'Coins' },
    { value: 'dailyRequests', label: '按今日请求数排序', icon: 'BarChart3' },
    { value: 'totalTokens', label: '按总Token排序', icon: 'Database' },
    { value: 'lastUsed', label: '按最后使用排序', icon: 'Clock' }
  ])

  const platformOptions = ref([
    { value: 'all', label: '所有平台', icon: 'Globe' },
    { value: 'claude', label: 'Claude', icon: 'Brain' },
    { value: 'claude-console', label: 'Claude Console', icon: 'Terminal' },
    { value: 'gemini', label: 'Gemini', icon: 'Sparkles' },
    { value: 'openai', label: 'OpenAi', icon: 'Zap' },
    { value: 'azure_openai', label: 'Azure OpenAI', icon: 'Cloud' },
    { value: 'bedrock', label: 'Bedrock', icon: 'Cloud' },
    { value: 'openai-responses', label: 'OpenAI-Responses', icon: 'Server' },
    { value: 'ccr', label: 'CCR', icon: 'GitBranch' },
    { value: 'droid', label: 'Droid', icon: 'Bot' }
  ])

  const groupOptions = computed(() => {
    const options = [
      { value: 'all', label: '所有账户', icon: 'Globe' },
      { value: 'ungrouped', label: '未分组账户', icon: 'User' }
    ]
    accountGroups.value.forEach((group) => {
      options.push({
        value: group.id,
        label: `${group.name} (${group.platform === 'claude' ? 'Claude' : group.platform === 'gemini' ? 'Gemini' : group.platform === 'openai' ? 'OpenAI' : 'Droid'})`,
        icon:
          group.platform === 'claude'
            ? 'Brain'
            : group.platform === 'gemini'
              ? 'Sparkles'
              : group.platform === 'openai'
                ? 'Zap'
                : 'Bot'
      })
    })
    return options
  })

  // Search helpers
  const collectAccountSearchableStrings = (account) => {
    const values = new Set()
    const baseFields = [
      account?.name,
      account?.email,
      account?.accountName,
      account?.owner,
      account?.ownerName,
      account?.ownerDisplayName,
      account?.displayName,
      account?.username,
      account?.identifier,
      account?.alias,
      account?.title,
      account?.label
    ]

    baseFields.forEach((field) => {
      if (typeof field === 'string') {
        const trimmed = field.trim()
        if (trimmed) values.add(trimmed)
      }
    })

    if (Array.isArray(account?.groupInfos)) {
      account.groupInfos.forEach((group) => {
        if (group && typeof group.name === 'string') {
          const trimmed = group.name.trim()
          if (trimmed) values.add(trimmed)
        }
      })
    }

    Object.entries(account || {}).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const lowerKey = key.toLowerCase()
        if (lowerKey.includes('name') || lowerKey.includes('email')) {
          const trimmed = value.trim()
          if (trimmed) values.add(trimmed)
        }
      }
    })

    return Array.from(values)
  }

  const accountMatchesKeyword = (account, normalizedKeyword) => {
    if (!normalizedKeyword) return true
    return collectAccountSearchableStrings(account).some((value) =>
      value.toLowerCase().includes(normalizedKeyword)
    )
  }

  // Computed: sorted accounts
  const sortedAccounts = computed(() => {
    let sourceAccounts = accounts.value

    const keyword = searchKeyword.value.trim()
    if (keyword) {
      const normalizedKeyword = keyword.toLowerCase()
      sourceAccounts = sourceAccounts.filter((account) =>
        accountMatchesKeyword(account, normalizedKeyword)
      )
    }

    if (!accountsSortBy.value) return sourceAccounts

    const sorted = [...sourceAccounts].sort((a, b) => {
      let aVal = a[accountsSortBy.value]
      let bVal = b[accountsSortBy.value]

      if (accountsSortBy.value === 'dailyTokens') {
        aVal = a.usage?.daily?.allTokens || 0
        bVal = b.usage?.daily?.allTokens || 0
      } else if (accountsSortBy.value === 'dailyRequests') {
        aVal = a.usage?.daily?.requests || 0
        bVal = b.usage?.daily?.requests || 0
      } else if (accountsSortBy.value === 'totalTokens') {
        aVal = a.usage?.total?.allTokens || 0
        bVal = b.usage?.total?.allTokens || 0
      }

      if (accountsSortBy.value === 'lastUsed') {
        aVal = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
        bVal = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
      }

      if (accountsSortBy.value === 'status') {
        aVal = a.isActive ? 1 : 0
        bVal = b.isActive ? 1 : 0
      }

      if (aVal < bVal) return accountsSortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return accountsSortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  })

  // Pagination computed
  const totalPages = computed(() => {
    const total = sortedAccounts.value.length
    return Math.ceil(total / pageSize.value) || 0
  })

  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const pages = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)

      if (current <= 3) {
        end = 5
      } else if (current >= total - 2) {
        start = total - 4
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
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

  const paginatedAccounts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sortedAccounts.value.slice(start, end)
  })

  // Normalize proxy data
  function normalizeProxyData(proxy) {
    if (!proxy) return null

    let proxyObject = proxy
    if (typeof proxy === 'string') {
      try {
        proxyObject = JSON.parse(proxy)
      } catch (error) {
        return null
      }
    }

    if (!proxyObject || typeof proxyObject !== 'object') return null

    const candidate =
      proxyObject.proxy && typeof proxyObject.proxy === 'object' ? proxyObject.proxy : proxyObject

    const host =
      typeof candidate.host === 'string'
        ? candidate.host.trim()
        : candidate.host !== undefined && candidate.host !== null
          ? String(candidate.host).trim()
          : ''

    const port =
      candidate.port !== undefined && candidate.port !== null ? String(candidate.port).trim() : ''

    if (!host || !port) return null

    const type =
      typeof candidate.type === 'string' && candidate.type.trim() ? candidate.type.trim() : 'socks5'

    const username =
      typeof candidate.username === 'string'
        ? candidate.username
        : candidate.username !== undefined && candidate.username !== null
          ? String(candidate.username)
          : ''

    const password =
      typeof candidate.password === 'string'
        ? candidate.password
        : candidate.password !== undefined && candidate.password !== null
          ? String(candidate.password)
          : ''

    return { type, host, port, username, password }
  }

  // Load API Keys
  const loadApiKeys = async (forceReload = false) => {
    if (!forceReload && apiKeysLoaded.value) return

    try {
      const response = await apiClient.get('/admin/api-keys')
      if (response.success) {
        const payload = response?.data
        const items = Array.isArray(payload) ? payload : payload?.items || []
        apiKeys.value = items
        apiKeysLoaded.value = true
      }
    } catch (error) {
      // Silent
    }
  }

  // Load account groups
  const loadAccountGroups = async (forceReload = false) => {
    if (!forceReload && groupsLoaded.value) return

    try {
      const response = await apiClient.get('/admin/account-groups')
      if (response.success) {
        accountGroups.value = response.data || []
        groupsLoaded.value = true
      }
    } catch (error) {
      // Silent
    }
  }

  // Clear cache
  const clearCache = () => {
    apiKeysLoaded.value = false
    groupsLoaded.value = false
    groupMembersLoaded.value = false
    accountGroupMap.value.clear()
  }

  // Load Claude usage
  const loadClaudeUsage = async () => {
    try {
      const response = await apiClient.get('/admin/claude-accounts/usage')
      if (response.success && response.data) {
        const usageMap = response.data
        accounts.value = accounts.value.map((account) => {
          if (account.platform === 'claude' && usageMap[account.id]) {
            return { ...account, claudeUsage: usageMap[account.id] }
          }
          return account
        })
      }
    } catch (error) {
      console.debug('Failed to load Claude usage data:', error)
    }
  }

  // Main load accounts function
  const loadAccounts = async (forceReload = false) => {
    accountsLoading.value = true
    try {
      const params = {}
      if (platformFilter.value !== 'all') {
        params.platform = platformFilter.value
      }
      if (groupFilter.value !== 'all') {
        params.groupId = groupFilter.value
      }

      const requests = []

      if (platformFilter.value === 'all') {
        requests.push(
          apiClient.get('/admin/claude-accounts', { params }),
          apiClient.get('/admin/claude-console-accounts', { params }),
          apiClient.get('/admin/bedrock-accounts', { params }),
          apiClient.get('/admin/gemini-accounts', { params }),
          apiClient.get('/admin/openai-accounts', { params }),
          apiClient.get('/admin/azure-openai-accounts', { params }),
          apiClient.get('/admin/openai-responses-accounts', { params }),
          apiClient.get('/admin/ccr-accounts', { params }),
          apiClient.get('/admin/droid-accounts', { params })
        )
      } else {
        const emptyResponse = Promise.resolve({ success: true, data: [] })
        const platformRequests = {
          claude: [
            apiClient.get('/admin/claude-accounts', { params }),
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse
          ],
          'claude-console': [
            emptyResponse,
            apiClient.get('/admin/claude-console-accounts', { params }),
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse
          ],
          bedrock: [
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/bedrock-accounts', { params }),
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse
          ],
          gemini: [
            emptyResponse,
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/gemini-accounts', { params }),
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse
          ],
          openai: [
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/openai-accounts', { params }),
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse
          ],
          azure_openai: [
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/azure-openai-accounts', { params }),
            emptyResponse,
            emptyResponse,
            emptyResponse
          ],
          'openai-responses': [
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/openai-responses-accounts', { params }),
            emptyResponse,
            emptyResponse
          ],
          ccr: [
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/ccr-accounts', { params }),
            emptyResponse
          ],
          droid: [
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            emptyResponse,
            apiClient.get('/admin/droid-accounts', { params })
          ]
        }

        requests.push(...(platformRequests[platformFilter.value] || Array(9).fill(emptyResponse)))
      }

      await Promise.all([loadApiKeys(forceReload), loadAccountGroups(forceReload)])

      const [
        claudeData,
        claudeConsoleData,
        bedrockData,
        geminiData,
        openaiData,
        azureOpenaiData,
        openaiResponsesData,
        ccrData,
        droidData
      ] = await Promise.all(requests)

      const allAccounts = []

      const extractItems = (resp) => {
        if (!resp || !resp.success) return []
        const payload = resp.data
        if (Array.isArray(payload)) return payload
        if (payload?.items) return payload.items
        if (payload?.data) return payload.data
        return []
      }

      const processAccounts = (data, platform, boundKeyField) => {
        const items = extractItems(data)
        if (items.length === 0) return
        const processed = items.map((acc) => {
          let boundApiKeysCount = 0
          if (boundKeyField) {
            if (platform === 'openai-responses') {
              boundApiKeysCount = apiKeys.value.filter(
                (key) => key.openaiAccountId === `responses:${acc.id}`
              ).length
            } else {
              boundApiKeysCount = apiKeys.value.filter((key) => key[boundKeyField] === acc.id)
            }
          }
          return { ...acc, platform, boundApiKeysCount }
        })
        allAccounts.push(...processed)
      }

      processAccounts(claudeData, 'claude', 'claudeAccountId')
      processAccounts(claudeConsoleData, 'claude-console', 'claudeConsoleAccountId')
      processAccounts(bedrockData, 'bedrock', null)
      processAccounts(geminiData, 'gemini', 'geminiAccountId')
      processAccounts(openaiData, 'openai', 'openaiAccountId')
      processAccounts(azureOpenaiData, 'azure_openai', 'azureOpenaiAccountId')
      processAccounts(openaiResponsesData, 'openai-responses', 'openaiAccountId')

      processAccounts(ccrData, 'ccr', null)
      processAccounts(droidData, 'droid', null)

      // Filter by group
      let filteredAccounts = allAccounts
      if (groupFilter.value !== 'all') {
        if (groupFilter.value === 'ungrouped') {
          filteredAccounts = allAccounts.filter(
            (account) => !account.groupInfos || account.groupInfos.length === 0
          )
        } else {
          filteredAccounts = allAccounts.filter((account) => {
            if (!account.groupInfos || account.groupInfos.length === 0) return false
            return account.groupInfos.some((group) => group.id === groupFilter.value)
          })
        }
      }

      // Normalize proxy
      filteredAccounts = filteredAccounts.map((account) => {
        const proxyConfig = normalizeProxyData(account.proxyConfig || account.proxy)
        return { ...account, proxyConfig: proxyConfig || null }
      })

      accounts.value = filteredAccounts

      // Load Claude usage async
      if (filteredAccounts.some((acc) => acc.platform === 'claude')) {
        loadClaudeUsage().catch((err) => {
          console.debug('Claude usage loading failed:', err)
        })
      }
    } catch (error) {
      showToast('加载账户失败', 'error')
    } finally {
      accountsLoading.value = false
    }
  }

  // Sort accounts
  const sortAccounts = (field) => {
    if (field) {
      if (accountsSortBy.value === field) {
        accountsSortOrder.value = accountsSortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        accountsSortBy.value = field
        accountsSortOrder.value = 'asc'
      }
    }
  }

  // Filter methods
  const filterByPlatform = () => {
    currentPage.value = 1
    loadAccounts()
  }

  const filterByGroup = () => {
    currentPage.value = 1
    loadAccounts()
  }

  const clearSearch = () => {
    searchKeyword.value = ''
    currentPage.value = 1
  }

  // Watch pageSize for localStorage
  watch(pageSize, (newSize) => {
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, newSize.toString())
  })

  // Watch sortBy dropdown
  watch(accountSortBy, (newVal) => {
    const fieldMap = {
      name: 'name',
      dailyTokens: 'dailyTokens',
      dailyRequests: 'dailyRequests',
      totalTokens: 'totalTokens',
      lastUsed: 'lastUsed'
    }
    if (fieldMap[newVal]) {
      sortAccounts(fieldMap[newVal])
    }
  })

  // Ensure currentPage is valid
  watch(
    () => sortedAccounts.value.length,
    () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value || 1
      }
    }
  )

  return {
    // State
    accounts,
    accountsLoading,
    accountSortBy,
    accountsSortBy,
    accountsSortOrder,
    apiKeys,
    accountGroups,
    groupFilter,
    platformFilter,
    searchKeyword,
    pageSize,
    pageSizeOptions,
    currentPage,
    apiKeysLoaded,
    groupMembersLoaded,

    // Options
    sortOptions,
    platformOptions,
    groupOptions,

    // Computed
    sortedAccounts,
    totalPages,
    pageNumbers,
    shouldShowFirstPage,
    shouldShowLastPage,
    showLeadingEllipsis,
    showTrailingEllipsis,
    paginatedAccounts,

    // Methods
    loadAccounts,
    loadApiKeys,
    loadAccountGroups,
    clearCache,
    sortAccounts,
    filterByPlatform,
    filterByGroup,
    clearSearch,
    normalizeProxyData
  }
}
