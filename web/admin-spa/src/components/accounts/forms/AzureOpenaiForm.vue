<template>
  <div class="space-y-4">
    <!-- Azure Endpoint -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Azure Endpoint *
      </label>
      <input
        v-model="localForm.azureEndpoint"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="https://your-resource.openai.azure.com"
        required
        type="url"
      />
      <p v-if="errors.azureEndpoint" class="mt-1 text-sm text-red-500">
        {{ errors.azureEndpoint }}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Azure OpenAI 资源的终结点 URL，格式：https://your-resource.openai.azure.com
      </p>
    </div>

    <!-- API Version -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        API 版本
      </label>
      <input
        v-model="localForm.apiVersion"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="2024-02-01"
        type="text"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Azure OpenAI API 版本，默认使用最新稳定版本 2024-02-01
      </p>
    </div>

    <!-- Deployment Name -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        部署名称 *
      </label>
      <input
        v-model="localForm.deploymentName"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="gpt-4"
        required
        type="text"
      />
      <p v-if="errors.deploymentName" class="mt-1 text-sm text-red-500">
        {{ errors.deploymentName }}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        在 Azure OpenAI Studio 中创建的部署名称
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
        :placeholder="isEdit ? '留空表示��更新' : '请输入 Azure OpenAI API Key'"
        :required="!isEdit"
        type="password"
      />
      <p v-if="errors.apiKey" class="mt-1 text-sm text-red-500">
        {{ errors.apiKey }}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ isEdit ? '留空表示不更新 API Key' : '从 Azure 门户获取的 API 密钥' }}
      </p>
    </div>

    <!-- Supported Models -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        支持的模型
      </label>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="model in availableModels"
          :key="model"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="localForm.supportedModels"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            type="checkbox"
            :value="model"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ model }}</span>
        </label>
      </div>
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">选择此部署支持的模型类型</p>
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

const availableModels = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-5',
  'gpt-5-mini',
  'gpt-35-turbo',
  'gpt-35-turbo-16k',
  'codex-mini'
]
</script>
