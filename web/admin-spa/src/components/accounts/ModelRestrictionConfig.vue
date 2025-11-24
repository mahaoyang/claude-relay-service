<template>
  <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
    <h4 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">模型限制配置 (可选)</h4>

    <!-- 模式切换 -->
    <div class="mb-4 flex gap-2">
      <button
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="
          mode === 'whitelist'
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        "
        type="button"
        @click="mode = 'whitelist'"
      >
        模型白名单
      </button>
      <button
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="
          mode === 'mapping'
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        "
        type="button"
        @click="mode = 'mapping'"
      >
        模型映射
      </button>
    </div>

    <!-- 白名单模式 -->
    <div v-if="mode === 'whitelist'" class="space-y-3">
      <div
        class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
      >
        <p class="text-sm text-blue-700 dark:text-blue-300">
          选择允许使用此账户的模型。留空表示支持所有模型。
        </p>
      </div>

      <!-- 模型复选框列表 -->
      <div class="flex flex-wrap gap-2">
        <label
          v-for="model in commonModels"
          :key="model.value"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <input
            v-model="selectedModels"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            type="checkbox"
            :value="model.value"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ model.label }}</span>
        </label>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-400">
        已选择 {{ selectedModels.length }} 个模型
        <span v-if="selectedModels.length === 0" class="text-gray-500">（支持所有模型）</span>
      </p>
    </div>

    <!-- 映射模式 -->
    <div v-else class="space-y-3">
      <div
        class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
      >
        <p class="text-sm text-blue-700 dark:text-blue-300">
          配置模型映射关系。左侧是客户端请求的模型，右侧是实际发送给API的模型。
        </p>
      </div>

      <!-- 模型映射表 -->
      <div class="space-y-2">
        <div v-for="(mapping, index) in mappings" :key="index" class="flex items-center gap-2">
          <input
            v-model="mapping.from"
            class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="原始模型名称"
            type="text"
          />
          <span class="text-gray-400">→</span>
          <input
            v-model="mapping.to"
            class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="映射后的模型名称"
            type="text"
          />
          <button
            class="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            type="button"
            @click="removeMapping(index)"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 添加映射按钮 -->
      <button
        class="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary-500 hover:text-primary-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:text-primary-400"
        type="button"
        @click="addMapping"
      >
        + 添加模型映射
      </button>

      <!-- 快捷添加按钮 -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presetMappings"
          :key="preset.model"
          class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
          :class="preset.colorClass"
          type="button"
          @click="addPresetMapping(preset.model, preset.model)"
        >
          + {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      mode: 'whitelist',
      allowedModels: [],
      mappings: []
    })
  },
  commonModels: {
    type: Array,
    default: () => [
      { value: 'claude-sonnet-4-20250514', label: 'Sonnet 4' },
      { value: 'claude-sonnet-4-5-20250929', label: 'Sonnet 4.5' },
      { value: 'claude-opus-4-1-20250805', label: 'Opus 4.1' },
      { value: 'claude-3-5-haiku-20241022', label: 'Haiku 3.5' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Sonnet 3.5' },
      { value: 'claude-3-5-sonnet-20240620', label: 'Sonnet 3.5 (旧)' },
      { value: 'claude-3-opus-20240229', label: 'Opus 3' },
      { value: 'claude-3-haiku-20240307', label: 'Haiku 3' }
    ]
  }
})

const emit = defineEmits(['update:modelValue'])

// 模式：whitelist 或 mapping
const mode = ref(props.modelValue.mode || 'whitelist')

// 白名单模式选中的模型
const selectedModels = ref([...(props.modelValue.allowedModels || [])])

// 映射模式的映射表
const mappings = ref([...(props.modelValue.mappings || [])])

// 预设映射选项
const presetMappings = computed(() => [
  {
    model: 'claude-sonnet-4-20250514',
    label: 'Sonnet 4',
    colorClass:
      'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
  },
  {
    model: 'claude-sonnet-4-5-20250929',
    label: 'Sonnet 4.5',
    colorClass:
      'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
  },
  {
    model: 'claude-opus-4-1-20250805',
    label: 'Opus 4.1',
    colorClass:
      'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
  },
  {
    model: 'claude-3-5-haiku-20241022',
    label: 'Haiku 3.5',
    colorClass:
      'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
  },
  {
    model: 'claude-3-5-sonnet-20241022',
    label: 'Sonnet 3.5',
    colorClass:
      'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
  }
])

/**
 * 添加模型映射
 */
const addMapping = () => {
  mappings.value.push({ from: '', to: '' })
}

/**
 * 移除模型映射
 */
const removeMapping = (index) => {
  mappings.value.splice(index, 1)
}

/**
 * 添加预设映射
 */
const addPresetMapping = (from, to) => {
  // 检查是否已存在
  const exists = mappings.value.some((mapping) => mapping.from === from)
  if (exists) {
    return
  }
  mappings.value.push({ from, to })
}

/**
 * 更新父组件数据
 */
const emitUpdate = () => {
  emit('update:modelValue', {
    mode: mode.value,
    allowedModels: selectedModels.value,
    mappings: mappings.value
  })
}

// 监听模式变化
watch(mode, emitUpdate)

// 监听selectedModels变化
watch(selectedModels, emitUpdate, { deep: true })

// 监听mappings变化
watch(mappings, emitUpdate, { deep: true })

// 监听外部数据变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      mode.value = newValue.mode || 'whitelist'
      selectedModels.value = [...(newValue.allowedModels || [])]
      mappings.value = [...(newValue.mappings || [])]
    }
  },
  { deep: true }
)
</script>
