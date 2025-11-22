<template>
 <Teleport to="body">
 <div v-if="show">
 <!-- 背景遮罩 -->
 <div @click="close" />

 <!-- 模态框 -->
 <div
 >
 <!-- 标题栏 -->
 <div>
 <div>
 <div
 >
 
 </div>
 <h3>
 使用统计详情 - {{ apiKey.name }}
 </h3>
 </div>
 <button @click="close">
 
 </button>
 </div>

 <!-- 内容区 -->
 <div>
 <!-- 总体统计卡片 -->
 <div>
 <!-- 请求统计卡片 -->
 <div
 >
 <div>
 <span>总请求数</span>
 
 </div>
 <div>
 {{ formatNumber(totalRequests) }}
 </div>
 <div>
 今日: {{ formatNumber(dailyRequests) }} 次
 </div>
 </div>

 <!-- Token统计卡片 -->
 <div
 >
 <div>
 <span>总Token数</span>
 
 </div>
 <div>
 {{ formatTokenCount(totalTokens) }}
 </div>
 <div>
 今日: {{ formatTokenCount(dailyTokens) }}
 </div>
 </div>

 <!-- 费用统计卡片 -->
 <div
 >
 <div>
 <span>总费用</span>
 
 </div>
 <div>
 ${{ totalCost.toFixed(4) }}
 </div>
 <div>
 今日: ${{ dailyCost.toFixed(4) }}
 </div>
 </div>

 <!-- 平均统计卡片 -->
 <div
 >
 <div>
 <span>平均速率</span>
 
 </div>
 <div>
 <div>
 <span >RPM:</span>
 <span>{{ rpm }}</span>
 </div>
 <div>
 <span >TPM:</span>
 <span>{{ tpm }}</span>
 </div>
 </div>
 </div>
 </div>

 <!-- Token详细分布 -->
 <div>
 <h4
 >
 
 Token 使用分布
 </h4>
 <div>
 <div>
 <div>
 
 <span>输入 Token</span>
 </div>
 <span>
 {{ formatTokenCount(inputTokens) }}
 </span>
 </div>
 <div>
 <div>
 
 <span>输出 Token</span>
 </div>
 <span>
 {{ formatTokenCount(outputTokens) }}
 </span>
 </div>
 <div v-if="cacheCreateTokens > 0">
 <div>
 
 <span>缓存创建 Token</span>
 </div>
 <span>
 {{ formatTokenCount(cacheCreateTokens) }}
 </span>
 </div>
 <div v-if="cacheReadTokens > 0">
 <div>
 
 <span>缓存读取 Token</span>
 </div>
 <span>
 {{ formatTokenCount(cacheReadTokens) }}
 </span>
 </div>
 </div>
 </div>

 <!-- 限制信息 -->
 <div v-if="hasLimits">
 <h4
 >
 
 限制设置
 </h4>
 <div>
 <div v-if="apiKey.dailyCostLimit > 0">
 <LimitProgressBar
 :current="dailyCost"
 label="每日费用限制"
 :limit="apiKey.dailyCostLimit"
 :show-shine="true"
 type="daily"
 />
 <div>
 已使用 {{ Math.min(dailyCostPercentage, 100).toFixed(1) }}%
 </div>
 </div>

 <div v-if="apiKey.weeklyOpusCostLimit > 0">
 <LimitProgressBar
 :current="weeklyOpusCost"
 label="Opus 周费用限制"
 :limit="apiKey.weeklyOpusCostLimit"
 :show-shine="true"
 type="opus"
 />
 <div>
 已使用 {{ Math.min(opusUsagePercentage, 100).toFixed(1) }}%
 </div>
 </div>

 <div v-if="apiKey.totalCostLimit > 0">
 <LimitProgressBar
 :current="totalCost"
 label="总费用限制"
 :limit="apiKey.totalCostLimit"
 :show-shine="true"
 type="total"
 />
 <div>
 已使用 {{ Math.min(totalUsagePercentage, 100).toFixed(1) }}%
 </div>
 </div>

 <div
 v-if="apiKey.concurrencyLimit > 0"
 >
 <span >并发限制</span>
 <span>
 {{ apiKey.currentConcurrency || 0 }} / {{ apiKey.concurrencyLimit }}
 </span>
 </div>

 <div v-if="apiKey.rateLimitWindow > 0">
 <h5>
 
 时间窗口限制
 </h5>
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
 </div>

 <!-- 底部按钮 -->
 <div>
 <button type="button" @click="close">
 关闭
 </button>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import LimitProgressBar from './LimitProgressBar.vue'
import WindowCountdown from './WindowCountdown.vue'

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
</script>

