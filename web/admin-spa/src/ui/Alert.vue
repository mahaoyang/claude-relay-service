<script setup>
import { computed } from 'vue'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'danger', 'info'].includes(value)
  },
  title: String,
  closable: Boolean
})

const emit = defineEmits(['close'])

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info
}

const variantClasses = {
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/10 border-red-500/20 text-red-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
}

const icon = computed(() => icons[props.variant])
</script>

<template>
  <div :class="['relative mb-4 rounded-xl border p-4', variantClasses[variant]]">
    <div class="flex gap-3">
      <component :is="icon" class="h-5 w-5 flex-shrink-0" />
      <div class="flex-1">
        <h3 v-if="title" class="mb-1 text-sm font-semibold">{{ title }}</h3>
        <div class="text-sm opacity-90">
          <slot></slot>
        </div>
      </div>
      <button
        v-if="closable"
        @click="emit('close')"
        class="rounded p-1 text-current transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
