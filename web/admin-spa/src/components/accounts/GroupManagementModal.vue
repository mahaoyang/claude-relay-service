<template>
  <BaseModal icon="Layers" :show="show" size="lg" title="账户分组管理" @close="$emit('close')">
    <template #default>
      <div class="space-y-6">
        <!-- 添加分组按钮 -->
        <div class="flex justify-end">
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            @click="showCreateForm = true"
          >
            <Icon class="h-4 w-4" name="Plus" />
            创建新分组
          </button>
        </div>

        <!-- 创建分组表单 -->
        <div
          v-if="showCreateForm"
          class="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20"
        >
          <h4 class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">创建新分组</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                分组名称 *
              </label>
              <input
                v-model="createForm.name"
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                placeholder="输入分组名称"
                type="text"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                平台类型 *
              </label>
              <div class="mt-2 flex flex-wrap gap-3">
                <label class="inline-flex cursor-pointer items-center">
                  <input
                    v-model="createForm.platform"
                    class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-400"
                    type="radio"
                    value="claude"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Claude</span>
                </label>
                <label class="inline-flex cursor-pointer items-center">
                  <input
                    v-model="createForm.platform"
                    class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-400"
                    type="radio"
                    value="gemini"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Gemini</span>
                </label>
                <label class="inline-flex cursor-pointer items-center">
                  <input
                    v-model="createForm.platform"
                    class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-400"
                    type="radio"
                    value="openai"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">OpenAI</span>
                </label>
                <label class="inline-flex cursor-pointer items-center">
                  <input
                    v-model="createForm.platform"
                    class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-400"
                    type="radio"
                    value="droid"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Droid</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                描述 (可选)
              </label>
              <textarea
                v-model="createForm.description"
                class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                placeholder="分组描述..."
                rows="2"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelCreate"
              >
                取消
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
                :disabled="!createForm.name || !createForm.platform || creating"
                @click="createGroup"
              >
                <div
                  v-if="creating"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
                {{ creating ? '创建中...' : '创建' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 分组列表 -->
        <div>
          <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <div
              class="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"
            />
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
          </div>

          <div
            v-else-if="groups.length === 0"
            class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 dark:border-gray-700"
          >
            <Icon class="h-12 w-12 text-gray-400 dark:text-gray-600" name="Layers" />
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">暂无分组</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="group in groups"
              :key="group.id"
              class="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ group.name }}
                  </h4>
                  <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {{ group.description || '暂无描述' }}
                  </p>
                </div>
                <div>
                  <span
                    class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    :class="{
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300':
                        group.platform === 'claude',
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300':
                        group.platform === 'gemini',
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300':
                        group.platform === 'openai',
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300':
                        group.platform === 'droid'
                    }"
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

              <div
                class="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700"
              >
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span class="inline-flex items-center gap-1">
                    <Icon class="h-3 w-3" name="Users" />
                    {{ group.memberCount || 0 }} 个成员
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <Icon class="h-3 w-3" name="Calendar" />
                    {{ formatDate(group.createdAt) }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    title="编辑"
                    @click="editGroup(group)"
                  >
                    <Icon class="h-4 w-4" name="Edit" />
                  </button>
                  <button
                    class="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    :disabled="group.memberCount > 0"
                    title="删除"
                    @click="deleteGroup(group)"
                  >
                    <Icon class="h-4 w-4" name="Trash2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>

  <!-- 编辑分组模态框 -->
  <BaseModal
    v-if="showEditForm"
    icon="Edit"
    icon-bg-class="bg-blue-100 dark:bg-blue-900/30"
    icon-color-class="text-blue-600 dark:text-blue-400"
    :show="showEditForm"
    size="md"
    title="编辑分组"
    @close="cancelEdit"
  >
    <template #default>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            分组名称 *
          </label>
          <input
            v-model="editForm.name"
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
            placeholder="输入分组名称"
            type="text"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            平台类型
          </label>
          <div
            class="mt-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <span class="font-medium text-gray-900 dark:text-white">
              {{
                editForm.platform === 'claude'
                  ? 'Claude'
                  : editForm.platform === 'gemini'
                    ? 'Gemini'
                    : 'OpenAI'
              }}
            </span>
            <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">(不可修改)</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            描述 (可选)
          </label>
          <textarea
            v-model="editForm.description"
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
            placeholder="分组描述..."
            rows="2"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="cancelEdit"
      >
        取消
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        :disabled="!editForm.name || updating"
        @click="updateGroup"
      >
        <div
          v-if="updating"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        {{ updating ? '更新中...' : '更新' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'
import BaseModal from '@/components/common/BaseModal.vue'
import Icon from '@/components/common/Icon.vue'

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
