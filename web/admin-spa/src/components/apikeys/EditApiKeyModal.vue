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
 <h3>
 编辑 API Key
 </h3>
 </div>
 <button
 @click="$emit('close')"
 >
 
 </button>
 </div>

 <form
 @submit.prevent="updateApiKey"
 >
 <div>
 <label
 >名称</label
 >
 <div>
 <input
 v-model="form.name"
 maxlength="100"
 placeholder="请输入API Key名称"
 required
 type="text"
 />
 </div>
 <p>
 用于识别此 API Key 的用途
 </p>
 </div>

 <!-- 所有者选择 -->
 <div>
 <label
 >所有者</label
 >
 <select
 v-model="form.ownerId"
 >
 <option v-for="user in availableUsers" :key="user.id" :value="user.id">
 {{ user.displayName }} ({{ user.username }})
 <span v-if="user.role === 'admin'" >- 管理员</span>
 </option>
 </select>
 <p>
 分配此 API Key 给指定用户或管理员，管理员分配时不受用户 API Key 数量限制
 </p>
 </div>

 <!-- 标签 -->
 <div>
 <label
 >标签</label
 >
 <div>
 <!-- 已选择的标签 -->
 <div v-if="form.tags.length > 0">
 <div>
 已选择的标签:
 </div>
 <div>
 <span
 v-for="(tag, index) in form.tags"
 :key="'selected-' + index"
 >
 {{ tag }}
 <button
 type="button"
 @click="removeTag(index)"
 >
 
 </button>
 </span>
 </div>
 </div>

 <!-- 可选择的已有标签 -->
 <div v-if="unselectedTags.length > 0">
 <div>
 点击选择已有标签:
 </div>
 <div>
 <button
 v-for="tag in unselectedTags"
 :key="'available-' + tag"
 type="button"
 @click="selectTag(tag)"
 >
 
 {{ tag }}
 </button>
 </div>
 </div>

 <!-- 创建新标签 -->
 <div>
 <div>
 创建新标签:
 </div>
 <div>
 <input
 v-model="newTag"
 placeholder="输入新标签名称"
 type="text"
 @keypress.enter.prevent="addTag"
 />
 <button
 type="button"
 @click="addTag"
 >
 
 </button>
 </div>
 </div>

 <p>
 用于标记不同团队或用途，方便筛选管理
 </p>
 </div>
 </div>

 <!-- 速率限制设置 -->
 <div
 >
 <div>
 <div
 >
 
 </div>
 <h4>
 速率限制设置 (可选)
 </h4>
 </div>

 <div>
 <div>
 <div>
 <label
 >时间窗口 (分钟)</label
 >
 <input
 v-model="form.rateLimitWindow"
 min="1"
 placeholder="无限制"
 type="number"
 />
 <p>时间段单位</p>
 </div>

 <div>
 <label
 >请求次数限制</label
 >
 <input
 v-model="form.rateLimitRequests"
 min="1"
 placeholder="无限制"
 type="number"
 />
 <p>窗口内最大请求</p>
 </div>

 <div>
 <label
 >费用限制 (美元)</label
 >
 <input
 v-model="form.rateLimitCost"
 min="0"
 placeholder="无限制"
 step="0.01"
 type="number"
 />
 <p>窗口内最大费用</p>
 </div>
 </div>

 <!-- 示例说明 -->
 <div>
 <h5>
 💡 使用示例
 </h5>
 <div>
 <div>
 <strong>示例1:</strong> 时间窗口=60，请求次数=1000 → 每60分钟最多1000次请求
 </div>
 <div><strong>示例2:</strong> 时间窗口=1，费用=0.1 → 每分钟最多$0.1费用</div>
 <div>
 <strong>示例3:</strong> 窗口=30，请求=50，费用=5 → 每30分钟50次请求且不超$5费用
 </div>
 </div>
 </div>
 </div>
 </div>

 <div>
 <label
 >每日费用限制 (美元)</label
 >
 <div>
 <div>
 <button
 type="button"
 @click="form.dailyCostLimit = '50'"
 >
 $50
 </button>
 <button
 type="button"
 @click="form.dailyCostLimit = '100'"
 >
 $100
 </button>
 <button
 type="button"
 @click="form.dailyCostLimit = '200'"
 >
 $200
 </button>
 <button
 type="button"
 @click="form.dailyCostLimit = ''"
 >
 自定义
 </button>
 </div>
 <input
 v-model="form.dailyCostLimit"
 min="0"
 placeholder="0 表示无限制"
 step="0.01"
 type="number"
 />
 <p>
 设置此 API Key 每日的费用限制，超过限制将拒绝请求，0 或留空表示无限制
 </p>
 </div>
 </div>

 <div>
 <label
 >总费用限制 (美元)</label
 >
 <div>
 <div>
 <button
 type="button"
 @click="form.totalCostLimit = '100'"
 >
 $100
 </button>
 <button
 type="button"
 @click="form.totalCostLimit = '500'"
 >
 $500
 </button>
 <button
 type="button"
 @click="form.totalCostLimit = '1000'"
 >
 $1000
 </button>
 <button
 type="button"
 @click="form.totalCostLimit = ''"
 >
 自定义
 </button>
 </div>
 <input
 v-model="form.totalCostLimit"
 min="0"
 placeholder="0 表示无限制"
 step="0.01"
 type="number"
 />
 <p>
 设置此 API Key 的累计总费用限制，达到限制后将拒绝所有后续请求，0 或留空表示无限制
 </p>
 </div>
 </div>

 <div>
 <label
 >Opus 模型周费用限制 (美元)</label
 >
 <div>
 <div>
 <button
 type="button"
 @click="form.weeklyOpusCostLimit = '100'"
 >
 $100
 </button>
 <button
 type="button"
 @click="form.weeklyOpusCostLimit = '500'"
 >
 $500
 </button>
 <button
 type="button"
 @click="form.weeklyOpusCostLimit = '1000'"
 >
 $1000
 </button>
 <button
 type="button"
 @click="form.weeklyOpusCostLimit = ''"
 >
 自定义
 </button>
 </div>
 <input
 v-model="form.weeklyOpusCostLimit"
 min="0"
 placeholder="0 表示无限制"
 step="0.01"
 type="number"
 />
 <p>
 设置 Opus 模型的周费用限制（周一到周日），仅限 Claude 官方账户，0 或留空表示无限制
 </p>
 </div>
 </div>

 <div>
 <label
 >并发限制</label
 >
 <input
 v-model="form.concurrencyLimit"
 min="0"
 placeholder="0 表示无限制"
 type="number"
 />
 <p>
 设置此 API Key 可同时处理的最大请求数
 </p>
 </div>

 <!-- 激活账号 -->
 <div>
 <div>
 <input
 id="editIsActive"
 v-model="form.isActive"
 type="checkbox"
 />
 <label
 for="editIsActive"
 >
 激活账号
 </label>
 </div>
 <p>
 取消勾选将禁用此 API Key，暂停所有请求，客户端返回 401 错误
 </p>
 </div>

 <div>
 <label
 >服务权限</label
 >
 <div>
 <label>
 <input
 v-model="form.permissions"
 type="radio"
 value="all"
 />
 <span>全部服务</span>
 </label>
 <label>
 <input
 v-model="form.permissions"
 type="radio"
 value="claude"
 />
 <span>仅 Claude</span>
 </label>
 <label>
 <input
 v-model="form.permissions"
 type="radio"
 value="gemini"
 />
 <span>仅 Gemini</span>
 </label>
 <label>
 <input
 v-model="form.permissions"
 type="radio"
 value="openai"
 />
 <span>仅 OpenAI</span>
 </label>
 <label>
 <input
 v-model="form.permissions"
 type="radio"
 value="droid"
 />
 <span>仅 Droid</span>
 </label>
 </div>
 <p>
 控制此 API Key 可以访问哪些服务
 </p>
 </div>

 <div>
 <div>
 <label
 >专属账号绑定</label
 >
 <button
 :disabled="accountsLoading"
 title="刷新账号列表"
 type="button"
 @click="refreshAccounts"
 >
 <i
 />
 <span>{{ accountsLoading ? '刷新中...' : '刷新账号' }}</span>
 </button>
 </div>
 <div>
 <div>
 <label
 >Claude 专属账号</label
 >
 <AccountSelector
 v-model="form.claudeAccountId"
 :accounts="localAccounts.claude"
 default-option-text="使用共享账号池"
 :disabled="form.permissions !== 'all' && form.permissions !== 'claude'"
 :groups="localAccounts.claudeGroups"
 placeholder="请选择Claude账号"
 platform="claude"
 />
 </div>
 <div>
 <label
 >Gemini 专属账号</label
 >
 <AccountSelector
 v-model="form.geminiAccountId"
 :accounts="localAccounts.gemini"
 default-option-text="使用共享账号池"
 :disabled="form.permissions !== 'all' && form.permissions !== 'gemini'"
 :groups="localAccounts.geminiGroups"
 placeholder="请选择Gemini账号"
 platform="gemini"
 />
 </div>
 <div>
 <label
 >OpenAI 专属账号</label
 >
 <AccountSelector
 v-model="form.openaiAccountId"
 :accounts="localAccounts.openai"
 default-option-text="使用共享账号池"
 :disabled="form.permissions !== 'all' && form.permissions !== 'openai'"
 :groups="localAccounts.openaiGroups"
 placeholder="请选择OpenAI账号"
 platform="openai"
 />
 </div>
 <div>
 <label
 >Bedrock 专属账号</label
 >
 <AccountSelector
 v-model="form.bedrockAccountId"
 :accounts="localAccounts.bedrock"
 default-option-text="使用共享账号池"
 :disabled="form.permissions !== 'all' && form.permissions !== 'openai'"
 :groups="[]"
 placeholder="请选择Bedrock账号"
 platform="bedrock"
 />
 </div>
 <div>
 <label
 >Droid 专属账号</label
 >
 <AccountSelector
 v-model="form.droidAccountId"
 :accounts="localAccounts.droid"
 default-option-text="使用共享账号池"
 :disabled="form.permissions !== 'all' && form.permissions !== 'droid'"
 :groups="localAccounts.droidGroups"
 placeholder="请选择Droid账号"
 platform="droid"
 />
 </div>
 </div>
 <p>
 修改绑定账号将影响此API Key的请求路由
 </p>
 </div>

 <div>
 <div>
 <input
 id="editEnableModelRestriction"
 v-model="form.enableModelRestriction"
 type="checkbox"
 />
 <label
 for="editEnableModelRestriction"
 >
 启用模型限制
 </label>
 </div>

 <div v-if="form.enableModelRestriction">
 <div>
 <label
 >限制的模型列表</label
 >
 <div
 >
 <span
 v-for="(model, index) in form.restrictedModels"
 :key="index"
 >
 {{ model }}
 <button
 type="button"
 @click="removeRestrictedModel(index)"
 >
 
 </button>
 </span>
 <span
 v-if="form.restrictedModels.length === 0"
 >
 暂无限制的模型
 </span>
 </div>
 <div>
 <!-- 快速添加按钮 -->
 <div>
 <button
 v-for="model in availableQuickModels"
 :key="model"
 type="button"
 @click="quickAddRestrictedModel(model)"
 >
 {{ model }}
 </button>
 <span
 v-if="availableQuickModels.length === 0"
 >
 所有常用模型已在限制列表中
 </span>
 </div>

 <!-- 手动输入 -->
 <div>
 <input
 v-model="form.modelInput"
 placeholder="输入模型名称，按回车添加"
 type="text"
 @keydown.enter.prevent="addRestrictedModel"
 />
 <button
 type="button"
 @click="addRestrictedModel"
 >
 
 </button>
 </div>
 </div>
 <p>
 设置此API Key无法访问的模型，例如：claude-opus-4-20250514
 </p>
 </div>
 </div>
 </div>

 <!-- 客户端限制 -->
 <div>
 <div>
 <input
 id="editEnableClientRestriction"
 v-model="form.enableClientRestriction"
 type="checkbox"
 />
 <label
 for="editEnableClientRestriction"
 >
 启用客户端限制
 </label>
 </div>

 <div v-if="form.enableClientRestriction">
 <div>
 <label
 >允许的客户端</label
 >
 <p>
 勾选允许使用此API Key的客户端
 </p>
 <div>
 <div v-for="client in supportedClients" :key="client.id">
 <input
 :id="`edit_client_${client.id}`"
 v-model="form.allowedClients"
 type="checkbox"
 :value="client.id"
 />
 <label :for="`edit_client_${client.id}`">
 <span>{{
 client.name
 }}</span>
 <span>{{
 client.description
 }}</span>
 </label>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div>
 <button
 type="button"
 @click="$emit('close')"
 >
 取消
 </button>
 <button
 :disabled="loading"
 type="submit"
 >
 <div v-if="loading" />
 
 {{ loading ? '保存中...' : '保存修改' }}
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast } from '@/utils/toast'
import { useClientsStore } from '@/stores/clients'
import { useApiKeysStore } from '@/stores/apiKeys'
import { apiClient } from '@/config/api'
import AccountSelector from '@/components/common/AccountSelector.vue'

