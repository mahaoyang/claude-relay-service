<template>
  <div
    class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- 表格 -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <!-- 表头 -->
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <!-- 全选复选框 -->
            <th v-if="selectable" class="w-12 px-4 py-3" scope="col">
              <input
                :checked="selectAllChecked"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                :indeterminate="isIndeterminate"
                type="checkbox"
                @change="$emit('select-all', $event.target.checked)"
              />
            </th>

            <!-- 名称 -->
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              名称
            </th>

            <!-- API Key -->
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              API Key
            </th>

            <!-- 权限 -->
            <th
              class="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell"
              scope="col"
            >
              权限
            </th>

            <!-- 使用量 -->
            <th
              class="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 lg:table-cell"
              scope="col"
            >
              使用量
            </th>

            <!-- 成本 -->
            <th
              class="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 lg:table-cell"
              scope="col"
            >
              成本
            </th>

            <!-- 状态 -->
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              状态
            </th>

            <!-- 操作 -->
            <th
              class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              scope="col"
            >
              操作
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
          <!-- 空状态 -->
          <tr v-if="!apiKeys || apiKeys.length === 0">
            <td class="px-6 py-12 text-center" :colspan="columnCount">
              <div class="flex flex-col items-center justify-center">
                <Icon class="mb-3 h-12 w-12 text-gray-400" name="Key" />
                <p class="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  {{ emptyMessage }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ emptyDescription }}
                </p>
              </div>
            </td>
          </tr>

          <!-- API Keys 列表 -->
          <tr
            v-for="apiKey in apiKeys"
            :key="apiKey.id"
            :class="[
              'transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
              isSelected(apiKey.id) ? 'bg-primary-50 dark:bg-primary-900/10' : ''
            ]"
          >
            <!-- 选择复选框 -->
            <td v-if="selectable" class="px-4 py-4">
              <input
                :checked="isSelected(apiKey.id)"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                type="checkbox"
                @change="$emit('toggle-select', apiKey.id)"
              />
            </td>

            <!-- 名称 -->
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ apiKey.name }}
                  </div>
                  <div
                    v-if="apiKey.description"
                    class="mt-0.5 text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ apiKey.description }}
                  </div>
                </div>
              </div>
            </td>

            <!-- API Key -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <code
                  class="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {{ formatApiKey(apiKey.key) }}
                </code>
                <button
                  class="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                  type="button"
                  @click="$emit('copy-key', apiKey.key)"
                >
                  <Icon class="h-4 w-4" name="Copy" />
                </button>
              </div>
            </td>

            <!-- 权限 -->
            <td class="hidden px-6 py-4 md:table-cell">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="permission in getPermissions(apiKey)"
                  :key="permission"
                  class="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {{ permission }}
                </span>
              </div>
            </td>

            <!-- 使用量 -->
            <td class="hidden px-6 py-4 lg:table-cell">
              <div class="text-sm text-gray-900 dark:text-white">
                {{ formatNumber(apiKey.usage?.totalTokens || 0) }} tokens
              </div>
              <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {{ formatNumber(apiKey.usage?.requestCount || 0) }} requests
              </div>
            </td>

            <!-- 成本 -->
            <td class="hidden px-6 py-4 lg:table-cell">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                ${{ formatCost(apiKey.cost?.totalCost || 0) }}
              </div>
            </td>

            <!-- 状态 -->
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                  getStatusClass(apiKey)
                ]"
              >
                {{ getStatusText(apiKey) }}
              </span>
            </td>

            <!-- 操作 -->
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="查看统计"
                  type="button"
                  @click="$emit('view-stats', apiKey)"
                >
                  <Icon class="h-4 w-4" name="BarChart2" />
                </button>

                <button
                  class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="编辑"
                  type="button"
                  @click="$emit('edit', apiKey)"
                >
                  <Icon class="h-4 w-4" name="Edit" />
                </button>

                <button
                  class="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  title="删除"
                  type="button"
                  @click="$emit('delete', apiKey)"
                >
                  <Icon class="h-4 w-4" name="Trash2" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 (可选) -->
    <div
      v-if="showPagination && apiKeys && apiKeys.length > 0"
      class="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
    >
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          显示 <span class="font-medium">{{ startIndex + 1 }}</span> -
          <span class="font-medium">{{ endIndex }}</span> 共
          <span class="font-medium">{{ totalCount }}</span> 条
        </div>

        <div class="flex gap-2">
          <button
            class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="currentPage === 1"
            type="button"
            @click="$emit('page-change', currentPage - 1)"
          >
            上一页
          </button>

          <button
            class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="currentPage === totalPages"
            type="button"
            @click="$emit('page-change', currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  // API Keys 数据
  apiKeys: {
    type: Array,
    default: () => []
  },

  // 选中的 API Key IDs
  selectedIds: {
    type: Array,
    default: () => []
  },

  // 是否可选择
  selectable: {
    type: Boolean,
    default: false
  },

  // 全选状态
  selectAllChecked: {
    type: Boolean,
    default: false
  },

  // 部分选中状态
  isIndeterminate: {
    type: Boolean,
    default: false
  },

  // 空状态消息
  emptyMessage: {
    type: String,
    default: '暂无 API Keys'
  },

  // 空状态描述
  emptyDescription: {
    type: String,
    default: '点击上方按钮创建新的 API Key'
  },

  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: false
  },

  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },

  // 每页条数
  pageSize: {
    type: Number,
    default: 20
  },

  // 总数
  totalCount: {
    type: Number,
    default: 0
  }
})

