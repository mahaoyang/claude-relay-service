<template>
 <div>
 <!-- 检查是否为无限制状态 -->
 <div
 v-if="!limit || limit <= 0"
 >
 <div>
 
 <span>无限制</span>
 </div>
 </div>
 <div v-else-if="isCompact">
 <!-- 使用额度和限额显示在进度条上方右对齐 -->
 <div>
 <div>
 <i />
 <span>{{ label }}</span>
 </div>
 <span 
 >${{ current.toFixed(2) }} / ${{ limit.toFixed(2) }}</span
 >
 </div>
 <div>
 <div
 ></div>
 </div>
 </div>
 <div
 v-else
 >
 <!-- 背景层 -->
 <div></div>

 <!-- 进度条层 -->
 <div
 ></div>

 <!-- 内部高光边框 -->
 <div
 ></div>

 <!-- 文字层 - 使用双层文字技术确保可读性 -->
 <div>
 <div>
 <i />
 <span>{{ label }}</span>
 </div>
 <div>
 <span>
 ${{ current.toFixed(2) }} / ${{ limit.toFixed(2) }}
 </span>
 </div>
 </div>

 <!-- 闪光效果（可选） -->
 <div
 v-if="showShine && progress > 0"
 ></div>
 </div>
 </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
 type: {
 type: String,
 required: true,
 validator: (value) => ['daily', 'opus', 'window', 'total'].includes(value)
 },
 variant: {
 type: String,
 default: 'full',
 validator: (value) => ['full', 'compact'].includes(value)
 },
 label: {
 type: String,
 required: true
 },
 current: {
 type: Number,
 default: 0
 },
 limit: {
 type: Number,
 required: true
 },
 showShine: {
 type: Boolean,
 default: false
 }
})

const isCompact = computed(() => props.variant === 'compact')
const progress = computed(() => {
 // 无限制时不显示进度条
 if (!props.limit || props.limit <= 0) return 0
 const percentage = (props.current / props.limit) * 100
 return Math.min(percentage, 100)
})

// 移除百分比显示
// const compactPercentage = computed(() => `${Math.min(progress.value, 100).toFixed(0)}%`)

// 容器样式 - 使用柔和的渐变边框与阴影
const containerClass = computed(() => {
 switch (props.type) {
 case 'daily':
 return ' -[0_10px_24px_rgba(16,185,129,0.18)] group-hover:-[0_14px_30px_rgba(16,185,129,0.22)] dark: dark: dark:-[0_12px_28px_rgba(0,0,0,0.45)]'
 case 'opus':
 return ' -[0_10px_24px_rgba(139,92,246,0.18)] group-hover:-[0_14px_30px_rgba(139,92,246,0.22)] dark: dark: dark:-[0_12px_28px_rgba(0,0,0,0.45)]'
 case 'window':
 return ' -[0_10px_24px_rgba(56,189,248,0.18)] group-hover:-[0_14px_30px_rgba(56,189,248,0.22)] dark: dark: dark:-[0_12px_28px_rgba(0,0,0,0.45)]'
 case 'total':
 return ' -[0_10px_24px_rgba(59,130,246,0.18)] group-hover:-[0_14px_30px_rgba(59,130,246,0.22)] dark: dark: dark:-[0_12px_28px_rgba(0,0,0,0.45)]'
 default:
 return ' -[0_10px_24px_rgba(148,163,184,0.18)] group-hover:-[0_14px_30px_rgba(148,163,184,0.22)] dark: dark: dark:-[0_12px_28px_rgba(0,0,0,0.45)]'
 }
})

// 背景样式 - 使用柔和渐变增强层次
const backgroundClass = computed(() => {
 switch (props.type) {
 case 'daily':
 return ' dark: dark: dark:'
 case 'opus':
 return ' dark: dark: dark:'
 case 'window':
 return ' dark: dark: dark:'
 case 'total':
 return ' dark: dark: dark:'
 default:
 return ' dark: dark: dark:'
 }
})