const props = defineProps({
 apiKey: {
 type: Object,
 required: true
 },
 accounts: {
 type: Object,
 default: () => ({
 claude: [],
 gemini: [],
 openai: [],
 bedrock: [],
 droid: [],
 claudeGroups: [],
 geminiGroups: [],
 openaiGroups: [],
 droidGroups: [],
 openaiResponses: []
 })
 }
})

const emit = defineEmits(['close', 'success'])

// const authStore = useAuthStore()
const clientsStore = useClientsStore()
const apiKeysStore = useApiKeysStore()
const loading = ref(false)
const accountsLoading = ref(false)
const localAccounts = ref({
 claude: [],
 gemini: [],
 openai: [],
 bedrock: [],
 droid: [],
 claudeGroups: [],
 geminiGroups: [],
 openaiGroups: [],
 droidGroups: []
})

// 支持的客户端列表
const supportedClients = ref([])

// 可用用户列表
const availableUsers = ref([])

// 标签相关
const newTag = ref('')
const availableTags = ref([])

// 计算未选择的标签
const unselectedTags = computed(() => {
 return availableTags.value.filter((tag) => !form.tags.includes(tag))
})

// 表单数据
const form = reactive({
 name: '',
 tokenLimit: '', // 保留用于检测历史数据
 rateLimitWindow: '',
 rateLimitRequests: '',
 rateLimitCost: '', // 新增：费用限制
 concurrencyLimit: '',
 dailyCostLimit: '',
 totalCostLimit: '',
 weeklyOpusCostLimit: '',
 permissions: 'all',
 claudeAccountId: '',
 geminiAccountId: '',
 openaiAccountId: '',
 bedrockAccountId: '',
 droidAccountId: '',
 enableModelRestriction: false,
 restrictedModels: [],
 modelInput: '',
 enableClientRestriction: false,
 allowedClients: [],
 tags: [],
 isActive: true,
 ownerId: '' // 新增：所有者ID
})

