<template>
 <div>
 <div>
 <h4>代理设置 (可选)</h4>
 <label>
 <input
 v-model="proxy.enabled"
 type="checkbox"
 />
 <span>启用代理</span>
 </label>
 </div>

 <div
 v-if="proxy.enabled"
 >
 <div>
 <div>
 
 </div>
 <div>
 <p>
 配置代理以访问受限的网络资源。支持 SOCKS5 和 HTTP 代理。
 </p>
 <p>
 请确保代理服务器稳定可用，否则会影响账户的正常使用。
 </p>
 </div>
 </div>

 <!-- 快速配置输入框 -->
 <div>
 <label>
 快速配置
 <span>
 (粘贴完整代理URL自动填充)
 </span>
 </label>
 <div>
 <input
 v-model="proxyUrl"
 placeholder="例如: socks5://username:password@host:port 或 http://host:port"
 type="text"
 @input="handleInput"
 @keyup.enter="parseProxyUrl"
 @paste="handlePaste"
 />
 <button
 v-if="proxyUrl"
 type="button"
 @click="clearProxyUrl"
 >
 
 </button>
 </div>
 <p v-if="parseError">
 
 {{ parseError }}
 </p>
 <p v-else-if="parseSuccess">
 
 代理配置已自动填充
 </p>
 </div>

 <div></div>

 <div>
 <label
 >代理类型</label
 >
 <select
 v-model="proxy.type"
 >
 <option value="socks5">SOCKS5</option>
 <option value="http">HTTP</option>
 <option value="https">HTTPS</option>
 </select>
 </div>

 <div>
 <div>
 <label
 >主机地址</label
 >
 <input
 v-model="proxy.host"
 placeholder="例如: 192.168.1.100"
 type="text"
 />
 </div>
 <div>
 <label
 >端口</label
 >
 <input
 v-model="proxy.port"
 placeholder="例如: 1080"
 type="number"
 />
 </div>
 </div>

 <div>
 <div>
 <input
 id="proxyAuth"
 v-model="showAuth"
 type="checkbox"
 />
 <label
 for="proxyAuth"
 >
 需要身份验证
 </label>
 </div>

 <div v-if="showAuth">
 <div>
 <label
 >用户名</label
 >
 <input
 v-model="proxy.username"
 placeholder="代理用户名"
 type="text"
 />
 </div>
 <div>
 <label
 >密码</label
 >
 <div>
 <input
 v-model="proxy.password"
 placeholder="代理密码"
 :type="showPassword ? 'text' : 'password'"
 />
 <button
 type="button"
 @click="showPassword = !showPassword"
 >
 
 </button>
 </div>
 </div>
 </div>
 </div>

 <div
 >
 <p>
 
 <strong>提示：</strong
 >代理设置将用于所有与此账户相关的API请求。请确保代理服务器支持HTTPS流量转发。
 </p>
 </div>
 </div>
 </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
 modelValue: {
 type: Object,
 default: () => ({
 enabled: false,
 type: 'socks5',
 host: '',
 port: '',
 username: '',
 password: ''
 })
 }
})

const emit = defineEmits(['update:modelValue'])

// 内部代理数据
const proxy = ref({ ...props.modelValue })

// UI状态
const showAuth = ref(!!(proxy.value.username || proxy.value.password))
const showPassword = ref(false)

// 快速配置相关
const proxyUrl = ref('')
const parseError = ref('')
const parseSuccess = ref(false)

// 监听modelValue变化，只在真正需要更新时才更新
watch(
 () => props.modelValue,
 (newVal) => {
 // 只有当值真正不同时才更新，避免循环
 if (JSON.stringify(newVal) !== JSON.stringify(proxy.value)) {
 proxy.value = { ...newVal }
 showAuth.value = !!(newVal.username || newVal.password)
 }
 },
 { deep: true }
)

// 监听各个字段单独变化，而不是整个对象
watch(
 () => proxy.value.enabled,
 () => {
 emitUpdate()
 }
)

watch(
 () => proxy.value.type,
 () => {
 emitUpdate()
 }
)

watch(
 () => proxy.value.host,
 () => {
 emitUpdate()
 }
)

watch(
 () => proxy.value.port,
 () => {
 emitUpdate()
 }
)

