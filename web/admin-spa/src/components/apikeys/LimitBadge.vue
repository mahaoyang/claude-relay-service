<template>
  <div>
    <div>
      <i />
      <span>{{ label }}</span>
    </div>
    <div>
      <span>${{ current.toFixed(2) }}</span>
      <span>/</span>
      <span>${{ limit.toFixed(2) }}</span>
    </div>
    <!-- 小型进度条 -->
    <div>
      <div />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['daily', 'opus', 'window'].includes(value)
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
  }
})

const progress = computed(() => {
  if (!props.limit || props.limit === 0) return 0
  const percentage = (props.current / props.limit) * 100
  return Math.min(percentage, 100)
})
</script>
