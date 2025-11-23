<script setup>
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  showClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl'
}

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <TransitionRoot as="template" :show="modelValue">
    <HeadlessDialog class="relative z-50" @close="closeDialog">
      <!-- Overlay -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Dialog Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              :class="[
                'relative w-full transform overflow-hidden rounded-2xl border border-secondary-700 bg-secondary-900/95 p-6 shadow-2xl shadow-primary-500/20 backdrop-blur-xl transition-all',
                sizeClasses[size]
              ]"
            >
              <!-- Glow Effects -->
              <div
                class="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl"
              ></div>
              <div
                class="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"
              ></div>

              <!-- Close Button -->
              <button
                v-if="showClose"
                class="absolute right-4 top-4 rounded-lg p-1 text-secondary-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                @click="closeDialog"
              >
                <X class="h-5 w-5" />
              </button>

              <!-- Title -->
              <DialogTitle v-if="title" class="relative mb-4 text-lg font-semibold text-white">
                {{ title }}
              </DialogTitle>

              <!-- Content -->
              <div class="relative text-white">
                <slot></slot>
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="relative mt-6 flex justify-end gap-3">
                <slot :close="closeDialog" name="footer"></slot>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>
