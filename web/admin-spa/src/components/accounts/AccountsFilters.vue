<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
    <!-- 排序选择器 -->
    <div class="flex items-center gap-1.5">
      <div class="text-[10px] font-medium text-gray-500 dark:text-gray-400">排序</div>
      <CustomDropdown
        :model-value="sortBy"
        icon="ArrowUpDown"
        icon-color="text-primary-500"
        :options="sortOptions"
        placeholder="选择排序"
        size="small"
        @update:model-value="$emit('update:sort-by', $event)"
      />
    </div>

    <!-- 平台筛选器 -->
    <div class="flex items-center gap-1.5">
      <div class="text-[10px] font-medium text-gray-500 dark:text-gray-400">平台</div>
      <CustomDropdown
        :model-value="platformFilter"
        icon="Server"
        icon-color="text-blue-500"
        :options="platformOptions"
        placeholder="选择平台"
        size="small"
        @update:model-value="$emit('update:platform-filter', $event)"
      />
    </div>

    <!-- 分组筛选器 -->
    <div class="flex items-center gap-1.5">
      <div class="text-[10px] font-medium text-gray-500 dark:text-gray-400">分组</div>
      <CustomDropdown
        :model-value="groupFilter"
        icon="Layers"
        icon-color="text-purple-500"
        :options="groupOptions"
        placeholder="选择分组"
        size="small"
        @update:model-value="$emit('update:group-filter', $event)"
      />
    </div>

    <!-- 搜索框 -->
    <div class="relative w-full sm:w-56">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
        <Icon class="h-3.5 w-3.5 text-gray-400" name="Search" />
      </div>
      <input
        :value="searchQuery"
        class="block w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-8 text-xs text-gray-900 placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400 dark:focus:ring-primary-400"
        placeholder="搜索账户名称..."
        type="text"
        @input="$emit('update:search-query', $event.target.value)"
      />
      <button
        v-if="searchQuery"
        class="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        @click="$emit('update:search-query', '')"
      >
        <Icon class="h-3.5 w-3.5" name="X" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CustomDropdown from '@/components/common/CustomDropdown.vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  sortBy: {
    type: String,
    default: 'name'
  },
  platformFilter: {
    type: String,
    default: 'all'
  },
  groupFilter: {
    type: String,
    default: 'all'
  },
  searchQuery: {
    type: String,
    default: ''
  },
  // 分组选项
  accountGroups: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'update:sort-by',
  'update:platform-filter',
  'update:group-filter',
  'update:search-query'
])

// 排序选项
const sortOptions = [
  { value: 'name', label: '按名称排序', icon: 'Type' },
  { value: 'dailyTokens', label: '按今日Token排序', icon: 'Coins' },
  { value: 'dailyRequests', label: '按今日请求数排序', icon: 'BarChart3' },
  { value: 'totalTokens', label: '按总Token排序', icon: 'Database' },
  { value: 'lastUsed', label: '按最后使用排序', icon: 'Clock' }
]

// 平台选项
const platformOptions = [
  { value: 'all', label: '所有平台', icon: 'Globe' },
  { value: 'claude', label: 'Claude', icon: 'Brain' },
  { value: 'claude-console', label: 'Claude Console', icon: 'Terminal' },
  { value: 'gemini', label: 'Gemini', icon: 'Sparkles' },
  { value: 'openai', label: 'OpenAI', icon: 'Zap' },
  { value: 'azure_openai', label: 'Azure OpenAI', icon: 'Cloud' },
  { value: 'bedrock', label: 'Bedrock', icon: 'Cloud' },
  { value: 'openai-responses', label: 'OpenAI-Responses', icon: 'Server' },
  { value: 'ccr', label: 'CCR', icon: 'GitBranch' },
  { value: 'droid', label: 'Droid', icon: 'Bot' }
]

// 分组选项
const groupOptions = computed(() => {
  const options = [
    { value: 'all', label: '所有账户', icon: 'Globe' },
    { value: 'ungrouped', label: '未分组账户', icon: 'User' }
  ]

  props.accountGroups.forEach((group) => {
    const platformLabel =
      group.platform === 'claude'
        ? 'Claude'
        : group.platform === 'gemini'
          ? 'Gemini'
          : group.platform === 'openai'
            ? 'OpenAI'
            : 'Droid'

    const platformIcon =
      group.platform === 'claude'
        ? 'Brain'
        : group.platform === 'gemini'
          ? 'Sparkles'
          : group.platform === 'openai'
            ? 'Zap'
            : 'Bot'

    options.push({
      value: group.id,
      label: `${group.name} (${platformLabel})`,
      icon: platformIcon
    })
  })

  return options
})
</script>
