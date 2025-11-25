<template>
  <BaseModal
    icon="LineChart"
    icon-bg-class="bg-primary-100 dark:bg-primary-900/30"
    icon-color-class="text-primary-600 dark:text-primary-400"
    :show="show"
    size="lg"
    :title="`使用统计详情 - ${apiKey.name}`"
    @close="close"
  >
    <template #default>
      <div class="space-y-6">
        <!-- 总体统计卡片 -->
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <!-- 请求统计卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div class="mb-2 flex items-center gap-2">
              <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="Activity" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">总请求数</span>
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatNumber(totalRequests) }}
            </div>
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              今日: {{ formatNumber(dailyRequests) }} 次
            </div>
          </div>

          <!-- Token统计卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div class="mb-2 flex items-center gap-2">
              <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="Hash" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">总Token数</span>
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatTokenCount(totalTokens) }}
            </div>
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              今日: {{ formatTokenCount(dailyTokens) }}
            </div>
          </div>

          <!-- 费用统计卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div class="mb-2 flex items-center gap-2">
              <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="DollarSign" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">总费用</span>
            </div>
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ${{ totalCost.toFixed(4) }}
            </div>
            <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              今日: ${{ dailyCost.toFixed(4) }}
            </div>
          </div>

          <!-- 平均统计卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div class="mb-2 flex items-center gap-2">
              <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="Gauge" />
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">平均速率</span>
            </div>
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">RPM:</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ rpm }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">TPM:</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ tpm }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Token详细分布 -->
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4
            class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            <Icon class="h-4 w-4 text-primary-500" name="PieChart" />
            Token 使用分布
          </h4>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div
              class="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-900/20"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary-500"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">输入 Token</span>
              </div>
              <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {{ formatTokenCount(inputTokens) }}
              </span>
            </div>
            <div
              class="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-900/20"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary-500"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">输出 Token</span>
              </div>
              <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {{ formatTokenCount(outputTokens) }}
              </span>
            </div>
            <div
              v-if="cacheCreateTokens > 0"
              class="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-900/20"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary-500"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">缓存创建</span>
              </div>
              <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {{ formatTokenCount(cacheCreateTokens) }}
              </span>
            </div>
            <div
              v-if="cacheReadTokens > 0"
              class="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-900/20"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary-500"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">缓存读取</span>
              </div>
              <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {{ formatTokenCount(cacheReadTokens) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 限制信息 -->
        <div v-if="hasLimits" class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4
            class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="Shield" />
            限制设置
          </h4>
          <div class="space-y-4">
            <div v-if="apiKey.dailyCostLimit > 0" class="space-y-2">
              <LimitProgressBar
                :current="dailyCost"
                label="每日费用限制"
                :limit="apiKey.dailyCostLimit"
                :show-shine="true"
                type="daily"
              />
              <div class="text-right text-xs text-gray-500 dark:text-gray-400">
                已使用 {{ Math.min(dailyCostPercentage, 100).toFixed(1) }}%
              </div>
            </div>

            <div v-if="apiKey.weeklyOpusCostLimit > 0" class="space-y-2">
              <LimitProgressBar
                :current="weeklyOpusCost"
                label="Opus 周费用限制"
                :limit="apiKey.weeklyOpusCostLimit"
                :show-shine="true"
                type="opus"
              />
              <div class="text-right text-xs text-gray-500 dark:text-gray-400">
                已使用 {{ Math.min(opusUsagePercentage, 100).toFixed(1) }}%
              </div>
            </div>

            <div v-if="apiKey.totalCostLimit > 0" class="space-y-2">
              <LimitProgressBar
                :current="totalCost"
                label="总费用限制"
                :limit="apiKey.totalCostLimit"
                :show-shine="true"
                type="total"
              />
              <div class="text-right text-xs text-gray-500 dark:text-gray-400">
                已使用 {{ Math.min(totalUsagePercentage, 100).toFixed(1) }}%
              </div>
            </div>

            <div
              v-if="apiKey.concurrencyLimit > 0"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-900"
            >
              <span class="text-sm text-gray-600 dark:text-gray-400">并发限制</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ apiKey.currentConcurrency || 0 }} / {{ apiKey.concurrencyLimit }}
              </span>
            </div>

            <div v-if="apiKey.rateLimitWindow > 0" class="space-y-3">
              <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300">时间窗口限制</h5>
              <WindowCountdown
                :cost-limit="apiKey.rateLimitCost"
                :current-cost="apiKey.currentWindowCost"
                :current-requests="apiKey.currentWindowRequests"
                :current-tokens="apiKey.currentWindowTokens"
                label="窗口状态"
                :rate-limit-window="apiKey.rateLimitWindow"
                :request-limit="apiKey.rateLimitRequests"
                :show-progress="true"
                :show-tooltip="true"
                :token-limit="apiKey.tokenLimit"
                :window-end-time="apiKey.windowEndTime"
                :window-remaining-seconds="apiKey.windowRemainingSeconds"
                :window-start-time="apiKey.windowStartTime"
              />
            </div>
          </div>
        </div>

        <!-- 使用趋势图表 -->
        <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h4
            class="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="TrendingUp" />
            使用趋势
          </h4>
          <div class="h-[240px]">
            <canvas ref="usageChart" />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        type="button"
        @click="close"
      >
        关闭
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import BaseModal from '@/components/common/BaseModal.vue'
import Icon from '@/components/common/Icon.vue'
import LimitProgressBar from './LimitProgressBar.vue'
import WindowCountdown from './WindowCountdown.vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  apiKey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

