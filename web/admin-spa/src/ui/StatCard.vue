<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: Object,
  trend: {
    type: Object,
    default: null
  },
  loading: Boolean,
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  }
})

const colorClasses = computed(() => {
  const colors = {
    primary: {
      gradient: 'from-primary-500/20 to-blue-500/20',
      border: 'border-primary-500/30',
      icon: 'text-primary-400',
      glow: 'bg-primary-500/10'
    },
    success: {
      gradient: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      glow: 'bg-green-500/10'
    },
    warning: {
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      glow: 'bg-yellow-500/10'
    },
    danger: {
      gradient: 'from-red-500/20 to-pink-500/20',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      glow: 'bg-red-500/10'
    },
    info: {
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      glow: 'bg-blue-500/10'
    }
  }
  return colors[props.color]
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-secondary-800 bg-secondary-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-glass-hover"
  >
    <!-- Gradient Glow Effects -->
    <div
      :class="['absolute -right-12 -top-12 h-24 w-24 rounded-full blur-2xl', colorClasses.glow]"
    ></div>
    <div class="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl"></div>

    <!-- Icon -->
    <div
      v-if="icon"
      :class="[
        'relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br',
        colorClasses.gradient,
        colorClasses.border
      ]"
    >
      <component :is="icon" :class="['h-6 w-6', colorClasses.icon]" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse space-y-3">
      <div class="h-8 w-24 rounded bg-secondary-700/50"></div>
      <div class="h-4 w-32 rounded bg-secondary-700/50"></div>
    </div>

    <!-- Content -->
    <div v-else>
      <div class="relative mb-1 text-3xl font-bold text-white">
        {{ value }}
      </div>
      <div class="relative text-sm text-secondary-400">
        {{ title }}
      </div>

      <!-- Trend Indicator -->
      <div v-if="trend" class="relative mt-3 flex items-center gap-1">
        <component
          :is="trend.positive ? TrendingUp : TrendingDown"
          :class="['h-4 w-4', trend.positive ? 'text-green-400' : 'text-red-400']"
        />
        <span :class="['text-xs font-medium', trend.positive ? 'text-green-400' : 'text-red-400']">
          {{ trend.value }}
        </span>
        <span class="text-xs text-secondary-500">{{ trend.label }}</span>
      </div>
    </div>

    <!-- Action Slot -->
    <div v-if="$slots.action" class="relative mt-4 border-t border-secondary-800/50 pt-4">
      <slot name="action"></slot>
    </div>
  </div>
</template>
