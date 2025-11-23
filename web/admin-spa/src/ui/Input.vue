<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  error: String,
  icon: Object,
  disabled: Boolean
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-secondary-300">
      {{ label }}
    </label>
    <div class="relative">
      <div v-if="icon" class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <component :is="icon" class="h-5 w-5 text-secondary-500" />
      </div>
      <input
        class="block w-full rounded-xl border border-secondary-700 bg-secondary-900/50 px-4 py-2.5 text-white placeholder-secondary-500 transition-all duration-200 focus:border-primary-500 focus:bg-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          icon ? 'pl-10' : '',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        ]"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="error" class="mt-1.5 animate-slide-up text-sm text-red-400">{{ error }}</p>
  </div>
</template>
