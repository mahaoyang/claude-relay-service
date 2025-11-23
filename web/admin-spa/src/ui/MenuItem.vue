<script setup>
import { MenuItem as HeadlessMenuItem } from '@headlessui/vue'

defineProps({
  icon: {
    type: Object,
    default: null
  },
  disabled: Boolean
})

const emit = defineEmits(['click'])

const handleClick = (close) => {
  close()
  emit('click')
}
</script>

<template>
  <HeadlessMenuItem v-slot="{ active, close }" :disabled="disabled">
    <button
      :class="[
        'group flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
        active ? 'bg-primary-500/20 text-white' : 'text-white',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      ]"
      @click="handleClick(close)"
    >
      <component
        :is="icon"
        v-if="icon"
        :class="['h-4 w-4', active ? 'text-primary-400' : 'text-secondary-400']"
      />
      <slot></slot>
    </button>
  </HeadlessMenuItem>
</template>