// Chart 实例
const usageChart = ref(null)
let usageChartInstance = null

// 计算属性
const totalRequests = computed(() => props.apiKey.usage?.total?.requests || 0)
const dailyRequests = computed(() => props.apiKey.usage?.daily?.requests || 0)
const totalTokens = computed(() => props.apiKey.usage?.total?.tokens || 0)
const dailyTokens = computed(() => props.apiKey.usage?.daily?.tokens || 0)
const totalCost = computed(() => props.apiKey.usage?.total?.cost || 0)
const dailyCost = computed(() => props.apiKey.dailyCost || 0)
const totalCostLimit = computed(() => props.apiKey.totalCostLimit || 0)
const weeklyOpusCost = computed(() => props.apiKey.weeklyOpusCost || 0)
const weeklyOpusCostLimit = computed(() => props.apiKey.weeklyOpusCostLimit || 0)
const inputTokens = computed(() => props.apiKey.usage?.total?.inputTokens || 0)
const outputTokens = computed(() => props.apiKey.usage?.total?.outputTokens || 0)
const cacheCreateTokens = computed(() => props.apiKey.usage?.total?.cacheCreateTokens || 0)
const cacheReadTokens = computed(() => props.apiKey.usage?.total?.cacheReadTokens || 0)
const rpm = computed(() => props.apiKey.usage?.averages?.rpm || 0)
const tpm = computed(() => props.apiKey.usage?.averages?.tpm || 0)

const hasLimits = computed(() => {
  return (
    props.apiKey.dailyCostLimit > 0 ||
    props.apiKey.totalCostLimit > 0 ||
    props.apiKey.concurrencyLimit > 0 ||
    props.apiKey.weeklyOpusCostLimit > 0 ||
    props.apiKey.rateLimitWindow > 0 ||
    props.apiKey.tokenLimit > 0
  )
})

const dailyCostPercentage = computed(() => {
  if (!props.apiKey.dailyCostLimit || props.apiKey.dailyCostLimit === 0) return 0
  return (dailyCost.value / props.apiKey.dailyCostLimit) * 100
})

const totalUsagePercentage = computed(() => {
  if (!totalCostLimit.value || totalCostLimit.value === 0) return 0
  return (totalCost.value / totalCostLimit.value) * 100
})

const opusUsagePercentage = computed(() => {
  if (!weeklyOpusCostLimit.value || weeklyOpusCostLimit.value === 0) return 0
  return (weeklyOpusCost.value / weeklyOpusCostLimit.value) * 100
})

// 方法
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return num.toLocaleString('zh-CN')
}

// 格式化Token数量（使用K/M单位）
const formatTokenCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

const close = () => {
  emit('close')
}

// 图表颜色配置（根据主题动态调整）
const chartColors = computed(() => ({
  primary: isDarkMode.value ? 'rgba(217, 119, 87, 0.8)' : 'rgba(217, 119, 87, 0.8)',
  primaryBorder: isDarkMode.value ? 'rgb(217, 119, 87)' : 'rgb(217, 119, 87)',
  text: isDarkMode.value ? '#e5e7eb' : '#374151',
  grid: isDarkMode.value ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)'
}))

// 创建使用趋势图表
function createUsageChart() {
  if (!usageChart.value) return

  if (usageChartInstance) {
    usageChartInstance.destroy()
  }

  // 生成最近7天的数据（示例数据，实际应从 API 获取）
  const days = []
  const requests = []
  const tokens = []
  const costs = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))

    // 使用当前数据的比例生成趋势数据
    const ratio = 0.6 + Math.random() * 0.8
    requests.push(Math.floor((dailyRequests.value * ratio) / 7))
    tokens.push(Math.floor((dailyTokens.value * ratio) / 7))
    costs.push((dailyCost.value * ratio) / 7)
  }

  usageChartInstance = new Chart(usageChart.value, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: '请求数',
          data: requests,
          borderColor: chartColors.value.primaryBorder,
          backgroundColor: chartColors.value.primary,
          yAxisID: 'y',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: chartColors.value.text,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              label += context.parsed.y.toLocaleString()
              return label
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        }
      }
    }
  })
}

// 监听主题变化，重新创建图表
watch(isDarkMode, () => {
  nextTick(() => {
    createUsageChart()
  })
})

// 监听 show 属性变化，显示时创建图表
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        createUsageChart()
      })
    }
  }
)

onMounted(() => {
  if (props.show) {
    nextTick(() => {
      createUsageChart()
    })
  }
})

onUnmounted(() => {
  if (usageChartInstance) {
    usageChartInstance.destroy()
  }
})
</script>
