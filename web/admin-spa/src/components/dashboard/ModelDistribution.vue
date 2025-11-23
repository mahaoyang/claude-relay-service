<template>
  <div>
    <div>
      <h2>模型使用分布</h2>

      <el-radio-group v-model="modelPeriod" size="small" @change="handlePeriodChange">
        <el-radio-button label="daily"> 今日 </el-radio-button>
        <el-radio-button label="total"> 累计 </el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="dashboardStore.dashboardModelStats.length === 0">
      <p>暂无模型使用数据</p>
    </div>

    <div v-else>
      <!-- 饼图 -->
      <div>
        <canvas ref="chartCanvas" />
      </div>

      <!-- 数据列表 -->
      <div>
        <div v-for="(stat, index) in sortedStats" :key="stat.model">
          <div>
            <div />
            <span>{{ stat.model }}</span>
          </div>
          <div>
            <p>{{ formatNumber(stat.requests) }} 请求</p>
            <p>{{ formatNumber(stat.totalTokens) }} tokens</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Chart } from 'chart.js/auto'
import { useDashboardStore } from '@/stores/dashboard'
import { useChartConfig } from '@/composables/useChartConfig'
import { formatNumber } from '@/utils/format'

const dashboardStore = useDashboardStore()
const chartCanvas = ref(null)
let chart = null

const modelPeriod = ref('daily')

const sortedStats = computed(() => {
  return [...dashboardStore.dashboardModelStats].sort((a, b) => b.requests - a.requests)
})

const getColor = (index) => {
  const { colorSchemes } = useChartConfig()
  const colors = colorSchemes.primary
  return colors[index % colors.length]
}

const createChart = () => {
  if (!chartCanvas.value || !dashboardStore.dashboardModelStats.length) return

  if (chart) {
    chart.destroy()
  }

  const { colorSchemes } = useChartConfig()
  const colors = colorSchemes.primary

  chart = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: sortedStats.value.map((stat) => stat.model),
      datasets: [
        {
          data: sortedStats.value.map((stat) => stat.requests),
          backgroundColor: sortedStats.value.map((_, index) => colors[index % colors.length]),
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const stat = sortedStats.value[context.dataIndex]
              const percentage = (
                (stat.requests /
                  dashboardStore.dashboardModelStats.reduce((sum, s) => sum + s.requests, 0)) *
                100
              ).toFixed(1)
              return [
                `${stat.model}: ${percentage}%`,
                `请求: ${formatNumber(stat.requests)}`,
                `Tokens: ${formatNumber(stat.totalTokens)}`
              ]
            }
          }
        }
      }
    }
  })
}

const handlePeriodChange = async () => {
  await dashboardStore.loadModelStats(modelPeriod.value)
  createChart()
}

watch(
  () => dashboardStore.dashboardModelStats,
  () => {
    createChart()
  },
  { deep: true }
)

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
