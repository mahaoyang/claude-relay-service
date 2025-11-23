<script setup>
import { Menu as HeadlessMenu, MenuButton, MenuItems } from '@headlessui/vue'

defineProps({
  buttonText: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  }
})
</script>

<template>
  <HeadlessMenu as="div" class="relative inline-block text-left">
    <MenuButton
      class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-900"
    >
      <slot name="button">
        <span>{{ buttonText }}</span>
      </slot>
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        :class="[
          'absolute z-10 mt-2 w-56 origin-top-right rounded-xl border border-secondary-700 bg-secondary-900/95 py-1 shadow-lg shadow-primary-500/10 backdrop-blur-xl focus:outline-none',
          position === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
        ]"
      >
        <slot></slot>
      </MenuItems>
    </transition>
  </HeadlessMenu>
</template>
