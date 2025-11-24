<script setup>
import { computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: null
  },
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
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

const sizeClasses = {
  sm: {
    button: 'px-3 py-1.5 text-xs',
    option: 'py-1.5 pl-8 pr-3 text-xs',
    icon: 'h-3.5 w-3.5'
  },
  md: {
    button: 'px-4 py-2 text-sm',
    option: 'py-2 pl-10 pr-4 text-sm',
    icon: 'h-4 w-4'
  },
  lg: {
    button: 'px-4 py-2.5 text-base',
    option: 'py-2.5 pl-10 pr-4 text-base',
    icon: 'h-5 w-5'
  }
}

const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find((opt) => {
    const optValue = opt[props.valueKey] !== undefined ? opt[props.valueKey] : opt
    return optValue === props.modelValue
  })
})

const displayLabel = computed(() => {
  if (!selectedOption.value) return props.placeholder
  return selectedOption.value[props.labelKey] || selectedOption.value
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
    <Listbox
      :disabled="disabled"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <div class="relative">
        <ListboxButton
          :class="[
            sizeClasses[size].button,
            'relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-left text-gray-900 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          ]"
        >
          <span class="block truncate" :class="!selectedOption ? 'text-gray-500' : ''">
            {{ displayLabel }}
          </span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon class="text-gray-400" :class="sizeClasses[size].icon" name="ChevronDown" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          >
            <ListboxOption
              v-for="(option, index) in options"
              :key="index"
              v-slot="{ active, selected }"
              as="template"
              :value="option[valueKey] !== undefined ? option[valueKey] : option"
            >
              <li
                :class="[
                  sizeClasses[size].option,
                  'relative cursor-pointer select-none transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-900 dark:text-gray-100',
                  selected ? 'font-semibold' : 'font-normal'
                ]"
              >
                <span class="block truncate">
                  {{ option[labelKey] || option }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400"
                >
                  <Icon :class="sizeClasses[size].icon" name="Check" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <p v-if="error" class="mt-1.5 text-sm text-red-500 dark:text-red-400">{{ error }}</p>
  </div>
</template>
