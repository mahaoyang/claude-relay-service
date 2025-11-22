<template>
 <div>
 <!-- 触发器 -->
 <div
 ref="triggerRef"
 @click="toggleDropdown"
 >
 <i v-if="icon"></i>
 <span
 >
 {{ selectedLabel || placeholder }}
 </span>
 
 </div>

 <!-- 下拉选项 - 使用 Teleport 将其移动到 body -->
 <Teleport to="body">
 <transition
 enter-active-class="transition duration-200 ease-out"
 enter-from-class="opacity-0"
 enter-to-class="opacity-100"
 leave-active-class="transition duration-150 ease-in"
 leave-from-class="opacity-100"
 leave-to-class="opacity-0"
 >
 <div
 v-if="isOpen"
 ref="dropdownRef"
 >
 <div>
 <div
 v-for="option in options"
 :key="option.value"
 @click="selectOption(option)"
 >
 <i v-if="option.icon"></i>
 <span>{{ option.label }}</span>
 
 </div>
 </div>
 </div>
 </transition>
 </Teleport>
 </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

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

