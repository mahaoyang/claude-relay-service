<template>
  <div class="theme-toggle-container">
    <ToggleGroupRoot
      :model-value="themeStore.themeMode"
      @update:model-value="selectTheme"
      type="single"
      class="toggle-group"
    >
      <ToggleGroupItem value="light" class="toggle-item">
        <Icon name="Sun" :size="16" />
        <span v-if="showLabel" class="toggle-label">浅色</span>
      </ToggleGroupItem>

      <ToggleGroupItem value="auto" class="toggle-item">
        <Icon name="Monitor" :size="16" />
        <span v-if="showLabel" class="toggle-label">自动</span>
      </ToggleGroupItem>

      <ToggleGroupItem value="dark" class="toggle-item">
        <Icon name="Moon" :size="16" />
        <span v-if="showLabel" class="toggle-label">深色</span>
      </ToggleGroupItem>
    </ToggleGroupRoot>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { ToggleGroupRoot, ToggleGroupItem } from 'radix-vue'

// Props
defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
})

// Store
const themeStore = useThemeStore()

// 方法
const selectTheme = (value) => {
  if (value) {
    themeStore.setThemeMode(value)
  }
}
</script>

<style scoped>
.theme-toggle-container {
  display: inline-flex;
  align-items: center;
}

/* Toggle Group - 简洁的分段控制 */
.toggle-group {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.25rem;
  gap: 0.25rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Toggle Item */
.toggle-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  outline: none;
}

.toggle-item:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
}

.toggle-item[data-state='on'] {
  background: rgba(20, 184, 166, 0.9);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 图标颜色 */
.toggle-item[data-state='on'] :deep(svg) {
  color: #ffffff;
}

.toggle-item :deep(svg) {
  flex-shrink: 0;
}

/* Label */
.toggle-label {
  font-size: 0.875rem;
}

/* 响应式 */
@media (max-width: 640px) {
  .toggle-item {
    padding: 0.375rem 0.5rem;
  }

  .toggle-label {
    display: none;
  }
}
</style>
