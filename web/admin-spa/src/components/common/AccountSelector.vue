<template>
 <div ref="triggerRef">
 <!-- 选择器主体 -->
 <div
 @click="!disabled && toggleDropdown()"
 >
 <span
 >{{ selectedLabel }}</span
 >
 
 </div>

 <!-- 下拉菜单 -->
 <Teleport to="body">
 <Transition
 enter-active-class="transition ease-out duration-100"
 enter-from-class="opacity-0"
 enter-to-class="opacity-100"
 leave-active-class="transition ease-in duration-75"
 leave-from-class="opacity-100"
 leave-to-class="opacity-0"
 >
 <div
 v-if="showDropdown"
 ref="dropdownRef"
 >
 <!-- 搜索框 -->
 <div>
 <div>
 <input
 ref="searchInput"
 v-model="searchQuery"
 placeholder="搜索账号名称..."
 type="text"
 @input="handleSearch"
 />
 <Icon name="Search" />
 <button
 v-if="searchQuery"
 type="button"
 @click="clearSearch"
 >
 
 </button>
 </div>
 </div>

 <!-- 选项列表 -->
 <div>
 <!-- 特殊选项 -->
 <div
 v-if="specialOptionsList.length > 0"
 >
 <div
 v-for="option in specialOptionsList"
 :key="`special-${option.value}`"
 @click="selectAccount(option.value)"
 >
 <span >{{ option.label }}</span>
 <span
 v-if="option.description"
 >
 {{ option.description }}
 </span>
 </div>
 </div>

 <!-- 默认选项 -->
 <div
 @click="selectAccount(null)"
 >
 <span >{{ defaultOptionText }}</span>
 </div>

 <!-- 分组选项 -->
 <div v-if="filteredGroups.length > 0">
 <div
 >
 调度分组
 </div>
 <div
 v-for="group in filteredGroups"
 :key="`group:${group.id}`"
 @click="selectAccount(`group:${group.id}`)"
 >
 <div>
 <span >{{ group.name }}</span>
 <span
 >{{ group.memberCount || 0 }} 个成员</span
 >
 </div>
 </div>
 </div>

 <!-- OAuth 账号 -->
 <div v-if="filteredOAuthAccounts.length > 0">
 <div
 >
 {{
 platform === 'claude'
 ? 'Claude OAuth 专属账号'
 : platform === 'openai'
 ? 'OpenAI 专属账号'
 : platform === 'droid'
 ? 'Droid 专属账号'
 : 'OAuth 专属账号'
 }}
 </div>
 <div
 v-for="account in filteredOAuthAccounts"
 :key="account.id"
 @click="selectAccount(account.id)"
 >
 <div>
 <div>
 <span >{{ account.name }}</span>
 <span
 >
 {{ getAccountStatusText(account) }}
 </span>
 </div>
 <span>
 {{ formatDate(account.createdAt) }}
 </span>
 </div>
 </div>
 </div>

 <!-- Console 账号（仅 Claude） -->
 <div v-if="platform === 'claude' && filteredConsoleAccounts.length > 0">
 <div
 >
 Claude Console 专属账号
 </div>
 <div
 v-for="account in filteredConsoleAccounts"
 :key="account.id"
 @click="selectAccount(`console:${account.id}`)"
 >
 <div>
 <div>
 <span >{{ account.name }}</span>
 <span
 >
 {{ getAccountStatusText(account) }}
 </span>
 </div>
 <span>
 {{ formatDate(account.createdAt) }}
 </span>
 </div>
 </div>
 </div>

 <!-- OpenAI-Responses 账号（仅 OpenAI） -->
 <div v-if="platform === 'openai' && filteredOpenAIResponsesAccounts.length > 0">
 <div
 >
 OpenAI-Responses 专属账号
 </div>
 <div
 v-for="account in filteredOpenAIResponsesAccounts"
 :key="account.id"
 @click="selectAccount(`responses:${account.id}`)"
 >
 <div>
 <div>
 <span >{{ account.name }}</span>
 <span
 >
 {{ getAccountStatusText(account) }}
 </span>
 </div>
 <span>
 {{ formatDate(account.createdAt) }}
 </span>
 </div>
 </div>
 </div>

 <!-- 无搜索结果 -->
 <div
 v-if="searchQuery && !hasResults"
 >
 
 <p>没有找到匹配的账号</p>
 </div>
 </div>
 </div>
 </Transition>
 </Teleport>
 </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
 modelValue: {
 type: String,
 default: ''
 },
 platform: {
 type: String,
 required: true,
 validator: (value) => ['claude', 'gemini', 'openai', 'bedrock', 'droid'].includes(value)
 },
 accounts: {
 type: Array,
 default: () => []
 },
 groups: {
 type: Array,
 default: () => []
 },
 disabled: {
 type: Boolean,
 default: false
 },
 placeholder: {
 type: String,
 default: '请选择账号'
 },
 defaultOptionText: {
 type: String,
 default: '使用共享账号池'
 },
 specialOptions: {
 type: Array,
 default: () => []
 }
})

const emit = defineEmits(['update:modelValue'])

