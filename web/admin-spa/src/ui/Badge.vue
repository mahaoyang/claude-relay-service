<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'success', 'warning', 'danger', 'info', 'neutral'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value)
  },
  dot: Boolean
})

const classes = {
  primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  neutral: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20'
}

const dotClasses = {
  primary: 'bg-primary-400',
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  neutral: 'bg-secondary-400'
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium transition-colors"
    :class="[classes[variant], size === 'sm' ? 'text-xs' : 'text-sm']"
  >
    <span v-if="dot" class="mr-1.5 h-1.5 w-1.5 rounded-full" :class="dotClasses[variant]"></span>
    <slot></slot>
  </span>
</template>
