<template>
  <Teleport to="body">
    <div>
      <div v-for="toast in toasts" :key="toast.id" @click="removeToast(toast.id)">
        <div>
          <div>
            <i />
          </div>
          <div>
            <div v-if="toast.title">
              {{ toast.title }}
            </div>
            <div>
              {{ toast.message }}
            </div>
          </div>
          <button @click.stop="removeToast(toast.id)"></button>
        </div>
        <div v-if="toast.duration > 0" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 状态
const toasts = ref([])
let toastIdCounter = 0

// 获取图标类名
const getIconClass = (type) => {
  const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return iconMap[type] || iconMap.info
}

// 添加Toast
const addToast = (message, type = 'info', title = null, duration = 5000) => {
  const id = ++toastIdCounter
  const toast = {
    id,
    message,
    type,
    title,
    duration,
    isVisible: false
  }

  toasts.value.push(toast)

  // 下一帧显示动画
  setTimeout(() => {
    toast.isVisible = true
  }, 10)

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

// 移除Toast
const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    const toast = toasts.value[index]
    toast.isVisible = false

    // 等待动画完成后移除
    setTimeout(() => {
      const currentIndex = toasts.value.findIndex((t) => t.id === id)
      if (currentIndex > -1) {
        toasts.value.splice(currentIndex, 1)
      }
    }, 300)
  }
}

// 清除所有Toast
const clearAllToasts = () => {
  toasts.value.forEach((toast) => {
    toast.isVisible = false
  })

  setTimeout(() => {
    toasts.value.length = 0
  }, 300)
}

// 暴露方法给全局使用
const showToast = (message, type = 'info', title = null, duration = 5000) => {
  return addToast(message, type, title, duration)
}

// 全局方法注册
onMounted(() => {
  // 将方法挂载到全局
  window.showToast = showToast
})

onUnmounted(() => {
  // 清理全局方法
  if (window.showToast === showToast) {
    delete window.showToast
  }
})

// 暴露方法供组件使用
defineExpose({
  showToast,
  removeToast,
  clearAllToasts
})
</script>
