<template>
  <div>
    <div>
      <div>
        <p>
          {{ title }}
        </p>
        <p>
          {{ value }}
        </p>
        <p v-if="subtitle">
          {{ subtitle }}
        </p>
      </div>
      <div>
        <i />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: 'primary'
  }
})

const iconBgClass = computed(() => {
  const colorMap = {
    primary: ' ',
    success: ' ',
    warning: ' ',
    danger: ' ',
    info: ' '
  }
  return colorMap[props.iconColor] || colorMap.primary
})
</script>
