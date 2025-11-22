<template>
 <div>
 <div
 >
 <!-- 基础信息 / 批量概要 -->
 <div>
 <header>
 
 <h3>{{ multiKeyMode ? '批量查询概要' : 'API Key 信息' }}</h3>
 </header>

 <div v-if="multiKeyMode && aggregatedStats">
 <div>
 <p>查询 Keys 数</p>
 <p>{{ aggregatedStats.totalKeys }} 个</p>
 </div>
 <div>
 <p>有效 Keys 数</p>
 <p>
 {{ aggregatedStats.activeKeys }} 个
 </p>
 </div>
 <div v-if="invalidKeys.length > 0">
 <p>无效 Keys 数</p>
 <p>
 {{ invalidKeys.length }} 个
 </p>
 </div>
 <div>
 <p>总请求数</p>
 <p>{{ formatNumber(aggregatedStats.usage.requests) }}</p>
 </div>
 <div>
 <p>总 Token 数</p>
 <p>{{ formatNumber(aggregatedStats.usage.allTokens) }}</p>
 </div>
 <div>
 <p>总费用</p>
 <p>
 {{ aggregatedStats.usage.formattedCost }}
 </p>
 </div>
 <div v-if="individualStats.length > 1">
 <p>Top 3 贡献占比</p>
 <div>
 <div v-for="stat in topContributors" :key="stat.apiId">
 <span>{{ stat.name }}</span>
 <span>{{ calculateContribution(stat) }}%</span>
 </div>
 </div>
 </div>
 </div>

 <div v-else>
 <div>
 <p>名称</p>
 <p>{{ statsData.name }}</p>
 </div>
 <div>
 <p>状态</p>
 <p
 >
 
 {{ statsData.isActive ? '活跃' : '已停用' }}
 </p>
 </div>
 <div>
 <p>权限</p>
 <p>{{ formatPermissions(statsData.permissions) }}</p>
 </div>
 <div>
 <p>创建时间</p>
 <p>{{ formatDate(statsData.createdAt) }}</p>
 </div>
 <div>
 <p>过期时间</p>
 <div>
 <template v-if="statsData.expirationMode === 'activation' && !statsData.isActivated">
 <span >
 未激活
 </span>
 <span>
 首次使用后
 {{ statsData.activationDays || (statsData.activationUnit === 'hours' ? 24 : 30) }}
 {{ statsData.activationUnit === 'hours' ? '小时' : '天' }}过期
 </span>
 </template>
 <template v-else-if="statsData.expiresAt">
 <span
 v-if="isApiKeyExpired(statsData.expiresAt)"
 
 >
 已过期
 </span>
 <span
 v-else-if="isApiKeyExpiringSoon(statsData.expiresAt)"
 
 >
 {{ formatExpireDate(statsData.expiresAt) }}
 </span>
 <span v-else>{{ formatExpireDate(statsData.expiresAt) }}</span>
 </template>
 <template v-else>
 <span >
 永不过期
 </span>
 </template>
 </div>
 </div>
 </div>
 </div>

 <!-- 使用统计概览 -->
 <div>
 <header>
 
 <h3>使用统计概览</h3>
 <span>{{ statsPeriod === 'daily' ? '今日' : '本月' }}</span>
 </header>
 <div>
 <div>
 <p>
 {{ formatNumber(currentPeriodData.requests) }}
 </p>
 <p>{{ statsPeriod === 'daily' ? '今日' : '本月' }}请求数</p>
 </div>
 <div>
 <p>
 {{ formatNumber(currentPeriodData.allTokens) }}
 </p>
 <p>{{ statsPeriod === 'daily' ? '今日' : '本月' }}Token 数</p>
 </div>
 <div>
 <p>
 {{ currentPeriodData.formattedCost || '$0.000000' }}
 </p>
 <p>{{ statsPeriod === 'daily' ? '今日' : '本月' }}费用</p>
 </div>
 <div>
 <p>
 {{ formatNumber(currentPeriodData.inputTokens) }}
 </p>
 <p>{{ statsPeriod === 'daily' ? '今日' : '本月' }}输入 Token</p>
 </div>
 </div>
 </div>
 </div>

 <!-- 专属账号运行状态，仅在单 key 且存在绑定时显示 -->
 <div v-if="!multiKeyMode && boundAccountList.length > 0">
 <header>
 
 <h3>专属账号运行状态</h3>
 <span>实时更新</span>
 </header>

 <div>
 <div
 v-for="account in boundAccountList"
 :key="account.id || account.key"
 >
 <div>
 <div>
 <span
 >
 
 </span>
 <div>
 <p>{{ getAccountLabel(account) }}</p>
 <p>
 {{ account.platform === 'claude' ? '会话窗口' : '额度窗口' }}
 </p>
 </div>
 </div>
 <div
 v-if="getRateLimitDisplay(account.rateLimitStatus)"
 >
 
 {{ getRateLimitDisplay(account.rateLimitStatus).text }}
 </div>
 </div>

 <div v-if="account.platform === 'claude'">
 <div>
 <div>
 <div
 />
 </div>
 <span>
 {{ Math.min(100, Math.max(0, Math.round(account.sessionWindow?.progress || 0))) }}%
 </span>
 </div>
 <div>
 <span>
 {{
 formatSessionWindowRange(
 account.sessionWindow?.windowStart,
 account.sessionWindow?.windowEnd
 )
 }}
 </span>
 <span
 v-if="account.sessionWindow?.remainingTime > 0"
 >
 剩余 {{ formatSessionRemaining(account.sessionWindow.remainingTime) }}
 </span>
 </div>
 </div>

 <div v-else-if="account.platform === 'openai'">
 <div v-if="account.codexUsage">
 <div
 v-for="type in ['primary', 'secondary']"
 :key="`${account.key}-${type}`"
 >
 <div>
 <span>
 {{ getCodexWindowLabel(type) }}
 </span>
 <span>
 {{ formatCodexUsagePercent(account.codexUsage?.[type]) }}
 </span>
 </div>
 <div>
 <div
 />
 </div>
 <div>
 重置剩余 {{ formatCodexRemaining(account.codexUsage?.[type]) }}
 </div>
 </div>
 </div>
 <p
 v-else
 >
 暂无额度使用数据
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const {
 statsData,
 statsPeriod,
 currentPeriodData,
 multiKeyMode,
 aggregatedStats,
 individualStats,
 invalidKeys
} = storeToRefs(apiStatsStore)

