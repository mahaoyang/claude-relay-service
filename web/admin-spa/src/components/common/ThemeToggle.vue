<template>
  <div>
    <button :title="themeTooltip" @click="handleToggle">
      <!-- 图标 -->

      <!-- 可选的标签文本 -->
      <span v-if="showLabel">{{ themeLabel }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
})

// Store
const themeStore = useThemeStore()

// eslint-disable-next-line no-unused-vars
const currentIcon = computed(() => {
  const iconMap = {
    light: 'Sun',
    dark: 'Moon',
    auto: 'Monitor'
  }
  return iconMap[themeStore.themeMode] || 'Monitor'
})

// 计算当前主题对应的标签
const themeLabel = computed(() => {
  const labelMap = {
    light: '浅色',
    dark: '深色',
    auto: '自动'
  }
  return labelMap[themeStore.themeMode] || '自动'
})

// 计算提示文本
const themeTooltip = computed(() => {
  const tooltipMap = {
    light: '切换到深色模式',
    dark: '切换到自动模式',
    auto: '切换到浅色模式'
  }
  return tooltipMap[themeStore.themeMode] || '切换主题'
})

// 处理点击事件 - 循环切换主题
const handleToggle = () => {
  themeStore.cycleThemeMode()
}
</script>