// 添加限制的模型
const addRestrictedModel = () => {
 if (form.modelInput && !form.restrictedModels.includes(form.modelInput)) {
 form.restrictedModels.push(form.modelInput)
 form.modelInput = ''
 }
}

// 移除限制的模型
const removeRestrictedModel = (index) => {
 form.restrictedModels.splice(index, 1)
}

// 常用模型列表
const commonModels = ref(['claude-opus-4-20250514', 'claude-opus-4-1-20250805'])

// 可用的快捷模型（过滤掉已在限制列表中的）
const availableQuickModels = computed(() => {
 return commonModels.value.filter((model) => !form.restrictedModels.includes(model))
})

// 快速添加限制的模型
const quickAddRestrictedModel = (model) => {
 if (!form.restrictedModels.includes(model)) {
 form.restrictedModels.push(model)
 }
}

// 标签管理方法
const addTag = () => {
 if (newTag.value && newTag.value.trim()) {
 const tag = newTag.value.trim()
 if (!form.tags.includes(tag)) {
 form.tags.push(tag)
 }
 newTag.value = ''
 }
}

const selectTag = (tag) => {
 if (!form.tags.includes(tag)) {
 form.tags.push(tag)
 }
}

const removeTag = (index) => {
 form.tags.splice(index, 1)
}

