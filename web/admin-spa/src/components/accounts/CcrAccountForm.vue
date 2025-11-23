<template>
  <BaseModal
    icon="Settings"
    :show="show"
    size="lg"
    :title="isEdit ? '编辑 CCR 账户' : '添加 CCR 账户'"
    @close="$emit('close')"
  >
    <template #default>
      <div class="space-y-6">
        <!-- 基本信息 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              账户名称 *
            </label>
            <input
              v-model="form.name"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              placeholder="为账户设置一个易识别的名称"
              required
              type="text"
            />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              描述 (可选)
            </label>
            <textarea
              v-model="form.description"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              placeholder="账户用途说明..."
              rows="3"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API URL *
            </label>
            <input
              v-model="form.apiUrl"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              placeholder="例如：https://api.example.com/v1/messages"
              required
              type="text"
            />
            <p v-if="errors.apiUrl" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ errors.apiUrl }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              API Key {{ isEdit ? '(留空不更新)' : '*' }}
            </label>
            <input
              v-model="form.apiKey"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              :placeholder="isEdit ? '留空表示不更新' : '必填'"
              :required="!isEdit"
              type="password"
            />
            <p v-if="errors.apiKey" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ errors.apiKey }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              优先级
            </label>
            <input
              v-model.number="form.priority"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              max="100"
              min="1"
              placeholder="默认50，数字越小优先级越高"
              type="number"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              建议范围：1-100，数字越小优先级越高
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              自定义 User-Agent (可选)
            </label>
            <input
              v-model="form.userAgent"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              placeholder="留空则透传客户端 User-Agent"
              type="text"
            />
          </div>
        </div>

        <!-- 限流设置 -->
        <div
          class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            限流机制
          </label>
          <div class="flex items-center gap-2">
            <label class="inline-flex cursor-pointer items-center">
              <input
                v-model="enableRateLimit"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-primary-400"
                type="checkbox"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                启用限流机制（429 时暂停调度）
              </span>
            </label>
          </div>
          <div v-if="enableRateLimit" class="ml-6 space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              限流时间 (分钟)
            </label>
            <input
              v-model.number="form.rateLimitDuration"
              class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              min="1"
              placeholder="默认60分钟"
              type="number"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              账号被限流后暂停调度的时间（分钟）
            </p>
          </div>
        </div>

        <!-- 额度管理 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              每日额度限制 ($)
            </label>
            <input
              v-model.number="form.dailyQuota"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              min="0"
              placeholder="0 表示不限制"
              step="0.01"
              type="number"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              设置每日使用额度，0 表示不限制
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              额度重置时间
            </label>
            <input
              v-model="form.quotaResetTime"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              placeholder="00:00"
              type="time"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">每日自动重置额度的时间</p>
          </div>
        </div>

        <!-- 模型映射表（可选） -->
        <div
          class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            模型映射表 (可选)
          </label>
          <div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p class="text-xs text-blue-700 dark:text-blue-300">
              留空表示支持所有模型且不修改请求。配置映射后，左侧模型会被识别为支持的模型，右侧是实际发送的模型。
            </p>
          </div>
          <div class="space-y-2">
            <div
              v-for="(mapping, index) in modelMappings"
              :key="index"
              class="flex items-center gap-2"
            >
              <input
                v-model="mapping.from"
                class="block flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                placeholder="原始模型名称"
                type="text"
              />
              <span class="text-gray-500 dark:text-gray-400">→</span>
              <input
                v-model="mapping.to"
                class="block flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                placeholder="映射后的模型名称"
                type="text"
              />
              <button
                class="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                type="button"
                @click="removeModelMapping(index)"
              >
                <Icon class="h-4 w-4" name="Trash2" />
              </button>
            </div>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            type="button"
            @click="addModelMapping"
          >
            <Icon class="h-4 w-4" name="Plus" />
            添加模型映射
          </button>
        </div>

        <!-- 代理配置 -->
        <div>
          <ProxyConfig v-model="form.proxy" />
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        type="button"
        @click="$emit('close')"
      >
        取消
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        :disabled="loading"
        type="button"
        @click="submit"
      >
        <div
          v-if="loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        {{ loading ? (isEdit ? '保存中...' : '创建中...') : isEdit ? '保存' : '创建' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'
import BaseModal from '@/components/common/BaseModal.vue'
import Icon from '@/components/common/Icon.vue'
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
