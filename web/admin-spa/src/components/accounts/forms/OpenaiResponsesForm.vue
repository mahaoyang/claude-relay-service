<template>
  <div class="space-y-4">
    <!-- Base API -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API 基础地址 *
      </label>
      <input
        v-model="localForm.baseApi"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="https://api.example.com/v1"
        required
        type="url"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        第三方 OpenAI 兼容 API 的基础地址，不要包含具体路径
      </p>
    </div>

    <!-- API Key -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API 密钥 *
      </label>
      <div class="flex items-center gap-2">
        <input
          v-model="localForm.apiKey"
          class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          :placeholder="isEdit ? '留空表示不更新' : 'sk-xxxxxxxxxxxx'"
          :required="!isEdit"
          :type="showApiKey ? 'text' : 'password'"
        />
        <button
          class="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
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
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ isEdit ? '留空表示不更新 API Key' : '第三方服务提供的 API 密钥' }}
      </p>
    </div>

    <!-- Custom User-Agent -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        自定义 User-Agent (可选)
      </label>
      <input
        v-model="localForm.userAgent"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="留空则透传原始请求的 User-Agent"
        type="text"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        可选项。如果设置，所有请求将使用此 User-Agent；否则透传客户端的 User-Agent
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const showApiKey = ref(false)

const localForm = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