const topContributors = computed(() => {
 if (!individualStats.value || individualStats.value.length === 0) return []
 return [...individualStats.value]
 .sort((a, b) => (b.usage?.allTokens || 0) - (a.usage?.allTokens || 0))
 .slice(0, 3)
})

const calculateContribution = (stat) => {
 if (!aggregatedStats.value || !aggregatedStats.value.usage.allTokens) return 0
 const percentage = ((stat.usage?.allTokens || 0) / aggregatedStats.value.usage.allTokens) * 100
 return percentage.toFixed(1)
}

const formatDate = (dateString) => {
 if (!dateString) return '无'
 try {
 return dayjs(dateString).format('YYYY年MM月DD日 HH:mm')
 } catch (error) {
 return '格式错误'
 }
}

const formatExpireDate = (dateString) => {
 if (!dateString) return ''
 const date = new Date(dateString)
 return date.toLocaleString('zh-CN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit'
 })
}

const isApiKeyExpired = (expiresAt) => {
 if (!expiresAt) return false
 return new Date(expiresAt) < new Date()
}

const isApiKeyExpiringSoon = (expiresAt) => {
 if (!expiresAt) return false
 const expireDate = new Date(expiresAt)
 const now = new Date()
 const daysUntilExpire = (expireDate - now) / (1000 * 60 * 60 * 24)
 return daysUntilExpire > 0 && daysUntilExpire <= 7
}

const formatNumber = (num) => {
 if (typeof num !== 'number') num = parseInt(num) || 0
 if (num === 0) return '0'
 if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
 if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
 return num.toLocaleString()
}

const formatPermissions = (permissions) => {
 const map = {
 claude: 'Claude',
 gemini: 'Gemini',
 all: '全部模型'
 }
 return map[permissions] || permissions || '未知'
}

const boundAccountList = computed(() => {
 const accounts = statsData.value?.accounts?.details
 if (!accounts) return []
 const result = []
 if (accounts.claude && accounts.claude.accountType === 'dedicated') {
 result.push({ key: 'claude', ...accounts.claude })
 }
 if (accounts.openai && accounts.openai.accountType === 'dedicated') {
 result.push({ key: 'openai', ...accounts.openai })
 }
 return result
})

const accountGridClass = computed(() => {
 const count = boundAccountList.value.length
 if (count <= 1) {
 return 'md:grid-cols-1 lg:grid-cols-1'
 }
 if (count === 2) {
 return 'md:grid-cols-2'
 }
 return 'md:grid-cols-2 xl:grid-cols-3'
})