// 更新 API Key
const updateApiKey = async () => {
 // 检查是否设置了时间窗口但费用限制为0
 if (form.rateLimitWindow && (!form.rateLimitCost || parseFloat(form.rateLimitCost) === 0)) {
 let confirmed = false
 if (window.showConfirm) {
 confirmed = await window.showConfirm(
 '费用限制提醒',
 '您设置了时间窗口但费用限制为0，这意味着不会有费用限制。\n\n是否继续？',
 '继续保存',
 '返回修改'
 )
 } else {
 // 降级方案
 confirmed = confirm('您设置了时间窗口但费用限制为0，这意味着不会有费用限制。\n是否继续？')
 }
 if (!confirmed) {
 return
 }
 }

 loading.value = true

 try {
 // 准备提交的数据
 const data = {
 name: form.name, // 添加名称字段
 tokenLimit: 0, // 清除历史token限制
 rateLimitWindow:
 form.rateLimitWindow !== '' && form.rateLimitWindow !== null
 ? parseInt(form.rateLimitWindow)
 : 0,
 rateLimitRequests:
 form.rateLimitRequests !== '' && form.rateLimitRequests !== null
 ? parseInt(form.rateLimitRequests)
 : 0,
 rateLimitCost:
 form.rateLimitCost !== '' && form.rateLimitCost !== null
 ? parseFloat(form.rateLimitCost)
 : 0,
 concurrencyLimit:
 form.concurrencyLimit !== '' && form.concurrencyLimit !== null
 ? parseInt(form.concurrencyLimit)
 : 0,
 dailyCostLimit:
 form.dailyCostLimit !== '' && form.dailyCostLimit !== null
 ? parseFloat(form.dailyCostLimit)
 : 0,
 totalCostLimit:
 form.totalCostLimit !== '' && form.totalCostLimit !== null
 ? parseFloat(form.totalCostLimit)
 : 0,
 weeklyOpusCostLimit:
 form.weeklyOpusCostLimit !== '' && form.weeklyOpusCostLimit !== null
 ? parseFloat(form.weeklyOpusCostLimit)
 : 0,
 permissions: form.permissions,
 tags: form.tags
 }

 // 处理Claude账户绑定（区分OAuth和Console）
 if (form.claudeAccountId) {
 if (form.claudeAccountId.startsWith('console:')) {
 // Claude Console账户
 data.claudeConsoleAccountId = form.claudeAccountId.substring(8)
 data.claudeAccountId = null // 清空OAuth账号
 } else if (!form.claudeAccountId.startsWith('group:')) {
 // Claude OAuth账户（非分组）
 data.claudeAccountId = form.claudeAccountId
 data.claudeConsoleAccountId = null // 清空Console账号
 } else {
 // 分组
 data.claudeAccountId = form.claudeAccountId
 data.claudeConsoleAccountId = null // 清空Console账号
 }
 } else {
 // 使用共享池，清空所有绑定
 data.claudeAccountId = null
 data.claudeConsoleAccountId = null
 }

 // Gemini账户绑定
 if (form.geminiAccountId) {
 data.geminiAccountId = form.geminiAccountId
 } else {
 data.geminiAccountId = null
 }

 // OpenAI账户绑定
 if (form.openaiAccountId) {
 data.openaiAccountId = form.openaiAccountId
 } else {
 data.openaiAccountId = null
 }

 // Bedrock账户绑定
 if (form.bedrockAccountId) {
 data.bedrockAccountId = form.bedrockAccountId
 } else {
 data.bedrockAccountId = null
 }

 if (form.droidAccountId) {
 data.droidAccountId = form.droidAccountId
 } else {
 data.droidAccountId = null
 }

 // 模型限制 - 始终提交这些字段
 data.enableModelRestriction = form.enableModelRestriction
 data.restrictedModels = form.restrictedModels

 // 客户端限制 - 始终提交这些字段
 data.enableClientRestriction = form.enableClientRestriction
 data.allowedClients = form.allowedClients

 // 活跃状态
 data.isActive = form.isActive

 // 所有者
 if (form.ownerId !== undefined) {
 data.ownerId = form.ownerId
 }

 const result = await apiClient.put(`/admin/api-keys/${props.apiKey.id}`, data)

 if (result.success) {
 emit('success')
 emit('close')
 } else {
 showToast(result.message || '更新失败', 'error')
 }
 } catch (error) {
 showToast('更新失败', 'error')
 } finally {
 loading.value = false
 }
}

