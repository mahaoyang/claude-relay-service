<template>
  <div>
    <div
      :aria-orientation="vertical ? 'vertical' : 'horizontal'"
      class="flex"
      :class="[
        !noBorder && 'border-b border-gray-200 dark:border-gray-700',
        vertical ? 'flex-col border-b-0 border-r' : 'space-x-2'
      ]"
      role="tablist"
    >
      <button
        v-for="option in options"
        :key="option.value"
        :aria-selected="modelValue === option.value"
        class="relative px-4 py-2.5 text-sm font-medium outline-none ring-0 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        :class="[
          modelValue === option.value
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/30 dark:hover:text-white',
          vertical ? 'w-full rounded-l-lg text-left' : 'rounded-t-lg',
          option.icon && 'flex items-center'
        ]"
        role="tab"
        type="button"
        @click="$emit('update:modelValue', option.value)"
      >
        <!-- Icon if provided -->
        <i v-if="option.icon" class="text-sm" :class="option.icon" />

        <!-- Label with responsive text if shortLabel provided and different from label -->
        <template v-if="option.shortLabel && option.shortLabel !== option.label">
          <span class="hidden lg:inline">{{ option.label }}</span>
          <span class="lg:hidden">{{ option.shortLabel }}</span>
        </template>
        <span v-else class="relative z-10">{{ option.label }}</span>

        <!-- Active indicator -->
        <div
          v-if="modelValue === option.value"
          class="absolute rounded-full bg-primary-500"
          :class="vertical ? 'right-0 top-0 h-full w-0.5' : 'bottom-0 left-0 h-0.5 w-full'"
        ></div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  options: {
    type: Array,
    required: true
    // Format: [{ value: 'key', label: 'Label', shortLabel?: 'Short', icon?: 'fas fa-icon' }]
  },
  vertical: {
    type: Boolean,
    default: false
  },
  noBorder: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>
