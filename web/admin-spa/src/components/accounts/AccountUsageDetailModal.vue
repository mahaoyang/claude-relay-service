<template>
  <BaseModal content-class="p-0" :show="show" :show-close="false" size="4xl" @close="handleClose">
    <!-- Custom Header -->
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg"
        >
          <Icon class="h-5 w-5 text-white" name="AreaChart" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ account?.name || account?.email || '账号使用详情' }}
            </h3>
            <span
              v-if="account?.platform"
              class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:from-primary-900/30 dark:to-primary-800/30 dark:text-primary-400"
            >
              <Icon class="h-3 w-3" name="Layers" />
              {{ platformLabel }}
            </span>
            <span
              v-if="account?.accountType"
              class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:from-primary-900/30 dark:to-primary-800/30 dark:text-primary-500"
            >
              <Icon class="h-3 w-3" name="UserCog" />
              {{ accountTypeLabel }}
            </span>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            近 {{ summary?.days || 30 }} 天内的费用与请求趋势
            <span
              v-if="summary?.actualDaysUsed && summary?.actualDaysUsed < summary?.days"
              class="text-amber-600 dark:text-amber-400"
            >
              (日均基于实际使用 {{ summary.actualDaysUsed }} 天)
            </span>
          </p>
        </div>
      </div>
    </template>

    <!-- Content Area -->
    <div class="space-y-6 p-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400"
        />
      </div>

      <template v-else>
        <!-- Primary Metrics Cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="metric in primaryMetrics"
            :key="metric.key"
            class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            :class="{
              'hover:border-primary-300 dark:hover:border-primary-600': metric.key === 'totalCost',
              'hover:border-primary-400 dark:hover:border-primary-700':
                metric.key === 'totalRequests',
              'hover:border-primary-500 dark:hover:border-primary-800': metric.key === 'avgCost',
              'hover:border-primary-600 dark:hover:border-primary-900': metric.key === 'avgRequests'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {{ metric.label }}
                </p>
                <p
                  class="mt-2 text-xl font-bold"
                  :class="{
                    'bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500':
                      metric.key === 'totalCost',
                    'bg-gradient-to-r from-primary-700 to-primary-800 bg-clip-text text-transparent dark:from-primary-500 dark:to-primary-600':
                      metric.key === 'totalRequests',
                    'bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent dark:from-primary-300 dark:to-primary-400':
                      metric.key === 'avgCost',
                    'bg-gradient-to-r from-primary-800 to-primary-900 bg-clip-text text-transparent dark:from-primary-600 dark:to-primary-700':
                      metric.key === 'avgRequests'
                  }"
                >
                  {{ metric.value }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {{ metric.subtitle }}
                </p>
              </div>
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                :class="{
                  'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30':
                    metric.key === 'totalCost',
                  'bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-900/30 dark:to-primary-800/30':
                    metric.key === 'totalRequests',
                  'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-900/30 dark:to-primary-800/30':
                    metric.key === 'avgCost',
                  'bg-gradient-to-br from-primary-400 to-primary-500 dark:from-primary-900/30 dark:to-primary-800/30':
                    metric.key === 'avgRequests'
                }"
              >
                <div
                  class="h-6 w-6 rounded-full"
                  :class="{
                    'bg-primary-500 dark:bg-primary-400': metric.key === 'totalCost',
                    'bg-primary-600 dark:bg-primary-500': metric.key === 'totalRequests',
                    'bg-primary-700 dark:bg-primary-600': metric.key === 'avgCost',
                    'bg-primary-800 dark:bg-primary-700': metric.key === 'avgRequests'
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Today and Peak Stats Cards -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <!-- Today Overview -->
          <div
            class="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50"
          >
            <div
              class="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30"
              >
                <Icon class="h-4 w-4 text-primary-600 dark:text-primary-400" name="Sun" />
              </div>
              今日概览
            </div>
            <div class="space-y-2">
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">费用</span>
                <span class="font-semibold text-primary-600 dark:text-primary-400">{{
                  summary?.today?.costFormatted || '$0.000000'
                }}</span>
              </div>
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">请求</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  formatNumber(summary?.today?.requests || 0)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">Tokens</span>
                <span class="font-semibold text-primary-800 dark:text-primary-600">{{
                  formatNumber(summary?.today?.tokens || 0)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Highest Cost Day -->
          <div
            class="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50"
          >
            <div
              class="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-900/30 dark:to-primary-800/30"
              >
                <Icon class="h-4 w-4 text-primary-700 dark:text-primary-500" name="Crown" />
              </div>
              最高费用日
            </div>
            <div class="space-y-2">
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">日期</span>
                <span class="font-semibold text-gray-900 dark:text-white">{{
                  formatDate(summary?.highestCostDay?.date)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">费用</span>
                <span class="font-semibold text-primary-600 dark:text-primary-400">{{
                  summary?.highestCostDay?.formattedCost || '$0.000000'
                }}</span>
              </div>
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">请求</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  formatNumber(findHistoryValue(summary?.highestCostDay?.date, 'requests'))
                }}</span>
              </div>
            </div>
          </div>

          <!-- Highest Request Day -->
          <div
            class="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50"
          >
            <div
              class="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-900/30 dark:to-primary-800/30"
              >
                <Icon class="h-4 w-4 text-primary-800 dark:text-primary-600" name="BarChart3" />
              </div>
              最高请求日
            </div>
            <div class="space-y-2">
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">日期</span>
                <span class="font-semibold text-gray-900 dark:text-white">{{
                  formatDate(summary?.highestRequestDay?.date)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">请求</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  formatNumber(summary?.highestRequestDay?.requests || 0)
                }}</span>
              </div>
              <div
                class="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-gray-800/80"
              >
                <span class="text-xs text-gray-600 dark:text-gray-400">费用</span>
                <span class="font-semibold text-primary-600 dark:text-primary-400">{{
                  formatCost(findHistoryValue(summary?.highestRequestDay?.date, 'cost'))
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Comprehensive Statistics -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <!-- Token Statistics -->
          <div
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h4
              class="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 dark:from-primary-900/30 dark:to-primary-800/30"
              >
                <Icon class="h-4 w-4 text-primary-900 dark:text-primary-700" name="Database" />
              </div>
              累计 Token
            </h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">30天总计</span>
                <span class="font-semibold text-primary-600 dark:text-primary-400">{{
                  formatNumber(totalTokens)
                }}</span>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">日均 Token</span>
                <span class="font-semibold text-primary-600 dark:text-primary-400">{{
                  formatNumber(Math.round(summary?.avgDailyTokens || 0))
                }}</span>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">输入 / 输出</span>
                <span class="font-semibold text-primary-600 dark:text-primary-400"
                  >{{ formatNumber(overviewInputTokens) }} /
                  {{ formatNumber(overviewOutputTokens) }}</span
                >
              </div>
            </div>
          </div>

          <!-- Average Rates -->
          <div
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h4
              class="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-900/30 dark:to-primary-800/30"
              >
                <Icon class="h-4 w-4 text-primary-950 dark:text-primary-800" name="Gauge" />
              </div>
              平均速率
            </h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">RPM</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  overview?.averages?.rpm ?? 0
                }}</span>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">TPM</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  overview?.averages?.tpm ?? 0
                }}</span>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">日均请求 / Token</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500"
                  >{{
                    formatNumber(Math.round((overview?.averages?.dailyRequests || 0) * 100) / 100)
                  }}
                  /
                  {{
                    formatNumber(Math.round((overview?.averages?.dailyTokens || 0) * 100) / 100)
                  }}</span
                >
              </div>
            </div>
          </div>

          <!-- Recent Statistics -->
          <div
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h4
              class="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-900/30 dark:to-primary-800/30"
              >
                <Icon class="h-4 w-4 text-primary-950 dark:text-primary-900" name="Layers" />
              </div>
              最近统计
            </h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">今日请求</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  formatNumber(overview?.daily?.requests || 0)
                }}</span>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">今日 Token</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  formatNumber(overview?.daily?.allTokens || 0)
                }}</span>
              </div>
              <div class="flex items-center justify-between py-1.5">
                <span class="text-xs text-gray-600 dark:text-gray-400">今日费用</span>
                <span class="font-semibold text-primary-700 dark:text-primary-500">{{
                  formatCost(overview?.daily?.cost || 0)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div
          class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">费用与请求趋势</h4>
            <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              最新更新：{{ formatDateTime(generatedAtDisplay) }}
            </span>
          </div>
          <div class="relative h-80 w-full">
            <canvas ref="chartCanvas" />
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <template #footer>
      <button
        class="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        type="button"
        @click="handleClose"
      >
        关闭
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto'
import { useThemeStore } from '@/stores/theme'
import BaseModal from '@/components/common/BaseModal.vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  account: { type: Object, default: () => ({}) },
  history: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({}) },
  overview: { type: Object, default: () => ({}) },
  generatedAt: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

const chartCanvas = ref(null)
let chartInstance = null

const platformLabelMap = {
  claude: 'Claude',
  'claude-console': 'Claude Console',
  openai: 'OpenAI',
  'openai-responses': 'OpenAI Responses',
  gemini: 'Gemini',
  droid: 'Droid'
}

const platformLabel = computed(() => platformLabelMap[props.account?.platform] || '未知平台')

const accountTypeLabel = computed(() => {
  if (!props.account?.accountType) return '共享'
  if (props.account.accountType === 'dedicated') return '专属'
  if (props.account.accountType === 'group') return '分组'
  return '共享'
})

const chartColors = computed(() => ({
  text: isDarkMode.value ? '#e5e7eb' : '#374151',
  grid: isDarkMode.value ? 'rgba(75, 85, 99, 0.25)' : 'rgba(209, 213, 219, 0.4)',
  cost: 'rgb(204, 95, 61)', // primary-600
  costFill: 'rgba(204, 95, 61, 0.15)',
  requests: 'rgb(168, 78, 50)' // primary-700
}))

const totalTokens = computed(() => props.summary?.totalTokens || 0)
const overviewInputTokens = computed(() => props.overview?.total?.inputTokens || 0)
const overviewOutputTokens = computed(() => props.overview?.total?.outputTokens || 0)

const formatNumber = (value) => {
  const num = Number(value || 0)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
  return num.toLocaleString()
}

const formatCost = (value) => {
  const num = Number(value || 0)
  if (Number.isNaN(num)) return '$0.000000'
  if (num >= 1) return `$${num.toFixed(2)}`
  if (num >= 0.01) return `$${num.toFixed(3)}`
  return `$${num.toFixed(6)}`
}

const roundToTwo = (value) => Math.round((Number(value) || 0) * 100) / 100

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    const parts = value.split('-')
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`
    }
    return value
  }
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const formatDateTime = (value) => {
  if (!value) return '暂无'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const findHistoryValue = (date, field) => {
  if (!date) return 0
  const target = props.history.find((item) => item.date === date)
  return target ? target[field] || 0 : 0
}

const generatedAtDisplay = computed(
  () => props.generatedAt || props.summary?.generatedAt || props.summary?.generated_at || ''
)

const primaryMetrics = computed(() => [
  {
    key: 'totalCost',
    label: '30天总费用',
    value: props.summary?.totalCostFormatted || '$0.000000',
    subtitle: '累计成本',
    icon: 'fa-file-invoice-dollar',
    iconClass: ''
  },
  {
    key: 'totalRequests',
    label: '30天总请求',
    value: formatNumber(props.summary?.totalRequests || 0),
    subtitle: '调用次数',
    icon: 'fa-paper-plane',
    iconClass: ''
  },
  {
    key: 'avgCost',
    label: '日均费用',
    value: props.summary?.avgDailyCostFormatted || formatCost(props.summary?.avgDailyCost || 0),
    subtitle:
      props.summary?.actualDaysUsed && props.summary?.actualDaysUsed < props.summary?.days
        ? `基于 ${props.summary.actualDaysUsed} 天实际使用`
        : '平均每日成本',
    icon: 'fa-wave-square',
    iconClass: ''
  },
  {
    key: 'avgRequests',
    label: '日均请求',
    value: formatNumber(roundToTwo(props.summary?.avgDailyRequests || 0)),
    subtitle: '平均每日调用',
    icon: 'fa-chart-line',
    iconClass: ''
  }
])

const renderChart = async () => {
  await nextTick()

  if (!props.show || !chartCanvas.value) {
    return
  }

  if (chartInstance) {
    chartInstance.destroy()
  }

  if (!props.history || props.history.length === 0) {
    chartInstance = null
    return
  }

  const labels = props.history.map((item) => item.label)
  const costs = props.history.map((item) => item.cost || 0)
  const requests = props.history.map((item) => item.requests || 0)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '费用 (USD)',
          data: costs,
          borderColor: chartColors.value.cost,
          backgroundColor: chartColors.value.costFill,
          tension: 0.35,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: '请求次数',
          data: requests,
          borderColor: chartColors.value.requests,
          backgroundColor: 'transparent',
          tension: 0.35,
          yAxisID: 'y1'
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
          labels: {
            color: chartColors.value.text
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (context.dataset.label === '费用 (USD)') {
                return `${context.dataset.label}: ${formatCost(context.parsed.y)}`
              }
              return `${context.dataset.label}: ${formatNumber(context.parsed.y)} 次`
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
            display: false,
            drawBorder: false
          }
        },
        y: {
          position: 'left',
          ticks: {
            color: chartColors.value.text,
            callback: (value) => formatCost(value)
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y1: {
          position: 'right',
          ticks: {
            color: chartColors.value.text,
            callback: (value) => formatNumber(value)
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    }
  })
}

const cleanupChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

const handleClose = () => {
  cleanupChart()
  emit('close')
}

watch(
  () => props.show,
  (visible) => {
    if (visible && !props.loading) {
      renderChart()
    } else if (!visible) {
      cleanupChart()
    }
  }
)

watch(
  () => props.loading,
  (loading) => {
    if (!loading && props.show) {
      renderChart()
    }
  }
)

watch(
  () => props.history,
  () => {
    if (props.show && !props.loading) {
      renderChart()
    }
  },
  { deep: true }
)

watch(isDarkMode, () => {
  if (props.show && !props.loading) {
    renderChart()
  }
})

onUnmounted(() => {
  cleanupChart()
})
</script>
