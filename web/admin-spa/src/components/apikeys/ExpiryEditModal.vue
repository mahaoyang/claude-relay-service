<template>
  <BaseModal
    :show="show"
    icon="CalendarClock"
    icon-bg-class="bg-primary-100 dark:bg-primary-900/30"
    icon-color-class="text-primary-700 dark:text-primary-300"
    size="lg"
    title="修改有效期"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div
        class="rounded-xl border border-primary-100 bg-primary-50/70 p-4 shadow-sm dark:border-primary-800 dark:bg-primary-900/20"
      >
        <div class="flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm dark:bg-primary-800/60 dark:text-primary-200"
              >
                <Icon class="h-5 w-5" name="AlarmClock" />
              </div>
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300"
                >
                  当前状态
                </p>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">
                  <template v-if="apiKey.expirationMode === 'activation' && !apiKey.isActivated">
                    未激活
                    <span class="ml-1 text-xs font-normal text-primary-700 dark:text-primary-300">
                      (激活后
                      {{ apiKey.activationDays || (apiKey.activationUnit === 'hours' ? 24 : 30) }}
                      {{ apiKey.activationUnit === 'hours' ? '小时' : '天' }}过期)
                    </span>
                  </template>
                  <template v-else-if="apiKey.expiresAt">
                    {{ formatExpireDate(apiKey.expiresAt) }}
                  </template>
                  <template v-else>
                    永不过期
                  </template>
                </p>
                <p class="text-xs text-primary-700/80 dark:text-primary-300/80">
                  选择快捷时间或自定义日期，保存后立即生效
                </p>
              </div>
            </div>
            <div
              v-if="currentStatus"
              class="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-primary-100 dark:bg-primary-950/60"
              :class="badgeClass(currentStatus, true)"
            >
              <span class="h-2 w-2 rounded-full" :class="dotClass(currentStatus)" />
              <span>{{ currentStatus.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="apiKey.expirationMode === 'activation' && !apiKey.isActivated"
        class="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20"
      >
        <div>
          <p class="text-sm font-semibold text-amber-800 dark:text-amber-300">当前为未激活状态</p>
          <p class="text-xs text-amber-700 dark:text-amber-200/90">
            激活后将在
            {{ apiKey.activationDays || (apiKey.activationUnit === 'hours' ? 24 : 30) }}
            {{ apiKey.activationUnit === 'hours' ? '小时' : '天' }}后自动过期，可在下方调整新的有效期
          </p>
        </div>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
          type="button"
          @click="handleActivateNow"
        >
          <Icon class="h-4 w-4" name="Zap" />
          立即激活
        </button>
      </div>

      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-3 flex items-center gap-2">
          <Icon class="h-4 w-4 text-primary-500" name="Sparkles" />
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">选择新的期限</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">使用快捷选项或自定义日期</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in quickOptions"
            :key="option.value"
            class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            :class="quickOptionClass(option.value)"
            type="button"
            @click="selectQuickOption(option.value)"
          >
            {{ option.label }}
          </button>
          <button
            class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            :class="quickOptionClass('custom')"
            type="button"
            @click="selectQuickOption('custom')"
          >
            自定义日期
          </button>
        </div>
      </div>

      <div
        v-if="localForm.expireDuration === 'custom'"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <label class="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300"
          >选择日期和时间</label
        >
        <input
          v-model="localForm.customExpireDate"
          :min="minDateTime"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          type="datetime-local"
          @change="updateCustomExpiryPreview"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">选择未来时间作为过期时间</p>
      </div>

      <div
        v-if="!isSameExpiry"
        class="rounded-lg border border-primary-200 bg-primary-50/70 p-4 shadow-sm dark:border-primary-800 dark:bg-primary-900/20"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm dark:bg-primary-800/60 dark:text-primary-200"
          >
            <Icon class="h-5 w-5" name="Flag" />
          </div>
          <div class="flex-1 space-y-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">新的过期时间</p>
            <p class="text-sm text-primary-800 dark:text-primary-100">
              <template v-if="localForm.expiresAt">
                {{ formatExpireDate(localForm.expiresAt) }}
                <span
                  v-if="newExpiryStatus"
                  class="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="badgeClass(newExpiryStatus)"
                >
                  <Icon class="h-3 w-3" name="Clock" />
                  {{ newExpiryStatus.text }}
                </span>
              </template>
              <template v-else> 永不过期 </template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        type="button"
        @click="$emit('close')"
      >
        取消
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-500 dark:hover:bg-primary-600"
        :disabled="saving || isSameExpiry"
        type="button"
        @click="handleSave"
      >
        <div
          v-if="saving"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
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
  apiKey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

const localForm = reactive({
  expireDuration: '',
  customExpireDate: '',
  expiresAt: null
})

const quickOptions = [
  { value: '', label: '永不过期' },
  { value: '1d', label: '1 天' },
  { value: '7d', label: '7 天' },
  { value: '30d', label: '30 天' },
  { value: '90d', label: '90 天' },
  { value: '180d', label: '180 天' },
  { value: '365d', label: '1 年' },
  { value: '730d', label: '2 年' }
]

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1)
  return now.toISOString().slice(0, 16)
})

