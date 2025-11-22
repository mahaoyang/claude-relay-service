<template>
 <Teleport to="body">
 <div v-if="show">
 <div
 >
 <div>
 <div>
 <div
 >
 
 </div>
 <h3>
 {{ isEdit ? '编辑 CCR 账户' : '添加 CCR 账户' }}
 </h3>
 </div>
 <button
 @click="$emit('close')"
 >
 
 </button>
 </div>

 <div>
 <!-- 基本信息 -->
 <div>
 <label
 >账户名称 *</label
 >
 <input
 v-model="form.name"
 placeholder="为账户设置一个易识别的名称"
 required
 type="text"
 />
 <p v-if="errors.name">{{ errors.name }}</p>
 </div>

 <div>
 <label
 >描述 (可选)</label
 >
 <textarea
 v-model="form.description"
 placeholder="账户用途说明..."
 rows="3"
 />
 </div>

 <div>
 <div>
 <label
 >API URL *</label
 >
 <input
 v-model="form.apiUrl"
 placeholder="例如：https://api.example.com/v1/messages"
 required
 type="text"
 />
 <p v-if="errors.apiUrl">{{ errors.apiUrl }}</p>
 </div>
 <div>
 <label
 >API Key {{ isEdit ? '(留空不更新)' : '*' }}</label
 >
 <input
 v-model="form.apiKey"
 :placeholder="isEdit ? '留空表示不更新' : '必填'"
 :required="!isEdit"
 type="password"
 />
 <p v-if="errors.apiKey">{{ errors.apiKey }}</p>
 </div>
 </div>

 <div>
 <div>
 <label
 >优先级</label
 >
 <input
 v-model.number="form.priority"
 max="100"
 min="1"
 placeholder="默认50，数字越小优先级越高"
 type="number"
 />
 <p>
 建议范围：1-100，数字越小优先级越高
 </p>
 </div>
 <div>
 <label
 >自定义 User-Agent (可选)</label
 >
 <input
 v-model="form.userAgent"
 placeholder="留空则透传客户端 User-Agent"
 type="text"
 />
 </div>
 </div>

 <!-- 限流设置 -->
 <div>
 <label
 >限流机制</label
 >
 <div>
 <label>
 <input
 v-model="enableRateLimit"
 type="checkbox"
 />
 <span
 >启用限流机制（429 时暂停调度）</span
 >
 </label>
 </div>
 <div v-if="enableRateLimit">
 <label
 >限流时间 (分钟)</label
 >
 <input
 v-model.number="form.rateLimitDuration"
 min="1"
 placeholder="默认60分钟"
 type="number"
 />
 <p>
 账号被限流后暂停调度的时间（分钟）
 </p>
 </div>
 </div>

 <!-- 额度管理 -->
 <div>
 <div>
 <label
 >每日额度限制 ($)</label
 >
 <input
 v-model.number="form.dailyQuota"
 min="0"
 placeholder="0 表示不限制"
 step="0.01"
 type="number"
 />
 <p>
 设置每日使用额度，0 表示不限制
 </p>
 </div>
 <div>
 <label
 >额度重置时间</label
 >
 <input
 v-model="form.quotaResetTime"
 placeholder="00:00"
 type="time"
 />
 <p>每日自动重置额度的时间</p>
 </div>
 </div>

 <!-- 模型映射表（可选） -->
 <div>
 <label
 >模型映射表 (可选)</label
 >
 <div>
 <p>
 
 留空表示支持所有模型且不修改请求。配置映射后，左侧模型会被识别为支持的模型，右侧是实际发送的模型。
 </p>
 </div>
 <div>
 <div
 v-for="(mapping, index) in modelMappings"
 :key="index"
 >
 <input
 v-model="mapping.from"
 placeholder="原始模型名称"
 type="text"
 />
 
 <input
 v-model="mapping.to"
 placeholder="映射后的模型名称"
 type="text"
 />
 <button
 type="button"
 @click="removeModelMapping(index)"
 >
 
 </button>
 </div>
 </div>
 <button
 type="button"
 @click="addModelMapping"
 >
 添加模型映射
 </button>
 </div>

 <!-- 代理配置 -->
 <div>
 <ProxyConfig v-model="form.proxy" />
 </div>

 <!-- 操作区 -->
 <div>
 <button
 type="button"
 @click="$emit('close')"
 >
 取消
 </button>
 <button
 :disabled="loading"
 type="button"
 @click="submit"
 >
 <div v-if="loading" />
 {{ loading ? (isEdit ? '保存中...' : '创建中...') : isEdit ? '保存' : '创建' }}
 </button>
 </div>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'
import ProxyConfig from '@/components/accounts/ProxyConfig.vue'

