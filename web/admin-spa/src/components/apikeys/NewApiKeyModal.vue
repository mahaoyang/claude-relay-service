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
 <h3>API Key 创建成功</h3>
 <p>请妥善保存您的 API Key</p>
 </div>
 </div>
 <button
 title="直接关闭（不推荐）"
 @click="handleDirectClose"
 >
 
 </button>
 </div>

 <!-- 警告提示 -->
 <div
 >
 <div>
 <div
 >
 
 </div>
 <div>
 <h5>重要提醒</h5>
 <p>
 这是您唯一能看到完整 API Key 的机会。关闭此窗口后，系统将不再显示完整的 API
 Key。请立即复制并妥善保存。
 </p>
 </div>
 </div>
 </div>

 <!-- API Key 信息 -->
 <div>
 <div>
 <label
 >API Key 名称</label
 >
 <div
 >
 <span>{{ apiKey.name }}</span>
 </div>
 </div>

 <div v-if="apiKey.description">
 <label
 >备注</label
 >
 <div
 >
 <span >{{
 apiKey.description || '无描述'
 }}</span>
 </div>
 </div>

 <div>
 <label
 >API Key</label
 >
 <div>
 <div
 >
 {{ getDisplayedApiKey() }}
 </div>
 <div>
 <button
 :title="showFullKey ? '隐藏API Key' : '显示完整API Key'"
 type="button"
 @click="toggleKeyVisibility"
 >
 
 </button>
 </div>
 </div>
 <p>
 点击眼睛图标切换显示模式，使用下方按钮复制环境变量配置
 </p>
 </div>
 </div>

 <!-- 操作按钮 -->
 <div>
 <div>
 <button
 @click="copyKeyOnly"
 >
 
 仅复制密钥
 </button>
 <button
 @click="copyFullConfig"
 >
 
 复制Claude配置
 </button>
 </div>
 <button
 @click="handleClose"
 >
 
 我已保存
 </button>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from '@/utils/toast'

const props = defineProps({
 apiKey: {
 type: Object,
 required: true
 }
})

const emit = defineEmits(['close'])

const showFullKey = ref(false)

// 获取 API Base URL 前缀
const getBaseUrlPrefix = () => {
 // 优先使用环境变量配置的自定义前缀
 const customPrefix = import.meta.env.VITE_API_BASE_PREFIX
 if (customPrefix) {
 // 去除末尾的斜杠
 return customPrefix.replace(/\/$/, '')
 }

 // 否则使用当前浏览器访问地址
 if (typeof window !== 'undefined') {
 const protocol = window.location.protocol // http: 或 https:
 const host = window.location.host // 域名和端口
 // 提取协议和主机部分，去除路径
 let origin = protocol + '//' + host

 // 如果当前URL包含路径，只取协议+主机部分
 const currentUrl = window.location.href
 const pathStart = currentUrl.indexOf('/', 8) // 跳过 http:// 或 https://
 if (pathStart !== -1) {
 origin = currentUrl.substring(0, pathStart)
 }

 return origin
 }

 // 服务端渲染或其他情况的回退
 return ''
}

// 计算完整的 API Base URL
const currentBaseUrl = computed(() => {
 return getBaseUrlPrefix() + '/api'
})

// 切换密钥可见性
const toggleKeyVisibility = () => {
 showFullKey.value = !showFullKey.value
}

// 获取显示的API Key
const getDisplayedApiKey = () => {
 const key = props.apiKey.apiKey || props.apiKey.key || ''
 if (!key) return ''

 if (showFullKey.value) {
 return key
 } else {
 // 显示前8个字符和后4个字符，中间用●代替
 if (key.length <= 12) return key
 return (
 key.substring(0, 8) + '●'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4)
 )
 }
}

// 通用复制工具，包含降级处理
const copyTextWithFallback = async (text, successMessage) => {
 try {
 await navigator.clipboard.writeText(text)
 showToast(successMessage, 'success')
 } catch (error) {
 const textArea = document.createElement('textarea')
 textArea.value = text
 document.body.appendChild(textArea)
 textArea.select()
 try {
 document.execCommand('copy')
 showToast(successMessage, 'success')
 } catch (fallbackError) {
 showToast('复制失败，请手动复制', 'error')
 } finally {
 document.body.removeChild(textArea)
 }
 }
}

// 复制完整配置（包含提示信息）
const copyFullConfig = async () => {
 const key = props.apiKey.apiKey || props.apiKey.key || ''
 if (!key) {
 showToast('API Key 不存在', 'error')
 return
 }

 // 构建环境变量配置格式
 const configText = `ANTHROPIC_BASE_URL="${currentBaseUrl.value}"
ANTHROPIC_AUTH_TOKEN="${key}"`

 await copyTextWithFallback(configText, '配置信息已复制到剪贴板')
}

// 仅复制密钥
const copyKeyOnly = async () => {
 const key = props.apiKey.apiKey || props.apiKey.key || ''
 if (!key) {
 showToast('API Key 不存在', 'error')
 return
 }

 await copyTextWithFallback(key, 'API Key 已复制')
}

// 关闭弹窗（带确认）
const handleClose = async () => {
 if (window.showConfirm) {
 const confirmed = await window.showConfirm(
 '关闭提醒',
 '关闭后将无法再次查看完整的API Key，请确保已经妥善保存。\n\n确定要关闭吗？',
 '确定关闭',
 '取消'
 )
 if (confirmed) {
 emit('close')
 }
 } else {
 // 降级方案
 const confirmed = confirm(
 '关闭后将无法再次查看完整的API Key，请确保已经妥善保存。\n\n确定要关闭吗？'
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
 '您还没有保存API Key，关闭后将无法再次查看。\n\n建议您先复制API Key再关闭。',
 '仍然关闭',
 '返回复制'
 )
 if (confirmed) {
 emit('close')
 }
 } else {
 // 降级方案
 const confirmed = confirm('您还没有保存API Key，关闭后将无法再次查看。\n\n确定要关闭吗？')
 if (confirmed) {
 emit('close')
 }
 }
}
</script>

