<template>
  <span />
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const emit = defineEmits(['success'])

const busy = ref(false)

const confirmDangerousAction = async (title, message, confirmText) => {
  if (window.showConfirm) {
    return await window.showConfirm(title, message, confirmText, '取消')
  }
  return confirm(message)
}

const open = async (apiKey) => {
  if (!apiKey?.id) return
  if (busy.value) return

  const name = apiKey.name || '(未命名)'
  const id = apiKey.id

  const confirmed1 = await confirmDangerousAction(
    '重置额度（危险）',
    `将删除 API Key “${name}” 的历史 Token 用量记录，并把历史费用重置为 0。\n此操作不可恢复。`,
    '继续'
  )
  if (!confirmed1) return

  const confirmed2 = await confirmDangerousAction(
    '再次确认：不可恢复',
    `请再次确认要重置以下 Key：\n\n- 名称：${name}\n- ID：${id}\n\n这会删除所有统计记录并清空累计费用。`,
    '确定重置'
  )
  if (!confirmed2) return

  busy.value = true
  try {
    const data = await apiClient.post(`/admin/api-keys/${id}/reset-usage`)
    if (data?.success) {
      showToast('已重置该 Key 的用量与费用统计', 'success')
      emit('success')
      return
    }
    showToast(data?.message || '重置失败', 'error')
  } catch (error) {
    showToast(error?.message || '重置失败', 'error')
  } finally {
    busy.value = false
  }
}

defineExpose({ open, busy })
</script>

