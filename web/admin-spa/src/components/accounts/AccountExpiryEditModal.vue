<template>
  <BaseModal
    icon="Calendar"
    icon-bg-class="bg-amber-100 dark:bg-amber-900/30"
    icon-color-class="text-amber-600 dark:text-amber-400"
    :show="show"
    size="md"
    title="修改到期时间"
    @close="$emit('close')"
  >
    <template #default>
      <div class="space-y-6">
        <!-- 副标题 -->
        <p class="text-sm text-gray-600 dark:text-gray-400">
          为 "{{ account.name || 'Account' }}" 设置新的到期时间
        </p>

        <!-- 当前状态显示 -->
        <div
          class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">当前状态</p>
              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                <!-- 已设置过期时间 -->
                <template v-if="account.expiresAt">
                  {{ formatFullExpireDate(account.expiresAt) }}
                  <span
                    v-if="getExpiryStatus(account.expiresAt)"
                    class="ml-2 text-xs font-normal"
                    :class="getExpiryStatus(account.expiresAt).class"
                  >
                    ({{ getExpiryStatus(account.expiresAt).text }})
                  </span>
                </template>
                <!-- 永不过期 -->
                <template v-else>
                  <span class="text-green-600 dark:text-green-400">永不过期</span>
                </template>
              </p>
            </div>
            <div class="ml-4">
              <Icon
                class="h-8 w-8 text-gray-400 dark:text-gray-500"
                :name="account.expiresAt ? 'CalendarClock' : 'Infinity'"
              />
            </div>
          </div>
        </div>

        <!-- 快捷选项 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            选择新的期限
          </label>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="option in quickOptions"
              :key="option.value"
              class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              :class="
                localForm.expireDuration === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              "
              @click="selectQuickOption(option.value)"
            >
              {{ option.label }}
            </button>
            <button
              class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              :class="
                localForm.expireDuration === 'custom'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              "
              @click="selectQuickOption('custom')"
            >
              自定义
            </button>
          </div>
        </div>

        <!-- 自定义日期选择 -->
        <div v-if="localForm.expireDuration === 'custom'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            选择日期和时间
          </label>
          <input
            v-model="localForm.customExpireDate"
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
            :min="minDateTime"
            type="datetime-local"
            @change="updateCustomExpiryPreview"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            选择一个未来的日期和时间作为到期时间
          </p>
        </div>

        <!-- 预览新的过期时间 -->
        <div
          v-if="localForm.expiresAt !== account.expiresAt"
          class="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-xs font-medium text-primary-700 dark:text-primary-300">新的到期时间</p>
              <p class="mt-1 text-sm font-semibold text-primary-900 dark:text-primary-100">
                <template v-if="localForm.expiresAt">
                  {{ formatFullExpireDate(localForm.expiresAt) }}
                  <span
                    v-if="getExpiryStatus(localForm.expiresAt)"
                    class="ml-2 text-xs font-normal"
                    :class="getExpiryStatus(localForm.expiresAt).class"
                  >
                    ({{ getExpiryStatus(localForm.expiresAt).text }})
                  </span>
                </template>
                <template v-else>
                  <span class="text-green-600 dark:text-green-400">永不过期</span>
                </template>
              </p>
            </div>
            <div class="ml-4">
              <Icon
                class="h-8 w-8 text-primary-500 dark:text-primary-400"
                :name="localForm.expiresAt ? 'CalendarCheck' : 'Infinity'"
              />
            </div>
          </div>
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
        :disabled="saving || localForm.expiresAt === account.expiresAt"
        @click="handleSave"
      >
        <div
          v-if="saving"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        {{ saving ? '保存中...' : '保存更改' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import Icon from '@/components/common/Icon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  account: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

// 表单数据
const localForm = reactive({
  expireDuration: '',
  customExpireDate: '',
  expiresAt: null
})

// 快捷选项
const quickOptions = [
  { value: '', label: '永不过期' },
  { value: '30d', label: '30 天' },
  { value: '90d', label: '90 天' },
  { value: '180d', label: '180 天' },
  { value: '365d', label: '1 年' },
  { value: '730d', label: '2 年' }
]

// 计算最小日期时间
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1)
  return now.toISOString().slice(0, 16)
})

// 监听显示状态，初始化表单
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      initializeForm()
    }
  }
)

// 监听 account 变化，重新初始化
watch(
  () => props.account?.id,
  (newId) => {
    if (newId && props.show) {
      initializeForm()
    }
  }
)

// 初始化表单
const initializeForm = () => {
  saving.value = false

  if (props.account.expiresAt) {
    localForm.expireDuration = 'custom'
    localForm.customExpireDate = new Date(props.account.expiresAt).toISOString().slice(0, 16)
    localForm.expiresAt = props.account.expiresAt
  } else {
    localForm.expireDuration = ''
    localForm.customExpireDate = ''
    localForm.expiresAt = null
  }
}

// 选择快捷选项
const selectQuickOption = (value) => {
  localForm.expireDuration = value

  if (!value) {
    localForm.expiresAt = null
    return
  }

  if (value === 'custom') {
    return
  }

  const now = new Date()
  const match = value.match(/(\d+)([dhmy])/)

  if (match) {
    const [, num, unit] = match
    const amount = parseInt(num)

    switch (unit) {
      case 'd':
        now.setDate(now.getDate() + amount)
        break
      case 'h':
        now.setHours(now.getHours() + amount)
        break
      case 'm':
        now.setMonth(now.getMonth() + amount)
        break
      case 'y':
        now.setFullYear(now.getFullYear() + amount)
        break
    }

    localForm.expiresAt = now.toISOString()
  }
}

// 更新自定义过期时间
const updateCustomExpiryPreview = () => {
  if (localForm.customExpireDate) {
    try {
      // 手动解析日期时间字符串，确保它被正确解释为本地时间
      const [datePart, timePart] = localForm.customExpireDate.split('T')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hours, minutes] = timePart.split(':').map(Number)

      // 使用构造函数创建本地时间的 Date 对象，然后转换为 UTC ISO 字符串
      const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

      // 验证日期有效性
      if (isNaN(localDate.getTime())) {
        console.error('Invalid date:', localForm.customExpireDate)
        return
      }

      localForm.expiresAt = localDate.toISOString()
    } catch (error) {
      console.error('Failed to parse custom expire date:', error)
    }
  }
}

// 格式化完整过期日期（包含时分）
const formatFullExpireDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取过期状态
const getExpiryStatus = (expiresAt) => {
  if (!expiresAt) return null

  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffMs = expiryDate - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) {
    return {
      text: '已过期',
      class: 'text-red-600 dark:text-red-400'
    }
  } else if (diffDays <= 7) {
    return {
      text: `${diffDays} 天后过期`,
      class: 'text-red-600 dark:text-red-400'
    }
  } else if (diffDays <= 30) {
    return {
      text: `${diffDays} 天后过期`,
      class: 'text-amber-600 dark:text-amber-400'
    }
  } else {
    return {
      text: `${Math.ceil(diffDays / 30)} 个月后过期`,
      class: 'text-gray-600 dark:text-gray-400'
    }
  }
}

// 保存
const handleSave = () => {
  saving.value = true
  emit('save', {
    accountId: props.account.id,
    expiresAt: localForm.expiresAt
  })
}

// 重置保存状态
const resetSaving = () => {
  saving.value = false
}

// 暴露方法给父组件
defineExpose({
  resetSaving
})
</script>
