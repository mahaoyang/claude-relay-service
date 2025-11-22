<script setup>
import { computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { Check, ChevronsUpDown } from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number, Object],
  options: {
    type: Array,
    required: true
  },
  label: String,
  placeholder: {
    type: String,
    default: '请选择'
  },
  error: String,
  disabled: Boolean,
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find((opt) => (opt[props.valueKey] || opt) === props.modelValue)
})

const displayLabel = computed(() => {
  if (!selectedOption.value) return props.placeholder
  return selectedOption.value[props.labelKey] || selectedOption.value
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-secondary-300">
      {{ label }}
    </label>
    <Listbox
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :disabled="disabled"
    >
      <div class="relative">
        <ListboxButton
          class="relative w-full cursor-pointer rounded-xl border border-secondary-700 bg-secondary-900/50 px-4 py-2.5 text-left text-white transition-all duration-200 focus:border-primary-500 focus:bg-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          :class="[error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '']"
        >
          <span class="block truncate">{{ displayLabel }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronsUpDown class="h-4 w-4 text-secondary-400" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-secondary-700 bg-secondary-900/95 py-1 shadow-lg shadow-primary-500/10 backdrop-blur-xl focus:outline-none"
          >
            <ListboxOption
              v-for="(option, index) in options"
              :key="index"
              :value="option[valueKey] || option"
              v-slot="{ active, selected }"
              as="template"
            >
              <li
                class="relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors"
                :class="[
                  active ? 'bg-primary-500/30 text-white' : 'text-white',
                  selected ? 'bg-primary-500/20 font-medium' : 'font-normal'
                ]"
              >
                <span class="block truncate">
                  {{ option[labelKey] || option }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-400"
                >
                  <Check class="h-4 w-4" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <p v-if="error" class="mt-1.5 animate-slide-up text-sm text-red-400">{{ error }}</p>
  </div>
</template>