// 进度条样式 - 使用更柔和的颜色配置
const progressBarClass = computed(() => {
 const p = progress.value

 if (props.type === 'daily') {
 if (p >= 90) {
 return ' dark: dark: dark:'
 } else if (p >= 70) {
 return ' dark: dark: dark:'
 } else {
 return ' dark: dark: dark:'
 }
 }

 if (props.type === 'opus') {
 if (p >= 90) {
 return ' dark: dark: dark:'
 } else if (p >= 70) {
 return ' dark: dark: dark:'
 } else {
 return ' dark: dark: dark:'
 }
 }

 if (props.type === 'window') {
 if (p >= 90) {
 return ' dark: dark: dark:'
 } else if (p >= 70) {
 return ' dark: dark: dark:'
 } else {
 return ' dark: dark: dark:'
 }
 }

 if (props.type === 'total') {
 if (p >= 90) {
 return ' dark: dark: dark:'
 } else if (p >= 70) {
 return ' dark: dark: dark:'
 } else {
 return ' dark: dark: dark:'
 }
 }

 return ' dark:'
})

const compactBarClass = computed(() => {
 const p = progress.value

 if (p >= 95) {
 return ' dark:'
 }
 if (p >= 80) {
 return ' dark:'
 }

 switch (props.type) {
 case 'daily':
 return ' dark:'
 case 'opus':
 return ' dark:'
 case 'window':
 return ' dark:'
 case 'total':
 return ' dark:'
 default:
 return ' dark:'
 }
})

const compactLabelClass = computed(() => {
 const p = progress.value

 if (p >= 95) {
 return ' dark:'
 }
 if (p >= 80) {
 return ' dark:'
 }

 switch (props.type) {
 case 'daily':
 return ' dark:'
 case 'opus':
 return ' dark:'
 case 'window':
 return ' dark:'
 case 'total':
 return ' dark:'
 default:
 return ' dark:'
 }
})

// 图标类
const iconClass = computed(() => {
 const p = progress.value

 // 根据进度选择图标颜色
 let colorClass = ''
 if (p >= 90) {
 colorClass = ' dark:'
 } else if (p >= 70) {
 colorClass = ' dark:'
 } else {
 switch (props.type) {
 case 'daily':
 colorClass = ' dark:'
 break
 case 'opus':
 colorClass = ' dark:'
 break
 case 'window':
 colorClass = ' dark:'
 break
 default:
 colorClass = ' dark:'
 }
 }

 let iconName = ''
 switch (props.type) {
 case 'daily':
 iconName = 'fas fa-calendar-day'
 break
 case 'opus':
 iconName = 'fas fa-gem'
 break
 case 'window':
 iconName = 'fas fa-clock'
 break
 case 'total':
 iconName = 'fas fa-wallet'
 break
 default:
 iconName = 'fas fa-infinity'
 }

 return `${iconName} ${colorClass}`
})

// 标签文字颜色 - 始终保持高对比度
const labelTextClass = computed(() => {
 const p = progress.value

 // 根据进度条背景色智能选择文字颜色
 if (p > 40) {
 // 当进度条覆盖超过40%时，使用白色文字
 return ' drop--[0_1px_2px_rgba(0,0,0,0.8)]'
 } else {
 // 在浅色背景上使用深色文字
 switch (props.type) {
 case 'daily':
 return ' dark:'
 case 'opus':
 return ' dark:'
 case 'window':
 return ' dark:'
 case 'total':
 return ' dark:'
 default:
 return ' dark:'
 }
 }
})

// 当前值文字颜色 - 最重要的数字，需要最高对比度
const currentValueClass = computed(() => {
 const p = progress.value

 // 判断数值是否在进度条上
 if (p > 70) {
 // 在彩色进度条上，使用白色+强阴影
 return ' drop--[0_2px_4px_rgba(0,0,0,0.9)]'
 } else {
 // 在浅色背景上，根据进度状态选择颜色
 if (p >= 90) {
 return ' dark:'
 } else if (p >= 70) {
 return ' dark:'
 } else {
 switch (props.type) {
 case 'daily':
 return ' dark:'
 case 'opus':
 return ' dark:'
 case 'window':
 return ' dark:'
 case 'total':
 return ' dark:'
 default:
 return ' dark:'
 }
 }
 }
})
</script>

