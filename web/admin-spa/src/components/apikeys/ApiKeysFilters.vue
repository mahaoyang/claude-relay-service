<template>
  <div class="space-y-4">
    <!-- 搜索和筛选栏 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- 搜索框 -->
      <div class="relative flex-1 sm:max-w-md">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon class="h-5 w-5 text-gray-400" name="Search" />
        </div>
        <input
          :value="searchQuery"
          class="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          placeholder="搜索 API Key 名称..."
          type="text"
          @input="$emit('update:search-query', $event.target.value)"
        />
      </div>

      <!-- 日期范围筛选 -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="preset in datePresets"
          :key="preset.value"
          :class="[
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            currentDateFilter.type === 'preset' && currentDateFilter.preset === preset.value
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
          type="button"
          @click="handleDatePresetClick(preset.value)"
        >
          {{ preset.label }}
        </button>

        <!-- 自定义日期按钮 -->
        <button
          :class="[
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            currentDateFilter.type === 'custom'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          ]"
          type="button"
          @click="showCustomDatePicker = !showCustomDatePicker"
        >
          <Icon class="mr-1 inline h-4 w-4" name="Calendar" />
          自定义日期
        </button>
      </div>
    </div>

    <!-- 自定义日期选择器 -->
    <div
      v-if="showCustomDatePicker"
      class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div class="flex-1">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            开始日期
          </label>
          <input
            :value="customStartDate"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            type="date"
            @input="handleCustomStartDateChange($event.target.value)"
          />
        </div>

        <div class="flex-1">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            结束日期
          </label>
          <input
            :value="customEndDate"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            type="date"
            @input="handleCustomEndDateChange($event.target.value)"
          />
        </div>

        <button
          class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          type="button"
          @click="applyCustomDateRange"
        >
          应用
        </button>

        <button
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          type="button"
          @click="showCustomDatePicker = false"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 活跃筛选标签 -->
    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400">活跃筛选:</span>

      <!-- 搜索筛选标签 -->
      <span
        v-if="searchQuery"
        class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
      >
        <span>搜索: "{{ searchQuery }}"</span>
        <button
          class="ml-1 hover:text-primary-900 dark:hover:text-primary-200"
          type="button"
          @click="$emit('update:search-query', '')"
        >
          <Icon class="h-3 w-3" name="X" />
        </button>
      </span>

      <!-- 日期筛选标签 -->
      <span
        v-if="currentDateFilter.type !== 'preset' || currentDateFilter.preset !== 'all'"
        class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
      >
        <span>{{ getDateFilterLabel() }}</span>
        <button
          class="ml-1 hover:text-primary-900 dark:hover:text-primary-200"
          type="button"
          @click="clearDateFilter"
        >
          <Icon class="h-3 w-3" name="X" />
        </button>
      </span>

      <!-- 清除所有筛选 -->
      <button
        class="text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        type="button"
        @click="clearAllFilters"
      >
        清除所有筛选
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  dateFilter: {
    type: Object,
    default: () => ({
      type: 'preset', // 'preset' | 'custom'
      preset: 'all', // 'today' | '7days' | '30days' | 'all'
      startDate: null,
      endDate: null
    })
  }
})

const emit = defineEmits(['update:search-query', 'update:date-filter', 'clear-filters'])

// 日期预设选项
const datePresets = [
  { value: 'today', label: '今天' },
  { value: '7days', label: '最近7天' },
  { value: '30days', label: '最近30天' },
  { value: 'all', label: '全部' }
]

// 自定义日期选择器显示状态
const showCustomDatePicker = ref(false)

// 临时存储自定义日期（在点击"应用"前）
const customStartDate = ref('')
const customEndDate = ref('')

// 当前日期筛选
const currentDateFilter = computed(() => props.dateFilter)

// 是否有活跃筛选
const hasActiveFilters = computed(() => {
  return (
    props.searchQuery ||
    currentDateFilter.value.type !== 'preset' ||
    currentDateFilter.value.preset !== 'all'
  )
})

/**
 * 处理日期预设点击
 */
const handleDatePresetClick = (preset) => {
  emit('update:date-filter', {
    type: 'preset',
    preset,
    startDate: null,
    endDate: null
  })
  showCustomDatePicker.value = false
}

/**
 * 处理自定义开始日期变化
 */
const handleCustomStartDateChange = (value) => {
  customStartDate.value = value
}

/**
 * 处理自定义结束日期变化
 */
const handleCustomEndDateChange = (value) => {
  customEndDate.value = value
}

/**
 * 应用自定义日期范围
 */
const applyCustomDateRange = () => {
  if (!customStartDate.value || !customEndDate.value) {
    return
  }

  emit('update:date-filter', {
    type: 'custom',
    preset: null,
    startDate: customStartDate.value,
    endDate: customEndDate.value
  })

  showCustomDatePicker.value = false
}

/**
 * 清除日期筛选
 */
const clearDateFilter = () => {
  emit('update:date-filter', {
    type: 'preset',
    preset: 'all',
    startDate: null,
    endDate: null
  })
}

/**
 * 清除所有筛选
 */
const clearAllFilters = () => {
  emit('update:search-query', '')
  clearDateFilter()
  emit('clear-filters')
}

/**
 * 获取日期筛选标签
 */
const getDateFilterLabel = () => {
  if (currentDateFilter.value.type === 'preset') {
    const preset = datePresets.find((p) => p.value === currentDateFilter.value.preset)
    return preset ? `日期: ${preset.label}` : '日期筛选'
  } else {
    return `日期: ${currentDateFilter.value.startDate} ~ ${currentDateFilter.value.endDate}`
  }
}
</script>
