import { ref } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'
import { useConfirm } from '@/composables/useConfirm'

export function useAccountsActions(accountsData) {
  const { showConfirmModal, confirmOptions, showConfirm, handleConfirm, handleCancel } =
    useConfirm()

  // Modal states
  const showCreateAccountModal = ref(false)
  const newAccountPlatform = ref(null)
  const showEditAccountModal = ref(false)
  const editingAccount = ref(null)

  // Multi-select states
  const selectedAccounts = ref([])
  const selectAllChecked = ref(false)
  const isIndeterminate = ref(false)
  const showCheckboxes = ref(false)

  // Usage modal states
  const showAccountUsageModal = ref(false)
  const accountUsageLoading = ref(false)
  const selectedAccountForUsage = ref(null)
  const accountUsageHistory = ref([])
  const accountUsageSummary = ref({})
  const accountUsageOverview = ref({})
  const accountUsageGeneratedAt = ref('')

  // Expiry edit states
  const editingExpiryAccount = ref(null)
  const expiryEditModalRef = ref(null)

  const supportedUsagePlatforms = [
    'claude',
    'claude-console',
    'openai',
    'openai-responses',
    'gemini',
    'droid'
  ]

  // Selection methods
  const updateSelectAllState = () => {
    const currentIds = accountsData.paginatedAccounts.value.map((account) => account.id)
    const selectedInCurrentPage = currentIds.filter((id) =>
      selectedAccounts.value.includes(id)
    ).length
    const totalInCurrentPage = currentIds.length

    if (selectedInCurrentPage === 0) {
      selectAllChecked.value = false
      isIndeterminate.value = false
    } else if (selectedInCurrentPage === totalInCurrentPage) {
      selectAllChecked.value = true
      isIndeterminate.value = false
    } else {
      selectAllChecked.value = false
      isIndeterminate.value = true
    }
  }

  const handleSelectAll = () => {
    if (selectAllChecked.value) {
      accountsData.paginatedAccounts.value.forEach((account) => {
        if (!selectedAccounts.value.includes(account.id)) {
          selectedAccounts.value.push(account.id)
        }
      })
    } else {
      const currentIds = new Set(accountsData.paginatedAccounts.value.map((account) => account.id))
      selectedAccounts.value = selectedAccounts.value.filter((id) => !currentIds.has(id))
    }
    updateSelectAllState()
  }

  const toggleSelectionMode = () => {
    showCheckboxes.value = !showCheckboxes.value
    if (!showCheckboxes.value) {
      selectedAccounts.value = []
      selectAllChecked.value = false
      isIndeterminate.value = false
    } else {
      updateSelectAllState()
    }
  }

  const cleanupSelectedAccounts = () => {
    const validIds = new Set(accountsData.accounts.value.map((account) => account.id))
    selectedAccounts.value = selectedAccounts.value.filter((id) => validIds.has(id))
    updateSelectAllState()
  }

  // Modal methods
  const openCreateAccountModal = () => {
    newAccountPlatform.value = null
    showCreateAccountModal.value = true
  }

  const closeCreateAccountModal = () => {
    showCreateAccountModal.value = false
    newAccountPlatform.value = null
  }

  const editAccount = (account) => {
    editingAccount.value = account
    showEditAccountModal.value = true
  }

  const handleCreateSuccess = () => {
    showCreateAccountModal.value = false
    showToast('账户创建成功', 'success')
    accountsData.clearCache()
    accountsData.loadAccounts()
  }

  const handleEditSuccess = () => {
    showEditAccountModal.value = false
    showToast('账户更新成功', 'success')
    accountsData.groupMembersLoaded.value = false
    accountsData.loadAccounts()
  }

  // Usage modal
  const canViewUsage = (account) => !!account && supportedUsagePlatforms.includes(account.platform)

  const openAccountUsageModal = async (account) => {
    if (!canViewUsage(account)) {
      showToast('该账户类型暂不支持查看详情', 'warning')
      return
    }

    selectedAccountForUsage.value = account
    showAccountUsageModal.value = true
    accountUsageLoading.value = true
    accountUsageHistory.value = []
    accountUsageSummary.value = {}
    accountUsageOverview.value = {}
    accountUsageGeneratedAt.value = ''

    try {
      const response = await apiClient.get(
        `/admin/accounts/${account.id}/usage-history?platform=${account.platform}&days=30`
      )

      if (response.success) {
        const data = response.data || {}
        accountUsageHistory.value = data.history || []
        accountUsageSummary.value = data.summary || {}
        accountUsageOverview.value = data.overview || {}
        accountUsageGeneratedAt.value = data.generatedAt || ''
      } else {
        showToast(response.error || '加载账号使用详情失败', 'error')
      }
    } catch (error) {
      showToast('加载账号使用详情失败', 'error')
    } finally {
      accountUsageLoading.value = false
    }
  }

  const closeAccountUsageModal = () => {
    showAccountUsageModal.value = false
    accountUsageLoading.value = false
    selectedAccountForUsage.value = null
  }

  // Get bound API keys for account
  const getBoundApiKeysForAccount = (account) => {
    if (!account || !account.id) return []
    return accountsData.apiKeys.value.filter((key) => {
      const accountId = account.id
      return (
        key.claudeAccountId === accountId ||
        key.claudeConsoleAccountId === accountId ||
        key.geminiAccountId === accountId ||
        key.openaiAccountId === accountId ||
        key.azureOpenaiAccountId === accountId ||
        key.openaiAccountId === `responses:${accountId}`
      )
    })
  }

  // Resolve delete endpoint
  const resolveAccountDeleteEndpoint = (account) => {
    const endpoints = {
      claude: `/admin/claude-accounts/${account.id}`,
      'claude-console': `/admin/claude-console-accounts/${account.id}`,
      bedrock: `/admin/bedrock-accounts/${account.id}`,
      openai: `/admin/openai-accounts/${account.id}`,
      azure_openai: `/admin/azure-openai-accounts/${account.id}`,
      'openai-responses': `/admin/openai-responses-accounts/${account.id}`,
      ccr: `/admin/ccr-accounts/${account.id}`,
      gemini: `/admin/gemini-accounts/${account.id}`,
      droid: `/admin/droid-accounts/${account.id}`
    }
    return endpoints[account.platform] || null
  }

  // Perform deletion
  const performAccountDeletion = async (account) => {
    const endpoint = resolveAccountDeleteEndpoint(account)
    if (!endpoint) {
      return { success: false, message: '不支持的账户类型' }
    }

    try {
      const data = await apiClient.delete(endpoint)
      if (data.success) {
        return { success: true, data }
      }
      return { success: false, message: data.message || '删除失败' }
    } catch (error) {
      const message = error.response?.data?.message || error.message || '删除失败'
      return { success: false, message }
    }
  }

  // Delete account
  const deleteAccount = async (account) => {
    const boundKeys = getBoundApiKeysForAccount(account)
    const boundKeysCount = boundKeys.length

    let confirmMessage = `确定要删除账户 "${account.name}" 吗？`
    if (boundKeysCount > 0) {
      confirmMessage += `\n\n⚠️ 注意：此账号有 ${boundKeysCount} 个 API Key 绑定。`
      confirmMessage += `\n删除后，这些 API Key 将自动切换为共享池模式。`
    }
    confirmMessage += '\n\n此操作不可恢复。'

    const confirmed = await showConfirm('删除账户', confirmMessage, '删除', '取消')

    if (!confirmed) return

    const result = await performAccountDeletion(account)

    if (result.success) {
      const data = result.data
      let toastMessage = '账户已成功删除'
      if (data?.unboundKeys > 0) {
        toastMessage += `，${data.unboundKeys} 个 API Key 已切换为共享池模式`
      }
      showToast(toastMessage, 'success')

      selectedAccounts.value = selectedAccounts.value.filter((id) => id !== account.id)
      updateSelectAllState()

      accountsData.groupMembersLoaded.value = false
      accountsData.apiKeysLoaded.value = false
      accountsData.loadAccounts()
      accountsData.loadApiKeys(true)
    } else {
      showToast(result.message || '删除失败', 'error')
    }
  }

  // Batch delete
  const batchDeleteAccounts = async () => {
    if (selectedAccounts.value.length === 0) {
      showToast('请先选择要删除的账户', 'warning')
      return
    }

    const accountsMap = new Map(accountsData.accounts.value.map((item) => [item.id, item]))
    const targets = selectedAccounts.value
      .map((id) => accountsMap.get(id))
      .filter((account) => !!account)

    if (targets.length === 0) {
      showToast('选中的账户已不存在', 'warning')
      selectedAccounts.value = []
      updateSelectAllState()
      return
    }

    let confirmMessage = `确定要删除选中的 ${targets.length} 个账户吗？此操作不可恢复。`
    const boundInfo = targets
      .map((account) => ({ account, boundKeys: getBoundApiKeysForAccount(account) }))
      .filter((item) => item.boundKeys.length > 0)

    if (boundInfo.length > 0) {
      confirmMessage += '\n\n⚠️ 以下账户存在绑定的 API Key，将自动解绑：'
      boundInfo.forEach(({ account, boundKeys }) => {
        const displayName = account.name || account.email || account.accountName || account.id
        confirmMessage += `\n- ${displayName}: ${boundKeys.length} 个`
      })
      confirmMessage += '\n删除后，这些 API Key 将切换为共享池模式。'
    }

    confirmMessage += '\n\n请再次确认是否继续。'

    const confirmed = await showConfirm('批量删除账户', confirmMessage, '删除', '取消')
    if (!confirmed) return

    let successCount = 0
    let failedCount = 0
    let totalUnboundKeys = 0
    const failedDetails = []

    for (const account of targets) {
      const result = await performAccountDeletion(account)
      if (result.success) {
        successCount += 1
        totalUnboundKeys += result.data?.unboundKeys || 0
      } else {
        failedCount += 1
        failedDetails.push({
          name: account.name || account.email || account.accountName || account.id,
          message: result.message || '删除失败'
        })
      }
    }

    if (successCount > 0) {
      let toastMessage = `成功删除 ${successCount} 个账户`
      if (totalUnboundKeys > 0) {
        toastMessage += `，${totalUnboundKeys} 个 API Key 已切换为共享池模式`
      }
      showToast(toastMessage, failedCount > 0 ? 'warning' : 'success')

      selectedAccounts.value = []
      selectAllChecked.value = false
      isIndeterminate.value = false

      accountsData.groupMembersLoaded.value = false
      accountsData.apiKeysLoaded.value = false
      await accountsData.loadAccounts(true)
    }

    if (failedCount > 0) {
      const detailMessage = failedDetails.map((item) => `${item.name}: ${item.message}`).join('\n')
      showToast(
        `有 ${failedCount} 个账户删除失败:\n${detailMessage}`,
        successCount > 0 ? 'warning' : 'error'
      )
    }

    updateSelectAllState()
  }

  // Reset account status
  const resetAccountStatus = async (account) => {
    if (account.isResetting) return

    const confirmed = await showConfirm(
      '重置账户状态',
      '确定要重置此账户的所有异常状态吗？这将清除限流状态、401错误计数等所有异常标记。',
      '确定重置',
      '取消'
    )

    if (!confirmed) return

    try {
      account.isResetting = true

      const endpoints = {
        openai: `/admin/openai-accounts/${account.id}/reset-status`,
        'openai-responses': `/admin/openai-responses-accounts/${account.id}/reset-status`,
        claude: `/admin/claude-accounts/${account.id}/reset-status`,
        'claude-console': `/admin/claude-console-accounts/${account.id}/reset-status`,
        ccr: `/admin/ccr-accounts/${account.id}/reset-status`,
        droid: `/admin/droid-accounts/${account.id}/reset-status`
      }

      const endpoint = endpoints[account.platform]
      if (!endpoint) {
        showToast('不支持的账户类型', 'error')
        account.isResetting = false
        return
      }

      const data = await apiClient.post(endpoint)

      if (data.success) {
        showToast('账户状态已重置', 'success')
        accountsData.loadAccounts(true)
      } else {
        showToast(data.message || '状态重置失败', 'error')
      }
    } catch (error) {
      showToast('状态重置失败', 'error')
    } finally {
      account.isResetting = false
    }
  }

  // Toggle schedulable
  const toggleSchedulable = async (account) => {
    if (account.isTogglingSchedulable) return

    try {
      account.isTogglingSchedulable = true

      const endpoints = {
        claude: `/admin/claude-accounts/${account.id}/toggle-schedulable`,
        'claude-console': `/admin/claude-console-accounts/${account.id}/toggle-schedulable`,
        bedrock: `/admin/bedrock-accounts/${account.id}/toggle-schedulable`,
        gemini: `/admin/gemini-accounts/${account.id}/toggle-schedulable`,
        openai: `/admin/openai-accounts/${account.id}/toggle-schedulable`,
        azure_openai: `/admin/azure-openai-accounts/${account.id}/toggle-schedulable`,
        'openai-responses': `/admin/openai-responses-accounts/${account.id}/toggle-schedulable`,
        ccr: `/admin/ccr-accounts/${account.id}/toggle-schedulable`,
        droid: `/admin/droid-accounts/${account.id}/toggle-schedulable`
      }

      const endpoint = endpoints[account.platform]
      if (!endpoint) {
        showToast('该账户类型暂不支持调度控制', 'warning')
        return
      }

      const data = await apiClient.put(endpoint)

      if (data.success) {
        account.schedulable = data.schedulable
        showToast(data.schedulable ? '已启用调度' : '已禁用调度', 'success')
      } else {
        showToast(data.message || '操作失败', 'error')
      }
    } catch (error) {
      showToast('切换调度状态失败', 'error')
    } finally {
      account.isTogglingSchedulable = false
    }
  }

  // Expiry edit methods
  const startEditAccountExpiry = (account) => {
    editingExpiryAccount.value = account
  }

  const closeAccountExpiryEdit = () => {
    editingExpiryAccount.value = null
  }

  const handleSaveAccountExpiry = async ({ accountId, expiresAt }) => {
    try {
      const account = accountsData.accounts.value.find((acc) => acc.id === accountId)

      if (!account) {
        showToast('未找到账户', 'error')
        return
      }

      const endpoints = {
        claude: `/admin/claude-accounts/${accountId}`,
        'claude-oauth': `/admin/claude-accounts/${accountId}`,
        gemini: `/admin/gemini-accounts/${accountId}`,
        'claude-console': `/admin/claude-console-accounts/${accountId}`,
        bedrock: `/admin/bedrock-accounts/${accountId}`,
        ccr: `/admin/ccr-accounts/${accountId}`,
        openai: `/admin/openai-accounts/${accountId}`,
        droid: `/admin/droid-accounts/${accountId}`,
        azure_openai: `/admin/azure-openai-accounts/${accountId}`,
        'openai-responses': `/admin/openai-responses-accounts/${accountId}`
      }

      const endpoint = endpoints[account.platform]
      if (!endpoint) {
        showToast(`不支持的平台类型: ${account.platform}`, 'error')
        return
      }

      const data = await apiClient.put(endpoint, {
        expiresAt: expiresAt || null
      })

      if (data.success) {
        showToast('账户到期时间已更新', 'success')
        account.expiresAt = expiresAt || null
        closeAccountExpiryEdit()
      } else {
        showToast(data.message || '更新失败', 'error')
        if (expiryEditModalRef.value) {
          expiryEditModalRef.value.resetSaving()
        }
      }
    } catch (error) {
      console.error('更新账户过期时间失败:', error)
      showToast('更新失败', 'error')
      if (expiryEditModalRef.value) {
        expiryEditModalRef.value.resetSaving()
      }
    }
  }

  return {
    // Confirm modal
    showConfirmModal,
    confirmOptions,
    handleConfirm,
    handleCancel,

    // Modal states
    showCreateAccountModal,
    newAccountPlatform,
    showEditAccountModal,
    editingAccount,

    // Multi-select
    selectedAccounts,
    selectAllChecked,
    isIndeterminate,
    showCheckboxes,

    // Usage modal
    showAccountUsageModal,
    accountUsageLoading,
    selectedAccountForUsage,
    accountUsageHistory,
    accountUsageSummary,
    accountUsageOverview,
    accountUsageGeneratedAt,

    // Expiry
    editingExpiryAccount,
    expiryEditModalRef,

    // Methods
    updateSelectAllState,
    handleSelectAll,
    toggleSelectionMode,
    cleanupSelectedAccounts,
    openCreateAccountModal,
    closeCreateAccountModal,
    editAccount,
    handleCreateSuccess,
    handleEditSuccess,
    canViewUsage,
    openAccountUsageModal,
    closeAccountUsageModal,
    deleteAccount,
    batchDeleteAccounts,
    resetAccountStatus,
    toggleSchedulable,
    startEditAccountExpiry,
    closeAccountExpiryEdit,
    handleSaveAccountExpiry
  }
}