const props = defineProps({
 account: {
 type: Object,
 default: null
 }
})

const emit = defineEmits(['close', 'success'])

const show = ref(true)
const isEdit = computed(() => !!props.account)
const loading = ref(false)

const form = ref({
 name: '',
 description: '',
 apiUrl: '',
 apiKey: '',
 priority: 50,
 userAgent: '',
 rateLimitDuration: 60,
 dailyQuota: 0,
 quotaResetTime: '00:00',
 proxy: null,
 supportedModels: {}
})

const enableRateLimit = ref(true)
const errors = ref({})

const modelMappings = ref([]) // [{from,to}]

const buildSupportedModels = () => {
 const map = {}
 for (const m of modelMappings.value) {
 const from = (m.from || '').trim()
 const to = (m.to || '').trim()
 if (from && to) map[from] = to
 }
 return map
}

const addModelMapping = () => {
 modelMappings.value.push({ from: '', to: '' })
}

const removeModelMapping = (index) => {
 modelMappings.value.splice(index, 1)
}

const validate = () => {
 const e = {}
 if (!form.value.name || form.value.name.trim().length === 0) e.name = '名称不能为空'
 if (!form.value.apiUrl || form.value.apiUrl.trim().length === 0) e.apiUrl = 'API URL 不能为空'
 if (!isEdit.value && (!form.value.apiKey || form.value.apiKey.trim().length === 0))
 e.apiKey = 'API Key 不能为空'
 errors.value = e
 return Object.keys(e).length === 0
}

const submit = async () => {
 if (!validate()) return
 loading.value = true
 try {
 if (isEdit.value) {
 // 更新
 const updates = {
 name: form.value.name,
 description: form.value.description,
 apiUrl: form.value.apiUrl,
 priority: form.value.priority,
 userAgent: form.value.userAgent,
 rateLimitDuration: enableRateLimit.value ? Number(form.value.rateLimitDuration || 60) : 0,
 dailyQuota: Number(form.value.dailyQuota || 0),
 quotaResetTime: form.value.quotaResetTime || '00:00',
 proxy: form.value.proxy || null,
 supportedModels: buildSupportedModels()
 }
 if (form.value.apiKey && form.value.apiKey.trim().length > 0) {
 updates.apiKey = form.value.apiKey
 }
 const res = await apiClient.put(`/admin/ccr-accounts/${props.account.id}`, updates)
 if (res.success) {
 // 不在这里显示 toast，由父组件统一处理
 emit('success')
 } else {
 showToast(res.message || '保存失败', 'error')
 }
 } else {
 // 创建
 const payload = {
 name: form.value.name,
 description: form.value.description,
 apiUrl: form.value.apiUrl,
 apiKey: form.value.apiKey,
 priority: Number(form.value.priority || 50),
 supportedModels: buildSupportedModels(),
 userAgent: form.value.userAgent,
 rateLimitDuration: enableRateLimit.value ? Number(form.value.rateLimitDuration || 60) : 0,
 proxy: form.value.proxy,
 accountType: 'shared',
 dailyQuota: Number(form.value.dailyQuota || 0),
 quotaResetTime: form.value.quotaResetTime || '00:00'
 }
 const res = await apiClient.post('/admin/ccr-accounts', payload)
 if (res.success) {
 // 不在这里显示 toast，由父组件统一处理
 emit('success')
 } else {
 showToast(res.message || '创建失败', 'error')
 }
 }
 } catch (err) {
 showToast(err.message || '请求失败', 'error')
 } finally {
 loading.value = false
 }
}

const populateFromAccount = () => {
 if (!props.account) return
 const a = props.account
 form.value.name = a.name || ''
 form.value.description = a.description || ''
 form.value.apiUrl = a.apiUrl || ''
 form.value.priority = Number(a.priority || 50)
 form.value.userAgent = a.userAgent || ''
 form.value.rateLimitDuration = Number(a.rateLimitDuration || 60)
 form.value.dailyQuota = Number(a.dailyQuota || 0)
 form.value.quotaResetTime = a.quotaResetTime || '00:00'
 form.value.proxy = a.proxy || null
 enableRateLimit.value = form.value.rateLimitDuration > 0

 // supportedModels 对象转为数组
 modelMappings.value = []
 const mapping = a.supportedModels || {}
 if (mapping && typeof mapping === 'object') {
 for (const k of Object.keys(mapping)) {
 modelMappings.value.push({ from: k, to: mapping[k] })
 }
 }
}

onMounted(() => {
 if (isEdit.value) populateFromAccount()
})

watch(
 () => props.account,
 () => {
 if (isEdit.value) populateFromAccount()
 }
)
</script>