const showDropdown = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const dropdownRef = ref(null)
const dropdownStyle = ref({})
const triggerRef = ref(null)
const lastDirection = ref('') // 记住上次的显示方向
const specialOptionsList = computed(() => props.specialOptions || [])

// 获取选中的标签
const selectedLabel = computed(() => {
 const matchedSpecial = specialOptionsList.value.find(
 (option) => option.value === props.modelValue
 )
 if (matchedSpecial) {
 return matchedSpecial.label
 }

 // 如果没有选中值，显示默认选项文本
 if (!props.modelValue) return props.defaultOptionText

 // 分组
 if (props.modelValue.startsWith('group:')) {
 const groupId = props.modelValue.substring(6)
 const group = props.groups.find((g) => g.id === groupId)
 return group ? `${group.name} (${group.memberCount || 0} 个成员)` : ''
 }

 // Console 账号
 if (props.modelValue.startsWith('console:')) {
 const accountId = props.modelValue.substring(8)
 const account = props.accounts.find(
 (a) => a.id === accountId && a.platform === 'claude-console'
 )
 return account ? `${account.name} (${getAccountStatusText(account)})` : ''
 }

 // OpenAI-Responses 账号
 if (props.modelValue.startsWith('responses:')) {
 const accountId = props.modelValue.substring(10)
 const account = props.accounts.find(
 (a) => a.id === accountId && a.platform === 'openai-responses'
 )
 return account ? `${account.name} (${getAccountStatusText(account)})` : ''
 }

 // OAuth 账号
 const account = props.accounts.find((a) => a.id === props.modelValue)
 return account ? `${account.name} (${getAccountStatusText(account)})` : ''
})

// 获取账户状态文本
const getAccountStatusText = (account) => {
 if (!account) return '未知'

 // 处理 OpenAI-Responses 账号（isActive 可能是字符串）
 const isActive = account.isActive === 'true' || account.isActive === true

 // 优先使用 isActive 判断
 if (!isActive) {
 // 根据 status 提供更详细的状态信息
 switch (account.status) {
 case 'unauthorized':
 return '未授权'
 case 'error':
 return 'Token错误'
 case 'created':
 return '待验证'
 case 'rate_limited':
 return '限流中'
 case 'quota_exceeded':
 return '额度超限'
 default:
 return '异常'
 }
 }

 // 对于激活的账号，如果是限流状态也要显示
 if (account.status === 'rate_limited') {
 return '限流中'
 }

 return '正常'
}

// 按创建时间倒序排序账号
const sortedAccounts = computed(() => {
 return [...props.accounts].sort((a, b) => {
 const dateA = new Date(a.createdAt || 0)
 const dateB = new Date(b.createdAt || 0)
 return dateB - dateA // 倒序排序
 })
})

// 过滤的分组（根据平台类型过滤）
const filteredGroups = computed(() => {
 // 只显示与当前平台匹配的分组
 let groups = props.groups.filter((group) => {
 // 如果分组有platform属性，则必须匹配当前平台
 // 如果没有platform属性，则认为是旧数据，根据平台判断
 if (group.platform) {
 return group.platform === props.platform
 }
 // 向后兼容：如果没有platform字段，通过其他方式判断
 return true
 })

 if (searchQuery.value) {
 const query = searchQuery.value.toLowerCase()
 groups = groups.filter((group) => group.name.toLowerCase().includes(query))
 }

 return groups
})

// 过滤的 OAuth 账号
const filteredOAuthAccounts = computed(() => {
 let accounts = []

 if (props.platform === 'claude') {
 accounts = sortedAccounts.value.filter((a) => a.platform === 'claude-oauth')
 } else if (props.platform === 'openai') {
 // 对于 OpenAI，只显示 openai 类型的账号
 accounts = sortedAccounts.value.filter((a) => a.platform === 'openai')
 } else if (props.platform === 'droid') {
 accounts = sortedAccounts.value.filter((a) => a.platform === 'droid')
 } else {
 // 其他平台显示所有非特殊类型的账号
 accounts = sortedAccounts.value.filter(
 (a) => !['claude-oauth', 'claude-console', 'openai-responses'].includes(a.platform)
 )
 }

 if (searchQuery.value) {
 const query = searchQuery.value.toLowerCase()
 accounts = accounts.filter((account) => account.name.toLowerCase().includes(query))
 }

 return accounts
})

// 过滤的 Console 账号
const filteredConsoleAccounts = computed(() => {
 if (props.platform !== 'claude') return []

 let accounts = sortedAccounts.value.filter((a) => a.platform === 'claude-console')

 if (searchQuery.value) {
 const query = searchQuery.value.toLowerCase()
 accounts = accounts.filter((account) => account.name.toLowerCase().includes(query))
 }

 return accounts
})

// 过滤的 OpenAI-Responses 账号
const filteredOpenAIResponsesAccounts = computed(() => {
 if (props.platform !== 'openai') return []

 let accounts = sortedAccounts.value.filter((a) => a.platform === 'openai-responses')

 if (searchQuery.value) {
 const query = searchQuery.value.toLowerCase()
 accounts = accounts.filter((account) => account.name.toLowerCase().includes(query))
 }

 return accounts
})

