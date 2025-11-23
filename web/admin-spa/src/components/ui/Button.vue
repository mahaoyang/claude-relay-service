<template>
  <button :class="buttonClass" :disabled="disabled || loading" :type="type" v-bind="$attrs">
    <!-- Loading 图标 -->
    <span v-if="loading" :class="styles.loadingIcon">
      <svg
        class="h-4 w-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        ></path>
      </svg>
    </span>

    <!-- 按钮内容 -->
    <span :class="{ [styles.loadingContent]: loading }">
      <!-- 左侧图标 -->
      <component :is="icon" v-if="icon && iconPosition === 'left'" class="h-4 w-4" />

      <!-- 文本内容 -->
      <slot />

      <!-- 右侧图标 -->
      <component :is="icon" v-if="icon && iconPosition === 'right'" class="h-4 w-4" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/ui/useTheme'

const props = defineProps({
  /**
   * 按钮类型
   */
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  /**
   * 按钮变体
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'danger', 'success', 'ghost', 'outline'].includes(value)
  },
  /**
   * 按钮尺寸
   */
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * 是否加载中
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * 图标组件
   */
  icon: {
    type: [Object, Function],
    default: null
  },
  /**
   * 图标位置
   */
  iconPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  }
})

const { styles, cn } = useTheme('button')

const buttonClass = computed(() => {
  return cn(
    styles.base,
    styles.sizes[props.size],
    styles.variants[props.variant],
    props.loading && styles.loading
  )
})
</script>
