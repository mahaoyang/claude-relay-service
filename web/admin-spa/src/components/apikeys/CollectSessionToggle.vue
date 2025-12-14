<template>
  <div class="flex items-center justify-center">
    <button
      :class="[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
        value ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700',
        loading ? 'cursor-wait opacity-50' : 'cursor-pointer'
      ]"
      :disabled="loading"
      :title="value ? '禁用白名单收集' : '启用白名单收集'"
      type="button"
      @click="toggle"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          value ? 'translate-x-6' : 'translate-x-1'
        ]"
      />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  apiKeyId: {
    type: String,
    required: true
  },
  value: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'error'])

const loading = ref(false)

const toggle = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const newValue = !props.value

    // 从 localStorage 获取认证 token
    const authToken = localStorage.getItem('authToken')

    const response = await axios.patch(
      `/admin/api-keys/${props.apiKeyId}/collect-session`,
      { collectSession: newValue },
      {
        withCredentials: true,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      }
    )

    if (response.data.success) {
      emit('update', {
        apiKeyId: props.apiKeyId,
        collectSession: newValue
      })
    } else {
      throw new Error(response.data.message || '更新失败')
    }
  } catch (error) {
    emit('error', error.response?.data?.message || error.message || '更新失败')
  } finally {
    loading.value = false
  }
}
</script>