// 是否有搜索结果
const hasResults = computed(() => {
 return (
 filteredGroups.value.length > 0 ||
 filteredOAuthAccounts.value.length > 0 ||
 filteredConsoleAccounts.value.length > 0 ||
 filteredOpenAIResponsesAccounts.value.length > 0
 )
})

// 格式化日期
const formatDate = (dateString) => {
 if (!dateString) return ''
 const date = new Date(dateString)
 const now = new Date()
 const diffInHours = (now - date) / (1000 * 60 * 60)

 if (diffInHours < 24) {
 return '今天创建'
 } else if (diffInHours < 48) {
 return '昨天创建'
 } else if (diffInHours < 168) {
 // 7天内
 return `${Math.floor(diffInHours / 24)} 天前`
 } else {
 return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
 }
}

// 更新下拉菜单位置
const updateDropdownPosition = () => {
 if (!showDropdown.value || !dropdownRef.value || !triggerRef.value) return

 const trigger = triggerRef.value
 if (!trigger) return

 const rect = trigger.getBoundingClientRect()
 const windowHeight = window.innerHeight
 const windowWidth = window.innerWidth
 const spaceBelow = windowHeight - rect.bottom
 const spaceAbove = rect.top
 const margin = 8 // 边距

 // 获取下拉框的高度
 // const dropdownHeight = dropdownRef.value.offsetHeight

 // 计算最大可用高度
 const maxHeightBelow = spaceBelow - margin
 const maxHeightAbove = spaceAbove - margin

 // 决定显示方向和最大高度
 let showAbove = false
 let maxHeight = maxHeightBelow

 // 优先使用上次的方向，除非空间不足
 if (lastDirection.value === 'above' && maxHeightAbove >= 150) {
 showAbove = true
 maxHeight = maxHeightAbove
 } else if (lastDirection.value === 'below' && maxHeightBelow >= 150) {
 showAbove = false
 maxHeight = maxHeightBelow
 } else {
 // 如果没有历史方向或空间不足，选择空间更大的方向
 if (maxHeightAbove > maxHeightBelow && maxHeightBelow < 200) {
 showAbove = true
 maxHeight = maxHeightAbove
 }
 }

 // 记住这次的方向
 lastDirection.value = showAbove ? 'above' : 'below'

 // 确保下拉框不超出视窗左右边界
 let left = rect.left
 const dropdownWidth = rect.width
 if (left + dropdownWidth > windowWidth - margin) {
 left = windowWidth - dropdownWidth - margin
 }
 if (left < margin) {
 left = margin
 }

 dropdownStyle.value = {
 position: 'fixed',
 left: `${left}px`,
 width: `${rect.width}px`,
 maxHeight: `${Math.min(maxHeight, 400)}px`, // 限制最大高度为400px
 ...(showAbove ? { bottom: `${windowHeight - rect.top}px` } : { top: `${rect.bottom}px` })
 }
}

// 切换下拉菜单
const toggleDropdown = () => {
 if (!showDropdown.value && triggerRef.value) {
 // 在显示前就设置初始样式，避免闪烁
 const rect = triggerRef.value.getBoundingClientRect()
 const windowHeight = window.innerHeight
 const spaceBelow = windowHeight - rect.bottom
 const margin = 8

 // 预先设置一个合理的初始位置
 dropdownStyle.value = {
 position: 'fixed',
 left: `${rect.left}px`,
 width: `${rect.width}px`,
 maxHeight: `${Math.min(spaceBelow - margin, 400)}px`,
 top: `${rect.bottom}px`
 }
 }
 showDropdown.value = !showDropdown.value
 if (showDropdown.value) {
 nextTick(() => {
 updateDropdownPosition()
 searchInput.value?.focus()
 })
 }
}

// 选择账号
const selectAccount = (value) => {
 emit('update:modelValue', value || '')
 showDropdown.value = false
 searchQuery.value = ''
}

// 处理搜索
const handleSearch = () => {
 // 搜索时自动触发
}

// 清除搜索
const clearSearch = () => {
 searchQuery.value = ''
 searchInput.value?.focus()
}

// 点击外部关闭
const handleClickOutside = (event) => {
 if (!triggerRef.value?.contains(event.target) && !dropdownRef.value?.contains(event.target)) {
 showDropdown.value = false
 }
}

// 监听滚动更新位置
const handleScroll = () => {
 if (showDropdown.value) {
 updateDropdownPosition()
 }
}

onMounted(() => {
 document.addEventListener('click', handleClickOutside)
 window.addEventListener('scroll', handleScroll, true)
 window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
 document.removeEventListener('click', handleClickOutside)
 window.removeEventListener('scroll', handleScroll, true)
 window.removeEventListener('resize', updateDropdownPosition)
})

// 监听下拉菜单状态变化
watch(showDropdown, (newVal) => {
 if (!newVal) {
 searchQuery.value = ''
 // 关闭时重置方向，下次打开重新计算
 lastDirection.value = ''
 }
})
</script>

