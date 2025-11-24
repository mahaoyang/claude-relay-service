<template>
  <div class="space-y-4">
    <!-- AWS Access Key ID -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        AWS 访问密钥 ID *
      </label>
      <input
        v-model="localForm.accessKeyId"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="请输入 AWS Access Key ID"
        required
        type="text"
      />
      <p v-if="errors.accessKeyId" class="mt-1 text-sm text-red-500">
        {{ errors.accessKeyId }}
      </p>
    </div>

    <!-- AWS Secret Access Key -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        AWS 秘密访问密钥 *
      </label>
      <input
        v-model="localForm.secretAccessKey"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="请输入 AWS Secret Access Key"
        required
        type="password"
      />
      <p v-if="errors.secretAccessKey" class="mt-1 text-sm text-red-500">
        {{ errors.secretAccessKey }}
      </p>
    </div>

    <!-- AWS Region -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        AWS 区域 *
      </label>
      <input
        v-model="localForm.region"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="例如：us-east-1"
        required
        type="text"
      />
      <p v-if="errors.region" class="mt-1 text-sm text-red-500">
        {{ errors.region }}
      </p>
      <div
        class="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
      >
        <div class="text-sm text-amber-700 dark:text-amber-300">
          <p class="font-medium">常用 AWS 区域参考：</p>
          <div class="mt-1 grid grid-cols-2 gap-1">
            <span>us-east-1 (美国东部)</span>
            <span>us-west-2 (美国西部)</span>
            <span>eu-west-1 (欧洲爱尔兰)</span>
            <span>ap-southeast-1 (新加坡)</span>
            <span>ap-northeast-1 (东京)</span>
            <span>eu-central-1 (法兰克福)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Token -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        会话令牌 (可选)
      </label>
      <input
        v-model="localForm.sessionToken"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="如果使用临时凭证，请输入会话令牌"
        type="password"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">仅在使用临时 AWS 凭证时需要填写</p>
    </div>

    <!-- Default Model -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        默认主模型 (可选)
      </label>
      <input
        v-model="localForm.defaultModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="例如：us.anthropic.claude-sonnet-4-20250514-v1:0"
        type="text"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        留空将使用系统默认模型。支持 inference profile ID 或 ARN
      </p>
      <div
        class="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <p class="font-medium">Bedrock 模型配置说明：</p>
          <ul class="ml-4 mt-1 list-disc space-y-1">
            <li>支持 Inference Profile ID（推荐）</li>
            <li>支持 Application Inference Profile ARN</li>
            <li>常用模型：us.anthropic.claude-sonnet-4-20250514-v1:0</li>
            <li>留空将使用系统配置的默认模型</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Small Fast Model -->
    <div class="mb-4">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        小快速模型 (可选)
      </label>
      <input
        v-model="localForm.smallFastModel"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        placeholder="例如：us.anthropic.claude-3-5-haiku-20241022-v1:0"
        type="text"
      />
      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        用于快速响应的轻量级模型，留空将使用系统默认
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
