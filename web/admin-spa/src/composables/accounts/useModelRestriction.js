import { ref } from 'vue'
import { showToast } from '@/utils/toast'

// 账户表单的模型限制/映射配置
export function useModelRestriction() {
  const modelRestrictionMode = ref('whitelist')
  const allowedModels = ref([
    'claude-sonnet-4-20250514',
    'claude-sonnet-4-5-20250929',
    'claude-3-5-haiku-20241022'
  ])
  const modelMappings = ref([])

  const commonModels = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', color: 'blue' },
    { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', color: 'indigo' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', color: 'green' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', color: 'emerald' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4', color: 'purple' },
    { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1', color: 'purple' },
    { value: 'claude-opus-4-5-20251101', label: 'Claude Opus 4.5', color: 'violet' },
    { value: 'deepseek-chat', label: 'DeepSeek Chat', color: 'cyan' },
    { value: 'Qwen', label: 'Qwen', color: 'orange' },
    { value: 'Kimi', label: 'Kimi', color: 'pink' },
    { value: 'GLM', label: 'GLM', color: 'teal' }
  ]

  // 根据已有 supportedModels 初始化映射表
  const initModelMappings = (supportedModels) => {
    if (!supportedModels) {
      return
    }

    if (typeof supportedModels === 'object' && !Array.isArray(supportedModels)) {
      const entries = Object.entries(supportedModels)
      const isWhitelist = entries.every(([from, to]) => from === to)

      if (isWhitelist) {
        modelRestrictionMode.value = 'whitelist'
        allowedModels.value = entries.map(([from]) => from)
        modelMappings.value = entries.map(([from, to]) => ({ from, to }))
      } else {
        modelRestrictionMode.value = 'mapping'
        modelMappings.value = entries.map(([from, to]) => ({ from, to }))
      }
    } else if (Array.isArray(supportedModels)) {
      modelRestrictionMode.value = 'whitelist'
      allowedModels.value = supportedModels
      modelMappings.value = supportedModels.map((model) => ({ from: model, to: model }))
    }
  }

  const addModelMapping = () => {
    modelMappings.value.push({ from: '', to: '' })
  }

  const removeModelMapping = (index) => {
    modelMappings.value.splice(index, 1)
  }

  const addPresetMapping = (from, to) => {
    const exists = modelMappings.value.some((mapping) => mapping.from === from)
    if (exists) {
      showToast(`模型 ${from} 的映射已存在`, 'info')
      return
    }

    modelMappings.value.push({ from, to })
    showToast(`已添加映射: ${from} → ${to}`, 'success')
  }

  // 将当前映射配置转换为后端需要的对象格式
  const convertMappingsToObject = () => {
    const mapping = {}

    if (modelRestrictionMode.value === 'whitelist') {
      allowedModels.value.forEach((model) => {
        mapping[model] = model
      })
    } else {
      modelMappings.value.forEach((item) => {
        if (item.from && item.to) {
          mapping[item.from] = item.to
        }
      })
    }

    return Object.keys(mapping).length > 0 ? mapping : null
  }

  return {
    modelRestrictionMode,
    allowedModels,
    modelMappings,
    commonModels,
    initModelMappings,
    addModelMapping,
    removeModelMapping,
    addPresetMapping,
    convertMappingsToObject
  }
}