// 刷新账号列表
const refreshAccounts = async () => {
 accountsLoading.value = true
 try {
 const [
 claudeData,
 claudeConsoleData,
 geminiData,
 openaiData,
 openaiResponsesData,
 bedrockData,
 droidData,
 groupsData
 ] = await Promise.all([
 apiClient.get('/admin/claude-accounts'),
 apiClient.get('/admin/claude-console-accounts'),
 apiClient.get('/admin/gemini-accounts'),
 apiClient.get('/admin/openai-accounts'),
 apiClient.get('/admin/openai-responses-accounts'),
 apiClient.get('/admin/bedrock-accounts'),
 apiClient.get('/admin/droid-accounts'),
 apiClient.get('/admin/account-groups')
 ])

 // 合并Claude OAuth账户和Claude Console账户
 const claudeAccounts = []

 if (claudeData.success) {
 claudeData.data?.forEach((account) => {
 claudeAccounts.push({
 ...account,
 platform: 'claude-oauth',
 isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
 })
 })
 }

 if (claudeConsoleData.success) {
 claudeConsoleData.data?.forEach((account) => {
 claudeAccounts.push({
 ...account,
 platform: 'claude-console',
 isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
 })
 })
 }

 localAccounts.value.claude = claudeAccounts

 if (geminiData.success) {
 localAccounts.value.gemini = (geminiData.data || []).map((account) => ({
 ...account,
 isDedicated: account.accountType === 'dedicated'
 }))
 }

 // 合并 OpenAI 和 OpenAI-Responses 账号
 const openaiAccounts = []

 if (openaiData.success) {
 ;(openaiData.data || []).forEach((account) => {
 openaiAccounts.push({
 ...account,
 platform: 'openai',
 isDedicated: account.accountType === 'dedicated'
 })
 })
 }

 if (openaiResponsesData.success) {
 ;(openaiResponsesData.data || []).forEach((account) => {
 openaiAccounts.push({
 ...account,
 platform: 'openai-responses',
 isDedicated: account.accountType === 'dedicated'
 })
 })
 }

 localAccounts.value.openai = openaiAccounts

 if (bedrockData.success) {
 localAccounts.value.bedrock = (bedrockData.data || []).map((account) => ({
 ...account,
 isDedicated: account.accountType === 'dedicated'
 }))
 }

 if (droidData.success) {
 localAccounts.value.droid = (droidData.data || []).map((account) => ({
 ...account,
 platform: 'droid',
 isDedicated: account.accountType === 'dedicated'
 }))
 }

 // 处理分组数据
 if (groupsData.success) {
 const allGroups = groupsData.data || []
 localAccounts.value.claudeGroups = allGroups.filter((g) => g.platform === 'claude')
 localAccounts.value.geminiGroups = allGroups.filter((g) => g.platform === 'gemini')
 localAccounts.value.openaiGroups = allGroups.filter((g) => g.platform === 'openai')
 localAccounts.value.droidGroups = allGroups.filter((g) => g.platform === 'droid')
 }

 showToast('账号列表已刷新', 'success')
 } catch (error) {
 showToast('刷新账号列表失败', 'error')
 } finally {
 accountsLoading.value = false
 }
}

