<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10 blur-3xl opacity-60"
      ></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-8" :class="maxWidthClass">
      <!-- 顶部导航/头部 -->
      <header v-if="$slots.header" class="mb-10">
        <slot name="header"></slot>
      </header>

      <!-- 主要内容 -->
      <slot></slot>

      <!-- 页脚 -->
      <footer v-if="showFooter" class="mt-12 text-center text-sm text-gray-400 dark:text-gray-600 pb-8">
        <slot name="footer">
          <p>&copy; {{ new Date().getFullYear() }} Claude Relay Service. All rights reserved.</p>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  maxWidth: {
    type: String,
    default: '5xl', // 5xl, 6xl, 7xl, full
    validator: (value) => ['5xl', '6xl', '7xl', 'full'].includes(value)
  },
  showFooter: {
    type: Boolean,
    default: true
  }
})

const maxWidthClass = computed(() => {
  if (props.maxWidth === 'full') return 'max-w-full'
  return `max-w-${props.maxWidth}`
})
</script>
