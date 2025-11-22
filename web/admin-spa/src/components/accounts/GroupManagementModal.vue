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
 <h3>账户分组管理</h3>
 </div>
 <button
 @click="$emit('close')"
 >
 
 </button>
 </div>

 <!-- 添加分组按钮 -->
 <div>
 <button @click="showCreateForm = true">
 
 创建新分组
 </button>
 </div>

 <!-- 创建分组表单 -->
 <div v-if="showCreateForm">
 <h4>创建新分组</h4>
 <div>
 <div>
 <label>分组名称 *</label>
 <input
 v-model="createForm.name"
 placeholder="输入分组名称"
 type="text"
 />
 </div>

 <div>
 <label>平台类型 *</label>
 <div>
 <label>
 <input v-model="createForm.platform" type="radio" value="claude" />
 <span>Claude</span>
 </label>
 <label>
 <input v-model="createForm.platform" type="radio" value="gemini" />
 <span>Gemini</span>
 </label>
 <label>
 <input v-model="createForm.platform" type="radio" value="openai" />
 <span>OpenAI</span>
 </label>
 <label>
 <input v-model="createForm.platform" type="radio" value="droid" />
 <span>Droid</span>
 </label>
 </div>
 </div>

 <div>
 <label>描述 (可选)</label>
 <textarea
 v-model="createForm.description"
 placeholder="分组描述..."
 rows="2"
 />
 </div>

 <div>
 <button
 :disabled="!createForm.name || !createForm.platform || creating"
 @click="createGroup"
 >
 <div v-if="creating" />
 {{ creating ? '创建中...' : '创建' }}
 </button>
 <button @click="cancelCreate">取消</button>
 </div>
 </div>
 </div>

 <!-- 分组列表 -->
 <div>
 <div v-if="loading">
 <div />
 <p >加载中...</p>
 </div>

 <div v-else-if="groups.length === 0">
 
 <p >暂无分组</p>
 </div>

 <div v-else>
 <div
 v-for="group in groups"
 :key="group.id"
 >
 <div>
 <div>
 <h4>
 {{ group.name }}
 </h4>
 <p>
 {{ group.description || '暂无描述' }}
 </p>
 </div>
 <div>
 <span
 >
 {{
 group.platform === 'claude'
 ? 'Claude'
 : group.platform === 'gemini'
 ? 'Gemini'
 : group.platform === 'openai'
 ? 'OpenAI'
 : 'Droid'
 }}
 </span>
 </div>
 </div>

 <div>
 <div>
 <span>
 
 {{ group.memberCount || 0 }} 个成员
 </span>
 <span>
 
 {{ formatDate(group.createdAt) }}
 </span>
 </div>
 <div>
 <button
 title="编辑"
 @click="editGroup(group)"
 >
 
 </button>
 <button
 :disabled="group.memberCount > 0"
 title="删除"
 @click="deleteGroup(group)"
 >
 
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- 编辑分组模态框 -->
 <div
 v-if="showEditForm"
 >
 <div>
 <div>
 <h3>编辑分组</h3>
 <button @click="cancelEdit">
 
 </button>
 </div>

 <div>
 <div>
 <label>分组名称 *</label>
 <input
 v-model="editForm.name"
 placeholder="输入分组名称"
 type="text"
 />
 </div>

 <div>
 <label>平台类型</label>
 <div>
 {{
 editForm.platform === 'claude'
 ? 'Claude'
 : editForm.platform === 'gemini'
 ? 'Gemini'
 : 'OpenAI'
 }}
 <span>(不可修改)</span>
 </div>
 </div>

 <div>
 <label>描述 (可选)</label>
 <textarea
 v-model="editForm.description"
 placeholder="分组描述..."
 rows="2"
 />
 </div>

 <div>
 <button
 :disabled="!editForm.name || updating"
 @click="updateGroup"
 >
 <div v-if="updating" />
 {{ updating ? '更新中...' : '更新' }}
 </button>
 <button @click="cancelEdit">取消</button>
 </div>
 </div>
 </div>
 </div>
 </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'

const emit = defineEmits(['close', 'refresh'])

const show = ref(true)
const loading = ref(false)
const groups = ref([])

// 创建表单
const showCreateForm = ref(false)
const creating = ref(false)
const createForm = ref({
 name: '',
 platform: 'claude',
 description: ''
})

// 编辑表单
const showEditForm = ref(false)
const updating = ref(false)
const editingGroup = ref(null)
const editForm = ref({
 name: '',
 platform: '',
 description: ''
})

// 格式化日期
const formatDate = (dateStr) => {
 if (!dateStr) return '-'
 const date = new Date(dateStr)
 return date.toLocaleDateString('zh-CN')
}

// 加载分组列表
const loadGroups = async () => {
 loading.value = true
 try {
 const response = await apiClient.get('/admin/account-groups')
 groups.value = response.data || []
 } catch (error) {
 showToast('加载分组列表失败', 'error')
 } finally {
 loading.value = false
 }
}

// 创建分组
const createGroup = async () => {
 if (!createForm.value.name || !createForm.value.platform) {
 showToast('请填写必填项', 'error')
 return
 }

 creating.value = true
 try {
 await apiClient.post('/admin/account-groups', {
 name: createForm.value.name,
 platform: createForm.value.platform,
 description: createForm.value.description
 })

 showToast('分组创建成功', 'success')
 cancelCreate()
 await loadGroups()
 emit('refresh')
 } catch (error) {
 showToast(error.response?.data?.error || '创建分组失败', 'error')
 } finally {
 creating.value = false
 }
}

// 取消创建
const cancelCreate = () => {
 showCreateForm.value = false
 createForm.value = {
 name: '',
 platform: 'claude',
 description: ''
 }
}

// 编辑分组
const editGroup = (group) => {
 editingGroup.value = group
 editForm.value = {
 name: group.name,
 platform: group.platform,
 description: group.description || ''
 }
 showEditForm.value = true
}

// 更新分组
const updateGroup = async () => {
 if (!editForm.value.name) {
 showToast('请填写分组名称', 'error')
 return
 }

 updating.value = true
 try {
 await apiClient.put(`/admin/account-groups/${editingGroup.value.id}`, {
 name: editForm.value.name,
 description: editForm.value.description
 })

 showToast('分组更新成功', 'success')
 cancelEdit()
 await loadGroups()
 emit('refresh')
 } catch (error) {
 showToast(error.response?.data?.error || '更新分组失败', 'error')
 } finally {
 updating.value = false
 }
}

// 取消编辑
const cancelEdit = () => {
 showEditForm.value = false
 editingGroup.value = null
 editForm.value = {
 name: '',
 platform: '',
 description: ''
 }
}

// 删除分组
const deleteGroup = async (group) => {
 if (group.memberCount > 0) {
 showToast('分组内还有成员，无法删除', 'error')
 return
 }

 if (!confirm(`确定要删除分组 "${group.name}" 吗？`)) {
 return
 }

 try {
 await apiClient.delete(`/admin/account-groups/${group.id}`)
 showToast('分组删除成功', 'success')
 await loadGroups()
 emit('refresh')
 } catch (error) {
 showToast(error.response?.data?.error || '删除分组失败', 'error')
 }
}

// 组件挂载时加载数据
onMounted(() => {
 loadGroups()
})
</script>
