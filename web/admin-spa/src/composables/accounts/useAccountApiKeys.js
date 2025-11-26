import { computed } from 'vue'

// 统一管理账户表单的 API Key 解析与模式描述
export const apiKeyModeOptions = [
  {
    value: 'append',
    label: '追加模式',
    description: '保留现有 Key，并在末尾追加新 Key 列表。'
  },
  {
    value: 'replace',
    label: '覆盖模式',
    description: '先清空旧 Key，再写入上方的新 Key 列表。'
  },
  {
    value: 'delete',
    label: '删除模式',
    description: '输入要移除的 Key，可精准删除失效或被封禁的 Key。'
  }
]

// 解析多行 API Key 输入，返回去重后的列表
export const parseApiKeysInput = (input) => {
  if (!input || typeof input !== 'string') {
    return []
  }

  const segments = input
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (segments.length === 0) {
    return []
  }

  return Array.from(new Set(segments))
}

// 基于表单状态提供当前模式的展示文案
export const useApiKeyModeDisplay = (form) => {
  const currentApiKeyModeLabel = computed(() => {
    const option = apiKeyModeOptions.find((item) => item.value === form.value.apiKeyUpdateMode)
    return option ? option.label : apiKeyModeOptions[0].label
  })

  const currentApiKeyModeDescription = computed(() => {
    const option = apiKeyModeOptions.find((item) => item.value === form.value.apiKeyUpdateMode)
    return option ? option.description : apiKeyModeOptions[0].description
  })

  return {
    currentApiKeyModeLabel,
    currentApiKeyModeDescription
  }
}
