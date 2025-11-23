<script setup>
defineProps({
  title: String,
  subtitle: String,
  noPadding: Boolean,
  hover: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div
    class="dark:bg-dark-card relative overflow-hidden rounded-md border border-gray-100 bg-white transition-all duration-300 dark:border-gray-800"
  >
    <div v-if="title || subtitle" class="relative px-6 py-4">
      <h3 v-if="title" class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-600 dark:text-secondary-400">
        {{ subtitle }}
      </p>
      <slot name="header-action"></slot>
    </div>

    <div :class="[noPadding ? '' : 'p-6', 'relative']">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="relative bg-gray-50 px-6 py-4 dark:bg-secondary-900/20">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