// 加载用户列表
const loadUsers = async () => {
 try {
 const response = await apiClient.get('/admin/users')
 if (response.success) {
 availableUsers.value = response.data || []
 }
 } catch (error) {
 // console.error('Failed to load users:', error)
 availableUsers.value = [
 {
 id: 'admin',
 username: 'admin',
 displayName: 'Admin',
 email: '',
 role: 'admin'
 }
 ]
 }
}

// 初始化表单数据
onMounted(async () => {
 try {
 // 并行加载所有需要的数据
 const [clients, tags] = await Promise.all([
 clientsStore.loadSupportedClients(),
 apiKeysStore.fetchTags(),
 loadUsers()
 ])

 supportedClients.value = clients || []
 availableTags.value = tags || []
 } catch (error) {
 // console.error('Error loading initial data:', error)
 // Fallback to empty arrays if loading fails
 supportedClients.value = []
 availableTags.value = []
 }

 // 初始化账号数据
 if (props.accounts) {
 // 合并 OpenAI 和 OpenAI-Responses 账号
 const openaiAccounts = []
 if (props.accounts.openai) {
 props.accounts.openai.forEach((account) => {
 openaiAccounts.push({
 ...account,
 platform: 'openai'
 })
 })
 }
 if (props.accounts.openaiResponses) {
 props.accounts.openaiResponses.forEach((account) => {
 openaiAccounts.push({
 ...account,
 platform: 'openai-responses'
 })
 })
 }

 localAccounts.value = {
 claude: props.accounts.claude || [],
 gemini: props.accounts.gemini || [],
 openai: openaiAccounts,
 bedrock: props.accounts.bedrock || [],
 droid: (props.accounts.droid || []).map((account) => ({
 ...account,
 platform: 'droid'
 })),
 claudeGroups: props.accounts.claudeGroups || [],
 geminiGroups: props.accounts.geminiGroups || [],
 openaiGroups: props.accounts.openaiGroups || [],
 droidGroups: props.accounts.droidGroups || []
 }
 }

 // 自动加载账号数据
 await refreshAccounts()

 form.name = props.apiKey.name

 // 处理速率限制迁移：如果有tokenLimit且没有rateLimitCost，提示用户
 form.tokenLimit = props.apiKey.tokenLimit || ''
 form.rateLimitCost = props.apiKey.rateLimitCost || ''

 // 如果有历史tokenLimit但没有rateLimitCost，提示用户需要重新设置
 if (props.apiKey.tokenLimit > 0 && !props.apiKey.rateLimitCost) {
 // 可以根据需要添加提示，或者自动迁移（这里选择让用户手动设置）
 // console.log('检测到历史Token限制，请考虑设置费用限制')
 }

 form.rateLimitWindow = props.apiKey.rateLimitWindow || ''
 form.rateLimitRequests = props.apiKey.rateLimitRequests || ''
 form.concurrencyLimit = props.apiKey.concurrencyLimit || ''
 form.dailyCostLimit = props.apiKey.dailyCostLimit || ''
 form.totalCostLimit = props.apiKey.totalCostLimit || ''
 form.weeklyOpusCostLimit = props.apiKey.weeklyOpusCostLimit || ''
 form.permissions = props.apiKey.permissions || 'all'
 // 处理 Claude 账号（区分 OAuth 和 Console）
 if (props.apiKey.claudeConsoleAccountId) {
 form.claudeAccountId = `console:${props.apiKey.claudeConsoleAccountId}`
 } else {
 form.claudeAccountId = props.apiKey.claudeAccountId || ''
 }
 form.geminiAccountId = props.apiKey.geminiAccountId || ''

 // 处理 OpenAI 账号 - 直接使用后端传来的值（已包含 responses: 前缀）
 form.openaiAccountId = props.apiKey.openaiAccountId || ''

 form.bedrockAccountId = props.apiKey.bedrockAccountId || ''
 form.droidAccountId = props.apiKey.droidAccountId || ''
 form.restrictedModels = props.apiKey.restrictedModels || []
 form.allowedClients = props.apiKey.allowedClients || []
 form.tags = props.apiKey.tags || []
 // 从后端数据中获取实际的启用状态，而不是根据数组长度推断
 form.enableModelRestriction = props.apiKey.enableModelRestriction || false
 form.enableClientRestriction = props.apiKey.enableClientRestriction || false
 // 初始化活跃状态，默认为 true
 form.isActive = props.apiKey.isActive !== undefined ? props.apiKey.isActive : true

 // 初始化所有者
 form.ownerId = props.apiKey.userId || 'admin'
})
</script>

