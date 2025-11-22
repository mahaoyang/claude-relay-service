<template>
  <Card>
    <h3
      class="mb-6 flex items-center justify-between text-lg font-bold text-gray-900 dark:text-gray-100"
    >
      <span class="flex items-center gap-2">
        <svg class="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        class="rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400"
        >({{ statsPeriod === 'daily' ? '今日' : '本月' }})</span
      >
    </h3>

    <div class="space-y-4">
      <!-- Token 类型列表 -->
      <div class="space-y-3">
        <!-- 输入 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-transparent p-4 transition-all hover:border-blue-300/50 hover:shadow-md dark:border-gray-700/50 dark:from-blue-900/10"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-blue-500/10 p-2">
              <svg
                class="h-4 w-4 text-blue-500"
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
            <span class="font-medium text-gray-700 dark:text-gray-300">输入 Token</span>
          </span>
          <span class="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{{
            formatNumber(currentPeriodData.inputTokens)
          }}</span>
        </div>

        <!-- 输出 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200/50 bg-gradient-to-r from-green-50/50 to-transparent p-4 transition-all hover:border-green-300/50 hover:shadow-md dark:border-gray-700/50 dark:from-green-900/10"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-green-500/10 p-2">
              <svg
                class="h-4 w-4 text-green-500"
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
            <span class="font-medium text-gray-700 dark:text-gray-300">输出 Token</span>
          </span>
          <span class="font-mono text-lg font-bold text-green-600 dark:text-green-400">{{
            formatNumber(currentPeriodData.outputTokens)
          }}</span>
        </div>

        <!-- 缓存创建 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200/50 bg-gradient-to-r from-amber-50/50 to-transparent p-4 transition-all hover:border-amber-300/50 hover:shadow-md dark:border-gray-700/50 dark:from-amber-900/10"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-amber-500/10 p-2">
              <svg
                class="h-4 w-4 text-amber-500"
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
            <span class="font-medium text-gray-700 dark:text-gray-300">缓存创建 Token</span>
          </span>
          <span class="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">{{
            formatNumber(currentPeriodData.cacheCreateTokens)
          }}</span>
        </div>

        <!-- 缓存读取 Token -->
        <div
          class="group flex items-center justify-between rounded-xl border border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-transparent p-4 transition-all hover:border-purple-300/50 hover:shadow-md dark:border-gray-700/50 dark:from-purple-900/10"
        >
          <span class="flex items-center gap-3">
            <div class="rounded-lg bg-purple-500/10 p-2">
              <svg
                class="h-4 w-4 text-purple-500"
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
            <span class="font-medium text-gray-700 dark:text-gray-300">缓存读取 Token</span>
          </span>
          <span class="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">{{
            formatNumber(currentPeriodData.cacheReadTokens)
          }}</span>
        </div>
      </div>

      <!-- 总计 -->
      <div
        class="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-5 dark:border-gray-600 dark:from-gray-800 dark:to-gray-900"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100"
          >
            <svg
              class="h-5 w-5 text-indigo-500"
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
          <span
            class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-mono text-2xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400"
            >{{ formatNumber(currentPeriodData.allTokens) }}</span
          >
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
