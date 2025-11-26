<template>
  <div :class="isEdit ? 'space-y-4' : 'space-y-4'">
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API 基础地址{{ isEdit ? '' : ' *' }}
      </label>
      <input
        v-model="baseApiModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="https://api.example.com/v1"
        :required="!isEdit"
        type="url"
      />
      <p v-if="errors.baseApi" class="mt-1 text-sm text-red-500">{{ errors.baseApi }}</p>
      <p v-else-if="!isEdit" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        第三方 OpenAI 兼容 API 的基础地址，不要包含具体路径
      </p>
    </div>

    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API 密钥{{ isEdit ? '' : ' *' }}
      </label>
      <div class="flex items-center gap-2">
        <input
          v-model="apiKeyModel"
          class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          :placeholder="isEdit ? '留空表示不更新' : 'sk-xxxxxxxxxxxx'"
          :required="!isEdit"
          :type="showApiKey ? 'text' : 'password'"
        />
        <button
          class="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          type="button"
          @click="showApiKey = !showApiKey"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="showApiKey"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
            <path
              v-else
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
      <p v-if="errors.apiKey" class="mt-1 text-sm text-red-500">{{ errors.apiKey }}</p>
      <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ isEdit ? '留空表示不更新 API Key' : '第三方服务提供的 API 密钥' }}
      </p>
    </div>

    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        自定义 User-Agent{{ isEdit ? '' : ' (可选)' }}
      </label>
      <input
        v-model="userAgentModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        :placeholder="isEdit ? '留空则透传客户端 User-Agent' : '留空则透传原始请求的 User-Agent'"
        type="text"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        留空时将自动使用客户端的 User-Agent，仅在需要固定特定 UA 时填写
      </p>
    </div>

    <input v-if="isEdit" v-model.number="rateLimitDurationModel" type="hidden" />

    <div v-if="isEdit" class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            每日额度限制 ($)
          </label>
          <input
            v-model.number="dailyQuotaModel"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            min="0"
            placeholder="0 表示不限制"
            step="0.01"
            type="number"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            额度重置时间
          </label>
          <input
            v-model="quotaResetTimeModel"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            type="time"
          />
        </div>
      </div>
    </div>

    <div v-if="isEdit" class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        最大并发任务数
      </label>
      <input
        v-model.number="maxConcurrentTasksModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        min="0"
        placeholder="0 表示不限制"
        type="number"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        限制该账户的并发请求数量，0 表示不限制
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  baseApi: {
    type: String,
    default: ''
  },
  apiKey: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  rateLimitDuration: {
    type: Number,
    default: 60
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
  errors: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:baseApi',
  'update:apiKey',
  'update:userAgent',
  'update:rateLimitDuration',
  'update:dailyQuota',
  'update:quotaResetTime',
  'update:maxConcurrentTasks'
])

const showApiKey = ref(false)

const baseApiModel = computed({
  get: () => props.baseApi,
  set: (val) => emit('update:baseApi', val)
})

const apiKeyModel = computed({
  get: () => props.apiKey,
  set: (val) => emit('update:apiKey', val)
})

const userAgentModel = computed({
  get: () => props.userAgent,
  set: (val) => emit('update:userAgent', val)
})

const rateLimitDurationModel = computed({
  get: () => props.rateLimitDuration,
  set: (val) => emit('update:rateLimitDuration', Number(val) || 0)
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
</script>
