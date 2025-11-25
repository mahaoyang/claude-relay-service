<template>
  <tr
    :class="[
      'transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
      isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''
    ]"
  >
    <!-- 复选框 -->
    <td v-if="shouldShowCheckboxes" class="px-3 py-4">
      <input
        :checked="isSelected"
        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
        type="checkbox"
        @change="handleToggleSelect"
      />
    </td>

    <!-- 账户信息 (名称、平台、类型) -->
    <td class="px-4 py-3">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ account.name }}
          </span>
        </div>
        <div v-if="account.description" class="text-xs text-gray-500 dark:text-gray-400">
          {{ account.description }}
        </div>
      </div>
    </td>

    <!-- 平台/类型 -->
    <td class="px-4 py-3">
      <div class="flex flex-col gap-1.5">
        <!-- 平台徽章 -->
        <span :class="getPlatformBadgeClass(account.platform)">
          {{ getPlatformLabel(account.platform) }}
        </span>

        <!-- 账户类型 (针对Claude) -->
        <span v-if="account.platform === 'claude'" class="text-xs text-gray-600 dark:text-gray-400">
          {{ getAccountTypeLabel(account) }}
        </span>

        <!-- 认证类型 (针对Droid) -->
        <span
          v-if="account.platform === 'droid' && formatters.isDroidApiKeyMode(account)"
          :class="formatters.getDroidApiKeyBadgeClasses(account).join(' ')"
        >
          <Icon class="h-3 w-3" name="Key" />
          {{ formatters.getDroidApiKeyCount(account) }} API Keys
        </span>
      </div>
    </td>

    <!-- 过期时间 -->
    <td class="px-4 py-3">
      <div class="flex items-center gap-2">
        <span
          v-if="account.expiresAt"
          :class="[
            'text-xs font-medium',
            formatters.isExpired(account.expiresAt)
              ? 'text-red-600 dark:text-red-400'
              : formatters.isExpiringSoon(account.expiresAt)
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-700 dark:text-gray-300'
          ]"
        >
          {{ formatters.formatExpireDate(account.expiresAt) }}
        </span>
        <span v-else class="text-xs text-gray-500 dark:text-gray-400">永久</span>

        <button
          v-if="account.expiresAt"
          class="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="编辑过期时间"
          @click="$emit('edit-expiry', account)"
        >
          <Icon class="h-3 w-3" name="Edit" />
        </button>
      </div>
    </td>

    <!-- 状态 -->
    <td class="px-4 py-3">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              formatters.getAccountStatusClass(account)
            ]"
          >
            <span
              :class="['h-1.5 w-1.5 rounded-full', formatters.getAccountStatusDotClass(account)]"
            />
            {{ formatters.getAccountStatusText(account) }}
          </span>
        </div>

        <!-- 显示不可调度原因 -->
        <div
          v-if="account.schedulable === false && formatters.getSchedulableReason(account)"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ formatters.getSchedulableReason(account) }}
        </div>
      </div>
    </td>

    <!-- 优先级 -->
    <td class="px-4 py-3">
      <span
        :class="[
          'inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium',
          getPriorityClass(account.priority)
        ]"
      >
        {{ account.priority || 0 }}
      </span>
    </td>

    <!-- 代理配置 -->
    <td class="px-4 py-3">
      <div v-if="account.proxy" class="text-xs">
        <code
          class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >
          {{ formatters.formatProxyDisplay(account.proxy, normalizeProxyData) }}
        </code>
      </div>
      <span v-else class="text-xs text-gray-400 dark:text-gray-500">无</span>
    </td>

    <!-- 今日使用 -->
    <td class="px-4 py-3">
      <div class="flex flex-col gap-0.5 text-xs">
        <div class="text-gray-900 dark:text-white">
          <span class="font-medium">{{
            formatters.formatNumber(account.usage?.daily?.totalInputTokens || 0)
          }}</span>
          <span class="text-gray-500 dark:text-gray-400">M in</span>
        </div>
        <div class="text-gray-900 dark:text-white">
          <span class="font-medium">{{
            formatters.formatNumber(account.usage?.daily?.totalOutputTokens || 0)
          }}</span>
          <span class="text-gray-500 dark:text-gray-400">M out</span>
        </div>
        <div class="font-medium text-primary-600 dark:text-primary-400">
          ${{ formatters.calculateDailyCost(account) }}
        </div>
      </div>
    </td>

    <!-- 会话窗口 -->
    <td class="px-4 py-3">
      <div class="flex flex-col gap-1 text-xs">
        <!-- Claude 平台显示 5h/24h 使用进度 -->
        <div v-if="account.platform === 'claude' && account.claudeUsage" class="space-y-1">
          <div
            v-for="(window, type) in account.claudeUsage"
            :key="type"
            class="flex flex-col gap-0.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{
                type === 'primary' ? '5h' : '24h'
              }}</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatters.formatClaudeUsagePercent(window) }}
              </span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full transition-all duration-300"
                :class="formatters.getClaudeUsageBarClass(window)"
                :style="{ width: formatters.getClaudeUsageWidth(window) }"
              />
            </div>
            <div class="text-gray-500 dark:text-gray-400">
              剩余 {{ formatters.formatClaudeRemaining(window) }}
            </div>
          </div>
        </div>

        <!-- OpenAI/Codex 平台显示 -->
        <div v-else-if="account.platform === 'openai' && account.codexUsage" class="space-y-1">
          <div v-for="type in ['primary', 'secondary']" :key="type" class="flex flex-col gap-0.5">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">
                {{ formatters.getCodexWindowLabel(type) }}
              </span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatters.formatCodexUsagePercent(account.codexUsage[type]) }}
              </span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full transition-all duration-300"
                :class="formatters.getCodexUsageBarClass(account.codexUsage[type])"
                :style="{ width: formatters.getCodexUsageWidth(account.codexUsage[type]) }"
              />
            </div>
            <div class="text-gray-500 dark:text-gray-400">
              重置剩余 {{ formatters.formatCodexRemaining(account.codexUsage[type]) }}
            </div>
          </div>
        </div>

        <!-- Claude Console 平台显示配额和并发 -->
        <div v-else-if="account.platform === 'claude-console'" class="space-y-1.5">
          <!-- 配额使用 -->
          <div v-if="account.dailyQuota" class="flex flex-col gap-0.5">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">配额</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ formatters.getQuotaUsagePercent(account).toFixed(1) }}%
              </span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full transition-all duration-300"
                :class="formatters.getQuotaBarClass(formatters.getQuotaUsagePercent(account))"
                :style="{ width: `${formatters.getQuotaUsagePercent(account)}%` }"
              />
            </div>
            <div class="text-gray-500 dark:text-gray-400">
              剩余 ${{ formatters.formatRemainingQuota(account) }}
            </div>
          </div>

          <!-- 并发使用 -->
          <div v-if="account.maxConcurrentTasks" class="flex flex-col gap-0.5">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">并发</span>
              <span :class="['font-medium', formatters.getConcurrencyLabelClass(account)]">
                {{ account.activeTaskCount || 0 }}/{{ account.maxConcurrentTasks }}
              </span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-full transition-all duration-300"
                :class="
                  formatters.getConcurrencyBarClass(
                    formatters.getConsoleConcurrencyPercent(account)
                  )
                "
                :style="{ width: `${formatters.getConsoleConcurrencyPercent(account)}%` }"
              />
            </div>
          </div>
        </div>

        <!-- 其他平台显示占位符 -->
        <span v-else class="text-gray-400 dark:text-gray-500">--</span>
      </div>
    </td>

    <!-- 最后使用 -->
    <td class="px-4 py-3">
      <span class="text-xs text-gray-600 dark:text-gray-400">
        {{ formatters.formatLastUsed(account.lastUsedAt) }}
      </span>
    </td>

    <!-- 操作按钮 -->
    <td class="px-4 py-3">
      <div class="flex items-center gap-1">
        <!-- 查看使用情况 -->
        <button
          class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="查看使用情况"
          @click="$emit('view-usage', account)"
        >
          <Icon class="h-4 w-4" name="BarChart2" />
        </button>

        <!-- 编辑 -->
        <button
          class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="编辑账户"
          @click="$emit('edit', account)"
        >
          <Icon class="h-4 w-4" name="Edit" />
        </button>

        <!-- 重置状态 -->
        <button
          v-if="account.status !== 'active'"
          class="rounded p-1 text-blue-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
          title="重置状态"
          @click="$emit('reset-status', account.id)"
        >
          <Icon class="h-4 w-4" name="RotateCcw" />
        </button>

        <!-- 切换可调度 -->
        <button
          class="rounded p-1 transition-colors"
          :class="
            account.schedulable !== false
              ? 'text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-300'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
          "
          :title="account.schedulable !== false ? '暂停调度' : '恢复调度'"
          @click="$emit('toggle-schedulable', account.id, account.schedulable)"
        >
          <Icon v-if="account.schedulable !== false" class="h-4 w-4" name="Power" />
          <Icon v-else class="h-4 w-4" name="PowerOff" />
        </button>

        <!-- 删除 -->
        <button
          class="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          title="删除账户"
          @click="$emit('delete', account.id)"
        >
          <Icon class="h-4 w-4" name="Trash2" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  account: {
    type: Object,
    required: true
  },
  formatters: {
    type: Object,
    required: true
  },
  normalizeProxyData: {
    type: Function,
    required: true
  },
  selectedAccounts: {
    type: Array,
    default: () => []
  },
  shouldShowCheckboxes: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'delete',
  'edit',
  'edit-expiry',
  'reset-status',
  'toggle-schedulable',
  'update-selection',
  'view-usage'
])

