<template>
  <div class="space-y-4">
    <!-- 账户名称 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >账户名称</label
      >
      <input
        v-model="formData.name"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="为账户设置一个易识别的名称"
        required
        type="text"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-500">
        {{ errors.name }}
      </p>
    </div>

    <!-- 描述 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >描述 (可选)</label
      >
      <textarea
        v-model="formData.description"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="账户用途说明..."
        rows="3"
      />
    </div>

    <!-- 账户类型 -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >账户类型</label
      >
      <div class="flex flex-wrap gap-3">
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="formData.accountType"
            class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            type="radio"
            value="shared"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">共享账户</span>
        </label>
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="formData.accountType"
            class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            type="radio"
            value="dedicated"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">专属账户</span>
        </label>
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="formData.accountType"
            class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            type="radio"
            value="group"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">分组调度</span>
        </label>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        共享账户：供所有API Key使用；专属账户：仅供特定API Key使用；分组调度：加入分组供分组内调度
      </p>
    </div>

    <!-- 到期时间 - 仅在创建账户时显示 -->
    <div v-if="!isEdit">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >到期时间 (可选)</label
      >
      <div class="space-y-2">
        <select
          v-model="expireDuration"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @change="handleExpireDurationChange"
        >
          <option value="">永不过期</option>
          <option value="30d">30 天</option>
          <option value="90d">90 天</option>
          <option value="180d">180 天</option>
          <option value="365d">365 天</option>
          <option value="custom">自定义日期</option>
        </select>
        <div v-if="expireDuration === 'custom'">
          <input
            v-model="customExpireDate"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :min="minDateTime"
            type="datetime-local"
            @change="handleCustomExpireDateChange"
          />
        </div>
        <p v-if="formData.expiresAt" class="text-sm text-primary-600 dark:text-primary-400">
          将于 {{ formatExpireDate(formData.expiresAt) }} 过期
        </p>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">账户永不过期</p>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        设置 Claude Max/Pro 订阅的到期时间，到期后将停止调度此账户
      </p>
    </div>

    <!-- 分组选择器 -->
    <div v-if="formData.accountType === 'group'">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >选择分组 *</label
      >
      <div class="flex items-start gap-2">
        <div
          class="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <!-- 多选分组界面 -->
          <div class="space-y-2">
            <div
              v-if="groups.length === 0"
              class="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              暂无可用分组
            </div>
            <label
              v-for="group in groups"
              :key="group.id"
              class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <input
                v-model="formData.groupIds"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                type="checkbox"
                :value="group.id"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ group.name }} ({{ group.memberCount || 0 }} 个成员)
              </span>
            </label>
            <!-- 新建分组选项 -->
            <div class="border-t border-gray-200 pt-2 dark:border-gray-700">
              <button
                class="w-full rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                type="button"
                @click="$emit('new-group')"
              >
                + 新建分组
              </button>
            </div>
          </div>
        </div>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        选择该账户要加入的分组，可以选择多个分组
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  groups: {
    type: Array,
    default: () => []
  },
  errors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'new-group'])

// 表单数据
const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 到期时间相关
const expireDuration = ref('')
const customExpireDate = ref('')

// 最小日期时间（当前时间）
const minDateTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

/**
 * 格式化过期日期显示
 */
const formatExpireDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateStr
  }
}

/**
 * 处理到期时长变化
 */
const handleExpireDurationChange = () => {
  if (!expireDuration.value || expireDuration.value === 'custom') {
    if (expireDuration.value !== 'custom') {
      formData.value.expiresAt = null
    }
    return
  }

  const now = new Date()
  const days = parseInt(expireDuration.value)

  if (!isNaN(days)) {
    const expireDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    formData.value.expiresAt = expireDate.toISOString()
  }
}

/**
 * 处理自定义过期日期变化
 */
const handleCustomExpireDateChange = () => {
  if (customExpireDate.value) {
    const date = new Date(customExpireDate.value)
    formData.value.expiresAt = date.toISOString()
  } else {
    formData.value.expiresAt = null
  }
}

// 监听accountType变化，清空groupIds
watch(
  () => formData.value.accountType,
  (newType) => {
    if (newType !== 'group') {
      formData.value.groupIds = []
      formData.value.groupId = ''
    }
  }
)
</script>
