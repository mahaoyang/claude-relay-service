<script setup>
import { Switch as HeadlessSwitch } from '@headlessui/vue'

defineProps({
  modelValue: Boolean,
  label: {
    type: String,
    default: ''
  },
  disabled: Boolean,
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

defineEmits(['update:modelValue'])

const sizeClasses = {
  sm: {
    container: 'h-5 w-9',
    toggle: 'h-3 w-3',
    translateOn: 'translate-x-5',
    translateOff: 'translate-x-1'
  },
  md: {
    container: 'h-6 w-11',
    toggle: 'h-4 w-4',
    translateOn: 'translate-x-6',
    translateOff: 'translate-x-1'
  },
  lg: {
    container: 'h-7 w-12',
    toggle: 'h-5 w-5',
    translateOn: 'translate-x-6',
    translateOff: 'translate-x-1'
  }
}
</script>

<template>
  <div class="flex items-center gap-3">
    <HeadlessSwitch
      :class="[
        modelValue ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700',
        sizeClasses[size].container,
        'relative inline-flex flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800'
      ]"
      :disabled="disabled"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <span
        :class="[
          modelValue ? sizeClasses[size].translateOn : sizeClasses[size].translateOff,
          sizeClasses[size].toggle,
          'pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out'
        ]"
      />
    </HeadlessSwitch>
    <label v-if="label" class="select-none text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
  </div>
</template>
