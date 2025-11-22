<template>
 <Teleport to="body">
 <div v-if="show">
 <!-- 背景遮罩 -->
 <div
 @click="$emit('close')"
 />

 <!-- 模态框内容 -->
 <div>
 <!-- 头部 -->
 <div>
 <div>
 <div
 >
 
 </div>
 <div>
 <h3>修改到期时间</h3>
 <p>
 为 "{{ account.name || 'Account' }}" 设置新的到期时间
 </p>
 </div>
 </div>
 <button
 @click="$emit('close')"
 >
 
 </button>
 </div>

 <div>
 <!-- 当前状态显示 -->
 <div
 >
 <div>
 <div>
 <p>当前状态</p>
 <p>
 <!-- 已设置过期时间 -->
 <template v-if="account.expiresAt">
 {{ formatFullExpireDate(account.expiresAt) }}
 <span
 v-if="getExpiryStatus(account.expiresAt)"
 >
 ({{ getExpiryStatus(account.expiresAt).text }})
 </span>
 </template>
 <!-- 永不过期 -->
 <template v-else>
 
 永不过期
 </template>
 </p>
 </div>
 <div
 >
 
 </div>
 </div>
 </div>

 <!-- 快捷选项 -->
 <div>
 <label
 >选择新的期限</label
 >
 <div>
 <button
 v-for="option in quickOptions"
 :key="option.value"
 @click="selectQuickOption(option.value)"
 >
 {{ option.label }}
 </button>
 <button
 @click="selectQuickOption('custom')"
 >
 
 自定义
 </button>
 </div>
 </div>

 <!-- 自定义日期选择 -->
 <div v-if="localForm.expireDuration === 'custom'">
 <label
 >选择日期和时间</label
 >
 <input
 v-model="localForm.customExpireDate"
 :min="minDateTime"
 type="datetime-local"
 @change="updateCustomExpiryPreview"
 />
 <p>
 选择一个未来的日期和时间作为到期时间
 </p>
 </div>

 <!-- 预览新的过期时间 -->
 <div
 v-if="localForm.expiresAt !== account.expiresAt"
 >
 <div>
 <div>
 <p>
 
 新的到期时间
 </p>
 <p>
 <template v-if="localForm.expiresAt">
 {{ formatFullExpireDate(localForm.expiresAt) }}
 <span
 v-if="getExpiryStatus(localForm.expiresAt)"
 >
 ({{ getExpiryStatus(localForm.expiresAt).text }})
 </span>
 </template>
 <template v-else>
 
 永不过期
 </template>
 </p>
 </div>
 <div
 >
 
 </div>
 </div>
 </div>

 <!-- 操作按钮 -->
 <div>
 <button
 @click="$emit('close')"
 >
 取消
 </button>
 <button
 :disabled="saving || localForm.expiresAt === account.expiresAt"
 @click="handleSave"
 >
 <div v-if="saving" />
 
 {{ saving ? '保存中...' : '保存更改' }}
 </button>
 </div>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
 show: {
 type: Boolean,
 required: true
 },
 account: {
 type: Object,
 required: true
 }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

// 表单数据
const localForm = reactive({
 expireDuration: '',
 customExpireDate: '',
 expiresAt: null
})

// 快捷选项
const quickOptions = [
 { value: '', label: '永不过期' },
 { value: '30d', label: '30 天' },
 { value: '90d', label: '90 天' },
 { value: '180d', label: '180 天' },
 { value: '365d', label: '1 年' },
 { value: '730d', label: '2 年' }
]

// 计算最小日期时间
const minDateTime = computed(() => {
 const now = new Date()
 now.setMinutes(now.getMinutes() + 1)
 return now.toISOString().slice(0, 16)
})

// 监听显示状态，初始化表单
watch(
 () => props.show,
 (newVal) => {
 if (newVal) {
 initializeForm()
 }
 }
)

// 监听 account 变化，重新初始化
watch(
 () => props.account?.id,
 (newId) => {
 if (newId && props.show) {
 initializeForm()
 }
 }
)

// 初始化表单
const initializeForm = () => {
 saving.value = false

 if (props.account.expiresAt) {
 localForm.expireDuration = 'custom'
 localForm.customExpireDate = new Date(props.account.expiresAt).toISOString().slice(0, 16)
 localForm.expiresAt = props.account.expiresAt
 } else {
 localForm.expireDuration = ''
 localForm.customExpireDate = ''
 localForm.expiresAt = null
 }
}

// 选择快捷选项
const selectQuickOption = (value) => {
 localForm.expireDuration = value

 if (!value) {
 localForm.expiresAt = null
 return
 }

 if (value === 'custom') {
 return
 }

 const now = new Date()
 const match = value.match(/(\d+)([dhmy])/)

 if (match) {
 const [, num, unit] = match
 const amount = parseInt(num)

 switch (unit) {
 case 'd':
 now.setDate(now.getDate() + amount)
 break
 case 'h':
 now.setHours(now.getHours() + amount)
 break
 case 'm':
 now.setMonth(now.getMonth() + amount)
 break
 case 'y':
 now.setFullYear(now.getFullYear() + amount)
 break
 }

 localForm.expiresAt = now.toISOString()
 }
}

// 更新自定义过期时间
const updateCustomExpiryPreview = () => {
 if (localForm.customExpireDate) {
 try {
 // 手动解析日期时间字符串，确保它被正确解释为本地时间
 const [datePart, timePart] = localForm.customExpireDate.split('T')
 const [year, month, day] = datePart.split('-').map(Number)
 const [hours, minutes] = timePart.split(':').map(Number)

 // 使用构造函数创建本地时间的 Date 对象，然后转换为 UTC ISO 字符串
 const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

 // 验证日期有效性
 if (isNaN(localDate.getTime())) {
 console.error('Invalid date:', localForm.customExpireDate)
 return
 }

 localForm.expiresAt = localDate.toISOString()
 } catch (error) {
 console.error('Failed to parse custom expire date:', error)
 }
 }
}

// 格式化完整过期日期（包含时分）
const formatFullExpireDate = (dateString) => {
 if (!dateString) return ''
 const date = new Date(dateString)
 return date.toLocaleString('zh-CN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit'
 })
}

// 检查是否已过期
const isExpired = (dateString) => {
 if (!dateString) return false
 return new Date(dateString) < new Date()
}

// 获取过期状态
const getExpiryStatus = (expiresAt) => {
 if (!expiresAt) return null

 const now = new Date()
 const expiryDate = new Date(expiresAt)
 const diffMs = expiryDate - now
 const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

 if (diffMs < 0) {
 return {
 text: '已过期',
 class: ''
 }
 } else if (diffDays <= 7) {
 return {
 text: `${diffDays} 天后过期`,
 class: ''
 }
 } else if (diffDays <= 30) {
 return {
 text: `${diffDays} 天后过期`,
 class: ''
 }
 } else {
 return {
 text: `${Math.ceil(diffDays / 30)} 个月后过期`,
 class: ''
 }
 }
}

// 保存
const handleSave = () => {
 saving.value = true
 emit('save', {
 accountId: props.account.id,
 expiresAt: localForm.expiresAt
 })
}

// 重置保存状态
const resetSaving = () => {
 saving.value = false
}

// 暴露方法给父组件
defineExpose({
 resetSaving
})
</script>

