<template>
  <label
    class="relative flex cursor-pointer flex-col rounded-lg border-2 p-3 transition-all hover:border-primary-300 dark:hover:border-primary-600"
    :class="isSelected ? selectedClasses : unselectedClasses"
  >
    <input v-model="selected" class="sr-only" type="radio" :value="value" />
    <div class="flex flex-col">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ label }}</span>
        <span v-if="badge" :class="badgeClasses">{{ badge }}</span>
      </div>
    </div>
    <div
      v-if="isSelected"
      class="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-primary-500 dark:border-gray-800"
    ></div>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: ''
  },
  badgeColor: {
    type: String,
    default: 'blue',
    validator: (value) =>
      ['orange', 'blue', 'amber', 'purple', 'emerald', 'teal', 'sky'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isSelected = computed(() => props.modelValue === props.value)

const selectedClasses = computed(() => {
  return 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
})

const unselectedClasses = computed(() => {
  return 'border-gray-200 dark:border-gray-700'
})

const badgeClasses = computed(() => {
  const colorMap = {
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
  }

  return `rounded-full px-2 py-0.5 text-xs ${colorMap[props.badgeColor] || colorMap.blue}`
})
</script>
