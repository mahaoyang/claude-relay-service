<template>
  <div
    class="min-h-screen transition-colors duration-300"
    :class="{ 'bg-gray-50 dark:bg-dark-bg': !transparent }"
  >
    <!-- 背景装饰 -->
    <div v-if="!transparent" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        class="absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-primary-50/50 to-transparent opacity-60 blur-3xl dark:from-primary-900/10"
      ></div>
    </div>

    <div class="container relative z-10 mx-auto" :class="[maxWidthClass, paddingClass]">
      <!-- 顶部导航/头部 -->
      <header v-if="$slots.header" class="mb-3">
        <slot name="header"></slot>
      </header>

      <!-- 主要内容 -->
      <slot></slot>

      <!-- 页脚 -->
      <footer
        v-if="showFooter"
        class="mt-12 pb-8 text-center text-sm text-gray-400 dark:text-gray-600"
      >
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
  },
  transparent: {
    type: Boolean,
    default: false
  }
})

const maxWidthClass = computed(() => {
  if (props.maxWidth === 'full') return 'max-w-full'
  return `max-w-${props.maxWidth}`
})

const paddingClass = computed(() => {
  return props.transparent ? 'px-0 py-0' : 'px-4 py-5'
})
</script>
