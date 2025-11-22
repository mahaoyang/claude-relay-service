<template>
 <div>
 <div>
 <i />
 <span>{{ label }}</span>
 </div>
 <div>
 <span>${{ current.toFixed(2) }}</span>
 <span>/</span>
 <span>${{ limit.toFixed(2) }}</span>
 </div>
 <!-- 小型进度条 -->
 <div>
 <div
 />
 </div>
 </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
 type: {
 type: String,
 required: true,
 validator: (value) => ['daily', 'opus', 'window'].includes(value)
 },
 label: {
 type: String,
 required: true
 },
 current: {
 type: Number,
 default: 0
 },
 limit: {
 type: Number,
 required: true
 }
})

const progress = computed(() => {
 if (!props.limit || props.limit === 0) return 0
 const percentage = (props.current / props.limit) * 100
 return Math.min(percentage, 100)
})

const badgeClass = computed(() => {
 switch (props.type) {
 case 'daily':
 return ' dark:'
 case 'opus':
 return ' dark:'
 case 'window':
 return ' dark:'
 default:
 return ' dark:'
 }
})

const iconClass = computed(() => {
 switch (props.type) {
 case 'daily':
 return 'fas fa-calendar-day '
 case 'opus':
 return 'fas fa-gem '
 case 'window':
 return 'fas fa-clock '
 default:
 return 'fas fa-info-circle '
 }
})

const progressClass = computed(() => {
 const p = progress.value
 if (p >= 100) return ''
 if (p >= 80) return ''

 switch (props.type) {
 case 'daily':
 return ''
 case 'opus':
 return ''
 case 'window':
 return ''
 default:
 return ''
 }
})
</script>
