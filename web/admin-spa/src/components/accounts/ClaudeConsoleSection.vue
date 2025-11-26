<template>
  <div class="space-y-4">
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">API URL *</label>
      <input
        v-model="apiUrlModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="例如：https://api.example.com"
        required
        type="text"
      />
      <p v-if="errors.apiUrl" class="mt-1 text-sm text-red-500">
        {{ errors.apiUrl }}
      </p>
    </div>

    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">API Key *</label>
      <input
        v-model="apiKeyModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        :placeholder="isEdit ? '留空表示不更新' : '请输入API Key'"
        :required="!isEdit"
        type="password"
      />
      <p v-if="errors.apiKey" class="mt-1 text-sm text-red-500">
        {{ errors.apiKey }}
      </p>
      <p v-else-if="isEdit" class="mt-1 text-xs text-gray-500 dark:text-gray-400">留空表示不更新 API Key</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          每日额度限制 ($)
        </label>
        <input
          v-model="dailyQuotaModel"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          min="0"
          placeholder="0 表示不限制"
          step="0.01"
          type="number"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          设置每日使用额度，0 表示不限制
        </p>
      </div>

      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          额度重置时间
        </label>
        <input
          v-model="quotaResetTimeModel"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="00:00"
          type="time"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">每日自动重置额度的时间</p>
      </div>
    </div>

    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        最大并发任务数
      </label>
      <input
        v-model="maxConcurrentTasksModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        min="0"
        placeholder="0 表示不限制"
        type="number"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        限制该账户的并发请求数量，0 表示不限制
      </p>
    </div>

    <ModelRestrictionSection
      v-model:mode="modelRestrictionModeModel"
      v-model:allowedModels="allowedModelsModel"
      v-model:modelMappings="modelMappingsModel"
      :common-models="commonModels"
      :variant="isEdit ? 'edit' : 'create'"
      @add-mapping="$emit('add-mapping')"
      @remove-mapping="$emit('remove-mapping', $event)"
      @add-preset="handleAddPreset"
    />

    <div v-if="isEdit && dailyQuotaModel > 0">
      <div>
        <span> 今日使用情况 </span>
        <span> ${{ currentUsage.toFixed(4) }} / ${{ dailyQuotaModel.toFixed(2) }} </span>
      </div>
      <div>
        <div />
      </div>
      <div>
        <span> 剩余: ${{ Math.max(0, dailyQuotaModel - currentUsage).toFixed(2) }} </span>
        <span> {{ usagePercentage.toFixed(1) }}% 已使用 </span>
      </div>
    </div>

    <div v-if="isEdit" class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">限流机制</label>
      <div class="mb-4">
        <label
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="enableRateLimitModel"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            type="checkbox"
          />
          <span class="text-sm text-gray-900 dark:text-white">启用限流机制</span>
        </label>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          启用后，当账号返回429错误时将暂停调度一段时间
        </p>
      </div>

      <div v-if="enableRateLimitModel">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">限流时间 (分钟)</label>
        <input
          v-model="rateLimitDurationModel"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          min="1"
          placeholder="默认60分钟"
          type="number"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          账号被限流后暂停调度的时间（分钟）
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ModelRestrictionSection from './ModelRestrictionSection.vue'

const props = defineProps({
  apiUrl: {
    type: String,
    default: ''
  },
  apiKey: {
    type: String,
    default: ''
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  dailyQuota: {
    type: Number,
    default: 0
  },
  quotaResetTime: {
    type: String,
    default: '00:00'
  },
  maxConcurrentTasks: {
    type: Number,
    default: 0
  },
  enableRateLimit: {
    type: Boolean,
    default: false
  },
  rateLimitDuration: {
    type: Number,
    default: 60
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  usagePercentage: {
    type: Number,
    default: 0
  },
  modelRestrictionMode: {
    type: String,
    default: 'whitelist'
  },
  allowedModels: {
    type: Array,
    default: () => []
  },
  modelMappings: {
    type: Array,
    default: () => []
  },
  commonModels: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:apiUrl',
  'update:apiKey',
  'update:dailyQuota',
  'update:quotaResetTime',
  'update:maxConcurrentTasks',
  'update:enableRateLimit',
  'update:rateLimitDuration',
  'update:modelRestrictionMode',
  'update:allowedModels',
  'update:modelMappings',
  'add-mapping',
  'remove-mapping',
  'add-preset'
])

const apiUrlModel = computed({
  get: () => props.apiUrl,
  set: (val) => emit('update:apiUrl', val)
})

const apiKeyModel = computed({
  get: () => props.apiKey,
  set: (val) => emit('update:apiKey', val)
})

const dailyQuotaModel = computed({
  get: () => props.dailyQuota,
  set: (val) => emit('update:dailyQuota', Number(val) || 0)
})

const quotaResetTimeModel = computed({
  get: () => props.quotaResetTime,
  set: (val) => emit('update:quotaResetTime', val || '00:00')
})

const maxConcurrentTasksModel = computed({
  get: () => props.maxConcurrentTasks,
  set: (val) => emit('update:maxConcurrentTasks', Number(val) || 0)
})

const enableRateLimitModel = computed({
  get: () => props.enableRateLimit,
  set: (val) => emit('update:enableRateLimit', !!val)
})

const rateLimitDurationModel = computed({
  get: () => props.rateLimitDuration,
  set: (val) => emit('update:rateLimitDuration', Number(val) || 0)
})

const modelRestrictionModeModel = computed({
  get: () => props.modelRestrictionMode,
  set: (val) => emit('update:modelRestrictionMode', val)
})

const allowedModelsModel = computed({
  get: () => props.allowedModels,
  set: (val) => emit('update:allowedModels', val)
})

const modelMappingsModel = computed({
  get: () => props.modelMappings,
  set: (val) => emit('update:modelMappings', val)
})

const handleAddPreset = (from, to) => {
  emit('add-preset', from, to)
}
</script>
