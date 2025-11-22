<template>
 <div>
 <h3
 >
 <span>
 
 Token 使用分布
 </span>
 <span
 >({{ statsPeriod === 'daily' ? '今日' : '本月' }})</span
 >
 </h3>
 <div>
 <div>
 <span>
 
 输入 Token
 </span>
 <span>{{
 formatNumber(currentPeriodData.inputTokens)
 }}</span>
 </div>
 <div>
 <span>
 
 输出 Token
 </span>
 <span>{{
 formatNumber(currentPeriodData.outputTokens)
 }}</span>
 </div>
 <div>
 <span>
 
 缓存创建 Token
 </span>
 <span>{{
 formatNumber(currentPeriodData.cacheCreateTokens)
 }}</span>
 </div>
 <div>
 <span>
 
 缓存读取 Token
 </span>
 <span>{{
 formatNumber(currentPeriodData.cacheReadTokens)
 }}</span>
 </div>
 </div>
 <div>
 <div>
 <span
 >{{ statsPeriod === 'daily' ? '今日' : '本月' }}总计</span
 >
 <span>{{ formatNumber(currentPeriodData.allTokens) }}</span>
 </div>
 </div>
 </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

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

