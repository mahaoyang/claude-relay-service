<template>
 <Teleport to="body">
 <div
 v-if="show"
 >
 <div @click="handleClose" />
 <div
 >
 <!-- 顶部栏 -->
 <div
 >
 <div>
 <div
 >
 <Icon name="AreaChart" />
 </div>
 <div>
 <div>
 <h3>
 {{ account?.name || account?.email || '账号使用详情' }}
 </h3>
 <span
 v-if="account?.platform"
 >
 <Icon name="Layers" />{{ platformLabel }}
 </span>
 <span
 v-if="account?.accountType"
 >
 <Icon name="UserCog" />{{ accountTypeLabel }}
 </span>
 </div>
 <p>
 近 {{ summary?.days || 30 }} 天内的费用与请求趋势
 <span v-if="summary?.actualDaysUsed && summary?.actualDaysUsed < summary?.days">
 (日均基于实际使用 {{ summary.actualDaysUsed }} 天)
 </span>
 </p>
 </div>
 </div>
 <button
 @click="handleClose"
 >
 <Icon name="X" />
 </button>
 </div>

 <!-- 内容区域 -->
 <div>
 <div v-if="loading">
 <div />
 </div>
 <template v-else>
 <!-- 关键指标 -->
 <div>
 <div
 v-for="metric in primaryMetrics"
 :key="metric.key"
 >
 <div>
 <div>
 <p
 >
 {{ metric.label }}
 </p>
 <p>
 {{ metric.value }}
 </p>
 <p>
 {{ metric.subtitle }}
 </p>
 </div>
 <div
 >
 <i></i>
 </div>
 </div>
 </div>
 </div>

 <!-- 今日与峰值 -->
 <div>
 <div
 >
 <div
 >
 <Icon name="Sun" />
 今日概览
 </div>
 <div
 >
 <div>
 <span>费用</span>
 <span>{{
 summary?.today?.costFormatted || '$0.000000'
 }}</span>
 </div>
 <div>
 <span>请求</span>
 <span>{{
 formatNumber(summary?.today?.requests || 0)
 }}</span>
 </div>
 <div
 >
 <span>Tokens</span>
 <span>{{ formatNumber(summary?.today?.tokens || 0) }}</span>
 </div>
 </div>
 </div>

 <div
 >
 <div
 >
 <Icon name="Crown" />
 最高费用日
 </div>
 <div
 >
 <div>
 <span>日期</span>
 <span>{{
 formatDate(summary?.highestCostDay?.date)
 }}</span>
 </div>
 <div>
 <span>费用</span>
 <span>{{
 summary?.highestCostDay?.formattedCost || '$0.000000'
 }}</span>
 </div>
 <div
 >
 <span>请求</span>
 <span>{{
 formatNumber(findHistoryValue(summary?.highestCostDay?.date, 'requests'))
 }}</span>
 </div>
 </div>
 </div>

 <div
 >
 <div
 >
 <Icon name="BarChart3" />
 最高请求日
 </div>
 <div
 >
 <div>
 <span>日期</span>
 <span>{{
 formatDate(summary?.highestRequestDay?.date)
 }}</span>
 </div>
 <div>
 <span>请求</span>
 <span>{{
 formatNumber(summary?.highestRequestDay?.requests || 0)
 }}</span>
 </div>
 <div
 >
 <span>费用</span>
 <span>{{
 formatCost(findHistoryValue(summary?.highestRequestDay?.date, 'cost'))
 }}</span>
 </div>
 </div>
 </div>
 </div>

 <!-- 综合统计 -->
 <div>
 <div
 >
 <h4
 >
 <Icon name="Database" /> 累计 Token
 </h4>
 <div>
 <div>
 <span>30天总计</span>
 <span>{{
 formatNumber(totalTokens)
 }}</span>
 </div>
 <div>
 <span>日均 Token</span>
 <span>{{
 formatNumber(Math.round(summary?.avgDailyTokens || 0))
 }}</span>
 </div>
 <div
 >
 <span>输入 / 输出</span>
 <span
 >{{ formatNumber(overviewInputTokens) }} /
 {{ formatNumber(overviewOutputTokens) }}</span
 >
 </div>
 </div>
 </div>
 <div
 >
 <h4
 >
 <Icon name="Gauge" /> 平均速率
 </h4>
 <div>
 <div>
 <span>RPM</span>
 <span>{{
 overview?.averages?.rpm ?? 0
 }}</span>
 </div>
 <div>
 <span>TPM</span>
 <span>{{
 overview?.averages?.tpm ?? 0
 }}</span>
 </div>
 <div
 >
 <span>日均请求 / Token</span>
 <span
 >{{
 formatNumber(
 Math.round((overview?.averages?.dailyRequests || 0) * 100) / 100
 )
 }}
 /
 {{
 formatNumber(Math.round((overview?.averages?.dailyTokens || 0) * 100) / 100)
 }}</span
 >
 </div>
 </div>
 </div>
 <div
 >
 <h4
 >
 <Icon name="Layers" /> 最近统计
 </h4>
 <div>
 <div>
 <span>今日请求</span>
 <span>{{
 formatNumber(overview?.daily?.requests || 0)
 }}</span>
 </div>
 <div>
 <span>今日 Token</span>
 <span>{{
 formatNumber(overview?.daily?.allTokens || 0)
 }}</span>
 </div>
 <div
 >
 <span>今日费用</span>
 <span>{{ formatCost(overview?.daily?.cost || 0) }}</span>
 </div>
 </div>
 </div>
 </div>

 <!-- 折线图 -->
 <div
 >
 <div>
 <h4
 >
 <Icon name="LineChart" /> 30天费用与请求趋势
 </h4>
 <span>
 最新更新时间：{{ formatDateTime(generatedAtDisplay) }}
 </span>
 </div>
 <div>
 <canvas ref="chartCanvas" />
 </div>
 </div>
 </template>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto'
import { useThemeStore } from '@/stores/theme'

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
 cost: '#3b82f6',
 costFill: 'rgba(59, 130, 246, 0.15)',
 requests: '#f97316'
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

