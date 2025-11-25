<template>
  <div class="space-y-4">
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >选择平台</label
      >

      <!-- 平台分组选择器 -->
      <div class="space-y-4">
        <!-- 分组选择器 -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <!-- Claude 分组 -->
          <div
            class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary-300 dark:hover:border-primary-600"
            :class="
              platformGroup === 'claude'
                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            "
            @click="selectGroup('claude')"
          >
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                ></div>
                <div
                  v-if="platformGroup === 'claude'"
                  class="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-primary-500 dark:border-gray-800"
                ></div>
              </div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Claude</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">Anthropic</p>
            </div>
          </div>

          <!-- OpenAI 分组 -->
          <div
            class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary-300 dark:hover:border-primary-600"
            :class="
              platformGroup === 'openai'
                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            "
            @click="selectGroup('openai')"
          >
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                >
                  <svg
                    class="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4069-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                    />
                  </svg>
                </div>
                <div
                  v-if="platformGroup === 'openai'"
                  class="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-primary-500 dark:border-gray-800"
                ></div>
              </div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">OpenAI</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">GPT 系列</p>
            </div>
          </div>

          <!-- Gemini 分组 -->
          <div
            class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary-300 dark:hover:border-primary-600"
            :class="
              platformGroup === 'gemini'
                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            "
            @click="selectGroup('gemini')"
          >
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                ></div>
                <div
                  v-if="platformGroup === 'gemini'"
                  class="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-primary-500 dark:border-gray-800"
                ></div>
              </div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Gemini</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">Google AI</p>
            </div>
          </div>

          <!-- Droid 分组 -->
          <div
            class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary-300 dark:hover:border-primary-600"
            :class="
              platformGroup === 'droid'
                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            "
            @click="selectGroup('droid')"
          >
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white"
                ></div>
                <div
                  v-if="platformGroup === 'droid'"
                  class="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-primary-500 dark:border-gray-800"
                ></div>
              </div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Droid</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">Claude Droid</p>
            </div>
          </div>
        </div>

        <!-- 子平台选择器 -->
        <div v-if="platformGroup" class="mt-4">
          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">选择具体平台类型：</p>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <!-- Claude 子选项 -->
            <template v-if="platformGroup === 'claude'">
              <PlatformOption
                v-model="selectedPlatform"
                badge="官方"
                badge-color="orange"
                label="Claude Code"
                value="claude"
              />
              <PlatformOption
                v-model="selectedPlatform"
                badge="标准API"
                badge-color="blue"
                label="Claude Console"
                value="claude-console"
              />
              <PlatformOption
                v-model="selectedPlatform"
                badge="AWS"
                badge-color="amber"
                label="Bedrock"
                value="bedrock"
              />
              <PlatformOption
                v-model="selectedPlatform"
                badge="Router"
                badge-color="purple"
                label="CCR"
                value="ccr"
              />
            </template>

            <!-- OpenAI 子选项 -->
            <template v-if="platformGroup === 'openai'">
              <PlatformOption
                v-model="selectedPlatform"
                badge="官方"
                badge-color="emerald"
                label="Codex Cli"
                value="openai"
              />
              <PlatformOption
                v-model="selectedPlatform"
                badge="API"
                badge-color="teal"
                label="Responses"
                value="openai-responses"
              />
              <PlatformOption
                v-model="selectedPlatform"
                badge="Azure"
                badge-color="sky"
                label="Azure"
                value="azure_openai"
              />
            </template>

            <!-- Gemini 子选项 -->
            <template v-if="platformGroup === 'gemini'">
              <PlatformOption
                v-model="selectedPlatform"
                badge="官方"
                badge-color="blue"
                label="Gemini Cli"
                value="gemini"
              />
            </template>

            <!-- Droid 子选项 -->
            <template v-if="platformGroup === 'droid'">
              <PlatformOption
                v-model="selectedPlatform"
                badge="Droid"
                badge-color="purple"
                label="Droid 专属"
                value="droid"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import PlatformOption from './PlatformOption.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 平台分组状态
const platformGroup = ref('')

// 当前选中的平台
const selectedPlatform = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * 根据平台值确定所属分组
 */
const determinePlatformGroup = (platform) => {
  const groupMap = {
    claude: 'claude',
    'claude-console': 'claude',
    bedrock: 'claude',
    ccr: 'claude',
    openai: 'openai',
    'openai-responses': 'openai',
    azure_openai: 'openai',
    gemini: 'gemini',
    droid: 'droid'
  }
  return groupMap[platform] || ''
}

/**
 * 选择平台分组
 */
const selectGroup = (group) => {
  platformGroup.value = group

  // 根据分组自动选择默认平台
  const defaultPlatforms = {
    claude: 'claude',
    openai: 'openai',
    gemini: 'gemini',
    droid: 'droid'
  }

  if (defaultPlatforms[group]) {
    selectedPlatform.value = defaultPlatforms[group]
  }
}

// 监听外部platform变化，自动更新分组
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      platformGroup.value = determinePlatformGroup(newValue)
    }
  },
  { immediate: true }
)
</script>
