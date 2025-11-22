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
 <h3>修改过期时间</h3>
 <p>
 为 "{{ apiKey.name || 'API Key' }}" 设置新的过期时间
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
 <!-- 未激活状态 -->
 <template v-if="apiKey.expirationMode === 'activation' && !apiKey.isActivated">
 
 未激活
 <span>
 (激活后
 {{ apiKey.activationDays || (apiKey.activationUnit === 'hours' ? 24 : 30) }}
 {{ apiKey.activationUnit === 'hours' ? '小时' : '天' }}过期)
 </span>
 </template>
 <!-- 已设置过期时间 -->
 <template v-else-if="apiKey.expiresAt">
 {{ formatExpireDate(apiKey.expiresAt) }}
 <span
 v-if="getExpiryStatus(apiKey.expiresAt)"
 >
 ({{ getExpiryStatus(apiKey.expiresAt).text }})
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

 <!-- 激活按钮（仅在未激活状态显示） -->
 <div v-if="apiKey.expirationMode === 'activation' && !apiKey.isActivated">
 <button
 @click="handleActivateNow"
 >
 
 立即激活 (激活后
 {{ apiKey.activationDays || (apiKey.activationUnit === 'hours' ? 24 : 30) }}
 {{ apiKey.activationUnit === 'hours' ? '小时' : '天' }}过期)
 </button>
 <p>
 
 点击立即激活此 API Key，激活后将在
 {{ apiKey.activationDays || (apiKey.activationUnit === 'hours' ? 24 : 30) }}
 {{ apiKey.activationUnit === 'hours' ? '小时' : '天' }}后过期
 </p>
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
 选择一个未来的日期和时间作为过期时间
 </p>
 </div>

 <!-- 预览新的过期时间 -->
 <div
 v-if="localForm.expiresAt !== apiKey.expiresAt"
 >
 <div>
 <div>
 <p>
 
 新的过期时间
 </p>
 <p>
 <template v-if="localForm.expiresAt">
 {{ formatExpireDate(localForm.expiresAt) }}
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
 :disabled="saving || localForm.expiresAt === apiKey.expiresAt"
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
 apiKey: {
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
 { value: '1d', label: '1 天' },
 { value: '7d', label: '7 天' },
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

// 监听 apiKey 变化，重新初始化
watch(
 () => props.apiKey?.id,
 (newId) => {
 if (newId && props.show) {
 initializeForm()
 }
 }
)

// 初始化表单
const initializeForm = () => {
 saving.value = false

 if (props.apiKey.expiresAt) {
 localForm.expireDuration = 'custom'
 localForm.customExpireDate = new Date(props.apiKey.expiresAt).toISOString().slice(0, 16)
 localForm.expiresAt = props.apiKey.expiresAt
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
 localForm.expiresAt = new Date(localForm.customExpireDate).toISOString()
 }
}

// 格式化过期日期
const formatExpireDate = (dateString) => {
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
 keyId: props.apiKey.id,
 expiresAt: localForm.expiresAt
 })
}

// 立即激活
const handleActivateNow = async () => {
 // 使用确认弹窗
 let confirmed = true
 if (window.showConfirm) {
 confirmed = await window.showConfirm(
 '激活 API Key',
 `确定要立即激活此 API Key 吗？激活后将在 ${props.apiKey.activationDays || (props.apiKey.activationUnit === 'hours' ? 24 : 30)} ${props.apiKey.activationUnit === 'hours' ? '小时' : '天'}后自动过期。`,
 '确定激活',
 '取消'
 )
 } else {
 // 降级方案
 confirmed = confirm(
 `确定要立即激活此 API Key 吗？激活后将在 ${props.apiKey.activationDays || (props.apiKey.activationUnit === 'hours' ? 24 : 30)} ${props.apiKey.activationUnit === 'hours' ? '小时' : '天'}后自动过期。`
 )
 }

 if (!confirmed) {
 return
 }

 saving.value = true
 emit('save', {
 keyId: props.apiKey.id,
 activateNow: true
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