defineEmits([
  'select-all',
  'toggle-select',
  'copy-key',
  'view-stats',
  'edit',
  'delete',
  'page-change'
])

// 计算列数
const columnCount = computed(() => {
  return props.selectable ? 8 : 7
})

// 计算分页信息
const startIndex = computed(() => {
  return (props.currentPage - 1) * props.pageSize
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.pageSize, props.totalCount)
})

const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.pageSize)
})

/**
 * 判断是否选中
 */
const isSelected = (id) => {
  return props.selectedIds.includes(id)
}

/**
 * 格式化 API Key 显示
 */
const formatApiKey = (key) => {
  if (!key) return ''
  // 显示前8位和后4位
  if (key.length <= 12) return key
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
}

/**
 * 获取权限列表
 */
const getPermissions = (apiKey) => {
  if (apiKey.permissions) {
    if (Array.isArray(apiKey.permissions)) {
      return apiKey.permissions
    }
    if (typeof apiKey.permissions === 'string') {
      return [apiKey.permissions]
    }
  }

  // 兜底：如果没有权限信息，显示 "all"
  return ['all']
}

/**
 * 获取状态样式类
 */
const getStatusClass = (apiKey) => {
  // 检查是否过期
  if (apiKey.expiresAt) {
    const now = new Date()
    const expiryDate = new Date(apiKey.expiresAt)
    if (expiryDate < now) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  // 检查是否禁用
  if (apiKey.disabled || apiKey.status === 'disabled') {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }

  // 检查配额
  if (apiKey.limit && apiKey.usage?.totalTokens) {
    const usagePercent = (apiKey.usage.totalTokens / apiKey.limit) * 100
    if (usagePercent >= 90) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    }
  }

  // 正常状态
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

/**
 * 获取状态文本
 */
const getStatusText = (apiKey) => {
  // 检查是否过期
  if (apiKey.expiresAt) {
    const now = new Date()
    const expiryDate = new Date(apiKey.expiresAt)
    if (expiryDate < now) {
      return '已过期'
    }
  }

  // 检查是否禁用
  if (apiKey.disabled || apiKey.status === 'disabled') {
    return '已禁用'
  }

  // 检查配额
  if (apiKey.limit && apiKey.usage?.totalTokens) {
    const usagePercent = (apiKey.usage.totalTokens / apiKey.limit) * 100
    if (usagePercent >= 100) {
      return '已达上限'
    }
    if (usagePercent >= 90) {
      return '即将达限'
    }
  }

  return '正常'
}

/**
 * 格式化数字
 */
const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  return num.toString()
}

/**
 * 格式化成本
 */
const formatCost = (cost) => {
  return cost.toFixed(4)
}
</script>
