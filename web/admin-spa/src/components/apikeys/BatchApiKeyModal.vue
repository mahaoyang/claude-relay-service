<template>
 <Teleport to="body">
 <div>
 <div
 >
 <div>
 <div>
 <div
 >
 
 </div>
 <div>
 <h3>批量创建成功</h3>
 <p>成功创建 {{ apiKeys.length }} 个 API Key</p>
 </div>
 </div>
 <button
 title="直接关闭（不推荐）"
 @click="handleDirectClose"
 >
 
 </button>
 </div>

 <!-- 警告提示 -->
 <div>
 <div>
 <div
 >
 
 </div>
 <div>
 <h5>重要提醒</h5>
 <p>
 这是您唯一能看到所有 API Key 的机会。关闭此窗口后，系统将不再显示完整的 API
 Key。请立即下载并妥善保存。
 </p>
 </div>
 </div>
 </div>

 <!-- 统计信息 -->
 <div>
 <div
 >
 <div>
 <div>
 <p>创建数量</p>
 <p>
 {{ apiKeys.length }}
 </p>
 </div>
 <div
 >
 
 </div>
 </div>
 </div>

 <div
 >
 <div>
 <div>
 <p>基础名称</p>
 <p>
 {{ baseName }}
 </p>
 </div>
 <div
 >
 
 </div>
 </div>
 </div>

 <div
 >
 <div>
 <div>
 <p>权限范围</p>
 <p>
 {{ getPermissionText() }}
 </p>
 </div>
 <div
 >
 
 </div>
 </div>
 </div>

 <div
 >
 <div>
 <div>
 <p>过期时间</p>
 <p>
 {{ getExpiryText() }}
 </p>
 </div>
 <div
 >
 
 </div>
 </div>
 </div>
 </div>

 <!-- API Keys 预览 -->
 <div>
 <div>
 <label>API Keys 预览</label>
 <div>
 <button
 type="button"
 @click="togglePreview"
 >
 
 {{ showPreview ? '隐藏' : '显示' }}预览
 </button>
 <span>（最多显示前10个）</span>
 </div>
 </div>

 <div
 v-if="showPreview"
 >
 <pre>{{ getPreviewText() }}</pre>
 </div>
 </div>

 <!-- 操作按钮 -->
 <div>
 <button
 @click="downloadApiKeys"
 >
 
 下载所有 API Keys
 </button>
 <button
 @click="handleClose"
 >
 我已保存
 </button>
 </div>

 <!-- 额外提示 -->
 <div>
 <p>
 
 <span>
 下载的文件格式为文本文件（.txt），每行包含一个 API Key。
 请将文件保存在安全的位置，避免泄露。
 </span>
 </p>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from '@/utils/toast'

const props = defineProps({
 apiKeys: {
 type: Array,
 required: true
 }
})

const emit = defineEmits(['close'])

const showPreview = ref(false)

// 获取基础名称
const baseName = computed(() => {
 if (props.apiKeys.length > 0) {
 const firstKey = props.apiKeys[0]
 // 提取基础名称（去掉 _1, _2 等后缀）
 const match = firstKey.name.match(/^(.+)_\d+$/)
 return match ? match[1] : firstKey.name
 }
 return ''
})

// 获取权限文本
const getPermissionText = () => {
 if (props.apiKeys.length === 0) return '未知'
 const permissions = props.apiKeys[0].permissions
 const permissionMap = {
 all: '全部服务',
 claude: '仅 Claude',
 gemini: '仅 Gemini'
 }
 return permissionMap[permissions] || permissions
}

// 获取过期时间文本
const getExpiryText = () => {
 if (props.apiKeys.length === 0) return '未知'
 const expiresAt = props.apiKeys[0].expiresAt
 if (!expiresAt) return '永不过期'

 const expiryDate = new Date(expiresAt)
 const now = new Date()
 const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

 if (diffDays <= 7) return `${diffDays}天`
 if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}周`
 if (diffDays <= 365) return `${Math.ceil(diffDays / 30)}个月`
 return `${Math.ceil(diffDays / 365)}年`
}

// 切换预览显示
const togglePreview = () => {
 showPreview.value = !showPreview.value
}

// 获取预览文本
const getPreviewText = () => {
 const previewKeys = props.apiKeys.slice(0, 10)
 const lines = previewKeys.map((key) => {
 return `${key.name}: ${key.apiKey || key.key || ''}`
 })

 if (props.apiKeys.length > 10) {
 lines.push(`... 还有 ${props.apiKeys.length - 10} 个 API Key`)
 }

 return lines.join('\n')
}

// 下载 API Keys
const downloadApiKeys = () => {
 // 生成文件内容
 const content = props.apiKeys
 .map((key) => {
 return `${key.name}: ${key.apiKey || key.key || ''}`
 })
 .join('\n')

 // 创建 Blob 对象
 const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

 // 创建下载链接
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url

 // 生成文件名（包含时间戳）
 const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
 link.download = `api-keys-${baseName.value}-${timestamp}.txt`

 // 触发下载
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)

 // 释放 URL 对象
 URL.revokeObjectURL(url)

 showToast('API Keys 文件已下载', 'success')
}

// 关闭弹窗（带确认）
const handleClose = async () => {
 if (window.showConfirm) {
 const confirmed = await window.showConfirm(
 '关闭提醒',
 '关闭后将无法再次查看这些 API Key，请确保已经下载并妥善保存。\n\n确定要关闭吗？',
 '确定关闭',
 '返回下载'
 )
 if (confirmed) {
 emit('close')
 }
 } else {
 // 降级方案
 const confirmed = confirm(
 '关闭后将无法再次查看这些 API Key，请确保已经下载并妥善保存。\n\n确定要关闭吗？'
 )
 if (confirmed) {
 emit('close')
 }
 }
}

// 直接关闭（不带确认）
const handleDirectClose = async () => {
 if (window.showConfirm) {
 const confirmed = await window.showConfirm(
 '确定要关闭吗？',
 '您还没有下载 API Keys，关闭后将无法再次查看。\n\n强烈建议您先下载保存。',
 '仍然关闭',
 '返回下载'
 )
 if (confirmed) {
 emit('close')
 }
 } else {
 // 降级方案
 const confirmed = confirm('您还没有下载 API Keys，关闭后将无法再次查看。\n\n确定要关闭吗？')
 if (confirmed) {
 emit('close')
 }
 }
}
</script>

