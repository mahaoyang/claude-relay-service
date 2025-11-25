<template>
  <Card class="h-full">
    <div class="space-y-6">
      <!-- 标题 -->
      <div
        class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
      >
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          <span class="flex items-center gap-2">
            <svg
              class="h-5 w-5 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            {{ multiKeyMode ? '限制配置（聚合查询模式）' : '限制配置' }}
          </span>
        </h3>
      </div>

      <!-- 多 Key 模式下的聚合统计信息 -->
      <div v-if="multiKeyMode && aggregatedStats" class="space-y-6">
        <!-- API Keys 概况 -->
        <div
          class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              API Keys 概况
            </span>
            <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {{ aggregatedStats.activeKeys }}/{{ aggregatedStats.totalKeys }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-white p-3 text-center dark:bg-gray-900">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ aggregatedStats.totalKeys }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">总计 Keys</div>
            </div>
            <div class="rounded-lg bg-white p-3 text-center dark:bg-gray-900">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ aggregatedStats.activeKeys }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">激活 Keys</div>
            </div>
          </div>
        </div>

        <!-- 聚合统计数据 -->
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>聚合统计摘要</span>
          </div>
          <div class="space-y-3">
            <div
              class="flex items-center justify-between rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300"> 总请求数 </span>
              <span class="font-semibold text-primary-600 dark:text-primary-400">
                {{ formatNumber(aggregatedStats.usage.requests) }}
              </span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300"> 总 Tokens </span>
              <span class="font-semibold text-primary-600 dark:text-primary-400">
                {{ formatNumber(aggregatedStats.usage.allTokens) }}
              </span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300"> 总费用 </span>
              <span class="font-semibold text-primary-600 dark:text-primary-400">
                {{ aggregatedStats.usage.formattedCost }}
              </span>
            </div>
          </div>
        </div>

        <!-- 无效 Keys 提示 -->
        <div
          v-if="invalidKeys && invalidKeys.length > 0"
          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              clip-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              fill-rule="evenodd"
            />
          </svg>
          <span> {{ invalidKeys.length }} 个无效的 API Key </span>
        </div>

        <!-- 提示信息 -->
        <div
          class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        >
          <div class="flex items-start gap-2">
            <svg class="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                clip-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                fill-rule="evenodd"
              />
            </svg>
            <span>每个 API Key 有独立的限制设置，聚合模式下不显示单个限制配置</span>
          </div>
        </div>
      </div>

      <!-- 仅在单 Key 模式下显示限制配置 -->
      <div v-if="!multiKeyMode" class="space-y-4">
        <!-- 每日费用限制 -->
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">每日费用限制</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              <span v-if="statsData.limits.dailyCostLimit > 0">
                ${{ statsData.limits.currentDailyCost.toFixed(4) }} / ${{
                  statsData.limits.dailyCostLimit.toFixed(2)
                }}
              </span>
              <span v-else> ${{ statsData.limits.currentDailyCost.toFixed(4) }} / 无限制 </span>
            </span>
          </div>
          <div
            v-if="statsData.limits.dailyCostLimit > 0"
            class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <div
              class="h-full transition-all duration-300"
              :class="getDailyCostProgressColor()"
              :style="{ width: getDailyCostProgress() + '%' }"
            />
          </div>
          <div v-else class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div class="h-full w-0 bg-green-500" />
          </div>
        </div>

        <!-- 总费用限制 -->
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">总费用限制</span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              <span v-if="statsData.limits.totalCostLimit > 0">
                ${{ statsData.limits.currentTotalCost.toFixed(4) }} / ${{
                  statsData.limits.totalCostLimit.toFixed(2)
                }}
              </span>
              <span v-else> ${{ statsData.limits.currentTotalCost.toFixed(4) }} / 无限制 </span>
            </span>
          </div>
          <div
            v-if="statsData.limits.totalCostLimit > 0"
            class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <div
              class="h-full transition-all duration-300"
              :class="getTotalCostProgressColor()"
              :style="{ width: getTotalCostProgress() + '%' }"
            />
          </div>
          <div v-else class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div class="h-full w-0 bg-green-500" />
          </div>
        </div>

        <!-- Opus 模型周费用限制 -->
        <div
          v-if="statsData.limits.weeklyOpusCostLimit > 0"
          class="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-purple-700 dark:text-purple-300"
              >Opus 模型周费用限制</span
            >
            <span class="text-sm font-semibold text-purple-900 dark:text-purple-100">
              ${{ statsData.limits.weeklyOpusCost.toFixed(4) }} / ${{
                statsData.limits.weeklyOpusCostLimit.toFixed(2)
              }}
            </span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-800">
            <div
              class="h-full transition-all duration-300"
              :class="getOpusWeeklyCostProgressColor()"
              :style="{ width: getOpusWeeklyCostProgress() + '%' }"
            />
          </div>
        </div>

        <!-- 时间窗口限制 -->
        <div
          v-if="
            statsData.limits.rateLimitWindow > 0 &&
            (statsData.limits.rateLimitRequests > 0 ||
              statsData.limits.tokenLimit > 0 ||
              statsData.limits.rateLimitCost > 0)
          "
          class="space-y-3"
        >
          <WindowCountdown
            :cost-limit="statsData.limits.rateLimitCost"
            :current-cost="statsData.limits.currentWindowCost"
            :current-requests="statsData.limits.currentWindowRequests"
            :current-tokens="statsData.limits.currentWindowTokens"
            label="时间窗口限制"
            :rate-limit-window="statsData.limits.rateLimitWindow"
            :request-limit="statsData.limits.rateLimitRequests"
            :show-progress="true"
            :show-tooltip="true"
            :token-limit="statsData.limits.tokenLimit"
            :window-end-time="statsData.limits.windowEndTime"
            :window-remaining-seconds="statsData.limits.windowRemainingSeconds"
            :window-start-time="statsData.limits.windowStartTime"
          />

          <div
            class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <span v-if="statsData.limits.rateLimitCost > 0">
              请求次数和费用限制为"或"的关系，任一达到限制即触发限流
            </span>
            <span v-else-if="statsData.limits.tokenLimit > 0">
              请求次数和Token使用量为"或"的关系，任一达到限制即触发限流
            </span>
            <span v-else> 仅限制请求次数 </span>
          </div>
        </div>

        <!-- 其他限制信息 -->
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">并发限制</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              <span v-if="statsData.limits.concurrencyLimit > 0">
                {{ statsData.limits.concurrencyLimit }}
              </span>
              <span v-else class="text-gray-400 dark:text-gray-500"> 无限制 </span>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">模型限制</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              <span v-if="hasModelRestrictions">
                限制 {{ statsData.restrictions.restrictedModels.length }} 个模型
              </span>
              <span v-else> 允许所有模型 </span>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">客户端限制</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              <span v-if="hasClientRestrictions">
                限制 {{ statsData.restrictions.allowedClients.length }} 种客户端
              </span>
              <span v-else> 允许所有客户端 </span>
            </div>
            <div v-if="hasClientRestrictions" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="client in statsData.restrictions.allowedClients"
                :key="client"
                class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ client }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>

  <!-- 详细限制信息 -->
  <Card v-if="hasModelRestrictions" class="mt-6">
    <div class="space-y-4">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">详细限制信息</h3>

      <div
        class="rounded-lg border border-gray-300 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-800"
      >
        <h4 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">受限模型列表</h4>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="model in statsData.restrictions.restrictedModels"
            :key="model"
            class="rounded bg-white px-3 py-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <span>{{ model }}</span>
          </div>
        </div>
        <p class="mt-3 text-xs text-gray-600 dark:text-gray-400">
          此 API Key 不能访问以上列出的模型
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import { Card } from '@/ui'
import WindowCountdown from '@/components/apikeys/WindowCountdown.vue'

