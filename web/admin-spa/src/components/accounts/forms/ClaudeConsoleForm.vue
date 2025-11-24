<template>
  <div class="space-y-4">
    <!-- API URL -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API URL *
      </label>
      <input
        v-model="localForm.apiUrl"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="例如：https://api.example.com"
        required
        type="text"
      />
      <p v-if="errors.apiUrl" class="mt-1 text-sm text-red-500">
        {{ errors.apiUrl }}
      </p>
    </div>

    <!-- API Key -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API Key *
      </label>
      <input
        v-model="localForm.apiKey"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        :placeholder="isEdit ? '留空表示不更新' : '请输入API Key'"
        :required="!isEdit"
        type="password"
      />
      <p v-if="errors.apiKey" class="mt-1 text-sm text-red-500">
        {{ errors.apiKey }}
      </p>
      <p v-if="isEdit" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        留空表示不更新 API Key
      </p>
    </div>

    <!-- Daily Quota and Reset Time -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          每日额度限制 ($)
        </label>
        <input
          v-model.number="localForm.dailyQuota"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          min="0"
          placeholder="0 表示不限制"
          step="0.01"
          type="number"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">设置每日使用额度，0 表示不限制</p>
      </div>

      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          额度重置时间
        </label>
        <input
          v-model="localForm.quotaResetTime"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="00:00"
          type="time"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">每日自动重置额度的时间</p>
      </div>
    </div>

    <!-- Max Concurrent Tasks -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        最大并发任务数
      </label>
      <input
        v-model.number="localForm.maxConcurrentTasks"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        min="0"
        placeholder="0 表示不限制"
        type="number"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        限制该账户的并发请求数量，0 表示不限制
      </p>
    </div>

    <!-- Model Restriction Config -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        模型限制 (可选)
      </label>
      <slot name="model-restriction"></slot>
    </div>

    <!-- Custom User-Agent -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        自定义 User-Agent (可选)
      </label>
      <input
        v-model="localForm.userAgent"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="留空则透传客户端 User-Agent"
        type="text"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        留空时将自动使用客户端的 User-Agent，仅在需要固定特定 UA 时填写
      </p>
    </div>

    <!-- Rate Limit -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        限流机制
      </label>
      <div class="space-y-2">
        <label
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="localForm.enableRateLimit"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            type="checkbox"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">启用限流机制</span>
        </label>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          启用后，当账号返回429错误时将暂停调度一段时间
        </p>
      </div>

      <div v-if="localForm.enableRateLimit" class="mt-3">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          限流时间 (分钟)
        </label>
        <input
          v-model.number="localForm.rateLimitDuration"
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

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
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

const emit = defineEmits(['update:modelValue'])

const localForm = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
