<template>
  <Card class="h-full">
    <h3
      class="mb-4 flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100"
    >
      <span class="flex items-center gap-2">
        <svg
          class="h-4 w-4 text-primary-600 dark:text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
        Token 使用分布
      </span>
      <span
        class="rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400"
        >({{ statsPeriod === 'daily' ? '今日' : '本月' }})</span
      >
    </h3>

    <div class="space-y-3">
      <!-- Token 类型列表 -->
      <div class="space-y-2">
        <!-- 输入 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all hover:border-primary-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-primary-50 p-1.5 dark:bg-primary-900/20">
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">输入 Token</span>
          </span>
          <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{
            formatNumber(currentPeriodData.inputTokens)
          }}</span>
        </div>

        <!-- 输出 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all hover:border-primary-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-primary-50 p-1.5 dark:bg-primary-900/20">
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">输出 Token</span>
          </span>
          <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{
            formatNumber(currentPeriodData.outputTokens)
          }}</span>
        </div>

        <!-- 缓存创建 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all hover:border-primary-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-primary-50 p-1.5 dark:bg-primary-900/20">
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">缓存创建 Token</span>
          </span>
          <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{
            formatNumber(currentPeriodData.cacheCreateTokens)
          }}</span>
        </div>

        <!-- 缓存读取 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all hover:border-primary-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-primary-50 p-1.5 dark:bg-primary-900/20">
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">缓存读取 Token</span>
          </span>
          <span class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{
            formatNumber(currentPeriodData.cacheReadTokens)
          }}</span>
        </div>
      </div>

      <!-- 总计 -->
      <div
        class="mt-4 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/30 p-4 dark:border-primary-800 dark:bg-primary-900/10"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            <svg
              class="h-4 w-4 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            <span>{{ statsPeriod === 'daily' ? '今日' : '本月' }}总计</span>
          </span>
          <span class="font-mono text-lg font-bold text-primary-600 dark:text-primary-400">{{
            formatNumber(currentPeriodData.allTokens)
          }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import { Card } from '@/ui'

const apiStatsStore = useApiStatsStore()
const { statsPeriod, currentPeriodData } = storeToRefs(apiStatsStore)

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
