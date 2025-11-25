<template>
  <Card>
    <div class="space-y-6">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            模型使用统计
          </span>
        </h3>
        <span
          class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
        >
          ({{ statsPeriod === 'daily' ? '今日' : '本月' }})
        </span>
      </div>

      <!-- 模型统计加载状态 -->
      <div v-if="modelStatsLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div
            class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"
          ></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">加载模型统计数据中...</p>
        </div>
      </div>

      <!-- 模型统计数据 -->
      <div v-else-if="modelStats.length > 0" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- 饼图 -->
        <div class="space-y-4">
          <h4 class="text-xs font-medium text-gray-900 dark:text-white">Token使用分布</h4>
          <div class="h-[300px]">
            <canvas ref="modelUsageChart" />
          </div>
        </div>

        <!-- 详细数据表格 -->
        <div class="space-y-4">
          <h4 class="text-xs font-medium text-gray-900 dark:text-white">详细统计数据</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead
                class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <tr>
                  <th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                    模型
                  </th>
                  <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                    请求数
                  </th>
                  <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                    总Token
                  </th>
                  <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                    费用
                  </th>
                  <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                    占比
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="model in modelStats"
                  :key="model.model"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td class="px-4 py-2 text-gray-900 dark:text-white">
                    <span class="block max-w-[200px] truncate" :title="model.model">
                      {{ model.model }}
                    </span>
                  </td>
                  <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                    {{ formatNumber(model.requests) }}
                  </td>
                  <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                    {{ formatNumber(model.allTokens) }}
                  </td>
                  <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                    {{ model.formatted ? model.formatted.total : '$0.000000' }}
                  </td>
                  <td class="px-4 py-2 text-right">
                    <span class="font-medium text-primary-600 dark:text-primary-400">
                      {{ calculatePercentage(model.allTokens) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Token 详细信息展开 -->
          <div class="mt-6 space-y-3">
            <div
              v-for="model in modelStats"
              :key="`detail-${model.model}`"
              class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div class="mb-3 flex items-center justify-between">
                <h4 class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ model.model }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ model.requests }} 次请求
                </span>
              </div>

              <div class="mb-3 flex items-center justify-between">
                <div
                  class="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 dark:bg-green-900/20"
                >
                  <span class="text-xs font-medium text-green-700 dark:text-green-400">
                    {{ model.formatted?.total || '$0.000000' }}
                  </span>
                  <span class="text-xs text-green-600 dark:text-green-500">总费用</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div
                  class="rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20"
                >
                  <div class="text-xs text-blue-600 dark:text-blue-400">输入 Token</div>
                  <div class="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {{ formatNumber(model.inputTokens) }}
                  </div>
                </div>
                <div
                  class="rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
                >
                  <div class="text-xs text-green-600 dark:text-green-400">输出 Token</div>
                  <div class="mt-1 text-sm font-semibold text-green-700 dark:text-green-300">
                    {{ formatNumber(model.outputTokens) }}
                  </div>
                </div>
                <div
                  class="rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-900/20"
                >
                  <div class="text-xs text-amber-600 dark:text-amber-400">缓存创建</div>
                  <div class="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {{ formatNumber(model.cacheCreateTokens) }}
                  </div>
                </div>
                <div
                  class="rounded-lg border border-purple-200 bg-purple-50 p-2 dark:border-purple-800 dark:bg-purple-900/20"
                >
                  <div class="text-xs text-purple-600 dark:text-purple-400">缓存读取</div>
                  <div class="mt-1 text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {{ formatNumber(model.cacheReadTokens) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无模型数据 -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 dark:border-gray-700"
      >
        <svg
          class="mb-4 h-12 w-12 text-gray-400"
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
        <p class="text-sm text-gray-500 dark:text-gray-400">
          暂无{{ statsPeriod === 'daily' ? '今日' : '本月' }}模型使用数据
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import { useThemeStore } from '@/stores/theme'
import { Card } from '@/ui'
import Chart from 'chart.js/auto'

const apiStatsStore = useApiStatsStore()
const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)
const { statsPeriod, modelStats, modelStatsLoading } = storeToRefs(apiStatsStore)

// Chart 实例
const modelUsageChart = ref(null)
let modelUsageChartInstance = null

// 图表颜色配置（根据主题动态调整）
const chartColors = computed(() => ({
  text: isDarkMode.value ? '#e5e7eb' : '#374151',
  grid: isDarkMode.value ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  legend: isDarkMode.value ? '#e5e7eb' : '#374151'
}))

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

// 计算百分比
const calculatePercentage = (value) => {
  if (!modelStats.value || modelStats.value.length === 0) return 0
  const total = modelStats.value.reduce((sum, stat) => sum + (stat.allTokens || 0), 0)
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(1)
}

// 创建模型使用饼图
function createModelUsageChart() {
  if (!modelUsageChart.value) return

  if (modelUsageChartInstance) {
    modelUsageChartInstance.destroy()
  }

  if (!modelStats.value || modelStats.value.length === 0) return

  const data = modelStats.value || []
  const chartData = {
    labels: data.map((d) => d.model),
    datasets: [
      {
        data: data.map((d) => d.allTokens || 0),
        backgroundColor: [
          'rgb(252, 207, 195)', // primary-200
          'rgb(249, 171, 149)', // primary-300
          'rgb(240, 138, 110)', // primary-400
          'rgb(217, 119, 87)', // primary-500
          'rgb(204, 95, 61)', // primary-600
          'rgb(168, 78, 50)', // primary-700
          'rgb(139, 64, 41)', // primary-800
          'rgb(114, 53, 34)', // primary-900
          'rgb(65, 29, 17)', // primary-950
          'rgb(254, 244, 242)' // primary-50
        ],
        borderWidth: 0
      }
    ]
  }

  modelUsageChartInstance = new Chart(modelUsageChart.value, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12
            },
            color: chartColors.value.legend
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.parsed
              const percentage = calculatePercentage(value)
              return `${label}: ${formatNumber(value)} tokens (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// 监听主题变化，重新创建图表
watch(isDarkMode, () => {
  nextTick(() => {
    createModelUsageChart()
  })
})

// 监听数据变化，更新图表
watch(modelStats, () => {
  nextTick(() => {
    createModelUsageChart()
  })
})

onMounted(() => {
  nextTick(() => {
    createModelUsageChart()
  })
})

onUnmounted(() => {
  if (modelUsageChartInstance) {
    modelUsageChartInstance.destroy()
  }
})
</script>