const getAccountLabel = (account) => {
 if (!account) return '专属账号'
 return account.platform === 'openai' ? 'OpenAI 专属账号' : 'Claude 专属账号'
}

const formatRateLimitTime = (minutes) => {
 if (!minutes || minutes <= 0) return ''
 const total = Math.floor(minutes)
 const days = Math.floor(total / 1440)
 const hours = Math.floor((total % 1440) / 60)
 const mins = total % 60
 if (days > 0) return hours > 0 ? `${days}天${hours}小时` : `${days}天`
 if (hours > 0) return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
 return `${mins}分钟`
}

const getRateLimitDisplay = (status) => {
 if (!status) {
 return {
 text: '状态未知',
 class: ''
 }
 }
 if (status.isRateLimited) {
 const remaining = formatRateLimitTime(status.minutesRemaining)
 const suffix = remaining ? ` · 剩余约 ${remaining}` : ''
 return {
 text: `限流中${suffix}`,
 class: ' dark:'
 }
 }
 return {
 text: '未限流',
 class: ' dark:'
 }
}

const formatSessionWindowRange = (start, end) => {
 if (!start || !end) return '暂无时间窗口信息'
 const s = new Date(start)
 const e = new Date(end)
 const fmt = (d) => `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
 return `${fmt(s)} - ${fmt(e)}`
}

const formatSessionRemaining = (minutes) => {
 if (!minutes || minutes <= 0) return ''
 const hours = Math.floor(minutes / 60)
 const mins = minutes % 60
 return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const getSessionProgressBarClass = (status, account) => {
 if (!status) return ' '
 if (account?.rateLimitStatus?.isRateLimited) return ' '
 const normalized = String(status).toLowerCase()
 if (normalized === 'rejected') return ' '
 if (normalized === 'allowed_warning') return ' '
 return ' '
}

const normalizeCodexUsagePercent = (usageItem) => {
 if (!usageItem) return null
 const percent =
 typeof usageItem.usedPercent === 'number' && !Number.isNaN(usageItem.usedPercent)
 ? usageItem.usedPercent
 : null
 const resetAfterSeconds =
 typeof usageItem.resetAfterSeconds === 'number' && !Number.isNaN(usageItem.resetAfterSeconds)
 ? usageItem.resetAfterSeconds
 : null
 const remainingSeconds =
 typeof usageItem.remainingSeconds === 'number' ? usageItem.remainingSeconds : null
 const resetAtMs = usageItem.resetAt ? Date.parse(usageItem.resetAt) : null
 const resetElapsed =
 resetAfterSeconds !== null &&
 ((remainingSeconds !== null && remainingSeconds <= 0) ||
 (resetAtMs !== null && !Number.isNaN(resetAtMs) && Date.now() >= resetAtMs))
 if (resetElapsed) return 0
 if (percent === null) return null
 return Math.max(0, Math.min(100, percent))
}

const getCodexUsageBarClass = (usageItem) => {
 const percent = normalizeCodexUsagePercent(usageItem)
 if (percent === null) return ' '
 if (percent >= 90) return ' '
 if (percent >= 75) return ' '
 return ' '
}

const getCodexUsageWidth = (usageItem) => {
 const percent = normalizeCodexUsagePercent(usageItem)
 if (percent === null) return '0%'
 return `${percent}%`
}

const formatCodexUsagePercent = (usageItem) => {
 const percent = normalizeCodexUsagePercent(usageItem)
 if (percent === null) return '--'
 return `${percent.toFixed(1)}%`
}

const formatCodexRemaining = (usageItem) => {
 if (!usageItem) return '--'
 let seconds = usageItem.remainingSeconds
 if (seconds === null || seconds === undefined) {
 seconds = usageItem.resetAfterSeconds
 }
 if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
 return '--'
 }
 seconds = Math.max(0, Math.floor(Number(seconds)))
 const days = Math.floor(seconds / 86400)
 const hours = Math.floor((seconds % 86400) / 3600)
 const minutes = Math.floor((seconds % 3600) / 60)
 const secs = seconds % 60
 if (days > 0) return hours > 0 ? `${days}天${hours}小时` : `${days}天`
 if (hours > 0) return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
 if (minutes > 0) return `${minutes}分钟`
 return `${secs}秒`
}

const getCodexWindowLabel = (type) => (type === 'secondary' ? '周限' : '5h')
</script>

