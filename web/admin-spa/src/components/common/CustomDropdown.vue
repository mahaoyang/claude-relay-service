<template>
  <div class="relative">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500"
      @click="toggleDropdown"
    >
      <Icon v-if="icon" class="h-4 w-4" :class="iconColor" :name="icon" />
      <span class="flex-1 truncate">
        {{ selectedLabel || placeholder }}
      </span>
      <Icon
        class="h-4 w-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        name="ChevronDown"
      />
    </div>

    <!-- 下拉选项 - 使用 Teleport 将其移动到 body -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="fixed z-[9999] max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          :style="dropdownStyle"
        >
          <div>
            <div
              v-for="option in options"
              :key="option.value"
              class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors"
              :class="[
                option.value === modelValue
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
              ]"
              @click="selectOption(option)"
            >
              <Icon v-if="option.icon" class="h-4 w-4" :name="option.icon" />
              <span class="flex-1">{{ option.label }}</span>
              <Icon
                v-if="option.value === modelValue"
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                name="Check"
              />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const triggerRef = ref(null)
const dropdownRef = ref(null)
const dropdownStyle = ref({})

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected ? selected.label : ''
})

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    updateDropdownPosition()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  closeDropdown()
}

const updateDropdownPosition = () => {
  if (!triggerRef.value || !isOpen.value) return

  const trigger = triggerRef.value.getBoundingClientRect()
  const dropdownHeight = 250 // 预估高度
  const spaceBelow = window.innerHeight - trigger.bottom
  const spaceAbove = trigger.top

  let top, left

  // 计算垂直位置
  if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
    // 显示在下方
    top = trigger.bottom + 8
  } else {
    // 显示在上方
    top = trigger.top - dropdownHeight - 8
  }

  // 计算水平位置
  left = trigger.left

  // 确保不超出右边界
  const dropdownWidth = 200 // 预估宽度
  if (left + dropdownWidth > window.innerWidth) {
    left = window.innerWidth - dropdownWidth - 10
  }

  // 确保不超出左边界
  if (left < 10) {
    left = 10
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${trigger.width}px`
  }
}

// 监听窗口大小变化和滚动
const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

const handleResize = () => {
  if (isOpen.value) {
    closeDropdown()
  }
}

// 处理点击外部关闭
const handleClickOutside = (event) => {
  if (!triggerRef.value || !isOpen.value) return

  // 如果点击不在触发器内，且下拉框存在时也不在下拉框内，则关闭
  if (!triggerRef.value.contains(event.target)) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      closeDropdown()
    } else if (!dropdownRef.value) {
      closeDropdown()
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})
</script>
