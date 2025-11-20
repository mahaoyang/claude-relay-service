<template>
  <div class="theme-toggle-container">
    <button @click="handleToggle" class="theme-toggle-button" :title="themeTooltip">
      <!-- 图标 -->
      <Icon :name="currentIcon" :size="18" class="theme-icon" />

      <!-- 可选的标签文本 -->
      <span v-if="showLabel" class="theme-label">{{ themeLabel }}</span>
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

// 计算当前主题对应的图标
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

<style scoped>
.theme-toggle-container {
  display: inline-flex;
  align-items: center;
}

/* 主题切换按钮 - 玻璃态效果 */
.theme-toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  outline: none;
  position: relative;
  overflow: hidden;
}

/* 悬停效果 */
.theme-toggle-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 点击效果 */
.theme-toggle-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 聚焦效果 */
.theme-toggle-button:focus-visible {
  outline: 2px solid rgba(20, 184, 166, 0.6);
  outline-offset: 2px;
}

/* 图标动画 */
.theme-icon {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-button:hover .theme-icon {
  transform: scale(1.1);
}

.theme-toggle-button:active .theme-icon {
  transform: scale(0.95);
}

/* 标签文本 */
.theme-label {
  font-size: 0.875rem;
  line-height: 1;
}

/* 响应式 - 移动端 */
@media (max-width: 640px) {
  .theme-toggle-button {
    padding: 0.5rem;
  }

  .theme-label {
    display: none;
  }
}

/* 暗黑模式适配 */
:global(.dark) .theme-toggle-button {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(75, 85, 99, 0.3);
  color: rgba(243, 244, 246, 0.9);
}

:global(.dark) .theme-toggle-button:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(75, 85, 99, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