const apiStatsStore = useApiStatsStore()
const { statsData, multiKeyMode, aggregatedStats, invalidKeys } = storeToRefs(apiStatsStore)

const hasModelRestrictions = computed(() => {
  const restriction = statsData.value?.restrictions
  if (!restriction) return false
  return (
    restriction.enableModelRestriction === true &&
    Array.isArray(restriction.restrictedModels) &&
    restriction.restrictedModels.length > 0
  )
})

const hasClientRestrictions = computed(() => {
  const restriction = statsData.value?.restrictions
  if (!restriction) return false
  return (
    restriction.enableClientRestriction === true &&
    Array.isArray(restriction.allowedClients) &&
    restriction.allowedClients.length > 0
  )
})

// 获取每日费用进度
const getDailyCostProgress = () => {
  if (!statsData.value.limits.dailyCostLimit || statsData.value.limits.dailyCostLimit === 0)
    return 0
  const percentage =
    (statsData.value.limits.currentDailyCost / statsData.value.limits.dailyCostLimit) * 100
  return Math.min(percentage, 100)
}

const getDailyCostProgressColor = () => {
  return 'bg-primary-500 dark:bg-primary-400'
}

const getTotalCostProgress = () => {
  if (!statsData.value.limits.totalCostLimit || statsData.value.limits.totalCostLimit === 0)
    return 0
  const percentage =
    (statsData.value.limits.currentTotalCost / statsData.value.limits.totalCostLimit) * 100
  return Math.min(percentage, 100)
}

const getTotalCostProgressColor = () => {
  return 'bg-primary-500 dark:bg-primary-400'
}

const getOpusWeeklyCostProgress = () => {
  if (
    !statsData.value.limits.weeklyOpusCostLimit ||
    statsData.value.limits.weeklyOpusCostLimit === 0
  )
    return 0
  const percentage =
    (statsData.value.limits.weeklyOpusCost / statsData.value.limits.weeklyOpusCostLimit) * 100
  return Math.min(percentage, 100)
}

const getOpusWeeklyCostProgressColor = () => {
  return 'bg-primary-500 dark:bg-primary-400'
}

// 格式化数字
const formatNumber = (num) => {
  if (typeof num !== 'number') {
    num = parseInt(num) || 0
  }

  if (num === 0) return '0'

  // 大数字使用简化格式
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString()
  }
}
</script>
