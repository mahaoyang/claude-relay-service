import { ref, reactive, computed } from 'vue'

/**
 * 通用的日期范围筛选 Composable
 * 提供预设时间范围和自定义时间范围的筛选功能
 *
 * @param {Object} options - 配置选项
 * @param {string} options.defaultPreset - 默认预设值（'today', '7days', '30days', 'all', 'custom'）
 * @param {Function} options.onFilterChange - 筛选变化时的回调函数
 * @param {Array} options.customPresets - 自定义预设选项
 * @returns {Object} 返回日期范围筛选相关的状态和方法
 */
export function useDateRangeFilter(options = {}) {
  const { defaultPreset = 'today', onFilterChange, customPresets } = options

  // 日期筛选状态
  const dateFilter = reactive({
    type: 'preset', // 'preset' 或 'custom'
    preset: defaultPreset, // 预设值: 'today', '7days', '30days', 'all'
    customStart: '',
    customEnd: '',
    customRange: null // Element Plus DatePicker的v-model值
  })

  // 默认时间选择器的时间
  const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

  /**
   * 时间范围下拉选项
   */
  const timeRangeOptions = computed(() => {
    const defaultOptions = [
      { value: 'today', label: '今日', icon: 'CalendarDays' },
      { value: '7days', label: '最近7天', icon: 'CalendarRange' },
      { value: '30days', label: '最近30天', icon: 'Calendar' },
      { value: 'all', label: '全部时间', icon: 'Infinity' },
      { value: 'custom', label: '自定义范围', icon: 'CalendarCheck' }
    ]

    // 如果提供了自定义预设，合并它们
    if (customPresets && Array.isArray(customPresets)) {
      return [...customPresets, ...defaultOptions]
    }

    return defaultOptions
  })

  /**
   * 当前是否为自定义范围
   */
  const isCustomRange = computed(() => dateFilter.type === 'custom')

  /**
   * 获取当前筛选的日期范围
   * @returns {Object} { startDate, endDate, preset, type }
   */
  const getDateRange = () => {
    if (dateFilter.type === 'custom' && dateFilter.customStart && dateFilter.customEnd) {
      return {
        type: 'custom',
        preset: 'custom',
        startDate: dateFilter.customStart,
        endDate: dateFilter.customEnd
      }
    }

    // 根据预设计算日期范围
    return {
      type: 'preset',
      preset: dateFilter.preset,
      ...calculatePresetRange(dateFilter.preset)
    }
  }

  /**
   * 计算预设时间范围
   * @param {string} preset - 预设值
   * @returns {Object} { startDate, endDate }
   */
  const calculatePresetRange = (preset) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (preset) {
      case 'today':
        return {
          startDate: formatDate(today),
          endDate: formatDate(now)
        }

      case '7days': {
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(today.getDate() - 6) // 最近7天包括今天
        return {
          startDate: formatDate(sevenDaysAgo),
          endDate: formatDate(now)
        }
      }

      case '30days': {
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(today.getDate() - 29) // 最近30天包括今天
        return {
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(now)
        }
      }

      case 'all':
        return {
          startDate: undefined,
          endDate: undefined
        }

      default:
        return {
          startDate: undefined,
          endDate: undefined
        }
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss
   * @param {Date} date - 日期对象
   * @param {boolean} includeTime - 是否包含时间
   * @returns {string}
   */
  const formatDate = (date, includeTime = false) => {
    if (!date) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    return `${year}-${month}-${day}`
  }

  /**
   * 处理预设下拉选择变化
   * @param {string} value - 新的预设值
   */
  const handlePresetChange = (value) => {
    if (value === 'custom') {
      dateFilter.type = 'custom'
      dateFilter.preset = 'custom'
    } else {
      dateFilter.type = 'preset'
      dateFilter.preset = value
      dateFilter.customStart = ''
      dateFilter.customEnd = ''
      dateFilter.customRange = null
    }

    triggerFilterChange()
  }

  /**
   * 处理自定义日期范围变化
   * @param {Array} range - [startDate, endDate]
   */
  const handleCustomRangeChange = (range) => {
    dateFilter.customRange = range

    if (range && range.length === 2) {
      dateFilter.customStart = formatDate(range[0], true)
      dateFilter.customEnd = formatDate(range[1], true)
    } else {
      dateFilter.customStart = ''
      dateFilter.customEnd = ''
    }

    triggerFilterChange()
  }

  /**
   * 重置筛选到默认状态
   */
  const resetFilter = () => {
    dateFilter.type = 'preset'
    dateFilter.preset = defaultPreset
    dateFilter.customStart = ''
    dateFilter.customEnd = ''
    dateFilter.customRange = null

    triggerFilterChange()
  }

  /**
   * 设置筛选器值
   * @param {Object} filter - 筛选器配置
   */
  const setFilter = (filter) => {
    if (filter.type) dateFilter.type = filter.type
    if (filter.preset) dateFilter.preset = filter.preset
    if (filter.customStart) dateFilter.customStart = filter.customStart
    if (filter.customEnd) dateFilter.customEnd = filter.customEnd
    if (filter.customRange) dateFilter.customRange = filter.customRange

    triggerFilterChange()
  }

  /**
   * 触发筛选变化回调
   */
  const triggerFilterChange = () => {
    if (typeof onFilterChange === 'function') {
      const range = getDateRange()
      onFilterChange(range)
    }
  }

  /**
   * 获取用于API请求的参数
   * @returns {Object} { timeRange, startDate?, endDate? }
   */
  const getApiParams = () => {
    const range = getDateRange()

    if (range.type === 'custom' && range.startDate && range.endDate) {
      return {
        timeRange: 'custom',
        startDate: range.startDate,
        endDate: range.endDate
      }
    }

    if (range.preset === 'all') {
      return {
        timeRange: 'all'
      }
    }

    return {
      timeRange: range.preset
    }
  }

  /**
   * 获取显示用的标签
   * @returns {string}
   */
  const getDisplayLabel = () => {
    if (dateFilter.type === 'custom' && dateFilter.customStart && dateFilter.customEnd) {
      return `${dateFilter.customStart} ~ ${dateFilter.customEnd}`
    }

    const option = timeRangeOptions.value.find((opt) => opt.value === dateFilter.preset)
    return option ? option.label : '未知范围'
  }

  return {
    // 状态
    dateFilter,
    defaultTime,
    timeRangeOptions,
    isCustomRange,

    // 方法
    getDateRange,
    calculatePresetRange,
    formatDate,
    handlePresetChange,
    handleCustomRangeChange,
    resetFilter,
    setFilter,
    getApiParams,
    getDisplayLabel
  }
}

/**
 * 为多个项目创建独立的日期范围筛选器
 * 用于列表中每个项目都有独立的日期筛选需求
 *
 * @param {Object} options - 配置选项
 * @returns {Object}
 */
export function usePerItemDateRangeFilter(options = {}) {
  const { defaultPreset = 'today', onFilterChange } = options

  // 存储每个项目的筛选状态
  const itemFilters = ref({})

  /**
   * 获取指定项目的筛选器
   * @param {string|number} itemId - 项目ID
   * @returns {Object} 日期筛选器配置
   */
  const getItemFilter = (itemId) => {
    if (!itemFilters.value[itemId]) {
      itemFilters.value[itemId] = {
        type: 'preset',
        preset: defaultPreset,
        customStart: '',
        customEnd: '',
        customRange: null
      }
    }
    return itemFilters.value[itemId]
  }

  /**
   * 更新指定项目的筛选器
   * @param {string|number} itemId - 项目ID
   * @param {Object} filter - 筛选器配置
   */
  const setItemFilter = (itemId, filter) => {
    itemFilters.value[itemId] = { ...getItemFilter(itemId), ...filter }

    if (typeof onFilterChange === 'function') {
      onFilterChange(itemId, itemFilters.value[itemId])
    }
  }

  /**
   * 清除指定项目的筛选器
   * @param {string|number} itemId - 项目ID
   */
  const clearItemFilter = (itemId) => {
    delete itemFilters.value[itemId]
  }

  /**
   * 清除所有项目的筛选器
   */
  const clearAllFilters = () => {
    itemFilters.value = {}
  }

  return {
    itemFilters,
    getItemFilter,
    setItemFilter,
    clearItemFilter,
    clearAllFilters
  }
}
