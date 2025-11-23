<template>
  <div>
    <!-- 检查是否为无限制状态 -->
    <div v-if="!limit || limit <= 0">
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
        <span>${{ current.toFixed(2) }} / ${{ limit.toFixed(2) }}</span>
      </div>
      <div>
        <div></div>
      </div>
    </div>
    <div v-else>
      <!-- 背景层 -->
      <div></div>

      <!-- 进度条层 -->
      <div></div>

      <!-- 内部高光边框 -->
      <div></div>

      <!-- 文字层 - 使用双层文字技术确保可读性 -->
      <div>
        <div>
          <i />
          <span>{{ label }}</span>
        </div>
        <div>
          <span> ${{ current.toFixed(2) }} / ${{ limit.toFixed(2) }} </span>
        </div>
      </div>

      <!-- 闪光效果（可选） -->
      <div v-if="showShine && progress > 0"></div>
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
</script>
