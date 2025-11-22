<script setup>
import { Switch as HeadlessSwitch } from '@headlessui/vue'

defineProps({
  modelValue: Boolean,
  label: String,
  disabled: Boolean
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center gap-3">
    <HeadlessSwitch
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :disabled="disabled"
      :class="[
        modelValue ? 'bg-primary-500' : 'bg-secondary-700',
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-900 disabled:cursor-not-allowed disabled:opacity-50'
      ]"
    >
      <span
        :class="[
          modelValue ? 'translate-x-6' : 'translate-x-1',
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform'
        ]"
      />
    </HeadlessSwitch>
    <label v-if="label" class="select-none text-sm font-medium text-secondary-300">
      {{ label }}
    </label>
  </div>
</template>