// 计算是否被选中
const isSelected = computed(() => {
  return props.selectedAccounts.includes(props.account.id)
})

// 切换选择状态
const handleToggleSelect = () => {
  emit('update-selection')
}

// 获取平台标签
const getPlatformLabel = (platform) => {
  const labels = {
    claude: 'Claude',
    'claude-official': 'Claude Official',
    'claude-console': 'Claude Console',
    gemini: 'Gemini',
    openai: 'OpenAI',
    'openai-responses': 'OpenAI Responses',
    bedrock: 'AWS Bedrock',
    'azure-openai': 'Azure OpenAI',
    droid: 'Droid',
    ccr: 'CCR'
  }
  return labels[platform] || platform
}

// 获取平台徽章样式
const getPlatformBadgeClass = (platform) => {
  const baseClass =
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium shadow-sm'

  const platformClasses = {
    claude:
      'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    'claude-official':
      'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    'claude-console':
      'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
    gemini:
      'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    openai:
      'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    'openai-responses':
      'bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
    bedrock:
      'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    'azure-openai':
      'bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
    droid:
      'bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
    ccr: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
  }

  return `${baseClass} ${platformClasses[platform] || 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`
}

// 获取账户类型标签
const getAccountTypeLabel = (account) => {
  if (account.platform === 'claude') {
    return props.formatters.getClaudeAccountType(account)
  }
  return ''
}

// 获取优先级样式
const getPriorityClass = (priority) => {
  const p = priority || 0
  if (p >= 90) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  } else if (p >= 70) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  } else if (p >= 50) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  } else if (p >= 30) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}
</script>
