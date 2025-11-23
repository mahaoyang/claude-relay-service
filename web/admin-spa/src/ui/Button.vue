<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  icon: String
})

const emit = defineEmits(['click'])

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

  const variants = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/30 focus:ring-primary-500 border border-transparent',
    secondary:
      'bg-secondary-800 text-white hover:bg-secondary-700 hover:shadow-lg hover:shadow-secondary-900/20 focus:ring-secondary-500 border border-transparent',
    danger:
      'bg-red-600 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500 border border-transparent',
    ghost:
      'bg-transparent text-secondary-300 hover:bg-secondary-800/50 hover:text-white focus:ring-secondary-500',
    outline:
      'bg-transparent border-2 border-secondary-700 text-secondary-300 hover:border-primary-500 hover:text-primary-400 focus:ring-primary-500'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.block ? 'w-full' : '',
    props.loading ? 'cursor-wait' : ''
  ].join(' ')
})
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="emit('click', $event)">
    <svg
      v-if="loading"
      class="-ml-1 mr-2 h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      ></path>
    </svg>
    <component :is="icon" v-else-if="icon" class="mr-2 h-4 w-4" />
    <slot></slot>
  </button>
</template>
