<template>
  <div class="space-y-4">
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        订阅类型
      </label>
      <div class="flex flex-wrap gap-3">
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="subscriptionTypeModel"
            class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            type="radio"
            value="claude_max"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">Claude Max</span>
        </label>
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="subscriptionTypeModel"
            class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            type="radio"
            value="claude_pro"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">Claude Pro</span>
        </label>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Pro 账号不支持 Claude Opus 4 模型</p>
    </div>

    <label
      class="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <input
        v-model="autoStopOnWarningModel"
        class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        type="checkbox"
      />
      <div class="flex-1">
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          5小时使用量接近限制时自动停止调度
        </span>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          当系统检测到账户接近5小时使用限制时，自动暂停调度该账户。进入新的时间窗口后会自动恢复调度。
        </p>
      </div>
    </label>

    <label
      class="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <input
        v-model="useUnifiedUserAgentModel"
        class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        type="checkbox"
      />
      <div class="flex-1">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          使用统一 Claude Code 版本
        </span>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          开启后将使用从真实 Claude Code 客户端捕获的统一 User-Agent，提高兼容性
        </p>
        <div
          v-if="unifiedUserAgent"
          class="mt-2 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs text-green-700 dark:text-green-300">
              💡 当前统一版本：{{ unifiedUserAgent }}
            </p>
            <button
              class="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/50 dark:text-green-400"
              :disabled="clearingCache"
              type="button"
              @click="$emit('clear-unified-cache')"
            >
              <span v-if="clearingCache" class="flex items-center gap-1">
                <svg class="h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  />
                </svg>
                清除中...
              </span>
              <span v-else>清除缓存</span>
            </button>
          </div>
        </div>
        <div
          v-else
          class="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-900/20"
        >
          <p class="text-xs text-amber-700 dark:text-amber-300">⏳ 等待从 Claude Code 客户端捕获 User-Agent</p>
          <p class="mt-1 text-xs text-amber-600 dark:text-amber-400">
            💡 提示：如果长时间未能捕获，请确认有 Claude Code 客户端正在使用此账户，
            或联系开发者检查 User-Agent 格式是否发生变化
          </p>
        </div>
      </div>
    </label>

    <label
      class="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <input
        v-model="useUnifiedClientIdModel"
        class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        type="checkbox"
        @change="$emit('unified-client-id-change')"
      />
      <div class="flex-1">
        <span> 使用统一的客户端标识 </span>
        <p>开启后将使用固定的客户端标识，使所有请求看起来来自同一个客户端，减少特征</p>
        <div v-if="useUnifiedClientIdModel">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">客户端标识 ID</span>
            <button
              class="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              type="button"
              @click="$emit('regenerate-client-id')"
            >
              重新生成
            </button>
          </div>
          <div class="mt-2 overflow-x-auto rounded-lg bg-white p-3 font-mono text-xs dark:bg-gray-900">
            <code class="break-all text-gray-900 dark:text-gray-100">
              <span class="text-primary-600 dark:text-primary-400">{{ unifiedClientIdModel.substring(0, 8) }}</span
              ><span class="text-gray-500 dark:text-gray-400">{{ unifiedClientIdModel.substring(8, 56) }}</span
              ><span class="text-primary-600 dark:text-primary-400">{{ unifiedClientIdModel.substring(56) }}</span>
            </code>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            此ID将替换请求中的user_id客户端部分，保留session部分用于粘性会话
          </p>
        </div>
      </div>
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  subscriptionType: {
    type: String,
    default: 'claude_max'
  },
  autoStopOnWarning: {
    type: Boolean,
    default: false
  },
  useUnifiedUserAgent: {
    type: Boolean,
    default: false
  },
  useUnifiedClientId: {
    type: Boolean,
    default: false
  },
  unifiedClientId: {
    type: String,
    default: ''
  },
  unifiedUserAgent: {
    type: String,
    default: ''
  },
  clearingCache: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:subscriptionType',
  'update:autoStopOnWarning',
  'update:useUnifiedUserAgent',
  'update:useUnifiedClientId',
  'update:unifiedClientId',
  'clear-unified-cache',
  'regenerate-client-id',
  'unified-client-id-change'
])

const subscriptionTypeModel = computed({
  get: () => props.subscriptionType,
  set: (val) => emit('update:subscriptionType', val)
})

const autoStopOnWarningModel = computed({
  get: () => props.autoStopOnWarning,
  set: (val) => emit('update:autoStopOnWarning', !!val)
})

const useUnifiedUserAgentModel = computed({
  get: () => props.useUnifiedUserAgent,
  set: (val) => emit('update:useUnifiedUserAgent', !!val)
})

const useUnifiedClientIdModel = computed({
  get: () => props.useUnifiedClientId,
  set: (val) => emit('update:useUnifiedClientId', !!val)
})

const unifiedClientIdModel = computed({
  get: () => props.unifiedClientId,
  set: (val) => emit('update:unifiedClientId', val || '')
})
</script>
