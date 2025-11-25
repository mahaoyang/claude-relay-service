<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      @click.self="handleBackdropClick"
    >
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 bg-black/50 transition-opacity" @click="handleBackdropClick" />

      <!-- 模态框 -->
      <div
        class="relative z-10 w-full rounded-lg bg-white shadow-xl dark:bg-gray-800"
        :class="sizeClasses"
      >
        <!-- 标题栏 -->
        <div
          class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
        >
          <slot name="header">
            <div class="flex items-center gap-3">
              <div
                v-if="icon"
                class="flex h-10 w-10 items-center justify-center rounded-full"
                :class="iconBgClass"
              >
                <Icon class="h-5 w-5" :class="iconColorClass" :name="icon" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title }}
              </h3>
            </div>
          </slot>
          <button
            v-if="showClose"
            class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            type="button"
            @click="close"
          >
            <Icon class="h-5 w-5" name="X" />
          </button>
        </div>

        <!-- 内容区 -->
        <div class="overflow-y-auto" :class="contentClass" :style="{ maxHeight: maxHeight }">
          <slot />
        </div>

        <!-- 底部按钮区 -->
        <div
          v-if="$slots.footer"
          class="flex justify-end gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconBgClass: {
    type: String,
    default: 'bg-primary-100 dark:bg-primary-900/30'
  },
  iconColorClass: {
    type: String,
    default: 'text-primary-600 dark:text-primary-400'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', '4xl'].includes(value)
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  contentClass: {
    type: String,
    default: 'p-6'
  },
  maxHeight: {
    type: String,
    default: 'calc(100vh - 200px)'
  }
})

const emit = defineEmits(['close', 'update:show'])

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    '4xl': 'max-w-7xl'
  }
  return sizes[props.size] || sizes.md
})

const close = () => {
  emit('close')
  emit('update:show', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}
</script>
