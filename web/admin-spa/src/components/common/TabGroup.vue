<template>
  <div
    class="inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800"
  >
    <button
      v-for="option in options"
      :key="option.value"
      @click="handleClick(option.value)"
      class="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200"
      :class="getButtonClass(option.value)"
    >
      <!-- SVG 图标 -->
      <svg
        v-if="option.svgPath"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path :d="option.svgPath" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      </svg>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((item) => item.hasOwnProperty('value') && item.hasOwnProperty('label'))
    }
  },
  activeClass: {
    type: String,
    default: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
  },
  inactiveClass: {
    type: String,
    default: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClick = (value) => {
  emit('update:modelValue', value)
}

const getButtonClass = (value) => {
  return props.modelValue === value ? props.activeClass : props.inactiveClass
}
</script>
