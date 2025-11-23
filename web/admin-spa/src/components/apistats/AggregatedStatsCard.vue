<template>
  <div>
    <h3>
      <span> 使用占比 </span>
      <span>({{ statsPeriod === 'daily' ? '今日' : '本月' }})</span>
    </h3>

    <div v-if="aggregatedStats && individualStats.length > 0">
      <!-- 各Key使用占比列表 -->
      <div v-for="(stat, index) in topKeys" :key="stat.apiId">
        <div>
          <span>
            {{ stat.name || `Key ${index + 1}` }}
          </span>
          <span> {{ calculatePercentage(stat) }}% </span>
        </div>
        <div>
          <div />
        </div>
        <div>
          <span>{{ formatNumber(getStatUsage(stat)?.requests || 0) }}次</span>
          <span>{{ getStatUsage(stat)?.formattedCost || '$0.00' }}</span>
        </div>
      </div>

      <!-- 其他Keys汇总 -->
      <div v-if="otherKeysCount > 0">
        <div>
          <span>其他 {{ otherKeysCount }} 个Keys</span>
          <span>{{ otherPercentage }}%</span>
        </div>
      </div>
    </div>

    <!-- 单个Key模式提示 -->
    <div v-else-if="!multiKeyMode">
      <div>
        <p>使用占比仅在多Key查询时显示</p>
      </div>
    </div>

    <div v-else>暂无数据</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { aggregatedStats, individualStats, statsPeriod, multiKeyMode } = storeToRefs(apiStatsStore)

// 获取当前时间段的使用数据
const getStatUsage = (stat) => {
  if (!stat) return null

  if (statsPeriod.value === 'daily') {
    return stat.dailyUsage || stat.usage
  } else {
    return stat.monthlyUsage || stat.usage
  }
}

// 获取TOP Keys（最多显示5个）
const topKeys = computed(() => {
  if (!individualStats.value || individualStats.value.length === 0) return []

  return [...individualStats.value]
    .sort((a, b) => {
      const aUsage = getStatUsage(a)
      const bUsage = getStatUsage(b)
      return (bUsage?.cost || 0) - (aUsage?.cost || 0)
    })
    .slice(0, 5)
})

// 计算其他Keys数量
const otherKeysCount = computed(() => {
  if (!individualStats.value) return 0
  return Math.max(0, individualStats.value.length - 5)
})

// 计算其他Keys的占比
const otherPercentage = computed(() => {
  if (!individualStats.value || !aggregatedStats.value) return 0

  const topKeysCost = topKeys.value.reduce((sum, stat) => {
    const usage = getStatUsage(stat)
    return sum + (usage?.cost || 0)
  }, 0)
  const totalCost =
    statsPeriod.value === 'daily'
      ? aggregatedStats.value.dailyUsage?.cost || 0
      : aggregatedStats.value.monthlyUsage?.cost || 0

  if (totalCost === 0) return 0
  const otherCost = totalCost - topKeysCost
  return Math.max(0, Math.round((otherCost / totalCost) * 100))
})

// 计算单个Key的百分比
const calculatePercentage = (stat) => {
  if (!aggregatedStats.value) return 0

  const totalCost =
    statsPeriod.value === 'daily'
      ? aggregatedStats.value.dailyUsage?.cost || 0
      : aggregatedStats.value.monthlyUsage?.cost || 0

  if (totalCost === 0) return 0
  const usage = getStatUsage(stat)
  const percentage = ((usage?.cost || 0) / totalCost) * 100
  return Math.round(percentage)
}

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['', '', '', '', '']
  return colors[index] || ''
}

// 格式化数字
const formatNumber = (num) => {
  if (typeof num !== 'number') {
    num = parseInt(num) || 0
  }

  if (num === 0) return '0'

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString()
  }
}
</script>
