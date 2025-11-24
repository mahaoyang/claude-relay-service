import { ref, computed } from 'vue'

/**
 * 通用的多选逻辑 Composable
 * 用于在列表/表格视图中实现复选框多选功能
 *
 * @param {Object} options - 配置选项
 * @param {import('vue').ComputedRef} options.items - 当前页面的项目列表（响应式）
 * @param {Function} options.getItemId - 获取项目ID的函数，默认 (item) => item.id
 * @param {Function} options.onSelectionChange - 选择变化时的回调函数（可选）
 * @returns {Object} 返回多选相关的状态和方法
 */
export function useMultiSelect(options = {}) {
  const { items, getItemId = (item) => item.id, onSelectionChange } = options

  // 状态管理
  const selectedItems = ref([])
  const selectAllChecked = ref(false)
  const isIndeterminate = ref(false)
  const showCheckboxes = ref(false)

  /**
   * 当前选中的项目数量
   */
  const selectedCount = computed(() => selectedItems.value.length)

  /**
   * 是否有选中项
   */
  const hasSelection = computed(() => selectedItems.value.length > 0)

  /**
   * 当前页面所有项目的ID集合
   */
  const currentPageIds = computed(() => {
    if (!items || !items.value) return new Set()
    return new Set(items.value.map((item) => getItemId(item)))
  })

  /**
   * 切换复选框显示/隐藏
   */
  const toggleCheckboxes = () => {
    showCheckboxes.value = !showCheckboxes.value

    // 隐藏时清空选择
    if (!showCheckboxes.value) {
      clearSelection()
    }
  }

  /**
   * 更新全选状态
   * 根据当前页面的选中情况更新全选复选框的状态
   */
  const updateSelectAllState = () => {
    if (!items || !items.value || items.value.length === 0) {
      selectAllChecked.value = false
      isIndeterminate.value = false
      return
    }

    const totalInCurrentPage = items.value.length
    const selectedInCurrentPage = items.value.filter((item) =>
      selectedItems.value.includes(getItemId(item))
    ).length

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

  /**
   * 处理全选/取消全选
   */
  const handleSelectAll = () => {
    if (!items || !items.value) return

    if (selectAllChecked.value) {
      // 全选：添加当前页所有未选中的项目
      items.value.forEach((item) => {
        const itemId = getItemId(item)
        if (!selectedItems.value.includes(itemId)) {
          selectedItems.value.push(itemId)
        }
      })
    } else {
      // 取消全选：只移除当前页的选中项，保留其他页面的选中项
      const currentIds = currentPageIds.value
      selectedItems.value = selectedItems.value.filter((id) => !currentIds.has(id))
    }

    updateSelectAllState()
    triggerSelectionChange()
  }

  /**
   * 选中单个项目
   * @param {string|number} itemId - 项目ID
   */
  const selectItem = (itemId) => {
    if (!selectedItems.value.includes(itemId)) {
      selectedItems.value.push(itemId)
      updateSelectAllState()
      triggerSelectionChange()
    }
  }

  /**
   * 取消选中单个项目
   * @param {string|number} itemId - 项目ID
   */
  const deselectItem = (itemId) => {
    const index = selectedItems.value.indexOf(itemId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
      updateSelectAllState()
      triggerSelectionChange()
    }
  }

  /**
   * 切换单个项目的选中状态
   * @param {string|number} itemId - 项目ID
   */
  const toggleItem = (itemId) => {
    if (selectedItems.value.includes(itemId)) {
      deselectItem(itemId)
    } else {
      selectItem(itemId)
    }
  }

  /**
   * 判断项目是否被选中
   * @param {string|number} itemId - 项目ID
   * @returns {boolean}
   */
  const isSelected = (itemId) => {
    return selectedItems.value.includes(itemId)
  }

  /**
   * 清空所有选择
   */
  const clearSelection = () => {
    selectedItems.value = []
    selectAllChecked.value = false
    isIndeterminate.value = false
    triggerSelectionChange()
  }

  /**
   * 清空当前页的选择
   */
  const clearCurrentPageSelection = () => {
    const currentIds = currentPageIds.value
    selectedItems.value = selectedItems.value.filter((id) => !currentIds.has(id))
    updateSelectAllState()
    triggerSelectionChange()
  }

  /**
   * 设置选中的项目列表
   * @param {Array} ids - 项目ID数组
   */
  const setSelection = (ids) => {
    selectedItems.value = [...ids]
    updateSelectAllState()
    triggerSelectionChange()
  }

  /**
   * 移除无效的选中项（当数据更新后，清理不存在的ID）
   * @param {Set} validIds - 有效的ID集合
   */
  const cleanupInvalidSelections = (validIds) => {
    const originalLength = selectedItems.value.length
    selectedItems.value = selectedItems.value.filter((id) => validIds.has(id))

    if (selectedItems.value.length !== originalLength) {
      updateSelectAllState()
      triggerSelectionChange()
    }
  }

  /**
   * 触发选择变化回调
   */
  const triggerSelectionChange = () => {
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selectedItems.value)
    }
  }

  return {
    // 状态
    selectedItems,
    selectAllChecked,
    isIndeterminate,
    showCheckboxes,
    selectedCount,
    hasSelection,

    // 方法
    toggleCheckboxes,
    handleSelectAll,
    updateSelectAllState,
    selectItem,
    deselectItem,
    toggleItem,
    isSelected,
    clearSelection,
    clearCurrentPageSelection,
    setSelection,
    cleanupInvalidSelections
  }
}
