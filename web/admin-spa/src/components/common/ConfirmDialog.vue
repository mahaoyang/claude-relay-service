<template>
  <Teleport to="body">
    <Transition appear name="modal">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="handleCancel"
      >
        <div
          class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-800"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30"
              >
                <svg
                  class="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                  {{ title }}
                </h3>
                <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {{ message }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50"
          >
            <button
              class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isProcessing"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              class="flex-1 rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              :disabled="isProcessing"
              @click="handleConfirm"
            >
              <div
                v-if="isProcessing"
                class="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 状态
const isVisible = ref(false)
const isProcessing = ref(false)
const title = ref('')
const message = ref('')
const confirmText = ref('确认')
const cancelText = ref('取消')
let resolvePromise = null

// 显示确认对话框
const showConfirm = (
  titleText,
  messageText,
  confirmTextParam = '确认',
  cancelTextParam = '取消'
) => {
  return new Promise((resolve) => {
    title.value = titleText
    message.value = messageText
    confirmText.value = confirmTextParam
    cancelText.value = cancelTextParam
    isVisible.value = true
    isProcessing.value = false
    resolvePromise = resolve
  })
}

// 处理确认
const handleConfirm = () => {
  if (isProcessing.value) return

  isProcessing.value = true

  // 延迟一点时间以显示loading状态
  setTimeout(() => {
    isVisible.value = false
    isProcessing.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }, 200)
}

// 处理取消
const handleCancel = () => {
  if (isProcessing.value) return

  isVisible.value = false
  if (resolvePromise) {
    resolvePromise(false)
    resolvePromise = null
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (!isVisible.value) return

  if (event.key === 'Escape') {
    handleCancel()
  } else if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
    handleConfirm()
  }
}

// 全局方法注册
onMounted(() => {
  window.showConfirm = showConfirm
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (window.showConfirm === showConfirm) {
    delete window.showConfirm
  }
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法供组件使用
defineExpose({
  showConfirm
})
</script>
