<template>
 <div>
 <div>
 <h2>
 
 使用趋势
 </h2>

 <div>
 <el-radio-group v-model="granularity" size="small" @change="handleGranularityChange">
 <el-radio-button label="day"> 按天 </el-radio-button>
 <el-radio-button label="hour"> 按小时 </el-radio-button>
 </el-radio-group>

 <el-select
 v-model="trendPeriod"
 size="small"
 @change="handlePeriodChange"
 >
 <el-option
 v-for="period in periodOptions"
 :key="period.days"
 :label="`最近${period.days}天`"
 :value="period.days"
 />
 </el-select>
 </div>
 </div>

 <div>
 <canvas ref="chartCanvas" />
 </div>
 </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import { useDashboardStore } from '@/stores/dashboard'
import { useChartConfig } from '@/composables/useChartConfig'

const dashboardStore = useDashboardStore()
const chartCanvas = ref(null)
let chart = null

const trendPeriod = ref(7)
const granularity = ref('day')

const periodOptions = [
 { days: 1, label: '24小时' },
 { days: 7, label: '7天' },
 { days: 30, label: '30天' }
]

const createChart = () => {
 if (!chartCanvas.value || !dashboardStore.trendData.length) return

 if (chart) {
 chart.destroy()
 }

 const { getGradient, lineChartStyle } = useChartConfig()
 const ctx = chartCanvas.value.getContext('2d')

 const labels = dashboardStore.trendData.map((item) => {
 if (granularity.value === 'hour') {
 // 小时粒度使用hour字段
 const date = new Date(item.hour)
 const month = String(date.getMonth() + 1).padStart(2, '0')
 const day = String(date.getDate()).padStart(2, '0')
 const hour = String(date.getHours()).padStart(2, '0')
 return `${month}/${day} ${hour}:00`
 }
 return item.date
 })

 chart = new Chart(ctx, {
 type: 'line',
 data: {
 labels,
 datasets: [
 {
 label: '请求次数',
 data: dashboardStore.trendData.map((item) => item.requests),
 borderColor: '#14b8a6',
 backgroundColor: getGradient(ctx, '#14b8a6', 0.15),
 yAxisID: 'y',
 ...lineChartStyle
 },
 {
 label: 'Token使用量',
 data: dashboardStore.trendData.map((item) => item.tokens),
 borderColor: '#2dd4bf',
 backgroundColor: getGradient(ctx, '#2dd4bf', 0.15),
 yAxisID: 'y1',
 ...lineChartStyle
 }
 ]
 },
 options: {
 responsive: true,
 maintainAspectRatio: false,
 interaction: {
 mode: 'nearest',
 axis: 'x',
 intersect: false
 },
 plugins: {
 legend: {
 position: 'top',
 labels: {
 usePointStyle: true,
 pointStyle: 'circle',
 padding: 16,
 font: {
 size: 12,
 weight: '500'
 },
