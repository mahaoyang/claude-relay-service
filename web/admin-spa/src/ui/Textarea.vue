<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: Boolean,
  rows: {
    type: Number,
    default: 4
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-secondary-300">
      {{ label }}
    </label>
    <textarea
      class="block w-full resize-none rounded-xl border border-secondary-700 bg-secondary-900/50 px-4 py-2.5 text-white placeholder-secondary-500 transition-all duration-200 focus:border-primary-500 focus:bg-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      :class="[error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '']"
      :disabled="disabled"
      :placeholder="placeholder"
      :rows="rows"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <p v-if="error" class="mt-1.5 animate-slide-up text-sm text-red-400">{{ error }}</p>
  </div>
</template>
