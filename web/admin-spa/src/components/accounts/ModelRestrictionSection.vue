<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >模型限制 (可选)</label
    >

    <!-- 模式切换 -->
    <div :class="modeSwitchContainerClass">
      <button
        :class="toggleButtonClass(modeModel === 'whitelist')"
        type="button"
        @click="modeModel = 'whitelist'"
      >
        模型白名单
      </button>
      <button
        :class="toggleButtonClass(modeModel === 'mapping')"
        type="button"
        @click="modeModel = 'mapping'"
      >
        模型映射
      </button>
    </div>

    <!-- 白名单模式 -->
    <div v-if="modeModel === 'whitelist'" class="space-y-3">
      <div :class="infoBoxClass">
        <p :class="infoTextClass">选择允许使用此账户的模型。留空表示支持所有模型。</p>
      </div>

      <!-- 模型复选框列表 -->
      <div :class="whitelistGridClass">
        <label
          v-for="model in commonModels"
          :key="model.value"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="allowedModelsModel"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            type="checkbox"
            :value="model.value"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ model.label }}</span>
        </label>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        已选择 {{ allowedModelsModel.length }} 个模型
        <span v-if="allowedModelsModel.length === 0" class="text-gray-500">（支持所有模型）</span>
      </p>
    </div>

    <!-- 映射模式 -->
    <div v-else class="space-y-3">
      <div :class="infoBoxClass">
        <p :class="infoTextClass">配置模型映射关系。左侧是客户端请求的模型，右侧是实际发送给API的模型。</p>
      </div>

      <!-- 模型映射表 -->
      <div class="space-y-2">
        <div v-for="(mapping, index) in modelMappings" :key="index" class="flex items-center gap-2">
          <input
            :value="mapping.from"
            class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="原始模型名称"
            type="text"
            @input="updateMapping(index, 'from', $event.target.value)"
          />
          <span class="text-gray-400">→</span>
          <input
            :value="mapping.to"
            class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="映射后的模型名称"
            type="text"
            @input="updateMapping(index, 'to', $event.target.value)"
          />
          <button
            :class="removeButtonClass"
            type="button"
            @click="$emit('remove-mapping', index)"
          >
            <template v-if="isEditVariant">删除</template>
            <template v-else>
              <slot name="remove-icon">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </slot>
            </template>
          </button>
        </div>
      </div>

      <!-- 添加映射按钮 -->
      <button
        :class="addButtonClass"
        type="button"
        @click="$emit('add-mapping')"
      >
        + 添加模型映射
      </button>

      <!-- 快捷添加按钮 -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presetButtons"
          :key="preset.label"
          :class="presetButtonClass(preset.color)"
          type="button"
          @click="$emit('add-preset', preset.from, preset.to)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mode: {
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
  },
  variant: {
    type: String,
    default: 'create' // create | edit
  }
})

const emit = defineEmits([
  'update:mode',
  'update:allowedModels',
  'update:modelMappings',
  'add-mapping',
  'remove-mapping',
  'add-preset'
])

const isEditVariant = computed(() => props.variant === 'edit')

const modeModel = computed({
  get: () => props.mode,
  set: (val) => emit('update:mode', val)
})

const allowedModelsModel = computed({
  get: () => props.allowedModels,
  set: (val) => emit('update:allowedModels', val)
})

const presetButtons = [
  { label: '+ Sonnet 4', from: 'claude-sonnet-4-20250514', to: 'claude-sonnet-4-20250514', color: 'orange' },
  { label: '+ Sonnet 4.5', from: 'claude-sonnet-4-5-20250929', to: 'claude-sonnet-4-5-20250929', color: 'purple' },
  { label: '+ Opus 4.1', from: 'claude-opus-4-1-20250805', to: 'claude-opus-4-1-20250805', color: 'indigo' },
  { label: '+ Haiku 3.5', from: 'claude-3-5-haiku-20241022', to: 'claude-3-5-haiku-20241022', color: 'blue' },
  { label: '+ Haiku 4.5', from: 'claude-haiku-4-5-20251001', to: 'claude-haiku-4-5-20251001', color: 'teal' },
  { label: '+ DeepSeek', from: 'deepseek-chat', to: 'deepseek-chat', color: 'emerald' },
  { label: '+ Qwen', from: 'Qwen', to: 'Qwen', color: 'amber' },
  { label: '+ Kimi', from: 'Kimi', to: 'Kimi', color: 'cyan' },
  { label: '+ Opus → Sonnet', from: 'claude-opus-4-1-20250805', to: 'claude-sonnet-4-20250514', color: 'orange' },
  { label: '+ GLM', from: 'GLM', to: 'GLM', color: 'pink' }
]

const modeSwitchContainerClass = computed(() =>
  isEditVariant.value ? 'mb-4 flex gap-2' : 'mb-3 flex gap-2'
)

const infoBoxClass = computed(() =>
  isEditVariant.value
    ? 'rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'
    : 'rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20'
)

const infoTextClass = computed(() =>
  isEditVariant.value ? 'text-xs text-blue-800 dark:text-blue-300' : 'text-sm text-blue-700 dark:text-blue-300'
)

const whitelistGridClass = computed(() =>
  isEditVariant.value ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'flex flex-wrap gap-2'
)

const toggleButtonClass = (active) => {
  if (isEditVariant.value) {
    return [
      'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      active
        ? 'bg-primary-600 text-white dark:bg-primary-500'
        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
    ]
  }

  return [
    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-primary-500 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
  ]
}

const addButtonClass = computed(() =>
  isEditVariant.value
    ? 'w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:text-primary-500'
    : 'w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary-500 hover:text-primary-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:text-primary-400'
)

const removeButtonClass = computed(() =>
  isEditVariant.value
    ? 'rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20'
    : 'rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20'
)

const presetButtonClass = (color) => {
  const colorMap = {
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50',
    teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50',
    emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50',
    amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50',
    cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50',
    pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50'
  }

  const sizeClass = isEditVariant.value ? 'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors' : 'rounded-md px-2 py-1 text-xs font-medium transition-colors'
  return [sizeClass, colorMap[color] || colorMap.orange]
}

const updateMapping = (index, key, value) => {
  const next = props.modelMappings.map((item, idx) =>
    idx === index ? { ...item, [key]: value } : item
  )
  emit('update:modelMappings', next)
}
</script>