const currentStatus = computed(() => getExpiryStatus(props.apiKey.expiresAt))
const newExpiryStatus = computed(() => getExpiryStatus(localForm.expiresAt))

const isSameExpiry = computed(() => {
  if (!props.apiKey.expiresAt && !localForm.expiresAt) return true
  return props.apiKey.expiresAt === localForm.expiresAt
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      initializeForm()
    }
  }
)

watch(
  () => props.apiKey?.id,
  (newId) => {
    if (newId && props.show) {
      initializeForm()
    }
  }
)

const initializeForm = () => {
  saving.value = false

  if (props.apiKey.expiresAt) {
    localForm.expireDuration = 'custom'
    localForm.customExpireDate = new Date(props.apiKey.expiresAt).toISOString().slice(0, 16)
    localForm.expiresAt = props.apiKey.expiresAt
  } else {
    localForm.expireDuration = ''
    localForm.customExpireDate = ''
    localForm.expiresAt = null
  }
}

const quickOptionClass = (value) => {
  const isActive = localForm.expireDuration === value
  return isActive
    ? 'border-primary-500 bg-primary-600 text-white shadow-sm dark:border-primary-400 dark:bg-primary-500'
    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-800 dark:hover:text-primary-200'
}

const badgeClass = (status, subtle = false) => {
  const variants = {
    danger: subtle
      ? 'text-red-700 dark:text-red-300'
      : 'border border-red-100 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/30 dark:text-red-300',
    warning: subtle
      ? 'text-amber-700 dark:text-amber-300'
      : 'border border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-300',
    caution: subtle
      ? 'text-orange-700 dark:text-orange-300'
      : 'border border-orange-100 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/30 dark:text-orange-300',
    ok: subtle
      ? 'text-primary-700 dark:text-primary-300'
      : 'border border-primary-100 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
  }

  return variants[status.variant] || variants.ok
}

const dotClass = (status) => {
  const dots = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    caution: 'bg-orange-500',
    ok: 'bg-primary-500'
  }
  return dots[status.variant] || dots.ok
}

const selectQuickOption = (value) => {
  localForm.expireDuration = value

  if (!value) {
    localForm.customExpireDate = ''
    localForm.expiresAt = null
    return
  }

  if (value === 'custom') {
    localForm.customExpireDate = ''
    localForm.expiresAt = null
    return
  }

  const now = new Date()
  const match = value.match(/(\d+)([dhmy])/)

  if (match) {
    const [, num, unit] = match
    const amount = parseInt(num, 10)

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

const updateCustomExpiryPreview = () => {
  if (localForm.customExpireDate) {
    localForm.expiresAt = new Date(localForm.customExpireDate).toISOString()
  }
}

const formatExpireDate = (dateString) => {
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

const getExpiryStatus = (expiresAt) => {
  if (!expiresAt) return null

  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffMs = expiryDate - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs < 0) {
    return {
      text: '已过期',
      variant: 'danger'
    }
  }
  if (diffDays <= 7) {
    return {
      text: `${diffDays} 天后过期`,
      variant: 'warning'
    }
  }
  if (diffDays <= 30) {
    return {
      text: `${diffDays} 天后过期`,
      variant: 'caution'
    }
  }
  return {
    text: `${Math.ceil(diffDays / 30)} 个月后过期`,
    variant: 'ok'
  }
}

const handleSave = () => {
  if (isSameExpiry.value) return
  saving.value = true
  emit('save', {
    keyId: props.apiKey.id,
    expiresAt: localForm.expiresAt
  })
}

const handleActivateNow = async () => {
  let confirmed = true
  if (window.showConfirm) {
    confirmed = await window.showConfirm(
      '激活 API Key',
      `确定要立即激活此 API Key 吗？激活后将在 ${props.apiKey.activationDays || (props.apiKey.activationUnit === 'hours' ? 24 : 30)} ${props.apiKey.activationUnit === 'hours' ? '小时' : '天'}后自动过期。`,
      '确定激活',
      '取消'
    )
  } else {
    confirmed = confirm(
      `确定要立即激活此 API Key 吗？激活后将在 ${props.apiKey.activationDays || (props.apiKey.activationUnit === 'hours' ? 24 : 30)} ${props.apiKey.activationUnit === 'hours' ? '小时' : '天'}后自动过期。`
    )
  }

  if (!confirmed) {
    return
  }

  saving.value = true
  emit('save', {
    keyId: props.apiKey.id,
    activateNow: true
  })
}

const resetSaving = () => {
  saving.value = false
}

defineExpose({
  resetSaving
})
</script>