watch(
 () => proxy.value.username,
 () => {
 emitUpdate()
 }
)

watch(
 () => proxy.value.password,
 () => {
 emitUpdate()
 }
)

// 监听认证开关
watch(showAuth, (newVal) => {
 if (!newVal) {
 proxy.value.username = ''
 proxy.value.password = ''
 emitUpdate()
 }
})

// 防抖的更新函数
let updateTimer = null
function emitUpdate() {
 // 清除之前的定时器
 if (updateTimer) {
 clearTimeout(updateTimer)
 }

 // 设置新的定时器，延迟发送更新
 updateTimer = setTimeout(() => {
 const data = { ...proxy.value }

 // 如果不需要认证，清空用户名密码
 if (!showAuth.value) {
 data.username = ''
 data.password = ''
 }

 emit('update:modelValue', data)
 }, 100) // 100ms 延迟
}

// 解析代理URL
function parseProxyUrl() {
 parseError.value = ''
 parseSuccess.value = false

 if (!proxyUrl.value) {
 return
 }

 try {
 // 移除 # 后面的别名部分
 const urlWithoutAlias = proxyUrl.value.split('#')[0].trim()

 if (!urlWithoutAlias) {
 return
 }

 // 正则表达式匹配代理URL格式
 // 支持格式：protocol://[username:password@]host:port
 const proxyPattern = /^(socks5|https?):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/i
 const match = urlWithoutAlias.match(proxyPattern)

 if (!match) {
 // 尝试简单格式：host:port（默认为socks5）
 const simplePattern = /^([^:]+):(\d+)$/
 const simpleMatch = urlWithoutAlias.match(simplePattern)

 if (simpleMatch) {
 proxy.value.type = 'socks5'
 proxy.value.host = simpleMatch[1]
 proxy.value.port = simpleMatch[2]
 proxy.value.username = ''
 proxy.value.password = ''
 showAuth.value = false
 parseSuccess.value = true
 emitUpdate()

 // 3秒后清除成功提示
 setTimeout(() => {
 parseSuccess.value = false
 }, 3000)
 return
 }

 parseError.value = '无效的代理URL格式，请检查输入'
 return
 }

 // 解析匹配结果
 const [, protocol, username, password, host, port] = match

 // 填充表单
 proxy.value.type = protocol.toLowerCase()
 proxy.value.host = host
 proxy.value.port = port

 // 处理认证信息
 if (username && password) {
 proxy.value.username = decodeURIComponent(username)
 proxy.value.password = decodeURIComponent(password)
 showAuth.value = true
 } else {
 proxy.value.username = ''
 proxy.value.password = ''
 showAuth.value = false
 }

 parseSuccess.value = true
 emitUpdate()

 // 3秒后清除成功提示
 setTimeout(() => {
 parseSuccess.value = false
 }, 3000)
 } catch (error) {
 // 解析代理URL失败
 parseError.value = '解析失败，请检查URL格式'
 }
}

// 清空快速配置输入
function clearProxyUrl() {
 proxyUrl.value = ''
 parseError.value = ''
 parseSuccess.value = false
}

// 处理粘贴事件
function handlePaste() {
 // 延迟一下以确保v-model已经更新
 setTimeout(() => {
 parseProxyUrl()
 }, 0)
}

// 处理输入事件
function handleInput() {
 // 检测是否输入了代理URL格式
 const value = proxyUrl.value.trim()

 // 如果输入包含://，说明可能是完整的代理URL
 if (value.includes('://')) {
 // 检查是否看起来像完整的URL（有协议、主机和端口）
 if (
 /^(socks5|https?):\/\/[^:]+:\d+/i.test(value) ||
 /^(socks5|https?):\/\/[^:@]+:[^@]+@[^:]+:\d+/i.test(value)
 ) {
 parseProxyUrl()
 }
 }
 // 如果是简单的 host:port 格式，并且端口号输入完整
 else if (/^[^:]+:\d{2,5}$/.test(value)) {
 parseProxyUrl()
 }
}

// 组件销毁时清理定时器
onUnmounted(() => {
 if (updateTimer) {
 clearTimeout(updateTimer)
 }
})
</script>
