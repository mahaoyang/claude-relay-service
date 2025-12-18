<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="close"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800">
          <!-- 标题 -->
          <div
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30"
              >
                <i class="fas fa-rotate-left text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">重置使用统计</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ apiKey?.name }}
                </p>
              </div>
            </div>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="close"
            >
              <i class="fas fa-times" />
            </button>
          </div>

          <!-- 内容 -->
          <div class="p-6">
            <!-- 警告提示 -->
            <div
              class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20"
            >
              <div class="flex items-start gap-2">
                <i class="fas fa-exclamation-triangle mt-0.5 text-red-500" />
                <p class="text-sm text-red-700 dark:text-red-300">
                  此操作将清空该 API Key 的所有使用统计数据，包括：已用费用、Token 使用量、请求次数等。此操作不可恢复！
                </p>
              </div>
            </div>

            <!-- 确认输入 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                请输入 <span class="font-mono text-red-600">RESET</span> 确认操作
              </label>
              <input
                v-model="confirmText"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="输入 RESET 确认"
                type="text"
              />
            </div>
          </div>

          <!-- 底部按钮 -->
          <div
            class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700"
          >
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="close"
            >
              取消
            </button>
            <button
              :disabled="confirmText !== 'RESET' || loading"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleReset"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-1" />
              确认重置
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const confirmText = ref('')
const apiKey = ref(null)

const open = (key) => {
  apiKey.value = key
  confirmText.value = ''
  visible.value = true
}

const close = () => {
  visible.value = false
  apiKey.value = null
  confirmText.value = ''
}

const handleReset = async () => {
  if (confirmText.value !== 'RESET' || !apiKey.value) return

  loading.value = true
  try {
    await apiClient.delete(`/admin/api-keys/${apiKey.value.id}/usage`)
    showToast('使用统计已重置', 'success')
    emit('success')
    close()
  } catch (error) {
    showToast(error.response?.data?.error || '重置失败', 'error')
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
