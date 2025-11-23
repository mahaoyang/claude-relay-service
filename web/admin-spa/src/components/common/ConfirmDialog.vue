<template>
  <Teleport to="body">
    <Transition appear name="modal">
      <div v-if="isVisible" @click.self="handleCancel">
        <div>
          <div>
            <div></div>
            <div>
              <h3>
                {{ title }}
              </h3>
              <div>
                {{ message }}
              </div>
            </div>
          </div>

          <div>
            <button :disabled="isProcessing" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button :disabled="isProcessing" @click="handleConfirm">
              <div v-if="isProcessing" />
              {{ confirmText }}
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
